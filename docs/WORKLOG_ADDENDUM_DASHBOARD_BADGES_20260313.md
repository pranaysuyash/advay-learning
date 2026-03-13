## TCK-20260313-002 :: Dashboard offline sync badges

Ticket Stamp: STAMP-20260313T020000Z-codex

Type: IMPROVEMENT
Owner: Pranay
Created: 2026-03-13
Status: **OPEN**
Priority: P2

### Scope contract

- In-scope:
  - Surface pending/failed progress counts on the parent dashboard header.
  - Badges should be clickable, navigate to `/progress` with profile state.
  - Emit analytics events (same as GameShell) when badges are clicked.
  - Provide fallback label strings when i18n is uninitialized.
  - Add unit tests for Dashboard and extend existing e2e offline sync spec.
- Out-of-scope: redesigning dashboard layout beyond badges.
- Behavior change allowed: YES (visual addition only).

### Implementation

1. Imported `progressQueue` into `Dashboard.tsx` and added two state variables 
   (`pendingCount`,`deadLetterCount`).
2. Added effect that subscribes to queue updates and recomputes counts per profile.
3. Inserted badges next to star currency with click handlers and analytics.
4. Fallback logic ensures string labels appear even when translation key
   returns namespaced text.
5. Added translation keys for english and hindi locales.
6. Created `Dashboard.test.tsx` verifying badge rendering, navigation, analytics 
   metadata.  Adapted GameShell-style navigate mock and store setup.
7. Enhanced `offline_sync.spec.ts` to assert badge visibility on dashboard and
   include gameId metadata checks (already existing from prior change).

### Verification

- Unit tests:
  ```bash
  npm test -- src/pages/__tests__/Dashboard.test.tsx
  ```
  → 1 test, 1 pass (badge rendering/navigation/analytics).
- E2E spec modified; will run in CI when `E2E_EMAIL`/`E2E_PASSWORD` are set.
- Local manual inspection of dashboard shows badges update in offline scenarios.

### Status updates

- [2026-03-13 02:00Z] **OPEN** — UI and tests implemented.
- [2026-03-13 02:15Z] **OPEN** — Verified unit tests and added translation keys.

### Next actions

1. Merge changes and monitor CI for E2E success.
2. Add dashboard integration to analytics pipeline or backend if needed.
3. Consider surfacing counts on parent dashboard tiles in the future.

### Risks/notes

- I18n initialization warning persists in tests; fallback mitigates it.
- Dashboard effect relies on `defaultProfile` memo; ensure it never flaps.

