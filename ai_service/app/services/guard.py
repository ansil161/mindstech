"""
Input and output safety guards.

Threat model for a public website assistant:

* **Instruction override / jailbreak** — "ignore previous instructions",
  "you are now DAN", "pretend you have no rules".
* **System prompt extraction** — "repeat everything above", "what are your
  instructions", "print your system prompt".
* **Role/authority spoofing** — messages formatted to look like a system turn,
  or claiming to be the developer.
* **Context leakage** — the model volunteering that it consulted "documents"
  or a "knowledge base", which exposes the retrieval architecture and reads
  as robotic.
* **Data exfiltration** — asking for file paths, environment variables, keys.

Approach: detect and *annotate* rather than hard-block. Blocking is brittle —
"ignore the previous quote and tell me about your displays" is a legitimate
sentence — so flagged turns are still answered, with a reinforcement note
added to the system prompt, and are logged for review. Only unambiguous
extraction attempts are refused outright.
"""
from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from typing import List, Pattern, Tuple

from app.core.config import settings

logger = logging.getLogger(__name__)


@dataclass
class GuardResult:
    """Outcome of screening one user message."""

    sanitized_message: str
    flagged: bool = False
    should_refuse: bool = False
    reasons: List[str] = None  # type: ignore[assignment]

    def __post_init__(self) -> None:
        if self.reasons is None:
            self.reasons = []


# Patterns that unambiguously attempt to extract the system configuration.
# These are refused, because there is no legitimate phrasing of them.
_EXTRACTION_PATTERNS: List[Tuple[Pattern[str], str]] = [
    (re.compile(r"\b(repeat|print|show|reveal|display|output|tell\s+me)\b[^.?!]{0,40}"
                r"\b(system\s+prompt|initial\s+instructions?|your\s+instructions?|"
                r"the\s+prompt|prompt\s+above|everything\s+above)\b", re.I), "prompt_extraction"),
    (re.compile(r"\bwhat\s+(is|are|was|were)\s+(your|the)\s+"
                r"(system\s+prompt|original\s+instructions?|initial\s+instructions?|"
                r"rules|guidelines|configuration)\b", re.I), "prompt_extraction"),
    # The separator class must allow '.' — otherwise the literal ".env" below
    # is unreachable, since a dot can never appear between verb and target.
    (re.compile(r"\b(show|list|print|reveal|dump|cat|give)\b[\w\s'\"/\\.-]{0,30}?"
                r"(api[\s_-]?key|secret\s+key|access\s+token|password|credentials?|"
                r"env(ironment)?\s+var\w*|\.env\b|config\s+file|system\s+file)", re.I),
     "credential_request"),
    (re.compile(r"\brepeat\s+(everything|all|the\s+text)\s+(above|before|prior)\b", re.I),
     "prompt_extraction"),
]

# Patterns that indicate an override attempt. Answered, but with reinforcement.
_OVERRIDE_PATTERNS: List[Tuple[Pattern[str], str]] = [
    # Two determiner slots: "ignore previous instructions" and "disregard your
    # previous rules" are both common phrasings and both must match.
    (re.compile(r"\b(ignore|disregard|forget|discard|override|bypass)\s+"
                r"(?:(?:all|any)\s+)?"
                r"(?:(?:previous|prior|above|earlier|your|the|my)\s+){1,2}"
                r"(instructions?|rules?|prompts?|directions?|guidelines?|training|constraints?)\b",
                re.I), "instruction_override"),
    (re.compile(r"\byou\s+are\s+(now|no\s+longer)\s+\w+", re.I), "role_override"),
    (re.compile(r"\b(act|behave|roleplay|role-play|pretend)\s+as\s+(if\s+)?(you|a|an)\b", re.I),
     "role_override"),
    (re.compile(r"\b(dan\s+mode|developer\s+mode|jailbreak|do\s+anything\s+now|"
                r"unrestricted\s+mode|god\s+mode)\b", re.I), "jailbreak"),
    (re.compile(r"\b(no|without)\s+(restrictions?|filters?|limits?|rules?|guardrails?)\b", re.I),
     "jailbreak"),
    (re.compile(r"\byour\s+new\s+(instructions?|role|task|persona)\b", re.I), "instruction_override"),
    # Messages faking a system/developer turn.
    (re.compile(r"^\s*(system|developer|admin)\s*[:>]\s*", re.I | re.M), "role_spoofing"),
    (re.compile(r"<\s*/?\s*(system|instructions?|prompt)\s*>", re.I), "delimiter_spoofing"),
    (re.compile(r"\[\s*(system|inst|/inst)\s*\]", re.I), "delimiter_spoofing"),
    (re.compile(r"<<<\s*(begin|end)_?\w*\s*>>>", re.I), "delimiter_spoofing"),
]

# Delimiters used by this service's own prompts. If a user includes them we
# neutralise them, otherwise the message could appear to close the reference
# block and start a new instruction section.
_RESERVED_DELIMITERS: List[Pattern[str]] = [
    re.compile(r"<<<\s*BEGIN_REFERENCE\s*>>>", re.I),
    re.compile(r"<<<\s*END_REFERENCE\s*>>>", re.I),
    re.compile(r"###\s*(SYSTEM|ABSOLUTE)\s+\w+", re.I),
]

