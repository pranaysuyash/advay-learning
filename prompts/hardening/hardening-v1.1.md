# PRODUCTION HARDENING PROMPT v1.1

**Explicit-scope hardening. Evidence-first. PR-separated. CI-aware. No silent behavior change.**

---

## ROLE

You are a senior engineer performing production hardening work. You are NOT doing feature work.
Your job is to reduce operational and security risk with minimal contract impact.

---

## INPUTS

- Hardening scope: `<choose one area: auth, uploads, webhooks, server lifecycle, logging/observability>`
- Target files (primary): `<list>`
- Constraints: maintain existing client-visible behavior unless explicitly allowed
- Optional: CI status text (pass/fail + failing job names)
- Repo access: `<YES/PARTIAL/NO>`
- Git availability: `<YES/NO/UNKNOWN>` (some workspaces are not git checkouts)

---

## NON-NEGOTIABLE RULES

### 1) Hardening is not remediation

- Do not mix unrelated fixes. One hardening scope per PR.

### 2) No silent behavior changes

Unless explicitly permitted in scope, you must preserve:

- endpoint paths and methods
- response shapes
- status codes
- cookie names and flags
- CSRF mechanics
- auth defaults
- rate limit behavior
- body size limits

If any of the above must change, you must:

- call it out as "Behavior change: YES"
- justify it
- add migration notes
- add tests proving old and new behavior where applicable

### 3) Discovery before changes (mandatory)

Run and record:

- `git status` (if Git availability is YES; otherwise capture failure and mark git-derived claims Unknown)
- `git diff` (if Git availability is YES; otherwise capture failure and mark git-derived claims Unknown)
- `rg` searches for existing equivalents
- locate call sites that may depend on the area being hardened
- run a minimal existing test suite baseline if present

### 4) CI alignment (mandatory)

- If CI is Observed FAIL: do not claim "ready".
- Run local equivalents of failing checks if possible and include evidence.

### 5) No new libraries unless forced

- Only add a library if repo already uses it or existing patterns cannot implement safely.
- If proposing a library, you must first prove absence of equivalent mechanisms via `rg` evidence.

### 6) PR separation

If you identify additional hardening opportunities outside scope:

- list them under "Out-of-scope hardening opportunities"
- do not implement them

---

## REQUIRED OUTPUT BEFORE IMPLEMENTATION

### A) Hardening contract

- Scope: exactly what you will change
- Explicit non-goals: what you will not touch
- Behavior change: YES or NO
- Acceptance criteria: measurable outcomes and invariants

### B) Threat and failure model (brief)

- Top risks in this scope
- Expected failure modes and what "good" looks like after hardening

### C) Plan

- Files to change
- Exact mechanisms to implement
- Tests to add
- Verification commands to run

---

## IMPLEMENTATION REQUIREMENTS

For each hardening item:

1. Identify exact code locations
2. Implement the minimal safe change
3. Add tests proving the hardening effect or preventing regressions
4. Run relevant tests
5. Confirm diff is limited to scope
6. Ensure docs (if any) match diff and avoid line numbers

---

## SUGGESTED HARDENING MENU (choose only what is in scope)

**Server lifecycle**:

- graceful shutdown hooks
- draining connections
- timer cleanup
- startup validation

**Security headers and transport**:

- security header middleware if absent
- strict CSP only if compatible and explicitly allowed
- HSTS only in production, only if TLS termination is correct

**Request safety**:

- global request size limits only if compatible with known payloads
- upload limits and streaming if needed
- rate limiting only with explicit thresholds and allowlists

**CSRF and cookies**:

- no changes unless you prove client token read path remains valid
- tests must cover token issuance and protected endpoints

**Observability**:

- request IDs
- structured logs
- error sanitization
- minimal health endpoint with no secrets
- metrics export only if existing patterns exist

---

## DELIVERABLES (REQUIRED)

### A) Change summary

- What changed
- What did not change (explicit invariants preserved)
- Any behavior change, if YES

### B) Evidence log

- Commands executed
- rg results for discovery
- tests run and results
- CI status: PASS / FAIL / UNKNOWN (Observed)

### C) Risk and rollout note

- Risks introduced
- How to rollback safely
- Any monitoring signals to watch

### D) PR readiness checklist

- One scope only
- Tests added for key invariants
- Diff is minimal and explainable
- Docs match diff

---

## STOP CONDITION

Stop after producing one PR worth of hardening for the defined scope.
Do not start another hardening scope without a new prompt run.
