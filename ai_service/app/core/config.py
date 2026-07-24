"""
Central application configuration.

Every tunable in this service is declared here and sourced from the
environment (or an optional `.env`) — no magic numbers are permitted in
service code. Values are grouped by subsystem and each carries a comment
explaining what moving it actually does, because these knobs are the primary
operational lever for latency/cost/quality trade-offs in production.
"""
import json
import logging
from typing import Dict, List, Union

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    """
    Application settings containing project config, credentials, model
    parameters, retrieval tuning, conversation behaviour, and server settings.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )

    # ------------------------------------------------------------------
    # Project metadata
    # ------------------------------------------------------------------
    PROJECT_NAME: str = "Mindstec AI Service"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    SERVICE_VERSION: str = "2.0.0"

    # Human-readable identity used by the conversation layer for identity
    # questions and in prompts. Keeping it in config (not hardcoded in a
    # prompt string) means a rebrand is a config change, not a code change.
    COMPANY_NAME: str = "Mindstec Distribution India"
    COMPANY_SHORT_NAME: str = "Mindstec"
    ASSISTANT_NAME: str = "the Mindstec AI assistant"

    # ------------------------------------------------------------------
    # Internal service authentication
    # ------------------------------------------------------------------
    # Declared here so it is loaded from `.env` like every other setting.
    # v1 read this only via os.getenv, which does NOT see `.env` — pydantic
    # loads that file into Settings, not into the process environment. The
    # result was that a key configured in `.env` was invisible to the auth
    # check and every request failed 503, while the same key worked under
    # Docker (where env_file exports it into the real environment).
    # A live environment variable still wins, so rotation without a restart
    # keeps working.
    AI_SERVICE_API_KEY: str | None = None

    # ------------------------------------------------------------------
    # CORS
    # ------------------------------------------------------------------
    # Explicit comma-separated origins, e.g.
    #   BACKEND_CORS_ORIGINS="https://app.example.com,https://admin.example.com"
    # Empty disables CORS (correct default for a backend-only microservice
    # reached only through Django/Nginx, never directly from a browser).
    BACKEND_CORS_ORIGINS: List[str] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        if isinstance(v, (list, str)):
            return v
        raise ValueError(f"Invalid CORS origin format: {v}")

    # ------------------------------------------------------------------
    # LLM providers
    # ------------------------------------------------------------------
    LLM_PROVIDER: str = "openai"  # openai | gemini | groq

    OPENAI_API_KEY: str | None = None
    GEMINI_API_KEY: str | None = None
    GROQ_API_KEY: str | None = None
    HUGGINGFACE_API_KEY: str | None = None

    OPENAI_API_KEYS: List[str] = []
    GEMINI_API_KEYS: List[str] = []
    GROQ_API_KEYS: List[str] = []

    # Default model per provider. Previously hardcoded inside llm.py.
    #
    # GEMINI_MODEL was "gemini-1.5-flash", which Google has retired — live
    # calls returned 404 NOT_FOUND, so every Gemini attempt failed over to
    # another provider, costing a wasted round-trip on each turn while looking
    # fine from the outside.
    #
    # The replacement is the floating "-latest" alias rather than a pinned
    # version, which is the opposite of the usual preference. Verified against
    # a live key: gemini-2.5-flash and -2.5-flash-lite return "no longer
    # available to new users", and gemini-2.0-flash is quota-restricted. The
    # alias is the only reliably reachable option, and Gemini is the *last*
    # entry in the failover chain — drift there is far cheaper than a fallback
    # provider that is permanently dead. Pin this to a specific version once
    # the account has confirmed access to one.
    OPENAI_MODEL: str = "gpt-4o-mini"
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GEMINI_MODEL: str = "gemini-flash-latest"

    # A key that returns a quota/auth error is parked for this long before
    # it is tried again, so a burned key doesn't cost latency on every turn.
    API_KEY_COOLDOWN_SECONDS: int = 60

    # Generation defaults.
    LLM_TEMPERATURE: float = 0.2
    LLM_REQUEST_TIMEOUT_SECONDS: float = 20.0
    LLM_MAX_OUTPUT_TOKENS: int = 700
    # Cheaper/faster settings for the auxiliary classification call, which
    # emits a few dozen tokens of JSON and never needs the main model budget.
    LLM_CLASSIFIER_TIMEOUT_SECONDS: float = 8.0
    LLM_CLASSIFIER_MAX_OUTPUT_TOKENS: int = 200

    # Transient-failure retry (network blips, 5xx). Distinct from key
    # rotation, which handles quota/auth failures.
    LLM_MAX_RETRIES: int = 2
    LLM_RETRY_BASE_DELAY_SECONDS: float = 0.4
    LLM_RETRY_MAX_DELAY_SECONDS: float = 4.0

    # Circuit breaker: after this many consecutive failures a provider is
    # skipped entirely for the reset window, instead of being retried (and
    # timing out) on every single request while it is down.
    CIRCUIT_BREAKER_FAILURE_THRESHOLD: int = 5
    CIRCUIT_BREAKER_RESET_SECONDS: float = 30.0

    # ------------------------------------------------------------------
    # Conversation engine
    # ------------------------------------------------------------------
    # Master switch for the intent/dialogue layer. Disabling it routes every
    # message straight to RAG (the legacy v1 behaviour) — kept as an escape
    # hatch for incident response, not as a supported mode.
    ENABLE_CONVERSATION_ENGINE: bool = True

    # Tier-2 LLM intent classification. Tier 1 (deterministic rules) always
    # runs first and resolves the majority of turns at zero cost; this only
    # controls whether ambiguous turns get an LLM opinion.
    ENABLE_LLM_INTENT_CLASSIFICATION: bool = True
    # Legacy alias retained so existing deployments' .env keeps working.
    ENABLE_QUERY_REWRITING: bool = True
    CLASSIFIER_MAX_RETRIES: int = 2

    # Rolling window of prior turns shown to the model and to the classifier.
    HISTORY_WINDOW_MESSAGES: int = 6
    # Hard cap on messages retained per conversation. Beyond this the oldest
    # turns are trimmed, which is what stops Redis lists (and the in-memory
    # fallback) from growing without bound.
    HISTORY_MAX_MESSAGES: int = 40
    HISTORY_TTL_SECONDS: int = 604800  # 7 days
    # Per-message cap when replaying history into a prompt, so one pasted
    # wall of text can't consume the whole context budget on later turns.
    HISTORY_MESSAGE_MAX_CHARS: int = 1500
    # Ceiling on distinct conversations held in the per-process fallback map
    # when Redis is unavailable (LRU-evicted). Prevents an unbounded leak.
    HISTORY_MEMORY_MAX_CONVERSATIONS: int = 500

    # Structured company FAQ answered without vector search.
    ENABLE_FAQ_LAYER: bool = True
    # Minimum match confidence (0-1) before an FAQ entry answers directly.
    # Below this the turn falls through to normal retrieval.
    FAQ_MIN_CONFIDENCE: float = 0.62

    # ------------------------------------------------------------------
    # Query understanding
    # ------------------------------------------------------------------
    QUERY_ALIAS_MAPPING: Dict[str, str] = {
        "AV": "Audio Visual",
        "UC": "Unified Communications",
        "DS": "Digital Signage",
        "LED": "LED display",
        "KVM": "Keyboard Video Mouse switching",
        "PTZ": "Pan Tilt Zoom camera",
        "DSP": "Digital Signal Processor",
        "NVX": "Crestron DM NVX AV-over-IP",
    }

    # A/B flag preserved from v1: send the rewritten query to the generator
    # instead of the raw user text.
    USE_QUERY_REPLACEMENT: bool = False

    @field_validator("OPENAI_API_KEYS", "GEMINI_API_KEYS", "GROQ_API_KEYS", mode="before")
    @classmethod
    def parse_api_keys(cls, v: Union[str, List[str], None]) -> List[str]:
        if not v:
            return []
        if isinstance(v, str):
            if v.startswith("["):
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    # Fall through to comma-splitting rather than silently
                    # returning nothing — a malformed JSON list is far more
                    # likely a quoting mistake than an intentional empty set.
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    @model_validator(mode="after")
    def assemble_api_keys_list(self) -> "Settings":
        for provider in ("OPENAI", "GEMINI", "GROQ"):
            single = getattr(self, f"{provider}_API_KEY")
            plural = getattr(self, f"{provider}_API_KEYS")
            if single and single not in plural:
                plural.insert(0, single)
        return self

    # ------------------------------------------------------------------
    # Canned responses
    # ------------------------------------------------------------------
    # These are the graceful-degradation strings. They are deliberately
    # settings rather than literals so a deployment can retune tone without
    # a code change, and so tests can assert against them by reference.
    SCOPE_REJECTION_MESSAGE: str = (
        "I focus on Mindstec's professional AV and IT solutions — products, brands, "
        "projects and support. Ask me anything in that space and I'll help."
    )
    LOW_SIMILARITY_MESSAGE: str = (
        "I don't have that specific detail on hand. I can help with our AV and IT "
        "product lines, the brands we distribute, our regional operations, or putting "
        "you in touch with the team — which would be most useful?"
    )
    LLM_UNAVAILABLE_MESSAGE: str = (
        "I'm having a temporary issue generating a response right now. Please try "
        "again in a moment, or reach out to our support team if this keeps happening."
    )
    RATE_LIMITED_MESSAGE: str = (
        "You're sending messages faster than I can answer them. Give me a few seconds "
        "and try again."
    )

    # ------------------------------------------------------------------
    # Embeddings
    # ------------------------------------------------------------------
    EMBEDDING_PROVIDER: str = "huggingface"  # huggingface | sentence_transformer | openai
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    EMBEDDING_BATCH_SIZE: int = 32
    EMBEDDING_MAX_TOKENS: int = 512
    EMBEDDING_REQUEST_TIMEOUT_SECONDS: float = 20.0
    EMBEDDING_MAX_RETRIES: int = 2
    # In-process cache (per worker, not shared). Sized generously because a
    # cached query embedding removes an entire network round-trip from the
    # critical path, and vectors are only a few KB each.
    EMBEDDING_CACHE_MAX_SIZE: int = 2048
    EMBEDDING_CACHE_TTL_SECONDS: int = 3600

    # ------------------------------------------------------------------
    # Chunking (approximate tokens via the chars/4 heuristic used throughout)
    # ------------------------------------------------------------------
    CHUNK_SIZE: int = 400
    CHUNK_OVERLAP: int = 50
    # Upper bound on a single ingested document's raw content, to stop an
    # accidental multi-hundred-MB paste from OOM-ing a worker.
    INGEST_MAX_CONTENT_CHARS: int = 2_000_000
    INGEST_MAX_UPLOAD_BYTES: int = 25 * 1024 * 1024

    # ------------------------------------------------------------------
    # Retrieval
    # ------------------------------------------------------------------
    RETRIEVAL_TOP_K: int = 5
    RETRIEVAL_MIN_SCORE: float = 0.30
    # Below this *raw vector* score the grounding is treated as weak: the
    # answer is still generated, but the model is told to hedge.
    RETRIEVAL_CONFIDENT_SCORE: float = 0.55
    RETRIEVAL_OVERFETCH_MULTIPLIER: float = 3.0
    RETRIEVAL_MAX_CONTEXT_CHUNKS: int = 6
    RETRIEVAL_MAX_CHUNKS_PER_DOCUMENT: int = 2
    RETRIEVAL_DEDUP_SIMILARITY_THRESHOLD: float = 0.90
    RETRIEVAL_MAX_CONTEXT_TOKENS: int = 3000

    RETRIEVAL_ENABLE_RERANK: bool = True
    RERANK_LEXICAL_WEIGHT: float = 0.3

    # Hybrid retrieval: run a keyword/full-text branch alongside the vector
    # branch and fuse the two ranked lists. Recovers exact identifiers
    # (part numbers, model codes) that dense embeddings routinely miss.
    RETRIEVAL_ENABLE_HYBRID: bool = True
    RETRIEVAL_KEYWORD_LIMIT: int = 10
    # Reciprocal Rank Fusion constant. 60 is the value from the original RRF
    # paper and is a sane default; lower values sharpen the top of the list.
    RETRIEVAL_RRF_K: int = 60

    # Multi-query expansion: issue the alias-expanded and entity-focused
    # variants of a query alongside the original and fuse the results.
    RETRIEVAL_ENABLE_MULTI_QUERY: bool = True
    RETRIEVAL_MAX_QUERY_VARIANTS: int = 3

    # Fallback ladder: when the first retrieval pass returns nothing above
    # threshold, retry with a relaxed score floor before declining.
    RETRIEVAL_ENABLE_FALLBACK_RETRY: bool = True
    RETRIEVAL_FALLBACK_MIN_SCORE: float = 0.18

    # ------------------------------------------------------------------
    # Vector database
    # ------------------------------------------------------------------
    QDRANT_URL: str | None = None
    QDRANT_API_KEY: str | None = None
    QDRANT_COLLECTION_NAME: str = "mindstec_rag"
    QDRANT_VECTOR_DIMENSION: int = 384
    QDRANT_DISTANCE_METRIC: str = "Cosine"  # Cosine | Dot | Euclid
    VECTOR_DB_TIMEOUT_SECONDS: float = 10.0
    # Guard rail: when the live collection's dimension disagrees with config,
    # refuse to serve rather than silently deleting and recreating it. Only
    # set this true for a deliberate, supervised re-index.
    QDRANT_ALLOW_DESTRUCTIVE_RECREATE: bool = False

    # ------------------------------------------------------------------
    # API surface / safety
    # ------------------------------------------------------------------
    CHAT_MESSAGE_MAX_LENGTH: int = 4000
    ENABLE_STREAMING: bool = True

    # Per-conversation token bucket. Sized for a human typing in a widget;
    # generous enough that no real user will ever see it.
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 20
    RATE_LIMIT_WINDOW_SECONDS: int = 60

    ENABLE_PROMPT_INJECTION_GUARD: bool = True
    ENABLE_OUTPUT_GUARD: bool = True

    # ------------------------------------------------------------------
    # Session store / Redis
    # ------------------------------------------------------------------
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    # Dedicated URL for conversation state; defaults to the broker URL so
    # existing single-Redis deployments keep working unchanged.
    REDIS_URL: str | None = None
    REDIS_SOCKET_TIMEOUT_SECONDS: float = 2.0
    # How long a failed Redis connection is left alone before reconnecting.
    # Without this the service retries a dead Redis on every single turn.
    REDIS_RECONNECT_BACKOFF_SECONDS: float = 15.0

    @property
    def session_redis_url(self) -> str:
        return self.REDIS_URL or self.CELERY_BROKER_URL

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.strip().lower() in {"production", "prod"}

    # ------------------------------------------------------------------
    # Prompt / knowledge asset locations
    # ------------------------------------------------------------------
    PROMPTS_FILE: str = "config/prompts.yaml"
    FAQ_FILE: str = "config/faq.yaml"


# Instantiate configuration singleton
settings = Settings()
