"""
Embedding provider: generation, parsing, dimension detection, model failover,
retries, timeouts and connection failures.

These tests exercise the real `Embedder` implementation. The autouse
`stub_embeddings` fixture in conftest only replaces the bound methods on the
module-level singleton, so a locally constructed instance still runs the
production code path — the network is stubbed at the httpx layer instead.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

import httpx
import pytest

from app.core.config import settings
from app.core.embedding_config import known_dimension, reindex_plan
from app.core.resilience import breakers
from app.services.embedder import EmbeddingError, Embedder

BGE_BASE = "BAAI/bge-base-en-v1.5"
BGE_SMALL = "BAAI/bge-small-en-v1.5"
E5_BASE = "intfloat/e5-base-v2"


class FakeResponse:
    def __init__(self, status_code: int, payload: Any = None, text: str = "") -> None:
        self.status_code = status_code
        self._payload = payload
        self.text = text or ("" if payload is None else "<json>")

    def json(self) -> Any:
        return self._payload


class FakeHTTP:
    """
    Stand-in for the shared httpx.AsyncClient.

    Routes are matched on the URL so a test can express "this model 404s, that
    one serves" without caring about call ordering.
    """

    def __init__(self, handler) -> None:
        self._handler = handler
        self.calls: List[str] = []

    async def post(self, url: str, **kwargs: Any) -> FakeResponse:
        self.calls.append(url)
        result = self._handler(url, kwargs)
        if isinstance(result, BaseException):
            raise result
        return result

    async def aclose(self) -> None:
        return None


@pytest.fixture(autouse=True)
def fast_retries_and_clean_breakers(monkeypatch):
    """Keeps retry backoff sub-millisecond and stops breaker state leaking."""
    monkeypatch.setattr(settings, "LLM_RETRY_BASE_DELAY_SECONDS", 0.001)
    monkeypatch.setattr(settings, "LLM_RETRY_MAX_DELAY_SECONDS", 0.002)
    breakers.reset_all()
    yield
    breakers.reset_all()


@pytest.fixture
def make_embedder(monkeypatch):
    """Builds an Embedder with explicit config and a stubbed HTTP client."""

    def _make(
        handler,
        *,
        model: str = BGE_BASE,
        fallbacks: Optional[List[str]] = None,
        dimension: int = 768,
        failover: bool = True,
        strict: bool = True,
    ):
        monkeypatch.setattr(settings, "EMBEDDING_PROVIDER", "huggingface")
        monkeypatch.setattr(settings, "EMBEDDING_MODEL", model)
        monkeypatch.setattr(
            settings,
            "EMBEDDING_MODEL_FALLBACKS",
            [BGE_SMALL, E5_BASE] if fallbacks is None else fallbacks,
        )
        monkeypatch.setattr(settings, "EMBEDDING_ENABLE_MODEL_FAILOVER", failover)
        monkeypatch.setattr(settings, "EMBEDDING_STRICT_DIMENSION_FAILOVER", strict)
        monkeypatch.setattr(settings, "QDRANT_VECTOR_DIMENSION", dimension)

        embedder = Embedder()
        http = FakeHTTP(handler)
        embedder._http = http  # bypasses lazy client construction
        return embedder, http

    return _make


def vector(width: int, fill: float = 0.05) -> List[float]:
    return [fill] * width


def serves(model: str, width: int):
    """Handler: `model` returns vectors, everything else is a route miss."""

    def _handler(url: str, kwargs: Dict[str, Any]):
        if model not in url:
            return FakeResponse(404, text='{"error":"Model not supported"}')
        payload = kwargs.get("json", {}).get("inputs")
        if isinstance(payload, list):
            return FakeResponse(200, [vector(width) for _ in payload])
        return FakeResponse(200, vector(width))

    return _handler


# ----------------------------------------------------------------------
# Generation
# ----------------------------------------------------------------------
async def test_single_embedding_returns_a_flat_vector(make_embedder):
    embedder, _ = make_embedder(serves(BGE_BASE, 768))
    result = await embedder.aembed("what AV brands do you distribute?")

    assert len(result) == 768
    assert all(isinstance(x, float) for x in result)


async def test_batch_embedding_returns_one_vector_per_input(make_embedder):
    embedder, http = make_embedder(serves(BGE_BASE, 768))
    result = await embedder.aembed_batch(["alpha", "beta", "gamma"])

    assert len(result) == 3
    assert all(len(v) == 768 for v in result)
    # One batched request, not one per chunk — the whole point of batching.
    assert len(http.calls) == 1


async def test_batch_respects_the_configured_batch_size(monkeypatch, make_embedder):
    embedder, http = make_embedder(serves(BGE_BASE, 768))
    monkeypatch.setattr(settings, "EMBEDDING_BATCH_SIZE", 2)

    result = await embedder.aembed_batch(["a", "b", "c", "d", "e"])

    assert len(result) == 5
    assert len(http.calls) == 3  # 2 + 2 + 1


async def test_blank_input_short_circuits_without_a_network_call(make_embedder):
    embedder, http = make_embedder(serves(BGE_BASE, 768))
    result = await embedder.aembed("   ")

    assert result == [0.0] * 768
    assert http.calls == []


async def test_repeated_text_is_served_from_cache(make_embedder):
    embedder, http = make_embedder(serves(BGE_BASE, 768))
    await embedder.aembed("same question")
    await embedder.aembed("same question")

    assert len(http.calls) == 1
    assert embedder.cache_stats()["hits"] == 1


async def test_token_level_output_is_mean_pooled(make_embedder):
    """Some routes return per-token vectors; those must collapse to one vector."""

    def _handler(url, kwargs):
        # [[[t1],[t2]]] — batch of 1, two tokens, width 4.
        return FakeResponse(200, [[[1.0, 1.0, 1.0, 1.0], [3.0, 3.0, 3.0, 3.0]]])

    embedder, _ = make_embedder(_handler, dimension=4)
    result = await embedder.aembed("pool me")

    assert result == [2.0, 2.0, 2.0, 2.0]


# ----------------------------------------------------------------------
# Endpoint routing
# ----------------------------------------------------------------------
async def test_the_working_models_route_is_tried_first(make_embedder):
    """
    Leading with the verified route removes a guaranteed 400 from every call.
    """
    embedder, http = make_embedder(serves(BGE_BASE, 768))
    await embedder.aembed("hello")

    assert http.calls[0].endswith(f"/hf-inference/models/{BGE_BASE}")
    assert len(http.calls) == 1


async def test_a_route_miss_falls_through_to_the_other_endpoint_shape(make_embedder):
    def _handler(url, kwargs):
        if "/models/" in url:
            return FakeResponse(400, text='{"error":"Model not supported by provider"}')
        return FakeResponse(200, vector(768))

    embedder, http = make_embedder(_handler)
    result = await embedder.aembed("hello")

    assert len(result) == 768
    assert len(http.calls) == 2
    assert "pipeline/feature-extraction" in http.calls[1]


# ----------------------------------------------------------------------
# Model failover
# ----------------------------------------------------------------------
async def test_failover_moves_to_the_next_same_width_model(make_embedder):
    """The primary going unserved must not take retrieval down with it."""
    embedder, _ = make_embedder(serves(E5_BASE, 768))  # bge-base 404s

    result = await embedder.aembed("hello")

    assert len(result) == 768
    assert embedder.model_name == E5_BASE
    assert embedder.configured_model == BGE_BASE


async def test_failover_skips_a_model_of_a_different_width(make_embedder):
    """
    bge-small is 384-dim against a 768-dim index. Using it would write vectors
    the collection cannot search, so it must be skipped rather than accepted.
    """
    embedder, http = make_embedder(serves(E5_BASE, 768))
    await embedder.aembed("hello")

    assert embedder.model_name == E5_BASE
    assert not any(BGE_SMALL in url for url in http.calls)


async def test_failover_is_sticky_across_calls(make_embedder):
    embedder, http = make_embedder(serves(E5_BASE, 768))
    await embedder.aembed("first")
    calls_after_first = len(http.calls)
    await embedder.aembed("second")

    # The ladder is walked once; the second call goes straight to the winner.
    assert len(http.calls) - calls_after_first == 1
    assert http.calls[-1].endswith(E5_BASE)


async def test_failover_clears_the_cache(make_embedder):
    """
    Vectors from two models are not comparable. Serving a stale one alongside
    new ones silently mixes embedding spaces inside a single query.
    """
    state = {"bge_ok": True}

    def _handler(url, kwargs):
        if BGE_BASE in url:
            return FakeResponse(200, vector(768)) if state["bge_ok"] else FakeResponse(404, text="gone")
        if E5_BASE in url:
            return FakeResponse(200, vector(768, 0.9))
        return FakeResponse(404, text="gone")

    embedder, _ = make_embedder(_handler)
    await embedder.aembed("cached under the old model")
    assert embedder.model_name == BGE_BASE

    state["bge_ok"] = False
    await embedder.aembed("forces failover")

    assert embedder.model_name == E5_BASE
    # The pre-failover entry must be gone, not replayed.
    refreshed = await embedder.aembed("cached under the old model")
    assert refreshed[0] == pytest.approx(0.9)


async def test_failover_can_be_disabled(make_embedder):
    embedder, http = make_embedder(serves(E5_BASE, 768), failover=False)

    with pytest.raises(EmbeddingError):
        await embedder.aembed("hello")

    assert all(BGE_BASE in url for url in http.calls)
    assert embedder.model_name == BGE_BASE


async def test_auth_failure_aborts_instead_of_walking_the_ladder(make_embedder):
    """401 fails identically for every model; retrying each only adds latency."""

    def _handler(url, kwargs):
        return FakeResponse(401, text='{"error":"Invalid credentials"}')

    embedder, http = make_embedder(_handler)

    with pytest.raises(EmbeddingError, match="401"):
        await embedder.aembed("hello")

    assert len(http.calls) == 1


async def test_total_provider_failure_raises_rather_than_returning_junk(make_embedder):
    def _handler(url, kwargs):
        return FakeResponse(404, text='{"error":"Model not supported"}')

    embedder, _ = make_embedder(_handler)

    with pytest.raises(EmbeddingError):
        await embedder.aembed("hello")


# ----------------------------------------------------------------------
# Dimension detection
# ----------------------------------------------------------------------
async def test_dimension_is_learned_from_the_live_response(make_embedder):
    """
    Width comes from what the provider actually returned, not a table — a stale
    table entry must never decide what gets written to Qdrant.
    """
    embedder, _ = make_embedder(serves(BGE_BASE, 768))
    assert embedder._observed_dimension is None

    await embedder.aembed("measure me")

    assert embedder._observed_dimension == 768
    assert embedder.dimension == 768


async def test_observed_dimension_overrides_the_lookup_table(make_embedder):
    """A model that changes its output width must not be silently mis-sized."""

    def _handler(url, kwargs):
        return FakeResponse(200, vector(1024))

    embedder, _ = make_embedder(_handler)
    await embedder.aembed("surprise")

    assert known_dimension(BGE_BASE) == 768
    assert embedder.dimension == 1024


async def test_probe_dimension_reports_the_measured_width(make_embedder):
    embedder, _ = make_embedder(serves(BGE_BASE, 768))
    assert await embedder.probe_dimension() == 768


async def test_probe_dimension_returns_none_when_the_provider_is_down(make_embedder):
    def _handler(url, kwargs):
        return FakeResponse(500, text="upstream exploded")

    embedder, _ = make_embedder(_handler)
    assert await embedder.probe_dimension() is None


async def test_blank_input_uses_the_detected_width(make_embedder):
    """A zero vector of the wrong width is rejected by Qdrant on upsert."""

    def _handler(url, kwargs):
        return FakeResponse(200, vector(1024))

    embedder, _ = make_embedder(_handler)
    await embedder.aembed("prime the detector")

    assert await embedder.aembed("") == [0.0] * 1024


# ----------------------------------------------------------------------
# Dimension mismatch detection
# ----------------------------------------------------------------------
async def test_health_flags_a_width_that_disagrees_with_the_index(make_embedder):
    """
    A working embedder pointed at an incompatible collection is still a broken
    RAG pipeline; readiness must not report it as healthy.
    """
    embedder, _ = make_embedder(serves(BGE_BASE, 768), dimension=384)
    report = await embedder.health()

    assert report["status"] == "error"
    assert "768" in report["detail"] and "384" in report["detail"]


async def test_health_is_ok_when_width_matches(make_embedder):
    embedder, _ = make_embedder(serves(BGE_BASE, 768), dimension=768)
    report = await embedder.health()

    assert report["status"] == "ok"
    assert report["dimension"] == 768
    assert report["failed_over"] is False


async def test_health_reports_the_active_model_after_a_failover(make_embedder):
    embedder, _ = make_embedder(serves(E5_BASE, 768))
    report = await embedder.health()

    assert report["status"] == "ok"
    assert report["model"] == E5_BASE
    assert report["configured_model"] == BGE_BASE
    assert report["failed_over"] is True


async def test_health_reports_provider_failure_without_raising(make_embedder):
    def _handler(url, kwargs):
        return FakeResponse(404, text="gone")

    embedder, _ = make_embedder(_handler)
    report = await embedder.health()

    assert report["status"] == "error"
    assert "detail" in report


def test_reindex_plan_states_the_widths_and_refuses_to_delete():
    plan = reindex_plan(
        collection="mindstec_rag",
        current_dimension=384,
        required_dimension=768,
        model_name=BGE_BASE,
    )

    assert "384" in plan and "768" in plan
    assert "NOTHING HAS BEEN DELETED" in plan
    assert "recreate_qdrant_collection.py --yes" in plan
    assert "CANNOT be reused" in plan


# ----------------------------------------------------------------------
# Retries, timeouts, connection failures
# ----------------------------------------------------------------------
async def test_a_transient_error_is_retried(make_embedder):
    attempts = {"n": 0}

    def _handler(url, kwargs):
        attempts["n"] += 1
        if attempts["n"] == 1:
            return httpx.ReadTimeout("request timed out")
        return FakeResponse(200, vector(768))

    embedder, _ = make_embedder(_handler)
    result = await embedder.aembed("flaky network")

    assert len(result) == 768
    assert attempts["n"] == 2


async def test_retries_are_bounded_by_configuration(monkeypatch, make_embedder):
    attempts = {"n": 0}

    def _handler(url, kwargs):
        attempts["n"] += 1
        return httpx.ConnectTimeout("connection timed out")

    monkeypatch.setattr(settings, "EMBEDDING_MAX_RETRIES", 2)
    # Single-model ladder so the count reflects retries, not failover.
    embedder, _ = make_embedder(_handler, fallbacks=[])

    with pytest.raises(EmbeddingError):
        await embedder.aembed("permanently down")

    # 2 attempts x 2 endpoint shapes.
    assert attempts["n"] == 4


async def test_a_connection_failure_degrades_to_an_embedding_error(make_embedder):
    """Never a raw httpx exception — retrieval catches EmbeddingError."""

    def _handler(url, kwargs):
        return httpx.ConnectError("connection refused")

    embedder, _ = make_embedder(_handler, fallbacks=[])

    with pytest.raises(EmbeddingError):
        await embedder.aembed("no network")


async def test_a_non_retryable_error_is_not_retried(make_embedder):
    attempts = {"n": 0}

    def _handler(url, kwargs):
        attempts["n"] += 1
        return ValueError("malformed request")

    embedder, _ = make_embedder(_handler, fallbacks=[])

    with pytest.raises(EmbeddingError):
        await embedder.aembed("bug")

    assert attempts["n"] == 2  # one per endpoint shape, no retry within either


async def test_an_open_circuit_breaker_short_circuits_the_call(make_embedder):
    embedder, http = make_embedder(serves(BGE_BASE, 768))
    breaker = breakers.get("embedding:huggingface")
    for _ in range(settings.CIRCUIT_BREAKER_FAILURE_THRESHOLD):
        breaker.record_failure()

    with pytest.raises(EmbeddingError, match="circuit breaker"):
        await embedder.aembed("blocked")

    assert http.calls == []


async def test_an_unusable_payload_is_rejected(make_embedder):
    def _handler(url, kwargs):
        return FakeResponse(200, {"error": "not a vector"})

    embedder, _ = make_embedder(_handler)

    with pytest.raises(EmbeddingError):
        await embedder.aembed("garbage in")
