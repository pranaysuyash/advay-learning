# Steady Hand - Game Specification

## Overview
**Game ID**: `steady-hand`
**Educational Focus**: Fine motor control, patience, hand-eye coordination
**Target Age**: 4-7 years
**Code Location**: `src/frontend/src/games/steadyHandLogic.ts`

## Game Description
Children hold their finger/cursor steady on a target point to fill a progress bar. This builds fine motor control, patience, and focus. The progress decays when not holding, teaching sustained attention.

## Educational Goals
1. Fine motor control
2. Hand steadiness
3. Patience and persistence
4. Focus and concentration
5. Understanding progress

## Game Logic

### Interfaces

```typescript
interface HoldProgressOptions {
  current: number;          // Current progress (0-1)
  isInside: boolean;        // Is cursor inside target?
  deltaTimeMs: number;      // Time since last update (ms)
  holdDurationMs?: number;  // Time to fill (default 2500ms)
  decayDurationMs?: number; // Time to empty (default 1400ms)
}
```

### Core Functions

#### `updateHoldProgress(options: HoldProgressOptions): number`
Updates the hold progress based on position and time.

**Parameters**:
- `current`: Current progress value (0.0 to 1.0)
- `isInside`: Whether the pointer is inside the target area
- `deltaTimeMs`: Time elapsed since last frame (milliseconds)
- `holdDurationMs`: Time to fill progress bar (default: 2500ms)
- `decayDurationMs`: Time to empty progress bar (default: 1400ms)

**Returns**: New progress value (clamped to 0.0-1.0)

**Behavior**:
1. If `isInside`: Progress increases at `deltaTimeMs / holdDurationMs` rate
2. If `!isInside`: Progress decreases at `deltaTimeMs / decayDurationMs` rate
3. Result clamped between 0 and 1
4. Invalid `deltaTimeMs` (≤ 0) returns current value unchanged

#### `pickTargetPoint(randomA: number, randomB: number, margin?: number): {x: number, y: number}`
Generates a random target point within margins.

**Parameters**:
- `randomA`: First random value (typically 0-1)
- `randomB`: Second random value (typically 0-1)
- `margin`: Distance from edge (default: 0.2, clamped 0.05-0.45)

**Returns**: `{x, y}` coordinates in 0-1 range

**Behavior**:
1. Clamps margin to [0.05, 0.45] range
2. Creates playable area: `margin` to `1-margin`
3. Maps random values to playable area
4. Clamps inputs to [0, 1] to prevent errors

## Game Progression

### Hold Mechanics

| State | Progress Change | Rate |
|-------|----------------|------|
| Inside target | Increases | 1 / 2500ms = 0.04%/ms |
| Outside target | Decreases | 1 / 1400ms = 0.07%/ms |

### Time to Complete
- **Fill time**: 2.5 seconds of holding
- **Decay time**: 1.4 seconds to fully empty
- **Decay is faster** than fill for challenge

### Target Positioning
Target appears within margins:
- **Default margin**: 20% from each edge
- **Playable area**: Center 60% of screen
- **Margin range**: 5% to 45% (configurable)

## Technical Notes

### Progress Calculation

**Increasing** (inside target):
```typescript
const step = deltaTimeMs / holdDurationMs;
const next = current + step;
```

**Decreasing** (outside target):
```typescript
const step = -(deltaTimeMs / decayDurationMs);
const next = current + step;
```

**Clamping**:
```typescript
return Math.min(1, Math.max(0, next));
```

### Target Point Calculation

```typescript
const clampedMargin = Math.min(0.45, Math.max(0.05, margin));
const span = 1 - clampedMargin * 2;

return {
  x: clampedMargin + Math.min(1, Math.max(0, randomA)) * span,
  y: clampedMargin + Math.min(1, Math.max(0, randomB)) * span,
};
```

**Guarantees**:
- Target never spawns outside screen
- Minimum margin: 5% (edge safety)
- Maximum margin: 45% (playable area minimum 10%)

### Edge Cases
- `deltaTimeMs <= 0`: Returns current unchanged (prevents bugs)
- `randomA/randomB` outside [0,1]: Clamped to [0,1]
- `margin` outside [0.05,0.45]: Clamped to valid range

## Design Decisions

### Faster Decay Than Fill
- **Fill**: 2500ms (2.5 seconds)
- **Decay**: 1400ms (1.4 seconds)
- **Ratio**: Decay is ~1.8× faster
- **Purpose**: Creates challenge - requires steady holding

### Default Margin of 0.2
- Keeps target in center 60% of screen
- Prevents edge tapping (too easy)
- Ensures visibility on all devices

### Separated Random Inputs
- Takes two separate random values
- Allows deterministic testing
- No internal Math.random calls
- RNG injected from caller

### No Level Configuration
- Game mechanics are consistent
- Difficulty can be adjusted via:
  - holdDurationMs (easier with longer time)
  - decayDurationMs (harder with faster decay)
  - margin (easier with smaller playable area)

## Educational Design

### Fine Motor Skills
- **Precision**: Holding steady requires control
- **Muscle memory**: Repeated holding builds patterns
- **Dexterity**: Small movements maintained

### Patience Development
- **Delayed gratification**: 2.5 seconds is long for toddlers
- **Persistence**: Progress resets if you let go
- **Emotional regulation**: Handling frustration from decay

### Focus and Attention
- **Sustained attention**: Must hold continuously
- **Visual monitoring**: Watching progress bar
- **Proprioception**: Knowing hand position without looking

### Progress Understanding
- **Visual feedback**: Progress bar fills/empties
- **Causality**: Holding → filling, releasing → emptying
- **Quantitative concepts**: More/less, full/empty

## Age Appropriateness

### Younger Children (3-4)
- May struggle with 2.5s hold time
- Can extend holdDurationMs to 4000ms
- Larger target area via smaller margin

### Older Children (5-7)
- Can handle standard 2.5s hold
- Challenge with faster decay
- Smaller targets for precision

## Extension Possibilities

### Difficulty Levels

| Level | Hold Time | Decay Time | Margin |
|-------|-----------|------------|--------|
| Easy | 4000ms | 2000ms | 0.15 |
| Medium | 2500ms | 1400ms | 0.2 |
| Hard | 1500ms | 800ms | 0.25 |

### Features
- **Moving targets**: Target position changes over time
- **Multiple targets**: Sequence of holds
- **Shrinking targets**: Target gets smaller as you hold
- **Distraction**: Visual elements during hold

## Testing Notes

### Deterministic Testing
```typescript
// Test specific position
const point = pickTargetPoint(0.5, 0.5, 0.2);
// Always returns center of playable area

// Test progress update
const progress = updateHoldProgress({
  current: 0.5,
  isInside: true,
  deltaTimeMs: 100,
  holdDurationMs: 2500,
});
// Always returns 0.5 + (100/2500) = 0.54
```

### Edge Case Coverage
- deltaTimeMs of 0 (no change)
- Negative deltaTimeMs (no change)
- Extremes of current (0, 1)
- Margin boundary values (0.05, 0.45)
