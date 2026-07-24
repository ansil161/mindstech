"""
Tier-2 intent classification and query rewriting (LLM-assisted).

One model call produces the intent, the standalone rewritten query, extracted
entities and the topic. v1 used a separate call purely for scope+rewrite and
ran it on *every* message, including "thanks" — doubling latency and cost on
turns that never needed a model at all. Here the call only happens when the
deterministic rules in `rules.py` abstain, which in normal traffic is a
minority of turns.

The call is best-effort by construction: any failure returns None and the
caller proceeds with the raw question, because a routing outage must never
become a chat outage.
"""
from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from app.conversation.intents import ALL_INTENT_VALUES, Intent, parse_intent
from app.conversation.state import ConversationState
from app.core.config import settings
from app.core.prompts import prompts
from app.models.llm import ChatMessage, MessageRole
from app.services.llm import llm_service

logger = logging.getLogger(__name__)

_JSON_FENCE_RE = re.compile(r"^\s*```(?:json)?\s*|\s*```\s*$", re.IGNORECASE)
_JSON_OBJECT_RE = re.compile(r"\{.*\}", re.DOTALL)


@dataclass
class QueryAnalysis:
    """Result of understanding one user turn."""

    intent: Intent
    rewritten_query: str
    entities: List[str] = field(default_factory=list)
    topic: Optional[str] = None
    needs_retrieval: bool = True
    confidence: float = 0.5
    source: str = "llm"

    def to_log_fields(self) -> Dict[str, Any]:
        return {
            "intent": self.intent.value,
            "intent_source": self.source,
            "intent_confidence": round(self.confidence, 3),
            "needs_retrieval": self.needs_retrieval,
            "topic": self.topic,
            "entity_count": len(self.entities),
        }


def _format_history(history: Optional[List[ChatMessage]]) -> str:
    if not history:
        return "(no prior conversation)"
    lines: List[str] = []
    for message in history:
        role = message.role.value if hasattr(message.role, "value") else str(message.role)
        content = message.content
        # Truncate long turns: the classifier only needs the shape of the
        # conversation, and a pasted wall of text would dominate the prompt.
        if len(content) > settings.HISTORY_MESSAGE_MAX_CHARS:
            content = content[: settings.HISTORY_MESSAGE_MAX_CHARS] + " […]"
        lines.append(f"{role.capitalize()}: {content}")
    return "\n".join(lines)


def _alias_rules() -> str:
    return "; ".join(f"'{k}' = {v}" for k, v in settings.QUERY_ALIAS_MAPPING.items())


def _extract_json(raw: str) -> Optional[Dict[str, Any]]:
    """
    Pulls a JSON object out of a model response.

    Models wrap JSON in prose or code fences often enough that parsing the raw
    string directly is unreliable; this strips fences and, failing that,
    locates the outermost braces.
    """
    if not raw:
        return None
    candidate = _JSON_FENCE_RE.sub("", raw.strip())
    try:
        parsed = json.loads(candidate)
        return parsed if isinstance(parsed, dict) else None
    except json.JSONDecodeError:
        pass

    match = _JSON_OBJECT_RE.search(candidate)
    if match:
        try:
            parsed = json.loads(match.group(0))
            return parsed if isinstance(parsed, dict) else None
        except json.JSONDecodeError:
            return None
    return None


class IntentClassifier:
    """LLM-backed classifier used only for turns the rules can't decide."""

    async def analyze(
        self,
        question: str,
        *,
        history: Optional[List[ChatMessage]] = None,
        state: Optional[ConversationState] = None,
    ) -> Optional[QueryAnalysis]:
        """
        Classifies and rewrites one turn. Returns None on failure so the caller
        can fall back to the raw question rather than aborting the request.
        """
        if not settings.ENABLE_LLM_INTENT_CLASSIFICATION or not settings.ENABLE_QUERY_REWRITING:
            return None

        system_prompt = prompts.render(
            "intent_classifier_system",
            intent_values=ALL_INTENT_VALUES,
            alias_rules=_alias_rules(),
        )
        user_prompt = prompts.render(
            "intent_classifier_user",
            history_block=_format_history(history),
            last_assistant_question=(state.last_assistant_question if state else None) or "(none)",
            current_topic=(state.current_topic if state else None) or "(none)",
            question=question.replace('"', "'"),
        )

        attempts = max(1, settings.CLASSIFIER_MAX_RETRIES)
        for attempt in range(attempts):
            try:
                response = await llm_service.agenerate(
                    [
                        ChatMessage(role=MessageRole.SYSTEM, content=system_prompt),
                        ChatMessage(role=MessageRole.USER, content=user_prompt),
                    ],
                    temperature=0.0,
                    max_tokens=settings.LLM_CLASSIFIER_MAX_OUTPUT_TOKENS,
                    timeout=settings.LLM_CLASSIFIER_TIMEOUT_SECONDS,
                    require_json=True,
                )
                parsed = _extract_json(response.content)
                if parsed is None:
                    raise ValueError("classifier returned no parseable JSON object")

                analysis = self._to_analysis(parsed, question)
                logger.info("Query classified", extra=analysis.to_log_fields())
                return analysis

            except Exception as exc:  # noqa: BLE001 - best-effort by design
                logger.warning(
                    "Intent classification attempt %d/%d failed: %s",
                    attempt + 1, attempts, exc,
                )

        logger.error(
            "Intent classification failed after %d attempt(s); falling back to the raw question.",
            attempts,
        )
        return None

    @staticmethod
    def _to_analysis(parsed: Dict[str, Any], original_question: str) -> QueryAnalysis:
        intent = parse_intent(parsed.get("intent"), default=Intent.KNOWLEDGE_SEARCH)

        rewritten = str(parsed.get("rewritten_query") or "").strip() or original_question

        raw_entities = parsed.get("entities") or parsed.get("extracted_entities") or []
        entities = [str(e).strip() for e in raw_entities if str(e).strip()][:10]

        topic_value = parsed.get("topic")
        topic = str(topic_value).strip() if topic_value else None
        if topic and topic.lower() in {"null", "none", ""}:
            topic = None

        # Trust the intent's own declaration over the model's boolean when they
        # disagree — the taxonomy is authoritative about what needs retrieval.
        declared = parsed.get("needs_retrieval")
        needs_retrieval = bool(declared) if isinstance(declared, bool) else intent.requires_retrieval
        if intent.is_conversational:
            needs_retrieval = False
        if intent is Intent.OUT_OF_SCOPE:
            needs_retrieval = False

        return QueryAnalysis(
            intent=intent,
            rewritten_query=rewritten,
            entities=entities,
            topic=topic,
            needs_retrieval=needs_retrieval,
            confidence=0.8,
            source="llm",
        )


intent_classifier = IntentClassifier()
