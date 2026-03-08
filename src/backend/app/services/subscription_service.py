"""Subscription service for managing game pack subscriptions."""

from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models.subscription_model import (
    Subscription,
    SubscriptionGameSelection,
    SubscriptionPlanType,
    SubscriptionStatus,
)

PLAN_DURATIONS = {
    SubscriptionPlanType.GAME_PACK_5: 30,  # days
    SubscriptionPlanType.GAME_PACK_10: 90,  # days
    SubscriptionPlanType.FULL_ANNUAL: 365,  # days
}

PLAN_PRICES = {
    SubscriptionPlanType.GAME_PACK_5: 150000,  # paise (₹1500)
    SubscriptionPlanType.GAME_PACK_10: 250000,  # paise (₹2500)
    SubscriptionPlanType.FULL_ANNUAL: 600000,  # paise (₹6000)
}

PACK_GAME_LIMITS = {
    SubscriptionPlanType.GAME_PACK_5: 5,
    SubscriptionPlanType.GAME_PACK_10: 10,
    SubscriptionPlanType.FULL_ANNUAL: 35,  # All games
}

PACK_PLANS = {
    SubscriptionPlanType.GAME_PACK_5,
    SubscriptionPlanType.GAME_PACK_10,
}
QUARTERLY_REFRESH_WINDOW_DAYS = 30
QUARTERLY_TOTAL_CYCLES = 3


