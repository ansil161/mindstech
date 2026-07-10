import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging import setup_logging

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Asynchronous lifespan context manager for FastAPI.
    Handles service setup (e.g. logging, DB connection pools) on startup
    and clean teardowns on shutdown.
    """
    # Startup:
    setup_logging()
    logger.info(
        "Initializing Mindstec AI Service...",
        extra={"environment": settings.ENVIRONMENT, "project": settings.PROJECT_NAME}
    )
    
    yield
    
    # Shutdown:
    logger.info("Shutting down Mindstec AI Service...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="FastAPI Microservice for AI, RAG, and Vector Retrieval tasks.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS Middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Global exception interceptor that prevents stack trace leakage in API responses,
    returning structured JSON error records instead.
    """
    logger.exception("Unhandled error occurred during request execution: %s", str(exc))
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please contact system support."},
    )


@app.get("/health", status_code=status.HTTP_200_OK, tags=["system"])
async def health_check():
    """
    Liveness and health check endpoint for cluster schedulers (Kubernetes/Docker Swarm).
    """
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
    }
