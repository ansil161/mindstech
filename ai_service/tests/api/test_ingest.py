"""
Ingestion API.

The headline coverage is the stale-chunk data-correctness bug: v1 re-upserted
chunks by deterministic id without deleting the previous set, so a shorter new
version left the old tail in the index forever and it was served as current
fact alongside the new content.
"""
from typing import Any, Dict, List

import pytest

from app.core.config import settings
from app.storage import vector_db as vector_db_module


@pytest.fixture
def recording_store(monkeypatch):
    """Captures deletes and upserts instead of touching Qdrant."""
    record: Dict[str, Any] = {"deleted": [], "points": []}

    async def _delete(document_id: str) -> bool:
        record["deleted"].append(document_id)
        return True

    async def _upsert(points: List[Any]) -> bool:
        record["points"].extend(points)
        return True

    monkeypatch.setattr(vector_db_module.vector_db_manager, "delete_document", _delete)
    monkeypatch.setattr(vector_db_module.vector_db_manager, "upsert_points", _upsert)
    return record


def _payload(content="Some indexable content about AV distribution.", **overrides):
    payload = {
        "document_id": "doc-1",
        "title": "Test Document",
        "content": content,
        "category": "product",
        "version": 1,
        "tenant_id": "default",
    }
    payload.update(overrides)
    return payload


# ----------------------------------------------------------------------
# Auth & validation
# ----------------------------------------------------------------------
def test_ingest_requires_authentication(client):
    assert client.post("/api/v1/internal/ingest", json=_payload()).status_code in (401, 403)


def test_empty_content_is_rejected(client, auth_headers):
    response = client.post(
        "/api/v1/internal/ingest", json=_payload(content="   "), headers=auth_headers
    )
    assert response.status_code == 422


def test_oversized_content_is_rejected(client, auth_headers, monkeypatch):
    """An unbounded body would let one document exhaust worker memory."""
    monkeypatch.setattr(settings, "INGEST_MAX_CONTENT_CHARS", 100)
    response = client.post(
        "/api/v1/internal/ingest", json=_payload(content="x" * 500), headers=auth_headers
    )
    assert response.status_code == 422


# ----------------------------------------------------------------------
# Indexing behaviour
# ----------------------------------------------------------------------
def test_ingest_chunks_embeds_and_upserts(client, auth_headers, recording_store):
    response = client.post(
        "/api/v1/internal/ingest",
        json=_payload(content="Paragraph one.\n\nParagraph two.\n\nParagraph three."),
        headers=auth_headers,
    )

    assert response.status_code == 201
    assert response.json()["status"] == "success"
    assert recording_store["points"], "chunks should have been upserted"


def test_existing_chunks_are_deleted_before_the_new_set_is_written(
    client, auth_headers, recording_store
):
    """
    **The v1 data-correctness bug.**

    Chunk ids are uuid5(f"{doc}_chunk_{i}"). Re-ingesting a document that now
    produces fewer chunks overwrites 0..n-1 but leaves n..m from the previous
    version in the index permanently, where they are retrieved and presented
    as current fact.
    """
    client.post("/api/v1/internal/ingest", json=_payload(), headers=auth_headers)
    assert recording_store["deleted"] == ["doc-1"]


