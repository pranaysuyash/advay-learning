/**
 * Freeze Dance Game Logic
 *
 * Dance when music plays, freeze when it stops.
 * Tests stability and pose control for motor skills development.
 *
 * Educational Focus:
 * - Body awareness and control
 * - Listening skills
 * - Self-regulation
 * - Gross motor skills
 *
 * @ticket GQ-002, GQ-003
 */

// ===== TYPES =====

export type GamePhase = 'dancing' | 'freezing' | 'fingerChallenge';
export type GameMode = 'classic' | 'combo';

export interface Landmark {
  x: number;
  y: number;
  z?: number;
}

export interface FreezeDanceState {
  score: number;
  round: number;
  gamePhase: GamePhase;
  gameMode: GameMode;
  stabilityScore: number;
  perfectFreezeStreak: number;
  streak: number;
  isPlaying: boolean;
  targetFingers: number;
  detectedFingers: number;
  fingerChallengeComplete: boolean;
}

export interface PhaseConfig {
  danceMin: number;
  danceMax: number;
  freeze: number;
  fingerChallenge: number;
}

// ===== GAME CONFIGURATION =====

export const PHASE_CONFIG: PhaseConfig = {
  danceMin: 10000,      // 10 seconds
  danceMax: 13000,      // 13 seconds
  freeze: 3500,         // 3.5 seconds
  fingerChallenge: 6000, // 6 seconds
};

export const GAME_CONFIG = {
  PERFECT_FREEZE_THRESHOLD: 80,
  FINGER_CHALLENGE_ROUND_THRESHOLD: 2,
  FINGER_CHALLENGE_STABILITY_THRESHOLD: 60,
  STABILITY_MOVEMENT_MULTIPLIER: 500,
  EASTER_EGG_STREAK_THRESHOLD: 5,
  KEY_POINTS: [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28],
} as const;

// ===== STABILITY SCORING =====

/**
 * Calculate stability score from pose movement.
 * Lower movement = higher stability score.
 */
export function calculateStability(
  currentLandmarks: Landmark[],
  previousLandmarks: Landmark[],
): number {
  let totalMovement = 0;

  for (const index of GAME_CONFIG.KEY_POINTS) {
    const current = currentLandmarks[index];
    const previous = previousLandmarks[index];

    if (!current || !previous) continue;

    const dx = current.x - previous.x;
    const dy = current.y - previous.y;
    totalMovement += Math.sqrt(dx * dx + dy * dy);
  }

  // Stability score = max(0, 100 - movement × 500)
  return Math.max(0, 100 - totalMovement * GAME_CONFIG.STABILITY_MOVEMENT_MULTIPLIER);
}

/**
 * Check if a freeze qualifies as "perfect" (>80% stability).
 */
export function isPerfectFreeze(stabilityScore: number): boolean {
  return stabilityScore > GAME_CONFIG.PERFECT_FREEZE_THRESHOLD;
}

// ===== PHASE MANAGEMENT =====

/**
 * Get random dance phase duration within configured range.
 */
export function getRandomDanceDuration(): number {
  return PHASE_CONFIG.danceMin + Math.random() * (PHASE_CONFIG.danceMax - PHASE_CONFIG.danceMin);
}

/**
 * Check if finger challenge should trigger based on game state.
 */
export function shouldTriggerFingerChallenge(state: FreezeDanceState): boolean {
  return (
    state.gameMode === 'combo' &&
    state.round > GAME_CONFIG.FINGER_CHALLENGE_ROUND_THRESHOLD &&
    state.stabilityScore > GAME_CONFIG.FINGER_CHALLENGE_STABILITY_THRESHOLD
  );
}

/**
 * Generate a random target finger count for finger challenge (0-5).
 */
export function generateTargetFingers(): number {
  return Math.floor(Math.random() * 6);
}

// ===== GAME STATE MANAGEMENT =====

/**
 * Initialize a new game state.
 */
