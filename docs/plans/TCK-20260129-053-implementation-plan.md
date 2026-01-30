# Implementation Plan :: TCK-20260129-053

Title: Offline Progress Queue + Pending UI
Owner: AI Assistant
Created: 2026-01-29 23:15 IST

## Summary

Implement a client-side offline queue for progress events and a visible pending UI, plus an idempotent backend batch endpoint for reconciliation. This prevents progress loss and enables cross-device sync.

## Product Requirements

- Client shows `Pending` indicator per saved activity when offline or unsynced
- Progress queued locally survives reloads and browser restarts
- Queued items sync on reconnect with server deduplication
- Parent/Progress pages reflect pending/synced states

## API Contract (Proposal)

### POST /api/v1/progress/batch

- Request Body: { profile_id: string, items: [ { idempotency_key: string, activity_type: string, content_id: string, score: number, duration_seconds?: number, meta_data?: object, timestamp: ISO8601 } ] }
- Response: { results: [ { idempotency_key: string, status: 'ok' | 'duplicate' | 'error', server_id?: string, error?: string } ] }
- Behavior: server must dedupe by `idempotency_key` per profile and return per-item status

### 2026-01-30 Implementation update

- Implemented server-side idempotency support:
  - Added `idempotency_key` field to `Progress` model and a DB unique constraint across `(profile_id, idempotency_key)` where supported.
  - Extended `ProgressCreate` schema to accept `idempotency_key` and `timestamp`.
  - `ProgressService.create` now checks for existing `idempotency_key` and raises `DuplicateProgressError` when duplicate is detected.
  - `/api/v1/progress/batch` now returns per-item results with `status` ∈ {`ok`, `duplicate`, `error`} and `server_id` when available.
  - Added Alembic migration: `src/backend/alembic/versions/20260130_add_progress_idempotency.py`.
  - Tests extended in `src/backend/tests/test_progress_batch.py` to assert duplicate detection and mixed batches.

Notes: To run backend tests locally, ensure test dev dependencies are installed (added `python-dotenv` to dev extras). CI will run the full suite and apply the migration to test DB if configured.

## Client Design

- `src/frontend/src/services/progressQueue.ts`
  - Exposes `enqueue(progressItem)`, `getPending(profileId)`, `sync()`
  - Storage: IndexedDB (use `idb` lib if allowed) with fallback to localStorage
  - Sync algorithm: batch items per profile, exponential backoff on failures, mark items `synced` once server returns ok
- UI Changes
  - `Game.tsx`: show a small status chip `Saving...` or `Pending (n)` near Score; per-activity toast optional
  - `Progress` page: indicator and manual `Sync now` button

## Tests

- Unit: queue enqueue/dequeue, storage persistence, idempotency handling
- Integration: backend receives batch and dedupes; simulate partial failure
- E2E (Playwright): offline mode, play letters, go online, assert server progress present

## Rollout

- Feature flag `offline_progress` to enable gradual rollout
- Monitor: server received items / duplicates, client-retry counts

## Docs

- Add `docs/audit/integration__frontend__backend__FEATURES.md` reference and update `docs/PROJECT_EXPLORATION_BACKLOG.md` and `docs/UX_IMPROVEMENTS.md` with user-facing descriptions

## Estimated effort

- Frontend queue + UI: 2-3 days
- Backend batch endpoint + tests: 1-2 days
- Integration + E2E + docs: 2 days

---

**Acceptance Criteria (Gherkin samples)**

Scenario: Save progress while offline
Given the device is offline
When the child completes a letter and triggers save
Then the UI shows the saved item with status `pending`
And the item is persisted locally

Scenario: Sync on reconnect
Given pending items exist locally
When the device reconnects to network
Then the client POSTs to `/api/v1/progress/batch`
And the server returns `ok` for each item
And the client updates items to `synced` and removes `pending` indicators
