"""
Conversation memory: state round-tripping, bounded fallback, and the Redis
degradation path.

Covers the three v1 defects directly: the permanently-latched Redis client,
the untrimmed history list, and the unbounded in-memory fallback dict.
"""
import time

import pytest

from app.conversation.memory import ConversationMemory, _BoundedSessionCache
from app.conversation.state import ConversationSession, ConversationState, PendingConfirmation
from app.core.config import settings
from app.models.llm import ChatMessage, MessageRole


# ----------------------------------------------------------------------
# Bounded fallback cache
# ----------------------------------------------------------------------
def test_fallback_cache_evicts_least_recently_used():
    """
    v1's fallback was an unbounded dict keyed by caller-supplied conversation
    ids — a slow memory leak that an attacker could drive with random ids.
    """
    cache = _BoundedSessionCache(max_entries=3, ttl_seconds=60)
    for index in range(5):
        cache.set(f"c{index}", ConversationSession())

    assert len(cache) == 3
    assert cache.get("c0") is None  # evicted
    assert cache.get("c4") is not None


def test_fallback_cache_expires_entries():
    cache = _BoundedSessionCache(max_entries=10, ttl_seconds=0)
    cache.set("c1", ConversationSession())
    time.sleep(0.01)
    assert cache.get("c1") is None


def test_fallback_cache_refreshes_lru_order_on_read():
    cache = _BoundedSessionCache(max_entries=2, ttl_seconds=60)
    cache.set("a", ConversationSession())
    cache.set("b", ConversationSession())
    cache.get("a")           # 'a' is now most-recently used
    cache.set("c", ConversationSession())

    assert cache.get("a") is not None
    assert cache.get("b") is None


# ----------------------------------------------------------------------
# Memory without Redis
# ----------------------------------------------------------------------
class _NoRedisMemory(ConversationMemory):
    async def _get_redis(self):
        return None


async def test_load_returns_a_usable_session_when_nothing_is_stored():
    """Callers must never receive None; a fresh session is always valid."""
    session = await _NoRedisMemory().load("brand-new")
    assert isinstance(session, ConversationSession)
    assert session.state.conversation_id == "brand-new"
    assert session.messages == []


async def test_turn_is_persisted_and_reloaded():
    memory = _NoRedisMemory()
    state = ConversationState(conversation_id="c1", current_topic="digital signage")

    await memory.save_turn(
        "c1",
        state,
        ChatMessage(role=MessageRole.USER, content="what signage do you carry?"),
        ChatMessage(role=MessageRole.ASSISTANT, content="LED walls and wayfinding."),
    )
    session = await memory.load("c1")

    assert len(session.messages) == 2
    assert session.state.current_topic == "digital signage"


async def test_history_is_trimmed_to_the_configured_maximum(monkeypatch):
    """
    v1 never called LTRIM, so a long conversation grew without bound and every
    turn paid to read the whole list back.
    """
    monkeypatch.setattr(settings, "HISTORY_MAX_MESSAGES", 6)
    memory = _NoRedisMemory()
    state = ConversationState(conversation_id="long")

    for index in range(10):
        await memory.save_turn(
            "long",
            state,
            ChatMessage(role=MessageRole.USER, content=f"question {index}"),
            ChatMessage(role=MessageRole.ASSISTANT, content=f"answer {index}"),
        )

    session = await memory.load("long")
    assert len(session.messages) <= 6
    # The most recent turn must survive trimming.
    assert "question 9" in session.messages[-2].content


async def test_clear_removes_the_session():
    memory = _NoRedisMemory()
    await memory.save_turn(
        "gone",
        ConversationState(conversation_id="gone"),
        ChatMessage(role=MessageRole.USER, content="hi"),
        ChatMessage(role=MessageRole.ASSISTANT, content="hello"),
    )
    await memory.clear("gone")
    assert (await memory.load("gone")).messages == []


async def test_backend_reports_the_degraded_path():
    memory = _NoRedisMemory()
    await memory.load("x")
    assert memory.backend == "memory"


# ----------------------------------------------------------------------
# Codecs
# ----------------------------------------------------------------------
def test_corrupt_history_records_are_skipped_not_fatal():
    """One bad record must not poison an otherwise readable conversation."""
    decoded = ConversationMemory._decode_messages(
        [
            '{"role": "user", "content": "valid"}',
            "not json at all",
            '{"role": "user", "content": ""}',      # empty content is invalid
            '{"role": "assistant", "content": "also valid"}',
        ]
    )
    assert [m.content for m in decoded] == ["valid", "also valid"]


def test_unreadable_state_falls_back_to_a_fresh_one():
    """A schema change must not brick every live session."""
    state = ConversationMemory._decode_state("c1", "{ this is not json")
    assert state.conversation_id == "c1"
    assert state.turn_count == 0


def test_state_round_trips_through_json():
    original = ConversationState(
        conversation_id="c1",
        turn_count=3,
        current_topic="control rooms",
        pending_confirmation=PendingConfirmation(
            question="Want to see more?", query_on_confirm="control room details"
        ),
    )
    restored = ConversationMemory._decode_state("c1", original.model_dump_json())

    assert restored.turn_count == 3
    assert restored.current_topic == "control rooms"
    assert restored.pending_confirmation.query_on_confirm == "control room details"


# ----------------------------------------------------------------------
# State model behaviour
# ----------------------------------------------------------------------
def test_setting_a_topic_retains_the_previous_one():
    state = ConversationState()
    state.set_topic("digital signage")
    state.set_topic("control rooms")

    assert state.current_topic == "control rooms"
    assert state.last_topic == "digital signage"


def test_setting_the_same_topic_does_not_shift_history():
    state = ConversationState()
    state.set_topic("signage")
    state.set_topic("signage")
    assert state.last_topic is None


def test_entities_are_bounded_and_most_recent_first():
    state = ConversationState()
    state.add_entities([f"brand{i}" for i in range(20)], limit=5)
    assert len(state.recent_entities) == 5
    assert state.recent_entities[0] == "brand0"


def test_no_answer_counter_resets_on_success():
    state = ConversationState()
    state.record_no_answer()
    state.record_no_answer()
    assert state.consecutive_no_answer == 2
    state.record_answer()
    assert state.consecutive_no_answer == 0
