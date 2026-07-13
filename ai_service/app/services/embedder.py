import logging
from typing import List
from app.core.config import settings

logger = logging.getLogger(__name__)

# Lazy load SentenceTransformer or OpenAI client
_transformer_model = None
_openai_client = None

def _get_transformer_model():
    global _transformer_model
    if _transformer_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            logger.info("Loading SentenceTransformer model '%s'...", settings.EMBEDDING_MODEL)
            _transformer_model = SentenceTransformer(settings.EMBEDDING_MODEL)
            logger.info("SentenceTransformer model loaded successfully.")
        except Exception as e:
            logger.exception("Failed to load SentenceTransformer: %s", str(e))
            raise e
    return _transformer_model

def _get_openai_client():
    global _openai_client
    if _openai_client is None:
        try:
            from openai import OpenAI
            logger.info("Initializing OpenAI client for embeddings...")
            _openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
        except Exception as e:
            logger.exception("Failed to initialize OpenAI client for embeddings: %s", str(e))
            raise e
    return _openai_client

class Embedder:
    """
    Embedding generation service supporting local SentenceTransformers or OpenAI API.
    """
    def __init__(self):
        self.provider = settings.EMBEDDING_PROVIDER.lower()
        self.model_name = settings.EMBEDDING_MODEL

    def get_embedding(self, text: str) -> List[float]:
        """
        Generate embedding vector for a single text input.
        """
        if not text.strip():
            dim = 1536 if self.provider == "openai" else 384
            return [0.0] * dim

        if self.provider == "openai":
            client = _get_openai_client()
            response = client.embeddings.create(
                model=self.model_name,
                input=text
            )
            return response.data[0].embedding
        else:
            model = _get_transformer_model()
            embedding = model.encode(text)
            return embedding.tolist()

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Batch generate embedding vectors for a list of texts.
        """
        if not texts:
            return []

        if self.provider == "openai":
            client = _get_openai_client()
            response = client.embeddings.create(
                model=self.model_name,
                input=texts
            )
            return [item.embedding for item in response.data]
        else:
            model = _get_transformer_model()
            embeddings = model.encode(texts)
            return embeddings.tolist()

# Singleton instance
embedder = Embedder()
