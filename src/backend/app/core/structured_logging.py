"""Structured logging utility for the backend.

Provides structured logging with context for production debugging.
"""
import logging
import json
import sys
from datetime import datetime
from typing import Any
from functools import wraps

# Configure structured logging
def setup_logging() -> None:
    """Configure structured logging for the application."""
    logging.basicConfig(
        level=logging.INFO,
        format='{"timestamp": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "message": "%(message)s"}',
        datefmt='%Y-%m-%dT%H:%M:%S',
        stream=sys.stdout,
    )


class StructuredLogger:
    """Logger that supports structured logging with context."""

    def __init__(self, name: str):
        self.logger = logging.getLogger(name)

    def _format_message(self, message: str, context: dict[str, Any] | None = None) -> str:
        """Format message with optional context."""
        if context:
            return f"{message} | context: {json.dumps(context)}"
        return message

    def info(self, message: str, **context: Any) -> None:
        """Log info with optional context."""
        self.logger.info(self._format_message(message, context or {}))

    def warning(self, message: str, **context: Any) -> None:
        """Log warning with optional context."""
        self.logger.warning(self._format_message(message, context or {}))

    def error(self, message: str, **context: Any) -> None:
        """Log error with optional context."""
        self.logger.error(self._format_message(message, context or {}))

    def exception(self, message: str, **context: Any) -> None:
        """Log exception with traceback and optional context."""
        self.logger.exception(self._format_message(message, context or {}))

    def debug(self, message: str, **context: Any) -> None:
        """Log debug with optional context."""
        self.logger.debug(self._format_message(message, context or {}))


def log_api_call(logger: StructuredLogger):
    """Decorator to log API calls with context."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            func_name = func.__name__
            logger.debug(f"API call started", function=func_name)
            try:
                result = await func(*args, **kwargs)
                logger.debug(f"API call completed", function=func_name, status="success")
                return result
            except Exception as e:
                logger.exception(
                    f"API call failed",
                    function=func_name,
                    error_type=type(e).__name__,
                    error_message=str(e),
                )
                raise
        return wrapper
    return decorator


# Default logger instance
def get_logger(name: str) -> StructuredLogger:
    """Get a structured logger instance."""
    return StructuredLogger(name)
