"""
Dialogue manager — the entry point for a chat turn.

This is the piece that was missing in v1. Previously `chat.py` handed every
message straight to the RAG pipeline, so "hi", "thanks", "yes" and "tell me
more" were each embedded and vector-searched, produced no matches, and were
answered with "I don't have details on that specific request."

The flow now is:

    screen input -> load session -> classify (rules, then LLM if needed)
        -> route to a handler -> update state -> persist

Only `KNOWLEDGE_SEARCH`-family intents reach retrieval. Conversational intents
are answered from templates at zero model cost, and context-dependent intents
("yes", "tell me more") are resolved against recorded state *before* any
search happens.
"""
from __future__ import annotations

import logging
import re
import time
from dataclasses import dataclass, field
from typing import Any, AsyncIterator, Dict, List, Optional

from app.conversation import rules
from app.conversation.classifier import QueryAnalysis, intent_classifier
from app.conversation.faq import FAQMatch, faq_layer
from app.conversation.intents import Intent
from app.conversation.memory import conversation_memory
from app.conversation.rewriter import build_standalone_query, resolve_reference
from app.conversation.state import ConversationSession, ConversationState, PendingConfirmation
from app.core.config import settings
from app.core.observability import TurnTrace, metrics
from app.core.prompts import prompts
from app.models.llm import ChatMessage, MessageRole
from app.models.rag import RAGCitation
from app.services.guard import REFUSAL_MESSAGE, screen_input
from app.services.rag import rag_orchestrator

logger = logging.getLogger(__name__)

# Confidence at or above which a tier-1 rule is trusted outright and the LLM
# classifier is skipped. Below it, the rule is treated as a hint.
_RULE_TRUST_THRESHOLD = 0.9

# Matches a trailing question in the assistant's reply, which becomes the
# pending confirmation a bare "yes" resolves against.
_TRAILING_QUESTION_RE = re.compile(r"([^.!?\n]{8,200}\?)\s*$")


@dataclass
class TurnResult:
    """Everything the API layer needs to build a response."""

    answer: str
    citations: List[RAGCitation] = field(default_factory=list)
    confidence: float = 1.0
    intent: Intent = Intent.UNKNOWN
    duration_seconds: float = 0.0
    trace: Optional[TurnTrace] = None


