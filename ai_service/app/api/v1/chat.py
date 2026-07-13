import json
import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field

from app.services.rag import rag_orchestrator
from app.models.llm import ChatMessage, MessageRole
from app.core.security import verify_api_key

logger = logging.getLogger(__name__)

router = APIRouter(tags=["chat"], dependencies=[Depends(verify_api_key)])

# In-memory history fallback
_in_memory_history = {}

# Lazy Redis client setup
_redis_client = None

def _get_redis_client():
    global _redis_client
    if _redis_client is None:
        try:
            import redis
            from app.core.config import settings
            logger.info("Initializing Redis connection for chat history...")
            _redis_client = redis.from_url(settings.CELERY_BROKER_URL, decode_responses=True)
            _redis_client.ping()
            logger.info("Successfully connected to Redis.")
        except Exception as e:
            logger.warning("Could not connect to Redis for chat history: %s. Using in-memory fallback.", str(e))
            _redis_client = False
    return _redis_client

def get_history(conversation_id: str) -> List[ChatMessage]:
    """Retrieve chat history from Redis or local memory."""
    redis_client = _get_redis_client()
    if redis_client:
        try:
            key = f"chat_history:{conversation_id}"
            records = redis_client.lrange(key, 0, -1)
            history = []
            for r in records:
                data = json.loads(r)
                history.append(ChatMessage(role=data["role"], content=data["content"]))
            return history
        except Exception as e:
            logger.error("Failed to read history from Redis: %s", str(e))
            
    if conversation_id not in _in_memory_history:
        _in_memory_history[conversation_id] = []
    return _in_memory_history[conversation_id]

def append_to_history(conversation_id: str, message: ChatMessage):
    """Save message to chat history in Redis or local memory."""
    redis_client = _get_redis_client()
    if redis_client:
        try:
            key = f"chat_history:{conversation_id}"
            payload = json.dumps({"role": message.role.value if hasattr(message.role, "value") else str(message.role), "content": message.content})
            redis_client.rpush(key, payload)
            redis_client.expire(key, 604800)
            return
        except Exception as e:
            logger.error("Failed to append history to Redis: %s", str(e))

    if conversation_id not in _in_memory_history:
        _in_memory_history[conversation_id] = []
    _in_memory_history[conversation_id].append(message)


class InternalChatPayload(BaseModel):
    message: str
    conversation_id: str = "default"
    stream: bool = False
    category: Optional[str] = None
    tenant_id: str = "default"


@router.post("/chat")
async def chat_interaction(payload: InternalChatPayload):
    """
    RAG chat endpoint: retrieves grounding documents and answers user queries.
    """
    logger.info("Chat Query Endpoint called for conversation: %s", payload.conversation_id)
    try:
        full_history = get_history(payload.conversation_id)
        recent_history = full_history[-6:]

        rag_response = rag_orchestrator.query(
            question=payload.message,
            history=recent_history,
            category=payload.category,
            tenant_id=payload.tenant_id
        )

        append_to_history(payload.conversation_id, ChatMessage(role=MessageRole.USER, content=payload.message))
        append_to_history(payload.conversation_id, ChatMessage(role=MessageRole.ASSISTANT, content=rag_response.answer))

        return rag_response
    except Exception as e:
        logger.exception("Chat execution failed: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred executing chat generation: {str(e)}"
        )


@router.get("/chat/history/{conversation_id}")
async def fetch_chat_history(conversation_id: str):
    """
    Returns the chat logs for the specified conversation session.
    """
    logger.info("Fetch History Endpoint called for session: %s", conversation_id)
    try:
        history = get_history(conversation_id)
        formatted_history = []
        for idx, m in enumerate(history):
            formatted_history.append({
                "id": f"msg-{conversation_id}-{idx}",
                "role": m.role.value if hasattr(m.role, "value") else str(m.role),
                "content": m.content,
                "timestamp": ""
            })
        return formatted_history
    except Exception as e:
        logger.exception("History retrieval failed: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch conversation history: {str(e)}"
        )
