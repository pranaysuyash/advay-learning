# Pricing Research Documentation — Complete Index

**Last Updated**: 2026-02-22  
**Status**: Research complete with user corrections applied

---

## Document Overview

### 1. **PRICING_RESEARCH_VALIDATED_2026-02-22.md** (1,306 lines)

**PRIMARY REFERENCE** — Comprehensive validated pricing research

**Contains:**

- Executive summary with critical corrections from original analysis
- Research methodology (data sources, assumptions registry, confidence levels)
- Infrastructure costs validated against 2026 actual provider pricing (Vercel, Railway, Neon, CDN)
- Payment processing deep dive (6 gateways compared: Razorpay, Cashfree, Instamojo, Dodo, Stripe, app stores)
- Customer acquisition reality (bootstrapped SaaS benchmarks, organic channels, paid channel economics)
- Pricing psychology & willingness-to-pay (India market research)
- Trial-to-paid conversion benchmarks (industry standards)
- Hidden costs (chargebacks, support, technical)
- **Recommended pricing structure**: ₹6,000/year India, $50/year global, 7-day trial, Dodo Payments gateway
- Unit economics scenarios (5 scenarios from conservative to recommended)
- Implementation roadmap (12-month plan)
- Addendum: Issues with previous analysis
- Data sources & references (22 sources cited)

**How to Use:**

- Start with Executive Summary for high-level overview
- Use Section 9 (Unit Economics) for financial planning
- Use Section 10 (Implementation Roadmap) for launch checklist
- Reference Section 11 to understand what changed from original analysis

---

### 2. **PRICING_RESEARCH_DISCUSSION_LOG_2026-02-22.md** (707 lines)

**CONTEXT & REASONING** — Narrative of research conversation

**Contains:**

- Timeline of all discussions (Phase 1-8)
- Your specific pushbacks with impact analysis:
  - Infrastructure costs inflated 100×
  - Double-counting costs (email/bandwidth in 2 buckets)
  - User acquisition unrealistic (111K trials in 8 months)
  - India vs. Global not separated
  - App store fees overemphasized
  - Limited price point range
  - Dodo Payments not prioritized
  - ₹6,000/year pricing not explored
  - Company registration requirement oversight
- My confusions and how they were resolved
- Optionalities explored (7 decision areas with trade-offs)
- Decision points with final recommendations
- Lessons learned (agent self-reflection)
- Open questions for future research

**How to Use:**

- Read Phase 2 & Phase 8 for understanding evolution
- Refer to "Key Confusions" section when questioning assumptions
- Use "Optionalities Explored" section to revisit alternative strategies
- Reference "Lessons Learned" to understand agent biases

---

### 3. **PRICING_CORRECTIONS_SUMMARY_2026-02-22.md** (183 lines)

**QUICK REFERENCE** — User corrections applied

**Contains:**

- Summary of 3 critical corrections:
  1. Payment Gateway: Dodo Payments (no registration needed) vs. Cashfree/Razorpay
  2. Annual Pricing: ₹6,000/year (premium) vs. ₹2,999/year (affordable)
  3. Company Registration Requirement (research oversight)
- Before/after comparison
- Revenue/profit impact analysis
- Why agent got each wrong
- Updated positioning & feasibility
- Documents updated & locations
- Key insights from corrections
- Next implementation steps

**How to Use:**

- Send to stakeholders as "what changed and why" summary
- Use before/after comparison for pricing decision
- Reference when explaining why Dodo Payments chosen
- Use "Next Implementation Steps" as launch checklist

---

### 4. **COMPREHENSIVE_PRICING_STRATEGY_2026-02-20.md** (42KB)

**ORIGINAL ARTIFACT** — Flawed initial analysis (preserved)

**Current State:**

- Contains original incorrect assumptions
- Infrastructure costs inflated (₹72K/year from Day 1)
- Cost double-counting (email/bandwidth in both buckets)
- Unrealistic user acquisition (100K trials)
- Primarily India-focused
- Only 4 price points analyzed

**Purpose:**

- Artifact showing "before" state
- Learning resource for understanding what changed
- Historical record for future reference

**Do NOT use for implementation** — Use validated research documents instead

---

### 5. **PRICING_AND_TCO_SPEC_2026-02-21.md** (14KB)

**REFERENCE** — Original internal strategic spec

**Status:**

- Contains "lean worst-case" infrastructure estimates
- Source for break-even analysis
- Partially validated in research

**Usage:**

- Historical reference only
- Don't treat estimates as actual costs (they're planning buffers)

---

## Recommended Reading Order

**For Decision-Makers** (20 min):

1. PRICING_CORRECTIONS_SUMMARY (quick overview)
2. PRICING_RESEARCH_VALIDATED Section 8-9 (pricing + unit economics)

**For Implementers** (60 min):

1. PRICING_RESEARCH_VALIDATED Executive Summary
2. PRICING_RESEARCH_VALIDATED Section 10 (Implementation Roadmap)
3. PRICING_CORRECTIONS_SUMMARY (next steps)

**For Deep Dive** (120+ min):

1. PRICING_RESEARCH_VALIDATED (full document)
2. PRICING_RESEARCH_DISCUSSION_LOG (understand reasoning)
3. Reference specific sections as needed

---

## Key Numbers (CORRECTED)

