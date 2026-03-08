# Bubble Pop Game Specification

**Game ID:** `bubble-pop`
**World:** Learning
**Vibe:** Chill
**Age Range:** 3-8 years
**CV Requirements:** None (uses microphone for blow detection)

---

## Overview

Bubble Pop is an interactive game where children blow into the microphone to pop floating bubbles on screen. The game uses voice/blow input to create a unique cause-and-effect experience.

### Tagline
"Blow into the microphone to pop bubbles! 🫧💨"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Bubbles** - Colorful bubbles float up from the bottom
2. **Blow** - Child blows into the microphone
3. **Pop Bubbles** - Bubbles within "blow radius" pop
4. **Score Points** - Earn points with streak and level multipliers
5. **Level Up** - Every 10 pops or 10 seconds
6. **Repeat** - Continue for 30 seconds

### Controls

| Action | Input |
|--------|-------|
| Pop bubbles | Blow into microphone |
| Start game | Click "Start Blowing!" button |
| Stop game | Click home button or timer ends |

---

## Bubble Colors

### 8 Bubble Colors

| Color | Hex Code |
|-------|----------|
| Red | #FF6B6B |
| Teal | #4ECDC4 |
| Blue | #45B7D1 |
| Green | #96CEB4 |
| Yellow | #FFEAA7 |
| Plum | #DDA0DD |
| Mint | #98D8C8 |
| Gold | #F7DC6F |

### Bubble Properties

```typescript
interface Bubble {
  id: string;          // Unique identifier
  x: number;          // Horizontal position (0-1)
  y: number;          // Vertical position (0-1)
  size: number;       // Size in pixels (30-70 + level bonus)
  color: string;     // Hex color
  speed: number;      // Upward movement speed
  wobble: number;     // Horizontal sway phase
  isPopped: boolean; // Whether bubble has been popped
}
```

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| BLOW_THRESHOLD | 0.12 | Minimum volume to detect blow |
| MIN_BLOW_DURATION | 100ms | Minimum duration for blow |
| BLOW_COOLDOWN | 300ms | Cooldown between blows |
| BASE_POINTS_PER_BUBBLE | 10 | Base score per bubble |
| COMBO_BONUS_PER_EXTRA_BUBBLE | 5 | Bonus for additional bubbles |
| LEVEL_ADVANCE_POPS | 10 | Pops needed for level up |
| LEVEL_ADVANCE_TIME_SECONDS | 10 | Time for auto level up |
| MAX_LEVEL | 10 | Maximum level |
| BASE_BUBBLE_SPEED | 0.002 | Base upward speed |
| GAME_DURATION_SECONDS | 30 | Total game time |
| BASE_HIT_RADIUS | 0.15 | Base hit detection radius |

---

## Scoring System

### Score Calculation

```typescript
baseScore = bubblesPopped × BASE_POINTS_PER_BUBBLE × level;
comboBonus = max(0, (bubblesPopped - 1) × COMBO_BONUS_PER_EXTRA_BUBBLE);
finalScore = baseScore + comboBonus;
```

### Score Examples by Level

| Popped | Level 1 | Level 2 | Level 5 |
|--------|---------|---------|---------|
| 1 bubble | 10 | 20 | 50 |
| 2 bubbles | 15 | 30 | 55 |
| 3 bubbles | 20 | 40 | 60 |
| 5 bubbles | 30 | 60 | 80 |

### Level Multiplier

Score scales directly with level number, encouraging progression.

---

## Blow Detection

### Hit Radius Calculation

```typescript
hitRadius = BASE_HIT_RADIUS + (blowVolume × VOLUME_HIT_RADIUS_MULTIPLIER);
// hitRadius = 0.15 + (blowVolume × 0.1)
```

**Examples:**
- Volume 0.2: radius = 0.17
- Volume 0.5: radius = 0.20
- Volume 0.8: radius = 0.23

### Minimum Requirements

| Requirement | Value |
|-------------|-------|
| MIN_HIT_VOLUME | 0.2 |
| BLOW_COOLDOWN | 300ms between blows |

---

## Level Progression

### Level Advancement

Level advances when **either** condition is met:
1. **Pop based:** `poppedCount >= level × 10`
2. **Time based:** `elapsedTime >= level × 10 seconds`

### Level Effects

| Level | Bubble Size | Bubble Speed | Max Bubbles | Spawn Rate |
|-------|-------------|---------------|--------------|-------------|
| 1 | 30-70px | Slow | 6 | 1% per frame |
| 5 | 50-90px | Medium | 10 | 1.25% per frame |
| 10 | 70-110px | Fast | 15 | 1.5% per frame |

---

