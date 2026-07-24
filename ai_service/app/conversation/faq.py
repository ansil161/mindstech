"""
Structured company FAQ layer.

Questions with exactly one correct answer — "what's your email?", "where are
you based?", "who runs the company?" — must not depend on whether somebody
happened to ingest a document phrased that way. In v1 they did, which is why
the same question could work one day and return "I don't have details on that
specific request" the next.

Entries are matched deterministically against config/faq.yaml and returned
verbatim, bypassing both retrieval and generation. That also means the answer
cannot be embellished by a model, which is the point: these are facts, not
prose to be regenerated.

Anything below FAQ_MIN_CONFIDENCE falls through to normal retrieval, so the
layer can only ever add precision, never block a legitimate search.
"""
from __future__ import annotations

import logging
import re
import threading
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Pattern

import yaml

from app.conversation.rules import normalize
from app.core.config import settings

logger = logging.getLogger(__name__)

_TOKEN_RE = re.compile(r"[a-z0-9]+")


@dataclass
class FAQEntry:
    """One canonical question/answer pair with its matching signals."""

    id: str
    answer: str
    patterns: List[Pattern[str]] = field(default_factory=list)
    keywords: List[str] = field(default_factory=list)
    # Conversational subject this entry establishes. Without it, a "tell me
    # more" straight after an FAQ answer has no topic to continue and the
    # assistant has to ask the user to repeat themselves.
    topic: Optional[str] = None

    def score(self, normalized_message: str, tokens: set[str]) -> float:
        """
        Blended match confidence in [0, 1].

        A regex hit is the dominant signal (0.75 floor) because the patterns
        encode actual question shapes. Keyword coverage refines the ranking
        between entries that both matched, and can carry a weaker entry over
        the threshold on its own when the wording is unmistakable.
        """
        pattern_hit = any(p.search(normalized_message) for p in self.patterns)

        keyword_score = 0.0
        if self.keywords:
            present = sum(1 for kw in self.keywords if kw in tokens)
            keyword_score = present / len(self.keywords)

        if pattern_hit:
            return min(1.0, 0.75 + 0.25 * keyword_score)
        # Keyword-only matches need broad coverage to fire, so a single
        # incidental word ("contact" inside a product question) can't hijack
        # a genuine retrieval query.
        return keyword_score * 0.8 if keyword_score >= 0.6 else keyword_score * 0.5


@dataclass
class FAQMatch:
    entry_id: str
    answer: str
    confidence: float
    topic: Optional[str] = None


class FAQLayer:
    """Lazily-loaded, thread-safe FAQ matcher."""

    def __init__(self, path: Optional[str] = None) -> None:
        self._path = Path(path or settings.FAQ_FILE)
        self._entries: Optional[List[FAQEntry]] = None
        self._lock = threading.Lock()

    def _load(self) -> List[FAQEntry]:
        if self._entries is not None:
            return self._entries
        with self._lock:
            if self._entries is not None:
                return self._entries
            entries: List[FAQEntry] = []
            try:
                candidates = [self._path, Path(__file__).resolve().parents[2] / self._path]
                source = next((c for c in candidates if c.is_file()), None)
                if source is None:
                    logger.warning(
                        "FAQ file not found; structured FAQ layer disabled.",
                        extra={"faq_path": str(self._path)},
                    )
                else:
                    raw: Dict[str, Any] = yaml.safe_load(source.read_text(encoding="utf-8")) or {}
                    for item in raw.get("entries", []) or []:
                        entry = self._build_entry(item)
                        if entry is not None:
                            entries.append(entry)
                    logger.info(
                        "Loaded structured FAQ layer",
                        extra={"faq_path": str(source), "faq_entries": len(entries)},
                    )
            except Exception as exc:  # noqa: BLE001 - a bad FAQ file must not break chat
                logger.exception("Failed to load FAQ file; continuing without it: %s", exc)
                entries = []

            self._entries = entries
            return self._entries

    @staticmethod
    def _build_entry(item: Dict[str, Any]) -> Optional[FAQEntry]:
        answer = (item.get("answer") or "").strip()
        entry_id = (item.get("id") or "").strip()
        if not answer or not entry_id:
            logger.warning("Skipping FAQ entry with no id or answer.")
            return None

        patterns: List[Pattern[str]] = []
        for raw_pattern in item.get("patterns", []) or []:
            try:
                patterns.append(re.compile(raw_pattern, re.IGNORECASE))
            except re.error as exc:
                # One malformed pattern shouldn't discard the whole entry.
                logger.error("Invalid FAQ regex in '%s' (%s): %s", entry_id, raw_pattern, exc)

        keywords = [str(k).strip().lower() for k in item.get("keywords", []) or [] if str(k).strip()]
        topic = (item.get("topic") or "").strip() or None
        return FAQEntry(
            id=entry_id, answer=answer, patterns=patterns, keywords=keywords, topic=topic
        )

    def reload(self) -> None:
        with self._lock:
            self._entries = None

    @property
    def entry_count(self) -> int:
        return len(self._load())

    def match(self, message: str, min_confidence: Optional[float] = None) -> Optional[FAQMatch]:
        """
        Returns the best-scoring entry above the confidence floor, or None.

        Returning None is the normal, expected outcome for most messages — the
        caller then proceeds to retrieval as usual.
        """
        if not settings.ENABLE_FAQ_LAYER:
            return None

        entries = self._load()
        if not entries:
            return None

        normalized = normalize(message)
        if not normalized:
            return None

        tokens = set(_TOKEN_RE.findall(normalized))
        threshold = min_confidence if min_confidence is not None else settings.FAQ_MIN_CONFIDENCE

        best: Optional[FAQMatch] = None
        for entry in entries:
            confidence = entry.score(normalized, tokens)
            if confidence >= threshold and (best is None or confidence > best.confidence):
                best = FAQMatch(
                    entry_id=entry.id,
                    answer=entry.answer,
                    confidence=confidence,
                    topic=entry.topic,
                )

        if best is not None:
            logger.info(
                "FAQ layer answered directly",
                extra={"faq_entry": best.entry_id, "faq_confidence": round(best.confidence, 3)},
            )
        return best


faq_layer = FAQLayer()
