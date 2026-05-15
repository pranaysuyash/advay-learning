/**
 * Dress For Weather Game Logic Tests
 *
 * Tests for clothing matching, level progression,
 * scoring, and game mechanics.
 */

import { describe, expect, it } from 'vitest';
import {
  type GameState,
  type ClothingItem,
  CLOTHING_ITEMS,
  LEVELS,
  initializeGame,
  startGame,
  getItemsForLevel,
  isCorrectItem,
  handleItemDrop,
  isLevelComplete,
  advanceLevel,
  continueToNextLevel,
  resetLevel,
  startDragging,
  stopDragging,
  getCurrentLevel,
  getProgressText,
  calculateFinalStats,
  isInDropZone,
  calculateMagneticSnap,
  GAME_CONFIG,
} from '../dressForWeatherLogic';

describe('Dress For Weather - Game State', () => {
  it('initializes game in menu state', () => {
    const state = initializeGame();

    expect(state.status).toBe('menu');
    expect(state.currentLevel).toBe(0);
    expect(state.score).toBe(0);
    expect(state.streak).toBe(0);
    expect(state.correctlyPlaced).toEqual(new Set());
    expect(state.draggedItem).toBeNull();
  });

  it('starts game and resets state', () => {
    const initialState: GameState = {
      status: 'menu',
      currentLevel: 0,
      score: 0,
      streak: 0,
      correctlyPlaced: new Set(),
      draggedItem: null,
    };

    const state = startGame(initialState);

    expect(state.status).toBe('playing');
    expect(state.currentLevel).toBe(0);
    expect(state.score).toBe(0);
    expect(state.streak).toBe(0);
  });

  it('resets level correctly', () => {
    const initialState: GameState = {
      status: 'playing',
      currentLevel: 1,
      score: 50,
      streak: 3,
      correctlyPlaced: new Set(['item1', 'item2']),
      draggedItem: null,
    };

    const state = resetLevel(initialState);

    expect(state.correctlyPlaced).toEqual(new Set());
    expect(state.streak).toBe(0);
    expect(state.score).toBe(50); // Score preserved
    expect(state.currentLevel).toBe(1); // Level preserved
  });
});

describe('Dress For Weather - Clothing Items', () => {
  it('has clothing items defined', () => {
    expect(CLOTHING_ITEMS.length).toBeGreaterThan(0);
  });

  it('each item has required properties', () => {
    CLOTHING_ITEMS.forEach(item => {
      expect(item.id).toBeDefined();
      expect(item.name).toBeDefined();
      expect(item.emoji).toBeDefined();
      expect(item.weathers).toBeDefined();
      expect(item.weathers.length).toBeGreaterThan(0);
      expect(item.color).toBeDefined();
    });
  });

  it('has items for each weather type', () => {
    const weathers = ['sunny', 'rainy', 'snowy', 'windy'] as const;

    weathers.forEach(weather => {
      const items = CLOTHING_ITEMS.filter(item =>
        item.weathers.includes(weather)
      );
      expect(items.length).toBeGreaterThan(0);
    });
  });
});

describe('Dress For Weather - Level Configuration', () => {
  it('has levels defined', () => {
    expect(LEVELS.length).toBeGreaterThan(0);
  });

  it('each level has required properties', () => {
    LEVELS.forEach(level => {
      expect(level.id).toBeDefined();
      expect(level.weather).toBeDefined();
      expect(level.name).toBeDefined();
      expect(level.backgroundColor).toBeDefined();
      expect(level.weatherIcon).toBeDefined();
      expect(level.description).toBeDefined();
      expect(level.requiredItems).toBeDefined();
      expect(level.requiredItems.length).toBeGreaterThan(0);
      expect(level.targetScore).toBeDefined();
    });
  });

  it('has sunny level', () => {
    const sunnyLevel = LEVELS.find(l => l.weather === 'sunny');
    expect(sunnyLevel).toBeDefined();
    expect(sunnyLevel?.name).toBe('Sunny Day');
  });

  it('has rainy level', () => {
    const rainyLevel = LEVELS.find(l => l.weather === 'rainy');
    expect(rainyLevel).toBeDefined();
    expect(rainyLevel?.name).toBe('Rainy Day');
  });

  it('has snowy level', () => {
    const snowyLevel = LEVELS.find(l => l.weather === 'snowy');
    expect(snowyLevel).toBeDefined();
    expect(snowyLevel?.name).toBe('Snowy Day');
  });

  it('has windy level', () => {
    const windyLevel = LEVELS.find(l => l.weather === 'windy');
    expect(windyLevel).toBeDefined();
    expect(windyLevel?.name).toBe('Windy Day');
  });
});

