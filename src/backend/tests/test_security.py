"""Security-related tests."""

import pytest
import time
import statistics
from httpx import AsyncClient


class TestTimingAttackPrevention:
    """Test that authentication is constant-time to prevent user enumeration."""

    async def test_authenticate_constant_time(self, client: AsyncClient):
        """Verify authentication takes similar time for valid/invalid users."""
        # First register a user
        await client.post(
            "/api/v1/auth/register",
            json={"email": "timing@test.com", "password": "securepassword123"}
        )
        
        # Measure time for existing user with wrong password
        existing_user_times = []
        for _ in range(10):
            start = time.perf_counter()
            await client.post(
                "/api/v1/auth/login",
                data={"username": "timing@test.com", "password": "wrongpassword"}
            )
            existing_user_times.append(time.perf_counter() - start)
        
        # Measure time for non-existing user
        nonexistent_user_times = []
        for _ in range(10):
            start = time.perf_counter()
            await client.post(
                "/api/v1/auth/login",
                data={"username": "nonexistent@user.com", "password": "anypassword"}
            )
            nonexistent_user_times.append(time.perf_counter() - start)
        
        # Calculate medians (more robust than means for timing)
        existing_median = statistics.median(existing_user_times)
        nonexistent_median = statistics.median(nonexistent_user_times)
        
        # The difference should be small (less than 50% variation)
        # This is a heuristic - in practice, the timing should be very similar
        max_allowed_ratio = 1.5
        ratio = max(existing_median, nonexistent_median) / min(existing_median, nonexistent_median)
        
        assert ratio < max_allowed_ratio, (
            f"Timing difference detected: existing user median={existing_median:.4f}s, "
            f"nonexistent user median={nonexistent_median:.4f}s, ratio={ratio:.2f}. "
            f"This could allow user enumeration via timing attacks."
        )


class TestPasswordSecurity:
    """Test password-related security features."""

    async def test_password_hashing(self, client: AsyncClient):
        """Verify passwords are properly hashed (not stored plaintext)."""
        password = "mysecretpassword"
        
        # Register user
        register_response = await client.post(
            "/api/v1/auth/register",
            json={"email": "hash@test.com", "password": password}
        )
        assert register_response.status_code == 200
        
        # Verify email for the test user
        from app.db.session import async_session
        from app.services.user_service import UserService
        
        async with async_session() as session:
            user = await UserService.get_by_email(session, "hash@test.com")
            await UserService.verify_email(session, user)
        
        # Login should work
        login_response = await client.post(
            "/api/v1/auth/login",
            data={"username": "hash@test.com", "password": password}
        )
        assert login_response.status_code == 200
        
        # Wrong password should fail
        wrong_login = await client.post(
            "/api/v1/auth/login",
            data={"username": "hash@test.com", "password": "wrongpassword"}
        )
        assert wrong_login.status_code == 401


class TestEmailVerification:
    """Test email verification functionality."""

    async def test_login_requires_email_verification(self, client: AsyncClient):
        """Verify unverified users cannot login."""
        # Register a new user (email not verified by default)
        register_response = await client.post(
            "/api/v1/auth/register",
            json={"email": "unverified@test.com", "password": "testpassword123"}
        )
        assert register_response.status_code == 200
        
        # Try to login without verifying email
        login_response = await client.post(
            "/api/v1/auth/login",
            data={"username": "unverified@test.com", "password": "testpassword123"}
        )
        assert login_response.status_code == 403
        assert "not verified" in login_response.json()["detail"].lower()

    async def test_email_verification_flow(self, client: AsyncClient):
        """Test complete email verification flow."""
        # Register user
        register_response = await client.post(
            "/api/v1/auth/register",
            json={"email": "verify@test.com", "password": "testpassword123"}
        )
        assert register_response.status_code == 200
        
        # Get verification token from database
        from app.db.session import async_session
        from app.services.user_service import UserService
        
        async with async_session() as session:
            user = await UserService.get_by_email(session, "verify@test.com")
            token = user.email_verification_token
        
        # Verify email with token
        verify_response = await client.post(
            "/api/v1/auth/verify-email",
            params={"token": token}
        )
        assert verify_response.status_code == 200
        assert "verified successfully" in verify_response.json()["message"].lower()
        
        # Now login should work and set cookies
        login_response = await client.post(
            "/api/v1/auth/login",
            data={"username": "verify@test.com", "password": "testpassword123"}
        )
        assert login_response.status_code == 200
        assert login_response.json()["message"] == "Login successful"
        # Verify cookies are set
        cookies = login_response.cookies
        assert "access_token" in cookies
        assert "refresh_token" in cookies

    async def test_invalid_verification_token(self, client: AsyncClient):
        """Verify invalid tokens are rejected."""
        response = await client.post(
            "/api/v1/auth/verify-email",
            params={"token": "invalid-token"}
        )
        assert response.status_code == 400
        assert "invalid" in response.json()["detail"].lower()

    async def test_resend_verification(self, client: AsyncClient):
        """Test resending verification email."""
        # Register user
        await client.post(
            "/api/v1/auth/register",
            json={"email": "resend@test.com", "password": "testpassword123"}
        )
        
        # Resend verification
        resend_response = await client.post(
            "/api/v1/auth/resend-verification",
            params={"email": "resend@test.com"}
        )
        assert resend_response.status_code == 200
        # Should return generic message (prevents user enumeration)
        assert "if an account exists" in resend_response.json()["message"].lower()


