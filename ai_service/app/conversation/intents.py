"""
Intent taxonomy.

The categories are chosen by *what the service must do next*, not by
linguistic nicety: each one maps to exactly one handler in the dialogue
manager. Adding an intent without a handler is a bug, which is why
`requires_retrieval` and `is_conversational` are defined here rather than
being re-derived at each call site.
"""
from __future__ import annotations

from enum import Enum
from typing import FrozenSet


class Intent(str, Enum):
    """What the user is trying to do with this message."""

    # --- conversational: answered from templates, never from retrieval ---
    GREETING = "greeting"
    GOODBYE = "goodbye"
    THANKS = "thanks"
    HELP = "help"
    IDENTITY = "identity"
    SMALL_TALK = "small_talk"
    NEGATION = "negation"

    # --- context-dependent: meaning comes from conversation state ---
    AFFIRMATION = "affirmation"       # "yes", "sure", "go ahead"
    CONTINUATION = "continuation"     # "tell me more", "what else"

    # --- knowledge: resolved against the company knowledge base ---
    COMPANY_FAQ = "company_faq"       # structured facts, FAQ layer first
    KNOWLEDGE_SEARCH = "knowledge_search"
    COMPARISON = "comparison"
    RECOMMENDATION = "recommendation"
    SUPPORT = "support"

    # --- terminal ---
    OUT_OF_SCOPE = "out_of_scope"
    UNKNOWN = "unknown"

    @property
    def requires_retrieval(self) -> bool:
        """Whether answering this intent needs the knowledge base at all."""
        return self in _RETRIEVAL_INTENTS

    @property
    def is_conversational(self) -> bool:
        """Whether this can be answered from a template with zero model calls."""
        return self in _CONVERSATIONAL_INTENTS

    @property
    def is_context_dependent(self) -> bool:
        """Whether its meaning is only recoverable from conversation state."""
        return self in _CONTEXT_DEPENDENT_INTENTS


_RETRIEVAL_INTENTS: FrozenSet[Intent] = frozenset(
    {
        Intent.COMPANY_FAQ,
        Intent.KNOWLEDGE_SEARCH,
        Intent.COMPARISON,
        Intent.RECOMMENDATION,
        Intent.SUPPORT,
    }
)

_CONVERSATIONAL_INTENTS: FrozenSet[Intent] = frozenset(
    {
        Intent.GREETING,
        Intent.GOODBYE,
        Intent.THANKS,
        Intent.HELP,
        Intent.IDENTITY,
        Intent.SMALL_TALK,
        Intent.NEGATION,
    }
)

_CONTEXT_DEPENDENT_INTENTS: FrozenSet[Intent] = frozenset(
    {
        Intent.AFFIRMATION,
        Intent.CONTINUATION,
    }
)


def parse_intent(value: str | None, default: Intent = Intent.UNKNOWN) -> Intent:
    """Lenient parse of a model-produced intent string."""
    if not value:
        return default
    normalized = value.strip().lower().replace("-", "_").replace(" ", "_")
    try:
        return Intent(normalized)
    except ValueError:
        return default


ALL_INTENT_VALUES: str = ", ".join(intent.value for intent in Intent)