describe('Dress For Weather - Item Validation', () => {
  it('correctly identifies valid items for sunny weather', () => {
    const sunnyLevel = LEVELS.findIndex(l => l.weather === 'sunny');

    expect(isCorrectItem('sunglasses', sunnyLevel)).toBe(true);
    expect(isCorrectItem('t-shirt', sunnyLevel)).toBe(true);
    expect(isCorrectItem('shorts', sunnyLevel)).toBe(true);
    expect(isCorrectItem('winter-coat', sunnyLevel)).toBe(false);
    expect(isCorrectItem('raincoat', sunnyLevel)).toBe(false);
  });

  it('correctly identifies valid items for rainy weather', () => {
    const rainyLevel = LEVELS.findIndex(l => l.weather === 'rainy');

    expect(isCorrectItem('raincoat', rainyLevel)).toBe(true);
    expect(isCorrectItem('umbrella', rainyLevel)).toBe(true);
    expect(isCorrectItem('rain-boots', rainyLevel)).toBe(true);
    expect(isCorrectItem('sunglasses', rainyLevel)).toBe(false);
    expect(isCorrectItem('shorts', rainyLevel)).toBe(false);
  });

  it('correctly identifies valid items for snowy weather', () => {
    const snowyLevel = LEVELS.findIndex(l => l.weather === 'snowy');

    expect(isCorrectItem('winter-coat', snowyLevel)).toBe(true);
    expect(isCorrectItem('scarf', snowyLevel)).toBe(true);
    expect(isCorrectItem('mittens', snowyLevel)).toBe(true);
    expect(isCorrectItem('sandals', snowyLevel)).toBe(false);
    expect(isCorrectItem('sunglasses', snowyLevel)).toBe(false);
  });

  it('correctly identifies valid items for windy weather', () => {
    const windyLevel = LEVELS.findIndex(l => l.weather === 'windy');

    expect(isCorrectItem('cap', windyLevel)).toBe(true);
    expect(isCorrectItem('scarf', windyLevel)).toBe(true);
    expect(isCorrectItem('winter-hat', windyLevel)).toBe(true);
    expect(isCorrectItem('t-shirt', windyLevel)).toBe(true);
    expect(isCorrectItem('umbrella', windyLevel)).toBe(false);
  });

  it('handles invalid item IDs gracefully', () => {
    expect(isCorrectItem('nonexistent', 0)).toBe(false);
  });

  it('handles invalid level index gracefully', () => {
    expect(isCorrectItem('sunglasses', -1)).toBe(false);
    expect(isCorrectItem('sunglasses', 999)).toBe(false);
  });
});

describe('Dress For Weather - Item Drop Handling', () => {
  it('awards points for correct item drop', () => {
    const initialState: GameState = {
      status: 'playing',
      currentLevel: 0, // Sunny level
      score: 0,
      streak: 0,
      correctlyPlaced: new Set(),
      draggedItem: null,
    };

    const result = handleItemDrop(initialState, 'sunglasses');

    expect(result.success).toBe(true);
    expect(result.points).toBe(GAME_CONFIG.POINTS_PER_ITEM + GAME_CONFIG.STREAK_BONUS);
    expect(result.state.score).toBe(result.points);
    expect(result.state.streak).toBe(1);
    expect(result.state.correctlyPlaced.has('sunglasses')).toBe(true);
  });

  it('increases streak bonus with consecutive correct drops', () => {
    let state: GameState = {
      status: 'playing',
      currentLevel: 0,
      score: 0,
      streak: 2,
      correctlyPlaced: new Set(['item1']),
      draggedItem: null,
    };

    const result = handleItemDrop(state, 't-shirt');

    expect(result.success).toBe(true);
    expect(result.state.streak).toBe(3);
    // Points = 10 + (3 * 2) = 16
    expect(result.points).toBe(16);
  });

  it('caps streak bonus at maximum', () => {
    let state: GameState = {
      status: 'playing',
      currentLevel: 0,
      score: 0,
      streak: 10, // High streak
      correctlyPlaced: new Set(),
      draggedItem: null,
    };

    const result = handleItemDrop(state, 'sunglasses');

    expect(result.success).toBe(true);
    // Points should be capped at 10 + 15 = 25
    expect(result.points).toBe(GAME_CONFIG.POINTS_PER_ITEM + GAME_CONFIG.MAX_STREAK_BONUS);
  });

  it('resets streak on incorrect item drop', () => {
    const initialState: GameState = {
      status: 'playing',
      currentLevel: 0, // Sunny level
      score: 50,
      streak: 3,
      correctlyPlaced: new Set(),
      draggedItem: null,
    };

    const result = handleItemDrop(initialState, 'winter-coat'); // Wrong for sunny

    expect(result.success).toBe(false);
    expect(result.points).toBe(0);
    expect(result.state.streak).toBe(0);
    expect(result.state.score).toBe(50); // Score unchanged
  });

  it('does not award points for duplicate correct items', () => {
    const initialState: GameState = {
      status: 'playing',
      currentLevel: 0,
      score: 20,
      streak: 1,
      correctlyPlaced: new Set(['sunglasses']),
      draggedItem: null,
    };

    const result = handleItemDrop(initialState, 'sunglasses');

    expect(result.success).toBe(false);
    expect(result.points).toBe(0);
  });

  it('clears dragged item after drop', () => {
    const initialState: GameState = {
      status: 'playing',
      currentLevel: 0,
      score: 0,
      streak: 0,
      correctlyPlaced: new Set(),
      draggedItem: 'sunglasses',
    };

    const result = handleItemDrop(initialState, 'sunglasses');

    expect(result.state.draggedItem).toBeNull();
  });
});

