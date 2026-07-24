"""
Qdrant collection compatibility on an embedding dimension change.

The single most destructive thing this layer can do is delete a populated
collection because a config value moved. These tests pin the "refuse and
explain" behaviour so the guard cannot be regressed by accident.
"""
from __future__ import annotations

from types import SimpleNamespace
from typing import Any, List

import pytest

from app.core.config import settings
from app.storage.vector_db import QdrantManager, VectorStoreMisconfigured


def collection_info(size: int, points: int = 1000) -> SimpleNamespace:
    """Mimics the nested shape of Qdrant's get_collection response."""
    return SimpleNamespace(
        config=SimpleNamespace(params=SimpleNamespace(vectors=SimpleNamespace(size=size))),
        points_count=points,
    )


class FakeQdrant:
    def __init__(self, existing: dict[str, int]) -> None:
        self._existing = existing
        self.deleted: List[str] = []
        self.created: List[tuple[str, int]] = []

    async def get_collections(self) -> Any:
        return SimpleNamespace(
            collections=[SimpleNamespace(name=name) for name in self._existing]
        )

    async def get_collection(self, name: str) -> Any:
        return collection_info(self._existing[name])

    async def create_collection(self, collection_name: str, vectors_config: Any, **_: Any) -> None:
        self.created.append((collection_name, vectors_config.size))
        self._existing[collection_name] = vectors_config.size

    async def delete_collection(self, collection_name: str, **_: Any) -> None:
        self.deleted.append(collection_name)
        self._existing.pop(collection_name, None)

    async def create_payload_index(self, **_: Any) -> None:
        return None


@pytest.fixture
def manager(monkeypatch):
    """A QdrantManager wired to a fake client, with config held explicit."""

    def _make(existing: dict[str, int], *, expected: int, allow_destructive: bool = False):
        monkeypatch.setattr(settings, "QDRANT_COLLECTION_NAME", "mindstec_rag")
        monkeypatch.setattr(settings, "QDRANT_VECTOR_DIMENSION", expected)
        monkeypatch.setattr(settings, "QDRANT_ALLOW_DESTRUCTIVE_RECREATE", allow_destructive)
        # Pin the embedder's contribution so these tests are about the store.
        monkeypatch.setattr(
            "app.services.embedder.embedder._observed_dimension", expected, raising=False
        )

        instance = QdrantManager()
        fake = FakeQdrant(existing)
        instance._client = fake
        return instance, fake

    return _make


async def test_a_width_clash_refuses_to_serve(manager):
    """
    The collection holds 384-dim vectors; the new model emits 768-dim. Serving
    would mean searching an index with incomparable vectors.
    """
    instance, fake = manager({"mindstec_rag": 384}, expected=768)

    with pytest.raises(VectorStoreMisconfigured, match="384"):
        await instance._ensure_collection()

    assert fake.deleted == []
    assert fake.created == []


async def test_a_width_clash_never_deletes_data(manager):
    """Safety over convenience: a config typo must not cost the knowledge base."""
    instance, fake = manager({"mindstec_rag": 384}, expected=768)

    with pytest.raises(VectorStoreMisconfigured):
        await instance._ensure_collection()

    assert "mindstec_rag" in fake._existing
    assert fake._existing["mindstec_rag"] == 384


async def test_the_refusal_names_both_widths(manager):
    instance, _ = manager({"mindstec_rag": 384}, expected=768)

    with pytest.raises(VectorStoreMisconfigured) as excinfo:
        await instance._ensure_collection()

    message = str(excinfo.value)
    assert "384" in message and "768" in message
    assert "Refusing to touch existing data" in message


async def test_a_matching_width_is_accepted(manager):
    instance, fake = manager({"mindstec_rag": 768}, expected=768)

    await instance._ensure_collection()

    assert fake.deleted == []
    assert fake.created == []


async def test_a_missing_collection_is_created_at_the_detected_width(manager):
    instance, fake = manager({}, expected=768)

    await instance._ensure_collection()

    assert fake.created == [("mindstec_rag", 768)]
    assert fake.deleted == []


async def test_recreate_happens_only_under_the_explicit_override(manager):
    """The destructive path exists for supervised re-indexes and nothing else."""
    instance, fake = manager({"mindstec_rag": 384}, expected=768, allow_destructive=True)

    await instance._ensure_collection()

    assert fake.deleted == ["mindstec_rag"]
    assert fake.created == [("mindstec_rag", 768)]


async def test_expected_dimension_follows_the_live_embedding_width(monkeypatch):
    """
    Config is the value most likely to be stale after a model change, so the
    measured width wins when one is available.
    """
    monkeypatch.setattr(settings, "QDRANT_VECTOR_DIMENSION", 384)
    monkeypatch.setattr(
        "app.services.embedder.embedder._observed_dimension", 768, raising=False
    )

    assert QdrantManager().expected_dimension == 768
