# Game Feature Modularization Implementation Backlog (2026-03-10)

## Objective

Convert the approved architecture planning artifacts into a sequenced, execution-ready backlog with explicit wave order, dependencies, and ticket-ready acceptance criteria.

## Source Inputs

1. `docs/reviews/GAME_FEATURE_MODULARIZATION_AUDIT_2026-03-09.md`
2. `docs/architecture/POSE_ACTION_FEATURE_BLUEPRINT_2026-03-09.md`
3. `docs/reviews/GAME_EXTRACTION_MATRIX_2026-03-09.md`

## Reality Anchors

1. **Observed:** `PhysicsPlayground` is already featureized (`features/physics-playground/*`) and should stay canonical.
2. **Observed:** 7 pose-action games duplicate MediaPipe bootstrap/fallback in pages.
3. **Observed:** Matrix distribution is `Extract Now: 12`, `Extract Later: 16`, `Keep As-Is: 57`, `Already Featureized: 1`.
4. **Inferred:** Shared pose runtime extraction first reduces repeated migration risk before single-game decompositions.

## Implementation Rules (Carried Forward)

1. Keep `pages/*` as route orchestration shells.
2. Move runtime subsystems and non-trivial game domain logic to `features/<domain-or-game>/*`.
3. Keep pure mechanics in `games/*Logic.ts` where no runtime lifecycle is involved.
4. Do not change game rules/content during extraction unless explicitly scoped in ticket acceptance criteria.

## Dependency Graph

1. `W0` (Foundation + test harness) blocks all extraction waves.
2. `W1` (pose runtime pilots) blocks remaining pose migrations in `W2`.
3. `W2` completion is required before medium-tier (`W4`) CV-sensitive games.
4. `W3` (large page extractions) can run in parallel with `W2` after `W0`.
5. `W5` (physics legacy consolidation) depends on `W0` only.

## Wave Plan

| Wave | Scope | Tickets | Dependency | Exit Gate |
|---|---|---:|---|---|
| `W0` | Pose feature skeleton, tests, migration guardrails | 1 | none | Shared runtime module compiles, tests pass, migration checklist approved |
| `W1` | Pilot runtime extraction (`ObstacleCourse`, `FreezeDance`, `SimonSays`) | 3 | `W0` | No direct `FilesetResolver.forVisionTasks` in pilot pages; smoke tests pass |
| `W2` | Remaining pose-action runtime migrations + scoring primitives | 4 | `W1` | All 7 pose games on shared runtime; duplicate bootstrap removed |
| `W3` | Large page extractions (`ConnectTheDots`, `WordBuilder`, `AlphabetGame`, `LetterHunt`, `EmojiMatch`) | 5 | `W0` | Each page reduced to orchestration shell with feature module boundaries |
| `W4` | Medium-tier modularization batch (16 games) | 8 | `W2` and `W3` patterns | Each ticket delivers 2-game feature slices with stable behavior |
| `W5` | Physics playground legacy overlap consolidation | 1 | `W0` | `features/physics-playground/*` is sole canonical runtime domain |

## Ticket-Ready Backlog

### W0 Foundation

#### BAG-001 :: Pose Runtime Foundation + Safety Harness

- Type: `IMPROVEMENT`
- Priority: `P0`
- Depends on: none
- In-scope: Create `features/pose-action-games/*` runtime skeleton, shared types, fallback tests, and migration checklist.
- Out-of-scope: Migrating individual game pages.
- Acceptance Criteria:
  - [ ] `features/pose-action-games/index.ts` exports runtime API.
  - [ ] `usePoseLandmarkerRuntime` supports GPU→CPU fallback path.
  - [ ] Feature tests exist for init/fallback/frame-loop cleanup.
  - [ ] Dev runtime status indicator available behind dev guard.
  - [ ] Type-check and targeted tests pass.

### W1 Pose Pilots

#### BAG-002 :: Migrate ObstacleCourse to Shared Pose Runtime

