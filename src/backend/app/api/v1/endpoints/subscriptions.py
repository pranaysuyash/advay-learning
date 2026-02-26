"""Subscription management endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models.user import User as UserModel
from app.db.models.subscription import SubscriptionPlanType
from app.schemas.subscription import (
    SubscriptionCreate,
    SubscriptionGameSelectionCreate,
    SubscriptionGameSwap,
    SubscriptionUpgrade,
    SubscriptionResponse,
    SubscriptionStatusResponse,
    SubscriptionAvailableGames,
    SubscriptionPurchaseResponse,
    SubscriptionPlanType as SchemaPlanType,
)
from app.schemas.game import Game

from app.services.subscription_service import SubscriptionService
from app.services.game_service import GameService

router = APIRouter()


@router.get("/games/catalog")
async def get_games_catalog(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Get list of available games for selection."""
    games, total = await GameService.get_all(
        db=db,
        is_published=True,
        page=1,
        page_size=100,  # Get all published games
    )

    return {
        "games": [Game.model_validate(game) for game in games],
        "total": total,
    }


@router.post("/purchase", response_model=SubscriptionPurchaseResponse)
async def purchase_subscription(
    plan_type: SchemaPlanType,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Purchase a new subscription."""
    try:
        plan = SubscriptionPlanType(plan_type.value)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan type",
        )

    subscription = await SubscriptionService.create_subscription(
        db=db,
        parent_id=current_user.id,
        plan_type=plan,
        payment_reference=f"USER_INITIATED:{current_user.id}",
    )

    return SubscriptionPurchaseResponse(
        subscription=SubscriptionResponse.model_validate(subscription),
        message=f"Subscription created successfully. Plan: {plan_type.value}",
    )


@router.get("/current", response_model=SubscriptionStatusResponse)
async def get_current_subscription(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Get current active subscription for the user."""
    subscription = await SubscriptionService.get_active_subscription(
        db=db, parent_id=current_user.id
    )

    if not subscription:
        return SubscriptionStatusResponse(
            has_active=False,
            subscription=None,
            days_remaining=None,
            available_games=None,
        )

    from datetime import datetime, timezone

    days_remaining = (subscription.end_date - datetime.now(timezone.utc)).days

    available_games = None
    if subscription.plan_type in [
        SubscriptionPlanType.GAME_PACK_5,
        SubscriptionPlanType.GAME_PACK_10,
    ]:
        available_games = await SubscriptionService.get_available_games(
            db=db, subscription_id=subscription.id
        )

    return SubscriptionStatusResponse(
        has_active=True,
        subscription=SubscriptionResponse.model_validate(subscription),
        days_remaining=days_remaining,
        available_games=SubscriptionAvailableGames(**available_games)
        if available_games
        else None,
    )


@router.get("/games/available", response_model=SubscriptionAvailableGames)
async def get_available_games(
    subscription_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Get available games info for a subscription."""
    subscription = await SubscriptionService.get_subscription_by_id(
        db=db, subscription_id=subscription_id
    )

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found",
        )

    if subscription.parent_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this subscription",
        )

    available = await SubscriptionService.get_available_games(
        db=db, subscription_id=subscription_id
    )

    return SubscriptionAvailableGames(**available)


@router.put("/games", response_model=SubscriptionResponse)
async def update_game_selection(
    subscription_id: str,
    games: SubscriptionGameSelectionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Add game selections to a subscription (at purchase time)."""
    subscription = await SubscriptionService.get_subscription_by_id(
        db=db, subscription_id=subscription_id
    )

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found",
        )

    if subscription.parent_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this subscription",
        )

    try:
        await SubscriptionService.add_game_selection(
            db=db, subscription_id=subscription_id, game_ids=games.game_ids
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    # Refresh to get updated selections
    subscription = await SubscriptionService.get_subscription_by_id(
        db=db, subscription_id=subscription_id
    )

    return SubscriptionResponse.model_validate(subscription)


@router.put("/games/swap", response_model=SubscriptionResponse)
async def swap_game(
    subscription_id: str,
    swap: SubscriptionGameSwap,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Swap one game in the subscription (1 free swap per pack)."""
    subscription = await SubscriptionService.get_subscription_by_id(
        db=db, subscription_id=subscription_id
    )

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found",
        )

    if subscription.parent_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this subscription",
        )

    try:
        await SubscriptionService.swap_game(
            db=db, subscription_id=subscription_id, new_game_id=swap.new_game_id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    # Refresh to get updated selections
    subscription = await SubscriptionService.get_subscription_by_id(
        db=db, subscription_id=subscription_id
    )

    return SubscriptionResponse.model_validate(subscription)


@router.post("/upgrade", response_model=SubscriptionPurchaseResponse)
async def upgrade_subscription(
    subscription_id: str,
    upgrade: SubscriptionUpgrade,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Upgrade to a new subscription plan with prorated credit."""
    subscription = await SubscriptionService.get_subscription_by_id(
        db=db, subscription_id=subscription_id
    )

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found",
        )

    if subscription.parent_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this subscription",
        )

    try:
        new_plan = SubscriptionPlanType(upgrade.new_plan.value)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan type",
        )

    credit = await SubscriptionService.calculate_upgrade_credit(
        db=db, subscription_id=subscription_id
    )

    try:
        new_subscription = await SubscriptionService.upgrade_subscription(
            db=db, subscription_id=subscription_id, new_plan=new_plan
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    return SubscriptionPurchaseResponse(
        subscription=SubscriptionResponse.model_validate(new_subscription),
        message=f"Upgrade successful. Credit applied: ₹{credit / 100:.2f}",
    )


@router.get("/status", response_model=SubscriptionStatusResponse)
async def get_subscription_status(
    subscription_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Get detailed status of a specific subscription."""
    subscription = await SubscriptionService.get_subscription_by_id(
        db=db, subscription_id=subscription_id
    )

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found",
        )

    if subscription.parent_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this subscription",
        )

    from datetime import datetime, timezone

    days_remaining = None
    if subscription.status == "active":
        days_remaining = max(0, (subscription.end_date - datetime.now(timezone.utc)).days)

    available_games = None
    if subscription.plan_type in [
        SubscriptionPlanType.GAME_PACK_5,
        SubscriptionPlanType.GAME_PACK_10,
    ]:
        available_games = await SubscriptionService.get_available_games(
            db=db, subscription_id=subscription_id
        )

    return SubscriptionStatusResponse(
        has_active=subscription.status == "active",
        subscription=SubscriptionResponse.model_validate(subscription),
        days_remaining=days_remaining,
        available_games=SubscriptionAvailableGames(**available_games)
        if available_games
        else None,
    )
