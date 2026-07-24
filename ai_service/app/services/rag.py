"""
Grounded answering: retrieval + context assembly + generation.

Scope change from v1: this module is no longer the entry point for a chat
turn. It is now the *knowledge* stage, invoked by the dialogue manager only
for intents that actually need the knowledge base. Greetings, thanks,
affirmations and company FAQ never reach this code, which is the whole point
of the conversation engine.

What remains here is deliberately narrow: turn a standalone query into a
grounded answer, or degrade gracefully while saying so.
"""
from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from typing import Any, AsyncIterator, Dict, List, Optional

from app.core.config import settings
from app.core.observability import TurnTrace, metrics
from app.core.prompts import prompts
from app.models.llm import ChatMessage, MessageRole
from app.models.rag import RAGCitation, RAGContextResponse, RAGQueryResponse
from app.services.context_builder import build_context
from app.services.guard import scrub_output
from app.services.llm import LLMUnavailableError, llm_service
from app.services.reranker import rerank, top_vector_score
from app.services.retrieval import hybrid_retriever

logger = logging.getLogger(__name__)


@dataclass
class GroundedAnswer:
    """Result of one grounded generation, including why it degraded if it did."""

    answer: str
    citations: List[RAGCitation]
    confidence: float
    grounded: bool = True
    degraded_reason: Optional[str] = None


