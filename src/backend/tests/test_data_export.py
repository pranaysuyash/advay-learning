"""Tests for data export endpoints and service (GDPR/COPPA compliance)."""

from unittest.mock import patch

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


class TestDataExportEndpoints:
    """Test data export API endpoints."""

    async def test_export_user_data_json(self, client: AsyncClient, auth_headers: dict):
        """Test exporting user data in JSON format."""
        response = await client.get(
            "/api/v1/export/export",
            params={"format": "json", "include_progress": True, "include_subscriptions": True},
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "export_id" in data
        assert "generated_at" in data
        assert "user" in data
        assert "profiles" in data
        assert "progress" in data
        assert "subscriptions" in data
        
        # Verify user data
        assert "id" in data["user"]
        assert "email" in data["user"]
        assert "role" in data["user"]

    async def test_export_user_data_csv(self, client: AsyncClient, auth_headers: dict):
        """Test downloading user data in CSV format."""
        response = await client.get(
            "/api/v1/export/export/download",
            params={"format": "csv", "include_progress": True, "include_subscriptions": True},
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        assert "text/csv" in response.headers["content-type"]
        assert "attachment" in response.headers["content-disposition"]
        assert ".csv" in response.headers["content-disposition"]
        
        # Verify CSV content
        content = response.content.decode("utf-8")
        assert "USER INFORMATION" in content
        assert "PROFILES" in content

    async def test_export_user_data_json_download(self, client: AsyncClient, auth_headers: dict):
        """Test downloading user data in JSON format."""
        response = await client.get(
            "/api/v1/export/export/download",
            params={"format": "json"},
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"
        assert "attachment" in response.headers["content-disposition"]
        assert ".json" in response.headers["content-disposition"]

    async def test_export_user_data_no_auth(self, client: AsyncClient):
        """Test exporting data without authentication fails."""
        response = await client.get("/api/v1/export/export")
        assert response.status_code == 401

    async def test_export_user_data_download_no_auth(self, client: AsyncClient):
        """Test downloading export without authentication fails."""
        response = await client.get("/api/v1/export/export/download")
        assert response.status_code == 401

    async def test_export_user_data_excludes_progress(self, client: AsyncClient, auth_headers: dict):
        """Test exporting data without progress."""
        response = await client.get(
            "/api/v1/export/export",
            params={"include_progress": False, "include_subscriptions": True},
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        # Progress should be empty list
        assert data["progress"] == []

    async def test_export_user_data_excludes_subscriptions(self, client: AsyncClient, auth_headers: dict):
        """Test exporting data without subscriptions."""
        response = await client.get(
            "/api/v1/export/export",
            params={"include_progress": True, "include_subscriptions": False},
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        # Subscriptions should be empty list
        assert data["subscriptions"] == []


class TestDataExportSummary:
    """Test data export summary endpoint."""

    async def test_get_export_summary(self, client: AsyncClient, auth_headers: dict):
        """Test getting export summary."""
        response = await client.get(
            "/api/v1/export/export/summary",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify summary structure
        assert "profile_count" in data
        assert "progress_count" in data
        assert "subscription_count" in data
        
        # Counts should be non-negative integers
        assert isinstance(data["profile_count"], int)
        assert isinstance(data["progress_count"], int)
        assert isinstance(data["subscription_count"], int)
        assert data["profile_count"] >= 0
        assert data["progress_count"] >= 0
        assert data["subscription_count"] >= 0

    async def test_get_export_summary_no_auth(self, client: AsyncClient):
        """Test getting summary without authentication fails."""
        response = await client.get("/api/v1/export/export/summary")
        assert response.status_code == 401


class TestDataExportRequest:
    """Test POST export request endpoint."""

    async def test_request_export_json(self, client: AsyncClient, auth_headers: dict):
        """Test requesting export in JSON format."""
        response = await client.post(
            "/api/v1/export/export",
            json={
                "format": "json",
                "include_progress": True,
                "include_subscriptions": True,
            },
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "export_id" in data
        assert "user" in data

    async def test_request_export_csv(self, client: AsyncClient, auth_headers: dict):
        """Test requesting export with CSV format preference."""
        response = await client.post(
            "/api/v1/export/export",
            json={
                "format": "csv",
                "include_progress": True,
                "include_subscriptions": True,
            },
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "export_id" in data

    async def test_request_export_invalid_format(self, client: AsyncClient, auth_headers: dict):
        """Test requesting export with invalid format fails."""
        response = await client.post(
            "/api/v1/export/export",
            json={
                "format": "xml",  # Invalid format
                "include_progress": True,
                "include_subscriptions": True,
            },
            headers=auth_headers,
        )
        
        assert response.status_code == 422
        assert "format" in response.json()["detail"].lower() or "json" in response.json()["detail"].lower()

    async def test_request_export_no_auth(self, client: AsyncClient):
        """Test requesting export without authentication fails."""
        response = await client.post(
            "/api/v1/export/export",
            json={"format": "json"},
        )
        assert response.status_code == 401


class TestDataExportService:
    """Test data export service directly."""

    async def test_export_user_data_complete(self, db_session: AsyncSession, test_user: dict):
        """Test complete data export via service."""
        from app.services.data_export_service import DataExportService
        from app.services.user_service import UserService

        # Get the actual user ID
        user = await UserService.get_by_email(db_session, test_user["email"])
        assert user is not None

        export_data = await DataExportService.export_user_data(
            db=db_session,
            user_id=user.id,
            include_progress=True,
            include_subscriptions=True,
        )

        # Verify export structure
        assert export_data.export_id is not None
        assert export_data.generated_at is not None
        assert export_data.user is not None
        assert export_data.user.email == test_user["email"]
        assert isinstance(export_data.profiles, list)
        assert isinstance(export_data.progress, list)
        assert isinstance(export_data.subscriptions, list)

    async def test_export_user_data_no_progress(self, db_session: AsyncSession, test_user: dict):
        """Test export excluding progress data."""
        from app.services.data_export_service import DataExportService
        from app.services.user_service import UserService

        user = await UserService.get_by_email(db_session, test_user["email"])
        assert user is not None

        export_data = await DataExportService.export_user_data(
            db=db_session,
            user_id=user.id,
            include_progress=False,
            include_subscriptions=True,
        )

        assert export_data.progress == []

    async def test_export_user_data_no_subscriptions(self, db_session: AsyncSession, test_user: dict):
        """Test export excluding subscription data."""
        from app.services.data_export_service import DataExportService
        from app.services.user_service import UserService

        user = await UserService.get_by_email(db_session, test_user["email"])
        assert user is not None

        export_data = await DataExportService.export_user_data(
            db=db_session,
            user_id=user.id,
            include_progress=True,
            include_subscriptions=False,
        )

        assert export_data.subscriptions == []

    async def test_get_data_summary(self, db_session: AsyncSession, test_user: dict):
        """Test data summary via service."""
        from app.services.data_export_service import DataExportService
        from app.services.user_service import UserService

        user = await UserService.get_by_email(db_session, test_user["email"])
        assert user is not None

        summary = await DataExportService.get_data_summary(
            db=db_session,
            user_id=user.id,
        )

        assert "profile_count" in summary
        assert "progress_count" in summary
        assert "subscription_count" in summary


class TestDataExportAuthorization:
    """Test data export authorization (users can only export own data)."""

    async def test_user_can_only_export_own_data(
        self, client: AsyncClient, auth_headers: dict, test_user: dict
    ):
        """Test that users can only access their own export data.
        
        This is implicitly tested by the get_current_user dependency
        which ensures the user can only export their own data.
        """
        # The auth_headers are tied to test_user
        # Any export request should only return test_user's data
        response = await client.get(
            "/api/v1/export/export",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify the exported data belongs to the authenticated user
        assert data["user"]["email"] == test_user["email"]


class TestDataExportCSVGeneration:
    """Test CSV generation functionality."""

    async def test_csv_generation(self, db_session: AsyncSession, test_user: dict):
        """Test CSV content generation."""
        from app.api.v1.endpoints.data_export import _generate_csv
        from app.services.data_export_service import DataExportService
        from app.services.user_service import UserService

        user = await UserService.get_by_email(db_session, test_user["email"])
        assert user is not None

        export_data = await DataExportService.export_user_data(
            db=db_session,
            user_id=user.id,
            include_progress=True,
            include_subscriptions=True,
        )

        csv_content = _generate_csv(export_data)

        # Verify CSV structure
        assert "USER INFORMATION" in csv_content
        assert "PROFILES" in csv_content
        assert test_user["email"] in csv_content

    async def test_csv_generation_with_data(self, client: AsyncClient, auth_headers: dict):
        """Test CSV download contains expected structure."""
        response = await client.get(
            "/api/v1/export/export/download",
            params={"format": "csv"},
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        content = response.content.decode("utf-8")
        
        # CSV should have sections
        lines = content.strip().split("\n")
        assert len(lines) > 0
        
        # Should contain user info section
        assert any("USER INFORMATION" in line for line in lines)
        assert any("PROFILES" in line for line in lines)
