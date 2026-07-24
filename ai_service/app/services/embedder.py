"""
Embedding generation.

Rewritten to be fully asynchronous. v1 used blocking `requests.post` and the
synchronous OpenAI client from inside `async def` request handlers, so every
embedding call froze the event loop for its full round-trip — the single
largest contributor to the service's inability to handle concurrent chats.

Also fixes: batch embedding existed (`get_embeddings`) but ingestion never
used it, so a 100-chunk document made 100 sequential HTTP calls.

A shared `httpx.AsyncClient` provides connection pooling and keep-alive, which
removes a TLS handshake from every request.
"""
from __future__ import annotations

import asyncio
import hashlib
import logging
from typing import Any, List, Optional

import httpx

from app.core.cache import TTLCache
from app.core.config import settings
from app.core.embedding_config import MODEL_DIMENSIONS, MODEL_TOKEN_LIMITS
from app.core.resilience import breakers, is_transient_error, retry_async

logger = logging.getLogger(__name__)

# Ordered most- to least-specific.
#
# The explicit `pipeline/feature-extraction` route comes first because the
# bare `models/` route resolves to whatever pipeline the model declares by
# default — for sentence-transformers models that is *sentence-similarity*,
# which rejects a plain string input with
#   "SentenceSimilarityPipeline.__call__() missing 1 required positional
#    argument: 'sentences'"
# v1 avoided this by going through huggingface_hub's InferenceClient, which
# sets the task for you; that client is blocking, so the task now has to be
# named explicitly in the URL.
#
# `api-inference.huggingface.co` is deliberately absent: the host no longer
# resolves, so including it cost a DNS timeout on every embedding call.
_HF_ENDPOINTS = (
    "https://router.huggingface.co/hf-inference/pipeline/feature-extraction/{model}",
    "https://router.huggingface.co/hf-inference/models/{model}",
)


class EmbeddingError(RuntimeError):
    """Raised when no embedding could be produced for the given input."""


