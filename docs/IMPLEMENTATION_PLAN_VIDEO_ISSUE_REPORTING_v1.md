# IMPLEMENTATION PLAN: TCK-20260223-017

## Scope

Feature: In-app video issue reporting with camera thumbnail/feed redacted in submitted recordings.

References:
- Product spec: `docs/PRODUCT_SPEC_IN_APP_VIDEO_ISSUE_REPORTING.md`
- Worklog discovery ticket: `docs/WORKLOG_ADDENDUM_VIDEO_ISSUE_REPORTING_2026-02-23.md`
- Planning prompt followed: `prompts/planning/implementation-planning-v1.0.md`

---

## A) Discovery Summary

### Observed

1. Frontend already has a parent gate component:
   - `src/frontend/src/components/ui/ParentGate.tsx`
   - Provides hold-to-unlock flow and can be reused for submission confirmation.

2. Camera thumbnail is a reusable component:
   - `src/frontend/src/components/game/CameraThumbnail.tsx`
   - Renders a visible `Webcam` with status UI; this is the exact surface that must be redacted/excluded from shared recordings.

3. Game camera architecture already has hidden webcam layer support:
   - `src/frontend/src/components/layout/GameLayout.tsx`
   - Uses hidden `Webcam` for tracking; this supports app-surface compositing strategy.

4. Frontend API client exists and is centralized:
   - `src/frontend/src/services/api.ts`
   - Pattern uses `axios` and namespaced API wrappers (`authApi`, `progressApi`, etc.).

5. Backend currently has no issue-report endpoint:
   - `src/backend/app/api/v1/api.py` includes routers: auth, users, progress, profile_photos, games.
   - No `issue_reports` router included.

6. Backend has an existing multipart upload pattern:
   - `src/backend/app/api/v1/endpoints/profile_photos.py`
   - Uses `UploadFile = File(...)`, MIME/size checks, local storage path, DB update pattern.

7. Workspace has extensive parallel changes in flight:
   - `git status --porcelain` shows many modified files across frontend/docs.
   - Preservation discipline required for unrelated changes.

8. Browser API research (MDN/W3C) confirms:
   - `MediaRecorder` and `HTMLCanvasElement.captureStream()` are broadly available.
   - `getDisplayMedia()` has stricter constraints, prompt requirements, and weaker mobile support.

### Inferred

1. Safest v1 architecture is compositing app visuals to a controlled canvas, then recording that canvas stream so camera redaction is deterministic.
2. Reusing `ParentGate` for submit confirmation minimizes UX and implementation risk.
3. A new backend endpoint family is needed (`/issue-reports`) for clip upload + metadata, rather than overloading existing routes.
4. Existing `profile_photos` upload flow can serve as implementation baseline for validation and storage guards.

### Unknown

1. Final legal retention duration and jurisdiction-specific policy copy.
2. Whether all current games can provide identical recording surfaces without per-game adapter work.
3. Final support-ops destination (internal dashboard vs issue tracker sync) for uploaded reports.
4. Exact storage quota and lifecycle policy to enforce in production.

---

## B) Implementation Options

| Option | Approach | Pros | Cons | Risk |
|---|---|---|---|---|
| A | **App-surface compositor** (preferred): draw game/overlay layers to dedicated recorder canvas, render black privacy mask where camera tile is shown, record via `captureStream()` + `MediaRecorder` | Deterministic privacy, no screen-share prompt, better consistency | Requires integration work per game shell/layout | MED |
| B | Full screen/tab capture via `getDisplayMedia()` then redact in post-composite | Faster prototype | Prompt friction, weaker mobile support, higher leak risk if region mapping drifts | HIGH |
| C | No video recording; only event logs + screenshots | Lowest risk/effort | Loses “show what happened” fidelity; weaker PM objective | MED |

**Recommendation:** Option A.

Reasoning: It best matches privacy-by-default, supports the existing game architecture, and reduces risk of accidental capture of non-app surfaces.

---

## C) Detailed Plan (Chosen Option A)

### Phase 1: Foundation (Data model + API contract + client scaffolding)

1. Backend: add issue-report schema + route stubs.
   - Create: `src/backend/app/api/v1/endpoints/issue_reports.py`
   - Update: `src/backend/app/api/v1/api.py` to include router.
   - Add request models and response models under `src/backend/app/schemas/`.

2. Backend: define upload validation guardrails.
   - Allowed MIME list (webm/mp4 as supported).
   - Max file size and duration metadata checks.
   - Auth required (current user).

3. Frontend: add API client namespace.
   - Update `src/frontend/src/services/api.ts` with `issueReportsApi`:
     - `createReportSession(payload)`
     - `uploadReportClip(formData)`
     - `finalizeReport(reportId, payload)`

4. Frontend: add recorder domain types.
   - Create `src/frontend/src/types/issueReporting.ts`.

### Phase 2: Recorder Core (privacy-safe video generation)

