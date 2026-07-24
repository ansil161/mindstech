"""
Failure-handling primitives shared by every outbound integration:
exponential backoff with jitter, and a circuit breaker.

Rationale: without a breaker, a provider that is hard-down costs every single
request its full timeout before failover — turning a partial outage into a
total one by exhausting the worker pool. The breaker converts that into an
immediate, cheap failover after a handful of failures.
"""
from __future__ import annotations

import asyncio
import logging
import random
import threading
import time
from typing import Awaitable, Callable, Iterable, Optional, TypeVar

from app.core.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T")


class CircuitOpenError(RuntimeError):
    """Raised when a call is short-circuited because the breaker is open."""


class CircuitBreaker:
    """
    Per-resource breaker with the standard three states.

    closed  — calls flow through; consecutive failures are counted.
    open    — calls are rejected immediately until the reset window elapses.
    half_open — one trial call is allowed; success closes, failure re-opens.

    Thread-safe because Gunicorn's Uvicorn workers may run blocking work in a
    thread pool, so a breaker can legitimately be touched from several threads.
    """

    def __init__(
        self,
        name: str,
        failure_threshold: Optional[int] = None,
        reset_seconds: Optional[float] = None,
    ) -> None:
        self.name = name
        # `is None` rather than `or`: a caller-supplied 0 is meaningful (an
        # immediate reset window) and must not silently fall through to the
        # configured default.
        self._failure_threshold = (
            settings.CIRCUIT_BREAKER_FAILURE_THRESHOLD
            if failure_threshold is None
            else max(1, failure_threshold)
        )
        self._reset_seconds = (
            settings.CIRCUIT_BREAKER_RESET_SECONDS if reset_seconds is None else reset_seconds
        )
        self._failures = 0
        self._opened_at = 0.0
        self._state = "closed"
        self._lock = threading.Lock()

    @property
    def state(self) -> str:
        with self._lock:
            self._maybe_half_open()
            return self._state

    def _maybe_half_open(self) -> None:
        if self._state == "open" and (time.monotonic() - self._opened_at) >= self._reset_seconds:
            self._state = "half_open"
            logger.info("Circuit breaker '%s' entering half-open state.", self.name)

    def allows_request(self) -> bool:
        with self._lock:
            self._maybe_half_open()
            return self._state != "open"

    def record_success(self) -> None:
        with self._lock:
            if self._state != "closed":
                logger.info("Circuit breaker '%s' closing after successful call.", self.name)
            self._failures = 0
            self._state = "closed"

    def record_failure(self) -> None:
        with self._lock:
            self._failures += 1
            if self._state == "half_open" or self._failures >= self._failure_threshold:
                if self._state != "open":
                    logger.warning(
                        "Circuit breaker '%s' opening after %d consecutive failure(s); "
                        "calls will be rejected for %.0fs.",
                        self.name, self._failures, self._reset_seconds,
                    )
                self._state = "open"
                self._opened_at = time.monotonic()

    def reset(self) -> None:
        with self._lock:
            self._failures = 0
            self._state = "closed"
            self._opened_at = 0.0


class CircuitBreakerRegistry:
    """Lazily creates and hands out one breaker per named resource."""

    def __init__(self) -> None:
        self._breakers: dict[str, CircuitBreaker] = {}
        self._lock = threading.Lock()

    def get(self, name: str) -> CircuitBreaker:
        with self._lock:
            breaker = self._breakers.get(name)
            if breaker is None:
                breaker = CircuitBreaker(name)
                self._breakers[name] = breaker
            return breaker

    def snapshot(self) -> dict[str, str]:
        with self._lock:
            return {name: breaker.state for name, breaker in self._breakers.items()}

    def reset_all(self) -> None:
        with self._lock:
            for breaker in self._breakers.values():
                breaker.reset()


breakers = CircuitBreakerRegistry()


def backoff_delay(attempt: int, base: Optional[float] = None, cap: Optional[float] = None) -> float:
    """
    Exponential backoff with full jitter (AWS's recommended variant).

    Full jitter — a uniform draw from [0, exp_delay] rather than exp_delay
    itself — is what prevents a fleet of workers that failed simultaneously
    from retrying in lockstep and re-creating the thundering herd.
    """
    base = base if base is not None else settings.LLM_RETRY_BASE_DELAY_SECONDS
    cap = cap if cap is not None else settings.LLM_RETRY_MAX_DELAY_SECONDS
    exponential = min(cap, base * (2 ** max(0, attempt)))
    return random.uniform(0.0, exponential)


# Error signatures that mean "this credential is exhausted or invalid" rather
# than "the network hiccupped". These trigger key rotation/cooldown instead of
# a plain retry, because retrying the same key would fail identically.
_QUOTA_SIGNATURES: tuple[str, ...] = (
    "429", "rate limit", "rate_limit", "quota", "insufficient_quota",
    "401", "403", "invalid api key", "invalid_api_key", "unauthorized",
    "permission denied", "billing",
)

# Signatures that indicate a genuinely transient condition worth retrying.
_TRANSIENT_SIGNATURES: tuple[str, ...] = (
    "timeout", "timed out", "connection", "temporarily unavailable",
    "503", "502", "504", "overloaded", "reset by peer", "econnreset",
)


def is_quota_error(error: BaseException) -> bool:
    text = str(error).lower()
    return any(sig in text for sig in _QUOTA_SIGNATURES)


def is_transient_error(error: BaseException) -> bool:
    if isinstance(error, (asyncio.TimeoutError, TimeoutError, ConnectionError)):
        return True
    text = str(error).lower()
    return any(sig in text for sig in _TRANSIENT_SIGNATURES)


async def retry_async(
    operation: Callable[[], Awaitable[T]],
    *,
    attempts: int,
    label: str,
    retry_on: Callable[[BaseException], bool] = is_transient_error,
    base_delay: Optional[float] = None,
    max_delay: Optional[float] = None,
) -> T:
    """
    Runs `operation`, retrying only failures `retry_on` classifies as worth
    retrying. Non-retryable errors propagate immediately so callers can fail
    over (e.g. rotate to a different API key) instead of burning the budget
    re-trying something that will never succeed.
    """
    total = max(1, attempts)
    last_error: Optional[BaseException] = None

    for attempt in range(total):
        try:
            return await operation()
        except Exception as exc:  # noqa: BLE001 - deliberately broad; reclassified below
            last_error = exc
            is_last = attempt == total - 1
            if is_last or not retry_on(exc):
                raise
            delay = backoff_delay(attempt, base_delay, max_delay)
            logger.warning(
                "%s failed (attempt %d/%d), retrying in %.2fs: %s",
                label, attempt + 1, total, delay, exc,
            )
            await asyncio.sleep(delay)

    # Unreachable in practice: the loop either returns or raises.
    raise last_error or RuntimeError(f"{label} failed with no recorded error")


def first_available(candidates: Iterable[str]) -> Optional[str]:
    """Returns the first candidate whose breaker is not open, else None."""
    for name in candidates:
        if breakers.get(name).allows_request():
            return name
    return None
