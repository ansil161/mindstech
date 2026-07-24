"""
Recursive character text splitter.

**Why this is hand-rolled.** v1 used `langchain_text_splitters`, whose package
`__init__` imports `langchain_text_splitters.sentence_transformers`, which
imports the entire `transformers` library. Measured cold-import cost on this
service: ~27 seconds, plus several hundred MB of wheels in the image — all to
split strings on paragraph boundaries. That cost was paid on every worker boot
and therefore on every deploy, restart and autoscale event.

The algorithm is the standard recursive one and is intentionally identical in
behaviour: try to split on the most semantically meaningful separator that
produces small-enough pieces, recurse into anything still too large, then glue
adjacent pieces back together up to the chunk size with a trailing overlap.

Length is measured with a caller-supplied function so the same chars/4 token
heuristic used elsewhere in the service applies here too.
"""
from __future__ import annotations

import logging
from typing import Callable, List, Sequence

logger = logging.getLogger(__name__)

# Ordered most- to least-semantic. Splitting on "" (every character) is the
# last resort for pathological input such as a single unbroken token.
DEFAULT_SEPARATORS: Sequence[str] = ("\n\n", "\n", ". ", "! ", "? ", "; ", ", ", " ", "")


def _default_length(text: str) -> int:
    return len(text)


class RecursiveCharacterChunker:
    """Splits text into overlapping chunks at natural boundaries."""

    def __init__(
        self,
        chunk_size: int,
        chunk_overlap: int = 0,
        separators: Sequence[str] = DEFAULT_SEPARATORS,
        length_function: Callable[[str], int] = _default_length,
    ) -> None:
        if chunk_size <= 0:
            raise ValueError("chunk_size must be positive.")
        if chunk_overlap < 0:
            raise ValueError("chunk_overlap must not be negative.")
        if chunk_overlap >= chunk_size:
            # Overlap >= size means every chunk re-emits the previous one in
            # full, which never advances and would loop forever.
            raise ValueError("chunk_overlap must be smaller than chunk_size.")

        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.separators = list(separators)
        self.length = length_function

    # -- public ------------------------------------------------------------
    def split_text(self, text: str) -> List[str]:
        if not text or not text.strip():
            return []
        chunks = self._split(text, self.separators)
        return [chunk for chunk in (c.strip() for c in chunks) if chunk]

    # -- internals ---------------------------------------------------------
    def _split(self, text: str, separators: List[str]) -> List[str]:
        if self.length(text) <= self.chunk_size:
            return [text]

        separator, remaining = self._choose_separator(text, separators)
        pieces = self._split_on(text, separator)

        final: List[str] = []
        buffer: List[str] = []

        for piece in pieces:
            if self.length(piece) > self.chunk_size:
                # Flush what we have, then recurse into the oversized piece
                # using the next (finer) separator.
                if buffer:
                    final.extend(self._merge(buffer, separator))
                    buffer = []
                if remaining:
                    final.extend(self._split(piece, remaining))
                else:
                    # No separator left; hard-cut so one pathological token
                    # can't produce a chunk that blows the embedding limit.
                    final.extend(self._hard_split(piece))
            else:
                buffer.append(piece)

        if buffer:
            final.extend(self._merge(buffer, separator))

        return final

    def _choose_separator(self, text: str, separators: List[str]) -> tuple[str, List[str]]:
        """Picks the most semantic separator actually present in `text`."""
        for index, separator in enumerate(separators):
            if separator == "":
                return separator, []
            if separator in text:
                return separator, separators[index + 1 :]
        return separators[-1] if separators else "", []

    @staticmethod
    def _split_on(text: str, separator: str) -> List[str]:
        if separator == "":
            return list(text)
        # The separator is kept on the preceding piece so sentences retain
        # their punctuation when chunks are re-joined.
        parts = text.split(separator)
        pieces = [part + separator for part in parts[:-1]]
        if parts[-1]:
            pieces.append(parts[-1])
        return [p for p in pieces if p]

    def _hard_split(self, text: str) -> List[str]:
        """Character-window fallback for text with no usable separator."""
        chunks: List[str] = []
        step = max(1, self.chunk_size - self.chunk_overlap)
        # Convert the token budget back to characters via the caller's own
        # length function, so the heuristic stays consistent.
        approx_chars = max(1, int(len(text) * self.chunk_size / max(1, self.length(text))))
        stride = max(1, int(approx_chars * step / max(1, self.chunk_size)))
        for start in range(0, len(text), stride):
            piece = text[start : start + approx_chars]
            if piece:
                chunks.append(piece)
            if start + approx_chars >= len(text):
                break
        return chunks

    def _merge(self, pieces: List[str], separator: str) -> List[str]:
        """
        Greedily packs pieces into chunks up to chunk_size, carrying a tail of
        the previous chunk forward as overlap so a fact split across a boundary
        remains retrievable from at least one chunk.
        """
        merged: List[str] = []
        current: List[str] = []
        current_length = 0

        for piece in pieces:
            piece_length = self.length(piece)
            if current and current_length + piece_length > self.chunk_size:
                merged.append("".join(current))
                current, current_length = self._carry_overlap(current)
            current.append(piece)
            current_length += piece_length

        if current:
            merged.append("".join(current))
        return merged

    def _carry_overlap(self, current: List[str]) -> tuple[List[str], int]:
        """Returns the trailing pieces of `current` that fit in the overlap budget."""
        if self.chunk_overlap == 0:
            return [], 0
        carried: List[str] = []
        carried_length = 0
        for piece in reversed(current):
            piece_length = self.length(piece)
            if carried_length + piece_length > self.chunk_overlap:
                break
            carried.insert(0, piece)
            carried_length += piece_length
        return carried, carried_length