1. Add reusable recording hook/service.
   - Create `src/frontend/src/hooks/useIssueRecorder.ts` (or `src/frontend/src/services/issueRecorder.ts`).
   - Responsibilities:
     - Start/stop recording
     - MIME selection via `MediaRecorder.isTypeSupported()`
     - Chunk buffering and blob assembly
     - Max duration enforcement

2. Add compositor layer.
   - Create `src/frontend/src/components/issue-reporting/IssueReportCompositor.tsx`.
   - Draw app surface + deterministic black mask over camera tile region.
   - Add overlay text: `Camera hidden for privacy`.

3. Audio defaults.
   - Mic OFF default in capture pipeline.
   - Optional v1.1 flag for mic opt-in (not enabled in v1).

4. Failure handling.
   - Handle recorder errors (`NotAllowedError`, `SecurityError`, unsupported codec).
   - Clear user-safe fallback messaging.

### Phase 3: User Flow Integration

1. Add entry points.
   - Game pause/help/settings menus add `Report issue` CTA.

2. Add report modal flow components:
   - `IssueReportEntryModal`
   - `IssueReportRecorder`
   - `IssueReportPreview`
   - `IssueReportSubmit` (with parent confirmation)

3. Parent confirmation.
   - Reuse `ParentGate` for final submit action.

4. Metadata packing.
   - Game ID, level, app version, device/browser, UTC timestamp, session id, safe diagnostics.

### Phase 4: Backend persistence + lifecycle

1. Store clips in protected location.
   - Initial local/object storage abstraction with strict path isolation.

2. Persist report records.
   - Add DB model for issue reports + metadata fields + retention status.

3. Access control.
   - Ensure only support/admin tooling can retrieve raw clips.

4. Cleanup lifecycle.
   - Retention policy enforcement job/command (delete expired clips and metadata per policy).

### Phase 5: QA, observability, and rollout hardening

1. Add telemetry events:
   - `issue_report_opened`, `issue_recording_started`, `issue_recording_stopped`, `issue_report_submitted`, `issue_report_upload_failed`.

2. Add deterministic redaction checks.
   - Visual assertions on generated output frames.

3. Add progressive rollout mechanism.
   - Feature flag gating by environment and rollout cohort.

---

## D) Testing Strategy

### Unit tests

- Frontend recorder hook:
  - start/stop states
  - codec fallback selection
  - max duration cutoff behavior
  - error surface mapping

- Compositor:
  - camera mask rectangle always drawn when recording
  - overlay label rendered

- API client:
  - multipart payload shape and endpoint calls

### Integration tests

- Full flow: open report → record → preview → parent gate → submit.
- Upload retries and failure messaging.
- Metadata inclusion and schema conformance.

### Manual verification

1. Start issue report in at least 3 game pages.
2. Record clip with visible camera thumbnail in UI.
3. Confirm exported clip shows blacked camera region + label.
4. Confirm parent gate blocks send until completed.
5. Validate submission creates backend record + file.

### Edge cases

- Camera permission denied mid-session
- Tab hidden/backgrounded during recording
- Storage quota exceeded
- Unsupported MIME on specific browser
- User cancels before upload

---

## E) Verification Checklist

- [ ] Recording flow works from game UI entry points
- [ ] Camera region is always redacted in submitted output
- [ ] Parent gate required before upload submission
- [ ] Upload endpoint validates MIME, size, auth
- [ ] Metadata bundle is attached and queryable
- [ ] Errors are user-visible and recoverable
- [ ] Telemetry events emitted for funnel + failures
- [ ] Retention cleanup path defined and testable
- [ ] Existing gameplay unaffected (no regression)

---

## F) Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Camera leakage due to mask misalignment | MED | HIGH | Deterministic layout contract + frame-level tests + block submission if mask validation fails |
| Browser codec incompatibility | MED | MED | MIME fallback via `isTypeSupported()` and graceful failure copy |
| Large uploads on weak networks | HIGH | MED | Size caps, chunking/retry, progress UI |
| Parent confusion over what is recorded | MED | HIGH | Explicit privacy copy + preview before submit + parent gate |
| Support overload from many reports | MED | MED | Structured tags + rate limits + triage dashboard filters |

---

## G) Rollback Plan

1. Feature flag OFF disables entry points and upload calls immediately.
2. Keep API endpoints inert behind server-side flag if required.
3. Preserve uploaded artifacts; halt new ingestion while investigating.
4. Revert frontend route integration and backend router include if severe regressions are found.

---

## Worklog-Ready Ticket Split (Execution)

1. FE-Recorder foundation (hook/service + types + API client)
2. FE-UX flow integration (entry points, modal flow, parent gate submit)
3. BE-IssueReports API (upload, metadata, validation, auth)
4. BE-Persistence + retention (storage lifecycle)
5. QA-Automation + rollout flags + telemetry

Each execution ticket should inherit acceptance criteria from this plan and from `docs/PRODUCT_SPEC_IN_APP_VIDEO_ISSUE_REPORTING.md`.
