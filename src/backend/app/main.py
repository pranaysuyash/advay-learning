"""Main FastAPI application entry point."""

import logging
from typing import Any

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.health import get_health_status
from app.core.rate_limit import setup_rate_limiting
from app.db.session import get_db


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""
    
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        
        # XSS protection
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Referrer policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Permissions policy (disable unused features)
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        
        return response

# Setup logging
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Advay Vision Learning API",
    description="AI-powered educational platform with computer vision",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Setup rate limiting
setup_rate_limiting(app)

# Security headers
app.add_middleware(SecurityHeadersMiddleware)

# Trusted hosts (in production)
if settings.APP_ENV == "production":
    # Extract hosts from ALLOWED_ORIGINS
    allowed_hosts = [
        origin.replace("https://", "").replace("http://", "").split(":")[0]
        for origin in settings.ALLOWED_ORIGINS
        if origin != "*"
    ]
    if allowed_hosts:
        app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)

# CORS Security Check
if "*" in settings.ALLOWED_ORIGINS:
    logger.warning(
        "SECURITY WARNING: CORS ALLOWED_ORIGINS contains wildcard '*'. "
        "This is insecure when combined with allow_credentials=True. "
        "See docs/security/SECURITY.md#cors-cross-origin-resource-sharing-policy"
    )

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
    max_age=600,  # Cache preflight for 10 minutes
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root() -> dict:
    """Root endpoint."""
    return {
        "message": "Advay Vision Learning API",
        "version": "0.1.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    """Health check endpoint.
    
    Returns 200 if all dependencies are healthy.
    Returns 503 if any critical dependency is unhealthy.
    """
    status = await get_health_status(db)

    if status["status"] != "healthy":
        raise HTTPException(
            status_code=HTTP_503_SERVICE_UNAVAILABLE,
            detail=status
        )

    return status  # type: ignore


if __name__ == "__main__":
    # Use python -m uvicorn for better multiprocessing support in Python 3.13+
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,
        reload=settings.DEBUG,
        workers=1,
    )
