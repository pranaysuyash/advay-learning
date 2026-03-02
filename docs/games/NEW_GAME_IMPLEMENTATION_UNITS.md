# Game Implementation Units

This document outlines the implementation work required for each proposed game, organized by priority.

---

## COMPLETED

### ✅ Pop the Number (Priority 1)

**Status**: Complete - 2026-03-02

**Files created:**
- `src/frontend/src/games/popTheNumberLogic.ts`
- `src/frontend/src/pages/PopTheNumber.tsx`

**Files modified:**
- `src/frontend/src/App.tsx` - Added route `/games/pop-the-number`
- `src/frontend/src/data/gameRegistry.ts` - Added registry entry

**Mechanics:**
- Numbers 1-N appear as bubbles in random positions
- Player taps them in sequential order (1→2→3...)
- Timer adds pressure
- Score based on correct taps + time bonus

---

### ✅ Color Splash (Priority 1)

**Status**: Complete - 2026-03-02

**Files created:**
- `src/frontend/src/games/colorSplashLogic.ts`
- `src/frontend/src/pages/ColorSplash.tsx`

**Files modified:**
- `src/frontend/src/App.tsx` - Added route `/games/color-splash`
- `src/frontend/src/data/gameRegistry.ts` - Added registry entry

**Mechanics:**
- Objects of different colors appear on screen
- Player taps only objects of the target color
- Score based on correct taps

---

### ✅ Rainbow Bridge (Priority 1)

**Status**: Complete - 2026-03-02

**Files created:**
- `src/frontend/src/games/rainbowBridgeLogic.ts`
- `src/frontend/src/pages/RainbowBridge.tsx`

**Files modified:**
- `src/frontend/src/App.tsx` - Added route `/games/rainbow-bridge`
- `src/frontend/src/data/gameRegistry.ts` - Added registry entry

**Mechanics:**
- Numbered dots arranged in arc pattern
- Player taps dots in sequential order (1→2→3...)
- Each connection reveals rainbow colors (ROYGBIV)
- Timer and score tracking

---

### ✅ Beat Bounce (Priority 1)

**Status**: Complete - 2026-03-02

**Files created:**
- `src/frontend/src/games/beatBounceLogic.ts`
- `src/frontend/src/pages/BeatBounce.tsx`

**Files modified:**
- `src/frontend/src/App.tsx` - Added route `/games/beat-bounce`
- `src/frontend/src/data/gameRegistry.ts` - Added registry entry

**Mechanics:**
- Ball bounces with physics, player taps at beat
- BPM synced timing windows (perfect/good/miss)
- Combo system for consecutive hits
- Multiple balls at higher levels

---

### ✅ Bubble Count (Priority 1)

**Status**: Complete - 2026-03-02

**Files created:**
- `src/frontend/src/games/bubbleCountLogic.ts`
- `src/frontend/src/pages/BubbleCount.tsx`

**Files modified:**
- `src/frontend/src/App.tsx` - Added route `/games/bubble-count`
- `src/frontend/src/data/gameRegistry.ts` - Added registry entry

**Mechanics:**
- Groups of bubbles appear on screen
- Question asks for specific number count
- Player selects the correct group
- Multiple rounds with scoring

---

### ✅ Feed the Monster (Priority 1)

**Status**: Complete - 2026-03-02

**Files created:**
- `src/frontend/src/games/feedTheMonsterLogic.ts`
- `src/frontend/src/pages/FeedTheMonster.tsx`

**Files modified:**
- `src/frontend/src/App.tsx` - Added route `/games/feed-the-monster`
- `src/frontend/src/data/gameRegistry.ts` - Added registry entry

**Mechanics:**
- Monster shows emotion, player selects matching food
- Category pairing (happy/sad/calm/excited/angry → food)
- Combo system, timer, rounds

---

### ✅ Shape Stacker (Priority 1)

**Status**: Complete - 2026-03-02

**Files created:**
- `src/frontend/src/games/shapeStackerLogic.ts`
- `src/frontend/src/pages/ShapeStacker.tsx`

