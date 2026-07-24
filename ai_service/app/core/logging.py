"""
Structured logging configuration.

The v1 formatter attempted to read extra fields from `record.extra`, which
never exists — `logger.info(..., extra={"a": 1})` sets `a` directly as an
attribute on the LogRecord. Every structured field this service tried to emit
was therefore silently discarded. This version diffs the record's attributes
against the known-standard set, so anything passed via `extra=` is captured.
"""
import json
import logging
import logging.config
import os
from typing import Any, Dict

from app.core.config import settings
from app.core.observability import current_conversation_id, current_request_id

# Attributes present on every LogRecord. Anything outside this set was added
# by a caller via `extra=` and is therefore a structured field we want.
_STANDARD_RECORD_ATTRS = frozenset(
    {
        "args", "asctime", "created", "exc_info", "exc_text", "filename",
        "funcName", "levelname", "levelno", "lineno", "module", "msecs",
        "message", "msg", "name", "pathname", "process", "processName",
        "relativeCreated", "stack_info", "thread", "threadName", "taskName",
    }
)


class JSONFormatter(logging.Formatter):
    """
    Emits one JSON object per log record, suitable for ingestion by
    Fluentd/Logstash/Datadog/CloudWatch.

    Correlation IDs are pulled from contextvars rather than requiring every
    call site to pass them, so any log line emitted while serving a request
    can be joined back to that request.
    """

    def format(self, record: logging.LogRecord) -> str:
        log_record: Dict[str, Any] = {
            "timestamp": self.formatTime(record, self.datefmt or "%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "filename": record.filename,
            "lineno": record.lineno,
            "service": settings.PROJECT_NAME,
            "version": settings.SERVICE_VERSION,
            "environment": settings.ENVIRONMENT,
        }

        request_id = current_request_id()
        if request_id and request_id != "-":
            log_record["request_id"] = request_id
        conversation_id = current_conversation_id()
        if conversation_id and conversation_id != "-":
            log_record["conversation_id"] = conversation_id

        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)

        # This is the actual fix: harvest caller-supplied `extra=` fields,
        # which live as plain attributes on the record.
        for key, value in record.__dict__.items():
            if key in _STANDARD_RECORD_ATTRS or key.startswith("_"):
                continue
            if key in log_record:
                continue
            try:
                json.dumps(value)
                log_record[key] = value
            except (TypeError, ValueError):
                log_record[key] = repr(value)

        return json.dumps(log_record, default=str)


class HumanFormatter(logging.Formatter):
    """Development formatter: readable, but still surfaces the request id so
    interleaved concurrent requests remain distinguishable in a terminal."""

    def format(self, record: logging.LogRecord) -> str:
        base = super().format(record)
        request_id = current_request_id()
        if request_id and request_id != "-":
            return f"[{request_id}] {base}"
        return base


def setup_logging() -> None:
    """Configures process-wide logging. Idempotent; safe to call repeatedly."""
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()

    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "json": {"()": JSONFormatter, "datefmt": "%Y-%m-%dT%H:%M:%S%z"},
            "standard": {
                "()": HumanFormatter,
                "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "json" if settings.is_production else "standard",
                "stream": "ext://sys.stdout",
            }
        },
        "loggers": {
            "": {"handlers": ["console"], "level": log_level},
            # Third-party libraries are noisy at INFO and their chatter drowns
            # out this service's own turn records.
            "httpx": {"handlers": ["console"], "level": "WARNING", "propagate": False},
            "httpcore": {"handlers": ["console"], "level": "WARNING", "propagate": False},
            "openai": {"handlers": ["console"], "level": "WARNING", "propagate": False},
            "urllib3": {"handlers": ["console"], "level": "WARNING", "propagate": False},
            "qdrant_client": {"handlers": ["console"], "level": "WARNING", "propagate": False},
            "gunicorn.error": {"handlers": ["console"], "level": log_level, "propagate": False},
            "gunicorn.access": {"handlers": ["console"], "level": log_level, "propagate": False},
            "uvicorn.error": {"handlers": ["console"], "level": log_level, "propagate": False},
            "uvicorn.access": {"handlers": ["console"], "level": log_level, "propagate": False},
        },
    }

    logging.config.dictConfig(logging_config)


# Gunicorn configuration hook: this module doubles as a Gunicorn config file
# when passed via `-c app/core/logging.py`.
if __name__ != "app.core.logging":
    bind = f"0.0.0.0:{os.getenv('PORT', '8000')}"
    workers = int(os.getenv("WEB_CONCURRENCY", "2"))
    loglevel = os.getenv("LOG_LEVEL", "info").lower()
    errorlog = "-"
    accesslog = "-"
    setup_logging()
