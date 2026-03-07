"""Tests for achievement service."""

from uuid import uuid4

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.achievement import Achievement
from app.db.models.profile import Profile
from app.db.models.user import User
from app.schemas.achievement import AchievementCreate


class TestAchievementService:
    """Test achievement service."""

    async def test_unlock_achievement_success(self, db_session: AsyncSession):
        """Test unlocking an achievement."""
        from app.services.achievement_service import AchievementService
        from app.core.security import get_password_hash

        # Create user and profile
        user = User(
            email=f"ach_test_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        profile = Profile(
            name="Test Child",
            age=5,
            preferred_language="en",
            parent_id=user.id,
        )
        db_session.add(profile)
        await db_session.commit()
        await db_session.refresh(profile)

        # Unlock achievement
        achievement_in = AchievementCreate(
            profile_id=profile.id,
            achievement_type="first_game_complete",
        )

        achievement = await AchievementService.unlock_achievement(db_session, achievement_in)

        assert achievement is not None
        assert achievement.profile_id == profile.id
        assert achievement.achievement_type == "first_game_complete"

    async def test_unlock_achievement_idempotent(self, db_session: AsyncSession):
        """Test unlocking same achievement twice returns existing."""
        from app.services.achievement_service import AchievementService
        from app.core.security import get_password_hash

        # Create user and profile
        user = User(
            email=f"ach_idem_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        profile = Profile(
            name="Test Child",
            age=5,
            preferred_language="en",
            parent_id=user.id,
        )
        db_session.add(profile)
        await db_session.commit()
        await db_session.refresh(profile)

        # Unlock achievement twice
        achievement_in = AchievementCreate(
            profile_id=profile.id,
            achievement_type="streak_7_days",
        )

        first = await AchievementService.unlock_achievement(db_session, achievement_in)
        second = await AchievementService.unlock_achievement(db_session, achievement_in)

        assert first.id == second.id

    async def test_unlock_achievement_invalid_profile(self, db_session: AsyncSession):
        """Test unlocking achievement for non-existent profile fails."""
        from app.services.achievement_service import AchievementService

        achievement_in = AchievementCreate(
            profile_id=str(uuid4()),
            achievement_type="first_game_complete",
        )

        with pytest.raises(ValueError, match="Profile with id"):
            await AchievementService.unlock_achievement(db_session, achievement_in)

    async def test_get_by_profile(self, db_session: AsyncSession):
        """Test getting achievements by profile."""
        from app.services.achievement_service import AchievementService
        from app.core.security import get_password_hash

        # Create user and profile
        user = User(
            email=f"ach_get_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        profile = Profile(
            name="Test Child",
            age=5,
            preferred_language="en",
            parent_id=user.id,
        )
        db_session.add(profile)
        await db_session.commit()
        await db_session.refresh(profile)

        # Create achievements
        for ach_type in ["first_win", "perfect_score", "fast_learner"]:
            achievement_in = AchievementCreate(
                profile_id=profile.id,
                achievement_type=ach_type,
            )
            await AchievementService.unlock_achievement(db_session, achievement_in)

        # Get achievements
        achievements = await AchievementService.get_by_profile(db_session, profile.id)

        assert len(achievements) == 3
        achievement_types = {a.achievement_type for a in achievements}
        assert achievement_types == {"first_win", "perfect_score", "fast_learner"}

    async def test_get_by_profile_empty(self, db_session: AsyncSession):
        """Test getting achievements for profile with none."""
        from app.services.achievement_service import AchievementService
        from app.core.security import get_password_hash

        # Create user and profile
        user = User(
            email=f"ach_empty_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        profile = Profile(
            name="Test Child",
            age=5,
            preferred_language="en",
            parent_id=user.id,
        )
        db_session.add(profile)
        await db_session.commit()
        await db_session.refresh(profile)

        achievements = await AchievementService.get_by_profile(db_session, profile.id)
        assert len(achievements) == 0