**Files modified:**
- `src/frontend/src/App.tsx` - Added route `/games/shape-stacker`
- `src/frontend/src/data/gameRegistry.ts` - Added registry entry

**Mechanics:**
- Shapes fall from top, player taps to match target slots
- Match by shape type AND color
- Timer-based scoring

---

## Priority 1: Quick Wins (1-2 hours each)

### Unit 1.1: Pop the Number

**Goal**: Numbers appear in bubbles, tap in sequential order (1→2→3...)

**Files to create:**
- `src/frontend/src/games/popTheNumberLogic.ts` - Pure game logic
- `src/frontend/src/pages/PopTheNumber.tsx` - Game page

**Files to modify:**
- `src/frontend/src/App.tsx` - Add route
- `src/frontend/src/data/gameRegistry.ts` - Add registry entry

**Data structures:**
```typescript
interface NumberBubble {
  id: number;
  value: number;
  x: number;
  y: number;
}

interface Level {
  id: number;
  numberRange: number; // e.g., 5 = numbers 1-5
  timeLimit: number;
}
```

**Key functions:**
- `generateBubbles(level, count)` - Random positions
- `checkSequence(bubbles, tapped)` - Validate tap order

**Risk**: Low - reuses numberBubblePop patterns

---

### Unit 1.2: Color Splash

**Goal**: Tap all objects of target color to splash them

**Files to create:**
- `src/frontend/src/games/colorSplashLogic.ts`
- `src/frontend/src/pages/ColorSplash.tsx`

**Files to modify:**
- `src/frontend/src/App.tsx`
- `src/frontend/src/data/gameRegistry.ts`

**Key functions:**
- `generateScene(level)` - Objects with colors
- `checkSplash(objects, targetColor)` - All matched

**Risk**: Low - reuses colorSortGameLogic

---

### Unit 1.3: Rainbow Bridge

**Goal**: Tap numbered dots in order to reveal rainbow

**Files to create:**
- `src/frontend/src/games/rainbowBridgeLogic.ts`
- `src/frontend/src/pages/RainbowBridge.tsx`

**Key functions:**
- `generateDots(count)` - Numbered dot positions
- `checkConnection(dot1, dot2)` - Sequential validation

**Risk**: Low - reuses pathFollowingLogic

---

## Priority 2: Medium Effort (2-4 hours each)

### Unit 2.1: Beat Bounce

**Goal**: Tap ball on bounce to musical beat

**Files to create:**
- `src/frontend/src/games/beatBounceLogic.ts`
- `src/frontend/src/pages/BeatBounce.tsx`

**Key functions:**
- `calculateBounceY(velocity, time)` - Physics
- `checkBeatTiming(bounceY, tapTime, bpm)` - Scoring
- `generateBeatPattern(bpm)` - Visual markers

**Dependencies:**
- Uses rhythmTapLogic for BPM calculations

**Risk**: Medium - new physics for bouncing

---

### Unit 2.2: Fishing Math

**Goal**: Solve math problem, catch fish with correct answer

**Files to create:**
- `src/frontend/src/games/fishingMathLogic.ts`
- `src/frontend/src/pages/FishingMath.tsx`

**Key functions:**
- `generateProblem(level)` - From mathMonstersLogic
- `spawnFish(problem, correctAnswer)` - Answers on fish
- `checkCatch(fish, problem)` - Validation

**Dependencies:**
- Reuses mathMonstersLogic for problem generation

**Risk**: Medium - new fishing mechanics

---

### Unit 2.3: Train Sequence

**Goal**: Arrange train cars in order (engine→caboose)

**Files to create:**
- `src/frontend/src/games/trainSequenceLogic.ts`
- `src/frontend/src/pages/TrainSequence.tsx`

**Key functions:**
- `generateCars(level)` - Cars with order
- `validateOrder(selected, correct)` - Sequence check

**Dependencies:**
- Reuses storySequenceLogic

**Risk**: Low - direct adaptation

---

### Unit 2.4: Petal Catch

**Goal**: Catch falling petals in basket

**Files to create:**
- `src/frontend/src/games/petalCatchLogic.ts`
- `src/frontend/src/pages/PetalCatch.tsx`

