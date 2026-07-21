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
    LLM_MODEL: str = "gpt-4o"
    
    OPENAI_API_KEY: str | None = None
    GEMINI_API_KEY: str | None = None
    GROQ_API_KEY: str | None = None

    OPENAI_API_KEYS: List[str] = []
    GEMINI_API_KEYS: List[str] = []
    GROQ_API_KEYS: List[str] = []
    
    API_KEY_COOLDOWN_SECONDS: int = 60
    
    # Query Router Settings
    QUERY_ALIAS_MAPPING: dict = {
        "AV": "Audio Visual",
        "UC": "Unified Communications"
    }
    
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
    SCOPE_REJECTION_MESSAGE: str = "I specialize in assisting with Mindstec's professional AV and IT solutions, products, and services. How can I help you with our offerings today?"
    LOW_SIMILARITY_MESSAGE: str = "I don't have details on that specific request at the moment. Would you like to explore our AV/IT products, solutions, or connect with our support team?"


    # Embedding Settings
    # Supports SentenceTransformers local models or API provider models (e.g. OpenAI)
    EMBEDDING_PROVIDER: str = "sentence_transformer"  # sentence_transformer or openai
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    EMBEDDING_BATCH_SIZE: int = 32
    EMBEDDING_MAX_TOKENS: int = 512

    # Document Chunking Settings
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 100

    # Semantic Retrieval Settings
    RETRIEVAL_TOP_K: int = 5
    RETRIEVAL_MIN_SCORE: float = 0.30
    RETRIEVAL_ENABLE_RERANK: bool = False




    # Vector Database Settings
    QDRANT_URL: str | None = None
    QDRANT_API_KEY: str | None = None
    QDRANT_COLLECTION_NAME: str = "mindstec_rag"
    QDRANT_VECTOR_DIMENSION: int = 1536
    QDRANT_DISTANCE_METRIC: str = "Cosine"  # Options: Cosine, Dot, Euclid





    # Celery & Redis Settings (Optional for async indexing tasks)
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"


# Instantiate configuration singleton
settings = Settings()
