# Obstacle Course - Game Specification

## Overview
**Game ID**: `obstacle-course`
**Educational Focus**: Gross motor skills, reaction time, body coordination
**Target Age**: 5-10 years
**Code Location**: `src/frontend/src/games/obstacleCourseLogic.ts`

## Game Description
Children must react quickly to obstacles by performing the correct movement (jump, duck, sidestep). The game uses pose detection to recognize when the child performs the required action.

## Educational Goals
1. Develop gross motor coordination
2. Improve reaction time and reflexes
3. Build body awareness and control
4. Practice following instructions quickly

## Game Logic

### Interfaces

```typescript
type ObstacleAction =
  | 'duck'
  | 'jump'
  | 'sidestep-left'
  | 'sidestep-right';

interface ObstacleDefinition {
  id: string;
  action: ObstacleAction;
  label: string;
  instruction: string;
  icon: string;
  lane: number;
  color: string;
  timeLimitMs: number;
}

interface ObstacleCourseRoundState {
  level: number;
  score: number;
  streak: number;
  bestStreak: number;
  currentIndex: number;
  completedObstacles: number;
  missedObstacles: number;
  startedAt: number;
  obstacleStartedAt: number;
  timeRemainingMs: number;
  status: 'playing' | 'complete';
  sequence: ObstacleDefinition[];
}
```

### Obstacle Actions

| Action | Label | Instruction | Icon | Lane | Color |
|--------|-------|-------------|------|------|-------|
| duck | Duck | Duck under the glowing bar. | duck | 1 | #F59E0B |
| jump | Jump | Jump over the rolling log. | jump | 1 | #10B981 |
| sidestep-left | Step Left | Sidestep left around the rocks. | left | 0 | #3B82F6 |
| sidestep-right | Step Right | Sidestep right around the rocks. | right | 2 | #8B5CF6 |

### Game Constants

| Constant | Value | Description |
|----------|-------|-------------|
| BASE_SEQUENCE_LENGTH | 3 | Starting obstacles per round |
| MAX_SEQUENCE_LENGTH | 6 | Maximum obstacles per round |
| ROUND_DURATION_MS | 45000 | Round time limit (45s) |
| BASE_OBSTACLE_WINDOW_MS | 5200 | Starting time per obstacle |
| MIN_OBSTACLE_WINDOW_MS | 2800 | Minimum time per obstacle |
| POINTS_PER_SUCCESS | 25 | Base points per obstacle |
| CONFIDENCE_BONUS_SCALE | 15 | Max confidence bonus |
| STREAK_BONUS | 10 | Bonus for consecutive successes |
| PERFECT_ROUND_BONUS | 60 | Bonus for perfect round |

### Core Functions

#### `createObstacleSequence(level: number, count?): ObstacleDefinition[]`
Creates a sequence of obstacles for a round.

**Behavior**:
- Creates `count` obstacles (default: based on level)
- Obstacles cycle through 4 action types
- Time limit decreases with level

**Sequence Length**: `min(3 + (level - 1), 6)`

**Time Window**: `max(5200 - ((level - 1) × 500), 2800)`

#### `createObstacleCourseRoundState(level: number, now?, carriedScore?, bestStreak?): ObstacleCourseRoundState`
Creates initial round state.

**Parameters**:
- `level`: Level number
- `now`: Current timestamp (default: Date.now())
- `carriedScore`: Previous score (default: 0)
- `bestStreak`: Previous best streak (default: 0)

**Returns**: State with sequence generated, timer started

#### `getCurrentObstacle(state): ObstacleDefinition | null`
Gets the current obstacle from the sequence.

**Returns**: Obstacle at `state.currentIndex` or null if complete.

#### `matchesObstacleAction(obstacle: ObstacleDefinition, movement: MovementSignal | null): boolean`
Checks if movement matches the required action.

**Returns**: `obstacle.action === movement.type`

Returns false for null movement.

#### `advanceObstacleCourseState(state, now?): ObstacleCourseRoundState`
Advances the game state based on time.

**Behavior**:
- Updates time remaining
- Advances to next obstacle if time window expires
- Increments missedObstacles on timeout
- Resets streak on timeout
- Marks complete when sequence done or time expires

#### `completeCurrentObstacle(state, movement: MovementSignal, now?): ObstacleCourseRoundState`
Processes a successful obstacle completion.

**Scoring Formula**:
```
points = POINTS_PER_SUCCESS
        + round(movement.confidence × CONFIDENCE_BONUS_SCALE)
        + (streak > 1 ? STREAK_BONUS : 0)

if (round complete && missedObstacles === 0):
  points += PERFECT_ROUND_BONUS
```

**Behavior**:
- Advances to next obstacle
- Increments streak and completedObstacles
- Updates bestStreak
- Adds score
- Marks complete if sequence done

## Game Progression

### Difficulty Scaling

| Level | Obstacles | Time Window | Difficulty |
|-------|------------|-------------|------------|
| 1 | 3 | 5.2s | Easiest |
| 2 | 4 | 4.7s | Easy |
| 3 | 5 | 4.2s | Medium |
| 4 | 6 | 3.8s | Hard |
| 5 | 6 | 3.3s | Harder |
| 6+ | 6 | 2.8s | Hardest |

### Scoring System

**Base Points**: 25 per obstacle

**Confidence Bonus**: Up to 15 points based on movement confidence (0-1)

**Streak Bonus**: +10 points for streaks > 1

**Perfect Round Bonus**: +60 points for completing all obstacles with zero misses

**Example Scores**:
- Perfect obstacle (confidence 1.0, streak 5): 25 + 15 + 10 = 50
- Perfect round (6 obstacles, no misses): 6 × 50 + 60 = 360
| Level | Max Score (perfect round) |
|-------|------------------------|
| 1 | 6 × 35 + 60 = 270 |
| 2 | 6 × 35 + 60 = 270 |
| 3 | 6 × 35 + 60 = 270 |

### Time Pressure
- **Round Duration**: 45 seconds total
- **Per Obstacle**: Decreases with level
- High levels require very quick reactions (2.8s window)

## Technical Notes

### State Machine
The game state follows this flow:
1. **Playing**: Process obstacles until complete/timeout
2. **Complete**: Round finished (all done or time expired)

### Obstacle Cycling
Obstacles cycle through the 4 actions based on level:
- Level 1: duck, jump, step-left, step-right, duck, jump...
- Level 2: jump, step-left, step-right, duck, jump, step-left...
- Level 3: step-left, step-right, duck, jump, step-left, step-right...

Each level starts at a different offset in the action array.

### Movement Detection
- Relies on pose detection system (MovementSignal)
- Movement has `type` (action name) and `confidence` (0-1)
- Higher confidence = higher score bonus

### Edge Cases
- Null movement doesn't match any action
- Time expiration before sequence complete = missed obstacles
- Carried score allows multi-round play
- Best streak persists across rounds

## Design Decisions

### 4-Action System
- Duck and jump are fundamental movements
- Sidesteps add lateral movement
- Lane system provides visual organization

### Progressive Timing
- Faster windows require quicker reactions
- Capped at 2.8s to prevent impossibility
- Creates clear skill progression

### Streak System
- Rewards consistent performance
- Reset on miss adds challenge
- Best streak tracking encourages improvement

### Perfect Round Bonus
- Large bonus (60 points) for flawless performance
- Incentivizes accuracy over speed
- Makes missed obstacles more meaningful

### Confidence Scoring
- Rewards quality of movement, not just completion
- Higher confidence = higher bonus
- Encourages proper form
