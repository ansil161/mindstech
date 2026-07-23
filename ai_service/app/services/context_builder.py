"""
Turns a list of raw retrieval hits into the final, deduplicated, diverse,
token-budgeted context block handed to the LLM.

Kept separate from RAGOrchestrator (app/services/rag.py) so retrieval
*fetching* and context *shaping* stay single-responsibility and independently
testable, per the "avoid near-identical chunks / preserve document order /
merge neighboring chunks / limit by tokens" requirements.
"""
import logging
import re
from dataclasses import dataclass, field
from typing import Any, Dict, List

from app.core.config import settings
from app.models.rag import RAGCitation

logger = logging.getLogger(__name__)

_WHITESPACE_RE = re.compile(r"\s+")


def _approx_token_count(text: str) -> int:
    """Same chars/4 heuristic already used elsewhere in this codebase for
    context token estimation (see the original token_count calculation this
    replaces) — deliberately not a real tokenizer, to avoid a new dependency."""
    return max(1, len(text) // 4)


def _normalize_for_similarity(text: str) -> str:
    return _WHITESPACE_RE.sub(" ", text).strip().lower()


def _shingles(text: str, n: int = 5) -> set:
    words = text.split()
    if len(words) < n:
        return {text}
    return {" ".join(words[i:i + n]) for i in range(len(words) - n + 1)}


def _similarity(a: str, b: str) -> float:
    """Cheap Jaccard similarity over word shingles — good enough to catch
    near-duplicate chunks (e.g. the same paragraph retrieved twice via
    overlapping chunk windows) without any ML dependency."""
    sa, sb = _shingles(a), _shingles(b)
    if not sa or not sb:
        return 0.0
    return len(sa & sb) / len(sa | sb)


@dataclass
class ContextEntry:
    document_id: str
    title: str
    source: str
    chunk_index: Any
    content: str
    score: float
    version: Any = None


@dataclass
class BuiltContext:
    context: str
    citations: List[RAGCitation]
    token_count: int
    included_chunks: int
    dropped_duplicate: int = 0
    dropped_diversity: int = 0
    dropped_budget: int = 0


def _dedupe(entries: List[ContextEntry]) -> "tuple[List[ContextEntry], int]":
    """Drops near-duplicate chunks (by content similarity), always keeping
    the higher-scoring copy. Entries must already be sorted by score desc."""
    kept: List[ContextEntry] = []
    dropped = 0
    threshold = settings.RETRIEVAL_DEDUP_SIMILARITY_THRESHOLD
    normalized_kept = []
    for entry in entries:
        norm = _normalize_for_similarity(entry.content)
        is_dupe = any(_similarity(norm, existing) >= threshold for existing in normalized_kept)
        if is_dupe:
            dropped += 1
            continue
        kept.append(entry)
        normalized_kept.append(norm)
    return kept, dropped


def _apply_diversity_cap(entries: List[ContextEntry]) -> "tuple[List[ContextEntry], int]":
    """Keeps at most RETRIEVAL_MAX_CHUNKS_PER_DOCUMENT chunks from any single
    document, preferring the highest-scoring ones for that document. Entries
    must already be sorted by score desc."""
    cap = settings.RETRIEVAL_MAX_CHUNKS_PER_DOCUMENT
    per_doc_count: Dict[str, int] = {}
    kept: List[ContextEntry] = []
    dropped = 0
    for entry in entries:
        count = per_doc_count.get(entry.document_id, 0)
        if count >= cap:
            dropped += 1
            continue
        per_doc_count[entry.document_id] = count + 1
        kept.append(entry)
    return kept, dropped


def _merge_neighbors(entries: List[ContextEntry]) -> List[ContextEntry]:
    """Merges chunks that are adjacent within the same source document
    (consecutive chunk_index) into a single, more coherent context entry
    instead of presenting them as separate fragments. Groups are then
    ordered by document, and within a document by chunk_index ascending, so
    the merged text reads in the original document order."""
    by_doc: Dict[str, List[ContextEntry]] = {}
    for entry in entries:
        by_doc.setdefault(entry.document_id, []).append(entry)

    merged: List[ContextEntry] = []
    for doc_id, doc_entries in by_doc.items():
        def _sort_key(e: ContextEntry):
            try:
                return (0, int(e.chunk_index))
            except (TypeError, ValueError):
                return (1, 0)

        doc_entries.sort(key=_sort_key)

        run: List[ContextEntry] = []
        for entry in doc_entries:
            if run:
                try:
                    is_adjacent = int(entry.chunk_index) == int(run[-1].chunk_index) + 1
                except (TypeError, ValueError):
                    is_adjacent = False
            else:
                is_adjacent = False

            if run and is_adjacent:
                run.append(entry)
            else:
                if run:
                    merged.append(_combine_run(run))
                run = [entry]
        if run:
            merged.append(_combine_run(run))

    # Highest-scoring merged entry first, so the token-budget truncation step
    # drops the least relevant material first.
    merged.sort(key=lambda e: e.score, reverse=True)
    return merged


def _combine_run(run: List[ContextEntry]) -> ContextEntry:
    if len(run) == 1:
        return run[0]
    combined_text = "\n".join(e.content for e in run)
    best_score = max(e.score for e in run)
    first = run[0]
    return ContextEntry(
        document_id=first.document_id,
        title=first.title,
        source=first.source,
        chunk_index=first.chunk_index,
        content=combined_text,
        score=best_score,
        version=first.version,
    )


def _truncate_to_token_budget(entries: List[ContextEntry]) -> "tuple[List[ContextEntry], int]":
    """Entries are expected sorted by score desc; keeps the highest-scoring
    entries that fit within RETRIEVAL_MAX_CONTEXT_TOKENS."""
    budget = settings.RETRIEVAL_MAX_CONTEXT_TOKENS
    kept: List[ContextEntry] = []
    used = 0
    dropped = 0
    for entry in entries:
        cost = _approx_token_count(entry.content)
        if kept and used + cost > budget:
            dropped += 1
            continue
        kept.append(entry)
        used += cost
    return kept, dropped


def build_context(hits: List[Dict[str, Any]]) -> BuiltContext:
    """
    Full pipeline: raw Qdrant hits -> deduplicated, diverse, neighbor-merged,
    document-ordered, token-budgeted context block + citation list.
    """
    entries: List[ContextEntry] = []
    for hit in hits:
        payload = hit.get("payload") or {}
        entries.append(ContextEntry(
            document_id=str(payload.get("document_id", hit.get("id"))),
            title=payload.get("title", "Untitled Document"),
            source=payload.get("source", ""),
            chunk_index=payload.get("chunk_index"),
            content=payload.get("content", ""),
            score=float(hit.get("score", 0.0)),
            version=payload.get("version"),
        ))

    # Highest score first throughout, so every subsequent step naturally
    # prefers the most relevant material when something has to be dropped.
    entries.sort(key=lambda e: e.score, reverse=True)

    entries, dropped_duplicate = _dedupe(entries)
    entries, dropped_diversity = _apply_diversity_cap(entries)
    entries = entries[: settings.RETRIEVAL_MAX_CONTEXT_CHUNKS]
    entries = _merge_neighbors(entries)
    entries, dropped_budget = _truncate_to_token_budget(entries)

    context_parts = []
    citations: List[RAGCitation] = []
    seen_citations = set()
    for entry in entries:
        context_parts.append(f"Document [{entry.title}]:\n{entry.content}\n")
        citation_key = (entry.document_id, entry.title)
        if citation_key not in seen_citations:
            seen_citations.add(citation_key)
            citations.append(RAGCitation(
                document_id=entry.document_id,
                document_name=entry.title,
                source=entry.source,
            ))

    compiled_context = "\n".join(context_parts)

    result = BuiltContext(
        context=compiled_context,
        citations=citations,
        token_count=_approx_token_count(compiled_context) if compiled_context else 0,
        included_chunks=len(entries),
        dropped_duplicate=dropped_duplicate,
        dropped_diversity=dropped_diversity,
        dropped_budget=dropped_budget,
    )

    logger.info(
        "Context assembly: %d chunks included, %d duplicate(s) dropped, "
        "%d dropped for diversity, %d dropped for token budget, ~%d tokens",
        result.included_chunks, result.dropped_duplicate,
        result.dropped_diversity, result.dropped_budget, result.token_count,
    )

    return result
