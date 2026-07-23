import logging
from typing import Any, Dict, List, Optional
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from qdrant_client.http.exceptions import UnexpectedResponse
from app.core.config import settings

logger = logging.getLogger(__name__)

class QdrantManager:
    """
    Manager class to handle connection and operations on Qdrant Vector Database.
    """
    def __init__(self):
        self.collection_name = settings.QDRANT_COLLECTION_NAME
        self._client = None

    @property
    def client(self):
        if self._client is None:
            import os
            # Connect to Qdrant
            self._client = QdrantClient(
                url=os.getenv("QDRANT_URL"),
                api_key=os.getenv("QDRANT_API_KEY"),
                timeout=settings.VECTOR_DB_TIMEOUT_SECONDS,
            )
            self._ensure_collection_exists()
        return self._client

    def _ensure_collection_exists(self):
        """Checks if the collection exists, verifies vector dimension, and creates/recreates if needed."""
        try:
            collections = self._client.get_collections().collections
            collection_names = [col.name for col in collections]
            
            # Decide vector dimension based on configuration and provider
            dimension = 384
            if settings.EMBEDDING_PROVIDER == "openai":
                dimension = 1536
            elif settings.QDRANT_VECTOR_DIMENSION:
                dimension = settings.QDRANT_VECTOR_DIMENSION

            distance = qmodels.Distance.COSINE
            if settings.QDRANT_DISTANCE_METRIC.lower() == "euclid":
                distance = qmodels.Distance.EUCLID
            elif settings.QDRANT_DISTANCE_METRIC.lower() == "dot":
                distance = qmodels.Distance.DOT

            if self.collection_name not in collection_names:
                logger.info(
                    "Collection '%s' does not exist. Creating it now with dimension %d and distance %s.",
                    self.collection_name, dimension, distance
                )
                self._client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=qmodels.VectorParams(
                        size=dimension,
                        distance=distance
                    )
                )
                logger.info("Successfully created Qdrant collection '%s'.", self.collection_name)
            else:
                # Collection exists: verify the dimension
                collection_info = self._client.get_collection(self.collection_name)
                current_dim = None
                if hasattr(collection_info.config.params.vectors, 'size'):
                    current_dim = collection_info.config.params.vectors.size
                elif isinstance(collection_info.config.params.vectors, dict):
                    vec_params = collection_info.config.params.vectors.get("") or next(iter(collection_info.config.params.vectors.values()), None)
                    if vec_params and hasattr(vec_params, 'size'):
                        current_dim = vec_params.size

                if current_dim and current_dim != dimension:
                    logger.error(
                        "Qdrant collection '%s' dimension mismatch! Expected: %d, Actual in Qdrant: %d. Recreating collection with size=%d...",
                        self.collection_name, dimension, current_dim, dimension
                    )
                    self._client.delete_collection(self.collection_name)
                    self._client.create_collection(
                        collection_name=self.collection_name,
                        vectors_config=qmodels.VectorParams(
                            size=dimension,
                            distance=distance
                        )
                    )
                    logger.info(
                        "Successfully recreated Qdrant collection '%s' with dimension %d.",
                        self.collection_name, dimension
                    )
                else:
                    logger.info("Qdrant collection '%s' verified with vector dimension %d.", self.collection_name, current_dim or dimension)
        except Exception as e:
            logger.exception("Error checking/creating Qdrant collection: %s", str(e))

    def upsert_document(
        self,
        document_id: str,
        vector: List[float],
        payload: Dict[str, Any]
    ) -> bool:
        """
        Upsert a document chunk vector into Qdrant.
        """
        try:
            self.client.upsert(
                collection_name=self.collection_name,
                points=[
                    qmodels.PointStruct(
                        id=document_id,
                        vector=vector,
                        payload=payload
                    )
                ]
            )
            logger.info("Successfully upserted point ID %s to Qdrant.", document_id)
            return True
        except UnexpectedResponse as e:
            logger.error(
                "Qdrant API UnexpectedResponse during upsert for point ID %s: %s (Vector dimension error: sent vector length %d)",
                document_id, str(e), len(vector)
            )
            return False
        except Exception as e:
            logger.error("Failed to upsert point ID %s to Qdrant: %s", document_id, str(e))
            return False

    def delete_document(self, document_id: str) -> bool:
        """
        Delete a document and all its matching vector chunks from Qdrant.
        """
        try:
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=qmodels.FilterSelector(
                    filter=qmodels.Filter(
                        must=[
                            qmodels.FieldCondition(
                                key="document_id",
                                match=qmodels.MatchValue(value=document_id)
                            )
                        ]
                    )
                )
            )
            logger.info("Deleted chunks for document ID %s from Qdrant.", document_id)
            return True
        except Exception as e:
            logger.error("Failed to delete chunks for document ID %s from Qdrant: %s", document_id, str(e))
            return False

    def search_similar(
        self,
        query_vector: List[float],
        limit: int = 5,
        min_score: float = 0.0,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Perform a semantic similarity vector search.
        """
        try:
            q_filters = None
            if filters:
                filter_conditions = []
                for key, val in filters.items():
                    if val is not None:
                        filter_conditions.append(
                            qmodels.FieldCondition(
                                key=key,
                                match=qmodels.MatchValue(value=val)
                            )
                        )
                if filter_conditions:
                    q_filters = qmodels.Filter(must=filter_conditions)

            search_results = self.client.query_points(
                collection_name=self.collection_name,
                query=query_vector,
                limit=limit,
                query_filter=q_filters,
                score_threshold=min_score if min_score > 0 else None
            )

            results = []
            for hit in search_results.points:
                results.append({
                    "id": hit.id,
                    "score": hit.score,
                    "payload": hit.payload or {}
                })
            return results
        except Exception as e:
            logger.error("Failed to execute similarity search in Qdrant: %s", str(e))
            return []

# Singleton instance
vector_db_manager = QdrantManager()
