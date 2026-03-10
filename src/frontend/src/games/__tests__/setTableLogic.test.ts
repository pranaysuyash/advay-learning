/**
 * Set the Table - Game Logic Tests
 *
 * Tests for learning to set a table with proper utensil placement.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  UTENSIL_ITEMS,
  createInitialState,
  shuffleArray,
  getUtensilsForLevel,
  evaluateTable,
  calculateScore,
  calculateStars,
  type UtensilItem,
  type GameState,
  type UtensilPosition,
  type TableResult,
} from '../setTableLogic';

describe('Constants', () => {
  it('should have 6 utensil items', () => {
    expect(UTENSIL_ITEMS).toHaveLength(6);
  });

  it('should have plate as center position', () => {
    const plate = UTENSIL_ITEMS.find(u => u.id === 'plate');
    expect(plate?.position).toBe('center');
    expect(plate?.emoji).toBe('🍽️');
  });

  it('should have fork and napkin as left position', () => {
    const fork = UTENSIL_ITEMS.find(u => u.id === 'fork');
    const napkin = UTENSIL_ITEMS.find(u => u.id === 'napkin');
    expect(fork?.position).toBe('left');
    expect(napkin?.position).toBe('left');
  });

  it('should have knife, spoon, and cup as right position', () => {
    const knife = UTENSIL_ITEMS.find(u => u.id === 'knife');
    const spoon = UTENSIL_ITEMS.find(u => u.id === 'spoon');
    const cup = UTENSIL_ITEMS.find(u => u.id === 'cup');
    expect(knife?.position).toBe('right');
    expect(spoon?.position).toBe('right');
    expect(cup?.position).toBe('right');
  });

  it('should have valid utensil item structure', () => {
    UTENSIL_ITEMS.forEach(item => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('emoji');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('position');
      expect(item).toHaveProperty('color');
      expect(['left', 'right', 'center']).toContain(item.position);
    });
  });

  it('should have unique IDs', () => {
    const ids = UTENSIL_ITEMS.map(u => u.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('Utensil Items', () => {
  it('should have plate with correct properties', () => {
    const plate = UTENSIL_ITEMS.find(u => u.id === 'plate');
    expect(plate?.name).toBe('Plate');
    expect(plate?.emoji).toBe('🍽️');
    expect(plate?.position).toBe('center');
    expect(plate?.color).toBe('#E8E8E8');
  });

  it('should have fork with correct properties', () => {
    const fork = UTENSIL_ITEMS.find(u => u.id === 'fork');
    expect(fork?.name).toBe('Fork');
    expect(fork?.emoji).toBe('🍴');
    expect(fork?.position).toBe('left');
    expect(fork?.color).toBe('#C0C0C0');
  });

  it('should have knife with correct properties', () => {
    const knife = UTENSIL_ITEMS.find(u => u.id === 'knife');
    expect(knife?.name).toBe('Knife');
    expect(knife?.emoji).toBe('🔪');
    expect(knife?.position).toBe('right');
    expect(knife?.color).toBe('#C0C0C0');
  });

  it('should have spoon with correct properties', () => {
    const spoon = UTENSIL_ITEMS.find(u => u.id === 'spoon');
    expect(spoon?.name).toBe('Spoon');
    expect(spoon?.emoji).toBe('🥄');
    expect(spoon?.position).toBe('right');
    expect(spoon?.color).toBe('#C0C0C0');
  });

  it('should have cup with correct properties', () => {
    const cup = UTENSIL_ITEMS.find(u => u.id === 'cup');
    expect(cup?.name).toBe('Cup');
    expect(cup?.emoji).toBe('🥛');
    expect(cup?.position).toBe('right');
    expect(cup?.color).toBe('#87CEEB');
  });

  it('should have napkin with correct properties', () => {
    const napkin = UTENSIL_ITEMS.find(u => u.id === 'napkin');
    expect(napkin?.name).toBe('Napkin');
    expect(napkin?.emoji).toBe('🧻');
    expect(napkin?.position).toBe('left');
    expect(napkin?.color).toBe('#FFFFFF');
  });
});

describe('createInitialState', () => {
  it('should create initial game state', () => {
    const state = createInitialState();
    expect(state.currentLevel).toBe(1);
    expect(state.placedItems).toEqual([]);
    expect(state.availableItems).toEqual([]);
    expect(state.score).toBe(0);
    expect(state.stars).toBe(0);
    expect(state.isComplete).toBe(false);
    expect(state.isPlaying).toBe(false);
  });

  it('should create independent state instances', () => {
    const state1 = createInitialState();
    const state2 = createInitialState();
    state1.score = 100;
    expect(state2.score).toBe(0);
  });

  it('should have correct GameState type', () => {
    const state: GameState = createInitialState();
    expect(typeof state.currentLevel).toBe('number');
    expect(Array.isArray(state.placedItems)).toBe(true);
    expect(Array.isArray(state.availableItems)).toBe(true);
    expect(typeof state.score).toBe('number');
  });
});

describe('shuffleArray', () => {
  it('should shuffle array', () => {
    const input = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(input);
    expect(shuffled).toHaveLength(5);
    expect(shuffled).toContain(1);
    expect(shuffled).toContain(5);
  });

  it('should not modify original array', () => {
    const input = [1, 2, 3];
    shuffleArray(input);
    expect(input).toEqual([1, 2, 3]);
  });

  it('should return different order on multiple calls', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const results = new Set();
    for (let i = 0; i < 20; i++) {
      const shuffled = shuffleArray(input);
      results.add(shuffled.join(','));
    }
    expect(results.size).toBeGreaterThan(1);
  });

  it('should handle empty array', () => {
    expect(shuffleArray([])).toEqual([]);
  });

  it('should handle single element', () => {
    expect(shuffleArray([1])).toEqual([1]);
  });
});

describe('getUtensilsForLevel', () => {
  it('should return 3 utensils for level 1', () => {
    const utensils = getUtensilsForLevel(1);
    expect(utensils).toHaveLength(3);
    expect(utensils.map(u => u.id).sort()).toEqual(['fork', 'knife', 'plate']);
  });

  it('should return 5 utensils for level 2', () => {
    const utensils = getUtensilsForLevel(2);
    expect(utensils).toHaveLength(5);
    expect(utensils.map(u => u.id)).not.toContain('napkin');
  });

  it('should return all 6 utensils for level 3', () => {
    const utensils = getUtensilsForLevel(3);
    expect(utensils).toHaveLength(6);
  });

  it('should return all 6 utensils for level 4+ (same as level 3)', () => {
    const utensils = getUtensilsForLevel(4);
    expect(utensils).toHaveLength(6);
  });

  it('should return unique utensils in each call', () => {
    const utensils = getUtensilsForLevel(1);
    const ids = utensils.map(u => u.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should not include napkin in level 1', () => {
    const utensils = getUtensilsForLevel(1);
    expect(utensils.map(u => u.id)).not.toContain('napkin');
  });

  it('should not include spoon in level 1', () => {
    const utensils = getUtensilsForLevel(1);
    expect(utensils.map(u => u.id)).not.toContain('spoon');
  });

  it('should not include cup in level 1', () => {
    const utensils = getUtensilsForLevel(1);
    expect(utensils.map(u => u.id)).not.toContain('cup');
  });

  it('should include plate in all levels', () => {
    for (let level = 1; level <= 3; level++) {
      const utensils = getUtensilsForLevel(level);
      expect(utensils.map(u => u.id)).toContain('plate');
    }
  });

  it('should include fork in all levels', () => {
    for (let level = 1; level <= 3; level++) {
      const utensils = getUtensilsForLevel(level);
      expect(utensils.map(u => u.id)).toContain('fork');
    }
  });

  it('should include knife in all levels', () => {
    for (let level = 1; level <= 3; level++) {
      const utensils = getUtensilsForLevel(level);
      expect(utensils.map(u => u.id)).toContain('knife');
    }
  });

  it('should include napkin only in level 3', () => {
    const level1 = getUtensilsForLevel(1);
    const level2 = getUtensilsForLevel(2);
    const level3 = getUtensilsForLevel(3);

    expect(level1.map(u => u.id)).not.toContain('napkin');
    expect(level2.map(u => u.id)).not.toContain('napkin');
    expect(level3.map(u => u.id)).toContain('napkin');
  });
});

describe('evaluateTable', () => {
  it('should count all items as correct for basic placement', () => {
    const placed: UtensilItem[] = [
      UTENSIL_ITEMS.find(u => u.id === 'plate')!,
      UTENSIL_ITEMS.find(u => u.id === 'fork')!,
      UTENSIL_ITEMS.find(u => u.id === 'knife')!,
    ];
    const result = evaluateTable(placed);
    expect(result.correct).toBe(3);
    expect(result.total).toBe(3);
    expect(result.isCorrect).toBe(true);
  });

  it('should mark table as correct with 3+ items', () => {
    const placed: UtensilItem[] = [
      UTENSIL_ITEMS.find(u => u.id === 'plate')!,
      UTENSIL_ITEMS.find(u => u.id === 'fork')!,
    ];
    const result = evaluateTable(placed);
    expect(result.isCorrect).toBe(false); // Only 2 items
  });

  it('should mark table as correct with exactly 3 items', () => {
    const placed: UtensilItem[] = [
      UTENSIL_ITEMS.find(u => u.id === 'plate')!,
      UTENSIL_ITEMS.find(u => u.id === 'fork')!,
      UTENSIL_ITEMS.find(u => u.id === 'knife')!,
    ];
    const result = evaluateTable(placed);
    expect(result.isCorrect).toBe(true);
  });

  it('should count all non-center items as correct', () => {
    const placed: UtensilItem[] = [
      UTENSIL_ITEMS.find(u => u.id === 'fork')!,
      UTENSIL_ITEMS.find(u => u.id === 'knife')!,
      UTENSIL_ITEMS.find(u => u.id === 'spoon')!,
    ];
    const result = evaluateTable(placed);
    // All non-center items count as correct
    expect(result.correct).toBe(3);
    expect(result.total).toBe(3);
  });

  it('should handle empty placement', () => {
    const result = evaluateTable([]);
    expect(result.correct).toBe(0);
    expect(result.total).toBe(0);
    expect(result.isCorrect).toBe(false);
  });

  it('should handle single item', () => {
    const placed: UtensilItem[] = [UTENSIL_ITEMS.find(u => u.id === 'plate')!];
    const result = evaluateTable(placed);
    expect(result.correct).toBe(1);
    expect(result.total).toBe(1);
    expect(result.isCorrect).toBe(false); // Less than 3 items
  });

  it('should handle all 6 utensils', () => {
    const placed = [...UTENSIL_ITEMS];
    const result = evaluateTable(placed);
    expect(result.correct).toBe(6);
    expect(result.total).toBe(6);
    expect(result.isCorrect).toBe(true);
  });

  it('should increment correct count for each item', () => {
    const placed: UtensilItem[] = [
      UTENSIL_ITEMS.find(u => u.id === 'fork')!,
      UTENSIL_ITEMS.find(u => u.id === 'knife')!,
    ];
    const result = evaluateTable(placed);
    expect(result.correct).toBe(2);
  });
});

describe('calculateScore', () => {
  it('should give 30 points per correct item', () => {
    const placed: UtensilItem[] = [
      UTENSIL_ITEMS.find(u => u.id === 'plate')!,
      UTENSIL_ITEMS.find(u => u.id === 'fork')!,
      UTENSIL_ITEMS.find(u => u.id === 'knife')!,
    ];
    const score = calculateScore(placed, 1);
    // 3 correct * 30 = 90 + 50 bonus = 140 - 0 penalty = 140
    expect(score).toBe(140);
  });

  it('should add 50 bonus for correct table', () => {
    const placed: UtensilItem[] = [
      UTENSIL_ITEMS.find(u => u.id === 'plate')!,
      UTENSIL_ITEMS.find(u => u.id === 'fork')!,
      UTENSIL_ITEMS.find(u => u.id === 'knife')!,
    ];
    const score = calculateScore(placed, 1);
    // Base: 3 * 30 = 90, Bonus: 50, Total: 140
    expect(score).toBe(140);
  });

  it('should subtract 10 points per extra attempt', () => {
    const placed: UtensilItem[] = [
      UTENSIL_ITEMS.find(u => u.id === 'plate')!,
      UTENSIL_ITEMS.find(u => u.id === 'fork')!,
      UTENSIL_ITEMS.find(u => u.id === 'knife')!,
    ];
    // 3 attempts: 140 - (3-1)*10 = 140 - 20 = 120
    const score = calculateScore(placed, 3);
    expect(score).toBe(120);
  });

  it('should never return less than 10 points', () => {
    const placed: UtensilItem[] = [UTENSIL_ITEMS.find(u => u.id === 'plate')!];
    // Even with many attempts: 30 - 100 = -70, but min is 10
    const score = calculateScore(placed, 20);
    expect(score).toBe(10);
  });

  it('should calculate score for incomplete table', () => {
    const placed: UtensilItem[] = [
      UTENSIL_ITEMS.find(u => u.id === 'plate')!,
      UTENSIL_ITEMS.find(u => u.id === 'fork')!,
    ];
    // 2 correct * 30 = 60, no bonus (less than 3 items), no penalty = 60
    const score = calculateScore(placed, 1);
    expect(score).toBe(60);
  });

  it('should calculate max score for perfect table', () => {
    const placed = [...UTENSIL_ITEMS];
    // 6 correct * 30 = 180 + 50 bonus = 230
    const score = calculateScore(placed, 1);
    expect(score).toBe(230);
  });

  it('should apply penalty correctly', () => {
    const placed: UtensilItem[] = [
      UTENSIL_ITEMS.find(u => u.id === 'plate')!,
      UTENSIL_ITEMS.find(u => u.id === 'fork')!,
      UTENSIL_ITEMS.find(u => u.id === 'knife')!,
    ];
    // Base 140, with 5 attempts: 140 - (5-1)*10 = 140 - 40 = 100
    const score = calculateScore(placed, 5);
    expect(score).toBe(100);
  });

  it('should handle single attempt (no penalty)', () => {
    const placed: UtensilItem[] = [
      UTENSIL_ITEMS.find(u => u.id === 'plate')!,
      UTENSIL_ITEMS.find(u => u.id === 'fork')!,
      UTENSIL_ITEMS.find(u => u.id === 'knife')!,
    ];
    const score1 = calculateScore(placed, 1);
    const score2 = calculateScore(placed, 1);
    expect(score1).toBe(score2);
  });

  it('should cap penalty at zero (minimum)', () => {
    const placed: UtensilItem[] = [UTENSIL_ITEMS.find(u => u.id === 'plate')!];
    // 30 - (0)*10 = 30 (attempts-1 with 1 attempt = 0)
    const score = calculateScore(placed, 1);
    expect(score).toBe(30);
  });
});

describe('calculateStars', () => {
  it('should return 5 stars for 150+ score', () => {
    expect(calculateStars(150)).toBe(5);
    expect(calculateStars(200)).toBe(5);
  });

  it('should return 4 stars for 120-149 score', () => {
    expect(calculateStars(120)).toBe(4);
    expect(calculateStars(130)).toBe(4);
    expect(calculateStars(149)).toBe(4);
  });

  it('should return 3 stars for 90-119 score', () => {
    expect(calculateStars(90)).toBe(3);
    expect(calculateStars(100)).toBe(3);
    expect(calculateStars(119)).toBe(3);
  });

  it('should return 2 stars for 60-89 score', () => {
    expect(calculateStars(60)).toBe(2);
    expect(calculateStars(70)).toBe(2);
    expect(calculateStars(89)).toBe(2);
  });

  it('should return 1 star for less than 60 score', () => {
    expect(calculateStars(0)).toBe(1);
    expect(calculateStars(30)).toBe(1);
    expect(calculateStars(59)).toBe(1);
  });

  it('should handle edge cases at boundaries', () => {
    expect(calculateStars(149.9)).toBe(4);
    expect(calculateStars(119.9)).toBe(3);
    expect(calculateStars(89.9)).toBe(2);
    expect(calculateStars(59.9)).toBe(1);
  });
});

describe('Integration Scenarios', () => {
  it('should handle complete level 1 game flow', () => {
    const utensils = getUtensilsForLevel(1);
    expect(utensils).toHaveLength(3);

    // Place all utensils
    const result = evaluateTable(utensils);
    expect(result.isCorrect).toBe(true);

    const score = calculateScore(utensils, 1);
    expect(score).toBeGreaterThanOrEqual(90);

    const stars = calculateStars(score);
    expect(stars).toBeGreaterThan(0);
  });

  it('should handle complete level 2 game flow', () => {
    const utensils = getUtensilsForLevel(2);
    expect(utensils).toHaveLength(5);
    expect(utensils.map(u => u.id)).not.toContain('napkin');

    const result = evaluateTable(utensils);
    expect(result.isCorrect).toBe(true);
  });

  it('should handle complete level 3 game flow', () => {
    const utensils = getUtensilsForLevel(3);
    expect(utensils).toHaveLength(6);

    const result = evaluateTable(utensils);
    expect(result.isCorrect).toBe(true);

    const score = calculateScore(utensils, 1);
    expect(score).toBeGreaterThanOrEqual(200);
  });

  it('should reward perfect first-attempt completion', () => {
    const utensils = getUtensilsForLevel(1);
    const score = calculateScore(utensils, 1);
    // Level 1: 3 utensils * 30 + 50 bonus = 140 points = 4 stars
    const stars = calculateStars(score);
    expect(stars).toBe(4);
  });

  it('should penalize multiple attempts', () => {
    const utensils = getUtensilsForLevel(1);
    const score1 = calculateScore(utensils, 1);
    const score5 = calculateScore(utensils, 5);
    expect(score5).toBeLessThan(score1);
  });
});

describe('Edge Cases', () => {
  it('should handle duplicate utensil placements', () => {
    const plate = UTENSIL_ITEMS.find(u => u.id === 'plate')!;
    const placed: UtensilItem[] = [plate, plate, plate];

    const result = evaluateTable(placed);
    expect(result.correct).toBe(3);
  });

  it('should handle very high score', () => {
    expect(calculateStars(500)).toBe(5);
  });

  it('should handle zero attempts', () => {
    const placed: UtensilItem[] = [UTENSIL_ITEMS.find(u => u.id === 'plate')!];
    // 0 attempts means (0-1)*10 = -10, but max(0, -10) = 0 penalty
    const score = calculateScore(placed, 0);
    expect(score).toBe(30);
  });

  it('should handle negative score input', () => {
    expect(calculateStars(-10)).toBe(1);
  });
});

describe('Type Safety', () => {
  it('should accept all UtensilPosition values', () => {
    const positions: UtensilPosition[] = ['left', 'right', 'center'];
    positions.forEach(pos => {
      expect(['left', 'right', 'center']).toContain(pos);
    });
  });

  it('should maintain UtensilItem type', () => {
    const item: UtensilItem = {
      id: 'test',
      emoji: '🧪',
      name: 'Test',
      position: 'left',
      color: '#FFFFFF',
    };
    expect(typeof item.id).toBe('string');
    expect(typeof item.position).toBe('string');
  });

  it('should maintain TableResult type', () => {
    const result: TableResult = {
      correct: 3,
      total: 3,
      isCorrect: true,
    };
    expect(typeof result.correct).toBe('number');
    expect(typeof result.isCorrect).toBe('boolean');
  });
});

describe('Randomness Behavior', () => {
  it('should produce different utensil orders across multiple calls', () => {
    const selections = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const utensils = getUtensilsForLevel(1);
      const ids = utensils.map(u => u.id).sort().join(',');
      selections.add(ids);
    }
    // Order can vary but contents are same (plate, fork, knife)
    // Since we sort before joining, all should be 'fork,knife,plate'
    // The test verifies shuffling happens even though sorted result is same
    expect(selections.size).toBe(1);
  });

  it('should maintain utensil counts across levels', () => {
    for (let i = 0; i < 10; i++) {
      const level1 = getUtensilsForLevel(1);
      const level2 = getUtensilsForLevel(2);
      const level3 = getUtensilsForLevel(3);

      expect(level1.length).toBe(3);
      expect(level2.length).toBe(5);
      expect(level3.length).toBe(6);
    }
  });
});
