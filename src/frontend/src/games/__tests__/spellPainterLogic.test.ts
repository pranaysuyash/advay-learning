/**
 * Spell Painter Logic Tests
 * Tests for letter painting word game
 */

import { describe, it, expect } from 'vitest';
import {
  LEVELS,
  generateLetterTargets,
  checkLetterPainted,
  isLevelComplete,
  calculateScore,
  type SpellPainterLevel,
  type LetterPosition,
} from '../spellPainterLogic';

describe('spellPainterLogic', () => {
  describe('Level Configuration', () => {
    it('should have 10 levels', () => {
      expect(LEVELS).toHaveLength(10);
    });

    it('should have sequential level ids', () => {
      LEVELS.forEach((level, i) => {
        expect(level.id).toBe(i + 1);
      });
    });

    it('should have all levels with words', () => {
      LEVELS.forEach(level => {
        expect(level.word).toBeDefined();
        expect(level.word.length).toBeGreaterThan(0);
      });
    });

    it('should have all levels with difficulty rating', () => {
      LEVELS.forEach(level => {
        expect(level.difficulty).toBeGreaterThanOrEqual(1);
        expect(level.difficulty).toBeLessThanOrEqual(3);
      });
    });

    it('should have 3-letter words in difficulty 1', () => {
      const diff1Levels = LEVELS.filter(l => l.difficulty === 1);

      diff1Levels.forEach(level => {
        expect(level.word.length).toBe(3);
      });
    });

    it('should have difficulty levels 1, 2, and 3', () => {
      const difficulties = new Set(LEVELS.map(l => l.difficulty));

      expect(difficulties.has(1)).toBe(true);
      expect(difficulties.has(2)).toBe(true);
      expect(difficulties.has(3)).toBe(true);
    });

    it('should have correct words for levels 1-3 (difficulty 1)', () => {
      expect(LEVELS[0].word).toBe('CAT');
      expect(LEVELS[1].word).toBe('DOG');
      expect(LEVELS[2].word).toBe('SUN');
    });

    it('should have correct words for levels 4-7 (difficulty 2)', () => {
      expect(LEVELS[3].word).toBe('BAT');
      expect(LEVELS[4].word).toBe('HAT');
      expect(LEVELS[5].word).toBe('PIG');
      expect(LEVELS[6].word).toBe('CUP');
    });

    it('should have correct words for levels 8-10 (difficulty 3)', () => {
      expect(LEVELS[7].word).toBe('BUS');
      expect(LEVELS[8].word).toBe('FROG');
      expect(LEVELS[9].word).toBe('STAR');
    });

    it('should have 4-letter words in difficulty 3', () => {
      const diff3Levels = LEVELS.filter(l => l.difficulty === 3);

      // Check that difficulty 3 includes longer words (3-4 letters)
      diff3Levels.forEach(level => {
        expect(level.word.length).toBeGreaterThanOrEqual(3);
        expect(level.word.length).toBeLessThanOrEqual(4);
      });

      // FROG and STAR are 4-letter words
      const fourLetterWords = diff3Levels.filter(l => l.word.length === 4);
      expect(fourLetterWords.length).toBeGreaterThanOrEqual(2);
    });

    it('should have 3-letter words in difficulty 2', () => {
      const diff2Levels = LEVELS.filter(l => l.difficulty === 2);

      diff2Levels.forEach(level => {
        expect(level.word.length).toBe(3);
      });
    });
  });

  describe('generateLetterTargets', () => {
    it('should create one target per letter', () => {
      const targets = generateLetterTargets('CAT', 300, 300);

      expect(targets).toHaveLength(3);
    });

    it('should create correct number for 4-letter word', () => {
      const targets = generateLetterTargets('STAR', 300, 300);

      expect(targets).toHaveLength(4);
    });

    it('should assign correct characters', () => {
      const targets = generateLetterTargets('DOG', 300, 300);

      expect(targets[0].char).toBe('D');
      expect(targets[1].char).toBe('O');
      expect(targets[2].char).toBe('G');
    });

    it('should start with all letters unpainted', () => {
      const targets = generateLetterTargets('CAT', 300, 300);

      targets.forEach(target => {
        expect(target.painted).toBe(false);
      });
    });

    it('should calculate letter width based on canvas width', () => {
      const targets = generateLetterTargets('ABC', 300, 300);

      const expectedWidth = 300 / 3;

      targets.forEach(target => {
        expect(target.width).toBeCloseTo(expectedWidth * 0.8, 0);
      });
    });

    it('should make letter height equal to letter width', () => {
      const targets = generateLetterTargets('ABC', 300, 300);

      targets.forEach(target => {
        expect(target.height).toBeCloseTo(target.width, 0);
      });
    });

    it('should center letters vertically', () => {
      const canvasHeight = 300;
      const targets = generateLetterTargets('AB', 300, canvasHeight);

      const expectedWidth = 300 / 2;
      const expectedHeight = expectedWidth;
      const expectedStartY = (canvasHeight - expectedHeight) / 2;

      targets.forEach(target => {
        expect(target.y).toBeCloseTo(expectedStartY, 0);
      });
    });

    it('should position letters horizontally across canvas', () => {
      const targets = generateLetterTargets('ABC', 300, 300);

      // Each letter should be at x = i * letterWidth + margin
      const letterWidth = 300 / 3;

      targets.forEach((target, i) => {
        const expectedX = i * letterWidth + letterWidth * 0.1;
        expect(target.x).toBeCloseTo(expectedX, 0);
      });
    });

    it('should add 10% margin on each side', () => {
      const targets = generateLetterTargets('A', 300, 300);

      expect(targets[0].x).toBeCloseTo(30, 0); // 300 * 0.1
      expect(targets[0].width).toBeCloseTo(300 * 0.8, 0);
    });

    it('should handle single letter word', () => {
      const targets = generateLetterTargets('A', 300, 300);

      expect(targets).toHaveLength(1);
      expect(targets[0].char).toBe('A');
    });

    it('should handle longer words', () => {
      const targets = generateLetterTargets('HELLO', 500, 300);

      expect(targets).toHaveLength(5);
    });

    it('should position letters in correct order', () => {
      const targets = generateLetterTargets('TEST', 400, 300);

      expect(targets[0].char).toBe('T');
      expect(targets[1].char).toBe('E');
      expect(targets[2].char).toBe('S');
      expect(targets[3].char).toBe('T');
    });

    it('should work with different canvas sizes', () => {
      const targets = generateLetterTargets('CAT', 600, 400);

      expect(targets).toHaveLength(3);
      targets.forEach(target => {
        expect(target.width).toBeGreaterThan(0);
        expect(target.height).toBeGreaterThan(0);
      });
    });

    it('should work with square canvas', () => {
      const targets = generateLetterTargets('ABC', 400, 400);

      targets.forEach(target => {
        expect(target.width).toBeCloseTo(target.height, 0);
      });
    });
  });

  describe('checkLetterPainted', () => {
    it('should return true when hand is at letter center', () => {
      const letter: LetterPosition = {
        char: 'A',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        painted: false,
      };

      const result = checkLetterPainted(letter, 50, 50, 0.1);
      expect(result).toBe(true);
    });

    it('should return false when hand is far from letter', () => {
      const letter: LetterPosition = {
        char: 'A',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        painted: false,
      };

      const result = checkLetterPainted(letter, 200, 200, 0.1);
      expect(result).toBe(false);
    });

    it('should use default threshold of 0.1', () => {
      const letter: LetterPosition = {
        char: 'A',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        painted: false,
      };

      // Center at 50, 50, threshold 0.1 means within 10 pixels
      const result = checkLetterPainted(letter, 55, 50);
      expect(result).toBe(true);
    });

    it('should respect custom threshold', () => {
      const letter: LetterPosition = {
        char: 'A',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        painted: false,
      };

      // With threshold 0.05 (5 pixels), 55,50 should be outside
      const result = checkLetterPainted(letter, 55, 50, 0.05);
      expect(result).toBe(false);
    });

    it('should check both x and y coordinates', () => {
      const letter: LetterPosition = {
        char: 'A',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        painted: false,
      };

      // x is within tolerance, y is not
      const result = checkLetterPainted(letter, 50, 70, 0.1);
      expect(result).toBe(false);
    });

    it('should handle letters at different positions', () => {
      const letter: LetterPosition = {
        char: 'A',
        x: 100,
        y: 100,
        width: 80,
        height: 80,
        painted: false,
      };

      // Center at 140, 140
      const result = checkLetterPainted(letter, 140, 140, 0.1);
      expect(result).toBe(true);
    });

    it('should calculate center correctly', () => {
      const letter: LetterPosition = {
        char: 'A',
        x: 50,
        y: 50,
        width: 100,
        height: 80,
        painted: false,
      };

      // Center should be at (100, 90)
      const result = checkLetterPainted(letter, 100, 90, 0.1);
      expect(result).toBe(true);
    });

    it('should normalize by letter dimensions', () => {
      const letter1: LetterPosition = {
        char: 'A',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        painted: false,
      };

      const letter2: LetterPosition = {
        char: 'B',
        x: 0,
        y: 0,
        width: 50,
        height: 50,
        painted: false,
      };

      // Both should accept same relative position
      const result1 = checkLetterPainted(letter1, 50, 50, 0.1);
      const result2 = checkLetterPainted(letter2, 25, 25, 0.1);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });

    it('should return false at edge of tolerance', () => {
      const letter: LetterPosition = {
        char: 'A',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        painted: false,
      };

      // Just outside 10% tolerance
      const result = checkLetterPainted(letter, 61, 50, 0.1);
      expect(result).toBe(false);
    });
  });

  describe('isLevelComplete', () => {
    it('should return true when all letters painted', () => {
      const letters: LetterPosition[] = [
        { char: 'C', x: 0, y: 0, width: 100, height: 100, painted: true },
        { char: 'A', x: 100, y: 0, width: 100, height: 100, painted: true },
        { char: 'T', x: 200, y: 0, width: 100, height: 100, painted: true },
      ];

      expect(isLevelComplete(letters)).toBe(true);
    });

    it('should return false when some letters unpainted', () => {
      const letters: LetterPosition[] = [
        { char: 'C', x: 0, y: 0, width: 100, height: 100, painted: true },
        { char: 'A', x: 100, y: 0, width: 100, height: 100, painted: false },
        { char: 'T', x: 200, y: 0, width: 100, height: 100, painted: true },
      ];

      expect(isLevelComplete(letters)).toBe(false);
    });

    it('should return false when no letters painted', () => {
      const letters: LetterPosition[] = [
        { char: 'C', x: 0, y: 0, width: 100, height: 100, painted: false },
        { char: 'A', x: 100, y: 0, width: 100, height: 100, painted: false },
        { char: 'T', x: 200, y: 0, width: 100, height: 100, painted: false },
      ];

      expect(isLevelComplete(letters)).toBe(false);
    });

    it('should return true for single painted letter', () => {
      const letters: LetterPosition[] = [
        { char: 'A', x: 0, y: 0, width: 100, height: 100, painted: true },
      ];

      expect(isLevelComplete(letters)).toBe(true);
    });

    it('should return false for single unpainted letter', () => {
      const letters: LetterPosition[] = [
        { char: 'A', x: 0, y: 0, width: 100, height: 100, painted: false },
      ];

      expect(isLevelComplete(letters)).toBe(false);
    });

    it('should return true for empty array', () => {
      expect(isLevelComplete([])).toBe(true);
    });

    it('should handle longer words', () => {
      const letters: LetterPosition[] = [
        { char: 'S', x: 0, y: 0, width: 80, height: 80, painted: true },
        { char: 'T', x: 80, y: 0, width: 80, height: 80, painted: true },
        { char: 'A', x: 160, y: 0, width: 80, height: 80, painted: true },
        { char: 'R', x: 240, y: 0, width: 80, height: 80, painted: true },
      ];

      expect(isLevelComplete(letters)).toBe(true);
    });
  });

  describe('calculateScore', () => {
    it('should award 100 points per painted letter', () => {
      const letters: LetterPosition[] = [
        { char: 'C', x: 0, y: 0, width: 100, height: 100, painted: true },
        { char: 'A', x: 100, y: 0, width: 100, height: 100, painted: true },
        { char: 'T', x: 200, y: 0, width: 100, height: 100, painted: true },
      ];

      // 3 letters = 300 base + full time bonus (60s * 5 = 300)
      expect(calculateScore(letters, 0)).toBe(600);
    });

    it('should award 0 points for no painted letters', () => {
      const letters: LetterPosition[] = [
        { char: 'C', x: 0, y: 0, width: 100, height: 100, painted: false },
        { char: 'A', x: 100, y: 0, width: 100, height: 100, painted: false },
        { char: 'T', x: 200, y: 0, width: 100, height: 100, painted: false },
      ];

      // 0 letters = 0 base + full time bonus (300)
      expect(calculateScore(letters, 0)).toBe(300);
    });

    it('should award partial points for partial completion', () => {
      const letters: LetterPosition[] = [
        { char: 'C', x: 0, y: 0, width: 100, height: 100, painted: true },
        { char: 'A', x: 100, y: 0, width: 100, height: 100, painted: false },
        { char: 'T', x: 200, y: 0, width: 100, height: 100, painted: true },
      ];

      // 2 letters = 200 base + full time bonus (300)
      expect(calculateScore(letters, 0)).toBe(500);
    });

    it('should add time bonus for quick completion', () => {
      const letters: LetterPosition[] = [
        { char: 'C', x: 0, y: 0, width: 100, height: 100, painted: true },
        { char: 'A', x: 100, y: 0, width: 100, height: 100, painted: true },
        { char: 'T', x: 200, y: 0, width: 100, height: 100, painted: true },
      ];

      // 30 seconds remaining = 30 * 5 = 150 bonus
      // 3 letters = 300 base + 150 bonus
      const score = calculateScore(letters, 30000);

      expect(score).toBe(450); // 300 + 150
    });

    it('should calculate bonus based on remaining time from 60s', () => {
      const letters: LetterPosition[] = [
        { char: 'A', x: 0, y: 0, width: 100, height: 100, painted: true },
      ];

      // 60s - 50s = 10s remaining = 50 bonus
      const score = calculateScore(letters, 50000);

      expect(score).toBe(150); // 100 + 50
    });

    it('should give no time bonus after 60 seconds', () => {
      const letters: LetterPosition[] = [
        { char: 'A', x: 0, y: 0, width: 100, height: 100, painted: true },
      ];

      const score1 = calculateScore(letters, 60000);
      const score2 = calculateScore(letters, 70000);

      expect(score1).toBe(100);
      expect(score2).toBe(100);
    });

    it('should award 5 points per second remaining', () => {
      const letters: LetterPosition[] = [
        { char: 'A', x: 0, y: 0, width: 100, height: 100, painted: true },
      ];

      // 10s remaining = 50 bonus
      const score = calculateScore(letters, 50000);

      expect(score).toBe(150); // 100 base + 50 time bonus
    });

    it('should handle maximum time bonus', () => {
      const letters: LetterPosition[] = [
        { char: 'A', x: 0, y: 0, width: 100, height: 100, painted: true },
      ];

      // Instant completion = 60s remaining = 300 bonus
      const score = calculateScore(letters, 0);

      expect(score).toBe(400); // 100 base + 300 time bonus
    });

    it('should handle 4-letter word scoring', () => {
      const letters: LetterPosition[] = [
        { char: 'S', x: 0, y: 0, width: 75, height: 75, painted: true },
        { char: 'T', x: 75, y: 0, width: 75, height: 75, painted: true },
        { char: 'A', x: 150, y: 0, width: 75, height: 75, painted: true },
        { char: 'R', x: 225, y: 0, width: 75, height: 75, painted: true },
      ];

      // All painted + 20s remaining = 400 base + 100 bonus
      const score = calculateScore(letters, 40000);

      expect(score).toBe(500); // 400 base + 100 time bonus
    });

    it('should round down fractional time bonus', () => {
      const letters: LetterPosition[] = [
        { char: 'A', x: 0, y: 0, width: 100, height: 100, painted: true },
      ];

      // 1.9s remaining should round to 1s
      const score = calculateScore(letters, 58100);

      expect(score).toBe(105); // 100 base + 5 time bonus
    });
  });

  describe('Type Definitions', () => {
    it('should have correct SpellPainterLevel structure', () => {
      const level: SpellPainterLevel = {
        id: 1,
        word: 'CAT',
        difficulty: 1,
      };

      expect(level.id).toBeDefined();
      expect(level.word).toBeDefined();
      expect(level.difficulty).toBeDefined();
    });

    it('should have correct LetterPosition structure', () => {
      const letter: LetterPosition = {
        char: 'A',
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        painted: false,
      };

      expect(letter.char).toBeDefined();
      expect(letter.x).toBeDefined();
      expect(letter.y).toBeDefined();
      expect(letter.width).toBeDefined();
      expect(letter.height).toBeDefined();
      expect(letter.painted).toBeDefined();
    });

    it('should allow single character strings', () => {
      const letter: LetterPosition = {
        char: 'X',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        painted: true,
      };

      expect(letter.char.length).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero canvas width gracefully', () => {
      // This would create zero-width letters, but shouldn't crash
      const targets = generateLetterTargets('A', 0, 300);

      expect(targets).toHaveLength(1);
    });

    it('should handle zero canvas height gracefully', () => {
      const targets = generateLetterTargets('A', 300, 0);

      expect(targets).toHaveLength(1);
    });

    it('should handle negative time in score calculation', () => {
      const letters: LetterPosition[] = [
        { char: 'A', x: 0, y: 0, width: 100, height: 100, painted: true },
      ];

      const score = calculateScore(letters, -1000);

      expect(score).toBeGreaterThanOrEqual(100);
    });

    it('should handle very large time values', () => {
      const letters: LetterPosition[] = [
        { char: 'A', x: 0, y: 0, width: 100, height: 100, painted: true },
      ];

      const score = calculateScore(letters, 1000000);

      expect(score).toBe(100); // No bonus beyond 60s
    });
  });

  describe('Integration Scenarios', () => {
    it('should work through complete level 1', () => {
      const level = LEVELS[0];
      const letters = generateLetterTargets(level.word, 300, 300);

      expect(letters).toHaveLength(3);
      expect(isLevelComplete(letters)).toBe(false);

      // Paint all letters
      letters.forEach(l => l.painted = true);

      expect(isLevelComplete(letters)).toBe(true);
      expect(calculateScore(letters, 30000)).toBe(450);
    });

    it('should work through complete level 10', () => {
      const level = LEVELS[9];
      const letters = generateLetterTargets(level.word, 400, 300);

      expect(letters).toHaveLength(4);
      expect(level.word).toBe('STAR');

      // Paint all letters
      letters.forEach(l => l.painted = true);

      expect(isLevelComplete(letters)).toBe(true);
      expect(calculateScore(letters, 20000)).toBe(600); // 400 base + 200 time bonus
    });

    it('should progress through difficulty levels', () => {
      const diff1 = LEVELS.filter(l => l.difficulty === 1);
      const diff2 = LEVELS.filter(l => l.difficulty === 2);
      const diff3 = LEVELS.filter(l => l.difficulty === 3);

      expect(diff1.length).toBe(3);
      expect(diff2.length).toBe(4);
      expect(diff3.length).toBe(3);
    });

    it('should check painting at each letter position', () => {
      const word = 'CAT';
      const letters = generateLetterTargets(word, 300, 300);

      letters.forEach((letter, i) => {
        const centerX = letter.x + letter.width / 2;
        const centerY = letter.y + letter.height / 2;

        const canPaint = checkLetterPainted(letter, centerX, centerY, 0.1);
        expect(canPaint).toBe(true);
      });
    });
  });

  describe('Word Content', () => {
    it('should contain age-appropriate words', () => {
      LEVELS.forEach(level => {
        expect(level.word).toMatch(/^[A-Z]+$/);
      });
    });

    it('should have unique words', () => {
      const words = LEVELS.map(l => l.word);
      const uniqueWords = new Set(words);

      expect(uniqueWords.size).toBe(words.length);
    });

    it('should alphabetically check first word', () => {
      expect(LEVELS[0].word).toBe('CAT');
    });
  });
});
