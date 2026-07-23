import logging
from typing import Any, Dict
from fastapi import APIRouter, HTTPException, status, Depends, File, UploadFile
import os
import tempfile
import uuid
from pydantic import BaseModel, Field

from app.services.embedder import embedder
from app.storage.vector_db import vector_db_manager
from app.storage.document_store import document_store
from app.core.security import verify_api_key
from app.core.config import settings
from app.services.parser import parse_file
from langchain_text_splitters import RecursiveCharacterTextSplitter

logger = logging.getLogger(__name__)

router = APIRouter(tags=["ingestion"], dependencies=[Depends(verify_api_key)])


def _approx_token_len(text: str) -> int:
    """Same chars/4 heuristic used throughout this codebase for token
    estimation (see app/services/context_builder.py) — deliberately not a
    real tokenizer, to avoid adding a new dependency just for chunking."""
    return max(1, len(text) // 4)

class InternalIngestionPayload(BaseModel):
    document_id: str
    title: str
    content: str
    category: str
    version: int
    tenant_id: str = "default"

@router.post("/parse", status_code=status.HTTP_200_OK)
async def parse_document_file(file: UploadFile = File(...)):
    """
    Accepts a file upload, parses it based on its extension, and returns the extracted text.
    """
    logger.info("Internal Parse Endpoint triggered for file: %s", file.filename)
    
    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        content = await file.read()
        temp_file.write(content)
        temp_path = temp_file.name
        
    try:
        text = parse_file(temp_path, file.filename)
        return {"status": "success", "text": text}
    except Exception as e:
        logger.exception("Parsing failed: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to parse the uploaded document. Ensure the file is a valid PDF, DOCX, TXT, or MD file."
        )
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@router.post("/ingest", status_code=status.HTTP_201_CREATED)
async def ingest_document(payload: InternalIngestionPayload):
    """
    Ingest a document chunk: generate embedding and save to Qdrant.
    """
    logger.info("Internal Ingest Endpoint triggered for document ID: %s", payload.document_id)
    try:
        # Chunk size/overlap come from settings (approximate tokens, not raw
        # characters — see _approx_token_len) instead of being hardcoded, and
        # the separator list is ordered to prefer paragraph and sentence
        # boundaries before ever falling back to a mid-sentence character cut.
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            length_function=_approx_token_len,
            is_separator_regex=False,
            separators=["\n\n", "\n", ". ", "! ", "? ", "; ", ", ", " ", ""],
        )
        chunks = text_splitter.split_text(payload.content)
        
        for i, chunk in enumerate(chunks):
            vector = embedder.get_embedding(chunk)
            
            chunk_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{payload.document_id}_chunk_{i}"))
            
            qdrant_payload = {
                "document_id": payload.document_id,
                "title": payload.title,
                "content": chunk,
                "category": payload.category,
                "version": payload.version,
                "tenant_id": payload.tenant_id,
                "chunk_index": i
            }
            
            success = vector_db_manager.upsert_document(
                document_id=chunk_id,
                vector=vector,
                payload=qdrant_payload
            )
            
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Document ingestion failed due to an internal storage error. Please try again."
                )
            
        document_store.save_document(payload.document_id, {
            "document_id": payload.document_id,
            "title": payload.title,
            "category": payload.category,
            "version": payload.version,
            "tenant_id": payload.tenant_id,
            "num_chunks": len(chunks)
        })
        
        return {"status": "success", "message": f"Document successfully ingested into {len(chunks)} chunks."}
    except Exception as e:
        logger.exception("Ingestion failed: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to ingest document. Please try again."
        )

@router.post("/update-document", status_code=status.HTTP_200_OK)
async def update_document(payload: InternalIngestionPayload):
    """
    Update a document vector and payload context.
    """
    logger.info("Internal Update Endpoint triggered for document ID: %s", payload.document_id)
    return await ingest_document(payload)

@router.delete("/document/{document_id}", status_code=status.HTTP_200_OK)
async def delete_document(document_id: str, category: str, tenant_id: str = "default"):
    """
    Remove document vectors from Qdrant.
    """
    logger.info("Internal Delete Endpoint triggered for document ID: %s", document_id)
    try:
        success = vector_db_manager.delete_document(document_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Qdrant vector deletion failed."
            )
        document_store.delete_document(document_id)
        return {"status": "success", "message": "Document successfully deleted."}
    except Exception as e:
        logger.exception("Deletion failed: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete document. Please try again."
        )
