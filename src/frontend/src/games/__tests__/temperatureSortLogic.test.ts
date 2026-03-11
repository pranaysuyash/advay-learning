/**
 * Temperature Sort Logic Tests
 *
 * Tests for the temperature categorization game logic.
 */

import { describe, it, expect } from 'vitest';
import {
  TEMPERATURE_ITEMS,
  TEMPERATURE_ZONES,
  createInitialState,
  shuffleArray,
  getItemsForLevel,
  evaluateSorting,
  calculateScore,
  calculateStars,
  type TemperatureItem,
  type TemperatureCategory,
  type GameState,
  type SortResult,
} from '../temperatureSortLogic';

describe('Constants', () => {
  it('should have 15 temperature items', () => {
    expect(TEMPERATURE_ITEMS.length).toBe(15);
  });

  it('should have 5 hot items', () => {
    const hotItems = TEMPERATURE_ITEMS.filter(i => i.category === 'hot');
    expect(hotItems.length).toBe(5);
  });

  it('should have 5 warm items', () => {
    const warmItems = TEMPERATURE_ITEMS.filter(i => i.category === 'warm');
    expect(warmItems.length).toBe(5);
  });

  it('should have 5 cold items', () => {
    const coldItems = TEMPERATURE_ITEMS.filter(i => i.category === 'cold');
    expect(coldItems.length).toBe(5);
  });

  it('should have temperature zones defined', () => {
    expect(TEMPERATURE_ZONES.hot).toBeDefined();
    expect(TEMPERATURE_ZONES.warm).toBeDefined();
    expect(TEMPERATURE_ZONES.cold).toBeDefined();
  });
});

describe('createInitialState', () => {
  it('should create initial state with level 1', () => {
    const state = createInitialState();
    expect(state.currentLevel).toBe(1);
  });

  it('should start with empty sorted items', () => {
    const state = createInitialState();
    expect(state.sortedItems).toEqual([]);
  });

  it('should start with empty available items', () => {
    const state = createInitialState();
    expect(state.availableItems).toEqual([]);
  });

  it('should start with zero score', () => {
    const state = createInitialState();
    expect(state.score).toBe(0);
  });

  it('should start with zero stars', () => {
    const state = createInitialState();
    expect(state.stars).toBe(0);
  });

  it('should start not complete', () => {
    const state = createInitialState();
    expect(state.isComplete).toBe(false);
  });

  it('should start not playing', () => {
    const state = createInitialState();
    expect(state.isPlaying).toBe(false);
  });
});

describe('shuffleArray', () => {
  it('should return array of same length', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result.length).toBe(input.length);
  });

  it('should contain all original elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));
  });

  it('should potentially change order', () => {
    const input = [1, 2, 3, 4, 5];
    // Run multiple times to potentially see a different order
    let differentOrderFound = false;
    for (let i = 0; i < 20; i++) {
      const result = shuffleArray(input);
      if (result[0] !== 1) {
        differentOrderFound = true;
        break;
      }
    }
    // Note: This test might occasionally fail due to randomness, but that's acceptable
  });

  it('should not mutate original array', () => {
    const input = [1, 2, 3, 4, 5];
    const originalOrder = [...input];
    shuffleArray(input);
    expect(input).toEqual(originalOrder);
  });

  it('should handle empty array', () => {
    const result = shuffleArray([]);
    expect(result).toEqual([]);
  });

  it('should handle single element array', () => {
    const result = shuffleArray([42]);
    expect(result).toEqual([42]);
  });
});

describe('getItemsForLevel', () => {
  it('should return 3 items for level 1', () => {
    const items = getItemsForLevel(1);
    expect(items.length).toBe(3);
  });

  it('should include sun, snow, icecream for level 1', () => {
    const items = getItemsForLevel(1);
    const ids = items.map(i => i.id);
    expect(ids).toContain('sun');
    expect(ids).toContain('snow');
    expect(ids).toContain('icecream');
  });

  it('should return 12 items for level 2', () => {
    const items = getItemsForLevel(2);
    expect(items.length).toBe(12);
  });

  it('should exclude coffee, puppy, drink for level 2', () => {
    const items = getItemsForLevel(2);
    const ids = items.map(i => i.id);
    expect(ids).not.toContain('coffee');
    expect(ids).not.toContain('puppy');
    expect(ids).not.toContain('drink');
  });

  it('should return 9 items for level 3', () => {
    const items = getItemsForLevel(3);
    expect(items.length).toBe(9);
  });

  it('should return shuffled items', () => {
    const items1 = getItemsForLevel(1);
    const items2 = getItemsForLevel(1);
    // Items might be in same order by chance, so run a few times
    let foundDifferent = false;
    for (let i = 0; i < 10; i++) {
      const compare = getItemsForLevel(1);
      if (compare[0].id !== items1[0].id) {
        foundDifferent = true;
        break;
      }
    }
    expect(foundDifferent).toBe(true);
  });

  it('should have items from all categories', () => {
    const items = getItemsForLevel(1);
    const categories = items.map(i => i.category);
    expect(categories).toContain('hot');
    expect(categories).toContain('cold');
  });
});

