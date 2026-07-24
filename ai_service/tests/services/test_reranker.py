"""
Re-ranking behaviour, including the v1 score-scale regression.
"""
import pytest

from app.core.config import settings
from app.services.reranker import rerank, top_vector_score


def _hit(score, content, id_="h1"):
    return {"id": id_, "score": score, "payload": {"content": content, "title": "Doc"}}


def test_disabled_reranker_still_exposes_vector_score(monkeypatch):
    """
    Callers must be able to rely on `_vector_score` existing unconditionally,
    otherwise every confidence check needs a special case for this path.
    """
    monkeypatch.setattr(settings, "RETRIEVAL_ENABLE_RERANK", False)
    result = rerank("crestron", [_hit(0.5, "irrelevant"), _hit(0.9, "also irrelevant")])
    assert [h["_vector_score"] for h in result] == [0.5, 0.9]


def test_lexically_relevant_chunk_is_promoted_over_raw_vector_score(monkeypatch):
    monkeypatch.setattr(settings, "RETRIEVAL_ENABLE_RERANK", True)
    monkeypatch.setattr(settings, "RERANK_LEXICAL_WEIGHT", 0.8)

    relevant = _hit(0.31, "Crestron control systems pricing and specifications", "relevant")
    irrelevant = _hit(0.90, "Completely unrelated audio cable documentation", "irrelevant")

    result = rerank("crestron control systems pricing", [irrelevant, relevant])
    assert result[0]["id"] == "relevant"


def test_input_list_is_not_mutated(monkeypatch):
    monkeypatch.setattr(settings, "RETRIEVAL_ENABLE_RERANK", True)
    hits = [_hit(0.5, "some content")]
    rerank("some content", hits)
    assert hits[0]["score"] == 0.5


def test_vector_score_survives_reranking(monkeypatch):
    """
    **The v1 regression.**

    v1 overwrote `score` with the lexical-blended value and the caller then
    compared that against RETRIEVAL_CONFIDENT_SCORE — a threshold calibrated
    for raw cosine. Blending drags the number down, so strongly-grounded
    results were misread as weak and the model was told to hedge on answers it
    should have stated plainly.
    """
    monkeypatch.setattr(settings, "RETRIEVAL_ENABLE_RERANK", True)
    monkeypatch.setattr(settings, "RERANK_LEXICAL_WEIGHT", 0.8)

    # High similarity, zero lexical overlap with the query.
    hits = [_hit(0.92, "Wholly unrelated prose about unrelated subjects", "h")]
    result = rerank("crestron control systems", hits)

    assert result[0]["_vector_score"] == pytest.approx(0.92)
    assert result[0]["_rerank_score"] < 0.92  # blending did lower the ordering score
    # The confidence signal must still read as confident.
    assert top_vector_score(result) >= settings.RETRIEVAL_CONFIDENT_SCORE


def test_exact_phrase_match_earns_a_bonus(monkeypatch):
    monkeypatch.setattr(settings, "RETRIEVAL_ENABLE_RERANK", True)
    monkeypatch.setattr(settings, "RERANK_LEXICAL_WEIGHT", 0.5)

    exact = _hit(0.5, "The DM NVX 363 encoder supports 4K60 video.", "exact")
    scattered = _hit(0.5, "NVX. Separately, 363 units. Elsewhere, DM racks.", "scattered")

    result = rerank("dm nvx 363", [scattered, exact])
    assert result[0]["id"] == "exact"


def test_empty_hits_returns_empty():
    assert rerank("anything", []) == []


def test_top_vector_score_of_empty_list_is_zero():
    assert top_vector_score([]) == 0.0
