# Virtual Bubbles - Game Specification

## Overview
**Game ID**: `virtual-bubbles`
**Educational Focus**: Breath control, coordination, cause-and-effect
**Target Age**: 3-6 years
**Code Location**: `src/frontend/src/games/virtualBubblesLogic.ts`

## Game Description
Children blow into the microphone to create bubbles that float up the screen, then pop them with their hands. This game teaches breath control while providing satisfying bubble-popping fun.

## Educational Goals
1. Practice breath control (blowing gently)
2. Develop hand-eye coordination
3. Understand cause-and-effect
4. Practice tracking moving objects

## Game Logic

### Interfaces

```typescript
interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speedY: number;  // Float upward
  speedX: number;  // Drift sideways
}

interface LevelConfig {
  level: number;
  bubblesToPop: number;
  maxBubbles: number;
  spawnRate: number;  // ms between spawns
  timeLimit: number;  // seconds
}
```

### Bubble Colors

**10 colors** (hex values):
- Red/pink: #FF6B6B
- Teal/cyan: #4ECDC4, #45B7D1
- Green: #96CEB4, #98D8C8
- Yellow: #FFEAA7, #F7DC6F
- Purple: #DDA0DD, #BB8FCE
- Blue: #85C1E9

### Level Configuration

| Level | Bubbles to Pop | Max Bubbles | Spawn Rate | Time Limit |
|-------|----------------|-------------|------------|------------|
| 1 | 10 | 5 | 2000ms | 45s |
| 2 | 15 | 8 | 1500ms | 40s |
| 3 | 20 | 10 | 1000ms | 35s |

### Core Functions

#### `getLevelConfig(level)`
Gets configuration for a level.

**Parameters:**
- `level: number` - Level number (1-3)

**Returns:** `LevelConfig`

**Fallback:** Returns level 1 config for invalid levels.

#### `createBubble(id, canvasWidth)`
Creates a new bubble at the top of the screen.

**Parameters:**
- `id: number` - Unique bubble identifier
- `canvasWidth: number` - Canvas width for positioning

**Returns:** `Bubble`

**Properties:**
- `y`: Starts at -50 (above screen)
- `x`: Random between 40 and canvasWidth - 40
- `size`: Random between 30 and 70
- `color`: Random from BUBBLE_COLORS palette
- `speedY`: Random between 0.5 and 2.5 (upward)
- `speedX`: Random between -1 and 1 (drift)

#### `updateBubbles(bubbles, canvasWidth, canvasHeight)`
Updates bubble positions and removes off-screen bubbles.

**Parameters:**
- `bubbles: Bubble[]`
- `canvasWidth: number`
- `canvasHeight: number`

**Returns:** Updated `Bubble[]`

**Behavior:**
1. Updates positions: `x += speedX`, `y += speedY`
2. Filters out bubbles that are off-screen:
   - Below screen: `y >= canvasHeight + 50`
   - Left of screen: `x < -50`
   - Right of screen: `x > canvasWidth + 50`

#### `checkBubblePop(bubbles, handX, handY, canvasWidth, canvasHeight)`
Checks if hand position pops any bubble.

**Parameters:**
- `bubbles: Bubble[]`
- `handX: number` - Normalized hand X (0-1)
- `handY: number` - Normalized hand Y (0-1)
- `canvasWidth: number`
- `canvasHeight: number`

**Returns:** `{popped: Bubble | null; remaining: Bubble[]}`

**Behavior:**
1. Normalizes hand coordinates to canvas space
2. Checks distance from hand to each bubble
3. Returns first bubble where distance < bubble.size
4. Removes popped bubble from remaining

## Game Progression

### Difficulty Scaling
- **More bubbles**: Level 1 (10) → Level 2 (15) → Level 3 (20)
- **Faster spawning**: 2000ms → 1500ms → 1000ms
- **More on screen**: Max 5 → Max 8 → Max 10
- **Less time**: 45s → 40s → 35s

### Breath Mechanics
The UI layer handles microphone input for:
- Detecting blowing intensity
- Triggering bubble creation
- Visual feedback for blowing

## Technical Notes

### Test Coverage
- 42 tests covering:
  - Level configuration
  - Bubble creation
  - Bubble updates and filtering
  - Pop detection
  - Integration scenarios
  - Edge cases
  - Difficulty progression

### Implementation Details
- Bubbles float upward (positive speedY)
- Bubbles drift sideways (random speedX)
- Pop detection uses distance < radius
- Bubbles have 50px margin before removal

### Design Decisions
- Larger bubbles (30-70px) for easier tapping
- Upward float mimics real bubbles
- 50px margin prevents premature removal at edges
- Multiple bubbles can exist at once

### Audio Considerations
UI layer should provide:
- Blow detection sound
- Bubble pop sounds
- Ambient background music
- Success celebration sounds
