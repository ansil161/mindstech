# Stage 1: Build dependencies
FROM python:3.12-slim-bookworm AS builder

WORKDIR /build

# Install system compilation dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies to a temporary folder
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Final minimal runtime image
FROM python:3.12-slim-bookworm AS runner

WORKDIR /app

# Set production environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH=/home/appuser/.local/bin:$PATH

# Create a non-privileged user to run the service
RUN groupadd -g 10001 appuser && \
    useradd -u 10001 -g appuser -m -s /sbin/nologin appuser

# Copy installed dependencies from builder
COPY --from=builder --chown=appuser:appuser /root/.local /home/appuser/.local

# Copy application source code
COPY --chown=appuser:appuser app/ ./app/
COPY --chown=appuser:appuser config/ ./config/

USER appuser

EXPOSE 8001

# Run with Gunicorn using Uvicorn workers for production scalability
CMD ["sh", "-c", "gunicorn -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT app.main:app"]
