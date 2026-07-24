"""
Structured FAQ matching and deterministic query rewriting.
"""
import pytest

from app.conversation.faq import FAQLayer, faq_layer
from app.conversation.intents import Intent
from app.conversation.rewriter import (
    build_query_variants,
    build_standalone_query,
    expand_aliases,
    extract_keywords,
    resolve_reference,
)
from app.conversation.state import ConversationState, PendingConfirmation
from app.core.config import settings


# ----------------------------------------------------------------------
# FAQ layer
# ----------------------------------------------------------------------
def test_faq_file_loads_entries():
    assert faq_layer.entry_count > 0


@pytest.mark.parametrize(
    "message,expected_entry",
    [
        ("who are you?", "company_identity"),
        ("what is your email address?", "contact_details"),
        ("where are your offices?", "locations"),
        ("who is the CEO?", "leadership"),
        ("do you handle e-waste recycling?", "ewaste"),
    ],
)
def test_canonical_questions_match_the_right_entry(message, expected_entry):
    match = faq_layer.match(message)
    assert match is not None
    assert match.entry_id == expected_entry


@pytest.mark.parametrize(
    "message",
    [
        "does the Barco UDX-4K32 support edge blending?",
        "what is the warranty period on Shure ceiling microphones?",
        "can you quote 40 units of the DM-NVX-363?",
    ],
)
def test_specific_product_questions_fall_through_to_retrieval(message):
    """
    The FAQ layer must only ever add precision. Hijacking a real product
    question would make the assistant strictly worse than plain RAG.
    """
    assert faq_layer.match(message) is None


def test_confidence_threshold_is_respected():
    match = faq_layer.match("who are you?", min_confidence=0.99)
    assert match is None or match.confidence >= 0.99


def test_disabled_faq_layer_returns_nothing(monkeypatch):
    monkeypatch.setattr(settings, "ENABLE_FAQ_LAYER", False)
    assert faq_layer.match("who are you?") is None


def test_missing_faq_file_degrades_quietly():
    """A packaging mistake must not take chat down."""
    layer = FAQLayer(path="config/does-not-exist.yaml")
    assert layer.entry_count == 0
    assert layer.match("who are you?") is None


# ----------------------------------------------------------------------
# Alias expansion
# ----------------------------------------------------------------------
def test_aliases_expand_while_preserving_the_original_token():
    """
    Keeping the abbreviation means an exact keyword match on "AV" still works
    while the expansion improves the dense-vector match.
    """
    expanded = expand_aliases("what AV products do you sell")
    assert "Audio Visual" in expanded
    assert "AV" in expanded


def test_alias_expansion_is_case_insensitive():
    assert "Audio Visual" in expand_aliases("what av gear do you carry")


def test_alias_expansion_does_not_match_inside_words():
    """Expanding the "av" inside "available" would corrupt the query."""
    assert "Audio Visual" not in expand_aliases("is it available")


# ----------------------------------------------------------------------
# Reference resolution
# ----------------------------------------------------------------------
def test_affirmation_resolves_to_the_pending_query():
    state = ConversationState(
        pending_confirmation=PendingConfirmation(
            question="Would you like to explore control rooms?",
            topic="control rooms",
            query_on_confirm="Tell me about control room solutions",
        )
    )
    assert resolve_reference("yes", Intent.AFFIRMATION, state) == (
        "Tell me about control room solutions"
    )


def test_affirmation_without_a_pending_question_falls_back_to_the_topic():
    state = ConversationState(current_topic="digital signage")
    assert "digital signage" in resolve_reference("yes", Intent.AFFIRMATION, state)


def test_affirmation_with_no_state_resolves_to_nothing():
    """Returning None is what stops the dialogue manager searching for "yes"."""
    assert resolve_reference("yes", Intent.AFFIRMATION, ConversationState()) is None


def test_continuation_resolves_to_the_current_topic():
    state = ConversationState(current_topic="video walls")
    assert "video walls" in resolve_reference("tell me more", Intent.CONTINUATION, state)


def test_continuation_falls_back_to_the_previous_topic():
    state = ConversationState(last_topic="conferencing")
    assert "conferencing" in resolve_reference("go on", Intent.CONTINUATION, state)


def test_a_standalone_question_needs_no_resolution():
    state = ConversationState(current_topic="signage")
    assert resolve_reference(
        "what displays do you carry", Intent.KNOWLEDGE_SEARCH, state
    ) is None


# ----------------------------------------------------------------------
# Standalone query construction
# ----------------------------------------------------------------------
def test_bare_role_term_becomes_a_leadership_question():
    """Searching the bare token "CEO" against product docs retrieves nothing."""
    query = build_standalone_query("CEO", Intent.KNOWLEDGE_SEARCH, ConversationState())
    assert "leadership" in query.lower() or "who is" in query.lower()
    assert settings.COMPANY_NAME in query


