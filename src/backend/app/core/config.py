"""Application configuration."""

from functools import lru_cache
from pydantic_settings import BaseSettings
from typing import Optional, List


class Settings(BaseSettings):
    """Application settings."""
    
    # App
    APP_ENV: str = "development"
    SECRET_KEY: str
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str
    
    # JWT
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # Frontend URL (for email links)
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Storage
    USE_LOCAL_STORAGE: bool = True
    LOCAL_STORAGE_PATH: str = "./storage"
    
    # AWS S3 (optional)
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    S3_BUCKET_NAME: Optional[str] = None
    S3_REGION: Optional[str] = None
    
    # Redis (optional)
    REDIS_URL: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        # Parse comma-separated strings to lists
        @classmethod
        def parse_env_var(cls, field_name: str, raw_val: str) -> any:
            if field_name == "ALLOWED_ORIGINS":
                return [origin.strip() for origin in raw_val.split(",")]
            return cls.json_loads(raw_val)


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance.
    
    Uses lazy loading to avoid import-time validation errors.
    Settings are cached after first access.
    """
    return Settings()


# Backward compatibility: module-level settings
# DEPRECATED: Use get_settings() instead for new code
# This will be removed in a future version
settings = get_settings()
