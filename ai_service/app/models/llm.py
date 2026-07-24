"""
LLM message and response schemas.

v1 defined `MessageRole` twice — here and in `models/chat.py` — with identical
members, so two non-identical enum types described the same concept and could
not be compared. `models/chat.py` is gone; this is the single definition.
"""
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class MessageRole(str, Enum):
    """Standard chat roles for multi-turn conversations."""

    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"


class ChatMessage(BaseModel):
    """One message in a conversation transcript."""

    model_config = ConfigDict(
        json_schema_extra={"example": {"role": "user", "content": "What displays do you carry?"}}
    )

    role: MessageRole = Field(..., description="Role of the message author.")
    content: str = Field(..., description="Raw text content of the message.")

    @field_validator("content")
    @classmethod
    def content_not_empty(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Message content cannot be empty or whitespace.")
        return value


class LLMGenerationResponse(BaseModel):
    """Result of one completion call, including provenance and token usage."""

    provider: str = Field(..., description="Provider that produced the response.")
    model: str = Field(..., description="Model used for generation.")
    content: str = Field(..., description="Generated text.")
    input_tokens: Optional[int] = Field(default=None, description="Prompt tokens consumed.")
    output_tokens: Optional[int] = Field(default=None, description="Completion tokens generated.")
    duration_seconds: float = Field(..., description="Wall-clock duration of the call.")


class LLMStreamChunk(BaseModel):
    """A single content delta yielded during streaming generation."""

    content: str = Field(..., description="Partial content increment.")
    finish_reason: Optional[str] = Field(
        default=None, description="Set on the final chunk to indicate why generation stopped."
    )
