from typing import Generator
from app.core.config import Settings, settings


def get_settings() -> Settings:
    """
    FastAPI dependency injection provider for application settings.
    Yields settings to endpoints, facilitating mock testing config overrides.
    """
    return settings


# Placeholders for future storage and service injections
# (e.g., get_qdrant_client, get_rag_service, etc.)
