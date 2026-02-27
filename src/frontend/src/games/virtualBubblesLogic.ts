/**
 * Virtual Bubbles game logic — blow into mic to create and pop bubbles.
 *
 * Blow into the microphone to create bubbles, then pop them with your hands!
 *
 * @see docs/COMPLETE_GAMES_UNIVERSE.md - Virtual Bubbles P1
 */

export interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speedY: number;
  speedX: number;
}

export interface LevelConfig {
  level: number;
  bubblesToPop: number;
  maxBubbles: number;
  spawnRate: number;
  timeLimit: number;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, bubblesToPop: 10, maxBubbles: 5, spawnRate: 2000, timeLimit: 45 },
  { level: 2, bubblesToPop: 15, maxBubbles: 8, spawnRate: 1500, timeLimit: 40 },
  { level: 3, bubblesToPop: 20, maxBubbles: 10, spawnRate: 1000, timeLimit: 35 },
];

const BUBBLE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

export function createBubble(id: number, canvasWidth: number): Bubble {
  return {
    id,
    x: Math.random() * (canvasWidth - 80) + 40,
    y: -50,
    size: Math.random() * 40 + 30,
    color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
    speedY: Math.random() * 1.5 + 0.5,
    speedX: (Math.random() - 0.5) * 2,
  };
}

export function updateBubbles(bubbles: Bubble[], canvasWidth: number, canvasHeight: number): Bubble[] {
  return bubbles
    .map((b) => ({
      ...b,
      x: b.x + b.speedX,
      y: b.y + b.speedY,
    }))
    .filter((b) => b.y < canvasHeight + 50 && b.x > -50 && b.x < canvasWidth + 50);
}

export function checkBubblePop(
  bubbles: Bubble[],
  handX: number,
  handY: number,
  canvasWidth: number,
  canvasHeight: number
): { popped: Bubble | null; remaining: Bubble[] } {
  const normalizedX = handX * canvasWidth;
  const normalizedY = handY * canvasHeight;

  for (const bubble of bubbles) {
    const distance = Math.sqrt(
      Math.pow(normalizedX - bubble.x, 2) + Math.pow(normalizedY - bubble.y, 2)
    );
    if (distance < bubble.size) {
      return {
        popped: bubble,
        remaining: bubbles.filter((b) => b.id !== bubble.id),
      };
    }
  }

  return { popped: null, remaining: bubbles };
}
