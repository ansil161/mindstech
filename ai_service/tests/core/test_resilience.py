"""
Circuit breaker, retry classification, and backoff.
"""
import asyncio

import pytest

from app.core.resilience import (
    CircuitBreaker,
    CircuitBreakerRegistry,
    backoff_delay,
    is_quota_error,
    is_transient_error,
    retry_async,
)


# ----------------------------------------------------------------------
# Circuit breaker
# ----------------------------------------------------------------------
def test_breaker_starts_closed():
    breaker = CircuitBreaker("test", failure_threshold=3, reset_seconds=10)
    assert breaker.state == "closed"
    assert breaker.allows_request() is True


def test_breaker_opens_after_the_failure_threshold():
    """
    Without this, a hard-down provider costs its full timeout on *every*
    request before failover — turning a partial outage into a total one.
    """
    breaker = CircuitBreaker("test", failure_threshold=3, reset_seconds=10)
    for _ in range(3):
        breaker.record_failure()

    assert breaker.state == "open"
    assert breaker.allows_request() is False


def test_success_resets_the_failure_count():
    breaker = CircuitBreaker("test", failure_threshold=3, reset_seconds=10)
    breaker.record_failure()
    breaker.record_failure()
    breaker.record_success()
    breaker.record_failure()

    assert breaker.state == "closed"


def test_breaker_half_opens_after_the_reset_window():
    breaker = CircuitBreaker("test", failure_threshold=1, reset_seconds=0)
    breaker.record_failure()
    assert breaker.state == "half_open"
    assert breaker.allows_request() is True


def test_failure_in_half_open_reopens_immediately():
    """
    A still-broken provider must not get another full window of traffic. One
    failure in half-open re-opens regardless of the normal threshold.
    """
    breaker = CircuitBreaker("test", failure_threshold=5, reset_seconds=0)
    for _ in range(5):
        breaker.record_failure()
    assert breaker.state == "half_open"  # zero-length window opens instantly

    breaker.record_failure()
    breaker._reset_seconds = 60  # freeze the window so the state is observable
    assert breaker.state == "open"


def test_success_in_half_open_closes_the_breaker():
    breaker = CircuitBreaker("test", failure_threshold=1, reset_seconds=0)
    breaker.record_failure()
    breaker.record_success()
    assert breaker.state == "closed"


def test_registry_returns_the_same_breaker_per_name():
    registry = CircuitBreakerRegistry()
    assert registry.get("llm:openai") is registry.get("llm:openai")
    assert registry.get("llm:openai") is not registry.get("llm:groq")


# ----------------------------------------------------------------------
# Error classification
# ----------------------------------------------------------------------
@pytest.mark.parametrize(
    "message",
    [
        "429 Too Many Requests",
        "Rate limit exceeded",
        "insufficient_quota",
        "401 Unauthorized",
        "Invalid API key provided",
    ],
)
def test_quota_errors_are_classified(message):
    """These rotate the key; retrying the same one could only fail identically."""
    assert is_quota_error(RuntimeError(message)) is True


@pytest.mark.parametrize(
    "message",
    ["Connection reset by peer", "503 Service Unavailable", "Request timed out", "overloaded"],
)
def test_transient_errors_are_classified(message):
    assert is_transient_error(RuntimeError(message)) is True


def test_timeout_exception_type_is_transient():
    assert is_transient_error(asyncio.TimeoutError()) is True


def test_a_plain_bug_is_neither():
    error = ValueError("unexpected None in payload")
    assert is_quota_error(error) is False
    assert is_transient_error(error) is False


# ----------------------------------------------------------------------
# Backoff and retry
# ----------------------------------------------------------------------
def test_backoff_stays_within_the_cap():
    for attempt in range(6):
        assert 0.0 <= backoff_delay(attempt, base=0.1, cap=2.0) <= 2.0


def test_backoff_uses_jitter():
    """Lockstep retries after a shared failure recreate the thundering herd."""
    samples = {backoff_delay(3, base=0.5, cap=8.0) for _ in range(30)}
    assert len(samples) > 1


async def test_retry_returns_the_first_success():
    calls = {"n": 0}

    async def _operation():
        calls["n"] += 1
        return "ok"

    assert await retry_async(_operation, attempts=3, label="t") == "ok"
    assert calls["n"] == 1


async def test_retry_recovers_from_a_transient_failure():
    calls = {"n": 0}

    async def _operation():
        calls["n"] += 1
        if calls["n"] == 1:
            raise ConnectionError("connection reset")
        return "recovered"

    result = await retry_async(
        _operation, attempts=3, label="t", base_delay=0.001, max_delay=0.002
    )
    assert result == "recovered"
    assert calls["n"] == 2


async def test_non_retryable_errors_propagate_immediately():
    """Burning the retry budget on an unretryable error just adds latency."""
    calls = {"n": 0}

    async def _operation():
        calls["n"] += 1
        raise ValueError("definitely a bug")

    with pytest.raises(ValueError):
        await retry_async(_operation, attempts=5, label="t")
    assert calls["n"] == 1


async def test_retry_gives_up_after_the_configured_attempts():
    calls = {"n": 0}

    async def _operation():
        calls["n"] += 1
        raise ConnectionError("still down")

    with pytest.raises(ConnectionError):
        await retry_async(
            _operation, attempts=3, label="t", base_delay=0.001, max_delay=0.002
        )
    assert calls["n"] == 3
