"""Tests for refresh token service."""

from datetime import datetime, timedelta
from uuid import uuid4

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.refresh_token import RefreshToken
from app.db.models.user import User


class TestRefreshTokenService:
    """Test refresh token service."""

    async def test_create_refresh_token(self, db_session: AsyncSession):
        """Test creating a refresh token."""
        from app.services.refresh_token_service import RefreshTokenService
        from app.core.security import get_password_hash

        # Create user
        user = User(
            email=f"rt_test_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Create refresh token
        token = await RefreshTokenService.create_refresh_token(db_session, user.id)

        assert token is not None
        assert token.user_id == user.id
        assert token.token is not None
        assert len(token.token) > 0
        assert token.expires_at > datetime.utcnow()

    async def test_validate_refresh_token_valid(self, db_session: AsyncSession):
        """Test validating a valid refresh token."""
        from app.services.refresh_token_service import RefreshTokenService
        from app.core.security import get_password_hash

        user = User(
            email=f"rt_valid_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Create token
        token_obj = await RefreshTokenService.create_refresh_token(db_session, user.id)

        # Validate token
        is_valid = await RefreshTokenService.validate_refresh_token(
            db_session, token_obj.token, user
        )

        assert is_valid is True

    async def test_validate_refresh_token_invalid(self, db_session: AsyncSession):
        """Test validating an invalid refresh token."""
        from app.services.refresh_token_service import RefreshTokenService
        from app.core.security import get_password_hash

        user = User(
            email=f"rt_invalid_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Validate non-existent token
        is_valid = await RefreshTokenService.validate_refresh_token(
            db_session, "invalid_token", user
        )

        assert is_valid is False

    async def test_validate_refresh_token_wrong_user(self, db_session: AsyncSession):
        """Test validating token for wrong user."""
        from app.services.refresh_token_service import RefreshTokenService
        from app.core.security import get_password_hash

        user1 = User(
            email=f"rt_user1_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        user2 = User(
            email=f"rt_user2_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(user1)
        db_session.add(user2)
        await db_session.commit()
        await db_session.refresh(user1)
        await db_session.refresh(user2)

        # Create token for user1
        token_obj = await RefreshTokenService.create_refresh_token(db_session, user1.id)

        # Validate with user2
        is_valid = await RefreshTokenService.validate_refresh_token(
            db_session, token_obj.token, user2
        )

        assert is_valid is False

    async def test_revoke_refresh_token(self, db_session: AsyncSession):
        """Test revoking a refresh token."""
        from app.services.refresh_token_service import RefreshTokenService
        from app.core.security import get_password_hash

        user = User(
            email=f"rt_revoke_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Create and revoke token
        token_obj = await RefreshTokenService.create_refresh_token(db_session, user.id)
        await RefreshTokenService.revoke_refresh_token(db_session, token_obj.token)

        # Validate revoked token
        is_valid = await RefreshTokenService.validate_refresh_token(
            db_session, token_obj.token, user
        )

        assert is_valid is False

    async def test_validate_expired_token(self, db_session: AsyncSession):
        """Test validating an expired refresh token."""
        from app.services.refresh_token_service import RefreshTokenService
        from app.core.security import get_password_hash

        user = User(
            email=f"rt_expired_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Create expired token manually
        expired_token = RefreshToken(
            id=str(uuid4()),
            user_id=user.id,
            token=f"expired_{uuid4()}",
            expires_at=datetime.utcnow() - timedelta(days=1),
        )
        db_session.add(expired_token)
        await db_session.commit()

        # Validate expired token
        is_valid = await RefreshTokenService.validate_refresh_token(
            db_session, expired_token.token, user
        )

        assert is_valid is False

    async def test_revoke_nonexistent_token(self, db_session: AsyncSession):
        """Test revoking a non-existent token doesn't raise error."""
        from app.services.refresh_token_service import RefreshTokenService

        # Should not raise
        await RefreshTokenService.revoke_refresh_token(db_session, "nonexistent_token")
