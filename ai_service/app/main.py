"""
FastAPI application entry point.

Adds, relative to v1: request-ID propagation middleware, a real readiness
probe that actually checks dependencies, a metrics endpoint, warm-up of the
prompt/FAQ assets at startup, and orderly shutdown of the HTTP/Redis/Qdrant
clients that the async rewrite introduced.
"""
from __future__ import annotations

import logging
import time
from contextlib import asynccontextmanager
from typing import Any, Dict

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.conversation.faq import faq_layer
from app.conversation.memory import conversation_memory
from app.core.config import settings
from app.core.logging import setup_logging
from app.core.observability import bind_request, current_request_id, metrics
from app.core.prompts import prompts
from app.core.resilience import breakers
from app.services.embedder import embedder
from app.services.llm import llm_service
from app.storage.vector_db import vector_db_manager

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup/shutdown.

    Prompt and FAQ assets are loaded eagerly so a malformed YAML file surfaces
    as a startup warning rather than as a first-request failure in production.
    Network dependencies are deliberately *not* connected here: a service that
    refuses to boot because Redis is briefly down cannot serve the degraded
    paths it was built to serve.
    """
    setup_logging()
    logger.info(
        "Starting AI service",
        extra={
            "environment": settings.ENVIRONMENT,
            "version": settings.SERVICE_VERSION,
            "conversation_engine": settings.ENABLE_CONVERSATION_ENGINE,
            "hybrid_retrieval": settings.RETRIEVAL_ENABLE_HYBRID,
            "streaming": settings.ENABLE_STREAMING,
        },
    )

    prompts.render("answer_system", context_block="", grounding_note="")
    logger.info("Knowledge assets loaded", extra={"faq_entries": faq_layer.entry_count})

    if not any(
        [settings.OPENAI_API_KEYS, settings.GROQ_API_KEYS, settings.GEMINI_API_KEYS]
    ):
        logger.critical(
            "No LLM API keys are configured. Generation will fail and every turn "
            "will degrade to the canned unavailable message."
        )
    if not settings.QDRANT_URL:
        logger.critical("QDRANT_URL is not set. Retrieval will return no results.")

    try:
        yield
    finally:
        logger.info("Shutting down AI service...")
        await conversation_memory.close()
        await vector_db_manager.close()
        await embedder.aclose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="FastAPI microservice for conversational RAG, retrieval and ingestion.",
    version=settings.SERVICE_VERSION,
    lifespan=lifespan,
)


@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    """
    Binds a correlation id to every request and echoes it back.

    Without this, concurrent chats interleave in the logs with no way to
    reconstruct a single turn — which is precisely when you need the logs.
    """
    request_id = bind_request(request_id=request.headers.get("X-Request-ID"))
    started = time.perf_counter()

    response = await call_next(request)

    duration = time.perf_counter() - started
    response.headers["X-Request-ID"] = request_id
    metrics.observe("http.request", duration)

    # Health and metrics polling would otherwise dominate the log volume.
    if not request.url.path.startswith(("/health", "/metrics")):
        logger.info(
            "http.request",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_seconds": round(duration, 4),
            },
        )
    return response


from app.api.v1.chat import router as chat_router  # noqa: E402
from app.api.v1.ingest import router as ingest_router  # noqa: E402

app.include_router(chat_router, prefix="/api/v1/internal")
app.include_router(ingest_router, prefix="/api/v1/internal")


if settings.BACKEND_CORS_ORIGINS:
    origins = [str(origin) for origin in settings.BACKEND_CORS_ORIGINS]
    has_wildcard = "*" in origins

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        # The CORS spec forbids credentials with a wildcard origin; browsers
        # reject such responses outright, so disable credentials rather than
        # emit a header combination that silently fails.
        allow_credentials=not has_wildcard,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID"],
    )

    if has_wildcard:
        logger.warning(
            "CORS configured with a wildcard origin; allow_credentials disabled "
            "automatically. Set explicit origins to enable credentialed requests."
        )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Prevents stack-trace leakage while preserving the correlation id."""
    logger.exception("Unhandled error during request execution: %s", exc)
    metrics.increment("http.unhandled_error")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred. Please contact system support.",
            "request_id": current_request_id(),
        },
        headers={"X-Request-ID": current_request_id()},
    )


@app.get("/health", status_code=status.HTTP_200_OK, tags=["system"])
async def health_check() -> Dict[str, Any]:
    """
    Liveness probe. Intentionally dependency-free and always 200 while the
    process is running — a liveness check that fails on a dependency outage
    causes the orchestrator to restart-loop a healthy process.
    """
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "version": settings.SERVICE_VERSION,
    }


@app.get("/health/ready", tags=["system"])
async def readiness_check() -> JSONResponse:
    """
    Readiness probe: reports on each dependency.

    Qdrant is treated as required (no retrieval without it); Redis and the LLM
    are degradable, because the service still answers — worse, but usefully —
    without them.
    """
    vector_health = await vector_db_manager.health()
    embedding_health = await embedder.health()
    redis_ok = await conversation_memory.ping()
    llm_health = llm_service.health()

    # Embeddings are required, not degradable: without them the vector branch
    # cannot run and every answer becomes "I don't have that detail" while all
    # other components still report healthy.
    ready = (
        vector_health.get("status") == "ok"
        and embedding_health.get("status") == "ok"
        and bool(llm_health.get("configured_providers"))
    )

    body: Dict[str, Any] = {
        "status": "ready" if ready else "degraded",
        "version": settings.SERVICE_VERSION,
        "dependencies": {
            "vector_db": vector_health,
            "embeddings": embedding_health,
            "session_store": {
                "status": "ok" if redis_ok else "degraded",
                "backend": conversation_memory.backend,
                "detail": None if redis_ok else "Using bounded in-process fallback.",
            },
            "llm": llm_health,
        },
        "circuit_breakers": breakers.snapshot(),
    }
    return JSONResponse(
        status_code=status.HTTP_200_OK if ready else status.HTTP_503_SERVICE_UNAVAILABLE,
        content=body,
    )


@app.get("/metrics", tags=["system"])
async def metrics_endpoint() -> Dict[str, Any]:
    """
    In-process counters and latency percentiles.

    Per-worker, not aggregated across the fleet — enough to answer "is this
    worker slow / are fallbacks firing" without adding a metrics backend.
    """
    snapshot = metrics.snapshot()
    snapshot["circuit_breakers"] = breakers.snapshot()
    snapshot["embedding_cache"] = embedder.cache_stats()
    snapshot["session_backend"] = conversation_memory.backend
    return snapshot
