/**
 * Phonics Tracing - Game Logic Tests
 *
 * Tests for letter tracing with real-time audio feedback.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  LETTER_DATA,
  LEVELS,
  getLetterData,
  getLettersForLevel,
  getLevelConfig,
  calculateTraceAccuracy,
  isTracingComplete,
  getNextLetter,
  calculateScore,
  getLetterGuidePoints,
  type LetterData,
  type TracePoint,
  type TracingLevelConfig,
  type SoundType,
} from '../phonicsTracingLogic';

describe('Phonics Tracing - Game Logic', () => {
  describe('Constants', () => {
    it('should have 26 letters', () => {
      expect(LETTER_DATA).toHaveLength(26);
    });

    it('should have letters A through Z', () => {
      const letters = LETTER_DATA.map(l => l.letter);
      expect(letters).toContain('A');
      expect(letters).toContain('Z');
      expect(letters).toContain('M');
      expect(letters).toContain('S');
    });

    it('should have 3 levels', () => {
      expect(LEVELS).toHaveLength(3);
    });

    it('should have level 1 with 6 letters', () => {
      expect(LEVELS[0].level).toBe(1);
      expect(LEVELS[0].letters).toHaveLength(6);
      expect(LEVELS[0].timePerLetter).toBe(30);
      expect(LEVELS[0].passThreshold).toBe(60);
    });

    it('should have level 2 with 9 letters', () => {
      expect(LEVELS[1].level).toBe(2);
      expect(LEVELS[1].letters).toHaveLength(9);
      expect(LEVELS[1].timePerLetter).toBe(25);
      expect(LEVELS[1].passThreshold).toBe(65);
    });

    it('should have level 3 with 8 letters', () => {
      expect(LEVELS[2].level).toBe(3);
      expect(LEVELS[2].letters).toHaveLength(8);
      expect(LEVELS[2].timePerLetter).toBe(20);
      expect(LEVELS[2].passThreshold).toBe(70);
    });
  });

  describe('Letter Data', () => {
    it('should have all required properties', () => {
      LETTER_DATA.forEach(letter => {
        expect(letter).toHaveProperty('letter');
        expect(letter).toHaveProperty('uppercase');
        expect(letter).toHaveProperty('lowercase');
        expect(letter).toHaveProperty('soundType');
        expect(letter).toHaveProperty('ttsIntro');
        expect(letter).toHaveProperty('ttsExample');
        expect(letter).toHaveProperty('exampleWord');
        expect(letter).toHaveProperty('exampleEmoji');
      });
    });

    it('should have correct uppercase and lowercase', () => {
      const a = getLetterData('A')!;
      expect(a.uppercase).toBe('A');
      expect(a.lowercase).toBe('a');

      const b = getLetterData('B')!;
      expect(b.uppercase).toBe('B');
      expect(b.lowercase).toBe('b');
    });

    it('should classify vowels correctly', () => {
      const vowels = ['A', 'E', 'I', 'O', 'U'];
      vowels.forEach(v => {
        const letter = getLetterData(v)!;
        expect(letter.soundType).toBe('vowel');
      });
    });

    it('should classify continuous sounds correctly', () => {
      const continuous = ['F', 'L', 'M', 'N', 'R', 'S', 'W', 'Z'];
      continuous.forEach(c => {
        const letter = getLetterData(c)!;
        expect(letter.soundType).toBe('continuous');
      });
    });

    it('should classify burst sounds correctly', () => {
      const burst = ['B', 'C', 'D', 'G', 'H', 'J', 'K', 'P', 'Q', 'T', 'V', 'X'];
      burst.forEach(b => {
        const letter = getLetterData(b)!;
        expect(letter.soundType).toBe('burst');
      });
    });

    it('should have valid sound types', () => {
      const validTypes: SoundType[] = ['continuous', 'burst', 'vowel'];
      LETTER_DATA.forEach(letter => {
        expect(validTypes).toContain(letter.soundType);
      });
    });

    it('should have example emojis for all letters', () => {
      LETTER_DATA.forEach(letter => {
        expect(letter.exampleEmoji.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getLetterData', () => {
    it('should return letter data for uppercase A', () => {
      const data = getLetterData('A');
      expect(data).toBeDefined();
      expect(data?.letter).toBe('A');
      expect(data?.exampleWord).toBe('Apple');
    });

    it('should return letter data for lowercase a', () => {
      const data = getLetterData('a');
      expect(data).toBeDefined();
      expect(data?.letter).toBe('A');
    });

    it('should return letter data for all letters', () => {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (const letter of alphabet) {
        const data = getLetterData(letter);
        expect(data).toBeDefined();
        expect(data?.letter).toBe(letter);
      }
    });

    it('should return undefined for invalid letter', () => {
      expect(getLetterData('1')).toBeUndefined();
      expect(getLetterData('')).toBeUndefined();
      expect(getLetterData('AA')).toBeUndefined();
      expect(getLetterData('@')).toBeUndefined();
    });
  });

  describe('getLettersForLevel', () => {
    it('should return level 1 letters', () => {
      const letters = getLettersForLevel(1);
      expect(letters).toEqual(['A', 'B', 'C', 'M', 'S', 'T']);
    });

    it('should return level 2 letters', () => {
      const letters = getLettersForLevel(2);
      expect(letters).toContain('D');
      expect(letters).toContain('F');
      expect(letters).toContain('L');
      expect(letters).toHaveLength(9);
    });

    it('should return level 3 letters', () => {
      const letters = getLettersForLevel(3);
      expect(letters).toContain('E');
      expect(letters).toContain('I');
      expect(letters).toContain('U');
      expect(letters).toHaveLength(8);
    });

    it('should fallback to level 1 for invalid level', () => {
      const letters = getLettersForLevel(99);
      expect(letters).toEqual(['A', 'B', 'C', 'M', 'S', 'T']);
    });

    it('should return 23 unique letters across all levels', () => {
      const allLetters = new Set<string>();
      for (let i = 1; i <= 3; i++) {
        getLettersForLevel(i).forEach(l => allLetters.add(l));
      }
      // Level 1: 6 letters, Level 2: 9 letters, Level 3: 8 letters = 23 total
      expect(allLetters.size).toBe(23);
    });
  });

  describe('getLevelConfig', () => {
    it('should return level 1 config', () => {
      const config = getLevelConfig(1);
      expect(config.level).toBe(1);
      expect(config.letters).toHaveLength(6);
      expect(config.timePerLetter).toBe(30);
      expect(config.passThreshold).toBe(60);
    });

    it('should return level 2 config', () => {
      const config = getLevelConfig(2);
      expect(config.level).toBe(2);
      expect(config.letters).toHaveLength(9);
      expect(config.timePerLetter).toBe(25);
      expect(config.passThreshold).toBe(65);
    });

    it('should return level 3 config', () => {
      const config = getLevelConfig(3);
      expect(config.level).toBe(3);
      expect(config.letters).toHaveLength(8);
      expect(config.timePerLetter).toBe(20);
      expect(config.passThreshold).toBe(70);
    });

    it('should fallback to level 1 for invalid level', () => {
      const config = getLevelConfig(0);
      expect(config.level).toBe(1);
    });
  });

  describe('calculateTraceAccuracy', () => {
    it('should return 0 for empty trace', () => {
      const points: TracePoint[] = [];
      expect(calculateTraceAccuracy(points, 'A')).toBe(0);
    });

    it('should return 0 for trace with fewer than 10 points', () => {
      const points: TracePoint[] = Array.from({ length: 5 }, (_, i) => ({
        x: 0.3 + i * 0.01,
        y: 0.3,
        timestamp: Date.now() + i * 10,
      }));
      expect(calculateTraceAccuracy(points, 'A')).toBe(0);
    });

    it('should return 0 for invalid letter', () => {
      const points: TracePoint[] = Array.from({ length: 20 }, (_, i) => ({
        x: 0.3 + i * 0.01,
        y: 0.3,
        timestamp: Date.now() + i * 10,
      }));
      expect(calculateTraceAccuracy(points, '@')).toBe(0);
    });

    it('should calculate accuracy for valid trace', () => {
      const points: TracePoint[] = Array.from({ length: 50 }, (_, i) => ({
        x: 0.2 + (i * 0.01),
        y: 0.3 + Math.sin(i * 0.2) * 0.1,
        timestamp: Date.now() + i * 10,
      }));
      const accuracy = calculateTraceAccuracy(points, 'A');
      expect(accuracy).toBeGreaterThan(0);
      expect(accuracy).toBeLessThanOrEqual(100);
    });

    it('should return higher accuracy for longer traces', () => {
      const shortTrace: TracePoint[] = Array.from({ length: 15 }, (_, i) => ({
        x: 0.2 + i * 0.01,
        y: 0.3,
        timestamp: Date.now() + i * 10,
      }));

      const longTrace: TracePoint[] = Array.from({ length: 100 }, (_, i) => ({
        x: 0.2 + i * 0.005,
        y: 0.3 + Math.sin(i * 0.1) * 0.05,
        timestamp: Date.now() + i * 10,
      }));

      const shortAccuracy = calculateTraceAccuracy(shortTrace, 'A');
      const longAccuracy = calculateTraceAccuracy(longTrace, 'A');
      expect(longAccuracy).toBeGreaterThan(shortAccuracy);
    });

    it('should cap accuracy at 100', () => {
      const points: TracePoint[] = Array.from({ length: 200 }, (_, i) => ({
        x: 0.1 + Math.random() * 0.8,
        y: 0.1 + Math.random() * 0.8,
        timestamp: Date.now() + i * 10,
      }));
      const accuracy = calculateTraceAccuracy(points, 'A');
      expect(accuracy).toBeLessThanOrEqual(100);
    });
  });

  describe('isTracingComplete', () => {
    it('should return false for empty trace', () => {
      expect(isTracingComplete([])).toBe(false);
    });

    it('should return false for trace with fewer than default min points', () => {
      const points: TracePoint[] = Array.from({ length: 20 }, (_, i) => ({
        x: 0.3 + i * 0.01,
        y: 0.3,
        timestamp: Date.now() + i * 10,
      }));
      expect(isTracingComplete(points)).toBe(false);
    });

    it('should return false for trace without sufficient coverage', () => {
      const points: TracePoint[] = Array.from({ length: 50 }, () => ({
        x: 0.5,
        y: 0.5,
        timestamp: Date.now(),
      }));
      expect(isTracingComplete(points)).toBe(false);
    });

    it('should return true for trace with sufficient points and coverage', () => {
      // Need both width > 0.15 and height > 0.15
      const points: TracePoint[] = Array.from({ length: 50 }, (_, i) => ({
        x: 0.2 + i * 0.01,
        y: 0.3 + (i % 20) * 0.01, // Vary y to get height > 0.15
        timestamp: Date.now() + i * 10,
      }));
      expect(isTracingComplete(points)).toBe(true);
    });

    it('should use custom minPoints parameter', () => {
      const points: TracePoint[] = Array.from({ length: 25 }, (_, i) => ({
        x: 0.2 + i * 0.01,
        y: 0.3 + (i % 20) * 0.01,
        timestamp: Date.now() + i * 10,
      }));
      // 25 points, default min is 30, but we have sufficient coverage
      expect(isTracingComplete(points, 30)).toBe(false);
      expect(isTracingComplete(points, 20)).toBe(true);
    });

    it('should check coverage area', () => {
      // Wide coverage with both width and height > 0.15
      const wideTrace: TracePoint[] = Array.from({ length: 35 }, (_, i) => ({
        x: 0.2 + i * 0.02,
        y: 0.2 + (i % 20) * 0.01,
        timestamp: Date.now() + i * 10,
      }));
      expect(isTracingComplete(wideTrace)).toBe(true);

      // Narrow coverage - height < 0.15
      const narrowTrace: TracePoint[] = Array.from({ length: 35 }, (_, i) => ({
        x: 0.4,
        y: 0.4 + i * 0.001,
        timestamp: Date.now() + i * 10,
      }));
      expect(isTracingComplete(narrowTrace)).toBe(false);
    });
  });

  describe('getNextLetter', () => {
    it('should return B when current is A (level 1)', () => {
      expect(getNextLetter('A', 1)).toBe('B');
    });

    it('should return first letter when at end of level', () => {
      expect(getNextLetter('T', 1)).toBe('A');
      expect(getNextLetter('R', 2)).toBe('D');
      expect(getNextLetter('Z', 3)).toBe('E');
    });

    it('should return first letter for invalid current letter', () => {
      expect(getNextLetter('Z', 1)).toBe('A');
      expect(getNextLetter('@', 2)).toBe('D');
    });

    it('should handle lowercase input', () => {
      expect(getNextLetter('a', 1)).toBe('B');
      expect(getNextLetter('b', 1)).toBe('C');
    });

    it('should cycle through level 1 letters', () => {
      const letters = getLettersForLevel(1);
      let current = letters[0];
      for (let i = 1; i < letters.length; i++) {
        current = getNextLetter(current, 1);
        expect(current).toBe(letters[i]);
      }
      // Next should cycle back
      current = getNextLetter(current, 1);
      expect(current).toBe(letters[0]);
    });
  });

  describe('calculateScore', () => {
    it('should return accuracy when no time bonus', () => {
      expect(calculateScore(80, 30, 30)).toBe(80);
      expect(calculateScore(60, 25, 25)).toBe(60);
    });

    it('should add time bonus for early completion', () => {
      expect(calculateScore(80, 15, 30)).toBeGreaterThan(80);
      expect(calculateScore(60, 10, 30)).toBeGreaterThan(60);
    });

    it('should cap score at 100', () => {
      expect(calculateScore(100, 0, 30)).toBeLessThanOrEqual(100);
      expect(calculateScore(90, 0, 30)).toBeLessThanOrEqual(100);
    });

    it('should calculate time bonus correctly', () => {
      // Half time used = 10 point bonus
      const score = calculateScore(70, 15, 30);
      expect(score).toBe(80); // 70 + 10
    });

    it('should handle zero time used', () => {
      const score = calculateScore(60, 0, 30);
      expect(score).toBe(80); // 60 + 20 (max time bonus)
    });

    it('should handle full time used', () => {
      const score = calculateScore(70, 30, 30);
      expect(score).toBe(70); // 70 + 0 (no time bonus)
    });

    it('should handle over time used', () => {
      const score = calculateScore(70, 35, 30);
      expect(score).toBe(70); // No penalty for overtime, just no bonus
    });
  });

  describe('getLetterGuidePoints', () => {
    it('should return guide points for letter A', () => {
      const points = getLetterGuidePoints('A');
      expect(points.length).toBeGreaterThan(0);
      expect(points[0]).toHaveProperty('x');
      expect(points[0]).toHaveProperty('y');
    });

    it('should return guide points for letter S', () => {
      const points = getLetterGuidePoints('S');
      expect(points.length).toBeGreaterThan(0);
    });

    it('should return guide points for letter B', () => {
      const points = getLetterGuidePoints('B');
      expect(points.length).toBeGreaterThan(0);
    });

    it('should return guide points for letter O', () => {
      const points = getLetterGuidePoints('O');
      expect(points.length).toBeGreaterThan(0);
    });

    it('should return default guide for unknown letter', () => {
      const points = getLetterGuidePoints('X');
      expect(points.length).toBe(4);
      expect(points[0].x).toBe(0.3);
      expect(points[0].y).toBe(0.2);
    });

    it('should handle lowercase input', () => {
      const upperPoints = getLetterGuidePoints('A');
      const lowerPoints = getLetterGuidePoints('a');
      expect(upperPoints).toEqual(lowerPoints);
    });

    it('should return normalized coordinates (0-1)', () => {
      const points = getLetterGuidePoints('A');
      points.forEach(p => {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(1);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete tracing flow for level 1', () => {
      const letters = getLettersForLevel(1);
      expect(letters.length).toBe(6);

      let currentLetter = letters[0];
      for (let i = 0; i < letters.length; i++) {
        const letterData = getLetterData(currentLetter);
        expect(letterData).toBeDefined();

        // Create trace with sufficient coverage (width and height > 0.15)
        const points: TracePoint[] = Array.from({ length: 50 }, (_, j) => ({
          x: 0.2 + j * 0.01,
          y: 0.3 + (j % 20) * 0.01,
          timestamp: Date.now() + j * 10,
        }));

        const accuracy = calculateTraceAccuracy(points, currentLetter);
        expect(accuracy).toBeGreaterThan(0);

        const isComplete = isTracingComplete(points);
        expect(isComplete).toBe(true);

        const score = calculateScore(accuracy, 20, 30);
        expect(score).toBeGreaterThan(0);

        currentLetter = getNextLetter(currentLetter, 1);
      }
    });

    it('should handle progression through levels', () => {
      for (let level = 1; level <= 3; level++) {
        const config = getLevelConfig(level);
        const letters = getLettersForLevel(level);

        expect(config.level).toBe(level);
        expect(letters.length).toBe(config.letters.length);

        letters.forEach(letter => {
          const data = getLetterData(letter);
          expect(data).toBeDefined();
          expect(data?.letter).toBe(letter);
        });
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string letter', () => {
      expect(getLetterData('')).toBeUndefined();
    });

    it('should handle special characters', () => {
      expect(getLetterData('@')).toBeUndefined();
      expect(getLetterData('1')).toBeUndefined();
    });

    it('should handle trace with all same points', () => {
      const points: TracePoint[] = Array.from({ length: 50 }, () => ({
        x: 0.5,
        y: 0.5,
        timestamp: Date.now(),
      }));
      expect(isTracingComplete(points)).toBe(false); // No coverage
    });

    it('should handle trace with extreme coordinates', () => {
      const points: TracePoint[] = [
        { x: 0, y: 0, timestamp: Date.now() },
        { x: 1, y: 1, timestamp: Date.now() + 100 },
      ];
      expect(isTracingComplete(points, 2)).toBe(true); // Sufficient coverage
    });

    it('should handle negative time values', () => {
      const score = calculateScore(70, -5, 30);
      expect(score).toBeGreaterThan(70); // Negative time treated as early
    });
  });

  describe('Type Safety', () => {
    it('should maintain LetterData type', () => {
      const data: LetterData = {
        letter: 'A',
        uppercase: 'A',
        lowercase: 'a',
        soundType: 'vowel',
        ttsIntro: 'Test',
        ttsExample: 'Test example',
        exampleWord: 'TestWord',
        exampleEmoji: '🧪',
      };
      expect(typeof data.letter).toBe('string');
      expect(typeof data.soundType).toBe('string');
    });

    it('should maintain TracePoint type', () => {
      const point: TracePoint = {
        x: 0.5,
        y: 0.5,
        timestamp: 12345,
      };
      expect(typeof point.x).toBe('number');
      expect(typeof point.y).toBe('number');
      expect(typeof point.timestamp).toBe('number');
    });

    it('should maintain TracingLevelConfig type', () => {
      const config: TracingLevelConfig = {
        level: 1,
        letters: ['A', 'B'],
        timePerLetter: 30,
        passThreshold: 60,
      };
      expect(typeof config.level).toBe('number');
      expect(Array.isArray(config.letters)).toBe(true);
      expect(typeof config.timePerLetter).toBe('number');
      expect(typeof config.passThreshold).toBe('number');
    });
  });
});
