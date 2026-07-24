"""
Prompt library loading/rendering and transport security.
"""
import pytest

from app.core.config import settings
from app.core.prompts import PromptLibrary, prompts
from app.core.security import SlidingWindowRateLimiter


# ----------------------------------------------------------------------
# Prompt library
# ----------------------------------------------------------------------
def test_prompt_file_is_actually_populated():
    """
    v1 documented prompts as living in config/prompts.yaml, but the file was
    zero bytes and every prompt was a Python string literal.
    """
    rendered = prompts.render("answer_system", context_block="X", grounding_note="")
    assert len(rendered) > 500
    assert "<<<BEGIN_REFERENCE>>>" in rendered


def test_company_identity_is_injected_automatically():
    rendered = prompts.render("answer_system", context_block="X", grounding_note="")
    assert settings.COMPANY_NAME in rendered
    assert settings.ASSISTANT_NAME in rendered


def test_context_is_placed_inside_the_reference_delimiters():
    rendered = prompts.render(
        "answer_system", context_block="SECRET_MARKER", grounding_note=""
    )
    # rindex, not index: the delimiters are also named earlier in the prompt's
    # own rules ("text between <<<BEGIN_REFERENCE>>> ... is reference material").
    start = rendered.rindex("<<<BEGIN_REFERENCE>>>")
    end = rendered.rindex("<<<END_REFERENCE>>>")
    assert start < rendered.index("SECRET_MARKER") < end


def test_prompt_forbids_exposing_the_retrieval_architecture():
    rendered = prompts.render("answer_system", context_block="", grounding_note="")
    for forbidden_term in ("embeddings", "knowledge base", "retrieved"):
        assert forbidden_term in rendered  # named in the prohibition list


def test_unknown_placeholders_render_literally_rather_than_raising():
    """
    A prompt edit that references a not-yet-wired variable should degrade to
    visible text, not a 500 in production.
    """
    rendered = prompts.render("answer_system", context_block="X")
    assert "{grounding_note}" in rendered


def test_missing_prompt_key_returns_empty_not_an_exception():
    assert prompts.render("no_such_prompt_key") == ""


def test_missing_prompt_file_falls_back_to_built_in_defaults():
    library = PromptLibrary(path="config/definitely-missing.yaml")
    rendered = library.render("answer_system", context_block="X", grounding_note="")
    assert "<<<BEGIN_REFERENCE>>>" in rendered


def test_smalltalk_variants_rotate_by_seed():
    """Byte-identical repeats are the clearest "this is a bot" tell."""
    variants = {prompts.variant("smalltalk", "greeting", seed=i) for i in range(3)}
    assert len(variants) > 1


def test_variant_selection_is_deterministic_for_a_given_seed():
    assert prompts.variant("smalltalk", "greeting", seed=1) == prompts.variant(
        "smalltalk", "greeting", seed=1
    )


def test_variant_substitutes_company_variables():
    assert "{company_short_name}" not in prompts.variant("smalltalk", "greeting", seed=0)


def test_unknown_variant_group_returns_empty():
    assert prompts.variant("smalltalk", "no_such_key", seed=0) == ""


# ----------------------------------------------------------------------
# Rate limiter
# ----------------------------------------------------------------------
def test_requests_under_the_limit_are_allowed():
    limiter = SlidingWindowRateLimiter(max_requests=3, window_seconds=60)
    assert all(limiter.check("c1")[0] for _ in range(3))


def test_requests_over_the_limit_are_blocked_with_retry_after():
    limiter = SlidingWindowRateLimiter(max_requests=3, window_seconds=60)
    for _ in range(3):
        limiter.check("c1")

    allowed, retry_after = limiter.check("c1")
    assert allowed is False
    assert retry_after and retry_after > 0


def test_limits_are_tracked_per_key():
    limiter = SlidingWindowRateLimiter(max_requests=2, window_seconds=60)
    limiter.check("a")
    limiter.check("a")
    assert limiter.check("a")[0] is False
    assert limiter.check("b")[0] is True


def test_the_window_slides():
    limiter = SlidingWindowRateLimiter(max_requests=2, window_seconds=0)
    limiter.check("c1")
    limiter.check("c1")
    assert limiter.check("c1")[0] is True  # earlier hits have aged out


def test_key_space_is_bounded():
    """A stream of unique conversation ids must not exhaust memory."""
    limiter = SlidingWindowRateLimiter(max_requests=5, window_seconds=60, max_keys=10)
    for index in range(50):
        limiter.check(f"conv-{index}")
    assert len(limiter._hits) <= 10


# ----------------------------------------------------------------------
# API key comparison
# ----------------------------------------------------------------------
def test_api_key_comparison_is_constant_time():
    """
    A naive `!=` leaks the secret's length and matching prefix through response
    timing, which is a real offline attack against a repeatedly-callable endpoint.
    """
    import inspect

    from app.core import security

    source = inspect.getsource(security.verify_api_key)
    assert "compare_digest" in source


def test_missing_api_key_configuration_fails_closed(monkeypatch):
    """An unconfigured service must reject everything, not accept everything."""
    from fastapi import HTTPException

    from app.core.security import _get_api_key

    # Both sources must be cleared: the resolver falls back from the live
    # environment to the .env-backed settings value.
    monkeypatch.setenv("AI_SERVICE_API_KEY", "")
    monkeypatch.setattr(settings, "AI_SERVICE_API_KEY", None)

    with pytest.raises(HTTPException) as exc_info:
        _get_api_key()
    assert exc_info.value.status_code == 503


def test_api_key_falls_back_to_dotenv_settings(monkeypatch):
    """
    The v1 bug: pydantic-settings loads `.env` into Settings, not into
    os.environ, so a key configured only in `.env` was invisible to the auth
    check and every local request failed 503.
    """
    from app.core.security import _get_api_key

    monkeypatch.delenv("AI_SERVICE_API_KEY", raising=False)
    monkeypatch.setattr(settings, "AI_SERVICE_API_KEY", "from-dotenv")

    assert _get_api_key() == "from-dotenv"


def test_live_environment_wins_over_dotenv(monkeypatch):
    """Environment-first is what preserves hot key rotation without a restart."""
    from app.core.security import _get_api_key

    monkeypatch.setenv("AI_SERVICE_API_KEY", "rotated-key")
    monkeypatch.setattr(settings, "AI_SERVICE_API_KEY", "stale-dotenv-key")

    assert _get_api_key() == "rotated-key"
