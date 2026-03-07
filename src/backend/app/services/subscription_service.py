"""Subscription service for managing game pack subscriptions."""

from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.subscription_model import (
    Subscription,
    SubscriptionGameSelection,
    SubscriptionPlanType,
    SubscriptionStatus,
)

PLAN_DURATIONS = {
    SubscriptionPlanType.GAME_PACK_5: 90,  # days
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


class SubscriptionService:
    """Service for managing subscriptions."""

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
            select(Subscription).where(Subscription.id == subscription_id)
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
            .where(Subscription.id == subscription_id)
            .with_for_update()
        )
        subscription = result.scalar_one_or_none()

        if not subscription:
            raise ValueError("Subscription not found")

        game_limit = PACK_GAME_LIMITS.get(subscription.plan_type, 0)
        # Count only active selections (swapped_at IS NULL)
        active_selections = [s for s in subscription.game_selections if s.swapped_at is None]
        existing = len(active_selections)

        # Dedupe game_ids before processing to avoid treating user input duplicates as DB errors
        unique_game_ids = list(dict.fromkeys(game_ids))  # Preserve order while deduping

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
    async def swap_game(
        db: AsyncSession,
        subscription_id: str,
        old_game_id: str,
        new_game_id: str,
    ) -> SubscriptionGameSelection:
        """Swap one game in the subscription (1 free swap per pack)."""
        if old_game_id == new_game_id:
            raise ValueError("Old and new game must be different")

        try:
            # Lock subscription row to prevent race conditions on swap usage
            result = await db.execute(
                select(Subscription)
                .where(Subscription.id == subscription_id)
                .with_for_update()
            )
            subscription = result.scalar_one_or_none()

            if not subscription:
                raise ValueError("Subscription not found")
            if subscription.status != SubscriptionStatus.ACTIVE:
                raise ValueError("Subscription not active")
            if subscription.game_swap_used:
                raise ValueError("Game swap already used")

            # Find the active selection for old game to swap out
            old_selection = next(
                (s for s in subscription.game_selections
                 if s.game_id == old_game_id and s.swapped_at is None),
                None
            )
            if not old_selection:
                raise ValueError(f"Game {old_game_id} not found in active selections")

            # Prevent swapping into a game already selected (active)
            already_active = any(
                s.game_id == new_game_id and s.swapped_at is None
                for s in subscription.game_selections
            )
            if already_active:
                raise ValueError(f"Game {new_game_id} is already in your active selection")

            # Mark old selection as swapped
            old_selection.swapped_at = datetime.now(timezone.utc)
            old_selection.original_game_id = old_game_id

            # Mark swap as used
            subscription.game_swap_used = True

            # Create new active selection
            new_selection = SubscriptionGameSelection(
                id=str(uuid4()),
                subscription_id=subscription_id,
                game_id=new_game_id,
            )
            db.add(new_selection)

            # Flush catches uniqueness violations before commit
            await db.flush()
            await db.commit()
            await db.refresh(new_selection)
            return new_selection

        except IntegrityError:
            await db.rollback()
            raise ValueError(f"Game {new_game_id} is already in your selection")
        except Exception:
            await db.rollback()
            raise

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

        now = datetime.now(timezone.utc)
        if subscription.end_date <= now:
            return 0

        # Use total_seconds() for accurate proration (not .days)
        total_duration = (subscription.end_date - subscription.start_date).total_seconds()
        remaining_duration = (subscription.end_date - now).total_seconds()

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

        game_limit = PACK_GAME_LIMITS.get(subscription.plan_type, 0)
        # Count only active selections (swapped_at IS NULL)
        active_selections = [s for s in subscription.game_selections if s.swapped_at is None]
        selected_count = len(active_selections)
        swap_remaining = not subscription.game_swap_used

        return {
            "game_limit": game_limit,
            "selected_count": selected_count,
            "remaining_slots": game_limit - selected_count,
            "swap_available": swap_remaining,
            "plan_type": subscription.plan_type.value if hasattr(subscription.plan_type, 'value') else subscription.plan_type,
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
        if subscription.plan_type == SubscriptionPlanType.FULL_ANNUAL:
            return True, "Full annual subscription"

        # For packs, check only active game selections (swapped_at IS NULL)
        active_selections = {s.game_id for s in subscription.game_selections if s.swapped_at is None}

        if game_id in active_selections:
            return True, "Game selected in pack"

        plan_type_str = subscription.plan_type.value if hasattr(subscription.plan_type, 'value') else subscription.plan_type
        return False, f"Game not in your {plan_type_str} selection"

    @staticmethod
    async def get_subscription_for_parent(
        db: AsyncSession, parent_id: str
    ) -> Optional[Subscription]:
        """Get active subscription for a parent."""
        return await SubscriptionService.get_active_subscription(db, parent_id)
