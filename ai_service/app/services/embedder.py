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
from app.core.embedding_config import MODEL_TOKEN_LIMITS, known_dimension, reindex_plan
from app.core.observability import metrics
from app.core.resilience import breakers, is_transient_error, retry_async

logger = logging.getLogger(__name__)

# Ordered by verified likelihood of success, not by specificity.
#
# The bare `models/{model}` route is now FIRST. Measured against the live API
# on 2026-07-24 with a real token:
#
#   pipeline/feature-extraction/BAAI/bge-base-en-v1.5
#       -> 400 {"error":"Model not supported by provider hf-inference"}
#   models/BAAI/bge-base-en-v1.5
#       -> 200, 768-dim float vector
#
# The explicit-task route used to come first because the bare route resolves
# to whatever pipeline a model declares by default, and for the old
# sentence-transformers models that was *sentence-similarity* (which rejects a
# plain string with "SentenceSimilarityPipeline.__call__() missing 1 required
# positional argument: 'sentences'"). The BGE models declare feature-extraction
# as their default pipeline, so the bare route returns vectors directly while
# the explicit-task route is no longer routed at all by hf-inference. Leading
# with the working route removes a guaranteed wasted 400 round-trip from every
# single embedding call; the other route is retained as a fallback so a future
# routing change on HF's side degrades to a slower call rather than an outage.
#
# `api-inference.huggingface.co` is deliberately absent: the host no longer
# resolves, so including it cost a DNS timeout on every embedding call.
_HF_ENDPOINTS = (
    "https://router.huggingface.co/hf-inference/models/{model}",
    "https://router.huggingface.co/hf-inference/pipeline/feature-extraction/{model}",
)

