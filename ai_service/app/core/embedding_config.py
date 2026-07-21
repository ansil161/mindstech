from enum import Enum
from typing import Dict


class EmbeddingProviderType(str, Enum):
    """
    Supported embedding provider types.
    """
    HUGGINGFACE = "huggingface"
    SENTENCE_TRANSFORMER = "sentence_transformer"
    OPENAI = "openai"


# Mapping of common models to their output vector dimensions
MODEL_DIMENSIONS: Dict[str, int] = {
    "all-MiniLM-L6-v2": 384,
    "sentence-transformers/all-MiniLM-L6-v2": 384,
    "text-embedding-3-small": 1536,
    "text-embedding-3-large": 3072,
    "text-embedding-ada-002": 1536,
}

# Mapping of common models to their max input context tokens
MODEL_TOKEN_LIMITS: Dict[str, int] = {
    "all-MiniLM-L6-v2": 512,
    "sentence-transformers/all-MiniLM-L6-v2": 512,
    "text-embedding-3-small": 8191,
    "text-embedding-3-large": 8191,
    "text-embedding-ada-002": 8191,
}
