import os
import logging
import httpx
from typing import Any, Dict, List, Optional
from django.conf import settings

logger = logging.getLogger(__name__)


class AIClientError(Exception):
    """Base exception for all AI microservice client communications."""
    pass


class AIClientTimeoutError(AIClientError):
    """Raised when request to the AI microservice times out."""
    pass


class AIClientAuthenticationError(AIClientError):
    """Raised when authentication credentials (API key) are invalid."""
    pass


class AIClientRateLimitError(AIClientError):
    """Raised when the AI microservice returns a rate limit/throttling error."""
    pass


class AIClientAPIError(AIClientError):
    """Raised when the AI microservice returns a non-2xx status code."""
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(f"AI microservice error {status_code}: {detail}")


class AIClient:
    """
    Client wrapper for HTTP communication with the FastAPI AI microservice.
    Handles headers, timeouts, error translations, and requests.
    """
    def __init__(self):
        # Read parameters from Django settings, fallback to environment or defaults
        self.base_url = getattr(settings, "AI_SERVICE_URL", os.getenv("AI_SERVICE_URL", "http://localhost:8000"))
        self.api_key = getattr(settings, "AI_SERVICE_API_KEY", os.getenv("AI_SERVICE_API_KEY", "secret-key"))
        self.timeout = float(getattr(settings, "AI_SERVICE_TIMEOUT", os.getenv("REQUEST_TIMEOUT", "30.0")))
        self.max_retries = int(getattr(settings, "AI_SERVICE_MAX_RETRIES", os.getenv("MAX_RETRIES", "3")))
        
        # Trim base URL trailing slash if present
        if self.base_url.endswith("/"):
            self.base_url = self.base_url[:-1]

    def _get_headers(self) -> Dict[str, str]:
        """Generate authentication and client headers."""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "X-Client-Identifier": "Django-Backend",
            "Content-Type": "application/json",
        }

    def _request(
        self, 
        method: str, 
        path: str, 
        json_data: Optional[Dict[str, Any]] = None, 
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Execute request with retry logic and standardized error handling.
        """
        url = f"{self.base_url}/api/v1/internal{path}"
        headers = self._get_headers()
        
        for attempt in range(1, self.max_retries + 1):
            try:
                logger.debug(
                    "Sending %s request to AI Service (Attempt %d/%d) - URL: %s",
                    method, attempt, self.max_retries, url
                )
                with httpx.Client(timeout=self.timeout) as client:
                    response = client.request(
                        method=method,
                        url=url,
                        headers=headers,
                        json=json_data,
                        params=params
                    )
                
                # Check for standard error status codes
                if response.status_code == 200 or response.status_code == 201:
                    return response.json()
                elif response.status_code == 401 or response.status_code == 403:
                    raise AIClientAuthenticationError("Invalid API key or unauthorized microservice call.")
                elif response.status_code == 429:
                    raise AIClientRateLimitError("Rate limit exceeded on the AI microservice.")
                else:
                    detail = "Unknown error"
                    try:
                        detail = response.json().get("detail", response.text)
                    except Exception:
                        detail = response.text
                    raise AIClientAPIError(response.status_code, detail)
                    
            except httpx.TimeoutException as e:
                logger.warning("Timeout during AI Service call (attempt %d): %s", attempt, str(e))
                if attempt == self.max_retries:
                    raise AIClientTimeoutError(f"Request to AI microservice timed out after {self.timeout}s.")
            except httpx.RequestError as e:
                logger.warning("Network failure during AI Service call (attempt %d): %s", attempt, str(e))
                if attempt == self.max_retries:
                    raise AIClientError(f"Failed to communicate with AI service: {str(e)}")
        
        raise AIClientError("Unexpected failure in requesting AI microservice.")

    def health_check(self) -> Dict[str, Any]:
        """
        Retrieve liveness status of FastAPI integration APIs.
        """
        return self._request("GET", "/health")

    def ingest_document(
        self, 
        document_id: str, 
        title: str, 
        content: str, 
        category: str, 
        version: int, 
        tenant_id: str = "default"
    ) -> Dict[str, Any]:
        """
        Ingest a document's content and details into the AI vector database.
        """
        payload = {
            "document_id": str(document_id),
            "title": title,
            "content": content,
            "category": category,
            "version": version,
            "tenant_id": tenant_id
        }
        return self._request("POST", "/ingest", json_data=payload)

    def update_document(
        self, 
        document_id: str, 
        title: str, 
        content: str, 
        category: str, 
        version: int, 
        tenant_id: str = "default"
    ) -> Dict[str, Any]:
        """
        Update an existing document. Checks versions before running re-embedding.
        """
        payload = {
            "document_id": str(document_id),
            "title": title,
            "content": content,
            "category": category,
            "version": version,
            "tenant_id": tenant_id
        }
        return self._request("POST", "/update-document", json_data=payload)

    def delete_document(self, document_id: str, category: str, tenant_id: str = "default") -> Dict[str, Any]:
        """
        Remove a document and its vectors from the AI index.
        """
        params = {
            "category": category,
            "tenant_id": tenant_id
        }
        return self._request("DELETE", f"/document/{document_id}", params=params)

    def chat_query(
        self, 
        message: str, 
        conversation_id: str, 
        stream: bool = False, 
        category: Optional[str] = None, 
        tenant_id: str = "default"
    ) -> Dict[str, Any]:
        """
        Send a chat message to the RAG service and retrieve the generated answer.
        Does not handle SSE streams; returns full response payload.
        """
        payload = {
            "message": message,
            "conversation_id": conversation_id,
            "stream": stream,
            "category": category,
            "tenant_id": tenant_id
        }
        return self._request("POST", "/chat", json_data=payload)

    def get_chat_history(self, conversation_id: str) -> List[Dict[str, Any]]:
        """
        Fetch conversation logs from the AI microservice.
        """
        return self._request("GET", f"/chat/history/{conversation_id}")
