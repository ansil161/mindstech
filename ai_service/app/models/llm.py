from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class MessageRole(str, Enum):
    """
    Standard chat roles for multi-turn conversations.
    """
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"


class ChatMessage(BaseModel):
    """
    Standard schema for conversational messages.
    """
    role: MessageRole = Field(..., description="Role of the message creator (system, user, assistant).")
    content: str = Field(..., description="Raw text content of the message.")

    @field_validator("content")
    @classmethod
    def content_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Message content cannot be empty or whitespace.")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "role": "user",
                "content": "What is the capital of France?"
            }
        }


class LLMGenerationRequest(BaseModel):
    """
    Unified validation schema for chat completion requests.
    Allows override of default providers and parameters at request time.
    """
    messages: List[ChatMessage] = Field(
        ...,
        min_length=1,
        description="Chronological conversation transcript to prompt the model."
    )
    provider: Optional[str] = Field(
        default=None,
        description="Override the default LLM provider (e.g. openai, gemini, groq)."
    )
    model: Optional[str] = Field(
        default=None,
        description="Override the default model name (e.g. gpt-4o, gemini-2.5-flash, llama-3.3-70b-versatile)."
    )
    temperature: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=2.0,
        description="Sampling temperature. Higher values mean more creative but less deterministic outputs."
    )
    max_tokens: Optional[int] = Field(
        default=None,
        gt=0,
        description="Maximum number of tokens to generate in the completion response."
    )
    stream: bool = Field(
        default=False,
        description="If true, stream response chunks back token-by-token instead of waiting for full response."
    )

    class Config:
        json_schema_extra = {
            "example": {
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": "Hello!"}
                ],
                "provider": "openai",
                "temperature": 0.7,
                "stream": False
            }
        }


class LLMGenerationResponse(BaseModel):
    """
    Unified response wrapper for successful completion requests.
    """
    provider: str = Field(..., description="The name of the provider that generated the response.")
    model: str = Field(..., description="The specific model instance used for generation.")
    content: str = Field(..., description="The generated text content output.")
    input_tokens: Optional[int] = Field(default=None, description="Number of tokens consumed in input prompt.")
    output_tokens: Optional[int] = Field(default=None, description="Number of tokens generated in completion.")
    duration_seconds: float = Field(..., description="Time taken in seconds to run model completion call.")


class LLMStreamChunk(BaseModel):
    """
    Represents a single generated token or content piece yielded during response streaming.
    """
    content: str = Field(..., description="Partial content increment (usually a single word or token).")
    finish_reason: Optional[str] = Field(default=None, description="Indicates if this chunk represents stream completion.")


class ModelMetadata(BaseModel):
    """
    Structure representing static profile information for supported models.
    """
    id: str = Field(..., description="System model ID (e.g., gpt-4o).")
    name: str = Field(..., description="Human-friendly label for UI selection.")
    provider: str = Field(..., description="Associated provider engine identifier.")
    context_window: Optional[int] = Field(default=None, description="Maximum token sequence limit supported by model.")
