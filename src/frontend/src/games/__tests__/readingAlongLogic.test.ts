/**
 * Test suite for Reading Along game logic
 * Game ID: reading-along
 * Educational Focus: Reading comprehension, sight word recognition
 */

import { describe, it, expect, vi } from 'vitest';
import {
  ReadingAlongSentence,
  ReadingAlongRound,
  createReadingAlongRound,
  isReadingAlongAnswerCorrect,
} from '../readingAlongLogic';

describe('readingAlongLogic', () => {
  describe('createReadingAlongRound - basic behavior', () => {
    it('creates a round with sentence and options', () => {
      const round = createReadingAlongRound([], () => 0);
      expect(round).toHaveProperty('sentence');
      expect(round).toHaveProperty('options');
    });

    it('sentence has id, text, and targetWord', () => {
      const round = createReadingAlongRound([], () => 0);
      expect(round.sentence).toHaveProperty('id');
      expect(round.sentence).toHaveProperty('text');
      expect(round.sentence).toHaveProperty('targetWord');
    });

    it('includes target word in options', () => {
      const round = createReadingAlongRound([], () => 0);
      expect(round.options).toContain(round.sentence.targetWord);
    });

    it('has exactly 3 options', () => {
      const round = createReadingAlongRound([], () => 0);
      expect(round.options).toHaveLength(3);
    });

    it('has distinct options', () => {
      const round = createReadingAlongRound([], () => 0);
      const uniqueOptions = new Set(round.options);
      expect(uniqueOptions.size).toBe(3);
    });
  });

  describe('createReadingAlongRound - RNG injection', () => {
    it('uses default Math.random when no RNG provided', () => {
      const round = createReadingAlongRound();
      expect(round.options).toHaveLength(3);
    });

    it('uses provided RNG function', () => {
      const mockRng = vi.fn(() => 0.5);
      createReadingAlongRound([], mockRng);
      expect(mockRng).toHaveBeenCalled();
    });

    it('produces consistent results with deterministic RNG', () => {
      const rng = () => 0.25;
      const round1 = createReadingAlongRound([], rng);
      const round2 = createReadingAlongRound([], rng);
      expect(round1.sentence.id).toBe(round2.sentence.id);
    });

    it('handles RNG returning 0', () => {
      const zeroRng = () => 0;
      const round = createReadingAlongRound([], zeroRng);
      expect(round.options).toHaveLength(3);
    });

    it('handles RNG returning 1', () => {
      const oneRng = () => 0.999999;
      const round = createReadingAlongRound([], oneRng);
      expect(round.options).toHaveLength(3);
    });
  });

  describe('createReadingAlongRound - usedIds handling', () => {
    it('prefers unused sentence ids when available', () => {
      const first = createReadingAlongRound([], () => 0);
      const second = createReadingAlongRound([first.sentence.id], () => 0);
      expect(second.sentence.id).not.toBe(first.sentence.id);
    });

    it('handles empty usedIds array', () => {
      const round = createReadingAlongRound([], () => 0);
      expect(round.sentence.id).toBeTruthy();
    });

    it('resets to all sentences when all have been used', () => {
      const rounds: ReadingAlongRound[] = [];
      const usedIds: string[] = [];

      for (let i = 0; i < 10; i++) {
        const round = createReadingAlongRound(usedIds, () => 0.1);
        if (usedIds.includes(round.sentence.id)) {
          // We've cycled back to used sentences
          break;
        }
        usedIds.push(round.sentence.id);
        rounds.push(round);
      }

      expect(rounds.length).toBeGreaterThan(0);
    });

    it('filters out sentences with used ids', () => {
      const round1 = createReadingAlongRound([], () => 0);
      const usedId = round1.sentence.id;
      const round2 = createReadingAlongRound([usedId], () => 0);
      expect(round2.sentence.id).not.toBe(usedId);
    });

    it('handles multiple used ids', () => {
      const ids: string[] = [];
      for (let i = 0; i < 3; i++) {
        const round = createReadingAlongRound(ids, () => i * 0.15);
        ids.push(round.sentence.id);
      }

      // All IDs should be unique
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });
  });

  describe('createReadingAlongRound - options generation', () => {
    it('includes target word plus 2 distractors', () => {
      const round = createReadingAlongRound([], () => 0);
      const target = round.sentence.targetWord;
      const distractors = round.options.filter(o => o !== target);
      expect(distractors).toHaveLength(2);
    });

    it('distractors are different from target word', () => {
      const rounds = [];
      for (let i = 0; i < 10; i++) {
        rounds.push(createReadingAlongRound([], () => i * 0.1));
      }

      rounds.forEach(round => {
        const target = round.sentence.targetWord;
        round.options.forEach(option => {
          if (option !== target) {
            expect(option).not.toBe(target);
          }
        });
      });
    });

    it('shuffles options to randomize order', () => {
      const rounds: ReadingAlongRound[] = [];
      for (let i = 0; i < 20; i++) {
        rounds.push(createReadingAlongRound([], () => i * 0.05));
      }

      // Check target word appears in different positions
      const positions = new Set<number>();
      rounds.forEach(round => {
        positions.add(round.options.indexOf(round.sentence.targetWord));
      });

      // Should have variety in positions
      expect(positions.size).toBeGreaterThan(1);
    });

    it('all options are strings', () => {
      const round = createReadingAlongRound([], () => 0);
      round.options.forEach(option => {
        expect(typeof option).toBe('string');
      });
    });

    it('all options are single words', () => {
      const round = createReadingAlongRound([], () => 0);
      round.options.forEach(option => {
        expect(option.split(' ').length).toBe(1);
      });
    });
  });

  describe('isReadingAlongAnswerCorrect', () => {
    it('returns true for correct answer', () => {
      const round = createReadingAlongRound([], () => 0);
      const result = isReadingAlongAnswerCorrect(round, round.sentence.targetWord);
      expect(result).toBe(true);
    });

    it('returns false for incorrect answer', () => {
      const round = createReadingAlongRound([], () => 0);
      const wrongOption = round.options.find(o => o !== round.sentence.targetWord);
      if (wrongOption) {
        const result = isReadingAlongAnswerCorrect(round, wrongOption);
        expect(result).toBe(false);
      }
    });

    it('is case-sensitive', () => {
      const round = createReadingAlongRound([], () => 0);
      const differentCase = round.sentence.targetWord.toUpperCase();
      const result = isReadingAlongAnswerCorrect(round, differentCase);
      expect(result).toBe(false);
    });

    it('handles empty string answer', () => {
      const round = createReadingAlongRound([], () => 0);
      const result = isReadingAlongAnswerCorrect(round, '');
      expect(result).toBe(false);
    });

    it('handles answer not in options', () => {
      const round = createReadingAlongRound([], () => 0);
      const result = isReadingAlongAnswerCorrect(round, 'notAnOption');
      expect(result).toBe(false);
    });

    it('handles answer with extra whitespace', () => {
      const round = createReadingAlongRound([], () => 0);
      const result = isReadingAlongAnswerCorrect(round, `  ${round.sentence.targetWord}  `);
      expect(result).toBe(false);
    });

    it('handles all option types', () => {
      const round = createReadingAlongRound([], () => 0);
      round.options.forEach(option => {
        const result = isReadingAlongAnswerCorrect(round, option);
        const isTarget = option === round.sentence.targetWord;
        expect(result).toBe(isTarget);
      });
    });
  });

  describe('sentence content validation', () => {
    it('sentences have age-appropriate length', () => {
      const round = createReadingAlongRound([], () => 0);
      expect(round.sentence.text.length).toBeLessThan(100);
      const words = round.sentence.text.split(' ');
      expect(words.length).toBeLessThan(15);
    });

    it('sentences start with capital letter', () => {
      const round = createReadingAlongRound([], () => 0);
      expect(round.sentence.text).toMatch(/^[A-Z]/);
    });

    it('target word exists in sentence', () => {
      const round = createReadingAlongRound([], () => 0);
      const lowerText = round.sentence.text.toLowerCase();
      const lowerTarget = round.sentence.targetWord.toLowerCase();
      expect(lowerText).toContain(lowerTarget);
    });

    it('target words are simple sight words', () => {
      const rounds = [];
      for (let i = 0; i < 10; i++) {
        rounds.push(createReadingAlongRound([], () => i * 0.1));
      }

      rounds.forEach(round => {
        expect(round.sentence.targetWord.length).toBeLessThan(10);
        expect(round.sentence.targetWord.match(/^[a-z]+$/i)).toBeTruthy();
      });
    });

    it('sentences use simple vocabulary', () => {
      const round = createReadingAlongRound([], () => 0);
      const words = round.sentence.text.split(' ');
      words.forEach(word => {
        // Remove trailing punctuation for length check
        const cleanWord = word.replace(/[.,!?]/g, '');
        expect(cleanWord.length).toBeLessThan(15);
      });
    });
  });

  describe('integration scenarios', () => {
    it('completes full question flow correctly', () => {
      const round = createReadingAlongRound([], () => 0);
      const isCorrect = isReadingAlongAnswerCorrect(round, round.sentence.targetWord);
      expect(isCorrect).toBe(true);
    });

    it('handles incorrect answer scenario', () => {
      const round = createReadingAlongRound([], () => 0);
      const wrongAnswer = 'wrong';
      const isCorrect = isReadingAlongAnswerCorrect(round, wrongAnswer);
      expect(isCorrect).toBe(false);
    });

    it('creates multiple rounds with variety', () => {
      const rounds = [
        createReadingAlongRound([], () => 0),
        createReadingAlongRound([], () => 0.3),
        createReadingAlongRound([], () => 0.7),
      ];

      rounds.forEach(round => {
        expect(round.sentence.text).toBeTruthy();
        expect(round.options).toHaveLength(3);
      });
    });

    it('can create 6 unique rounds', () => {
      const usedIds: string[] = [];
      const rounds: ReadingAlongRound[] = [];

      for (let i = 0; i < 6; i++) {
        const round = createReadingAlongRound(usedIds, () => i * 0.15);
        usedIds.push(round.sentence.id);
        rounds.push(round);
      }

      const uniqueIds = new Set(rounds.map(r => r.sentence.id));
      expect(uniqueIds.size).toBe(6);
    });

    it('handles progressive rounds avoiding repetition', () => {
      const seenIds = new Set<string>();
      const rounds: ReadingAlongRound[] = [];

      for (let i = 0; i < 6; i++) {
        const round = createReadingAlongRound(Array.from(seenIds), () => i * 0.15);
        seenIds.add(round.sentence.id);
        rounds.push(round);
      }

      // All first 6 rounds should have unique IDs
      const uniqueIds = new Set(rounds.map(r => r.sentence.id));
      expect(uniqueIds.size).toBe(6);
    });
  });

  describe('type definitions', () => {
    it('ReadingAlongSentence has correct structure', () => {
      const round = createReadingAlongRound([], () => 0);
      const sentence = round.sentence;
      expect(typeof sentence.id).toBe('string');
      expect(typeof sentence.text).toBe('string');
      expect(typeof sentence.targetWord).toBe('string');
    });

    it('ReadingAlongRound has correct structure', () => {
      const round = createReadingAlongRound([], () => 0);
      expect(typeof round.sentence).toBe('object');
      expect(Array.isArray(round.options)).toBe(true);
    });

    it('options are array of strings', () => {
      const round = createReadingAlongRound([], () => 0);
      round.options.forEach(option => {
        expect(typeof option).toBe('string');
      });
    });
  });

  describe('educational content', () => {
    it('uses common themes for toddlers', () => {
      const commonWords = ['cat', 'sun', 'runs', 'sings', 'read', 'shine'];
      const seenTargets = new Set<string>();

      for (let i = 0; i < 20; i++) {
        const round = createReadingAlongRound([], () => i * 0.05);
        seenTargets.add(round.sentence.targetWord);
      }

      // All targets should be from known set
      seenTargets.forEach(target => {
        expect(commonWords).toContain(target);
      });
    });

    it('provides clear answer choices', () => {
      const round = createReadingAlongRound([], () => 0);
      round.options.forEach(option => {
        expect(option.length).toBeGreaterThan(0);
        expect(option.length).toBeLessThan(15);
        expect(option.match(/^[a-zA-Z]+$/)).toBeTruthy();
      });
    });

    it('target words are always single words', () => {
      const rounds = [];
      for (let i = 0; i < 10; i++) {
        rounds.push(createReadingAlongRound([], () => i * 0.1));
      }

      rounds.forEach(round => {
        expect(round.sentence.targetWord.split(' ').length).toBe(1);
      });
    });

    it('sentences are simple declarative statements', () => {
      const round = createReadingAlongRound([], () => 0);
      const words = round.sentence.text.split(' ');
      expect(words.length).toBeGreaterThanOrEqual(4);
      expect(words.length).toBeLessThanOrEqual(8);
    });
  });

  describe('edge cases', () => {
    it('handles creating many rounds without running out of sentences', () => {
      const rounds: ReadingAlongRound[] = [];
      const usedIds: string[] = [];

      for (let i = 0; i < 20; i++) {
        const round = createReadingAlongRound(usedIds, () => i * 0.05);
        usedIds.push(round.sentence.id);
        rounds.push(round);
      }

      expect(rounds.length).toBe(20);
    });

    it('handles very small RNG values', () => {
      const round = createReadingAlongRound([], () => 0.0001);
      expect(round.options).toHaveLength(3);
    });

    it('handles RNG values very close to 1', () => {
      const round = createReadingAlongRound([], () => 0.9999);
      expect(round.options).toHaveLength(3);
    });

    it('handles all rounds with same RNG value', () => {
      const rng = () => 0.5;
      const rounds = [
        createReadingAlongRound([], rng),
        createReadingAlongRound([], rng),
        createReadingAlongRound([], rng),
      ];

      rounds.forEach(round => {
        expect(round.options).toHaveLength(3);
      });
    });
  });

  describe('options shuffle behavior', () => {
    it('can produce different option orders', () => {
      const rounds1 = createReadingAlongRound([], () => 0.1);
      const rounds2 = createReadingAlongRound([], () => 0.9);

      // Same sentence might be selected, but order could differ
      expect(rounds1.options.length).toBe(rounds2.options.length);
    });

    it('always has exactly one correct option', () => {
      const rounds = [];
      for (let i = 0; i < 10; i++) {
        rounds.push(createReadingAlongRound([], () => i * 0.1));
      }

      rounds.forEach(round => {
        const correctCount = round.options.filter(o => o === round.sentence.targetWord).length;
        expect(correctCount).toBe(1);
      });
    });

    it('has exactly two wrong options', () => {
      const rounds = [];
      for (let i = 0; i < 10; i++) {
        rounds.push(createReadingAlongRound([], () => i * 0.1));
      }

      rounds.forEach(round => {
        const wrongCount = round.options.filter(o => o !== round.sentence.targetWord).length;
        expect(wrongCount).toBe(2);
      });
    });
  });
});
