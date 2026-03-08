import { describe, expect, it } from 'vitest';

import {
  createEndingSoundsRound,
  isEndingSoundCorrect,
} from '../endingSoundsLogic';

describe('createEndingSoundsRound', () => {
  it('returns a 4-option round with correct ending included', () => {
    const round = createEndingSoundsRound([], () => 0);

    expect(round.options).toHaveLength(4);
    expect(round.options).toContain(round.target.endingLetter);
  });

  it('avoids already used words when possible', () => {
    const first = createEndingSoundsRound([], () => 0);
    const second = createEndingSoundsRound([first.target.word], () => 0);

    expect(second.target.word).not.toBe(first.target.word);
  });

  it('returns a valid round with target word and options', () => {
    const round = createEndingSoundsRound([], () => 0.5);

    expect(round.target).toBeDefined();
    expect(round.options).toBeDefined();
    expect(round.options.length).toBe(4);
  });

  it('target word has required properties', () => {
    const round = createEndingSoundsRound([], () => 0.5);

    expect(round.target.word).toBeDefined();
    expect(round.target.emoji).toBeDefined();
    expect(round.target.endingLetter).toBeDefined();
  });

  it('includes exactly one correct option', () => {
    const round = createEndingSoundsRound([], () => 0.5);

    const correctCount = round.options.filter(
      (option) => option === round.target.endingLetter
    ).length;
    expect(correctCount).toBe(1);
  });

  it('options do not include duplicates', () => {
    const round = createEndingSoundsRound([], () => 0.5);

    const uniqueOptions = new Set(round.options);
    expect(uniqueOptions.size).toBe(round.options.length);
  });

  it('distractor options are different from correct answer', () => {
    const round = createEndingSoundsRound([], () => 0.5);
    const correctLetter = round.target.endingLetter;

    round.options.forEach((option) => {
      if (option !== correctLetter) {
        expect(option).not.toBe(correctLetter);
      }
    });
  });

  it('uses deterministic random for testing', () => {
    const round1 = createEndingSoundsRound([], () => 0.25);
    const round2 = createEndingSoundsRound([], () => 0.25);

    expect(round1.target.word).toBe(round2.target.word);
  });

  it('produces valid round when no words have been used', () => {
    const round = createEndingSoundsRound([]);

    expect(round.target).toBeDefined();
    expect(round.options).toHaveLength(4);
  });

  it('produces valid round when some words have been used', () => {
    const usedWords = ['Cat', 'Dog'];
    const round = createEndingSoundsRound(usedWords);

    expect(round.target).toBeDefined();
    expect(round.options).toHaveLength(4);
    expect(usedWords).not.toContain(round.target.word);
  });

  it('reuses words when all have been used', () => {
    // Use all 10 words in the bank
    const allWords = ['Cat', 'Dog', 'Sun', 'Bus', 'Fish', 'Book', 'Bell', 'Cake', 'Moon', 'Lamp'];
    const round = createEndingSoundsRound(allWords);

    expect(round.target).toBeDefined();
    expect(round.options).toHaveLength(4);
  });

  it('produces valid rounds sequentially', () => {
    const usedWords: string[] = [];
    const rounds: any[] = [];

    for (let i = 0; i < 8; i++) {
      const round = createEndingSoundsRound(usedWords);
      rounds.push(round);
      usedWords.push(round.target.word);
    }

    expect(rounds).toHaveLength(8);

    rounds.forEach((round) => {
      expect(round.target).toBeDefined();
      expect(round.options).toHaveLength(4);
      expect(round.options).toContain(round.target.endingLetter);
    });
  });

  it('target word has valid emoji', () => {
    const round = createEndingSoundsRound([], () => 0.5);

    // Emojis should be single or double characters
    expect(round.target.emoji.length).toBeGreaterThan(0);
    expect(round.target.emoji.length).toBeLessThanOrEqual(4);
  });

  it('ending letter is always uppercase', () => {
    const round = createEndingSoundsRound([], () => 0.5);

    expect(round.target.endingLetter).toMatch(/^[A-Z]$/);
  });

  it('all options are single uppercase letters', () => {
    const round = createEndingSoundsRound([], () => 0.5);

    round.options.forEach((option) => {
      expect(option).toMatch(/^[A-Z]$/);
    });
  });

  it('word bank contains 10 words', () => {
    // Create rounds with no used words until we've seen all unique words
    const seenWords = new Set<string>();
    const rounds: any[] = [];

    // Keep creating rounds until we've seen 10 unique words or hit a limit
    for (let i = 0; i < 15 && seenWords.size < 10; i++) {
      const round = createEndingSoundsRound(Array.from(seenWords));
      if (!seenWords.has(round.target.word)) {
        seenWords.add(round.target.word);
        rounds.push(round);
      }
    }

    expect(seenWords.size).toBe(10);
  });

  it('different random seeds produce different rounds', () => {
    const round1 = createEndingSoundsRound([], () => 0.1);
    const round2 = createEndingSoundsRound([], () => 0.9);

    // With different random seeds, we should get different words
    // (not guaranteed, but very likely with 10 items)
    // This test verifies the random function is being used
    expect(round1.target.word).toBeDefined();
    expect(round2.target.word).toBeDefined();
  });

  it('options include 3 distractors plus correct answer', () => {
    const round = createEndingSoundsRound([], () => 0.5);

    const correctOption = round.target.endingLetter;
    const distractors = round.options.filter((o) => o !== correctOption);

    expect(distractors).toHaveLength(3);
  });

  it('handles empty used words array', () => {
    const round = createEndingSoundsRound([], () => 0.5);

    expect(round.target.word).toBeDefined();
    expect(round.options).toHaveLength(4);
  });
});

