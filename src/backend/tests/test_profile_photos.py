"""Tests for profile photo upload endpoints."""

import io
from pathlib import Path
from unittest.mock import patch

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

# Test image data (small valid JPEG and PNG)
VALID_JPEG_BYTES = b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xd9'
VALID_PNG_BYTES = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x00IEND\xaeB`\x82'


class TestValidateImageMagicBytes:
    """Test image magic bytes validation function."""

    async def test_validate_jpeg_magic_bytes(self):
        """Test JPEG magic bytes detection."""
        from app.api.v1.endpoints.profile_photos import validate_image_magic_bytes

        result = validate_image_magic_bytes(VALID_JPEG_BYTES)
        assert result == "jpeg"

    async def test_validate_png_magic_bytes(self):
        """Test PNG magic bytes detection."""
        from app.api.v1.endpoints.profile_photos import validate_image_magic_bytes

        result = validate_image_magic_bytes(VALID_PNG_BYTES)
        assert result == "png"

    async def test_validate_invalid_magic_bytes(self):
        """Test invalid file magic bytes returns None."""
        from app.api.v1.endpoints.profile_photos import validate_image_magic_bytes

        result = validate_image_magic_bytes(b"This is not an image")
        assert result is None

    async def test_validate_empty_bytes(self):
        """Test empty file returns None."""
        from app.api.v1.endpoints.profile_photos import validate_image_magic_bytes

        result = validate_image_magic_bytes(b"")
        assert result is None


class TestProfilePhotoUpload:
    """Test profile photo upload endpoint."""

    async def test_upload_jpeg_photo(
        self, client: AsyncClient, auth_headers: dict, db_session: AsyncSession, test_user: dict
    ):
        """Test uploading a valid JPEG photo."""
        from app.db.models.profile import Profile
        from app.services.user_service import UserService

        # Get the actual user ID
        user = await UserService.get_by_email(db_session, test_user["email"])
        assert user is not None

        # Create a profile for the test user
        profile = Profile(
            name="Test Child",
            age=5,
            preferred_language="en",
            parent_id=user.id,
        )
        db_session.add(profile)
        await db_session.commit()
        await db_session.refresh(profile)

        # Create test file
        files = {"photo": ("test.jpg", io.BytesIO(VALID_JPEG_BYTES), "image/jpeg")}

        response = await client.post(
            f"/api/v1/api/v1/users/me/profiles/{profile.id}/photo",
            files=files,
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "avatar_url" in data
        assert "photo_updated_at" in data

    async def test_upload_png_photo(
        self, client: AsyncClient, auth_headers: dict, db_session: AsyncSession, test_user: dict
    ):
        """Test uploading a valid PNG photo."""
        from app.db.models.profile import Profile
        from app.services.user_service import UserService

        user = await UserService.get_by_email(db_session, test_user["email"])
        assert user is not None

        profile = Profile(
            name="Test Child 2",
            age=6,
            preferred_language="en",
            parent_id=user.id,
        )
        db_session.add(profile)
        await db_session.commit()
        await db_session.refresh(profile)

        files = {"photo": ("test.png", io.BytesIO(VALID_PNG_BYTES), "image/png")}

        response = await client.post(
            f"/api/v1/api/v1/users/me/profiles/{profile.id}/photo",
            files=files,
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "avatar_url" in data

    async def test_upload_photo_wrong_profile(
        self, client: AsyncClient, auth_headers: dict, db_session: AsyncSession
    ):
        """Test uploading photo to profile not owned by user fails."""
        from app.db.models.profile import Profile
        from uuid import uuid4

        # Create a user first
        from app.core.security import get_password_hash
        from app.db.models.user import User
        other_user = User(
            email=f"other_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(other_user)
        await db_session.commit()
        await db_session.refresh(other_user)

        # Create profile with different parent_id
        profile = Profile(
            name="Other Child",
            age=5,
            preferred_language="en",
            parent_id=other_user.id,
        )
        db_session.add(profile)
        await db_session.commit()
        await db_session.refresh(profile)

        files = {"photo": ("test.jpg", io.BytesIO(VALID_JPEG_BYTES), "image/jpeg")}

        response = await client.post(
            f"/api/v1/api/v1/users/me/profiles/{profile.id}/photo",
            files=files,
            headers=auth_headers,
        )

        assert response.status_code == 403
        assert "access denied" in response.json()["detail"].lower()

    async def test_upload_photo_nonexistent_profile(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test uploading photo to non-existent profile fails."""
        from uuid import uuid4

        files = {"photo": ("test.jpg", io.BytesIO(VALID_JPEG_BYTES), "image/jpeg")}

        response = await client.post(
            f"/api/v1/api/v1/users/me/profiles/{str(uuid4())}/photo",
            files=files,
            headers=auth_headers,
        )

        assert response.status_code == 403

    async def test_upload_photo_no_auth(self, client: AsyncClient):
        """Test uploading photo without authentication fails."""
        files = {"photo": ("test.jpg", io.BytesIO(VALID_JPEG_BYTES), "image/jpeg")}

        response = await client.post(
            "/api/v1/api/v1/users/me/profiles/some-id/photo",
            files=files,
        )

        assert response.status_code == 401

    async def test_upload_photo_invalid_file_type(
        self, client: AsyncClient, auth_headers: dict, db_session: AsyncSession, test_user: dict
    ):
        """Test uploading non-image file fails."""
        from app.db.models.profile import Profile
        from app.services.user_service import UserService

        user = await UserService.get_by_email(db_session, test_user["email"])
        assert user is not None

        profile = Profile(
            name="Test Child",
            age=5,
            preferred_language="en",
            parent_id=user.id,
        )
        db_session.add(profile)
        await db_session.commit()
        await db_session.refresh(profile)

        # Try to upload a text file
        files = {"photo": ("test.txt", io.BytesIO(b"This is not an image"), "text/plain")}

        response = await client.post(
            f"/api/v1/api/v1/users/me/profiles/{profile.id}/photo",
            files=files,
            headers=auth_headers,
        )

        assert response.status_code == 415
        assert "invalid file type" in response.json()["detail"].lower()

    async def test_upload_photo_spoofed_content_type(
        self, client: AsyncClient, auth_headers: dict, db_session: AsyncSession, test_user: dict
    ):
        """Test that magic bytes validation catches spoofed content type."""
        from app.db.models.profile import Profile
        from app.services.user_service import UserService

        user = await UserService.get_by_email(db_session, test_user["email"])
        assert user is not None

        profile = Profile(
            name="Test Child",
            age=5,
            preferred_language="en",
            parent_id=user.id,
        )
        db_session.add(profile)
        await db_session.commit()
        await db_session.refresh(profile)

        # Try to upload text file claiming to be JPEG
        files = {"photo": ("spoof.jpg", io.BytesIO(b"This is not a JPEG"), "image/jpeg")}

        response = await client.post(
            f"/api/v1/api/v1/users/me/profiles/{profile.id}/photo",
            files=files,
            headers=auth_headers,
        )

        assert response.status_code == 415
        assert "invalid image" in response.json()["detail"].lower()

    async def test_upload_photo_too_large(
        self, client: AsyncClient, auth_headers: dict, db_session: AsyncSession, test_user: dict
    ):
        """Test uploading oversized file fails."""
        from app.db.models.profile import Profile
        from app.services.user_service import UserService

        user = await UserService.get_by_email(db_session, test_user["email"])
        assert user is not None

        profile = Profile(
            name="Test Child",
            age=5,
            preferred_language="en",
            parent_id=user.id,
        )
        db_session.add(profile)
        await db_session.commit()
        await db_session.refresh(profile)

        # Create a large fake JPEG (> 2MB)
        large_content = b'\xff\xd8\xff' + b'\x00' * (3 * 1024 * 1024)  # 3MB
        files = {"photo": ("large.jpg", io.BytesIO(large_content), "image/jpeg")}

        response = await client.post(
            f"/api/v1/api/v1/users/me/profiles/{profile.id}/photo",
            files=files,
            headers=auth_headers,
        )

        assert response.status_code == 413
        assert "too large" in response.json()["detail"].lower()


class TestProfilePhotoGet:
    """Test get profile photo endpoint."""

    async def test_get_profile_photo(
        self, client: AsyncClient, auth_headers: dict, db_session: AsyncSession, test_user: dict
    ):
        """Test getting profile photo URL."""
        from app.db.models.profile import Profile
        from app.services.user_service import UserService

        user = await UserService.get_by_email(db_session, test_user["email"])
        assert user is not None

        profile = Profile(
            name="Test Child",
            age=5,
            preferred_language="en",
            avatar_url="/api/v1/api/v1/users/me/profiles/test/photos/test.jpg",
            parent_id=user.id,
        )
        db_session.add(profile)
        await db_session.commit()
        await db_session.refresh(profile)

        response = await client.get(
            f"/api/v1/api/v1/users/me/profiles/{profile.id}/photo",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "avatar_url" in data

    async def test_get_profile_photo_wrong_user(
        self, client: AsyncClient, auth_headers: dict, db_session: AsyncSession
    ):
        """Test getting photo of profile not owned by user fails."""
        from app.db.models.profile import Profile
        from app.db.models.user import User
        from app.core.security import get_password_hash
        from uuid import uuid4

        other_user = User(
            email=f"other_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(other_user)
        await db_session.commit()
        await db_session.refresh(other_user)

        profile = Profile(
            name="Other Child",
            age=5,
            preferred_language="en",
            parent_id=other_user.id,
        )
        db_session.add(profile)
        await db_session.commit()
        await db_session.refresh(profile)

        response = await client.get(
            f"/api/v1/api/v1/users/me/profiles/{profile.id}/photo",
            headers=auth_headers,
        )

        assert response.status_code == 403

    async def test_get_profile_photo_no_auth(self, client: AsyncClient):
        """Test getting photo without auth fails."""
        response = await client.get("/api/v1/api/v1/users/me/profiles/some-id/photo")
        assert response.status_code == 401


class TestProfilePhotoDelete:
    """Test delete profile photo endpoint."""

    async def test_delete_profile_photo(
        self, client: AsyncClient, auth_headers: dict, db_session: AsyncSession, test_user: dict
    ):
        """Test deleting profile photo."""
        from app.db.models.profile import Profile
        from app.services.user_service import UserService

        user = await UserService.get_by_email(db_session, test_user["email"])
        assert user is not None

        profile = Profile(
            name="Test Child",
            age=5,
            preferred_language="en",
            avatar_url="/api/v1/api/v1/users/me/profiles/test/photos/test.jpg",
            parent_id=user.id,
        )
        db_session.add(profile)
        await db_session.commit()
        await db_session.refresh(profile)

        response = await client.delete(
            f"/api/v1/api/v1/users/me/profiles/{profile.id}/photo",
            headers=auth_headers,
        )

        assert response.status_code == 200
        assert "deleted" in response.json()["message"].lower()

    async def test_delete_profile_photo_wrong_user(
        self, client: AsyncClient, auth_headers: dict, db_session: AsyncSession
    ):
        """Test deleting photo of profile not owned by user fails."""
        from app.db.models.profile import Profile
        from app.db.models.user import User
        from app.core.security import get_password_hash
        from uuid import uuid4

        other_user = User(
            email=f"other_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(other_user)
        await db_session.commit()
        await db_session.refresh(other_user)

        profile = Profile(
            name="Other Child",
            age=5,
            preferred_language="en",
            parent_id=other_user.id,
        )
        db_session.add(profile)
        await db_session.commit()
        await db_session.refresh(profile)

        response = await client.delete(
            f"/api/v1/api/v1/users/me/profiles/{profile.id}/photo",
            headers=auth_headers,
        )

        assert response.status_code == 403

    async def test_delete_profile_photo_no_auth(self, client: AsyncClient):
        """Test deleting photo without auth fails."""
        response = await client.delete("/api/v1/api/v1/users/me/profiles/some-id/photo")
        assert response.status_code == 401
