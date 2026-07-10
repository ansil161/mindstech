from fastapi import status


def test_health_check(client):
    """
    Test that the /health endpoint is live and returning standard status and project metadata.
    """
    response = client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["status"] == "healthy"
    assert "project" in data
    assert "environment" in data
