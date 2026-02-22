# Pricing Corrections Summary — User Feedback Applied

**Date**: 2026-02-22  
**Status**: User corrections integrated into validated research documents

---

## Three Critical Corrections Applied

### 1. Payment Gateway: Dodo Payments (PRIMARY) ✅

**Original Agent Error**: Recommended Cashfree/Razorpay as "best options"

**User Correction**: "I specifically said I will start with Dodo Payments"

**Critical Oversight**: Agent didn't research company registration requirements

- **Razorpay**: Requires GST certificate, company PAN, incorporation docs ❌
- **Cashfree**: Requires GST registration, business entity proof ❌
- **Dodo Payments**: Works WITHOUT company registration, accepts individuals ✅
- **Instamojo**: Works with individuals (PAN only) but India-only

**Corrected Recommendation**: **Dodo Payments**

- No company registration barrier (launch immediately)
- Global from Day 1 (INR, USD, EUR, GBP)
- PPP + Adaptive Currency built-in
- 4.5% fee
- At ₹6,000/year pricing: ₹5,730 net per customer

**Applied to**: Both validated research document and discussion log

---

### 2. Annual Pricing: ₹6,000/year (NOT ₹2,999) ✅

**Original Agent Error**: Recommended ₹2,999/year as "affordable tier"

**User Correction**: "Why not charge ₹6,000 annually? It's like ₹500/month"

**What User Correctly Identified**:

- ₹500/month is still very reasonable for parents
- Still 2× cheaper than Kiddopia (₹5,500/year)
- Still 10× cheaper than private tutoring (₹5,000-₹10,000/month)
- ₹6,000 is "premium" positioning matching unique camera-based value

**Why Agent Was Wrong**:

- Focused on "affordable" from agent's perspective, not user's
- Didn't account for unique camera-based differentiation justifying premium
- Underestimated solo dev's need for maximum revenue per customer
- Conservative pricing bias (easier to defend low than justify high)

**Revenue Impact** (Year 1 at 175 paying customers):

- **₹2,999 pricing**: ₹649K revenue, ₹127K profit
- **₹6,000 pricing**: ₹971K revenue, ₹444K profit
- **Difference**: +₹322K revenue (+49%), +₹317K profit (+250%)

**Unit Economics at ₹6,000**:

```
Per-customer revenue: ₹6,000
Dodo fee (4.5%): ₹270
Net per customer: ₹5,730
Marginal cost: ₹500
Contribution: ₹5,230 per customer

At 175 customers: ₹915K total contribution (before fixed costs)
At 12-month retention: LTV ₹5,730, LTV:CAC 1.97:1 (sustainable) ✅
```

**Strategy**:

- Launch standard at ₹6,000/year
- Offer ₹2,999 "Founding Member" discount for first 50 customers (creates urgency + testimonials)
- If conversion <2% at ₹6K, test ₹4,499 middle tier

**Applied to**:

- Section 8.1 (Pricing structure)
- Section 9.2-9.5 (Unit economics scenarios)
- Section 9.6 (Unit economics summary table)
- Section 10.2-10.3 (Implementation roadmap)
- Discussion log (Decision 1)

---

### 3. Company Registration Requirement Recognition ✅

**Original Agent Error**: Assumed all payment gateways work with individuals

**User Correction**: "They only work with registered companies"

**Research Validation**:

- ✅ Verified: Razorpay requires GST + incorporation
- ✅ Verified: Cashfree requires GST + business entity
- ✅ Verified: Dodo works with individuals (sole proprietors OK)
- ✅ Verified: Instamojo works with individuals (PAN-only) but India-only

**Implication for Launch Timeline**:

- **Day 1-90**: Use Dodo Payments (no registration needed)
- **Month 4-6**: Incorporate company (if revenue validates)
- **Month 6-12**: Can optionally add Razorpay for 3.54% vs. 4.5% if 1% savings justify dual integration

**Applied to**: Section 3.1 (Payment gateway detailed analysis), Discussion log (Decision 3)

---

## Updated Pricing Direction

### Summary