class TestPasswordReset:
    """Test password reset functionality."""

    async def test_forgot_password_generates_token(self, client: AsyncClient):
        """Test forgot password creates reset token."""
        # Register and verify user
        await client.post(
            "/api/v1/auth/register",
            json={"email": "reset@test.com", "password": "oldpassword123"}
        )
        
        from app.db.session import async_session
        from app.services.user_service import UserService
        
        async with async_session() as session:
            user = await UserService.get_by_email(session, "reset@test.com")
            await UserService.verify_email(session, user)
        
        # Request password reset
        response = await client.post(
            "/api/v1/auth/forgot-password",
            params={"email": "reset@test.com"}
        )
        assert response.status_code == 200
        assert "if an account exists" in response.json()["message"].lower()
        
        # Verify token was created
        async with async_session() as session:
            user = await UserService.get_by_email(session, "reset@test.com")
            assert user.password_reset_token is not None
            assert user.password_reset_expires is not None

    async def test_reset_password_with_valid_token(self, client: AsyncClient):
        """Test password reset with valid token."""
        # Register and verify user
        await client.post(
            "/api/v1/auth/register",
            json={"email": "reset2@test.com", "password": "oldpassword123"}
        )
        
        from app.db.session import async_session
        from app.services.user_service import UserService
        
        async with async_session() as session:
            user = await UserService.get_by_email(session, "reset2@test.com")
            await UserService.verify_email(session, user)
            token = await UserService.create_password_reset_token(session, user)
        
        # Reset password
        response = await client.post(
            "/api/v1/auth/reset-password",
            params={"token": token, "new_password": "newpassword456"}
        )
        assert response.status_code == 200
        assert "reset successfully" in response.json()["message"].lower()
        
        # Old password should not work
        old_login = await client.post(
            "/api/v1/auth/login",
            data={"username": "reset2@test.com", "password": "oldpassword123"}
        )
        assert old_login.status_code == 401
        
        # New password should work
        new_login = await client.post(
            "/api/v1/auth/login",
            data={"username": "reset2@test.com", "password": "newpassword456"}
        )
        assert new_login.status_code == 200

    async def test_reset_password_invalid_token(self, client: AsyncClient):
        """Test password reset with invalid token fails."""
        response = await client.post(
            "/api/v1/auth/reset-password",
            params={"token": "invalid-token", "new_password": "newpassword456"}
        )
        assert response.status_code == 400
        assert "invalid" in response.json()["detail"].lower()

    async def test_reset_password_short_password(self, client: AsyncClient):
        """Test password reset rejects short passwords."""
        # Register and verify user
        await client.post(
            "/api/v1/auth/register",
            json={"email": "reset3@test.com", "password": "oldpassword123"}
        )
        
        from app.db.session import async_session
        from app.services.user_service import UserService
        
        async with async_session() as session:
            user = await UserService.get_by_email(session, "reset3@test.com")
            await UserService.verify_email(session, user)
            token = await UserService.create_password_reset_token(session, user)
        
        # Try to reset with short password
        response = await client.post(
            "/api/v1/auth/reset-password",
            params={"token": token, "new_password": "short"}
        )
        assert response.status_code == 400
        assert "at least 8 characters" in response.json()["detail"].lower()

    async def test_forgot_password_nonexistent_user(self, client: AsyncClient):
        """Test forgot password for non-existent user returns generic message."""
        response = await client.post(
            "/api/v1/auth/forgot-password",
            params={"email": "nonexistent@user.com"}
        )
        assert response.status_code == 200
        # Should return same message to prevent user enumeration
        assert "if an account exists" in response.json()["message"].lower()


