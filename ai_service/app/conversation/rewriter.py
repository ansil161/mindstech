"""
Deterministic query rewriting and expansion.

Runs without a model call. Two jobs:

1. **Resolution** — turn a fragment into something retrievable. A bare "CEO"
   becomes "Who leads Mindstec Distribution India?"; "yes" after a pending
   question becomes that question's subject; "tell me more" becomes the
   current topic. v1 embedded these literally, which is why a "yes" produced
   a vector search for the token "yes".

2. **Expansion** — produce a small set of query variants (alias-expanded,
   entity-focused) that are searched together and fused. Dense retrieval
   routinely misses exact identifiers, and an alias-expanded variant recovers
   "AV" -> "Audio Visual" hits that the raw abbreviation would not.

Both are cheap string operations, so they cost nothing on the critical path.
"""
from __future__ import annotations

import logging
import re
from typing import List, Optional

from app.conversation.intents import Intent
from app.conversation.rules import is_bare_entity, normalize, strip_leading_greeting
from app.conversation.state import ConversationState
from app.core.config import settings

logger = logging.getLogger(__name__)

_WORD_RE = re.compile(r"\b[\w\-/.]+\b")

# Bare terms that name a person/role rather than a product, so they expand
# into a "who" question instead of a "what/how" one.
_ROLE_TERMS = {
    "ceo", "founder", "chairman", "md", "managing director", "director",
    "owner", "president", "head", "leadership", "management", "boss",
}

# Bare terms that are about the company itself.
_COMPANY_TERMS = {
    "company", "about", "about us", "business", "firm", "organisation",
    "organization", "mindstec", "mindstech", "minstech", "mindstek",
}

_CONTACT_TERMS = {
    "contact", "email", "phone", "number", "address", "location", "office",
    "offices", "reach",
}


def expand_aliases(text: str) -> str:
    """
    Expands configured abbreviations, preserving the original token alongside
    the expansion so an exact-match on the abbreviation is not lost.
    """
    if not text:
        return text
    result = text
    for alias, expansion in settings.QUERY_ALIAS_MAPPING.items():
        # Whole-word, case-insensitive; abbreviations are usually uppercase but
        # users type them either way.
        pattern = re.compile(rf"\b{re.escape(alias)}\b", re.IGNORECASE)
        if pattern.search(result):
            result = pattern.sub(f"{alias} ({expansion})", result, count=1)
    return result


def resolve_reference(
    message: str,
    intent: Intent,
    state: ConversationState,
) -> Optional[str]:
    """
    Produces a standalone query for a turn whose meaning lives in the
    conversation rather than in the message itself.

    Returns None when the message already stands alone.
    """
    if intent is Intent.AFFIRMATION:
        pending = state.pending_confirmation
        if pending and pending.query_on_confirm:
            logger.info(
                "Affirmation resolved against pending question",
                extra={"resolved_topic": pending.topic},
            )
            return pending.query_on_confirm
        if state.current_topic:
            return f"Tell me more about {state.current_topic}"
        return None

    if intent is Intent.CONTINUATION:
        topic = state.current_topic or state.last_topic
        if topic:
            return f"More detail about {topic}"
        return None

    return None


def build_standalone_query(
    message: str,
    intent: Intent,
    state: ConversationState,
    llm_rewritten: Optional[str] = None,
) -> str:
    """
    Final retrieval query for this turn.

    Precedence: an explicit conversational resolution (yes/tell-me-more) wins,
    then the LLM's rewrite, then deterministic expansion of the raw message.
    The conversational resolution outranks the LLM because it is derived from
    recorded state rather than inference.
    """
    resolved = resolve_reference(message, intent, state)
    if resolved:
        return resolved

    if llm_rewritten and llm_rewritten.strip() and normalize(llm_rewritten) != normalize(message):
        return llm_rewritten.strip()

    cleaned = strip_leading_greeting(message).strip()

    if is_bare_entity(cleaned):
        expanded = _expand_bare_entity(cleaned, state)
        if expanded:
            return expanded

    return expand_aliases(cleaned or message)


def _expand_bare_entity(term: str, state: ConversationState) -> Optional[str]:
    """
    Turns a bare noun into a well-formed question.

    Searching the token "CEO" against a corpus of product documentation
    retrieves essentially nothing; "Who leads Mindstec Distribution India?"
    retrieves the leadership material.
    """
    normalized = normalize(term)
    company = settings.COMPANY_SHORT_NAME
    full_company = settings.COMPANY_NAME

    if normalized in _ROLE_TERMS:
        return f"Who is the {normalized} of {full_company}? Company leadership and management team."
    if normalized in _COMPANY_TERMS:
        return f"Tell me about {full_company} — what the company does and which markets it serves."
    if normalized in _CONTACT_TERMS:
        return f"{company} contact details, office locations, email address and phone number."

    # Otherwise it's a product, brand or technology term: give it a frame so
    # retrieval matches descriptive prose rather than a naked keyword.
    expanded = expand_aliases(term)
    return f"{expanded} — what it is and how it relates to {company}'s AV and IT product range."


def build_query_variants(primary_query: str, entities: Optional[List[str]] = None) -> List[str]:
    """
    Produces up to RETRIEVAL_MAX_QUERY_VARIANTS distinct search strings.

    Variants are fused with Reciprocal Rank Fusion downstream, so each one only
    has to be *plausible* — a variant that retrieves nothing simply contributes
    nothing, while one that recovers a missed document lifts it into the final
    set.
    """
    if not settings.RETRIEVAL_ENABLE_MULTI_QUERY:
        return [primary_query]

    variants: List[str] = [primary_query]

    aliased = expand_aliases(primary_query)
    if aliased != primary_query:
        variants.append(aliased)

    # An entity-only variant strips question scaffolding ("what", "how much",
    # "do you have") that dilutes the embedding for keyword-ish lookups.
    if entities:
        entity_query = " ".join(dict.fromkeys(e.strip() for e in entities if e.strip()))
        if entity_query and normalize(entity_query) != normalize(primary_query):
            variants.append(entity_query)
    else:
        keyword_only = _strip_question_words(primary_query)
        if keyword_only and normalize(keyword_only) != normalize(primary_query):
            variants.append(keyword_only)

    # De-duplicate while preserving order.
    seen: set[str] = set()
    unique: List[str] = []
    for variant in variants:
        key = normalize(variant)
        if key and key not in seen:
            seen.add(key)
            unique.append(variant)

    return unique[: max(1, settings.RETRIEVAL_MAX_QUERY_VARIANTS)]


_QUESTION_WORDS = {
    "what", "which", "who", "whom", "whose", "where", "when", "why", "how",
    "is", "are", "was", "were", "do", "does", "did", "can", "could", "would",
    "should", "will", "shall", "may", "might", "the", "a", "an", "of", "for",
    "to", "in", "on", "at", "with", "and", "or", "me", "you", "your", "i",
    "tell", "about", "please", "much", "many", "there", "have", "has", "any",
}


def _strip_question_words(text: str) -> str:
    tokens = _WORD_RE.findall(text.lower())
    kept = [t for t in tokens if t not in _QUESTION_WORDS and len(t) > 1]
    return " ".join(kept)


def extract_keywords(text: str, limit: int = 12) -> List[str]:
    """Content-bearing terms, used to drive the keyword retrieval branch."""
    tokens = _WORD_RE.findall(text.lower())
    kept: List[str] = []
    for token in tokens:
        if token in _QUESTION_WORDS or len(token) < 2:
            continue
        if token not in kept:
            kept.append(token)
    return kept[:limit]
