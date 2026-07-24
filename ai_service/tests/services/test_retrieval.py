"""
Hybrid retrieval: rank fusion, multi-query expansion, keyword branch, and the
relaxed-threshold fallback.
"""
import pytest

from app.core.config import settings
from app.services.retrieval import hybrid_retriever, reciprocal_rank_fusion
from app.storage import vector_db as vector_db_module
from tests.conftest import make_hit


# ----------------------------------------------------------------------
# Reciprocal Rank Fusion
# ----------------------------------------------------------------------
def test_rrf_promotes_documents_agreed_on_by_multiple_branches():
    """
    A document both branches rank highly should beat one that only a single
    branch ranks first — that agreement is the whole value of fusing.
    """
    list_a = [make_hit(0.9, document_id="a"), make_hit(0.8, document_id="shared")]
    list_b = [make_hit(0.7, document_id="shared"), make_hit(0.6, document_id="b")]

    fused = reciprocal_rank_fusion([list_a, list_b])
    assert fused[0]["payload"]["document_id"] == "shared"


def test_rrf_preserves_the_best_raw_vector_score():
    """
    Fusion scores are ranks, not similarities. The genuine cosine value must
    survive so confidence thresholds still mean something.
    """
    high = make_hit(0.95, document_id="x")
    high["_vector_score"] = 0.95
    low = make_hit(0.30, document_id="x")
    low["_vector_score"] = 0.30

    fused = reciprocal_rank_fusion([[high], [low]])
    assert fused[0]["_vector_score"] == pytest.approx(0.95)


def test_rrf_of_a_single_list_preserves_its_order():
    ordered = [make_hit(0.9, document_id="a"), make_hit(0.5, document_id="b")]
    fused = reciprocal_rank_fusion([ordered])
    assert [h["payload"]["document_id"] for h in fused] == ["a", "b"]


def test_rrf_handles_empty_input():
    assert reciprocal_rank_fusion([]) == []


# ----------------------------------------------------------------------
# Retrieval pipeline
# ----------------------------------------------------------------------
async def test_multi_query_issues_several_variants(monkeypatch):
    """Expansion should widen recall, not just re-issue the same string."""
    monkeypatch.setattr(settings, "RETRIEVAL_ENABLE_MULTI_QUERY", True)
    seen_vectors = []

    async def _search(query_vector, **kwargs):
        seen_vectors.append(query_vector)
        return [make_hit()]

    monkeypatch.setattr(vector_db_module.vector_db_manager, "search_similar", _search)

    outcome = await hybrid_retriever.retrieve("what AV products do you sell")

    assert outcome.query_variants >= 2
    assert len(seen_vectors) == outcome.query_variants


async def test_multi_query_can_be_disabled(monkeypatch):
    monkeypatch.setattr(settings, "RETRIEVAL_ENABLE_MULTI_QUERY", False)
    calls = []

    async def _search(**kwargs):
        calls.append(kwargs)
        return [make_hit()]

    monkeypatch.setattr(vector_db_module.vector_db_manager, "search_similar", _search)

    outcome = await hybrid_retriever.retrieve("what AV products do you sell")

    assert outcome.query_variants == 1
    assert len(calls) == 1


async def test_keyword_branch_recovers_a_document_the_vector_branch_missed(monkeypatch):
    """
    The concrete case hybrid retrieval exists for: an exact part number embeds
    poorly, so dense search alone never surfaces it.
    """
    monkeypatch.setattr(settings, "RETRIEVAL_ENABLE_HYBRID", True)

    async def _no_vector_hits(**kwargs):
        return []

    async def _keyword_hits(**kwargs):
        hit = make_hit(content="The DM-NVX-363 encoder ships with a 3-year warranty.")
        hit["_keyword_matches"] = 3
        hit["score"] = 1.0
        return [hit]

    monkeypatch.setattr(vector_db_module.vector_db_manager, "search_similar", _no_vector_hits)
    monkeypatch.setattr(vector_db_module.vector_db_manager, "search_keyword", _keyword_hits)

    outcome = await hybrid_retriever.retrieve("DM-NVX-363 warranty")

    assert outcome.used_keyword_branch is True
    assert outcome.hits, "a strong keyword match should survive fusion"


