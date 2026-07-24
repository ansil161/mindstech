"""
Pre-flight configuration and connectivity check.

CLAUDE.md documents this script as the local Qdrant collection initialiser, but
the file was zero bytes — running it did nothing and reported success. It now
does what it claims and doubles as a deployment gate: run it before releasing
to catch a bad configuration on the ground rather than in the request path.

    python scripts/bootstrap.py            # verify and create if missing
    python scripts/bootstrap.py --check    # verify only, never write

Exit codes: 0 = ready, 1 = blocking problem found.
"""
from __future__ import annotations

import argparse
import asyncio
import os
import sys
from pathlib import Path

# Allow running directly from the repository root without installing.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.conversation.faq import faq_layer  # noqa: E402
from app.core.config import settings  # noqa: E402
from app.core.prompts import prompts  # noqa: E402
from app.services.embedder import embedder  # noqa: E402
from app.storage.vector_db import vector_db_manager  # noqa: E402

OK = "  [ok]  "
WARN = " [warn] "
FAIL = " [FAIL] "


class Report:
    """Accumulates findings and decides the exit code."""

    def __init__(self) -> None:
        self.failures = 0
        self.warnings = 0

    def ok(self, message: str) -> None:
        print(f"{OK}{message}")

    def warn(self, message: str) -> None:
        self.warnings += 1
        print(f"{WARN}{message}")

    def fail(self, message: str) -> None:
        self.failures += 1
        print(f"{FAIL}{message}")


def check_auth(report: Report) -> None:
    print("\n-- authentication --")
    # Same precedence the auth path uses: environment first, then .env-backed
    # settings. Checking only one of the two would report a false failure.
    configured = (os.getenv("AI_SERVICE_API_KEY") or "").strip() or (
        settings.AI_SERVICE_API_KEY or ""
    ).strip()
    if configured:
        report.ok("AI_SERVICE_API_KEY is set.")
    else:
        report.fail(
            "AI_SERVICE_API_KEY is not set. Every request will be rejected with 503. "
            "It must match Django's AI_SERVICE_API_KEY."
        )


def check_llm(report: Report) -> None:
    print("\n-- llm providers --")
    configured = {
        "openai": len(settings.OPENAI_API_KEYS),
        "groq": len(settings.GROQ_API_KEYS),
        "gemini": len(settings.GEMINI_API_KEYS),
    }
    active = {name: count for name, count in configured.items() if count}

    if not active:
        report.fail(
            "No LLM API keys configured. Generation will fail and every turn will "
            "degrade to the canned unavailable message."
        )
        return

    for name, count in active.items():
        report.ok(f"{name}: {count} key(s) configured.")

    if settings.LLM_PROVIDER.lower() not in active:
        report.warn(
            f"LLM_PROVIDER is '{settings.LLM_PROVIDER}' but no key is configured for it; "
            f"traffic will fail over to {sorted(active)[0]} on every request."
        )


def check_assets(report: Report) -> None:
    print("\n-- prompt & knowledge assets --")
    rendered = prompts.render("answer_system", context_block="", grounding_note="")
    if len(rendered) > 400 and "<<<BEGIN_REFERENCE>>>" in rendered:
        report.ok(f"Prompt library loaded from {settings.PROMPTS_FILE}.")
    else:
        report.warn(
            f"{settings.PROMPTS_FILE} missing or minimal; falling back to built-in prompts. "
            "Answer quality will be noticeably worse."
        )

    count = faq_layer.entry_count
    if count:
        report.ok(f"FAQ layer loaded with {count} entries from {settings.FAQ_FILE}.")
    else:
        report.warn(
            f"No FAQ entries loaded from {settings.FAQ_FILE}. Company questions "
            "(contact details, locations, leadership) will depend entirely on "
            "whether matching documents happen to be indexed."
        )


def check_embedding_config(report: Report) -> None:
    print("\n-- embeddings --")
    report.ok(f"Provider: {settings.EMBEDDING_PROVIDER}, model: {embedder.model_name}")

    if embedder.dimension != settings.QDRANT_VECTOR_DIMENSION:
        report.fail(
            f"Model produces {embedder.dimension}-dim vectors but "
            f"QDRANT_VECTOR_DIMENSION is {settings.QDRANT_VECTOR_DIMENSION}. "
            "Retrieval cannot work until these agree."
        )
    else:
        report.ok(f"Vector dimension agrees with Qdrant config ({embedder.dimension}).")

    if settings.EMBEDDING_PROVIDER.lower() in ("huggingface", "hf") and not settings.HUGGINGFACE_API_KEY:
        report.warn("HUGGINGFACE_API_KEY is unset; the public inference endpoint is rate-limited.")


