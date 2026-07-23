from app.services.reranker import rerank
from app.core.config import settings


def _hit(score, content, id_=1):
    return {"id": id_, "score": score, "payload": {"content": content, "title": "Doc"}}


def test_rerank_disabled_returns_hits_unchanged(monkeypatch):
    monkeypatch.setattr(settings, "RETRIEVAL_ENABLE_RERANK", False)
    hits = [_hit(0.5, "irrelevant text"), _hit(0.9, "also irrelevant")]
    result = rerank("crestron control systems", hits)
    assert result == hits


def test_rerank_promotes_lexically_relevant_chunk_over_pure_vector_score(monkeypatch):
    monkeypatch.setattr(settings, "RETRIEVAL_ENABLE_RERANK", True)
    monkeypatch.setattr(settings, "RERANK_LEXICAL_WEIGHT", 0.8)

    low_vector_high_overlap = _hit(0.31, "Crestron control systems pricing and specifications", id_="relevant")
    high_vector_low_overlap = _hit(0.90, "Completely unrelated audio cable documentation", id_="irrelevant")

    result = rerank(
        "crestron control systems pricing",
        [high_vector_low_overlap, low_vector_high_overlap],
    )

    assert result[0]["id"] == "relevant"


def test_rerank_does_not_mutate_input_list(monkeypatch):
    monkeypatch.setattr(settings, "RETRIEVAL_ENABLE_RERANK", True)
    hits = [_hit(0.5, "some content", id_=1)]
    original_score = hits[0]["score"]
    rerank("some content", hits)
    assert hits[0]["score"] == original_score
