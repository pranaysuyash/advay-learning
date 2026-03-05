"""Data export service for GDPR/COPPA compliance."""

from datetime import datetime, timezone
from typing import List
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models.profile import Profile
from app.db.models.progress import Progress
from app.db.models.subscription_model import Subscription
from app.db.models.user import User
from app.schemas.data_export import (
    DataExportResponse,
    ProfileExportData,
    ProgressExportData,
    SubscriptionExportData,
    UserExportData,
)


class DataExportService:
    """Service for exporting user data (GDPR/COPPA compliance)."""

    @staticmethod
    async def export_user_data(
        db: AsyncSession,
        user_id: str,
        include_progress: bool = True,
        include_subscriptions: bool = True,
    ) -> DataExportResponse:
        """Export all data for a user.

        Args:
            db: Database session
            user_id: User ID to export
            include_progress: Whether to include progress data
            include_subscriptions: Whether to include subscription data

        Returns:
            DataExportResponse with all user data
        """
        # Get user
        user_result = await db.execute(
            select(User).where(User.id == user_id)
        )
        user = user_result.scalar_one()

        # Get profiles with related data
        profiles_result = await db.execute(
            select(Profile)
            .where(Profile.parent_id == user_id)
            .options(selectinload(Profile.progress) if include_progress else None)
        )
        profiles = profiles_result.scalars().all()

        # Build profile export data
        profile_exports: List[ProfileExportData] = []
        progress_exports: List[ProgressExportData] = []

        for profile in profiles:
            profile_exports.append(
                ProfileExportData(
                    id=profile.id,
                    name=profile.name,
                    age=profile.age,
                    preferred_language=profile.preferred_language,
                    settings=profile.settings or {},
                    created_at=profile.created_at,
                    updated_at=profile.updated_at,
                )
            )

            if include_progress and hasattr(profile, 'progress'):
                for progress in profile.progress:
                    progress_exports.append(
                        ProgressExportData(
                            id=progress.id,
                            profile_id=progress.profile_id,
                            activity_type=progress.activity_type,
                            content_id=progress.content_id,
                            score=progress.score,
                            duration_seconds=progress.duration_seconds,
                            meta_data=progress.meta_data or {},
                            completed=progress.completed,
                            completed_at=progress.completed_at,
                            idempotency_key=progress.idempotency_key,
                        )
                    )

        # Get subscriptions if requested
        subscription_exports: List[SubscriptionExportData] = []
        if include_subscriptions:
            subs_result = await db.execute(
                select(Subscription).where(Subscription.user_id == user_id)
            )
            subscriptions = subs_result.scalars().all()

            for sub in subscriptions:
                subscription_exports.append(
                    SubscriptionExportData(
                        id=sub.id,
                        status=sub.status,
                        plan_type=sub.plan_type,
                        started_at=sub.started_at,
                        expires_at=sub.expires_at,
                        created_at=sub.created_at,
                        updated_at=sub.updated_at,
                    )
                )

        # Build user export data
        user_export = UserExportData(
            id=user.id,
            email=user.email,
            role=user.role,
            email_verified=user.email_verified,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )

        return DataExportResponse(
            export_id=str(uuid4()),
            generated_at=datetime.now(timezone.utc),
            user=user_export,
            profiles=profile_exports,
            progress=progress_exports,
            subscriptions=subscription_exports,
        )

    @staticmethod
    async def get_data_summary(
        db: AsyncSession,
        user_id: str,
    ) -> dict:
        """Get summary of data that would be exported.

        Args:
            db: Database session
            user_id: User ID to summarize

        Returns:
            Summary dict with counts
        """
        # Count profiles
        profile_count_result = await db.execute(
            select(Profile).where(Profile.parent_id == user_id)
        )
        profiles = profile_count_result.scalars().all()
        profile_count = len(profiles)

        # Count progress records
        profile_ids = [p.id for p in profiles]
        progress_count = 0
        if profile_ids:
            progress_result = await db.execute(
                select(Progress).where(Progress.profile_id.in_(profile_ids))
            )
            progress_count = len(progress_result.scalars().all())

        # Count subscriptions
        sub_result = await db.execute(
            select(Subscription).where(Subscription.user_id == user_id)
        )
        subscription_count = len(sub_result.scalars().all())

        return {
            "profile_count": profile_count,
            "progress_count": progress_count,
            "subscription_count": subscription_count,
        }
