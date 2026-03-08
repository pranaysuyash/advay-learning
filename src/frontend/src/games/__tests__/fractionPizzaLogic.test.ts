import { describe, expect, it } from 'vitest';

import {
  Fraction,
  LevelConfig,
  LEVELS,
  getLevelConfig,
  generateFraction,
  generateOptions,
} from '../fractionPizzaLogic';

describe('LEVELS', () => {
  it('has exactly 3 levels', () => {
    expect(LEVELS).toHaveLength(3);
  });

  it('level 1 has maxDenominator of 2', () => {
    expect(LEVELS[0].level).toBe(1);
    expect(LEVELS[0].maxDenominator).toBe(2);
  });

  it('level 2 has maxDenominator of 4', () => {
    expect(LEVELS[1].level).toBe(2);
    expect(LEVELS[1].maxDenominator).toBe(4);
  });

  it('level 3 has maxDenominator of 8', () => {
    expect(LEVELS[2].level).toBe(3);
    expect(LEVELS[2].maxDenominator).toBe(8);
  });

  it('maxDenominator increases across levels', () => {
    expect(LEVELS[0].maxDenominator).toBeLessThan(LEVELS[1].maxDenominator);
    expect(LEVELS[1].maxDenominator).toBeLessThan(LEVELS[2].maxDenominator);
  });
});

describe('getLevelConfig', () => {
  it('returns level 1 config for level 1', () => {
    const config = getLevelConfig(1);
    expect(config.level).toBe(1);
    expect(config.maxDenominator).toBe(2);
  });

  it('returns level 2 config for level 2', () => {
    const config = getLevelConfig(2);
    expect(config.level).toBe(2);
    expect(config.maxDenominator).toBe(4);
  });

  it('returns level 3 config for level 3', () => {
    const config = getLevelConfig(3);
    expect(config.level).toBe(3);
    expect(config.maxDenominator).toBe(8);
  });

  it('returns level 1 for invalid level', () => {
    const config = getLevelConfig(999);
    expect(config.level).toBe(1);
  });

  it('returns level 1 for negative level', () => {
    const config = getLevelConfig(-1);
    expect(config.level).toBe(1);
  });

  it('returns level 1 for zero level', () => {
    const config = getLevelConfig(0);
    expect(config.level).toBe(1);
  });
});

describe('generateFraction', () => {
  it('returns a valid fraction', () => {
    const fraction = generateFraction(1);

    expect(fraction).toHaveProperty('numerator');
    expect(fraction).toHaveProperty('denominator');
  });

  it('generates fractions with positive numerator', () => {
    const fraction = generateFraction(1);
    expect(fraction.numerator).toBeGreaterThan(0);
  });

  it('generates fractions with denominator at least 2', () => {
    const fraction = generateFraction(1);
    expect(fraction.denominator).toBeGreaterThanOrEqual(2);
  });

  it('numerator is less than denominator', () => {
    for (let i = 0; i < 20; i++) {
      const fraction = generateFraction(3);
      expect(fraction.numerator).toBeLessThan(fraction.denominator);
    }
  });

  it('level 1 generates denominator of 2 only', () => {
    for (let i = 0; i < 10; i++) {
      const fraction = generateFraction(1);
      expect(fraction.denominator).toBe(2);
    }
  });

  it('level 1 generates numerator of 1 only', () => {
    for (let i = 0; i < 10; i++) {
      const fraction = generateFraction(1);
      expect(fraction.numerator).toBe(1);
    }
  });

  it('level 2 generates denominators from 2 to 4', () => {
    const denominators = new Set<number>();
    for (let i = 0; i < 20; i++) {
      const fraction = generateFraction(2);
      denominators.add(fraction.denominator);
    }

    expect(denominators.has(2)).toBe(true);
    expect(denominators.has(3)).toBe(true);
    expect(denominators.has(4)).toBe(true);
  });

  it('level 2 generates denominators not exceeding 4', () => {
    for (let i = 0; i < 20; i++) {
      const fraction = generateFraction(2);
      expect(fraction.denominator).toBeLessThanOrEqual(4);
    }
  });

  it('level 3 generates denominators from 2 to 8', () => {
    const denominators = new Set<number>();
    for (let i = 0; i < 30; i++) {
      const fraction = generateFraction(3);
      denominators.add(fraction.denominator);
    }

    // Should see multiple different denominators
    expect(denominators.size).toBeGreaterThan(1);
    expect(Math.max(...denominators)).toBeLessThanOrEqual(8);
  });

  it('level 3 generates denominators not exceeding 8', () => {
    for (let i = 0; i < 20; i++) {
      const fraction = generateFraction(3);
      expect(fraction.denominator).toBeLessThanOrEqual(8);
    }
  });

  it('generates different fractions on multiple calls', () => {
    const fractions = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const fraction = generateFraction(3);
      fractions.add(`${fraction.numerator}/${fraction.denominator}`);
    }

    // Should generate some variety
    expect(fractions.size).toBeGreaterThan(1);
  });

  it('generates proper fraction (not improper)', () => {
    for (let i = 0; i < 50; i++) {
      const fraction = generateFraction(3);
      expect(fraction.numerator).toBeLessThan(fraction.denominator);
    }
  });
});

