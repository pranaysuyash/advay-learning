/**
 * Fraction Pizza game logic — learn fractions with pizza.
 */

export interface Fraction {
  numerator: number;
  denominator: number;
}

export interface LevelConfig {
  level: number;
  maxDenominator: number;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, maxDenominator: 2 },
  { level: 2, maxDenominator: 4 },
  { level: 3, maxDenominator: 8 },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find(l => l.level === level) ?? LEVELS[0];
}

export function generateFraction(level: number): Fraction {
  const config = getLevelConfig(level);
  const denominator = Math.floor(Math.random() * (config.maxDenominator - 1)) + 2;
  const numerator = Math.floor(Math.random() * (denominator - 1)) + 1;
  return { numerator, denominator };
}

export function generateOptions(correct: Fraction): number[] {
  const correctValue = correct.numerator / correct.denominator;
  const options = new Set<number>([correctValue]);
  while (options.size < 4) {
    const offset = (Math.random() - 0.5) * 0.4;
    const val = Math.max(0.01, correctValue + offset);
    if (Math.abs(val - correctValue) > 0.1) {
      options.add(Math.round(val * 100) / 100);
    }
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
}
