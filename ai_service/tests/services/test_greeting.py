from app.services.rag import rag_orchestrator

def test_greeting_fast_path():
    """
    Test that standard greetings bypass RAG retrieval and classifier
    and immediately return the friendly welcome message.
    """
    greetings = ["hi", "hello", "hey", "good morning", "Good Evening!", "Hello."]
    for g in greetings:
        res = rag_orchestrator.query(question=g, history=[])
        assert res.answer == "Hello! I'm the Mindstec AI assistant. How can I help you today?"
        assert res.citations == []
        assert res.confidence_score == 1.0
