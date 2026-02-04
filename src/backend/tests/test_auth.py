from httpx import AsyncClient


class TestAuth:
    """Test authentication endpoints."""

    async def test_register_success(self, client: AsyncClient):
        """Test successful user registration."""
        response = await client.post(
            "/api/v1/auth/register",
            json={"email": "newuser@example.com", "password": "Password123"},
        )
        assert response.status_code == 200  # Endpoint returns 200, not 201
        data = response.json()
        assert "if an account is eligible" in data["message"].lower()

    async def test_register_duplicate_email(self, client: AsyncClient, test_user: dict):
        """Test duplicate registration returns same generic success response."""
        first_response = await client.post(
            "/api/v1/auth/register",
            json={"email": test_user["email"], "password": "Password123"},
        )
        second_response = await client.post(
            "/api/v1/auth/register",
            json={"email": test_user["email"], "password": "Password123"},
        )
        assert first_response.status_code == 200
        assert second_response.status_code == 200
        assert first_response.json()["message"] == second_response.json()["message"]

    async def test_login_success(self, client: AsyncClient, test_user: dict):
        """Test successful login sets cookies."""
        response = await client.post(
            "/api/v1/auth/login",
            data={"username": test_user["email"], "password": test_user["password"]},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Login successful"
        assert "user" in data
        assert data["user"]["email"] == test_user["email"]

        # Verify cookies are set
        cookies = response.cookies
        assert "access_token" in cookies
        assert "refresh_token" in cookies

    async def test_login_invalid_credentials(self, client: AsyncClient):
        """Test login with invalid credentials fails."""
        response = await client.post(
            "/api/v1/auth/login",
            data={"username": "wrong@example.com", "password": "wrongpassword"},
        )
        assert response.status_code == 401

    async def test_get_current_user(self, client: AsyncClient, auth_headers: dict):
        """Test getting current user info."""
        response = await client.get("/api/v1/users/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "email" in data
        assert "id" in data

    async def test_get_current_user_no_auth(self, client: AsyncClient):
        """Test getting current user without auth fails."""
        response = await client.get("/api/v1/users/me")
        assert response.status_code == 401
