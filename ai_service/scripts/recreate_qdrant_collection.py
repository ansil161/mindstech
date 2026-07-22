import os
import sys
import logging
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("recreate_qdrant_collection")

# Load .env if present
load_dotenv()

def main():
    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")
    collection_name = os.getenv("QDRANT_COLLECTION_NAME", "mindstec_rag")
    vector_size = int(os.getenv("QDRANT_VECTOR_DIMENSION", "384"))

    if not qdrant_url:
        logger.error("QDRANT_URL environment variable is missing!")
        sys.exit(1)

    logger.info("Connecting to Qdrant Cloud at %s...", qdrant_url)
    client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)

    # Check existing collections
    collections = client.get_collections().collections
    collection_names = [col.name for col in collections]

    if collection_name in collection_names:
        logger.info("Deleting existing collection '%s'...", collection_name)
        client.delete_collection(collection_name=collection_name)
        logger.info("Deleted collection '%s'.", collection_name)

    logger.info(
        "Creating collection '%s' with size=%d and distance=Cosine...",
        collection_name, vector_size
    )
    client.create_collection(
        collection_name=collection_name,
        vectors_config=qmodels.VectorParams(
            size=vector_size,
            distance=qmodels.Distance.COSINE
        )
    )

    logger.info("Successfully recreated Qdrant collection '%s' (vector dimension: %d).", collection_name, vector_size)

if __name__ == "__main__":
    main()
