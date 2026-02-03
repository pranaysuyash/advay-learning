"""Rate limiting configuration."""

import os
from typing import Any

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

# Check if we're in testing mode
TESTING = os.environ.get("TESTING", "false").lower() == "true"

# Create limiter instance
# Uses client IP as key for rate limiting
# In testing, use a very high limit to avoid interfering with tests
if TESTING:
    # High limit for tests, but still enable rate limiting code paths
    DEFAULT_LIMITS = ["10000/minute"]
else:
    DEFAULT_LIMITS = ["100/minute"]  # Default: 100 requests per minute per IP

limiter = Limiter(key_func=get_remote_address, default_limits=DEFAULT_LIMITS)  # type: ignore


def get_rate_limit_exceeded_handler() -> Any:
    """Get the handler for rate limit exceeded errors."""
    return _rate_limit_exceeded_handler


# Rate limit strings for different endpoint categories
class RateLimits:
    """Rate limit configurations for different endpoint types."""

    # Authentication endpoints - strict limits to prevent brute force
    # In testing, use high limits; in production, use strict limits
    AUTH_STRICT = "10000/minute" if TESTING else "5/minute"  # Login, register attempts
    AUTH_MEDIUM = (
        "10000/minute" if TESTING else "10/minute"
    )  # Email verification, password reset

    # General API endpoints
    API_GENERAL = "10000/minute" if TESTING else "100/minute"  # Most API operations
    API_HEAVY = (
        "10000/minute" if TESTING else "20/minute"
    )  # Heavy operations (stats, exports)

    # Progress tracking - higher limits for game interactions
    PROGRESS_WRITE = (
        "10000/minute" if TESTING else "60/minute"
    )  # Saving progress (1 per second)
    PROGRESS_READ = (
        "10000/minute" if TESTING else "120/minute"
    )  # Reading progress/stats


def setup_rate_limiting(app: Any) -> None:
    """Setup rate limiting for the FastAPI app."""
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
