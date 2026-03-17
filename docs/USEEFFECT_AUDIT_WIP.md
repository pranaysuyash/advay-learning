# useEffect Full Audit — Work In Progress

**Started:** March 18, 2026
**Status:** IN PROGRESS — 23/232 files audited, full audit dispatched
**Thread:** https://ampcode.com/threads/T-019d002a-c640-708c-9d98-6c374683fdbe

---

## What This Is

A complete audit of every `useEffect` call in the frontend codebase, classifying each into:

| Code | Meaning | Action |
|------|---------|--------|
| **RULE1_DERIVE** | Sets state derived from other state/props | Replace with `useMemo` or inline computation |
| **RULE2_FETCH** | Data fetching in effect | Replace with React Query (already installed) |
| **RULE3_EVENT** | Watches state flag to trigger work | Move to event handler |
| **RULE4_MOUNT** | Legitimate mount/cleanup/timer/DOM sync | Keep as-is |
| **RULE5_RESET** | Resets state when prop/ID changes | Use `key={id}` on component |
| **REF_SYNC** | Syncs state to ref for callbacks | Replace with `useLatest` hook |

## Why

- React's own docs say most useEffect calls are unnecessary (https://react.dev/learn/you-might-not-need-an-effect)
- Each `useEffect(() => setState(x))` causes 2 renders instead of 1
- 578 useEffect calls across 232 files — estimated ~250 removable
- Verified against Factory's engineering post + React docs + our codebase patterns

## What's Done

### 1. Skill created (Projects-level)
`/Users/pranay/Projects/skills/react-effect-discipline/SKILL.md`
- Decision framework, 5 rules, useLatest pattern, audit checklist, enforcement guidance

### 2. Sample audit complete (23 files, 130 effects)
`docs/USEEFFECT_AUDIT_2026-03-18.md`
- 70% legitimate (RULE4_MOUNT)
- 17% flag-watching (RULE3_EVENT) — same 2 patterns repeat in 8+ game files
- 8.5% derived state (RULE1_DERIVE)
- 3.8% data fetching (RULE2_FETCH)
- ~40 ref-sync effects → useLatest

### 3. Perf measurement plan
`docs/USEEFFECT_PERF_MEASUREMENT.md`
- React Profiler, effect counter, performance.mark, before/after snapshots

### 4. GlobalCVCursor refactored
`src/frontend/src/components/game/GlobalCVCursor.tsx`
- Reduced from 4 effects to 2 (mount-only rAF loop pattern)
- Wired into App.tsx with CSS

### 5. Long-term CV strategy documented
`docs/CV_BUTTON_LONGTERM_STRATEGY.md`

---

## What Remains — Full Audit Batches

The full 232-file audit is split into 6 batches. Each batch needs an agent to:
1. Read each file
2. Find every `useEffect(` call
3. Classify it (RULE1-5 or REF_SYNC)
4. Output a summary table per file
5. Provide batch totals

### Batch 1: pages/ A-C (~24 files)
```
AirCanvas, AlphabetGame*, AnimalSounds, BalanceBeam, BalloonPopFitness,
BeatBounce, BeginningSounds, BlendBuilder, BubbleBiology, BubbleCount,
BubblePop, BubblePopSymphony, CatchSort, CircuitBuilder, ColorByNumber,
ColorMatchGarden*, ColorMixing, ColorPotions, ColorSortGame, ColorSplash,
ConnectTheDots*, CountingCollectathon, CountingObjects, CuttingPractice
```
*Already audited — just verify/carry forward

### Batch 2: pages/ D-L (~25 files)
```
Dashboard*, DinosaurDig, DressForWeather, EarthTimeMachine, EmojiMatch*,
EndingSounds, FarmFriends, FeedTheMonster, FingerPaintingMadness,
FollowTheLeader, FractionPizza, FreeDraw, FreezeDance, FruitNinjaAir,
GameSelection, Home, ISSDocking, KaleidoscopeHands, LanguagePuppet,
LetterCatcher, LetterHunt, LetterSoundMatch, LightPainter, LogicBoxPush, Login
```

### Batch 3: pages/ M-R (~38 files)
```
MathJumpers, MathMonsters, MathSmash, MazeRunner, MediaPipeTest,
MemoryMatch, MidlineViolator, MirrorDraw*, MirrorDuel, MirrorMaze,
MoreOrLess, MusicalStatues, MusicConductor, MusicPinchBeat, NasaSkyHunt,
NumberBubblePop, NumberSequence, NumberTapTrail*, NumberTracing,
ObstacleCourse, OddOneOut, PackLunchbox, PathFollowing, PhonicsSounds*,
PhonicsTracing, PhysicsPlayground, PinchPractice, PlanetSandbox,
PlantGarden, PlatformerRunner, PopTheNumber, Pricing, Progress*,
RainbowBridge, ReadingAlong, Register, ResetPassword, RhymeTime
```

