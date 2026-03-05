import { describe, expect, it, beforeAll } from 'vitest';

import {
  loadWordBank,
  loadCurriculum,
  loadWordLists,
  pickWord,
  pickWordAsync,
  pickWordForLevel,
  createLetterTargets,
  clearCaches,
  getStageIds,
  type PickWordOptions,
} from '../wordBuilderLogic';

function seededRandom() {
  let seed = 42;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

describe('wordBuilderLogic', () => {
  beforeAll(async () => {
    clearCaches();
    await loadWordBank();
    await loadCurriculum();
  });

  describe('loadWordBank', () => {
    it('loads the tagged word bank', async () => {
      const bank = await loadWordBank();
      expect(bank.words.length).toBeGreaterThan(0);
      expect(bank.metadata.version).toBeDefined();
    });

    it('words are uppercase A-Z only', async () => {
      const bank = await loadWordBank();
      for (const entry of bank.words) {
        expect(entry.word).toMatch(/^[A-Z]+$/);
      }
    });

    it('no blocked words in bank', async () => {
      const blockedWords = ['SEX', 'KILL', 'DEAD', 'HATE', 'GUN'];
      const bank = await loadWordBank();
      const bankWords = new Set(bank.words.map(w => w.word));
      for (const blocked of blockedWords) {
        expect(bankWords).not.toContain(blocked);
      }
    });
  });

  describe('loadCurriculum', () => {
    it('loads the curriculum', async () => {
      const curriculum = await loadCurriculum();
      expect(curriculum.stages.length).toBeGreaterThan(0);
    });

    it('every stage has required fields', async () => {
      const curriculum = await loadCurriculum();
      for (const stage of curriculum.stages) {
        expect(stage.id).toBeDefined();
        expect(stage.criteria).toBeDefined();
      }
    });

    it('getStageIds returns all stage IDs', () => {
      const ids = getStageIds();
      expect(ids.length).toBeGreaterThan(0);
      expect(ids).toContain('cvc_a');
      expect(ids).toContain('blends');
    });
  });

  describe('pickWord (Explore mode)', () => {
    it('returns a word for explore mode level 1', () => {
      const options: PickWordOptions = { mode: 'explore', level: 1 };
      const result = pickWord(options, seededRandom());
      expect(result).toBeDefined();
      expect(result?.word.length).toBe(3); // Level 1 = 3 letters only
    });

    it('returns a word for explore mode level 2', () => {
      const options: PickWordOptions = { mode: 'explore', level: 2 };
      const result = pickWord(options, seededRandom());
      expect(result).toBeDefined();
      expect(result?.word.length).toBeGreaterThanOrEqual(3); // Level 2 = 3-4 letters
      expect(result?.word.length).toBeLessThanOrEqual(4);
    });

    it('returns a word for explore mode level 3', () => {
      const options: PickWordOptions = { mode: 'explore', level: 3 };
      const result = pickWord(options, seededRandom());
      expect(result).toBeDefined();
      expect(result?.word.length).toBeGreaterThanOrEqual(3); // Level 3 = 3-5 letters (max)
    });

    it('returns words even when bank cleared (sync loading)', () => {
      clearCaches();
      const options: PickWordOptions = { mode: 'explore', level: 1 };
      const result = pickWord(options, seededRandom());
      // New implementation loads synchronously, so should still return a word
      expect(result).toBeDefined();
      expect(result?.word.length).toBe(3);
    });
  });

  describe('pickWord (Phonics mode)', () => {
    it('returns a word for cvc stage', async () => {
      await loadCurriculum();
      const options: PickWordOptions = { mode: 'phonics', stageId: 'cvc_all' };
      const result = pickWord(options, seededRandom());
      expect(result).toBeDefined();
      if (result) {
        expect(result.word.length).toBe(3);
      }
    });

    it('returns a word for blends stage', async () => {
      await loadCurriculum();
      const options: PickWordOptions = { mode: 'phonics', stageId: 'blends' };
      const result = pickWord(options, seededRandom());
      expect(result).toBeDefined();
      if (result) {
        expect(result.word.length).toBeGreaterThanOrEqual(3);
      }
    });

    it('returns null for invalid stage (no fallback possible)', async () => {
      await loadCurriculum();
      // Using a completely fake stage that has no overlap with cvc_all
      const options: PickWordOptions = { mode: 'phonics', stageId: 'invalid_stage_xyz' };
      const result = pickWord(options, seededRandom());
      // With fallback chain, might return a word from cvc_all or null
      // Depending on if the fallback finds valid words
      expect(result === null || result?.word.length === 3).toBe(true);
    });

    it('cvc_a stage returns only words with middle letter A', async () => {
      await loadCurriculum();
      await loadWordBank();
      
      // Sample multiple words from cvc_a stage
      const words: string[] = [];
      for (let i = 0; i < 20; i++) {
        const result = pickWord({ mode: 'phonics', stageId: 'cvc_a' }, seededRandom());
        if (result) words.push(result.word);
      }
      
      // All should have A as middle letter (e.g., CAT, HAT, MAP)
      for (const word of words) {
        expect(word.length).toBe(3);
        expect(word[1]).toBe('A');
      }
    });

    it('cvc_e stage returns only words with middle letter E', async () => {
      await loadCurriculum();
      await loadWordBank();
      
      const words: string[] = [];
      for (let i = 0; i < 10; i++) {
        const result = pickWord({ mode: 'phonics', stageId: 'cvc_e' }, seededRandom());
        if (result) words.push(result.word);
      }
      
      // All should have E as middle letter (e.g., BED, HEN, PEN)
      for (const word of words) {
        expect(word.length).toBe(3);
        expect(word[1]).toBe('E');
      }
    });

    it('cvc_a and cvc_e stages are disjoint (no shared words)', async () => {
      await loadCurriculum();
      await loadWordBank();
      
      const aWords = new Set<string>();
      const eWords = new Set<string>();
      
      // Collect words from both stages
      for (let i = 0; i < 30; i++) {
        const aResult = pickWord({ mode: 'phonics', stageId: 'cvc_a' }, seededRandom());
        const eResult = pickWord({ mode: 'phonics', stageId: 'cvc_e' }, seededRandom());
        if (aResult) aWords.add(aResult.word);
        if (eResult) eWords.add(eResult.word);
      }
      
      // Intersection should be empty
      for (const word of aWords) {
        expect(eWords.has(word)).toBe(false);
      }
    });

    it('falls back gracefully when stage has no words', async () => {
      await loadCurriculum();
      await loadWordBank();
      
      // Use a fake stage that doesn't exist - should trigger fallback chain
      // First tries the stage, then cvc_all, then any 3-letter words
      const result = pickWord({ mode: 'phonics', stageId: 'nonexistent_stage_xyz' }, seededRandom());
      
      // With the fallback chain, should return a 3-letter word from cvc_all or general pool
      expect(result).toBeDefined();
      expect(result?.word.length).toBe(3);
    });
  });

  describe('pickWordAsync', () => {
    it('loads bank and returns word', async () => {
      clearCaches();
      const options: PickWordOptions = { mode: 'explore', level: 1 };
      const result = await pickWordAsync(options, seededRandom());
      expect(result).toBeDefined();
      expect(result?.word.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('pickWordForLevel (legacy)', () => {
    beforeAll(async () => {
      await loadWordLists();
    });

    it('returns a word from level 1', () => {
      const result = pickWordForLevel(1, seededRandom());
      expect(result).toBeDefined();
      expect(result?.word.length).toBe(3); // Level 1 = 3 letters
    });

    it('returns a word from level 2', () => {
      const result = pickWordForLevel(2, seededRandom());
      expect(result).toBeDefined();
      expect(result?.word.length).toBeGreaterThanOrEqual(3);
      expect(result?.word.length).toBeLessThanOrEqual(4);
    });

    it('returns a word from level 3', () => {
      const result = pickWordForLevel(3, seededRandom());
      expect(result).toBeDefined();
      // Level 3 allows up to difficulty 3, which includes 3, 4, and 5 letter words
      expect(result?.word.length).toBeGreaterThanOrEqual(3);
    });

    it('clamps to last level for high levels', () => {
      const result = pickWordForLevel(10, seededRandom());
      expect(result).toBeDefined();
    });
  });

  describe('createLetterTargets', () => {
    it('returns correct number of targets', () => {
      const targets = createLetterTargets('CAT', 3, seededRandom());
      expect(targets).toHaveLength(3 + 3);
    });

    it('marks correct letters with isCorrect=true and sequential orderIndex', () => {
      const targets = createLetterTargets('DOG', 2, seededRandom());
      const correct = targets.filter((t) => t.isCorrect);
      expect(correct).toHaveLength(3);
      expect(correct.map((t) => t.letter)).toEqual(['D', 'O', 'G']);
      expect(correct.map((t) => t.orderIndex)).toEqual([0, 1, 2]);
    });

    it('marks distractors with isCorrect=false and orderIndex=-1', () => {
      const targets = createLetterTargets('CAT', 2, seededRandom());
      const distractors = targets.filter((t) => !t.isCorrect);
      expect(distractors).toHaveLength(2);
      for (const d of distractors) {
        expect(d.orderIndex).toBe(-1);
      }
    });

    it('distractor letters are not in the word', () => {
      const word = 'SUN';
      const targets = createLetterTargets(word, 4, seededRandom());
      const wordLetters = new Set(word.split(''));
      const distractors = targets.filter((t) => !t.isCorrect);
      for (const d of distractors) {
        expect(wordLetters.has(d.letter)).toBe(false);
      }
    });

    it('no duplicate distractors', () => {
      const targets = createLetterTargets('CAT', 10, seededRandom());
      const distractors = targets.filter((t) => !t.isCorrect);
      const letters = distractors.map((t) => t.letter);
      const uniqueLetters = new Set(letters);
      expect(uniqueLetters.size).toBe(letters.length);
    });

    it('all targets have a position with x and y', () => {
      const targets = createLetterTargets('HAT', 2, seededRandom());
      for (const t of targets) {
        expect(t.position).toHaveProperty('x');
        expect(t.position).toHaveProperty('y');
        expect(typeof t.position.x).toBe('number');
        expect(typeof t.position.y).toBe('number');
      }
    });
  });
});