- Type: `REFACTOR`
- Priority: `P0`
- Depends on: `BAG-001`
- In-scope: Replace in-page pose bootstrap/lifecycle with shared runtime hook; keep gameplay rules unchanged.
- Out-of-scope: Scoring rebalancing or UI redesign.
- Acceptance Criteria:
  - [ ] `ObstacleCourse.tsx` no longer calls `FilesetResolver.forVisionTasks` directly.
  - [ ] Game start/track/end loop behavior matches baseline.
  - [ ] Smoke test or manual runbook evidence recorded.

#### BAG-003 :: Migrate FreezeDance to Shared Pose Runtime

- Type: `REFACTOR`
- Priority: `P0`
- Depends on: `BAG-001`
- In-scope: Runtime extraction only.
- Out-of-scope: Session-state decomposition.
- Acceptance Criteria:
  - [ ] Runtime bootstrap removed from page.
  - [ ] Pose detection responsiveness remains stable.
  - [ ] Smoke test evidence captured.

#### BAG-004 :: Migrate SimonSays to Shared Pose Runtime

- Type: `REFACTOR`
- Priority: `P0`
- Depends on: `BAG-001`
- In-scope: Runtime extraction only.
- Out-of-scope: Round engine extraction.
- Acceptance Criteria:
  - [ ] Runtime bootstrap removed from page.
  - [ ] Existing gameplay phases unchanged.
  - [ ] Smoke test evidence captured.

### W2 Pose Batch Completion

#### BAG-005 :: Migrate FollowTheLeader + BalloonPopFitness Runtime

- Type: `REFACTOR`
- Priority: `P1`
- Depends on: `BAG-002`, `BAG-003`, `BAG-004`
- In-scope: Shared runtime migration for both games.
- Out-of-scope: Movement heuristic tuning.
- Acceptance Criteria:
  - [ ] Both pages stop direct MediaPipe bootstrap.
  - [ ] Gameplay-specific logic remains local.
  - [ ] Smoke verification for both games documented.

#### BAG-006 :: Migrate MusicalStatues + YogaAnimals Runtime

- Type: `REFACTOR`
- Priority: `P1`
- Depends on: `BAG-002`, `BAG-003`, `BAG-004`
- In-scope: Shared runtime migration for both games.
- Out-of-scope: Reward loop changes.
- Acceptance Criteria:
  - [ ] Both pages consume shared runtime hook.
  - [ ] Existing animation/game pacing preserved.
  - [ ] Smoke verification for both games documented.

#### BAG-007 :: Pose Runtime Hardening + Adoption Audit

- Type: `HARDENING`
- Priority: `P1`
- Depends on: `BAG-005`, `BAG-006`
- In-scope: Verify all 7 target games migrated; remove dead helper code; add adoption audit note.
- Out-of-scope: New game migrations.
- Acceptance Criteria:
  - [ ] No pilot-wave page has direct `FilesetResolver.forVisionTasks` use.
  - [ ] Shared runtime tests pass in CI/local.
  - [ ] Migration summary doc updated with before/after metrics.

#### BAG-008 :: Shared Scoring Primitives for Pose Games

- Type: `IMPROVEMENT`
- Priority: `P2`
- Depends on: `BAG-007`
- In-scope: Extract hold/combo primitives from duplicated pose-game logic into shared scoring module.
- Out-of-scope: Threshold normalization across all games.
- Acceptance Criteria:
  - [ ] `holdTracker` and combo utility used by at least 2 pose games.
  - [ ] Game thresholds remain game-owned.
  - [ ] Unit tests cover primitive edge cases.

### W3 Large Single-Game Extractions (Extract Now, Non-Pose)

#### BAG-009 :: Extract `features/connect-the-dots/*`

- Type: `REFACTOR`
- Priority: `P0`
- Depends on: `BAG-001`
- Acceptance Criteria:
  - [ ] Dot-generation/progression engine moved out of page.
  - [ ] Path validation and hit detection isolated.
  - [ ] Page acts as orchestration shell.

#### BAG-010 :: Extract `features/word-builder/*`

- Type: `REFACTOR`
- Priority: `P0`
- Depends on: `BAG-001`
- Acceptance Criteria:
  - [ ] Session machine and stage progression extracted.
  - [ ] Analytics boundary adapter defined.
  - [ ] Page LOC reduced materially (target >= 20%).

#### BAG-011 :: Extract `features/alphabet-game/*`