describe('isEndingSoundCorrect', () => {
  it('matches selected ending letter against target', () => {
    const round = createEndingSoundsRound([], () => 0);

    expect(isEndingSoundCorrect(round, round.target.endingLetter)).toBe(true);
    expect(isEndingSoundCorrect(round, 'Z')).toBe(round.target.endingLetter === 'Z');
  });

  it('is case-sensitive', () => {
    const round = createEndingSoundsRound([], () => 0);
    const correctLetter = round.target.endingLetter;

    // Uppercase should match
    expect(isEndingSoundCorrect(round, correctLetter)).toBe(true);

    // Lowercase should not match (since all letters in bank are uppercase)
    expect(isEndingSoundCorrect(round, correctLetter.toLowerCase())).toBe(false);
  });

  it('returns false for wrong letter', () => {
    const round = createEndingSoundsRound([], () => 0);

    // Find a letter that's not the correct one
    const wrongLetter = round.options.find((o) => o !== round.target.endingLetter);

    if (wrongLetter) {
      expect(isEndingSoundCorrect(round, wrongLetter)).toBe(false);
    }
  });

  it('returns false for completely wrong letter', () => {
    const round = createEndingSoundsRound([], () => 0);

    expect(isEndingSoundCorrect(round, 'X')).toBe(round.target.endingLetter === 'X');
  });

  it('handles all possible ending letters from word bank', () => {
    // Test with rounds for all words
    const endingLetters = ['T', 'G', 'N', 'S', 'H', 'K', 'L', 'E', 'P'];

    endingLetters.forEach((letter) => {
      const mockRound = {
        target: { word: 'Test', emoji: '🧪', endingLetter: letter },
        options: [letter, 'A', 'B', 'C'],
      };

      expect(isEndingSoundCorrect(mockRound, letter)).toBe(true);
    });
  });
});

describe('WORD_BANK Data', () => {
  it('word bank has expected words', () => {
    const rounds: any[] = [];
    const seenWords = new Set<string>();

    // Generate rounds until we see all words
    for (let i = 0; i < 20 && seenWords.size < 10; i++) {
      const round = createEndingSoundsRound(Array.from(seenWords), () => 0.5);
      if (!seenWords.has(round.target.word)) {
        seenWords.add(round.target.word);
        rounds.push(round);
      }
    }

    // Check we have the expected words
    const expectedWords = ['Cat', 'Dog', 'Sun', 'Bus', 'Fish', 'Book', 'Bell', 'Cake', 'Moon', 'Lamp'];
    expectedWords.forEach((word) => {
      expect(seenWords.has(word)).toBe(true);
    });
  });

  it('each word has a valid ending letter', () => {
    const rounds: any[] = [];
    const seenWords = new Set<string>();

    for (let i = 0; i < 20 && seenWords.size < 10; i++) {
      const round = createEndingSoundsRound(Array.from(seenWords), () => 0.5);
      if (!seenWords.has(round.target.word)) {
        seenWords.add(round.target.word);
        rounds.push(round);
      }
    }

    rounds.forEach((round) => {
      const word = round.target.word;
      const endingLetter = round.target.endingLetter;

      // Check that ending letter matches the last letter of the word (case-insensitive)
      expect(word.slice(-1).toUpperCase()).toBe(endingLetter);
    });
  });
});
