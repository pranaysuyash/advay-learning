# AUDIT: `src/frontend/src/pages/Game.tsx` (OBSOLETE - File Removed)

> ⚠️ **DEPRECATION NOTICE**: This file was removed on 2026-01-30. `Game.tsx` was a compatibility shim that re-exported `AlphabetGame`. The canonical implementation is now in `AlphabetGame.tsx`. See audit `docs/audit/src__frontend__src__pages__AlphabetGame.tsx.md` for current game audit.

**Audit prompt**: prompts/audit/audit-v1.5.1.md
**Audit version**: 1.5.1
**Date**: 2026-01-29 16:03 IST
**Audited file**: `src/frontend/src/pages/Game.tsx` (REMOVED 2026-01-30)
**Base commit SHA**: d7d0670e0c7977093b7606b9415405669f4258a3
**Auditor**: GitHub Copilot

---

## 1) Discovery Appendix

Commands executed and high-signal outputs (raw excerpts):

- git rev-parse --is-inside-work-tree
  - Output: `true` **(Observed)**

- git ls-files | rg "Game.tsx"
  - Output: `26:src/pages/Game.tsx` **(Observed)**

- git log -n 20 --follow --pretty=oneline -- src/pages/Game.tsx
  - Output (recent commits):
    - `d7d0670e0c... docs(worklog): add comprehensive test plan for Game component` **(Observed)**
    - `f79f48f6... docs(worklog): update React Hooks ticket status and create refactor plan` **(Observed)**
    - `e389a9b4... fix(frontend): close JSX tags in Game.tsx and update worklog` **(Observed)**

- git rev-parse HEAD
  - Output: `d7d0670e0c7977093b7606b9415405669f4258a3` **(Observed)**

- Search for inbound references (rg):
  - `App.tsx` imports `Game` and mounts it at route `/game` (Observed)
  - `Layout.tsx` / `Home.tsx` link to `/game` (Observed)

- Test discovery (scoped search for references to this file or exported symbols):
  - No direct tests referencing `Game` were found in the repo (Observed)

Notes: All commands were executed in the `src/frontend` git workspace where `src/pages/Game.tsx` is tracked as `src/pages/Game.tsx`.

---

## 2) What this file actually does (one paragraph — Observed)

`Game.tsx` implements the main tracing game screen for the app. It renders UI (score, current letter, mascot), uses `react-webcam` to capture a mirrored video stream, initializes a MediaPipe `HandLandmarker` (via `@mediapipe/tasks-vision`) with external model assets (via CDN URLs), runs a requestAnimationFrame loop to detect hand landmarks and draw tracing strokes on a canvas overlay, computes tracing accuracy, and persists progress via `progressApi`. It also handles session control (start/stop/next/clear) and basic UI feedback.

---

## 3) Key components (Observed)

- Inputs:
  - Camera stream via `react-webcam` (user device camera)
  - Profile ID from route `location.state?.profileId`
  - App settings from `useSettingsStore()` (difficulty, showHints)
- Outputs:
  - Calls to `progressApi.saveProgress` (network)
  - Calls to `profileApi.getProfile` (network)
  - Local UI state updates and calls to `useProgressStore()` functions (mark attempts, add badges)
- Controls:
  - `HandLandmarker` model loading and per-frame detection loop
  - Drawing buffer (`drawnPointsRef`), smoothing and accuracy computation
- Side effects:
  - Network requests to external CDNs for WASM & model files (`cdn.jsdelivr.net` and `storage.googleapis.com`) **(Observed)**
  - Network calls to backend API endpoints (Observed)
  - requestAnimationFrame loop for detection (Observed)

---

## 4) Dependencies and contracts

### 4a) Outbound dependencies (Observed)

- `@mediapipe/tasks-vision` (FilesetResolver, HandLandmarker) — model runtime
- External URLs used at runtime to fetch model/wasm assets (Observed):
  - `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm`
  - `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`
- `react-webcam` for camera capture (Observed)
- `progressApi`, `profileApi` (network calls to backend) (Observed)
- Browser features: camera device access, WebGL/GPU delegate support (Inferred)

### 4b) Inbound dependencies (Observed / Inferred)

- App routes mount the component at `/game` (`App.tsx`) (Observed)
- Navigation and Dashboard flows pass `profileId` via location state (Inferred from usage)

---

## 5) Capability surface

### 5a) Direct capabilities (Observed)

