/**
 * Letter Catcher game logic — catch falling letters.
 */

export interface FallingLetter {
  id: number;
  letter: string;
  x: number;
  y: number;
}

export interface LevelConfig {
  level: number;
  speed: number;
  spawnRate: number;
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const LEVELS: LevelConfig[] = [
  { level: 1, speed: 1, spawnRate: 2000 },
  { level: 2, speed: 1.5, spawnRate: 1500 },
  { level: 3, speed: 2, spawnRate: 1200 },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find(l => l.level === level) ?? LEVELS[0];
}

export function spawnLetter(id: number): FallingLetter {
  return {
    id,
    letter: LETTERS[Math.floor(Math.random() * LETTERS.length)],
    x: Math.random() * 300 + 20,
    y: 0,
  };
}

export function updatePositions(letters: FallingLetter[], speed: number): FallingLetter[] {
  return letters.map(l => ({ ...l, y: l.y + speed }));
}

export function checkCatch(letter: FallingLetter, bucketX: number): boolean {
  return letter.y > 250 && Math.abs(letter.x - bucketX) < 50;
}
