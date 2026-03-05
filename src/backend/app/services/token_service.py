"""Service for managing revoked access tokens."""

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.revoked_token import RevokedToken


class TokenService:
    @staticmethod
    async def revoke_access_token(db: AsyncSession, jti: str, expires_at: datetime) -> bool:
        """Record an access token as revoked.

        The database stores naive timestamps, so strip timezone if present.
        """
        if expires_at.tzinfo is not None:
            expires_at = expires_at.replace(tzinfo=None)
        revoked = RevokedToken(jti=jti, expires_at=expires_at)
        db.add(revoked)
        await db.commit()
        return True

    @staticmethod
    async def is_token_revoked(db: AsyncSession, jti: str) -> bool:
        """Check whether a token has been revoked or expired.

        Expired revoked tokens can be cleaned up by a background job if desired.
        """
        result = await db.execute(
            select(RevokedToken).where(RevokedToken.jti == jti)
        )
        return result.scalar_one_or_none() is not None

    @staticmethod
    async def cleanup_expired(db: AsyncSession) -> int:
        """Remove revoked-token records that have passed their expiration."""
        from sqlalchemy import delete

        now = datetime.utcnow()
        q = delete(RevokedToken).where(RevokedToken.expires_at < now)
        res = await db.execute(q)
        await db.commit()
        return res.rowcount
