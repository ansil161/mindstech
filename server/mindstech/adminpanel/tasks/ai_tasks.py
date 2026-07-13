import logging
from django.apps import apps
from django.db import DatabaseError
from celery import shared_task
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
    Synchronously runs synchronization of a model instance (KnowledgeBase)
    with the FastAPI AI service.
    """
    logger.info("Starting RAG synchronization task for %s ID %d", model_name, instance_id)
    
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

    # Extract fields from unified model
    category = instance.knowledge_type  # company, faq, product, policy, documentation
    title = instance.title
    content = instance.content
    version = getattr(instance, 'version', 1)
    tenant_id = getattr(instance, 'tenant_id', 'default')

    # Format content for optimal matching in RAG based on category
    if category == "faq":
        formatted_title = f"FAQ: {title[:100]}"
        formatted_content = f"Question: {title}\nAnswer: {content}"
    elif category == "product":
        formatted_title = title
        formatted_content = f"Product: {title}\nDescription: {content}"
    else:
        formatted_title = title
        formatted_content = content

    # Instantiates the AI microservice client and publishes changes
    client = AIClient()
    try:
        result = client.update_document(
            document_id=f"{category}_{instance.id}",
            title=formatted_title,
            content=formatted_content,
            category=category,
            version=version,
            tenant_id=tenant_id
        )
        logger.info(
            "Successfully synced %s ID %d (type: %s) to AI Service. Result status: %s",
            model_name, instance_id, category, result.get("status", "unknown")
        )
        return True
    except AIClientError as e:
        logger.error(
            "Failed to sync %s ID %d to AI service due to connection error: %s",
            model_name, instance_id, str(e)
        )
        return False
    except Exception as e:
        logger.exception("Unexpected exception syncing %s ID %d: %s", model_name, instance_id, str(e))
        return False


def delete_document_from_ai_service_generic(knowledge_type: str, instance_id: int, tenant_id: str = "default") -> bool:
    """
    Propagates database deletion of an instance by deleting its vectors in Qdrant.
    """
    category = knowledge_type.lower()
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


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def sync_knowledge_base_task(self, instance_id: int):
    """
    Celery task that enqueues the RAG document sync to FastAPI AI service.
    """
    logger.info("Celery sync task triggered for KnowledgeBase ID %d", instance_id)
    try:
        success = sync_document_to_ai_service("KnowledgeBase", instance_id)
        if not success:
            logger.warning("Sync failed. Retrying Celery task for KnowledgeBase ID %d", instance_id)
            self.retry()
    except Exception as e:
        logger.error("Exception in Celery sync task for KnowledgeBase ID %d: %s", instance_id, str(e))
        self.retry(exc=e)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def delete_knowledge_base_task(self, instance_id: int, knowledge_type: str, tenant_id: str = "default"):
    """
    Celery task that enqueues the deletion propagation to Qdrant/FastAPI.
    """
    logger.info("Celery delete task triggered for KnowledgeBase ID %d category %s", instance_id, knowledge_type)
    try:
        success = delete_document_from_ai_service_generic(knowledge_type, instance_id, tenant_id)
        if not success:
            logger.warning("Delete failed. Retrying Celery task for KnowledgeBase ID %d", instance_id)
            self.retry()
    except Exception as e:
        logger.error("Exception in Celery delete task for KnowledgeBase ID %d: %s", instance_id, str(e))
        self.retry(exc=e)


import httpx
from django.conf import settings

@shared_task(bind=True, max_retries=1, default_retry_delay=30)
def parse_document_task(self, document_id: int):
    Document = apps.get_model('adminpanel', 'Document')
    try:
        doc = Document.objects.get(pk=document_id)
        doc.status = 'Processing'
        doc.save(update_fields=['status'])
        
        url = getattr(settings, "AI_SERVICE_URL", "http://localhost:8000")
        if url.endswith("/"):
            url = url[:-1]
        
        with open(doc.file.path, 'rb') as f:
            files = {'file': (doc.file.name, f, 'application/octet-stream')}
            # Need to pass API Key if required
            api_key = getattr(settings, "AI_SERVICE_API_KEY", "secret-key")
            headers = {"Authorization": f"Bearer {api_key}"}
            
            response = httpx.post(
                f"{url}/api/v1/internal/parse", 
                files=files,
                headers=headers,
                timeout=120.0
            )
            response.raise_for_status()
            data = response.json()
            
            doc.extracted_text = data.get('text', '')
            doc.status = 'Pending Review'
            doc.save(update_fields=['extracted_text', 'status'])
            
    except Exception as e:
        logger.error("Failed to parse document %d: %s", document_id, str(e))
        doc = Document.objects.get(pk=document_id)
        doc.status = 'Failed'
        doc.save(update_fields=['status'])

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def index_document_task(self, document_id: int):
    Document = apps.get_model('adminpanel', 'Document')
    try:
        doc = Document.objects.get(pk=document_id)
        doc.status = 'Processing'
        doc.save(update_fields=['status'])

        client = AIClient()
        result = client.ingest_document(
            document_id=f"document_{doc.id}",
            title=doc.title,
            content=doc.extracted_text,
            category=doc.category,
            version=doc.version,
            tenant_id="default"
        )
        
        doc.status = 'Indexed'
        doc.save(update_fields=['status'])
        
    except Exception as e:
        logger.error("Failed to index document %d: %s", document_id, str(e))
        doc = Document.objects.get(pk=document_id)
        doc.status = 'Failed'
        doc.save(update_fields=['status'])

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def delete_document_task(self, document_id: str, category: str):
    try:
        client = AIClient()
        client.delete_document(document_id=document_id, category=category)
    except Exception as e:
        logger.error("Failed to delete document %s from Qdrant: %s", document_id, str(e))
