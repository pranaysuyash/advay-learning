# Rainbow Bridge - Game Specification

## Overview
**Game ID**: `rainbow-bridge`
**Educational Focus**: Number recognition, sequencing, fine motor skills
**Target Age**: 3-6 years
**Code Location**: `src/frontend/src/games/rainbowBridgeLogic.ts`

## Game Description
Children tap numbered dots in sequence (1, 2, 3...) to connect them and build a rainbow arc. The game teaches number order and hand-eye coordination.

## Educational Goals
1. Number recognition (1-10)
2. Numerical sequencing
3. Fine motor skills (tapping accuracy)
4. Following visual patterns
5. Understanding arcs and curves

## Game Logic

### Interfaces

```typescript
interface Dot {
  id: number;        // Sequential ID (0-based index)
  x: number;         // X coordinate (percentage-based)
  y: number;         // Y coordinate (percentage-based)
  connected: boolean;// Whether this dot has been connected
  number: number;    // Display number (1-based)
}

interface LevelConfig {
  level: number;     // Level number (1-3)
  dotCount: number;  // Number of dots to generate
  arcRadius: number; // Radius of the arc curve
}
```

### Level Configuration

| Level | dotCount | arcRadius | Description |
|-------|----------|-----------|-------------|
| 1 | 5 | 35 | Short arc, easiest to complete |
| 2 | 7 | 30 | Medium arc with more dots |
| 3 | 10 | 25 | Long arc with most dots, smaller radius |

### Rainbow Colors

7 colors in ROYGBIV order:
1. `#FF0000` - Red
2. `#FF7F00` - Orange
3. `#FFFF00` - Yellow
4. `#00FF00` - Green
5. `#0000FF` - Blue
6. `#4B0082` - Indigo
7. `#9400D3` - Violet

### Core Functions

#### `getLevelConfig(level: number): LevelConfig`
Gets configuration for a level.

**Fallback**: Returns level 1 config for invalid levels.

#### `createGame(level: number): { dots: Dot[], config: LevelConfig }`
Creates a new game with dots positioned along an arc.

**Behavior**:
- Generates `dotCount` dots along a semi-circular arc
- Dots are numbered 1, 2, 3... in left-to-right order
- All dots start with `connected: false`
- Arc spans from angle π (left) to 0 (right)

**Arc Generation**:
- Center: (50, 80)
- Start angle: π (leftmost point)
- End angle: 0 (rightmost point)
- Y values scaled by 0.5 for flattened arc

#### `checkDotClick(x, y, dots, currentIndex, tolerance?): { success: boolean, nextIndex: number }`
Checks if a click/tap hits the current target dot.

**Parameters**:
- `x, y`: Click coordinates
- `dots`: Array of all dots
- `currentIndex`: Which dot to check (0-based)
- `tolerance`: Distance threshold (default: 5)

**Returns**:
- `success`: true if click is within tolerance of target dot
- `nextIndex`: currentIndex + 1 if successful, else currentIndex

**Distance Formula**: `sqrt((x-targetX)² + (y-targetY)²)`

#### `isGameComplete(dots: Dot[]): boolean`
Checks if all dots are connected.

**Returns**: `true` if every dot has `connected: true`

#### `calculateScore(timeRemaining: number, level: number): number`
Calculates the final score.

**Formula**: `baseScore + timeBonus`
- `baseScore` = `level × 100`
- `timeBonus` = `timeRemaining × 10`

## Game Progression

### Difficulty Progression
- **Level 1**: 5 dots, large arc (easiest)
- **Level 2**: 7 dots, medium arc (medium)
- **Level 3**: 10 dots, tight arc (hardest)

### Skill Development
1. **Level 1**: Learn basic number sequence (1-5)
2. **Level 2**: Extend sequencing (1-7), smaller dots
3. **Level 3**: Master sequencing (1-10), precision required

### Scoring System
| Level | Base Score | Max Time Bonus (30s) |
|-------|------------|----------------------|
| 1 | 100 | +300 = 400 total |
| 2 | 200 | +300 = 500 total |
| 3 | 300 | +300 = 600 total |

## Technical Notes

### Coordinate System
- X and Y are percentage-based (0-100)
- Arc center: (50, 80)
- Radius varies by level (35 → 30 → 25)

### Arc Mathematics
```
angle = startAngle - angleStep × i
x = centerX + arcRadius × cos(angle)
y = centerY + arcRadius × sin(angle) × 0.5
```

### Tolerance Zone
- Default: 5 units
- Creates a circular hit zone around each dot
- Allows for toddler's imprecise tapping

### Edge Cases
- Empty dots array → `isGameComplete` returns `true` (vacuous truth)
- Invalid currentIndex → `checkDotClick` returns failure
- Invalid level → Falls back to level 1 config

### Click Validation
- Only the current target dot can be clicked
- Clicking out of sequence has no effect
- Prevents skipping ahead in the sequence

## Design Decisions

### Flattened Arc (Y × 0.5)
- Creates a rainbow-like appearance
- More screen space efficient than full semi-circle
- Visually appealing to children

### Decreasing Arc Radius
- Level 1: Largest radius (35) = dots spread out
- Level 3: Smallest radius (25) = dots closer together
- Increases difficulty through precision requirement

### Left-to-Right Numbering
- Matches reading direction
- Natural progression for Western languages
- Supports emergent literacy

### Percentage-Based Coordinates
- Responsive to different screen sizes
- Works on tablets and phones
- Simplifies layout calculations

## Educational Design

### Number Sequencing
- Builds foundation for counting
- Teaches ordinal concepts (first, second, third...)
- Prepares for numerical operations

### Visual Motor Integration
- Hand-eye coordination practice
- Spatial awareness (arc pattern)
- Precision targeting with tolerance zone

### Progressive Challenge
- Fewer dots → More dots (working memory)
- Large radius → Small radius (fine motor)
- Always builds on previous success

### Visual Feedback
- Connected vs unconnected states
- Number labels show sequence
- Rainbow colors provide completion reward