- Real-time hand tracking and finger (pinch) detection for drawing
- Tracing visualization (canvas overlay) with smoothing
- Accuracy scoring (0–100) based on coverage/density heuristics
- Persisting progress to backend and awarding badges
- Adaptive UI feedback and auto-advance on success

### 5b) Implied capabilities (Inferred)

- Device-conditional behavior: graceful fallback when camera/model unavailable is partially implemented (catch on model load) but unclear for permission-denied flows.

---

## 6) Gaps and missing functionality (Observed / Inferred)

- Missing explicit permission-denied handling for camera (Observed — only checks video.readyState and sets a small feedback message on model load failure).
- No explicit disposal/close call for `HandLandmarker` when component unmounts (Inferred — no landmarker.close() or similar in cleanup).
- No unit or integration tests observed for core algorithms (`calculateAccuracy`, `smoothPoints`, pinch logic) (Observed).
- No visible analytics/observability hooks on model load failures or frame errors (Inferred).

---

## 7) Problems and risks (findings)

1. ID: F-Game-01 | Severity: HIGH
   - Evidence: Observed URLs in initialization:
     - `FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/.../wasm')`
     - `modelAssetPath: 'https://storage.googleapis.com/.../hand_landmarker.task'` (Observed)
   - Failure mode: If those network resources are unavailable (offline, blocked by policy, or CDN compromise), the hand landmarker fails to load and the game cannot use camera tracking.
   - Blast radius: Prevents the tracing experience for all users relying on camera detection (high user impact).
   - Minimal fix direction: Add a fallback strategy (local bundled WASM/model with checksum/ETag verification or an alternative CPU-based model) and surfacing a clear, actionable UI when model fetch fails.

2. ID: F-Game-02 | Severity: HIGH
   - Evidence: No explicit camera permission or denial handling; code relies on camera readiness checks and model load errors to set `feedback` (Observed/Inferred).
   - Failure mode: If the user denies camera permission, the UI remains in a loading/blank state or displays a generic message; the user may not understand how to proceed.
   - Blast radius: Major usability failure — users can't play the game on permission denial devices or when camera is unavailable.
   - Minimal fix direction: Detect permission denial (use `navigator.permissions` or handle `react-webcam` error events), show an explanatory UI with a clear fallback (mouse drawing mode) and recovery steps.

3. ID: F-Game-03 | Severity: MEDIUM
   - Evidence: `handLandmarker` is set but **no explicit disposal** is performed in the unmount cleanup (Observed). The only cleanup cancels animation frames.
   - Failure mode: Potential memory / WASM resource leaks or background processing after navigation; repeated mounts/unmounts may accumulate resource usage.
   - Blast radius: Medium — affects long-running sessions and devices with constrained memory.
   - Minimal fix direction: Call the appropriate disposal method (e.g., `landmarker.close()` or `landmarker.dispose()` per API) in the cleanup useEffect and null out state.

4. ID: F-Game-04 | Severity: MEDIUM
   - Evidence: No tests found referencing `Game.tsx` and no unit tests for `calculateAccuracy` or `smoothPoints` (Observed)
   - Failure mode: Changes to accuracy heuristics or smoothing can regress user-facing scoring without detection.
   - Blast radius: Medium — scoring and unlock logic may silently change (affecting progression and UX).
   - Minimal fix direction: Add unit tests for `calculateAccuracy` and `smoothPoints`, and an integration test that simulates common trace shapes to assert expected scores.

5. ID: F-Game-05 | Severity: MEDIUM
   - Evidence: HandLandmarker configured with `delegate: 'GPU'` and `runningMode: 'VIDEO'` without clear fallbacks (Observed)
   - Failure mode: Devices without GPU/WebGL support may fail to initialize or perform poorly.
   - Blast radius: Medium for low-power or privacy-restricted devices.
   - Minimal fix direction: Add fallback initialization attempt (CPU delegate or different model config) and expose diagnostic logging when GPU delegate is unavailable.

6. ID: F-Game-06 | Severity: LOW
   - Evidence: Console logging inside JSX render `console.log('[Game] Mascot state:', mascotState, 'Feedback:', feedback);` (Observed)
   - Failure mode: Noisy console output in production and potential accidental exposure of sensitive data in logs.
   - Blast radius: Low — developer UX annoyance and minor info leakage.
   - Minimal fix direction: Remove or gate debug logging behind a dev flag.

7. ID: F-Game-07 | Severity: LOW
   - Evidence: Some interactive controls do not include ARIA labels or keyboard affordances (Inferred/Observed)
   - Failure mode: Reduced accessibility for keyboard-only or assistive-technology users.
   - Blast radius: Low but important for inclusivity and compliance.
   - Minimal fix direction: Add `aria-label`, keyboard handling, and ensure focus states are visible for critical controls.

