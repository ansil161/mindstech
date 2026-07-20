import logging
from django.apps import apps
from celery import shared_task
from adminpanel.services.ai_client import AIClient, AIClientError

logger = logging.getLogger(__name__)


import httpx
from django.conf import settings

@shared_task(bind=True, max_retries=1, default_retry_delay=30)
def parse_document_task(self, document_id: int):
    Document = apps.get_model('adminpanel', 'Document')
    try:
        doc = Document.objects.get(pk=document_id)
        doc.status = 'Processing'
        doc.save(update_fields=['status'])
        
        url = getattr(settings, "AI_SERVICE_URL", os.getenv("AI_SERVICE_URL", "http://ai-service:8000")).rstrip("/")
        
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
