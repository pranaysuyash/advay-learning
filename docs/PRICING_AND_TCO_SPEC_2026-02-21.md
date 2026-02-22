# Pricing and TCO Spec — Learning for Kids (2026-02-21)

Status: Draft v1.0
Owner: Solo dev (Pranay)

1. Overview

- Goal: Keep pricing simple, ship fast, and ensure sustainability in India-first market.
- Output: Minimal pricing, ₹6k/year analysis, ₹1.5k/year viability, TCO, break-even, Dodo Payments setup, sandbox and rollout checklists.

2. Final Simple Offer (Launch)

- Free: 3–5 rotating games, 1 child profile, limited progress.
- Family Monthly (choose one anchor):
  - Option M1: ₹299/mo
  - Option M2: ₹349/mo
- Family Annual (25–30% off vs 12× monthly):
  - If ₹299/mo: ₹2,499–₹2,699/yr
  - If ₹349/mo: ₹2,999–₹3,349/yr
- No trials, coupons, or add-ons at launch (reduce edge cases).
- Rationale: One paid plan + annual = least cognitive load and clean analytics.

3. Should we price at ₹6,000/year?

- Viable if you bundle tangible value beyond digital content:
  - Parent coaching or teacher time
  - Monthly physical/printable kits
  - Advanced parent analytics or homeschool/classroom features
- Expect materially lower conversion for baseline digital-only at ₹6k/yr in India.
- Treat ₹5,999–₹6,999/yr as a separate “Family Plus (Bundle)” experiment after baseline success.

4. Can ₹1,500/year cover all charges?

- Yes, if infra is lean and variable costs are low; else margins are tight.
- Use the model below with your actual fee schedule from Dodo’s pricing page.

5. Total Cost of Ownership (TCO) — Solo Dev
   Fixed monthly costs (₹/mo; lean ranges):

- Frontend hosting + CDN: 0–1,000
- Backend app hosting: 1,000–2,000
- Postgres (managed): 500–1,500
- Object storage + CDN egress: 200–800
- Email (transactional): 0–800
- Error tracking/monitoring/logging: 0–1,000
- Analytics: 0–800
- Domain amortization: ~70
- Misc./headroom (cron, backups): 300–1,000
  Lean baseline fixed C ≈ ₹3,500–₹8,000/mo

Variable per paid family (₹/yr):

- Support time: 100–400
- Email volume: 20–100
- AI tokens/compute (if any): 0–300
- Content bandwidth/asset usage: 0–200
  Conservative v₹ ≈ ₹200–₹800/yr

Owner salary target S (₹/mo): set explicitly (e.g., ₹0 initially; later ₹100k+/mo).

6. Revenue and Break-even Math
   Definitions:

- P = listed annual price (₹)
- t = GST if price is tax-inclusive (e.g., 0.18), else 0 for tax-exclusive display
- f% = blended MoR/payment fee on gross P
- f₹ = fixed per-transaction fee (₹)
- p₹ = payout fee allocation per subscriber (₹, often small)
- v₹ = variable cost per paid family per year (₹)

Tax-inclusive pricing:

- Pre-tax revenue base R = P / (1 + t)
- Estimated net to you N ≈ R − (f% × P) − f₹ − p₹

Tax-exclusive pricing:

- R = P
- Estimated net to you N ≈ R − (f% × P) − f₹ − p₹

Margin after variable cost:

- Net margin per family M ≈ N − v₹
- Monthly contribution per family ≈ M / 12

Families to break even:

- Families ≈ 12(C + S) / M

Worked examples (illustrative; confirm actual fees at https://dodopayments.com/pricing):

- Assume tax-inclusive with t = 0.18 and mid-fee band f% = 5%, f₹ = ₹10, p₹ = ₹0.
- P = ₹1,500 → R ≈ 1,271; N ≈ 1,271 − 75 − 10 = ₹1,186; M depends on v₹ (e.g., v₹=₹400 → M≈₹786; ≈₹65.5/mo)
- P = ₹2,999 → R ≈ 2,542; N ≈ 2,542 − 150 − 10 = ₹2,382; with v₹=₹400 → M≈₹1,982; ≈₹165/mo)
- P = ₹6,000 → R ≈ 5,085; N ≈ 5,085 − 300 − 10 = ₹4,775; with v₹=₹400 → M≈₹4,375; ≈₹365/mo)

Break-even examples (C=₹6,000; S=₹0; v₹=₹400):

- ₹1,500 plan: M≈₹786 → Families ≈ 12×6,000 / 786 ≈ 92
- ₹2,999 plan: M≈₹1,982 → Families ≈ 36
- ₹6,000 plan: M≈₹4,375 → Families ≈ 17
  Note: salary S scales linearly; e.g., S=₹100k/mo adds ≈ 1,526 families at ₹1,500, ≈ 605 at ₹2,999, ≈ 274 at ₹6,000 (using above M values).

7. Dodo Payments Setup (Minimal)