REFUSAL_MESSAGE = (
    "I can't share anything about how I'm configured. I'm here to help with "
    "Mindstec's AV and IT solutions though — what can I help you find?"
)


def screen_input(message: str) -> GuardResult:
    """
    Screens an inbound user message.

    Returns the (possibly neutralised) message plus flags. The message text is
    never truncated or reworded beyond delimiter neutralisation, so legitimate
    questions are unaffected.
    """
    if not settings.ENABLE_PROMPT_INJECTION_GUARD:
        return GuardResult(sanitized_message=message)

    reasons: List[str] = []

    for pattern, reason in _EXTRACTION_PATTERNS:
        if pattern.search(message):
            reasons.append(reason)
            logger.warning(
                "Blocked prompt-extraction attempt",
                extra={"guard_reason": reason, "message_length": len(message)},
            )
            return GuardResult(
                sanitized_message=message,
                flagged=True,
                should_refuse=True,
                reasons=reasons,
            )

    for pattern, reason in _OVERRIDE_PATTERNS:
        if pattern.search(message) and reason not in reasons:
            reasons.append(reason)

    sanitized = message
    for delimiter in _RESERVED_DELIMITERS:
        if delimiter.search(sanitized):
            # Replacing rather than deleting keeps the sentence readable while
            # destroying its structural meaning to the model.
            sanitized = delimiter.sub("[removed]", sanitized)
            if "delimiter_spoofing" not in reasons:
                reasons.append("delimiter_spoofing")

    if reasons:
        logger.warning(
            "Prompt-injection heuristics tripped; answering with reinforcement.",
            extra={"guard_reasons": reasons, "message_length": len(message)},
        )

    return GuardResult(
        sanitized_message=sanitized,
        flagged=bool(reasons),
        should_refuse=False,
        reasons=reasons,
    )


# ----------------------------------------------------------------------
# Output guard
# ----------------------------------------------------------------------
# Phrases that expose the retrieval architecture. The prompt already forbids
# them; this is the belt-and-braces pass for when the model ignores that.
_LEAK_REWRITES: List[Tuple[Pattern[str], str]] = [
    (re.compile(r"\b(based|according)\s+(on|to)\s+the\s+"
                r"(provided\s+)?(context|documents?|retrieved\s+\w+|reference\s+material|"
                r"knowledge\s+base|sources?)\b[,:]?\s*", re.I), ""),
    (re.compile(r"\b(the|our|my)\s+(provided\s+)?"
                r"(context|retrieved\s+documents?|knowledge\s+base|vector\s+\w+|"
                r"embeddings?|search\s+results?|index)\b", re.I), "the information I have"),
    (re.compile(r"\bin\s+the\s+(provided\s+)?(context|documents?|reference\s+material)\b", re.I),
     "in what I have"),
    (re.compile(r"\b(the\s+)?(context|documents?)\s+(does\s+not|doesn'?t|do\s+not|don'?t)\s+"
                r"(mention|contain|specify|include|say)\b", re.I), "I don't have details on"),
    (re.compile(r"\bI\s+(don'?t|do\s+not)\s+have\s+(access\s+to\s+)?(any\s+)?"
                r"(context|documents?|information\s+in\s+my\s+(knowledge\s+base|database))\b", re.I),
     "I don't have details on that"),
]

# Any residual mention of the system prompt structure is stripped outright.
_HARD_LEAK_PATTERNS: List[Pattern[str]] = [
    re.compile(r"<<<\s*(BEGIN|END)_REFERENCE\s*>>>", re.I),
    re.compile(r"##\s*ABSOLUTE\s+RULES.*?(?=\n\n|\Z)", re.I | re.DOTALL),
    re.compile(r"##\s*HOW\s+TO\s+WRITE.*?(?=\n\n|\Z)", re.I | re.DOTALL),
]

_WHITESPACE_CLEANUP_RE = re.compile(r"[ \t]{2,}")
_ORPHAN_PUNCT_RE = re.compile(r"^\s*[,;:]\s*", re.M)


def scrub_output(answer: str) -> str:
    """
    Removes retrieval-architecture leakage from a generated answer.

    Purely cosmetic-to-the-user, load-bearing for the product: an assistant
    that says "the provided context does not mention" reads as a database
    query result, not as a colleague who knows the business.
    """
    if not settings.ENABLE_OUTPUT_GUARD or not answer:
        return answer

    scrubbed = answer
    for pattern in _HARD_LEAK_PATTERNS:
        scrubbed = pattern.sub("", scrubbed)
    for pattern, replacement in _LEAK_REWRITES:
        scrubbed = pattern.sub(replacement, scrubbed)

    scrubbed = _ORPHAN_PUNCT_RE.sub("", scrubbed)
    scrubbed = _WHITESPACE_CLEANUP_RE.sub(" ", scrubbed).strip()

    # Re-capitalise if a removal left the sentence starting lowercase.
    if scrubbed and scrubbed[0].islower():
        scrubbed = scrubbed[0].upper() + scrubbed[1:]

    if scrubbed != answer:
        logger.info("Output guard rewrote leaked retrieval terminology.")

    return scrubbed or answer
