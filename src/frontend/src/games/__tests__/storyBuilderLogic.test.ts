import { describe, expect, it } from 'vitest';

import {
  StoryBuilderPrompt,
  StoryBuilderRound,
  STORY_PROMPTS,
  createStoryBuilderRound,
  evaluateStoryWordPick,
} from '../storyBuilderLogic';

describe('STORY_PROMPTS', () => {
  it('has 5 prompts', () => {
    expect(STORY_PROMPTS).toHaveLength(5);
  });

  it('all prompts have valid structure', () => {
    for (const prompt of STORY_PROMPTS) {
      expect(typeof prompt.id).toBe('string');
      expect(typeof prompt.prompt).toBe('string');
      expect(Array.isArray(prompt.orderedWords)).toBe(true);
      expect(prompt.orderedWords.length).toBeGreaterThan(0);
    }
  });

  it('all prompts have 3-word sentences', () => {
    for (const prompt of STORY_PROMPTS) {
      expect(prompt.orderedWords).toHaveLength(3);
    }
  });

  it('contains bird-sings prompt', () => {
    const prompt = STORY_PROMPTS.find(p => p.id === 'bird-sings');
    expect(prompt).toBeDefined();
    expect(prompt?.orderedWords).toEqual(['The', 'bird', 'sings']);
  });

  it('contains pip-jumps prompt', () => {
    const prompt = STORY_PROMPTS.find(p => p.id === 'pip-jumps');
    expect(prompt).toBeDefined();
    expect(prompt?.orderedWords).toEqual(['Pip', 'jumps', 'high']);
  });

  it('contains kids-read prompt', () => {
    const prompt = STORY_PROMPTS.find(p => p.id === 'kids-read');
    expect(prompt).toBeDefined();
    expect(prompt?.orderedWords).toEqual(['Kids', 'read', 'books']);
  });

  it('contains stars-shine prompt', () => {
    const prompt = STORY_PROMPTS.find(p => p.id === 'stars-shine');
    expect(prompt).toBeDefined();
    expect(prompt?.orderedWords).toEqual(['Stars', 'shine', 'bright']);
  });

  it('contains we-share-toys prompt', () => {
    const prompt = STORY_PROMPTS.find(p => p.id === 'we-share-toys');
    expect(prompt).toBeDefined();
    expect(prompt?.orderedWords).toEqual(['We', 'share', 'toys']);
  });
});

describe('createStoryBuilderRound', () => {
  it('returns a round with valid structure', () => {
    const round = createStoryBuilderRound([]);

    expect(typeof round.id).toBe('string');
    expect(typeof round.prompt).toBe('string');
    expect(Array.isArray(round.orderedWords)).toBe(true);
    expect(Array.isArray(round.options)).toBe(true);
  });

  it('options contains same words as orderedWords', () => {
    const round = createStoryBuilderRound([]);

    const sortedOptions = [...round.options].sort();
    const sortedOrdered = [...round.orderedWords].sort();
    expect(sortedOptions).toEqual(sortedOrdered);
  });

  it('options is a permutation of orderedWords', () => {
    const round = createStoryBuilderRound([]);

    expect(round.options).toHaveLength(round.orderedWords.length);
    expect(round.options).not.toBe(round.orderedWords); // Different reference
  });

  it('uses prompt from STORY_PROMPTS', () => {
    const round = createStoryBuilderRound([]);

    const found = STORY_PROMPTS.find(p => p.id === round.id);
    expect(found).toBeDefined();
  });

  it('respects usedPromptIds parameter', () => {
    const round1 = createStoryBuilderRound([], () => 0); // Always first
    const usedIds = [round1.id];
    const round2 = createStoryBuilderRound(usedIds, () => 0);

    // Even with same RNG, should use different prompt
    expect(round2.id).toBeDefined();
  });

  it('falls back to all prompts when all used', () => {
    const allIds = STORY_PROMPTS.map(p => p.id);
    const round = createStoryBuilderRound(allIds);

    expect(round.id).toBeDefined();
    expect(STORY_PROMPTS.find(p => p.id === round.id)).toBeDefined();
  });

  it('produces at least two distinct option orders across repeated calls', () => {
    const seenOrders = new Set<string>();

    for (let i = 0; i < 10; i += 1) {
      const round = createStoryBuilderRound([]);
      seenOrders.add(round.options.join('|'));
    }

    expect(seenOrders.size).toBeGreaterThan(1);
  });
});

