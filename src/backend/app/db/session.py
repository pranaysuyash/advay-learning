"""Database session management."""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Connection pool configuration
# For PostgreSQL: use connection pooling
# For SQLite: pooling is not needed/supported
pool_config = {}
if settings.DATABASE_URL.startswith("postgresql"):
    pool_config = {
        "pool_size": 10,              # Number of persistent connections
        "max_overflow": 20,           # Extra connections when pool is full
        "pool_timeout": 30,           # Seconds to wait for connection
        "pool_recycle": 1800,         # Recycle connections after 30 min
        "pool_pre_ping": True,        # Verify connection before using
    }

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    **pool_config
)

async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


async def get_db() -> AsyncSession:
    """Get database session."""
    async with async_session() as session:
        yield session
