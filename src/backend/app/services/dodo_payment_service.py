"""Dodo Payment service for subscription purchases."""

import os
import hmac
import hashlib
import logging
from typing import Optional

from dodopayments import DodoPayments

from app.db.models.subscription_model import SubscriptionPlanType
from app.services.subscription_service import PLAN_PRICES

logger = logging.getLogger(__name__)

# Environment configuration
DODO_ENV = os.getenv("DODO_ENV", "test").lower()
DODO_BASE_URLS = {
    "test": "https://test.dodopayments.com",
    "live": "https://live.dodopayments.com"
}

# Product IDs from Dodo dashboard - must be configured for production
PLAN_PRODUCT_IDS = {
    SubscriptionPlanType.GAME_PACK_5: os.getenv("DODO_PRODUCT_ID_GAME_PACK_5"),
    SubscriptionPlanType.GAME_PACK_10: os.getenv("DODO_PRODUCT_ID_GAME_PACK_10"),
    SubscriptionPlanType.FULL_ANNUAL: os.getenv("DODO_PRODUCT_ID_FULL_ANNUAL"),
}

# Allow placeholder mode only in development
ALLOW_PLACEHOLDER = os.getenv("ALLOW_PLACEHOLDER_MODE", "false").lower() == "true" and DODO_ENV == "test"

# Diagnostic mode for signature verification (test only)
DODO_VERIFY_DIAGNOSTIC = os.getenv("DODO_VERIFY_DIAGNOSTIC", "false").lower() == "true" and DODO_ENV == "test"

PLAN_NAMES = {
    SubscriptionPlanType.GAME_PACK_5: "5-Game Pack (3 months)",
    SubscriptionPlanType.GAME_PACK_10: "10-Game Pack (3 months)",
    SubscriptionPlanType.FULL_ANNUAL: "Full Annual Subscription",
}