---

## 8) Extremes and abuse cases (analysis)

- Malformed or adversarial video frames (very noisy landmark outputs): the detection loop catches MediaPipe errors per-frame and skips; this is defensively coded (Observed).
- Very long sessions: drafted drawing buffer is capped (5000 points) to avoid unbounded growth (Observed), but memory may still climb with long sessions before shifts occur.
- Partial failures: network timeouts while saving progress are caught (Observed) and do not block the game.

---

## 9) Inter-file impact analysis

### 9.1 Inbound impact

- `App.tsx`, `Layout.tsx`, and `Home.tsx` depend on this component mounting successfully; changing its route or props signature could break navigation (Observed).
- Tests must protect the scoring and progression invariants when changing algorithms (Inferred).

### 9.2 Outbound impact

- Backend `progressApi` expectations: shape of `saveProgress` payload must remain stable (content_id, score, duration_seconds) or backend integration tests should be updated (Inferred).

### 9.3 Change impact per finding

- F-Game-01 (model/network): Adding a local fallback or checksum-protected bundle reduces runtime network fragility and should not break callers; tests should ensure model-unavailable path shows fallback UI.
- F-Game-03 (dispose landmarker): Adding a `landmarker.close()` call is local and backward-compatible but must be covered by a test that mounts/unmounts component and asserts no lingering timers or resources.

---

## 10) Patch plan (actionable, scoped) — for HIGH/MEDIUM findings only

1. F-Game-01 (HIGH) — Add robust model fallback
   - Where: `src/frontend/src/pages/Game.tsx`, `initializeHandLandmarker` function
   - What: Attempt primary CDN load; on failure, try a bundled local model asset (vendor/ or public/) with integrity check (SHA256) and then a CPU delegate fallback.
   - Why: Reduce fragility and supply-chain risk for production and offline/dev use.
   - Failure prevented: Model load failure prevents play.
   - Invariant to preserve: When model load fails, UI shows clear actionable fallback and game remains playable via mouse input (Inferred)
   - Test: Integration test that simulates fetch failure and asserts fallback UI is shown and drawing with mouse still works (`Game - model fail -> fallback mode`).

2. F-Game-02 (HIGH) — Explicit camera permission handling and fallback
   - Where: Top-level of `Game` component, before `startGame` and model init
   - What: Check `navigator.permissions.query({ name: 'camera' })` if available; subscribe to `react-webcam` error events; if 'denied' or error, show dedicated permission UI with steps and a 'Use mouse to draw' fallback switch.
   - Why: Improve usability for denied / unavailable cameras
   - Failure prevented: Unclear UX when camera unavailable
   - Invariant to preserve: Users can still complete a session and score using an alternate input method (mouse click-drag) (Inferred)
   - Test: Unit test for permission-handling logic; e2e test simulating permission denied and asserting fallback UI and drawing works.

3. F-Game-03 (MEDIUM) — Dispose of `HandLandmarker`
   - Where: `useEffect` cleanup that initialized the landmarker
   - What: If `handLandmarker` exposes a `close()` or `dispose()` call, call it and set state to null in cleanup.
   - Why: Prevent resource leak and keep memory usage stable across mounts
   - Failure prevented: WASM objects lingering after component unmount
   - Invariant to preserve: No background detections after unmount (observed via no requestAnimationFrame loops running)
   - Test: Mount/unmount test verifying no active animation frames or active landmarker references.

4. F-Game-04 (MEDIUM) — Add unit tests for core algorithms
   - Where: `src/frontend/src/pages/__tests__/Game.utils.test.ts` or similar
   - What: Tests for `calculateAccuracy`, `smoothPoints`, pinch thresholds and checkProgress scoring branches
   - Why: Prevent regression in scoring and unlock logic
   - Test: Deterministic inputs producing expected accuracy percentages and scoring outcomes.

5. F-Game-05 (MEDIUM) — Add delegate fallback handling
   - Where: `initializeHandLandmarker` model initialization
   - What: Try GPU delegate first, catch errors, and retry with CPU delegate. Add a diagnostic flag in `settings` or runtime to show which delegate was used.
   - Why: Increase compatibility across devices
   - Test: Unit/integration test forcing GPU init to throw and asserting CPU fallback used.

---

## 11) Verification and test coverage

