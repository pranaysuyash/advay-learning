"""Database session management."""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

# Connection pool configuration for PostgreSQL
pool_config = {}
if settings.DATABASE_URL.startswith("postgresql"):
    pool_config = {
        "pool_size": 10,  # Number of persistent connections
        "max_overflow": 20,  # Extra connections when pool is full
        "pool_timeout": 30,  # Seconds to wait for connection
        "pool_recycle": 1800,  # Recycle connections after 30 min
        "pool_pre_ping": True,  # Verify connection before using
    }

engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG, **pool_config)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Get database session."""
    async with async_session() as session:
        yield session
