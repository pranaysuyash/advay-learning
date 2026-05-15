/**
 * Alphabet Tracing Game Logic Tests
 *
 * Tests for letter path generation, tracing accuracy calculation,
 * scoring, and game mechanics.
 */

import { describe, expect, it } from 'vitest';

import {
  ALPHABET_LETTERS,
  calculateTracingAccuracy,
  calculateTracingScore,
  calculatePathCoverage,
  distanceToLineSegment,
  distanceToLetterPath,
  evaluateTracing,
  generateLetterPath,
  getDefaultProgress,
  getLettersForLevel,
  getNextLetter,
  getStarsFromAccuracy,
  smoothTracePoints,
  updateProgress,
  type LetterPath,
} from '../alphabetTracingLogic';

describe('ALPHABET_LETTERS', () => {
  it('has 26 letters', () => {
    expect(ALPHABET_LETTERS).toHaveLength(26);
  });

  it('contains all letters A-Z', () => {
    const letters = ALPHABET_LETTERS.map(l => l.char);
    expect(letters).toContain('A');
    expect(letters).toContain('Z');
    expect(letters).toHaveLength(26);
  });

  it('each letter has required fields', () => {
    for (const letter of ALPHABET_LETTERS) {
      expect(typeof letter.id).toBe('string');
      expect(typeof letter.char).toBe('string');
      expect(typeof letter.name).toBe('string');
      expect(typeof letter.emoji).toBe('string');
      expect(typeof letter.color).toBe('string');
      expect(letter.pathPoints).toBeDefined();
      expect(Array.isArray(letter.pathPoints)).toBe(true);
    }
  });

  it('each letter has emoji', () => {
    for (const letter of ALPHABET_LETTERS) {
      expect(letter.emoji.length).toBeGreaterThan(0);
    }
  });

  it('each letter has valid color hex code', () => {
    for (const letter of ALPHABET_LETTERS) {
      expect(letter.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('id matches char for all letters', () => {
    for (const letter of ALPHABET_LETTERS) {
      expect(letter.id).toBe(letter.char);
    }
  });
});

describe('generateLetterPath', () => {
  it('generates path for all letters A-Z', () => {
    for (const letter of ALPHABET_LETTERS) {
      const path = generateLetterPath(letter.char);
      expect(path.length).toBeGreaterThan(0);
      expect(path.every(p => typeof p.x === 'number' && typeof p.y === 'number')).toBe(true);
    }
  });

  it('generates points within 0-1 range', () => {
    for (const letter of ALPHABET_LETTERS) {
      const path = generateLetterPath(letter.char);
      for (const point of path) {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThanOrEqual(1);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeLessThanOrEqual(1);
      }
    }
  });

  it('generates consistent paths for same letter', () => {
    const path1 = generateLetterPath('A');
    const path2 = generateLetterPath('A');
    expect(path1).toEqual(path2);
  });

  it('generates different paths for different letters', () => {
    const pathA = generateLetterPath('A');
    const pathB = generateLetterPath('B');
    expect(pathA).not.toEqual(pathB);
  });

  it('handles lowercase letters', () => {
    const pathLower = generateLetterPath('a');
    const pathUpper = generateLetterPath('A');
    expect(pathLower).toEqual(pathUpper);
  });
});

describe('distanceToLineSegment', () => {
  it('returns 0 when point is on line', () => {
    const dist = distanceToLineSegment(0.5, 0.5, 0, 0.5, 1, 0.5);
    expect(dist).toBe(0);
  });

  it('calculates perpendicular distance correctly', () => {
    const dist = distanceToLineSegment(0.5, 0.7, 0.5, 0.5, 0.5, 0.9);
    expect(dist).toBeCloseTo(0, 5);
  });

  it('returns distance to start point when beyond segment', () => {
    const dist = distanceToLineSegment(0, 0, 0.5, 0.5, 1, 0.5);
    expect(dist).toBeCloseTo(Math.sqrt(0.5 * 0.5 + 0.5 * 0.5), 5);
  });

  it('returns distance to end point when beyond segment', () => {
    const dist = distanceToLineSegment(1.5, 0.5, 0, 0.5, 1, 0.5);
    expect(dist).toBe(0.5);
  });

  it('calculates diagonal distance correctly', () => {
    const dist = distanceToLineSegment(0.5, 0.5, 0, 0, 1, 1);
    expect(dist).toBeCloseTo(0, 5);
  });
});

describe('distanceToLetterPath', () => {
  it('returns 0 when point is on path', () => {
    const path = [{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }];
    const dist = distanceToLetterPath({ x: 0.5, y: 0.5 }, path);
    expect(dist).toBe(0);
  });

  it('returns Infinity for path with single point', () => {
    const path = [{ x: 0.5, y: 0.5 }];
    const dist = distanceToLetterPath({ x: 0.5, y: 0.5 }, path);
    expect(dist).toBe(Infinity);
  });

  it('returns Infinity for empty path', () => {
    const dist = distanceToLetterPath({ x: 0.5, y: 0.5 }, []);
    expect(dist).toBe(Infinity);
  });

  it('finds minimum distance across multiple segments', () => {
    const path = [
      { x: 0, y: 0 },
      { x: 0.5, y: 0.5 },
      { x: 1, y: 0 },
    ];
    const dist = distanceToLetterPath({ x: 0.5, y: 0.3 }, path);
    expect(dist).toBeGreaterThan(0);
    expect(dist).toBeLessThan(0.3);
  });
});

describe('calculatePathCoverage', () => {
  it('returns 100% for trace covering all segments', () => {
    const pathPoints = [{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }];
    // Trace multiple points along the path
    const tracePoints = [
      { x: 0.1, y: 0.5 },
      { x: 0.3, y: 0.5 },
      { x: 0.5, y: 0.5 },
      { x: 0.7, y: 0.5 },
      { x: 0.9, y: 0.5 },
    ];
    const coverage = calculatePathCoverage(tracePoints, pathPoints, 0.2);
    expect(coverage).toBe(1);
  });

  it('returns 0% for empty trace', () => {
    const pathPoints = [{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }];
    const coverage = calculatePathCoverage([], pathPoints);
    expect(coverage).toBe(0);
  });

  it('returns 0% for empty path', () => {
    const tracePoints = [{ x: 0.5, y: 0.5 }];
    const coverage = calculatePathCoverage(tracePoints, []);
    expect(coverage).toBe(0);
  });

  it('returns partial coverage for partial trace', () => {
    const pathPoints = [
      { x: 0, y: 0.25 },
      { x: 0.5, y: 0.25 },
      { x: 0.5, y: 0.75 },
      { x: 1, y: 0.75 },
    ];
    // Trace the first segment more precisely
    const tracePoints = [
      { x: 0.1, y: 0.25 },
      { x: 0.25, y: 0.25 },
      { x: 0.4, y: 0.25 },
    ];
    const coverage = calculatePathCoverage(tracePoints, pathPoints, 0.15);
    expect(coverage).toBeGreaterThan(0);
    expect(coverage).toBeLessThan(1);
  });
});

describe('calculateTracingAccuracy', () => {
  it('returns 0 for empty trace', () => {
    const pathPoints = [{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }];
    const accuracy = calculateTracingAccuracy([], pathPoints);
    expect(accuracy).toBe(0);
  });

  it('returns 0 for empty path', () => {
    const tracePoints = [{ x: 0.5, y: 0.5 }];
    const accuracy = calculateTracingAccuracy(tracePoints, []);
    expect(accuracy).toBe(0);
  });

  it('returns high accuracy for trace on path', () => {
    const pathPoints = [{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }];
    const tracePoints = [
      { x: 0.1, y: 0.5 },
      { x: 0.5, y: 0.5 },
      { x: 0.9, y: 0.5 },
    ];
    const accuracy = calculateTracingAccuracy(tracePoints, pathPoints);
    expect(accuracy).toBeGreaterThan(0.8);
  });

  it('returns low accuracy for trace far from path', () => {
    const pathPoints = [{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }];
    const tracePoints = [{ x: 0.5, y: 0.1 }]; // Far from horizontal line
    const accuracy = calculateTracingAccuracy(tracePoints, pathPoints);
    expect(accuracy).toBeLessThan(0.5);
  });
});

describe('evaluateTracing', () => {
  const mockLetter: LetterPath = {
    id: 'A',
    char: 'A',
    name: 'Apple',
    emoji: '🍎',
    color: '#EF4444',
    pathPoints: [{ x: 0.3, y: 0.8 }, { x: 0.5, y: 0.2 }, { x: 0.7, y: 0.8 }],
  };

  it('returns passed: false for poor tracing', () => {
    const tracePoints = [{ x: 0.1, y: 0.1 }]; // Far from letter
    const result = evaluateTracing(tracePoints, mockLetter);
    expect(result.passed).toBe(false);
    expect(result.stars).toBe(0);
  });

  it('returns stars based on accuracy', () => {
    const tracePoints = [
      { x: 0.3, y: 0.8 },
      { x: 0.4, y: 0.5 },
      { x: 0.5, y: 0.2 },
      { x: 0.6, y: 0.5 },
      { x: 0.7, y: 0.8 },
    ];
    const result = evaluateTracing(tracePoints, mockLetter);
    expect(result.accuracy).toBeGreaterThanOrEqual(0);
    expect(result.accuracy).toBeLessThanOrEqual(1);
    expect([0, 1, 2, 3]).toContain(result.stars);
  });

  it('uses difficulty thresholds', () => {
    const tracePoints = [{ x: 0.1, y: 0.1 }];
    const easyResult = evaluateTracing(tracePoints, mockLetter, 'easy');
    const hardResult = evaluateTracing(tracePoints, mockLetter, 'hard');
    expect(easyResult.passed).toBe(hardResult.passed); // Both should fail with this trace
  });

  it('returns valid result structure', () => {
    const tracePoints = [{ x: 0.5, y: 0.5 }];
    const result = evaluateTracing(tracePoints, mockLetter);
    expect(typeof result.accuracy).toBe('number');
    expect(typeof result.passed).toBe('boolean');
    expect(typeof result.coverage).toBe('number');
    expect(typeof result.deviation).toBe('number');
    expect([0, 1, 2, 3]).toContain(result.stars);
  });
});

describe('calculateTracingScore', () => {
  it('calculates base score from accuracy', () => {
    const score = calculateTracingScore(0.5, 5000, 0);
    expect(score).toBe(50 + 50 + 0); // 50% accuracy + time bonus + 0 streak
  });

  it('includes time bonus for fast completion', () => {
    const slowScore = calculateTracingScore(1, 10000, 0);
    const fastScore = calculateTracingScore(1, 2000, 0);
    expect(fastScore).toBeGreaterThan(slowScore);
  });

  it('includes streak bonus', () => {
    const noStreak = calculateTracingScore(1, 5000, 0);
    const withStreak = calculateTracingScore(1, 5000, 3);
    expect(withStreak).toBeGreaterThan(noStreak);
  });

  it('caps streak bonus at 25', () => {
    const score0 = calculateTracingScore(1, 5000, 0);
    const score5 = calculateTracingScore(1, 5000, 5);
    const score10 = calculateTracingScore(1, 5000, 10);
    // Streak bonus: 5*5=25, 10*5=50(capped at 25)
    expect(score5 - score0).toBe(25);
    expect(score10 - score0).toBe(25);
  });
});

describe('getNextLetter', () => {
  it('returns next letter in sequence', () => {
    const result = getNextLetter(0);
    expect(result).not.toBeNull();
    expect(result?.letter.char).toBe('B');
    expect(result?.index).toBe(1);
  });

  it('returns null at end of alphabet', () => {
    const result = getNextLetter(25); // Last index (Z)
    expect(result).toBeNull();
  });

  it('returns correct letter for middle index', () => {
    const result = getNextLetter(12); // M -> N
    expect(result?.letter.char).toBe('N');
    expect(result?.index).toBe(13);
  });
});

describe('getLettersForLevel', () => {
  it('returns letters for level 1', () => {
    const letters = getLettersForLevel(1);
    expect(letters.length).toBeGreaterThan(0);
    expect(letters[0].char).toBe('A');
  });

  it('returns different letters for different levels', () => {
    const level1 = getLettersForLevel(1);
    const level2 = getLettersForLevel(2);
    const level3 = getLettersForLevel(3);
    
    expect(level1[0].char).not.toBe(level2[0].char);
    expect(level2[0].char).not.toBe(level3[0].char);
  });

  it('returns all remaining letters for last level', () => {
    const level1 = getLettersForLevel(1);
    const level2 = getLettersForLevel(2);
    const level3 = getLettersForLevel(3);
    
    const total = level1.length + level2.length + level3.length;
    expect(total).toBe(26);
  });
});

describe('smoothTracePoints', () => {
  it('returns original points if fewer than window size', () => {
    const points = [{ x: 0.1, y: 0.1 }, { x: 0.2, y: 0.2 }];
    const smoothed = smoothTracePoints(points, 5);
    expect(smoothed).toEqual(points);
  });

  it('smooths points with moving average', () => {
    const points = [
      { x: 0.1, y: 0.1 },
      { x: 0.2, y: 0.15 },
      { x: 0.3, y: 0.1 },
      { x: 0.4, y: 0.15 },
      { x: 0.5, y: 0.1 },
    ];
    const smoothed = smoothTracePoints(points, 3);
    expect(smoothed).toHaveLength(points.length);
    // Middle points should be averaged
    expect(smoothed[2].x).toBeCloseTo(0.3, 1);
  });

  it('preserves endpoints approximately', () => {
    const points = [
      { x: 0.1, y: 0.1 },
      { x: 0.2, y: 0.2 },
      { x: 0.3, y: 0.3 },
    ];
    const smoothed = smoothTracePoints(points, 3);
    // First and last should be reasonably close to original after smoothing
    expect(smoothed[0].x).toBeGreaterThan(0.08);
    expect(smoothed[0].x).toBeLessThan(0.2);
    expect(smoothed[smoothed.length - 1].x).toBeGreaterThan(0.2);
    expect(smoothed[smoothed.length - 1].x).toBeLessThan(0.32);
  });
});

describe('getDefaultProgress', () => {
  it('returns empty completed letters', () => {
    const progress = getDefaultProgress();
    expect(progress.completedLetters).toEqual([]);
  });

  it('starts at letter index 0', () => {
    const progress = getDefaultProgress();
    expect(progress.currentLetterIndex).toBe(0);
  });

  it('starts with zero score', () => {
    const progress = getDefaultProgress();
    expect(progress.totalScore).toBe(0);
  });

  it('starts with zero streak', () => {
    const progress = getDefaultProgress();
    expect(progress.streak).toBe(0);
  });
});

describe('updateProgress', () => {
  it('adds completed letter to progress', () => {
    const progress = getDefaultProgress();
    const updated = updateProgress(progress, 'A', 100, true);
    expect(updated.completedLetters).toContain('A');
  });

  it('increments streak on success', () => {
    const progress = getDefaultProgress();
    const updated = updateProgress(progress, 'A', 100, true);
    expect(updated.streak).toBe(1);
  });

  it('resets streak on failure', () => {
    const progress = { ...getDefaultProgress(), streak: 3 };
    const updated = updateProgress(progress, 'A', 0, false);
    expect(updated.streak).toBe(0);
  });

  it('does not duplicate completed letters', () => {
    const progress = { ...getDefaultProgress(), completedLetters: ['A'] };
    const updated = updateProgress(progress, 'A', 100, true);
    expect(updated.completedLetters.filter(id => id === 'A')).toHaveLength(1);
  });

  it('adds score to total', () => {
    const progress = getDefaultProgress();
    const updated = updateProgress(progress, 'A', 150, true);
    expect(updated.totalScore).toBe(150);
  });

  it('advances to next letter index', () => {
    const progress = getDefaultProgress();
    const updated = updateProgress(progress, 'A', 100, true);
    expect(updated.currentLetterIndex).toBe(1);
  });
});

describe('getStarsFromAccuracy', () => {
  it('returns 3 stars for 90%+ accuracy', () => {
    expect(getStarsFromAccuracy(0.9)).toBe(3);
    expect(getStarsFromAccuracy(0.95)).toBe(3);
    expect(getStarsFromAccuracy(1.0)).toBe(3);
  });

  it('returns 2 stars for 70-89% accuracy', () => {
    expect(getStarsFromAccuracy(0.7)).toBe(2);
    expect(getStarsFromAccuracy(0.8)).toBe(2);
    expect(getStarsFromAccuracy(0.89)).toBe(2);
  });

  it('returns 1 star for 50-69% accuracy', () => {
    expect(getStarsFromAccuracy(0.5)).toBe(1);
    expect(getStarsFromAccuracy(0.6)).toBe(1);
    expect(getStarsFromAccuracy(0.69)).toBe(1);
  });

  it('returns 0 stars for <50% accuracy', () => {
    expect(getStarsFromAccuracy(0)).toBe(0);
    expect(getStarsFromAccuracy(0.3)).toBe(0);
    expect(getStarsFromAccuracy(0.49)).toBe(0);
  });
});

describe('integration', () => {
  it('can simulate a complete game flow', () => {
    let progress = getDefaultProgress();
    
    // Complete first 3 letters
    for (let i = 0; i < 3; i++) {
      const letter = ALPHABET_LETTERS[i];
      const tracePoints = letter.pathPoints.map(p => ({
        x: p.x + 0.01,
        y: p.y + 0.01,
      }));
      
      const evaluation = evaluateTracing(tracePoints, letter);
      const score = calculateTracingScore(
        evaluation.accuracy,
        3000,
        progress.streak
      );
      
      progress = updateProgress(
        progress,
        letter.id,
        score,
        evaluation.passed
      );
    }
    
    expect(progress.completedLetters).toHaveLength(3);
    expect(progress.currentLetterIndex).toBe(3);
    expect(progress.totalScore).toBeGreaterThan(0);
    expect(progress.streak).toBe(3);
  });
});