- Tests found touching this file: **None observed** (Observed)
- Critical paths untested:
  - `calculateAccuracy` and `smoothPoints` deterministic behavior
  - Permission-denied flows and model load failure fallbacks
  - Landmarker disposal behavior
- Proposed verification steps to close HIGH/MED findings:
  - Simulate model fetch failure and assert fallback UI + mouse drawing works
  - Simulate permission denied and assert clear instructions + fallback mode
  - Mount/unmount stress test to ensure no resource leak

---

## 12) Risk rating

**Overall risk: MEDIUM**

- Rationale: Two HIGH findings (model network dependency and permission handling) materially affect user experience and require fixes; several MEDIUM items affect stability and cross-device compatibility. Not rated HIGH overall because core functionality is implemented defensively (per-frame errors are caught and progress save calls are non-blocking) and the app remains partially functional without the ideal environment.

---

## 13) Next actions (recommended order)

1. Triage & quick fix: Add explicit permission-denied UI and mouse-draw fallback (closes F-Game-02) — HIGH priority ✅
2. Add landmarker disposal in cleanup and guard retries (closes F-Game-03) — MEDIUM
3. Introduce model fallback strategy or bundle and add integrity checks (closes F-Game-01) — HIGH
4. Add unit tests for `calculateAccuracy` and `smoothPoints` and an integration test for model failure paths (closes F-Game-04) — MEDIUM
5. Add delegate fallback for GPU → CPU and remove debug console logs (closes F-Game-05/F-Game-06) — MEDIUM/LOW

---

**Artifact written/appended:** YES

**Prepared by:** GitHub Copilot

---

## Related Tickets

Multiple findings from this audit have been addressed by existing tickets:

| Finding                             | Ticket ID                   | Status      |
| ----------------------------------- | --------------------------- | ----------- |
| F-Game-01: MediaPipe CDN failure    | Need new ticket             | OPEN        |
| F-Game-02: Camera permission denial | Need new ticket             | OPEN        |
| F-Game-03: No explicit disposal     | Need new ticket             | OPEN        |
| F-Game-04: Missing tests            | Covered by TCK-20260129-050 | IN_PROGRESS |
| F-Game-05: GPU fallback             | Need new ticket             | OPEN        |
| F-Game-06: Debug logging            | Part of general cleanup     | N/A         |

**Note**: This ticket is for TCK-20260129-050 which implements comprehensive testing.

---

### Audit run: 2026-01-30 12:00 IST

Repo access: YES (I can run git/rg commands and edit files)

Git availability: YES

**Discovery Appendix (commands & high-signal outputs)**

- `git rev-parse --is-inside-work-tree` → `true` **(Observed)**
- `git ls-files -- src/frontend/src/pages/Game.tsx` → `src/frontend/src/pages/Game.tsx` **(Observed)**
- `git log -n 20 --follow -- src/frontend/src/pages/Game.tsx` → recent history observed (see artifact) **(Observed)**
- `git rev-parse HEAD` → `8790dc0` **(Observed)**
- `rg -n --hidden --no-ignore -S "Game" src` → inbound references in `App.tsx`, `Games.tsx` (Observed)
- Test discovery: `vitest` summary shows a pending test `src/pages/__tests__/Game.pending.test.tsx` (Observed)

**New Critical Finding (HIGH)**

- ID: F-Game-08 | Severity: HIGH
  - Evidence: `Game.tsx` uses `useProfileStore` (e.g., `useProfileStore.getState().fetchProfiles()` and `const { profiles } = useProfileStore();`) but **does not import it** at the top of the file (Observed snippet):

  ```tsx
  import {
    useSettingsStore,
    useAuthStore,
    useProgressStore,
    BATCH_SIZE,
  } from '../store';
  // ... later in file:
  useProfileStore.getState().fetchProfiles();
  const { profiles } = useProfileStore();
  ```

  - Failure mode: Runtime ReferenceError when the component initializes (component will crash on render or on first useEffect) (Observed)
  - Blast radius: HIGH — prevents the Game screen from rendering for any user flow that navigates to `/game` (Observed)
  - Minimal fix: Add the missing import: `import { useProfileStore } from '../store';` at the top of `Game.tsx`. Add a unit/smoke test that mounts the component and asserts no ReferenceError for missing store references.
  - Post-fix invariant: `Game` renders (or redirects) without throwing ReferenceError; profile fetch is called only when `profileId` exists (Inferred)

**Artifact written/appended:** YES — this run appended the audit results to `docs/audit/src__frontend__src__pages__Game.tsx.md` (this file)

**Prepared by:** GitHub Copilot

---
