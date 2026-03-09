# Payment Integration: Dodopayments (India)

**Date:** 2026-03-08  
**Status:** Specification Ready for Implementation  
**Related Ticket:** TCK-20260307-CRIT-002 (Parental Consent)

---

## Provider Selection

| Priority | Provider | Status | Use Case |
|----------|----------|--------|----------|
| **P1** | **Dodopayments** | Recommended | Primary - India optimized |
| P2 | Razorpay | Future | Alternative Indian provider |
| ❌ | Stripe | Not Available | Not viable in India (user confirmed) |

### Why Dodopayments?

- ✅ **India-First**: Built for Indian market
- ✅ **UPI Support**: Native UPI integration (essential for India)
- ✅ **Lower Fees**: Competitive pricing vs international providers
- ✅ **Faster Settlement**: Local banking rails
- ✅ **Simple API**: Developer-friendly
- ✅ **Small Transactions**: Perfect for ₹1 verification charges

---

## Implementation: Parental Consent Verification

### Flow Overview

```
1. Parent selects "Credit/Debit Card or UPI" verification
   ↓
2. Frontend calls POST /api/v1/consent/ (creates PENDING record)
   ↓
3. Backend creates Dodopayments payment link/intent
   ↓
4. Parent pays ₹1 (UPI/Card/NetBanking)
   ↓
5. Dodopayments webhook hits our backend
   ↓
6. Backend marks consent as VERIFIED
   ↓
7. Child account activated
```

### API Changes

#### Backend: consent.py (Add Dodopayments)

```python
# In verify_consent endpoint
elif verification.verification_method == VerificationMethod.CREDIT_CARD:
    if not verification.card_token:
        raise HTTPException(...)
    
    # Create Dodopayments payment intent
    payment = await dodopayments.create_payment_intent(
        amount=100,  # ₹1 = 100 paise
        currency="INR",
        metadata={
            "consent_id": str(consent.id),
            "parent_id": str(current_user.id),
            "purpose": "parental_verification"
        }
    )
    
    # Store payment intent ID
    consent.dodopayments_intent_id = payment.id
    
    # Return payment details to frontend
    return {
        "consent": consent,
        "payment": {
            "client_secret": payment.client_secret,
            "amount": 1,
            "currency": "INR"
        }
    }
```

#### Webhook Handler

```python
@router.post("/webhooks/dodopayments")
async def handle_dodopayments_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle Dodopayments payment confirmation webhooks."""
    payload = await request.json()
    
    # Verify webhook signature
    signature = request.headers.get("X-Dodopayments-Signature")
    if not verify_dodo_signature(payload, signature):
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    if payload["event"] == "payment_intent.succeeded":
        consent_id = payload["data"]["metadata"]["consent_id"]
        
        consent = db.query(ParentalConsent).get(consent_id)
        if consent:
            consent.card_verified = True
            consent.status = ConsentStatus.VERIFIED
            consent.consent_timestamp = datetime.utcnow()
            consent.card_transaction_id = payload["data"]["id"]
            
            # Create audit log
            audit_log = ConsentAuditLog(...)
            db.add(audit_log)
            db.commit()
    
    return {"status": "ok"}
```

---

## Dodopayments Configuration

### Environment Variables

```bash
# Dodopayments API Keys
DODOPAYMENTS_API_KEY=dp_live_xxxxxxxxxxxxxxxx
DODOPAYMENTS_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx

# For testing
DODOPAYMENTS_API_KEY_TEST=dp_test_xxxxxxxxxxxxxxxx
```

### Settings Schema

```python
# app/core/config.py
class Settings(BaseSettings):
    # ... existing settings ...
    
    # Payment Providers
    DODOPAYMENTS_API_KEY: str = ""
    DODOPAYMENTS_WEBHOOK_SECRET: str = ""
    DODOPAYMENTS_ENABLED: bool = True
    
    RAZORPAY_KEY_ID: str = ""  # Future
    RAZORPAY_KEY_SECRET: str = ""  # Future
    
    # Parental Verification Settings
    PARENT_VERIFICATION_AMOUNT: int = 100  # 100 paise = ₹1
    PARENT_VERIFICATION_CURRENCY: str = "INR"
```

---

## Frontend Integration

### Dodopayments SDK Integration

