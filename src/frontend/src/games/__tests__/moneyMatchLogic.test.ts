import { describe, expect, it } from 'vitest';

import {
  Coin,
  LevelConfig,
  LEVELS,
  COINS,
  DIFFICULTY_MULTIPLIERS,
  getLevelConfig,
  generateAmount,
  getCoinsForAmount,
  calculateScore,
} from '../moneyMatchLogic';

describe('COINS', () => {
  it('has 4 coins', () => {
    expect(COINS).toHaveLength(4);
  });

  it('has Penny with value 1', () => {
    expect(COINS[0].value).toBe(1);
    expect(COINS[0].name).toBe('Penny');
    expect(COINS[0].emoji).toBe('🪙');
  });

  it('has Nickel with value 5', () => {
    expect(COINS[1].value).toBe(5);
    expect(COINS[1].name).toBe('Nickel');
    expect(COINS[1].emoji).toBe('🪙');
  });

  it('has Dime with value 10', () => {
    expect(COINS[2].value).toBe(10);
    expect(COINS[2].name).toBe('Dime');
    expect(COINS[2].emoji).toBe('🪙');
  });

  it('has Quarter with value 25', () => {
    expect(COINS[3].value).toBe(25);
    expect(COINS[3].name).toBe('Quarter');
    expect(COINS[3].emoji).toBe('🪙');
  });

  it('coins have unique values', () => {
    const values = COINS.map(c => c.value);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });

  it('coins are sorted by value (ascending)', () => {
    for (let i = 1; i < COINS.length; i++) {
      expect(COINS[i].value).toBeGreaterThan(COINS[i - 1].value);
    }
  });
});

describe('LEVELS', () => {
  it('has exactly 3 levels', () => {
    expect(LEVELS).toHaveLength(3);
  });

  it('level 1 has maxAmount of 10', () => {
    expect(LEVELS[0].level).toBe(1);
    expect(LEVELS[0].maxAmount).toBe(10);
  });

  it('level 2 has maxAmount of 50', () => {
    expect(LEVELS[1].level).toBe(2);
    expect(LEVELS[1].maxAmount).toBe(50);
  });

  it('level 3 has maxAmount of 100', () => {
    expect(LEVELS[2].level).toBe(3);
    expect(LEVELS[2].maxAmount).toBe(100);
  });

  it('maxAmount increases across levels', () => {
    expect(LEVELS[0].maxAmount).toBeLessThan(LEVELS[1].maxAmount);
    expect(LEVELS[1].maxAmount).toBeLessThan(LEVELS[2].maxAmount);
  });
});

describe('DIFFICULTY_MULTIPLIERS', () => {
  it('has multiplier for all 3 levels', () => {
    expect(DIFFICULTY_MULTIPLIERS[1]).toBe(1);
    expect(DIFFICULTY_MULTIPLIERS[2]).toBe(1.5);
    expect(DIFFICULTY_MULTIPLIERS[3]).toBe(2);
  });

  it('multipliers increase with level', () => {
    expect(DIFFICULTY_MULTIPLIERS[1]).toBeLessThan(DIFFICULTY_MULTIPLIERS[2]);
    expect(DIFFICULTY_MULTIPLIERS[2]).toBeLessThan(DIFFICULTY_MULTIPLIERS[3]);
  });
});

