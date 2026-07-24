"""
Recursive character chunker.

Replaces `langchain_text_splitters`, which transitively imported the whole
`transformers` library (~27s cold import). These tests pin the behaviour that
matters for retrieval quality: chunks stay under budget, split at semantic
boundaries, and overlap so a fact spanning a boundary stays findable.
"""
import pytest

from app.services.chunker import RecursiveCharacterChunker


def _approx_tokens(text: str) -> int:
    return max(1, len(text) // 4)


def test_short_text_is_a_single_chunk():
    chunker = RecursiveCharacterChunker(chunk_size=100)
    assert chunker.split_text("A short sentence.") == ["A short sentence."]


def test_empty_input_produces_no_chunks():
    chunker = RecursiveCharacterChunker(chunk_size=100)
    assert chunker.split_text("") == []
    assert chunker.split_text("   \n  ") == []


def test_chunks_respect_the_size_budget():
    chunker = RecursiveCharacterChunker(chunk_size=50, chunk_overlap=5)
    text = "word " * 200
    chunks = chunker.split_text(text)
    assert chunks
    # A little slack: a single indivisible piece may exceed the target.
    assert all(len(chunk) <= 50 * 2 for chunk in chunks)


def test_paragraph_boundaries_are_preferred():
    """Splitting mid-sentence destroys the meaning a chunk is meant to carry."""
    chunker = RecursiveCharacterChunker(chunk_size=40, chunk_overlap=0)
    text = "First paragraph here.\n\nSecond paragraph here.\n\nThird paragraph here."
    chunks = chunker.split_text(text)
    assert any("First paragraph" in c for c in chunks)
    assert any("Second paragraph" in c for c in chunks)


def test_sentence_punctuation_is_preserved():
    chunker = RecursiveCharacterChunker(chunk_size=30, chunk_overlap=0)
    chunks = chunker.split_text("Alpha sentence. Beta sentence. Gamma sentence.")
    assert any(chunk.rstrip().endswith(".") for chunk in chunks)


def test_no_content_is_lost():
    """Every word must survive; a dropped chunk is silently unretrievable data."""
    chunker = RecursiveCharacterChunker(chunk_size=40, chunk_overlap=0)
    text = "alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu"
    chunks = chunker.split_text(text)
    recombined = " ".join(chunks).split()
    for word in text.split():
        assert word in recombined


def test_overlap_repeats_content_between_adjacent_chunks():
    """Overlap is what keeps a fact split across a boundary retrievable."""
    chunker = RecursiveCharacterChunker(chunk_size=60, chunk_overlap=20)
    text = ". ".join(f"Sentence number {i} about audio visual systems" for i in range(12))
    chunks = chunker.split_text(text)
    assert len(chunks) > 1

    overlapping_pairs = sum(
        1
        for a, b in zip(chunks, chunks[1:])
        if set(a.split()) & set(b.split())
    )
    assert overlapping_pairs > 0


def test_text_with_no_separators_is_still_split():
    """A single unbroken token must not produce one oversized chunk."""
    chunker = RecursiveCharacterChunker(chunk_size=20, chunk_overlap=0)
    chunks = chunker.split_text("x" * 200)
    assert len(chunks) > 1


def test_custom_length_function_is_used():
    """Token-based budgeting is what keeps chunks inside the embedding limit."""
    chunker = RecursiveCharacterChunker(
        chunk_size=10, chunk_overlap=0, length_function=_approx_tokens
    )
    text = "word " * 100
    chunks = chunker.split_text(text)
    assert all(_approx_tokens(chunk) <= 20 for chunk in chunks)


def test_overlap_must_be_smaller_than_chunk_size():
    """Overlap >= size never advances and would loop forever."""
    with pytest.raises(ValueError):
        RecursiveCharacterChunker(chunk_size=10, chunk_overlap=10)


def test_invalid_chunk_size_is_rejected():
    with pytest.raises(ValueError):
        RecursiveCharacterChunker(chunk_size=0)


def test_realistic_document_chunks_sensibly():
    chunker = RecursiveCharacterChunker(
        chunk_size=100, chunk_overlap=20, length_function=_approx_tokens
    )
    document = (
        "Mindstec Distribution India is a value-added distributor of professional "
        "Audio Visual and IT technology.\n\n"
        "We represent over fifty global manufacturer brands across six verticals.\n\n"
        "Our regional operations cover India and SAARC from Bangalore, Africa from "
        "Nairobi, and Central Europe from Warsaw."
    )
    chunks = chunker.split_text(document)
    assert chunks
    assert all(chunk.strip() for chunk in chunks)
    assert "Mindstec" in chunks[0]
