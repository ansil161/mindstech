import json
import logging
import logging.config
import os
from typing import Any, Dict
from app.core.config import settings


class JSONFormatter(logging.Formatter):
    """
    Formatter that outputs JSON strings for structured logs.
    Ideal for production environments ingested by Fluentd, Logstash, or Datadog.
    """
    def format(self, record: logging.LogRecord) -> str:
        log_record: Dict[str, Any] = {
            "timestamp": self.formatTime(record, self.datefmt or "%Y-%m-%dT%H:%M:%SZ"),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "filename": record.filename,
            "lineno": record.lineno,
        }
        
        # Capture trace/exceptions if present
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
            
        # Capture extra fields passed to log
        if hasattr(record, "extra") and isinstance(record.extra, dict):
            for key, val in record.extra.items():
                if key not in log_record:
                    log_record[key] = val
                    
        return json.dumps(log_record)


def setup_logging() -> None:
    """
    Configures standard Python logging to output structured logs.
    """
    is_production = settings.ENVIRONMENT.lower() == "production"
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()

    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "json": {
                "()": JSONFormatter,
                "datefmt": "%Y-%m-%dT%H:%M:%SZ"
            },
            "standard": {
                "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S"
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "json" if is_production else "standard",
                "stream": "ext://sys.stdout"
            }
        },
        "loggers": {
            "": {  # Root logger
                "handlers": ["console"],
                "level": log_level,
            },
            "gunicorn.error": {
                "handlers": ["console"],
                "level": log_level,
                "propagate": False
            },
            "gunicorn.access": {
                "handlers": ["console"],
                "level": log_level,
                "propagate": False
            },
            "uvicorn.error": {
                "handlers": ["console"],
                "level": log_level,
                "propagate": False
            },
            "uvicorn.access": {
                "handlers": ["console"],
                "level": log_level,
                "propagate": False
            }
        }
    }

    logging.config.dictConfig(logging_config)


# Gunicorn configuration hook
# This allows this module to also serve as Gunicorn's configuration file.
if __name__ != "app.core.logging":
    # Running inside Gunicorn context when imported with `-c app/core/logging.py`
    bind = "0.0.0.0:8000"
    workers = int(os.getenv("WEB_CONCURRENCY", "2"))
    loglevel = os.getenv("LOG_LEVEL", "info").lower()
    errorlog = "-"
    accesslog = "-"
    
    # Run the setup immediately when run as a standalone config script
    setup_logging()
