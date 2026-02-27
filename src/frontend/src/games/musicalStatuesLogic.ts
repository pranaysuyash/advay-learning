/**
 * Musical Statues Game Logic
 *
 * Children dance to music and freeze when it stops.
 * Game detects movement vs stillness using pose landmarks.
 */

export interface GameState {
  score: number;
  level: number;
  round: number;
  gameActive: boolean;
  isMusicPlaying: boolean;
  timeUntilFreeze: number; // ms until music stops
  freezeDuration: number; // ms to hold pose
  isFrozen: boolean;
  moveDuringFreeze: boolean;
  lastPoseSnapshot: any[] | null;
  movementThreshold: number;
  roundsCompleted: number;
  totalRounds: number;
  feedback: string;
  combo: number;
}

export interface MovementResult {
  isMoving: boolean;
  movementAmount: number;
  confidence: number;
}

// Game constants
const MUSIC_DURATIONS = [8000, 10000, 12000, 15000]; // Progressive music durations
const FREEZE_DURATIONS = [3000, 4000, 5000, 6000]; // Progressive freeze durations
const MOVEMENT_THRESHOLD = 0.05; // Minimum movement to be considered "moving"
const COMBO_BONUS = 50; // Points for consecutive successful freezes
const BASE_SCORE = 100; // Points per successful freeze

/**
 * Initialize a new game
 */
export function initializeGame(level: number = 1): GameState {
  return {
    score: 0,
    level,
    round: 1,
    gameActive: true,
    isMusicPlaying: true,
    timeUntilFreeze: MUSIC_DURATIONS[Math.min(level - 1, MUSIC_DURATIONS.length - 1)],
    freezeDuration: FREEZE_DURATIONS[Math.min(level - 1, FREEZE_DURATIONS.length - 1)],
    isFrozen: false,
    moveDuringFreeze: false,
    lastPoseSnapshot: null,
    movementThreshold: MOVEMENT_THRESHOLD,
    roundsCompleted: 0,
    totalRounds: 4 + level, // More rounds at higher levels
    feedback: 'Dance! 🎵',
    combo: 0,
  };
}

/**
 * Calculate pose difference between two snapshots
 */
export function calculatePoseDifference(pose1: any[], pose2: any[]): number {
  if (!pose1 || !pose2 || pose1.length === 0 || pose2.length === 0) {
    return 0;
  }

  let totalMovement = 0;
  const keyLandmarks = [
    11, 12, // shoulders
    13, 14, // elbows
    15, 16, // wrists
    23, 24, // hips
    25, 26, // knees
    27, 28, // ankles
  ];

  for (const landmarkIndex of keyLandmarks) {
    if (pose1[landmarkIndex] && pose2[landmarkIndex]) {
      const dx = pose1[landmarkIndex].x - pose2[landmarkIndex].x;
      const dy = pose1[landmarkIndex].y - pose2[landmarkIndex].y;
      const dz = pose1[landmarkIndex].z - pose2[landmarkIndex].z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      totalMovement += distance;
    }
  }

  return totalMovement / keyLandmarks.length;
}

/**
 * Detect if the person is moving
 */
export function detectMovement(landmarks: any[], previousPose: any[] | null, threshold: number): MovementResult {
  if (!previousPose || previousPose.length === 0) {
    return {
      isMoving: false,
      movementAmount: 0,
      confidence: 0,
    };
  }

  const movementAmount = calculatePoseDifference(landmarks, previousPose);
  const isMoving = movementAmount > threshold;

  // Confidence increases with more movement
  const confidence = Math.min(movementAmount / (threshold * 2), 1);

  return {
    isMoving,
    movementAmount,
    confidence,
  };
}

/**
 * Update game state based on music/freeze cycle
 */
