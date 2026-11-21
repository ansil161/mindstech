# Import task modules so Celery's autodiscover (which imports
# `adminpanel.tasks`) registers every task in the worker.
from . import ai_tasks, email_tasks  # noqa: F401