### Pricing

- **India**: ₹6,000/year (₹500/month equivalent)
- **Early Adopter**: ₹2,999/year for first 50 customers
- **Global**: $50/year (PPP-adjusted)
- **Payment Gateway**: Dodo Payments (4.5% fee)

### Unit Economics (Year 1, 175 paying customers)

- **Total Revenue**: ₹971K
- **Net after Dodo fees**: ₹926K
- **Total Costs**: ₹527K
- **Net Profit**: ₹444K
- **Per-Customer Revenue**: ₹6,000
- **Per-Customer Net**: ₹5,730
- **Marginal Cost**: ₹500/user
- **LTV:CAC at 12-month retention**: 1.97:1 ✅ (healthy)

### Customer Acquisition

- **Months 1-3**: Organic (0-50 paying customers)
- **Months 4-6**: Lean paid ₹20-30K/month (50-150 paying customers)
- **Months 7-12**: Scale if metrics validate (150-250 paying customers)

### Profitability

- **Organic-only (no ads)**: ₹127K profit at 210 customers
- **Recommended (phased)**: ₹444K profit at 175 customers (3.5× higher)
- **Break-even**: ~10-15 paying customers (covers fixed costs)

---

## Critical Decisions Made

| Decision                 | Original                     | Corrected                               | Rationale                                                     |
| ------------------------ | ---------------------------- | --------------------------------------- | ------------------------------------------------------------- |
| **Payment Gateway**      | Cashfree (0% UPI)            | **Dodo Payments**                       | No company registration needed; global from Day 1             |
| **Annual Price**         | ₹2,999                       | **₹6,000**                              | Premium positioning matches unique value; 2.4× higher revenue |
| **Company Registration** | Assumed not needed           | **Required for Cashfree/Razorpay**      | Solo dev can use Dodo immediately, incorporate later          |
| **Unit Economics**       | Need 24-month retention      | **12-month retention viable**           | Higher pricing improves LTV:CAC to 1.97:1                     |
| **Growth Strategy**      | Aggressive paid from Month 1 | **Phased: Organic → Lean Paid → Scale** | Validate PMF and retention before scaling                     |

---

## Question Bank (When to Reference Each Section)

**"What are actual infrastructure costs?"**
→ PRICING_RESEARCH_VALIDATED Section 2

**"Which payment gateway should I use?"**
→ PRICING_CORRECTIONS_SUMMARY (Dodo Payments) + PRICING_RESEARCH_VALIDATED Section 3

**"What should I charge?"**
→ PRICING_CORRECTIONS_SUMMARY or PRICING_RESEARCH_VALIDATED Section 8

**"Will this be profitable?"**
→ PRICING_RESEARCH_VALIDATED Section 9 (unit economics scenarios)

**"How do I launch?"**
→ PRICING_RESEARCH_VALIDATED Section 10 (implementation roadmap)

**"Why did you change from original analysis?"**
→ PRICING_RESEARCH_DISCUSSION_LOG (Phase 2-8) or PRICING_CORRECTIONS_SUMMARY

**"What are the risks?"**
→ PRICING_RESEARCH_VALIDATED Section 7 (hidden costs)

**"How do I acquire customers?"**
→ PRICING_RESEARCH_VALIDATED Section 4 (user acquisition reality check)

**"What do parents actually spend on education?"**
→ PRICING_RESEARCH_VALIDATED Section 5 (willingness-to-pay)

**"What conversion rate should I expect?"**
→ PRICING_RESEARCH_VALIDATED Section 6 (trial-to-paid benchmarks)

---

## Version History

| Version       | Date                 | Status      | Key Updates                                                                  |
| ------------- | -------------------- | ----------- | ---------------------------------------------------------------------------- |
| 1.0 Original  | 2026-02-20           | ❌ Flawed   | Cashfree, ₹2,999, 100K trials, double-counting                               |
| 2.0 Validated | 2026-02-22 (initial) | ⚠️ Partial  | Corrected costs, but missed gateway/pricing feedback                         |
| 2.1 Corrected | 2026-02-22 (current) | ✅ Complete | Dodo Payments, ₹6,000, company registration requirement, full unit economics |

---

## Checklist for Launch (From PRICING_CORRECTIONS_SUMMARY)

### Week 1: Payment Gateway

- [ ] Sign up for Dodo Payments (no registration docs needed)
- [ ] Set up ₹6,000/year subscription product
- [ ] Configure 7-day trial with card authorization (₹0 hold)
- [ ] Test payment flow in sandbox

### Week 2: Deploy

- [ ] Frontend on Vercel free tier
- [ ] Backend on Railway (free trial)
- [ ] Database on Neon (free tier)
- [ ] Set up error monitoring + analytics

### Months 1-3: Soft Launch

- [ ] Announce to 20 friends/family (₹2,999 friend pricing)
- [ ] 5 parenting Facebook groups (organic)
- [ ] Target: 500 trial signups, 25-50 paying customers

### Months 4-6: Paid Acquisition

- [ ] ₹20-30K/month ad budget
- [ ] Meta Ads (₹12K) + Google Ads (₹10K) + Influencers (₹2K)
- [ ] Target: 1,500 trials cumulative, 100-150 paying customers

---

**Questions? Refer to appropriate section above or check Discussion Log for reasoning.**
