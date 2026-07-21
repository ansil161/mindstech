import logging
from typing import List
import requests
from app.core.config import settings

logger = logging.getLogger(__name__)

# Lazy load OpenAI client if OpenAI is configured as embedding provider
_openai_client = None

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
    Embedding generation service supporting Hugging Face Inference API or OpenAI API.
    Removes local model weight loading to ensure lightweight RAM usage on Render free tier.
    """
    def __init__(self):
        self.provider = settings.EMBEDDING_PROVIDER.lower()
        model_name = settings.EMBEDDING_MODEL
        if self.provider in ("huggingface", "hf", "sentence_transformer") and "/" not in model_name:
            model_name = f"sentence-transformers/{model_name}"
        self.model_name = model_name

    def _call_huggingface_api(self, texts: List[str]) -> List[List[float]]:
        """
        Call Hugging Face hosted Inference API for Feature Extraction / Embeddings.
        """
        api_key = settings.HUGGINGFACE_API_KEY
        headers = {}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"

        # Standard Hugging Face Inference endpoints
        urls = [
            f"https://api-inference.huggingface.co/pipeline/feature-extraction/{self.model_name}",
            f"https://api-inference.huggingface.co/models/{self.model_name}",
            f"https://router.huggingface.co/hf-inference/models/{self.model_name}",
        ]

        last_error = None
        for url in urls:
            try:
                response = requests.post(
                    url,
                    headers=headers,
                    json={"inputs": texts, "options": {"wait_for_model": True}},
                    timeout=30.0
                )
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list):
                        # List of document embeddings: [ [v1, v2...], [v1, v2...] ]
                        if data and isinstance(data[0], list) and (not data[0] or isinstance(data[0][0], (int, float))):
                            return data
                        # Token-level embeddings: [ [ [t1_1...], [t1_2...] ], ... ]
                        elif data and isinstance(data[0], list) and isinstance(data[0][0], list):
                            pooled = []
                            for doc_tokens in data:
                                num_tokens = len(doc_tokens)
                                if num_tokens == 0:
                                    pooled.append([0.0] * 384)
                                    continue
                                vec_dim = len(doc_tokens[0])
                                mean_vec = [
                                    sum(doc_tokens[t][i] for t in range(num_tokens)) / num_tokens
                                    for i in range(vec_dim)
                                ]
                                pooled.append(mean_vec)
                            return pooled
                else:
                    logger.warning("HF Inference API endpoint '%s' status %d: %s", url, response.status_code, response.text[:200])
                    last_error = f"Status {response.status_code}: {response.text[:200]}"
            except Exception as e:
                logger.warning("HF Inference API request to '%s' failed: %s", url, str(e))
                last_error = str(e)

        raise RuntimeError(f"Hugging Face Inference API failed for model '{self.model_name}'. Details: {last_error}")

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
            embeddings = self._call_huggingface_api([text])
            return embeddings[0]

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
            return self._call_huggingface_api(texts)

# Singleton instance
embedder = Embedder()
