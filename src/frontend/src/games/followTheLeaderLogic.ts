/**
 * Follow the Leader Game Logic
 *
 * Children mirror movement patterns demonstrated by a guide character.
 * Builds imitation skills, motor planning, and body awareness.
 *
 * Educational Focus:
 * - Motor planning and coordination
 * - Imitation and following instructions
 * - Body awareness and spatial reasoning
 * - Animal movement vocabulary
 *
 * Movement Patterns:
 * - Walk like a penguin 🐧
 * - Hop like a frog 🐸
 * - Tiptoe quietly 👣
 * - March like a soldier 🎖️
 * - Fly like a bird 🐦
 * - Swim like a fish 🐟
 */

import { calculateAngle } from '../utils/geometry';

// ===== TYPES =====

export interface MovementPattern {
  id: string;
  name: string;
  instruction: string;
  emoji: string;
  // Target pose landmarks for validation
  targetPose: {
    // Key body positions and angles
    leftArmAngle?: number;
    rightArmAngle?: number;
    leftLegAngle?: number;
    rightLegAngle?: number;
    torsoAngle?: number;
    bodyHeight?: number; // Normalized height (for crouching vs standing)
    armSpread?: number; // Distance between hands
  };
  // Tolerance for validation (0-1, higher = more lenient)
  tolerance: number;
  // Duration to hold the pose (ms)
  duration: number;
}

export interface GameState {
  currentPattern: MovementPattern | null;
  progress: number; // 0-1, how well they're matching
  holdTime: number; // How long they've held the pose correctly
  score: number;
  level: number;
  completedMovements: number;
  gameActive: boolean;
  feedback: string;
}

export interface PoseMatchResult {
  matches: boolean;
  confidence: number; // 0-1
  feedback: string;
  missingElements: string[];
}

// ===== MOVEMENT PATTERNS =====

export const MOVEMENT_PATTERNS: MovementPattern[] = [
  {
    id: 'penguin-walk',
    name: 'Penguin Walk',
    instruction: 'Walk like a penguin! Keep your arms stiff by your sides and waddle side to side.',
    emoji: '🐧',
    targetPose: {
      leftArmAngle: 10, // Arms straight down
      rightArmAngle: 10,
      torsoAngle: 5, // Upright
      bodyHeight: 0.5, // Standing
    },
    tolerance: 0.6,
    duration: 3000,
  },
  {
    id: 'frog-hop',
    name: 'Frog Hop',
    instruction: 'Hop like a frog! Crouch down with hands on the ground, then jump up!',
    emoji: '🐸',
    targetPose: {
      leftArmAngle: 90, // Arms forward/down
      rightArmAngle: 90,
      leftLegAngle: 30, // Bent legs
      rightLegAngle: 30,
      torsoAngle: -20, // Leaning forward
      bodyHeight: 0.3, // Crouching
    },
    tolerance: 0.5,
    duration: 2000,
  },
  {
    id: 'tiptoe-quiet',
    name: 'Tiptoe Quietly',
    instruction: 'Tiptoe quietly! Walk softly on your toes with arms out for balance.',
    emoji: '👣',
    targetPose: {
      leftArmAngle: 80, // Arms out for balance
      rightArmAngle: 80,
      torsoAngle: 5, // Upright
      bodyHeight: 0.6, // On toes
    },
    tolerance: 0.7,
    duration: 4000,
  },
  {
    id: 'march-soldier',
    name: 'March Like a Soldier',
    instruction: 'March like a soldier! Swing your arms and lift your knees high.',
    emoji: '🎖️',
    targetPose: {
      leftArmAngle: 120, // One arm forward
      rightArmAngle: 60, // One arm back
      leftLegAngle: 90, // One leg lifted
      torsoAngle: 0, // Upright
      bodyHeight: 0.6, // Standing on one leg
    },
    tolerance: 0.5,
    duration: 3000,
  },
  {
    id: 'fly-bird',
    name: 'Fly Like a Bird',
    instruction: 'Fly like a bird! Flap your wings up and down while moving your arms.',
    emoji: '🐦',
    targetPose: {
      leftArmAngle: 170, // Arms up high
      rightArmAngle: 170,
      torsoAngle: 0,
      bodyHeight: 0.6,
    },
    tolerance: 0.6,
    duration: 4000,
  },
  {
    id: 'swim-fish',
    name: 'Swim Like a Fish',
    instruction: 'Swim like a fish! Make swimming motions with your arms and move your body.',
    emoji: '🐟',
    targetPose: {
      leftArmAngle: 45, // Swimming motion
      rightArmAngle: 45,
      torsoAngle: 10, // Slight body movement
      bodyHeight: 0.5,
    },
    tolerance: 0.7,
    duration: 3000,
  },
];

