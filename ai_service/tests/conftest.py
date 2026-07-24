"""
Shared test fixtures.

Everything network-touching is stubbed by default (autouse), so the suite runs
offline and deterministically. A test that wants to exercise a real provider
path opts in by overriding the specific stub it cares about.
"""
from __future__ import annotations

import os
from typing import Any, Dict, List

import pytest

# The API key must exist before app.main is imported: security reads it at
# request time and the TestClient would otherwise receive a 503.
os.environ.setdefault("AI_SERVICE_API_KEY", "test-key")

from app.conversation.memory import ConversationMemory  # noqa: E402
from app.conversation.state import ConversationSession, ConversationState  # noqa: E402
from app.core.security import rate_limiter  # noqa: E402
from app.models.llm import LLMGenerationResponse  # noqa: E402
from app.services import embedder as embedder_module  # noqa: E402
from app.services import llm as llm_module  # noqa: E402
from app.storage import vector_db as vector_db_module  # noqa: E402

TEST_API_KEY = "test-key"
EMBEDDING_DIMENSION = 384


@pytest.fixture
def client():
    """FastAPI TestClient with lifespan startup/shutdown executed."""
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def auth_headers() -> Dict[str, str]:
    return {"Authorization": f"Bearer {TEST_API_KEY}"}


class InMemoryMemory(ConversationMemory):
    """
    Conversation memory that never touches Redis.

    Subclasses the real class rather than mocking it, so the state-update and
    trimming logic under test remains the production logic.
    """

    def __init__(self) -> None:
        super().__init__()
        self.sessions: Dict[str, ConversationSession] = {}

    async def _get_redis(self) -> Any:
        return None

    async def load(self, conversation_id: str) -> ConversationSession:
        existing = self.sessions.get(conversation_id)
        if existing is not None:
            return existing
        return ConversationSession(state=ConversationState(conversation_id=conversation_id))

    async def save_turn(self, conversation_id, state, user_message, assistant_message) -> None:
        session = self.sessions.setdefault(
            conversation_id,
            ConversationSession(state=ConversationState(conversation_id=conversation_id)),
        )
        session.state = state
        session.messages = session.messages + [user_message, assistant_message]

    async def get_history(self, conversation_id: str):
        session = await self.load(conversation_id)
        return session.messages

    async def clear(self, conversation_id: str) -> None:
        self.sessions.pop(conversation_id, None)

    async def ping(self) -> bool:
        return False


@pytest.fixture(autouse=True)
def isolated_memory(monkeypatch):
    """Swaps the global conversation memory for a clean in-process instance."""
    memory = InMemoryMemory()
    monkeypatch.setattr("app.conversation.dialogue.conversation_memory", memory)
    monkeypatch.setattr("app.api.v1.chat.conversation_memory", memory)
    # main.py holds its own reference for the readiness probe; without this the
    # probe would attempt a live Redis connection.
    monkeypatch.setattr("app.main.conversation_memory", memory)
    return memory


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    rate_limiter.reset()
    yield
    rate_limiter.reset()


@pytest.fixture(autouse=True)
def stub_embeddings(monkeypatch):
    """Deterministic offline embeddings — no provider call is ever made."""

    async def _aembed(text: str) -> List[float]:
        return [0.1] * EMBEDDING_DIMENSION

    async def _aembed_batch(texts: List[str]) -> List[List[float]]:
        return [[0.1] * EMBEDDING_DIMENSION for _ in texts]

    monkeypatch.setattr(embedder_module.embedder, "aembed", _aembed)
    monkeypatch.setattr(embedder_module.embedder, "aembed_batch", _aembed_batch)


@pytest.fixture(autouse=True)
def stub_vector_db(monkeypatch):
    """
    No-result vector store by default; tests override to supply hits.

    `health` is stubbed too: a developer's local `.env` may point QDRANT_URL at
    a real cloud cluster, and the readiness test would otherwise make a live
    network call — making the suite slow and dependent on someone's laptop
    configuration.
    """

    async def _search_similar(**_kwargs) -> List[Dict[str, Any]]:
        return []

    async def _search_keyword(**_kwargs) -> List[Dict[str, Any]]:
        return []

    async def _health() -> Dict[str, Any]:
        return {"status": "ok", "collection": "test", "vectors": 0, "dimension": 384}

    monkeypatch.setattr(vector_db_module.vector_db_manager, "search_similar", _search_similar)
    monkeypatch.setattr(vector_db_module.vector_db_manager, "search_keyword", _search_keyword)
    monkeypatch.setattr(vector_db_module.vector_db_manager, "health", _health)


@pytest.fixture
def with_hits(monkeypatch):
    """Factory installing a fixed set of vector hits."""

    def _install(hits: List[Dict[str, Any]]):
        async def _search_similar(**_kwargs):
            return [dict(hit) for hit in hits]

        monkeypatch.setattr(vector_db_module.vector_db_manager, "search_similar", _search_similar)

    return _install


@pytest.fixture
def with_llm(monkeypatch):
    """Factory installing a canned LLM response that records its calls."""

    calls: List[Dict[str, Any]] = []

    def _install(content: str = "Here is the answer."):
        async def _agenerate(messages, **kwargs):
            calls.append({"messages": messages, "kwargs": kwargs})
            return LLMGenerationResponse(
                provider="test", model="test", content=content, duration_seconds=0.01
            )

        monkeypatch.setattr(llm_module.llm_service, "agenerate", _agenerate)
        return calls

    return _install


@pytest.fixture(autouse=True)
def no_llm_by_default(monkeypatch):
    """
    Makes an unexpected LLM call an explicit failure.

    This is what lets the conversational tests *prove* that greetings and
    thanks never reach a model, rather than merely asserting on their text.
    """

    async def _explode(messages, **kwargs):
        raise AssertionError(
            "LLM was called unexpectedly. Use the `with_llm` fixture if the test "
            "legitimately expects generation."
        )

    monkeypatch.setattr(llm_module.llm_service, "agenerate", _explode)


def make_hit(
    score: float = 0.8,
    content: str = "Mindstec distributes Crestron control systems for enterprise control rooms.",
    document_id: str = "doc1",
    chunk_index: int = 0,
    title: str = "Control Rooms",
) -> Dict[str, Any]:
    """Builds a Qdrant-shaped hit for retrieval tests."""
    return {
        "id": f"{document_id}-{chunk_index}",
        "score": score,
        "payload": {
            "document_id": document_id,
            "title": title,
            "content": content,
            "chunk_index": chunk_index,
            "source": "https://mindstec.com/solutions",
        },
    }
