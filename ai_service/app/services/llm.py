"""
Unified, asynchronous LLM gateway.

Changes from v1 that matter in production:

* **Async.** v1 called LangChain's blocking `.invoke()` from inside `async def`
  handlers, which pins the event loop for the whole generation. With two
  Gunicorn workers that capped the service at two concurrent chats regardless
  of how much headroom the box had. Everything here uses `.ainvoke()`/`.astream()`.
* **Instance pooling.** v1 constructed a fresh Chat* client for every provider
  and every key on every single request — allocating HTTP clients per call.
  Instances are now built once and reused.
* **Circuit breaking.** A hard-down provider previously cost its full timeout
  on every request before failover. It is now skipped outright once the
  breaker opens.
* **Retry classification.** Transient network faults are retried with jittered
  backoff; quota/auth faults rotate the key instead, because retrying an
  exhausted key can only fail again.
* **Streaming.** `astream_response` exposes token-by-token generation, which
  the chat endpoint uses to serve SSE.
"""
from __future__ import annotations

import asyncio
import logging
import threading
import time
from typing import Any, AsyncIterator, Dict, List, Optional, Tuple

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from app.core.config import settings
from app.core.resilience import (
    breakers,
    is_quota_error,
    is_transient_error,
    retry_async,
)
from app.models.llm import ChatMessage, LLMGenerationResponse

logger = logging.getLogger(__name__)

# Ordered provider preference used when the caller doesn't pin one. The
# primary from settings is always tried first; the rest act as failover.
_FALLBACK_ORDER: Tuple[str, ...] = ("openai", "groq", "gemini")


class LLMUnavailableError(RuntimeError):
    """Every configured provider/key was exhausted, on cooldown, or broken."""


class _ModelPool:
    """
    Caches constructed LangChain chat clients.

    Keyed by the full generation signature, because temperature/max_tokens/
    json-mode are baked into the client at construction time. Bounded
    implicitly: the number of distinct signatures this service uses is small
    and fixed (answering vs. classification).
    """

    def __init__(self) -> None:
        self._instances: Dict[Tuple[Any, ...], Any] = {}
        self._lock = threading.Lock()

    def get_or_create(self, key: Tuple[Any, ...], factory) -> Any:
        instance = self._instances.get(key)
        if instance is not None:
            return instance
        with self._lock:
            instance = self._instances.get(key)
            if instance is None:
                instance = factory()
                self._instances[key] = instance
            return instance

    def clear(self) -> None:
        with self._lock:
            self._instances.clear()


