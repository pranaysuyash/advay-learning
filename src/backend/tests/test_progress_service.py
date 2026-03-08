"""Tests for ProgressService."""

import pytest
import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.progress_service import ProgressService, DuplicateProgressError
from app.schemas.progress import ProgressCreate, ProgressUpdate
from app.db.models.progress import Progress
from app.db.models.profile import Profile
from app.db.models.user import User


@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create a test user."""
    user = User(
        id=f"test-user-{uuid.uuid4()}",
        email=f"test-{uuid.uuid4()}@example.com",
        hashed_password="hashed",
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def test_profile(db_session: AsyncSession, test_user: User) -> Profile:
    """Create a test profile."""
    profile = Profile(
        id=f"test-profile-{uuid.uuid4()}",
        parent_id=test_user.id,
        name="Test Child",
        age=5,
        preferred_language="en",
    )
    db_session.add(profile)
    await db_session.commit()
    await db_session.refresh(profile)
    return profile


@pytest.fixture
async def test_progress(db_session: AsyncSession, test_profile: Profile) -> Progress:
    """Create a test progress entry."""
    progress = Progress(
        id="test-progress-1",
        profile_id=test_profile.id,
        activity_type="game",
        content_id="game-1",
        score=100,
        duration_seconds=60,
        completed=True,
        meta_data={"level": 1},
    )
    db_session.add(progress)
    await db_session.commit()
    await db_session.refresh(progress)
    return progress


@pytest.fixture
async def test_progress_entries(db_session: AsyncSession, test_profile: Profile) -> list[Progress]:
    """Create multiple test progress entries."""
    entries = [
        Progress(
            id=f"test-progress-{i}",
            profile_id=test_profile.id,
            activity_type="game" if i % 2 == 0 else "quiz",
            content_id=f"content-{i}",
            score=50 * (i + 1),
            duration_seconds=30 * (i + 1),
            completed=True,
            completed_at=datetime(2024, 1, i + 1, 12, 0, 0),
        )
        for i in range(5)
    ]
    for entry in entries:
        db_session.add(entry)
    await db_session.commit()
    return entries


class TestParseClientTimestamp:
    """Test _parse_client_timestamp method."""

    def test_parse_none_timestamp(self):
        """Test parsing None returns None."""
        result = ProgressService._parse_client_timestamp(None)
        assert result is None

    def test_parse_empty_timestamp(self):
        """Test parsing empty string returns None."""
        result = ProgressService._parse_client_timestamp("")
        assert result is None

    def test_parse_iso_timestamp(self):
        """Test parsing ISO format timestamp."""
        ts = "2024-01-15T10:30:00"
        result = ProgressService._parse_client_timestamp(ts)
        assert result == datetime(2024, 1, 15, 10, 30, 0)

    def test_parse_iso_timestamp_with_z(self):
        """Test parsing ISO format with Z (UTC)."""
        ts = "2024-01-15T10:30:00Z"
        result = ProgressService._parse_client_timestamp(ts)
        # Should convert to UTC naive
        assert result is not None
        assert result.tzinfo is None

    def test_parse_iso_timestamp_with_offset(self):
        """Test parsing ISO format with timezone offset."""
        ts = "2024-01-15T10:30:00+05:30"
        result = ProgressService._parse_client_timestamp(ts)
        assert result is not None
        assert result.tzinfo is None  # Converted to UTC naive

    def test_parse_invalid_timestamp(self):
        """Test parsing invalid timestamp returns None."""
        result = ProgressService._parse_client_timestamp("not-a-timestamp")
        assert result is None


class TestGetById:
    """Test get_by_id method."""

    async def test_get_by_id_success(self, db_session: AsyncSession, test_progress: Progress):
        """Test getting progress by ID."""
        result = await ProgressService.get_by_id(db_session, test_progress.id)
        
        assert result is not None
        assert result.id == test_progress.id
        assert result.score == 100

    async def test_get_by_id_not_found(self, db_session: AsyncSession):
        """Test getting non-existent progress."""
        result = await ProgressService.get_by_id(db_session, "nonexistent-id")
        
        assert result is None


class TestGetByProfile:
    """Test get_by_profile method."""

    async def test_get_by_profile(self, db_session: AsyncSession, test_profile: Profile, test_progress_entries: list[Progress]):
        """Test getting progress by profile ID."""
        results = await ProgressService.get_by_profile(db_session, test_profile.id)
        
        assert len(results) == 5

    async def test_get_by_profile_empty(self, db_session: AsyncSession, test_profile: Profile):
        """Test getting progress for profile with no entries."""
        unique_id = str(uuid.uuid4())
        results = await ProgressService.get_by_profile(db_session, f"profile-no-entries-{unique_id}")
        
        assert len(results) == 0

    async def test_get_by_profile_ordered_by_completed_at(self, db_session: AsyncSession, test_profile: Profile, test_progress_entries: list[Progress]):
        """Test results are ordered by completed_at desc."""
        results = await ProgressService.get_by_profile(db_session, test_profile.id)
        
        # Should be ordered newest first
        for i in range(len(results) - 1):
            assert results[i].completed_at >= results[i + 1].completed_at


class TestCreate:
    """Test create method."""

    async def test_create_progress(self, db_session: AsyncSession, test_profile: Profile):
        """Test creating new progress."""
        data = ProgressCreate(
            activity_type="game",
            content_id="new-game",
            score=150,
            duration_seconds=120,
            completed=True,
        )
        
        result = await ProgressService.create(db_session, test_profile.id, data)
        
        assert result.profile_id == test_profile.id
        assert result.activity_type == "game"
        assert result.content_id == "new-game"
        assert result.score == 150
        assert result.duration_seconds == 120
        assert result.completed is True

    async def test_create_progress_with_metadata(self, db_session: AsyncSession, test_profile: Profile):
        """Test creating progress with metadata."""
        data = ProgressCreate(
            activity_type="game",
            content_id="game-with-meta",
            score=100,
            meta_data={"level": 5, "difficulty": "hard"},
        )
        
        result = await ProgressService.create(db_session, test_profile.id, data)
        
        assert result.meta_data == {"level": 5, "difficulty": "hard"}

    async def test_create_progress_with_idempotency_key(self, db_session: AsyncSession, test_profile: Profile):
        """Test creating progress with idempotency key."""
        data = ProgressCreate(
            activity_type="game",
            content_id="idempotent-game",
            score=100,
            idempotency_key="unique-key-123",
        )
        
        result = await ProgressService.create(db_session, test_profile.id, data)
        
        assert result.idempotency_key == "unique-key-123"

    async def test_create_progress_duplicate_idempotency_key(self, db_session: AsyncSession, test_profile: Profile):
        """Test duplicate idempotency key raises error."""
        # First create
        data = ProgressCreate(
            activity_type="game",
            content_id="duplicate-game",
            score=100,
            idempotency_key="duplicate-key",
        )
        await ProgressService.create(db_session, test_profile.id, data)
        
        # Second create with same key should fail
        with pytest.raises(DuplicateProgressError) as exc_info:
            await ProgressService.create(db_session, test_profile.id, data)
        
        assert "Duplicate" in str(exc_info.value)
        assert exc_info.value.existing_id is not None

    async def test_create_progress_from_dict(self, db_session: AsyncSession, test_profile: Profile):
        """Test creating progress from dict (batch support)."""
        data = {
            "activity_type": "quiz",
            "content_id": "dict-quiz",
            "score": 75,
            "duration_seconds": 45,
        }
        
        result = await ProgressService.create(db_session, test_profile.id, data)
        
        assert result.activity_type == "quiz"
        assert result.score == 75

    async def test_create_progress_with_timestamp(self, db_session: AsyncSession, test_profile: Profile, monkeypatch):
        """Test creating progress with client timestamp."""
        monkeypatch.setattr("app.services.progress_service.settings.USE_CLIENT_EVENT_TIME", True)
        
        data = ProgressCreate(
            activity_type="game",
            content_id="timed-game",
            score=100,
            timestamp="2024-03-15T14:30:00Z",
        )
        
        result = await ProgressService.create(db_session, test_profile.id, data)
        
        assert result.completed_at is not None
        assert result.completed_at.year == 2024
        assert result.completed_at.month == 3
        assert result.completed_at.day == 15


class TestUpdate:
    """Test update method."""

    async def test_update_progress(self, db_session: AsyncSession, test_progress: Progress):
        """Test updating progress."""
        update_data = ProgressUpdate(
            score=200,
            duration_seconds=120,
        )
        
        result = await ProgressService.update(db_session, test_progress, update_data)
        
        assert result.score == 200
        assert result.duration_seconds == 120
        # Unchanged fields remain
        assert result.activity_type == "game"

    async def test_update_progress_partial(self, db_session: AsyncSession, test_progress: Progress):
        """Test partial update."""
        original_score = test_progress.score
        update_data = ProgressUpdate(
            duration_seconds=90,
        )
        
        result = await ProgressService.update(db_session, test_progress, update_data)
        
        assert result.duration_seconds == 90
        assert result.score == original_score  # Unchanged

    async def test_update_progress_metadata(self, db_session: AsyncSession, test_progress: Progress):
        """Test updating metadata."""
        update_data = ProgressUpdate(
            meta_data={"new": "data"},
        )
        
        result = await ProgressService.update(db_session, test_progress, update_data)
        
        assert result.meta_data == {"new": "data"}


class TestDelete:
    """Test delete method."""

    async def test_delete_progress(self, db_session: AsyncSession, test_progress: Progress):
        """Test deleting progress."""
        progress_id = test_progress.id
        
        await ProgressService.delete(db_session, test_progress)
        
        # Verify it's gone
        result = await ProgressService.get_by_id(db_session, progress_id)
        assert result is None


class TestDuplicateProgressError:
    """Test DuplicateProgressError exception."""

    def test_error_with_message(self):
        """Test creating error with message."""
        error = DuplicateProgressError("Test message")
        
        assert str(error) == "Test message"
        assert error.existing_id is None

    def test_error_with_existing_id(self):
        """Test creating error with existing_id."""
        error = DuplicateProgressError("Duplicate found", existing_id="progress-123")
        
        assert str(error) == "Duplicate found"
        assert error.existing_id == "progress-123"
