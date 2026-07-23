"""
Second-stage re-ranking of retrieved chunks.

No cross-encoder library is available in this deployment (requirements.txt
has no sentence-transformers/torch, and embedder.py's own docstring commits
this service to a lightweight, low-RAM footprint suitable for a free-tier
host) — adding one would be exactly the "unnecessary framework" this project
is trying to avoid. Instead this implements a lightweight *hybrid* re-ranker:
it blends the existing vector similarity score with a cheap lexical
term-overlap score computed in plain Python, no ML dependency required.

The strategy is intentionally isolated behind rerank() so a real
cross-encoder can be dropped in later without touching any caller.
"""
import logging
import re
from typing import Any, Dict, List

from app.core.config import settings

logger = logging.getLogger(__name__)

_TOKEN_RE = re.compile(r"[a-z0-9]+")

# Common English stopwords that would otherwise dominate lexical overlap
# scoring without adding any real relevance signal.
_STOPWORDS = {
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "of", "in", "on", "at", "to", "for", "with", "and", "or", "but", "if",
    "do", "does", "did", "can", "could", "will", "would", "should", "i",
    "you", "he", "she", "it", "we", "they", "this", "that", "these", "those",
    "what", "which", "who", "whom", "how", "why", "when", "where", "as",
    "about", "into", "than", "then", "so", "not", "no", "yes", "my", "your",
}


def _tokenize(text: str) -> set:
    return {t for t in _TOKEN_RE.findall(text.lower()) if t not in _STOPWORDS and len(t) > 1}


def _lexical_overlap_score(query_terms: set, chunk_text: str) -> float:
    """
    Jaccard-style overlap between query terms and chunk terms, weighted
    toward query coverage (how much of the query the chunk addresses) since
    that's more predictive of relevance than raw symmetric overlap for
    typically-short queries against much-longer chunks.
    """
    if not query_terms:
        return 0.0
    chunk_terms = _tokenize(chunk_text)
    if not chunk_terms:
        return 0.0
    overlap = query_terms & chunk_terms
    return len(overlap) / len(query_terms)


def rerank(query: str, hits: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Re-orders `hits` (each a dict with at least "score" and "payload.content")
    by a blend of their original vector score and a lexical overlap score.
    Returns a new list; does not mutate the input. No-ops (returns hits
    unchanged, already sorted by vector score) when reranking is disabled.
    """
    if not settings.RETRIEVAL_ENABLE_RERANK or not hits:
        return hits

    query_terms = _tokenize(query)
    weight = max(0.0, min(1.0, settings.RERANK_LEXICAL_WEIGHT))

    rescored = []
    for hit in hits:
        content = (hit.get("payload") or {}).get("content", "")
        lexical = _lexical_overlap_score(query_terms, content)
        vector_score = float(hit.get("score", 0.0))
        blended = (1 - weight) * vector_score + weight * lexical
        rescored.append({**hit, "score": blended, "_vector_score": vector_score, "_lexical_score": lexical})

    rescored.sort(key=lambda h: h["score"], reverse=True)

    logger.debug(
        "Reranked %d hits (lexical_weight=%.2f): %s",
        len(rescored),
        weight,
        [(round(h["score"], 3), round(h["_vector_score"], 3), round(h["_lexical_score"], 3)) for h in rescored],
    )

    return rescored
