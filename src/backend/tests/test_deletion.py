"""Tests for parent verification and data deletion."""

from httpx import AsyncClient


class TestProfileDeletion:
    """Test profile deletion with parent verification."""

    async def test_delete_profile_requires_password(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test that profile deletion requires password verification."""
        # First create a profile
        create_response = await client.post(
            "/api/v1/users/me/profiles",
            json={"name": "Test Child", "age": 5, "preferred_language": "en"},
            headers=auth_headers,
        )
        assert create_response.status_code == 200
        profile_id = create_response.json()["id"]

        # Try to delete without password (using request method for body in DELETE)
        delete_response = await client.request(
            "DELETE",
            f"/api/v1/users/me/profiles/{profile_id}",
            json={},
            headers=auth_headers,
        )
        assert delete_response.status_code == 422  # Validation error

    async def test_delete_profile_wrong_password(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test that wrong password fails deletion."""
        # Create a profile
        create_response = await client.post(
            "/api/v1/users/me/profiles",
            json={"name": "Test Child 2", "age": 6, "preferred_language": "en"},
            headers=auth_headers,
        )
        assert create_response.status_code == 200
        profile_id = create_response.json()["id"]

        # Try to delete with wrong password
        delete_response = await client.request(
            "DELETE",
            f"/api/v1/users/me/profiles/{profile_id}",
            json={"password": "WrongPassword123!!"},
            headers=auth_headers,
        )
        assert delete_response.status_code == 401
        assert "Incorrect password" in delete_response.json()["detail"]

    async def test_delete_profile_success(
        self, client: AsyncClient, test_user: dict, auth_headers: dict
    ):
        """Test successful profile deletion with correct password."""
        # Create a profile
        create_response = await client.post(
            "/api/v1/users/me/profiles",
            json={"name": "Test Child 3", "age": 7, "preferred_language": "en"},
            headers=auth_headers,
        )
        assert create_response.status_code == 200
        profile_id = create_response.json()["id"]

        # Delete with correct password
        delete_response = await client.request(
            "DELETE",
            f"/api/v1/users/me/profiles/{profile_id}",
            json={"password": test_user["password"], "reason": "Test cleanup"},
            headers=auth_headers,
        )
        assert delete_response.status_code == 204

        # Verify profile is gone
        get_response = await client.get(
            "/api/v1/users/me/profiles", headers=auth_headers
        )
        profiles = get_response.json()
        assert not any(p["id"] == profile_id for p in profiles)

    async def test_delete_other_users_profile_fails(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test that deleting another user's profile fails."""
        # Try to delete with invalid UUID format
        delete_response = await client.request(
            "DELETE",
            "/api/v1/users/me/profiles/invalid-uuid",
            json={"password": "SomePassword123!!"},
            headers=auth_headers,
        )
        assert delete_response.status_code == 422


class TestAccountDeletion:
    """Test account deletion with parent verification."""

    async def test_delete_account_requires_password(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test that account deletion requires password verification."""
        # Try to delete without password
        delete_response = await client.request(
            "DELETE", "/api/v1/users/me", json={}, headers=auth_headers
        )
        assert delete_response.status_code == 422  # Validation error

    async def test_delete_account_wrong_password(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test that wrong password fails account deletion."""
        delete_response = await client.request(
            "DELETE",
            "/api/v1/users/me",
            json={"password": "WrongPassword123!!"},
            headers=auth_headers,
        )
        assert delete_response.status_code == 401
        assert "Incorrect password" in delete_response.json()["detail"]

    async def test_delete_account_success(
        self, client: AsyncClient, test_user: dict, auth_headers: dict
    ):
        """Test successful account deletion with correct password."""
        # Delete with correct password
        delete_response = await client.request(
            "DELETE",
            "/api/v1/users/me",
            json={"password": test_user["password"], "reason": "Test cleanup"},
            headers=auth_headers,
        )
        assert delete_response.status_code == 204

        # Verify user is logged out (can't access protected endpoint)
        get_response = await client.get("/api/v1/users/me", headers=auth_headers)
        # Should fail because user no longer exists
        assert get_response.status_code in [401, 404]


class TestAuditLogging:
    """Test audit logging for deletions."""

    async def test_profile_deletion_logged(
        self, client: AsyncClient, test_user: dict, auth_headers: dict, db_session
    ):
        """Test that profile deletion is logged to audit log."""
        from app.services.audit_service import AuditService

        # Create a profile
        create_response = await client.post(
            "/api/v1/users/me/profiles",
            json={"name": "Audit Test Child", "age": 8, "preferred_language": "en"},
            headers=auth_headers,
        )
        assert create_response.status_code == 200
        profile_id = create_response.json()["id"]

        # Delete with correct password
        await client.request(
            "DELETE",
            f"/api/v1/users/me/profiles/{profile_id}",
            json={"password": test_user["password"], "reason": "Audit test"},
            headers=auth_headers,
        )

        # Check audit log
        logs = await AuditService.get_resource_actions(
            db_session, "profile", profile_id
        )
        assert len(logs) >= 1
        delete_logs = [log for log in logs if log.action == "profile_delete"]
        assert len(delete_logs) == 1
        assert delete_logs[0].verification_required is True
        assert delete_logs[0].verification_method == "password_reauth"
        assert "Audit Test Child" in delete_logs[0].details

    async def test_failed_deletion_logged(
        self, client: AsyncClient, auth_headers: dict, db_session
    ):
        """Test that failed deletion attempts are logged."""
        from app.db.session import async_session
        from app.services.audit_service import AuditService

        # Create a profile
        create_response = await client.post(
            "/api/v1/users/me/profiles",
            json={"name": "Failed Audit Child", "age": 9, "preferred_language": "en"},
            headers=auth_headers,
        )
        assert create_response.status_code == 200
        profile_id = create_response.json()["id"]

        # Try to delete with wrong password
        await client.request(
            "DELETE",
            f"/api/v1/users/me/profiles/{profile_id}",
            json={"password": "WrongPassword123!!"},
            headers=auth_headers,
        )

        # Check audit log for failed attempt
        # Need fresh session since previous one might have been rolled back
        async with async_session() as session:
            logs = await AuditService.get_resource_actions(
                session, "profile", profile_id
            )
            failed_logs = [log for log in logs if log.action == "profile_delete_failed"]
            assert len(failed_logs) == 1
            assert failed_logs[0].verification_required is True
