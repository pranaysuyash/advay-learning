from unittest.mock import AsyncMock, patch
from uuid import UUID

from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.consent import ConsentStatus, ParentalConsent
from app.services.user_service import UserService


class TestParentalConsent:
    async def _auth_headers(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        email: str = "consent-parent@example.com",
        password: str = "GalaxyPass123!",
    ) -> dict[str, str]:
        await client.post(
            "/api/v1/auth/register",
            json={"email": email, "password": password},
        )
        user = await UserService.get_by_email(db_session, email)
        assert user is not None
        await UserService.verify_email(db_session, user)
        login_response = await client.post(
            "/api/v1/auth/login",
            data={"username": email, "password": password},
        )
        assert login_response.status_code == 200
        token = login_response.cookies.get("access_token")
        assert token
        return {"Authorization": f"Bearer {token}"}

    async def test_create_consent_sends_email_code(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
    ):
        auth_headers = await self._auth_headers(client, db_session)

        with patch(
            "app.api.v1.endpoints.consent.EmailService.send_parental_consent_verification_email",
            new=AsyncMock(),
        ) as mock_send:
            response = await client.post(
                "/api/v1/consent/",
                json={
                    "parent_email": "consent-parent@example.com",
                    "child_name": "Aarav",
                    "verification_method": "email",
                    "consent_version": "1.0",
                    "data_processing_purpose": "Educational activity personalization and progress tracking",
                },
                headers=auth_headers,
            )

        assert response.status_code == 201
        payload = response.json()
        assert payload["status"] == "pending"
        mock_send.assert_awaited_once()

        result = await db_session.execute(
            select(ParentalConsent).where(ParentalConsent.id == UUID(payload["id"]))
        )
        consent = result.scalar_one()
        assert consent.verification_token is not None
        assert len(consent.verification_token) == 6

    async def test_verify_email_consent_requires_matching_code(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
    ):
        auth_headers = await self._auth_headers(client, db_session, email="email-consent@example.com")

        with patch(
            "app.api.v1.endpoints.consent.EmailService.send_parental_consent_verification_email",
            new=AsyncMock(),
        ):
            create_response = await client.post(
                "/api/v1/consent/",
                json={
                    "parent_email": "email-consent@example.com",
                    "child_name": "Ira",
                    "verification_method": "email",
                },
                headers=auth_headers,
            )

        consent_id = create_response.json()["id"]
        result = await db_session.execute(
            select(ParentalConsent).where(ParentalConsent.id == UUID(consent_id))
        )
        consent = result.scalar_one()

        bad_response = await client.post(
            f"/api/v1/consent/{consent_id}/verify",
            json={
                "verification_method": "email",
                "email_code": "000000",
            },
            headers=auth_headers,
        )
        assert bad_response.status_code == 400
        assert "invalid email verification code" in bad_response.json()["detail"].lower()

        good_response = await client.post(
            f"/api/v1/consent/{consent_id}/verify",
            json={
                "verification_method": "email",
                "email_code": consent.verification_token,
            },
            headers=auth_headers,
        )
        assert good_response.status_code == 200
        assert good_response.json()["status"] == "verified"

        await db_session.refresh(consent)
        assert consent.status == ConsentStatus.VERIFIED
        assert consent.email_verified is True
        assert consent.verification_token is None

    async def test_dodopayments_webhook_verifies_pending_card_consent(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
    ):
        auth_headers = await self._auth_headers(client, db_session, email="card-consent@example.com")

        create_response = await client.post(
            "/api/v1/consent/",
            json={
                "parent_email": "card-consent@example.com",
                "child_name": "Neel",
                "verification_method": "dodopayments",
            },
            headers=auth_headers,
        )
        consent_id = create_response.json()["id"]

        verify_response = await client.post(
            f"/api/v1/consent/{consent_id}/verify",
            json={
                "verification_method": "dodopayments",
                "payment_token": "test_token_fixture_not_real",
            },
            headers=auth_headers,
        )
        assert verify_response.status_code == 200
        assert verify_response.json()["status"] == "pending"

        with patch(
            "app.api.v1.endpoints.consent.get_dodo_client"
        ) as mock_get_client:
            mock_client = mock_get_client.return_value
            mock_client.verify_webhook_signature.return_value = True

            response = await client.post(
                "/api/v1/consent/webhooks/dodopayments",
                content=(
                    '{"type":"payment.succeeded","data":{"id":"pay_123",'
                    '"metadata":{"consent_id":"%s"}}}' % consent_id
                ),
                headers={
                    "Content-Type": "application/json",
                    "webhook-id": "wh_123",
                    "webhook-timestamp": "1731450000",
                    "webhook-signature": "sig_123",
                },
            )

        assert response.status_code == 200
        assert response.json()["status"] == "verified"

        result = await db_session.execute(
            select(ParentalConsent).where(ParentalConsent.id == UUID(consent_id))
        )
        consent = result.scalar_one()
        assert consent.status == ConsentStatus.VERIFIED
        assert consent.card_verified is True
        assert consent.card_transaction_id == "pay_123"
