/**
 * Balloon Pop Fitness Game Logic
 *
 * Physical movement game where children pop floating balloons
 * using different full-body actions based on balloon colors.
 *
 * Educational Focus:
 * - Color recognition
 * - Gross motor skills
 * - Body awareness
 * - Following instructions
 *
 * Balloon Colors:
 * - Red 🔴: Jump and touch
 * - Blue 🔵: Wave hand
 * - Yellow 🟡: Clap hands
 */

// ===== TYPES =====

export interface Balloon {
  id: string;
  x: number; // Normalized position 0-1
  y: number;
  size: number; // Normalized size
  color: 'red' | 'blue' | 'yellow';
  speed: number; // Vertical speed
  action: 'jump' | 'wave' | 'clap';
  popped: boolean;
  createdAt: number;
}

export interface GameState {
  balloons: Balloon[];
  score: number;
  level: number;
  timeRemaining: number;
  gameActive: boolean;
  combo: number;
  lastPopTime: number;
}

export interface PopAction {
  type: 'jump' | 'wave' | 'clap';
  detected: boolean;
  confidence: number;
  timestamp: number;
}

// ===== GAME CONFIGURATION =====

export const BALLOON_COLORS = {
  red: '#EF4444',
  blue: '#3B82F6',
  yellow: '#EAB308',
} as const;

export const BALLOON_ACTIONS = {
  red: 'jump' as const,
  blue: 'wave' as const,
  yellow: 'clap' as const,
};

export const GAME_CONFIG = {
  SPAWN_INTERVAL: 2000, // ms between balloon spawns
  GAME_DURATION: 60000, // 60 seconds per game
  COMBO_WINDOW: 2000, // ms for combo timing
  BASE_SPEED: 0.0003, // Base upward speed (normalized per ms)
  SPEED_INCREMENT: 0.00005, // Speed increase per level
  MAX_BALLOONS: 8, // Maximum balloons on screen
  POP_THRESHOLD: 0.15, // Distance threshold for collision detection
  LEVEL_DURATION: 30000, // 30 seconds per level
  POINTS_PER_POP: 10,
  COMBO_MULTIPLIER: 1.5,
};

// ===== BALLOON GENERATION =====

/**
 * Generate a random balloon with appropriate color and action
 */