### Batch 4: pages/ S-Z + three/ + alphabet-game/ (~46 files)
```
SameAndDifferent, SetTheTable, Settings, ShadowPortal (both),
ShadowPuppetTheater, ShapePop, ShapeSafari, ShapeSequence*, ShapeStacker,
SightWordFlash, SimonSays, SimpleAddition, SoundGarden, SpellingRun,
SpellPainter, SteadyHandLab, StoryBuilder, StorySequence, SyllableClap,
TargetPractice, TasteMatch, TemperatureSort, TextureExplorer, TidyUpTime,
TimeTell, VerifyEmail, VirtualArchery, VirtualBubbles, VirtualChemistryLab,
WashHandsDance, WeatherLab, WordBuilder*, WordSearch, YogaAnimals,
+ three/ (9 files) + alphabet-game/ (2 files)
```

### Batch 5: hooks/ (~37 files)
```
use3DGameAudio, useAttentionDetection, useAutoGameCompletion, useEyeTracking,
useFallbackControls, useFeatureDetection, useGameFaceTracking,
useGameHandTracking*, useGameLoop, useGamePoseTracking, useGameSession,
useHandClick, useHandInteraction, useHandTracking, useHandTrackingRuntime,
useInactivityDetector*, useInitialCameraPermission, useIssueRecorder,
useMicrophoneInput, useOnlineStatus, usePerformanceMonitor, usePostureDetection,
useProgressSync, useRealTimeEngagement*, useSessionProgressReporter*,
useSessionTimer, useSocialLearning, useSoundEffects, useSubscription,
useTimeOnTask*, useTTS*, useVisionWorkerRuntime, useVoicePrompt*,
useWindowSize, utils/useAudio, utils/useKenneyAudio, utils/pinchDetection
```

### Batch 6: components/ (~61 files)
```
App.tsx, AssetPreloader*, avatar/KenneyAvatar, BlinkDetection,
CalmModeProvider, CameraRecoveryModal, characters/CSSMonster,
characters/KenneyCharacter, characters/SVGBird, dashboard/AddChildModal,
dashboard/EditProfileModal, demo/DemoInterface, ExitConfirmationModal,
game/AttentionMeter, game/CelebrationEffects, game/CharacterReaction,
game/DragDropSystem, game/EnemySprite, game/GameCanvas, game/GameCursor,
game/GameFeedback, game/GlobalCVCursor (done), game/HandAvatarCursor,
game/HandDetectionProvider, game/HandTrackingStatus,
game/KenneyCharacterAnimated, game/RewardAnimation, game/SuccessAnimation,
game/TargetSystem, game/three/FPSCounter, game/TrackingLossOverlay,
game/VoiceInstructions, game/WellnessMonitor, GameShell, GameTutorial,
inventory/ItemDropToast, issue-reporting/*, LumiCompanion, Mascot*,
NoCameraFallback, OnboardingFlow, Pip, TutorialOverlay,
ui/ConfirmDialog, ui/ConfirmModal, ui/DeadLetterDialog, ui/Modal*,
ui/ParentGate, ui/ProtectedRoute, ui/SyncStatusIndicator, ui/VisionButton*,
ui/VoiceButton*, WellnessDashboard, WellnessReminder, WellnessTimer,
games/FingerNumberShow, games/jenga/*, i18n/I18nProvider
```

---

## How To Run a Batch

For each file in the batch:

```bash
# 1. Count effects
rg -c "useEffect(" "src/frontend/src/pages/FileName.tsx"

# 2. See each effect with context
rg -n "useEffect(" "src/frontend/src/pages/FileName.tsx" -A10
```

Then classify each effect by reading the body:
- Does it call `setState(derivedValue)`? → RULE1_DERIVE
- Does it `fetch()`? → RULE2_FETCH
- Does it check `if (flag)` then do work? → RULE3_EVENT
- Does it set up timer/listener/subscription with cleanup? → RULE4_MOUNT
- Does it reset state when an ID prop changes? → RULE5_RESET
- Does it do `ref.current = stateValue`? → REF_SYNC

## Output Format Per Batch

```markdown
## FileName.tsx — N effects
| Line | Classification | Brief description |
|------|---------------|-------------------|
| 42   | RULE4_MOUNT   | Timer interval for countdown |
| 67   | REF_SYNC      | Syncs score to scoreRef |
| 89   | RULE3_EVENT   | Watches isPlaying to call startTracking |
```

Then batch totals at end.

## After All Batches Complete

1. Merge results into `docs/USEEFFECT_AUDIT_2026-03-18.md` (replace sample with full)
2. Update totals and percentages
3. Create priority fix list ordered by: shared hooks first (multiplied impact), then high-effect-count pages
4. Create `useLatest` hook in `src/frontend/src/hooks/useLatest.ts`

---

## Key Files

| File | Purpose |
|------|---------|
| `docs/USEEFFECT_AUDIT_2026-03-18.md` | Audit results (sample → will be full) |
| `docs/USEEFFECT_AUDIT_WIP.md` | This file — work tracker |
| `docs/USEEFFECT_PERF_MEASUREMENT.md` | Perf measurement plan |
| `docs/CV_BUTTON_LONGTERM_STRATEGY.md` | CV cursor strategy |
| `/Users/pranay/Projects/skills/react-effect-discipline/SKILL.md` | Projects-level skill |
| `src/frontend/src/components/game/GlobalCVCursor.tsx` | Already refactored |
