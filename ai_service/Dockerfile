# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1: build dependencies
# ---------------------------------------------------------------------------
FROM python:3.12-slim-bookworm AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt


# ---------------------------------------------------------------------------
# Stage 2: minimal runtime image
# ---------------------------------------------------------------------------
FROM python:3.12-slim-bookworm AS runner

WORKDIR /app

# PORT is defaulted here so the CMD below cannot bind to an empty address when
# the variable is unset — the v1 CMD used a bare `$PORT` with no default.
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    PATH=/home/appuser/.local/bin:$PATH

RUN groupadd -g 10001 appuser && \
    useradd -u 10001 -g appuser -m -s /sbin/nologin appuser

COPY --from=builder --chown=appuser:appuser /root/.local /home/appuser/.local

COPY --chown=appuser:appuser app/ ./app/
# config/ holds prompts.yaml and faq.yaml. These are runtime assets, not
# optional extras — the service loads them at startup and logs a warning
# (then falls back to terse built-ins) if they are missing.
COPY --chown=appuser:appuser config/ ./config/

USER appuser

EXPOSE 8000

# Container health check so the orchestrator can restart a wedged process.
# Deliberately /health (liveness) and not /health/ready: readiness fails when a
# dependency is down, and restarting the process would not fix that — it would
# just produce a crash loop during someone else's outage.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD python -c "import os,sys,urllib.request; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:'+os.getenv('PORT','8000')+'/health', timeout=4).status==200 else 1)"

# Gunicorn with Uvicorn workers.
#
# WEB_CONCURRENCY sets the process count. Unlike v1, the request path is now
# fully async — no worker blocks its event loop on embedding, vector search or
# LLM calls — so each worker serves many concurrent chats. Size workers to CPU
# cores, not to expected concurrent conversations.
#
# --timeout 120 sits above the worst-case turn (classification + retrieval +
# generation, each individually bounded by its own setting) so Gunicorn never
# kills a request that is still legitimately in flight.
CMD ["sh", "-c", "exec gunicorn app.main:app \
    -k uvicorn.workers.UvicornWorker \
    --workers ${WEB_CONCURRENCY:-2} \
    --timeout 120 \
    --graceful-timeout 30 \
    --keep-alive 15 \
    --access-logfile - \
    --error-logfile - \
    --bind 0.0.0.0:${PORT:-8000}"]