def test_update_document_also_replaces_rather_than_merges(
    client, auth_headers, recording_store
):
    response = client.post(
        "/api/v1/internal/update-document",
        json=_payload(version=2, content="Revised, much shorter."),
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert "doc-1" in recording_store["deleted"]


def test_chunk_payload_carries_the_retrieval_metadata(
    client, auth_headers, recording_store
):
    """Missing tenant/category metadata would silently break filtered search."""
    client.post(
        "/api/v1/internal/ingest",
        json=_payload(tenant_id="acme", category="policy"),
        headers=auth_headers,
    )

    payload = recording_store["points"][0].payload
    assert payload["document_id"] == "doc-1"
    assert payload["tenant_id"] == "acme"
    assert payload["category"] == "policy"
    assert payload["chunk_index"] == 0
    assert payload["content"]


def test_chunk_ids_are_deterministic(client, auth_headers, recording_store):
    """Stable ids are what make re-ingestion idempotent rather than duplicating."""
    client.post("/api/v1/internal/ingest", json=_payload(), headers=auth_headers)
    first = [point.id for point in recording_store["points"]]

    recording_store["points"].clear()
    client.post("/api/v1/internal/ingest", json=_payload(), headers=auth_headers)
    second = [point.id for point in recording_store["points"]]

    assert first == second


def test_embeddings_are_requested_in_one_batch(client, auth_headers, recording_store, monkeypatch):
    """
    v1 embedded one chunk per HTTP call inside a loop — a 100-chunk document
    meant 100 sequential round-trips.
    """
    batch_calls = {"n": 0}

    async def _aembed_batch(texts):
        batch_calls["n"] += 1
        return [[0.1] * 384 for _ in texts]

    monkeypatch.setattr("app.api.v1.ingest.embedder.aembed_batch", _aembed_batch)

    long_document = "\n\n".join(f"Paragraph number {i} about AV systems." for i in range(30))
    client.post(
        "/api/v1/internal/ingest", json=_payload(content=long_document), headers=auth_headers
    )

    assert batch_calls["n"] == 1


def test_storage_failure_returns_500(client, auth_headers, monkeypatch):
    async def _delete(document_id):
        return True

    async def _upsert_fails(points):
        return False

    monkeypatch.setattr(vector_db_module.vector_db_manager, "delete_document", _delete)
    monkeypatch.setattr(vector_db_module.vector_db_manager, "upsert_points", _upsert_fails)

    response = client.post("/api/v1/internal/ingest", json=_payload(), headers=auth_headers)
    assert response.status_code == 500


# ----------------------------------------------------------------------
# Deletion
# ----------------------------------------------------------------------
def test_delete_document_removes_vectors(client, auth_headers, recording_store):
    response = client.delete(
        "/api/v1/internal/document/doc-1?category=product&tenant_id=default",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert "doc-1" in recording_store["deleted"]


def test_delete_works_without_the_legacy_category_param(
    client, auth_headers, recording_store
):
    """`category` is accepted for v1 compatibility but must not be required."""
    response = client.delete("/api/v1/internal/document/doc-1", headers=auth_headers)
    assert response.status_code == 200


# ----------------------------------------------------------------------
# Upload parsing
# ----------------------------------------------------------------------
def test_parse_rejects_an_unsupported_extension(client, auth_headers):
    """The suffix is attacker-controlled and becomes part of a temp filename."""
    response = client.post(
        "/api/v1/internal/parse",
        files={"file": ("evil.exe", b"MZ binary", "application/octet-stream")},
        headers=auth_headers,
    )
    assert response.status_code == 400


def test_parse_extracts_text_from_a_txt_upload(client, auth_headers):
    response = client.post(
        "/api/v1/internal/parse",
        files={"file": ("notes.txt", b"Mindstec distributes AV technology.", "text/plain")},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert "Mindstec" in response.json()["text"]


def test_parse_rejects_an_oversized_upload(client, auth_headers, monkeypatch):
    monkeypatch.setattr(settings, "INGEST_MAX_UPLOAD_BYTES", 10)
    response = client.post(
        "/api/v1/internal/parse",
        files={"file": ("big.txt", b"x" * 100, "text/plain")},
        headers=auth_headers,
    )
    assert response.status_code == 413


def test_parse_rejects_a_file_with_no_extractable_text(client, auth_headers):
    """Indexing an empty document is worse than reporting the failure."""
    response = client.post(
        "/api/v1/internal/parse",
        files={"file": ("blank.txt", b"   \n  ", "text/plain")},
        headers=auth_headers,
    )
    assert response.status_code == 400
