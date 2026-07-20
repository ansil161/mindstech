#!/bin/bash
set -e

# Environment paths to ensure modules are discoverable
export PYTHONPATH="/app/server/mindstech:/app/ai_service:$PYTHONPATH"

echo "============================================="
echo " Starting Mindstech Multi-Service Container "
echo "============================================="

# 1. Start Django Backend (Gunicorn on 0.0.0.0:8000)
echo "[1/3] Starting Django Backend on 0.0.0.0:8000..."
cd /app/server/mindstech
gunicorn --bind 0.0.0.0:8000 --workers 2 mindstech.wsgi:application &

# 2. Start FastAPI AI Service (Uvicorn on 0.0.0.0:8001)
echo "[2/3] Starting FastAPI AI Service on 0.0.0.0:8001..."
cd /app/ai_service
uvicorn app.main:app --host 0.0.0.0 --port 8001 &

# 3. Start Celery Worker
echo "[3/3] Starting Celery Worker..."
cd /app/server/mindstech
celery -A mindstech worker --loglevel=info &

echo "============================================="
echo " All services launched successfully. Waiting... "
echo "============================================="

# Wait for background processes to remain alive
wait
