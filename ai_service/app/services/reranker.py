"""
Second-stage re-ranking of retrieved chunks.

No cross-encoder is used: requirements.txt carries no torch/sentence-transformers
and this service is deliberately kept light enough to run on a constrained
host. Instead this is a lightweight hybrid re-ranker blending the vector score
with cheap lexical signals computed in plain Python. The strategy is isolated
behind `rerank()` so a real cross-encoder can be substituted later without
touching any caller.

**Bug fixed from v1.** The old implementation overwrote each hit's `score` with
the blended value and returned it. The caller then took `max(score)` and
compared it against `RETRIEVAL_CONFIDENT_SCORE` — a threshold calibrated for
raw cosine similarity. Because blending pulls scores toward the (usually much
lower) lexical component, well-grounded results were routinely misclassified
as "weak grounding" and the model was told to hedge on answers it should have
stated plainly. The blended value is now written to `_rerank_score` and used
only for ordering; `_vector_score` is preserved untouched for confidence.
"""
from __future__ import annotations

import logging
import math
import re
from typing import Any, Dict, List

from app.core.config import settings

logger = logging.getLogger(__name__)

_TOKEN_RE = re.compile(r"[a-z0-9][a-z0-9\-/.]*")

# Stopwords that would otherwise dominate lexical overlap without carrying
# relevance signal.
_STOPWORDS = frozenset(
    {
        "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
        "of", "in", "on", "at", "to", "for", "with", "and", "or", "but", "if",
        "do", "does", "did", "can", "could", "will", "would", "should", "i",
        "you", "he", "she", "it", "we", "they", "this", "that", "these", "those",
        "what", "which", "who", "whom", "how", "why", "when", "where", "as",
        "about", "into", "than", "then", "so", "not", "no", "yes", "my", "your",
        "there", "here", "have", "has", "had", "any", "some", "all", "more",
    }
)


def _tokenize(text: str) -> List[str]:
    return [t for t in _TOKEN_RE.findall(text.lower()) if t not in _STOPWORDS and len(t) > 1]


def _coverage_score(query_terms: List[str], chunk_terms: set) -> float:
    """
    Fraction of distinct query terms the chunk addresses.

    Coverage beats symmetric overlap here because queries are short and chunks
    are long: Jaccard would penalise a comprehensive chunk for containing
    material beyond the question.
    """
    if not query_terms:
        return 0.0
    unique_query = set(query_terms)
    return len(unique_query & chunk_terms) / len(unique_query)


def _phrase_bonus(query: str, content: str) -> float:
    """
    Rewards an exact multi-word phrase match.

    An exact hit on "DM NVX 363" or "control room" is a far stronger relevance
    signal than the same words scattered across a paragraph, and pure bag-of-
    words scoring cannot see the difference.
    """
    normalized_query = " ".join(_tokenize(query))
    if len(normalized_query.split()) < 2:
        return 0.0
    return 1.0 if normalized_query in content.lower() else 0.0


def _length_penalty(content: str) -> float:
    """
    Mildly favours focused chunks over sprawling ones.

    A very long chunk trivially contains more query terms, so without this a
    single rambling document tends to monopolise the context window.
    """
    length = max(1, len(content))
    if length <= 1200:
        return 1.0
    return max(0.75, 1.0 - 0.1 * math.log10(length / 1200))


def rerank(query: str, hits: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Re-orders hits by a blend of vector similarity and lexical relevance.

    Returns a new list; the input is not mutated. Each returned hit carries:
      score          - ordering score (blended); do NOT compare to thresholds
      _vector_score  - original cosine similarity, preserved for confidence
      _rerank_score  - the blend, exposed for debugging
      _lexical_score - the lexical component
    """
    if not hits:
        return []
    if not settings.RETRIEVAL_ENABLE_RERANK:
        # Even when disabled, guarantee the invariant that every hit carries a
        # _vector_score, so callers never have to special-case this path.
        return [
            {**hit, "_vector_score": float(hit.get("_vector_score", hit.get("score", 0.0)))}
            for hit in hits
        ]

    query_terms = _tokenize(query)
    weight = min(1.0, max(0.0, settings.RERANK_LEXICAL_WEIGHT))

    rescored: List[Dict[str, Any]] = []
    for hit in hits:
        content = str((hit.get("payload") or {}).get("content", ""))
        chunk_terms = set(_tokenize(content))

        coverage = _coverage_score(query_terms, chunk_terms)
        phrase = _phrase_bonus(query, content)
        lexical = min(1.0, coverage + 0.25 * phrase)

        vector_score = float(hit.get("_vector_score", hit.get("score", 0.0)))
        blended = ((1 - weight) * vector_score + weight * lexical) * _length_penalty(content)

        rescored.append(
            {
                **hit,
                "score": blended,
                "_rerank_score": blended,
                "_vector_score": vector_score,
                "_lexical_score": lexical,
            }
        )

    rescored.sort(key=lambda hit: hit["_rerank_score"], reverse=True)

    if logger.isEnabledFor(logging.DEBUG):
        logger.debug(
            "Reranked %d hits (lexical_weight=%.2f): %s",
            len(rescored),
            weight,
            [
                (round(h["_rerank_score"], 3), round(h["_vector_score"], 3), round(h["_lexical_score"], 3))
                for h in rescored[:5]
            ],
        )

    return rescored


def top_vector_score(hits: List[Dict[str, Any]]) -> float:
    """
    Highest genuine similarity among hits.

    This — not the blended ordering score — is what confidence thresholds must
    be compared against.
    """
    return max((float(hit.get("_vector_score", 0.0)) for hit in hits), default=0.0)