async def test_weak_keyword_only_hits_are_filtered_out(monkeypatch):
    """Recall must not come at the cost of feeding the model near-noise."""
    monkeypatch.setattr(settings, "RETRIEVAL_ENABLE_HYBRID", True)

    async def _no_vector_hits(**kwargs):
        return []

    async def _weak_keyword(**kwargs):
        hit = make_hit(content="A passing mention.")
        hit["_keyword_matches"] = 1  # below the corroboration bar
        return [hit]

    monkeypatch.setattr(vector_db_module.vector_db_manager, "search_similar", _no_vector_hits)
    monkeypatch.setattr(vector_db_module.vector_db_manager, "search_keyword", _weak_keyword)

    outcome = await hybrid_retriever.retrieve("something obscure")
    assert outcome.hits == []


async def test_fallback_retry_relaxes_the_threshold(monkeypatch):
    """
    Rather than declining immediately, a second pass at a lower floor gives
    weak-but-real material a chance — the prompt then instructs hedging.
    """
    monkeypatch.setattr(settings, "RETRIEVAL_ENABLE_FALLBACK_RETRY", True)
    monkeypatch.setattr(settings, "RETRIEVAL_MIN_SCORE", 0.30)
    monkeypatch.setattr(settings, "RETRIEVAL_FALLBACK_MIN_SCORE", 0.10)

    thresholds = []

    async def _search(query_vector, limit, min_score, filters):
        thresholds.append(min_score)
        return [make_hit(score=0.20)] if min_score <= 0.10 else []

    monkeypatch.setattr(vector_db_module.vector_db_manager, "search_similar", _search)

    outcome = await hybrid_retriever.retrieve("an obscure question")

    assert 0.30 in thresholds and 0.10 in thresholds
    assert outcome.used_fallback_retry is True
    assert outcome.hits


async def test_embedding_failure_degrades_to_empty_rather_than_raising(monkeypatch):
    """A provider outage must surface as a graceful decline, never a 500."""

    async def _boom(texts):
        raise RuntimeError("embedding provider down")

    monkeypatch.setattr("app.services.retrieval.embedder.aembed_batch", _boom)

    outcome = await hybrid_retriever.retrieve("anything at all")
    assert outcome.hits == []


async def test_one_failing_variant_does_not_sink_the_whole_query(monkeypatch):
    """Variants run concurrently; one failure should not lose the others."""
    call_count = {"n": 0}

    async def _search(**kwargs):
        call_count["n"] += 1
        if call_count["n"] == 1:
            raise RuntimeError("transient qdrant error")
        return [make_hit()]

    monkeypatch.setattr(vector_db_module.vector_db_manager, "search_similar", _search)

    outcome = await hybrid_retriever.retrieve("what AV products do you sell")
    assert outcome.hits, "surviving variants should still produce results"


async def test_tenant_and_category_filters_are_applied(monkeypatch):
    """Multi-tenant isolation has to reach the store, not just the signature."""
    captured = {}

    async def _search(query_vector, limit, min_score, filters):
        captured.update(filters or {})
        return [make_hit()]

    monkeypatch.setattr(vector_db_module.vector_db_manager, "search_similar", _search)

    await hybrid_retriever.retrieve("displays", category="product", tenant_id="acme")

    assert captured["category"] == "product"
    assert captured["tenant_id"] == "acme"


# ----------------------------------------------------------------------
# Embedding-outage visibility
# ----------------------------------------------------------------------
async def test_embedding_failure_is_reported_distinctly_from_no_match(monkeypatch):
    """
    An embedding outage and an honest "nothing matched" both produce zero hits.
    Without a distinguishing signal, a total retrieval outage is invisible —
    which is exactly what happened when Hugging Face dropped serverless support
    for the configured model: every answer became "I don't have that specific
    detail" while every health check stayed green.
    """

    async def _boom(texts):
        raise RuntimeError("embedding provider down")

    monkeypatch.setattr("app.services.retrieval.embedder.aembed_batch", _boom)

    outcome = await hybrid_retriever.retrieve("anything")

    assert outcome.hits == []
    assert outcome.embedding_failed is True


async def test_genuine_no_match_is_not_flagged_as_an_outage():
    outcome = await hybrid_retriever.retrieve("something genuinely unindexed")
    assert outcome.hits == []
    assert outcome.embedding_failed is False
