# Stub Register

This document tracks every stub, placeholder, or incomplete implementation found in game-related code.

| STUB-ID  | Game / Area       | File(s) & Lines                                             | Type                    | Mechanics Impact | User Impact / Risk                                                 | Status   | Implementation Unit |
| -------- | ----------------- | ----------------------------------------------------------- | ----------------------- | ---------------- | ------------------------------------------------------------------ | -------- | ------------------- |
| STUB-001 | shared/core       | multiple `src/frontend/src/pages/*.tsx` (lines ~20-60)      | placeholder boilerplate | High             | Every game; duplicated access/score logic, high risk of regression | **Done** | Unit-1              |
| STUB-002 | BodyParts         | `src/pages/BodyParts.tsx` lines 80-120                      | placeholder boilerplate | Medium           | Score/finish duplication                                           | **Done** | Unit-1              |
| STUB-003 | AirGuitarHero     | `src/pages/AirGuitarHero.tsx` lines 1-160                   | placeholder boilerplate | Medium           | Score/level duplication                                            | **Done** | Unit-1              |
| STUB-004 | PhonicsTracing    | `src/pages/PhonicsTracing.tsx` early returns & canvas guard | bug/robustness          | Medium           | Smoke-test crash                                                   | **Done** | Unit-1              |
| STUB-005 | KaleidoscopeHands | `src/pages/KaleidoscopeHands.tsx` canvas transform          | bug                     | Low              | Smoke-test crash                                                   | **Done** | Unit-1              |
| STUB-006 | VirtualBubbles    | `src/pages/VirtualBubbles.tsx` line 143 blow-detection log  | feature stub            | Medium           | No blow detection/fallback                                         | **Done** | Unit-2              |
| STUB-007 | FreeDraw          | `src/pages/FreeDraw.tsx` metadata min                       | enhancement             | Low              | Metadata sparse                                                    | **Done** | Unit-5              |
| STUB-008 | DiscoveryLab      | `src/pages/DiscoveryLab.tsx` partialRecipes onCraft noop    | UI stub                 | Low              | Non-actionable hint cards                                          | **Done** | Unit-3              |
| STUB-009 | ConnectTheDots    | `src/pages/ConnectTheDots.tsx` camera permission console    | UX stub                 | Medium           | Black screen when denied                                           | **Done** | Unit-4              |
| STUB-010 | Inventory         | `src/pages/Inventory.tsx` line 175 early return             | UI stub                 | Low              | Empty list hides element                                           | **Done** | Unit-5              |
| STUB-011 | WordBuilderLogic  | `src/games/wordBuilderLogic.ts` line 594 `'HACK'` constant  | technical debt          | None             | minor constant                                                     | **Done** | Unit-5              |

## Notes

- STUB‑001 through STUB‑005 were fixed as part of the GamePage refactor; see Unit‑1 details below.
- Remaining stubs have been triaged and assigned to later units; see IMPLEMENTATION_UNITS.md for full planning.

| STUB-012 | useAttentionDetection | `src/frontend/src/hooks/useAttentionDetection.ts` (Lines 88, 345) | Missing feature | High | Broken safety guardrails if headpose unsupported | **Done** | Unit-6 |
| STUB-013 | Offline Sync | `src/frontend/e2e/offline_sync.spec.ts` (Line 14) | test stub | None | Missing coverage for feature | **Done** | Unit-7 |
| STUB-014 | Localization | `src/frontend/src/data/languages.ts` (Lines 24-26) | Missing asset | None | UI placeholder | **Done** | Unit-8 |

### Mechanics Research for STUB-012 (Head Pose Estimation)

- **Expected behavior**: The app needs to know the child's head orientation (pitch, yaw, roll) to trigger posture safety mechanics and attention reminders robustly.
- **Reference patterns**: MediaPipe Face Mesh standard geometric heuristics or Perspective-n-Point (PnP). Educational apps often estimate simple 2D proxy metrics rather than running expensive 3D PnP on generic hardware.
- **Chosen approach**: 2D geometric heuristics derived from 3D FaceLandmarker mesh nodes. Calculate Pitch (nose-to-chin vs nose-to-forehead), Yaw (nose centrality relative to cheeks), and Roll (angle between left/right eyes).
- **Trade-offs**: Faster and simpler than PnP, perfectly adequate for the loose tolerances needed for kids' attention mechanisms on less-powerful tablets.
- **Acceptance criteria**: The `{pitch, yaw, roll}` correctly compute non-zero dynamic angles.
- **Test plan**: Manual check of game UI logged metrics while tilting head. Unit test with mock geometry data.