// ===== GAME CONFIGURATION =====

export const GAME_CONFIG = {
  LEVEL_DURATION: 45000, // 45 seconds per level
  MOVEMENTS_PER_LEVEL: 4,
  HOLD_THRESHOLD: 2000, // Minimum time to hold pose (ms)
  SCORE_PER_MOVEMENT: 25,
  BONUS_PERFECT_MATCH: 10,
  LEVEL_BONUS: 50,
};

// ===== POSE MATCHING =====

/**
 * Check if current pose matches target pattern
 */
export function checkPoseMatch(
  landmarks: any[],
  pattern: MovementPattern
): PoseMatchResult {
  if (!landmarks || landmarks.length < 25) {
    return {
      matches: false,
      confidence: 0,
      feedback: 'Cannot see your full body. Step back so the camera can see you!',
      missingElements: [],
    };
  }

  const missingElements: string[] = [];
  const scores: number[] = [];

  // Extract key landmarks
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  // Check required landmarks exist
  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
    return {
      matches: false,
      confidence: 0,
      feedback: 'Please stand back so I can see your whole body!',
      missingElements: [],
    };
  }

  // Validate arm angles if specified
  if (pattern.targetPose.leftArmAngle !== undefined) {
    if (leftElbow && leftWrist) {
      const currentAngle = calculateAngle(leftWrist, leftElbow, leftShoulder);
      const targetAngle = pattern.targetPose.leftArmAngle;
      const angleDiff = Math.abs(currentAngle - targetAngle);
      const angleScore = Math.max(0, 1 - angleDiff / 180);
      scores.push(angleScore);

      if (angleDiff > 30) {
        missingElements.push('left arm position');
      }
    } else {
      missingElements.push('left arm');
    }
  }

  if (pattern.targetPose.rightArmAngle !== undefined) {
    if (rightElbow && rightWrist) {
      const currentAngle = calculateAngle(rightWrist, rightElbow, rightShoulder);
      const targetAngle = pattern.targetPose.rightArmAngle;
      const angleDiff = Math.abs(currentAngle - targetAngle);
      const angleScore = Math.max(0, 1 - angleDiff / 180);
      scores.push(angleScore);

      if (angleDiff > 30) {
        missingElements.push('right arm position');
      }
    } else {
      missingElements.push('right arm');
    }
  }

  // Validate leg angles if specified
  if (pattern.targetPose.leftLegAngle !== undefined) {
    if (leftKnee && leftAnkle) {
      const currentAngle = calculateAngle(leftAnkle, leftKnee, leftHip);
      const targetAngle = pattern.targetPose.leftLegAngle;
      const angleDiff = Math.abs(currentAngle - targetAngle);
      const angleScore = Math.max(0, 1 - angleDiff / 180);
      scores.push(angleScore);

      if (angleDiff > 30) {
        missingElements.push('left leg position');
      }
    } else {
      missingElements.push('left leg');
    }
  }

  if (pattern.targetPose.rightLegAngle !== undefined) {
    if (rightKnee && rightAnkle) {
      const currentAngle = calculateAngle(rightAnkle, rightKnee, rightHip);
      const targetAngle = pattern.targetPose.rightLegAngle;
      const angleDiff = Math.abs(currentAngle - targetAngle);
      const angleScore = Math.max(0, 1 - angleDiff / 180);
      scores.push(angleScore);
    } else {
      missingElements.push('right leg');
    }
  }

  // Validate body height if specified
  if (pattern.targetPose.bodyHeight !== undefined) {
    if (leftAnkle && rightAnkle) {
      const hipY = (leftHip.y + rightHip.y) / 2;
      const ankleY = (leftAnkle.y + rightAnkle.y) / 2;
      const currentHeight = Math.abs(hipY - ankleY);
      const targetHeight = pattern.targetPose.bodyHeight;
      const heightDiff = Math.abs(currentHeight - targetHeight);
      const heightScore = Math.max(0, 1 - heightDiff);
      scores.push(heightScore);

      if (heightDiff > 0.2) {
        missingElements.push('body height');
      }
    }
  }

  // Calculate overall confidence
  const confidence = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  // Determine if pose matches
  const matches = confidence >= pattern.tolerance;

  // Generate feedback
  let feedback = '';
  if (matches && confidence > 0.8) {
    feedback = 'Perfect! You\'re doing great!';
  } else if (matches) {
    feedback = 'Good job! Keep it up!';
  } else if (missingElements.length > 0) {
    feedback = `Try to adjust your ${missingElements.slice(0, 2).join(' and ')}`;
  } else {
    feedback = 'Almost there! Keep trying!';
  }

  return {
    matches,
    confidence,
    feedback,
    missingElements,
  };
}

