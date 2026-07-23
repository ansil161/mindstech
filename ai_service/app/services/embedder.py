import hashlib
import logging
from typing import List
import requests
from app.core.config import settings
from app.core.cache import TTLCache
from app.core.embedding_config import MODEL_DIMENSIONS, MODEL_TOKEN_LIMITS

logger = logging.getLogger(__name__)

# Lazy load clients
_openai_client = None
_hf_client = None

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

def _get_hf_client():
    global _hf_client
    if _hf_client is None:
        try:
            from huggingface_hub import InferenceClient
            logger.info("Initializing Hugging Face InferenceClient...")
            _hf_client = InferenceClient(api_key=settings.HUGGINGFACE_API_KEY)
        except Exception as e:
            logger.exception("Failed to initialize Hugging Face InferenceClient: %s", str(e))
            raise e
    return _hf_client


class Embedder:
    """
    Embedding generation service using Hugging Face's hosted Inference API or OpenAI API.
    Zero local model loading — ultra-lightweight RAM footprint on Render free tier.
    """
    def __init__(self):
        self.provider = settings.EMBEDDING_PROVIDER.lower()
        model_name = settings.EMBEDDING_MODEL
        if self.provider in ("huggingface", "hf", "sentence_transformer") and "/" not in model_name:
            model_name = f"sentence-transformers/{model_name}"
        self.model_name = model_name
        self._cache = TTLCache(
            max_size=settings.EMBEDDING_CACHE_MAX_SIZE,
            ttl_seconds=settings.EMBEDDING_CACHE_TTL_SECONDS,
        )
        self._warn_on_config_mismatch()

    def _warn_on_config_mismatch(self) -> None:
        """
        Cross-checks the configured embedding model against the known
        dimension/token-limit tables so a misconfiguration is caught with a
        loud startup warning instead of surfacing later as silently-truncated
        chunks or a Qdrant dimension mismatch.
        """
        known_dim = MODEL_DIMENSIONS.get(self.model_name)
        if known_dim is not None and known_dim != settings.QDRANT_VECTOR_DIMENSION:
            logger.warning(
                "Configured embedding model '%s' produces %d-dim vectors, but "
                "QDRANT_VECTOR_DIMENSION is set to %d. Qdrant will auto-recreate "
                "the collection to match — if that collection already has real "
                "data, this will delete it. Fix QDRANT_VECTOR_DIMENSION or the "
                "embedding model before this reaches production.",
                self.model_name, known_dim, settings.QDRANT_VECTOR_DIMENSION,
            )

        known_token_limit = MODEL_TOKEN_LIMITS.get(self.model_name)
        if known_token_limit is not None and settings.CHUNK_SIZE > known_token_limit:
            logger.warning(
                "CHUNK_SIZE (%d approx. tokens) exceeds the ~%d-token input limit "
                "of embedding model '%s' — long chunks may be silently truncated "
                "by the embedding provider before they're vectorized. Lower "
                "CHUNK_SIZE or switch models.",
                settings.CHUNK_SIZE, known_token_limit, self.model_name,
            )

    @staticmethod
    def _cache_key(text: str) -> str:
        # Hash rather than store raw text as the cache key so full user/document
        # content isn't retained in memory any longer than the value itself.
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    def _call_huggingface_api(self, input_item) -> List:
        """
        Call Hugging Face Inference API for Feature Extraction / Embeddings using official InferenceClient,
        with HTTP request fallback.
        """
        # Primary method: Official Hugging Face InferenceClient
        try:
            client = _get_hf_client()
            res = client.feature_extraction(input_item, model=self.model_name)
            if hasattr(res, 'tolist'):
                return res.tolist()
            if isinstance(res, list):
                return res
        except Exception as e:
            logger.warning("Hugging Face InferenceClient call failed, trying direct HTTP fallback: %s", str(e))

        # Fallback method: Direct HTTP POST to HF Serverless Router
        api_key = settings.HUGGINGFACE_API_KEY
        headers = {}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"

        urls = [
            f"https://router.huggingface.co/hf-inference/models/{self.model_name}",
            f"https://api-inference.huggingface.co/pipeline/feature-extraction/{self.model_name}",
            f"https://api-inference.huggingface.co/models/{self.model_name}",
        ]

        last_error = None
        for url in urls:
            try:
                response = requests.post(
                    url,
                    headers=headers,
                    json={"inputs": input_item, "options": {"wait_for_model": True}},
                    timeout=30.0
                )
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list):
                        return data
                else:
                    last_error = f"Status {response.status_code}: {response.text[:200]}"
            except Exception as ex:
                last_error = str(ex)

        raise RuntimeError(f"Hugging Face Inference API failed for model '{self.model_name}'. Details: {last_error}")

    def get_embedding(self, text: str) -> List[float]:
        """
        Generate embedding vector (List[float]) for a single text string.
        Returns 384-dim vector for sentence-transformers models.
        Repeated calls with the same text (e.g. the same question asked by
        different users, or a re-ingested identical chunk) are served from an
        in-process cache instead of re-hitting the embedding provider.
        """
        if not text.strip():
            dim = 1536 if self.provider == "openai" else 384
            return [0.0] * dim

        cache_key = self._cache_key(text)
        cached = self._cache.get(cache_key)
        if cached is not None:
            return cached

        if self.provider == "openai":
            client = _get_openai_client()
            response = client.embeddings.create(
                model=self.model_name,
                input=text
            )
            vector = response.data[0].embedding
        else:
            res = self._call_huggingface_api(text)
            # Process vector output from HF API
            if isinstance(res, list) and len(res) > 0 and isinstance(res[0], list):
                # Token-level or batch wrapped: extract 1D vector or pool tokens
                if isinstance(res[0][0], list):
                    doc_tokens = res[0]
                    num_tokens = len(doc_tokens)
                    vec_dim = len(doc_tokens[0])
                    res = [sum(doc_tokens[t][i] for t in range(num_tokens)) / num_tokens for i in range(vec_dim)]
                else:
                    res = res[0]
            vector = [float(x) for x in res]

        self._cache.set(cache_key, vector)
        return vector

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Batch generate embedding vectors (List[List[float]]) for a list of text strings.
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

        res = self._call_huggingface_api(texts)
        # Ensure List[List[float]] output for batch
        out = []
        if isinstance(res, list):
            for item in res:
                if isinstance(item, list) and len(item) > 0 and isinstance(item[0], list):
                    # Pool token-level embeddings if 3D array
                    doc_tokens = item
                    num_tokens = len(doc_tokens)
                    vec_dim = len(doc_tokens[0])
                    item = [sum(doc_tokens[t][i] for t in range(num_tokens)) / num_tokens for i in range(vec_dim)]
                out.append([float(x) for x in item])
        return out

# Singleton instance
embedder = Embedder()
