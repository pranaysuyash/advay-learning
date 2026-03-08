"""Tests for subscription service."""

from datetime import datetime, timedelta, timezone
from unittest.mock import patch
from uuid import uuid4

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.subscription_model import (
    Subscription,
    SubscriptionPlanType,
    SubscriptionStatus,
)
from app.db.models.user import User


async def create_subscription_test_user(db_session: AsyncSession, email_prefix: str) -> User:
    """Create a unique verified user for subscription tests."""
    from app.core.security import get_password_hash

    user = User(
        email=f"{email_prefix}_{uuid4()}@test.com",
        hashed_password=get_password_hash("password123"),
        is_active=True,
        email_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


class TestCreateSubscription:
    """Test subscription creation."""

    async def test_create_subscription_success(self, db_session: AsyncSession):
        """Test creating a subscription."""
        from app.services.subscription_service import SubscriptionService
        from app.core.security import get_password_hash

        # Create a unique user for this test
        user = User(
            email=f"sub_test_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        subscription = await SubscriptionService.create_subscription(
            db=db_session,
            parent_id=user.id,
            plan_type=SubscriptionPlanType.GAME_PACK_5,
            payment_reference=f"pay_test_{uuid4()}",
        )

        assert subscription is not None
        assert subscription.parent_id == user.id
        assert subscription.plan_type == SubscriptionPlanType.GAME_PACK_5
        assert subscription.status == SubscriptionStatus.ACTIVE
        assert subscription.amount_paid == 150000  # ₹1500 in paise

    async def test_create_subscription_idempotent(self, db_session: AsyncSession):
        """Test that creating subscription with same payment ref is idempotent."""
        from app.services.subscription_service import SubscriptionService
        from app.core.security import get_password_hash

        user = User(
            email=f"sub_idem_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        payment_ref = f"pay_idem_{uuid4()}"

        # Create first subscription
        sub1 = await SubscriptionService.create_subscription(
            db=db_session,
            parent_id=user.id,
            plan_type=SubscriptionPlanType.GAME_PACK_5,
            payment_reference=payment_ref,
        )

        # Try to create again with same payment reference
        sub2 = await SubscriptionService.create_subscription(
            db=db_session,
            parent_id=user.id,
            plan_type=SubscriptionPlanType.GAME_PACK_5,
            payment_reference=payment_ref,
        )

        # Should return the same subscription
        assert sub1.id == sub2.id


class TestGetActiveSubscription:
    """Test getting active subscription."""

    async def test_get_active_subscription_exists(self, db_session: AsyncSession):
        """Test getting active subscription when one exists."""
        from app.services.subscription_service import SubscriptionService
        from app.core.security import get_password_hash

        user = User(
            email=f"sub_active_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Create subscription
        await SubscriptionService.create_subscription(
            db=db_session,
            parent_id=user.id,
            plan_type=SubscriptionPlanType.GAME_PACK_5,
            payment_reference=f"pay_active_{uuid4()}",
        )

        # Get active subscription
        active = await SubscriptionService.get_active_subscription(db_session, user.id)

        assert active is not None
        assert active.parent_id == user.id
        assert active.status == SubscriptionStatus.ACTIVE

    async def test_get_active_subscription_none(self, db_session: AsyncSession):
        """Test getting active subscription when none exists."""
        from app.services.subscription_service import SubscriptionService
        from app.core.security import get_password_hash

        user = User(
            email=f"sub_none_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(user)
        await db_session.commit()

        active = await SubscriptionService.get_active_subscription(db_session, user.id)
        assert active is None


class TestGetSubscriptionById:
    """Test getting subscription by ID."""

    async def test_get_subscription_by_id_success(self, db_session: AsyncSession):
        """Test getting subscription by ID."""
        from app.services.subscription_service import SubscriptionService
        from app.core.security import get_password_hash

        user = User(
            email=f"sub_byid_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Create subscription
        created = await SubscriptionService.create_subscription(
            db=db_session,
            parent_id=user.id,
            plan_type=SubscriptionPlanType.GAME_PACK_5,
            payment_reference=f"pay_byid_{uuid4()}",
        )

        # Get by ID
        fetched = await SubscriptionService.get_subscription_by_id(db_session, created.id)

        assert fetched is not None
        assert fetched.id == created.id

    async def test_get_subscription_by_id_not_found(self, db_session: AsyncSession):
        """Test getting non-existent subscription."""
        from app.services.subscription_service import SubscriptionService

        fetched = await SubscriptionService.get_subscription_by_id(db_session, str(uuid4()))
        assert fetched is None


class TestCancelSubscription:
    """Test subscription cancellation."""

    async def test_cancel_subscription_success(self, db_session: AsyncSession):
        """Test cancelling a subscription."""
        from app.services.subscription_service import SubscriptionService
        from app.core.security import get_password_hash

        user = User(
            email=f"sub_cancel_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Create subscription
        created = await SubscriptionService.create_subscription(
            db=db_session,
            parent_id=user.id,
            plan_type=SubscriptionPlanType.GAME_PACK_5,
            payment_reference=f"pay_cancel_{uuid4()}",
        )

        # Cancel it
        cancelled = await SubscriptionService.cancel_subscription(db_session, created.id)

        assert cancelled.status == SubscriptionStatus.CANCELLED

    async def test_cancel_subscription_not_found(self, db_session: AsyncSession):
        """Test cancelling non-existent subscription."""
        from app.services.subscription_service import SubscriptionService

        with pytest.raises(ValueError, match="Subscription not found"):
            await SubscriptionService.cancel_subscription(db_session, str(uuid4()))


class TestCalculateUpgradeCredit:
    """Test upgrade credit calculation."""

    async def test_calculate_upgrade_credit_active(self, db_session: AsyncSession):
        """Test credit calculation for active subscription."""
        from app.services.subscription_service import SubscriptionService
        from app.core.security import get_password_hash

        user = User(
            email=f"sub_credit_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Create subscription
        subscription = await SubscriptionService.create_subscription(
            db=db_session,
            parent_id=user.id,
            plan_type=SubscriptionPlanType.GAME_PACK_5,
            payment_reference=f"pay_credit_{uuid4()}",
        )

        # Calculate credit (should be close to full amount since just created)
        credit = await SubscriptionService.calculate_upgrade_credit(db_session, subscription.id)

        # Should be close to full price (150000) since just created
        assert credit > 0
        assert credit <= 150000

    async def test_calculate_upgrade_credit_expired(self, db_session: AsyncSession):
        """Test credit calculation for expired subscription."""
        from app.services.subscription_service import SubscriptionService
        from app.core.security import get_password_hash

        user = User(
            email=f"sub_expired_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Create subscription with expired dates
        subscription = Subscription(
            id=str(uuid4()),
            parent_id=user.id,
            plan_type=SubscriptionPlanType.GAME_PACK_5,
            amount_paid=150000,
            start_date=datetime.now(timezone.utc) - timedelta(days=100),
            end_date=datetime.now(timezone.utc) - timedelta(days=10),
            status=SubscriptionStatus.ACTIVE,
        )
        db_session.add(subscription)
        await db_session.commit()

        # Calculate credit (should be 0 for expired)
        credit = await SubscriptionService.calculate_upgrade_credit(db_session, subscription.id)
        assert credit == 0

    async def test_calculate_upgrade_credit_not_found(self, db_session: AsyncSession):
        """Test credit calculation for non-existent subscription."""
        from app.services.subscription_service import SubscriptionService

        with pytest.raises(ValueError, match="Subscription not found"):
            await SubscriptionService.calculate_upgrade_credit(db_session, str(uuid4()))


class TestUpgradeSubscription:
    """Test subscription upgrade."""

    async def test_upgrade_subscription_success(self, db_session: AsyncSession):
        """Test upgrading a subscription."""
        from app.services.subscription_service import SubscriptionService
        from app.core.security import get_password_hash

        user = User(
            email=f"sub_upgrade_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Create initial subscription
        old_sub = await SubscriptionService.create_subscription(
            db=db_session,
            parent_id=user.id,
            plan_type=SubscriptionPlanType.GAME_PACK_5,
            payment_reference=f"pay_upgrade_old_{uuid4()}",
        )

        # Upgrade to higher plan
        new_sub = await SubscriptionService.upgrade_subscription(
            db=db_session,
            subscription_id=old_sub.id,
            new_plan=SubscriptionPlanType.GAME_PACK_10,
        )

        assert new_sub.plan_type == SubscriptionPlanType.GAME_PACK_10
        assert old_sub.status == SubscriptionStatus.UPGRADED
        assert old_sub.upgraded_to_id == new_sub.id

    async def test_upgrade_subscription_not_found(self, db_session: AsyncSession):
        """Test upgrading non-existent subscription."""
        from app.services.subscription_service import SubscriptionService

        with pytest.raises(ValueError, match="Subscription not found"):
            await SubscriptionService.upgrade_subscription(
                db_session, str(uuid4()), SubscriptionPlanType.GAME_PACK_10
            )


class TestCanAccessGame:
    """Test game access checking."""

    async def test_can_access_game_full_annual(self, db_session: AsyncSession):
        """Test that full annual subscribers can access all games."""
        from app.services.subscription_service import SubscriptionService
        from app.core.security import get_password_hash

        user = User(
            email=f"sub_full_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Create full annual subscription
        await SubscriptionService.create_subscription(
            db=db_session,
            parent_id=user.id,
            plan_type=SubscriptionPlanType.FULL_ANNUAL,
            payment_reference=f"pay_full_{uuid4()}",
        )

        can_access, reason = await SubscriptionService.can_access_game(
            db_session, user.id, "any_game_id"
        )

        assert can_access is True
        assert "Full annual" in reason

    async def test_can_access_game_no_subscription(self, db_session: AsyncSession):
        """Test that users without subscription cannot access games."""
        from app.services.subscription_service import SubscriptionService
        from app.core.security import get_password_hash

        user = User(
            email=f"sub_nosub_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(user)
        await db_session.commit()

        can_access, reason = await SubscriptionService.can_access_game(
            db_session, user.id, "game_id"
        )

        assert can_access is False
        assert "No active subscription" in reason

    async def test_can_access_game_pack_selection(self, db_session: AsyncSession):
        """Test that pack subscriptions only allow selected games."""
        from app.services.subscription_service import SubscriptionService

        user = await create_subscription_test_user(db_session, "sub_pack_access")
        subscription = await SubscriptionService.create_subscription(
            db=db_session,
            parent_id=user.id,
            plan_type=SubscriptionPlanType.GAME_PACK_5,
            payment_reference=f"pay_pack_access_{uuid4()}",
        )

        await SubscriptionService.add_game_selection(
            db_session,
            subscription.id,
            ["game-1", "game-2", "game-3", "game-4", "game-5"],
        )

        can_access, reason = await SubscriptionService.can_access_game(db_session, user.id, "game-3")
        assert can_access is True
        assert "selected in pack" in reason

        can_access, reason = await SubscriptionService.can_access_game(db_session, user.id, "game-8")
        assert can_access is False
        assert "game_pack_5" in reason

    async def test_can_access_game_invalid_plan_type_raises(self, db_session: AsyncSession):
        """Test that unsupported plan values fail loudly."""
        from app.services.subscription_service import SubscriptionService

        user = await create_subscription_test_user(db_session, "sub_invalid_plan")
        subscription = Subscription(
            id=str(uuid4()),
            parent_id=user.id,
            plan_type="quarterly",
            amount_paid=250000,
            currency="INR",
            start_date=datetime.now(timezone.utc),
            end_date=datetime.now(timezone.utc) + timedelta(days=90),
            status=SubscriptionStatus.ACTIVE,
        )
        db_session.add(subscription)
        await db_session.commit()

        with pytest.raises(ValueError, match="Unsupported subscription plan type"):
            await SubscriptionService.can_access_game(db_session, user.id, "game-1")


class TestPackRefreshBehavior:
    """Test quarterly refresh-window behavior."""

    async def test_game_pack_10_exposes_monthly_refresh_windows(self, db_session: AsyncSession):
        """Test refresh availability by monthly cycle without accumulation."""
        from app.services.subscription_service import SubscriptionService

        user = await create_subscription_test_user(db_session, "sub_refresh_window")
        start_date = datetime.now(timezone.utc) - timedelta(days=35)
        subscription = Subscription(
            id=str(uuid4()),
            parent_id=user.id,
            plan_type=SubscriptionPlanType.GAME_PACK_10,
            amount_paid=250000,
            currency="INR",
            start_date=start_date,
            end_date=start_date + timedelta(days=90),
            status=SubscriptionStatus.ACTIVE,
            last_refresh_cycle_used=0,
        )
        db_session.add(subscription)
        await db_session.commit()

        available = await SubscriptionService.get_available_games(db_session, subscription.id)
        assert available["refresh_available"] is True
        assert available["current_cycle_index"] == 2
        assert available["total_cycles"] == 3
        assert available["refresh_window_label"] == "Month 2 of 3"

    async def test_game_pack_10_refresh_replaces_active_selection(self, db_session: AsyncSession):
        """Test that quarterly refresh swaps the full active set for the current cycle."""
        from app.services.subscription_service import SubscriptionService

        user = await create_subscription_test_user(db_session, "sub_refresh_apply")
        start_date = datetime.now(timezone.utc) - timedelta(days=35)
        subscription = Subscription(
            id=str(uuid4()),
            parent_id=user.id,
            plan_type=SubscriptionPlanType.GAME_PACK_10,
            amount_paid=250000,
            currency="INR",
            start_date=start_date,
            end_date=start_date + timedelta(days=90),
            status=SubscriptionStatus.ACTIVE,
            last_refresh_cycle_used=0,
        )
        db_session.add(subscription)
        await db_session.commit()
        await db_session.refresh(subscription)

        await SubscriptionService.add_game_selection(
            db_session,
            subscription.id,
            [f"game-{index}" for index in range(1, 11)],
        )

        refreshed = await SubscriptionService.add_game_selection(
            db_session,
            subscription.id,
            [f"game-{index}" for index in range(11, 21)],
        )

        assert len(refreshed) == 10

        refreshed_subscription = await SubscriptionService.get_subscription_by_id(db_session, subscription.id)
        active_ids = {selection.game_id for selection in refreshed_subscription.game_selections if selection.swapped_at is None}
        swapped_ids = {selection.game_id for selection in refreshed_subscription.game_selections if selection.swapped_at is not None}

        assert active_ids == {f"game-{index}" for index in range(11, 21)}
        assert swapped_ids == {f"game-{index}" for index in range(1, 11)}
        assert refreshed_subscription.last_refresh_cycle_used == 2

    async def test_game_pack_5_rejects_mid_cycle_changes(self, db_session: AsyncSession):
        """Test that monthly packs remain fixed during the active month."""
        from app.services.subscription_service import SubscriptionService

        user = await create_subscription_test_user(db_session, "sub_monthly_fixed")
        subscription = await SubscriptionService.create_subscription(
            db=db_session,
            parent_id=user.id,
            plan_type=SubscriptionPlanType.GAME_PACK_5,
            payment_reference=f"pay_monthly_fixed_{uuid4()}",
        )

        await SubscriptionService.add_game_selection(
            db_session,
            subscription.id,
            ["game-a", "game-b", "game-c", "game-d", "game-e"],
        )

        with pytest.raises(ValueError, match="keeps the same games for the full term"):
            await SubscriptionService.add_game_selection(
                db_session,
                subscription.id,
                ["game-f", "game-g", "game-h", "game-i", "game-j"],
            )


class TestPlanConstants:
    """Test plan constants."""

    async def test_plan_durations(self):
        """Test plan duration constants."""
        from app.services.subscription_service import PLAN_DURATIONS, SubscriptionPlanType

        assert PLAN_DURATIONS[SubscriptionPlanType.GAME_PACK_5] == 30
        assert PLAN_DURATIONS[SubscriptionPlanType.GAME_PACK_10] == 90
        assert PLAN_DURATIONS[SubscriptionPlanType.FULL_ANNUAL] == 365

    async def test_plan_prices(self):
        """Test plan price constants."""
        from app.services.subscription_service import PLAN_PRICES, SubscriptionPlanType

        assert PLAN_PRICES[SubscriptionPlanType.GAME_PACK_5] == 150000
        assert PLAN_PRICES[SubscriptionPlanType.GAME_PACK_10] == 250000
        assert PLAN_PRICES[SubscriptionPlanType.FULL_ANNUAL] == 600000

    async def test_pack_game_limits(self):
        """Test game limit constants."""
        from app.services.subscription_service import PACK_GAME_LIMITS, SubscriptionPlanType

        assert PACK_GAME_LIMITS[SubscriptionPlanType.GAME_PACK_5] == 5
        assert PACK_GAME_LIMITS[SubscriptionPlanType.GAME_PACK_10] == 10
        assert PACK_GAME_LIMITS[SubscriptionPlanType.FULL_ANNUAL] == 35


class TestGetSubscriptionForParent:
    """Test get subscription for parent."""

    async def test_get_subscription_for_parent(self, db_session: AsyncSession):
        """Test getting subscription for parent."""
        from app.services.subscription_service import SubscriptionService
        from app.core.security import get_password_hash

        user = User(
            email=f"sub_parent_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Create subscription
        await SubscriptionService.create_subscription(
            db=db_session,
            parent_id=user.id,
            plan_type=SubscriptionPlanType.GAME_PACK_5,
            payment_reference=f"pay_parent_{uuid4()}",
        )

        # Get subscription for parent
        subscription = await SubscriptionService.get_subscription_for_parent(db_session, user.id)

        assert subscription is not None
        assert subscription.parent_id == user.id

    async def test_get_subscription_for_parent_none(self, db_session: AsyncSession):
        """Test getting subscription when none exists."""
        from app.services.subscription_service import SubscriptionService
        from app.core.security import get_password_hash

        user = User(
            email=f"sub_noparent_{uuid4()}@test.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            email_verified=True,
        )
        db_session.add(user)
        await db_session.commit()

        subscription = await SubscriptionService.get_subscription_for_parent(db_session, user.id)
        assert subscription is None
