/**
 * Beat Bounce game logic — tap in time with the bouncing ball.
 */

export interface LevelConfig {
  level: number;
  bpm: number;
  ballCount: number;
}

export interface BouncingBall {
  id: number;
  x: number;
  y: number;
  velocityY: number;
  beatPhase: number;
}

export interface BeatTiming {
  perfect: number;
  good: number;
  miss: number;
}

export const TIMING_WINDOWS: BeatTiming = {
  perfect: 0.1,
  good: 0.2,
  miss: 0.3,
};

export const LEVELS: LevelConfig[] = [
  { level: 1, bpm: 80, ballCount: 1 },
  { level: 2, bpm: 100, ballCount: 1 },
  { level: 3, bpm: 120, ballCount: 2 },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find(l => l.level === level) ?? LEVELS[0];
}

export function getBeatInterval(bpm: number): number {
  return 60000 / bpm;
}

export function createBall(id: number, level: number): BouncingBall {
  return {
    id,
    x: 30 + Math.random() * 40,
    y: 10,
    velocityY: 0,
    beatPhase: 0,
  };
}

export function createBalls(level: number): BouncingBall[] {
  const config = getLevelConfig(level);
  return Array.from({ length: config.ballCount }, (_, i) => createBall(i, level));
}

export function updateBall(
  ball: BouncingBall,
  gravity: number,
  bounceFactor: number,
  groundY: number,
  deltaTime: number,
): BouncingBall {
  let newY = ball.y + ball.velocityY * deltaTime;
  let newVelocityY = ball.velocityY + gravity * deltaTime;

  if (newY >= groundY) {
    newY = groundY;
    newVelocityY = -Math.abs(newVelocityY) * bounceFactor;
  }

  return {
    ...ball,
    y: newY,
    velocityY: newVelocityY,
  };
}

export function checkBeatTiming(
  ballY: number,
  groundY: number,
  bpm: number,
): 'perfect' | 'good' | 'miss' | null {
  const threshold = groundY * 0.15;
  
  if (Math.abs(ballY - groundY) < threshold) {
    const beatInterval = getBeatInterval(bpm);
    const timing = (Date.now() % beatInterval) / beatInterval;
    
    if (timing < TIMING_WINDOWS.perfect || timing > 1 - TIMING_WINDOWS.perfect) {
      return 'perfect';
    } else if (timing < TIMING_WINDOWS.good || timing > 1 - TIMING_WINDOWS.good) {
      return 'good';
    }
  }
  
  return null;
}

export function calculateScore(timing: 'perfect' | 'good' | 'miss' | null, combo: number): number {
  if (timing === 'perfect') {
    return 100 + combo * 10;
  } else if (timing === 'good') {
    return 50 + combo * 5;
  }
  return 0;
}

export function isBallActive(ball: BouncingBall, groundY: number): boolean {
  return ball.y < groundY - 5;
}