class Embedder:
    """
    Async embedding service backed by Hugging Face's hosted Inference API or
    OpenAI. No local model weights are loaded, keeping the RAM footprint small
    enough for constrained hosts.
    """

    def __init__(self) -> None:
        self.provider = settings.EMBEDDING_PROVIDER.lower()
        model_name = settings.EMBEDDING_MODEL
        if self.provider in ("huggingface", "hf", "sentence_transformer") and "/" not in model_name:
            model_name = f"sentence-transformers/{model_name}"
        self.model_name = model_name
        self._cache = TTLCache(
            max_size=settings.EMBEDDING_CACHE_MAX_SIZE,
            ttl_seconds=settings.EMBEDDING_CACHE_TTL_SECONDS,
        )
        self._http: Optional[httpx.AsyncClient] = None
        self._http_lock = asyncio.Lock()
        self._openai_client: Any = None
        self._warn_on_config_mismatch()

    # -- configuration sanity ---------------------------------------------
    def _warn_on_config_mismatch(self) -> None:
        """
        Cross-checks the configured model against known dimension/token tables
        so a misconfiguration surfaces as a loud startup warning rather than as
        silently truncated chunks or a Qdrant dimension error much later.
        """
        known_dim = MODEL_DIMENSIONS.get(self.model_name)
        if known_dim is not None and known_dim != settings.QDRANT_VECTOR_DIMENSION:
            logger.warning(
                "Embedding model '%s' produces %d-dim vectors but "
                "QDRANT_VECTOR_DIMENSION is %d. Fix one of them before deploying.",
                self.model_name, known_dim, settings.QDRANT_VECTOR_DIMENSION,
            )

        known_limit = MODEL_TOKEN_LIMITS.get(self.model_name)
        if known_limit is not None and settings.CHUNK_SIZE > known_limit:
            logger.warning(
                "CHUNK_SIZE (%d approx. tokens) exceeds the ~%d-token input limit of "
                "'%s'; long chunks will be truncated by the provider before vectorisation.",
                settings.CHUNK_SIZE, known_limit, self.model_name,
            )

    @property
    def dimension(self) -> int:
        known = MODEL_DIMENSIONS.get(self.model_name)
        if known:
            return known
        return 1536 if self.provider == "openai" else settings.QDRANT_VECTOR_DIMENSION

    # -- clients -----------------------------------------------------------
    async def _client(self) -> httpx.AsyncClient:
        if self._http is None:
            async with self._http_lock:
                if self._http is None:
                    self._http = httpx.AsyncClient(
                        timeout=httpx.Timeout(settings.EMBEDDING_REQUEST_TIMEOUT_SECONDS),
                        limits=httpx.Limits(max_connections=20, max_keepalive_connections=10),
                        headers=self._auth_headers(),
                    )
        return self._http

    @staticmethod
    def _auth_headers() -> dict:
        key = settings.HUGGINGFACE_API_KEY
        return {"Authorization": f"Bearer {key}"} if key else {}

    def _get_openai(self) -> Any:
        if self._openai_client is None:
            from openai import AsyncOpenAI

            self._openai_client = AsyncOpenAI(
                api_key=settings.OPENAI_API_KEY,
                timeout=settings.EMBEDDING_REQUEST_TIMEOUT_SECONDS,
                max_retries=0,
            )
        return self._openai_client

    async def aclose(self) -> None:
        if self._http is not None:
            await self._http.aclose()
            self._http = None

    async def health(self) -> dict:
        """
        Live check that the provider can actually embed.

        This exists because an embedding outage is otherwise invisible: the
        retrieval layer degrades to an empty result, which is indistinguishable
        from "nothing matched", so every answer becomes "I don't have that
        specific detail" while every component reports itself healthy. It is a
        real failure mode — HF silently dropped serverless support for
        sentence-transformers/all-MiniLM-L6-v2, and the only symptom was a
        chatbot that had apparently forgotten everything.
        """
        try:
            vector = await self.aembed("health check")
        except Exception as exc:  # noqa: BLE001
            return {
                "status": "error",
                "provider": self.provider,
                "model": self.model_name,
                "detail": str(exc)[:300],
            }

        if not vector or not any(vector):
            return {
                "status": "error",
                "provider": self.provider,
                "model": self.model_name,
                "detail": "Provider returned an empty or all-zero vector.",
            }

        return {
            "status": "ok",
            "provider": self.provider,
            "model": self.model_name,
            "dimension": len(vector),
        }

    # -- cache -------------------------------------------------------------
    @staticmethod
    def _cache_key(text: str) -> str:
        # Hash rather than store raw text, so user questions and document
        # content aren't retained in memory as plaintext keys.
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    def cache_stats(self) -> dict:
        return {"hits": self._cache.hits, "misses": self._cache.misses}

    # -- provider calls ----------------------------------------------------
    async def _hf_feature_extraction(self, payload: Any) -> Any:
        """
        Calls the HF Inference API, trying each known endpoint shape in turn.

        HF has moved this endpoint more than once; keeping the list means a
        routing change on their side degrades to a slower first call rather
        than a hard outage.
        """
        client = await self._client()
        breaker = breakers.get("embedding:huggingface")
        if not breaker.allows_request():
            raise EmbeddingError("Embedding provider circuit breaker is open.")

        last_error: Optional[str] = None
        for template in _HF_ENDPOINTS:
            url = template.format(model=self.model_name)
            try:
                response = await retry_async(
                    lambda u=url: client.post(
                        u,
                        json={"inputs": payload, "options": {"wait_for_model": True}},
                    ),
                    attempts=settings.EMBEDDING_MAX_RETRIES,
                    label="embedding.huggingface",
                    retry_on=is_transient_error,
                )
                if response.status_code == 200:
                    breaker.record_success()
                    return response.json()

                last_error = f"HTTP {response.status_code}: {response.text[:200]}"
                # 400/404/410 mean "this route or task shape is wrong here" —
                # keep trying the remaining endpoints. Anything else (401/403
                # auth, 429 rate limit, 5xx) will fail identically on every
                # route, so stop rather than multiplying the latency.
                if response.status_code not in (400, 404, 410):
                    break
            except Exception as exc:  # noqa: BLE001
                last_error = str(exc)

        breaker.record_failure()
        raise EmbeddingError(
            f"Hugging Face embedding failed for '{self.model_name}': {last_error}"
        )

    @staticmethod
    def _pool_tokens(vectors: List[List[float]]) -> List[float]:
        """Mean-pools token-level embeddings into a single sentence vector."""
        if not vectors:
            return []
        length = len(vectors[0])
        count = len(vectors)
        return [sum(v[i] for v in vectors) / count for i in range(length)]

    @classmethod
    def _normalize_single(cls, raw: Any) -> List[float]:
        """Coerces HF's several possible response shapes into one flat vector."""
        if not isinstance(raw, list) or not raw:
            raise EmbeddingError("Embedding provider returned an unusable payload.")
        if isinstance(raw[0], (int, float)):
            return [float(x) for x in raw]
        if isinstance(raw[0], list):
            if raw[0] and isinstance(raw[0][0], list):
                return [float(x) for x in cls._pool_tokens(raw[0])]
            return [float(x) for x in cls._pool_tokens(raw)] if len(raw) > 1 else [float(x) for x in raw[0]]
        raise EmbeddingError("Embedding provider returned an unrecognised structure.")

    # -- public API --------------------------------------------------------
    async def aembed(self, text: str) -> List[float]:
        """Embeds one string, served from cache when previously seen."""
        if not text or not text.strip():
            return [0.0] * self.dimension

        cache_key = self._cache_key(text)
        cached = self._cache.get(cache_key)
        if cached is not None:
            return cached

        if self.provider == "openai":
            client = self._get_openai()
            response = await retry_async(
                lambda: client.embeddings.create(model=self.model_name, input=text),
                attempts=settings.EMBEDDING_MAX_RETRIES,
                label="embedding.openai",
                retry_on=is_transient_error,
            )
            vector = [float(x) for x in response.data[0].embedding]
        else:
            raw = await self._hf_feature_extraction(text)
            vector = self._normalize_single(raw)

        self._cache.set(cache_key, vector)
        return vector

    async def aembed_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Embeds many strings, honouring EMBEDDING_BATCH_SIZE.

        Cached entries are served without a network call and the remainder are
        sent as batches, so re-ingesting a document whose content barely
        changed costs almost nothing.
        """
        if not texts:
            return []

        results: List[Optional[List[float]]] = [None] * len(texts)
        pending_indices: List[int] = []
        pending_texts: List[str] = []

        for index, text in enumerate(texts):
            if not text or not text.strip():
                results[index] = [0.0] * self.dimension
                continue
            cached = self._cache.get(self._cache_key(text))
            if cached is not None:
                results[index] = cached
            else:
                pending_indices.append(index)
                pending_texts.append(text)

        batch_size = max(1, settings.EMBEDDING_BATCH_SIZE)
        for start in range(0, len(pending_texts), batch_size):
            chunk_texts = pending_texts[start : start + batch_size]
            chunk_indices = pending_indices[start : start + batch_size]
            vectors = await self._embed_batch_uncached(chunk_texts)
            for index, text, vector in zip(chunk_indices, chunk_texts, vectors):
                results[index] = vector
                self._cache.set(self._cache_key(text), vector)

        return [vector if vector is not None else [0.0] * self.dimension for vector in results]

    async def _embed_batch_uncached(self, texts: List[str]) -> List[List[float]]:
        if self.provider == "openai":
            client = self._get_openai()
            response = await retry_async(
                lambda: client.embeddings.create(model=self.model_name, input=texts),
                attempts=settings.EMBEDDING_MAX_RETRIES,
                label="embedding.openai.batch",
                retry_on=is_transient_error,
            )
            return [[float(x) for x in item.embedding] for item in response.data]

        raw = await self._hf_feature_extraction(texts)
        if not isinstance(raw, list):
            raise EmbeddingError("Batch embedding returned a non-list payload.")

        vectors: List[List[float]] = []
        for item in raw:
            if isinstance(item, list) and item and isinstance(item[0], list):
                vectors.append([float(x) for x in self._pool_tokens(item)])
            elif isinstance(item, list):
                vectors.append([float(x) for x in item])
            else:
                raise EmbeddingError("Batch embedding returned an unrecognised element.")
        return vectors

    # -- sync compatibility ------------------------------------------------
    def get_embedding(self, text: str) -> List[float]:
        """Synchronous shim for scripts and tests. Never call from async code."""
        try:
            asyncio.get_running_loop()
        except RuntimeError:
            return asyncio.run(self.aembed(text))
        raise RuntimeError("get_embedding() cannot be used inside an event loop; await aembed().")

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        try:
            asyncio.get_running_loop()
        except RuntimeError:
            return asyncio.run(self.aembed_batch(texts))
        raise RuntimeError("get_embeddings() cannot be used inside an event loop; await aembed_batch().")


embedder = Embedder()
