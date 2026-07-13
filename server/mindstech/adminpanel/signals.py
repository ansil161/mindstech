import logging
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import KnowledgeBase
from .tasks.ai_tasks import sync_knowledge_base_task, delete_knowledge_base_task

logger = logging.getLogger(__name__)


@receiver(post_save, sender=KnowledgeBase)
def handle_knowledge_base_save(sender, instance, created, **kwargs):
    """
    Triggered when a KnowledgeBase record is created or updated.
    Enqueues the Celery task to synchronize vectors in Qdrant.
    """
    if instance.is_active:
        logger.info("KnowledgeBase post_save triggered for ID %d. Queueing sync task.", instance.id)
        # Use delay() to run the Celery task asynchronously in the background
        sync_knowledge_base_task.delay(instance.id)
    else:
        logger.info("KnowledgeBase post_save (inactive) triggered for ID %d. Queueing delete task.", instance.id)
        delete_knowledge_base_task.delay(instance.id, instance.knowledge_type)


@receiver(post_delete, sender=KnowledgeBase)
def handle_knowledge_base_delete(sender, instance, **kwargs):
    """
    Triggered when a KnowledgeBase record is deleted.
    Enqueues the Celery task to delete vectors from Qdrant.
    """
    logger.info("KnowledgeBase post_delete triggered for ID %d. Queueing delete task.", instance.id)
    delete_knowledge_base_task.delay(instance.id, instance.knowledge_type)
