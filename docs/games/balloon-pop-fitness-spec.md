# Balloon Pop Fitness Game Specification

**Game ID:** `balloon-pop-fitness`
**World:** Learning
**Vibe:** Active
**Age Range:** 4-10 years
**CV Requirements:** Pose tracking (full body)

---

## Overview

Balloon Pop Fitness is an active physical movement game where children pop floating balloons using different body actions based on balloon colors. The game uses computer vision to detect when a child performs the correct action to pop each balloon.

### Tagline
"Pop balloons with your body! Move, jump, wave! 🎈💪"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Balloon** - A colored balloon floats up from the bottom
2. **Check Color** - Each color requires a different action
3. **Perform Action** - Child does the physical action
4. **Pop Balloon** - When body part touches balloon, it pops
5. **Score Points** - Earn points with combo multipliers
6. **Repeat** - Continue for 60 seconds across multiple levels

### Controls

| Action | Input |
|--------|-------|
| Pop red balloon | Jump and touch with feet/ankles |
| Pop blue balloon | Wave with raised hand |
| Pop yellow balloon | Clap hands together |
| Start game | Click "Start Popping!" button |
| Back to menu | Click "Back to Menu" button |

---

## Balloon Colors and Actions

### Three Colors → Three Actions

| Color | Action | Body Points Used | Instruction |
|-------|--------|------------------|-------------|
| 🔴 Red | Jump | Ankles/feet (landmarks 27, 28) | Jump and touch! |
| 🔵 Blue | Wave | Wrists (landmarks 15, 16) | Wave your hand! |
| 🟡 Yellow | Clap | Both wrists together | Clap your hands! |

### Data Structure

```typescript
interface Balloon {
  id: string;                    // Unique identifier
  x: number;                    // Normalized horizontal position (0-1)
  y: number;                    // Normalized vertical position (0-1)
  size: number;                 // Normalized size
  color: 'red' | 'blue' | 'yellow';
  speed: number;                // Vertical ascent speed
  action: 'jump' | 'wave' | 'clap';
  popped: boolean;              // Whether balloon has been popped
  createdAt: number;            // Creation timestamp
}
```

---

## Action Detection Algorithms

### Jump Detection

**Condition:** Both ankles are significantly above hips

```typescript
// Landmarks: 23 (left hip), 24 (right hip), 27 (left ankle), 28 (right ankle)
const hipY = (leftHip.y + rightHip.y) / 2;
const ankleY = (leftAnkle.y + rightAnkle.y) / 2;

jumpDetected = ankleY < (hipY - 0.15); // 15cm threshold
```

**Confidence:** 0.8 when detected

---

### Wave Detection

**Condition:** One wrist is significantly raised above shoulders

```typescript
// Landmarks: 11 (left shoulder), 12 (right shoulder), 15 (left wrist), 16 (right wrist)
const shoulderY = Math.min(leftShoulder.y, rightShoulder.y);
leftWristRaised = leftWrist.y < (shoulderY - 0.2);
rightWristRaised = rightWrist.y < (shoulderY - 0.2);

waveDetected = leftWristRaised || rightWristRaised;
```

**Confidence:** 0.75 when detected

---

### Clap Detection

**Condition:** Both hands are close together

```typescript
// Landmarks: 15 (left wrist), 16 (right wrist)
const dx = leftWrist.x - rightWrist.x;
const dy = leftWrist.y - rightWrist.y;
const distance = Math.sqrt(dx * dx + dy * dy);

clapDetected = distance < 0.15; // Maximum distance for clap
```

**Confidence:** `(1 - distance / clapThreshold)` when detected

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| SPAWN_INTERVAL | 2000ms | Time between balloon spawns |
| GAME_DURATION | 60000ms | 60 seconds total game time |
| LEVEL_DURATION | 30000ms | 30 seconds per level (2 levels) |
| COMBO_WINDOW | 2000ms | Time window for combo multiplier |
| BASE_SPEED | 0.0003 | Base upward speed (normalized per ms) |
| SPEED_INCREMENT | 0.00005 | Speed increase per level |
| MAX_BALLOONS | 8 | Maximum balloons on screen |
| POP_THRESHOLD | 0.15 | Distance threshold for collision |
| POINTS_PER_POP | 10 | Base points per balloon |
| COMBO_MULTIPLIER | 1.5× | Multiplier for multiple simultaneous pops |

---

## Level Progression

### Two Levels

| Level | Duration | Speed Increase |
|-------|----------|----------------|
| 1 | 0-30 seconds | Base speed |
| 2 | 30-60 seconds | +1 × SPEED_INCREMENT |

### Advancement Logic

