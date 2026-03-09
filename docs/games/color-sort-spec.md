# Color Sort - Game Specification

## Overview
**Game ID**: `color-sort`
**Educational Focus**: Color recognition, categorization, physics concepts
**Target Age**: 3-6 years
**Code Location**: `src/frontend/src/games/colorSortLogic.ts`

## Game Description
A physics-based game where colored balls fall from the top of the screen. Children must guide each ball into the matching colored bucket at the bottom.

## Educational Goals
1. Recognize and name colors
2. Practice categorization skills
3. Develop basic understanding of physics (gravity, bouncing)
4. Build fine motor control through timing

## Game Logic

### Interfaces

```typescript
interface GameState {
  score: number;
  ballsDropped: number;
  ballsSorted: number;
  level: number;
  isPlaying: boolean;
  nextBallColor: string;
}

interface PhysicsBodies {
  engine: Matter.Engine;
  world: Matter.World;
  balls: Matter.Body[];
  buckets: Matter.Body[];
  walls: Matter.Body[];
  spawner: Matter.Body;
}
```

### Game Colors

| Name | Hex Color |
|------|-----------|
| Red | #FF6B6B |
| Blue | #4ECDC4 |
| Green | #96CEB4 |
| Yellow | #FFEAA7 |

### Physics Configuration

| Setting | Value |
|---------|-------|
| Gravity | { x: 0, y: 0.8 } |
| Ball Radius | 20 pixels |
| Ball Bounciness | 0.6 |
| Ball Friction | 0.005 |
| Ball Density | 0.04 |
| Wall Thickness | 60 pixels |

### Core Functions

#### `initializeGame(): GameState`
Creates initial game state.

**Returns**: GameState with:
- score: 0
- ballsDropped: 0
- ballsSorted: 0
- level: 1
- isPlaying: false
- nextBallColor: random color from COLORS

#### `getRandomColor(): string`
Returns a random color hex from COLORS array.

#### `createPhysicsWorld(width: number, height: number): PhysicsBodies`
Creates Matter.js physics world.

**Components Created**:
- Engine with gravity
- Walls (floor, left, right) as static bodies
- 4 bucket assemblies (each with 2 walls + bottom)
- Spawner area (invisible trigger)

**Bucket Layout**:
- Evenly spaced across canvas width
- L-shaped walls guide balls into buckets
- Color-coded bottoms for identification

#### `createBall(x: number, y: number, color: string): Matter.Body`
Creates a ball physics body.

**Properties**:
- Circle shape with 20px radius
- Given color assigned
- Bouncy (restitution: 0.6)
- Low friction

#### `dropBall(physics: PhysicsBodies, x: number, color: string)`
Drops a new ball into the physics world.

**Behavior**:
- Creates ball at (x, 50)
- Adds to physics world
- Returns updated physics state

#### `checkBallInBucket(ball: Matter.Body, buckets: Matter.Body[])`
Checks if a ball has landed in a bucket.

**Returns**: `{ isInBucket: boolean; isCorrect: boolean; color?: string }`

**Logic**:
- Checks collision with bucket bottoms
- Compares ball color with bucket color
- Returns correct/incorrect status

#### `updateGameState(state: GameState, physics: PhysicsBodies)`
Processes physics and updates game state.

**Behavior**:
- Checks each ball for bucket collision
- Awards points for correct matches
- Penalizes for wrong matches
- Removes balls that fell off screen
- Triggers level up every 5 sorted balls

**Scoring**:
- Correct: `10 × level` points
- Wrong: -5 points

**Level Up**: Every 5 balls sorted, level increases

#### `startGame(state: GameState): GameState`
Starts the game by setting isPlaying to true.

#### `endGame(state: GameState): GameState`
Ends the game by setting isPlaying to false.

#### `cleanupPhysics(physics: PhysicsBodies): void`
Cleans up Matter.js resources.

## Game Progression

### Level System
- Level 1: 10 points per correct sort
- Level 2: 20 points per correct sort
- Level 3+: 30+ points per correct sort

**Level Up**: Every 5 sorted balls

### Scoring System
| Level | Correct | Wrong |
|-------|---------|-------|
| 1 | +10 | -5 |
| 2 | +20 | -5 |
| 3 | +30 | -5 |

### Physics Behavior
- **Gravity**: Balls fall downward
- **Bouncing**: Balls bounce off walls and bucket walls
- **Collision**: Matter.js detects all collisions
- **Removal**: Balls are removed when settled or off-screen

## Technical Notes

### Matter.js Integration
- Uses Matter.Engine for physics simulation
- Bodies created with Bodies.circle/rectangle
- Composite manages world objects
- Collision detection via Matter.Collision.collides()

### Coordinate System
- Canvas-based coordinates
- (0, 0) at top-left
- Spawner at top center
- Buckets at bottom

### Bucket Design
- L-shaped walls guide balls in
- Color-coded bottoms for matching
- 4 buckets evenly spaced
- Each bucket ~80px wide

### Game Events
```typescript
type GameEvent =
  | { type: 'correct'; color: string }
  | { type: 'wrong'; color: string }
  | { type: 'missed' }
  | { type: 'levelup'; level: number };
```

### Edge Cases
- Balls falling off screen are "missed"
- Multiple balls can fall simultaneously
- Level resets but score persists
- Physics cleanup prevents memory leaks

## Design Decisions

### Physics-Based Gameplay
- Realistic ball movement feels natural
- Bouncing creates unpredictable fun
- Teaches basic physics concepts

### Color Learning
- 4 colors provide variety without overwhelming
- Color-coded buckets aid matching
- Clear visual feedback (correct/wrong)

### Progressive Difficulty
- Higher levels = more points per sort
- More balls needed to level up
- Maintains challenge over time

### Scoring Balance
- Positive reinforcement for correct matches
- Small penalty for wrong matches (prevents guessing)
- Level progression rewards skill
