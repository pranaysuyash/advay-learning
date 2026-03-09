# Music Pinch - Utility Specification

## Overview
**Module**: `music-pinch`
**Purpose**: Lane mapping and selection utilities for rhythm games
**Code Location**: `src/frontend/src/games/musicPinchLogic.ts`

## Description
This module provides utility functions for mapping screen positions to game lanes and selecting the next lane for note spawning. It's designed for vertical scrolling rhythm games where notes fall from the top and the player taps them in lanes.

## Functions

### `getLaneFromNormalizedX(x, laneCount?)`
Maps a normalized X coordinate (0-1) to a lane index.

**Parameters:**
- `x: number` - Normalized X coordinate (0 = left edge, 1 = right edge)
- `laneCount: number = 3` - Number of lanes (default: 3)

**Returns:** `number` - Lane index (0 to laneCount-1)

**Algorithm:**
1. Clamp x to [0, 1] range
2. Calculate `floor(x * laneCount)`
3. Return `min(result, laneCount - 1)`

**Examples:**
| x | laneCount=3 | laneCount=4 | laneCount=2 |
|---|-------------|-------------|-------------|
| 0.0 | 0 | 0 | 0 |
| 0.2 | 0 | 0 | 0 |
| 0.4 | 1 | 1 | 0 |
| 0.6 | 1 | 2 | 1 |
| 0.8 | 2 | 3 | 1 |
| 1.0 | 2 | 3 | 1 |

**Edge Cases:**
- Negative x: clamped to 0, returns lane 0
- x > 1: clamped to 1, returns last lane
- laneCount ≤ 1: always returns 0

### `pickNextLane(currentLane, laneCount?, randomValue?)`
Selects a random lane, ensuring it's different from the current lane.

**Parameters:**
- `currentLane: number` - Lane to avoid
- `laneCount: number = 3` - Number of lanes (default: 3)
- `randomValue: number = Math.random()` - Random value (0-1)

**Returns:** `number` - A lane index different from currentLane

**Algorithm:**
1. Clamp randomValue to [0, 0.999999]
2. Calculate `base = floor(randomValue * laneCount)`
3. If `base !== currentLane`, return `base`
4. Otherwise, return `(base + 1) % laneCount`

**Examples with 3 lanes:**
| currentLane | randomValue | base | result |
|-------------|-------------|------|--------|
| 0 | 0.2 | 0 | 1 (avoided 0) |
| 1 | 0.4 | 1 | 2 (avoided 1) |
| 2 | 0.8 | 2 | 0 (wrapped) |

**Edge Cases:**
- laneCount ≤ 1: always returns 0
- Clamps randomValue to avoid overflow with `floor()`
- Wraps around from last lane to first

## Use Cases

### 1. Touch Input Mapping
```typescript
// Map touch position to lane
const touchX = touch.clientX / screenWidth;
const lane = getLaneFromNormalizedX(touchX);
// Check if player tapped the correct lane
```

### 2. Note Spawning
```typescript
// Spawn notes in different lanes
let lastLane = 0;
for (const note of notesToSpawn) {
  const lane = pickNextLane(lastLane);
  spawnNote(lane);
  lastLane = lane;
}
```

### 3. Multi-Lane Support
```typescript
// Support different difficulties with different lane counts
const lanes = difficulty === 'easy' ? 2 : 4;
const lane = getLaneFromNormalizedX(x, lanes);
```

## Technical Notes

### Test Coverage
- 42 tests covering:
  - Lane mapping for various X values
  - Clamping behavior
  - Different lane counts (1-5)
  - Lane selection with avoidance
  - Boundary conditions
  - Integration scenarios
  - Mathematical properties

### Design Decisions
- Pure functions (no side effects)
- Deterministic with provided random value
- Supports any number of lanes
- Clamping ensures valid indices

### Coordinate System
- **Normalized X**: 0 (left) to 1 (right)
- **Lane Indices**: 0 (leftmost) to laneCount-1 (rightmost)
- Screen divided evenly among lanes

### Why Avoid Current Lane?
The `pickNextLane` function ensures variety by never spawning two consecutive notes in the same lane. This creates more engaging gameplay and prevents note clustering.
