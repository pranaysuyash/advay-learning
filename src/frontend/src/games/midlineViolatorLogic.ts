import { Point } from '../types/tracking';

export interface TargetObject {
  id: string;
  x: number;
  y: number;
  radius: number;
  targetHand: 'Left' | 'Right';
  isHit: boolean;
  spawnTime: number;
  type: 'gem' | 'star' | 'bubble';
}

export interface MidlineViolatorState {
  score: number;
  combo: number;
  timeLeft: number;
  isPlaying: boolean;
  isGameOver: boolean;
  targets: TargetObject[];
  lastSpawnTime: number;
  difficulty: number;
  feedback: {
    message: string;
    type: 'success' | 'error' | 'info';
    timestamp: number;
  } | null;
}

export interface GameConfig {
  gameDuration: number;
  spawnInterval: number;
  targetRadius: number;
  difficultyMultiplier: number;
}

export const INITIAL_CONFIG: GameConfig = {
  gameDuration: 60,
  spawnInterval: 2000,
  targetRadius: 0.08,
  difficultyMultiplier: 1.1,
};

export function initGameState(config: GameConfig = INITIAL_CONFIG): MidlineViolatorState {
  return {
    score: 0,
    combo: 0,
    timeLeft: config.gameDuration,
    isPlaying: false,
    isGameOver: false,
    targets: [],
    lastSpawnTime: 0,
    difficulty: 1,
    feedback: null,
  };
}

export function spawnTarget(currentTime: number, _difficulty: number): TargetObject {
  const side = Math.random() > 0.5 ? 'Right' : 'Left';
  // If target is on the Right (x > 0.5), it must be hit with the Left hand
  // If target is on the Left (x < 0.5), it must be hit with the Right hand
  const targetHand = side === 'Right' ? 'Left' : 'Right';
  
  // Constrain x to halves but with some padding from the midline and edges
  const padding = 0.1;
  const x = side === 'Right' 
    ? 0.5 + padding + Math.random() * (0.5 - 2 * padding)
    : padding + Math.random() * (0.5 - 2 * padding);

  const y = 0.2 + Math.random() * 0.6; // Keep in middle vertical band
  const types: TargetObject['type'][] = ['gem', 'star', 'bubble'];

  return {
    id: `target-${currentTime}-${Math.random()}`,
    x,
    y,
    radius: 0.08,
    targetHand,
    isHit: false,
    spawnTime: currentTime,
    type: types[Math.floor(Math.random() * types.length)],
  };
}

export function checkCollision(
  landmark: Point,
  target: TargetObject,
  isLeftHand: boolean
): { hit: boolean; correctHand: boolean } {
  const dx = landmark.x - target.x;
  const dy = landmark.y - target.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance < target.radius) {
    const isCorrectHand = (isLeftHand && target.targetHand === 'Left') || 
                         (!isLeftHand && target.targetHand === 'Right');
    return { hit: true, correctHand: isCorrectHand };
  }
  
  return { hit: false, correctHand: false };
}

export function updateGameState(
  state: MidlineViolatorState,
  currentTime: number,
  deltaTime: number,
  poseLandmarks: any | null,
  config: GameConfig = INITIAL_CONFIG
): MidlineViolatorState {
  if (!state.isPlaying || state.isGameOver) return state;

  const newState = { ...state };
  newState.timeLeft -= deltaTime / 1000;

  if (newState.timeLeft <= 0) {
    newState.timeLeft = 0;
    newState.isPlaying = false;
    newState.isGameOver = true;
    return newState;
  }

  // Spawning logic
  const currentSpawnInterval = config.spawnInterval / Math.pow(state.difficulty, 0.5);
  if (currentTime - state.lastSpawnTime > currentSpawnInterval) {
    newState.targets = [...state.targets, spawnTarget(currentTime, state.difficulty)];
    newState.lastSpawnTime = currentTime;
    
    // Cleanup old missed targets (e.g., older than 5 seconds)
    newState.targets = newState.targets.filter(t => currentTime - t.spawnTime < 5000 || t.isHit);
  }

  // Collision logic
  if (poseLandmarks) {
    // MediaPipe Pose landmarks:
    // 15: Left Wrist, 16: Right Wrist
    // 19: Left Index, 20: Right Index
    const leftHand = poseLandmarks[19] || poseLandmarks[15];
    const rightHand = poseLandmarks[20] || poseLandmarks[16];


    newState.targets = newState.targets.map(target => {
      if (target.isHit) return target;

      // Check Left Hand
      if (leftHand) {
        const { hit, correctHand } = checkCollision(leftHand, target, true);
        if (hit) {
          if (correctHand) {
            newState.score += 10 * newState.difficulty;
            newState.combo += 1;
            newState.difficulty += 0.05;
            newState.feedback = { message: 'Great Crossing!', type: 'success', timestamp: currentTime };
            return { ...target, isHit: true };
          } else {
            newState.combo = 0;
            newState.feedback = { message: 'Use the other hand!', type: 'error', timestamp: currentTime };
          }
        }
      }

      // Check Right Hand
      if (rightHand) {
        const { hit, correctHand } = checkCollision(rightHand, target, false);
        if (hit) {
          if (correctHand) {
            newState.score += 10 * newState.difficulty;
            newState.combo += 1;
            newState.difficulty += 0.05;
            newState.feedback = { message: 'Perfect Cross!', type: 'success', timestamp: currentTime };
            return { ...target, isHit: true };
          } else {
            newState.combo = 0;
            newState.feedback = { message: 'Cross over!', type: 'error', timestamp: currentTime };
          }
        }
      }

      return target;
    });

    // Clear old feedback after 1.5s
    if (newState.feedback && currentTime - newState.feedback.timestamp > 1500) {
      newState.feedback = null;
    }
  }

  return newState;
}
