# Digital Jenga Drag/Extraction Decision Log (2026-03-14)

Date: 2026-03-14  
Scope: Drag, extraction, placement interaction model and related performance decisions for `digital-jenga-3d`.

## Context

User feedback consistently reported:
- Pull feels too hard/stiff versus reference gameplay.
- Blocks appeared to jump to top (auto-placement), reducing player agency.
- FPS dropped heavily during live visual playtests.

This log records what changed, why it changed, and what tradeoffs were accepted.

## Evidence Classification

- **Observed**: Verified from code and live CDP visual tests in this repo session.
- **Inferred**: Logical conclusion from observed behavior and feedback.
- **Unknown**: Not fully verified in this session.

## Decisions

### D1. Remove release-time auto-placement and require explicit place action

- Decision: Extraction success now transitions to `place` phase; player must press **Place On Top**.
- Why:
  - **Observed**: Auto-placement made extracted block appear to teleport.
  - **Inferred**: Kids need clear cause/effect and error recovery.
- Implemented in:
  - `src/frontend/src/games/jenga/hooks/useGrabController.ts`
  - `src/frontend/src/games/jenga/components/HUD.tsx`
  - `src/frontend/src/pages/three/DigitalJenga3D.tsx`
- Tradeoff:
  - Adds one extra action per turn.
  - Improves control clarity and reduces confusion.

### D2. Shift from rigid 1D feel toward spring + bounded wiggle pull

- Decision: Keep guided extraction axis, but add spring-drive and limited lateral wiggle to mimic slot friction/wiggle.
- Why:
  - **Observed**: Strict axis projection felt heavy and unresponsive.
  - **Inferred**: Reference “funness” came from physical compliance and micro-wiggle.
- Implemented in:
  - `src/frontend/src/games/jenga/hooks/useGrabController.ts`
  - `src/frontend/src/games/jenga/config/constants.ts` (`LATERAL_WIGGLE`)
- Tradeoff:
  - Slightly less strict than pure rule-compliant axis-only pull.
  - Better tactile feel while still preserving game mode structure.

### D3. Lower grab resistance during hold, restore damping on release

- Decision: Reduce linear damping while grabbed, restore normal damping when released/extracted.
- Why:
  - **Observed**: Pull-out was perceived as too sticky.
  - **Inferred**: Lower damping during grab improves responsiveness for kids.
- Implemented in:
  - `src/frontend/src/games/jenga/domain/Block.ts`
  - `src/frontend/src/games/jenga/config/constants.ts`
- Tradeoff:
  - Can increase wobble if pull is very fast.
  - Controlled using speed clamps and settle checks.

### D4. Make easy mode intentionally assistive

- Decision: Easy mode now has shorter extract threshold, higher speed allowance, and stronger wiggle assist.
- Why:
  - **Observed**: Baseline controls were difficult for first-time/kid play.
- Implemented in:
  - `src/frontend/src/pages/three/DigitalJenga3D.tsx` (`DIFFICULTY_CONFIG`)
- Tradeoff:
  - Easy mode is less realistic than strict physics.
  - Better onboarding and reduced frustration.

### D5. Add explicit placement and extraction feedback cues

- Decision: Added ghost placement target and extraction success toast.
- Why:
  - **Observed**: Players did not understand where the extracted block goes next.
- Implemented in:
  - `src/frontend/src/pages/three/DigitalJenga3D.tsx`
- Tradeoff:
  - Slight HUD/scene complexity increase.
  - Better clarity and completion rates.

### D6. Reduce avoidable real-time rendering costs

- Decision:
  - Lower scene stars count.
  - Disable costly runtime shadows for this page.
  - Keep pointer/raycast and support-map optimizations.
- Why:
  - **Observed**: FPS drops were significant in live visual run.
- Implemented in:
  - `src/frontend/src/pages/three/DigitalJenga3D.tsx`
  - `src/frontend/src/games/jenga/physics/RapierPhysics.ts`
- Tradeoff:
  - Slight visual richness reduction.
  - Better frame stability.

### D7. Keep `react-scan` available but opt-in only

- Decision: In dev, `react-scan` starts only when explicitly enabled.
- Why:
  - **Observed**: Profiling UI was active during gameplay and correlated with low FPS reports.
  - **Inferred**: Always-on instrumentation distorts baseline playtest performance.
- Implemented in:
  - `src/frontend/src/main.tsx`
- Enable when needed:
  - `?reactScan=1` in URL, or
  - `localStorage.setItem('react_scan_enabled', '1')`

### D8. Split HUD view-model logic to pass maintainability CCN gate

- Decision: Extracted `buildHudViewModel` from `HUD.tsx` into `hudViewModel.ts`.
- Why:
  - **Observed**: maintainability guard failed with `HUD.tsx max_ccn=69 > 60`.
  - **Observed**: lizard treated `buildHudViewModel` as spanning the whole TSX file, inflating cyclomatic complexity.
  - **Inferred**: moving non-visual branching logic into a pure `.ts` helper improves parser stability and reviewability.
- Implemented in:
  - `src/frontend/src/games/jenga/components/HUD.tsx`
  - `src/frontend/src/games/jenga/components/hudViewModel.ts`
- Validation:
  - `./scripts/maintainability_guard.sh --staged` passed after extraction.

## What stayed intentionally unchanged

- No full free-plane sandbox drag by default.
  - Reason: product mode remains guided and educational.
- No hard switch to pure “real-world mode” yet.
  - Reason: requires separate mode contract and QA cycle.

## Parameter snapshot (post-change)

- `EXTRACT_DISTANCE = 1.1`
- `MAX_SPEED = 3.6`
- `LATERAL_WIGGLE = 0.28`
- `GRAB_LINEAR_DAMPING = 0.03`
- `RELEASE_LINEAR_DAMPING = 0.1`
- Easy difficulty:
  - `extractDistanceMultiplier = 0.62`
  - `maxSpeedMultiplier = 1.45`
  - `lateralWiggleMultiplier = 1.25`

## Validation Evidence

- **Observed**: ESLint passed for touched Jenga/main files.
- **Observed**: Vitest Jenga subset passed (`15/15`): `Tower`, `GameState`, `HUD`.
- **Observed**: Live CDP snapshots captured in `src/screenshots/` during this implementation day.

## Follow-up Options

1. Add explicit mode split:
   - `Guided` (current defaults)
   - `Real Physics` (more free drag, stronger spring, less helper UI)
2. Add per-device adaptive quality (stars/shadows/labels) based on frame budget.
3. Add one automated visual-playtest script that records extraction latency and frame pacing in live CDP sessions.
