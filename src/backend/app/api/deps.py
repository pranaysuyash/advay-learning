"""API dependencies."""

from typing import AsyncGenerator, Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import ValidationError

from app.core.config import settings
from app.core.security import verify_password
from app.db.session import async_session
from app.db.models.user import User
from app.schemas.token import TokenPayload

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_PREFIX}/auth/login",
    auto_error=False  # Don't auto-error, we'll check cookies too
)

# Cookie name constants
ACCESS_TOKEN_COOKIE = "access_token"


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Get database session."""
    async with async_session() as session:
        yield session


async def get_token_from_request(request: Request) -> Optional[str]:
    """Get token from Authorization header or cookie."""
    # First try Authorization header (Bearer token)
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:]  # Remove "Bearer " prefix
    
    # Fall back to cookie
    return request.cookies.get(ACCESS_TOKEN_COOKIE)


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    """Get current user from JWT token (header or cookie)."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Get token from header or cookie
    token = await get_token_from_request(request)
    if not token:
        raise credentials_exception
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        token_data = TokenPayload(**payload)
        
        if token_data.sub is None:
            raise credentials_exception
    except (JWTError, ValidationError):
        raise credentials_exception
    
    # Import here to avoid circular dependency
    from app.services.user_service import UserService
    
    user = await UserService.get_by_id(db, user_id=token_data.sub)
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    
    return user


async def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get current superuser."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    return current_user