class LLMService:
    """Provider-agnostic chat completion with failover, retries and streaming."""

    def __init__(self) -> None:
        self._key_cooldowns: Dict[str, float] = {}
        self._cooldown_lock = threading.Lock()
        self._pool = _ModelPool()

    # -- key cooldown ------------------------------------------------------
    def _is_on_cooldown(self, key: str) -> bool:
        if not key:
            return False
        with self._cooldown_lock:
            expiry = self._key_cooldowns.get(key)
            if expiry is None:
                return False
            if time.monotonic() < expiry:
                return True
            del self._key_cooldowns[key]
            return False

    def _set_cooldown(self, key: str) -> None:
        if not key:
            return
        with self._cooldown_lock:
            self._key_cooldowns[key] = time.monotonic() + settings.API_KEY_COOLDOWN_SECONDS

    def reset_cooldowns(self) -> None:
        with self._cooldown_lock:
            self._key_cooldowns.clear()

    # -- model construction ------------------------------------------------
    def _keys_for(self, provider: str) -> List[str]:
        return {
            "openai": settings.OPENAI_API_KEYS,
            "groq": settings.GROQ_API_KEYS,
            "gemini": settings.GEMINI_API_KEYS,
        }.get(provider, [])

    def _default_model_for(self, provider: str) -> str:
        return {
            "openai": settings.OPENAI_MODEL,
            "groq": settings.GROQ_MODEL,
            "gemini": settings.GEMINI_MODEL,
        }.get(provider, settings.OPENAI_MODEL)

    def _build_instance(
        self,
        provider: str,
        model_name: str,
        api_key: str,
        temperature: float,
        max_tokens: int,
        timeout: float,
        require_json: bool,
    ) -> Any:
        if provider == "openai":
            from langchain_openai import ChatOpenAI

            model = ChatOpenAI(
                model=model_name,
                api_key=api_key,
                temperature=temperature,
                max_tokens=max_tokens,
                timeout=timeout,
                max_retries=0,  # retries are handled here, with our own policy
            )
            return model.bind(response_format={"type": "json_object"}) if require_json else model

        if provider == "groq":
            from langchain_groq import ChatGroq

            model = ChatGroq(
                model=model_name,
                groq_api_key=api_key,
                temperature=temperature,
                max_tokens=max_tokens,
                timeout=timeout,
                max_retries=0,
            )
            return model.bind(response_format={"type": "json_object"}) if require_json else model

        if provider == "gemini":
            from langchain_google_genai import ChatGoogleGenerativeAI

            # Gemini's JSON mode is configured via the generation config rather
            # than a response_format bind, so require_json is applied by
            # prompt instruction instead (see the classifier prompt).
            return ChatGoogleGenerativeAI(
                model=model_name,
                google_api_key=api_key,
                temperature=temperature,
                max_output_tokens=max_tokens,
                timeout=timeout,
            )

        raise ValueError(f"Unsupported LLM provider: {provider}")

    def _candidates(
        self,
        provider: Optional[str],
        model: Optional[str],
        temperature: float,
        max_tokens: int,
        timeout: float,
        require_json: bool,
    ) -> List[Tuple[str, str, Any]]:
        """
        Builds the ordered (provider, key, instance) failover chain.

        Providers whose breaker is open are skipped entirely, and keys on
        cooldown are filtered out here rather than being discovered mid-loop.
        """
        primary = (provider or settings.LLM_PROVIDER or "openai").strip().lower()
        ordering = [primary] + [p for p in _FALLBACK_ORDER if p != primary]

        candidates: List[Tuple[str, str, Any]] = []
        for provider_name in ordering:
            keys = self._keys_for(provider_name)
            if not keys:
                continue
            if not breakers.get(f"llm:{provider_name}").allows_request():
                logger.debug("Skipping provider %s: circuit breaker open.", provider_name)
                continue

            model_name = model if (provider_name == primary and model) else self._default_model_for(provider_name)

            for api_key in keys:
                if self._is_on_cooldown(api_key):
                    continue
                cache_key = (
                    provider_name, model_name, api_key,
                    temperature, max_tokens, timeout, require_json,
                )
                try:
                    instance = self._pool.get_or_create(
                        cache_key,
                        lambda p=provider_name, m=model_name, k=api_key: self._build_instance(
                            p, m, k, temperature, max_tokens, timeout, require_json
                        ),
                    )
                except Exception as exc:  # noqa: BLE001
                    logger.warning("Could not initialise provider %s: %s", provider_name, exc)
                    continue
                candidates.append((provider_name, api_key, instance))

        return candidates

    # -- message conversion ------------------------------------------------
    @staticmethod
    def _to_langchain(messages: List[ChatMessage]) -> List[Any]:
        converted: List[Any] = []
        for message in messages:
            role = message.role.value if hasattr(message.role, "value") else str(message.role)
            if role == "system":
                converted.append(SystemMessage(content=message.content))
            elif role == "user":
                converted.append(HumanMessage(content=message.content))
            elif role == "assistant":
                converted.append(AIMessage(content=message.content))
        return converted

    @staticmethod
    def _extract_usage(response: Any) -> Tuple[Optional[int], Optional[int]]:
        meta = getattr(response, "response_metadata", None) or {}
        usage = meta.get("token_usage") or meta.get("usage") or {}
        if not usage:
            usage_meta = getattr(response, "usage_metadata", None) or {}
            return usage_meta.get("input_tokens"), usage_meta.get("output_tokens")
        return (
            usage.get("prompt_tokens") or usage.get("input_tokens"),
            usage.get("completion_tokens") or usage.get("output_tokens"),
        )

    # -- generation --------------------------------------------------------
    async def agenerate(
        self,
        messages: List[ChatMessage],
        *,
        provider: Optional[str] = None,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        timeout: Optional[float] = None,
        require_json: bool = False,
    ) -> LLMGenerationResponse:
        """
        Generates a completion, failing over across keys then providers.

        Raises LLMUnavailableError only once every candidate is exhausted;
        callers treat that as a degradation signal, not a crash.
        """
        selected_temperature = temperature if temperature is not None else settings.LLM_TEMPERATURE
        selected_max_tokens = max_tokens or settings.LLM_MAX_OUTPUT_TOKENS
        selected_timeout = timeout or settings.LLM_REQUEST_TIMEOUT_SECONDS

        candidates = self._candidates(
            provider, model, selected_temperature, selected_max_tokens,
            selected_timeout, require_json,
        )
        if not candidates:
            raise LLMUnavailableError(
                "No LLM provider is available (no keys configured, all keys on "
                "cooldown, or all circuit breakers open)."
            )

        lc_messages = self._to_langchain(messages)
        started = time.perf_counter()
        last_error: Optional[BaseException] = None

        for provider_name, api_key, instance in candidates:
            breaker = breakers.get(f"llm:{provider_name}")
            key_hint = api_key[-4:] if api_key else "none"
            try:
                response = await retry_async(
                    lambda inst=instance: inst.ainvoke(lc_messages),
                    attempts=settings.LLM_MAX_RETRIES,
                    label=f"llm.{provider_name}",
                    retry_on=is_transient_error,
                )
                breaker.record_success()
                input_tokens, output_tokens = self._extract_usage(response)
                duration = time.perf_counter() - started
                logger.info(
                    "LLM generation succeeded",
                    extra={
                        "llm_provider": provider_name,
                        "llm_duration_seconds": round(duration, 3),
                        "llm_input_tokens": input_tokens,
                        "llm_output_tokens": output_tokens,
                    },
                )
                return LLMGenerationResponse(
                    provider=provider_name,
                    model=model or self._default_model_for(provider_name),
                    content=_coerce_text(response.content),
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    duration_seconds=duration,
                )
            except Exception as exc:  # noqa: BLE001 - classified immediately below
                last_error = exc
                if is_quota_error(exc):
                    logger.warning(
                        "Provider %s key ...%s hit a quota/auth limit; cooling down.",
                        provider_name, key_hint,
                    )
                    self._set_cooldown(api_key)
                else:
                    logger.warning(
                        "Provider %s key ...%s failed: %s", provider_name, key_hint, exc
                    )
                    breaker.record_failure()

        logger.error("All LLM providers and keys failed or are unavailable.")
        raise LLMUnavailableError(str(last_error) if last_error else "All LLM providers failed.")

    async def astream(
        self,
        messages: List[ChatMessage],
        *,
        provider: Optional[str] = None,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        timeout: Optional[float] = None,
    ) -> AsyncIterator[str]:
        """
        Yields content deltas as they arrive.

        Failover here is limited to *connection* setup: once tokens have been
        emitted to the client we cannot silently switch providers mid-answer
        without producing incoherent output, so a mid-stream failure ends the
        stream and the caller surfaces the partial result.
        """
        selected_temperature = temperature if temperature is not None else settings.LLM_TEMPERATURE
        selected_max_tokens = max_tokens or settings.LLM_MAX_OUTPUT_TOKENS
        selected_timeout = timeout or settings.LLM_REQUEST_TIMEOUT_SECONDS

        candidates = self._candidates(
            provider, model, selected_temperature, selected_max_tokens,
            selected_timeout, require_json=False,
        )
        if not candidates:
            raise LLMUnavailableError("No LLM provider is available for streaming.")

        lc_messages = self._to_langchain(messages)
        last_error: Optional[BaseException] = None

        for provider_name, api_key, instance in candidates:
            breaker = breakers.get(f"llm:{provider_name}")
            emitted_any = False
            try:
                async for chunk in instance.astream(lc_messages):
                    text = _coerce_text(getattr(chunk, "content", ""))
                    if text:
                        emitted_any = True
                        yield text
                breaker.record_success()
                return
            except Exception as exc:  # noqa: BLE001
                last_error = exc
                if emitted_any:
                    # Partial output already reached the client; switching
                    # providers now would splice two different answers.
                    logger.error("Stream failed after partial output from %s: %s", provider_name, exc)
                    breaker.record_failure()
                    raise
                if is_quota_error(exc):
                    self._set_cooldown(api_key)
                else:
                    breaker.record_failure()
                logger.warning("Streaming setup failed on %s, trying next: %s", provider_name, exc)

        raise LLMUnavailableError(str(last_error) if last_error else "All providers failed to stream.")

    # -- compatibility -----------------------------------------------------
    def generate_response(
        self,
        messages: List[ChatMessage],
        provider: Optional[str] = None,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        require_json: bool = False,
    ) -> LLMGenerationResponse:
        """
        Synchronous wrapper retained for non-async callers (scripts, tests).

        Refuses to run inside a live event loop rather than deadlocking on
        `asyncio.run`, which is the failure mode this kind of shim usually has.
        """
        try:
            asyncio.get_running_loop()
        except RuntimeError:
            return asyncio.run(
                self.agenerate(
                    messages,
                    provider=provider,
                    model=model,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    require_json=require_json,
                )
            )
        raise RuntimeError(
            "generate_response() is synchronous and cannot be called from an "
            "async context. Await agenerate() instead."
        )

    def health(self) -> Dict[str, Any]:
        configured = {
            provider: len(self._keys_for(provider))
            for provider in _FALLBACK_ORDER
            if self._keys_for(provider)
        }
        return {
            "configured_providers": configured,
            "primary": settings.LLM_PROVIDER,
            "breakers": {
                name: state
                for name, state in breakers.snapshot().items()
                if name.startswith("llm:")
            },
        }


def _coerce_text(content: Any) -> str:
    """
    Normalises provider content into a plain string.

    Some providers return a list of typed content blocks rather than a string;
    concatenating the text parts keeps downstream code simple.
    """
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: List[str] = []
        for block in content:
            if isinstance(block, str):
                parts.append(block)
            elif isinstance(block, dict) and "text" in block:
                parts.append(str(block["text"]))
        return "".join(parts)
    return str(content or "")


llm_service = LLMService()
