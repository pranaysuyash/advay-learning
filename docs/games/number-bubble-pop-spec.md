# Number Bubble Pop Game Specification

**Game ID:** `number-bubble-pop`
**World:** Learning
**Vibe:** Chill
**Age Range:** 3-8 years
**CV Requirements:** None

---

## Overview

Number Bubble Pop is an engaging number recognition game where children pop bubbles displaying specific numbers. The game reinforces number identification skills through visual matching in a fun, pressure-free environment.

### Tagline
"Pop the bubble with the right number! 🫧✨"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Target** - Target number displayed at top of screen
2. **Find Bubbles** - 5 bubbles scattered with different numbers
3. **Pop Correct** - Click/tap bubble matching target number
4. **Score Points** - Earn points based on streak and difficulty
5. **Repeat** - Continue for 5 rounds per session

### Controls

| Action | Input |
|--------|-------|
| Pop bubble | Click/tap on bubble |
| Select level | Click level button before start |
| Start game | Click "Start!" button |
| Play again | Click "Play Again" button |
| Back to menu | Click "Menu" button |

---

## Difficulty Levels

### 3 Difficulty Settings

| Level | Range | Description | Multiplier |
|-------|-------|-------------|------------|
| Easy | 1-5 | Numbers 1-5 | 1× |
| Medium | 1-10 | Numbers 1-10 | 1.5× |
| Hard | 1-20 | Numbers 1-20 | 2× |

### Level Emojis

| Level | Emoji |
|-------|-------|
| 1 | 🌱 |
| 2 | 🌟 |
| 3 | 🔥 |

---

## Scoring System

### Score Formula

```typescript
baseScore = 15;
streakBonus = Math.min(streak × 3, 15);
difficultyMultiplier = { 1: 1, 2: 1.5, 3: 2 }[level];
score = (baseScore + streakBonus) × difficultyMultiplier;
```

### Score Examples

| Level | Streak | Base | Bonus | Subtotal | Final |
|-------|--------|------|-------|----------|-------|
| 1 | 0 | 15 | 0 | 15 | 15 |
| 1 | 5 | 15 | 15 | 30 | 30 |
| 2 | 5 | 15 | 15 | 30 | 45 |
| 3 | 5 | 15 | 15 | 30 | 60 |

### Penalties

- Wrong pop: -10 points (minimum 0)
- Streak reset on wrong answer

---

## Streak System

### Streak Progression

| Streak | Bonus | Running Total (Level 1) |
|--------|-------|-------------------------|
| 1 | 0 | 15 |
| 2 | 3 | 18 |
| 3 | 6 | 21 |
| 4 | 9 | 24 |
| 5 | 12 | 27 |
| 6+ | 15 | 30 (capped) |

### Visual Feedback

- Kenney heart HUD fills (5 hearts max)
- Heart fills every 2 streak points
- Streak milestone overlay at intervals

---

## Visual Design

### UI Elements

- **Game Area:** 320×320 circular pool with sky blue background
- **Bubbles:** 56×56px circular gradient buttons (blue-300 to blue-500)
- **Target Display:** White translucent banner at top
- **Streak HUD:** White rounded box with heart icons
- **Level Buttons:** Pill-shaped, blue when active, gray when inactive

### Bubble Properties

| Property | Value |
|----------|-------|
| Size | 56×56px |
| Colors | Blue gradient (#93C5FD to #3B82F6) |
| Text | White, 20px bold |
| Hover | 110% scale |
| Position | Random within game area |

### States

| State | Description |
|-------|-------------|
| Start | Title screen with emoji and instructions |
| Playing | Bubbles displayed, target number shown |
| Complete | Results screen with score and streak |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Pop bubble | playClick() | None |
| Correct pop | playSuccess() | 'success' |
| Wrong pop | playError() | 'error' |
| Complete | playCelebration() | 'celebration' |
| Milestone | None | 'celebration' |

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Bubbles per round | 5 | Total bubbles on screen |
| Rounds per session | 5 | Total rounds in game |
| Base score | 15 | Points per correct pop |
| Streak bonus per | 3 | Points added per streak level |
| Max streak bonus | 15 | Cap on streak bonus |
| Wrong penalty | -10 | Points deducted for wrong pop |

---

## Data Structures

### Bubble

```typescript
interface Bubble {
  id: number;        // Unique identifier (0-4)
  number: number;    // Displayed number
  x: number;         // Horizontal position (20-300px)
  y: number;         // Vertical position (50-250px)
}
```

### Level Config

```typescript
interface LevelConfig {
  level: number;        // Level identifier (1-3)
  numberRange: number;  // Maximum number in range
}
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `NumberBubblePop.tsx` | 196 | Main component with game loop |
| `numberBubblePopLogic.ts` | 78 | Game logic and utilities |
| `numberBubblePopLogic.test.ts` | 247 | Unit tests (46 tests) |

### Architecture

- **Component** (`NumberBubblePop.tsx`): UI, state, game loop, events
- **Logic** (`numberBubblePopLogic.ts`): Pure functions for bubbles, scoring, levels
- **Tests** (`numberBubblePopLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Number Recognition**
   - Identifying numbers 1-20
   - Visual number matching
   - Number symbol association

2. **Visual Scanning**
   - Finding target among distractors
   - Visual discrimination
   - Attention to detail

3. **Counting Skills**
   - Understanding quantity
   - Number sequence awareness
   - Range comprehension

4. **Fine Motor Skills**
   - Pointing and tapping
   - Hand-eye coordination
   - Precision clicking

5. **Pattern Recognition**
   - Number constancy
   - Symbol identification
   - Visual processing

---

## Progress Tracking

### useGameSessionProgress Integration

```typescript
useGameSessionProgress({
  gameName: 'Number Bubble Pop',
  score,
  level: currentLevel,
  isPlaying: true,
  metaData: { correct, round }
});
```

### useGameDrops Integration

```typescript
const { onGameComplete } = useGameDrops('number-bubble-pop');

// On game completion
await onGameComplete(correct);
```

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
