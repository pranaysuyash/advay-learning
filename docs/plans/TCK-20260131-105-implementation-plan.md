# TCK-20260131-105 :: Analytics tracking MVP (all games) — Implementation Plan

Type: FEATURE
Owner: AI Assistant
Created: 2026-01-31 06:02 UTC
Status: DRAFT

## Evidence labels
- **Observed**: Directly verified in repo files or command output
- **Inferred**: Logical conclusion from Observed evidence
- **Unknown**: Not verifiable with available evidence

## Inputs (Observed)
- Audit: `docs/audit/ANALYTICS_TRACKING_AUDIT.md`
- Existing backend ingestion: `/progress` and `/progress/batch` in `src/backend/app/api/v1/endpoints/progress.py`
- Existing schema: `src/backend/app/schemas/progress.py` (`activity_type`, `content_id`, `score`, `duration_seconds`, `meta_data`)
- Existing offline queue: `src/frontend/src/services/progressQueue.ts`

## Scope contract

- In-scope:
  - Define a stable `activity_type` list + `meta_data` shape per game
  - Emit events from each game via `progressQueue.enqueue(...)`
  - Sync via existing `/progress/batch`
  - Update dashboard/progress aggregations to include the new activity types
- Out-of-scope:
  - Any raw images/video storage, raw hand landmarks, face/identity signals
  - Third-party analytics SDKs
  - Full-blown analytics warehouse / cohorts
- Behavior change allowed: YES

## Design: canonical event schema

We reuse `ProgressCreate`/`ProgressBase` and enforce a meta whitelist per `activity_type`.

### Common fields
- `activity_type`: string (enum-like)
- `content_id`: string (what the child interacted with)
- `score`: int (0–100 or points; per activity)
- `duration_seconds`: int
- `meta_data`: JSON object (small, non-sensitive, learning-only)
- `idempotency_key`: string (required for batch)
- `timestamp`: ISO string (optional; use client time if needed)

### Activity types (proposed)
- `letter_tracing` (existing)
- `finger_number_show`
- `connect_the_dots`
- `letter_hunt`

## Per-game payloads (proposed)

### AlphabetGame (`letter_tracing`)
- `content_id`: letter char (e.g., `"A"`)
- `score`: 0–100 accuracy
- `duration_seconds`: time spent drawing this letter
- `meta_data` (whitelist):
  - `input_mode`: `"camera"` | `"touch"`
  - `attempt`: number
  - `strokes`: number (count of segments/points buckets, not raw points)

### FingerNumberShow (`finger_number_show`)
- `content_id`: `"target:<n>"` (or `"number:<n>"`)
- `score`: 1 for correct, 0 for incorrect (or points)
- `duration_seconds`: seconds from target prompt to success
- `meta_data` (whitelist):
  - `target_number`: number
  - `detected_number`: number
  - `hands_detected`: number (0–2 only)
  - `difficulty_level`: 1|2|3

### ConnectTheDots (`connect_the_dots`)
- `content_id`: puzzle id (e.g., `"dots:<level>:<shape>"`)
- `score`: completion percent or 1/0
- `duration_seconds`
- `meta_data` (whitelist):
  - `dots_total`: number
  - `dots_connected`: number
  - `mistaps`: number

### LetterHunt (`letter_hunt`)
- `content_id`: `"target:<letter>"`
- `score`: 1 correct, 0 incorrect (or points)
- `duration_seconds`: time-to-select
- `meta_data` (whitelist):
  - `target_letter`: string
  - `selected_letter`: string
  - `round`: number
  - `level`: number

## Privacy rules (MVP)
- Do not store:
  - images/video frames, audio recordings
  - face/eye tracking outputs
  - raw hand landmarks or per-frame time series
- Keep `meta_data` small and bounded (keys whitelist + value bounds).

## Implementation steps (phased)

### Phase A — Schema + guardrails
1) Add a shared TypeScript type: `ProgressItemMetaByActivity` and a runtime validator/whitelist.
2) Ensure each emitted progress item includes an `idempotency_key`.

### Phase B — Emitters
1) AlphabetGame: enqueue on `checkProgress` and/or `nextLetter`.
2) FingerNumberShow: enqueue on success.
3) LetterHunt: enqueue per round result.
4) ConnectTheDots: enqueue on completion.

### Phase C — Aggregations + UI
1) Backend: extend stats endpoint (if needed) to aggregate by `activity_type`.
2) Frontend: Progress page shows recent activity across all types.
3) Dashboard: minimal “Plays this week” + “Recent activities” across games.

## Verification
- Unit tests:
  - validator rejects non-whitelisted keys
  - idempotency keys are stable and unique per event
- Manual:
  - play each game once, confirm a progress item enters `progressQueue`
  - run sync, confirm server returns `ok` for all queued items

## Acceptance Criteria mapping
- Each game emits events: Phase B
- Backend accepts: Phase A/C
- Dashboard surfaces cross-game: Phase C
- No sensitive data: enforced by Phase A validator + meta whitelist