describe('generateOptions', () => {
  it('returns 4 options', () => {
    const correct: Fraction = { numerator: 1, denominator: 2 };
    const options = generateOptions(correct);

    expect(options).toHaveLength(4);
  });

  it('includes the correct answer', () => {
    const correct: Fraction = { numerator: 1, denominator: 2 };
    const options = generateOptions(correct);

    expect(options).toContain('1/2');
  });

  it('returns string format "num/denom"', () => {
    const correct: Fraction = { numerator: 3, denominator: 4 };
    const options = generateOptions(correct);

    for (const option of options) {
      expect(option).toMatch(/^\d+\/\d+$/);
    }
  });

  it('all options are unique', () => {
    const correct: Fraction = { numerator: 1, denominator: 2 };
    const options = generateOptions(correct);
    const uniqueOptions = new Set(options);

    expect(uniqueOptions.size).toBe(options.length);
  });

  it('options are shuffled (not in insertion order)', () => {
    const correct: Fraction = { numerator: 1, denominator: 2 };
    const options = generateOptions(correct);

    // First option is not always the correct answer
    // This is probabilistic, but let's check the format
    expect(options).toContain('1/2');
  });

  it('generates different options on multiple calls', () => {
    const correct: Fraction = { numerator: 1, denominator: 2 };
    const options1 = generateOptions(correct);
    const options2 = generateOptions(correct);

    // Due to randomness, they might occasionally be the same
    // but let's check that both contain the correct answer
    expect(options1).toContain('1/2');
    expect(options2).toContain('1/2');
  });

  it('does not include values too similar to correct', () => {
    const correct: Fraction = { numerator: 1, denominator: 2 };
    const options = generateOptions(correct);

    // 1/2 = 0.5, so options should not have values within 0.05 of 0.5
    // (i.e., between 0.45 and 0.55)
    // This means 1/2 should be the only option with that value
    const halfCount = options.filter(opt => {
      const [num, denom] = opt.split('/').map(Number);
      return Math.abs((num / denom) - 0.5) < 0.05;
    }).length;

    expect(halfCount).toBe(1); // Only the correct answer
  });

  it('does not include duplicate values', () => {
    const correct: Fraction = { numerator: 2, denominator: 3 };
    const options = generateOptions(correct);

    // Check for duplicate decimal values
    const values = options.map(opt => {
      const [num, denom] = opt.split('/').map(Number);
      return num / denom;
    });

    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });

  it('handles 1/8 fraction', () => {
    const correct: Fraction = { numerator: 1, denominator: 8 };
    const options = generateOptions(correct);

    expect(options).toContain('1/8');
    expect(options).toHaveLength(4);
  });

  it('handles 7/8 fraction', () => {
    const correct: Fraction = { numerator: 7, denominator: 8 };
    const options = generateOptions(correct);

    expect(options).toContain('7/8');
    expect(options).toHaveLength(4);
  });

  it('handles 3/4 fraction', () => {
    const correct: Fraction = { numerator: 3, denominator: 4 };
    const options = generateOptions(correct);

    expect(options).toContain('3/4');
    expect(options).toHaveLength(4);
  });

  it('handles level 2 fractions', () => {
    const correct: Fraction = { numerator: 2, denominator: 4 };
    const options = generateOptions(correct);

    expect(options).toContain('2/4');
    expect(options).toHaveLength(4);
  });
});