// ===== GAME STATE MANAGEMENT =====

/**
 * Initialize game state
 */
export function initializeGame(level: number = 1): GameState {
  return {
    currentPattern: MOVEMENT_PATTERNS[0],
    progress: 0,
    holdTime: 0,
    score: 0,
    level,
    completedMovements: 0,
    gameActive: true,
    feedback: 'Get ready to move!',
  };
}

/**
 * Get next movement pattern
 */
export function getNextPattern(currentPatternId: string, _level: number): MovementPattern {
  const currentIndex = MOVEMENT_PATTERNS.findIndex(p => p.id === currentPatternId);
  const availablePatterns = MOVEMENT_PATTERNS.filter((_, index) =>
    index >= currentIndex + 1 && index < currentIndex + 1 + GAME_CONFIG.MOVEMENTS_PER_LEVEL
  );

  if (availablePatterns.length === 0) {
    // Loop back to start with higher difficulty
    return MOVEMENT_PATTERNS[Math.floor(Math.random() * MOVEMENT_PATTERNS.length)];
  }

  return availablePatterns[0];
}

/**
 * Update game state based on pose matching
 */
export function updateGameState(
  gameState: GameState,
  poseMatch: PoseMatchResult,
  deltaTime: number
): GameState {
  if (!gameState.currentPattern || !gameState.gameActive) {
    return gameState;
  }

  if (poseMatch.matches) {
    // Player is correctly matching the pose
    const newHoldTime = gameState.holdTime + deltaTime;
    const progress = Math.min(1, newHoldTime / gameState.currentPattern.duration);

    if (newHoldTime >= gameState.currentPattern.duration) {
      // Successfully completed this movement
      const bonusScore = poseMatch.confidence > 0.9 ? GAME_CONFIG.BONUS_PERFECT_MATCH : 0;
      const newScore = gameState.score + GAME_CONFIG.SCORE_PER_MOVEMENT + bonusScore;

      return {
        ...gameState,
        score: newScore,
        completedMovements: gameState.completedMovements + 1,
        currentPattern: getNextPattern(gameState.currentPattern.id, gameState.level),
        holdTime: 0,
        progress: 0,
        feedback: 'Great job! Get ready for the next movement!',
      };
    }

    return {
      ...gameState,
      holdTime: newHoldTime,
      progress,
      feedback: poseMatch.feedback,
    };
  } else {
    // Not matching correctly, reset hold time
    return {
      ...gameState,
      holdTime: 0,
      progress: 0,
      feedback: poseMatch.feedback,
    };
  }
}

/**
 * Check if level is complete
 */
export function isLevelComplete(gameState: GameState): boolean {
  return gameState.completedMovements >= GAME_CONFIG.MOVEMENTS_PER_LEVEL;
}

/**
 * Advance to next level
 */
export function advanceLevel(gameState: GameState): GameState {
  return {
    ...gameState,
    level: gameState.level + 1,
    completedMovements: 0,
    currentPattern: MOVEMENT_PATTERNS[0],
    score: gameState.score + GAME_CONFIG.LEVEL_BONUS,
  };
}

// ===== UTILITY FUNCTIONS =====

/**
 * Get movement pattern by ID
 */
export function getPatternById(id: string): MovementPattern | undefined {
  return MOVEMENT_PATTERNS.find(pattern => pattern.id === id);
}

/**
 * Get random movement pattern
 */
export function getRandomPattern(): MovementPattern {
  return MOVEMENT_PATTERNS[Math.floor(Math.random() * MOVEMENT_PATTERNS.length)];
}

/**
 * Calculate final game statistics
 */
export function calculateFinalStats(gameState: GameState) {
  return {
    score: gameState.score,
    level: gameState.level,
    movementsCompleted: gameState.completedMovements,
    accuracy: gameState.progress * 100,
  };
}