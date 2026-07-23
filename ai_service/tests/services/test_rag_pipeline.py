"""
End-to-end RAG orchestration tests with the embedding provider, vector store,
classifier, and LLM all mocked — no real network calls. Covers the specific
graceful-degradation and history-awareness behaviors this round of changes
introduced.
"""
from unittest.mock import MagicMock
import pytest

from app.services.rag import rag_orchestrator
from app.services import classifier as classifier_module
from app.services import llm as llm_module
from app.storage import vector_db as vector_db_module
from app.services import embedder as embedder_module
from app.models.llm import LLMGenerationResponse, ChatMessage, MessageRole
from app.core.config import settings


@pytest.fixture(autouse=True)
def _mock_embedding(monkeypatch):
    # No test in this file exercises embedding correctness itself — only
    # orchestration/control-flow — so give every test a free, network-free
    # embedding call by default.
    monkeypatch.setattr(embedder_module.embedder, "get_embedding", lambda text: [0.1] * 384)


def _fake_hit(score=0.8, content="Mindstec distributes Crestron control systems.", doc_id="doc1"):
    return {
        "id": doc_id,
        "score": score,
        "payload": {"document_id": doc_id, "title": "Doc", "content": content, "chunk_index": 0, "source": ""},
    }


def _fake_llm_response(text: str) -> LLMGenerationResponse:
    return LLMGenerationResponse(provider="test", model="test", content=text, duration_seconds=0.05)


def test_classifier_failure_falls_back_to_raw_query_instead_of_aborting(monkeypatch):
    """A classifier/routing failure must never short-circuit the whole
    request with a canned error — it should fall back to the raw question
    and continue retrieval + generation normally."""
    monkeypatch.setattr(classifier_module.classifier, "analyze_query", lambda q, history=None: None)
    monkeypatch.setattr(vector_db_module.vector_db_manager, "search_similar", lambda **kw: [_fake_hit()])
    monkeypatch.setattr(llm_module.llm_service, "generate_response", lambda **kw: _fake_llm_response("Here is the answer."))

    result = rag_orchestrator.query(question="what does mindstec sell?", history=[])

    assert result.answer == "Here is the answer."
    assert result.citations  # retrieval still happened on the raw question


def test_empty_retrieval_declines_gracefully_without_calling_the_llm(monkeypatch):
    monkeypatch.setattr(
        classifier_module.classifier, "analyze_query",
        lambda q, history=None: {"in_scope": True, "rewritten_query": q, "extracted_entities": []},
    )
    monkeypatch.setattr(vector_db_module.vector_db_manager, "search_similar", lambda **kw: [])
    generate_mock = MagicMock()
    monkeypatch.setattr(llm_module.llm_service, "generate_response", generate_mock)

    result = rag_orchestrator.query(question="something totally unindexed", history=[])

    assert result.answer == settings.LOW_SIMILARITY_MESSAGE
    generate_mock.assert_not_called()  # must not let the LLM answer with zero grounding


def test_llm_failure_degrades_to_a_normal_response_not_an_exception(monkeypatch):
    monkeypatch.setattr(
        classifier_module.classifier, "analyze_query",
        lambda q, history=None: {"in_scope": True, "rewritten_query": q, "extracted_entities": []},
    )
    monkeypatch.setattr(vector_db_module.vector_db_manager, "search_similar", lambda **kw: [_fake_hit()])

    def _raise(**kw):
        raise RuntimeError("all providers exhausted")
    monkeypatch.setattr(llm_module.llm_service, "generate_response", _raise)

    result = rag_orchestrator.query(question="tell me about your control systems", history=[])

    assert result.answer == settings.LLM_UNAVAILABLE_MESSAGE
    assert result.confidence_score == 0.0


def test_out_of_scope_question_is_rejected_without_hitting_retrieval(monkeypatch):
    monkeypatch.setattr(
        classifier_module.classifier, "analyze_query",
        lambda q, history=None: {"in_scope": False, "rewritten_query": q, "extracted_entities": []},
    )
    search_mock = MagicMock()
    monkeypatch.setattr(vector_db_module.vector_db_manager, "search_similar", search_mock)

    result = rag_orchestrator.query(question="who won the world cup?", history=[])

    assert result.answer == settings.SCOPE_REJECTION_MESSAGE
    search_mock.assert_not_called()


def test_classifier_receives_conversation_history_for_followup_resolution(monkeypatch):
    """Verifies the pipeline actually threads history into the classifier
    call so it can resolve "what about that?"-style follow-ups — the
    rewriting quality itself is the LLM's job, not something to unit test."""
    captured = {}

    def _capture(question, history=None):
        captured["question"] = question
        captured["history"] = history
        return {
            "in_scope": True,
            "rewritten_query": "How much do Crestron control systems cost?",
            "extracted_entities": [],
        }

    monkeypatch.setattr(classifier_module.classifier, "analyze_query", _capture)
    monkeypatch.setattr(vector_db_module.vector_db_manager, "search_similar", lambda **kw: [_fake_hit()])
    monkeypatch.setattr(llm_module.llm_service, "generate_response", lambda **kw: _fake_llm_response("They start around $2,000."))

    history = [
        ChatMessage(role=MessageRole.USER, content="What control systems do you distribute?"),
        ChatMessage(role=MessageRole.ASSISTANT, content="We distribute Crestron control systems."),
    ]
    result = rag_orchestrator.query(question="how much does it cost?", history=history)

    assert captured["question"] == "how much does it cost?"
    assert captured["history"] == history
    assert "2,000" in result.answer


def test_query_rewriting_can_be_disabled_via_config(monkeypatch):
    monkeypatch.setattr(settings, "ENABLE_QUERY_REWRITING", False)
    classifier_mock = MagicMock()
    monkeypatch.setattr(classifier_module.classifier, "analyze_query", classifier_mock)
    monkeypatch.setattr(vector_db_module.vector_db_manager, "search_similar", lambda **kw: [_fake_hit()])
    monkeypatch.setattr(llm_module.llm_service, "generate_response", lambda **kw: _fake_llm_response("Answer."))

    result = rag_orchestrator.query(question="what do you distribute?", history=[])

    classifier_mock.assert_not_called()
    assert result.answer == "Answer."


def test_greeting_still_bypasses_everything(monkeypatch):
    """Regression guard for the pre-existing fast path."""
    classifier_mock = MagicMock()
    search_mock = MagicMock()
    monkeypatch.setattr(classifier_module.classifier, "analyze_query", classifier_mock)
    monkeypatch.setattr(vector_db_module.vector_db_manager, "search_similar", search_mock)

    result = rag_orchestrator.query(question="hello", history=[])

    assert result.answer == "Hello! I'm the Mindstec AI assistant. How can I help you today?"
    classifier_mock.assert_not_called()
    search_mock.assert_not_called()
