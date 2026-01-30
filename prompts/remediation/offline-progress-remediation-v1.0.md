# REMEDIATION PROMPT: Offline Progress Queue + Pending UI (v1.0)

## Intent

Implement a robust offline progress queue and visible pending UI for the tracing game so progress is never silently lost. The work should be small, testable, and safe to land in a focused PR.

## Role

You are an engineer implementing a single remediation scope. Produce a patch (or patches), tests, and docs. Follow the repo's AGENTS.md and prompts/remediation rules.

## Scope (explicit)

- Add client queue service: `src/frontend/src/services/progressQueue.ts` (IndexedDB preferred; fallback to localStorage)
- Add UI: persistent "Saving... (Pending)" indicator and per-activity `status` in `Game` screen and `Progress` pages
- Add sync/retry logic: on reconnect, send queued events via a new idempotent backend endpoint
- Add backend batch endpoint: `POST /api/v1/progress/batch` accepting array of items with `idempotency_key`; server dedupes and returns per-item results
- Tests:
  - Unit tests: queue enqueue/dequeue, retry backoff
  - Integration tests: simulate offline enqueue -> reconnect sync -> server receives items once
  - Playwright e2e: offline mode simulation + sync
- Docs: feature spec in `docs/plans/TCK-20260129-053-implementation-plan.md`

## Constraints & Acceptance

- Do not change existing progress API behavior (keep `POST /api/v1/progress` for immediate calls); the batch endpoint is additive.
- Queue must be idempotent and survive page reloads.
- Sync must be resilient to partial failures and preserve ordering per profile.
- Tests must run in CI and be deterministic.

## Deliverables

- Code changes + tests in a focused branch `feat/offline-progress-queue` with PR description and verifier pack
- Docs: implementation plan and acceptance tests (Gherkin)
- Worklog update referencing the PR and verifier outputs

## Suggested Implementation Steps (ordered)

1. Create `progressQueue.ts` API and unit tests.
2. Add pending UI in `Game.tsx` and display queue status.
3. Add `/api/v1/progress/batch` backend endpoint with dedupe; unit tests and integration tests.
4. Add integration test that simulates offline writes and verifies server state after reconnect.
5. Add Playwright E2E that runs in CI emulating offline via browser devtools.
6. Document feature and update worklog entry.

## Testing Notes

- Use a deterministic in-memory DB for backend integration tests.
- For e2e, use Playwright's `route.fulfill` or `context.setOffline(true/false)` to simulate network.

## When done

- Provide PR with description, list of changed files, test outputs, and a small verifier pack (commands to run locally and in CI).

**End of prompt**
