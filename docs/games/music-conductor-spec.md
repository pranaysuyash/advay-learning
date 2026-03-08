# Music Conductor Game Specification

**Game ID:** `music-conductor`
**World:** Learning
**Vibe:** Active
**Age Range:** 4-8 years
**CV Requirements:** Hand tracking (optional)

---

## Overview

Music Conductor is a rhythm game where children move their hands down into glowing lanes to hit falling musical notes at the right time. The game teaches rhythm, timing, and hand-eye coordination through music-themed gameplay.

### Tagline
"Move your hands down when the notes fall! 🎵🎼"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Notes** - Colored notes fall from the top of the screen
2. **Wait for Timing** - Notes fall toward the hit bar at the bottom
3. **Move Hand** - When note reaches hit bar, move hand down into the lane
4. **Score Points** - Earn points for timing accuracy
5. **Build Combo** - Chain hits for higher scores
6. **Repeat** - Continue until level duration ends

### Controls

| Action | Input |
|--------|-------|
| Hit note | Move hand down into lane (CV) or tap lane (touch) |
| Keyboard | A (lane 1), S (lane 2), D (lane 3), F (lane 4) |
| Start game | Click "Start Conducting!" button |
| Back | Click "Exit" or "Back to Menu" |

---

## Level Configuration

### 4 Levels

| Level | BPM | Duration | Lanes | Hit Tolerance | Age |
|-------|-----|----------|-------|---------------|-----|
| 1 | 50 | 40s | 2 | 0.25 | 4-6 (easy) |
| 2 | 60 | 45s | 3 | 0.20 | 5-7 |
| 3 | 80 | 60s | 4 | 0.15 | 6-8 (normal) |
| 4 | 100 | 60s | 4 | 0.12 | 6-8 (fast) |

### Lane Colors

4 colors cycle across lanes:
- Red: #FF6B6B
- Teal: #4ECDC4
- Blue: #45B7D1
- Green: #96CEB4

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| HIT_Y | 0.85 | Hit bar position (normalized 0-1) |
| HIT_ZONE_Y | 0.70 | Where hand triggers tap (bottom 30%) |
| NOTE_SPEED | 0.0005 | Note fall speed (normalized per ms) |
| PERFECT_MULTIPLIER | 2x | Score multiplier for perfect timing |
| GOOD_MULTIPLIER | 1x | Score multiplier for good timing |
| MAX_COMBO_MULTIPLIER | 2x | Maximum combo bonus (at 10x combo) |
| COMBO_BONUS_PER_LEVEL | 10% | Score increase per combo level |
| STREAK_MILESTONE | 10 | Celebration interval (streak count) |

---

## Scoring System

### Hit Accuracy

```typescript
distance = |note.y - HIT_Y|

if (distance < tolerance * 0.5) {
  score = 100;  // Perfect hit
} else if (distance < tolerance) {
  score = 50;   // Good hit
} else {
  score = 0;    // Miss
}
```

### Combo Multiplier

```typescript
multiplier = 1 + Math.min(combo, 10) * 0.1;
finalScore = baseScore × multiplier;
```

| Combo | Multiplier | 100pt Hit | 50pt Hit |
|-------|------------|-----------|----------|
| 0 | 1.0x | 100 | 50 |
| 1 | 1.1x | 110 | 55 |
| 5 | 1.5x | 150 | 75 |
| 10+ | 2.0x | 200 | 100 |

### Combo Reset

Combo resets to 0 when:
- Note falls off screen without being hit
- Note is missed (passes hit bar)

---

## Note Generation

### Beat Pattern

```typescript
beatInterval = 60000 / BPM;  // milliseconds

if (elapsedTime - lastNoteTime >= beatInterval) {
  spawnNote();
}
```

### Note Spawning

- **Y position:** 0 (top of screen)
- **Speed:** 0.0005 (normalized per ms)
- **Lane:** Random (0 to lanes - 1)
- **ID:** Timestamp + random

---

## Hit Detection

### Tolerance by Level

| Level | Tolerance | Perfect Range | Good Range |
|-------|-----------|---------------|------------|
| 1 | 0.25 | ±0.125 | ±0.25 |
| 2 | 0.20 | ±0.10 | ±0.20 |
| 3 | 0.15 | ±0.075 | ±0.15 |
| 4 | 0.12 | ±0.06 | ±0.12 |

### Hit Y Position

The hit bar is at `y = 0.85` (85% down the screen).

---

## Visual Design

### UI Elements

- **Score/Combo HUD:** Top-center, semi-transparent
- **Streak Counter:** Top-left, shows when streak > 5
- **Timer:** Top-right, shows remaining time
- **Hit Bar:** White glowing bar at 85% height
- **Lanes:** Vertical columns with color highlights
- **Notes:** Colored circles with music note emoji

### Note Rendering

- 80px × 80px circles
- Lane-colored background
- White music note emoji (🎵)
- Glow effect
- Scale/fade animation on hit

### Lane Feedback

- Lane highlights when tapped
- Color: Lane color + 40% opacity
- Duration: 150ms

---