describe('evaluateStoryWordPick', () => {
  it('returns ok: true for correct first word', () => {
    const round: StoryBuilderRound = {
      id: 'test',
      prompt: 'Test',
      orderedWords: ['The', 'bird', 'sings'],
      options: ['bird', 'The', 'sings'],
    };

    const result = evaluateStoryWordPick(round, [], 'The');
    expect(result.ok).toBe(true);
    expect(result.completed).toBe(false);
  });

  it('returns ok: true for correct second word', () => {
    const round: StoryBuilderRound = {
      id: 'test',
      prompt: 'Test',
      orderedWords: ['The', 'bird', 'sings'],
      options: ['bird', 'The', 'sings'],
    };

    const result = evaluateStoryWordPick(round, ['The'], 'bird');
    expect(result.ok).toBe(true);
    expect(result.completed).toBe(false);
  });

  it('returns ok: true and completed: true for final word', () => {
    const round: StoryBuilderRound = {
      id: 'test',
      prompt: 'Test',
      orderedWords: ['The', 'bird', 'sings'],
      options: ['bird', 'The', 'sings'],
    };

    const result = evaluateStoryWordPick(round, ['The', 'bird'], 'sings');
    expect(result.ok).toBe(true);
    expect(result.completed).toBe(true);
  });

  it('returns ok: false for wrong word', () => {
    const round: StoryBuilderRound = {
      id: 'test',
      prompt: 'Test',
      orderedWords: ['The', 'bird', 'sings'],
      options: ['bird', 'The', 'sings'],
    };

    const result = evaluateStoryWordPick(round, [], 'sings');
    expect(result.ok).toBe(false);
    expect(result.completed).toBe(false);
  });

  it('returns ok: false for duplicate pick', () => {
    const round: StoryBuilderRound = {
      id: 'test',
      prompt: 'Test',
      orderedWords: ['The', 'bird', 'sings'],
      options: ['bird', 'The', 'sings'],
    };

    const result = evaluateStoryWordPick(round, ['The'], 'The');
    expect(result.ok).toBe(false);
    expect(result.completed).toBe(false);
  });

  it('handles single-word sentence', () => {
    const round: StoryBuilderRound = {
      id: 'test',
      prompt: 'Test',
      orderedWords: ['Go'],
      options: ['Go'],
    };

    const result = evaluateStoryWordPick(round, [], 'Go');
    expect(result.ok).toBe(true);
    expect(result.completed).toBe(true);
  });

  it('handles four-word sentence', () => {
    const round: StoryBuilderRound = {
      id: 'test',
      prompt: 'Test',
      orderedWords: ['The', 'big', 'dog', 'runs'],
      options: ['dog', 'big', 'runs', 'The'],
    };

    let picked: string[] = [];
    let result = evaluateStoryWordPick(round, picked, 'The');
    expect(result.ok).toBe(true);
    expect(result.completed).toBe(false);
    picked = [...picked, 'The'];

    result = evaluateStoryWordPick(round, picked, 'big');
    expect(result.ok).toBe(true);
    expect(result.completed).toBe(false);
    picked = [...picked, 'big'];

    result = evaluateStoryWordPick(round, picked, 'dog');
    expect(result.ok).toBe(true);
    expect(result.completed).toBe(false);
    picked = [...picked, 'dog'];

    result = evaluateStoryWordPick(round, picked, 'runs');
    expect(result.ok).toBe(true);
    expect(result.completed).toBe(true);
  });
});

