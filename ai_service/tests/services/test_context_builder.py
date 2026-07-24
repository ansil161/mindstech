"""
Context assembly: dedup, per-document diversity, neighbour merging and the
token budget.
"""
from app.core.config import settings
from app.services.context_builder import build_context


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
    """Widens every limit so a test can isolate the one behaviour it targets."""
    monkeypatch.setattr(settings, "RETRIEVAL_DEDUP_SIMILARITY_THRESHOLD", 0.999)
    monkeypatch.setattr(settings, "RETRIEVAL_MAX_CHUNKS_PER_DOCUMENT", 100)
    monkeypatch.setattr(settings, "RETRIEVAL_MAX_CONTEXT_CHUNKS", 100)
    monkeypatch.setattr(settings, "RETRIEVAL_MAX_CONTEXT_TOKENS", 100000)


def test_near_duplicate_chunks_are_deduplicated(monkeypatch):
    """Overlapping chunk windows routinely retrieve the same paragraph twice."""
    _relax_all_limits(monkeypatch)
    monkeypatch.setattr(settings, "RETRIEVAL_DEDUP_SIMILARITY_THRESHOLD", 0.9)

    text = "Mindstec distributes Crestron control systems across India, Africa and Poland."
    result = build_context(
        [
            _hit(0.9, text, document_id="a", chunk_index=0),
            _hit(0.85, text, document_id="a", chunk_index=5),
        ]
    )

    assert result.included_chunks == 1
    assert result.dropped_duplicate == 1


def test_diversity_cap_limits_chunks_from_one_document(monkeypatch):
    """Stops one long document from crowding out every other source."""
    _relax_all_limits(monkeypatch)
    monkeypatch.setattr(settings, "RETRIEVAL_MAX_CHUNKS_PER_DOCUMENT", 1)

    result = build_context(
        [
            _hit(0.9, "First paragraph about audio systems and DSPs.", "a", 0),
            _hit(0.8, "Second paragraph about video walls and LED displays.", "a", 3),
            _hit(0.7, "Third paragraph from an entirely different document.", "b", 0),
        ]
    )

    assert result.included_chunks == 2
    assert result.dropped_diversity == 1


def test_adjacent_chunks_from_the_same_document_are_merged(monkeypatch):
    _relax_all_limits(monkeypatch)
    result = build_context(
        [
            _hit(0.9, "Part one of the installation guide.", "a", 0),
            _hit(0.8, "Part two of the installation guide.", "a", 1),
        ]
    )
    assert result.included_chunks == 1
    assert "Part one" in result.context and "Part two" in result.context


def test_non_adjacent_chunks_are_not_merged(monkeypatch):
    _relax_all_limits(monkeypatch)
    result = build_context(
        [
            _hit(0.9, "Section about pricing.", "a", 0),
            _hit(0.8, "Unrelated section about warranty terms.", "a", 9),
        ]
    )
    assert result.included_chunks == 2


def test_token_budget_keeps_the_highest_scoring_entries(monkeypatch):
    _relax_all_limits(monkeypatch)
    long_a = "Alpha content sentence. " * 60
    long_b = "Beta content sentence. " * 60
    monkeypatch.setattr(settings, "RETRIEVAL_MAX_CONTEXT_TOKENS", (len(long_a) // 4) + 5)

    result = build_context([_hit(0.9, long_a, "a", 0), _hit(0.1, long_b, "b", 0)])

    assert result.included_chunks == 1
    assert "Alpha" in result.context and "Beta" not in result.context
    assert result.dropped_budget == 1


def test_empty_hits_produce_empty_context(monkeypatch):
    _relax_all_limits(monkeypatch)
    result = build_context([])
    assert result.included_chunks == 0
    assert result.context == ""
    assert result.citations == []


def test_citations_are_deduplicated_per_document(monkeypatch):
    """Two chunks from one document should cite it once, not twice."""
    _relax_all_limits(monkeypatch)
    result = build_context(
        [
            _hit(0.9, "Distinct passage about pricing structures.", "a", 0),
            _hit(0.8, "Different passage about warranty coverage.", "a", 7),
        ]
    )
    assert len(result.citations) == 1
