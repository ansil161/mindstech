from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator
from app.models.rag import RAGCitation


class MessageRole(str, Enum):
    """
    Standard communication roles in a conversational agent session.
    """
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"


class ChatMessageDetail(BaseModel):
    """
    Detailed model representing a single persisted message in a conversation.
    """
    message_id: str = Field(..., description="Unique message UUID.")
    conversation_id: str = Field(..., description="UUID of the parent conversation session.")
    role: MessageRole = Field(..., description="Role of the sender (user, assistant, system).")
    content: str = Field(..., description="Raw text content of the message.")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Time message was recorded.")
    sources: Optional[List[RAGCitation]] = Field(
        default=None,
        description="Optional list of source documents reference chunks compiled if assistant answer."
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Optional supplementary execution metadata (durations, tokens, model used)."
    )

    class Config:
        json_schema_extra = {
            "example": {
                "message_id": "msg_901b7a62",
                "conversation_id": "conv_44b209c1",
                "role": "assistant",
                "content": "Our vacation allowance is 25 days.",
                "timestamp": "2026-07-11T10:47:00Z",
                "sources": [
                    {
                        "document_id": "doc_hr_01",
                        "document_name": "vacation_policy.pdf",
                        "page": 2
                    }
                ]
            }
        }


class ChatMessageRequest(BaseModel):
    """
    Validation schema for client message submissions.
    """
    conversation_id: str = Field(
        ...,
        description="Unique identifier of the active conversation thread."
    )
    message: str = Field(
        ...,
        min_length=1,
        description="The query or text query input from the user."
    )
    stream: bool = Field(
        default=False,
        description="Whether to stream response tokens back to the user via SSE."
    )
    category: Optional[str] = Field(
        default=None,
        description="Optional category tag override to filter RAG contexts."
    )
    tenant_id: Optional[str] = Field(
        default=None,
        description="Optional tenant identifier override for multi-tenant isolation."
    )

    @field_validator("message")
    @classmethod
    def message_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Message body cannot be empty or whitespace.")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "conversation_id": "conv_44b209c1",
                "message": "What is the policy for vacation leave?",
                "stream": False,
                "category": "policy"
            }
        }
