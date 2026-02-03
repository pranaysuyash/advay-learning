"""Tests for input validation."""

import pytest
from httpx import AsyncClient

from app.core.validation import (
    ValidationError,
    validate_age,
    validate_email_format,
    validate_language_code,
    validate_uuid,
)
from app.schemas.user import validate_password_strength


class TestValidationUtilities:
    """Test validation utility functions."""

    def test_validate_uuid_valid(self):
        """Test valid UUID passes validation."""
        valid_uuid = "550e8400-e29b-41d4-a716-446655440000"
        result = validate_uuid(valid_uuid)
        assert result == valid_uuid

    def test_validate_uuid_invalid(self):
        """Test invalid UUID raises ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_uuid("not-a-uuid")
        assert "must be a valid UUID" in str(exc_info.value)

    def test_validate_uuid_empty(self):
        """Test empty UUID raises ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_uuid("")
        assert "is required" in str(exc_info.value)

    def test_validate_email_valid(self):
        """Test valid email passes validation."""
        valid_email = "test@example.com"
        result = validate_email_format(valid_email)
        assert result == valid_email

    def test_validate_email_invalid(self):
        """Test invalid email raises ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_email_format("not-an-email")
        assert "format is invalid" in str(exc_info.value)

    def test_validate_age_valid(self):
        """Test valid age passes validation."""
        assert validate_age(5) == 5
        assert validate_age(0) == 0
        assert validate_age(18) == 18

    def test_validate_age_invalid(self):
        """Test invalid age raises ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_age(-1)
        assert "must be between" in str(exc_info.value)

        with pytest.raises(ValidationError) as exc_info:
            validate_age(19)
        assert "must be between" in str(exc_info.value)

    def test_validate_age_none(self):
        """Test None age returns None."""
        assert validate_age(None) is None

    def test_validate_language_valid(self):
        """Test valid language codes pass validation."""
        assert validate_language_code("en") == "en"
        assert validate_language_code("hi") == "hi"
        assert validate_language_code("kn") == "kn"
        assert validate_language_code("te") == "te"
        assert validate_language_code("ta") == "ta"

    def test_validate_language_invalid(self):
        """Test invalid language code raises ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_language_code("fr")
        assert "must be one of" in str(exc_info.value)

    def test_validate_language_none(self):
        """Test None language returns None."""
        assert validate_language_code(None) is None


class TestProfileIdValidation:
    """Test profile_id validation in API endpoints."""

    async def test_get_progress_invalid_uuid(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test get_progress with invalid UUID returns 422."""
        response = await client.get(
            "/api/v1/progress/?profile_id=invalid-uuid", headers=auth_headers
        )
        assert response.status_code == 422
        assert (
            "profile_id" in response.json()["detail"].lower()
            or "uuid" in response.json()["detail"].lower()
        )

    async def test_save_progress_invalid_uuid(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test save_progress with invalid UUID returns 422."""
        response = await client.post(
            "/api/v1/progress/?profile_id=not-a-uuid",
            headers=auth_headers,
            json={"activity_type": "tracing", "content_id": "A", "score": 85},
        )
        assert response.status_code == 422

    async def test_get_stats_invalid_uuid(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test get_progress_stats with invalid UUID returns 422."""
        response = await client.get(
            "/api/v1/progress/stats?profile_id=bad-uuid", headers=auth_headers
        )
        assert response.status_code == 422


class TestUserIdValidation:
    """Test user_id validation in API endpoints."""

    async def test_get_user_invalid_uuid(self, client: AsyncClient, auth_headers: dict):
        """Test get_user with invalid UUID returns 422."""
        response = await client.get("/api/v1/users/invalid-uuid", headers=auth_headers)
        assert response.status_code == 422
        assert (
            "user_id" in response.json()["detail"].lower()
            or "uuid" in response.json()["detail"].lower()
        )


class TestPasswordValidation:
    """Test password strength validation."""

    def test_validate_password_valid(self):
        """Test valid passwords pass validation."""
        valid_passwords = [
            "Password123",  # Basic valid
            "MyP@ssw0rd",  # With special char
            "A1b2C3d4",  # Mixed
            "SecurePass1",  # Long enough
        ]
        for pwd in valid_passwords:
            result = validate_password_strength(pwd)
            assert result == pwd

    def test_validate_password_too_short(self):
        """Test short password fails validation."""
        with pytest.raises(ValueError) as exc_info:
            validate_password_strength("Short1")
        assert "at least 8 characters" in str(exc_info.value)

    def test_validate_password_no_uppercase(self):
        """Test password without uppercase fails."""
        with pytest.raises(ValueError) as exc_info:
            validate_password_strength("password123")
        assert "uppercase letter" in str(exc_info.value)

    def test_validate_password_no_lowercase(self):
        """Test password without lowercase fails."""
        with pytest.raises(ValueError) as exc_info:
            validate_password_strength("PASSWORD123")
        assert "lowercase letter" in str(exc_info.value)

    def test_validate_password_no_digit(self):
        """Test password without digit fails."""
        with pytest.raises(ValueError) as exc_info:
            validate_password_strength("PasswordABC")
        assert "digit" in str(exc_info.value)

    async def test_register_weak_password(self, client: AsyncClient):
        """Test registration with weak password returns 422."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "weakpass@test.com",
                "password": "weak",  # Too short, no uppercase, no digit
            },
        )
        assert response.status_code == 422
        error_msg = str(response.json()).lower()
        assert "password" in error_msg

    async def test_register_valid_password(self, client: AsyncClient):
        """Test registration with valid password succeeds."""
        response = await client.post(
            "/api/v1/auth/register",
            json={"email": "strongpass@test.com", "password": "StrongPass123"},
        )
        assert response.status_code == 200


class TestProfileSchemaValidation:
    """Test profile schema validation."""

    async def test_create_profile_invalid_age(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test creating profile with invalid age returns 422."""
        response = await client.post(
            "/api/v1/users/me/profiles",
            headers=auth_headers,
            json={"name": "Test Child", "age": 25},  # Too high
        )
        assert response.status_code == 422
        assert "age" in str(response.json()).lower()

    async def test_create_profile_negative_age(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test creating profile with negative age returns 422."""
        response = await client.post(
            "/api/v1/users/me/profiles",
            headers=auth_headers,
            json={"name": "Test Child", "age": -5},
        )
        assert response.status_code == 422

    async def test_create_profile_invalid_language(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test creating profile with invalid language returns 422."""
        response = await client.post(
            "/api/v1/users/me/profiles",
            headers=auth_headers,
            json={"name": "Test Child", "preferred_language": "fr"},  # Not supported
        )
        assert response.status_code == 422
        assert "language" in str(response.json()).lower()

    async def test_create_profile_valid_data(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test creating profile with valid data succeeds."""
        response = await client.post(
            "/api/v1/users/me/profiles",
            headers=auth_headers,
            json={"name": "Valid Child", "age": 5, "preferred_language": "en"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Valid Child"
        assert data["age"] == 5
        assert data["preferred_language"] == "en"
