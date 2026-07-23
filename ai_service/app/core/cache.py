"""
Minimal dependency-free TTL+LRU cache.

Deliberately hand-rolled instead of pulling in a library (e.g. cachetools) —
this service is kept intentionally dependency-light (see embedder.py's own
docstring about running on a free-tier host), and the need here is small
enough that ~40 lines of plain Python covers it without adding a package.
"""
import time
import logging
import threading
from collections import OrderedDict
from typing import Any, Optional

logger = logging.getLogger(__name__)


class TTLCache:
    """
    A thread-safe, in-process cache with both a max size (LRU eviction) and a
    per-entry time-to-live. Suitable for caching repeated embedding calls or
    vector-search results within a single worker process — NOT a distributed
    cache, so it offers no benefit across multiple workers/processes, but it's
    free and requires no extra infrastructure.
    """

    def __init__(self, max_size: int = 256, ttl_seconds: int = 300):
        self.max_size = max_size
        self.ttl_seconds = ttl_seconds
        self._store: "OrderedDict[str, tuple[float, Any]]" = OrderedDict()
        self._lock = threading.Lock()
        self.hits = 0
        self.misses = 0

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                self.misses += 1
                return None
            expires_at, value = entry
            if time.time() >= expires_at:
                del self._store[key]
                self.misses += 1
                return None
            self._store.move_to_end(key)
            self.hits += 1
            return value

    def set(self, key: str, value: Any) -> None:
        with self._lock:
            self._store[key] = (time.time() + self.ttl_seconds, value)
            self._store.move_to_end(key)
            while len(self._store) > self.max_size:
                self._store.popitem(last=False)

    def clear(self) -> None:
        with self._lock:
            self._store.clear()
