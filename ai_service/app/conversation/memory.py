"""
Conversation persistence.

Fixes three v1 defects:

1. The Redis client latched to `False` on the first connection failure and
   never reconnected, so one blip during startup meant the process fell back
   to per-worker memory permanently. There is now a backoff-and-retry.
2. History was `RPUSH`-ed with no `LTRIM` and read with `LRANGE 0 -1`, so a
   long conversation grew without bound and every turn paid to fetch all of
   it. History is now trimmed on write and only the tail is read.
3. The in-memory fallback was an unbounded dict — a slow memory leak keyed by
   attacker-suppliable conversation ids. It is now LRU-bounded with a TTL.

Redis access is via `redis.asyncio` so it does not block the event loop.
"""
from __future__ import annotations

import json
import logging
import threading
import time
from collections import OrderedDict
from typing import Any, Dict, List, Optional, Tuple

from app.conversation.state import ConversationSession, ConversationState
from app.core.config import settings
from app.models.llm import ChatMessage, MessageRole

logger = logging.getLogger(__name__)

_STATE_KEY = "chat_state:{conversation_id}"
_HISTORY_KEY = "chat_history:{conversation_id}"


class _BoundedSessionCache:
    """LRU + TTL map used when Redis is unavailable. Bounded by construction."""

    def __init__(self, max_entries: int, ttl_seconds: int) -> None:
        self._max_entries = max_entries
        self._ttl_seconds = ttl_seconds
        self._store: "OrderedDict[str, Tuple[float, ConversationSession]]" = OrderedDict()
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[ConversationSession]:
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            expires_at, session = entry
            if time.time() >= expires_at:
                del self._store[key]
                return None
            self._store.move_to_end(key)
            return session

    def set(self, key: str, session: ConversationSession) -> None:
        with self._lock:
            self._store[key] = (time.time() + self._ttl_seconds, session)
            self._store.move_to_end(key)
            while len(self._store) > self._max_entries:
                self._store.popitem(last=False)

    def delete(self, key: str) -> None:
        with self._lock:
            self._store.pop(key, None)

    def clear(self) -> None:
        with self._lock:
            self._store.clear()

    def __len__(self) -> int:
        with self._lock:
            return len(self._store)


