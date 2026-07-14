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
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_URL: str | None = None
    QDRANT_API_KEY: str | None = None
    QDRANT_COLLECTION_NAME: str = "mindstec_rag"
    QDRANT_VECTOR_DIMENSION: int = 1536
    QDRANT_DISTANCE_METRIC: str = "Cosine"  # Options: Cosine, Dot, Euclid

    @classmethod
    def assemble_url(cls, host: str, port: int) -> str:
        return f"http://{host}:{port}"

    @model_validator(mode="after")
    def assemble_qdrant_url(self) -> "Settings":
        if not self.QDRANT_URL:
            self.QDRANT_URL = self.assemble_url(self.QDRANT_HOST, self.QDRANT_PORT)
        return self



    # Celery & Redis Settings (Optional for async indexing tasks)
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"


# Instantiate configuration singleton
settings = Settings()
