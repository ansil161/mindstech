from pydantic import BaseModel, Field
from typing import Optional

class IngestionStatusReport(BaseModel):
    """
    Standard validation schema for document ingestion logs and status notifications.
    """
    document_id: str = Field(..., description="Unique ID of the ingested document.")
    status: str = Field(..., description="Status (success, failed).")
    message: Optional[str] = Field(default=None, description="Detailed trace or context message.")
