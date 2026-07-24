"""
Qdrant access layer.

Three substantive changes from v1:

1. **Async client.** `QdrantClient` is blocking; calling it from an `async def`
   handler stalls the event loop for the duration of the search.
2. **No destructive auto-recreate.** v1 silently ran `delete_collection` +
   `create_collection` whenever the live vector dimension disagreed with
   config. On a production instance that is total, unrecoverable loss of the
   knowledge base triggered by a one-character `.env` typo. It now refuses to
   serve and says exactly what to fix, unless an operator has explicitly set
   QDRANT_ALLOW_DESTRUCTIVE_RECREATE.
3. **Keyword search.** A full-text branch alongside vector search, so exact
   identifiers (part numbers, model codes) that dense embeddings miss are
   still retrievable.

Configuration is read from `settings` rather than `os.getenv`, so `.env`
loading behaves consistently with the rest of the service.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Any, Dict, List, Optional

from qdrant_client import AsyncQdrantClient
from qdrant_client.http import models as qmodels

from app.core.config import settings
from app.core.resilience import breakers

logger = logging.getLogger(__name__)


class VectorStoreMisconfigured(RuntimeError):
    """The live collection is incompatible with the configured embedding model."""


class QdrantManager:
    """Async manager for the Qdrant collection backing retrieval."""

    def __init__(self) -> None:
        self.collection_name = settings.QDRANT_COLLECTION_NAME
        self._client: Optional[AsyncQdrantClient] = None
        self._lock = asyncio.Lock()
        self._ready = False
        self._text_index_ready = False

    # -- lifecycle ---------------------------------------------------------
    @property
    def expected_dimension(self) -> int:
        """
        Vector width a newly created collection should use.

        Sourced from the embedder, which knows the width it actually observed
        from a live response and falls back to its model table and then to
        config. Config alone was not enough: it is the value most likely to be
        stale after a model change, and creating a collection at the wrong
        width is only discoverable after a full re-ingest.

        Imported lazily to keep the storage layer free of an import-time
        dependency on the services layer.
        """
        from app.services.embedder import embedder

        return embedder.dimension or settings.QDRANT_VECTOR_DIMENSION

    @property
    def _distance(self) -> qmodels.Distance:
        metric = (settings.QDRANT_DISTANCE_METRIC or "cosine").lower()
        if metric == "euclid":
            return qmodels.Distance.EUCLID
        if metric == "dot":
            return qmodels.Distance.DOT
        return qmodels.Distance.COSINE

    async def client(self) -> AsyncQdrantClient:
        if self._client is not None and self._ready:
            return self._client
        async with self._lock:
            if self._client is None:
                self._client = AsyncQdrantClient(
                    url=settings.QDRANT_URL,
                    api_key=settings.QDRANT_API_KEY,
                    timeout=settings.VECTOR_DB_TIMEOUT_SECONDS,
                )
            if not self._ready:
                await self._ensure_collection()
                self._ready = True
        return self._client

    async def _ensure_collection(self) -> None:
        """
        Verifies (and, when absent, creates) the collection.

        Never deletes data implicitly — see the class docstring.
        """
        assert self._client is not None
        dimension = self.expected_dimension

        existing = await self._client.get_collections()
        names = {collection.name for collection in existing.collections}

        if self.collection_name not in names:
            logger.info(
                "Creating Qdrant collection",
                extra={"collection": self.collection_name, "dimension": dimension},
            )
            await self._client.create_collection(
                collection_name=self.collection_name,
                vectors_config=qmodels.VectorParams(size=dimension, distance=self._distance),
            )
            await self._ensure_payload_indexes()
            return

        info = await self._client.get_collection(self.collection_name)
        current_dimension = _read_vector_size(info)

        if current_dimension and current_dimension != dimension:
            message = (
                f"Qdrant collection '{self.collection_name}' has {current_dimension}-dim "
                f"vectors but the configured embedding model produces {dimension}-dim "
                f"vectors. Refusing to touch existing data."
            )
            if not settings.QDRANT_ALLOW_DESTRUCTIVE_RECREATE:
                from app.core.embedding_config import reindex_plan
                from app.services.embedder import embedder

                logger.critical(
                    "%s%s",
                    message,
                    reindex_plan(
                        collection=self.collection_name,
                        current_dimension=current_dimension,
                        required_dimension=dimension,
                        model_name=embedder.model_name,
                    ),
                )
                raise VectorStoreMisconfigured(message)

            logger.critical(
                "QDRANT_ALLOW_DESTRUCTIVE_RECREATE is enabled: deleting and recreating "
                "collection '%s'. ALL INDEXED DATA WILL BE LOST.",
                self.collection_name,
            )
            await self._client.delete_collection(self.collection_name)
            await self._client.create_collection(
                collection_name=self.collection_name,
                vectors_config=qmodels.VectorParams(size=dimension, distance=self._distance),
            )

        await self._ensure_payload_indexes()
        logger.info(
            "Qdrant collection verified",
            extra={"collection": self.collection_name, "dimension": current_dimension or dimension},
        )

    async def _ensure_payload_indexes(self) -> None:
        """
        Creates the payload indexes retrieval depends on.

        The full-text index on `content` is what makes the keyword branch
        possible. Filter-field indexes make tenant/category filtering cheap
        instead of a full scan. All are idempotent and non-fatal: an older
        Qdrant that rejects one simply loses that optimisation.
        """
        assert self._client is not None

        try:
            await self._client.create_payload_index(
                collection_name=self.collection_name,
                field_name="content",
                field_schema=qmodels.TextIndexParams(
                    type=qmodels.TextIndexType.TEXT,
                    tokenizer=qmodels.TokenizerType.WORD,
                    min_token_len=2,
                    max_token_len=25,
                    lowercase=True,
                ),
            )
            self._text_index_ready = True
            logger.info("Full-text payload index ready on 'content'.")
        except Exception as exc:  # noqa: BLE001 - already exists, or unsupported
            message = str(exc).lower()
            self._text_index_ready = "already exists" in message or "exists" in message
            if not self._text_index_ready:
                logger.warning("Full-text index unavailable; keyword retrieval disabled: %s", exc)

        for field in ("document_id", "tenant_id", "category"):
            try:
                await self._client.create_payload_index(
                    collection_name=self.collection_name,
                    field_name=field,
                    field_schema=qmodels.PayloadSchemaType.KEYWORD,
                )
            except Exception:  # noqa: BLE001 - idempotent; already-exists is fine
                pass

    async def close(self) -> None:
        if self._client is not None:
            try:
                await self._client.close()
            except Exception:  # noqa: BLE001 - shutdown must not raise
                pass
            self._client = None
            self._ready = False

    # -- filters -----------------------------------------------------------
    @staticmethod
    def _build_filter(filters: Optional[Dict[str, Any]]) -> Optional[qmodels.Filter]:
        if not filters:
            return None
        conditions = [
            qmodels.FieldCondition(key=key, match=qmodels.MatchValue(value=value))
            for key, value in filters.items()
            if value is not None
        ]
        return qmodels.Filter(must=conditions) if conditions else None

    # -- writes ------------------------------------------------------------
    async def upsert_points(self, points: List[qmodels.PointStruct]) -> bool:
        """Batch upsert. Batching matters: one call per chunk is a round-trip per chunk."""
        if not points:
            return True
        try:
            client = await self.client()
            await client.upsert(collection_name=self.collection_name, points=points, wait=True)
            logger.info("Upserted points to Qdrant", extra={"point_count": len(points)})
            return True
        except Exception as exc:  # noqa: BLE001
            logger.error("Qdrant batch upsert failed: %s", exc)
            return False

    async def upsert_document(
        self, document_id: str, vector: List[float], payload: Dict[str, Any]
    ) -> bool:
        return await self.upsert_points(
            [qmodels.PointStruct(id=document_id, vector=vector, payload=payload)]
        )

    async def delete_document(self, document_id: str) -> bool:
        """Deletes every chunk belonging to a logical document."""
        try:
            client = await self.client()
            await client.delete(
                collection_name=self.collection_name,
                points_selector=qmodels.FilterSelector(
                    filter=qmodels.Filter(
                        must=[
                            qmodels.FieldCondition(
                                key="document_id",
                                match=qmodels.MatchValue(value=document_id),
                            )
                        ]
                    )
                ),
                wait=True,
            )
            logger.info("Deleted document chunks", extra={"document_id": document_id})
            return True
        except Exception as exc:  # noqa: BLE001
            logger.error("Failed to delete document %s: %s", document_id, exc)
            return False

    # -- reads -------------------------------------------------------------
    async def search_similar(
        self,
        query_vector: List[float],
        limit: int = 5,
        min_score: float = 0.0,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """Dense vector search. Returns [] on failure so retrieval degrades."""
        breaker = breakers.get("qdrant")
        if not breaker.allows_request():
            logger.warning("Qdrant circuit breaker open; skipping vector search.")
            return []
        try:
            client = await self.client()
            response = await client.query_points(
                collection_name=self.collection_name,
                query=query_vector,
                limit=limit,
                query_filter=self._build_filter(filters),
                score_threshold=min_score if min_score > 0 else None,
                with_payload=True,
            )
            breaker.record_success()
            return [
                {"id": point.id, "score": float(point.score), "payload": point.payload or {}}
                for point in response.points
            ]
        except VectorStoreMisconfigured:
            raise
        except Exception as exc:  # noqa: BLE001
            breaker.record_failure()
            logger.error("Qdrant vector search failed: %s", exc)
            return []

    async def search_keyword(
        self,
        keywords: List[str],
        limit: int = 10,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Full-text branch of hybrid retrieval.

        Uses Qdrant's text index with a `should` clause, so a chunk matching
        any keyword is a candidate and chunks matching more of them rank
        higher. Scrolled rather than scored — Qdrant filter matches have no
        similarity score — so results are returned in match-count order and
        fused by rank downstream.
        """
        if not keywords or not settings.RETRIEVAL_ENABLE_HYBRID:
            return []
        if not self._text_index_ready:
            return []

        try:
            client = await self.client()
            should = [
                qmodels.FieldCondition(key="content", match=qmodels.MatchText(text=keyword))
                for keyword in keywords[:8]
            ]
            must = []
            base_filter = self._build_filter(filters)
            if base_filter is not None and base_filter.must:
                must = list(base_filter.must)

            records, _ = await client.scroll(
                collection_name=self.collection_name,
                scroll_filter=qmodels.Filter(should=should, must=must or None),
                limit=limit,
                with_payload=True,
                with_vectors=False,
            )

            keyword_set = {k.lower() for k in keywords}
            results: List[Dict[str, Any]] = []
            for record in records:
                payload = record.payload or {}
                content = str(payload.get("content", "")).lower()
                matches = sum(1 for keyword in keyword_set if keyword in content)
                results.append(
                    {
                        "id": record.id,
                        # Not a similarity score; a normalised match count used
                        # only for ordering within this branch.
                        "score": matches / max(1, len(keyword_set)),
                        "payload": payload,
                        "_keyword_matches": matches,
                    }
                )

            results.sort(key=lambda item: item["_keyword_matches"], reverse=True)
            return results
        except Exception as exc:  # noqa: BLE001
            logger.warning("Keyword search failed, continuing with vector results only: %s", exc)
            return []

    async def health(self) -> Dict[str, Any]:
        """Readiness detail for the health endpoint."""
        try:
            client = await self.client()
            info = await client.get_collection(self.collection_name)
            return {
                "status": "ok",
                "collection": self.collection_name,
                "vectors": getattr(info, "points_count", None),
                "dimension": _read_vector_size(info),
                "text_index": self._text_index_ready,
            }
        except Exception as exc:  # noqa: BLE001
            return {"status": "error", "detail": str(exc)}


def _read_vector_size(collection_info: Any) -> Optional[int]:
    """
    Extracts the vector dimension across Qdrant's named/unnamed vector shapes.
    """
    try:
        vectors = collection_info.config.params.vectors
    except AttributeError:
        return None
    if vectors is None:
        return None
    if hasattr(vectors, "size"):
        return int(vectors.size)
    if isinstance(vectors, dict):
        params = vectors.get("") or next(iter(vectors.values()), None)
        if params is not None and hasattr(params, "size"):
            return int(params.size)
    return None


vector_db_manager = QdrantManager()