export function initializeGame(mode: GameMode = 'combo'): FreezeDanceState {
  return {
    score: 0,
    round: 1,
    gamePhase: 'dancing',
    gameMode: mode,
    stabilityScore: 100,
    perfectFreezeStreak: 0,
    streak: 0,
    isPlaying: false,
    targetFingers: 0,
    detectedFingers: 0,
    fingerChallengeComplete: false,
  };
}

/**
 * Start the game.
 */
export function startGame(state: FreezeDanceState): FreezeDanceState {
  return {
    ...state,
    isPlaying: true,
    gamePhase: 'dancing',
    score: 0,
    round: 1,
    stabilityScore: 100,
    perfectFreezeStreak: 0,
    streak: 0,
  };
}

/**
 * Stop the game and reset state.
 */
export function stopGame(state: FreezeDanceState): FreezeDanceState {
  return {
    ...initializeGame(state.gameMode),
    isPlaying: false,
  };
}

/**
 * Complete a round and update scores.
 */
export function completeRound(
  state: FreezeDanceState,
  success: boolean,
  roundScore: number,
): FreezeDanceState {
  if (!success) {
    return {
      ...state,
      streak: 0,
      perfectFreezeStreak: 0,
      round: state.round + 1,
      gamePhase: 'dancing',
    };
  }

  const newStreak = state.streak + 1;
  const newPerfectStreak = isPerfectFreeze(roundScore)
    ? state.perfectFreezeStreak + 1
    : 0;

  return {
    ...state,
    score: state.score + roundScore,
    streak: newStreak,
    perfectFreezeStreak: newPerfectStreak,
    round: state.round + 1,
    gamePhase: 'dancing',
  };
}

/**
 * Transition to freeze phase.
 */
export function startFreezePhase(state: FreezeDanceState): FreezeDanceState {
  return {
    ...state,
    gamePhase: 'freezing',
    stabilityScore: 100,
  };
}

/**
 * Transition to finger challenge phase.
 */
export function startFingerChallenge(state: FreezeDanceState): FreezeDanceState {
  return {
    ...state,
    gamePhase: 'fingerChallenge',
    targetFingers: generateTargetFingers(),
    detectedFingers: 0,
    fingerChallengeComplete: false,
  };
}

/**
 * Update detected finger count during finger challenge.
 */
export function updateDetectedFingers(
  state: FreezeDanceState,
  fingerCount: number,
): FreezeDanceState {
  const complete = fingerCount === state.targetFingers;
  return {
    ...state,
    detectedFingers: fingerCount,
    fingerChallengeComplete: complete || state.fingerChallengeComplete,
  };
}

// ===== UTILITY FUNCTIONS =====

/**
 * Get display text for current game phase.
 */
export function getPhaseText(phase: GamePhase, targetFingers?: number): string {
  switch (phase) {
    case 'dancing':
      return 'DANCE!';
    case 'freezing':
      return 'FREEZE!';
    case 'fingerChallenge':
      return targetFingers !== undefined ? `SHOW ${targetFingers}!` : 'FINGERS!';
    default:
      return '';
  }
}

/**
 * Get phase color for UI theming.
 */
export function getPhaseColor(phase: GamePhase): string {
  switch (phase) {
    case 'dancing':
      return '#3B82F6'; // Blue
    case 'freezing':
      return '#EF4444'; // Red
    case 'fingerChallenge':
      return '#A855F7'; // Purple
    default:
      return '#6B7280'; // Gray
  }
}

/**
 * Calculate final game statistics.
 */
export function calculateFinalStats(state: FreezeDanceState) {
  return {
    score: state.score,
    round: state.round,
    maxStreak: state.streak,
    perfectFreezes: state.perfectFreezeStreak,
  };
}

/**
 * Check if easter egg should trigger (5 perfect freezes in a row).
 */
export function shouldTriggerEasterEgg(state: FreezeDanceState): boolean {
  return state.perfectFreezeStreak >= GAME_CONFIG.EASTER_EGG_STREAK_THRESHOLD;
}
