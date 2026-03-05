"""Custom exceptions for the application.

Provides structured error responses with consistent formatting.
"""

from typing import Any, Optional


class AppException(Exception):
    """Base application exception with structured error details."""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        error_code: Optional[str] = None,
        details: Optional[dict[str, Any]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or self.__class__.__name__
        self.details = details or {}
        super().__init__(self.message)


# Authentication & Authorization Exceptions
class AuthenticationError(AppException):
    """Raised when authentication fails."""

    def __init__(self, message: str = "Authentication failed", details: Optional[dict] = None):
        super().__init__(
            message=message,
            status_code=401,
            error_code="AUTHENTICATION_ERROR",
            details=details,
        )


class AuthorizationError(AppException):
    """Raised when user lacks permission for an action."""

    def __init__(self, message: str = "Permission denied", details: Optional[dict] = None):
        super().__init__(
            message=message,
            status_code=403,
            error_code="AUTHORIZATION_ERROR",
            details=details,
        )


class TokenExpiredError(AppException):
    """Raised when JWT token has expired."""

    def __init__(self, message: str = "Token has expired"):
        super().__init__(
            message=message,
            status_code=401,
            error_code="TOKEN_EXPIRED",
        )


class TokenInvalidError(AppException):
    """Raised when JWT token is invalid."""

    def __init__(self, message: str = "Invalid token"):
        super().__init__(
            message=message,
            status_code=401,
            error_code="TOKEN_INVALID",
        )


# Validation Exceptions
class ValidationError(AppException):
    """Raised when input validation fails."""

    def __init__(self, message: str = "Validation failed", details: Optional[dict] = None):
        super().__init__(
            message=message,
            status_code=422,
            error_code="VALIDATION_ERROR",
            details=details,
        )


class PasswordStrengthError(ValidationError):
    """Raised when password doesn't meet strength requirements."""

    def __init__(self, message: str = "Password does not meet strength requirements"):
        super().__init__(
            message=message,
            details={
                "requirements": {
                    "min_length": 8,
                    "uppercase": True,
                    "lowercase": True,
                    "digit": True,
                }
            },
        )


# Resource Exceptions
class ResourceNotFoundError(AppException):
    """Raised when a requested resource doesn't exist."""

    def __init__(self, resource_type: str, resource_id: Optional[str] = None):
        message = f"{resource_type} not found"
        if resource_id:
            message = f"{resource_type} with id '{resource_id}' not found"
        super().__init__(
            message=message,
            status_code=404,
            error_code="RESOURCE_NOT_FOUND",
            details={"resource_type": resource_type, "resource_id": resource_id},
        )


class ResourceConflictError(AppException):
    """Raised when there's a conflict with existing resource."""

    def __init__(self, message: str = "Resource conflict", details: Optional[dict] = None):
        super().__init__(
            message=message,
            status_code=409,
            error_code="RESOURCE_CONFLICT",
            details=details,
        )


class DuplicateResourceError(ResourceConflictError):
    """Raised when attempting to create a duplicate resource."""

    def __init__(self, resource_type: str, field: str, value: str):
        super().__init__(
            message=f"{resource_type} with {field} '{value}' already exists",
            details={"resource_type": resource_type, "field": field, "value": value},
        )


# Rate Limiting & Security Exceptions
class RateLimitExceededError(AppException):
    """Raised when rate limit is exceeded."""

    def __init__(self, retry_after: Optional[int] = None):
        details = {}
        if retry_after:
            details["retry_after_seconds"] = retry_after
        super().__init__(
            message="Rate limit exceeded. Please try again later.",
            status_code=429,
            error_code="RATE_LIMIT_EXCEEDED",
            details=details,
        )


class AccountLockedError(AppException):
    """Raised when account is locked due to failed attempts."""

    def __init__(self, locked_until: Optional[str] = None):
        details = {}
        if locked_until:
            details["locked_until"] = locked_until
        super().__init__(
            message="Account is temporarily locked due to multiple failed attempts",
            status_code=423,
            error_code="ACCOUNT_LOCKED",
            details=details,
        )


# Business Logic Exceptions
class SubscriptionError(AppException):
    """Raised when subscription operation fails."""

    def __init__(self, message: str = "Subscription error", details: Optional[dict] = None):
        super().__init__(
            message=message,
            status_code=400,
            error_code="SUBSCRIPTION_ERROR",
            details=details,
        )


class PaymentError(AppException):
    """Raised when payment processing fails."""

    def __init__(self, message: str = "Payment processing failed", details: Optional[dict] = None):
        super().__init__(
            message=message,
            status_code=400,
            error_code="PAYMENT_ERROR",
            details=details,
        )


class GameAccessError(AppException):
    """Raised when user doesn't have access to a game."""

    def __init__(self, game_id: Optional[str] = None):
        details = {}
        if game_id:
            details["game_id"] = game_id
        super().__init__(
            message="You don't have access to this game",
            status_code=403,
            error_code="GAME_ACCESS_DENIED",
            details=details,
        )


# Database Exceptions
class DatabaseError(AppException):
    """Raised when database operation fails."""

    def __init__(self, message: str = "Database error"):
        super().__init__(
            message=message,
            status_code=500,
            error_code="DATABASE_ERROR",
        )


class ConcurrentModificationError(AppException):
    """Raised when resource was modified by another request."""

    def __init__(self, message: str = "Resource was modified by another request"):
        super().__init__(
            message=message,
            status_code=409,
            error_code="CONCURRENT_MODIFICATION",
        )
