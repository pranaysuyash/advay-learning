"""Subscription service for managing game pack subscriptions."""

from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.subscription import (
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
        """Create a new subscription."""
        now = datetime.utcnow()
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

        db.add(subscription)
        await db.commit()
        await db.refresh(subscription)
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
            .where(Subscription.end_date > datetime.utcnow())
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
        subscription = await SubscriptionService.get_subscription_by_id(
            db, subscription_id
        )
        if not subscription:
            raise ValueError("Subscription not found")

        game_limit = PACK_GAME_LIMITS.get(subscription.plan_type, 0)
        existing = len(subscription.game_selections)

        if existing + len(game_ids) > game_limit:
            raise ValueError(
                f"Cannot add {len(game_ids)} games. Limit is {game_limit}, "
                f"currently have {existing}"
            )

        selections = []
        for game_id in game_ids:
            selection = SubscriptionGameSelection(
                id=str(uuid4()),
                subscription_id=subscription_id,
                game_id=game_id,
            )
            db.add(selection)
            selections.append(selection)

        await db.commit()
        for sel in selections:
            await db.refresh(sel)
        return selections

    @staticmethod
    async def swap_game(
        db: AsyncSession,
        subscription_id: str,
        new_game_id: str,
    ) -> SubscriptionGameSelection:
        """Swap one game in the subscription (1 free swap per pack)."""
        subscription = await SubscriptionService.get_subscription_by_id(
            db, subscription_id
        )
        if not subscription:
            raise ValueError("Subscription not found")

        if subscription.game_swap_used:
            raise ValueError("Game swap already used")

        if subscription.status != SubscriptionStatus.ACTIVE:
            raise ValueError("Subscription not active")

        # Mark swap as used
        subscription.game_swap_used = True

        # Create new selection
        selection = SubscriptionGameSelection(
            id=str(uuid4()),
            subscription_id=subscription_id,
            game_id=new_game_id,
            swapped_at=datetime.utcnow(),
        )

        db.add(selection)
        await db.commit()
        await db.refresh(selection)
        return selection

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

        now = datetime.utcnow()
        if subscription.end_date <= now:
            return 0

        remaining_days = (subscription.end_date - now).days
        total_days = PLAN_DURATIONS[subscription.plan_type]

        if remaining_days <= 0:
            return 0

        credit = (remaining_days / total_days) * subscription.amount_paid
        return int(credit)

    @staticmethod
    async def upgrade_subscription(
        db: AsyncSession,
        subscription_id: str,
        new_plan: SubscriptionPlanType,
    ) -> Subscription:
        """Upgrade to a new subscription plan."""
        old_subscription = await SubscriptionService.get_subscription_by_id(
            db, subscription_id
        )
        if not old_subscription:
            raise ValueError("Subscription not found")

        if old_subscription.status != SubscriptionStatus.ACTIVE:
            raise ValueError("Cannot upgrade inactive subscription")

        # Calculate credit for upgrade (applied to new subscription)
        upgrade_credit = await SubscriptionService.calculate_upgrade_credit(
            db, subscription_id
        )
        new_price = PLAN_PRICES[new_plan]

        # Mark old as upgraded
        old_subscription.status = SubscriptionStatus.UPGRADED
        old_subscription.upgraded_to_id = None  # Will be set after new is created

        # Create new subscription
        now = datetime.utcnow()
        new_duration = PLAN_DURATIONS[new_plan]

        new_subscription = Subscription(
            id=str(uuid4()),
            parent_id=old_subscription.parent_id,
            plan_type=new_plan,
            amount_paid=new_price,
            currency="INR",
            start_date=now,
            end_date=now + timedelta(days=new_duration),
            status=SubscriptionStatus.ACTIVE,
            payment_reference=f"UPGRADE:{subscription_id}",
            notes=f"Upgrade credit applied: ₹{upgrade_credit / 100:.2f}",
        )

        # Link old to new
        old_subscription.upgraded_to_id = new_subscription.id

        db.add(new_subscription)
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
        selected_count = len(subscription.game_selections)
        swap_remaining = not subscription.game_swap_used

        return {
            "game_limit": game_limit,
            "selected_count": selected_count,
            "remaining_slots": game_limit - selected_count,
            "swap_available": swap_remaining,
            "plan_type": subscription.plan_type.value,
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
        
        # For packs, check game selection
        selected_game_ids = {s.game_id for s in subscription.game_selections}
        
        if game_id in selected_game_ids:
            return True, "Game selected in pack"
        
        return False, f"Game not in your {subscription.plan_type.value} selection"

    @staticmethod
    async def get_subscription_for_parent(
        db: AsyncSession, parent_id: str
    ) -> Optional[Subscription]:
        """Get active subscription for a parent."""
        return await SubscriptionService.get_active_subscription(db, parent_id)
