"""
Document ingestion API.

Request/response contracts are unchanged from v1 — Django's `AIClient` posts
the same payloads to `/ingest`, `/update-document`, `/parse` and
`DELETE /document/{id}`.

Two correctness fixes behind that unchanged surface:

1. **Stale chunks.** v1 derived chunk ids from `uuid5(f"{doc}_chunk_{i}")` and
   re-upserted on update. If version 2 of a document produced fewer chunks than
   version 1, the surplus v1 chunks were never removed — they stayed in the
   index forever and were retrieved as fact alongside the new content. Ingestion
   now deletes the document's existing chunks before writing the new set.
2. **Sequential embedding.** v1 called the embedding API once per chunk inside
   a `for` loop. A 100-chunk document meant 100 sequential network round-trips.
   Chunks are now embedded in batches and upserted in one call.
"""
from __future__ import annotations

import logging
import os
import tempfile
import uuid
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel, Field, field_validator
from qdrant_client.http import models as qmodels

from app.core.config import settings
from app.core.observability import safe_extra
from app.core.security import verify_api_key
from app.services.chunker import RecursiveCharacterChunker
from app.services.embedder import embedder
from app.services.parser import parse_file
from app.storage.document_store import document_store
from app.storage.vector_db import vector_db_manager

logger = logging.getLogger(__name__)

router = APIRouter(tags=["ingestion"], dependencies=[Depends(verify_api_key)])

_ALLOWED_UPLOAD_EXTENSIONS = {".pdf", ".docx", ".txt", ".md"}


def _approx_token_len(text: str) -> int:
    """chars/4 heuristic used consistently across this service for token
    estimation, avoiding a tokenizer dependency purely for chunking."""
    return max(1, len(text) // 4)


class InternalIngestionPayload(BaseModel):
    """Ingestion request. Field names match the v1 contract exactly."""

    document_id: str = Field(..., min_length=1, max_length=128)
    title: str = Field(..., min_length=1, max_length=512)
    content: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1, max_length=64)
    version: int
    tenant_id: str = Field(default="default", max_length=64)

    @field_validator("content")
    @classmethod
    def content_within_limits(cls, value: str) -> str:
        # An unbounded body would let one oversized document exhaust worker
        # memory during chunking.
        if len(value) > settings.INGEST_MAX_CONTENT_CHARS:
            raise ValueError(
                f"Content exceeds the maximum of {settings.INGEST_MAX_CONTENT_CHARS} characters."
            )
        if not value.strip():
            raise ValueError("Content cannot be empty or whitespace only.")
        return value


def _build_splitter() -> RecursiveCharacterChunker:
    """
    Separators are ordered to prefer paragraph, then sentence, then clause
    boundaries before ever cutting mid-word, so chunks stay semantically whole.
    """
    return RecursiveCharacterChunker(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
        length_function=_approx_token_len,
        separators=["\n\n", "\n", ". ", "! ", "? ", "; ", ", ", " ", ""],
    )


@router.post("/parse", status_code=status.HTTP_200_OK)
async def parse_document_file(file: UploadFile = File(...)) -> Dict[str, str]:
    """Extracts plain text from an uploaded PDF, DOCX, TXT or MD file."""
    filename = os.path.basename(file.filename or "upload")
    extension = os.path.splitext(filename)[1].lower()

    # Validate the extension before touching the filesystem: the suffix is
    # attacker-controlled and is about to become part of a temp file name.
    if extension not in _ALLOWED_UPLOAD_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{extension}'. Allowed: PDF, DOCX, TXT, MD.",
        )

    content = await file.read()
    if len(content) > settings.INGEST_MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=(
                f"File exceeds the {settings.INGEST_MAX_UPLOAD_BYTES // (1024 * 1024)}MB limit."
            ),
        )

    logger.info(
        "Parsing uploaded document",
        extra=safe_extra(filename=filename, size_bytes=len(content)),
    )

    temp_path = ""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=extension) as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name
        text = parse_file(temp_path, filename)
        return {"status": "success", "text": text}
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        logger.exception("Parsing failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to parse the uploaded document. Ensure it is a valid PDF, DOCX, TXT or MD file.",
        ) from exc
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                logger.warning("Could not remove temporary file %s", temp_path)


