FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Create a non-privileged user to run the server
RUN groupadd -g 10002 django-group && \
    useradd -u 10002 -g django-group -m -s /sbin/nologin django-user

COPY . /app/

# Set ownership of the app directory to the non-root user
RUN chown -R django-user:django-group /app

WORKDIR /app/mindstech

USER django-user

EXPOSE 8000

# Run both Gunicorn and Celery worker via Supervisor
CMD ["gunicorn", "mindstech.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "1", "--threads", "2"]

