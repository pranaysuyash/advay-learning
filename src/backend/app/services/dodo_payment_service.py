"""Dodo Payment service for subscription purchases."""

import os
from typing import Optional

from dodopayments import DodoPayments

from app.db.models.subscription import SubscriptionPlanType
from app.services.subscription_service import PLAN_PRICES

DODO_API_KEY = os.getenv("DODO_API_KEY", "46HOzaj-IRJyuoIc.I5_KlMUBgs-isqG5-zJuCHh9bDMLbv6Vxf-rJAB-4hq4UmtC")

# Product IDs from Dodo dashboard - need to be created in INR
# These should be created in Dodo dashboard
PLAN_PRODUCT_IDS = {
    SubscriptionPlanType.GAME_PACK_5: None,  # TODO: Create product in Dodo
    SubscriptionPlanType.GAME_PACK_10: None,  # TODO: Create product in Dodo
    SubscriptionPlanType.FULL_ANNUAL: None,  # TODO: Create product in Dodo
}

PLAN_NAMES = {
    SubscriptionPlanType.GAME_PACK_5: "5-Game Pack (3 months)",
    SubscriptionPlanType.GAME_PACK_10: "10-Game Pack (3 months)",
    SubscriptionPlanType.FULL_ANNUAL: "Full Annual Subscription",
}


class DodoPaymentService:
    """Service for handling Dodo Payments integration."""

    def __init__(self):
        self.client = DodoPayments(
            bearer_token=DODO_API_KEY,
            base_url="https://test.dodopayments.com",
        )

    def create_checkout_session(
        self,
        plan_type: SubscriptionPlanType,
        user_id: str,
        user_email: str,
        success_url: str,
        cancel_url: str,
    ) -> dict:
        """Create a Dodo checkout session for subscription purchase."""
        product_id = PLAN_PRODUCT_IDS.get(plan_type)

        if not product_id:
            # Fallback: Use a placeholder for now - products need to be created in Dodo
            # TODO: Create products in Dodo dashboard and add IDs here
            return {
                "checkout_url": f"https://checkout.dodopayments.com/test?plan={plan_type.value}&user={user_id}",
                "session_id": f"pending_{user_id}_{plan_type.value}",
                "warning": "Products not configured - using placeholder",
            }

        response = self.client.checkout_sessions.create(
            product_cart=[
                {
                    "product_id": product_id,
                    "quantity": 1,
                }
            ],
            return_url=success_url,
            customer={
                "email": user_email,
            },
            metadata={
                "user_id": user_id,
                "plan_type": plan_type.value,
            },
        )

        return {
            "checkout_url": response.url,
            "session_id": response.id,
        }

    def get_payment_status(self, session_id: str) -> dict:
        """Get payment status from Dodo."""
        if session_id.startswith("pending_"):
            return {
                "id": session_id,
                "status": "pending",
                "customer_email": None,
                "metadata": {},
            }

        response = self.client.checkout_sessions.retrieve(id=session_id)
        return {
            "id": response.id,
            "status": str(response.status) if response.status else "unknown",
            "customer_email": response.customer.email if response.customer else None,
            "metadata": response.metadata or {},
        }

    def verify_webhook_signature(
        self, payload: bytes, signature: str
    ) -> bool:
        """Verify webhook signature from Dodo."""
        import hmac
        import hashlib

        webhook_secret = os.getenv("DODO_WEBHOOK_SECRET", "")
        if not webhook_secret:
            return False

        expected_signature = hmac.new(
            webhook_secret.encode(),
            payload,
            hashlib.sha256,
        ).hexdigest()

        return hmac.compare_digest(expected_signature, signature)


def get_dodo_client() -> DodoPaymentService:
    """Get Dodo payment service instance."""
    return DodoPaymentService()
