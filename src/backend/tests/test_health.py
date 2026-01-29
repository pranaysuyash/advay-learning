"""Tests for health endpoint."""


import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_ok(client: AsyncClient):
    """Test health endpoint returns 200 when DB is healthy."""
    response = await client.get("/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "components" in data
    assert data["components"]["database"]["status"] == "healthy"


@pytest.mark.asyncio
async def test_health_db_down(client: AsyncClient):
    """Test health endpoint returns 503 when DB is down."""
    # Mock the health check to simulate DB failure
    from app.core.health import get_health_status

    async def mock_unhealthy_status(db):
        return {
            "status": "unhealthy",
            "components": {
                "database": {"status": "unhealthy", "error": "Connection failed"}
            }
        }

    # Override the health check
    original_health = get_health_status
    import app.main
    app.main.get_health_status = mock_unhealthy_status

    try:
        response = await client.get("/health")

        assert response.status_code == 503
        data = response.json()
        assert data["detail"]["status"] == "unhealthy"
        assert data["detail"]["components"]["database"]["status"] == "unhealthy"
    finally:
        # Restore original
        app.main.get_health_status = original_health