class SubscriptionService:
    """Service for managing subscriptions."""

    @staticmethod
    def _normalize_plan_type(plan_type: SubscriptionPlanType | str) -> SubscriptionPlanType:
        """Validate and normalize a stored subscription plan type."""
        if isinstance(plan_type, SubscriptionPlanType):
            return plan_type

        try:
            return SubscriptionPlanType(plan_type)
        except ValueError as exc:
            raise ValueError(
                f"Unsupported subscription plan type '{plan_type}'. Update the subscription record."
            ) from exc

    @staticmethod
    def _normalize_datetime(value: datetime) -> datetime:
        """Normalize persisted datetimes to UTC-aware values."""
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)

    @staticmethod
    def _get_active_selections(subscription: Subscription) -> list[SubscriptionGameSelection]:
        return [selection for selection in subscription.game_selections if selection.swapped_at is None]

    @staticmethod
    async def _list_active_selections(
        db: AsyncSession,
        subscription_id: str,
    ) -> list[SubscriptionGameSelection]:
        result = await db.execute(
            select(SubscriptionGameSelection).where(
                SubscriptionGameSelection.subscription_id == subscription_id,
                SubscriptionGameSelection.swapped_at.is_(None),
            )
        )
        return list(result.scalars().all())

    @staticmethod
    def _get_pack_limit(plan_type: SubscriptionPlanType | str) -> int:
        normalized_plan = SubscriptionService._normalize_plan_type(plan_type)
        return PACK_GAME_LIMITS.get(normalized_plan, 0)

    @staticmethod
    def _is_full_access_plan(plan_type: SubscriptionPlanType | str) -> bool:
        return SubscriptionService._normalize_plan_type(plan_type) == SubscriptionPlanType.FULL_ANNUAL

    @staticmethod
    def _is_pack_plan(plan_type: SubscriptionPlanType | str) -> bool:
        return SubscriptionService._normalize_plan_type(plan_type) in PACK_PLANS

    @staticmethod
    def _get_quarterly_cycle(subscription: Subscription, now: datetime | None = None) -> int:
        normalized_plan = SubscriptionService._normalize_plan_type(subscription.plan_type)
        if normalized_plan != SubscriptionPlanType.GAME_PACK_10:
            return 1

        reference_now = now or datetime.now(timezone.utc)
        start_date = SubscriptionService._normalize_datetime(subscription.start_date)
        elapsed_days = max(0, (reference_now - start_date).days)
        return min(QUARTERLY_TOTAL_CYCLES, (elapsed_days // QUARTERLY_REFRESH_WINDOW_DAYS) + 1)

    @staticmethod
    def _get_refresh_state(subscription: Subscription, now: datetime | None = None) -> dict:
        normalized_plan = SubscriptionService._normalize_plan_type(subscription.plan_type)
        if normalized_plan != SubscriptionPlanType.GAME_PACK_10:
            return {
                "refresh_available": False,
                "current_cycle_index": 1,
                "total_cycles": 1,
                "last_refresh_cycle_used": subscription.last_refresh_cycle_used,
                "next_refresh_at": None,
                "refresh_window_label": None,
            }

        reference_now = now or datetime.now(timezone.utc)
        current_cycle = SubscriptionService._get_quarterly_cycle(subscription, reference_now)
        next_refresh_at = None
        if current_cycle < QUARTERLY_TOTAL_CYCLES:
            next_refresh_at = SubscriptionService._normalize_datetime(subscription.start_date) + timedelta(
                days=current_cycle * QUARTERLY_REFRESH_WINDOW_DAYS
            )

        return {
            "refresh_available": current_cycle > 1 and subscription.last_refresh_cycle_used < current_cycle,
            "current_cycle_index": current_cycle,
            "total_cycles": QUARTERLY_TOTAL_CYCLES,
            "last_refresh_cycle_used": subscription.last_refresh_cycle_used,
            "next_refresh_at": next_refresh_at,
            "refresh_window_label": f"Month {current_cycle} of {QUARTERLY_TOTAL_CYCLES}",
        }

    @staticmethod
    async def create_subscription(
        db: AsyncSession,
        parent_id: str,
        plan_type: SubscriptionPlanType,
        payment_reference: Optional[str] = None,
    ) -> Subscription:
        """Create a new subscription (idempotent on payment_reference)."""
        # Check for existing subscription with same payment_reference (idempotency)
        if payment_reference:
            existing = await db.execute(
                select(Subscription).where(Subscription.payment_reference == payment_reference)
            )
            existing_sub = existing.scalar_one_or_none()
            if existing_sub:
                return existing_sub  # Return existing subscription instead of creating duplicate

        now = datetime.now(timezone.utc)
        duration = PLAN_DURATIONS[plan_type]

        subscription = Subscription(
            id=str(uuid4()),
            parent_id=parent_id,
            plan_type=plan_type,
            amount_paid=PLAN_PRICES[plan_type],
            currency="INR",
            start_date=now,
            end_date=now + timedelta(days=duration),
            status=SubscriptionStatus.ACTIVE,
            payment_reference=payment_reference,
        )

        try:
            db.add(subscription)
            await db.commit()
            await db.refresh(subscription)
        except IntegrityError:
            # Handle race condition where subscription was created concurrently
            await db.rollback()
            # Fetch and return the existing subscription
            existing = await db.execute(
                select(Subscription).where(Subscription.payment_reference == payment_reference)
            )
            subscription = existing.scalar_one_or_none()
            if subscription:
                return subscription
            else:
                raise  # Re-raise if it's a different integrity error

        return subscription

    @staticmethod
    async def get_active_subscription(
        db: AsyncSession, parent_id: str
    ) -> Optional[Subscription]:
        """Get the active subscription for a parent."""
        result = await db.execute(
            select(Subscription)
            .execution_options(populate_existing=True)
            .options(selectinload(Subscription.game_selections))
            .where(Subscription.parent_id == parent_id)
            .where(Subscription.status == SubscriptionStatus.ACTIVE)
            .where(Subscription.end_date > datetime.now(timezone.utc))
            .order_by(Subscription.created_at.desc())
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_subscription_by_id(
        db: AsyncSession, subscription_id: str
    ) -> Optional[Subscription]:
        """Get subscription by ID."""
        result = await db.execute(
            select(Subscription)
            .execution_options(populate_existing=True)
            .options(selectinload(Subscription.game_selections))
            .where(Subscription.id == subscription_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def add_game_selection(
        db: AsyncSession,
        subscription_id: str,
        game_ids: list[str],
    ) -> list[SubscriptionGameSelection]:
        """Add game selections to a subscription."""
        # Lock subscription row to prevent race conditions on limit checking
        result = await db.execute(
            select(Subscription)
            .execution_options(populate_existing=True)
            .options(selectinload(Subscription.game_selections))
            .where(Subscription.id == subscription_id)
            .with_for_update()
        )
        subscription = result.scalar_one_or_none()

        if not subscription:
            raise ValueError("Subscription not found")

        normalized_plan = SubscriptionService._normalize_plan_type(subscription.plan_type)
        if normalized_plan == SubscriptionPlanType.FULL_ANNUAL:
            raise ValueError("Full annual subscriptions do not require game selection")

        game_limit = SubscriptionService._get_pack_limit(normalized_plan)
        active_selections = await SubscriptionService._list_active_selections(db, subscription_id)
        existing = len(active_selections)

        # Dedupe game_ids before processing to avoid treating user input duplicates as DB errors
        unique_game_ids = list(dict.fromkeys(game_ids))  # Preserve order while deduping

        if not unique_game_ids:
            raise ValueError("At least one game selection is required")

        if len(unique_game_ids) > game_limit:
            raise ValueError(f"Cannot select more than {game_limit} games for this plan")

        if existing > 0:
            if normalized_plan != SubscriptionPlanType.GAME_PACK_10:
                raise ValueError("This plan keeps the same games for the full term. Choose a new set at renewal.")
            await SubscriptionService.refresh_game_selection(
                db=db,
                subscription=subscription,
                game_ids=unique_game_ids,
            )
            return await SubscriptionService._list_active_selections(db, subscription_id)

        if existing + len(unique_game_ids) > game_limit:
            raise ValueError(
                f"Cannot add {len(unique_game_ids)} games. Limit is {game_limit}, "
                f"currently have {existing}"
            )

        selections = []
        for game_id in unique_game_ids:
            try:
                selection = SubscriptionGameSelection(
                    id=str(uuid4()),
                    subscription_id=subscription_id,
                    game_id=game_id,
                )
                db.add(selection)
                # Flush to catch constraint violations immediately
                await db.flush()
                selections.append(selection)
            except IntegrityError:
                # Handle duplicate game_id from uniqueness constraint
                await db.rollback()
                raise ValueError(f"Game {game_id} is already in your selection")
            except Exception:
                await db.rollback()
                raise

        await db.commit()
        for sel in selections:
            await db.refresh(sel)
        return selections

    @staticmethod
    async def refresh_game_selection(
        db: AsyncSession,
        subscription: Subscription,
        game_ids: list[str],
    ) -> list[SubscriptionGameSelection]:
        """Refresh the active quarterly selection during the current monthly window."""
        normalized_plan = SubscriptionService._normalize_plan_type(subscription.plan_type)
        if normalized_plan != SubscriptionPlanType.GAME_PACK_10:
            raise ValueError("Only the quarterly 10-game pack can refresh games mid-term")

        refresh_state = SubscriptionService._get_refresh_state(subscription)
        if not refresh_state["refresh_available"]:
            raise ValueError("A monthly refresh is not available right now")

        unique_game_ids = list(dict.fromkeys(game_ids))
        game_limit = SubscriptionService._get_pack_limit(normalized_plan)
        if len(unique_game_ids) != game_limit:
            raise ValueError(f"Quarterly refresh requires exactly {game_limit} selected games")

        active_selections = await SubscriptionService._list_active_selections(db, subscription.id)
        active_game_ids = {selection.game_id for selection in active_selections}
        if active_game_ids == set(unique_game_ids):
            raise ValueError("Choose at least one different game before refreshing")

        now = datetime.now(timezone.utc)
        for selection in active_selections:
            selection.swapped_at = now
            selection.original_game_id = selection.game_id

        new_selections: list[SubscriptionGameSelection] = []
        for game_id in unique_game_ids:
            selection = SubscriptionGameSelection(
                id=str(uuid4()),
                subscription_id=subscription.id,
                game_id=game_id,
            )
            db.add(selection)
            new_selections.append(selection)

        subscription.last_refresh_cycle_used = refresh_state["current_cycle_index"]
        await db.flush()
        await db.commit()
        for selection in new_selections:
            await db.refresh(selection)
        return new_selections

    @staticmethod
    async def swap_game(
        db: AsyncSession,
        subscription_id: str,
        old_game_id: str,
        new_game_id: str,
    ) -> SubscriptionGameSelection:
        """Legacy single-game swap path is disabled in the clean prelaunch model."""
        raise ValueError(
            "Single-game swaps are no longer supported. Quarterly plans refresh the full selection monthly."
        )

    @staticmethod
    async def calculate_upgrade_credit(
        db: AsyncSession, subscription_id: str
    ) -> int:
        """Calculate prorated credit for upgrade."""
        subscription = await SubscriptionService.get_subscription_by_id(
            db, subscription_id
        )
        if not subscription:
            raise ValueError("Subscription not found")

        SubscriptionService._normalize_plan_type(subscription.plan_type)

        now = datetime.now(timezone.utc)
        start_date = SubscriptionService._normalize_datetime(subscription.start_date)
        end_date = SubscriptionService._normalize_datetime(subscription.end_date)
        if end_date <= now:
            return 0

        # Use total_seconds() for accurate proration (not .days)
        total_duration = (end_date - start_date).total_seconds()
        remaining_duration = (end_date - now).total_seconds()

        if remaining_duration <= 0:
            return 0

        # Calculate credit as proportion of remaining time
        credit = (remaining_duration / total_duration) * subscription.amount_paid
        return int(credit)

    @staticmethod
    async def upgrade_subscription(
        db: AsyncSession,
        subscription_id: str,
        new_plan: SubscriptionPlanType,
        upgrade_credit: int = 0,
    ) -> Subscription:
        """Upgrade to a new subscription plan."""
        old_subscription = await SubscriptionService.get_subscription_by_id(
            db, subscription_id
        )
        if not old_subscription:
            raise ValueError("Subscription not found")

        if old_subscription.status != SubscriptionStatus.ACTIVE:
            raise ValueError("Cannot upgrade inactive subscription")

        SubscriptionService._normalize_plan_type(old_subscription.plan_type)

        new_price = PLAN_PRICES[new_plan]

        # Actually apply upgrade credit by reducing the amount_paid
        final_amount = max(0, new_price - upgrade_credit)

        # Mark old as upgraded
        old_subscription.status = SubscriptionStatus.UPGRADED
        old_subscription.upgraded_to_id = None  # Will be set after new is created

        # Create new subscription with credit applied
        now = datetime.now(timezone.utc)
        new_duration = PLAN_DURATIONS[new_plan]

        plan_type_str = old_subscription.plan_type.value if hasattr(old_subscription.plan_type, 'value') else old_subscription.plan_type
        notes_parts = [f"Upgraded from {plan_type_str}"]
        if upgrade_credit > 0:
            notes_parts.append(f"Credit applied: ₹{upgrade_credit / 100:.2f}")
            notes_parts.append(f"Original price: ₹{new_price / 100:.2f}")
            notes_parts.append(f"Final price: ₹{final_amount / 100:.2f}")

        new_subscription = Subscription(
            id=str(uuid4()),
            parent_id=old_subscription.parent_id,
            plan_type=new_plan,
            amount_paid=final_amount,  # Credit actually applied!
            currency="INR",
            start_date=now,
            end_date=now + timedelta(days=new_duration),
            status=SubscriptionStatus.ACTIVE,
            payment_reference=f"UPGRADE:{subscription_id}",
            notes=". ".join(notes_parts),
        )

        db.add(new_subscription)
        await db.flush()  # Flush to get new_subscription.id assigned and persisted

        # Link old to new after new subscription is persisted
        old_subscription.upgraded_to_id = new_subscription.id

        await db.commit()
        await db.refresh(new_subscription)
        return new_subscription

    @staticmethod
    async def cancel_subscription(
        db: AsyncSession, subscription_id: str
    ) -> Subscription:
        """Cancel a subscription."""
        subscription = await SubscriptionService.get_subscription_by_id(
            db, subscription_id
        )
        if not subscription:
            raise ValueError("Subscription not found")

        subscription.status = SubscriptionStatus.CANCELLED
        await db.commit()
        await db.refresh(subscription)
        return subscription

    @staticmethod
    async def get_available_games(
        db: AsyncSession, subscription_id: str
    ) -> dict:
        """Get available games info for a subscription."""
        subscription = await SubscriptionService.get_subscription_by_id(
            db, subscription_id
        )
        if not subscription:
            raise ValueError("Subscription not found")

        normalized_plan = SubscriptionService._normalize_plan_type(subscription.plan_type)
        game_limit = SubscriptionService._get_pack_limit(normalized_plan)
        active_selections = await SubscriptionService._list_active_selections(db, subscription.id)
        selected_count = len(active_selections)
        refresh_state = SubscriptionService._get_refresh_state(subscription)
        renewal_prompt = None
        if normalized_plan == SubscriptionPlanType.GAME_PACK_5:
            renewal_prompt = "At renewal you can keep the same 5 games or choose a new 5."

        return {
            "game_limit": game_limit,
            "selected_count": selected_count,
            "remaining_slots": game_limit - selected_count,
            "swap_available": False,
            "plan_type": normalized_plan.value,
            "refresh_available": refresh_state["refresh_available"],
            "current_cycle_index": refresh_state["current_cycle_index"],
            "total_cycles": refresh_state["total_cycles"],
            "last_refresh_cycle_used": refresh_state["last_refresh_cycle_used"],
            "next_refresh_at": refresh_state["next_refresh_at"],
            "refresh_window_label": refresh_state["refresh_window_label"],
            "renewal_prompt": renewal_prompt,
        }

    @staticmethod
    async def can_access_game(
        db: AsyncSession, parent_id: str, game_id: str
    ) -> tuple[bool, str]:
        """Check if user can access a specific game.

        Returns:
            tuple of (can_access: bool, reason: str)
        """
        subscription = await SubscriptionService.get_active_subscription(
            db=db, parent_id=parent_id
        )

        if not subscription:
            return False, "No active subscription"

        # Full annual = access to all games
        normalized_plan = SubscriptionService._normalize_plan_type(subscription.plan_type)
        if normalized_plan == SubscriptionPlanType.FULL_ANNUAL:
            return True, "Full annual subscription"

        # For packs, check only active game selections (swapped_at IS NULL)
        active_selections = {
            selection.game_id
            for selection in await SubscriptionService._list_active_selections(db, subscription.id)
        }

        if game_id in active_selections:
            return True, "Game selected in pack"

        return False, f"Game not in your {normalized_plan.value} selection"

    @staticmethod
    async def get_subscription_for_parent(
        db: AsyncSession, parent_id: str
    ) -> Optional[Subscription]:
        """Get active subscription for a parent."""
        return await SubscriptionService.get_active_subscription(db, parent_id)
