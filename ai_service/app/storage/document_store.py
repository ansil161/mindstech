import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class DocumentStore:
    """
    Local key-value store mapping document IDs to raw meta/content details.
    Provides metadata lookup fallback.
    """
    def __init__(self):
        self._store: Dict[str, Any] = {}

    def save_document(self, doc_id: str, document: Dict[str, Any]):
        self._store[doc_id] = document
        logger.info("Stored document metadata locally for ID: %s", doc_id)

    def get_document(self, doc_id: str) -> Optional[Dict[str, Any]]:
        return self._store.get(doc_id)

    def delete_document(self, doc_id: str):
        if doc_id in self._store:
            del self._store[doc_id]
            logger.info("Deleted local metadata record for ID: %s", doc_id)

document_store = DocumentStore()