- Products: create Family Monthly (INR) and Family Annual (INR).
- Subscriptions: no trials at launch; enable self-serve cancellation.
- Plan change: allow Monthly → Annual; choose simple immediate cycle reset if preferred.
- Checkout Sessions: sell subscription products; keep flow minimal.
- Customer Portal: enable subscription updates/cancel.
- India payment methods: enable cards and UPI/RuPay per current capability.
- Payouts & FX: understand deductions and reconciliation.

Official docs:

- Subscriptions (plans, trials, plan changes, proration): https://docs.dodopayments.com/features/subscription
- Products: https://docs.dodopayments.com/features/products
- Add-ons: https://docs.dodopayments.com/features/addons
- Upgrade/Downgrade Guide: https://docs.dodopayments.com/developer-resources/subscription-upgrade-downgrade
- Subscription Integration Guide (Checkout Sessions): https://docs.dodopayments.com/developer-resources/subscription-integration-guide
- Payout deductions: https://docs.dodopayments.com/features/payouts/payout-structure
- India payment methods: https://docs.dodopayments.com/features/payment-methods/india
- Adaptive Currency (FX/refunds): https://docs.dodopayments.com/features/adaptive-currency
- Pricing (fees overview): https://dodopayments.com/pricing

8. Sandbox Test Plan

- Purchase Family Monthly and Family Annual
- Trial-to-paid: N/A at launch (no trials); verify straight paid flow
- Plan change Monthly → Annual with immediate reset (if enabled)
- Renewal for monthly; ensure invoices and emails
- Payout reconciliation on test data
- Portal flows: view subscription, change plan, cancel
- Webhooks: verify signature, log subscription lifecycle events

9. Production Rollout Checklist

- Start with one monthly anchor (₹299 or ₹349) + one annual price (25–30% off)
- Turn on dunning/retry emails before GA
- Monitor daily: landing→checkout CTR, checkout conversion, monthly renewal success, annual take-rate, refunds/chargebacks
- Adjust only one lever at a time (price, annual discount, or a single intro mechanism)

10. KPIs to Track

- Conversion: landing→checkout CTR; checkout→paid CVR
- Retention: 30/90-day renewal for monthly
- Annual take-rate
- Refund/chargeback rate
- Net revenue per family; net margin after variable costs

11. When to add complexity later

- Introduce a short trial OR a single intro coupon (not both simultaneously)
- Add “Family Plus (Bundle)” at ₹5,999–₹6,999 with tangible benefits
- Add-on: Extra Profiles (+2) at ₹49–₹79/mo if attach-rate opportunity is clear
- Expand currencies (USD/EUR) after INR metrics stabilize

12. Security and Compliance Notes

- Store API keys and webhook secrets in environment variables
- Verify webhook signatures for all events
- Don’t store card data; use hosted checkout
- Follow test-mode vs live-mode base URLs per environment policy

13. Revision Log

- 2026-02-21 v1.0: Initial draft created from Sentra pricing discussion

Appendix A — Conversation & Decision Log (Complete)

- 2026-02-21 18:49 IST — User: “how should we price this web app?”
  - Sentra initial recommendation (multi-tier plan):
    - Consumer (parents)
      - Free: rotating 3–5 games; 1 child profile; limited progress history
      - Starter: $4.99/mo or ₹199/mo; full library; 1 child profile
      - Family: $7.99/mo or ₹349/mo; up to 4 child profiles; parental dashboard
      - Annual: 20–30% discount (indicative: Starter $44.99/₹899; Family $74.99/₹1,499)
      - Trials/promos: 7-day free trial on Family OR first-month intro at $0.99/₹49 via checkout discounts
    - Education (schools)
      - $2.50–$3.00 per student/month billed annually; minimum 20 seats
      - Volume tiers: 100+ (10% off), 500+ (15–20% off); custom above 2,000
    - Add-ons
      - Extra Profiles Pack (+2): $1.00/mo or ₹49/mo
      - Printables (one-time): $4.99 or ₹149
    - Regional pricing
      - Localized INR/US price points; enable local payment methods
    - Plan changes & proration
      - Recommended: prorated_immediately; alternatives: difference_immediately or full_immediately
    - Launch experiments & KPIs
      - Price A/Bs, trial vs. intro promo, annual discount levels; measure CTR, checkout CVR, trial conversion, NRR, attach rate
    - Dodo Payments mapping
      - Products for tiers; attach add-ons; configure trials/discounts; enable portal; handle proration via Change Plan API; webhooks
    - Docs gathered via Dodo Knowledge MCP (full list in Appendix C)

- 2026-02-21 18:50–18:51 IST — Tool enforcement note; Sentra fetched official docs (Subscriptions, Products, Add-ons, Upgrade/Downgrade, Integration Guide, Unified Customer Portal) and proposed an implementation-ready plan referencing those docs.

