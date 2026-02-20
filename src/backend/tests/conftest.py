import asyncio
import os
from typing import AsyncGenerator, Generator

import pytest
from sqlalchemy.pool import NullPool

# Load test environment before any app imports
from dotenv import load_dotenv
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.test"))

# Set testing environment
os.environ["TESTING"] = "true"

# Import and patch BEFORE creating app instance
# ruff: noqa: E402 - Intentional imports after environment setup for test mocking
from app.core.config import settings
from app.db import session as db_session_module
from app.db.base_class import Base

# Create test engine with NullPool - no connection reuse between tests
# This ensures each test gets fresh connections, avoiding event loop conflicts
test_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    poolclass=NullPool,
)
test_async_session = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)

# Monkey-patch the session module
db_session_module.engine = test_engine
db_session_module.async_session = test_async_session

# Now import app (it will use the patched engine)
# ruff: noqa: E402 - Intentional import after mocking setup
from app.main import app


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for the test session."""
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session", autouse=True)
async def setup_database():
    """Create database tables once for the test session."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Cleanup
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Create a fresh database session for each test."""
    async with test_async_session() as session:
        yield session
        await session.rollback()
        await session.close()


@pytest.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create a test client."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as test_client:
        yield test_client


@pytest.fixture
async def test_user(db_session: AsyncSession) -> dict:
    """Create a test user directly in the database."""
    from app.core.security import get_password_hash
    from app.services.user_service import UserService

    user_data = {"email": "test@example.com", "password": "TestPassword123"}

    # Check if user already exists
    existing = await UserService.get_by_email(db_session, user_data["email"])
    if existing:
        return user_data

    # Create user directly in database
    from app.db.models.user import User

    user = User(
        email=user_data["email"],
        hashed_password=get_password_hash(user_data["password"]),
        is_active=True,
        email_verified=True,  # Pre-verified for testing
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    return user_data


@pytest.fixture
async def auth_token(client: AsyncClient, test_user: dict) -> str:
    """Get authentication token for test user via cookie-based login."""
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": test_user["email"], "password": test_user["password"]},
    )
    # Debug: print response if it fails
    if response.status_code != 200:
        print(f"Login failed: {response.status_code} - {response.text}")
    assert response.status_code == 200

    # Extract token from cookies
    cookies = response.cookies
    access_token = cookies.get("access_token")
    if not access_token:
        # Fallback: try to get from response body if not in cookies
        # This shouldn't happen with cookie-based auth, but for backward compatibility
        access_token = response.json().get("access_token")

    return access_token


@pytest.fixture
async def admin_token(client: AsyncClient, db_session: AsyncSession) -> str:
    """Create an admin user and return authentication token."""
    from app.core.security import get_password_hash
    from app.db.models.user import User
    from uuid import uuid4
    
    # Create admin user directly in database
    user = User(
        id=str(uuid4()),
        email="admin@test.com",
        hashed_password=get_password_hash("Admin123!"),
        is_active=True,
        is_superuser=True,
        email_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    
    # Login to get token
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "admin@test.com", "password": "Admin123!"},
    )
    assert response.status_code == 200
    
    cookies = response.cookies
    access_token = cookies.get("access_token")
    if not access_token:
        access_token = response.json().get("access_token")
    
    return access_token


@pytest.fixture
def auth_headers(auth_token: str) -> dict:
    """Return authorization headers with token."""
    return {"Authorization": f"Bearer {auth_token}"}