describe('getLevelConfig', () => {
  it('returns level 1 config for level 1', () => {
    const config = getLevelConfig(1);
    expect(config.level).toBe(1);
    expect(config.maxAmount).toBe(10);
  });

  it('returns level 2 config for level 2', () => {
    const config = getLevelConfig(2);
    expect(config.level).toBe(2);
    expect(config.maxAmount).toBe(50);
  });

  it('returns level 3 config for level 3', () => {
    const config = getLevelConfig(3);
    expect(config.level).toBe(3);
    expect(config.maxAmount).toBe(100);
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

describe('generateAmount', () => {
  it('returns a positive number', () => {
    const amount = generateAmount(1);
    expect(amount).toBeGreaterThan(0);
  });

  it('level 1 generates amounts from 1 to 10', () => {
    for (let i = 0; i < 20; i++) {
      const amount = generateAmount(1);
      expect(amount).toBeGreaterThanOrEqual(1);
      expect(amount).toBeLessThanOrEqual(10);
    }
  });

  it('level 2 generates amounts from 1 to 50', () => {
    for (let i = 0; i < 20; i++) {
      const amount = generateAmount(2);
      expect(amount).toBeGreaterThanOrEqual(1);
      expect(amount).toBeLessThanOrEqual(50);
    }
  });

  it('level 3 generates amounts from 1 to 100', () => {
    for (let i = 0; i < 20; i++) {
      const amount = generateAmount(3);
      expect(amount).toBeGreaterThanOrEqual(1);
      expect(amount).toBeLessThanOrEqual(100);
    }
  });

  it('generates different amounts on multiple calls', () => {
    const amounts = new Set<number>();
    for (let i = 0; i < 20; i++) {
      amounts.add(generateAmount(1));
    }

    // Should get some variety (not all the same)
    expect(amounts.size).toBeGreaterThan(1);
  });

  it('generates integer amounts', () => {
    for (let i = 0; i < 20; i++) {
      const amount = generateAmount(2);
      expect(Number.isInteger(amount)).toBe(true);
    }
  });
});

describe('getCoinsForAmount', () => {
  it('returns empty array for amount 0', () => {
    const coins = getCoinsForAmount(0);
    expect(coins).toHaveLength(0);
  });

  it('returns 1 penny for amount 1', () => {
    const coins = getCoinsForAmount(1);
    expect(coins).toHaveLength(1);
    expect(coins[0].value).toBe(1);
  });

  it('returns 1 nickel for amount 5', () => {
    const coins = getCoinsForAmount(5);
    expect(coins).toHaveLength(1);
    expect(coins[0].value).toBe(5);
  });

  it('returns 1 dime for amount 10', () => {
    const coins = getCoinsForAmount(10);
    expect(coins).toHaveLength(1);
    expect(coins[0].value).toBe(10);
  });

  it('returns 1 quarter for amount 25', () => {
    const coins = getCoinsForAmount(25);
    expect(coins).toHaveLength(1);
    expect(coins[0].value).toBe(25);
  });

  it('returns 2 quarters for amount 50', () => {
    const coins = getCoinsForAmount(50);
    expect(coins).toHaveLength(2);
    expect(coins.every(c => c.value === 25)).toBe(true);
  });

  it('returns 4 quarters for amount 100', () => {
    const coins = getCoinsForAmount(100);
    expect(coins).toHaveLength(4);
    expect(coins.every(c => c.value === 25)).toBe(true);
  });

  it('uses largest coins first (greedy algorithm)', () => {
    const coins = getCoinsForAmount(41);

    // Should be: 1 quarter (25), 1 dime (10), 1 nickel (5), 1 penny (1)
    expect(coins[0].value).toBe(25); // Quarter first
    expect(coins).toHaveLength(4);
  });

  it('correctly calculates 7 cents (1 nickel + 2 pennies)', () => {
    const coins = getCoinsForAmount(7);
    const total = coins.reduce((sum, c) => sum + c.value, 0);

    expect(total).toBe(7);
    expect(coins).toHaveLength(3); // 1 nickel + 2 pennies
  });

  it('correctly calculates 23 cents (2 dimes + 3 pennies)', () => {
    const coins = getCoinsForAmount(23);
    const total = coins.reduce((sum, c) => sum + c.value, 0);

    expect(total).toBe(23);
  });

  it('correctly calculates 68 cents', () => {
    const coins = getCoinsForAmount(68);
    const total = coins.reduce((sum, c) => sum + c.value, 0);

    expect(total).toBe(68); // 2 quarters + 1 dime + 1 nickel + 3 pennies
  });

  it('correctly calculates 99 cents', () => {
    const coins = getCoinsForAmount(99);
    const total = coins.reduce((sum, c) => sum + c.value, 0);

    expect(total).toBe(99); // 3 quarters + 2 dimes + 4 pennies
  });

  it('all coins are valid COINS', () => {
    const coins = getCoinsForAmount(73);

    for (const coin of coins) {
      expect(COINS).toContain(coin);
    }
  });

  it('sum of coins equals input amount', () => {
    for (const amount of [1, 5, 10, 25, 37, 50, 63, 99]) {
      const coins = getCoinsForAmount(amount);
      const total = coins.reduce((sum, c) => sum + c.value, 0);
      expect(total).toBe(amount);
    }
  });
});

describe('calculateScore', () => {
  it('calculates base score for level 1', () => {
    const score = calculateScore(0, 1);
    expect(score).toBe(15); // 15 base, no streak, 1× multiplier
  });

  it('calculates base score for level 2', () => {
    const score = calculateScore(0, 2);
    expect(score).toBe(22); // 15 base, no streak, 1.5× multiplier = 22.5 → 22
  });

  it('calculates base score for level 3', () => {
    const score = calculateScore(0, 3);
    expect(score).toBe(30); // 15 base, no streak, 2× multiplier
  });

  it('adds streak bonus for level 1', () => {
    const score1 = calculateScore(1, 1);
    const score2 = calculateScore(2, 1);
    expect(score1).toBe(18); // 15 + 3 = 18
    expect(score2).toBe(21); // 15 + 6 = 21
  });

  it('adds streak bonus for level 2', () => {
    const score1 = calculateScore(1, 2);
    const score2 = calculateScore(2, 2);
    expect(score1).toBe(27); // (15 + 3) × 1.5 = 27
    expect(score2).toBe(31); // (15 + 6) × 1.5 = 31.5 → 31
  });

  it('adds streak bonus for level 3', () => {
    const score1 = calculateScore(1, 3);
    const score2 = calculateScore(2, 3);
    expect(score1).toBe(36); // (15 + 3) × 2 = 36
    expect(score2).toBe(42); // (15 + 6) × 2 = 42
  });

  it('caps streak bonus at 15 for level 1', () => {
    const score5 = calculateScore(5, 1);
    const score10 = calculateScore(10, 1);
    expect(score5).toBe(30); // (15 + 15) × 1 = 30
    expect(score10).toBe(30); // Capped
  });

  it('caps streak bonus at 15 for level 2', () => {
    const score5 = calculateScore(5, 2);
    const score10 = calculateScore(10, 2);
    expect(score5).toBe(45); // (15 + 15) × 1.5 = 45
    expect(score10).toBe(45); // Capped
  });

  it('caps streak bonus at 15 for level 3', () => {
    const score5 = calculateScore(5, 3);
    const score10 = calculateScore(10, 3);
    expect(score5).toBe(60); // (15 + 15) × 2 = 60
    expect(score10).toBe(60); // Capped
  });

  it('level 3 gives highest scores for same streak', () => {
    const streak = 3;
    const score1 = calculateScore(streak, 1);
    const score2 = calculateScore(streak, 2);
    const score3 = calculateScore(streak, 3);

    expect(score3).toBeGreaterThan(score2);
    expect(score2).toBeGreaterThan(score1);
  });
});

describe('integration scenarios', () => {
  it('can simulate a complete game round for level 1', () => {
    const amount = generateAmount(1);
    const coins = getCoinsForAmount(amount);

    expect(amount).toBeGreaterThanOrEqual(1);
    expect(amount).toBeLessThanOrEqual(10);
    expect(coins.length).toBeGreaterThan(0);
  });

  it('can simulate a complete game round for level 2', () => {
    const amount = generateAmount(2);
    const coins = getCoinsForAmount(amount);

    expect(amount).toBeGreaterThanOrEqual(1);
    expect(amount).toBeLessThanOrEqual(50);
    expect(coins.length).toBeGreaterThan(0);
  });

  it('can simulate a complete game round for level 3', () => {
    const amount = generateAmount(3);
    const coins = getCoinsForAmount(amount);

    expect(amount).toBeGreaterThanOrEqual(1);
    expect(amount).toBeLessThanOrEqual(100);
    expect(coins.length).toBeGreaterThan(0);
  });

  it('can calculate total score for session', () => {
    let totalScore = 0;
    const streaks = [0, 1, 2, 3, 1];
    const level = 2;

    for (const streak of streaks) {
      totalScore += calculateScore(streak, level);
    }

    expect(totalScore).toBeGreaterThan(0);
  });
});

describe('edge cases', () => {
  it('handles zero amount', () => {
    const coins = getCoinsForAmount(0);
    expect(coins).toHaveLength(0);
  });

  it('handles large amount (99 cents)', () => {
    const coins = getCoinsForAmount(99);
    const total = coins.reduce((sum, c) => sum + c.value, 0);
    expect(total).toBe(99);
  });

  it('handles maximum streak', () => {
    const score = calculateScore(100, 3);
    expect(score).toBe(60); // Capped
  });

  it('handles zero streak', () => {
    const score = calculateScore(0, 1);
    expect(score).toBe(15);
  });
});

describe('type definitions', () => {
  it('Coin interface is correctly implemented', () => {
    const coin: Coin = {
      value: 10,
      name: 'Dime',
      emoji: '🪙',
    };

    expect(typeof coin.value).toBe('number');
    expect(typeof coin.name).toBe('string');
    expect(typeof coin.emoji).toBe('string');
  });

  it('LevelConfig interface is correctly implemented', () => {
    const config: LevelConfig = {
      level: 2,
      maxAmount: 50,
    };

    expect(typeof config.level).toBe('number');
    expect(typeof config.maxAmount).toBe('number');
  });
});

describe('coin combinations', () => {
  it('uses minimum number of coins (greedy algorithm)', () => {
    // Greedy algorithm gives optimal for US coins
    const coins = getCoinsForAmount(41);
    expect(coins.length).toBe(4); // 1 quarter + 1 dime + 1 nickel + 1 penny
  });

  it('uses quarters when possible', () => {
    const coins = getCoinsForAmount(75);
    const quarterCount = coins.filter(c => c.value === 25).length;

    expect(quarterCount).toBe(3); // 3 quarters
  });

  it('handles amounts requiring all coin types', () => {
    const coins = getCoinsForAmount(41);
    const values = coins.map(c => c.value);
    const uniqueValues = new Set(values);

    expect(uniqueValues.has(25)).toBe(true); // Quarter
    expect(uniqueValues.has(10)).toBe(true); // Dime
    expect(uniqueValues.has(5)).toBe(true); // Nickel
    expect(uniqueValues.has(1)).toBe(true); // Penny
  });
});
