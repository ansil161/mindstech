"""
Recreates the Qdrant collection at the configured vector width.

DESTRUCTIVE: every indexed vector is deleted. This is step 4 of the re-index
runbook printed on an embedding dimension mismatch, and it requires an explicit
`--yes` because it is the exact operation the service itself refuses to perform
automatically. Run `--dry-run` first to see what would happen.

    python scripts/recreate_qdrant_collection.py --dry-run
    python scripts/recreate_qdrant_collection.py --yes
"""
import argparse
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


def _read_size(info):
    """Extracts the existing vector width across Qdrant's named/unnamed shapes."""
    try:
        vectors = info.config.params.vectors
    except AttributeError:
        return None
    if vectors is None:
        return None
    if hasattr(vectors, "size"):
        return int(vectors.size)
    if isinstance(vectors, dict):
        params = vectors.get("") or next(iter(vectors.values()), None)
        if params is not None and hasattr(params, "size"):
            return int(params.size)
    return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--yes",
        action="store_true",
        help="Confirm deletion. Without this the script only reports what it would do.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Report the current and target state, then exit without writing.",
    )
    args = parser.parse_args()

    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")
    collection_name = os.getenv("QDRANT_COLLECTION_NAME", "mindstec_rag")
    vector_size = int(os.getenv("QDRANT_VECTOR_DIMENSION", "768"))

    if not qdrant_url:
        logger.error("QDRANT_URL environment variable is missing!")
        sys.exit(1)

    logger.info("Connecting to Qdrant Cloud at %s...", qdrant_url)
    client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)

    # Check existing collections
    collections = client.get_collections().collections
    collection_names = [col.name for col in collections]

    existing_size = None
    existing_points = None
    if collection_name in collection_names:
        info = client.get_collection(collection_name)
        existing_size = _read_size(info)
        existing_points = getattr(info, "points_count", None)
        logger.info(
            "Existing collection '%s': %s points, %s-dim.",
            collection_name, existing_points, existing_size,
        )
    else:
        logger.info("Collection '%s' does not exist yet.", collection_name)

    logger.info("Target: '%s' at %d-dim, Cosine.", collection_name, vector_size)

    if args.dry_run or not args.yes:
        logger.warning(
            "No changes made. This operation DELETES %s vector(s) and cannot be undone. "
            "Take a snapshot first, then re-run with --yes. Every source document must "
            "be re-ingested afterwards or retrieval will return nothing.",
            existing_points if existing_points is not None else "0",
        )
        sys.exit(0 if args.dry_run else 1)

    if collection_name in collection_names:
        logger.warning("Deleting existing collection '%s' (%s points)...", collection_name, existing_points)
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
    logger.warning(
        "The collection is EMPTY. Re-ingest every source document now, then verify with "
        "`python scripts/bootstrap.py --check`. Until then retrieval returns no results."
    )

if __name__ == "__main__":
    main()