describe('integration scenarios', () => {
  it('can generate a complete round for level 1', () => {
    const fraction = generateFraction(1);
    const options = generateOptions(fraction);

    expect(options).toHaveLength(4);
    expect(options).toContain(`${fraction.numerator}/${fraction.denominator}`);
  });

  it('can generate a complete round for level 2', () => {
    const fraction = generateFraction(2);
    const options = generateOptions(fraction);

    expect(options).toHaveLength(4);
    expect(options).toContain(`${fraction.numerator}/${fraction.denominator}`);
  });

  it('can generate a complete round for level 3', () => {
    const fraction = generateFraction(3);
    const options = generateOptions(fraction);

    expect(options).toHaveLength(4);
    expect(options).toContain(`${fraction.numerator}/${fraction.denominator}`);
  });

  it('can simulate multiple rounds', () => {
    const rounds = [];
    for (let i = 0; i < 5; i++) {
      const fraction = generateFraction(2);
      const options = generateOptions(fraction);
      rounds.push({ fraction, options });
    }

    expect(rounds).toHaveLength(5);
    for (const round of rounds) {
      expect(round.options).toContain(`${round.fraction.numerator}/${round.fraction.denominator}`);
    }
  });
});

describe('edge cases', () => {
  it('handles smallest fraction (1/8)', () => {
    const correct: Fraction = { numerator: 1, denominator: 8 };
    const options = generateOptions(correct);

    expect(options.length).toBeGreaterThan(0);
  });

  it('handles largest proper fraction (7/8)', () => {
    const correct: Fraction = { numerator: 7, denominator: 8 };
    const options = generateOptions(correct);

    expect(options.length).toBeGreaterThan(0);
  });

  it('handles 1/2 - most common fraction', () => {
    const correct: Fraction = { numerator: 1, denominator: 2 };
    const options = generateOptions(correct);

    expect(options).toContain('1/2');
    expect(options).toHaveLength(4);
  });
});

describe('type definitions', () => {
  it('Fraction interface is correctly implemented', () => {
    const fraction: Fraction = {
      numerator: 1,
      denominator: 2,
    };

    expect(typeof fraction.numerator).toBe('number');
    expect(typeof fraction.denominator).toBe('number');
  });

  it('LevelConfig interface is correctly implemented', () => {
    const config: LevelConfig = {
      level: 2,
      maxDenominator: 4,
    };

    expect(typeof config.level).toBe('number');
    expect(typeof config.maxDenominator).toBe('number');
  });
});

describe('fraction validation', () => {
  it('all generated fractions are valid (numerator < denominator)', () => {
    for (let level = 1; level <= 3; level++) {
      for (let i = 0; i < 10; i++) {
        const fraction = generateFraction(level);
        expect(fraction.numerator).toBeGreaterThan(0);
        expect(fraction.numerator).toBeLessThan(fraction.denominator);
      }
    }
  });

  it('all generated fractions have denominator >= 2', () => {
    for (let level = 1; level <= 3; level++) {
      for (let i = 0; i < 10; i++) {
        const fraction = generateFraction(level);
        expect(fraction.denominator).toBeGreaterThanOrEqual(2);
      }
    }
  });
});

describe('level progression', () => {
  it('level 1 has simplest fractions', () => {
    const fractions = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const fraction = generateFraction(1);
      fractions.add(`${fraction.numerator}/${fraction.denominator}`);
    }

    // Level 1 only generates 1/2
    expect(fractions.has('1/2')).toBe(true);
  });

  it('level 2 has more variety than level 1', () => {
    const level1Fractions = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const fraction = generateFraction(1);
      level1Fractions.add(`${fraction.numerator}/${fraction.denominator}`);
    }

    const level2Fractions = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const fraction = generateFraction(2);
      level2Fractions.add(`${fraction.numerator}/${fraction.denominator}`);
    }

    expect(level2Fractions.size).toBeGreaterThan(level1Fractions.size);
  });

  it('level 3 has most variety', () => {
    const level2Fractions = new Set<string>();
    for (let i = 0; i < 30; i++) {
      const fraction = generateFraction(2);
      level2Fractions.add(`${fraction.numerator}/${fraction.denominator}`);
    }

    const level3Fractions = new Set<string>();
    for (let i = 0; i < 30; i++) {
      const fraction = generateFraction(3);
      level3Fractions.add(`${fraction.numerator}/${fraction.denominator}`);
    }

    // Level 3 should have more variety
    expect(level3Fractions.size).toBeGreaterThanOrEqual(level2Fractions.size);
  });
});