## Visual Design

### UI Elements

- **Score Display:** Top-right corner
- **Level Display:** Top-right, below score
- **Timer:** Top-left corner (turns red when < 10s)
- **Streak HUD:** 5 hearts (2 points each)
- **Volume Meter:** Bottom, shows blow strength
- **Blow Indicator:** "💨 Blowing detected!" text

### Bubble Rendering

- Circular bubbles with colored background
- White border (2px) with transparency
- Scale-in animation on spawn
- Pop particle effects (rings + sparkles)

### Pop Effects

When bubble pops:
1. Expanding ring effect (bubble color)
2. 4 sparkle particles shooting outward
3. Score popup shows points earned

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Pop bubble | playPop() per bubble | 'success' |
| Streak milestone | None | 'celebration' |
| Game complete | None | 'celebration' |

---

## TTS Messages

| Situation | Message |
|-----------|---------|
| Start | "Let's pop some bubbles! Blow into the microphone!" |
| Level up | "Level X! Bubbles are getting faster!" |
| 10 pops milestone | "X bubbles popped! Great job!" |
| 3+ popped | "Wow! You popped a lot!" |
| Inactive (no pops) | "Try blowing gently into the microphone to pop bubbles!" |
| Returning encouragement | "Keep going! You're doing great!" / "Blow harder to pop more bubbles!" / "Almost there! Keep popping!" |
| Great game (20+) | "Amazing! You popped X bubbles!" |
| Good game | "Great job! You popped X bubbles!" |

---

## Game Constants

```typescript
const BLOW_THRESHOLD = 0.12;
const MIN_BLOW_DURATION = 100;
const BLOW_COOLDOWN = 300;
const BASE_POINTS_PER_BUBBLE = 10;
const COMBO_BONUS_PER_EXTRA_BUBBLE = 5;
const LEVEL_ADVANCE_POPS = 10;
const LEVEL_ADVANCE_TIME_SECONDS = 10;
const MAX_LEVEL = 10;
const BASE_BUBBLE_SPEED = 0.002;
const SPEED_VARIANCE = 0.003;
const WOBBLE_SPEED = 0.05;
const SPAWN_CHANCE_BASE = 0.01;
const SPAWN_CHANCE_PER_LEVEL = 0.005;
const MAX_BUBBLES_BASE = 5;
const GAME_DURATION_SECONDS = 30;
const FRAME_TIME_MS = 16;
const BASE_HIT_RADIUS = 0.15;
const VOLUME_HIT_RADIUS_MULTIPLIER = 0.1;
const MIN_HIT_VOLUME = 0.2;
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `BubblePop.tsx` | 588 | Main component |
| `bubblePopLogic.ts` | 254 | Game logic |
| `bubblePopLogic.test.ts` | 442 | Unit tests (61 tests) |

### Architecture

- **Component** (`BubblePop.tsx`): UI, game loop, microphone handling
- **Logic** (`bubblePopLogic.ts`): Pure functions for game state
- **Tests** (`bubblePopLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Cause and Effect**
   - Blowing creates action
   - Volume affects impact
   - Timing and coordination

2. **Breath Control**
   - Gentle vs. strong blowing
   - Sustained blowing
   - Breath awareness

3. **Color Recognition**
   - Identifying colors
   - Visual tracking
   - Color association

4. **Counting**
   - Score counting
   - Pop counting
   - Progress tracking

5. **Motor Skills**
   - Microphone control
   - Vocalization
   - Coordination

---

## Comparison with Similar Games

| Feature | BubblePop | NumberBubblePop | BalloonPopFitness |
|---------|-----------|-----------------|-------------------|
| Input | Microphone blow | Number tap + blow | Body actions |
| Educational Focus | Breath control | Numbers | Colors + motor |
| Age Range | 3-8 | 4-8 | 4-10 |
| Game Duration | 30s | Varies | 60s |
| Levels | 10 | 3 | 2 |
| Scoring | Level × combo | Number value | Combo × streak |

---

## Test Coverage

### Test Suite: `bubblePopLogic.test.ts`

**61 tests covering:**

*BUBBLE_GAME_CONFIG (7 tests)*
*BUBBLE_COLORS (3 tests)*
*createBubble (5 tests)*
*initializeGame (3 tests)*
*startGame (4 tests)*
*updateBubbles (10 tests)*
*checkBlowHits (10 tests)*
*advanceLevel (3 tests)*
*getStats (4 tests)*
*endGame (3 tests)*
*Game Flow Integration (2 tests)*
*Scoring Mechanics (2 tests)*
*Level Progression (3 tests)*
*Physics Constants (4 tests)*

**All tests passing ✅**

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
