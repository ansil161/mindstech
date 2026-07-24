"""
Embedding model metadata and the failover ladder.

The dimension/token tables here are *hints* used for pre-flight warnings and
for deciding whether a failover candidate is safe to switch to. They are never
the final word on vector width: `Embedder` learns the real dimension from the
first successful provider response and that observed value always wins (see
`Embedder.dimension`). A stale entry in this table therefore degrades to a
misleading log line, never to a wrong vector being written to Qdrant.
"""
from enum import Enum
from typing import Dict, Tuple


class EmbeddingProviderType(str, Enum):
    """
    Supported embedding provider types.
    """
    HUGGINGFACE = "huggingface"
    SENTENCE_TRANSFORMER = "sentence_transformer"
    OPENAI = "openai"


# Verified against the live Hugging Face Inference API (router.huggingface.co,
# hf-inference provider) on 2026-07-24:
#
#   BAAI/bge-base-en-v1.5    200 -> 768-dim, L2-normalised   SERVED
#   BAAI/bge-small-en-v1.5   200 -> 384-dim, L2-normalised   SERVED
#   intfloat/e5-base-v2      400 -> SentenceSimilarityPipeline  NOT SERVED
#   intfloat/e5-small-v2     400 -> SentenceSimilarityPipeline  NOT SERVED
#   sentence-transformers/all-MiniLM-L6-v2
#                            400 -> SentenceSimilarityPipeline  NOT SERVED
#
# The e5 models and the legacy MiniLM model still resolve as repositories but
# hf-inference only exposes them under the *sentence-similarity* task, which
# requires a {"source_sentence", "sentences"} payload and returns similarity
# scores rather than vectors. They cannot produce embeddings through this API
# and are kept in the ladder only because they are explicitly configured; the
# runtime skips them automatically once they fail.
DEFAULT_EMBEDDING_MODEL = "BAAI/bge-base-en-v1.5"

# Ordered failover ladder. The first entry is the configured primary; the rest
# are tried in order when the active model stops being served.
DEFAULT_EMBEDDING_FALLBACKS: Tuple[str, ...] = (
    "BAAI/bge-small-en-v1.5",
    "intfloat/e5-base-v2",
    "intfloat/e5-small-v2",
)

# Mapping of common models to their output vector dimensions
MODEL_DIMENSIONS: Dict[str, int] = {
    # BAAI BGE v1.5 — served by the HF Inference API, normalised output.
    "BAAI/bge-base-en-v1.5": 768,
    "BAAI/bge-small-en-v1.5": 384,
    "BAAI/bge-large-en-v1.5": 1024,
    # intfloat E5 v2 — repositories exist but are not served for
    # feature-extraction; retained so the ladder can reason about them.
    "intfloat/e5-base-v2": 768,
    "intfloat/e5-small-v2": 384,
    "intfloat/e5-large-v2": 1024,
    # Legacy / retired for serverless inference.
    "all-MiniLM-L6-v2": 384,
    "sentence-transformers/all-MiniLM-L6-v2": 384,
    # OpenAI.
    "text-embedding-3-small": 1536,
    "text-embedding-3-large": 3072,
    "text-embedding-ada-002": 1536,
}

# Mapping of common models to their max input context tokens
MODEL_TOKEN_LIMITS: Dict[str, int] = {
    "BAAI/bge-base-en-v1.5": 512,
    "BAAI/bge-small-en-v1.5": 512,
    "BAAI/bge-large-en-v1.5": 512,
    "intfloat/e5-base-v2": 512,
    "intfloat/e5-small-v2": 512,
    "intfloat/e5-large-v2": 512,
    "all-MiniLM-L6-v2": 512,
    "sentence-transformers/all-MiniLM-L6-v2": 512,
    "text-embedding-3-small": 8191,
    "text-embedding-3-large": 8191,
    "text-embedding-ada-002": 8191,
}


def known_dimension(model_name: str) -> int | None:
    """Table lookup for a model's vector width, or None when unknown."""
    return MODEL_DIMENSIONS.get(model_name)


def reindex_plan(
    *,
    collection: str,
    current_dimension: int | None,
    required_dimension: int,
    model_name: str,
) -> str:
    """
    Builds the operator-facing re-index runbook printed on a dimension clash.

    Lives here rather than in the vector store so both the offline config check
    (`Embedder`) and the live collection check (`QdrantManager`) emit exactly
    the same instructions — an operator should never see two different
    recoveries for the same underlying problem.
    """
    return (
        "\n"
        "==================== EMBEDDING DIMENSION MISMATCH ====================\n"
        f"  Collection            : {collection}\n"
        f"  Existing vector width : {current_dimension if current_dimension is not None else 'unknown'}\n"
        f"  Required vector width : {required_dimension}  (model: {model_name})\n"
        "\n"
        "  WHY THIS IS INCOMPATIBLE\n"
        "  Vectors from two different embedding models occupy different vector\n"
        "  spaces. Even at equal width their coordinates are not comparable, and\n"
        "  at unequal width Qdrant rejects the search outright. Existing vectors\n"
        "  CANNOT be reused, converted or padded - they must be regenerated from\n"
        "  the source documents.\n"
        "\n"
        "  NOTHING HAS BEEN DELETED. The collection is untouched.\n"
        "\n"
        "  RE-INDEX RUNBOOK (run from ai_service/)\n"
        "    1. Confirm the new model actually serves embeddings:\n"
        "         python scripts/bootstrap.py --check\n"
        "\n"
        "    2. Back the current collection up (Qdrant Cloud: Snapshots tab, or)\n"
        "         curl -X POST \"$QDRANT_URL/collections/"
        f"{collection}/snapshots\" \\\n"
        "              -H \"api-key: $QDRANT_API_KEY\"\n"
        "\n"
        "    3. Point config at the new model and width:\n"
        f"         EMBEDDING_MODEL={model_name}\n"
        f"         QDRANT_VECTOR_DIMENSION={required_dimension}\n"
        "\n"
        "    4. Recreate the collection at the new width (DESTRUCTIVE - requires\n"
        "       an explicit confirmation flag):\n"
        "         python scripts/recreate_qdrant_collection.py --yes\n"
        "\n"
        "    5. Re-ingest every source document so vectors are regenerated with\n"
        "       the new model, then verify:\n"
        "         python scripts/bootstrap.py --check\n"
        "\n"
        "  Until step 5 completes, retrieval will return no results.\n"
        "=====================================================================\n"
    )
