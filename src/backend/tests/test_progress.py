from httpx import AsyncClient


class TestProgress:
    """Test progress tracking endpoints."""

    async def test_save_progress(self, client: AsyncClient, auth_headers: dict):
        """Test saving progress data."""
        # First create a profile
        profile_response = await client.post(
            "/api/v1/users/me/profiles",
            headers=auth_headers,
            json={"name": "Test Child", "age": 5}
        )
        profile_id = profile_response.json()["id"]

        response = await client.post(
            "/api/v1/progress/",
            headers=auth_headers,
            params={"profile_id": profile_id},
            json={
                "activity_type": "letter_tracing",
                "content_id": "A",
                "score": 85,
                "duration_seconds": 30,
                "meta_data": {"accuracy": 90}
            }
        )
        assert response.status_code == 200  # Endpoint returns 200, not 201
        data = response.json()
        assert data["score"] == 85
        assert data["activity_type"] == "letter_tracing"

    async def test_get_progress(self, client: AsyncClient, auth_headers: dict):
        """Test getting progress data."""
        # Create profile and save progress
        profile_response = await client.post(
            "/api/v1/users/me/profiles",
            headers=auth_headers,
            json={"name": "Test Child", "age": 5}
        )
        profile_id = profile_response.json()["id"]

        await client.post(
            "/api/v1/progress/",
            headers=auth_headers,
            params={"profile_id": profile_id},
            json={
                "activity_type": "letter_tracing",
                "content_id": "A",
                "score": 85,
                "duration_seconds": 30
            }
        )

        response = await client.get(
            "/api/v1/progress/",
            headers=auth_headers,
            params={"profile_id": profile_id}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    async def test_get_stats(self, client: AsyncClient, auth_headers: dict):
        """Test getting progress stats."""
        # Create profile and save progress
        profile_response = await client.post(
            "/api/v1/users/me/profiles",
            headers=auth_headers,
            json={"name": "Test Child", "age": 5}
        )
        profile_id = profile_response.json()["id"]

        # Save multiple progress entries
        for letter in ["A", "B", "C"]:
            await client.post(
                "/api/v1/progress/",
                headers=auth_headers,
                params={"profile_id": profile_id},
                json={
                    "activity_type": "letter_tracing",
                    "content_id": letter,
                    "score": 80 + ord(letter) - ord("A"),
                    "duration_seconds": 25
                }
            )

        response = await client.get(
            "/api/v1/progress/stats",
            headers=auth_headers,
            params={"profile_id": profile_id}
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_activities" in data
        assert "average_score" in data
        assert data["total_activities"] >= 3
