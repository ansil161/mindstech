"""
Structured logging.

Two v1 defects are pinned here:

1. The JSON formatter read `record.extra`, which never exists — `extra={...}`
   sets attributes directly on the record. Every structured field the service
   emitted was silently discarded.
2. Passing a reserved LogRecord attribute name via `extra=` makes `logging`
   raise KeyError, taking down whatever request hit that code path.
"""
import json
import logging

import pytest

from app.core.logging import JSONFormatter
from app.core.observability import bind_request, safe_extra


def _format(record: logging.LogRecord) -> dict:
    return json.loads(JSONFormatter().format(record))


def _record(**extra) -> logging.LogRecord:
    record = logging.LogRecord(
        name="test.logger",
        level=logging.INFO,
        pathname="test.py",
        lineno=42,
        msg="a message",
        args=(),
        exc_info=None,
    )
    for key, value in extra.items():
        setattr(record, key, value)
    return record


def test_standard_fields_are_emitted():
    output = _format(_record())
    assert output["level"] == "INFO"
    assert output["message"] == "a message"
    assert output["logger"] == "test.logger"
    assert output["lineno"] == 42


def test_extra_fields_reach_the_output():
    """
    **The v1 bug.** The old formatter looked for `record.extra`, so every
    structured field passed via `extra=` was dropped on the floor.
    """
    output = _format(_record(intent="greeting", retrieval_included=3))
    assert output["intent"] == "greeting"
    assert output["retrieval_included"] == 3


def test_non_serialisable_extras_are_repred_not_fatal():
    """One awkward value must not break the whole log line."""

    class Opaque:
        pass

    output = _format(_record(thing=Opaque()))
    assert "Opaque" in output["thing"]


def test_correlation_ids_are_attached_from_context():
    """Concurrent turns are unreadable in logs without a correlation id."""
    bind_request(request_id="req-123", conversation_id="conv-456")
    output = _format(_record())
    assert output["request_id"] == "req-123"
    assert output["conversation_id"] == "conv-456"


def test_exceptions_are_captured():
    try:
        raise ValueError("boom")
    except ValueError:
        import sys

        record = _record()
        record.exc_info = sys.exc_info()
        output = _format(record)

    assert "ValueError: boom" in output["exception"]


# ----------------------------------------------------------------------
# Reserved-key collisions
# ----------------------------------------------------------------------
@pytest.mark.parametrize("reserved", ["filename", "module", "message", "lineno", "name", "args"])
def test_reserved_keys_would_crash_logging_without_safe_extra(reserved):
    """Demonstrates why safe_extra exists — this is a live crash, not theory."""
    logger = logging.getLogger("collision-test")
    with pytest.raises(KeyError):
        logger.info("boom", extra={reserved: "value"})


@pytest.mark.parametrize("reserved", ["filename", "module", "message", "lineno", "name", "args"])
def test_safe_extra_prevents_the_collision(reserved):
    logger = logging.getLogger("collision-test")
    logger.info("fine", extra=safe_extra(**{reserved: "value"}))  # must not raise


def test_safe_extra_renames_rather_than_drops():
    """The value should still reach the log, just under a prefixed name."""
    result = safe_extra(filename="report.pdf", document_id="doc-1")
    assert result["ctx_filename"] == "report.pdf"
    assert result["document_id"] == "doc-1"


def test_safe_extra_leaves_ordinary_keys_untouched():
    assert safe_extra(intent="greeting", count=3) == {"intent": "greeting", "count": 3}