describe('Dress For Weather - Level Progression', () => {
  it('detects level completion with 3 correct items', () => {
    const state: GameState = {
      status: 'playing',
      currentLevel: 0,
      score: 30,
      streak: 3,
      correctlyPlaced: new Set(['sunglasses', 't-shirt', 'shorts']),
      draggedItem: null,
    };

    expect(isLevelComplete(state)).toBe(true);
  });

  it('does not complete level with fewer than 3 items', () => {
    const state: GameState = {
      status: 'playing',
      currentLevel: 0,
      score: 20,
      streak: 2,
      correctlyPlaced: new Set(['sunglasses', 't-shirt']),
      draggedItem: null,
    };

    expect(isLevelComplete(state)).toBe(false);
  });

  it('advances to next level', () => {
    const state: GameState = {
      status: 'playing',
      currentLevel: 0,
      score: 30,
      streak: 3,
      correctlyPlaced: new Set(['item1', 'item2', 'item3']),
      draggedItem: null,
    };

    const newState = advanceLevel(state);

    expect(newState.status).toBe('levelComplete');
    expect(newState.currentLevel).toBe(1);
    expect(newState.correctlyPlaced).toEqual(new Set());
  });

  it('completes game after final level', () => {
    const state: GameState = {
      status: 'playing',
      currentLevel: LEVELS.length - 1,
      score: 100,
      streak: 5,
      correctlyPlaced: new Set(['item1', 'item2', 'item3']),
      draggedItem: null,
    };

    const newState = advanceLevel(state);

    expect(newState.status).toBe('gameComplete');
  });

  it('continues to next level', () => {
    const state: GameState = {
      status: 'levelComplete',
      currentLevel: 1,
      score: 50,
      streak: 0,
      correctlyPlaced: new Set(),
      draggedItem: null,
    };

    const newState = continueToNextLevel(state);

    expect(newState.status).toBe('playing');
    expect(newState.currentLevel).toBe(1);
  });
});

describe('Dress For Weather - Drag and Drop', () => {
  it('tracks dragged item', () => {
    const state: GameState = {
      status: 'playing',
      currentLevel: 0,
      score: 0,
      streak: 0,
      correctlyPlaced: new Set(),
      draggedItem: null,
    };

    const newState = startDragging(state, 'sunglasses');

    expect(newState.draggedItem).toBe('sunglasses');
  });

  it('clears dragged item on stop', () => {
    const state: GameState = {
      status: 'playing',
      currentLevel: 0,
      score: 0,
      streak: 0,
      correctlyPlaced: new Set(),
      draggedItem: 'sunglasses',
    };

    const newState = stopDragging(state);

    expect(newState.draggedItem).toBeNull();
  });
});

