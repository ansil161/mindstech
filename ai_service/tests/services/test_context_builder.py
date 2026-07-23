from app.services.context_builder import build_context
from app.core.config import settings


def _hit(score, content, document_id="doc1", chunk_index=0, title="Doc"):
    return {
        "id": f"{document_id}_{chunk_index}",
        "score": score,
        "payload": {
            "document_id": document_id,
            "title": title,
            "content": content,
            "chunk_index": chunk_index,
            "source": "",
        },
    }


def _relax_all_limits(monkeypatch):
    """Widens every context_builder limit so a test can isolate the one
    behavior it actually wants to exercise."""
    monkeypatch.setattr(settings, "RETRIEVAL_DEDUP_SIMILARITY_THRESHOLD", 0.999)
    monkeypatch.setattr(settings, "RETRIEVAL_MAX_CHUNKS_PER_DOCUMENT", 100)
    monkeypatch.setattr(settings, "RETRIEVAL_MAX_CONTEXT_CHUNKS", 100)
    monkeypatch.setattr(settings, "RETRIEVAL_MAX_CONTEXT_TOKENS", 100000)


def test_near_duplicate_chunks_are_deduplicated(monkeypatch):
    _relax_all_limits(monkeypatch)
    monkeypatch.setattr(settings, "RETRIEVAL_DEDUP_SIMILARITY_THRESHOLD", 0.9)

    text = "Mindstec distributes Crestron control systems across India, Africa and Poland for enterprise clients."
    hits = [
        _hit(0.9, text, document_id="a", chunk_index=0),
        _hit(0.85, text, document_id="a", chunk_index=5),  # same content, different chunk
    ]

    result = build_context(hits)

    assert result.included_chunks == 1
    assert result.dropped_duplicate == 1


def test_diversity_cap_limits_chunks_from_one_document(monkeypatch):
    _relax_all_limits(monkeypatch)
    monkeypatch.setattr(settings, "RETRIEVAL_MAX_CHUNKS_PER_DOCUMENT", 1)

    hits = [
        _hit(0.9, "First distinct paragraph about audio systems and DSPs.", document_id="a", chunk_index=0),
        _hit(0.8, "Second distinct paragraph about video walls and LED displays.", document_id="a", chunk_index=3),
        _hit(0.7, "Third distinct paragraph from an entirely different document.", document_id="b", chunk_index=0),
    ]

    result = build_context(hits)

    assert result.included_chunks == 2  # 1 kept from doc "a" (capped) + 1 from doc "b"
    assert result.dropped_diversity == 1


def test_adjacent_chunks_from_same_document_are_merged(monkeypatch):
    _relax_all_limits(monkeypatch)

    hits = [
        _hit(0.9, "Part one of the installation guide.", document_id="a", chunk_index=0),
        _hit(0.8, "Part two of the installation guide.", document_id="a", chunk_index=1),
    ]

    result = build_context(hits)

    assert result.included_chunks == 1
    assert "Part one" in result.context
    assert "Part two" in result.context


def test_non_adjacent_chunks_from_same_document_are_not_merged(monkeypatch):
    _relax_all_limits(monkeypatch)

    hits = [
        _hit(0.9, "Section about pricing.", document_id="a", chunk_index=0),
        _hit(0.8, "Unrelated section about warranty terms, far later in the document.", document_id="a", chunk_index=9),
    ]

    result = build_context(hits)

    assert result.included_chunks == 2


def test_token_budget_keeps_highest_scoring_entries_first(monkeypatch):
    _relax_all_limits(monkeypatch)

    long_text_a = "Alpha content sentence. " * 60
    long_text_b = "Beta content sentence. " * 60
    budget = (len(long_text_a) // 4) + 5  # room for exactly one of the two
    monkeypatch.setattr(settings, "RETRIEVAL_MAX_CONTEXT_TOKENS", budget)

    hits = [
        _hit(0.9, long_text_a, document_id="a", chunk_index=0),
        _hit(0.1, long_text_b, document_id="b", chunk_index=0),
    ]

    result = build_context(hits)

    assert result.included_chunks == 1
    assert "Alpha" in result.context
    assert "Beta" not in result.context
    assert result.dropped_budget == 1


def test_empty_hits_produce_empty_context(monkeypatch):
    _relax_all_limits(monkeypatch)
    result = build_context([])
    assert result.included_chunks == 0
    assert result.context == ""
    assert result.citations == []
