"""
Tier-1 deterministic intent classification.

This runs before any model call and resolves the large majority of real chat
traffic — greetings, thanks, goodbyes, yes/no, "tell me more" — at zero cost
and zero latency. Only genuinely ambiguous turns fall through to the LLM
classifier.

Design rule: a rule may only fire when it is *certain*. A greeting rule that
swallows "hi, what displays do you carry?" would be far worse than one that
abstains, so every conversational rule requires the message to consist of the
conversational phrase and nothing substantive else.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from typing import List, Optional, Pattern, Tuple

from app.conversation.intents import Intent

# Trailing punctuation and emoji-ish decoration that shouldn't affect matching.
_TRIM_RE = re.compile(r"^[\s\W_]+|[\s\W_]+$", re.UNICODE)
_WHITESPACE_RE = re.compile(r"\s+")


def normalize(text: str) -> str:
    """Lowercase, collapse whitespace, strip surrounding punctuation/emoji."""
    collapsed = _WHITESPACE_RE.sub(" ", (text or "").strip().lower())
    return _TRIM_RE.sub("", collapsed)


def _phrases(*values: str) -> frozenset[str]:
    return frozenset(values)


# --- exact-match vocabularies -------------------------------------------
# Matched against the whole normalised message, so these never hijack a
# message that also contains a real question.

GREETINGS = _phrases(
    "hi", "hii", "hiii", "hey", "heya", "hello", "helo", "hallo", "hola",
    "yo", "sup", "greetings", "howdy", "good morning", "good afternoon",
    "good evening", "good day", "gm", "ge", "hi there", "hello there",
    "hey there", "morning", "evening", "namaste", "hi bot", "hello bot",
    "anyone there", "are you there", "hi mindstec", "hello mindstec",
)

GOODBYES = _phrases(
    "bye", "byee", "goodbye", "good bye", "see you", "see ya", "cya",
    "later", "catch you later", "talk later", "talk to you later", "ttyl",
    "that's all", "thats all", "that is all", "im done", "i'm done",
    "nothing else", "no more questions", "end chat", "exit", "quit",
    "have a good day", "good night", "gn",
)

THANKS = _phrases(
    "thanks", "thank you", "thanx", "thankyou", "thx", "ty", "tysm",
    "thanks a lot", "thanks so much", "thank you so much", "many thanks",
    "much appreciated", "appreciate it", "appreciated", "cheers", "great thanks",
    "perfect thanks", "awesome thanks", "thanks!", "nice thanks",
)

AFFIRMATIONS = _phrases(
    "yes", "yeah", "yep", "yup", "ya", "yea", "sure", "ok", "okay", "k",
    "kk", "alright", "all right", "fine", "please", "please do", "yes please",
    "go ahead", "go on", "sounds good", "sure thing", "definitely",
    "absolutely", "of course", "why not", "do it", "lets do it", "let's do it",
    "i would", "i do", "correct", "right", "indeed", "affirmative",
)

NEGATIONS = _phrases(
    "no", "nope", "nah", "no thanks", "no thank you", "not really",
    "not now", "maybe later", "negative", "nevermind", "never mind",
    "not that", "wrong", "incorrect", "no not that",
)

CONTINUATIONS = _phrases(
    "tell me more", "more", "more info", "more information", "more details",
    "go on", "continue", "next", "what else", "anything else", "and",
    "and then", "keep going", "elaborate", "expand", "explain more",
    "say more", "details", "further", "go deeper", "deeper", "more please",
    "tell me more please", "show me more", "other options", "what other",
)

# Note the deliberate omission of "what do you do". On a company website that
# reads as a question about the *business*, not about the assistant, and the
# structured FAQ answers it far better than a capabilities blurb. "what can
# you do" stays, because that unambiguously addresses the assistant.
HELP_REQUESTS = _phrases(
    "help", "help me", "i need help", "what can you do",
    "how does this work", "how do you work", "what can i ask",
    "what can you help with", "options", "menu", "commands", "capabilities",
)

IDENTITY_QUESTIONS = _phrases(
    "who are you", "who r u", "what are you", "who is this", "what is this",
    "are you a bot", "are you human", "are you real", "are you ai",
    "your name", "what is your name", "whats your name", "what's your name",
    "who am i talking to", "who am i speaking to", "introduce yourself",
)

# --- regex rules --------------------------------------------------------
# Applied to the whole message. Each is anchored so it only matches when the
# conversational phrase *is* the message.


@dataclass(frozen=True)
class RuleMatch:
    intent: Intent
    confidence: float
    source: str = "rules"


_ANCHORED_RULES: List[Tuple[Pattern[str], Intent, float]] = [
    # Greeting with a trailing pleasantry but no question:
    #   "hi how are you", "hello good morning"
    (re.compile(r"^(hi|hey|hello|good\s+(morning|afternoon|evening|day))"
                r"(\s+(there|folks|team|guys|mindstec))?"
                r"(\s+how\s+(are|r)\s+(you|u)( doing)?)?$"), Intent.GREETING, 0.98),
    # "thanks" combined with a closing, e.g. "thanks bye", "thank you, goodbye"
    (re.compile(r"^(thanks?|thank\s+you|thx)[\s,!]*(bye|goodbye|see\s+you|cheers)$"),
     Intent.GOODBYE, 0.95),
    # "ok thanks", "great thanks", "perfect thank you"
    (re.compile(r"^(ok|okay|great|perfect|nice|cool|awesome|excellent|brilliant)"
                r"[\s,!]*(thanks?|thank\s+you|thx)$"), Intent.THANKS, 0.95),
    # Affirmation with a polite tail: "yes please", "sure, go ahead"
    (re.compile(r"^(yes|yeah|yep|sure|ok|okay|alright)[\s,!]*"
                r"(please|thanks?|go\s+ahead|do\s+it|sounds\s+good|why\s+not)?$"),
     Intent.AFFIRMATION, 0.95),
    # Negation with a polite tail: "no thanks", "no, not now"
    (re.compile(r"^(no|nope|nah)[\s,!]*(thanks?|thank\s+you|not\s+now|not\s+really)?$"),
     Intent.NEGATION, 0.95),
    # "tell me more about X" is a continuation *with* a subject — treated as a
    # knowledge search because X makes it self-contained.
    (re.compile(r"^(tell\s+me\s+more|more\s+details?|elaborate)\s+(about|on)\s+\S+"),
     Intent.KNOWLEDGE_SEARCH, 0.85),
    # "what CAN you do" only — "what DO you do" is a question about the
    # business on a company site, and belongs to the structured FAQ.
    (re.compile(r"^(what\s+can\s+(you|u)\s+(do|help)|how\s+(can|do)\s+(you|u)\s+(help|work))"
                r".{0,20}$"), Intent.HELP, 0.9),
    (re.compile(r"^(are|r)\s+(you|u)\s+(a\s+)?(bot|robot|human|real|ai|chatgpt|gpt|machine)"
                r".{0,15}$"), Intent.IDENTITY, 0.95),
]

# Comparison / recommendation / support are strong lexical signals that a
# retrieval turn needs a particular treatment, so they are detected up front
# rather than being guessed by the LLM.
_COMPARISON_RE = re.compile(
    r"\b(compare|comparison|versus|\bvs\b|difference\s+between|better\s+than|"
    r"which\s+is\s+better|pros\s+and\s+cons)\b"
)
_RECOMMENDATION_RE = re.compile(
    r"\b(recommend|recommendation|suggest|which\s+(one\s+)?should|what\s+should\s+i|"
    r"best\s+(option|choice|fit|for)|suitable\s+for|advice\s+on|help\s+me\s+choose)\b"
)
_SUPPORT_RE = re.compile(
    r"\b(not\s+working|doesn'?t\s+work|broken|faulty|issue|problem|error|fault|"
    r"complaint|rma|warranty\s+claim|repair|troubleshoot|support\s+ticket|"
    r"my\s+order|delivery\s+status)\b"
)

# Obvious out-of-scope subject matter. Kept narrow on purpose: the LLM
# classifier is better at judgement calls, and a false positive here means
# refusing a legitimate customer question.
_OUT_OF_SCOPE_RE = re.compile(
    r"\b(who\s+won|world\s+cup|super\s+bowl|football\s+score|cricket\s+score|"
    r"election|president\s+of|prime\s+minister|stock\s+price|bitcoin|crypto\s+price|"
    r"weather\s+(today|tomorrow|in)|horoscope|joke|poem|recipe|lyrics|"
    r"movie\s+(review|recommendation)|write\s+me\s+(a|an)\s+(essay|poem|story)|"
    r"homework|capital\s+of|translate\s+this\s+into)\b"
)

# Bare-entity messages ("CEO", "HDMI", "Crestron") are real queries that need
# expansion, not conversational turns. Detected so the rewriter knows to
# build a question around them rather than searching the bare token.
_BARE_TOKEN_RE = re.compile(r"^[a-z0-9][a-z0-9\-/. ]{1,40}$")


def classify(message: str, *, has_pending_confirmation: bool = False) -> Optional[RuleMatch]:
    """
    Attempts deterministic classification.

    Returns None when no rule is confident, which routes the turn to the LLM
    classifier. `has_pending_confirmation` raises confidence in affirmations
    and negations, because a bare "yes" is unambiguous only when the assistant
    actually asked something.
    """
    normalized = normalize(message)
    if not normalized:
        return None

    word_count = len(normalized.split())

    # --- exact vocabulary matches (whole message only) ---
    if normalized in GREETINGS:
        return RuleMatch(Intent.GREETING, 0.99)
    if normalized in GOODBYES:
        return RuleMatch(Intent.GOODBYE, 0.98)
    if normalized in THANKS:
        return RuleMatch(Intent.THANKS, 0.98)
    if normalized in IDENTITY_QUESTIONS:
        return RuleMatch(Intent.IDENTITY, 0.97)
    if normalized in HELP_REQUESTS:
        return RuleMatch(Intent.HELP, 0.95)
    if normalized in CONTINUATIONS:
        return RuleMatch(Intent.CONTINUATION, 0.95)
    if normalized in AFFIRMATIONS:
        # Without a pending question an affirmation is still an affirmation,
        # but the dialogue manager has less to resolve it against — surface
        # the lower confidence so it can choose a softer reply.
        return RuleMatch(Intent.AFFIRMATION, 0.97 if has_pending_confirmation else 0.85)
    if normalized in NEGATIONS:
        return RuleMatch(Intent.NEGATION, 0.97 if has_pending_confirmation else 0.85)

    # --- anchored regex rules ---
    for pattern, intent, confidence in _ANCHORED_RULES:
        if pattern.match(normalized):
            return RuleMatch(intent, confidence)

    # --- content-bearing signals (may co-occur with other words) ---
    if _OUT_OF_SCOPE_RE.search(normalized):
        return RuleMatch(Intent.OUT_OF_SCOPE, 0.9)
    if _COMPARISON_RE.search(normalized):
        return RuleMatch(Intent.COMPARISON, 0.85)
    if _RECOMMENDATION_RE.search(normalized):
        return RuleMatch(Intent.RECOMMENDATION, 0.82)
    if _SUPPORT_RE.search(normalized):
        return RuleMatch(Intent.SUPPORT, 0.82)

    # A long, clearly-formed question is a knowledge search; there is nothing
    # an LLM round-trip would add to that judgement.
    if word_count >= 5 and normalized.endswith("?"):
        return RuleMatch(Intent.KNOWLEDGE_SEARCH, 0.75)

    return None


def is_bare_entity(message: str) -> bool:
    """
    True when the message is a bare noun/identifier with no question structure
    ("CEO", "HDMI", "DM-NVX-363"). These need to be expanded into a real
    question before retrieval — searching the raw token matches poorly.
    """
    normalized = normalize(message)
    if not normalized or len(normalized.split()) > 4:
        return False
    if normalized.endswith("?"):
        return False
    return bool(_BARE_TOKEN_RE.match(normalized))


def strip_leading_greeting(message: str) -> str:
    """
    Removes a greeting prefix so "hi, what displays do you carry?" retrieves on
    the actual question rather than on the salutation.
    """
    pattern = re.compile(
        r"^\s*(hi|hii|hey|hello|helo|hola|yo|greetings|howdy|"
        r"good\s+(morning|afternoon|evening|day))"
        r"(\s+there)?[\s,.!\-–—]+",
        re.IGNORECASE,
    )
    stripped = pattern.sub("", message or "", count=1).strip()
    # Only accept the strip if something substantive remains.
    return stripped if len(stripped.split()) >= 2 else (message or "").strip()
