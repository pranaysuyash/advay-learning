/**
 * Number Bubble Pop game logic — pop bubbles with correct numbers.
 */

export interface Bubble {
  id: number;
  number: number;
  x: number;
  y: number;
}

export interface LevelConfig {
  level: number;
  numberRange: number;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, numberRange: 5 },
  { level: 2, numberRange: 10 },
  { level: 3, numberRange: 20 },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find(l => l.level === level) ?? LEVELS[0];
}

export function generateBubbles(count: number, target: number): Bubble[] {
  const bubbles: Bubble[] = [];
  const wrongAnswers = new Set<number>();
  while (wrongAnswers.size < count - 1) {
    const n = Math.floor(Math.random() * LEVELS[0].numberRange) + 1;
    if (n !== target) wrongAnswers.add(n);
  }
  const allNumbers = [target, ...Array.from(wrongAnswers)].sort(() => Math.random() - 0.5);
  for (let i = 0; i < count; i++) {
    bubbles.push({
      id: i,
      number: allNumbers[i],
      x: Math.random() * 280 + 20,
      y: Math.random() * 200 + 50,
    });
  }
  return bubbles;
}