describe('Dress For Weather - Drop Zone Detection', () => {
  it('detects point inside drop zone', () => {
    const result = isInDropZone(500, 300, 500, 300, 200);
    expect(result).toBe(true);
  });

  it('detects point outside drop zone', () => {
    const result = isInDropZone(100, 100, 500, 300, 200);
    expect(result).toBe(false);
  });

  it('detects point at drop zone edge', () => {
    // Edge case: exactly at the boundary
    const result = isInDropZone(400, 200, 500, 300, 200);
    expect(result).toBe(true);
  });
});

describe('Dress For Weather - Magnetic Snap', () => {
  it('snaps when within threshold', () => {
    const result = calculateMagneticSnap(450, 250, 500, 300, 120);

    expect(result.shouldSnap).toBe(true);
    expect(result.x).toBe(500);
    expect(result.y).toBe(300);
  });

  it('does not snap when beyond threshold', () => {
    const result = calculateMagneticSnap(100, 100, 500, 300, 120);

    expect(result.shouldSnap).toBe(false);
    expect(result.x).toBe(100);
    expect(result.y).toBe(100);
  });

  it('snaps at threshold boundary', () => {
    // Distance = sqrt(50^2 + 50^2) = ~70.7, which is less than 120
    const result = calculateMagneticSnap(450, 250, 500, 300, 71);

    expect(result.shouldSnap).toBe(true);
  });
});

describe('Dress For Weather - Utility Functions', () => {
  it('gets current level', () => {
    const state: GameState = {
      status: 'playing',
      currentLevel: 1,
      score: 0,
      streak: 0,
      correctlyPlaced: new Set(),
      draggedItem: null,
    };

    const level = getCurrentLevel(state);

    expect(level).toEqual(LEVELS[1]);
  });

  it('returns null for invalid level', () => {
    const state: GameState = {
      status: 'playing',
      currentLevel: 999,
      score: 0,
      streak: 0,
      correctlyPlaced: new Set(),
      draggedItem: null,
    };

    const level = getCurrentLevel(state);

    expect(level).toBeNull();
  });

  it('generates progress text', () => {
    const state: GameState = {
      status: 'playing',
      currentLevel: 0,
      score: 0,
      streak: 0,
      correctlyPlaced: new Set(['item1', 'item2']),
      draggedItem: null,
    };

    const progress = getProgressText(state);

    expect(progress).toBe('2 of 3 items');
  });

  it('calculates final stats', () => {
    const state: GameState = {
      status: 'gameComplete',
      currentLevel: 3,
      score: 150,
      streak: 5,
      correctlyPlaced: new Set(),
      draggedItem: null,
    };

    const stats = calculateFinalStats(state);

    expect(stats.totalScore).toBe(150);
    expect(stats.levelsCompleted).toBe(4);
    expect(stats.maxStreak).toBe(5);
  });
});

describe('Dress For Weather - Items For Level', () => {
  it('returns items for sunny level', () => {
    const items = getItemsForLevel(0);

    expect(items.length).toBeGreaterThan(0);
    // Should have a mix of correct and wrong items
    expect(items.length).toBeLessThanOrEqual(6);
  });

  it('includes correct items for the weather', () => {
    const sunnyIndex = LEVELS.findIndex(l => l.weather === 'sunny');
    const items = getItemsForLevel(sunnyIndex);

    const correctItems = items.filter(item =>
      item.weathers.includes('sunny')
    );

    expect(correctItems.length).toBeGreaterThan(0);
  });
});

describe('Dress For Weather - Edge Cases', () => {
  it('handles empty correctlyPlaced set', () => {
    const state: GameState = {
      status: 'playing',
      currentLevel: 0,
      score: 0,
      streak: 0,
      correctlyPlaced: new Set(),
      draggedItem: null,
    };

    expect(isLevelComplete(state)).toBe(false);
    expect(getProgressText(state)).toBe('0 of 3 items');
  });

  it('handles all items placed', () => {
    const state: GameState = {
      status: 'playing',
      currentLevel: 0,
      score: 100,
      streak: 5,
      correctlyPlaced: new Set(['item1', 'item2', 'item3', 'item4']),
      draggedItem: null,
    };

    expect(isLevelComplete(state)).toBe(true);
  });

  it('preserves score across level resets', () => {
    const state: GameState = {
      status: 'playing',
      currentLevel: 1,
      score: 75,
      streak: 3,
      correctlyPlaced: new Set(['item1', 'item2']),
      draggedItem: null,
    };

    const resetState = resetLevel(state);

    expect(resetState.score).toBe(75);
    expect(resetState.currentLevel).toBe(1);
  });
});
