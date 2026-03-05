"""Subscription management endpoints."""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models.subscription_model import SubscriptionPlanType
from app.db.models.user import User as UserModel
from app.schemas.game import Game
from app.schemas.subscription_schema import (
    SubscriptionAvailableGames,
    SubscriptionGameSelectionCreate,
    SubscriptionGameSwap,
    SubscriptionPurchaseResponse,
    SubscriptionResponse,
    SubscriptionStatusResponse,
    SubscriptionUpgrade,
)
from app.schemas.subscription_schema import (
    SubscriptionPlanType as SchemaPlanType,
)
from app.services.dodo_payment_service import DodoPaymentService, get_dodo_client
from app.services.game_service import GameService
from app.services.subscription_service import SubscriptionService

router = APIRouter()
logger = logging.getLogger(__name__)


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


@router.post("/purchase")
async def purchase_subscription(
    plan_type: SchemaPlanType,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Purchase a new subscription - creates Dodo checkout session."""
    try:
        plan = SubscriptionPlanType(plan_type.value)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan type",
        )

    base_url = str(request.base_url).rstrip("/")
    success_url = f"{base_url}/api/v1/subscriptions/payment-success"
    cancel_url = f"{base_url}/api/v1/subscriptions/payment-cancelled"

    dodo_service: DodoPaymentService = get_dodo_client()

    try:
        checkout = dodo_service.create_checkout_session(
            plan_type=plan,
            user_id=current_user.id,
            user_email=current_user.email,
            success_url=success_url,
            cancel_url=cancel_url,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create checkout: {str(e)}",
        )

    return {
        "checkout_url": checkout["checkout_url"],
        "session_id": checkout["session_id"],
        "plan_type": plan_type.value,
    }


@router.get("/payment-success")
async def payment_success(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Handle successful payment redirect from Dodo."""
    dodo_service: DodoPaymentService = get_dodo_client()

    try:
        payment = dodo_service.get_payment_status(session_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment session",
        )

    if payment["status"] != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment not completed",
        )

    user_id = payment["metadata"].get("user_id")
    plan_type_value = payment["metadata"].get("plan_type")

    if not user_id or not plan_type_value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing payment metadata",
        )

    # Security: Ensure authenticated user matches payment metadata
    if str(current_user.id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to process this payment",
        )

    try:
        plan = SubscriptionPlanType(plan_type_value)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan type in payment",
        )

    # Create subscription (now idempotent thanks to payment_reference uniqueness)
    subscription = await SubscriptionService.create_subscription(
        db=db,
        parent_id=user_id,
        plan_type=plan,
        payment_reference=session_id,
    )

    return {
        "success": True,
        "subscription_id": subscription.id,
        "plan_type": plan_type_value,
    }


@router.get("/payment-cancelled")
async def payment_cancelled():
    """Handle cancelled payment redirect from Dodo."""
    return {
        "success": False,
        "message": "Payment was cancelled",
    }