## Streak System

### Streak Counter

- Tracks consecutive hits
- Displays in top-left when > 5
- Format: "🔥 X STREAK"
- Orange background

### Milestone Celebration

Every 10 streak:
- Full-screen overlay appears
- Shows "🔥 X Streak! 🔥"
- Orange/red gradient background
- 1.2 second display
- Haptic celebration

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Hit note | playClick() | 'success' |
| Miss tap | playPop() | None |
| Combo milestone | None | 'celebration' |
| Game complete | playSuccess() | None |

---

## TTS Messages

| Situation | Message |
|-----------|---------|
| Start | "Let's make some music! Move your hands to the bottom when the notes fall!" |
| Hand detected | "I see your hand! Keep conducting!" |
| Hand lost | "I can't see your hand! Show it to the camera!" |
| Complete | "Incredible! You are a master conductor!" |
| Instructions | "Welcome to Music Conductor! Pick a level and press start conducting!" |

---

## Data Structures

### ConductorNote

```typescript
interface ConductorNote {
  id: number;        // Unique identifier
  lane: number;      // Which lane (0 to lanes-1)
  y: number;         // Vertical position (0-1)
  speed: number;     // Fall speed
  hit: boolean;      // Whether hit by player
}
```

### ConductorLevel

```typescript
interface ConductorLevel {
  id: number;          // Level identifier
  level: number;       // Display level (1-4)
  bpm: number;         // Beats per minute
  duration: number;    // Game length in seconds
  lanes: number;       // Number of lanes (2-4)
  hitTolerance: number; // Hit window size
}
```

---

## Game Constants

```typescript
const HIT_Y = 0.85;
const HIT_ZONE_Y = 0.70;
const NOTE_SPEED = 0.0005;
const MAX_COMBO_MULTIPLIER = 10;
const STREAK_MILESTONE = 10;
const LANE_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `MusicConductor.tsx` | 481 | Main component with game loop |
| `musicConductorLogic.ts` | 87 | Game logic and physics |
| `musicConductorLogic.test.ts` | 350+ | Unit tests (52 tests) |

### Architecture

- **Component** (`MusicConductor.tsx`): UI, hand tracking, game loop, animation, state
- **Logic** (`musicConductorLogic.ts`): Pure functions for notes, scoring, pattern generation
- **Tests** (`musicConductorLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Rhythm & Timing**
   - Beat recognition
   - Timing precision
   - Tempo awareness

2. **Hand-Eye Coordination**
   - Visual tracking
   - Motor planning
   - Spatial awareness

3. **Pattern Recognition**
   - Note patterns
   - Lane associations
   - Sequencing

4. **Focus & Attention**
   - Sustained attention
   - Quick reactions
   - Multi-lane tracking

5. **Musical Awareness**
   - Beat understanding
   - Timing to music
   - Rhythmic movement

---

## Comparison with Similar Games

| Feature | MusicConductor | FruitNinjaAir | BeatSaber |
|---------|----------------|---------------|-----------|
| CV Required | Hand (optional) | Hand | Full body |
| Core Mechanic | Hit falling notes | Swipe flying fruit | Slash blocks |
| Educational Focus | Rhythm | Timing | Rhythm |
| Age Range | 4-8 | 4-8 | 8+ |
| Input Method | Hand/touch/keyboard | Hand swipe | VR controllers |
| Multi-lane | Yes (2-4) | No | Yes |
| Combo System | Yes | Yes | Yes |
| Vibe | Active | Active | Very Active |

---

## Test Coverage

### Test Suite: `musicConductorLogic.test.ts`

**52 tests covering:**

*LEVELS Configuration (6 tests)*
- Level count and properties
- BPM progression
- Tolerance values

*createNote (5 tests)*
- Property initialization
- Unique ID generation
- Parameter handling

*updateNotes (5 tests)*
- Note movement
- Removal conditions
- Property preservation

*checkNoteHit (9 tests)*
- Null handling
- Hit detection
- Perfect vs good scoring
- Lane filtering
- Closest note selection

*generatePattern (6 tests)*
- Beat interval timing
- BPM calculation
- Note creation
- Lane generation

*calculateComboScore (5 tests)*
- Base scoring
- Combo multiplier
- Maximum capping
- Edge cases

*Hit Detection Mechanics (3 tests)*
- Perfect hit range
- Good hit range
- Miss detection

*Level Progression (5 tests)*
- Lane counts
- Duration values
- Progression logic

*Edge Cases (5 tests)*
- Empty arrays
- Zero values
- Boundary conditions

*Scoring System (3 tests)*
- Combo formula
- Hit scoring
- Multiplier behavior

**All tests passing ✅**

---

## Progress Tracking

### useGameSessionProgress Integration

```typescript
useGameSessionProgress({
  gameName: 'Music Conductor',
  score,
  level: level.level,
  isPlaying: gameState === 'playing',
  metaData: { streak, combo }
});
```

### useGameDrops Integration

```typescript
const { onGameComplete } = useGameDrops('music-conductor');

// On level completion
await onGameComplete(score);
```

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
