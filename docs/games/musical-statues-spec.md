# Musical Statues - Game Specification

## Overview
**Game ID**: `musical-statues`
**Educational Focus**: Body control, listening skills, impulse control
**Target Age**: 4-8 years
**Code Location**: `src/frontend/src/games/musicalStatuesLogic.ts`

## Game Description
Children dance to music and must freeze when the music stops. The game uses pose detection to determine whether the child stayed still during the freeze period.

## Educational Goals
1. Develop impulse control (stop moving on cue)
2. Practice body awareness and stillness
3. Build listening skills (responding to audio cues)
4. Improve balance and posture

## Game Logic

### Interfaces

```typescript
interface GameState {
  score: number;
  level: number;
  round: number;
  gameActive: boolean;
  isMusicPlaying: boolean;
  timeUntilFreeze: number;        // ms until music stops
  freezeDuration: number;         // ms to hold pose
  isFrozen: boolean;
  moveDuringFreeze: boolean;
  lastPoseSnapshot: any[] | null;
  movementThreshold: number;
  roundsCompleted: number;
  totalRounds: number;
  feedback: string;
  combo: number;
}

interface MovementResult {
  isMoving: boolean;
  movementAmount: number;
  confidence: number;
}
```

### Game Constants

| Constant | Value | Description |
|----------|-------|-------------|
| MUSIC_DURATIONS | [8000, 10000, 12000, 15000] | ms of music before freeze |
| FREEZE_DURATIONS | [3000, 4000, 5000, 6000] | ms to hold freeze pose |
| MOVEMENT_THRESHOLD | 0.05 | Minimum movement to be "moving" |
| COMBO_BONUS | 50 | Points per consecutive success |
| BASE_SCORE | 100 | Points per successful freeze |

### Level Configuration

| Level | Music Duration | Freeze Duration | Total Rounds |
|-------|---------------|-----------------|--------------|
| 1 | 8s | 3s | 5 |
| 2 | 10s | 4s | 6 |
| 3 | 12s | 5s | 7 |
| 4+ | 15s | 6s | 8+ |

Total rounds = 4 + level number.

### Core Functions

#### `initializeGame(level: number = 1): GameState`
Creates a new game state.

**Returns**: GameState with:
- Score = 0, Round = 1, Combo = 0
- Music playing, not frozen
- Progressive durations based on level
- Total rounds = 4 + level

#### `calculatePoseDifference(pose1: any[], pose2: any[]): number`
Calculates total movement between two poses.

**Key Landmarks** (12 points): shoulders, elbows, wrists, hips, knees, ankles

**Formula**:
```
For each key landmark:
  distance = √((x2-x1)² + (y2-y1)² + (z2-z1)²)

Return: totalDistance / 12  (average)
```

Returns 0 for null/empty poses.

#### `detectMovement(landmarks: any[], previousPose: any[] | null, threshold: number): MovementResult`
Determines if the person is currently moving.

**Returns**:
- `isMoving`: movementAmount > threshold
- `movementAmount`: average landmark distance
- `confidence`: min(movementAmount / (threshold * 2), 1)

Returns not moving for null/empty previous pose.

#### `updateGameState(state: GameState, deltaTime: number, currentPose: any[] | null): GameState`
Updates game state based on time and pose.

**Music Playing Phase**:
- Counts down timeUntilFreeze
- At 0: triggers freeze, saves pose snapshot

**Freeze Phase**:
- Checks for movement using detectMovement()
- If moving: sets moveDuringFreeze = true, resets combo
- Counts down freezeDuration

**Round End** (when freezeDuration reaches 0):
- If moved: "Try again" feedback
- If still: awards BASE_SCORE + (combo × COMBO_BONUS), increments combo
- If all rounds complete: gameActive = false
- Otherwise: starts next round with music

#### `shouldAdvanceLevel(state: GameState): boolean`
Returns true if all rounds completed AND game is still active.

#### `advanceLevel(state: GameState): GameState`
Returns initial state for next level (level + 1).

#### `getFeedbackMessage(state: GameState): string`
Returns contextual feedback:
- Music playing: "Dance! Move your body! 🎵" or countdown
- Frozen: "Hold still! {N}s remaining 🗿" or movement detected
- Otherwise: custom feedback message

#### `calculateFinalStats(state: GameState)`
Returns final statistics:
```typescript
{
  score: number,
  level: number,
  roundsCompleted: number,
  totalRounds: number,
  maxCombo: number,
  successRate: percentage  // (roundsCompleted / totalRounds) × 100
}
```

#### `getLevelDisplayName(level: number): string`
Returns level name: "Easy" | "Medium" | "Hard" | "Level N"

## Pose Detection

### Landmark Tracking
The game tracks 12 key body landmarks using MediaPipe-style pose indices:
- Shoulders: 11, 12
- Elbows: 13, 14
- Wrists: 15, 16
- Hips: 23, 24
- Knees: 25, 26
- Ankles: 27, 28

### Movement Calculation
Movement is calculated as 3D Euclidean distance between corresponding landmarks, averaged across all 12 points.

## Game Progression

### Difficulty Scaling
- **Level 1**: 8s dance, 3s freeze, 5 rounds (Easy)
- **Level 2**: 10s dance, 4s freeze, 6 rounds (Medium)
- **Level 3**: 12s dance, 5s freeze, 7 rounds (Hard)
- **Level 4+**: 15s dance, 6s freeze, 8+ rounds

### Scoring System
- Base: 100 points per successful freeze
- Combo bonus: +50 points per consecutive success
- Maximum single round: 100 + (N × 50) where N is current combo

Example combo progression:
- Round 1 success: 100 points (combo = 1)
- Round 2 success: 150 points (combo = 2)
- Round 3 success: 200 points (combo = 3)
- Round 4 fail: 0 points (combo reset to 0)
- Round 5 success: 100 points (combo = 1)

## Technical Notes

### Time Units
- All durations in milliseconds
- deltaTime parameter in milliseconds
- Feedback shows seconds (÷ 1000)

### State Immutability
All state updates return new objects (immutable pattern).

### Edge Cases Handled
- Null/empty poses return 0 movement
- Negative deltaTime clamped
- Invalid level falls back to level 1
- Missing landmarks skipped in calculation

### Design Decisions
- Averaging across 12 landmarks reduces noise
- Combo system rewards consistent performance
- Progressive durations increase challenge naturally
- Movement threshold (0.05) allows for minor swaying
