# Maze Runner Game Specification

**Game ID:** `maze-runner`
**World:** Arcade
**Vibe:** Chill
**Age Range:** 5-10 years
**CV Requirements:** None (uses keyboard/touch input)

---

## Overview

Maze Runner is a puzzle game where children navigate a character through a maze from start to finish. The game features procedurally generated mazes with guaranteed solvable paths, move tracking for scoring bonuses, and keyboard/touch controls.

### Tagline
"Navigate the maze to reach the flag! Fewer moves = more bonus! 🧩🏁"

---

## Game Mechanics

### Core Gameplay Loop

1. **Select Level** - Choose Level 1, 2, or 3
2. **Enter Maze** - Press "Enter the Maze!" button
3. **Navigate** - Use arrow keys/WASD or D-pad buttons to move
4. **Avoid Walls** - Cannot move through walls
5. **Reach Flag** - Navigate to the finish (bottom-right corner)
6. **Calculate Score** - Base points + time bonus + streak bonus
7. **Game Complete** - Show score with option to replay

### Controls

| Action | Input |
|--------|-------|
| Move up | Arrow Up, W key, or D-pad ↑ |
| Move down | Arrow Down, S key, or D-pad ↓ |
| Move left | Arrow Left, A key, or D-pad ← |
| Move right | Arrow Right, D key, or D-pad → |
| Restart | Click "Restart" button |
| Play again | Click "Play Again" button |
| Finish | Click "Finish" button |
| Return home | Click home icon |

---

## Levels

### Level Configuration

```typescript
interface MazeLevel {
  level: number;
  rows: number;      // Maze height (cells)
  cols: number;      // Maze width (cells)
  wallDensity: number; // 0-1, fraction of walls
}
```

### Three Levels

| Level | Rows | Cols | Wall Density | Description |
|-------|------|------|--------------|-------------|
| 1 | 7 | 7 | 0.25 (25%) | Smallest, easiest |
| 2 | 9 | 9 | 0.30 (30%) | Medium size |
| 3 | 11 | 11 | 0.35 (35%) | Largest, most walls |

---

## Maze Generation

### Algorithm

1. **Generate Grid** - Create rows×cols grid
2. **Place Walls** - Random walls based on density (excluding start/end)
3. **Ensure Solvable** - Use BFS to find path from start to end
4. **Retry if Needed** - Regenerate up to 50 times if unsolvable
5. **Mark Path** - Highlight solution path cells

### Cell Types

| Type | Description | Color |
|------|-------------|-------|
| Wall | Blocked cell | Slate-300 |
| Start | Starting position (0,0) | Emerald-100 |
| End | Goal position | Rose-100 |
| Path | Valid path cells | Indigo-50 |
| Default | Open cell | Slate-50 |

### Positioning

- **Start:** Always (0, 0) - top-left
- **End:** Always (cols-1, rows-1) - bottom-right
- **Player:** 😊 emoji
- **Goal:** 🏁 flag emoji

---

## Scoring System

### Score Calculation

```typescript
basePoints = 100; // for completing maze
timeBonus = Math.max(100 - moves, 20); // Fewer moves = more bonus
streakBonus = Math.min(streak × 2, 15); // +2 per streak, max +15
finalScore = basePoints + timeBonus + streakBonus;
```

### Score Examples

| Moves | Base | Time Bonus | Streak 0 | Streak 5 |
|-------|------|------------|---------|----------|
| 10 | 100 | 90 | 190 | 200 |
| 30 | 100 | 70 | 170 | 180 |
| 50 | 100 | 50 | 150 | 160 |
| 80 | 100 | 20 | 120 | 130 |
| 100+ | 100 | 20 (min) | 120 | 130 |

### Bonus Target

- Target: Complete in < 80 moves
- Minimum time bonus: 20 points (floored)

---

## Streak System

### Visual Display

- Streak counter in stats bar
- Fire emoji with count
- Orange text color

### Streak Milestone

- Every 5 consecutive maze completions
- Shows "🔥 {streak} Streak! 🔥" overlay
- Plays celebration haptic

### Streak Bonus

| Streak | Bonus |
|--------|-------|
| 0 | 0 |
| 1 | 2 |
| 3 | 6 |
| 5 | 10 |
| 8+ | 15 (capped) |

---

## Movement

### Move Validation

```typescript
function canMove(maze: MazeCell[][], pos: Position): boolean {
  // Check bounds
  if (y < 0 || y >= maze.length || x < 0 || x >= maze[0].length) return false;
  // Check wall
  return !maze[y][x].isWall;
}
```

### Movement Rules

- Cannot move outside maze boundaries
- Cannot move through walls
- Can move to any open cell
- Movement is discrete (cell by cell)

---

## Win Condition

### Algorithm

