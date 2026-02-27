"""Main FastAPI application entry point."""

import logging
from typing import Any

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE

from app.api.v1.api import api_router
from app.core.config import Settings, get_settings
from app.core.health import get_health_status
from app.core.logging_config import setup_logging
from app.core.rate_limit import setup_rate_limiting
from app.db.session import get_db
from app.middleware.security_headers import SecurityHeadersMiddleware


setup_logging()
logger = logging.getLogger(__name__)


def validate_cors_configuration(settings_instance: Settings) -> None:
    """Validate CORS configuration for security."""
    if (
        "*" in settings_instance.ALLOWED_ORIGINS
        and settings_instance.CORS_ALLOW_CREDENTIALS
    ):
        if settings_instance.APP_ENV == "production":
            raise RuntimeError(
                "SECURITY ERROR: CORS ALLOWED_ORIGINS contains wildcard '*' "
                "combined with allow_credentials=True in production. "
                "This is insecure and will not be allowed. "
                "Either remove '*' from ALLOWED_ORIGINS or set CORS_ALLOW_CREDENTIALS=False."
            )
        else:
            logger.warning(
                "SECURITY WARNING: CORS ALLOWED_ORIGINS contains wildcard '*' "
                "combined with allow_credentials=True. "
                "This is insecure when combined with allow_credentials=True. "
                "See docs/security/SECURITY.md#cors-cross-origin-resource-sharing-policy"
            )


async def validate_database_schema() -> None:
    """Validate that all SQLAlchemy models have corresponding database tables.
    
    This runs at startup to catch missing migrations early.
    """
    from sqlalchemy import inspect
    from app.db.session import engine
    from app.db.base_class import Base
    
    # Import all models to ensure they're registered with Base
    from app.db.models import (
        user, profile, progress, achievement,
        subscription, game, audit_log, revoked_token
    )
    
    async with engine.connect() as conn:
        def check_tables(sync_conn):
            inspector = inspect(sync_conn)
            existing_tables = set(inspector.get_table_names())
            existing_tables.discard('alembic_version')  # Managed by alembic
            model_tables = set(Base.metadata.tables.keys())
            
            missing_tables = model_tables - existing_tables
            if missing_tables:
                raise RuntimeError(
                    f"Database schema mismatch: Missing tables {missing_tables}. "
                    f"Run: alembic revision --autogenerate -m 'add missing tables' && alembic upgrade head"
                )
        
        await conn.run_sync(check_tables)


# Validate settings before creating app to catch issues early
try:
    settings = get_settings()
    validate_cors_configuration(settings)
except Exception as e:
    # Provide helpful error message for missing environment variables
    print(f"Configuration Error: {str(e)}")
    print("Please ensure all required environment variables are set.")
    print("Required: SECRET_KEY, DATABASE_URL")
    print("Optional: APP_ENV, DEBUG, ALLOWED_ORIGINS, etc.")
    raise

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

# CORS - now with security validation
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,  # Use setting instead of hardcoded True
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
    max_age=600,  # Cache preflight for 10 minutes
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.on_event("startup")
async def startup_event():
    """Run startup validations."""
    logger.info("Running startup validations...")
    try:
        await validate_database_schema()
        logger.info("✅ Database schema validation passed")
    except Exception as e:
        logger.error(f"❌ Startup validation failed: {e}")
        raise


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
        raise HTTPException(status_code=HTTP_503_SERVICE_UNAVAILABLE, detail=status)

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