export function generateBalloon(level: number): Balloon {
  const colors: Array<'red' | 'blue' | 'yellow'> = ['red', 'blue', 'yellow'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return {
    id: `balloon-${Date.now()}-${Math.random()}`,
    x: 0.1 + Math.random() * 0.8, // Keep within 10%-90% of screen width
    y: 1.1, // Start below screen
    size: 0.08 + (Math.random() * 0.04), // Random size variation
    color,
    speed: GAME_CONFIG.BASE_SPEED + (level * GAME_CONFIG.SPEED_INCREMENT),
    action: BALLOON_ACTIONS[color],
    popped: false,
    createdAt: Date.now(),
  };
}

/**
 * Update balloon positions and remove off-screen balloons
 */
export function updateBalloons(
  balloons: Balloon[],
  deltaTime: number
): Balloon[] {
  return balloons
    .map(balloon => ({
      ...balloon,
      y: balloon.y - (balloon.speed * deltaTime),
    }))
    .filter(balloon =>
      !balloon.popped && balloon.y > -0.2 // Remove popped or off-screen
    );
}

/**
 * Check if new balloon should spawn based on timing
 */
export function shouldSpawnBalloon(
  lastSpawnTime: number,
  currentBalloonCount: number
): boolean {
  const timeSinceLastSpawn = Date.now() - lastSpawnTime;
  return (
    timeSinceLastSpawn >= GAME_CONFIG.SPAWN_INTERVAL &&
    currentBalloonCount < GAME_CONFIG.MAX_BALLOONS
  );
}

// ===== COLLISION DETECTION =====

/**
 * Check collision between body point and balloon
 */
export function checkBalloonCollision(
  balloon: Balloon,
  bodyPoint: { x: number; y: number } | null
): boolean {
  if (!bodyPoint || balloon.popped) return false;

  const dx = bodyPoint.x - balloon.x;
  const dy = bodyPoint.y - balloon.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance < (balloon.size + GAME_CONFIG.POP_THRESHOLD);
}

/**
 * Check multiple body points for balloon collision
 */
export function checkBodyCollisions(
  balloon: Balloon,
  bodyPoints: Array<{ x: number; y: number } | null>
): boolean {
  return bodyPoints.some(point => checkBalloonCollision(balloon, point));
}

// ===== ACTION DETECTION =====

/**
 * Detect jump action from pose landmarks
 */
export function detectJumpAction(landmarks: any[]): PopAction {
  if (!landmarks || landmarks.length < 25) {
    return { type: 'jump', detected: false, confidence: 0, timestamp: Date.now() };
  }

  // Check if feet are significantly higher than hips (jumping)
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  if (!leftHip || !rightHip || !leftAnkle || !rightAnkle) {
    return { type: 'jump', detected: false, confidence: 0, timestamp: Date.now() };
  }

  const hipY = (leftHip.y + rightHip.y) / 2;
  const ankleY = (leftAnkle.y + rightAnkle.y) / 2;

  // In normalized coordinates, lower values = higher on screen
  // Jumping detected when ankles are significantly above hips
  const jumpThreshold = 0.15; // Minimum jump height
  const jumpDetected = ankleY < (hipY - jumpThreshold);

  return {
    type: 'jump',
    detected: jumpDetected,
    confidence: jumpDetected ? 0.8 : 0,
    timestamp: Date.now(),
  };
}

/**
 * Detect wave action from pose landmarks
 */
export function detectWaveAction(landmarks: any[]): PopAction {
  if (!landmarks || landmarks.length < 17) {
    return { type: 'wave', detected: false, confidence: 0, timestamp: Date.now() };
  }

  // Check for waving motion (one arm raised and moving)
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];

  if (!leftShoulder || !rightShoulder || !leftWrist || !rightWrist) {
    return { type: 'wave', detected: false, confidence: 0, timestamp: Date.now() };
  }

  // Check if one wrist is significantly higher than shoulders
  const shoulderY = Math.min(leftShoulder.y, rightShoulder.y);
  const leftWristRaised = leftWrist.y < (shoulderY - 0.2);
  const rightWristRaised = rightWrist.y < (shoulderY - 0.2);

  const waveDetected = leftWristRaised || rightWristRaised;

  return {
    type: 'wave',
    detected: waveDetected,
    confidence: waveDetected ? 0.75 : 0,
    timestamp: Date.now(),
  };
}

/**
 * Detect clap action from pose landmarks
 */
export function detectClapAction(landmarks: any[]): PopAction {
  if (!landmarks || landmarks.length < 17) {
    return { type: 'clap', detected: false, confidence: 0, timestamp: Date.now() };
  }

  // Check for clapping motion (hands together)
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];

  if (!leftWrist || !rightWrist) {
    return { type: 'clap', detected: false, confidence: 0, timestamp: Date.now() };
  }

  // Calculate distance between wrists
  const dx = leftWrist.x - rightWrist.x;
  const dy = leftWrist.y - rightWrist.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Clap detected when hands are close together
  const clapThreshold = 0.15; // Maximum distance for clap
  const clapDetected = distance < clapThreshold;

  return {
    type: 'clap',
    detected: clapDetected,
    confidence: clapDetected ? (1 - distance / clapThreshold) : 0,
    timestamp: Date.now(),
  };
}

/**
 * Detect all available actions from pose landmarks
 */
export function detectAllActions(landmarks: any[]): PopAction[] {
  return [
    detectJumpAction(landmarks),
    detectWaveAction(landmarks),
    detectClapAction(landmarks),
  ];
}

