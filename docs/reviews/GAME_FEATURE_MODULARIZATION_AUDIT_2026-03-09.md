# Game Feature Modularization Audit (2026-03-09)

## Objective

Answer two product-engineering questions:

1. Why is `PhysicsPlayground` organized as `features/physics-playground/*` while most other games are page-centric?
2. Can/should other games be moved to a `features/*` architecture, and where are the best extraction opportunities?

## Workflow Trace

1. Analysis: inspected current game/page structure and existing feature modules.
2. Document: captured baseline architecture facts and historical context.
3. Plan: defined portfolio scan heuristics (size, duplication, direct CV setup, logic separation).
4. Research: scanned all game pages and sampled high-complexity files.
5. Document: produced candidate feature extraction roadmap (this report).

## Why Physics Playground Is "Special"

`PhysicsPlayground` is already split as a domain subsystem, not a simple page. It imports multiple dedicated feature-layer modules in one place:

- `AudioSystem`, `ParticleSystem`, `CanvasRenderer`, `StateManager`, `HandTracker`, `HandInteraction`, and shared physics types are all imported from `features/physics-playground/*` in `src/frontend/src/pages/PhysicsPlayground.tsx`.
- Evidence: `src/frontend/src/pages/PhysicsPlayground.tsx:3-16`.

The feature folder contains multiple engine-like classes rather than just UI helpers:

- `AudioSystem`, `ParticleSystem`, `PhysicsWorld`, `CollisionHandler`, `BoundaryHandler`, `CanvasRenderer`, `StateManager`, `HandTracker`, `HandInteraction`, `Particle`.
- Evidence: class exports in `src/frontend/src/features/physics-playground/**/*.ts`.

Historical context indicates this was intentionally treated as an experimental/full-feature module and stabilized separately from the standard game batch:

- Evidence: `docs/WORKLOG_ADDENDUM_PHYSICS_PLAYGROUND_2026-03-05.md` describes "Full Feature Stabilization" and target scope `src/frontend/src/features/physics-playground/**`.
- Evidence: `docs/TEST_REPORT_2026-03-03.md` repeatedly labels physics-playground as "experimental feature" isolated from the 25-game batch.

## Can Other Games Use `features/*`?

Yes. There is no architectural restriction preventing other feature modules.

Current repo reality already shows mixed modularization styles:

1. Page-centric games (`src/frontend/src/pages/*.tsx`) with embedded orchestration and UI.
2. Logic extraction (`src/frontend/src/games/*Logic.ts`) for pure/pure-ish mechanics.
3. Shared game UI (`src/frontend/src/components/game/*`).
4. Partial per-game component extraction (example: Yoga Animals subcomponents in `src/frontend/src/components/games/yogaAnimals/*`).

This means the limitation is convention drift, not capability.

## Portfolio Scan Coverage

Scan covered all game pages (excluding app/account pages like Login, Settings, Dashboard):

- Total game pages scanned: **86**
- Heuristic tiers:
  - **High modularization priority**: 12
  - **Medium modularization priority**: 17
  - **Low modularization priority**: 57

Tier heuristic:

- High = very large page (>= 800 LOC) or direct in-page MediaPipe pose bootstrap duplication.
- Medium = 550+ LOC without hard duplication pressure.

## High-Priority Feature Candidates

### 1) New `features/pose-action-games/*`

Duplicate MediaPipe pose initialization appears across multiple games, with near-identical GPU->CPU fallback code:

- `FreezeDance.tsx:93-120`
- `SimonSays.tsx:227-254`
- `FollowTheLeader.tsx:81-104`
- `BalloonPopFitness.tsx:88-116`
- `MusicalStatues.tsx:73-96`
- `ObstacleCourse.tsx:222-249`
- `YogaAnimals.tsx:208-235`

Recommended extraction units:

1. `usePoseLandmarkerRuntime` hook (init + fallback + lifecycle).
2. Shared `PoseSessionController` (frame loop + throttling + cleanup).
3. Shared diagnostics + camera status adapter.

### 2) New `features/connect-the-dots/*`

- `ConnectTheDots.tsx` is ~950 LOC with embedded game logic and no dedicated logic module import.
- Evidence: `docs/reviews/CONNECTTHEDOTS_DOC_TO_CODE_AUDIT_2026-03-07.md` flags embedded logic and missing separate logic file.

Recommended extraction units:

1. Dot generation + level progression engine.
2. Connect hit detection and path validation.
3. Game state reducer + timers.

### 3) New `features/simon-says/*` and `features/freeze-dance/*`

- Both files are 890+ LOC and already flagged as extraction candidates in their doc-to-code audits.
- Evidence:
  - `docs/reviews/SIMONSAYS_DOC_TO_CODE_AUDIT_2026-03-07.md` (large component finding)
  - `docs/reviews/FREEZEDANCE_DOC_TO_CODE_AUDIT_2026-03-07.md` (large component finding)

Recommended extraction units:

1. Round/session state machine.
2. Pose-action matching module.
3. UI panels (HUD, phase overlays, summary cards).

### 4) New `features/word-builder/*`

- `WordBuilder.tsx` exceeds 1000 LOC and combines analytics, stage progression, scoring, and UI orchestration.

Recommended extraction units:

1. `wordBuilderSessionMachine`.
2. Stage progression + auto-advance policy.
3. Analytics adapter boundary.

### 5) Consolidate `features/physics-playground/*` vs `games/physics-playground/*`

- There is residual duplication/legacy overlap (`src/frontend/src/games/physics-playground/particle.ts` still exists and imports feature types).

Recommended extraction decision:

1. Keep `features/physics-playground/*` as canonical runtime domain.
2. Move legacy `games/physics-playground/*` to explicit compatibility or test fixture namespace.

## Medium-Priority Candidates (Next Wave)

Medium tier (17 games) includes: `MemoryMatch`, `VirtualChemistryLab`, `StorySequence`, `ShapeSafari`, `PhysicsPlayground`, `MathMonsters`, `AirCanvas`, `DiscoveryLab`, `RhymeTime`, `ShapePop`, `DressForWeather`, `PhonicsSounds`, `ColorMatchGarden`, `MirrorDraw`, `BubblePop`, `PhonicsTracing`, `ShapeSequence`.

Pattern: most are not broken, but are good candidates for incremental feature slicing by gameplay domain (session/state, interaction engine, game-specific UI kit).

## Architecture Decision (Proposed)

Adopt a consistent rule:

1. Keep `pages/*` as orchestration + route entrypoints.
2. Move game-domain runtime systems into `features/<game-or-domain>/*` when either condition is true:
   - page > 700 LOC, or
   - duplicated subsystem appears in 3+ games (e.g., pose bootstrap).
3. Keep pure mechanics in `games/*Logic.ts` if no side effects/runtime concerns.
4. Keep shared visual primitives in `components/game/*`.

## Suggested Next Discussion (Before Implementation)

1. Approve `features/pose-action-games` as the first cross-game extraction domain.
2. Choose one pilot game for page split pattern (`ConnectTheDots` or `SimonSays`).
3. Confirm canonical boundary for physics playground legacy files (`features/*` canonical vs `games/*` legacy).
