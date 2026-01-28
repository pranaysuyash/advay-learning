"""Authentication endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta

from app.api.deps import get_db
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token
from app.schemas.token import Token
from app.schemas.user import User, UserCreate
from app.services.user_service import UserService

router = APIRouter()

# Cookie settings
COOKIE_DOMAIN = None  # Use default (current domain)
COOKIE_PATH = "/"
COOKIE_SECURE = settings.APP_ENV == "production"  # Secure in production
COOKIE_SAMESITE = "lax"  # CSRF protection
ACCESS_TOKEN_COOKIE = "access_token"
REFRESH_TOKEN_COOKIE = "refresh_token"


def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """Set authentication cookies with proper security settings."""
    # Access token - short lived
    response.set_cookie(
        key=ACCESS_TOKEN_COOKIE,
        value=access_token,
        httponly=True,  # Not accessible via JavaScript
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path=COOKIE_PATH,
        domain=COOKIE_DOMAIN,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    
    # Refresh token - longer lived
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE,
        value=refresh_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path=COOKIE_PATH,
        domain=COOKIE_DOMAIN,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )


def clear_auth_cookies(response: Response) -> None:
    """Clear authentication cookies."""
    response.delete_cookie(key=ACCESS_TOKEN_COOKIE, path=COOKIE_PATH)
    response.delete_cookie(key=REFRESH_TOKEN_COOKIE, path=COOKIE_PATH)


@router.post("/register", response_model=User)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> User:
    """Register a new user."""
    # Check if user already exists
    existing_user = await UserService.get_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create new user
    user = await UserService.create(db, user_in)
    return user


@router.post("/login")
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Login and set authentication cookies."""
    # Authenticate user
    user = await UserService.authenticate(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    
    # Check email verification
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please check your email for verification link.",
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": user.id})
    refresh_token = create_refresh_token(data={"sub": user.id})
    
    # Set cookies
    set_auth_cookies(response, access_token, refresh_token)
    
    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
        }
    }


@router.post("/logout")
async def logout(response: Response) -> dict:
    """Logout and clear authentication cookies."""
    clear_auth_cookies(response)
    return {"message": "Logout successful"}


@router.post("/verify-email")
async def verify_email(
    token: str,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Verify email address using verification token."""
    user = await UserService.get_by_verification_token(db, token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )
    
    await UserService.verify_email(db, user)
    return {"message": "Email verified successfully. You can now log in."}


@router.post("/resend-verification")
async def resend_verification(
    email: str,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Resend email verification link."""
    user = await UserService.get_by_email(db, email)
    if not user:
        # Return success even if user not found (prevents user enumeration)
        return {"message": "If an account exists, a verification email has been sent."}
    
    if user.email_verified:
        return {"message": "Email is already verified."}
    
    # Generate new verification token
    from app.core.email import EmailService
    user.email_verification_token = EmailService.generate_verification_token()
    user.email_verification_expires = EmailService.get_verification_expiry()
    await db.commit()
    
    # Send verification email
    await EmailService.send_verification_email(user.email, user.email_verification_token)
    
    return {"message": "If an account exists, a verification email has been sent."}


@router.post("/forgot-password")
async def forgot_password(
    email: str,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Request password reset email."""
    user = await UserService.get_by_email(db, email)
    
    if not user:
        # Return success even if user not found (prevents user enumeration)
        return {"message": "If an account exists, a password reset email has been sent."}
    
    # Generate password reset token
    token = await UserService.create_password_reset_token(db, user)
    
    # Send password reset email
    from app.core.email import EmailService
    await EmailService.send_password_reset_email(user.email, token)
    
    return {"message": "If an account exists, a password reset email has been sent."}


@router.post("/reset-password")
async def reset_password(
    token: str,
    new_password: str,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Reset password using reset token."""
    user = await UserService.get_by_password_reset_token(db, token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )
    
    # Validate password length
    if len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters",
        )
    
    # Reset password
    await UserService.reset_password(db, user, new_password)
    
    return {"message": "Password reset successfully. You can now log in with your new password."}


@router.post("/refresh")
async def refresh_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Refresh access token using refresh cookie."""
    from jose import jwt, JWTError
    
    # Get refresh token from cookie
    refresh_token = request.cookies.get(REFRESH_TOKEN_COOKIE)
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token provided",
        )
    
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    
    # Verify user exists
    user = await UserService.get_by_id(db, user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    
    # Create new tokens
    new_access_token = create_access_token(data={"sub": user.id})
    new_refresh_token = create_refresh_token(data={"sub": user.id})
    
    # Update cookies
    set_auth_cookies(response, new_access_token, new_refresh_token)
    
    return {"message": "Token refreshed successfully"}


@router.get("/me", response_model=User)
async def get_current_user_info(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current user info from access token cookie."""
    from jose import jwt, JWTError
    
    # Get access token from cookie
    access_token = request.cookies.get(ACCESS_TOKEN_COOKIE)
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    try:
        payload = jwt.decode(access_token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    
    # Get user
    user = await UserService.get_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return user
