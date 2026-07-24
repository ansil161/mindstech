"""
RAG request/response schemas.

Trimmed to the models the service actually uses. v1 carried an unused
`RAGQueryRequest` plus a whole `models/retrieval.py` and `models/ingestion.py`
of speculative filter/batch schemas that nothing imported — dead surface that
still had to be read and maintained.

`RAGCitation` and `RAGQueryResponse` are part of the public API contract: the
React widget reads `citations[].document_name` and `citations[].source`, and
Django passes the response through untouched. Fields may be added here but not
removed or renamed.
"""
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class RAGCitation(BaseModel):
    """A source document backing part of an answer."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "document_id": "doc_823",
                "document_name": "employee_handbook.pdf",
                "source": "https://mindstec.com/docs/handbook.pdf",
                "page": 12,
            }
        }
    )

    document_id: Optional[str] = Field(default=None, description="Unique identifier of the source document.")
    document_name: Optional[str] = Field(default=None, description="Filename or descriptive label.")
    source: Optional[str] = Field(default=None, description="Original path, URI, or source tag.")
    page: Optional[int] = Field(default=None, description="Page number of the source chunk, if known.")


class RAGQueryResponse(BaseModel):
    """Standard grounded-answer payload."""

    answer: str = Field(..., description="The grounded answer generated for the user.")
    citations: List[RAGCitation] = Field(
        default_factory=list, description="Unique source references used to ground the answer."
    )
    confidence_score: Optional[float] = Field(
        default=None, description="Confidence derived from retrieval similarity."
    )
    duration_seconds: float = Field(
        ..., description="Wall-clock duration of the retrieval and generation pipeline."
    )


class RAGContextResponse(BaseModel):
    """
    Compiled context block plus citations.

    Exposed separately so retrieval and prompt assembly can be tested without
    invoking generation.
    """

    context: str = Field(..., description="Deduplicated, token-budgeted context ready for the prompt.")
    citations: List[RAGCitation] = Field(
        default_factory=list, description="Source documents composing the context block."
    )
    token_count: int = Field(..., description="Estimated token count of the context block.")
    top_score: Optional[float] = Field(
        default=None,
        description=(
            "Highest raw vector similarity among the included chunks. Used internally to "
            "decide whether to hedge. Never the blended re-ranking score — see reranker.py."
        ),
    )
