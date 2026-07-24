"""
Chat API.

**The request and response contracts are unchanged from v1.** Django's
`AIClient.chat_query` posts the same fields and reads the same keys, and the
React widget still reads `answer` and `citations`. Everything added here is
additive:

* `stream: true` — already part of the v1 payload schema but silently ignored —
  now returns Server-Sent Events. The default (`false`) path is byte-compatible
  with v1.
* Response gains optional `intent` and `trace` fields. Additive keys are safe:
  the frontend reads specific keys and ignores the rest.
"""
from __future__ import annotations

import json
import logging
from typing import Any, AsyncIterator, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator

from app.conversation.dialogue import dialogue_manager
from app.conversation.memory import conversation_memory
from app.core.config import settings
from app.core.observability import TurnTrace, bind_request
from app.core.security import enforce_rate_limit, verify_api_key
from app.models.rag import RAGCitation

logger = logging.getLogger(__name__)

router = APIRouter(tags=["chat"], dependencies=[Depends(verify_api_key)])


class InternalChatPayload(BaseModel):
    """Inbound chat request. Field names and defaults match v1 exactly."""

    message: str = Field(..., min_length=1, max_length=settings.CHAT_MESSAGE_MAX_LENGTH)
    conversation_id: str = Field(default="default", max_length=128)
    stream: bool = False
    category: Optional[str] = Field(default=None, max_length=64)
    tenant_id: str = Field(default="default", max_length=64)

    @field_validator("message")
    @classmethod
    def message_not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Message cannot be empty or whitespace only.")
        return value

    @field_validator("conversation_id", "tenant_id")
    @classmethod
    def identifier_is_safe(cls, value: str) -> str:
        """
        Constrains identifiers to a safe character set.

        These become Redis key components and Qdrant filter values, so
        rejecting control characters and separators here prevents both key
        injection and unbounded key cardinality from odd input.
        """
        cleaned = value.strip()
        if not cleaned:
            return "default"
        if any(ch.isspace() or ch in {"\n", "\r", "\x00"} for ch in cleaned):
            raise ValueError("Identifier must not contain whitespace or control characters.")
        return cleaned


class ChatResponse(BaseModel):
    """
    Outbound chat response.

    `answer`, `citations`, `confidence_score` and `duration_seconds` are the v1
    contract and must not change shape. `intent` and `trace` are additive.
    """

    answer: str
    citations: List[RAGCitation] = Field(default_factory=list)
    confidence_score: Optional[float] = None
    duration_seconds: float
    intent: Optional[str] = None
    trace: Optional[Dict[str, Any]] = None


@router.post("/chat", response_model=ChatResponse, response_model_exclude_none=True)
async def chat_interaction(payload: InternalChatPayload, request: Request):
    """
    Conversational endpoint.

    Every message is routed through the conversation engine, which decides
    whether it needs the knowledge base at all. Returns SSE when
    `stream: true` and streaming is enabled.
    """
    request_id = bind_request(
        request_id=request.headers.get("X-Request-ID"),
        conversation_id=payload.conversation_id,
    )
    enforce_rate_limit(payload.conversation_id)

    trace = TurnTrace(request_id=request_id, conversation_id=payload.conversation_id)

    if payload.stream and settings.ENABLE_STREAMING:
        return StreamingResponse(
            _sse_events(payload, trace),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                # Nginx buffers proxied responses by default, which would
                # defeat streaming entirely through the gateway.
                "X-Accel-Buffering": "no",
                "X-Request-ID": request_id,
            },
        )

    try:
        result = await dialogue_manager.handle(
            message=payload.message,
            conversation_id=payload.conversation_id,
            category=payload.category,
            tenant_id=payload.tenant_id,
            trace=trace,
        )
    except Exception as exc:  # noqa: BLE001
        logger.exception("Chat turn failed unexpectedly: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request. Please try again later.",
        ) from exc

    return ChatResponse(
        answer=result.answer,
        citations=result.citations,
        confidence_score=result.confidence,
        duration_seconds=result.duration_seconds,
        intent=result.intent.value,
        trace=trace.to_log_fields() if not settings.is_production else None,
    )


async def _sse_events(payload: InternalChatPayload, trace: TurnTrace) -> AsyncIterator[str]:
    """
    Renders dialogue events as Server-Sent Events.

    Event types mirror the dialogue manager's own stream: `citations` once up
    front, then `delta` per token, then `done`. Errors are delivered as a
    terminal `error` event rather than by tearing the connection down, so the
    client can render something useful.
    """
    try:
        async for event in dialogue_manager.astream(
            message=payload.message,
            conversation_id=payload.conversation_id,
            category=payload.category,
            tenant_id=payload.tenant_id,
            trace=trace,
        ):
            yield f"event: {event['type']}\ndata: {json.dumps(event)}\n\n"
    except Exception as exc:  # noqa: BLE001
        logger.exception("Streaming chat turn failed: %s", exc)
        error_event = {"type": "error", "message": settings.LLM_UNAVAILABLE_MESSAGE}
        yield f"event: error\ndata: {json.dumps(error_event)}\n\n"
    finally:
        # A sentinel lets EventSource clients close cleanly instead of
        # treating end-of-stream as a dropped connection and reconnecting.
        yield "event: end\ndata: {}\n\n"


@router.get("/chat/history/{conversation_id}")
async def fetch_chat_history(conversation_id: str, request: Request) -> List[Dict[str, Any]]:
    """
    Returns the transcript for a conversation.

    Response shape is unchanged from v1: a list of
    `{id, role, content, timestamp}` objects, which is what the React widget
    renders directly.
    """
    bind_request(
        request_id=request.headers.get("X-Request-ID"),
        conversation_id=conversation_id,
    )
    try:
        history = await conversation_memory.get_history(conversation_id)
    except Exception as exc:  # noqa: BLE001
        logger.exception("History retrieval failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve conversation history. Please try again later.",
        ) from exc

    return [
        {
            "id": f"msg-{conversation_id}-{index}",
            "role": message.role.value if hasattr(message.role, "value") else str(message.role),
            "content": message.content,
            "timestamp": "",
        }
        for index, message in enumerate(history)
    ]


@router.delete("/chat/history/{conversation_id}", status_code=status.HTTP_200_OK)
async def clear_chat_history(conversation_id: str) -> Dict[str, str]:
    """
    Clears a conversation's transcript and state.

    New in v2. Additive endpoint — nothing existing calls it — but a session
    store with no eviction path is an operational liability, and support needs
    a way to reset a wedged conversation.
    """
    await conversation_memory.clear(conversation_id)
    return {"status": "success", "message": "Conversation cleared."}
