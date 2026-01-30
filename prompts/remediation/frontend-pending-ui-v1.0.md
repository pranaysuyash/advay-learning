# REMEDIATION PROMPT: Frontend Pending UI + Auto-Sync (v1.0)

## Role

You are an engineer tasked with implementing a small, observable UI and UX improvement: visible pending state and manual/auto sync for offline progress.

## Input

- Use `src/frontend/src/services/progressQueue.ts` (existing) for queueing and sync
- Implement UI in `Game.tsx` and `Progress.tsx`

## Deliverables

- UI chip `Pending (n)` in `Game` showing number of pending items for active profile
- `Sync now` button in Progress page with confirmation to retry
- Auto-sync on `window` 'online' event
- Unit tests and a Playwright e2e that simulates offline->online

## Constraints

- Keep changes small and reversible behind a feature flag `offline_progress`
- Do not change server API beyond using `/api/v1/progress/batch`

## Tests

- Unit coverage for the UI chip state, sync button, and `progressQueue.sync()` call
- Playwright test to verify offline action then sync on reconnect

**End**
