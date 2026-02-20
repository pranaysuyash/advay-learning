"""Tests for games API."""

import pytest
from httpx import AsyncClient

from app.db.models.user import User as UserModel
from app.schemas.user import UserRole


@pytest.mark.asyncio
async def test_list_games_unauthenticated(client: AsyncClient):
    """Test that unauthenticated users can list published games."""
    response = await client.get("/api/v1/games/", follow_redirects=True)
    assert response.status_code == 200
    data = response.json()
    assert "games" in data
    assert len(data["games"]) > 0


@pytest.mark.asyncio
async def test_list_games_with_filters(client: AsyncClient):
    """Test filtering games by category."""
    response = await client.get("/api/v1/games/?category=Alphabets", follow_redirects=True)
    assert response.status_code == 200
    data = response.json()
    assert "games" in data
    assert all(g["category"] == "Alphabets" for g in data["games"])


@pytest.mark.asyncio
async def test_list_games_pagination(client: AsyncClient):
    """Test pagination."""
    response = await client.get("/api/v1/games/?page=1&page_size=10", follow_redirects=True)
    assert response.status_code == 200
    data = response.json()
    assert data["page"] == 1
    assert data["page_size"] == 10


@pytest.mark.asyncio
async def test_get_game_by_slug(client: AsyncClient):
    """Test getting game details by slug."""
    response = await client.get("/api/v1/games/alphabet-tracing", follow_redirects=True)
    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == "alphabet-tracing"
    assert data["title"] == "Draw Letters"


@pytest.mark.asyncio
async def test_create_game_requires_admin(client: AsyncClient, db_session):
    """Test that creating games requires admin access."""
    # Create regular user
    user = await create_test_user(db_session, role=UserRole.PARENT)
    token = await login_user(client, user)

    response = await client.post(
        "/api/v1/games",
        json={"title": "Test Game", "slug": "test-game"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_create_game_admin(client: AsyncClient, admin_token: str, db_session):
    """Test that admins can create games."""
    response = await client.post(
        "/api/v1/games",
        json={"title": "Test Game", "slug": "admin-game"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 201


@pytest.mark.asyncio
async def test_get_game_by_id(client: AsyncClient):
    """Test getting game details by ID."""
    response = await client.get("/api/v1/games/alphabet-tracing")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "alphabet-tracing"


@pytest.mark.asyncio
async def test_update_game_requires_admin(client: AsyncClient, admin_token: str, db_session):
    """Test that updating games requires admin access."""
    user = await create_test_user(db_session, role=UserRole.PARENT)
    token = await login_user(client, user)

    response = await client.put(
        "/api/v1/games/alphabet-tracing",
        json={"title": "Updated Game"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_update_game_admin(client: AsyncClient, admin_token: str, db_session):
    """Test that admins can update games."""
    response = await client.put(
        "/api/v1/games/alphabet-tracing",
        json={"title": "Updated Game"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_delete_game_requires_admin(client: AsyncClient, admin_token: str, db_session):
    """Test that deleting games requires admin access."""
    user = await create_test_user(db_session, role=UserRole.PARENT)
    token = await login_user(client, user)

    response = await client.delete(
        "/api/v1/games/alphabet-tracing",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_delete_game_admin(client: AsyncClient, admin_token: str, db_session):
    """Test that admins can delete games."""
    response = await client.delete(
        "/api/v1/games/alphabet-tracing",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 204


async def create_test_user(db_session, role: UserRole = UserRole.ADMIN) -> UserModel:
    """Helper to create admin user for tests."""
    from uuid import uuid4

    from app.core.security import get_password_hash

    user = UserModel(
        id=str(uuid4()),
        email=f"{role.value}@test.com",
        hashed_password=get_password_hash("Test123!@#"),
        is_active=True,
        is_superuser=True,
        role=role,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    return user


async def login_user(client: AsyncClient, user: UserModel) -> str:
    """Login user and return access token."""
    from app.services.audit_service import AuditService

    # Manually verify email for admin user
    if not user.email_verified:
        from app.db.session import async_session

        async with async_session() as session:
            await AuditService.log_action(
                session,
                user_id=user.id,
                user_email=user.email,
                action="email_verified",
                resource_type="user",
                resource_id=user.id,
                details="Verified email for testing",
                ip_address=None,
                user_agent=None,
            )

            user.email_verified = True
            session.add(user)
            await session.commit()

    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": user.email,
            "password": "Test123!@#",
        },
    )

    if response.status_code != 200:
        raise ValueError(f"Login failed: {response.text}")

    token = response.json().get("access_token")
    if not token:
        raise ValueError("No access token in response")

    return token