**Key functions:**
- `spawnPetal()` - Random position at top
- `updatePositions(petals, wind)` - Gravity + drift
- `checkCatch(petal, basket)` - Collision

**Dependencies:**
- Reuses letterCatcherLogic

**Risk**: Low - simple adaptation

---

## Priority 3: Higher Effort (4+ hours each)

### Unit 3.1: Shape Stacker

**Goal**: Drag falling shapes to matching outlines

**Files to create:**
- `src/frontend/src/games/shapeStackerLogic.ts`
- `src/frontend/src/pages/ShapeStacker.tsx`

**Key functions:**
- `spawnShape(level)` - Random shape at top
- `applyGravity(shape)` - Falling physics
- `checkStack(shape, outline)` - Match detection

**Dependencies:**
- Matter.js from colorSortLogic

**Risk**: High - 2D physics needed

---

### Unit 3.2: Number Bowling

**Goal**: Swipe to roll ball, knock down numbered pins

**Files to create:**
- `src/frontend/src/games/numberBowlingLogic.ts`
- `src/frontend/src/pages/NumberBowling.tsx`

**Key functions:**
- `trackSwipe(start, end)` - Velocity calculation
- `calculatePinFall(velocity, pinPosition)` - Physics
- `scoreRound(pins, frame)` - Bowling scoring

**Dependencies:**
- Swipe from fruitNinjaAirLogic

**Risk**: High - custom physics

---

### Unit 3.3: Dance Pattern

**Goal**: Watch dance sequence, repeat poses in order

**Files to create:**
- `src/frontend/src/games/dancePatternLogic.ts`
- `src/frontend/src/pages/DancePattern.tsx`

**Key functions:**
- `generateSequence(length)` - Random moves
- `showDemo(moves)` - Animation playback
- `comparePose(user, target)` - From followTheLeaderLogic

**Dependencies:**
- Uses followTheLeaderLogic pose matching

**Risk**: Medium - UI for sequences

---

### Unit 3.4: Shadow Match

**Goal**: Match hand shadow to silhouette

**Files to create:**
- `src/frontend/src/games/shadowMatchLogic.ts`
- `src/frontend/src/pages/ShadowMatch.tsx`

**Key functions:**
- `captureShadow(landmarks)` - Create silhouette
- `matchShadow(shadow, templates)` - Pattern matching
- `showHint(shadow)` - Progressive reveal

**Dependencies:**
- ShadowPuppetLogic, fingerCounting

**Risk**: Medium - new matching algorithm

---

## Priority 4: Content Heavy (Variable)

### Unit 4.1: Sound Match

**Status**: ALREADY EXISTS as Animal Sounds
- Need: Audio file integration
- Add real sounds to animalSoundsLogic

### Unit 4.2: Bug Hunt

**Status**: New game
- Need: Scene backgrounds, bug graphics, hiding algorithm
- 5 scenes × 5 bugs = 25 assets minimum

---

## Shared Improvements Needed

### 1. Fallback Input System
Create generic input handler that abstracts:
- Hand tracking position → game coordinates
- Mouse/touch → same coordinates
- Keyboard → mapped actions

**Location**: `src/frontend/src/hooks/useGameInput.ts` (new)

### 2. Particle Effects Library
Common splash/celebration effects:
- Bubble burst
- Color splash
- Star burst
- Confetti

**Location**: `src/frontend/src/components/game/Particles.tsx` (new)

### 3. Physics Helper
Simplified 2D physics for:
- Gravity
- Bounce
- Collision detection

**Location**: Extend existing utilities

---

## Implementation Order Recommendation

1. **Pop the Number** - Quick win, validates framework
2. **Color Splash** - Quick win, tests particle system
3. **Rainbow Bridge** - Beautiful, uses existing dot logic
4. **Beat Bounce** - Fun, fills rhythm game gap
5. **Petal Catch** - Simple falling object mechanic
6. **Train Sequence** - Reuses StorySequence directly
7. **Fishing Math** - Popular category (math + action)
8. **Shape Stacker** - More complex physics
9. **Number Bowling** - Fun physics challenge
10. **Dance Pattern** - Uses existing pose matching
