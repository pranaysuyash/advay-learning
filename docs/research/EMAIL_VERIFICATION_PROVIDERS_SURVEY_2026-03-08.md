# Email Verification & Transactional Email Provider Survey (2026-03-08)

This document captures hosted and open-source options for:
1. Sending email verification links / OTPs reliably
2. Verifying email quality (syntax, MX/SMTP, disposable, risk)

## Scope

- Focus: transactional auth use case for `learning_for_kids`
- Priority: cost, deliverability, implementation speed, ops burden
- Sources: official pricing/docs pages fetched on 2026-03-08

## Hosted transactional email providers (send verification emails)

### Amazon SES
- Pricing page indicates baseline outbound pricing around **$0.10 / 1,000 emails** (plus data/add-ons).
- Free tier references include **3,000 message charges/month** for eligible new usage periods.
- Optional add-ons: dedicated IPs, Virtual Deliverability Manager, email validation.
- Pros: lowest unit cost at scale; mature infra.
- Cons: more AWS setup/ops complexity.

### Resend
- Free tier: **3,000 emails/mo** with **100/day** cap.
- Pro: **$20/mo for 50,000 emails**, extra around **$0.90 / 1,000**.
- Strong developer-focused workflow and modern API/SDK tooling.
- Pros: fast integration, strong DX.
- Cons: higher unit economics than SES at high volume.

### Postmark
- Free/developer tier shown with **100 emails/month**.
- Paid entry around **$15/mo**, with overage rates by plan.
- Transactional-first product positioning.
- Pros: strong transactional focus/reputation.
- Cons: not the cheapest at high scale.

### Mailgun
- Free option shown as **100 emails/day**.
- Paid plans include Basic/Foundation/Scale tiers; validation available as add-on/included at higher tiers.
- Pros: broad features + validation ecosystem.
- Cons: pricing matrix is more complex than SES/Resend.

### SendGrid
- Free trial shown as **100 emails/day for 60 days**.
- Essentials starts around **$19.95/mo**, Pro around **$89.95/mo**.
- Pros: mature ecosystem and integrations.
- Cons: deliverability tuning can require more active management.

### MailerSend
- Free plan: **500 emails/month**, daily request caps by plan.
- Hobby/Starter/Professional tiers; built-in verification credits and add-ons.
- Pros: startup-friendly plans, decent API ergonomics.
- Cons: smaller ecosystem than SendGrid/Mailgun.

### ZeptoMail (Zoho)
- Credit model shown (example: **₹150 per 10,000 emails** in fetched INR page).
- First credit (10k) highlighted as free trial onboarding.
- Pros: very competitive pay-as-you-go model in some regions.
- Cons: regional pricing/experience variance.

## Dedicated email verification APIs (validate addresses before storing/sending)

### NeverBounce
- Pricing page indicates pay-as-you-go style around **$8 / 1,000 credits**.
- Credits validity window shown (12 months).
- Good for real-time signup validation and batch hygiene.

### Kickbox
- Pricing indicates **$8 / 1,000 verifications** tier and volume discounts.
- Unknown results policy highlighted as credit-friendly.
- Good fit for straightforward API-based validation checks.

### ZeroBounce
- Freemium includes **100 free monthly validations**.
- Credit model with pricing by volume; additional deliverability tools.
- Useful where list hygiene + scoring are both needed.

### Abstract Email Validation API
- Free tier: **100 requests**.
- Paid tiers with MX/SMTP/disposable/risk metadata and API limits.
- Good for rapid integration and moderate-volume API checks.

## Open-source / self-hosted options

### Self-hosted transactional mail stacks

#### Postal (`postalserver/postal`)
- Open-source mail delivery platform positioned as self-hosted alternative to SendGrid/Mailgun/Postmark.
- Good feature set, but requires substantial mail ops expertise.

#### Docker Mailserver (`docker-mailserver/docker-mailserver`)
- Full-stack mail server (SMTP/IMAP/antispam/antivirus/etc.) in Docker.
- Operationally heavy for app teams focused only on transactional sends.

#### Mailcow (`mailcow/mailcow-dockerized`)
- Full-featured dockerized mail ecosystem.
- Powerful, but significant maintenance/security burden.

#### Maddy (`foxcpp/maddy`)
- Composable all-in-one mail server; includes auth/security protocols.
- IMAP storage is called out as beta in project docs.

### Open-source email quality checks

#### Disposable domain blocklist
- `disposable-email-domains/disposable-email-domains` (CC0).
- Actively maintained blocklist/allowlist pattern with example integrations.

#### `AfterShip/email-verifier`
- Go library for syntax/MX/SMTP/disposable/role/free-domain checks.
- Caveat documented: SMTP checks can fail/hang when outbound port 25 is blocked.

#### `trumail/trumail`
- Historically useful, but repository is archived/read-only (not recommended for new production adoption).

## Recommendation for this repo

### Preferred stack (balanced)
1. **Provider for sending verification emails:**
   - Default: **Resend** (fastest integration + good developer experience), or
   - Cost-optimized: **SES** (lower unit cost, higher setup complexity)
2. **Signup hygiene:**
   - Add local **disposable-email-domains** blocklist check
3. **Optional stronger validation:**
   - Add Kickbox/NeverBounce/Abstract check at registration only (not every auth flow)

### Why
- Minimizes false signups and bounce risk
- Keeps operational burden low for current team
- Preserves future migration flexibility

## Implementation notes for `learning_for_kids`

- Existing backend already has `EmailService` and verification token flow.
- Integration impact should be mostly provider adapter + env config + retry/webhook handling.
- Add provider-level observability: delivery status, bounce, complaint webhooks.

## Caveats

- Pricing is dynamic and region/currency dependent; validate before procurement.
- Self-hosted mail can be attractive on raw cost but often expensive in operational time.

_Research compiled: 2026-03-08_