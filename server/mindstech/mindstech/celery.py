import os
from celery import Celery

# Set default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mindstech.settings')

app = Celery('mindstech')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Priority resolution for Redis URL (Render REDIS_URL > Local fallback)
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
app.conf.broker_url = redis_url
app.conf.result_backend = redis_url


# Load task modules from all registered Django apps.
app.autodiscover_tasks()


