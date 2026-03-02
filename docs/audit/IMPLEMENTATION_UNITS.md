# Implementation Units for Stub Remediation

This document organises the work into discrete units so that progress can be tracked and testing scoped appropriately.

## Unit 0 – Feature Flag Foundation

**Goal:** Establish a type-safe, hierarchical feature flag system for safe rollout of high-risk changes (fallback controls, tracking-loss recovery, deterministic rewards).

**Scope:**

- `src/frontend/src/config/features.ts` — Flag definitions, defaults, evaluation logic
- `src/frontend/src/hooks/useFeatureFlag.ts` — React hook interface
- `src/frontend/src/hooks/__tests__/useFeatureFlag.test.ts` — Unit tests
- `src/frontend/src/store/settingsStore.ts` — Add features persistence
- `docs/adr/ADR-007-FEATURE_FLAGS.md` — Architecture decision record

**Ticket:** ISSUE-006 (from GAME_INPUT_AGE_AUDIT_2026-02-28)

**Acceptance criteria:**

1. All flags type-safe with TypeScript (no string literals in components).
2. Hierarchy works: env var > user override > default.
3. Editable flags can be toggled via settings UI.
4. Non-editable flags (policy-driven) warn on attempted change.
5. Unit tests cover all flag access patterns.
6. Type-check and lint pass.

**Evidence:** Test output, ADR document, settings persistence verification.

**Status:** Done (2026-03-02)

---

## Unit 1 – Core wrapper & boilerplate removal

**Goal:** Replace the repeated subscription/progress boilerplate in every game page with a single, well-tested `GamePage` component; fix related hook-order and canvas guard bugs encountered during the sweep.

**Scope:**

- `src/frontend/src/components/GamePage.tsx`
- Converted game pages:
  - `AirGuitarHero.tsx`, `BodyParts.tsx`, `KaleidoscopeHands.tsx`, `PhonicsTracing.tsx`, `MusicConductor.tsx`, `BeginningSounds.tsx`, `FreeDraw.tsx`, `VirtualBubbles.tsx`, plus any other pages that already use `GamePage`.
- Add minimal unit tests for `GamePage`.

**STUB-IDs addressed:** 001–005

**Acceptance criteria:**

1. GamePage handles `subscription` guard, `level`/`score` state, error UI, and calls `logGameProgress` on finish.
2. All converted pages render without throwing in Vitest (smoke tests already exist).
3. Unit test(s) exercise GamePage props & state transitions.
4. No `TODO`/`FIXME` comments remain in these files.
5. `scripts/convert_games_to_gamepage.py` remains available and documented.

**Evidence:** previous commits, smoke-test outputs, new unit test output.

## Unit 2 – Virtual Bubbles blow detection

**Goal:** Replace the log‑only placeholder in `VirtualBubbles` with real audio‑level detection and fallback when microphone access is unavailable.

**Scope:**

- `src/pages/VirtualBubbles.tsx`
- possibly a new utility under `src/utils/audioLevels.ts`.

**STUB-IDs:** 006

**Acceptance criteria:**

- Bubbles respond to actual mic input (simulated in unit tests using mocked audio stream).
- If permissions are denied or API unsupported, game still plays (e.g. auto‑blow every n seconds or show tap‑to‑blow button).
- New tests exercise both branches.

**Status:** Done. Lowered threshold from 50 to 15 based on user testing to make it easier for kids. Added state tracking for denied mic permissions and a large interactive "Tap to Blow! 🌬️" fallback button when required.

## Unit 3 – Discovery Lab craft interaction

**Goal:** Make the “almost there” cards actionable by either disabling them or providing a hint when the recipe cannot be completed.

**Scope:**

- `src/pages/DiscoveryLab.tsx`
- `src/games/partialRecipes.ts` (if exists) or relevant logic.

**STUB-IDs:** 008

**Acceptance criteria:**

- Clicking a locked recipe either shows a tooltip/hint or is disabled with an accessible label.
- Unit tests verify `craftableRecipes` computation and UI state.

**Status:** Done. Added hint overlay and updated `RecipeCard` to display a "Hint" button when not craftable; added new unit tests covering both logic and UI interaction.

## Unit 4 – Connect The Dots camera fallback

**Goal:** Handle `navigator.permissions` gracefully and allow play without camera.

**Scope:**

- `src/pages/ConnectTheDots.tsx`
- helper for permission querying / fallback state.

**STUB-IDs:** 009

**Acceptance criteria:**

- No `console.warn` in smoke tests when permission APIs are stubbed/absent.
- Game renders an alternative UI (e.g. “Use finger” mode) if camera blocked.
- Unit tests for permission scenarios.

**Status:** Done. Removed debug warnings, added toggle and visible warning banner, and wrote permission-focused unit tests. All checks now pass.

## Unit 5 – Miscellaneous UX clean‑ups

**Goal:** Address low‑risk stubs found during the audit.

**Scope & STUB-IDs:**

- `FreeDraw.tsx` metadata (007)
- `Inventory.tsx` empty return (010)
- `wordBuilderLogic.ts` hack constant cleanup (011)

**Acceptance criteria:**

- Remove unnecessary warnings/returns; add simple tests.

## Unit 6 – Attention Detection Head Pose

**Goal:** Replace the hardcoded {pitch, yaw, roll} dummy values in `useAttentionDetection.ts` with geometric calculations using MediaPipe FaceLandmarker data.

**Scope:**

- `src/frontend/src/hooks/useAttentionDetection.ts`
- Tests for attention detection (`src/frontend/src/utils/__tests__/headPose.test.ts`)

**STUB-IDs:** 012

**Acceptance criteria:**

- Removes dummy values.
- Implements fallback geometrical math for yaw, pitch, roll.
- Logs correctly to tracking system without crashing.

**Status:** Done. Abstracted the logic into `calculateHeadPose` and wrapped safety checks into a reusable `<WellnessMonitor />` component.

## Unit 7 – Test Coverage and E2E

**Goal:** Expand the offline sync test STUB-013 to cover full UI functionality.

**Status:** Done. Expanded `offline_sync.spec.ts` from a dummy API stub into a full Playwright flow (login -> navigate to game -> go offline -> trigger sync queue -> go online -> simulate navigate dashboard -> verify sync queue drained).

## Unit 8 – Assets

**Goal:** Fill out missing SVG placeholders for KN, TA, TE languages.

**Status:** Done. Generated native SVGs displaying regional alphabet initials rather than falling back to the generic Indian flag, resolving STUB-014 and LANG-01 tasks.

---

_Document created/updated `TCK-20260224-XXX` (ticket TBD)._