- 2026-02-21 18:57 IST — User: “document everything you said, keep it simple; why not ₹6k/yr? would ₹1.5k/yr cover charges?”
  - Sentra response:
    - Simplified launch: one paid plan (Family Monthly) + an Annual option; no trials, coupons, or add-ons initially
    - ₹6k/yr viable as a premium “Family Plus (Bundle)” with tangible value (coaching/teacher time/physical kits/advanced analytics)
    - Added TCO / fee model to analyze ₹1.5k/yr viability

- 2026-02-21 18:58–19:00 IST — Sentra retrieved payout/fees references (Payout Structure; Pricing page pointer) and expanded TCO:
  - Included infra/deployment costs, variable costs per family, and solo-dev salary target
  - Added break-even formulas and worked examples for ₹1,500/₹2,999/₹6,000

- 2026-02-21 19:06–19:12 IST — User: “is this saved as a file?” → Sentra created [docs/PRICING_AND_TCO_SPEC_2026-02-21.md](docs/PRICING_AND_TCO_SPEC_2026-02-21.md) capturing the simplified offer, TCO, revenue math, and Dodo setup.

- 2026-02-21 19:13 IST — User: “ensure the original multi-plan and all iterations are documented” → This Conversation Log and Appendix B added.

Appendix B — Original Multi‑Tier Pricing Proposal (Detailed Reference)

- Consumer (parents)
  - Free
    - Rotating 3–5 games; 1 child profile; limited progress history
  - Starter
    - $4.99/mo (US) or ₹199/mo (IN); full library; 1 child profile
  - Family
    - $7.99/mo (US) or ₹349/mo (IN); up to 4 child profiles; parental dashboard
  - Annual
    - 20–30% off monthly (indicative: Starter $44.99/₹899; Family $74.99/₹1,499)
  - Trials and intro promotions
    - 7-day free trial on Family OR introductory first month at $0.99/₹49 using Checkout Discounts

- Education (schools)
  - Annual commitment; billed annually; minimum 20 seats
  - $2.50–$3.00 per student/month (billed annually) or INR equivalent
  - Volume tiers: 100+ (10% off), 500+ (15–20% off), custom above 2,000
  - Optional add-ons: teacher resources, printable packs, per-class analytics

- Add-ons (consumer)
  - Extra Profiles Pack (+2): $1.00/mo or ₹49/mo
  - Printables/Offline Activity Pack (one-time): $4.99 or ₹149

- Regional pricing
  - Use rounded, market-appropriate thresholds; enable local payment methods to lift conversion

- Plan change and proration
  - Recommended: prorated_immediately
  - Alternative: difference_immediately (simple charges/credits) or full_immediately (reset cycle)

- Launch experiments and KPIs
  - Price tests: Family $6.99/$7.99/$8.99 (US) and ₹299/₹349/₹399 (IN)
  - Entry: 7-day trial vs first-month intro discount (test only one mechanism per cohort)
  - Annual discount: 20% vs 30% vs 40%
  - KPIs: landing→checkout CTR, checkout CVR, trial conversion, refund/chargeback rate, add-on attach, NRR

- Dodo Payments mapping (original plan)
  - Create products per tier and cadence (Monthly/Annual) per currency
  - Attach add-ons (Extra Profiles, Printables) to appropriate subscriptions
  - Enable Family Monthly trial if chosen; configure intro discounts in Checkout
  - Allow self-serve plan changes via Customer Portal; use Change Plan API for proration mode
  - Mixed cart supported (subscription + one-time)
  - Implement webhooks for subscription lifecycle and payments

Appendix C — Dodo Payments Docs Cited

- Subscriptions (plans, trials, plan changes, proration): https://docs.dodopayments.com/features/subscription
- Products: https://docs.dodopayments.com/features/products
- Add-ons: https://docs.dodopayments.com/features/addons
- Subscription Upgrade/Downgrade (Change Plan API, proration modes): https://docs.dodopayments.com/developer-resources/subscription-upgrade-downgrade
- Subscription Integration Guide (Checkout Sessions): https://docs.dodopayments.com/developer-resources/subscription-integration-guide
- Checkout Features (discounts, multi-currency, compliance): https://docs.dodopayments.com/features/checkout
- Payout deductions (taxes, fees, payout fees): https://docs.dodopayments.com/features/payouts/payout-structure
- India payment methods (UPI/RuPay, mandates context): https://docs.dodopayments.com/features/payment-methods/india
- Adaptive Currency (FX/refunds): https://docs.dodopayments.com/features/adaptive-currency
- Changelog v1.67.0 (Unified Customer Portal): https://docs.dodopayments.com/changelog/v1.67.0
- Changelog v0.19.0 (UPI & RuPay update; scope may vary by product/time): https://docs.dodopayments.com/changelog/v0.19.0

Notes

- Discounts/promotions should be configured using Checkout’s Discounts capability; availability and configuration can vary by account/region. Confirm in the dashboard.

Appendix D — Revision Log Updates

- 2026-02-21 v1.1: Added complete conversation/decision log and original multi-tier proposal; expanded docs citations.
