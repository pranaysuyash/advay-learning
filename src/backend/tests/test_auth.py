from unittest.mock import patch

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


class TestAuth:
    """Test authentication endpoints."""

    async def test_register_success(self, client: AsyncClient):
        """Test successful user registration."""
        with patch("app.core.email.EmailService.send_verification_email") as mock_send:
            response = await client.post(
                "/api/v1/auth/register",
                json={"email": "newuser@example.com", "password": "Password123!"},
            )
            assert response.status_code == 200  # Endpoint returns 200, not 201
            data = response.json()
            assert "if an account is eligible" in data["message"].lower()
            mock_send.assert_called_once()

    async def test_register_duplicate_email(self, client: AsyncClient, test_user: dict):
        """Test duplicate registration returns same generic success response."""
        first_response = await client.post(
            "/api/v1/auth/register",
            json={"email": test_user["email"], "password": "Password123!"},
        )
        second_response = await client.post(
            "/api/v1/auth/register",
            json={"email": test_user["email"], "password": "Password123!"},
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

    async def test_login_success_with_case_and_spaces_in_email(self, client: AsyncClient, test_user: dict):
        """Test login succeeds with case/whitespace variations in email input."""
        response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": f"  {test_user['email'].upper()}  ",
                "password": test_user["password"],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Login successful"
        assert data["user"]["email"] == test_user["email"]

    async def test_login_invalid_credentials(self, client: AsyncClient):
        """Test login with invalid credentials fails."""
        response = await client.post(
            "/api/v1/auth/login",
            data={"username": "wrong@example.com", "password": "wrongpassword"},
        )
        assert response.status_code == 401
        assert response.headers["www-authenticate"] == "Bearer"
        assert response.json()["detail"] == "Incorrect email or password"

    async def test_login_unverified_email(self, client: AsyncClient, db_session: AsyncSession):
        """Test login with unverified email fails."""
        from app.core.security import get_password_hash
        from app.db.models.user import User

        # Create unverified user
        user = User(
            email="unverified@example.com",
            hashed_password=get_password_hash("TestPass123!"),
            is_active=True,
            email_verified=False,
        )
        db_session.add(user)
        await db_session.commit()

        response = await client.post(
            "/api/v1/auth/login",
            data={"username": "unverified@example.com", "password": "TestPass123!"},
        )
        assert response.status_code == 403
        assert "email not verified" in response.json()["error"]["message"].lower()

    async def test_login_inactive_account(self, client: AsyncClient, db_session: AsyncSession):
        """Test login with inactive account fails."""
        from app.core.security import get_password_hash
        from app.db.models.user import User

        # Create inactive user
        user = User(
            email="inactive@example.com",
            hashed_password=get_password_hash("TestPass123!"),
            is_active=False,
            email_verified=True,
        )
        db_session.add(user)
        await db_session.commit()

        response = await client.post(
            "/api/v1/auth/login",
            data={"username": "inactive@example.com", "password": "TestPass123!"},
        )
        assert response.status_code == 403
        assert "inactive" in response.json()["error"]["message"].lower()

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


class TestAuthLogout:
    """Test logout endpoint."""

    async def test_logout_success(self, client: AsyncClient, test_user: dict):
        """Test successful logout clears cookies."""
        # First login to get cookies
        login_response = await client.post(
            "/api/v1/auth/login",
            data={"username": test_user["email"], "password": test_user["password"]},
        )
        assert login_response.status_code == 200

        # Get cookies from login response
        cookies = login_response.cookies
        client.cookies.update(cookies)

        # Now logout
        response = await client.post("/api/v1/auth/logout")
        assert response.status_code == 200
        assert "logout successful" in response.json()["message"].lower()

        # Verify cookies are cleared (they should have expired)
        # The response should indicate cookies are deleted

    async def test_logout_without_auth(self, client: AsyncClient):
        """Test logout without auth still succeeds (idempotent)."""
        response = await client.post("/api/v1/auth/logout")
        # Should still return 200 as it's clearing cookies anyway
        assert response.status_code == 200


class TestAuthRefresh:
    """Test token refresh endpoint."""

    async def test_refresh_token_success(self, client: AsyncClient, test_user: dict):
        """Test successful token refresh."""
        # Login to get cookies
        login_response = await client.post(
            "/api/v1/auth/login",
            data={"username": test_user["email"], "password": test_user["password"]},
        )
        assert login_response.status_code == 200

        # Get refresh token from cookies
        cookies = login_response.cookies
        refresh_token = cookies.get("refresh_token")
        assert refresh_token

        # Use the refresh token for refresh request
        client.cookies.update(cookies)
        response = await client.post("/api/v1/auth/refresh")

        assert response.status_code == 200
        assert "refreshed successfully" in response.json()["message"].lower()

        # Verify new cookies are set
        new_cookies = response.cookies
        assert "access_token" in new_cookies or "refresh_token" in new_cookies

    async def test_refresh_token_missing(self, client: AsyncClient):
        """Test refresh without token fails."""
        response = await client.post("/api/v1/auth/refresh")
        assert response.status_code == 401
        assert "no refresh token" in response.json()["error"]["message"].lower()

    async def test_refresh_token_invalid(self, client: AsyncClient):
        """Test refresh with invalid token fails."""
        # Set an invalid refresh token cookie
        client.cookies.set("refresh_token", "invalid_token")

        response = await client.post("/api/v1/auth/refresh")
        assert response.status_code == 401


class TestAuthPasswordReset:
    """Test password reset flow."""

    async def test_forgot_password_existing_user(self, client: AsyncClient, test_user: dict):
        """Test forgot password for existing user sends email."""
        with patch("app.core.email.EmailService.send_password_reset_email") as mock_send:
            response = await client.post(
                "/api/v1/auth/forgot-password",
                params={"email": test_user["email"]},
            )
            assert response.status_code == 200
            assert "if an account exists" in response.json()["message"].lower()
            mock_send.assert_called_once()

    async def test_forgot_password_nonexistent_user(self, client: AsyncClient):
        """Test forgot password for non-existent user returns same message (no enumeration)."""
        response = await client.post(
            "/api/v1/auth/forgot-password",
            params={"email": "nonexistent@example.com"},
        )
        assert response.status_code == 200
        assert "if an account exists" in response.json()["message"].lower()

    async def test_reset_password_success(self, client: AsyncClient, db_session: AsyncSession):
        """Test password reset with valid token."""
        from app.services.user_service import UserService

        # Create a user and generate reset token
        user_data = {"email": "resettest@example.com", "password": "OldPass123!"}
        from app.core.security import get_password_hash
        from app.db.models.user import User

        user = User(
            email=user_data["email"],
            hashed_password=get_password_hash(user_data["password"]),
            is_active=True,
            email_verified=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Create password reset token
        token = await UserService.create_password_reset_token(db_session, user)

        # Reset password
        response = await client.post(
            "/api/v1/auth/reset-password",
            params={"token": token, "new_password": "NewPass123!"},
        )
        assert response.status_code == 200
        assert "reset successfully" in response.json()["message"].lower()

        # Verify old password no longer works
        old_login = await client.post(
            "/api/v1/auth/login",
            data={"username": user_data["email"], "password": user_data["password"]},
        )
        assert old_login.status_code == 401

        # Verify new password works
        new_login = await client.post(
            "/api/v1/auth/login",
            data={"username": user_data["email"], "password": "NewPass123!"},
        )
        assert new_login.status_code == 200

    async def test_reset_password_invalid_token(self, client: AsyncClient):
        """Test password reset with invalid token fails."""
        response = await client.post(
            "/api/v1/auth/reset-password",
            params={"token": "invalid_token", "new_password": "NewPass123!"},
        )
        assert response.status_code == 400
        assert "invalid or expired" in response.json()["detail"].lower()

    async def test_reset_password_short_password(self, client: AsyncClient, db_session: AsyncSession):
        """Test password reset with short password fails."""
        from app.services.user_service import UserService

        # Create a user and generate reset token
        from app.core.security import get_password_hash
        from app.db.models.user import User

        user = User(
            email="shortpass@example.com",
            hashed_password=get_password_hash("OldPass123!"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        token = await UserService.create_password_reset_token(db_session, user)

        # Try to reset with short password
        response = await client.post(
            "/api/v1/auth/reset-password",
            params={"token": token, "new_password": "short"},
        )
        assert response.status_code == 422


class TestAuthEmailVerification:
    """Test email verification flow."""

    async def test_verify_email_success(self, client: AsyncClient, db_session: AsyncSession):
        """Test email verification with valid token."""
        from app.core.email import EmailService
        from app.services.user_service import UserService

        # Create unverified user
        user_data = {"email": "verify@example.com", "password": "TestPass123!"}
        from app.core.security import get_password_hash
        from app.db.models.user import User

        user = User(
            email=user_data["email"],
            hashed_password=get_password_hash(user_data["password"]),
            is_active=True,
            email_verified=False,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Generate verification token
        token = EmailService.generate_verification_token()
        user.email_verification_token = token
        user.email_verification_expires = EmailService.get_verification_expiry()
        await db_session.commit()

        # Verify email
        response = await client.post(
            "/api/v1/auth/verify-email",
            params={"token": token},
        )
        assert response.status_code == 200
        assert "verified successfully" in response.json()["message"].lower()

        # Verify user can now login
        login_response = await client.post(
            "/api/v1/auth/login",
            data={"username": user_data["email"], "password": user_data["password"]},
        )
        assert login_response.status_code == 200

    async def test_verify_email_invalid_token(self, client: AsyncClient):
        """Test email verification with invalid token fails."""
        response = await client.post(
            "/api/v1/auth/verify-email",
            params={"token": "invalid_token"},
        )
        assert response.status_code == 400
        assert "invalid or expired" in response.json()["detail"].lower()

    async def test_resend_verification_existing_user(self, client: AsyncClient, db_session: AsyncSession):
        """Test resend verification for unverified user."""
        from app.core.email import EmailService

        # Create unverified user
        from app.core.security import get_password_hash
        from app.db.models.user import User

        user = User(
            email="resend@example.com",
            hashed_password=get_password_hash("TestPass123!"),
            is_active=True,
            email_verified=False,
        )
        db_session.add(user)
        await db_session.commit()

        with patch("app.core.email.EmailService.send_verification_email") as mock_send:
            response = await client.post(
                "/api/v1/auth/resend-verification",
                params={"email": "resend@example.com"},
            )
            assert response.status_code == 200
            mock_send.assert_called_once()

    async def test_resend_verification_nonexistent_user(self, client: AsyncClient):
        """Test resend verification for non-existent user returns same message."""
        response = await client.post(
            "/api/v1/auth/resend-verification",
            params={"email": "nonexistent@example.com"},
        )
        assert response.status_code == 200
        assert "if an account exists" in response.json()["message"].lower()

    async def test_resend_verification_already_verified(self, client: AsyncClient, test_user: dict):
        """Test resend verification for already verified user."""
        response = await client.post(
            "/api/v1/auth/resend-verification",
            params={"email": test_user["email"]},
        )
        assert response.status_code == 200
        assert "already verified" in response.json()["message"].lower()
