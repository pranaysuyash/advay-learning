# Email Service Implementation Research

**Date:** 2026-03-12
**Context:** Onboarding/auth audit finding - email verification not functional

---

## Audit Finding Summary

| Issue | Evidence |
|-------|----------|
| Email sender is stub logger | `src/backend/app/core/email.py` logs to console instead of sending |
| No frontend verification route | `src/frontend/src/App.tsx` has no `/verify-email` route |
| **Impact** | Users cannot complete self-serve signup |

---

## Research: Existing Projects

### 1. `/Users/pranay/Projects/bas5minute`

**Status:** Email service planned but NOT implemented

| Provider | Config Location | Implementation Reference |
|----------|----------------|-------------------------|
| Resend (recommended) | `TODO.md` lines 79-96 | Code pattern available |
| SendGrid | `DEPLOYMENT.md` lines 310-319 | Config format available |

**Resend Implementation Pattern:**
```typescript
import Resend from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'orders@bas5minute.com',
  to: email,
  subject: 'Order Received',
  html: `<h1>Thanks!</h1>...`
});
```

**SendGrid Config:**
```env
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=your_sendgrid_key
FROM_EMAIL=licenses@your-domain.com
```

---

### 2. Other Projects

| Project | Status |
|---------|--------|
| school_admissions | No email implementation |
| antigravity_experiments | No email implementation |
| workspace_memory | Research only (email receiving) |

---

## Recommended Approach for learning_for_kids

### Option A: Resend (Recommended)

**Pros:**
- Easiest setup (API key only)
- Excellent free tier (3,000 emails/month)
- Modern API, good DX
- Already referenced in bas5minute TODO

**Cons:**
- Requires domain verification for production

**Implementation:**
1. Install: `pip install resend` (Python)
2. Get API key from https://resend.com
3. Add `RESEND_API_KEY` to env
4. Update `src/backend/app/core/email.py` to use Resend SDK

---

### Option B: SendGrid

**Pros:**
- More established
- Higher free tier (100 emails/day)

**Cons:**
- More complex setup
- More expensive at scale

---

## Implementation TODO

### Backend (P0)
- [ ] Install Resend SDK
- [ ] Add `RESEND_API_KEY` to config
- [ ] Update `src/backend/app/core/email.py` to send via Resend
- [ ] Add `FROM_EMAIL` config
- [ ] Test email sending

### Frontend (P0)
- [ ] Create `/verify-email` route in `App.tsx`
- [ ] Create `VerifyEmailPage.tsx` component
- [ ] Handle token validation and user feedback

### Verification
- [ ] Test full registration flow end-to-end
- [ ] Verify email delivered to inbox
- [ ] Verify link completes verification

---

## Related Files

| File | Purpose |
|------|---------|
| `src/backend/app/core/email.py` | Current stub implementation |
| `src/backend/app/api/v1/endpoints/auth.py` | Auth endpoints (register calls email) |
| `src/frontend/src/App.tsx` | Frontend routes (missing verify-email) |
| `src/frontend/src/services/api.ts` | API client (verifyEmail exists) |
| `.env.example` | Config template (needs email vars) |

---

## Next Steps

1. Choose provider (Resend recommended)
2. Get API key
3. Implement backend changes
4. Implement frontend verification page
5. Test end-to-end

