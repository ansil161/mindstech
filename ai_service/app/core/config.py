import os
from typing import List, Union
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict



class Settings(BaseSettings):
    """
    Application settings containing project config, credentials, model parameters,
    and server settings loaded from environment variables and an optional .env file.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore"
    )

    # Project metadata
    PROJECT_NAME: str = "Mindstec AI Service"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # CORS origins setup
    # Provide an explicit comma-separated list of allowed origins in the environment,
    # e.g. BACKEND_CORS_ORIGINS="https://app.example.com,https://admin.example.com"
    # An empty list disables CORS (safe default for a backend-only microservice).
    # Wildcard "*" is intentionally NOT the default because it cannot be combined
    # with allow_credentials=True per the CORS specification.
    BACKEND_CORS_ORIGINS: List[str] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(f"Invalid CORS origin format: {v}")

    # LLM Settings
    LLM_PROVIDER: str = "openai"  # Supported values: openai, gemini, groq

    OPENAI_API_KEY: str | None = None
    GEMINI_API_KEY: str | None = None
    GROQ_API_KEY: str | None = None
    HUGGINGFACE_API_KEY: str | None = None

    OPENAI_API_KEYS: List[str] = []
    GEMINI_API_KEYS: List[str] = []
    GROQ_API_KEYS: List[str] = []
    
    API_KEY_COOLDOWN_SECONDS: int = 60
    
    # Query Router / Classifier Settings
    QUERY_ALIAS_MAPPING: dict = {
        "AV": "Audio Visual",
        "UC": "Unified Communications"
    }

    # Whether the classifier stage (scope detection + query rewriting) runs at
    # all. When disabled, the raw user question is used for retrieval
    # directly and scope-checking is skipped entirely.
    ENABLE_QUERY_REWRITING: bool = True
    # Attempts before the classifier gives up and the pipeline falls back to
    # the raw question rather than aborting the request.
    CLASSIFIER_MAX_RETRIES: int = 2
    # How many of the most recent chat turns are shown to the classifier so it
    # can resolve follow-ups like "what about that?" into a standalone query.
    HISTORY_WINDOW_MESSAGES: int = 6

    # A/B Testing Flag for Generation Mode
    USE_QUERY_REPLACEMENT: bool = False

    @field_validator("OPENAI_API_KEYS", "GEMINI_API_KEYS", "GROQ_API_KEYS", mode="before")
    @classmethod
    def parse_api_keys(cls, v: Union[str, List[str], None]) -> List[str]:
        if not v:
            return []
        if isinstance(v, str):
            if v.startswith("["):
                import json
                try:
                    return json.loads(v)
                except:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    @model_validator(mode="after")
    def assemble_api_keys_list(self) -> "Settings":
        for provider in ["OPENAI", "GEMINI", "GROQ"]:
            single = getattr(self, f"{provider}_API_KEY")
            plural = getattr(self, f"{provider}_API_KEYS")
            if single and single not in plural:
                plural.insert(0, single)
        return self

    # RAG Validation Messages
    SCOPE_REJECTION_MESSAGE: str = "Hi, I specialize in assisting with Mindstec's professional AV and IT solutions, products, and services. How can I help you with our offerings today?"
    LOW_SIMILARITY_MESSAGE: str = "I don't have details on that specific request at the moment. Would you like to explore our AV/IT products, solutions, or connect with our support team?"
    LLM_UNAVAILABLE_MESSAGE: str = "I'm having a temporary issue generating a response right now. Please try again in a moment, or reach out to our support team if this keeps happening."


    # Embedding Settings
    # Supports Hugging Face Inference API, OpenAI, or sentence_transformer
    EMBEDDING_PROVIDER: str = "huggingface"  # huggingface, sentence_transformer, or openai
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    EMBEDDING_BATCH_SIZE: int = 32
    EMBEDDING_MAX_TOKENS: int = 512
    # In-process cache for repeated embedding calls (per worker, not shared
    # across processes). Set MAX_SIZE to 0 to disable caching entirely.
    EMBEDDING_CACHE_MAX_SIZE: int = 256
    EMBEDDING_CACHE_TTL_SECONDS: int = 300

    # Document Chunking Settings
    # NOTE: these are approximate TOKENS, not characters — estimated via the
    # same chars/4 heuristic already used elsewhere in this codebase for
    # context token-counting, to avoid adding a tokenizer dependency. Defaults
    # sized with headroom under the ~512-token limit of the default embedding
    # model (see app/core/embedding_config.py).
    CHUNK_SIZE: int = 400
    CHUNK_OVERLAP: int = 50

    # Semantic Retrieval Settings
    RETRIEVAL_TOP_K: int = 5
    RETRIEVAL_MIN_SCORE: float = 0.30
    # A stricter threshold than RETRIEVAL_MIN_SCORE: below this, retrieved
    # context is treated as "weak" — still used, but the model is explicitly
    # instructed to hedge rather than state things confidently.
    RETRIEVAL_CONFIDENT_SCORE: float = 0.55
    # How many extra candidates to over-fetch from Qdrant beyond top_k, so
    # dedup/diversity/rerank have real material to work with before the final
    # top_k is selected (i.e. "dynamic" top-k — the final included count can
    # be less than top_k if fewer chunks are actually distinct/relevant).
    RETRIEVAL_OVERFETCH_MULTIPLIER: float = 3.0
    # Hard cap on how many chunks are ever included in one prompt's context,
    # independent of top_k.
    RETRIEVAL_MAX_CONTEXT_CHUNKS: int = 6
    # Diversity guard: at most this many chunks from any single source
    # document, so one long document can't crowd out everything else.
    RETRIEVAL_MAX_CHUNKS_PER_DOCUMENT: int = 2
    # Two chunks whose normalized-text similarity is >= this value are
    # treated as near-duplicates; the lower-scoring one is dropped.
    RETRIEVAL_DEDUP_SIMILARITY_THRESHOLD: float = 0.90
    # Total context budget passed to the LLM, in approximate tokens (same
    # chars/4 heuristic as chunking above).
    RETRIEVAL_MAX_CONTEXT_TOKENS: int = 3000

    RETRIEVAL_ENABLE_RERANK: bool = True
    # Blend weight for the lexical term-overlap signal in the hybrid
    # re-ranker (0 = pure vector score, 1 = pure lexical overlap).
    RERANK_LEXICAL_WEIGHT: float = 0.3

    # Vector Database Settings
    QDRANT_URL: str | None = None
    QDRANT_API_KEY: str | None = None
    QDRANT_COLLECTION_NAME: str = "mindstec_rag"
    QDRANT_VECTOR_DIMENSION: int = 384
    QDRANT_DISTANCE_METRIC: str = "Cosine"  # Options: Cosine, Dot, Euclid
    VECTOR_DB_TIMEOUT_SECONDS: float = 10.0

    # LLM call limits
    LLM_REQUEST_TIMEOUT_SECONDS: float = 20.0
    LLM_MAX_OUTPUT_TOKENS: int = 700

    # Inbound chat message size cap (characters). A validation tightening,
    # not a contract change — legitimate messages are far under this.
    CHAT_MESSAGE_MAX_LENGTH: int = 4000


    # Celery & Redis Settings (Optional for async indexing tasks)
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"


# Instantiate configuration singleton
settings = Settings()
