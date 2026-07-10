from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class IngestionCategory(str, Enum):
    """
    Categorization tags for documents in the RAG index.
    """
    FAQ = "faq"
    POLICY = "policy"
    PRODUCT = "product"
    ABOUT = "about"
    GENERAL = "general"


class IngestionRequest(BaseModel):
    """
    Payload schema for single document ingestion.
    Supports either direct text payload ingestion or file path ingestion.
    """
    content: Optional[str] = Field(default=None, description="Raw text content to ingest.")
    file_path: Optional[str] = Field(default=None, description="Absolute local path to file.")
    document_name: Optional[str] = Field(default=None, description="Name of the document. If empty, falls back to filename.")
    document_id: Optional[str] = Field(default=None, description="Unique document ID. If empty, generates a UUID.")
    tenant_id: Optional[str] = Field(default=None, description="Multi-tenant identifier for future segregation.")
    category: IngestionCategory = Field(default=IngestionCategory.GENERAL, description="Category partition for document contents.")
    overwrite: bool = Field(default=False, description="Overwrite vectors if document ID or hash already exists.")
    skip_existing: bool = Field(default=True, description="Skip ingestion if document content hash already matches an indexed record.")


class BatchIngestionRequest(BaseModel):
    """
    Payload schema for batching multiple ingestion requests together.
    """
    requests: List[IngestionRequest] = Field(..., description="List of individual document ingestion requests.")


class IngestionResultSummary(BaseModel):
    """
    Outcome report for a single document ingestion pipeline run.
    """
    document_id: str
    document_name: str
    status: str  # "completed", "skipped", "failed"
    chunks_count: int = 0
    duration_seconds: float = 0.0
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class BatchIngestionResult(BaseModel):
    """
    Outcome report compiling the results of a batch ingestion operation.
    """
    total_submitted: int
    successful: int
    failed: int
    skipped: int
    results: List[IngestionResultSummary]
    duration_seconds: float = 0.0


class IngestionJobStatus(BaseModel):
    """
    Metadata representation of an asynchronous ingestion job.
    """
    job_id: str
    status: str  # "pending", "processing", "completed", "failed"
    progress: float = 0.0
    result: Optional[BatchIngestionResult] = None
    error_message: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)
