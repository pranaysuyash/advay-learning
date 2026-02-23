# Progress Capture Architecture Research (2026-02-23)

## Scope
- Compare current in-app progress capture approach with stronger alternatives.
- Recommend a practical target architecture for Advay's game score/progression tracking.

## Current Baseline
- `Observed`: backend supports idempotent progress writes and batch sync.
  - `src/backend/app/api/v1/endpoints/progress.py`
  - `src/backend/app/services/progress_service.py`
- `Observed`: frontend has `progressQueue` + `progressApi`, but gameplay pages rarely call them.
  - `src/frontend/src/services/progressQueue.ts`
  - `src/frontend/src/services/api.ts`
- `Observed`: `progressQueue.enqueue()` usage appears only in tests, not core game runtime.
  - `src/frontend/src/services/__tests__/progressQueue.test.ts`
  - `src/frontend/src/pages/__tests__/Game.pending.test.tsx`
  - `src/frontend/src/pages/__tests__/Progress.sync.test.tsx`

## External Reference Models
- ADL xAPI specification (statement/event model with actor/verb/object/results):
  - https://adlnet.github.io/xAPI-Spec/
- 1EdTech Caliper Analytics (education event profile model):
  - https://www.imsglobal.org/activity/caliperram

## Options Reviewed
1. Keep ad-hoc per-game posting.
- Pros: low migration work.
- Cons: inconsistent, easy to regress, hard to enforce data quality.

2. Event-first client tracking with queue + idempotent server write (recommended near-term).
- Pros: resilient offline behavior, uniform payload shape, easy to instrument centrally.
- Cons: requires central session/event abstraction and migration of game entry points.

3. Full standards adoption (xAPI/Caliper) now.
- Pros: interoperability and analytics maturity.
- Cons: high integration overhead for current pre-launch stage.

## Recommended Path
1. Standardize one internal event contract now:
- `activity_type`, `content_id`, `score`, `duration_seconds`, `meta_data`, `idempotency_key`, `timestamp`.
2. Capture from shared surfaces (game container/session lifecycle), not per-page ad-hoc calls.
3. Keep queue-first persistence + immediate best-effort save.
4. Add automatic background sync (startup, online event, interval).
5. Map internal contract to xAPI/Caliper later when analytics pipeline is ready.

## Why This Fits Advay
- `Inferred`: For a pre-launch product with many games, consistency and reliability matter more than immediate standards-heavy implementation.
- `Inferred`: Queue-first + central capture minimizes future regressions when new games are added quickly.

