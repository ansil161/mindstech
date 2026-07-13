import os
import logging
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

logger = logging.getLogger(__name__)

security_scheme = HTTPBearer(auto_error=False)

def verify_api_key(credentials: HTTPAuthorizationCredentials = Security(security_scheme)):
    """
    Validates the Bearer token from the Django backend to secure internal endpoints.
    """
    api_key = os.getenv("AI_SERVICE_API_KEY", "secret-key")
    if not credentials or credentials.credentials != api_key:
        logger.warning("Unauthorized access attempt to AI service API.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials. Invalid API key."
        )