def test_bare_company_term_becomes_an_overview_question():
    query = build_standalone_query("company", Intent.KNOWLEDGE_SEARCH, ConversationState())
    assert settings.COMPANY_NAME in query


def test_bare_technical_term_is_framed_in_company_context():
    query = build_standalone_query("HDMI", Intent.KNOWLEDGE_SEARCH, ConversationState())
    assert "HDMI" in query
    assert settings.COMPANY_SHORT_NAME in query


def test_greeting_prefix_is_stripped_before_retrieval():
    query = build_standalone_query(
        "hi, what displays do you carry?", Intent.KNOWLEDGE_SEARCH, ConversationState()
    )
    assert not query.lower().startswith("hi")
    assert "displays" in query


def test_llm_rewrite_is_preferred_over_the_raw_message():
    query = build_standalone_query(
        "how much?",
        Intent.KNOWLEDGE_SEARCH,
        ConversationState(),
        llm_rewritten="How much do Crestron control systems cost?",
    )
    assert query == "How much do Crestron control systems cost?"


def test_state_resolution_outranks_the_llm_rewrite():
    """Recorded state is fact; the model's rewrite is inference."""
    state = ConversationState(
        pending_confirmation=PendingConfirmation(
            question="Explore control rooms?",
            query_on_confirm="Control room solutions",
        )
    )
    query = build_standalone_query("yes", Intent.AFFIRMATION, state, llm_rewritten="yes indeed")
    assert query == "Control room solutions"


# ----------------------------------------------------------------------
# Query variants
# ----------------------------------------------------------------------
def test_variants_include_the_original_query():
    variants = build_query_variants("what AV products do you sell")
    assert variants[0] == "what AV products do you sell"


def test_variants_are_capped(monkeypatch):
    monkeypatch.setattr(settings, "RETRIEVAL_MAX_QUERY_VARIANTS", 2)
    variants = build_query_variants("what AV and UC products do you sell", ["Crestron", "Extron"])
    assert len(variants) <= 2


def test_variants_are_deduplicated():
    variants = build_query_variants("crestron")
    assert len(variants) == len(set(variants))


def test_multi_query_disabled_returns_only_the_original(monkeypatch):
    monkeypatch.setattr(settings, "RETRIEVAL_ENABLE_MULTI_QUERY", False)
    assert build_query_variants("what AV products", ["Crestron"]) == ["what AV products"]


def test_entity_variant_is_added_when_entities_are_known():
    variants = build_query_variants("how much does it cost", ["Crestron", "control systems"])
    assert any("Crestron" in v for v in variants)


# ----------------------------------------------------------------------
# Keyword extraction
# ----------------------------------------------------------------------
def test_keywords_drop_question_scaffolding():
    keywords = extract_keywords("what is the price of the Crestron NVX encoder")
    assert "crestron" in keywords
    assert "what" not in keywords
    assert "the" not in keywords


def test_keywords_preserve_part_numbers():
    """Exact identifiers are precisely what the keyword branch exists to catch."""
    assert "dm-nvx-363" in extract_keywords("do you stock the DM-NVX-363")


def test_keyword_extraction_is_bounded():
    assert len(extract_keywords(" ".join(f"term{i}" for i in range(50)), limit=5)) == 5


# ----------------------------------------------------------------------
# FAQ precision regressions found during live testing
# ----------------------------------------------------------------------
@pytest.mark.parametrize(
    "message",
    [
        "what solutions do you offer for control rooms?",
        "what services do you provide for broadcast studios",
        "what solutions do you have for hospitality venues?",
    ],
)
def test_vertical_specific_questions_are_not_hijacked_by_the_generic_overview(message):
    """
    Live-testing regression. An earlier `\b(services|solutions)\b` pattern
    matched the bare word anywhere, so a specific product question was answered
    with the generic company overview and retrieval never ran.
    """
    match = faq_layer.match(message)
    assert match is None or match.entry_id != "what_we_do"


@pytest.mark.parametrize(
    "message",
    ["what do you do?", "what does mindstec do", "what is your business model"],
)
def test_the_general_overview_question_still_matches(message):
    match = faq_layer.match(message)
    assert match is not None and match.entry_id == "what_we_do"


def test_faq_entries_carry_a_topic_for_follow_ups():
    """
    Without a topic, a "tell me more" straight after an FAQ answer has nothing
    to continue and the assistant has to ask the user to repeat themselves.
    """
    match = faq_layer.match("where are your offices?")
    assert match is not None
    assert match.topic
