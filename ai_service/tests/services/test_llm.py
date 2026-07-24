"""
LLM gateway: key rotation, provider failover, breaker interaction, pooling and
streaming.

No real provider is contacted — fake chat clients are injected into the
instance pool so the failover *logic* is what's under test.
"""
import pytest

from app.core.config import settings
from app.core.resilience import breakers
from app.models.llm import ChatMessage, MessageRole
from app.services.llm import LLMService, LLMUnavailableError, _coerce_text


class FakeResponse:
    def __init__(self, content: str):
        self.content = content
        self.response_metadata = {"token_usage": {"prompt_tokens": 10, "completion_tokens": 5}}


class FakeModel:
    """Stands in for a LangChain chat client."""

    def __init__(self, *, content="ok", error=None, stream_chunks=None):
        self.content = content
        self.error = error
        self.stream_chunks = stream_chunks or []
        self.invocations = 0

    async def ainvoke(self, messages):
        self.invocations += 1
        if self.error:
            raise self.error
        return FakeResponse(self.content)

    async def astream(self, messages):
        if self.error:
            raise self.error
        for chunk in self.stream_chunks:
            yield type("Chunk", (), {"content": chunk})()


@pytest.fixture
def service(monkeypatch):
    """A fresh LLMService with all breakers reset."""
    breakers.reset_all()
    monkeypatch.setattr(settings, "OPENAI_API_KEYS", ["key-openai-1"])
    monkeypatch.setattr(settings, "GROQ_API_KEYS", [])
    monkeypatch.setattr(settings, "GEMINI_API_KEYS", [])
    monkeypatch.setattr(settings, "LLM_PROVIDER", "openai")
    return LLMService()


def _messages():
    return [ChatMessage(role=MessageRole.USER, content="hello")]


def _install(service, mapping):
    """Replaces instance construction with a provider/key -> FakeModel map."""
    service._build_instance = lambda provider, model, key, *a, **kw: mapping[(provider, key)]


# ----------------------------------------------------------------------
# Happy path
# ----------------------------------------------------------------------
async def test_successful_generation_returns_content_and_usage(service):
    _install(service, {("openai", "key-openai-1"): FakeModel(content="An answer.")})

    response = await service.agenerate(_messages())

    assert response.content == "An answer."
    assert response.provider == "openai"
    assert response.input_tokens == 10
    assert response.output_tokens == 5


async def test_no_configured_keys_raises_unavailable(service, monkeypatch):
    monkeypatch.setattr(settings, "OPENAI_API_KEYS", [])
    with pytest.raises(LLMUnavailableError):
        await service.agenerate(_messages())


# ----------------------------------------------------------------------
# Failover
# ----------------------------------------------------------------------
async def test_quota_error_rotates_to_the_next_key(service, monkeypatch):
    monkeypatch.setattr(settings, "OPENAI_API_KEYS", ["bad-key", "good-key"])
    exhausted = FakeModel(error=RuntimeError("429 rate limit exceeded"))
    working = FakeModel(content="from the second key")
    _install(service, {("openai", "bad-key"): exhausted, ("openai", "good-key"): working})

    response = await service.agenerate(_messages())

    assert response.content == "from the second key"
    assert exhausted.invocations == 1


async def test_an_exhausted_key_is_skipped_on_the_next_call(service, monkeypatch):
    """Cooldown is what stops a burned key costing latency on every turn."""
    monkeypatch.setattr(settings, "OPENAI_API_KEYS", ["bad-key", "good-key"])
    exhausted = FakeModel(error=RuntimeError("insufficient_quota"))
    working = FakeModel(content="ok")
    _install(service, {("openai", "bad-key"): exhausted, ("openai", "good-key"): working})

    await service.agenerate(_messages())
    await service.agenerate(_messages())

    assert exhausted.invocations == 1, "the cooled-down key should not be retried"


