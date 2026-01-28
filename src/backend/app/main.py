"""Main FastAPI application entry point."""

import logging
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE

from app.core.config import settings
from app.core.health import get_health_status
from app.api.v1.api import api_router
from app.db.session import get_db

# Setup logging
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Advay Vision Learning API",
    description="AI-powered educational platform with computer vision",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

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
    allow_methods=["*"],
    allow_headers=["*"],
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
async def health_check(db = Depends(get_db)) -> dict:
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
    
    return status


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=settings.DEBUG)