```typescript
function checkWin(pos: Position, end: Position): boolean {
  return pos.x === end.x && pos.y === end.y;
}
```

### Trigger

- Player position equals end position
- Immediately ends game
- Calculates final score
- Shows win screen

---

## Visual Design

### Cell Size

- **Width:** 40 pixels
- **Height:** 40 pixels
- **Gap:** 0.5 pixels between cells

### Maze Container

- **Border:** 4px border (F2CC8F)
- **Background:** White
- **Shadow:** 8px shadow with E5B86E
- **Padding:** 8px (p-2)
- **Border radius:** 24px (rounded-3xl)

### D-Pad Controls

- **Button size:** 56×56 pixels (w-14 h-14)
- **Border:** 3px border (F2CC8F)
- **Shadow:** 4px shadow
- **Active scale:** 95%
- **Hover effect:** Indigo-50 background

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Game start | playClick() | None |
| Valid move | playClick() | None |
| Invalid move | playError() | 'error' |
| Maze complete | playSuccess() | 'success' |
| Streak milestone | None | 'celebration' |

---

## Progress Tracking

### Integration with useGameSessionProgress

```typescript
useGameSessionProgress({
  gameName: 'Maze Runner',
  score,
  level: currentLevel,
  isPlaying: gameState === 'playing',
  metaData: { moves },
});
```

### Integration with useGameDrops

```typescript
await onGameComplete(Math.round(score / 50));
```

---

## Game State

### State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| currentLevel | number | Currently selected level (1-3) |
| maze | MazeCell[][] | 2D grid of maze cells |
| playerPos | Position | Current player position {x, y} |
| endPos | Position | Goal position {x, y} |
| score | number | Final score (calculated on win) |
| moves | number | Number of moves taken |
| gameState | 'start' \| 'playing' \| 'won' | Current game phase |

---

## Technical Implementation

### Dependencies

```typescript
// Game logic
import {
  LEVELS,
  createMaze,
  canMove,
  checkWin,
  type MazeCell,
  type Position,
} from '../games/mazeRunnerLogic';

// Game hooks
import { useStreakTracking } from '../hooks/useStreakTracking';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useGameDrops } from '../hooks/useGameDrops';

// Audio & haptics
import { useAudio } from '../utils/hooks/useAudio';
import { triggerHaptic } from '../utils/haptics';

// UI components
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
```

### Key Constants

```typescript
const CELL_SIZE = 40; // Pixels per cell
const MAX_GENERATION_ATTEMPTS = 50; // Max retries for solvable maze
const MIN_TIME_BONUS = 20; // Minimum time bonus
const BASE_SCORE = 100; // Points for completing
```

---

## Maze Solver

### Algorithm (BFS)

The game uses Breadth-First Search to:
1. Verify maze is solvable before showing
2. Highlight the solution path
3. Regenerate if no path exists

### BFS Implementation

```typescript
function solveMaze(maze: MazeCell[][], start: Position, end: Position): Position[] {
  const visited: boolean[][] = /* ... */;
  const queue: { pos: Position; path: Position[] }[] = [{ pos: start, path: [start] }];

  while (queue.length > 0) {
    const { pos, path } = queue.shift()!;

    if (pos.x === end.x && pos.y === end.y) {
      return path; // Found solution
    }

    // Explore neighbors (up, right, down, left)
    // Add valid moves to queue
  }

  return []; // No solution
}
```

---

## Accessibility Features

### Visual Cues
- Clear start (green) and end (pink) positions
- High contrast walls vs paths
- Large emoji for player and goal
- Move counter displayed

### Motor Assistance
- Keyboard controls (arrow keys + WASD)
- Touch D-pad buttons
- No time pressure
- Can restart anytime

### Multiple Input Methods
- Physical keyboard (preferred)
- On-screen D-pad (touch devices)
- Both support same gameplay

---

## Test Coverage

### Test Suite: `mazeRunnerLogic.test.ts`

**Tests covering:**
- Level configurations (4 tests)
- Maze generation (4 tests)
- Cell properties (3 tests)
- Movement validation (4 tests)
- Win condition (2 tests)
- Maze solver (3 tests)
- Edge cases (3-4 tests)

---

## Comparison with Similar Games

| Feature | MazeRunner | ObstacleCourse | PathFollowing |
|---------|------------|----------------|---------------|
| CV Required | None | Hand tracking | Hand (air drawing) |
| Core Mechanic | Navigate maze | Physical obstacles | Trace path |
| Input Type | Keyboard/touch | Body movement | Hand drawing |
| Levels | 3 (size/walls) | 3 (complexity) | 3 (complexity) |
| Scoring | Time-based | Time-based | Accuracy |
| Generation | Procedural | Pre-set | Pre-set |
| Age Range | 5-10 | 3-8 | 4-8 |
| Vibe | Chill | Active | Active |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0 (isNew: true)
