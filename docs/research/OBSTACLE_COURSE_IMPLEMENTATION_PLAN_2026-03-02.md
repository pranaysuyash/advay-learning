# IMPLEMENTATION PLAN: TCK-20260302-003

## Scope

Comprehensive implementation of `Obstacle Course` as a new pose-driven game plus reusable pose movement analysis primitives that other movement games can adopt.

Prompts used:
- `prompts/planning/implementation-planning-v1.0.md`
- `prompts/implementation/feature-implementation-v1.0.md`

## Discovery Summary

**Observed**
- [docs/COMPLETE_GAME_ACTIVITIES_CATALOG.md](/Users/pranay/Projects/learning_for_kids/docs/COMPLETE_GAME_ACTIVITIES_CATALOG.md) defines `Obstacle Course` as a sequence-memory + movement game: duck, jump, sidestep in order, with "Pose Landmarker depth estimation".
- [src/frontend/src/pages/FollowTheLeader.tsx](/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/FollowTheLeader.tsx), [src/frontend/src/pages/MusicalStatues.tsx](/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/MusicalStatues.tsx), [src/frontend/src/pages/YogaAnimals.tsx](/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/YogaAnimals.tsx), and [src/frontend/src/pages/SimonSays.tsx](/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/SimonSays.tsx) each initialize `PoseLandmarker` locally and run bespoke pose loops.
- [src/frontend/src/App.tsx](/Users/pranay/Projects/learning_for_kids/src/frontend/src/App.tsx) and [src/frontend/src/data/gameRegistry.ts](/Users/pranay/Projects/learning_for_kids/src/frontend/src/data/gameRegistry.ts) are the required route/registry integration points.
- [src/frontend/src/pages/__tests__/GamePages.smoke.test.tsx](/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/__tests__/GamePages.smoke.test.tsx) is the existing smoke test location for new pages.

**Inferred**
- A reusable foundation should separate movement classification from page rendering so other pose games can reuse calibration, baseline tracking, and motion heuristics.
- "Depth estimation" can be represented with body-scale delta and shoulder/hip spread changes from a calibrated baseline, even without a true 3D depth API.
- Reusing an extracted pose utility lowers future effort for catalog games like additional movement/sequence activities.

**Unknown**
- Real-world threshold tuning across child heights and camera placement cannot be fully proven without manual camera testing.
- Existing pose pages may have latent bugs, but this slice should avoid broad refactors unless directly needed for the new shared primitives.

## Options Considered

| Option | Approach | Pros | Cons | Risk |
|---|---|---|---|---|
| A | Standalone `ObstacleCourse.tsx` with bespoke logic | Fastest | Repeats architecture debt, poor reuse | MED |
| B | Add reusable movement-analysis utilities + page-specific orchestration | Reusable, scoped, testable | Slightly larger change | LOW |
| C | Full shared pose runtime refactor for all pose games first | Best long-term cleanup | Too broad for one slice | HIGH |

**Recommendation**: Option B. It delivers a proper implementation now and adds reusable movement primitives without dragging unrelated pose pages into a risky refactor.

## Detailed Plan

### Phase 1: Foundation
1. Add a shared pose movement utility module under `src/frontend/src/games/` with:
   - baseline calibration from stable frames
   - derived body metrics (crouch, jump height, lateral offset, body scale)
   - movement classification helpers for `duck`, `jump`, `sidestep-left`, `sidestep-right`
2. Add unit tests for these helpers with synthetic landmark fixtures.

### Phase 2: Core Implementation
1. Add `src/frontend/src/games/obstacleCourseLogic.ts`:
   - obstacle definitions
   - round generation with progressive speed/complexity
   - scoring and combo logic
   - success/fail state transitions
2. Add `src/frontend/src/pages/ObstacleCourse.tsx`:
   - pose landmarker init + hidden webcam
   - calibration flow before play
   - per-frame analysis using the shared utility
   - obstacle visualization and movement feedback
   - sequence completion, streaks, celebration, and end state

### Phase 3: Integration & Polish
1. Register the route in `src/frontend/src/App.tsx`.
2. Add manifest entry in `src/frontend/src/data/gameRegistry.ts`.
3. Add smoke render coverage in `src/frontend/src/pages/__tests__/GamePages.smoke.test.tsx`.
4. Keep docs/worklog aligned with actual implementation and verification commands.

## Testing Strategy

- Unit:
  - metric derivation returns stable normalized values
  - movement classifiers detect expected synthetic poses
  - obstacle state machine advances/fails correctly
- Integration:
  - smoke test renders `ObstacleCourse`
- Manual:
  - verify calibration starts only after camera readiness
  - test duck/jump/sidestep against live webcam
  - confirm wrong-order movement does not clear the obstacle

## Verification Checklist

- [ ] Shared movement primitives added and covered by tests
- [ ] `ObstacleCourse` route renders
- [ ] Registry entry exists and matches route
- [ ] Targeted tests pass
- [ ] Worklog addendum updated with evidence

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Thresholds too sensitive for some children | MED | HIGH | Use calibration baseline + forgiving thresholds + progress smoothing |
| Camera framing issues cause false negatives | MED | MED | Add visibility messaging and "recalibrate" action |
| Shared utility leaks into unrelated code | LOW | MED | Keep initial adoption isolated to `ObstacleCourse` |

## Rollback Plan

- Remove `ObstacleCourse` page, logic, route, registry entry, and tests.
- Preserve the shared utility only if it is independently useful; otherwise remove it in the same rollback.
