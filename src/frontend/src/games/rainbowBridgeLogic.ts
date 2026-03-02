/**
 * Rainbow Bridge game logic — tap numbered dots in sequence to build a rainbow.
 */

export interface Dot {
  id: number;
  x: number;
  y: number;
  connected: boolean;
  number: number;
}

export interface LevelConfig {
  level: number;
  dotCount: number;
  arcRadius: number;
}

export const RAINBOW_COLORS = [
  '#FF0000', // Red
  '#FF7F00', // Orange
  '#FFFF00', // Yellow
  '#00FF00', // Green
  '#0000FF', // Blue
  '#4B0082', // Indigo
  '#9400D3', // Violet
];

export const LEVELS: LevelConfig[] = [
  { level: 1, dotCount: 5, arcRadius: 35 },
  { level: 2, dotCount: 7, arcRadius: 30 },
  { level: 3, dotCount: 10, arcRadius: 25 },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

function generateArcDots(level: number): Dot[] {
  const config = getLevelConfig(level);
  const dots: Dot[] = [];
  const centerX = 50;
  const centerY = 80;
  const startAngle = Math.PI;
  const endAngle = 0;
  const angleStep = (startAngle - endAngle) / (config.dotCount - 1);

  for (let i = 0; i < config.dotCount; i++) {
    const angle = startAngle - angleStep * i;
    const x = centerX + config.arcRadius * Math.cos(angle);
    const y = centerY + config.arcRadius * Math.sin(angle) * 0.5;
    dots.push({
      id: i,
      x,
      y,
      connected: false,
      number: i + 1,
    });
  }

  return dots;
}

export function createGame(level: number): {
  dots: Dot[];
  config: LevelConfig;
} {
  const config = getLevelConfig(level);
  const dots = generateArcDots(level);
  return { dots, config };
}

export function checkDotClick(
  x: number,
  y: number,
  dots: Dot[],
  currentIndex: number,
  tolerance: number = 5,
): { success: boolean; nextIndex: number } {
  const targetDot = dots[currentIndex];
  if (!targetDot) {
    return { success: false, nextIndex: currentIndex };
  }

  const distance = Math.sqrt(
    Math.pow(x - targetDot.x, 2) + Math.pow(y - targetDot.y, 2),
  );

  if (distance <= tolerance) {
    return { success: true, nextIndex: currentIndex + 1 };
  }

  return { success: false, nextIndex: currentIndex };
}

export function isGameComplete(dots: Dot[]): boolean {
  return dots.every((dot) => dot.connected);
}

export function calculateScore(timeRemaining: number, level: number): number {
  const baseScore = level * 100;
  const timeBonus = timeRemaining * 10;
  return baseScore + timeBonus;
}