class DodoPaymentService:
    """Service for handling Dodo Payments integration."""

    def __init__(self):
        self.api_key = os.getenv("DODO_API_KEY", "")
        self.webhook_secret = os.getenv("DODO_WEBHOOK_SECRET", "")
        env = os.getenv("DODO_ENV", DODO_ENV).lower()

        if not self.api_key:
            raise ValueError("DODO_API_KEY is required to initialize DodoPayments")

        base_url = DODO_BASE_URLS.get(env, DODO_BASE_URLS["test"])
        logger.info(f"Initialized DodoPayments with environment: {env}, base_url: {base_url}")

        self.client = DodoPayments(
            bearer_token=self.api_key,
            base_url=base_url,
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
            if ALLOW_PLACEHOLDER:
                logger.warning(f"Using placeholder checkout for plan {plan_type.value} - products must be configured in Dodo dashboard")
                return {
                    "checkout_url": f"https://checkout.dodopayments.com/test?plan={plan_type.value}&user={user_id}",
                    "session_id": f"pending_{user_id}_{plan_type.value}",
                    "warning": "Products not configured - using placeholder",
                }
            else:
                raise ValueError(
                    f"Dodo product ID not configured for plan {plan_type.value}. "
                    "Please configure DODO_PRODUCT_ID_* environment variables."
                )

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
                "expected_amount": PLAN_PRICES[plan_type],  # Store expected amount for verification
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
                "amount_paid": 0,
            }

        response = self.client.checkout_sessions.retrieve(id=session_id)
        metadata = response.metadata or {}
        return {
            "id": response.id,
            "status": str(response.status) if response.status else "unknown",
            "customer_email": response.customer.email if response.customer else None,
            "metadata": metadata,
            "amount_paid": getattr(response, 'amount_total', 0),  # Amount in smallest currency unit
        }

    def verify_webhook_signature(
        self, payload: bytes, webhook_id: str, webhook_timestamp: str, webhook_signature: str
    ) -> bool:
        """Verify webhook signature from Dodo using their 3-header scheme.

        CRITICAL: Signature scheme must match Dodo's exact specification.

        Current implementation (NEEDS VERIFICATION):
        "{webhook_id}.{webhook_timestamp}.{raw_payload}"

        Dodo docs reference:
        - https://dodopayments.com/docs/webhooks (How do I verify webhooks?)
        - May specify webhook_id + timestamp + payload OR just timestamp + payload

        ACTION REQUIRED: Confirm exact "string to sign" format from official Dodo docs.
        If Dodo uses "{timestamp}.{payload}" instead, update line below accordingly.

        When DODO_VERIFY_DIAGNOSTIC=true (test env), will test multiple schemes and log results.
        """
        if not self.webhook_secret:
            logger.error("DODO_WEBHOOK_SECRET not configured - webhook verification disabled")
            return False

        # DIAGNOSTIC MODE: Test multiple signature schemes to determine the correct one
        if DODO_VERIFY_DIAGNOSTIC:
            return self._diagnostic_signature_verification(
                payload, webhook_id, webhook_timestamp, webhook_signature
            )

        try:
            # Validate timestamp (reject if too old to prevent replay attacks)
            import time
            try:
                webhook_time = int(webhook_timestamp)
                current_time = int(time.time())
                time_diff = abs(current_time - webhook_time)

                # Reject timestamps older than 5 minutes
                if time_diff > 300:  # 5 minutes in seconds
                    logger.error(f"Webhook timestamp too old: {time_diff}s difference")
                    return False

            except ValueError:
                logger.error(f"Invalid timestamp format: {webhook_timestamp}")
                return False

            # Compute signature exactly as Dodo specifies:
            # "{webhook_id}.{webhook_timestamp}.{raw_payload}"
            message_to_sign = f"{webhook_id}.{webhook_timestamp}.".encode() + payload

            expected_signature = hmac.new(
                self.webhook_secret.encode(),
                message_to_sign,
                hashlib.sha256,
            ).hexdigest()

            # Use constant-time comparison to prevent timing attacks
            return hmac.compare_digest(expected_signature, webhook_signature)

        except Exception as e:
            logger.exception("Webhook signature verification failed")
            return False

    def _diagnostic_signature_verification(
        self, payload: bytes, webhook_id: str, webhook_timestamp: str, webhook_signature: str
    ) -> bool:
        """Test multiple signature schemes to determine which one Dodo actually uses.

        Only active when DODO_VERIFY_DIAGNOSTIC=true in test environment.
        Logs all computed signatures vs received signature for analysis.
        """
        import hashlib as hash_lib

        schemes = {
            "scheme_A_webhook_id_timestamp_payload": f"{webhook_id}.{webhook_timestamp}.".encode() + payload,
            "scheme_B_timestamp_payload": f"{webhook_timestamp}.".encode() + payload,
            "scheme_C_webhook_id_payload": f"{webhook_id}.".encode() + payload,
            "scheme_D_payload_only": payload,
        }

        logger.critical("=== DODO SIGNATURE DIAGNOSTIC MODE ===")
        logger.critical(f"webhook_id: {webhook_id}")
        logger.critical(f"webhook_timestamp: {webhook_timestamp}")
        logger.critical(f"payload_hash: {hash_lib.sha256(payload).hexdigest()}")
        logger.critical(f"received_signature: {webhook_signature}")
        logger.critical("Testing signature schemes:")

        matching_schemes = []

        for scheme_name, message_to_sign in schemes.items():
            computed_sig = hmac.new(
                self.webhook_secret.encode(),
                message_to_sign,
                hashlib.sha256,
            ).hexdigest()

            matches = hmac.compare_digest(computed_sig, webhook_signature)
            status = "✓ MATCH" if matches else "✗ NO MATCH"

            logger.critical(f"  {scheme_name}: {status}")
            logger.critical(f"    computed: {computed_sig}")

            if matches:
                matching_schemes.append(scheme_name)

        logger.critical(f"=== RESULTS: {len(matching_schemes)} matching scheme(s) ===")
        if matching_schemes:
            logger.critical(f"WINNING SCHEME(S): {', '.join(matching_schemes)}")
            logger.critical("ACTION: Update verify_webhook_signature to use the winning scheme")
        else:
            logger.critical("NO MATCHING SCHEMES - Check secret or header extraction")

        # For safety, still run the original scheme in diagnostic mode
        message_to_sign = f"{webhook_id}.{webhook_timestamp}.".encode() + payload
        expected_signature = hmac.new(
            self.webhook_secret.encode(),
            message_to_sign,
            hashlib.sha256,
        ).hexdigest()

        return hmac.compare_digest(expected_signature, webhook_signature)

    def validate_payment_amount(
        self, payment_data: dict, expected_plan_type: SubscriptionPlanType
    ) -> bool:
        """Validate that payment amount matches expected plan price."""
        expected_amount = PLAN_PRICES.get(expected_plan_type)
        if not expected_amount:
            logger.error(f"No price configured for plan: {expected_plan_type}")
            return False

        # Extract amount from payment data (format varies by payment provider)
        paid_amount = payment_data.get("amount_paid", payment_data.get("amount_total", 0))

        if paid_amount != expected_amount:
            logger.error(
                f"Payment amount mismatch for {expected_plan_type}: "
                f"expected {expected_amount}, got {paid_amount}"
            )
            return False

        return True


def get_dodo_client() -> DodoPaymentService:
    """Get Dodo payment service instance."""
    return DodoPaymentService()
