"""Refresh token service for managing refresh token lifecycle."""

from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import uuid4

from jose import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.models.refresh_token import RefreshToken
from app.db.models.user import User


class RefreshTokenService:
    """Refresh token service for managing refresh token lifecycle."""

    @staticmethod
    async def create_refresh_token(db: AsyncSession, user_id: str) -> RefreshToken:
        """Create a new refresh token for a user."""
        # Generate a unique token
        token_uuid = str(uuid4())
        token = jwt.encode(
            {"sub": user_id, "jti": token_uuid, "exp": datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)},
            settings.SECRET_KEY,
            algorithm="HS256"
        )

        # Create refresh token record
        refresh_token = RefreshToken(
            token=token,
            user_id=user_id,
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        )
        
        db.add(refresh_token)
        await db.commit()
        await db.refresh(refresh_token)
        
        return refresh_token

    @staticmethod
    async def get_refresh_token(db: AsyncSession, token: str) -> Optional[RefreshToken]:
        """Get refresh token by token value."""
        result = await db.execute(
            select(RefreshToken)
            .where(RefreshToken.token == token)
            .where(RefreshToken.is_active == True)
            .where(RefreshToken.is_revoked == False)
            .where(RefreshToken.expires_at > datetime.now(timezone.utc))
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def revoke_refresh_token(db: AsyncSession, token: str) -> bool:
        """Revoke a refresh token."""
        refresh_token = await RefreshTokenService.get_refresh_token(db, token)
        if not refresh_token:
            return False

        refresh_token.is_revoked = True
        refresh_token.is_active = False
        refresh_token.revoked_at = datetime.now(timezone.utc)
        
        await db.commit()
        return True

    @staticmethod
    async def revoke_all_user_refresh_tokens(db: AsyncSession, user_id: str) -> int:
        """Revoke all refresh tokens for a user."""
        result = await db.execute(
            select(RefreshToken)
            .where(RefreshToken.user_id == user_id)
            .where(RefreshToken.is_active == True)
            .where(RefreshToken.is_revoked == False)
        )
        tokens = result.scalars().all()
        
        count = 0
        for token in tokens:
            token.is_revoked = True
            token.is_active = False
            token.revoked_at = datetime.now(timezone.utc)
            count += 1
        
        await db.commit()
        return count

    @staticmethod
    async def validate_refresh_token(db: AsyncSession, token: str, user: User) -> bool:
        """Validate a refresh token belongs to the user and is not revoked."""
        refresh_token = await RefreshTokenService.get_refresh_token(db, token)
        if not refresh_token:
            return False

        # Check if token belongs to the user
        if refresh_token.user_id != user.id:
            return False

        return True