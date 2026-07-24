"""
Request-scoped observability primitives: correlation IDs, per-stage timing,
and a tiny in-process metrics registry.

The goal is that a single chat turn produces exactly one rich, structured log
record ("turn.completed") carrying intent, timings, retrieval scores and
fallback usage — rather than a scatter of unrelated INFO lines that can't be
correlated once two users are talking at the same time.
"""
from __future__ import annotations

import contextvars
import threading
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Dict, Iterator, List, Optional

from contextlib import contextmanager

# Correlation identifiers, propagated implicitly through the async call stack
# so every log record emitted while handling a request can be tied back to it
# without threading a parameter through every function signature.
request_id_var: contextvars.ContextVar[str] = contextvars.ContextVar("request_id", default="-")
conversation_id_var: contextvars.ContextVar[str] = contextvars.ContextVar("conversation_id", default="-")


def new_request_id() -> str:
    return uuid.uuid4().hex[:16]


# Attribute names already occupied on every LogRecord. Passing any of these via
# `extra=` makes `logging` raise KeyError and take the whole request down —
# a latent crash that only fires on the code path using the reserved name.
_RESERVED_LOG_KEYS = frozenset(
    {
        "args", "asctime", "created", "exc_info", "exc_text", "filename",
        "funcName", "levelname", "levelno", "lineno", "module", "msecs",
        "message", "msg", "name", "pathname", "process", "processName",
        "relativeCreated", "stack_info", "thread", "threadName", "taskName",
    }
)


def safe_extra(**fields: Any) -> Dict[str, Any]:
    """
    Builds a `extra=` mapping that cannot collide with LogRecord internals.

    Colliding keys are prefixed rather than dropped, so the value still reaches
    the log output under a slightly different name instead of silently
    vanishing or crashing the caller.
    """
    return {
        (f"ctx_{key}" if key in _RESERVED_LOG_KEYS else key): value
        for key, value in fields.items()
    }


def bind_request(request_id: Optional[str] = None, conversation_id: Optional[str] = None) -> str:
    """Binds correlation IDs to the current context and returns the request id."""
    rid = request_id or new_request_id()
    request_id_var.set(rid)
    if conversation_id is not None:
        conversation_id_var.set(conversation_id)
    return rid


def current_request_id() -> str:
    return request_id_var.get()


def current_conversation_id() -> str:
    return conversation_id_var.get()


# ----------------------------------------------------------------------
# Metrics
# ----------------------------------------------------------------------
class MetricsRegistry:
    """
    Deliberately minimal counter/histogram store.

    A full Prometheus client is not pulled in because this service is kept
    dependency-light; the shape here (name -> count, name -> summary stats)
    is enough to expose a /metrics endpoint and to answer "is it getting
    slower / are fallbacks firing" without extra infrastructure.
    """

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._counters: Dict[str, int] = {}
        self._timings: Dict[str, List[float]] = {}
        self._max_samples = 500

    def increment(self, name: str, amount: int = 1) -> None:
        with self._lock:
            self._counters[name] = self._counters.get(name, 0) + amount

    def observe(self, name: str, value_seconds: float) -> None:
        with self._lock:
            samples = self._timings.setdefault(name, [])
            samples.append(value_seconds)
            if len(samples) > self._max_samples:
                # Keep a rolling window so long-lived workers report recent
                # behaviour rather than an average smeared over days.
                del samples[: len(samples) - self._max_samples]

    def snapshot(self) -> Dict[str, Any]:
        with self._lock:
            counters = dict(self._counters)
            timings = {}
            for name, samples in self._timings.items():
                if not samples:
                    continue
                ordered = sorted(samples)
                count = len(ordered)
                timings[name] = {
                    "count": count,
                    "avg_seconds": round(sum(ordered) / count, 4),
                    "p50_seconds": round(ordered[int(count * 0.50)], 4),
                    "p95_seconds": round(ordered[min(count - 1, int(count * 0.95))], 4),
                    "max_seconds": round(ordered[-1], 4),
                }
        return {"counters": counters, "timings": timings}

    def reset(self) -> None:
        with self._lock:
            self._counters.clear()
            self._timings.clear()


metrics = MetricsRegistry()


# ----------------------------------------------------------------------
# Per-turn trace
# ----------------------------------------------------------------------
@dataclass
class TurnTrace:
    """
    Accumulates everything interesting about one chat turn so it can be
    emitted as a single structured log record and, in debug mode, returned
    on the API response for troubleshooting.
    """

    request_id: str = field(default_factory=new_request_id)
    conversation_id: str = "-"
    intent: Optional[str] = None
    intent_source: Optional[str] = None
    handler: Optional[str] = None
    rewritten_query: Optional[str] = None
    topic: Optional[str] = None
    retrieval_candidates: int = 0
    retrieval_included: int = 0
    top_vector_score: Optional[float] = None
    used_fallback_retry: bool = False
    used_faq: bool = False
    used_keyword_branch: bool = False
    query_variants: int = 0
    llm_provider: Optional[str] = None
    llm_input_tokens: Optional[int] = None
    llm_output_tokens: Optional[int] = None
    degraded: bool = False
    degraded_reason: Optional[str] = None
    injection_flagged: bool = False
    stages: Dict[str, float] = field(default_factory=dict)
    started_at: float = field(default_factory=time.perf_counter)

    @contextmanager
    def stage(self, name: str) -> Iterator[None]:
        """Times a named pipeline stage and records it both on the trace and
        in the global metrics registry."""
        start = time.perf_counter()
        try:
            yield
        finally:
            elapsed = time.perf_counter() - start
            self.stages[name] = round(elapsed, 4)
            metrics.observe(f"stage.{name}", elapsed)

    @property
    def total_seconds(self) -> float:
        return time.perf_counter() - self.started_at

    def to_log_fields(self) -> Dict[str, Any]:
        fields: Dict[str, Any] = {
            "request_id": self.request_id,
            "conversation_id": self.conversation_id,
            "intent": self.intent,
            "intent_source": self.intent_source,
            "handler": self.handler,
            "topic": self.topic,
            "retrieval_candidates": self.retrieval_candidates,
            "retrieval_included": self.retrieval_included,
            "top_vector_score": self.top_vector_score,
            "used_fallback_retry": self.used_fallback_retry,
            "used_faq": self.used_faq,
            "used_keyword_branch": self.used_keyword_branch,
            "query_variants": self.query_variants,
            "llm_provider": self.llm_provider,
            "llm_input_tokens": self.llm_input_tokens,
            "llm_output_tokens": self.llm_output_tokens,
            "degraded": self.degraded,
            "degraded_reason": self.degraded_reason,
            "injection_flagged": self.injection_flagged,
            "duration_seconds": round(self.total_seconds, 4),
        }
        for stage_name, seconds in self.stages.items():
            fields[f"t_{stage_name}"] = seconds
        # Query text is intentionally NOT logged — only its length — so chat
        # transcripts never end up in log aggregation by default.
        return {k: v for k, v in fields.items() if v is not None}