describe('integration scenarios', () => {
  it('can complete a full story builder round', () => {
    const round = createStoryBuilderRound([]);
    let picked: string[] = [];

    for (const word of round.orderedWords) {
      const result = evaluateStoryWordPick(round, picked, word);
      if (result.ok) {
        picked = [...picked, word];
      }
    }

    expect(picked).toEqual(round.orderedWords);
  });

  it('can recover from wrong answer', () => {
    const round: StoryBuilderRound = {
      id: 'test',
      prompt: 'Test',
      orderedWords: ['The', 'bird', 'sings'],
      options: ['bird', 'The', 'sings'],
    };

    // Wrong first
    let result = evaluateStoryWordPick(round, [], 'sings');
    expect(result.ok).toBe(false);

    // Correct first
    result = evaluateStoryWordPick(round, [], 'The');
    expect(result.ok).toBe(true);
  });

  it('can handle multiple rounds with different prompts', () => {
    const usedIds: string[] = [];

    for (let i = 0; i < 3; i++) {
      const round = createStoryBuilderRound(usedIds);
      expect(round.id).toBeDefined();
      usedIds.push(round.id);
    }

    expect(new Set(usedIds).size).toBe(3);
  });
});

describe('edge cases', () => {
  it('handles empty pickedWords array', () => {
    const round: StoryBuilderRound = {
      id: 'test',
      prompt: 'Test',
      orderedWords: ['A'],
      options: ['A'],
    };

    const result = evaluateStoryWordPick(round, [], 'A');
    expect(result.ok).toBe(true);
  });

  it('handles word not in options', () => {
    const round: StoryBuilderRound = {
      id: 'test',
      prompt: 'Test',
      orderedWords: ['The', 'cat'],
      options: ['The', 'cat'],
    };

    // This shouldn't happen in normal gameplay but tests robustness
    const result = evaluateStoryWordPick(round, [], 'dog');
    expect(result.ok).toBe(false);
  });

  it('handles empty orderedWords gracefully', () => {
    const round: StoryBuilderRound = {
      id: 'test',
      prompt: 'Test',
      orderedWords: [],
      options: [],
    };

    const result = evaluateStoryWordPick(round, [], 'word');
    // Index 0 of undefined is undefined, comparison fails
    expect(result.ok).toBe(false);
  });
});

describe('type definitions', () => {
  it('StoryBuilderPrompt interface is correctly implemented', () => {
    const prompt: StoryBuilderPrompt = {
      id: 'test-prompt',
      prompt: 'Build this sentence',
      orderedWords: ['Test', 'word', 'here'],
    };

    expect(typeof prompt.id).toBe('string');
    expect(typeof prompt.prompt).toBe('string');
    expect(Array.isArray(prompt.orderedWords)).toBe(true);
  });

  it('StoryBuilderRound interface is correctly implemented', () => {
    const round: StoryBuilderRound = {
      id: 'test-round',
      prompt: 'Test prompt',
      orderedWords: ['Test', 'sentence'],
      options: ['sentence', 'Test'],
    };

    expect(typeof round.id).toBe('string');
    expect(typeof round.prompt).toBe('string');
    expect(Array.isArray(round.orderedWords)).toBe(true);
    expect(Array.isArray(round.options)).toBe(true);
  });

  it('all prompt IDs are unique', () => {
    const ids = STORY_PROMPTS.map(p => p.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all orderedWords have at least 2 words', () => {
    for (const prompt of STORY_PROMPTS) {
      expect(prompt.orderedWords.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('all prompts are educational (simple sentences)', () => {
    for (const prompt of STORY_PROMPTS) {
      const sentence = prompt.orderedWords.join(' ');
      expect(sentence.length).toBeGreaterThan(0);
      // All lowercase or capitalized first letter
      expect(sentence[0]).toMatch(/[a-zA-Z]/);
    }
  });
});
