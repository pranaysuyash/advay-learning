from httpx import AsyncClient


class TestProfiles:
    """Test profile management endpoints."""

    async def test_create_profile(self, client: AsyncClient, auth_headers: dict):
        """Test creating a new profile."""
        response = await client.post(
            "/api/v1/users/me/profiles",
            headers=auth_headers,
            json={
                "name": "Test Child",
                "age": 5,
                "preferred_language": "en"
            }
        )
        assert response.status_code == 200  # Endpoint returns 200, not 201
        data = response.json()
        assert data["name"] == "Test Child"
        assert data["age"] == 5
        assert "id" in data

    async def test_get_profiles(self, client: AsyncClient, auth_headers: dict):
        """Test getting all profiles for user."""
        # First create a profile
        await client.post(
            "/api/v1/users/me/profiles",
            headers=auth_headers,
            json={"name": "Test Child", "age": 5}
        )

        response = await client.get("/api/v1/users/me/profiles", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    async def test_create_profile_no_auth(self, client: AsyncClient):
        """Test creating profile without auth fails."""
        response = await client.post(
            "/api/v1/users/me/profiles",
            json={"name": "Test Child", "age": 5}
        )
        assert response.status_code == 401

    async def test_create_multiple_profiles(self, client: AsyncClient, auth_headers: dict):
        """Test creating multiple profiles for same user."""
        profiles = [
            {"name": "Child 1", "age": 4},
            {"name": "Child 2", "age": 6}
        ]

        for profile in profiles:
            response = await client.post(
                "/api/v1/users/me/profiles",
                headers=auth_headers,
                json=profile
            )
            assert response.status_code == 200  # Endpoint returns 200, not 201

        # Verify both exist
        response = await client.get("/api/v1/users/me/profiles", headers=auth_headers)
        data = response.json()
        assert len(data) >= 2