- Type: `REFACTOR`
- Priority: `P0`
- Depends on: `BAG-001`
- Acceptance Criteria:
  - [ ] Core tracing/gameplay orchestration split into feature modules.
  - [ ] Page reduced to route shell.
  - [ ] Existing event tracking behavior preserved.

#### BAG-012 :: Extract `features/letter-hunt/*`

- Type: `REFACTOR`
- Priority: `P1`
- Depends on: `BAG-001`
- Acceptance Criteria:
  - [ ] Session state and round progression extracted.
  - [ ] Page keeps UI composition and route-level concerns.
  - [ ] Smoke test evidence captured.

#### BAG-013 :: Extract `features/emoji-match/*`

- Type: `REFACTOR`
- Priority: `P1`
- Depends on: `BAG-001`
- Acceptance Criteria:
  - [ ] Matching engine and progression logic extracted.
  - [ ] UI overlays/components modularized where high churn exists.
  - [ ] Smoke test evidence captured.

### W4 Medium-Tier Batch (Extract Later)

#### BAG-014 :: Batch A (`MemoryMatch`, `RhymeTime`)
#### BAG-015 :: Batch B (`VirtualChemistryLab`, `StorySequence`)
#### BAG-016 :: Batch C (`ShapeSafari`, `ShapePop`)
#### BAG-017 :: Batch D (`MathMonsters`, `AirCanvas`)
#### BAG-018 :: Batch E (`DiscoveryLab`, `DressForWeather`)
#### BAG-019 :: Batch F (`PhonicsSounds`, `PhonicsTracing`)
#### BAG-020 :: Batch G (`ColorMatchGarden`, `MirrorDraw`)
#### BAG-021 :: Batch H (`BubblePop`, `ShapeSequence`)

- Type: `REFACTOR`
- Priority: `P2`
- Depends on: `BAG-007` and one successful `W3` extraction template (`BAG-009` to `BAG-013`)
- Shared Acceptance Criteria for each batch ticket:
  - [ ] Both game pages reduced to orchestration shell boundaries.
  - [ ] New `features/<game>/*` modules own runtime/session logic.
  - [ ] Behavior parity validated via smoke runbook.
  - [ ] Any common primitives discovered are captured as follow-up ticket candidates.

### W5 Canonicalization

#### BAG-022 :: Consolidate Physics Playground Legacy Overlap

- Type: `HARDENING`
- Priority: `P1`
- Depends on: `BAG-001`
- In-scope: Consolidate overlap between `features/physics-playground/*` and `games/physics-playground/*`.
- Out-of-scope: New gameplay features.
- Acceptance Criteria:
  - [ ] Canonical runtime remains `features/physics-playground/*`.
  - [ ] Legacy overlap files moved/renamed to explicit compatibility or fixture namespace.
  - [ ] Imports from runtime pages no longer point to ambiguous duplicate logic.

## Sequencing Recommendation (Execution Order)

1. Run `BAG-001` first; treat as quality and API contract baseline.
2. Execute `W1` in order: `BAG-002` → `BAG-003` → `BAG-004`.
3. Complete `W2` pose batch and hardening (`BAG-005` to `BAG-008`).
4. In parallel after `BAG-001`, run one large-page pilot (`BAG-009` or `BAG-010`) to refine split template.
5. Finish remaining `W3` large pages.
6. Execute `W4` medium batches in pairs to reduce merge churn.
7. Close with canonical consolidation `BAG-022`.

## Definition Of Done (Program Level)

1. All 12 `Extract Now` games have implemented feature boundaries matching proposed module targets.
2. `features/pose-action-games/*` is adopted by all 7 pose-action targets.
3. Medium-tier queue has executable tickets with dependencies and acceptance criteria (this backlog) and begins after wave gates pass.
4. Worklog and issue artifacts remain synchronized per ticket as implementation starts.

## Notes For Ticket Creation

1. Convert each `BAG-*` item into `TCK-YYYYMMDD-###` only when implementation starts to avoid ID collisions.
2. Keep one implementation PR per backlog ticket unless explicitly batching by user approval.
3. Each implementation ticket should link both this backlog doc and the source matrix/blueprint docs.