class RAGOrchestrator:
    """Retrieval and generation over the company knowledge base."""

    # -- retrieval ---------------------------------------------------------
    async def retrieve_context(
        self,
        query: str,
        *,
        entities: Optional[List[str]] = None,
        category: Optional[str] = None,
        tenant_id: Optional[str] = None,
        top_k: Optional[int] = None,
        min_score: Optional[float] = None,
        trace: Optional[TurnTrace] = None,
    ) -> RAGContextResponse:
        """
        Retrieves and shapes the context block.

        Pipeline: hybrid retrieve (vector + keyword, multi-variant, RRF-fused)
        -> rerank -> dedupe/diversify/merge/token-budget. Returns an empty
        context rather than raising if the embedding or vector provider is
        down, so an infrastructure fault surfaces as a graceful decline.
        """
        outcome = await hybrid_retriever.retrieve(
            query,
            entities=entities,
            category=category,
            tenant_id=tenant_id,
            top_k=top_k,
            min_score=min_score,
            trace=trace,
        )

        if not outcome.hits:
            if outcome.embedding_failed and trace is not None:
                # Record the distinction so a provider outage is visible in the
                # turn log instead of masquerading as "nothing matched".
                trace.degraded = True
                trace.degraded_reason = "embedding_unavailable"
            return RAGContextResponse(context="", citations=[], token_count=0, top_score=None)

        reranked = rerank(query, outcome.hits)
        built = build_context(reranked)

        # Confidence must come from real similarity, never from the blended
        # ordering score — see the note in reranker.py.
        best_similarity = top_vector_score(reranked)

        if trace is not None:
            trace.retrieval_included = built.included_chunks
            trace.top_vector_score = round(best_similarity, 4)

        logger.info(
            "Retrieval complete",
            extra={
                "candidates": outcome.candidate_count,
                "included_chunks": built.included_chunks,
                "top_vector_score": round(best_similarity, 4),
                "keyword_branch": outcome.used_keyword_branch,
                "fallback_retry": outcome.used_fallback_retry,
                "query_variants": outcome.query_variants,
            },
        )

        return RAGContextResponse(
            context=built.context,
            citations=built.citations,
            token_count=built.token_count,
            top_score=best_similarity,
        )

    # -- prompt assembly ---------------------------------------------------
    def _build_messages(
        self,
        *,
        question: str,
        retrieval_query: str,
        context: str,
        history: List[ChatMessage],
        weak_grounding: bool,
        injection_flagged: bool,
    ) -> List[ChatMessage]:
        """
        Assembles the generation prompt.

        History and the current question are passed as *separate chat messages*
        rather than concatenated into the system string, so the model has an
        unambiguous structural boundary between instructions (system) and
        untrusted input (user/assistant turns).
        """
        notes: List[str] = []
        if weak_grounding:
            notes.append(prompts.render("weak_grounding_note"))
        if injection_flagged:
            notes.append(prompts.render("injection_note"))

        system_prompt = prompts.render(
            "answer_system",
            context_block=context or "No matching information available.",
            grounding_note="\n".join(n for n in notes if n),
        )

        messages: List[ChatMessage] = [
            ChatMessage(role=MessageRole.SYSTEM, content=system_prompt)
        ]
        messages.extend(_trim_history(history))

        if settings.USE_QUERY_REPLACEMENT and retrieval_query.strip() != question.strip():
            # Mode B: send the resolved query, but tell the model what was
            # actually typed so its tone matches the user's register.
            messages.append(
                ChatMessage(
                    role=MessageRole.USER,
                    content=f"{retrieval_query}\n\n(The user actually wrote: \"{question}\")",
                )
            )
        else:
            messages.append(ChatMessage(role=MessageRole.USER, content=question))

        return messages

    # -- generation --------------------------------------------------------
    async def answer(
        self,
        *,
        question: str,
        retrieval_query: str,
        history: List[ChatMessage],
        entities: Optional[List[str]] = None,
        category: Optional[str] = None,
        tenant_id: Optional[str] = "default",
        top_k: Optional[int] = None,
        min_score: Optional[float] = None,
        provider: Optional[str] = None,
        model: Optional[str] = None,
        injection_flagged: bool = False,
        trace: Optional[TurnTrace] = None,
    ) -> GroundedAnswer:
        """
        Produces a grounded answer for a knowledge-seeking turn.

        Every known failure mode degrades into a valid GroundedAnswer rather
        than raising, so the API contract holds even during a provider outage.
        """
        trace = trace or TurnTrace()

        with trace.stage("retrieval"):
            context_response = await self.retrieve_context(
                retrieval_query,
                entities=entities,
                category=category,
                tenant_id=tenant_id,
                top_k=top_k,
                min_score=min_score,
                trace=trace,
            )

        if not context_response.citations:
            metrics.increment("rag.no_context")
            reason = trace.degraded_reason if trace.degraded_reason else "no_context"
            if reason == "embedding_unavailable":
                # Same user-facing text either way — a visitor should not be
                # shown infrastructure detail — but the internal reason differs
                # so alerting can fire on an outage rather than on a normal miss.
                logger.error(
                    "Declining because the embedding provider is unavailable, not because "
                    "the knowledge base lacks an answer.",
                    extra={"degraded_reason": reason},
                )
                metrics.increment("rag.embedding_unavailable")
            else:
                logger.info("No context above threshold; declining without calling the LLM.")
            return GroundedAnswer(
                answer=prompts.raw("no_answer_suggestions", settings.LOW_SIMILARITY_MESSAGE).strip(),
                citations=[],
                confidence=0.0,
                grounded=False,
                degraded_reason=reason,
            )

        weak_grounding = (
            context_response.top_score is not None
            and context_response.top_score < settings.RETRIEVAL_CONFIDENT_SCORE
        )

        messages = self._build_messages(
            question=question,
            retrieval_query=retrieval_query,
            context=context_response.context,
            history=history,
            weak_grounding=weak_grounding,
            injection_flagged=injection_flagged,
        )

        try:
            with trace.stage("generation"):
                llm_response = await llm_service.agenerate(
                    messages, provider=provider, model=model
                )
        except (LLMUnavailableError, Exception) as exc:  # noqa: BLE001
            metrics.increment("rag.llm_unavailable")
            logger.error("Generation failed after exhausting providers: %s", exc)
            return GroundedAnswer(
                answer=settings.LLM_UNAVAILABLE_MESSAGE,
                citations=context_response.citations,
                confidence=0.0,
                grounded=False,
                degraded_reason="llm_unavailable",
            )

        trace.llm_provider = llm_response.provider
        trace.llm_input_tokens = llm_response.input_tokens
        trace.llm_output_tokens = llm_response.output_tokens

        answer_text = scrub_output(llm_response.content.strip())
        confidence = 0.6 if weak_grounding else 0.85
        metrics.increment("rag.answered")

        return GroundedAnswer(
            answer=answer_text,
            citations=context_response.citations,
            confidence=confidence,
            grounded=True,
        )

    async def astream_answer(
        self,
        *,
        question: str,
        retrieval_query: str,
        history: List[ChatMessage],
        entities: Optional[List[str]] = None,
        category: Optional[str] = None,
        tenant_id: Optional[str] = "default",
        injection_flagged: bool = False,
        trace: Optional[TurnTrace] = None,
    ) -> AsyncIterator[Dict[str, Any]]:
        """
        Streaming variant. Yields dicts:
            {"type": "citations", "citations": [...]}   once, before any token
            {"type": "delta",     "content": "..."}     repeatedly
            {"type": "done",      "answer": "...", "confidence": float}

        Citations are emitted first so the UI can render sources while tokens
        are still arriving.
        """
        trace = trace or TurnTrace()

        with trace.stage("retrieval"):
            context_response = await self.retrieve_context(
                retrieval_query,
                entities=entities,
                category=category,
                tenant_id=tenant_id,
                trace=trace,
            )

        if not context_response.citations:
            message = prompts.raw("no_answer_suggestions", settings.LOW_SIMILARITY_MESSAGE).strip()
            yield {"type": "citations", "citations": []}
            yield {"type": "delta", "content": message}
            yield {"type": "done", "answer": message, "confidence": 0.0, "grounded": False}
            return

        weak_grounding = (
            context_response.top_score is not None
            and context_response.top_score < settings.RETRIEVAL_CONFIDENT_SCORE
        )
        messages = self._build_messages(
            question=question,
            retrieval_query=retrieval_query,
            context=context_response.context,
            history=history,
            weak_grounding=weak_grounding,
            injection_flagged=injection_flagged,
        )

        yield {
            "type": "citations",
            "citations": [c.model_dump() for c in context_response.citations],
        }

        collected: List[str] = []
        try:
            async for delta in llm_service.astream(messages):
                collected.append(delta)
                yield {"type": "delta", "content": delta}
        except Exception as exc:  # noqa: BLE001
            logger.error("Streaming generation failed: %s", exc)
            if not collected:
                yield {"type": "delta", "content": settings.LLM_UNAVAILABLE_MESSAGE}
                collected.append(settings.LLM_UNAVAILABLE_MESSAGE)

        # The output guard runs on the assembled text: scrubbing individual
        # deltas is impossible because a leaked phrase can straddle a chunk
        # boundary. The final `answer` is therefore authoritative.
        final_answer = scrub_output("".join(collected).strip())
        yield {
            "type": "done",
            "answer": final_answer,
            "confidence": 0.6 if weak_grounding else 0.85,
            "grounded": True,
        }

    # -- legacy shim -------------------------------------------------------
    async def query(
        self,
        question: str,
        history: List[ChatMessage],
        category: Optional[str] = None,
        tenant_id: Optional[str] = "default",
        top_k: Optional[int] = None,
        min_score: Optional[float] = None,
        provider: Optional[str] = None,
        model: Optional[str] = None,
    ) -> RAGQueryResponse:
        """
        v1-compatible entry point: retrieval + generation with no conversation
        engine. Retained so the pipeline can still be exercised in isolation
        and as the ENABLE_CONVERSATION_ENGINE=false escape hatch.
        """
        started = time.time()
        result = await self.answer(
            question=question,
            retrieval_query=question,
            history=history,
            category=category,
            tenant_id=tenant_id,
            top_k=top_k,
            min_score=min_score,
            provider=provider,
            model=model,
        )
        return RAGQueryResponse(
            answer=result.answer,
            citations=result.citations,
            confidence_score=result.confidence,
            duration_seconds=time.time() - started,
        )


def _trim_history(history: List[ChatMessage]) -> List[ChatMessage]:
    """
    Bounds replayed history.

    Caps both the number of turns and the size of any single turn, so one
    pasted wall of text on turn 3 cannot crowd out the retrieved context on
    every subsequent turn.
    """
    window = settings.HISTORY_WINDOW_MESSAGES
    if window <= 0:
        return []

    trimmed: List[ChatMessage] = []
    for message in history[-window:]:
        content = message.content
        if len(content) > settings.HISTORY_MESSAGE_MAX_CHARS:
            content = content[: settings.HISTORY_MESSAGE_MAX_CHARS] + " […]"
        trimmed.append(ChatMessage(role=message.role, content=content))
    return trimmed


rag_orchestrator = RAGOrchestrator()
