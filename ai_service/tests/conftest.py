import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="module")
def client():
    """
    Test fixture providing a FastAPI TestClient instance.
    Handles startup/shutdown events inside the context.
    """
    with TestClient(app) as c:
        yield c