async def check_embedding_live(report: Report) -> None:
    """
    Actually calls the embedding provider.

    Config agreement is not enough. Providers retire model support: Hugging
    Face dropped serverless inference for sentence-transformers/all-MiniLM-L6-v2,
    and because retrieval degrades gracefully to an empty result, the only
    visible symptom was every answer becoming "I don't have that specific
    detail" while every health check still reported green. This check turns
    that silent failure into a loud one.
    """
    print("\n-- embedding provider (live call) --")
    health = await embedder.health()
    if health.get("status") == "ok":
        report.ok(f"Embedding call succeeded ({health['dimension']}-dim vector returned).")
        if health["dimension"] != settings.QDRANT_VECTOR_DIMENSION:
            report.fail(
                f"Live vector is {health['dimension']}-dim but Qdrant expects "
                f"{settings.QDRANT_VECTOR_DIMENSION}-dim."
            )
    else:
        report.fail(
            f"Embedding provider is NOT working: {health.get('detail')}\n"
            f"         Retrieval will return nothing and every answer will be ungrounded.\n"
            f"         Fix by switching EMBEDDING_PROVIDER/EMBEDDING_MODEL to a served "
            f"combination (e.g. EMBEDDING_PROVIDER=openai with "
            f"EMBEDDING_MODEL=text-embedding-3-small and QDRANT_VECTOR_DIMENSION=1536), "
            f"or by self-hosting the model."
        )


def check_timeout_budget(report: Report) -> None:
    """
    A turn can span classification plus generation. If that exceeds Django's
    client timeout, Django abandons requests this service is still completing —
    users see errors for work that actually succeeded.
    """
    print("\n-- timeout budget --")
    worst_case = settings.LLM_CLASSIFIER_TIMEOUT_SECONDS + settings.LLM_REQUEST_TIMEOUT_SECONDS
    django_timeout = float(os.getenv("AI_SERVICE_TIMEOUT", "30"))

    if worst_case >= django_timeout:
        report.warn(
            f"Worst-case turn is ~{worst_case:.0f}s (classifier + generation) but the "
            f"Django client times out at {django_timeout:.0f}s. Lower the LLM timeouts "
            f"or raise AI_SERVICE_TIMEOUT on the Django side."
        )
    else:
        report.ok(f"Worst-case turn ~{worst_case:.0f}s fits inside the {django_timeout:.0f}s client timeout.")


async def check_vector_store(report: Report, *, check_only: bool) -> None:
    print("\n-- vector store --")
    if not settings.QDRANT_URL:
        report.fail("QDRANT_URL is not set. Retrieval will return no results.")
        return

    try:
        if check_only:
            health = await vector_db_manager.health()
            if health.get("status") == "ok":
                report.ok(
                    f"Collection '{health['collection']}' reachable "
                    f"({health.get('vectors')} points, {health.get('dimension')}-dim)."
                )
                if not health.get("text_index"):
                    report.warn(
                        "No full-text index on 'content'; hybrid keyword retrieval is "
                        "disabled. Run without --check to create it."
                    )
            else:
                report.fail(f"Qdrant unreachable: {health.get('detail')}")
            return

        # Non-check mode creates the collection and payload indexes if absent.
        await vector_db_manager.client()
        health = await vector_db_manager.health()
        report.ok(
            f"Collection '{health.get('collection')}' ready "
            f"({health.get('vectors')} points, {health.get('dimension')}-dim)."
        )
        if health.get("text_index"):
            report.ok("Full-text index present; hybrid keyword retrieval enabled.")
        else:
            report.warn("Full-text index unavailable; keyword retrieval will be skipped.")
    except Exception as exc:  # noqa: BLE001
        report.fail(f"Vector store check failed: {exc}")
    finally:
        await vector_db_manager.close()


async def check_session_store(report: Report) -> None:
    print("\n-- session store --")
    from app.conversation.memory import conversation_memory

    if await conversation_memory.ping():
        report.ok(f"Redis reachable at {settings.session_redis_url}.")
    else:
        report.warn(
            "Redis unreachable. The service will run on bounded per-worker memory, "
            "so conversation history will NOT be shared across workers — a user's "
            "context will appear to vanish between turns under multi-worker load."
        )
    await conversation_memory.close()


async def main() -> int:
    parser = argparse.ArgumentParser(description="Verify AI service configuration.")
    parser.add_argument(
        "--check",
        action="store_true",
        help="Verify only; never create or modify the Qdrant collection.",
    )
    args = parser.parse_args()

    print("=" * 74)
    print(f" {settings.PROJECT_NAME} v{settings.SERVICE_VERSION} — pre-flight check")
    print(f" environment: {settings.ENVIRONMENT}")
    print("=" * 74)

    report = Report()
    check_auth(report)
    check_llm(report)
    check_assets(report)
    check_embedding_config(report)
    await check_embedding_live(report)
    check_timeout_budget(report)
    await check_vector_store(report, check_only=args.check)
    await check_session_store(report)
    await embedder.aclose()

    print("\n" + "=" * 74)
    if report.failures:
        print(f" NOT READY — {report.failures} blocking problem(s), {report.warnings} warning(s).")
        print("=" * 74)
        return 1

    print(f" READY — {report.warnings} warning(s).")
    print("=" * 74)
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
