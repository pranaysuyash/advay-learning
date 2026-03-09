# Path Following - Game Specification

## Overview
**Game ID**: `path-following`
**Educational Focus**: Fine motor control, hand-eye coordination, spatial awareness
**Target Age**: 4-7 years
**Code Location**: `src/frontend/src/games/pathFollowingLogic.ts`

## Game Description
Children must keep their finger or cursor on a winding path. The path becomes narrower and longer at higher levels.

## Educational Goals
1. Develop fine motor control
2. Practice hand-eye coordination
3. Build spatial awareness
4. Improve focus and attention

## Game Logic

### Interfaces

```typescript
interface PathPoint {
  x: number;
  y: number;
}

interface LevelConfig {
  level: number;
  pathLength: number;
  pathWidth: number;
}
```

### Level Configuration

| Level | Path Length | Path Width | Difficulty |
|-------|-------------|------------|------------|
| 1 | 8 points | 60px | Easy (widest) |
| 2 | 12 points | 50px | Medium |
| 3 | 16 points | 40px | Hard (narrowest) |

### Core Functions

#### `getLevelConfig(level: number): LevelConfig`
Gets configuration for a level.

**Fallback**: Returns level 1 config for invalid levels.

#### `createPath(level: number): { path: PathPoint[], config: LevelConfig }`
Creates a new game with a generated path.

**Path Generation**:
1. Start at (50, 50)
2. For each point, randomly choose direction:
   - ~33%: horizontal (x increases by 60-90)
   - ~33%: vertical (y increases by 60-90)
   - ~33%: diagonal (x and y both increase by 40 + random)
3. Generate `pathLength` points

**Returns**: Object with path array and level config.

#### `isOnPath(x: number, y: number, path: PathPoint[], pathWidth: number): boolean`
Checks if a point is within the path boundaries.

**Algorithm**:
```
For each segment (path[i] to path[i+1]):
  minX = min(p1.x, p2.x) - pathWidth/2
  maxX = max(p1.x, p2.x) + pathWidth/2
  minY = min(p1.y, p2.y) - pathWidth/2
  maxY = max(p1.y, p2.y) + pathWidth/2

  if (x >= minX && x <= maxX && y >= minY && y <= maxY):
    return true

return false
```

This creates a bounding box around each segment with pathWidth as the total width/height.

## Game Progression

### Difficulty Scaling
- **Level 1**: Shortest path (8 points), widest path (60px)
- **Level 2**: Medium path (12 points), medium width (50px)
- **Level 3**: Longest path (16 points), narrowest path (40px)

### Path Generation Pattern
Paths are randomly generated using:
- Horizontal steps: 60-90px
- Vertical steps: 60-90px
- Diagonal steps: 40px + (0-30px) random

Each step adds a new point, creating a winding path from the starting position.

## Technical Notes

### Coordinate System
- Uses percentage-based coordinates (0-100)
- Starting point: (50, 50) - center of play area
- Path extends outward in positive x/y directions

### Path Width Behavior
The `pathWidth` represents the total width of the path (both sides of the center line).
- A point at `pathWidth/2` distance from the segment is still "on path"
- PathWidth/2 is subtracted from min bounds and added to max bounds

### Random Generation
Path generation uses `Math.random()` for:
- Direction selection (3-way split)
- Step distance variation within ranges

### Edge Cases Handled
- Empty path returns false (no segments to check)
- Single point path returns false (no segments)
- Invalid level falls back to level 1
- Negative coordinates handled correctly

### Design Decisions
- Percentage coordinates allow responsive scaling
- Bounding box approach is simpler than line-distance calculations
- Progressive narrowing increases precision requirements
- Progressive length increases endurance requirements
- Random generation provides replay variety

## Visual Design Considerations

### Path Rendering
The path should be rendered as:
- A continuous line connecting all points
- Width equal to `pathWidth` from the config
- Semi-transparent or outlined to show boundaries clearly

### On-Path Feedback
Visual feedback should indicate:
- When player is on path (green/highlight)
- When player is off path (red/gray)
- Progress along the path (if applicable)

### Path Bounds Visualization
Consider showing:
- Path edges clearly
- Center line optional
- Start and end points marked
