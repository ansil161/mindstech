"""
Hybrid retrieval.

v1 issued a single dense vector search on a single query string. Three failure
modes followed from that:

* Exact identifiers (part numbers, model codes, brand spellings) embed poorly
  and were simply never found.
* One phrasing of a question either hit or missed; there was no second chance.
* When nothing cleared the score floor, the pipeline gave up immediately.

This module runs the vector branch and a keyword branch over several query
variants, fuses the ranked lists with Reciprocal Rank Fusion, and — if the
result is still empty — retries once with a relaxed floor before declining.

RRF is used rather than score averaging because the two branches produce
incomparable numbers (cosine similarity vs. keyword match count). Fusing by
*rank* sidesteps that entirely and is the standard result-merging technique
for exactly this reason.
"""
from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Sequence

from app.conversation.rewriter import build_query_variants, extract_keywords
from app.core.config import settings
from app.core.observability import TurnTrace, metrics
from app.services.embedder import embedder
from app.storage.vector_db import vector_db_manager

logger = logging.getLogger(__name__)


@dataclass
class RetrievalOutcome:
    """Raw hits plus the provenance needed for logging and confidence scoring."""

    hits: List[Dict[str, Any]] = field(default_factory=list)
    candidate_count: int = 0
    used_keyword_branch: bool = False
    used_fallback_retry: bool = False
    query_variants: int = 0
    # Highest *raw cosine* score seen. Kept separate from the fused/blended
    # ordering score because that one is not comparable to the configured
    # confidence threshold.
    top_vector_score: Optional[float] = None
    # True when the vector branch could not run at all (embedding provider
    # down). Distinguishes "the knowledge base has no answer" from "retrieval
    # is broken" — without it both look like an empty result and an outage is
    # invisible.
    embedding_failed: bool = False


def _hit_key(hit: Dict[str, Any]) -> str:
    return str(hit.get("id"))


def reciprocal_rank_fusion(
    ranked_lists: Sequence[List[Dict[str, Any]]],
    k: Optional[int] = None,
) -> List[Dict[str, Any]]:
    """
    Fuses several ranked lists into one.

    Each document scores sum(1 / (k + rank)) across the lists it appears in, so
    a document ranked highly by two independent branches outranks one ranked
    slightly higher by a single branch. `k` damps the influence of top ranks;
    60 is the value from the original RRF paper.

    The best raw vector score seen for a document is preserved on the merged
    hit, because downstream confidence decisions must use a real similarity
    number, not the fusion score.
    """
    constant = k if k is not None else settings.RETRIEVAL_RRF_K
    fused: Dict[str, Dict[str, Any]] = {}

    for ranked in ranked_lists:
        for rank, hit in enumerate(ranked):
            key = _hit_key(hit)
            if key not in fused:
                merged = dict(hit)
                merged["_rrf_score"] = 0.0
                merged["_vector_score"] = float(hit.get("_vector_score", hit.get("score", 0.0)))
                fused[key] = merged
            entry = fused[key]
            entry["_rrf_score"] += 1.0 / (constant + rank + 1)
            incoming_vector_score = float(hit.get("_vector_score", hit.get("score", 0.0)))
            if incoming_vector_score > entry["_vector_score"]:
                entry["_vector_score"] = incoming_vector_score

    results = list(fused.values())
    results.sort(key=lambda item: item["_rrf_score"], reverse=True)
    # `score` carries the fusion ordering; `_vector_score` carries the truth
    # about semantic similarity.
    for item in results:
        item["score"] = item["_rrf_score"]
    return results