export function updateGameState(
  state: GameState,
  deltaTime: number,
  currentPose: any[] | null
): GameState {
  let updatedState = { ...state };

  if (state.isMusicPlaying) {
    // Music is playing, count down to freeze
    updatedState.timeUntilFreeze = Math.max(0, state.timeUntilFreeze - deltaTime);

    if (updatedState.timeUntilFreeze === 0) {
      // Music stops, freeze!
      updatedState = {
        ...updatedState,
        isMusicPlaying: false,
        isFrozen: true,
        freezeDuration: FREEZE_DURATIONS[Math.min(state.level - 1, FREEZE_DURATIONS.length - 1)],
        lastPoseSnapshot: currentPose,
        feedback: 'FREEZE! 🗿',
      };
    }
  } else if (state.isFrozen) {
    // Check for movement during freeze
    if (currentPose && state.lastPoseSnapshot) {
      const movementResult = detectMovement(
        currentPose,
        state.lastPoseSnapshot,
        state.movementThreshold
      );

      if (movementResult.isMoving) {
        updatedState = {
          ...updatedState,
          moveDuringFreeze: true,
          feedback: 'Oops! You moved! ❌',
          combo: 0,
        };
      }
    }

    // Count down freeze duration
    updatedState.freezeDuration = Math.max(0, state.freezeDuration - deltaTime);

    if (updatedState.freezeDuration === 0) {
      // Freeze period ends
      if (updatedState.moveDuringFreeze) {
        // Player moved, round failed
        updatedState = {
          ...updatedState,
          isFrozen: false,
          feedback: 'Try again next round! 💪',
          moveDuringFreeze: false,
        };
      } else {
        // Player stayed frozen, round successful
        const roundScore = BASE_SCORE + (updatedState.combo * COMBO_BONUS);
        updatedState = {
          ...updatedState,
          score: updatedState.score + roundScore,
          roundsCompleted: updatedState.roundsCompleted + 1,
          combo: updatedState.combo + 1,
          isFrozen: false,
          feedback: `Great! +${roundScore} points! 🎉`,
        };
      }

      // Check if game should continue
      if (updatedState.roundsCompleted >= updatedState.totalRounds) {
        updatedState = {
          ...updatedState,
          gameActive: false,
          feedback: 'Game Complete! 🎵',
        };
      } else {
        // Start next round
        updatedState = {
          ...updatedState,
          round: updatedState.round + 1,
          isMusicPlaying: true,
          timeUntilFreeze: MUSIC_DURATIONS[Math.min(state.level - 1, MUSIC_DURATIONS.length - 1)],
          lastPoseSnapshot: null,
        };
      }
    }
  }

  return updatedState;
}

/**
 * Check if level should advance
 */
export function shouldAdvanceLevel(state: GameState): boolean {
  return state.roundsCompleted >= state.totalRounds && state.gameActive;
}

/**
 * Advance to next level
 */
export function advanceLevel(state: GameState): GameState {
  const nextLevel = state.level + 1;
  return initializeGame(nextLevel);
}

/**
 * Get feedback message based on game state
 */
export function getFeedbackMessage(state: GameState): string {
  if (state.isMusicPlaying) {
    const timeLeft = Math.ceil(state.timeUntilFreeze / 1000);
    if (timeLeft <= 3) {
      return `Get ready to freeze in ${timeLeft}... ⏰`;
    }
    return 'Dance! Move your body! 🎵';
  }

  if (state.isFrozen) {
    if (state.moveDuringFreeze) {
      return 'Oh no! You moved! ❌';
    }
    const timeLeft = Math.ceil(state.freezeDuration / 1000);
    return `Hold still! ${timeLeft}s remaining 🗿`;
  }

  return state.feedback;
}

/**
 * Calculate final stats
 */
export function calculateFinalStats(state: GameState) {
  return {
    score: state.score,
    level: state.level,
    roundsCompleted: state.roundsCompleted,
    totalRounds: state.totalRounds,
    maxCombo: state.combo,
    successRate: (state.roundsCompleted / state.totalRounds) * 100,
  };
}

/**
 * Get level display name
 */
export function getLevelDisplayName(level: number): string {
  if (level === 1) return 'Easy';
  if (level === 2) return 'Medium';
  if (level === 3) return 'Hard';
  return `Level ${level}`;
}