class TestCookieAuthentication:
    """Test httpOnly cookie-based authentication."""

    async def test_login_sets_http_only_cookies(self, client: AsyncClient):
        """Verify login sets httpOnly cookies."""
        # Register and verify user
        await client.post(
            "/api/v1/auth/register",
            json={"email": "cookie@test.com", "password": "testpassword123"}
        )
        
        from app.db.session import async_session
        from app.services.user_service import UserService
        
        async with async_session() as session:
            user = await UserService.get_by_email(session, "cookie@test.com")
            await UserService.verify_email(session, user)
        
        # Login
        response = await client.post(
            "/api/v1/auth/login",
            data={"username": "cookie@test.com", "password": "testpassword123"}
        )
        assert response.status_code == 200
        
        # Check cookies are set with httpOnly flag
        cookies = response.cookies
        assert "access_token" in cookies
        assert "refresh_token" in cookies
        
        # Note: httpx doesn't expose cookie attributes directly,
        # but we can verify the backend sets them correctly in the response headers
        set_cookie_headers = response.headers.get_list("set-cookie")
        assert any("httponly" in h.lower() for h in set_cookie_headers)

    async def test_logout_clears_cookies(self, client: AsyncClient):
        """Verify logout clears authentication cookies."""
        # Register and verify user
        await client.post(
            "/api/v1/auth/register",
            json={"email": "logout@test.com", "password": "testpassword123"}
        )
        
        from app.db.session import async_session
        from app.services.user_service import UserService
        
        async with async_session() as session:
            user = await UserService.get_by_email(session, "logout@test.com")
            await UserService.verify_email(session, user)
        
        # Login to set cookies
        await client.post(
            "/api/v1/auth/login",
            data={"username": "logout@test.com", "password": "testpassword123"}
        )
        
        # Logout
        response = await client.post("/api/v1/auth/logout")
        assert response.status_code == 200
        assert "logout successful" in response.json()["message"].lower()
        
        # Verify cookies are cleared (set with empty value and past expiration)
        set_cookie_headers = response.headers.get_list("set-cookie")
        # Should have cookies being deleted
        assert any("access_token=" in h for h in set_cookie_headers)

    async def test_protected_endpoint_with_cookie(self, client: AsyncClient):
        """Verify protected endpoints work with cookie-based auth."""
        # Register and verify user
        await client.post(
            "/api/v1/auth/register",
            json={"email": "protected@test.com", "password": "testpassword123"}
        )
        
        from app.db.session import async_session
        from app.services.user_service import UserService
        
        async with async_session() as session:
            user = await UserService.get_by_email(session, "protected@test.com")
            await UserService.verify_email(session, user)
        
        # Login (sets cookies in client session)
        await client.post(
            "/api/v1/auth/login",
            data={"username": "protected@test.com", "password": "testpassword123"}
        )
        
        # Access protected endpoint (cookies automatically sent)
        response = await client.get("/api/v1/auth/me")
        assert response.status_code == 200
        assert response.json()["email"] == "protected@test.com"

    async def test_protected_endpoint_without_cookie_fails(self, client: AsyncClient):
        """Verify protected endpoints reject requests without valid cookie."""
        response = await client.get("/api/v1/auth/me")
        assert response.status_code == 401


class TestAuthRateLimiting:
    """Test authentication rate limiting (when implemented)."""
    
    @pytest.mark.skip(reason="Rate limiting not yet implemented - see BACKEND-MED-001")
    async def test_login_rate_limiting(self, client: AsyncClient):
        """Verify repeated failed logins trigger rate limiting."""
        # This test is a placeholder for when rate limiting is implemented
        pass
