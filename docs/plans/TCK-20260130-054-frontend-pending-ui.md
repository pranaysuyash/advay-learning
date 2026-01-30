# Implementation Plan :: TCK-20260130-054

Title: Frontend Pending UI + Auto-Sync UX
Owner: AI Assistant
Created: 2026-01-30 00:05 IST

## Summary

Add visible pending indicators for progress saved while offline and a "Sync now" control on the Progress page. Integrate `progressQueue.sync()` to auto-sync on reconnect or manual trigger.

## Scope

- Update `src/frontend/src/pages/Game.tsx` to show a persistent status chip near the Score when any pending items exist for the active profile.
- Update `src/frontend/src/pages/Progress.tsx` to show pending list and `Sync now` button.
- Hook `progressQueue.sync()` into network connectivity events (window 'online' event) and add manual retry.
- Add unit tests for UI and integration tests for sync invocation.
- Add feature flag `offline_progress` (env + runtime toggle) to gate rollout.

## Acceptance Criteria

- When pending items exist, Game shows `Pending (n)` and a tooltip 'Will sync when online' (or 'Syncing...' during active sync).
- Clicking `Sync now` triggers sync and clears pending items on success.
- On reconnect `window.addEventListener('online', ...)` triggers background sync.

## Tests

- Unit: `Game` component shows chip when `progressQueue.getPending()` non-empty.
- Integration: mock API to accept batch and assert items marked synced.
- E2E: Playwright: simulate offline, perform actions, go online, assert pending cleared and server received items.

## Files to Add/Change

- `src/frontend/src/pages/Game.tsx` (UI chip + hook)
- `src/frontend/src/pages/Progress.tsx` (sync UI)
- `src/frontend/src/services/progressQueue.ts` (already added) - call sync
- `src/frontend/src/services/__tests__/` - unit tests
- `playwright/` - e2e test scaffold (if present in repo)

## Estimate: 2 days

---

**Prepared by:** GitHub Copilot (Raptor mini (Preview))
