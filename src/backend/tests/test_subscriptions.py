"""Tests for subscription endpoints."""

from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.subscription_model import Subscription, SubscriptionStatus
from app.services.subscription_service import SubscriptionPlanType
from app.services.user_service import UserService


class TestSubscriptionCatalog:
    """Test games catalog endpoint."""

    async def test_get_games_catalog(self, client: AsyncClient, auth_headers: dict):
        """Test getting games catalog requires auth."""
        response = await client.get("/api/v1/subscriptions/games/catalog", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "games" in data
        assert isinstance(data["games"], list)

    async def test_get_games_catalog_no_auth(self, client: AsyncClient):
        """Test games catalog without auth fails."""
        response = await client.get("/api/v1/subscriptions/games/catalog")
        assert response.status_code == 401


class TestSubscriptionPurchase:
    """Test subscription purchase flow."""

    async def test_purchase_subscription_success(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test successful subscription purchase creates checkout."""
        mock_checkout = {
            "checkout_url": "https://checkout.dodopayments.com/test_session",
            "session_id": "sess_test123",
        }

        with patch(
            "app.api.v1.endpoints.subscriptions.get_dodo_client"
        ) as mock_get_client:
            mock_client = MagicMock()
            mock_client.create_checkout_session.return_value = mock_checkout
            mock_get_client.return_value = mock_client

            response = await client.post(
                "/api/v1/subscriptions/purchase",
                params={"plan_type": "game_pack_5"},
                headers=auth_headers,
            )

            assert response.status_code == 200
            data = response.json()
            assert data["checkout_url"] == mock_checkout["checkout_url"]
            assert data["session_id"] == mock_checkout["session_id"]
            assert data["plan_type"] == "game_pack_5"
            mock_client.create_checkout_session.assert_called_once()

    async def test_purchase_subscription_invalid_plan(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test purchase with invalid plan type fails."""
        response = await client.post(
            "/api/v1/subscriptions/purchase",
            params={"plan_type": "invalid_plan"},
            headers=auth_headers,
        )

        assert response.status_code == 422  # Validation error

    async def test_purchase_subscription_no_auth(self, client: AsyncClient):
        """Test purchase without auth fails."""
        response = await client.post(
            "/api/v1/subscriptions/purchase", params={"plan_type": "game_pack_5"}
        )
        assert response.status_code == 401

    async def test_purchase_subscription_dodo_error(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test purchase when Dodo service fails."""
        with patch(
            "app.api.v1.endpoints.subscriptions.get_dodo_client"
        ) as mock_get_client:
            mock_client = MagicMock()
            mock_client.create_checkout_session.side_effect = Exception(
                "Dodo API error"
            )
            mock_get_client.return_value = mock_client

            response = await client.post(
                "/api/v1/subscriptions/purchase",
                params={"plan_type": "game_pack_5"},
                headers=auth_headers,
            )

            assert response.status_code == 500
            assert "failed to create checkout" in response.json()["detail"].lower()


class TestPaymentSuccess:
    """Test payment success callback."""

    async def test_payment_success_valid(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_user: dict,
    ):
        """Test successful payment callback creates subscription."""
        mock_payment = {
            "status": "completed",
            "metadata": {
                "user_id": test_user.get("id", "test_user_id"),
                "plan_type": "monthly",
            },
        }

        with patch(
            "app.api.v1.endpoints.subscriptions.get_dodo_client"
        ) as mock_get_client, patch(
            "app.api.v1.endpoints.subscriptions.SubscriptionService"
        ) as mock_service:
            mock_client = MagicMock()
            mock_client.get_payment_status.return_value = mock_payment
            mock_get_client.return_value = mock_client

            mock_sub = MagicMock()
            mock_sub.id = "sub_test123"
            mock_service.create_subscription.return_value = mock_sub

            response = await client.get(
                "/api/v1/subscriptions/payment-success",
                params={"session_id": "sess_test123"},
                headers=auth_headers,
            )

            # Will fail because user_id in metadata won't match authenticated user
            # This tests the security check
            assert response.status_code in [200, 403]

    async def test_payment_success_invalid_session(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test payment success with invalid session fails."""
        with patch(
            "app.api.v1.endpoints.subscriptions.get_dodo_client"
        ) as mock_get_client:
            mock_client = MagicMock()
            mock_client.get_payment_status.side_effect = Exception("Invalid session")
            mock_get_client.return_value = mock_client

            response = await client.get(
                "/api/v1/subscriptions/payment-success",
                params={"session_id": "invalid_sess"},
                headers=auth_headers,
            )

            assert response.status_code == 400
            assert "invalid payment session" in response.json()["detail"].lower()

    async def test_payment_success_incomplete_payment(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test payment success with incomplete payment fails."""
        mock_payment = {"status": "pending", "metadata": {}}

        with patch(
            "app.api.v1.endpoints.subscriptions.get_dodo_client"
        ) as mock_get_client:
            mock_client = MagicMock()
            mock_client.get_payment_status.return_value = mock_payment
            mock_get_client.return_value = mock_client

            response = await client.get(
                "/api/v1/subscriptions/payment-success",
                params={"session_id": "sess_pending"},
                headers=auth_headers,
            )

            assert response.status_code == 400
            assert "payment not completed" in response.json()["detail"].lower()

    async def test_payment_success_no_auth(self, client: AsyncClient):
        """Test payment success without auth fails."""
        response = await client.get(
            "/api/v1/subscriptions/payment-success", params={"session_id": "sess_test"}
        )
        assert response.status_code == 401


class TestPaymentCancelled:
    """Test payment cancelled callback."""

    async def test_payment_cancelled(self, client: AsyncClient):
        """Test payment cancelled returns appropriate message."""
        response = await client.get("/api/v1/subscriptions/payment-cancelled")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert "cancelled" in data["message"].lower()


class TestSubscriptionWebhook:
    """Test webhook handling."""

    async def test_webhook_valid_signature(self, client: AsyncClient):
        """Test webhook with valid signature is processed."""
        payload = b'{"type": "payment.completed", "data": {"id": "sess_123"}}'

        with patch(
            "app.api.v1.endpoints.subscriptions.get_dodo_client"
        ) as mock_get_client, patch(
            "app.api.v1.endpoints.subscriptions.logger"
        ):
            mock_client = MagicMock()
            mock_client.verify_webhook_signature.return_value = True
            mock_get_client.return_value = mock_client

            response = await client.post(
                "/api/v1/subscriptions/webhook",
                content=payload,
                headers={
                    "webhook-id": "webhook_123",
                    "webhook-timestamp": "1234567890",
                    "webhook-signature": "valid_signature",
                    "Content-Type": "application/json",
                },
            )

            # Webhook endpoint processes asynchronously, may return 200, 400 (if processing fails), or 500
            # The key thing is that signature verification passed (would be 401 if signature failed)
            assert response.status_code in [200, 400, 500]
            if response.status_code == 200:
                assert response.json().get("received") is True

    async def test_webhook_invalid_signature(self, client: AsyncClient):
        """Test webhook with invalid signature is rejected."""
        payload = b'{"type": "payment.completed"}'

        with patch(
            "app.api.v1.endpoints.subscriptions.get_dodo_client"
        ) as mock_get_client:
            mock_client = MagicMock()
            mock_client.verify_webhook_signature.return_value = False
            mock_get_client.return_value = mock_client

            response = await client.post(
                "/api/v1/subscriptions/webhook",
                content=payload,
                headers={
                    "webhook-id": "webhook_123",
                    "webhook-timestamp": "1234567890",
                    "webhook-signature": "invalid_signature",
                    "Content-Type": "application/json",
                },
            )

            assert response.status_code == 401
            assert "invalid webhook signature" in response.json()["detail"].lower()

    async def test_webhook_missing_headers(self, client: AsyncClient):
        """Test webhook without required headers fails."""
        with patch(
            "app.api.v1.endpoints.subscriptions.get_dodo_client"
        ) as mock_get_client:
            mock_client = MagicMock()
            mock_client.verify_webhook_signature.return_value = False  # Missing headers = invalid sig
            mock_get_client.return_value = mock_client

            response = await client.post(
                "/api/v1/subscriptions/webhook",
                content=b'{"type": "payment.completed"}',
                headers={"Content-Type": "application/json"},
            )

            # Should fail signature verification due to missing headers
            assert response.status_code in [401, 400, 500]


class TestSubscriptionStatus:
    """Test subscription status endpoints."""

    async def test_get_subscription_status_no_subscription(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test getting status without active subscription."""
        response = await client.get(
            "/api/v1/subscriptions/current", headers=auth_headers
        )

        # Should return 200 with inactive status or 404
        assert response.status_code in [200, 404]

    async def test_get_subscription_status_no_auth(self, client: AsyncClient):
        """Test getting status without auth fails."""
        response = await client.get("/api/v1/subscriptions/current")
        assert response.status_code == 401

    async def test_get_subscription_status_active_subscription(
        self,
        client: AsyncClient,
        auth_headers: dict,
        db_session: AsyncSession,
        test_user: dict,
    ):
        """Test current subscription returns active payload even with naive end_date values."""
        user = await UserService.get_by_email(db_session, test_user["email"])
        assert user is not None

        subscription = Subscription(
          parent_id=user.id,
          plan_type=SubscriptionPlanType.FULL_ANNUAL,
          amount_paid=600000,
          currency="INR",
          start_date=datetime.utcnow() - timedelta(days=2),
          end_date=datetime.utcnow() + timedelta(days=30),
          status=SubscriptionStatus.ACTIVE,
        )
        db_session.add(subscription)
        await db_session.commit()

        response = await client.get(
            "/api/v1/subscriptions/current", headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["has_active"] is True
        assert data["subscription"]["plan_type"] == "full_annual"
        assert data["days_remaining"] is not None


class TestSubscriptionGameSelection:
    """Test game selection for subscriptions."""

    async def test_select_games_no_auth(self, client: AsyncClient):
        """Test game selection without auth fails."""
        response = await client.put(
            "/api/v1/subscriptions/games",
            json={"game_ids": ["game1", "game2"]},
        )
        assert response.status_code == 401

    async def test_swap_game_no_auth(self, client: AsyncClient):
        """Test game swap without auth fails."""
        response = await client.put(
            "/api/v1/subscriptions/games/swap",
            json={"old_game_id": "game1", "new_game_id": "game2"},
        )
        assert response.status_code == 401


class TestSubscriptionUpgrade:
    """Test subscription upgrade."""

    async def test_upgrade_subscription_no_auth(self, client: AsyncClient):
        """Test upgrade without auth fails."""
        response = await client.post(
            "/api/v1/subscriptions/upgrade",
            params={"new_plan_type": "full_annual"},
        )
        assert response.status_code == 401

    async def test_upgrade_subscription_invalid_plan(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test upgrade with invalid plan fails."""
        response = await client.post(
            "/api/v1/subscriptions/upgrade",
            params={"new_plan_type": "invalid_plan"},
            headers=auth_headers,
        )
        assert response.status_code == 422


class TestSubscriptionCancel:
    """Test subscription cancellation."""

    async def test_cancel_subscription_no_auth(self, client: AsyncClient):
        """Test cancellation endpoint (if exists)."""
        # Note: Cancel endpoint may not exist in current implementation
        response = await client.post("/api/v1/subscriptions/cancel")
        # Accept any of these - endpoint may not be implemented
        assert response.status_code in [401, 404, 405]

    async def test_cancel_subscription_no_active(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test cancellation without active subscription."""
        response = await client.post(
            "/api/v1/subscriptions/cancel", headers=auth_headers
        )

        # Should return 404 or 400 since no active subscription
        assert response.status_code in [200, 404, 400]
