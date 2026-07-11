import logging
from django.apps import apps
from django.db import DatabaseError
from adminpanel.services.ai_client import AIClient, AIClientError

logger = logging.getLogger(__name__)


def _get_document_model(model_name: str):
    """Dynamically fetch the Django model class by name."""
    try:
        return apps.get_model('adminpanel', model_name)
    except LookupError as e:
        logger.error("Failed to lookup model %s in adminpanel: %s", model_name, str(e))
        return None


def sync_document_to_ai_service(model_name: str, instance_id: int) -> bool:
    """
    Synchronously runs synchronization of a model instance (FAQ, Product, Policy, etc.)
    with the FastAPI AI service. Ready for Celery background wrap.
    """
    logger.info("Starting synchronization task for %s ID %d", model_name, instance_id)
    
    model_class = _get_document_model(model_name)
    if not model_class:
        return False

    try:
        instance = model_class.objects.get(pk=instance_id)
    except model_class.DoesNotExist:
        logger.warning("%s instance with ID %d no longer exists. Skipping sync.", model_name, instance_id)
        return False
    except DatabaseError as e:
        logger.error("Database error fetching %s ID %d: %s", model_name, instance_id, str(e))
        return False

    # Extract category based on model class name
    category = model_name.lower()
    
    # Map model attributes to standard fields
    title = ""
    content = ""
    
    if model_name == "FAQ":
        title = f"FAQ: {instance.question[:100]}"
        content = f"Question: {instance.question}\nAnswer: {instance.answer}"
    elif model_name == "Product":
        title = instance.name
        content = f"Product: {instance.name}\nDescription: {instance.description}"
    elif model_name in ["CompanyPage", "Policy", "Documentation"]:
        title = instance.title
        content = instance.content
    else:
        logger.error("Unsupported synchronization model: %s", model_name)
        return False

    # Retrieve version (defaults to 1 if not present)
    version = getattr(instance, 'version', 1)
    
    # In this phase, we map tenant_id dynamically or default to "default"
    tenant_id = getattr(instance, 'tenant_id', 'default')

    # Instantiates the AI microservice client and publishes changes
    client = AIClient()
    try:
        # Call update_document which acts as an upsert endpoint
        result = client.update_document(
            document_id=f"{category}_{instance.id}",
            title=title,
            content=content,
            category=category,
            version=version,
            tenant_id=tenant_id
        )
        logger.info(
            "Successfully synced %s ID %d to AI Service. Result status: %s",
            model_name, instance_id, result.get("status", "unknown")
        )
        return True
    except AIClientError as e:
        logger.error(
            "Failed to sync %s ID %d to AI service due to connection error: %s",
            model_name, instance_id, str(e)
        )
        # In actual Celery task, we would raise self.retry(exc=e) here
        return False
    except Exception as e:
        logger.exception("Unexpected exception syncing %s ID %d: %s", model_name, instance_id, str(e))
        return False


def delete_document_from_ai_service(model_name: str, instance_id: int, tenant_id: str = "default") -> bool:
    """
    Propagates database deletion of an instance by deleting its vectors in Qdrant.
    """
    category = model_name.lower()
    document_id = f"{category}_{instance_id}"
    
    logger.info("Propagating deletion to AI Service for document ID: %s", document_id)
    
    client = AIClient()
    try:
        result = client.delete_document(
            document_id=document_id,
            category=category,
            tenant_id=tenant_id
        )
        logger.info(
            "Successfully deleted document ID %s from AI Service. Result status: %s",
            document_id, result.get("status", "unknown")
        )
        return True
    except AIClientError as e:
        logger.error("Failed to delete document ID %s from AI service: %s", document_id, str(e))
        return False
    except Exception as e:
        logger.exception("Unexpected exception deleting document ID %s: %s", document_id, str(e))
        return False
