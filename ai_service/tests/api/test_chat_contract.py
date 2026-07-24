"""
API contract tests.

These are the backward-compatibility guard. Django's `AIClient.chat_query`
posts a fixed payload and the React widget reads `answer` and `citations`, so
any change to these shapes is a breaking change regardless of what happens
internally.
"""
import json

import pytest

from app.core.config import settings
from tests.conftest import TEST_API_KEY, make_hit


# ----------------------------------------------------------------------
# Auth
# ----------------------------------------------------------------------
def test_chat_requires_authentication(client):
    response = client.post("/api/v1/internal/chat", json={"message": "hi"})
    assert response.status_code in (401, 403)


def test_chat_rejects_a_wrong_key(client):
    response = client.post(
        "/api/v1/internal/chat",
        json={"message": "hi"},
        headers={"Authorization": "Bearer wrong-key"},
    )
    assert response.status_code == 401


def test_health_needs_no_auth(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


# ----------------------------------------------------------------------
# Response shape
# ----------------------------------------------------------------------
def test_chat_response_keeps_the_v1_shape(client, auth_headers):
    """Every v1 key must still be present with the same type."""
    response = client.post(
        "/api/v1/internal/chat",
        json={"message": "hello", "conversation_id": "contract-1"},
        headers=auth_headers,
    )
    assert response.status_code == 200

    body = response.json()
    assert isinstance(body["answer"], str) and body["answer"]
    assert isinstance(body["citations"], list)
    assert isinstance(body["confidence_score"], (int, float))
    assert isinstance(body["duration_seconds"], (int, float))


def test_chat_accepts_every_v1_payload_field(client, auth_headers):
    """Exactly the payload Django's AIClient sends."""
    response = client.post(
        "/api/v1/internal/chat",
        json={
            "message": "hello",
            "conversation_id": "contract-2",
            "stream": False,
            "category": None,
            "tenant_id": "default",
        },
        headers=auth_headers,
    )
    assert response.status_code == 200


def test_history_endpoint_keeps_the_v1_shape(client, auth_headers):
    client.post(
        "/api/v1/internal/chat",
        json={"message": "hi", "conversation_id": "hist-1"},
        headers=auth_headers,
    )
    response = client.get("/api/v1/internal/chat/history/hist-1", headers=auth_headers)

    assert response.status_code == 200
    history = response.json()
    assert isinstance(history, list)
    for item in history:
        assert set(item.keys()) == {"id", "role", "content", "timestamp"}
        assert item["role"] in {"user", "assistant", "system"}


def test_history_round_trips_the_conversation(client, auth_headers):
    client.post(
        "/api/v1/internal/chat",
        json={"message": "hello there", "conversation_id": "hist-2"},
        headers=auth_headers,
    )
    history = client.get(
        "/api/v1/internal/chat/history/hist-2", headers=auth_headers
    ).json()

    assert len(history) == 2
    assert history[0]["role"] == "user"
    assert history[0]["content"] == "hello there"
    assert history[1]["role"] == "assistant"


# ----------------------------------------------------------------------
# Validation
# ----------------------------------------------------------------------
@pytest.mark.parametrize("payload", [{}, {"message": ""}, {"message": "   "}])
def test_invalid_payloads_are_rejected(client, auth_headers, payload):
    response = client.post("/api/v1/internal/chat", json=payload, headers=auth_headers)
    assert response.status_code == 422


def test_oversized_message_is_rejected(client, auth_headers):
    response = client.post(
        "/api/v1/internal/chat",
        json={"message": "x" * (settings.CHAT_MESSAGE_MAX_LENGTH + 1)},
        headers=auth_headers,
    )
    assert response.status_code == 422


def test_conversation_id_with_control_characters_is_rejected(client, auth_headers):
    """These become Redis key components, so they must be constrained."""
    response = client.post(
        "/api/v1/internal/chat",
        json={"message": "hi", "conversation_id": "bad\nid"},
        headers=auth_headers,
    )
    assert response.status_code == 422


# ----------------------------------------------------------------------
# Streaming (additive in v2 — the field existed in v1 but was ignored)
# ----------------------------------------------------------------------
def test_streaming_returns_sse(client, auth_headers, with_hits, with_llm):
    with_hits([make_hit()])
    with_llm("We distribute Crestron control systems.")

    with client.stream(
        "POST",
        "/api/v1/internal/chat",
        json={"message": "hi", "conversation_id": "stream-1", "stream": True},
        headers=auth_headers,
    ) as response:
        assert response.status_code == 200
        assert response.headers["content-type"].startswith("text/event-stream")
        body = "".join(response.iter_text())

    assert "event: citations" in body
    assert "event: delta" in body
    assert "event: done" in body


def test_streaming_events_are_valid_json(client, auth_headers):
    with client.stream(
        "POST",
        "/api/v1/internal/chat",
        json={"message": "thanks", "conversation_id": "stream-2", "stream": True},
        headers=auth_headers,
    ) as response:
        body = "".join(response.iter_text())

    for line in body.splitlines():
        if line.startswith("data: "):
            json.loads(line[len("data: ") :])  # must not raise


def test_non_streaming_is_the_default(client, auth_headers):
    """The v1 default path must stay JSON, not SSE."""
    response = client.post(
        "/api/v1/internal/chat",
        json={"message": "hi", "conversation_id": "nostream"},
        headers=auth_headers,
    )
    assert response.headers["content-type"].startswith("application/json")


# ----------------------------------------------------------------------
# Operational endpoints
# ----------------------------------------------------------------------
def test_request_id_is_echoed(client, auth_headers):
    response = client.post(
        "/api/v1/internal/chat",
        json={"message": "hi", "conversation_id": "rid"},
        headers={**auth_headers, "X-Request-ID": "abc123"},
    )
    assert response.headers["X-Request-ID"] == "abc123"


def test_rate_limit_returns_429_with_retry_after(client, auth_headers, monkeypatch):
    monkeypatch.setattr(settings, "RATE_LIMIT_ENABLED", True)
    from app.core.security import SlidingWindowRateLimiter
    import app.core.security as security_module

    monkeypatch.setattr(security_module, "rate_limiter", SlidingWindowRateLimiter(2, 60))
    monkeypatch.setattr("app.api.v1.chat.enforce_rate_limit", security_module.enforce_rate_limit)

    codes = [
        client.post(
            "/api/v1/internal/chat",
            json={"message": "hi", "conversation_id": "rl"},
            headers=auth_headers,
        ).status_code
        for _ in range(4)
    ]

    assert 429 in codes
    limited = client.post(
        "/api/v1/internal/chat",
        json={"message": "hi", "conversation_id": "rl"},
        headers=auth_headers,
    )
    assert limited.status_code == 429
    assert "Retry-After" in limited.headers


def test_metrics_endpoint_reports_counters(client, auth_headers):
    client.post(
        "/api/v1/internal/chat",
        json={"message": "hi", "conversation_id": "metrics"},
        headers=auth_headers,
    )
    body = client.get("/metrics").json()
    assert "counters" in body and "timings" in body
    assert body["counters"].get("turn.count", 0) >= 1


def test_readiness_reports_each_dependency(client):
    response = client.get("/health/ready")
    assert response.status_code in (200, 503)
    dependencies = response.json()["dependencies"]
    assert {"vector_db", "session_store", "llm"} <= set(dependencies)


def test_clear_history_endpoint(client, auth_headers):
    client.post(
        "/api/v1/internal/chat",
        json={"message": "hi", "conversation_id": "clr"},
        headers=auth_headers,
    )
    response = client.delete("/api/v1/internal/chat/history/clr", headers=auth_headers)
    assert response.status_code == 200
    assert client.get("/api/v1/internal/chat/history/clr", headers=auth_headers).json() == []
