# Expanded Launch Readiness Audit Prompt v1.0

**Category:** Audit / Release / Operating Readiness  
**Use when:** You need a real-world launch decision, not just a code-and-tests review. This prompt is for public launch, paid beta, investor demo, school pilot, or parent-facing release readiness.

---

## Mission

Decide whether the product is genuinely ready to launch in the real world.

This is **not** limited to feature completeness or TODO cleanup. It must evaluate whether a launch would succeed operationally, legally, reputationally, and support-wise.

The output must answer:

1. Is the product launch-ready **right now**?
2. If not, what is the **shortest credible path** to launch?
3. What would still be risky **even if all obvious TODOs were completed**?
4. Which problems are **true blockers**, which are **reputation risks**, and which are merely **polish gaps**?

---

## Evidence Discipline

Every claim must be labeled:

- **Observed** — directly verified from code, config, tests, docs, or command output
- **Inferred** — logical conclusion from observed facts
- **Unknown** — cannot be verified from available evidence

Do not upgrade **Inferred** to **Observed**.
Do not assume docs are correct unless code or runtime evidence confirms them.

---

## Required Inputs

- Release target: `<internal demo | trusted beta | parent-facing public beta | paid launch | school pilot>`
- Repo access: `<YES/NO>`
- Git access: `<YES/NO/UNKNOWN>`
- Runtime access: `<YES/NO>`
- Network/GitHub access: `<YES/NO>`
- Time horizon: `<launch this week | this month | exploratory>`

---

## Mandatory Coverage Domains

### 1) Product Truth

Verify the real product surface:

- primary user journeys
- route coverage
- key flows that actually persist data
- placeholder pages, broken promises, stubbed UI, or unreachable features

### 2) Launch Blockers

Identify issues that prevent launch even if the app “works” technically:

- incomplete sign-up or verification
- broken subscription/payment lifecycle
- missing production env or secrets story
- unsupported account lifecycle actions
- critical compliance gaps

### 3) Legal / Compliance / Trust Surface

Audit public trust readiness:

- privacy policy presence and actual accessibility in UI
- terms of service presence
- camera/mic transparency
- parental consent flow completeness
- account deletion / data deletion / export affordances
- child-safety promises vs actual implementation

### 4) Account Lifecycle & Data Rights

Check whether a real parent can:

- create an account
- verify email
- reset password
- manage profiles
- export data
- delete profile/account
- understand what data is stored

If backend exists but frontend does not expose it, call that out clearly.

### 5) Payments / Revenue Operations

If subscriptions or billing exist, check:

- purchase flow
- failed payment behavior
- cancellation path
- support/refund handling
- plan visibility and entitlement enforcement
- billing-related tests or evidence

If launch can happen without billing, say so explicitly.

### 6) Observability / Incident Readiness

Check whether the team will know when production is broken:

- uptime monitoring
- error tracking
- health endpoints
- logging quality
- alert routing
- rollback/runbook presence
- backup/restore evidence

### 7) Device / Browser / Environment Readiness

Check whether launch assumptions are real:

- supported device/browser matrix
- mobile/tablet behavior
- camera permission fallback
- low-light / no-camera alternatives
- performance on realistic child-use devices
- network degradation behavior

### 8) Support / Operations / Human Readiness

Audit whether humans can support the launch:

- visible support/contact path
- internal runbook
- issue triage path
- parent-facing help text
- recovery guidance for broken flows

### 9) Growth / Discoverability / Market Surface

Check whether the product is shippable beyond engineering:

- landing page clarity
- pricing clarity
- trust indicators
- SEO/basic metadata
- demo flow for first-time visitors

### 10) Rollout / Rollback / Risk Containment

Check whether the team can launch safely:

- staged rollout capability
- kill switches / feature flags / easy disable paths
- rollback instructions
- known-risk list
- owner assignment for launch day

---

## Discovery Checklist

If repo access is available, inspect at minimum:

```bash
pwd
ls -la
sed -n '1,200p' README.md
sed -n '1,240p' docs/LAUNCH_READINESS_REPORT.md
sed -n '1,240p' prompts/README.md
```

Check product surface and legal/support routes:

```bash
rg -n "privacy|terms|support|help|contact|delete account|delete profile|export data" src/
rg -n "verify-email|reset-password|subscription|billing|webhook|consent" src/
rg -n "SENTRY|monitor|uptime|health|rollback|backup" docs/ src/
```

Check whether public trust promises are wired to actual pages:

```bash
rg -n "href=\"/privacy\"|href=\"/terms\"|path='/privacy'|path='/terms'" src/frontend/src
```

Run relevant verification commands if feasible; otherwise mark as Unknown.

---

## Output Format (Required)

### A) Launch Verdict

One of:

- **GO**
- **GO WITH RISKS**
- **NO-GO**

### B) What the previous audit got right

Short section preserving valid conclusions.

### C) What was under-covered or missed

List only material gaps in audit coverage, not noise.

### D) Blocker Matrix

| Area | Finding | Severity | Evidence Type | Launch Impact | Owner Suggestion |
| ---- | ------- | -------- | ------------- | ------------- | ---------------- |

### E) Launch-Ops Readiness Matrix

Cover at minimum:

- legal/trust
- account lifecycle
- observability
- support ops
- device/browser confidence
- payment operations
- rollback readiness

### F) Shortest Credible Path to Launch

Split into:

- **Must do before launch**
- **Should do in first week after launch**
- **Can defer safely**

### G) Unknowns that need explicit validation

Do not bury unknowns. Make them visible.

### H) Final Recommendation

Be decisive. A launch audit that ends in “it depends” is a fancy shrug.

---

## Standard

A product is **not** launch-ready just because:

- tests pass
- TODO count is low
- Docker works
- login works locally

A product is launch-ready only if a real parent/user can trust it, complete critical lifecycle actions, and get help when something fails — and the team can detect, diagnose, and recover from problems quickly.

---

_Prompt version: v1.0 | Created: 2026-03-12 | Owner: GitHub Copilot_
