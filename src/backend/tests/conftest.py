import asyncio
import os
from typing import AsyncGenerator, Generator

import pytest

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

# Create test engine (uses PostgreSQL test database from .env.test)
test_engine = create_async_engine(settings.DATABASE_URL, echo=False)
test_async_session = async_sessionmaker(
    test_engine, class_=AsyncSession, expire_on_commit=False
)

# Monkey-patch the session module
db_session_module.engine = test_engine
db_session_module.async_session = test_async_session

# Now import app (it will use the patched engine)
# ruff: noqa: E402 - Intentional import after mocking setup
from app.main import app


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
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


@pytest.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create a test client."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as test_client:
        yield test_client


@pytest.fixture
async def test_user(client: AsyncClient) -> dict:
    """Create a test user and return credentials."""
    user_data = {"email": "test@example.com", "password": "TestPassword123"}

    # Register user
    response = await client.post("/api/v1/auth/register", json=user_data)
    if response.status_code == 200:
        # Get verification token from response and verify email
        # For tests, we need to manually verify since we can't access the token
        # We'll use the resend endpoint to get a new token
        from app.db.session import async_session
        from app.services.user_service import UserService

        async with async_session() as session:
            user = await UserService.get_by_email(session, user_data["email"])
            if user and not user.email_verified:
                # Manually verify for testing
                await UserService.verify_email(session, user)

    return user_data


@pytest.fixture
async def auth_token(client: AsyncClient, test_user: dict) -> str:
    """Get authentication token for test user via cookie-based login."""
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": test_user["email"], "password": test_user["password"]},
    )
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
def auth_headers(auth_token: str) -> dict:
    """Return authorization headers with token."""
    return {"Authorization": f"Bearer {auth_token}"}
