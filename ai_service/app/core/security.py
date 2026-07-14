import os
import logging
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

logger = logging.getLogger(__name__)

security_scheme = HTTPBearer(auto_error=False)

def _get_api_key() -> str:
    """
    Loads the expected API key from the environment at request time.
    Raises a startup-safe error if the variable is missing or empty,
    so the application fails loudly rather than accepting a known default.
    """
    key = os.getenv("AI_SERVICE_API_KEY", "").strip()
    if not key:
        logger.critical(
            "AI_SERVICE_API_KEY is not configured. "
            "All authenticated requests will be rejected."
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service authentication is not configured. Contact system support.",
        )
    return key


def verify_api_key(credentials: HTTPAuthorizationCredentials = Security(security_scheme)):
    """
    Validates the Bearer token from the Django backend to secure internal endpoints.
    The expected key is read exclusively from the AI_SERVICE_API_KEY environment variable.
    No hardcoded fallback is permitted.
    """
    expected_key = _get_api_key()
    if not credentials or credentials.credentials != expected_key:
        logger.warning("Unauthorized access attempt to AI service API.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials. Invalid API key."
        )