@router.post("/webhook")
async def handle_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Handle Dodo payment webhooks."""
    body = await request.body()

    # Extract all three required Dodo webhook headers (case-insensitive)
    webhook_id = (
        request.headers.get("webhook-id", "") or
        request.headers.get("Webhook-Id", "") or
        request.headers.get("Webhook-ID", "")
    )
    webhook_timestamp = (
        request.headers.get("webhook-timestamp", "") or
        request.headers.get("Webhook-Timestamp", "") or
        request.headers.get("Webhook-TIMESTAMP", "")
    )
    webhook_signature = (
        request.headers.get("webhook-signature", "") or
        request.headers.get("Webhook-Signature", "") or
        request.headers.get("Webhook-SIGNATURE", "")
    )

    dodo_service: DodoPaymentService = get_dodo_client()

    if not dodo_service.verify_webhook_signature(body, webhook_id, webhook_timestamp, webhook_signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook signature",
        )

    # CRITICAL: Record webhook receipt in separate transaction for crash safety
    # This ensures we never lose track of a received webhook even if processing fails
    from uuid import uuid4

    from sqlalchemy import select
    from sqlalchemy.exc import IntegrityError

    from app.db.models.subscription_model import DodoWebhookEvent

    # Step 1: Insert webhook receipt and commit immediately (separate transaction)
    webhook_event = DodoWebhookEvent(
        id=str(uuid4()),
        webhook_id=webhook_id,
        event_type="unknown",  # Will update after parsing
        status="received",  # Explicit status tracking
        session_id=None,  # Will update after processing
        processed_at=None,  # Explicitly mark as not yet processed (received-first pattern)
        attempts=1,  # Track first attempt
    )

    try:
        db.add(webhook_event)
        await db.commit()  # Commit receipt immediately - this webhook is now "ours"
    except IntegrityError:
        await db.rollback()
        # Webhook ID already exists - fetch and check processing state
        existing_webhook = await db.execute(
            select(DodoWebhookEvent).where(DodoWebhookEvent.webhook_id == webhook_id)
        )
        existing = existing_webhook.scalar_one_or_none()

        if existing:
            if existing.processed_at is not None:
                # Successfully processed before
                return {
                    "received": True,
                    "status": "already_processed",
                    "processed_at": existing.processed_at.isoformat()
                }
            else:
                # Received but not processed - retry processing
                # Business logic is idempotent on payment_reference, so this is safe
                logger.warning(f"Retrying webhook {webhook_id} that was received but not processed")
                # Increment attempt counter
                existing.attempts += 1

                # Continue to business logic with existing webhook event
                webhook_event = existing
        else:
            # Should not happen, but handle gracefully
            return {"received": True, "status": "already_processed"}
    except Exception:
        await db.rollback()
        raise  # Re-raise system errors to trigger retry

    import json
    event = json.loads(body.decode("utf-8"))

    event_type = event.get("type")

    # Validate event_type exists (critical for routing)
    if not event_type:
        # Mark webhook as failed due to invalid payload
        webhook_event.event_type = "unknown"
        webhook_event.status = "failed"
        webhook_event.last_error = "Missing required field: event_type"
        webhook_event.processed_at = datetime.now(timezone.utc)
        await db.commit()

        logger.error("Received webhook without event_type field")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required field: event_type"
        )

    data = event.get("data", {})

    # Official Dodo payment event types (per Dodo webhook documentation)
    # See: https://dodopayments.com/docs/webhooks
    # Map non-standard event types to canonical Dodo event types
    canonical_event_map = {
        # Legacy/compatibility aliases -> official Dodo events
        "payment.completed": "payment.succeeded",
        "payment.success": "payment.succeeded",
        # Add other mappings as needed:
        # "payment.paid": "payment.succeeded",
    }

    # Normalize event type to canonical form
    canonical_event_type = canonical_event_map.get(event_type, event_type)

    # Log if we normalized a non-standard event type
    if canonical_event_type != event_type:
        logger.warning(
            f"Received non-standard Dodo event '{event_type}', normalized to '{canonical_event_type}'. "
            f"Update webhook configuration to use official '{canonical_event_type}' event."
        )

    # Update event_type to canonical form for routing
    event_type = canonical_event_type

    # Declarative event routing for extensibility
    async def handle_payment_success(event_data: dict, db: AsyncSession):
        """Handle successful payment events."""
        session_id = event_data.get("id")
        metadata = event_data.get("metadata", {})
        user_id = metadata.get("user_id")
        plan_type_value = metadata.get("plan_type")

        if not user_id or not plan_type_value:
            raise ValueError("Missing payment metadata (user_id or plan_type)")

        try:
            plan = SubscriptionPlanType(plan_type_value)
        except ValueError:
            raise ValueError(f"Invalid plan type in payment: {plan_type_value}")

        # Payment validation (using metadata as primary source)
        expected_amount = metadata.get("expected_amount")
        if not expected_amount:
            raise ValueError("Missing expected_amount in payment metadata")

        try:
            expected_amount = int(expected_amount)
        except (ValueError, TypeError):
            raise ValueError(f"Invalid expected_amount type in metadata: {type(expected_amount)}")

        # Validate product_id if present in webhook payload
        # Per Dodo FAQ: subscription webhooks may not include product_id and use subscription_id instead
        # So this validation is optional and informational only
        webhook_product_id = (
            event_data.get("product_id") or
            event_data.get("product", {}).get("id") if isinstance(event_data.get("product"), dict) else None
        )

        if webhook_product_id:
            from app.services.dodo_payment_service import PLAN_PRODUCT_IDS
            expected_product_id = PLAN_PRODUCT_IDS.get(plan)
            if expected_product_id and webhook_product_id != expected_product_id:
                # Log warning but don't fail - subscription flows may legitimately differ
                logger.warning(
                    f"Product ID mismatch for {plan}: expected {expected_product_id}, "
                    f"got {webhook_product_id}. Continuing as this may be a subscription flow."
                )
        else:
            # Log absence of product_id (normal for subscription flows per Dodo FAQ)
            logger.debug(f"No product_id in webhook payload for {plan} - may be subscription flow")

        # Validate webhook amount using exact Dodo schema field names
        webhook_amount = None
        for field_name in ["amount_total", "amount", "total"]:
            if field_name in event_data:
                webhook_amount = event_data.get(field_name)
                break

        if webhook_amount is not None:
            try:
                webhook_amount = int(webhook_amount)
                if webhook_amount != expected_amount:
                    raise ValueError(
                        f"Payment amount mismatch for {plan}: expected {expected_amount}, "
                        f"got {webhook_amount} from field '{field_name}'"
                    )
            except TypeError:
                logger.warning(
                    f"Invalid webhook amount type in payload: {type(webhook_amount)} for field '{field_name}'"
                )

        # Create subscription (idempotent on payment_reference)
        subscription = await SubscriptionService.create_subscription(
            db=db,
            parent_id=user_id,
            plan_type=plan,
            payment_reference=session_id,
        )

        return subscription

    # Event routing table (official Dodo events only)
    handlers = {
        "payment.succeeded": handle_payment_success,  # Official Dodo event
        # Future official Dodo events (add as needed):
        # "payment.failed": handle_payment_failed,
        # "payment.processing": handle_payment_processing,
        # "payment.cancelled": handle_payment_cancelled,
        # "refund.created": handle_refund_created,
        # "subscription.cancelled": handle_subscription_cancelled,
    }

    # Route event to appropriate handler (FIX: was missing handler assignment)
    handler = handlers.get(event_type)

    if handler:
        try:
            # Call the event handler
            result = await handler(data, db)

            # Update webhook event as processed
            webhook_event.event_type = event_type
            webhook_event.status = "processed"
            webhook_event.session_id = data.get("id")
            webhook_event.processed_at = datetime.now(timezone.utc)
            await db.commit()

            return {
                "received": True,
                "status": "processed",
                "event_type": event_type,
                "subscription_id": result.id if hasattr(result, 'id') else None
            }

        except ValueError as e:
            # Business logic errors (validation, etc.)
            await db.rollback()
            webhook_event.event_type = event_type
            webhook_event.status = "failed"
            webhook_event.last_error = str(e)
            webhook_event.processed_at = datetime.now(timezone.utc)
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        except Exception:
            # System errors - rollback and return 500 so Dodo retries
            await db.rollback()
            logger.exception(f"Webhook processing failed for event {event_type}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Webhook processing failed - please retry"
            )
    else:
        # Unknown event type - mark as processed but ignored
        webhook_event.event_type = event_type
        webhook_event.status = "processed"  # Successfully received and handled (by ignoring)
        webhook_event.last_error = f"Unhandled event type: {event_type}"
        webhook_event.processed_at = datetime.now(timezone.utc)
        await db.commit()

        logger.info(f"Received unhandled webhook event type: {event_type}")
        return {
            "received": True,
            "status": "ignored",
            "event_type": event_type
        }


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

    old_game_id = swap.old_game_id
    if not old_game_id:
        # Backward-compatibility: legacy clients send only new_game_id.
        active_selections = [s for s in subscription.game_selections if s.swapped_at is None]
        replacement_candidate = next(
            (s.game_id for s in active_selections if s.game_id != swap.new_game_id),
            None,
        )
        if not replacement_candidate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No eligible game available to swap out",
            )
        old_game_id = replacement_candidate

    try:
        await SubscriptionService.swap_game(
            db=db,
            subscription_id=subscription_id,
            old_game_id=old_game_id,
            new_game_id=swap.new_game_id
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
            db=db, subscription_id=subscription_id, new_plan=new_plan, upgrade_credit=credit
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    # Only mention credit if it was actually applied (> 0)
    credit_message = ""
    if credit > 0:
        credit_message = f" Credit applied: ₹{credit / 100:.2f}."

    return SubscriptionPurchaseResponse(
        subscription=SubscriptionResponse.model_validate(new_subscription),
        message=f"Upgrade successful.{credit_message}",
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

    days_remaining = None
    if subscription.status == "active":
        days_remaining = max(
            0,
            (subscription.end_date - datetime.now(timezone.utc)).days,
        )

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