class ConversationMemory:
    """
    Async session store: Redis when reachable, bounded process memory otherwise.

    Degradation is explicit and observable rather than silent — callers can
    read `backend` to report which path is live in the readiness probe.
    """

    def __init__(self) -> None:
        self._redis: Any = None
        self._redis_unavailable_until: float = 0.0
        self._lock = threading.Lock()
        self._fallback = _BoundedSessionCache(
            max_entries=settings.HISTORY_MEMORY_MAX_CONVERSATIONS,
            ttl_seconds=settings.HISTORY_TTL_SECONDS,
        )

    # -- connection --------------------------------------------------------
    @property
    def backend(self) -> str:
        return "redis" if self._redis is not None else "memory"

    async def _get_redis(self) -> Any:
        """
        Returns a connected async Redis client, or None if unavailable.

        A failed connection is remembered for REDIS_RECONNECT_BACKOFF_SECONDS
        so a down Redis costs one connection attempt per window rather than
        one per request — but, unlike v1, it is always retried eventually.
        """
        if self._redis is not None:
            return self._redis

        with self._lock:
            if self._redis is not None:
                return self._redis
            if time.monotonic() < self._redis_unavailable_until:
                return None

        try:
            import redis.asyncio as aioredis

            client = aioredis.from_url(
                settings.session_redis_url,
                decode_responses=True,
                socket_timeout=settings.REDIS_SOCKET_TIMEOUT_SECONDS,
                socket_connect_timeout=settings.REDIS_SOCKET_TIMEOUT_SECONDS,
                health_check_interval=30,
            )
            await client.ping()
            with self._lock:
                self._redis = client
                self._redis_unavailable_until = 0.0
            logger.info("Conversation memory connected to Redis.")
            return client
        except Exception as exc:  # noqa: BLE001 - any failure means "use fallback"
            with self._lock:
                self._redis = None
                self._redis_unavailable_until = (
                    time.monotonic() + settings.REDIS_RECONNECT_BACKOFF_SECONDS
                )
            logger.warning(
                "Redis unavailable for conversation memory (%s); using bounded "
                "in-process fallback for the next %.0fs.",
                exc, settings.REDIS_RECONNECT_BACKOFF_SECONDS,
            )
            return None

    def _drop_redis(self, exc: BaseException) -> None:
        with self._lock:
            self._redis = None
            self._redis_unavailable_until = (
                time.monotonic() + settings.REDIS_RECONNECT_BACKOFF_SECONDS
            )
        logger.warning("Redis operation failed, falling back to memory: %s", exc)

    async def close(self) -> None:
        client = self._redis
        self._redis = None
        if client is not None:
            try:
                await client.aclose()
            except Exception:  # noqa: BLE001 - shutdown must not raise
                pass

    # -- reads -------------------------------------------------------------
    async def load(self, conversation_id: str) -> ConversationSession:
        """Loads a session, always returning a usable object (never None)."""
        client = await self._get_redis()
        if client is not None:
            try:
                raw_state = await client.get(_STATE_KEY.format(conversation_id=conversation_id))
                raw_messages = await client.lrange(
                    _HISTORY_KEY.format(conversation_id=conversation_id),
                    -settings.HISTORY_MAX_MESSAGES,
                    -1,
                )
                state = self._decode_state(conversation_id, raw_state)
                messages = self._decode_messages(raw_messages)
                return ConversationSession(state=state, messages=messages)
            except Exception as exc:  # noqa: BLE001
                self._drop_redis(exc)

        cached = self._fallback.get(conversation_id)
        if cached is not None:
            return cached
        return ConversationSession(state=ConversationState(conversation_id=conversation_id))

    async def get_history(self, conversation_id: str) -> List[ChatMessage]:
        session = await self.load(conversation_id)
        return session.messages

    # -- writes ------------------------------------------------------------
    async def save_turn(
        self,
        conversation_id: str,
        state: ConversationState,
        user_message: ChatMessage,
        assistant_message: ChatMessage,
    ) -> None:
        """
        Persists one complete exchange plus the updated state.

        Both messages are written together so history can never contain a user
        turn without its reply — a half-written exchange would corrupt the
        next turn's follow-up resolution.
        """
        state.updated_at = time.time()
        client = await self._get_redis()

        if client is not None:
            try:
                history_key = _HISTORY_KEY.format(conversation_id=conversation_id)
                state_key = _STATE_KEY.format(conversation_id=conversation_id)
                pipe = client.pipeline()
                pipe.rpush(
                    history_key,
                    self._encode_message(user_message),
                    self._encode_message(assistant_message),
                )
                # LTRIM on every write is what bounds the list. Without it the
                # key grows forever and LRANGE cost rises with conversation age.
                pipe.ltrim(history_key, -settings.HISTORY_MAX_MESSAGES, -1)
                pipe.expire(history_key, settings.HISTORY_TTL_SECONDS)
                pipe.set(state_key, state.model_dump_json(), ex=settings.HISTORY_TTL_SECONDS)
                await pipe.execute()
                return
            except Exception as exc:  # noqa: BLE001
                self._drop_redis(exc)

        session = self._fallback.get(conversation_id) or ConversationSession(
            state=ConversationState(conversation_id=conversation_id)
        )
        session.state = state
        session.messages = (session.messages + [user_message, assistant_message])[
            -settings.HISTORY_MAX_MESSAGES :
        ]
        self._fallback.set(conversation_id, session)

    async def clear(self, conversation_id: str) -> None:
        client = await self._get_redis()
        if client is not None:
            try:
                await client.delete(
                    _HISTORY_KEY.format(conversation_id=conversation_id),
                    _STATE_KEY.format(conversation_id=conversation_id),
                )
            except Exception as exc:  # noqa: BLE001
                self._drop_redis(exc)
        self._fallback.delete(conversation_id)

    async def ping(self) -> bool:
        client = await self._get_redis()
        if client is None:
            return False
        try:
            await client.ping()
            return True
        except Exception as exc:  # noqa: BLE001
            self._drop_redis(exc)
            return False

    # -- codecs ------------------------------------------------------------
    @staticmethod
    def _encode_message(message: ChatMessage) -> str:
        role = message.role.value if hasattr(message.role, "value") else str(message.role)
        return json.dumps({"role": role, "content": message.content})

    @staticmethod
    def _decode_messages(raw_messages: List[str]) -> List[ChatMessage]:
        messages: List[ChatMessage] = []
        for raw in raw_messages or []:
            try:
                data = json.loads(raw)
                content = (data.get("content") or "").strip()
                if not content:
                    # ChatMessage rejects empty content; skip rather than
                    # letting one corrupt record poison the whole history.
                    continue
                messages.append(ChatMessage(role=MessageRole(data["role"]), content=content))
            except Exception:  # noqa: BLE001
                logger.debug("Skipping unparseable history record.")
        return messages

    @staticmethod
    def _decode_state(conversation_id: str, raw_state: Optional[str]) -> ConversationState:
        if not raw_state:
            return ConversationState(conversation_id=conversation_id)
        try:
            payload: Dict[str, Any] = json.loads(raw_state)
            payload["conversation_id"] = conversation_id
            return ConversationState.model_validate(payload)
        except Exception:  # noqa: BLE001 - a schema change must not break sessions
            logger.info("Discarding unreadable conversation state; starting fresh.")
            return ConversationState(conversation_id=conversation_id)


conversation_memory = ConversationMemory()
