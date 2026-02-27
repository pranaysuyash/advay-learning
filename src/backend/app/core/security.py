"""Security utilities."""

from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import bcrypt
from jose import jwt

from app.core.config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash using bcrypt."""
    # Encode passwords to bytes for bcrypt
    plain_bytes = plain_password.encode("utf-8")
    hash_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(plain_bytes, hash_bytes)


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""
    # Truncate to 72 bytes for bcrypt compatibility
    password_bytes = password[:72].encode("utf-8")
    # Use bcrypt directly to avoid passlib's crypt deprecation warning
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password_bytes, salt).decode("utf-8")


def create_access_token(data: dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token with a jti claim for revocation.

    The caller may pass a pre‑generated "jti" value in `data`; if absent,
    we generate a UUID.  A blacklist will rely on this value if
    ``settings.ENABLE_ACCESS_TOKEN_BLACKLIST`` is true.
    """
    from uuid import uuid4

    to_encode = data.copy()
    # ensure jti for blacklist/rotation
    if "jti" not in to_encode:
        to_encode["jti"] = str(uuid4())

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    return str(jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256"))


def create_refresh_token(data: dict[str, Any]) -> str:
    """Create a JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return str(jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256"))
