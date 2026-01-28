import pytest
from httpx import AsyncClient


class TestAuth:
    """Test authentication endpoints."""

    async def test_register_success(self, client: AsyncClient):
        """Test successful user registration."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@example.com",
                "password": "password123"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert "id" in data
        assert "password" not in data

    async def test_register_duplicate_email(self, client: AsyncClient, test_user: dict):
        """Test registration with duplicate email fails."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": test_user["email"],
                "password": "password123"
            }
        )
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"].lower()

    async def test_login_success(self, client: AsyncClient, test_user: dict):
        """Test successful login."""
        response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_user["email"],
                "password": test_user["password"]
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    async def test_login_invalid_credentials(self, client: AsyncClient):
        """Test login with invalid credentials fails."""
        response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": "wrong@example.com",
                "password": "wrongpassword"
            }
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
