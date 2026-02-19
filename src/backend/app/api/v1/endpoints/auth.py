"""Authentication endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.core.config import settings
from app.core.email import EmailService
from app.core.rate_limit import RateLimits, limiter
from app.core.security import create_access_token
from app.schemas.user import User, UserCreate
from app.services.account_lockout_service import AccountLockoutService
from app.services.refresh_token_service import RefreshTokenService
from app.services.user_service import UserService

router = APIRouter()

# Cookie settings
COOKIE_DOMAIN = None  # Use default (current domain)
COOKIE_PATH = "/"
COOKIE_SECURE = settings.APP_ENV == "production"  # Secure in production
COOKIE_SAMESITE = "lax"  # CSRF protection
ACCESS_TOKEN_COOKIE = "access_token"
REFRESH_TOKEN_COOKIE = "refresh_token"
REGISTRATION_SUCCESS_MESSAGE = "If an account is eligible, a verification email has been sent."


def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """Set authentication cookies with proper security settings."""
    # Access token - short lived
    response.set_cookie(
        key=ACCESS_TOKEN_COOKIE,
        value=access_token,
        httponly=True,  # Not accessible via JavaScript
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,  # type: ignore
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
        samesite=COOKIE_SAMESITE,  # type: ignore
        path=COOKIE_PATH,
        domain=COOKIE_DOMAIN,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )


def clear_auth_cookies(response: Response) -> None:
    """Clear authentication cookies."""
    response.delete_cookie(key=ACCESS_TOKEN_COOKIE, path=COOKIE_PATH)
    response.delete_cookie(key=REFRESH_TOKEN_COOKIE, path=COOKIE_PATH)


@router.post("/register")
@limiter.limit(RateLimits.AUTH_STRICT)
async def register(
    request: Request, user_in: UserCreate, db: AsyncSession = Depends(get_db)
) -> dict:
    """Register a new user with account enumeration protection."""
    # Always return the same message to prevent account enumeration.
    existing_user = await UserService.get_by_email(db, user_in.email)
    if existing_user:
        if not existing_user.email_verified:
            existing_user.email_verification_token = EmailService.generate_verification_token()
            existing_user.email_verification_expires = EmailService.get_verification_expiry()
            await db.commit()
            await EmailService.send_verification_email(
                existing_user.email, existing_user.email_verification_token
            )
        return {"message": REGISTRATION_SUCCESS_MESSAGE}

    try:
        await UserService.create(db, user_in)
    except IntegrityError:
        # Concurrent registration can race with uniqueness checks.
        # Roll back and return the same generic response to avoid leaking account existence.
        await db.rollback()

    return {"message": REGISTRATION_SUCCESS_MESSAGE}


@router.post("/login")
@limiter.limit(RateLimits.AUTH_STRICT)
async def login(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Login and set authentication cookies with account lockout protection."""
    email = form_data.username

    # Check if account is locked
    if await AccountLockoutService.is_account_locked(email):
        remaining_time = await AccountLockoutService.get_remaining_lockout_time(email)
        if remaining_time:
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail=f"Account temporarily locked due to multiple failed login attempts. Try again in {remaining_time} seconds.",
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail="Account temporarily locked due to multiple failed login attempts. Please try again later.",
            )

    # Authenticate user
    user = await UserService.authenticate(db, email, form_data.password)
    if not user:
        # Record failed attempt
        should_lock = await AccountLockoutService.record_failed_attempt(email)

        if should_lock:
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail="Account locked due to multiple failed login attempts. Please try again later.",
            )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Clear failed attempts on successful login
    await AccountLockoutService.clear_failed_attempts(email)

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

    # Create refresh token in database for rotation
    db_refresh_token = await RefreshTokenService.create_refresh_token(db, user.id)
    refresh_token = db_refresh_token.token

    # Set cookies
    set_auth_cookies(response, access_token, refresh_token)

    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
        },
    }


@router.post("/logout")
async def logout(request: Request, response: Response, db: AsyncSession = Depends(get_db)) -> dict:
    """Logout and clear authentication cookies, revoke refresh token."""
    # Get refresh token from cookie to revoke it
    refresh_token = request.cookies.get(REFRESH_TOKEN_COOKIE)
    if refresh_token:
        # Revoke the refresh token in the database
        await RefreshTokenService.revoke_refresh_token(db, refresh_token)

    clear_auth_cookies(response)
    return {"message": "Logout successful"}


@router.post("/verify-email")
async def verify_email(token: str, db: AsyncSession = Depends(get_db)) -> dict:
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
async def resend_verification(email: str, db: AsyncSession = Depends(get_db)) -> dict:
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
@limiter.limit(RateLimits.AUTH_MEDIUM)
async def forgot_password(request: Request, email: str, db: AsyncSession = Depends(get_db)) -> dict:
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
@limiter.limit(RateLimits.AUTH_MEDIUM)
async def reset_password(
    request: Request, token: str, new_password: str, db: AsyncSession = Depends(get_db)
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
@limiter.limit(RateLimits.AUTH_MEDIUM)
async def refresh_token(
    request: Request, response: Response, db: AsyncSession = Depends(get_db)
) -> dict:
    """Refresh access token using refresh cookie with rotation."""
    # Get refresh token from cookie
    refresh_token = request.cookies.get(REFRESH_TOKEN_COOKIE)
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token provided",
        )

    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id: str | None = payload.get("sub")
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

    # Validate the refresh token against the database
    is_valid = await RefreshTokenService.validate_refresh_token(db, refresh_token, user)
    if not is_valid:
        # Invalid or revoked token, clear cookies
        clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked refresh token",
        )

    # Revoke the old refresh token (rotation)
    await RefreshTokenService.revoke_refresh_token(db, refresh_token)

    # Create new tokens
    new_access_token = create_access_token(data={"sub": user.id})

    # Create new refresh token in database
    db_new_refresh_token = await RefreshTokenService.create_refresh_token(db, user.id)
    new_refresh_token = db_new_refresh_token.token

    # Update cookies
    set_auth_cookies(response, new_access_token, new_refresh_token)

    return {"message": "Token refreshed successfully"}


@router.get("/me", response_model=User)
async def get_current_user_info(request: Request, db: AsyncSession = Depends(get_db)) -> User:
    """Get current user info from access token cookie."""
    # Get access token from cookie
    access_token = request.cookies.get(ACCESS_TOKEN_COOKIE)
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        payload = jwt.decode(access_token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id: str | None = payload.get("sub")
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