```typescript
// In ParentalConsentFlow.tsx
import { loadDodopayments } from '@dodopayments/js';

const handleCardVerification = async () => {
  // 1. Create consent on backend
  const consent = await api.post('/consent', {
    parent_email: email,
    child_name: childName,
    verification_method: 'credit_card'
  });
  
  // 2. Initialize Dodopayments
  const dodo = await loadDodopayments(apiKey);
  
  // 3. Collect payment method
  const { error, paymentIntent } = await dodo.collectPayment({
    clientSecret: consent.payment.client_secret,
    amount: 1,
    currency: 'INR',
    paymentMethods: ['upi', 'card', 'netbanking'], // All Indian methods
  });
  
  if (error) {
    showToast('Payment failed. Please try again.', 'error');
    return;
  }
  
  // 4. Wait for webhook (show "Processing...")
  showToast('Verifying payment...', 'info');
  
  // 5. Poll for verification (or use WebSocket)
  const checkStatus = setInterval(async () => {
    const status = await api.get(`/consent/${consent.id}`);
    if (status.status === 'verified') {
      clearInterval(checkStatus);
      onConsentComplete(status);
    }
  }, 2000);
};
```

### UPI Deep Link Support

```typescript
// For mobile UPI apps
const openUpiApp = (upiId: string, amount: number) => {
  const upiUrl = `upi://pay?pa=${upiId}&pn=AdvayLearning&am=${amount}&cu=INR&tn=ParentVerification`;
  window.location.href = upiUrl;
};
```

---

## Refund Logic

### Automatic Refund After Verification

```python
# In webhook handler, after verification
async def process_verification_and_refund(consent_id: str, payment_id: str):
    """Verify consent and immediately refund the ₹1 charge."""
    
    # 1. Verify consent
    consent = await verify_consent(consent_id)
    
    # 2. Issue refund (async - don't block response)
    asyncio.create_task(refund_verification_charge(payment_id))
    
    return consent


async def refund_verification_charge(payment_id: str):
    """Refund the ₹1 verification charge."""
    try:
        await dodopayments.refunds.create(
            payment_intent=payment_id,
            amount=100,  # Full refund
            reason="Parental verification successful"
        )
        logger.info(f"Refund initiated for payment {payment_id}")
    except Exception as e:
        # Log but don't fail - can refund manually
        logger.error(f"Refund failed for {payment_id}: {e}")
```

### Refund Timing

| Option | Pros | Cons |
|--------|------|------|
| **Immediate** | Parent never charged | More API calls |
| **Daily Batch** | Efficient | Parent sees charge temporarily |
| **Manual** | Full control | Operational overhead |

**Recommendation:** Immediate refund via async task

---

## Testing

### Test Credentials

```bash
# Dodopayments Test Mode
DODOPAYMENTS_API_KEY_TEST=dp_test_xxxxxxxxxxxxxxxx

# Test UPI ID (always succeeds)
TEST_UPI_ID="success@upi"

# Test Card (always succeeds)
TEST_CARD_NUMBER="4111111111111111"
TEST_CARD_EXPIRY="12/25"
TEST_CARD_CVV="123"
```

### Test Flow

```python
# conftest.py
@pytest.fixture
def mock_dodopayments():
    """Mock Dodopayments for testing."""
    with patch("app.services.dodopayments.Dodopayments") as mock:
        mock.create_payment_intent.return_value = {
            "id": "pi_test_123",
            "client_secret": "pi_test_123_secret",
            "amount": 100,
            "currency": "INR"
        }
        mock.refunds.create.return_value = {
            "id": "re_test_123",
            "status": "succeeded"
        }
        yield mock
```

---

## Future: Razorpay Migration Path

### When to Add Razorpay

- International expansion (Razorpay supports more countries)
- Dodopayments downtime/issues
- Feature requirements (Razorpay has more enterprise features)

### Implementation

```python
# Abstract payment provider
class PaymentProvider(ABC):
    @abstractmethod
    async def create_payment_intent(self, amount: int, currency: str, metadata: dict):
        pass

class DodopaymentsProvider(PaymentProvider):
    # Implementation

class RazorpayProvider(PaymentProvider):
    # Implementation

# Factory
async def get_payment_provider() -> PaymentProvider:
    if settings.DODOPAYMENTS_ENABLED:
        return DodopaymentsProvider()
    return RazorpayProvider()
```

---

## Security Considerations

### Webhook Security

```python
def verify_dodo_signature(payload: bytes, signature: str) -> bool:
    """Verify Dodopayments webhook signature."""
    expected = hmac.new(
        settings.DODOPAYMENTS_WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
```

### PCI Compliance

- ✅ Use Dodopayments hosted fields (PCI SAQ A)
- ✅ Never store raw card numbers
- ✅ Store only payment intent IDs
- ✅ Use HTTPS for all payment flows

---

## Summary

| Aspect | Implementation |
|--------|----------------|
| **Primary Provider** | Dodopayments (India-optimized) |
| **Amount** | ₹1 (100 paise) |
| **Methods** | UPI, Card, NetBanking |
| **Refund** | Automatic after verification |
| **Alternative** | Razorpay (future) |
| **Not Using** | Stripe (not viable in India) |

---

**Document Status:** Specification Complete  
**Next Step:** Implement Dodopayments SDK integration in frontend
