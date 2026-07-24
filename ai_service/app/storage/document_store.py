"""
Local metadata cache for ingested documents.

Scope note: this is a per-worker convenience cache, not a system of record —
Django's database holds the authoritative document metadata, and Qdrant holds
the chunks. It exists so ingestion can answer "how many chunks did this
produce" without a round-trip.

Bounded (LRU) because v1 used a plain dict keyed by caller-supplied document
ids, which grew without limit for the lifetime of the process.
"""
from __future__ import annotations

import logging
import threading
from collections import OrderedDict
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

_DEFAULT_MAX_ENTRIES = 5_000


class DocumentStore:
    """Thread-safe, size-bounded document metadata map."""

    def __init__(self, max_entries: int = _DEFAULT_MAX_ENTRIES) -> None:
        self._store: "OrderedDict[str, Dict[str, Any]]" = OrderedDict()
        self._max_entries = max_entries
        self._lock = threading.Lock()

    def save_document(self, doc_id: str, document: Dict[str, Any]) -> None:
        with self._lock:
            self._store[doc_id] = document
            self._store.move_to_end(doc_id)
            while len(self._store) > self._max_entries:
                evicted, _ = self._store.popitem(last=False)
                logger.debug("Evicted document metadata for %s (cache full).", evicted)

    def get_document(self, doc_id: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            document = self._store.get(doc_id)
            if document is not None:
                self._store.move_to_end(doc_id)
            return document

    def delete_document(self, doc_id: str) -> None:
        with self._lock:
            if self._store.pop(doc_id, None) is not None:
                logger.info("Deleted local metadata record", extra={"document_id": doc_id})

    def clear(self) -> None:
        with self._lock:
            self._store.clear()

    def __len__(self) -> int:
        with self._lock:
            return len(self._store)


document_store = DocumentStore()
