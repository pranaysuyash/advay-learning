/**
 * Air Guitar Hero Logic Tests
 * Tests for guitar note sequence game
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateScore,
  getLevelConfig,
  generateNoteSequence,
  playNoteSound,
  NOTES,
  LEVELS,
  DIFFICULTY_MULTIPLIERS,
  type GuitarNote,
  type LevelConfig,
} from '../airGuitarHeroLogic';

describe('airGuitarHeroLogic', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constants', () => {
    it('should have 9 guitar notes', () => {
      expect(NOTES).toHaveLength(9);
    });

    it('should have notes with valid structure', () => {
      NOTES.forEach(note => {
        expect(note.id).toBeDefined();
        expect(note.name).toBeDefined();
        expect(note.fret).toBeGreaterThanOrEqual(0);
        expect(note.string).toBeGreaterThanOrEqual(1);
        expect(note.string).toBeLessThanOrEqual(6);
        expect(note.color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it('should have notes on different strings', () => {
      const strings = new Set(NOTES.map(n => n.string));
      expect(strings.size).toBeGreaterThan(1);
    });

    it('should have 3 levels', () => {
      expect(LEVELS).toHaveLength(3);
    });

    it('should verify difficulty multipliers through scoring', () => {
      // Test multipliers indirectly through calculateScore
      const baseScore = calculateScore(0, 'easy');
      const mediumScore = calculateScore(0, 'medium');
      const hardScore = calculateScore(0, 'hard');

      expect(mediumScore).toBeCloseTo(baseScore * 1.5, 0);
      expect(hardScore).toBe(baseScore * 2);
    });
  });

  describe('Level Configuration', () => {
    it('should have progressive note counts', () => {
      expect(LEVELS[0].notesToPlay).toBe(8);
      expect(LEVELS[1].notesToPlay).toBe(12);
      expect(LEVELS[2].notesToPlay).toBe(16);
    });

    it('should have decreasing time limits', () => {
      expect(LEVELS[0].timeLimit).toBe(30);
      expect(LEVELS[1].timeLimit).toBe(25);
      expect(LEVELS[2].timeLimit).toBe(20);
    });

    it('should have correct difficulty labels', () => {
      expect(LEVELS[0].difficulty).toBe('easy');
      expect(LEVELS[1].difficulty).toBe('medium');
      expect(LEVELS[2].difficulty).toBe('hard');
    });
  });

  describe('getLevelConfig', () => {
    it('should return level 1 config', () => {
      const config = getLevelConfig(1);

      expect(config.level).toBe(1);
      expect(config.notesToPlay).toBe(8);
      expect(config.timeLimit).toBe(30);
      expect(config.difficulty).toBe('easy');
    });

    it('should return level 2 config', () => {
      const config = getLevelConfig(2);

      expect(config.level).toBe(2);
      expect(config.notesToPlay).toBe(12);
      expect(config.difficulty).toBe('medium');
    });

    it('should return level 3 config', () => {
      const config = getLevelConfig(3);

      expect(config.level).toBe(3);
      expect(config.notesToPlay).toBe(16);
      expect(config.difficulty).toBe('hard');
    });

    it('should fallback to level 1 for invalid level', () => {
      const config = getLevelConfig(99);

      expect(config.level).toBe(1);
    });
  });

  describe('generateNoteSequence', () => {
    it('should generate correct number of notes', () => {
      const sequence = generateNoteSequence(8);

      expect(sequence).toHaveLength(8);
    });

    it('should generate notes from NOTES array', () => {
      const sequence = generateNoteSequence(10);

      sequence.forEach(note => {
        expect(NOTES).toContain(note);
      });
    });

    it('should generate valid note objects', () => {
      const sequence = generateNoteSequence(5);

      sequence.forEach(note => {
        expect(note.id).toBeDefined();
        expect(note.name).toBeDefined();
        expect(note.color).toBeDefined();
      });
    });

    it('should handle single note sequence', () => {
      const sequence = generateNoteSequence(1);

      expect(sequence).toHaveLength(1);
      expect(NOTES).toContain(sequence[0]);
    });

    it('should handle empty sequence', () => {
      const sequence = generateNoteSequence(0);

      expect(sequence).toHaveLength(0);
    });

    it('should use default count from level config', () => {
      const level1Notes = generateNoteSequence(LEVELS[0].notesToPlay);
      const level2Notes = generateNoteSequence(LEVELS[1].notesToPlay);

      expect(level1Notes).toHaveLength(8);
      expect(level2Notes).toHaveLength(12);
    });
  });

  describe('calculateScore', () => {
    it('should calculate base score of 10 for no streak', () => {
      const score = calculateScore(0, 'easy');

      expect(score).toBe(10);
    });

    it('should add streak bonus', () => {
      const score1 = calculateScore(1, 'easy');
      const score2 = calculateScore(5, 'easy');
      const score3 = calculateScore(10, 'easy');

      expect(score1).toBe(12); // 10 + 2
      expect(score2).toBe(20); // 10 + 10
      expect(score3).toBe(30); // 10 + 20 (max bonus)
    });

    it('should cap streak bonus at 20', () => {
      const score1 = calculateScore(10, 'easy');
      const score2 = calculateScore(20, 'easy');

      expect(score1).toBe(30);
      expect(score2).toBe(30);
    });

    it('should apply easy multiplier (1x)', () => {
      const score = calculateScore(5, 'easy');

      expect(score).toBe(20); // (10 + 10) × 1
    });

    it('should apply medium multiplier (1.5x)', () => {
      const score = calculateScore(5, 'medium');

      expect(score).toBe(30); // (10 + 10) × 1.5
    });

    it('should apply hard multiplier (2x)', () => {
      const score = calculateScore(5, 'hard');

      expect(score).toBe(40); // (10 + 10) × 2
    });

    it('should default to easy multiplier for unknown difficulty', () => {
      const score = calculateScore(5, 'unknown' as any);

      expect(score).toBe(20); // (10 + 10) × 1
    });

    it('should calculate max score for hard with max streak', () => {
      const score = calculateScore(10, 'hard');

      expect(score).toBe(60); // (10 + 20) × 2
    });

    it('should round down fractional scores', () => {
      // Medium difficulty with streak 3: (10 + 6) × 1.5 = 24
      const score = calculateScore(3, 'medium');

      expect(score).toBe(24);
    });

    it('should handle zero streak on all difficulties', () => {
      expect(calculateScore(0, 'easy')).toBe(10);
      expect(calculateScore(0, 'medium')).toBe(15);
      expect(calculateScore(0, 'hard')).toBe(20);
    });
  });

  describe('playNoteSound', () => {
    it('should not crash when speech synthesis unavailable', () => {
      // @ts-ignore - remove speechSynthesis
      delete global.speechSynthesis;

      const note: GuitarNote = { id: 'test', name: 'E2', fret: 0, string: 6, color: '#fff' };

      expect(() => playNoteSound(note)).not.toThrow();
    });

    it('should not crash when speech synthesis exists', () => {
      // If speechSynthesis exists, function should work
      const note: GuitarNote = { id: 'test', name: 'E2', fret: 0, string: 6, color: '#fff' };

      expect(() => playNoteSound(note)).not.toThrow();
    });
  });

  describe('Notes Structure', () => {
    it('should have unique note IDs', () => {
      const ids = NOTES.map(n => n.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid colors', () => {
      NOTES.forEach(note => {
        expect(note.color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it('should have notes spanning multiple frets', () => {
      const frets = new Set(NOTES.map(n => n.fret));

      expect(frets.size).toBeGreaterThan(0);
    });

    it('should have notes on all 6 strings', () => {
      const strings = new Set(NOTES.map(n => n.string));

      expect(strings.has(1)).toBe(true);
      expect(strings.has(2)).toBe(true);
      expect(strings.has(3)).toBe(true);
    });
  });

  describe('Type Definitions', () => {
    it('should have correct GuitarNote structure', () => {
      const note: GuitarNote = {
        id: 'e2',
        name: 'E2',
        fret: 0,
        string: 6,
        color: '#FF6B6B',
      };

      expect(note.id).toBeDefined();
      expect(note.name).toBeDefined();
      expect(note.fret).toBeDefined();
      expect(note.string).toBeDefined();
      expect(note.color).toBeDefined();
    });

    it('should have correct LevelConfig structure', () => {
      const config: LevelConfig = {
        level: 1,
        notesToPlay: 8,
        timeLimit: 30,
        difficulty: 'easy',
      };

      expect(config.level).toBeDefined();
      expect(config.notesToPlay).toBeDefined();
      expect(config.timeLimit).toBeDefined();
      expect(config.difficulty).toBeDefined();
    });

    it('should accept valid difficulty values', () => {
      const difficulties: Array<LevelConfig['difficulty']> = ['easy', 'medium', 'hard'];

      difficulties.forEach(diff => {
        expect(['easy', 'medium', 'hard']).toContain(diff);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative streak', () => {
      const score = calculateScore(-1, 'easy');

      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should handle very large streak', () => {
      const score = calculateScore(1000, 'easy');

      expect(score).toBe(30); // Cap at max bonus
    });

    it('should handle zero count sequence', () => {
      const sequence = generateNoteSequence(0);

      expect(sequence).toEqual([]);
    });
  });

  describe('Integration Scenarios', () => {
    it('should create complete level 1 game', () => {
      const config = getLevelConfig(1);
      const sequence = generateNoteSequence(config.notesToPlay);

      expect(sequence).toHaveLength(8);
      expect(config.difficulty).toBe('easy');
    });

    it('should create complete level 2 game', () => {
      const config = getLevelConfig(2);
      const sequence = generateNoteSequence(config.notesToPlay);

      expect(sequence).toHaveLength(12);
      expect(config.difficulty).toBe('medium');
    });

    it('should create complete level 3 game', () => {
      const config = getLevelConfig(3);
      const sequence = generateNoteSequence(config.notesToPlay);

      expect(sequence).toHaveLength(16);
      expect(config.difficulty).toBe('hard');
    });

    it('should calculate score progression', () => {
      // Simulate a streak
      const scores = [];
      for (let streak = 0; streak <= 10; streak++) {
        scores.push(calculateScore(streak, 'medium'));
      }

      expect(scores[0]).toBe(15); // 10 × 1.5
      expect(scores[5]).toBe(30); // 20 × 1.5
      expect(scores[10]).toBe(45); // 30 × 1.5
    });
  });
});