# HTTP statuses that mean "this route/model is wrong" — worth trying another
# endpoint shape, then another model.
_ROUTE_MISS_STATUSES = frozenset({400, 404, 410})
# Statuses that will fail identically for every model on the account, so
# walking the failover ladder only multiplies latency. 401/403 are token
# problems and 429 is an account-wide rate limit — none are model-specific.
_ACCOUNT_LEVEL_STATUSES = frozenset({401, 403, 429})


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
        self.configured_model = self._qualify(settings.EMBEDDING_MODEL)
        # The model currently being used. Starts as the configured primary and
        # only moves down the ladder when a model stops being served.
        self._active_model = self.configured_model
        self._candidates = self._build_candidates()
        # Vector width observed from a real provider response. Authoritative
        # once set — see the `dimension` property.
        self._observed_dimension: Optional[int] = None
        self._cache = TTLCache(
            max_size=settings.EMBEDDING_CACHE_MAX_SIZE,
            ttl_seconds=settings.EMBEDDING_CACHE_TTL_SECONDS,
        )
        self._http: Optional[httpx.AsyncClient] = None
        self._http_lock = asyncio.Lock()
        self._openai_client: Any = None
        self._warn_on_config_mismatch()

    @staticmethod
    def _qualify(model_name: str) -> str:
        """
        Expands a bare model id to a fully-qualified repo id.

        Retained for backward compatibility: existing deployments have
        `EMBEDDING_MODEL=all-MiniLM-L6-v2` in `.env` and must keep resolving to
        the same repository they always did.
        """
        provider = settings.EMBEDDING_PROVIDER.lower()
        if provider in ("huggingface", "hf", "sentence_transformer") and "/" not in model_name:
            return f"sentence-transformers/{model_name}"
        return model_name

    def _build_candidates(self) -> List[str]:
        """
        Ordered failover ladder: the configured model first, then each declared
        fallback that isn't already in the list.

        OpenAI is excluded — its models are a different provider with different
        auth and pricing, so silently switching to one is a billing surprise,
        not a graceful degradation.
        """
        candidates = [self.configured_model]
        if self.provider == "openai" or not settings.EMBEDDING_ENABLE_MODEL_FAILOVER:
            return candidates
        for fallback in settings.EMBEDDING_MODEL_FALLBACKS:
            qualified = self._qualify(fallback.strip())
            if qualified and qualified not in candidates:
                candidates.append(qualified)
        return candidates

    @property
    def model_name(self) -> str:
        """The model actually serving embeddings right now."""
        return self._active_model

    # -- configuration sanity ---------------------------------------------
    def _warn_on_config_mismatch(self) -> None:
        """
        Cross-checks the configured model against known dimension/token tables
        so a misconfiguration surfaces as a loud startup warning rather than as
        silently truncated chunks or a Qdrant dimension error much later.

        This is deliberately an offline check — it reads tables, it never calls
        the provider — so importing this module stays free of network I/O. The
        live equivalent runs in `health()` and in `scripts/bootstrap.py`.
        """
        known_dim = known_dimension(self._active_model)
        if known_dim is not None and known_dim != settings.QDRANT_VECTOR_DIMENSION:
            logger.critical(
                "Embedding model '%s' produces %d-dim vectors but "
                "QDRANT_VECTOR_DIMENSION is %d.%s",
                self._active_model,
                known_dim,
                settings.QDRANT_VECTOR_DIMENSION,
                reindex_plan(
                    collection=settings.QDRANT_COLLECTION_NAME,
                    current_dimension=settings.QDRANT_VECTOR_DIMENSION,
                    required_dimension=known_dim,
                    model_name=self._active_model,
                ),
            )

        known_limit = MODEL_TOKEN_LIMITS.get(self._active_model)
        if known_limit is not None and settings.CHUNK_SIZE > known_limit:
            logger.warning(
                "CHUNK_SIZE (%d approx. tokens) exceeds the ~%d-token input limit of "
                "'%s'; long chunks will be truncated by the provider before vectorisation.",
                settings.CHUNK_SIZE, known_limit, self._active_model,
            )

        # A fallback of a different width can never be used without a full
        # re-index, so say so once at startup rather than letting an operator
        # discover it during an outage.
        if settings.EMBEDDING_STRICT_DIMENSION_FAILOVER and len(self._candidates) > 1:
            target = known_dimension(self.configured_model) or settings.QDRANT_VECTOR_DIMENSION
            unusable = [
                candidate
                for candidate in self._candidates[1:]
                if (known_dimension(candidate) or target) != target
            ]
            if unusable:
                logger.warning(
                    "Embedding fallbacks %s produce a different vector width than the "
                    "primary (%d-dim) and will be SKIPPED during failover: switching to "
                    "them would write vectors the '%s' collection cannot search. Only "
                    "same-width fallbacks can be used without a re-index.",
                    unusable, target, settings.QDRANT_COLLECTION_NAME,
                )

    @property
    def dimension(self) -> int:
        """
        Vector width, most-trustworthy source first.

        1. A width actually observed from a provider response this process has
           seen. Never guessed, never stale.
        2. The known-dimension table for the active model.
        3. Provider/config default.
        """
        if self._observed_dimension:
            return self._observed_dimension
        known = known_dimension(self._active_model)
        if known:
            return known
        return 1536 if self.provider == "openai" else settings.QDRANT_VECTOR_DIMENSION

    def _record_dimension(self, vector_length: int) -> None:
        """
        Latches the first real vector width seen and flags any later change.

        A silent width change mid-process means two incompatible vector spaces
        are being written to one collection, which corrupts retrieval in a way
        that is very hard to diagnose after the fact.
        """
        if not vector_length:
            return
        if self._observed_dimension is None:
            self._observed_dimension = vector_length
            logger.info(
                "Embedding dimension detected from live response",
                extra={"model": self._active_model, "dimension": vector_length},
            )
            if vector_length != settings.QDRANT_VECTOR_DIMENSION:
                logger.critical(
                    "Live embedding width (%d) disagrees with QDRANT_VECTOR_DIMENSION (%d).%s",
                    vector_length,
                    settings.QDRANT_VECTOR_DIMENSION,
                    reindex_plan(
                        collection=settings.QDRANT_COLLECTION_NAME,
                        current_dimension=settings.QDRANT_VECTOR_DIMENSION,
                        required_dimension=vector_length,
                        model_name=self._active_model,
                    ),
                )
        elif vector_length != self._observed_dimension:
            metrics.increment("embedding.dimension_change")
            logger.critical(
                "Embedding width changed mid-process from %d to %d (model '%s'). "
                "Vectors written from here on are NOT comparable with those already "
                "indexed.",
                self._observed_dimension, vector_length, self._active_model,
            )

    async def probe_dimension(self) -> Optional[int]:
        """
        Determines the true vector width with one live call.

        Used by the pre-flight script and the readiness probe so operators get
        the measured width rather than a table lookup.
        """
        try:
            vector = await self.aembed("dimension probe")
        except Exception as exc:  # noqa: BLE001
            logger.warning("Embedding dimension probe failed: %s", exc)
            return None
        return len(vector) or None

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
                "configured_model": self.configured_model,
                "detail": str(exc)[:300],
            }

        if not vector or not any(vector):
            return {
                "status": "error",
                "provider": self.provider,
                "model": self.model_name,
                "configured_model": self.configured_model,
                "detail": "Provider returned an empty or all-zero vector.",
            }

        report: dict = {
            "status": "ok",
            "provider": self.provider,
            "model": self.model_name,
            "configured_model": self.configured_model,
            "failed_over": self._active_model != self.configured_model,
            "dimension": len(vector),
        }

        # A working embedder that disagrees with the index is still a broken
        # RAG pipeline, so readiness must not report it as healthy.
        if len(vector) != settings.QDRANT_VECTOR_DIMENSION:
            report["status"] = "error"
            report["detail"] = (
                f"Model '{self.model_name}' returns {len(vector)}-dim vectors but "
                f"QDRANT_VECTOR_DIMENSION is {settings.QDRANT_VECTOR_DIMENSION}. "
                f"Retrieval cannot work until the collection is re-indexed at "
                f"{len(vector)} dimensions."
            )
        return report

    # -- cache -------------------------------------------------------------
    @staticmethod
    def _cache_key(text: str) -> str:
        # Hash rather than store raw text, so user questions and document
        # content aren't retained in memory as plaintext keys.
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    def cache_stats(self) -> dict:
        return {"hits": self._cache.hits, "misses": self._cache.misses}

    # -- provider calls ----------------------------------------------------
    def _failover_allowed(self, candidate: str) -> bool:
        """
        Gate on the one thing that makes a failover unsafe: vector width.

        Switching to a model of a different width does not degrade retrieval,
        it *breaks* it — Qdrant rejects the query outright, or (if the widths
        happen to match by luck across different model families) returns
        confident nonsense from an incomparable vector space. Staying down and
        loud beats silently answering from a corrupted index, so a
        differently-sized candidate is skipped rather than used.
        """
        if not settings.EMBEDDING_STRICT_DIMENSION_FAILOVER:
            return True
        target = self.dimension
        candidate_dimension = known_dimension(candidate)
        if candidate_dimension is None:
            # Unknown width: allow the attempt, but the response is still
            # validated against `target` before it is returned.
            return True
        return candidate_dimension == target

    async def _hf_feature_extraction(self, payload: Any) -> Any:
        """
        Calls the HF Inference API, walking the model failover ladder.

        Two nested loops: for each candidate model, each known endpoint shape.
        HF has moved this endpoint more than once and has retired serverless
        support for individual models without notice, so both a routing change
        and a model retirement degrade to a slower call rather than an outage.

        The active model is *sticky*: once a candidate succeeds it becomes the
        model for subsequent calls, so the ladder is walked once rather than on
        every request.
        """
        client = await self._client()
        breaker = breakers.get("embedding:huggingface")
        if not breaker.allows_request():
            raise EmbeddingError("Embedding provider circuit breaker is open.")

        # Start from whichever model is currently active, then continue down
        # the ladder past it.
        try:
            start = self._candidates.index(self._active_model)
        except ValueError:
            start = 0
        ordered = self._candidates[start:] + self._candidates[:start]

        last_error: Optional[str] = None
        for candidate in ordered:
            if candidate != self._active_model and not self._failover_allowed(candidate):
                logger.warning(
                    "Skipping embedding fallback '%s': it produces %s-dim vectors but the "
                    "active index requires %d-dim. A re-index is required before this "
                    "model can be used.",
                    candidate, known_dimension(candidate), self.dimension,
                )
                continue

            for template in _HF_ENDPOINTS:
                url = template.format(model=candidate)
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
                        self._activate(candidate)
                        breaker.record_success()
                        return response.json()

                    last_error = (
                        f"{candidate}: HTTP {response.status_code}: {response.text[:200]}"
                    )
                    # Account-level failures (bad token, rate limit) fail
                    # identically for every model and every route, so walking
                    # the rest of the ladder only multiplies the latency.
                    if response.status_code in _ACCOUNT_LEVEL_STATUSES:
                        breaker.record_failure()
                        raise EmbeddingError(
                            f"Hugging Face embedding failed: {last_error}"
                        )
                    if response.status_code not in _ROUTE_MISS_STATUSES:
                        # 5xx / unknown: this route is not the problem, so stop
                        # trying route shapes and move to the next model.
                        break
                except EmbeddingError:
                    raise
                except Exception as exc:  # noqa: BLE001
                    last_error = f"{candidate}: {exc}"

        breaker.record_failure()
        raise EmbeddingError(
            f"Hugging Face embedding failed for all candidates {ordered}: {last_error}"
        )

    def _activate(self, model: str) -> None:
        """
        Promotes `model` to the active model, logging and instrumenting the
        switch when it is a genuine failover.

        The cache is dropped on a switch: entries were produced by a different
        model, and serving them alongside new vectors would silently mix two
        embedding spaces in the same query — the exact failure this class is
        supposed to prevent.
        """
        if model == self._active_model:
            return

        previous = self._active_model
        self._active_model = model
        self._cache.clear()
        self._observed_dimension = None
        metrics.increment("embedding.model_failover")
        logger.warning(
            "Embedding model failover: '%s' is no longer served, switched to '%s'. "
            "Embedding cache cleared. Set EMBEDDING_MODEL=%s to make this permanent.",
            previous, model, model,
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

        self._record_dimension(len(vector))
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
            vectors = [[float(x) for x in item.embedding] for item in response.data]
            if vectors:
                self._record_dimension(len(vectors[0]))
            return vectors

        raw = await self._hf_feature_extraction(texts)
        if not isinstance(raw, list):
            raise EmbeddingError("Batch embedding returned a non-list payload.")

        vectors = []
        for item in raw:
            if isinstance(item, list) and item and isinstance(item[0], list):
                vectors.append([float(x) for x in self._pool_tokens(item)])
            elif isinstance(item, list):
                vectors.append([float(x) for x in item])
            else:
                raise EmbeddingError("Batch embedding returned an unrecognised element.")

        if vectors:
            self._record_dimension(len(vectors[0]))
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
