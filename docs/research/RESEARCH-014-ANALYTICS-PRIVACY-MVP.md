# RESEARCH-014 :: Analytics MVP + Privacy Guardrails

Date: 2026-01-31
Owner: AI Assistant
Status: DRAFT

## Evidence labels

- **Observed**: Directly verified in repo files or command output
- **Inferred**: Logical conclusion from Observed evidence
- **Unknown**: Not verifiable with available evidence

## Goal

Define what we should track to make the product feel valuable to parents (and improve learning outcomes) **without** collecting sensitive camera data.

## Observed repo constraints

- Backend progress ingestion already exists with free-form `meta_data`: `src/backend/app/schemas/progress.py`
- Batch ingestion endpoint exists: `src/backend/app/api/v1/endpoints/progress.py` (`/progress/batch`)
- Frontend already supports offline queue + sync: `src/frontend/src/services/progressQueue.ts`

## Principles (privacy-first)

- Store learning outcomes, not raw inputs.
- Never store:
  - video frames, images, audio recordings
  - raw hand landmarks or per-frame sequences
  - face/eye tracking or identity inference
- Keep `meta_data` keys whitelisted per `activity_type` with bounded values.

## MVP metrics that “feel real” to parents

- “What did my child practice?” (recent activities across games)
- “Are they improving?” (simple trend: accuracy up / time-to-complete down)
- “What should we do next?” (one suggestion based on weakest area)

## MVP event taxonomy (proposal)

- `letter_tracing`
- `finger_number_show`
- `connect_the_dots`
- `letter_hunt`

Each event:

- must have `idempotency_key`
- must have bounded, non-sensitive `meta_data`

## Open questions (need product decision)

- Retention window: how long keep per-event data vs only aggregates?
- “Export”: do we allow parents to download progress? (CSV / PDF)
- Any local-only analytics mode for COPPA-sensitive deployments?