// ===== GAME STATE MANAGEMENT =====

/**
 * Initialize game state
 */
export function initializeGame(level: number = 1): GameState {
  return {
    balloons: [],
    score: 0,
    level,
    timeRemaining: GAME_CONFIG.GAME_DURATION,
    gameActive: true,
    combo: 0,
    lastPopTime: 0,
  };
}

/**
 * Process balloon pops and update score
 */
export function processPops(
  gameState: GameState,
  detectedActions: PopAction[]
): { updatedState: GameState; poppedBalloons: Balloon[] } {
  const poppedBalloons: Balloon[] = [];
  const updatedBalloons = gameState.balloons.map(balloon => {
    if (balloon.popped) return balloon;

    // Check if the required action for this balloon is detected
    const matchingAction = detectedActions.find(
      action => action.type === balloon.action && action.detected
    );

    if (matchingAction && matchingAction.confidence > 0.5) {
      poppedBalloons.push({
        ...balloon,
        popped: true,
      });

      return { ...balloon, popped: true };
    }

    return balloon;
  });

  // Calculate new score and combo
  const comboMultiplier = poppedBalloons.length > 1 ? GAME_CONFIG.COMBO_MULTIPLIER : 1;
  const newScore = gameState.score + poppedBalloons.reduce((sum) =>
    sum + Math.floor(GAME_CONFIG.POINTS_PER_POP * comboMultiplier), 0
  );

  const newCombo = poppedBalloons.length > 0 ? gameState.combo + poppedBalloons.length : 0;

  return {
    updatedState: {
      ...gameState,
      balloons: updatedBalloons,
      score: newScore,
      combo: newCombo,
      lastPopTime: poppedBalloons.length > 0 ? Date.now() : gameState.lastPopTime,
    },
    poppedBalloons,
  };
}

/**
 * Update game timer and check for level completion
 */
export function updateGameTimer(
  gameState: GameState,
  deltaTime: number
): GameState {
  const newTimeRemaining = Math.max(0, gameState.timeRemaining - deltaTime);

  return {
    ...gameState,
    timeRemaining: newTimeRemaining,
    gameActive: newTimeRemaining > 0,
  };
}

/**
 * Check if level should be advanced
 */
export function shouldAdvanceLevel(gameState: GameState): boolean {
  const levelTimeElapsed = GAME_CONFIG.LEVEL_DURATION -
    (GAME_CONFIG.GAME_DURATION - gameState.timeRemaining) % GAME_CONFIG.LEVEL_DURATION;

  return levelTimeElapsed >= GAME_CONFIG.LEVEL_DURATION && gameState.timeRemaining > 0;
}

/**
 * Advance to next level
 */
export function advanceLevel(gameState: GameState): GameState {
  return {
    ...gameState,
    level: gameState.level + 1,
  };
}

// ===== UTILITY FUNCTIONS =====

/**
 * Get display text for balloon action
 */
export function getActionText(action: 'jump' | 'wave' | 'clap'): string {
  const actionTexts = {
    jump: '🔴 Jump and touch!',
    wave: '🔵 Wave your hand!',
    clap: '🟡 Clap your hands!',
  };
  return actionTexts[action];
}

/**
 * Get balloon emoji for display
 */
export function getBalloonEmoji(color: 'red' | 'blue' | 'yellow'): string {
  switch (color) {
    case 'red':
      return '🔴';
    case 'blue':
      return '🔵';
    case 'yellow':
      return '🟡';
  }
}

/**
 * Calculate final game statistics
 */
export function calculateFinalStats(gameState: GameState) {
  return {
    score: gameState.score,
    level: gameState.level,
    maxCombo: gameState.combo,
    balloonsPopped: gameState.balloons.filter(b => b.popped).length,
    accuracy: gameState.balloons.length > 0
      ? (gameState.balloons.filter(b => b.popped).length / gameState.balloons.length) * 100
      : 0,
  };
}