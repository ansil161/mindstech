from datetime import date
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator
from app.models.ingestion import IngestionCategory


class MetadataFilter(BaseModel):
    """
    Structured metadata filters supported by the retrieval engine.
    Allows limiting search scope to specific tenants, categories, documents, dates, etc.
    """
    category: Optional[IngestionCategory] = Field(
        default=None,
        description="Filter by logical document category (e.g. faq, policy, product)."
    )
    tenant_id: Optional[str] = Field(
        default=None,
        description="Tenant identifier for strict multi-tenant isolation."
    )
    document_id: Optional[str] = Field(
        default=None,
        description="Filter results by a specific document unique identifier."
    )
    document_name: Optional[str] = Field(
        default=None,
        description="Filter results by exact document name."
    )
    source: Optional[str] = Field(
        default=None,
        description="Filter by origin file path or source URI."
    )
    file_type: Optional[str] = Field(
        default=None,
        description="Filter by file type extension (e.g., pdf, txt, docx)."
    )
    language: Optional[str] = Field(
        default=None,
        description="Filter by language code (e.g., en, es, ar)."
    )
    created_after: Optional[date] = Field(
        default=None,
        description="Only retrieve chunks created on or after this date."
    )
    created_before: Optional[date] = Field(
        default=None,
        description="Only retrieve chunks created on or before this date."
    )

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "category": "policy",
                "tenant_id": "tenant_001",
                "file_type": "pdf"
            }
        }


class RetrievalQuery(BaseModel):
    """
    Payload validation schema for semantic retrieval queries.
    """
    query: str = Field(
        ...,
        min_length=1,
        description="The natural language search query text."
    )
    top_k: Optional[int] = Field(
        default=None,
        ge=1,
        le=100,
        description="Maximum number of relevant chunks to return. Defaults to system configuration."
    )
    min_score: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description="Similarity score threshold (0.0 to 1.0). Only chunks scoring above this are returned."
    )
    limit: int = Field(
        default=5,
        ge=1,
        le=100,
        description="Number of chunks to fetch per page. Equivalent to top_k if pagination is not used."
    )
    offset: int = Field(
        default=0,
        ge=0,
        description="Offset for paginating search results."
    )
    filters: Optional[MetadataFilter] = Field(
        default=None,
        description="Key-value filters to restrict search space."
    )

    @field_validator("query")
    @classmethod
    def query_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Query string cannot be empty or only whitespace.")
        return v


class RetrievalChunk(BaseModel):
    """
    Represents a single retrieved text chunk with its score and associated metadata.
    """
    content: str = Field(..., description="The textual content of the document chunk.")
    score: float = Field(..., description="Cosine similarity relevance score calculated by the search engine.")
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Accompanying metadata properties (tenant_id, document_name, page, category, etc.)."
    )


class RetrievalResponse(BaseModel):
    """
    Unified response wrapper for search and semantic query outputs.
    """
    query: str = Field(..., description="The query string that was processed.")
    results: List[RetrievalChunk] = Field(
        ...,
        description="Ordered list of retrieved chunks sorted in descending order of relevance."
    )
    total: int = Field(
        ...,
        description="Total count of relevant matching chunks before pagination/limit slice."
    )
    limit: int = Field(..., description="Limit parameter applied to the search execution.")
    offset: int = Field(..., description="Offset parameter applied to search execution pagination.")


class BatchRetrievalQuery(BaseModel):
    """
    Payload validation schema for batching multiple semantic retrieval queries.
    """
    queries: List[RetrievalQuery] = Field(
        ...,
        min_length=1,
        description="List of individual retrieval queries to process in batch."
    )


class BatchRetrievalResponse(BaseModel):
    """
    Response schema for batch retrieval operations.
    """
    results: List[RetrievalResponse] = Field(
        ...,
        description="List of retrieval query outputs mapping 1-to-1 to input batch query ordering."
    )