class DialogueManager:
    """Routes a classified turn to the handler that should answer it."""

    # ------------------------------------------------------------------
    # Public entry points
    # ------------------------------------------------------------------
    async def handle(
        self,
        *,
        message: str,
        conversation_id: str = "default",
        category: Optional[str] = None,
        tenant_id: str = "default",
        trace: Optional[TurnTrace] = None,
    ) -> TurnResult:
        """Handles one non-streaming chat turn end to end."""
        started = time.time()
        trace = trace or TurnTrace(conversation_id=conversation_id)
        trace.conversation_id = conversation_id

        guard = screen_input(message)
        trace.injection_flagged = guard.flagged
        if guard.flagged:
            metrics.increment("guard.flagged")

        if guard.should_refuse:
            metrics.increment("guard.refused")
            trace.handler = "guard_refusal"
            trace.intent = Intent.OUT_OF_SCOPE.value
            return await self._finalize(
                conversation_id=conversation_id,
                session=await conversation_memory.load(conversation_id),
                user_text=message,
                answer=REFUSAL_MESSAGE,
                intent=Intent.OUT_OF_SCOPE,
                citations=[],
                confidence=1.0,
                started=started,
                trace=trace,
            )

        with trace.stage("session_load"):
            session = await conversation_memory.load(conversation_id)
        state = session.state
        state.conversation_id = conversation_id

        # Tier-1 rules run once here and are handed to _classify, so the
        # deterministic pass is never recomputed.
        rule_match = rules.classify(
            guard.sanitized_message,
            has_pending_confirmation=state.pending_confirmation is not None,
        )

        # Structured FAQ short-circuit, ahead of any model call.
        #
        # Placing this before tier-2 classification is worth a full LLM
        # round-trip on the most common company questions ("what's your
        # email?", "where are you based?"): the FAQ answer is deterministic
        # and verbatim, so knowing the precise intent adds nothing. Skipped
        # when tier 1 already recognised a conversational or context-dependent
        # turn, since those must be answered from state, not from the FAQ.
        faq_shortcut = self._faq_fast_path(guard.sanitized_message, rule_match, trace)
        if faq_shortcut is not None:
            state.record_answer()
            # Record the subject so a following "tell me more" continues it,
            # instead of finding an empty topic and asking the user to repeat.
            state.set_topic(faq_shortcut.topic)
            return await self._finalize(
                conversation_id=conversation_id,
                session=session,
                user_text=message,
                answer=faq_shortcut.answer,
                intent=Intent.COMPANY_FAQ,
                citations=[],
                confidence=0.95,
                started=started,
                trace=trace,
            )

        with trace.stage("classification"):
            analysis = await self._classify(
                guard.sanitized_message, session, trace, rule_match=rule_match
            )

        trace.intent = analysis.intent.value
        trace.intent_source = analysis.source
        metrics.increment(f"intent.{analysis.intent.value}")

        with trace.stage("handling"):
            answer, citations, confidence = await self._route(
                message=guard.sanitized_message,
                original_message=message,
                analysis=analysis,
                session=session,
                category=category,
                tenant_id=tenant_id,
                injection_flagged=guard.flagged,
                trace=trace,
            )

        return await self._finalize(
            conversation_id=conversation_id,
            session=session,
            user_text=message,
            answer=answer,
            intent=analysis.intent,
            citations=citations,
            confidence=confidence,
            started=started,
            trace=trace,
            analysis=analysis,
        )

    async def astream(
        self,
        *,
        message: str,
        conversation_id: str = "default",
        category: Optional[str] = None,
        tenant_id: str = "default",
        trace: Optional[TurnTrace] = None,
    ) -> AsyncIterator[Dict[str, Any]]:
        """
        Streaming variant.

        Conversational turns are template-based and have no tokens to stream,
        so they are emitted as a single delta — the event shape stays identical
        either way, which keeps the client simple.
        """
        started = time.time()
        trace = trace or TurnTrace(conversation_id=conversation_id)
        trace.conversation_id = conversation_id

        guard = screen_input(message)
        trace.injection_flagged = guard.flagged

        session = await conversation_memory.load(conversation_id)
        state = session.state
        state.conversation_id = conversation_id

        if guard.should_refuse:
            async for event in self._stream_static(REFUSAL_MESSAGE, []):
                yield event
            await self._finalize(
                conversation_id=conversation_id, session=session, user_text=message,
                answer=REFUSAL_MESSAGE, intent=Intent.OUT_OF_SCOPE, citations=[],
                confidence=1.0, started=started, trace=trace,
            )
            return

        rule_match = rules.classify(
            guard.sanitized_message,
            has_pending_confirmation=state.pending_confirmation is not None,
        )

        # Same pre-classification FAQ short-circuit as the non-streaming path.
        faq_shortcut = self._faq_fast_path(guard.sanitized_message, rule_match, trace)
        if faq_shortcut is not None:
            state.record_answer()
            state.set_topic(faq_shortcut.topic)
            async for event in self._stream_static(faq_shortcut.answer, []):
                yield event
            await self._finalize(
                conversation_id=conversation_id, session=session, user_text=message,
                answer=faq_shortcut.answer, intent=Intent.COMPANY_FAQ, citations=[],
                confidence=0.95, started=started, trace=trace,
            )
            return

        analysis = await self._classify(
            guard.sanitized_message, session, trace, rule_match=rule_match
        )
        trace.intent = analysis.intent.value
        trace.intent_source = analysis.source

        if not analysis.needs_retrieval or not settings.ENABLE_CONVERSATION_ENGINE:
            if not analysis.needs_retrieval:
                answer, citations, confidence = await self._route(
                    message=guard.sanitized_message,
                    original_message=message,
                    analysis=analysis,
                    session=session,
                    category=category,
                    tenant_id=tenant_id,
                    injection_flagged=guard.flagged,
                    trace=trace,
                )
                async for event in self._stream_static(answer, citations):
                    yield event
                await self._finalize(
                    conversation_id=conversation_id, session=session, user_text=message,
                    answer=answer, intent=analysis.intent, citations=citations,
                    confidence=confidence, started=started, trace=trace, analysis=analysis,
                )
                return

        # Structured FAQ still short-circuits streaming: these answers are
        # fixed text, and streaming them token-by-token would be theatre.
        faq_answer = self._try_faq(guard.sanitized_message, analysis, trace)
        if faq_answer is not None:
            async for event in self._stream_static(faq_answer, []):
                yield event
            await self._finalize(
                conversation_id=conversation_id, session=session, user_text=message,
                answer=faq_answer, intent=analysis.intent, citations=[],
                confidence=0.95, started=started, trace=trace, analysis=analysis,
            )
            return

        retrieval_query = build_standalone_query(
            guard.sanitized_message, analysis.intent, state, analysis.rewritten_query
        )
        trace.rewritten_query = retrieval_query
        trace.handler = "knowledge_stream"

        collected_answer = ""
        citations: List[RAGCitation] = []
        async for event in rag_orchestrator.astream_answer(
            question=guard.sanitized_message,
            retrieval_query=retrieval_query,
            history=session.recent_messages(settings.HISTORY_WINDOW_MESSAGES),
            entities=analysis.entities,
            category=category,
            tenant_id=tenant_id,
            injection_flagged=guard.flagged,
            trace=trace,
        ):
            if event["type"] == "citations":
                citations = [RAGCitation(**c) for c in event.get("citations", [])]
            elif event["type"] == "done":
                collected_answer = event.get("answer", "")
            yield event

        await self._finalize(
            conversation_id=conversation_id, session=session, user_text=message,
            answer=collected_answer, intent=analysis.intent, citations=citations,
            confidence=0.85, started=started, trace=trace, analysis=analysis,
        )

    # ------------------------------------------------------------------
    # Classification
    # ------------------------------------------------------------------
    def _faq_fast_path(
        self,
        message: str,
        rule_match: Optional[rules.RuleMatch],
        trace: TurnTrace,
    ) -> Optional[FAQMatch]:
        """
        Returns a structured FAQ answer when one applies before classification.

        Deliberately declines for conversational and context-dependent turns:
        "yes" or "thanks" must be resolved against conversation state, and an
        incidental keyword overlap with an FAQ entry would derail the thread.
        """
        if not settings.ENABLE_CONVERSATION_ENGINE or not settings.ENABLE_FAQ_LAYER:
            return None
        if rule_match is not None and (
            rule_match.intent.is_conversational or rule_match.intent.is_context_dependent
        ):
            return None
        if rule_match is not None and rule_match.intent is Intent.OUT_OF_SCOPE:
            return None

        match = faq_layer.match(message)
        if match is None:
            return None

        trace.used_faq = True
        trace.handler = f"faq:{match.entry_id}"
        trace.intent = Intent.COMPANY_FAQ.value
        trace.intent_source = "faq"
        metrics.increment("faq.hit")
        metrics.increment("classification.faq_shortcut")
        return match

    async def _classify(
        self,
        message: str,
        session: ConversationSession,
        trace: TurnTrace,
        rule_match: Optional[rules.RuleMatch] = None,
    ) -> QueryAnalysis:
        """
        Two-tier classification.

        Tier 1 is deterministic and free; tier 2 costs a model call and only
        runs when tier 1 abstains or is unsure. That inversion — rules first,
        model second — is what removes the per-turn LLM cost that v1 paid on
        every message including "thanks".
        """
        state = session.state

        if not settings.ENABLE_CONVERSATION_ENGINE:
            return QueryAnalysis(
                intent=Intent.KNOWLEDGE_SEARCH,
                rewritten_query=message,
                needs_retrieval=True,
                confidence=0.5,
                source="disabled",
            )

        if rule_match is None:
            rule_match = rules.classify(
                message, has_pending_confirmation=state.pending_confirmation is not None
            )

        # Context-dependent turns are trusted at a lower bar than everything
        # else. A bare "yes" or "tell me more" IS an affirmation/continuation
        # regardless of confidence — what is missing is the referent, and the
        # LLM classifier cannot supply that either (it only sees the same
        # history). Escalating would spend a full round-trip to learn nothing;
        # measured at ~11s against Gemini before this shortcut.
        if rule_match is not None and rule_match.intent.is_context_dependent:
            metrics.increment("classification.rules")
            return QueryAnalysis(
                intent=rule_match.intent,
                rewritten_query=message,
                needs_retrieval=True,
                confidence=rule_match.confidence,
                source="rules",
            )

        if rule_match is not None and rule_match.confidence >= _RULE_TRUST_THRESHOLD:
            metrics.increment("classification.rules")
            return QueryAnalysis(
                intent=rule_match.intent,
                rewritten_query=message,
                needs_retrieval=rule_match.intent.requires_retrieval
                or rule_match.intent.is_context_dependent,
                confidence=rule_match.confidence,
                source="rules",
            )

        analysis = await intent_classifier.analyze(
            message, history=session.recent_messages(settings.HISTORY_WINDOW_MESSAGES), state=state
        )
        if analysis is not None:
            metrics.increment("classification.llm")
            return analysis

        metrics.increment("classification.fallback")
        if rule_match is not None:
            # The LLM was unavailable but a low-confidence rule fired; that is
            # still better information than nothing.
            return QueryAnalysis(
                intent=rule_match.intent,
                rewritten_query=message,
                needs_retrieval=rule_match.intent.requires_retrieval
                or rule_match.intent.is_context_dependent,
                confidence=rule_match.confidence,
                source="rules_fallback",
            )

        # Default to treating an unclassifiable message as a real question:
        # answering from the knowledge base is a far better failure mode than
        # refusing a legitimate customer.
        return QueryAnalysis(
            intent=Intent.KNOWLEDGE_SEARCH,
            rewritten_query=message,
            needs_retrieval=True,
            confidence=0.4,
            source="default",
        )

    # ------------------------------------------------------------------
    # Routing
    # ------------------------------------------------------------------
    async def _route(
        self,
        *,
        message: str,
        original_message: str,
        analysis: QueryAnalysis,
        session: ConversationSession,
        category: Optional[str],
        tenant_id: str,
        injection_flagged: bool,
        trace: TurnTrace,
    ) -> tuple[str, List[RAGCitation], float]:
        """Dispatches to the handler for this intent."""
        state = session.state
        intent = analysis.intent

        # --- conversational: templates, no model call, no retrieval ---
        if intent is Intent.GREETING:
            trace.handler = "greeting"
            key = "greeting_return" if state.greeted else "greeting"
            state.greeted = True
            return self._template(key, state), [], 1.0

        if intent is Intent.THANKS:
            trace.handler = "thanks"
            return self._template("thanks", state), [], 1.0

        if intent is Intent.GOODBYE:
            trace.handler = "goodbye"
            return self._template("goodbye", state), [], 1.0

        if intent is Intent.HELP:
            trace.handler = "help"
            return self._template("help", state), [], 1.0

        if intent is Intent.IDENTITY:
            trace.handler = "identity"
            # Prefer a curated FAQ identity answer if one is configured.
            faq_answer = self._try_faq(message, analysis, trace)
            return (faq_answer or self._template("identity", state)), [], 1.0

        if intent is Intent.SMALL_TALK:
            trace.handler = "small_talk"
            return self._template("small_talk", state), [], 1.0

        if intent is Intent.NEGATION:
            trace.handler = "negation"
            state.clear_pending()
            return self._template("negation", state), [], 1.0

        if intent is Intent.OUT_OF_SCOPE:
            trace.handler = "out_of_scope"
            return settings.SCOPE_REJECTION_MESSAGE, [], 1.0

        # --- context-dependent: resolve against state, then treat as knowledge ---
        if intent in (Intent.AFFIRMATION, Intent.CONTINUATION):
            # Resolve strictly from recorded state. Deliberately NOT via
            # build_standalone_query: its bare-entity expansion would happily
            # turn the token "yes" into a product query, which is the exact
            # v1 failure this branch exists to prevent.
            resolved = resolve_reference(message, intent, state)
            if not resolved:
                # The user agreed to a question we no longer have. Ask what
                # they meant rather than searching for the word "yes".
                trace.handler = "affirmation_unresolved"
                state.clear_pending()
                return self._template("fallback_no_pending", state), [], 1.0

            logger.info(
                "Resolved context-dependent turn",
                extra={"intent": intent.value, "resolved_query_length": len(resolved)},
            )
            state.clear_pending()
            # The resolved text replaces the literal message for generation too,
            # not just for retrieval. "yes" carries no information on its own —
            # handing it to the model as the user turn would make the answer
            # depend entirely on history that may already have been trimmed.
            return await self._answer_from_knowledge(
                message=resolved, retrieval_query=resolved, analysis=analysis,
                session=session, category=category, tenant_id=tenant_id,
                injection_flagged=injection_flagged, trace=trace,
            )

        # --- knowledge intents ---
        faq_answer = self._try_faq(message, analysis, trace)
        if faq_answer is not None:
            state.record_answer()
            return faq_answer, [], 0.95


        retrieval_query = build_standalone_query(
            message, intent, state, analysis.rewritten_query
        )
        return await self._answer_from_knowledge(
            message=message, retrieval_query=retrieval_query, analysis=analysis,
            session=session, category=category, tenant_id=tenant_id,
            injection_flagged=injection_flagged, trace=trace,
        )

    async def _answer_from_knowledge(
        self,
        *,
        message: str,
        retrieval_query: str,
        analysis: QueryAnalysis,
        session: ConversationSession,
        category: Optional[str],
        tenant_id: str,
        injection_flagged: bool,
        trace: TurnTrace,
    ) -> tuple[str, List[RAGCitation], float]:
        """Runs the RAG pipeline and folds the outcome back into state."""
        state = session.state
        trace.handler = "knowledge"
        trace.rewritten_query = retrieval_query

        result = await rag_orchestrator.answer(
            question=message,
            retrieval_query=retrieval_query,
            history=session.recent_messages(settings.HISTORY_WINDOW_MESSAGES),
            entities=analysis.entities,
            category=category,
            tenant_id=tenant_id,
            injection_flagged=injection_flagged,
            trace=trace,
        )

        if result.grounded:
            state.record_answer()
        else:
            state.record_no_answer()
            trace.degraded = True
            trace.degraded_reason = result.degraded_reason
            # Escalate after repeated dead ends rather than repeating the same
            # apology, which is what makes a bot feel like a wall.
            if state.consecutive_no_answer >= 2 and result.degraded_reason == "no_context":
                result.answer = (
                    "I'm still not finding that. It may be something our team handles "
                    "directly — you can reach our India operations at india@mindstec.com "
                    "or +91 80 4525 6922, or I can help with a different topic."
                )

        return result.answer, result.citations, result.confidence

    def _try_faq(
        self, message: str, analysis: QueryAnalysis, trace: TurnTrace
    ) -> Optional[str]:
        """
        Consults the structured FAQ layer.

        Runs for identity and company-FAQ intents always, and for general
        knowledge searches too — a question like "what's your email?" may be
        classified as KNOWLEDGE_SEARCH but still has one canonical answer.
        """
        if not settings.ENABLE_FAQ_LAYER:
            return None
        match = faq_layer.match(message)
        if match is None:
            return None
        trace.used_faq = True
        trace.handler = f"faq:{match.entry_id}"
        metrics.increment("faq.hit")
        return match.answer

    @staticmethod
    def _template(key: str, state: ConversationState) -> str:
        # Rotate phrasing by turn count so repeated greetings differ, and so
        # tests get deterministic output for a given turn.
        return prompts.variant("smalltalk", key, seed=state.turn_count)

    # ------------------------------------------------------------------
    # State update & persistence
    # ------------------------------------------------------------------
    async def _finalize(
        self,
        *,
        conversation_id: str,
        session: ConversationSession,
        user_text: str,
        answer: str,
        intent: Intent,
        citations: List[RAGCitation],
        confidence: float,
        started: float,
        trace: TurnTrace,
        analysis: Optional[QueryAnalysis] = None,
    ) -> TurnResult:
        """Updates conversation state, persists the turn, and emits the trace."""
        state = session.state
        state.turn_count += 1
        state.last_intent = intent.value
        state.last_user_message = user_text
        state.last_assistant_message = answer

        if analysis is not None:
            state.set_topic(analysis.topic)
            state.add_entities(analysis.entities)
        if citations:
            state.last_citations = [c.model_dump() for c in citations][:5]

        # If a substantive answer ended on a question, remember it so a bare
        # "yes" next turn has something concrete to resolve against. This is
        # the mechanism that makes the confirmation flow work at all.
        #
        # Only answers that actually carried knowledge qualify. A template's
        # rhetorical closer ("Anything else I can help with?") is not a real
        # offer — recording it would make the next "yes" resolve to nothing.
        trailing = _TRAILING_QUESTION_RE.search(answer or "") if intent.requires_retrieval else None
        if trailing:
            question_text = trailing.group(1).strip()
            state.last_assistant_question = question_text
            state.pending_confirmation = PendingConfirmation(
                question=question_text,
                topic=state.current_topic,
                query_on_confirm=(
                    f"Tell me more about {state.current_topic}"
                    if state.current_topic
                    else question_text.rstrip("?")
                ),
                turn=state.turn_count,
            )
        elif intent.requires_retrieval or intent in (Intent.NEGATION, Intent.GOODBYE):
            # A declarative answer closes any prior open question; leaving it
            # set would misroute a later "yes" to a stale topic. An explicit
            # "no" closes it for the same reason.
            state.last_assistant_question = None
            state.pending_confirmation = None

        with trace.stage("persist"):
            await conversation_memory.save_turn(
                conversation_id=conversation_id,
                state=state,
                user_message=ChatMessage(role=MessageRole.USER, content=user_text),
                assistant_message=ChatMessage(
                    role=MessageRole.ASSISTANT, content=answer or "(no response)"
                ),
            )

        duration = time.time() - started
        trace.topic = state.current_topic
        metrics.observe("turn.total", duration)
        metrics.increment("turn.count")
        logger.info("turn.completed", extra=trace.to_log_fields())

        return TurnResult(
            answer=answer,
            citations=citations,
            confidence=confidence,
            intent=intent,
            duration_seconds=duration,
            trace=trace,
        )

    @staticmethod
    async def _stream_static(
        answer: str, citations: List[RAGCitation]
    ) -> AsyncIterator[Dict[str, Any]]:
        """Emits a template answer using the streaming event shape."""
        yield {"type": "citations", "citations": [c.model_dump() for c in citations]}
        yield {"type": "delta", "content": answer}
        yield {"type": "done", "answer": answer, "confidence": 1.0, "grounded": False}


dialogue_manager = DialogueManager()