async def test_failover_crosses_providers(service, monkeypatch):
    monkeypatch.setattr(settings, "OPENAI_API_KEYS", ["openai-key"])
    monkeypatch.setattr(settings, "GROQ_API_KEYS", ["groq-key"])
    _install(
        service,
        {
            ("openai", "openai-key"): FakeModel(error=RuntimeError("401 unauthorized")),
            ("groq", "groq-key"): FakeModel(content="answered by groq"),
        },
    )

    response = await service.agenerate(_messages())

    assert response.provider == "groq"
    assert response.content == "answered by groq"


async def test_all_providers_failing_raises_unavailable(service, monkeypatch):
    """Callers rely on this being a typed error so they can degrade, not 500."""
    monkeypatch.setattr(settings, "OPENAI_API_KEYS", ["k1"])
    monkeypatch.setattr(settings, "GROQ_API_KEYS", ["k2"])
    _install(
        service,
        {
            ("openai", "k1"): FakeModel(error=RuntimeError("429 quota")),
            ("groq", "k2"): FakeModel(error=RuntimeError("429 quota")),
        },
    )

    with pytest.raises(LLMUnavailableError):
        await service.agenerate(_messages())


async def test_open_breaker_skips_the_provider_entirely(service, monkeypatch):
    monkeypatch.setattr(settings, "OPENAI_API_KEYS", ["openai-key"])
    monkeypatch.setattr(settings, "GROQ_API_KEYS", ["groq-key"])

    openai_model = FakeModel(content="should not be reached")
    _install(
        service,
        {
            ("openai", "openai-key"): openai_model,
            ("groq", "groq-key"): FakeModel(content="from groq"),
        },
    )

    breaker = breakers.get("llm:openai")
    for _ in range(settings.CIRCUIT_BREAKER_FAILURE_THRESHOLD):
        breaker.record_failure()

    response = await service.agenerate(_messages())

    assert response.provider == "groq"
    assert openai_model.invocations == 0


# ----------------------------------------------------------------------
# Pooling
# ----------------------------------------------------------------------
async def test_model_instances_are_pooled_across_calls(service):
    """
    v1 constructed a fresh client for every provider and key on every request,
    allocating HTTP clients per call.
    """
    constructions = {"n": 0}

    def _build(provider, model, key, *args, **kwargs):
        constructions["n"] += 1
        return FakeModel(content="ok")

    service._build_instance = _build

    await service.agenerate(_messages())
    await service.agenerate(_messages())
    await service.agenerate(_messages())

    assert constructions["n"] == 1


# ----------------------------------------------------------------------
# Streaming
# ----------------------------------------------------------------------
async def test_streaming_yields_deltas(service):
    _install(
        service,
        {("openai", "key-openai-1"): FakeModel(stream_chunks=["Hello", " ", "world"])},
    )

    collected = [chunk async for chunk in service.astream(_messages())]
    assert "".join(collected) == "Hello world"


async def test_streaming_fails_over_before_any_output(service, monkeypatch):
    monkeypatch.setattr(settings, "OPENAI_API_KEYS", ["k1"])
    monkeypatch.setattr(settings, "GROQ_API_KEYS", ["k2"])
    _install(
        service,
        {
            ("openai", "k1"): FakeModel(error=RuntimeError("429 quota")),
            ("groq", "k2"): FakeModel(stream_chunks=["fallback"]),
        },
    )

    collected = [chunk async for chunk in service.astream(_messages())]
    assert "".join(collected) == "fallback"


# ----------------------------------------------------------------------
# Content coercion
# ----------------------------------------------------------------------
def test_coerce_text_handles_plain_strings():
    assert _coerce_text("hello") == "hello"


def test_coerce_text_joins_structured_content_blocks():
    """Some providers return typed blocks rather than a bare string."""
    assert _coerce_text([{"text": "Hello "}, {"text": "world"}]) == "Hello world"


def test_coerce_text_handles_none():
    assert _coerce_text(None) == ""


def test_sync_wrapper_refuses_to_run_inside_an_event_loop(service):
    """
    Better a loud error than the silent deadlock `asyncio.run` inside a
    running loop would produce.
    """
    import asyncio

    async def _attempt():
        with pytest.raises(RuntimeError, match="cannot be called from an async context"):
            service.generate_response(_messages())

    asyncio.get_event_loop_policy().new_event_loop().run_until_complete(_attempt())
