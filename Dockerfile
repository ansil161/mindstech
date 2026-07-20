FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies required for compilation and DB headers
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    libpq-dev \
    sed \
    && rm -rf /var/lib/apt/lists/*

# Copy requirement files first for optimal Docker layer caching
COPY server/requirements.txt /app/server_requirements.txt
COPY ai_service/requirements.txt /app/ai_requirements.txt

# Install dependencies for both Django and FastAPI AI service
RUN pip install --no-cache-dir -r /app/server_requirements.txt
RUN pip install --no-cache-dir -r /app/ai_requirements.txt

# Copy all project source code
COPY . /app

# Ensure start.sh has Unix (LF) line endings and executable permissions
RUN sed -i 's/\r$//' /app/start.sh && chmod +x /app/start.sh

# Expose Django (8000) and AI Service (8001) ports
EXPOSE 8000 8001

CMD ["./start.sh"]