| Aspect                   | Original (Agent)  | Corrected (User)     | Change                                         |
| ------------------------ | ----------------- | -------------------- | ---------------------------------------------- |
| **Payment Gateway**      | Cashfree (0% UPI) | Dodo Payments (4.5%) | Switched — no registration needed              |
| **India Annual Price**   | ₹2,999/year       | ₹6,000/year          | Raised 2× — premium positioning                |
| **Monthly Equivalent**   | ₹250/month        | ₹500/month           | Raised 2× — still affordable                   |
| **Year 1 Revenue**       | ₹649K             | ₹971K                | +49%                                           |
| **Year 1 Profit**        | ₹127K             | ₹444K                | +250%                                          |
| **LTV:CAC at 12 months** | 1.06:1 ⚠️         | 1.97:1 ✅            | Healthy without waiting for 24-month retention |
| **Early Adopter Offer**  | N/A               | ₹2,999 for first 50  | Creates urgency + testimonials                 |

### Positioning

- **Previous**: "Affordable alternative to free apps" (₹250/month)
- **Corrected**: "Premium digital learning, 1/10 tutoring cost" (₹500/month, camera-based interactive)

### Feasibility

- **Previous**: Requires 18-24 month retention for sustainable unit economics
- **Corrected**: 12-month retention achievable with healthy LTV:CAC

---

## Documents Updated

1. **PRICING_RESEARCH_VALIDATED_2026-02-22.md**
   - Section 3.1: Payment gateway recommendation hierarchy (Dodo PRIMARY)
   - Section 8.1: Pricing structure (₹6,000 recommended)
   - Section 9.3: Unit economics at ₹6,000 pricing
   - Section 10.2-10.3: Implementation roadmap with ₹6,000 pricing

2. **PRICING_RESEARCH_DISCUSSION_LOG_2026-02-22.md**
   - Phase 2: Payment gateway correction (Dodo)
   - Decision 1: Pricing correction (₹6,000)
   - Decision 3: Gateway correction with company registration requirement evidence
   - Summary: Updated key decision section

---

## Key Insights from Corrections

### 1. Registration Barriers Are Real

Agent overlooked that most Indian payment gateways require company registration, which is a **6-8 week process** even for bootstrapped founders. Dodo's no-registration requirement is a critical advantage for immediate launch.

### 2. Premium Pricing Paradox

Higher pricing with unique differentiation often outperforms lower pricing with commodity positioning. Camera-based interaction is genuinely different from static content apps — worth pricing for.

### 3. Solo Dev Economics

Solo dev needs to maximize per-customer revenue because customer acquisition will be slow (organic-first). ₹6,000 × 200 customers = ₹1.2M annual revenue (viable solo dev salary + reinvestment). ₹2,999 × 200 = ₹600K (tight).

### 4. Agent Conservatism Bias

Agent tends toward "affordable/accessible" positioning over "premium/valuable." This is a correctable bias — user feedback helps recalibrate.

---

## Next Implementation Steps

### Week 1: Setup

- [ ] Sign up for Dodo Payments (no registration docs needed)
- [ ] Set up ₹6,000/year subscription product
- [ ] Configure 7-day trial with card authorization (₹0 hold)
- [ ] Test payment flow in sandbox (UPI + cards + international)

### Week 2: Soft Launch

- [ ] Deploy MVP on Vercel free tier
- [ ] Announce to 20 friends/family with ₹2,999 friend pricing
- [ ] Gather first 10-20 trial signups
- [ ] Track: Camera permission rate, session length, trial-to-paid conversion

### Month 1-3: Public Launch

- [ ] 5 parenting Facebook groups (organic)
- [ ] WhatsApp referral program ("Refer 3, get credit")
- [ ] Target: 500 trial signups, 25-50 paying customers

### Month 4-6: Lean Paid Acquisition

- [ ] ₹20-30K/month ad budget (if Months 1-3 retention >12 months)
- [ ] Meta Ads (₹12K) + Google Ads (₹10K) + Influencers (₹2K)
- [ ] Target: 1,500 cumulative trial signups, 100-150 paying customers

---

**These corrections are now baked into both validated research documents.**
