"""Error handling middleware for FastAPI.

Converts exceptions to structured JSON responses.
"""

import logging
import traceback
from typing import Any

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import get_settings
from app.core.exceptions import AppException

logger = logging.getLogger(__name__)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Middleware that catches exceptions and returns structured error responses."""

    async def dispatch(self, request: Request, call_next):
        """Process request and catch any exceptions."""
        try:
            response = await call_next(request)
            return response
        except AppException as e:
            # Handle known application exceptions
            return self._handle_app_exception(e, request)
        except Exception as e:
            # Handle unexpected exceptions
            return self._handle_unexpected_exception(e, request)

    def _handle_app_exception(self, exc: AppException, request: Request) -> JSONResponse:
        """Handle known application exceptions.
        
        Returns a structured error response with appropriate status code.
        """
        # Log the error with context
        logger.warning(
            f"Application error: {exc.error_code}",
            extra={
                "error_code": exc.error_code,
                "status_code": exc.status_code,
                "path": request.url.path,
                "method": request.method,
                "details": exc.details,
            },
        )
        
        response_data: dict[str, Any] = {
            "success": False,
            "error": {
                "code": exc.error_code,
                "message": exc.message,
            },
        }
        
        # Include details for client-side error handling
        if exc.details:
            response_data["error"]["details"] = exc.details
        
        return JSONResponse(
            status_code=exc.status_code,
            content=response_data,
        )

    def _handle_unexpected_exception(self, exc: Exception, request: Request) -> JSONResponse:
        """Handle unexpected exceptions.
        
        Returns a generic error response to avoid leaking internal details.
        Logs full traceback for debugging.
        """
        settings = get_settings()
        
        # Log the full error with traceback
        logger.exception(
            f"Unexpected error in {request.method} {request.url.path}",
            extra={
                "path": request.url.path,
                "method": request.method,
                "error_type": type(exc).__name__,
            },
        )
        
        # In development, include more details
        if settings.DEBUG:
            error_details = {
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": str(exc),
                    "type": type(exc).__name__,
                    "traceback": traceback.format_exc().split("\n"),
                }
            }
        else:
            # In production, return generic message
            error_details = {
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "An unexpected error occurred. Please try again later.",
                }
            }
        
        return JSONResponse(
            status_code=500,
            content={"success": False, **error_details},
        )
