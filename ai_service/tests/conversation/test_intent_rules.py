"""
Tier-1 deterministic classification.

The critical property is *precision*: a rule that swallows a real question is
far worse than one that abstains and lets the LLM classifier decide.
"""
import pytest

from app.conversation import rules
from app.conversation.intents import Intent


@pytest.mark.parametrize(
    "message",
    ["hi", "Hello", "hey there", "Good morning!", "HELLO", "  hi  ", "namaste", "howdy"],
)
def test_greetings_are_recognised(message):
    match = rules.classify(message)
    assert match is not None and match.intent is Intent.GREETING


@pytest.mark.parametrize("message", ["thanks", "Thank you!", "thx", "much appreciated", "ok thanks"])
def test_thanks_are_recognised(message):
    match = rules.classify(message)
    assert match is not None and match.intent is Intent.THANKS


@pytest.mark.parametrize("message", ["bye", "goodbye", "see you", "that's all", "thanks bye"])
def test_goodbyes_are_recognised(message):
    match = rules.classify(message)
    assert match is not None and match.intent is Intent.GOODBYE


@pytest.mark.parametrize("message", ["yes", "Yeah", "sure", "ok", "go ahead", "yes please"])
def test_affirmations_are_recognised(message):
    match = rules.classify(message, has_pending_confirmation=True)
    assert match is not None and match.intent is Intent.AFFIRMATION


@pytest.mark.parametrize("message", ["no", "nope", "no thanks", "not really"])
def test_negations_are_recognised(message):
    match = rules.classify(message, has_pending_confirmation=True)
    assert match is not None and match.intent is Intent.NEGATION


@pytest.mark.parametrize("message", ["tell me more", "continue", "what else", "go on", "next"])
def test_continuations_are_recognised(message):
    match = rules.classify(message)
    assert match is not None and match.intent is Intent.CONTINUATION


@pytest.mark.parametrize("message", ["who are you", "are you a bot", "what is your name"])
def test_identity_questions_are_recognised(message):
    match = rules.classify(message)
    assert match is not None and match.intent is Intent.IDENTITY


@pytest.mark.parametrize(
    "message",
    [
        "who won the world cup",
        "what is the capital of France",
        "write me a poem about the sea",
        "what's the weather today in Delhi",
    ],
)
def test_obvious_out_of_scope_is_recognised(message):
    match = rules.classify(message)
    assert match is not None and match.intent is Intent.OUT_OF_SCOPE


@pytest.mark.parametrize(
    "message",
    [
        "compare Crestron and Extron switchers",
        "what is the difference between HDBaseT and AV over IP",
    ],
)
def test_comparison_is_recognised(message):
    match = rules.classify(message)
    assert match is not None and match.intent is Intent.COMPARISON


def test_support_intent_is_recognised():
    match = rules.classify("my display is not working after the last firmware update")
    assert match is not None and match.intent is Intent.SUPPORT


# --- precision guards ---------------------------------------------------
@pytest.mark.parametrize(
    "message",
    [
        "hi, what displays do you carry?",
        "hello can you tell me about your conferencing range",
        "thanks — now what about video walls?",
        "yes but which model supports 4K60?",
    ],
)
def test_greeting_rules_do_not_swallow_real_questions(message):
    """
    A conversational prefix must not hijack a message that also asks something.

    This is the precision property the whole tier-1 design rests on: firing on
    these would answer "Hello!" to a genuine product question.
    """
    match = rules.classify(message)
    assert match is None or match.intent not in {
        Intent.GREETING,
        Intent.THANKS,
        Intent.AFFIRMATION,
    }


def test_strip_leading_greeting_preserves_the_question():
    assert rules.strip_leading_greeting("hi, what displays do you carry?") == (
        "what displays do you carry?"
    )


def test_strip_leading_greeting_leaves_bare_greeting_intact():
    # Nothing substantive would remain, so the original is kept.
    assert rules.strip_leading_greeting("hello") == "hello"


@pytest.mark.parametrize("message", ["CEO", "HDMI", "Crestron", "DM-NVX-363"])
def test_bare_entities_are_detected(message):
    assert rules.is_bare_entity(message) is True


@pytest.mark.parametrize(
    "message",
    ["what does the CEO do?", "tell me about all of your HDMI matrix switcher products"],
)
def test_full_questions_are_not_bare_entities(message):
    assert rules.is_bare_entity(message) is False


def test_tell_me_more_about_x_is_a_knowledge_search_not_a_continuation():
    """With an explicit subject the message stands alone, so it needs no state."""
    match = rules.classify("tell me more about digital signage")
    assert match is not None and match.intent is Intent.KNOWLEDGE_SEARCH


def test_unclassifiable_message_abstains():
    """Abstaining routes the turn to the LLM classifier rather than guessing."""
    assert rules.classify("do you stock the Barco UDX series") is None


def test_what_do_you_do_is_not_treated_as_a_capabilities_question():
    """
    On a company website this asks about the business, not the assistant.
    Routing it to HELP produced a capabilities blurb instead of the company
    overview the visitor actually wanted.
    """
    match = rules.classify("what do you do?")
    assert match is None or match.intent is not Intent.HELP


@pytest.mark.parametrize("message", ["what can you do", "what can you help with", "help"])
def test_genuine_capability_questions_still_route_to_help(message):
    match = rules.classify(message)
    assert match is not None and match.intent is Intent.HELP
