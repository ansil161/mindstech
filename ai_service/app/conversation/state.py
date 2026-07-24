"""
Per-conversation state.

This is what makes "yes" mean something. Without it, an affirmation is just a
three-letter string that gets embedded and searched, which is exactly the
failure this refactor targets:

    Assistant: "Would you like to explore our control room solutions?"
    User:      "Yes"
    v1:        vector search for the literal token "yes" -> no matches ->
               "I don't have details on that specific request."
    v2:        pending_confirmation resolves to the control-room topic and the
               conversation continues.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.llm import ChatMessage


class PendingConfirmation(BaseModel):
    """
    A question the assistant asked that a bare "yes"/"no" would answer.

    `query_on_confirm` is the retrieval query to run if the user agrees, so
    resolving an affirmation is a lookup rather than a re-interpretation.
    """

    question: str = Field(..., description="The question the assistant asked.")
    topic: Optional[str] = Field(default=None, description="Subject the question was about.")
    query_on_confirm: str = Field(..., description="Standalone query to run if the user says yes.")
    turn: int = Field(default=0, description="Turn number at which this was raised.")


class ConversationState(BaseModel):
    """
    Everything the engine remembers between turns.

    Deliberately small and JSON-serialisable: it round-trips through Redis on
    every turn, so anything expensive to serialise does not belong here.
    Retrieved chunk *text* is intentionally not stored — only citations — to
    keep the record compact and avoid duplicating the knowledge base into the
    session store.
    """

    model_config = ConfigDict(extra="ignore")

    conversation_id: str = "default"
    turn_count: int = 0

    current_topic: Optional[str] = None
    last_topic: Optional[str] = None
    # Entities accumulated across the conversation, most recent first. Used to
    # give the rewriter something concrete to resolve pronouns against.
    recent_entities: List[str] = Field(default_factory=list)

    last_intent: Optional[str] = None
    last_user_message: Optional[str] = None
    last_assistant_message: Optional[str] = None
    last_assistant_question: Optional[str] = None

    pending_confirmation: Optional[PendingConfirmation] = None
    # Citations from the most recent grounded answer, so a follow-up can be
    # attributed consistently even when it is answered conversationally.
    last_citations: List[Dict[str, Any]] = Field(default_factory=list)

    # Consecutive turns where retrieval found nothing. Drives escalation from
    # "I don't have that" to offering a human hand-off.
    consecutive_no_answer: int = 0
    greeted: bool = False
    updated_at: float = 0.0

    # -- mutations ---------------------------------------------------------
    def set_topic(self, topic: Optional[str]) -> None:
        """Promotes a new topic, retaining the previous one for back-references."""
        if not topic:
            return
        normalized = topic.strip()
        if not normalized or normalized == self.current_topic:
            return
        self.last_topic = self.current_topic
        self.current_topic = normalized

    def add_entities(self, entities: List[str], limit: int = 12) -> None:
        """Merges newly-seen entities, most recent first, de-duplicated."""
        if not entities:
            return
        merged = [e.strip() for e in entities if e and e.strip()]
        for existing in self.recent_entities:
            if existing not in merged:
                merged.append(existing)
        self.recent_entities = merged[:limit]

    def clear_pending(self) -> None:
        self.pending_confirmation = None

    def record_no_answer(self) -> None:
        self.consecutive_no_answer += 1

    def record_answer(self) -> None:
        self.consecutive_no_answer = 0


class ConversationSession(BaseModel):
    """State plus the message transcript — the full persisted unit."""

    model_config = ConfigDict(extra="ignore")

    state: ConversationState = Field(default_factory=ConversationState)
    messages: List[ChatMessage] = Field(default_factory=list)

    def recent_messages(self, window: int) -> List[ChatMessage]:
        if window <= 0:
            return []
        return self.messages[-window:]
