"""
Transport-level security for the internal API: bearer-token authentication
and per-conversation rate limiting.

The token comparison is constant-time. A naive `!=` on a secret leaks its
length and prefix through response timing, which is a real (if slow) offline
attack against an endpoint an attacker can call repeatedly.
"""
from __future__ import annotations

import hmac
import logging
import os
import threading
import time
from collections import OrderedDict
from typing import Optional, Tuple

from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings

logger = logging.getLogger(__name__)

security_scheme = HTTPBearer(auto_error=False)


def _get_api_key() -> str:
    """
    Resolves the expected API key at request time.

    Precedence is live environment first, then settings (which is what loads
    `.env`). Environment-first preserves hot rotation by an orchestrator with
    no restart; the settings fallback fixes the v1 behaviour where a key
    present only in `.env` was invisible here — pydantic-settings reads that
    file into Settings, it does not export into os.environ — so local runs
    rejected every request with 503 while Docker (whose env_file does export)
    worked fine.
    """
    key = (os.getenv("AI_SERVICE_API_KEY") or "").strip()
    if not key:
        key = (settings.AI_SERVICE_API_KEY or "").strip()

    if not key:
        logger.critical(
            "AI_SERVICE_API_KEY is not configured. All authenticated requests will be rejected."
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service authentication is not configured. Contact system support.",
        )
    return key


def verify_api_key(
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
) -> None:
    """
    Validates the Bearer token presented by the Django backend.

    The expected key comes exclusively from AI_SERVICE_API_KEY; there is no
    hardcoded fallback, so a misconfigured deployment fails closed.
    """
    expected_key = _get_api_key()
    presented = credentials.credentials if credentials else ""

    # compare_digest over UTF-8 bytes: constant-time with respect to content,
    # so response latency reveals nothing about how much of the key matched.
    if not hmac.compare_digest(presented.encode("utf-8"), expected_key.encode("utf-8")):
        logger.warning("Unauthorized access attempt to AI service API.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials. Invalid API key.",
        )


class SlidingWindowRateLimiter:
    """
    In-process sliding-window rate limiter keyed by conversation.

    Scope note: this is per worker process, so with N workers the effective
    global limit is N x RATE_LIMIT_REQUESTS. That is intentional — it exists
    to stop a single runaway client from monopolising one worker's LLM budget,
    not as a billing control. A precise global limit belongs at the gateway.
    """

    def __init__(self, max_requests: int, window_seconds: int, max_keys: int = 10_000) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.max_keys = max_keys
        self._hits: "OrderedDict[str, list[float]]" = OrderedDict()
        self._lock = threading.Lock()

    def check(self, key: str) -> Tuple[bool, Optional[int]]:
        """
        Returns (allowed, retry_after_seconds). Records the hit when allowed.
        """
        now = time.monotonic()
        cutoff = now - self.window_seconds

        with self._lock:
            timestamps = self._hits.get(key)
            if timestamps is None:
                timestamps = []
                self._hits[key] = timestamps

            # Drop timestamps that have aged out of the window.
            fresh = [t for t in timestamps if t > cutoff]

            if len(fresh) >= self.max_requests:
                self._hits[key] = fresh
                self._hits.move_to_end(key)
                retry_after = max(1, int(self.window_seconds - (now - fresh[0])))
                return False, retry_after

            fresh.append(now)
            self._hits[key] = fresh
            self._hits.move_to_end(key)

            # Bounded key space: evict the least-recently-used conversations
            # so a stream of unique conversation ids cannot exhaust memory.
            while len(self._hits) > self.max_keys:
                self._hits.popitem(last=False)

        return True, None

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()


rate_limiter = SlidingWindowRateLimiter(
    max_requests=settings.RATE_LIMIT_REQUESTS,
    window_seconds=settings.RATE_LIMIT_WINDOW_SECONDS,
)


def enforce_rate_limit(key: str) -> None:
    """Raises HTTP 429 (with Retry-After) when `key` has exceeded its budget."""
    if not settings.RATE_LIMIT_ENABLED:
        return
    allowed, retry_after = rate_limiter.check(key)
    if not allowed:
        logger.warning("Rate limit exceeded", extra={"rate_limit_key": key, "retry_after": retry_after})
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=settings.RATE_LIMITED_MESSAGE,
            headers={"Retry-After": str(retry_after or settings.RATE_LIMIT_WINDOW_SECONDS)},
        )