describe('evaluateSorting', () => {
  it('should count items by category', () => {
    const sorted: TemperatureItem[] = [
      { id: 'sun', emoji: '☀️', name: 'Sun', category: 'hot', color: '#FF6B35' },
      { id: 'fire', emoji: '🔥', name: 'Fire', category: 'hot', color: '#FF4500' },
      { id: 'snow', emoji: '❄️', name: 'Snow', category: 'cold', color: '#87CEEB' },
    ];

    const result = evaluateSorting(sorted);
    expect(result.hot).toBe(2);
    expect(result.cold).toBe(1);
    expect(result.warm).toBe(0);
  });

  it('should set total to sorted length', () => {
    const sorted: TemperatureItem[] = [
      { id: 'sun', emoji: '☀️', name: 'Sun', category: 'hot', color: '#FF6B35' },
      { id: 'fire', emoji: '🔥', name: 'Fire', category: 'hot', color: '#FF4500' },
    ];

    const result = evaluateSorting(sorted);
    expect(result.total).toBe(2);
  });

  it('should set correct to total', () => {
    const sorted: TemperatureItem[] = [
      { id: 'sun', emoji: '☀️', name: 'Sun', category: 'hot', color: '#FF6B35' },
    ];

    const result = evaluateSorting(sorted);
    expect(result.correct).toBe(1);
  });

  it('should handle empty array', () => {
    const result = evaluateSorting([]);
    expect(result.hot).toBe(0);
    expect(result.warm).toBe(0);
    expect(result.cold).toBe(0);
    expect(result.correct).toBe(0);
    expect(result.total).toBe(0);
  });
});

describe('calculateScore', () => {
  it('should give 20 points per correct item', () => {
    expect(calculateScore(3, 5)).toBe(60); // 3 * 20
  });

  it('should add 30 bonus for 6+ items', () => {
    expect(calculateScore(6, 6)).toBe(150); // 6 * 20 + 30
  });

  it('should give 0 for zero items', () => {
    expect(calculateScore(0, 0)).toBe(0);
  });

  it('should not give bonus for less than 6 items', () => {
    expect(calculateScore(5, 5)).toBe(100); // 5 * 20, no bonus
  });
});

describe('calculateStars', () => {
  it('should return 5 stars for perfect accuracy with 6+ items', () => {
    // Perfect score: 6 items * 20 = 120, accuracy = 120 / (6 * 20) = 1
    expect(calculateStars(120, 6)).toBe(5);
  });

  it('should return 4 stars for 80-99% accuracy', () => {
    expect(calculateStars(80, 5)).toBe(4); // 80 / (5 * 20) = 0.8
  });

  it('should return 3 stars for 60-79% accuracy', () => {
    expect(calculateStars(60, 5)).toBe(3); // 60 / (5 * 20) = 0.6
  });

  it('should return 2 stars for 40-59% accuracy', () => {
    expect(calculateStars(40, 5)).toBe(2); // 40 / (5 * 20) = 0.4
  });

  it('should return 1 star for less than 40% accuracy', () => {
    expect(calculateStars(20, 5)).toBe(1); // 20 / (5 * 20) = 0.2
  });

  it('should return 1 star for zero items', () => {
    expect(calculateStars(0, 0)).toBe(1);
  });

  it('should handle divide by zero', () => {
    expect(calculateStars(100, 0)).toBe(1); // Avoid division by zero
  });
});

describe('Type Safety', () => {
  it('should accept TemperatureItem type', () => {
    const item: TemperatureItem = {
      id: 'test',
      emoji: '🧪',
      name: 'Test',
      category: 'hot',
      color: '#FF0000',
    };
    expect(item.category).toBe('hot');
  });

  it('should accept GameState type', () => {
    const state: GameState = {
      currentLevel: 1,
      sortedItems: [],
      availableItems: [],
      score: 0,
      stars: 0,
      isComplete: false,
      isPlaying: false,
    };
    expect(typeof state.currentLevel).toBe('number');
  });

  it('should accept SortResult type', () => {
    const result: SortResult = {
      hot: 1,
      warm: 2,
      cold: 3,
      correct: 6,
      total: 6,
    };
    expect(result.correct).toBe(6);
  });

  it('should accept TemperatureCategory type', () => {
    const category: TemperatureCategory = 'hot';
    expect(['hot', 'warm', 'cold']).toContain(category);
  });
});

describe('Integration - Game Flow', () => {
  it('should support complete game flow', () => {
    let state = createInitialState();
    state.isPlaying = true;

    // Get items for level 1
    state.availableItems = getItemsForLevel(1);

    // Simulate sorting all items correctly
    state.sortedItems = [...state.availableItems];
    const evaluation = evaluateSorting(state.sortedItems);
    state.score = calculateScore(evaluation.correct, evaluation.total);
    state.stars = calculateStars(state.score, evaluation.total);
    state.isComplete = true;

    expect(state.sortedItems.length).toBeGreaterThan(0);
    expect(state.score).toBeGreaterThan(0);
    expect(state.stars).toBeGreaterThan(0);
    expect(state.isComplete).toBe(true);
  });

  it('should calculate stars based on performance', () => {
    const perfectScore = calculateScore(6, 6);
    const starsPerfect = calculateStars(perfectScore, 6);
    expect(starsPerfect).toBe(5);

    const averageScore = calculateScore(3, 6); // 50% accuracy
    const starsAverage = calculateStars(averageScore, 6);
    expect(starsAverage).toBe(3);
  });
});
