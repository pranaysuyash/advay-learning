"""Progress service for business logic."""

from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.models.progress import Progress
from app.schemas.progress import ProgressCreate, ProgressUpdate

settings = get_settings()


class DuplicateProgressError(Exception):
    """Raised when an idempotency_key for a profile already exists."""

    def __init__(self, message: str, existing_id: str | None = None):
        super().__init__(message)
        self.existing_id = existing_id


class ProgressService:
    """Progress service."""

    @staticmethod
    def _parse_client_timestamp(timestamp: str | None) -> datetime | None:
        """Parse client-provided timestamp into UTC-naive datetime for DB storage."""
        if not timestamp:
            return None
        try:
            parsed = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
        except ValueError:
            return None

        if parsed.tzinfo is None:
            return parsed

        return parsed.astimezone(timezone.utc).replace(tzinfo=None)

    @staticmethod
    async def get_by_id(db: AsyncSession, progress_id: str) -> Optional[Progress]:
        """Get progress by ID."""
        result = await db.execute(select(Progress).where(Progress.id == progress_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_profile(db: AsyncSession, profile_id: str) -> List[Progress]:
        """Get progress by profile ID."""
        result = await db.execute(
            select(Progress)
            .where(Progress.profile_id == profile_id)
            .order_by(desc(Progress.completed_at))
        )
        return list(result.scalars().all())

    @staticmethod
    async def create(
        db: AsyncSession, profile_id: str, progress_in: ProgressCreate
    ) -> Progress:
        """Create new progress entry, respecting optional idempotency_key.

        If the provided idempotency_key already exists for the profile, raise DuplicateProgressError
        and include the existing record id in the exception for easier handling by callers.
        """
        key = (
            getattr(progress_in, "idempotency_key", None)
            if isinstance(progress_in, ProgressCreate)
            else (
                progress_in.get("idempotency_key")
                if isinstance(progress_in, dict)
                else None
            )
        )

        # Fast path: if key provided, check for existing record
        if key:
            result = await db.execute(
                select(Progress).where(
                    Progress.profile_id == profile_id, Progress.idempotency_key == key
                )
            )
            existing = result.scalar_one_or_none()
            if existing:
                raise DuplicateProgressError(
                    "Duplicate progress for idempotency_key",
                    existing_id=str(existing.id),
                )

        # Build progress instance (support dict payloads from batch)
        data = (
            progress_in
            if isinstance(progress_in, ProgressCreate)
            else ProgressCreate(**progress_in)
        )

        progress_kwargs = {
            "profile_id": profile_id,
            "activity_type": data.activity_type,
            "content_id": data.content_id,
            "score": data.score,
            "duration_seconds": data.duration_seconds,
            "meta_data": data.meta_data or {},
            "idempotency_key": data.idempotency_key,
            "completed": data.completed,
        }

        if settings.USE_CLIENT_EVENT_TIME:
            parsed_completed_at = ProgressService._parse_client_timestamp(data.timestamp)
            if parsed_completed_at is not None:
                progress_kwargs["completed_at"] = parsed_completed_at

        progress = Progress(
            **progress_kwargs,
        )
        db.add(progress)

        try:
            await db.commit()
        except Exception:
            # If an integrity error occurs due to a unique constraint, convert to DuplicateProgressError
            await db.rollback()
            # Attempt to lookup existing record to return useful info
            if key:
                result = await db.execute(
                    select(Progress).where(
                        Progress.profile_id == profile_id,
                        Progress.idempotency_key == key,
                    )
                )
                existing = result.scalar_one_or_none()
                if existing:
                    raise DuplicateProgressError(
                        "Duplicate progress (race)", existing_id=str(existing.id)
                    )
            raise

        await db.refresh(progress)
        return progress

    @staticmethod
    async def update(
        db: AsyncSession, progress: Progress, progress_in: ProgressUpdate
    ) -> Progress:
        """Update progress."""
        update_data = progress_in.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(progress, field, value)

        await db.commit()
        await db.refresh(progress)
        return progress

    @staticmethod
    async def delete(db: AsyncSession, progress: Progress) -> None:
        """Delete progress."""
        await db.delete(progress)
        await db.commit()
