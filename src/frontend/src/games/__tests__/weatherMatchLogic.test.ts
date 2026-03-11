/**
 * Test suite for Weather Match game logic
 * Game ID: weather-match
 * Educational Focus: Weather recognition, clothing associations
 */

import { describe, it, expect } from 'vitest';
import {
  LEVELS,
  LevelConfig,
  getLevelConfig,
  generateGame,
  DIFFICULTY_MULTIPLIERS,
  calculateScore,
} from '../weatherMatchLogic';

describe('weatherMatchLogic', () => {
  describe('LEVELS constant', () => {
    it('has 3 levels', () => {
      expect(LEVELS).toHaveLength(3);
    });

    it('has progressive pair counts', () => {
      expect(LEVELS[0].pairCount).toBeLessThan(LEVELS[1].pairCount);
      expect(LEVELS[1].pairCount).toBeLessThan(LEVELS[2].pairCount);
    });

    it('level 1 has 2 pairs', () => {
      expect(LEVELS[0].level).toBe(1);
      expect(LEVELS[0].pairCount).toBe(2);
    });

    it('level 2 has 3 pairs', () => {
      expect(LEVELS[1].level).toBe(2);
      expect(LEVELS[1].pairCount).toBe(3);
    });

    it('level 3 has 4 pairs', () => {
      expect(LEVELS[2].level).toBe(3);
      expect(LEVELS[2].pairCount).toBe(4);
    });
  });

  describe('getLevelConfig', () => {
    it('returns level 1 config for level 1', () => {
      const config = getLevelConfig(1);
      expect(config.level).toBe(1);
      expect(config.pairCount).toBe(2);
    });

    it('returns level 2 config for level 2', () => {
      const config = getLevelConfig(2);
      expect(config.level).toBe(2);
      expect(config.pairCount).toBe(3);
    });

    it('returns level 3 config for level 3', () => {
      const config = getLevelConfig(3);
      expect(config.level).toBe(3);
      expect(config.pairCount).toBe(4);
    });

    it('falls back to level 1 for invalid level', () => {
      const config = getLevelConfig(99);
      expect(config.level).toBe(1);
    });

    it('falls back to level 1 for level 0', () => {
      const config = getLevelConfig(0);
      expect(config.level).toBe(1);
    });

    it('falls back to level 1 for negative level', () => {
      const config = getLevelConfig(-1);
      expect(config.level).toBe(1);
    });
  });

  describe('generateGame', () => {
    it('generates pairs for level 1', () => {
      const pairs = generateGame(1);
      expect(pairs).toHaveLength(2);
    });

    it('generates pairs for level 2', () => {
      const pairs = generateGame(2);
      expect(pairs).toHaveLength(3);
    });

    it('generates pairs for level 3', () => {
      const pairs = generateGame(3);
      expect(pairs).toHaveLength(4);
    });

    it('each pair has weather and clothing properties', () => {
      const pairs = generateGame(1);
      pairs.forEach(pair => {
        expect(pair).toHaveProperty('weather');
        expect(pair).toHaveProperty('clothing');
      });
    });

    it('weather objects have name, emoji, and icon', () => {
      const pairs = generateGame(2);
      pairs.forEach(pair => {
        expect(pair.weather).toHaveProperty('name');
        expect(pair.weather).toHaveProperty('emoji');
        expect(pair.weather).toHaveProperty('icon');
        expect(typeof pair.weather.name).toBe('string');
        expect(typeof pair.weather.emoji).toBe('string');
        expect(typeof pair.weather.icon).toBe('string');
      });
    });

    it('clothing objects have name and emoji', () => {
      const pairs = generateGame(2);
      pairs.forEach(pair => {
        expect(pair.clothing).toHaveProperty('name');
        expect(pair.clothing).toHaveProperty('emoji');
        expect(typeof pair.clothing.name).toBe('string');
        expect(typeof pair.clothing.emoji).toBe('string');
      });
    });

    it('weather names are from expected set', () => {
      const pairs = generateGame(3);
      const weatherNames = pairs.map(p => p.weather.name);
      const expectedNames = ['Sunny', 'Rainy', 'Snowy', 'Windy', 'Cloudy', 'Stormy'];

      weatherNames.forEach(name => {
        expect(expectedNames).toContain(name);
      });
    });

    it('clothing names are appropriate for weather', () => {
      const pairs = generateGame(2);
      pairs.forEach(pair => {
        const clothingName = pair.clothing.name;
        // Common weather-related clothing items
        const expectedClothing = [
          'Sunglasses', 'Hat', 'Raincoat', 'Umbrella', 'Coat', 'Scarf',
          'Jacket', 'Light Jacket'
        ];
        expect(expectedClothing).toContain(clothingName);
      });
    });

    it('generates different weather on each call', () => {
      const weatherCombinations = new Set<string>();

      for (let i = 0; i < 10; i++) {
        const pairs = generateGame(1);
        weatherCombinations.add(pairs.map((pair) => pair.weather.name).join('|'));
      }

      // Multiple calls should eventually produce more than one combination.
      expect(weatherCombinations.size).toBeGreaterThan(1);
    });

    it('selects random clothing for each weather', () => {
      // Run multiple times and check variety
      const outfits = new Set<string>();

      for (let i = 0; i < 20; i++) {
        const pairs = generateGame(1);
        pairs.forEach(p => outfits.add(p.clothing.name));
      }

      // Should have multiple different clothing items
      expect(outfits.size).toBeGreaterThan(1);
    });

    it('all emojis are valid emoji characters', () => {
      const pairs = generateGame(2);
      pairs.forEach(pair => {
        expect(pair.weather.emoji.length).toBeGreaterThan(0);
        expect(pair.clothing.emoji.length).toBeGreaterThan(0);
      });
    });
  });

  describe('DIFFICULTY_MULTIPLIERS', () => {
    it('has multipliers for all 3 levels', () => {
      expect(DIFFICULTY_MULTIPLIERS[1]).toBe(1);
      expect(DIFFICULTY_MULTIPLIERS[2]).toBe(1.5);
      expect(DIFFICULTY_MULTIPLIERS[3]).toBe(2);
    });

    it('multiplier increases with level', () => {
      expect(DIFFICULTY_MULTIPLIERS[1]).toBeLessThan(DIFFICULTY_MULTIPLIERS[2]);
      expect(DIFFICULTY_MULTIPLIERS[2]).toBeLessThan(DIFFICULTY_MULTIPLIERS[3]);
    });
  });

  describe('calculateScore', () => {
    it('calculates score with streak and level', () => {
      const score = calculateScore(0, 1);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('higher streak gives higher score', () => {
      const score1 = calculateScore(0, 1);
      const score2 = calculateScore(5, 1);
      expect(score2).toBeGreaterThan(score1);
    });

    it('higher level gives higher score', () => {
      const score1 = calculateScore(0, 1);
      const score2 = calculateScore(0, 3);
      expect(score2).toBeGreaterThan(score1);
    });

    it('level 3 multiplier is 2x', () => {
      const score1 = calculateScore(0, 1);
      const score3 = calculateScore(0, 3);
      expect(score3).toBeCloseTo(score1 * 2, 0);
    });
  });

  describe('Edge Cases', () => {
    it('handles generating game with invalid level', () => {
      const pairs = generateGame(99);
      // Should fall back to level 1 behavior
      expect(pairs).toHaveLength(2);
    });

    it('handles level 0', () => {
      const pairs = generateGame(0);
      expect(pairs).toHaveLength(2);
    });

    it('handles negative level', () => {
      const pairs = generateGame(-1);
      expect(pairs).toHaveLength(2);
    });

    it('handles generating game multiple times', () => {
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(generateGame(2));
      }
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('can generate and play level 1 game', () => {
      const pairs = generateGame(1);
      expect(pairs).toHaveLength(2);

      pairs.forEach(pair => {
        expect(pair.weather.name).toBeTruthy();
        expect(pair.clothing.name).toBeTruthy();
        // Weather and clothing should both have emojis
        expect(pair.weather.emoji).toBeTruthy();
        expect(pair.clothing.emoji).toBeTruthy();
      });
    });

    it('can generate and play level 3 game', () => {
      const pairs = generateGame(3);
      expect(pairs).toHaveLength(4);

      // Weather types should be unique (since we select 4 from 6)
      const weatherNames = pairs.map(p => p.weather.name);
      const uniqueNames = new Set(weatherNames);
      expect(uniqueNames.size).toBe(4);
    });

    it('score progression works correctly', () => {
      const scores = [
        calculateScore(0, 1),
        calculateScore(1, 1),
        calculateScore(5, 1),
        calculateScore(0, 2),
        calculateScore(0, 3),
      ];

      // Each should be different (generally increasing)
      expect(new Set(scores).size).toBeGreaterThan(1);
    });

    it('can generate all possible weather types over time', () => {
      const seenWeather = new Set<string>();

      for (let i = 0; i < 50; i++) {
        const pairs = generateGame(3); // Max pairs
        pairs.forEach(p => seenWeather.add(p.weather.name));
      }

      // Should see multiple weather types
      expect(seenWeather.size).toBeGreaterThan(2);
    });
  });

  describe('Type Definitions', () => {
    it('LevelConfig interface has correct structure', () => {
      const config: LevelConfig = LEVELS[0];
      expect(typeof config.level).toBe('number');
      expect(typeof config.pairCount).toBe('number');
    });

    it('generateGame returns array of pairs', () => {
      const pairs = generateGame(1);
      expect(Array.isArray(pairs)).toBe(true);
      pairs.forEach(pair => {
        expect(typeof pair.weather).toBe('object');
        expect(typeof pair.clothing).toBe('object');
      });
    });
  });

  describe('Educational Design', () => {
    it('progressive difficulty (2→3→4 pairs)', () => {
      expect(LEVELS[0].pairCount).toBe(2);
      expect(LEVELS[1].pairCount).toBe(3);
      expect(LEVELS[2].pairCount).toBe(4);
    });

    it('uses emojis for visual learning', () => {
      const pairs = generateGame(1);
      pairs.forEach(pair => {
        expect(pair.weather.emoji).toBeTruthy();
        expect(pair.clothing.emoji).toBeTruthy();
      });
    });

    it('clothing items are weather-appropriate', () => {
      const pairs = generateGame(2);
      pairs.forEach(pair => {
        const weather = pair.weather.name;
        const clothing = pair.clothing.name;

        // Check for sensible weather-clothing combinations
        if (weather === 'Sunny') {
          expect(['Sunglasses', 'Hat']).toContain(clothing);
        }
        if (weather === 'Rainy') {
          expect(['Raincoat', 'Umbrella']).toContain(clothing);
        }
        if (weather === 'Snowy') {
          expect(['Coat', 'Scarf']).toContain(clothing);
        }
      });
    });

    it('age-appropriate vocabulary', () => {
      const pairs = generateGame(2);
      pairs.forEach(pair => {
        expect(pair.clothing.name.length).toBeLessThan(20);
        expect(pair.weather.name.length).toBeLessThan(15);
      });
    });
  });

  describe('Weather Variety', () => {
    it('includes different weather conditions', () => {
      const pairs = generateGame(3);
      const weatherTypes = pairs.map(p => p.weather.name);

      // Should have variety
      expect(weatherTypes.length).toBeGreaterThan(1);
    });

    it('includes clear and storm conditions', () => {
      const allWeathers = new Set<string>();
      for (let i = 0; i < 30; i++) {
        const pairs = generateGame(3);
        pairs.forEach(p => allWeathers.add(p.weather.name));
      }

      expect(allWeathers.has('Sunny')).toBe(true);
      expect(allWeathers.has('Stormy')).toBe(true);
    });

    it('includes temperature variations', () => {
      const allWeathers = new Set<string>();
      for (let i = 0; i < 30; i++) {
        const pairs = generateGame(3);
        pairs.forEach(p => allWeathers.add(p.weather.name));
      }

      expect(allWeathers.has('Snowy')).toBe(true);
      expect(allWeathers.has('Rainy')).toBe(true);
    });
  });

  describe('Scoring System', () => {
    it('base score is 15 points', () => {
      const score = calculateScore(0, 1);
      expect(score).toBeCloseTo(15, 0);
    });

    it('streak bonus increases score', () => {
      const score0 = calculateScore(0, 1);
      const score5 = calculateScore(5, 1);
      expect(score5).toBeGreaterThan(score0);
    });

    it('level 3 doubles the score', () => {
      const score1 = calculateScore(0, 1);
      const score3 = calculateScore(0, 3);
      expect(score3).toBeCloseTo(score1 * 2, 0);
    });
  });
});
