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

export function generateOptions(correct: Fraction): string[] {
  const options: Fraction[] = [correct];

  while (options.length < 4) {
    const denom = Math.floor(Math.random() * 7) + 2; // 2 to 8
    const num = Math.floor(Math.random() * denom) || 1; // 1 to denom

    // Convert to lowest terms approx to check equivalency easily
    const val1 = correct.numerator / correct.denominator;
    const val2 = num / denom;

    const isDuplicate = options.some(
      opt => Math.abs((opt.numerator / opt.denominator) - val2) < 0.01
    );

    if (!isDuplicate && Math.abs(val1 - val2) > 0.05) {
      options.push({ numerator: num, denominator: denom });
    }
  }

  return options
    .sort(() => Math.random() - 0.5)
    .map(f => `${f.numerator}/${f.denominator}`);
}
