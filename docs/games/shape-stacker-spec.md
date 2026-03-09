# Shape Stacker - Game Specification

## Overview
**Game ID**: `shape-stacker`
**Educational Focus**: Shape recognition, color matching, fine motor skills
**Target Age**: 3-6 years
**Code Location**: `src/frontend/src/games/shapeStackerLogic.ts`

## Game Description
Falling shapes appear at the top of the screen. Children must drag each shape to the matching target slot (same shape AND same color) to score points.

## Educational Goals
1. Recognize and name basic shapes
2. Match colors accurately
3. Practice fine motor control (drag and drop)
4. Build spatial reasoning skills

## Game Logic

### Interfaces

```typescript
interface FallingShape {
  id: number;
  x: number;
  y: number;
  shape: 'square' | 'circle' | 'triangle' | 'star';
  color: string;
}

interface TargetSlot {
  id: number;
  shape: FallingShape['shape'];
  color: string;
  filled: boolean;
}

interface LevelConfig {
  level: number;
  shapeCount: number;
  targetCount: number;
}
```

### Game Constants

**Shapes**: square, circle, triangle, star (4 types)

**Colors**:
| Color | Hex |
|-------|-----|
| Red | #EF4444 |
| Blue | #3B82F6 |
| Green | #22C55E |
| Orange | #F59E0B |

### Level Configuration

| Level | Shape Count | Target Count | Difficulty |
|-------|-------------|--------------|------------|
| 1 | 5 | 3 | Easy (fewest shapes) |
| 2 | 7 | 4 | Medium |
| 3 | 10 | 5 | Hard (most shapes) |

Note: More shapes than targets creates "decoy" shapes.

### Core Functions

#### `getLevelConfig(level: number): LevelConfig`
Gets configuration for a level.

**Fallback**: Returns level 1 config for invalid levels.

#### `createShapes(level: number): FallingShape[]`
Creates falling shapes for the level.

**Generation**:
- Creates `shapeCount` shapes
- Each shape gets:
  - Sequential id (0, 1, 2, ...)
  - Random x: 20-80 (percentage)
  - Staggered y: -10, -25, -40, ... (above screen)
  - Random shape from SHAPES array
  - Random color from COLORS array

#### `createTargets(level: number): TargetSlot[]`
Creates target slots at the bottom of the screen.

**Generation**:
- Creates `targetCount` slots
- Each slot gets:
  - Sequential id (0, 1, 2, ...)
  - Unique shape (no repeats until all 4 shapes used)
  - Random color from COLORS array
  - filled: false (initially empty)

Ensures each target has a different shape when possible (up to 4 unique shapes).

#### `checkMatch(shape: FallingShape, slot: TargetSlot): boolean`
Determines if a shape matches a slot.

**Match Criteria**: BOTH shape AND color must be identical.

Returns true only when both properties match.

#### `updateShapePosition(shape: FallingShape, deltaY: number): FallingShape`
Updates shape position by adding deltaY to y.

Returns new shape object (immutable).

#### `isShapeInTargetZone(shape: FallingShape, targetY: number): boolean`
Checks if shape has reached the target area.

**Tolerance**: ±5 pixels from targetY.

Returns true when `shape.y` is within `targetY ± 5`.

#### `calculateScore(matches: number, totalTargets: number, timeLeft: number): number`
Calculates final score.

**Formula**: `round((matches / totalTargets) × 1000 + timeLeft × 10)`

**Components**:
- Accuracy score: (matches/total) × 1000
- Time bonus: timeLeft × 10

**Examples**:
| Matches | Total | Time Left | Score |
|---------|-------|-----------|-------|
| 5 | 5 | 60 | 1600 |
| 3 | 5 | 30 | 730 |
| 0 | 5 | 60 | 600 |

## Game Progression

### Difficulty Scaling
- **Level 1**: 5 shapes (3 targets) - Fewest distractions
- **Level 2**: 7 shapes (4 targets) - More decoys
- **Level 3**: 10 shapes (5 targets) - Most challenging

### Matching Challenge
Each level has more shapes than targets, meaning some shapes cannot be matched. Players must identify which shapes have valid matches and ignore decoys.

### Shape Variety
- 4 shape types ensure variety
- 4 colors provide 16 possible combinations
- Random selection creates different games each time

## Technical Notes

### Coordinate System
- x and y are percentage-based (0-100)
- Shapes spawn above screen (y < 0)
- Targets at bottom (y ≈ 80-90)

### Shape Positioning
- Initial x: 20 + random(0-60) = 20-80 range
- Initial y: -10 - (id × 15) creates staggered fall

### Target Uniqueness
Target shapes are guaranteed to be unique until all 4 shapes are used. At level 3 (5 targets), one shape type will repeat.

### Edge Cases
- Division by zero: calculateScore(0, 0, time) returns NaN
- Negative time: Subtracts from score (penalty)
- Invalid level: Falls back to level 1

### Design Decisions
- More shapes than targets adds decision-making element
- Unique target shapes ensure all 4 shapes appear
- Random colors and shapes provide replayability
- Staggered spawn prevents overwhelming visual

## Scoring System

### Accuracy-Based Scoring
Score is primarily based on matching accuracy:
- 100% matches = 1000 points
- 50% matches = 500 points
- 0% matches = 0 points (plus time bonus)

### Time Bonus
Each second remaining adds 10 points, encouraging quick completion.

### Maximum Scores
| Level | Max Score (100% + 60s) |
|-------|----------------------|
| 1 | 1600 |
| 2 | 1600 |
| 3 | 1600 |

## Visual Design Considerations

### Shape Rendering
- Square: Rectangle
- Circle: Ellipse/circle
- Triangle: 3-sided polygon
- Star: 5-pointed star

### Target Slots
- Should show outline of expected shape
- Color-coded to indicate required color
- Visual feedback when matched correctly

### Drag Interaction
- Shape follows pointer/cursor
- Snap-to-target animation on match
- Rejection animation for mismatch
