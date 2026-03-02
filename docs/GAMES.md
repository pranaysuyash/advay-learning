# Advay Vision Learning — Games Catalog

> **19 interactive learning games** for children ages 3–8, powered by MediaPipe hand/pose tracking, React + TypeScript + Vite.

---

## Summary Table

| #   | Game                                               | Route                       | Category           | Input                 | Levels                    | Timer        | Status      |
| --- | -------------------------------------------------- | --------------------------- | ------------------ | --------------------- | ------------------------- | ------------ | ----------- |
| 1   | [Alphabet Tracing](#1-alphabet-tracing)            | `/games/alphabet-tracing`   | Literacy           | Hand tracking         | Multi-language            | —            | ✅ Complete |
| 2   | [Finger Number Show](#2-finger-number-show)        | `/games/finger-number-show` | Numeracy           | Hand tracking         | 4 difficulties            | —            | ✅ Complete |
| 3   | [Connect The Dots](#3-connect-the-dots)            | `/games/connect-the-dots`   | Motor Skills       | Hand tracking + Mouse | 5 levels × 3 difficulties | 60s          | ✅ Complete |
| 4   | [Letter Hunt](#4-letter-hunt)                      | `/games/letter-hunt`        | Literacy           | Hand tracking         | 3 levels                  | 30s/round    | ✅ Complete |
| 5   | [Music Pinch Beat](#5-music-pinch-beat)            | `/games/music-pinch-beat`   | Rhythm             | Hand tracking (pinch) | —                         | —            | ✅ Complete |
| 6   | [Steady Hand Lab](#6-steady-hand-lab)              | `/games/steady-hand-lab`    | Motor Skills       | Hand tracking         | —                         | —            | ✅ Complete |
| 7   | [Shape Pop](#7-shape-pop)                          | `/games/shape-pop`          | Shapes             | Hand tracking (pinch) | —                         | 60s          | ✅ Complete |
| 8   | [Color Match Garden](#8-color-match-garden)        | `/games/color-match-garden` | Colors             | Hand tracking (pinch) | —                         | 75s          | ✅ Complete |
| 9   | [Number Tap Trail](#9-number-tap-trail)            | `/games/number-tap-trail`   | Numeracy           | Hand tracking (pinch) | 6 levels                  | 90s          | ✅ Complete |
| 10  | [Shape Sequence](#10-shape-sequence)               | `/games/shape-sequence`     | Memory             | Hand tracking (pinch) | 6 levels                  | 80s          | ✅ Complete |
| 11  | [Yoga Animals](#11-yoga-animals)                   | `/games/yoga-animals`       | Movement           | Pose tracking         | 6 animals                 | —            | ✅ Complete |
| 12  | [Freeze Dance](#12-freeze-dance)                   | `/games/freeze-dance`       | Movement           | Pose + Hand tracking  | 3 phases                  | —            | ✅ Complete |
| 13  | [Simon Says](#13-simon-says)                       | `/games/simon-says`         | Movement           | Pose tracking         | —                         | —            | ✅ Complete |
| 14  | [Virtual Chemistry Lab](#14-virtual-chemistry-lab) | `/games/chemistry-lab`      | Science            | Hand tracking (pinch) | 5 reactions               | —            | ✅ Complete |
| 15  | [Word Builder](#15-word-builder)                   | `/games/word-builder`       | Literacy / Phonics | Hand tracking (pinch) | 3 levels                  | 90s          | ✅ Complete |
| 16  | [Emoji Emotion Match](#16-emoji-emotion-match)     | `/games/emoji-match`        | Social-Emotional   | Hand tracking (pinch) | 3 levels                  | 20s/round    | ✅ Complete |
| 17  | [Air Canvas](#17-air-canvas)                       | `/games/air-canvas`         | Creativity         | Hand tracking         | —                         | —            | ✅ Complete |
| 18  | [Mirror Draw](#18-mirror-draw)                     | `/games/mirror-draw`        | Creativity + Motor | Hand tracking (pinch) | 4 levels                  | —            | ✅ Complete |
| 19  | [Phonics Sounds](#19-phonics-sounds)               | `/games/phonics-sounds`     | Literacy / Phonics | Hand tracking (pinch) | 3 levels                  | 15-20s/round | ✅ Complete |

---

## Architecture Overview

### Shared Hooks

All camera-based games share a common set of hooks that abstract MediaPipe setup, the detection loop, and audio feedback.

| Hook                     | File                                               | Purpose                                                                                                                                                     |
| ------------------------ | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useHandTracking`        | `src/frontend/src/hooks/useHandTracking.ts`        | Initializes MediaPipe `HandLandmarker` with GPU→CPU fallback. Returns `landmarker`, `isLoading`, `isReady`, `initialize`, `reset`.                          |
| `useHandTrackingRuntime` | `src/frontend/src/hooks/useHandTrackingRuntime.ts` | Shared game loop: processes webcam frames, runs detection, calculates hand/pinch states. Accepts `onFrame` callback, smoothing & pinch config.              |
| `useSoundEffects`        | `src/frontend/src/hooks/useSoundEffects.ts`        | Programmatic Web Audio API sound effects (no external assets). Methods: `playSuccess`, `playPop`, `playError`, `playClick`, `playCelebration`, `playStart`. |

### Shared Components

| Component            | File                                                 | Purpose                                                                        |
| -------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------ |
| `GameContainer`      | `src/frontend/src/components/GameContainer.tsx`      | Standardized game layout with header (score, level, navigation) and game area. |
| `GameControls`       | `src/frontend/src/components/GameControls.tsx`       | Reusable control buttons with consistent touch targets and positioning.        |
| `CelebrationOverlay` | `src/frontend/src/components/CelebrationOverlay.tsx` | Full-screen confetti and star burst animation for success states.              |
| `Mascot`             | `src/frontend/src/components/Mascot.tsx`             | "Pip" the mascot — TTS support, animations, and interactive states.            |

### Game Logic Modules

Reusable pure-function modules extracted from game pages:

| Module                | File                                            | Exports                                                                                                        | Used By                                         |
| --------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `fingerCounting`      | `src/frontend/src/games/fingerCounting.ts`      | `countExtendedFingersFromLandmarks` — heuristic finger counting for kids                                       | Finger Number Show                              |
| `musicPinchLogic`     | `src/frontend/src/games/musicPinchLogic.ts`     | `getLaneFromNormalizedX`, `pickNextLane`                                                                       | Music Pinch Beat                                |
| `steadyHandLogic`     | `src/frontend/src/games/steadyHandLogic.ts`     | `updateHoldProgress` (linear progress + decay), `pickTargetPoint`                                              | Steady Hand Lab                                 |
| `targetPracticeLogic` | `src/frontend/src/games/targetPracticeLogic.ts` | `isPointInCircle`, `pickRandomPoint`, `pickSpacedPoints` (collision-aware)                                     | Shape Pop, Color Match Garden, Number Tap Trail |
| `hitTarget`           | `src/frontend/src/games/hitTarget.ts`           | `findHitTarget` — generic circular hit detection                                                               | Number Tap Trail, Shape Sequence, Word Builder  |
| `wordBuilderLogic`    | `src/frontend/src/games/wordBuilderLogic.ts`    | `pickWordForLevel`, `createLetterTargets`, `WORD_LISTS`                                                        | Word Builder                                    |
| `emojiMatchLogic`     | `src/frontend/src/games/emojiMatchLogic.ts`     | `buildRound`, `EMOTIONS`                                                                                       | Emoji Emotion Match                             |
| `airCanvasLogic`      | `src/frontend/src/games/airCanvasLogic.ts`      | `createStroke`, `addPointToStroke`, `detectShake`, `getBrushConfig`, `nextColor`, `nextBrush`, `getRainbowHue` | Air Canvas                                      |
| `mirrorDrawLogic`     | `src/frontend/src/games/mirrorDrawLogic.ts`     | `calculateMatchScore`, `mirrorPoint`, `samplePoints`, `getStars`, `TEMPLATES`, `LEVELS`                        | Mirror Draw                                     |
| `phonicsSoundsLogic`  | `src/frontend/src/games/phonicsSoundsLogic.ts`  | `buildPhonicsRound`, `getPhonemesForLevel`, `PHONEMES`, `LEVELS`                                               | Phonics Sounds                                  |

### Test Coverage

| Test File                                                      | Scope                                             |
| -------------------------------------------------------------- | ------------------------------------------------- |
| `src/frontend/src/games/__tests__/fingerCounting.test.ts`      | Finger counting logic                             |
| `src/frontend/src/games/__tests__/musicPinchLogic.test.ts`     | Music lane logic                                  |
| `src/frontend/src/games/__tests__/steadyHandLogic.test.ts`     | Hold progress/decay                               |
| `src/frontend/src/games/__tests__/targetPracticeLogic.test.ts` | Hit detection, point placement                    |
| `src/frontend/src/games/__tests__/hitTarget.test.ts`           | Generic hit target detection                      |
| `src/frontend/src/games/__tests__/wordBuilderLogic.test.ts`    | Word selection and letter target generation       |
| `src/frontend/src/games/__tests__/emojiMatchLogic.test.ts`     | Emotion round building logic                      |
| `src/frontend/src/games/__tests__/airCanvasLogic.test.ts`      | Stroke management, brush configs, shake detection |
| `src/frontend/src/games/__tests__/mirrorDrawLogic.test.ts`     | Templates, path matching, scoring, symmetry       |
| `src/frontend/src/games/__tests__/phonicsSoundsLogic.test.ts`  | Phoneme data, round building, positioning         |
| `src/frontend/src/pages/__tests__/ConnectTheDots.test.tsx`     | Connect The Dots page                             |
| `src/frontend/src/pages/__tests__/Game.smoke.test.tsx`         | General game smoke tests                          |
| `src/frontend/src/pages/__tests__/Game.pending.test.tsx`       | Pending test cases                                |

---

## Game Details

---

### 1. Alphabet Tracing

|                |                                                             |
| -------------- | ----------------------------------------------------------- |
| **Route**      | `/games/alphabet-tracing`                                   |
| **Age Range**  | 3–6                                                         |
| **Category**   | Literacy / Handwriting                                      |
| **Difficulty** | Adaptive per language                                       |
| **Status**     | ✅ Complete (routed)                                        |
| **Source**     | `src/frontend/src/pages/alphabet-game/AlphabetGamePage.tsx` |
| **Re-export**  | `src/frontend/src/pages/AlphabetGame.tsx`                   |

**Learning Objectives:**

- Letter recognition and formation
- Fine motor control through tracing
- Multi-language alphabet exposure

**Input Method:**

- ✋ Hand tracking — finger tracing on canvas
- 🖱️ Mouse fallback

**Game Mechanics:**

- Draw letters by tracing paths with index finger
- Multi-language support: English, Hindi (हिन्दी), Kannada (ಕನ್ನಡ), Telugu (తెలుగు), Tamil (தமிழ்)
- Visual guides show stroke order and direction

**Key Dependencies:**

- `useHandTracking`, `useHandTrackingRuntime`
- Canvas-based drawing system

**Test Coverage:** Smoke tests only (`Game.smoke.test.tsx`)

---

### 2. Finger Number Show

|                |                                               |
| -------------- | --------------------------------------------- |
| **Route**      | `/games/finger-number-show`                   |
| **Age Range**  | 3–6                                           |
| **Category**   | Numeracy                                      |
| **Difficulty** | 4 levels                                      |
| **Status**     | ✅ Complete (routed)                          |
| **Source**     | `src/frontend/src/games/FingerNumberShow.tsx` |

**Learning Objectives:**

- Number recognition (0–20)
- One-to-one correspondence
- Fine motor control (extending specific fingers)

**Input Method:**

- ✋ Hand tracking — hold up fingers to show a number
- Uses `countExtendedFingersFromLandmarks` from `fingerCounting.ts`

**Game Mechanics:**

- **Level 1:** Numbers 0–2 (single hand, simple)
- **Level 2:** Numbers 0–5 (single hand, full range)
- **Level 3:** Numbers 0–10 (single hand, extended)
- **Duo Mode:** Numbers 0–20 (two hands required)
- App prompts a target number; child holds up that many fingers
- Visual feedback confirms correct count

**Key Dependencies:**

- `useHandTracking`, `useHandTrackingRuntime`
- `fingerCounting.ts` → `countExtendedFingersFromLandmarks`
- Sub-components: `FingerNumberShowHud.tsx`, `FingerNumberShowMenu.tsx`

**Test Coverage:** `fingerCounting.test.ts` (unit tests for counting logic)

---

### 3. Connect The Dots

|                |                                             |
| -------------- | ------------------------------------------- |
| **Route**      | `/games/connect-the-dots`                   |
| **Age Range**  | 3–7                                         |
| **Category**   | Motor Skills / Numeracy                     |
| **Difficulty** | 3 levels (Easy / Medium / Hard)             |
| **Status**     | ✅ Complete (routed)                        |
| **Source**     | `src/frontend/src/pages/ConnectTheDots.tsx` |

**Learning Objectives:**

- Number sequence recognition
- Fine motor control and hand-eye coordination
- Shape recognition (completed patterns)

**Input Method:**

- ✋ Hand tracking — pinch gesture to connect
- 🖱️ Mouse click fallback

**Game Mechanics:**

- Connect numbered dots in ascending order (1, 2, 3…)
- 5 levels per difficulty setting
- 60-second timer per level
- 3 difficulty modes affect dot count and spacing

**Key Dependencies:**

- `useHandTracking`, `useHandTrackingRuntime`
- Canvas-based dot/line rendering

**Test Coverage:** `ConnectTheDots.test.tsx` (page-level tests)

---

### 4. Letter Hunt

|                |                                         |
| -------------- | --------------------------------------- |
| **Route**      | `/games/letter-hunt`                    |
| **Age Range**  | 4–7                                     |
| **Category**   | Literacy                                |
| **Difficulty** | 3 levels                                |
| **Status**     | ✅ Complete (routed)                    |
| **Source**     | `src/frontend/src/pages/LetterHunt.tsx` |

**Learning Objectives:**

- Letter recognition across multiple scripts
- Visual scanning and discrimination
- Quick decision-making

**Input Method:**

- ✋ Hand tracking — cursor control + pinch to select
- 🖱️ Mouse fallback

**Game Mechanics:**

- Find the target letter from 5 options displayed on screen
- 30 seconds per round
- 10 rounds per level, 3 levels total
- Multilingual support via `getAlphabet` utility
- Score based on speed and accuracy

**Key Dependencies:**

- `useHandTracking`, `useHandTrackingRuntime`
- `getAlphabet` (multilingual letter sets)

**Test Coverage:** Smoke tests only

---

### 5. Music Pinch Beat

|                |                                             |
| -------------- | ------------------------------------------- |
| **Route**      | `/games/music-pinch-beat`                   |
| **Age Range**  | 4–8                                         |
| **Category**   | Rhythm / Music                              |
| **Difficulty** | Progressive (streak-based)                  |
| **Status**     | ✅ Complete (routed)                        |
| **Source**     | `src/frontend/src/pages/MusicPinchBeat.tsx` |

**Learning Objectives:**

- Rhythm and timing
- Indian musical notes (Sa, Re, Ga)
- Hand-eye coordination

**Input Method:**

- ✋ Hand tracking — pinch gesture on the correct lane

**Game Mechanics:**

- 3 lanes corresponding to musical notes: Sa, Re, Ga
- Notes scroll toward the player; pinch on the glowing lane to hit
- Streak-based scoring — celebration every 5 consecutive hits
- Uses `musicPinchLogic.ts` for lane detection and note selection

**Key Dependencies:**

- `useHandTracking`, `useHandTrackingRuntime`
- `musicPinchLogic.ts` → `getLaneFromNormalizedX`, `pickNextLane`
- `useSoundEffects`
- `CelebrationOverlay`

**Test Coverage:** `musicPinchLogic.test.ts` (lane logic unit tests)

---

### 6. Steady Hand Lab

|                |                                            |
| -------------- | ------------------------------------------ |
| **Route**      | `/games/steady-hand-lab`                   |
| **Age Range**  | 4–8                                        |
| **Category**   | Motor Skills / Focus                       |
| **Difficulty** | Progressive (round-based)                  |
| **Status**     | ✅ Complete (routed)                       |
| **Source**     | `src/frontend/src/pages/SteadyHandLab.tsx` |

**Learning Objectives:**

- Hand steadiness and fine motor control
- Focus and concentration
- Spatial awareness

**Input Method:**

- ✋ Hand tracking — hold fingertip inside target ring

**Game Mechanics:**

- A target ring appears on screen; hold index fingertip inside it
- Progress bar fills linearly while inside the ring
- Progress decays when fingertip leaves the ring
- Celebration every 5 rounds completed
- Uses `steadyHandLogic.ts` for progress/decay math

**Key Dependencies:**

- `useHandTracking`, `useHandTrackingRuntime`
- `steadyHandLogic.ts` → `updateHoldProgress`, `pickTargetPoint`
- `CelebrationOverlay`

**Test Coverage:** `steadyHandLogic.test.ts` (progress/decay unit tests)

---

### 7. Shape Pop

|                |                                       |
| -------------- | ------------------------------------- |
| **Route**      | `/games/shape-pop`                    |
| **Age Range**  | 3–6                                   |
| **Category**   | Shapes / Motor Skills                 |
| **Difficulty** | Single mode                           |
| **Status**     | ✅ Complete (routed)                  |
| **Source**     | `src/frontend/src/pages/ShapePop.tsx` |

**Learning Objectives:**

- Shape recognition (circle, triangle, square, diamond, star)
- Hand-eye coordination
- Reaction speed

**Input Method:**

- ✋ Hand tracking — pinch inside shapes to pop them

**Game Mechanics:**

- Shapes appear on screen: ◯ △ □ ◇ ☆
- Pinch inside a shape to pop it and earn points
- 60-second timed game
- Celebration every 120 points
- Uses `targetPracticeLogic.ts` for hit detection and placement

**Key Dependencies:**

- `useHandTracking`, `useHandTrackingRuntime`
- `targetPracticeLogic.ts` → `isPointInCircle`, `pickSpacedPoints`
- `CelebrationOverlay`

**Test Coverage:** `targetPracticeLogic.test.ts` (shared logic tests)

---

### 8. Color Match Garden

|                |                                               |
| -------------- | --------------------------------------------- |
| **Route**      | `/games/color-match-garden`                   |
| **Age Range**  | 3–6                                           |
| **Category**   | Colors                                        |
| **Difficulty** | Single mode                                   |
| **Status**     | ✅ Complete (routed)                          |
| **Source**     | `src/frontend/src/pages/ColorMatchGarden.tsx` |

**Learning Objectives:**

- Color recognition and naming
- Visual discrimination
- Following instructions

**Input Method:**

- ✋ Hand tracking — pinch the matching flower

**Game Mechanics:**

- 3 flowers displayed, each a different color
- App asks "Find the [color] flower!" — pinch the correct one
- 6 colors: Red, Blue, Green, Yellow, Pink, Purple
- 75-second timer
- Streak-based scoring — combos for consecutive correct answers
- Uses `targetPracticeLogic.ts` for hit detection

**Key Dependencies:**

- `useHandTracking`, `useHandTrackingRuntime`
- `targetPracticeLogic.ts`
- `useSoundEffects`
- `CelebrationOverlay`

**Test Coverage:** `targetPracticeLogic.test.ts` (shared logic tests)

---

### 9. Number Tap Trail

|                |                                             |
| -------------- | ------------------------------------------- |
| **Route**      | `/games/number-tap-trail`                   |
| **Age Range**  | 4–7                                         |
| **Category**   | Numeracy / Sequencing                       |
| **Difficulty** | 6 levels                                    |
| **Status**     | ✅ Complete (routed)                        |
| **Source**     | `src/frontend/src/pages/NumberTapTrail.tsx` |

**Learning Objectives:**

- Number sequence and ordering
- Counting skills
- Visual scanning

**Input Method:**

- ✋ Hand tracking — pinch numbers in order

**Game Mechanics:**

- Numbers scattered on screen; pinch them in ascending order (1, 2, 3…)
- 6 levels with increasing difficulty
- 90-second timer
- Number count per level: `4 + level` (max 9)
- Uses `hitTarget.ts` for hit detection and `targetPracticeLogic.ts` for placement

**Key Dependencies:**

- `useHandTracking`, `useHandTrackingRuntime`
- `hitTarget.ts` → `findHitTarget`
- `targetPracticeLogic.ts` → `pickSpacedPoints`
- `CelebrationOverlay`

**Test Coverage:** `hitTarget.test.ts`, `targetPracticeLogic.test.ts`

---

### 10. Shape Sequence

|                |                                            |
| -------------- | ------------------------------------------ |
| **Route**      | `/games/shape-sequence`                    |
| **Age Range**  | 4–8                                        |
| **Category**   | Memory / Shapes                            |
| **Difficulty** | 6 levels                                   |
| **Status**     | ✅ Complete (routed)                       |
| **Source**     | `src/frontend/src/pages/ShapeSequence.tsx` |

**Learning Objectives:**

- Visual memory and recall
- Shape recognition
- Sequential ordering

**Input Method:**

- ✋ Hand tracking — pinch shapes in remembered order

**Game Mechanics:**

- A sequence of shapes is shown briefly (◯ □ △ ◇ ☆ ✦)
- Player must pinch shapes in the exact order shown
- 6 levels — sequence length increases per level
- 80-second timer
- 6 distinct shapes available
- Uses `hitTarget.ts` for selection detection

**Key Dependencies:**

- `useHandTracking`, `useHandTrackingRuntime`
- `hitTarget.ts` → `findHitTarget`
- `CelebrationOverlay`

**Test Coverage:** `hitTarget.test.ts` (shared logic tests)

---

### 11. Yoga Animals

|                |                                          |
| -------------- | ---------------------------------------- |
| **Route**      | `/games/yoga-animals`                    |
| **Age Range**  | 4–8                                      |
| **Category**   | Movement / Body Awareness                |
| **Difficulty** | Single mode                              |
| **Status**     | ✅ Complete (routed)                     |
| **Source**     | `src/frontend/src/pages/YogaAnimals.tsx` |

**Learning Objectives:**

- Body awareness and coordination
- Animal recognition
- Balance and flexibility
- Following visual instructions

**Input Method:**

- 🧍 Full-body pose tracking via MediaPipe `PoseLandmarker`

**Game Mechanics:**

- 6 animal poses: Lion 🦁, Cat 🐱, Tree 🌳, Dog 🐕, Frog 🐸, Bird 🐦
- Child copies the shown animal pose using their full body
- 70% match threshold to pass
- Must hold the pose for 2 seconds
- Visual overlay shows expected pose vs. current body position

**Key Dependencies:**

- MediaPipe `PoseLandmarker` (not `HandLandmarker`)
- Custom pose matching algorithms
- `CelebrationOverlay`

**Test Coverage:** No dedicated tests

---

### 12. Freeze Dance

|                |                                          |
| -------------- | ---------------------------------------- |
| **Route**      | `/games/freeze-dance`                    |
| **Age Range**  | 3–7                                      |
| **Category**   | Movement / Listening                     |
| **Difficulty** | Progressive (3 phases)                   |
| **Status**     | ✅ Complete (routed)                     |
| **Source**     | `src/frontend/src/pages/FreezeDance.tsx` |

**Learning Objectives:**

- Impulse control (freeze on command)
- Rhythm and movement
- Listening skills
- Hand coordination (finger challenges)

**Input Method:**

- 🧍 Pose tracking for body movement detection
- ✋ Hand tracking for finger challenges (after round 3)
- 🔊 Text-to-Speech (TTS) for instructions

**Game Mechanics:**

- 3 phases per round:
  1. **Dancing** — music plays, child dances freely
  2. **Freezing** — music stops, child must freeze (movement detected = penalty)
  3. **Finger Challenge** — (after round 3) hold up a specific number of fingers
- Uses `PoseLandmarker` to detect body motion magnitude
- TTS announces phase transitions

**Key Dependencies:**

- MediaPipe `PoseLandmarker` + `HandLandmarker`
- `fingerCounting.ts` (for finger challenges)
- Web Speech API (TTS)
- `CelebrationOverlay`

**Test Coverage:** No dedicated tests

---

### 13. Simon Says

|                |                                           |
| -------------- | ----------------------------------------- |
| **Route**      | `/games/simon-says`                       |
| **Age Range**  | 4–8                                       |
| **Category**   | Movement / Listening                      |
| **Difficulty** | Classic + Combo modes                     |
| **Status**     | ⚠️ Routed; reliability remediation queued |
| **Source**     | `src/frontend/src/pages/SimonSays.tsx`    |

**Learning Objectives:**

- Body part identification
- Following instructions
- Impulse control ("Simon Says" vs. no prefix)
- Gross motor coordination

**Input Method:**

- 🧍 Pose tracking via MediaPipe `PoseLandmarker`
- ✋ Optional hand counting in Combo mode via `useGameHandTracking`
- ⚠️ No documented touch/mouse fallback in current implementation

**Game Mechanics:**

- Actions: Touch Head, Wave, Arms Up, Hands On Hips, T-Rex Arms, Touch Shoulders
- App shows an action; child performs it with their body
- 100 points per correctly detected pose
- Must hold the pose for 2 seconds for it to count
- Pose detection via landmark position analysis

**Audit Note (2026-02-28):**

- `Wave` and `T-Rex Arms` are currently configured but not scored by the pose matcher.
- “Only if Simon says” copy is present, but inverse-command rule logic is not yet implemented.
- See: `docs/audit/src__frontend__src__pages__SimonSays.md` (Addendum 2026-02-28, Unit-1..Unit-3).

**Key Dependencies:**

- MediaPipe `PoseLandmarker`
- Custom pose detection for each action
- `CelebrationOverlay`

**Test Coverage:** No dedicated tests

---

### 14. Virtual Chemistry Lab

|                |                                                  |
| -------------- | ------------------------------------------------ |
| **Route**      | `/games/chemistry-lab`                           |
| **Age Range**  | 5–8                                              |
| **Category**   | Science / Exploration                            |
| **Difficulty** | Open-ended                                       |
| **Status**     | ✅ Complete (routed)                             |
| **Source**     | `src/frontend/src/pages/VirtualChemistryLab.tsx` |

**Learning Objectives:**

- Basic chemistry concepts (reactions, mixing)
- Cause and effect
- Scientific exploration and experimentation
- Discovery-based learning

**Input Method:**

- ✋ Hand tracking — pinch gesture for pouring

**Game Mechanics:**

- Available chemicals: Water, Vinegar, Baking Soda, Color Dyes, Oil, Soap
- 5 discoverable reactions
- Pinch gesture simulates pouring one chemical into another
- **Discovery Book** tracks found reactions (persistent progress)
- Open-ended exploration — no timer, no score

**Key Dependencies:**

- `useHandTracking`, `useHandTrackingRuntime`
- Custom reaction logic
- Discovery Book UI

**Test Coverage:** No dedicated tests

---

### 15. Word Builder

|                |                                          |
| -------------- | ---------------------------------------- |
| **Route**      | `/games/word-builder`                    |
| **Age Range**  | 3–7                                      |
| **Category**   | Literacy / Phonics                       |
| **Difficulty** | 3 levels                                 |
| **Status**     | ✅ Complete (routed)                     |
| **Source**     | `src/frontend/src/pages/WordBuilder.tsx` |

**Learning Objectives:**

- Letter recognition and identification
- Word spelling and phonics
- Sequential ordering of letters
- Vocabulary building (3–5 letter words)

**Input Method:**

- ✋ Hand tracking — pinch letters in correct order

**Game Mechanics:**

- A target word is displayed (e.g., "CAT"); child pinches letters in order: C → A → T
- 3 levels with progressive word difficulty:
  - Level 1: 3-letter words (CAT, DOG, SUN, etc.)
  - Level 2: 4-letter words (FISH, BIRD, STAR, etc.)
  - Level 3: 5-letter words (APPLE, HOUSE, TIGER, etc.)
- Distractor letters added to increase challenge
- 90-second timer
- 15 points per correct letter + time bonus on word completion
- Visual progress bar showing spelled letters
- Uses `hitTarget.ts` for hit detection and `wordBuilderLogic.ts` for word selection and letter placement

**Key Dependencies:**

- `useHandTracking`, `useHandTrackingRuntime`
- `wordBuilderLogic.ts` → `pickWordForLevel`, `createLetterTargets`
- `hitTarget.ts` → `findHitTarget`
- `CelebrationOverlay`

**Test Coverage:** `wordBuilderLogic.test.ts`, `hitTarget.test.ts`

---

### 16. Emoji Emotion Match

|                |                                         |
| -------------- | --------------------------------------- |
| **Route**      | `/games/emoji-match`                    |
| **Age Range**  | 3–7                                     |
| **Category**   | Social-Emotional Learning               |
| **Difficulty** | 3 levels                                |
| **Status**     | ✅ Complete (routed)                    |
| **Source**     | `src/frontend/src/pages/EmojiMatch.tsx` |

**Learning Objectives:**

- Emotion recognition and naming
- Social-emotional vocabulary building
- Visual discrimination between facial expressions
- Empathy development

**Input Method:**

- ✋ Hand tracking — pinch the correct emoji face

**Game Mechanics:**

- 4 emoji faces displayed on screen (😊 😢 😠 😲 😨 🤪 😴 🥰)
- App prompts an emotion name (e.g., "Find: Happy"); child pinches the matching emoji
- 10 rounds per session
- 20 seconds per round (timer resets each round)
- Streak scoring: 10 + min(15, streak × 3) per correct answer
- Celebration every 5 correct streaks
- 8 emotions: Happy, Sad, Angry, Surprised, Scared, Silly, Sleepy, Love
- Uses `emojiMatchLogic.ts` for round generation and `isPointInCircle` for hit detection

**Key Dependencies:**

- `useHandTracking`, `useHandTrackingRuntime`
- `emojiMatchLogic.ts` → `buildRound`, `EMOTIONS`
- `targetPracticeLogic.ts` → `isPointInCircle`
- `CelebrationOverlay`

**Test Coverage:** `emojiMatchLogic.test.ts`

---

## Game Categories

| Category             | Games                                                  |
| -------------------- | ------------------------------------------------------ |
| **Literacy**         | Alphabet Tracing, Letter Hunt, Word Builder            |
| **Numeracy**         | Finger Number Show, Connect The Dots, Number Tap Trail |
| **Shapes**           | Shape Pop, Shape Sequence                              |
| **Colors**           | Color Match Garden                                     |
| **Motor Skills**     | Connect The Dots, Steady Hand Lab, Shape Pop           |
| **Memory**           | Shape Sequence                                         |
| **Rhythm / Music**   | Music Pinch Beat                                       |
| **Movement / Body**  | Yoga Animals, Freeze Dance, Simon Says                 |
| **Social-Emotional** | Emoji Emotion Match                                    |
| **Science**          | Virtual Chemistry Lab                                  |
| **Creativity**       | Air Canvas, Mirror Draw                                |

## Input Method Summary

| Method              | Technology                     | Games Using It                                  |
| ------------------- | ------------------------------ | ----------------------------------------------- |
| **Hand Tracking**   | MediaPipe `HandLandmarker`     | All except Yoga Animals, Simon Says             |
| **Pose Tracking**   | MediaPipe `PoseLandmarker`     | Yoga Animals, Freeze Dance, Simon Says          |
| **Finger Counting** | Custom heuristic on landmarks  | Finger Number Show, Freeze Dance                |
| **Pinch Detection** | Thumb-index distance threshold | Most hand-tracking games                        |
| **Mouse Fallback**  | Standard DOM events            | Alphabet Tracing, Connect The Dots, Letter Hunt |

---

_Last updated: 2026-02-22_