```typescript
const elapsed = GAME_DURATION - gameState.timeRemaining;
const nextLevelThreshold = gameState.level * LEVEL_DURATION;

if (timeRemaining > 0 && elapsed >= nextLevelThreshold) {
  // Advance to next level
}
```

---

## Scoring System

### Score Calculation

```typescript
basePoints = POINTS_PER_POP;  // 10 points per balloon
comboMultiplier = poppedCount > 1 ? 1.5 : 1;

finalScore = basePoints × comboMultiplier;
```

### Combo System

- **Single pop:** 10 points
- **Multiple pops (same frame):** 15 points each (1.5× multiplier)
- **Combo counter:** Tracks consecutive pops for UI display

### Streak System (Separate)

Uses `useStreakTracking` hook with:
- Base points: 15
- Streak bonus: +2 per streak (max +15)
- Total per pop: 15-30 points (independent of game combo)

---

## Visual Design

### Canvas Rendering

**Background:**
- Sky blue gradient (#87CEEB to #E0F7FA)
- Decorative clouds (white semi-transparent circles)

**Balloon Rendering:**
- Ellipse body with color fill
- White highlight ellipse (top-left)
- Brown string with bezier curve
- Small triangle knot at bottom
- Action emoji overlay (🔴🔵🟡)

**UI Elements:**
- Score display in header
- Timer countdown
- Streak indicator with 🔥 emoji
- Combo counter (⚡ Xx)
- Level indicator
- Action text at bottom of screen

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Pop balloon | playPop() | 'success' |
| Multiple pops | playSuccess() | 'success' per pop |
| Streak milestone | None | 'celebration' |
| Level advance | playCelebration() | None |
| Game complete | playCelebration() | None |

---

## Collision Detection

### Algorithm

```typescript
function checkBalloonCollision(
  balloon: Balloon,
  bodyPoint: { x: number; y: number } | null
): boolean {
  if (!bodyPoint || balloon.popped) return false;

  const dx = bodyPoint.x - balloon.x;
  const dy = bodyPoint.y - balloon.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance < (balloon.size + POP_THRESHOLD);
}
```

### Body Points by Action

| Action | Landmarks Used |
|--------|----------------|
| Jump | 27 (left ankle), 28 (right ankle) |
| Wave | 15 (left wrist), 16 (right wrist) |
| Clap | 15 (left wrist), 16 (right wrist) |

---

## Game State

### State Structure

```typescript
interface GameState {
  balloons: Balloon[];        // Active balloons
  score: number;              // Total score
  level: number;              // Current level (1-2)
  timeRemaining: number;      // Time left in milliseconds
  gameActive: boolean;        // Whether game is running
  combo: number;              // Current combo count
  lastPopTime: number;        // Timestamp of last pop
}
```

### States

| State | Description |
|-------|-------------|
| Menu | Show instructions and start button |
| Playing | Active game with balloons spawning |
| Complete | Game over, show final score |

---

## Game Constants

```typescript
const SPAWN_INTERVAL = 2000;           // 2 seconds
const GAME_DURATION = 60000;            // 60 seconds
const LEVEL_DURATION = 30000;           // 30 seconds per level
const COMBO_WINDOW = 2000;              // 2 seconds
const BASE_SPEED = 0.0003;              // Normalized speed
const SPEED_INCREMENT = 0.00005;         // Speed increase per level
const MAX_BALLOONS = 8;                 // Max balloons
const POP_THRESHOLD = 0.15;             // Collision distance
const POINTS_PER_POP = 10;              // Score per pop
const COMBO_MULTIPLIER = 1.5;           // Multiplier for combos
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `BalloonPopFitness.tsx` | 703 | Main component with canvas rendering |
| `balloonPopFitnessLogic.ts` | 412 | Game logic and physics |
| `balloonPopFitnessLogic.test.ts` | 490 | Unit tests (70 tests) |

### Architecture

- **Component** (`BalloonPopFitness.tsx`): UI, canvas rendering, game loop
- **Logic** (`balloonPopFitnessLogic.ts`): Pure functions for balloons, collision, action detection
- **Tests** (`balloonPopFitnessLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Color Recognition**
   - Identifying red, blue, yellow
   - Quick color-based decision making
   - Color-action association

2. **Gross Motor Skills**
   - Jumping (leg strength)
   - Arm waving (shoulder mobility)
   - Clapping (coordination)

3. **Body Awareness**
   - Understanding body position in space
   - Coordinating movements with visual feedback
   - Timing and rhythm

4. **Following Instructions**
   - Color-based rules
   - Quick reaction to visual cues
   - Action selection based on color

5. **Physical Fitness**
   - Cardiovascular exercise
   - Full-body movement
   - Active play

---

## Comparison with Similar Games

| Feature | BalloonPopFitness | SimonSays | FreezeDance |
|---------|-------------------|-----------|-------------|
| CV Required | Pose (full body) | Pose + Hand (combo) | Pose + Hand (combo) |
| Core Mechanic | Pop balloons with actions | Hold specific poses | Hold still when music stops |
| Educational Focus | Colors + motor skills | Body awareness | Self-regulation |
| Age Range | 4-10 | 4-10 | 3-8 |
| Game Duration | 60 seconds (2 levels) | Infinite | Varies |
| Scoring | Points + combo | Points + streak | Stability % |
| Color Coding | Yes (3 colors) | No | No |
| Vibe | Active | Active | Active |

---

## Test Coverage

### Test Suite: `balloonPopFitnessLogic.test.ts`

**70 tests covering:**

*GAME_CONFIG (5 tests):*
1. Has correct spawn interval (2000ms)
2. Has 60 second game duration
3. Has 2 second combo window
4. Has defined balloon colors
5. Maps colors to actions correctly

*generateBalloon (5 tests):*
6. Generates balloon with required properties
7. Generates valid color
8. Assigns correct action based on color
9. Speed increases with level
10. Generates unique IDs

*updateBalloons (4 tests):*
11. Moves balloons upward
12. Removes popped balloons
13. Removes off-screen balloons
14. Keeps valid balloons

*shouldSpawnBalloon (4 tests):*
15. Spawns when interval passed
16. Does not spawn when interval not passed
17. Does not spawn when max balloons reached
18. Spawns when under max and interval passed

*checkBalloonCollision (5 tests):*
19. Detects collision when body point is within threshold
20. Does not detect collision when body point is far
21. Returns false for popped balloon
22. Returns false for null body point
23. Detects collision at edge of threshold

*checkBodyCollisions (4 tests):*
24. Detects collision with any body point
25. Returns false when no points collide
26. Handles null points in array
27. Returns false for all null points

*detectJumpAction (4 tests):*
28. Detects jump when ankles are above hips
29. Does not detect jump when ankles are below hips
30. Returns not detected for insufficient landmarks
31. Handles null landmarks gracefully

*detectWaveAction (4 tests):*
32. Detects wave when left wrist is raised
33. Detects wave when right wrist is raised
34. Does not detect wave when wrists are at shoulder level
35. Returns not detected for insufficient landmarks

*detectClapAction (4 tests):*
36. Detects clap when hands are close together
37. Does not detect clap when hands are far apart
38. Confidence increases as hands get closer
39. Returns not detected for insufficient landmarks

*detectAllActions (2 tests):*
40. Detects all three action types
41. All actions have required properties

*initializeGame (3 tests):*
42. Creates initial game state
43. Accepts custom level
44. Defaults to level 1

*processPops (6 tests):*
45. Pops balloons when matching action detected
46. Does not pop balloon with non-matching action
47. Requires minimum confidence for pop
48. Increases score for popped balloons
49. Applies combo multiplier for multiple pops
50. Combo increases with multiple pops

*updateGameTimer (3 tests):*
51. Decrements time remaining
52. Sets gameActive to false when time reaches zero
53. Never goes below zero

*shouldAdvanceLevel (5 tests):*
54. Does not advance at game start
55. Advances level 1 at the first level boundary
56. Does not advance level 2 before the second boundary
57. Never advances when timer has reached zero
58. Advances after 30 seconds for level 1

*advanceLevel (2 tests):*
59. Increments level
60. Preserves other state

*getActionText (3 tests):*
61. Returns correct text for jump
62. Returns correct text for wave
63. Returns correct text for clap

*getBalloonEmoji (3 tests):*
64. Returns red emoji for red color
65. Returns blue emoji for blue color
66. Returns yellow emoji for yellow color

*calculateFinalStats (2 tests):*
67. Calculates final statistics
68. Handles zero balloons gracefully

*Balloon Actions Mapping (3 tests):*
69. Red balloons require jump action
70. Blue balloons require wave action
71. Yellow balloons require clap action

**All tests passing ✅**

---

## Progress Tracking

### useGameSessionProgress Integration

```typescript
useGameSessionProgress({
  gameName: 'Balloon Pop Fitness',
  score: gameState?.score || 0,
  level: gameState?.level || 1,
  isPlaying: !showMenu && gameState?.gameActive && !isLoading,
});
```

### useGameDrops Integration

```typescript
const { onGameComplete } = useGameDrops('balloon-pop-fitness');

// On game completion
await onGameComplete();
```

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
