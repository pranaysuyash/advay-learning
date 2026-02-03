"""User service for business logic."""

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.email import EmailService
from app.core.security import get_password_hash, verify_password
from app.db.models.user import User
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    """User service."""

    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> Optional[User]:
        """Get user by email."""
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
        """Get user by ID."""
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, user_in: UserCreate) -> User:
        """Create new user with email verification token."""
        # Generate verification token
        verification_token = EmailService.generate_verification_token()
        verification_expires = EmailService.get_verification_expiry()

        user = User(
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            role=user_in.role,
            is_active=user_in.is_active,
            email_verified=False,  # New users need to verify email
            email_verification_token=verification_token,
            email_verification_expires=verification_expires,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        # Send verification email
        await EmailService.send_verification_email(user.email, verification_token)

        return user

    @staticmethod
    async def get_by_verification_token(db: AsyncSession, token: str) -> Optional[User]:
        """Get user by email verification token."""
        result = await db.execute(
            select(User).where(
                User.email_verification_token == token,
                User.email_verification_expires > datetime.now(timezone.utc),
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def verify_email(db: AsyncSession, user: User) -> User:
        """Mark user's email as verified."""
        user.email_verified = True
        user.email_verification_token = None
        user.email_verification_expires = None
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def get_by_password_reset_token(
        db: AsyncSession, token: str
    ) -> Optional[User]:
        """Get user by password reset token."""
        result = await db.execute(
            select(User).where(
                User.password_reset_token == token,
                User.password_reset_expires > datetime.now(timezone.utc),
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create_password_reset_token(db: AsyncSession, user: User) -> str:
        """Create a password reset token for user."""
        token: str = EmailService.generate_verification_token()
        user.password_reset_token = token
        user.password_reset_expires = EmailService.get_verification_expiry()  # 24 hours
        await db.commit()
        return token

    @staticmethod
    async def reset_password(db: AsyncSession, user: User, new_password: str) -> User:
        """Reset user's password and clear reset token."""
        from app.core.security import get_password_hash

        user.hashed_password = get_password_hash(new_password)
        user.password_reset_token = None
        user.password_reset_expires = None
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def update(db: AsyncSession, user: User, user_in: UserUpdate) -> User:
        """Update user."""
        update_data = user_in.model_dump(exclude_unset=True)

        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(
                update_data.pop("password")
            )

        for field, value in update_data.items():
            setattr(user, field, value)

        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def delete(db: AsyncSession, user: User) -> None:
        """Delete user."""
        await db.delete(user)
        await db.commit()

    @staticmethod
    async def authenticate(
        db: AsyncSession, email: str, password: str
    ) -> Optional[User]:
        """Authenticate user with constant-time comparison to prevent timing attacks."""
        user = await UserService.get_by_email(db, email)

        if not user:
            # Perform dummy verification to maintain constant time
            # This prevents user enumeration via timing analysis
            # Using a valid bcrypt hash that will never match any real password
            verify_password(
                password, "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"
            )
            return None

        if not verify_password(password, user.hashed_password):
            return None

        return user