class HybridRetriever:
    """Runs and fuses the retrieval branches."""

    async def retrieve(
        self,
        query: str,
        *,
        entities: Optional[List[str]] = None,
        category: Optional[str] = None,
        tenant_id: Optional[str] = None,
        top_k: Optional[int] = None,
        min_score: Optional[float] = None,
        trace: Optional[TurnTrace] = None,
    ) -> RetrievalOutcome:
        """
        Executes the full retrieval ladder for one query.

        Never raises on provider failure: an embedding outage degrades to an
        empty result, which the caller surfaces as a graceful decline rather
        than a 500.
        """
        limit = top_k or settings.RETRIEVAL_TOP_K
        threshold = min_score if min_score is not None else settings.RETRIEVAL_MIN_SCORE
        candidate_limit = max(limit, int(limit * settings.RETRIEVAL_OVERFETCH_MULTIPLIER))

        filters: Dict[str, Any] = {}
        if category:
            filters["category"] = category
        if tenant_id:
            filters["tenant_id"] = tenant_id

        variants = build_query_variants(query, entities)
        outcome = await self._run_pass(variants, candidate_limit, threshold, filters)
        outcome.query_variants = len(variants)

        # Fallback ladder: rather than declining immediately, retry the primary
        # query once with a relaxed floor. Weak-but-real material still beats
        # "I don't know", and the prompt makes the model hedge accordingly.
        if not outcome.hits and settings.RETRIEVAL_ENABLE_FALLBACK_RETRY:
            relaxed = min(threshold, settings.RETRIEVAL_FALLBACK_MIN_SCORE)
            if relaxed < threshold:
                logger.info(
                    "Primary retrieval empty; retrying with relaxed threshold",
                    extra={"relaxed_min_score": relaxed},
                )
                outcome = await self._run_pass(variants, candidate_limit, relaxed, filters)
                outcome.query_variants = len(variants)
                outcome.used_fallback_retry = True

        if trace is not None:
            trace.retrieval_candidates = outcome.candidate_count
            trace.used_keyword_branch = outcome.used_keyword_branch
            trace.used_fallback_retry = outcome.used_fallback_retry
            trace.query_variants = outcome.query_variants
            trace.top_vector_score = outcome.top_vector_score

        return outcome

    async def _run_pass(
        self,
        variants: List[str],
        candidate_limit: int,
        threshold: float,
        filters: Dict[str, Any],
    ) -> RetrievalOutcome:
        """One complete retrieval pass across all branches and variants."""
        vector_lists, embedding_failed = await self._vector_branch(
            variants, candidate_limit, threshold, filters
        )
        keyword_list = await self._keyword_branch(variants[0], filters)

        ranked_lists: List[List[Dict[str, Any]]] = [lst for lst in vector_lists if lst]
        used_keyword = bool(keyword_list)
        if keyword_list:
            ranked_lists.append(keyword_list)

        if not ranked_lists:
            return RetrievalOutcome(
                used_keyword_branch=used_keyword, embedding_failed=embedding_failed
            )

        fused = reciprocal_rank_fusion(ranked_lists)
        # Keyword-only hits have no meaningful similarity score; drop those that
        # no vector branch corroborated and that matched only weakly, so the
        # keyword branch can add recall without adding noise.
        filtered = [
            hit for hit in fused
            if hit.get("_vector_score", 0.0) >= threshold or hit.get("_keyword_matches", 0) >= 2
        ]

        top_vector_score = max(
            (float(hit.get("_vector_score", 0.0)) for hit in filtered), default=None
        )

        return RetrievalOutcome(
            hits=filtered[:candidate_limit],
            candidate_count=len(fused),
            used_keyword_branch=used_keyword,
            top_vector_score=top_vector_score,
            embedding_failed=embedding_failed,
        )

    async def _vector_branch(
        self,
        variants: List[str],
        candidate_limit: int,
        threshold: float,
        filters: Dict[str, Any],
    ) -> tuple[List[List[Dict[str, Any]]], bool]:
        """
        Embeds every variant and searches concurrently.

        Concurrency matters here: three sequential embed+search round-trips
        would add roughly two full network latencies to every turn, whereas
        run together they cost about one.

        Returns (ranked_lists, embedding_failed). The flag is what lets the
        caller tell a genuine "no match" apart from a provider outage.
        """
        try:
            vectors = await embedder.aembed_batch(variants)
        except Exception as exc:  # noqa: BLE001 - degrade, never 500
            logger.error(
                "Embedding provider failed; vector retrieval is unavailable for this turn. "
                "Answers will be ungrounded until this is resolved: %s",
                exc,
                extra={"embedding_provider_down": True},
            )
            metrics.increment("retrieval.embedding_failure")
            return [], True

        searches = [
            vector_db_manager.search_similar(
                query_vector=vector,
                limit=candidate_limit,
                min_score=threshold,
                filters=filters,
            )
            for vector in vectors
        ]
        results = await asyncio.gather(*searches, return_exceptions=True)

        ranked_lists: List[List[Dict[str, Any]]] = []
        for result in results:
            if isinstance(result, BaseException):
                logger.warning("A vector search variant failed: %s", result)
                continue
            for hit in result:
                hit["_vector_score"] = float(hit.get("score", 0.0))
            ranked_lists.append(result)
        return ranked_lists, False

    async def _keyword_branch(
        self, query: str, filters: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        if not settings.RETRIEVAL_ENABLE_HYBRID:
            return []
        keywords = extract_keywords(query)
        if not keywords:
            return []
        try:
            hits = await vector_db_manager.search_keyword(
                keywords=keywords,
                limit=settings.RETRIEVAL_KEYWORD_LIMIT,
                filters=filters,
            )
        except Exception as exc:  # noqa: BLE001
            logger.warning("Keyword branch failed: %s", exc)
            return []
        for hit in hits:
            # Keyword hits carry no similarity score; mark as 0 so fusion never
            # mistakes a match count for a cosine value.
            hit["_vector_score"] = 0.0
        return hits


hybrid_retriever = HybridRetriever()