@router.post("/ingest", status_code=status.HTTP_201_CREATED)
async def ingest_document(payload: InternalIngestionPayload) -> Dict[str, Any]:
    """
    Indexes a document: chunk, batch-embed, replace prior chunks, upsert.

    Replacement is delete-then-write rather than blind upsert, which is what
    prevents a shorter new version from leaving orphaned chunks behind.
    """
    logger.info(
        "Ingestion started",
        extra={
            "document_id": payload.document_id,
            "category": payload.category,
            "version": payload.version,
            "content_chars": len(payload.content),
        },
    )

    try:
        chunks = _build_splitter().split_text(payload.content)
        chunks = [chunk for chunk in chunks if chunk.strip()]
        if not chunks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Document produced no indexable content after chunking.",
            )

        vectors = await embedder.aembed_batch(chunks)
        if len(vectors) != len(chunks):
            raise RuntimeError(
                f"Embedding returned {len(vectors)} vectors for {len(chunks)} chunks."
            )

        points = [
            qmodels.PointStruct(
                id=str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{payload.document_id}_chunk_{index}")),
                vector=vector,
                payload={
                    "document_id": payload.document_id,
                    "title": payload.title,
                    "content": chunk,
                    "category": payload.category,
                    "version": payload.version,
                    "tenant_id": payload.tenant_id,
                    "chunk_index": index,
                },
            )
            for index, (chunk, vector) in enumerate(zip(chunks, vectors))
        ]

        # Delete first so a version with fewer chunks cannot leave stale
        # tail chunks in the index. Ordered this way deliberately: a brief
        # gap where the document is unsearchable is far better than serving
        # a mix of two versions as if both were current.
        await vector_db_manager.delete_document(payload.document_id)

        if not await vector_db_manager.upsert_points(points):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Document ingestion failed due to an internal storage error. Please try again.",
            )

        document_store.save_document(
            payload.document_id,
            {
                "document_id": payload.document_id,
                "title": payload.title,
                "category": payload.category,
                "version": payload.version,
                "tenant_id": payload.tenant_id,
                "num_chunks": len(chunks),
            },
        )

        logger.info(
            "Ingestion complete",
            extra={"document_id": payload.document_id, "chunk_count": len(chunks)},
        )
        return {
            "status": "success",
            "message": f"Document successfully ingested into {len(chunks)} chunks.",
            "chunks": len(chunks),
        }

    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("Ingestion failed for %s: %s", payload.document_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to ingest document. Please try again.",
        ) from exc


@router.post("/update-document", status_code=status.HTTP_200_OK)
async def update_document(payload: InternalIngestionPayload) -> Dict[str, Any]:
    """Re-indexes a document. Ingestion is already replace-semantics."""
    logger.info("Update requested", extra={"document_id": payload.document_id})
    return await ingest_document(payload)


@router.delete("/document/{document_id}", status_code=status.HTTP_200_OK)
async def delete_document(
    document_id: str, category: str | None = None, tenant_id: str = "default"
) -> Dict[str, str]:
    """
    Removes a document's vectors.

    `category` is accepted for v1 call-compatibility (Django always sends it)
    but is not used as a filter: deletion is keyed on document_id, which is
    already unique, and filtering on a mismatched category would silently
    leave the document indexed.
    """
    logger.info("Deletion requested", extra={"document_id": document_id, "tenant_id": tenant_id})
    try:
        if not await vector_db_manager.delete_document(document_id):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Vector deletion failed.",
            )
        document_store.delete_document(document_id)
        return {"status": "success", "message": "Document successfully deleted."}
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("Deletion failed for %s: %s", document_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete document. Please try again.",
        ) from exc
