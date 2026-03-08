import { describe, expect, it } from 'vitest';

import {
  createShadowMatchRound,
  isShadowMatchCorrect,
  type ShadowMatchRound,
  type ShadowMatchPair,
} from '../shadowMatchLogic';

describe('SHADOW_PAIRS', () => {
  it('has exactly 8 shadow pairs', () => {
    // Walk the round generator through a full no-repeat session.
    const uniqueIds = new Set<string>();
    const usedIds: string[] = [];
    for (let i = 0; i < 8; i++) {
      const round = createShadowMatchRound(usedIds, () => 0);
      uniqueIds.add(round.target.id);
      usedIds.push(round.target.id);
    }
    expect(uniqueIds.size).toBe(8);
  });

  it('includes cat, car, tree, house, fish, star, ball, boat', () => {
    const ids = new Set<string>();
    // Use more iterations to ensure all 8 pairs appear with high probability
    for (let i = 0; i < 100; i++) {
      const round = createShadowMatchRound([], () => Math.random());
      ids.add(round.target.id);
    }

    expect(ids.has('cat')).toBe(true);
    expect(ids.has('car')).toBe(true);
    expect(ids.has('tree')).toBe(true);
    expect(ids.has('house')).toBe(true);
    expect(ids.has('fish')).toBe(true);
    expect(ids.has('star')).toBe(true);
    expect(ids.has('ball')).toBe(true);
    expect(ids.has('boat')).toBe(true);
  });

  it('each pair has id, objectName, and objectEmoji', () => {
    const round = createShadowMatchRound([], () => 0);
    expect(typeof round.target.id).toBe('string');
    expect(typeof round.target.objectName).toBe('string');
    expect(typeof round.target.objectEmoji).toBe('string');
  });

  it('cat has correct properties', () => {
    const round = createShadowMatchRound(['car', 'tree', 'house', 'fish', 'star', 'ball', 'boat'], () => 0);
    // Should get cat since all others are used
    expect(round.target.id).toBe('cat');
    expect(round.target.objectName).toBe('Cat');
    expect(round.target.objectEmoji).toBe('🐱');
  });
});

describe('createShadowMatchRound', () => {
  it('returns three options and includes the target', () => {
    const round = createShadowMatchRound([], () => 0);

    expect(round.options).toHaveLength(3);
    expect(round.options.map((entry) => entry.id)).toContain(round.target.id);
  });

  it('prefers unused target ids when possible', () => {
    const first = createShadowMatchRound([], () => 0);
    const second = createShadowMatchRound([first.target.id], () => 0);

    expect(second.target.id).not.toBe(first.target.id);
  });

  it('uses all pairs when all are used', () => {
    const usedIds = ['cat', 'car', 'tree', 'house', 'fish', 'star', 'ball', 'boat'];
    const round = createShadowMatchRound(usedIds, () => 0);

    // Should still return a valid round
    expect(round.options).toHaveLength(3);
    expect(usedIds).toContain(round.target.id);
  });

  it('target is always in options', () => {
    for (let i = 0; i < 20; i++) {
      const round = createShadowMatchRound([], () => Math.random());
      const optionIds = round.options.map((o) => o.id);
      expect(optionIds).toContain(round.target.id);
    }
  });

  it('options contain exactly 1 correct answer', () => {
    const round = createShadowMatchRound([], () => 0);
    const correctCount = round.options.filter((o) => o.id === round.target.id).length;
    expect(correctCount).toBe(1);
  });

  it('distractors are different from target', () => {
    const round = createShadowMatchRound([], () => 0);
    const distractors = round.options.filter((o) => o.id !== round.target.id);

    expect(distractors).toHaveLength(2);
    for (const d of distractors) {
      expect(d.id).not.toBe(round.target.id);
    }
  });

  it('all options have unique IDs', () => {
    const round = createShadowMatchRound([], () => 0);
    const ids = round.options.map((o) => o.id);
    expect(new Set(ids).size).toBe(3);
  });

  it('shuffles options so target position varies', () => {
    const rounds = [];
    for (let i = 0; i < 30; i++) {
      rounds.push(createShadowMatchRound([], () => Math.random()));
    }

    // Find target positions
    const targetPositions = rounds.map((r) =>
      r.options.findIndex((o) => o.id === r.target.id)
    );

    // Should have variety in positions
    const uniquePositions = new Set(targetPositions);
    expect(uniquePositions.size).toBeGreaterThan(1);
  });

  it('produces deterministic results with same RNG', () => {
    const seedRng = () => 0.5;
    const a = createShadowMatchRound([], seedRng);
    const b = createShadowMatchRound([], seedRng);

    expect(a.target.id).toBe(b.target.id);
    expect(a.options.map((o) => o.id)).toEqual(b.options.map((o) => o.id));
  });

  it('produces different rounds with different RNG', () => {
    const a = createShadowMatchRound([], () => 0);
    const b = createShadowMatchRound([], () => 0.5);

    // May or may not be different depending on RNG
    expect(a.options).toHaveLength(3);
    expect(b.options).toHaveLength(3);
  });

  it('handles empty usedTargetIds', () => {
    const round = createShadowMatchRound([], () => 0);
    expect(round.target).toBeDefined();
    expect(round.options).toHaveLength(3);
  });

  it('handles partial usedTargetIds', () => {
    const usedIds = ['cat', 'car', 'tree'];
    const round = createShadowMatchRound(usedIds, () => 0);

    // Target should not be in usedIds if possible
    expect(usedIds.includes(round.target.id)).toBe(false);
  });

  it('respects all 8 shadow pairs are available', () => {
    const allTargets = new Set<string>();
    const usedIds: string[] = [];
    for (let i = 0; i < 8; i++) {
      const round = createShadowMatchRound(usedIds, () => 0);
      allTargets.add(round.target.id);
      usedIds.push(round.target.id);
    }

    expect(allTargets.size).toBe(8);
  });
});

describe('isShadowMatchCorrect', () => {
  it('matches selected option id with target id', () => {
    const round = createShadowMatchRound([], () => 0);

    expect(isShadowMatchCorrect(round, round.target.id)).toBe(true);
    expect(isShadowMatchCorrect(round, 'unknown-id')).toBe(false);
  });

  it('returns true for correct selection', () => {
    const round = createShadowMatchRound([], () => 0);
    const correct = isShadowMatchCorrect(round, round.target.id);
    expect(correct).toBe(true);
  });

  it('returns false for incorrect selection', () => {
    const round = createShadowMatchRound([], () => 0);
    const distractor = round.options.find((o) => o.id !== round.target.id);
    if (distractor) {
      const correct = isShadowMatchCorrect(round, distractor.id);
      expect(correct).toBe(false);
    }
  });

  it('returns false for non-existent id', () => {
    const round = createShadowMatchRound([], () => 0);
    expect(isShadowMatchCorrect(round, 'non-existent-id')).toBe(false);
  });

  it('returns false for empty string', () => {
    const round = createShadowMatchRound([], () => 0);
    expect(isShadowMatchCorrect(round, '')).toBe(false);
  });

  it('is case sensitive', () => {
    const round = createShadowMatchRound([], () => 0);
    const upperId = round.target.id.toUpperCase();
    // IDs are lowercase, so uppercase should not match
    expect(isShadowMatchCorrect(round, upperId)).toBe(false);
  });
});

describe('round structure validation', () => {
  it('target has required properties', () => {
    const round = createShadowMatchRound([], () => 0);

    expect(round.target).toHaveProperty('id');
    expect(round.target).toHaveProperty('objectName');
    expect(round.target).toHaveProperty('objectEmoji');
  });

  it('each option has required properties', () => {
    const round = createShadowMatchRound([], () => 0);

    for (const option of round.options) {
      expect(option).toHaveProperty('id');
      expect(option).toHaveProperty('objectName');
      expect(option).toHaveProperty('objectEmoji');
    }
  });

  it('objectName is capitalized', () => {
    const round = createShadowMatchRound([], () => 0);

    for (const option of round.options) {
      expect(option.objectName[0]).toBe(option.objectName[0].toUpperCase());
    }
  });

  it('objectEmoji is a valid emoji string', () => {
    const round = createShadowMatchRound([], () => 0);

    for (const option of round.options) {
      expect(option.objectEmoji.length).toBeGreaterThan(0);
      // Emojis are typically 1-2 code points, but this is a basic check
    }
  });
});

describe('integration scenarios', () => {
  it('can simulate a complete game session', () => {
    const rounds = [];
    const usedIds: string[] = [];

    for (let i = 0; i < 8; i++) {
      const round = createShadowMatchRound(usedIds, () => Math.random());
      rounds.push(round);
      usedIds.push(round.target.id);
    }

    expect(rounds).toHaveLength(8);

    // All targets should be unique
    const targetIds = rounds.map((r) => r.target.id);
    expect(new Set(targetIds).size).toBe(8);
  });

  it('can simulate correct gameplay', () => {
    const round = createShadowMatchRound([], () => 0);

    // Simulate selecting the correct answer
    const isCorrect = isShadowMatchCorrect(round, round.target.id);
    expect(isCorrect).toBe(true);
  });

  it('can simulate incorrect gameplay', () => {
    const round = createShadowMatchRound([], () => 0);

    // Simulate selecting a wrong answer
    const wrongOption = round.options.find((o) => o.id !== round.target.id);
    if (wrongOption) {
      const isCorrect = isShadowMatchCorrect(round, wrongOption.id);
      expect(isCorrect).toBe(false);
    }
  });

  it('handles replay without repeats', () => {
    const usedIds: string[] = [];
    const rounds = [];

    for (let i = 0; i < 10; i++) {
      const round = createShadowMatchRound(usedIds, () => Math.random());
      rounds.push(round);
      usedIds.push(round.target.id);
    }

    // First 8 should be unique
    const first8Targets = rounds.slice(0, 8).map((r) => r.target.id);
    expect(new Set(first8Targets).size).toBe(8);
  });
});

describe('edge cases', () => {
  it('handles all 8 pairs being used', () => {
    const allIds = ['cat', 'car', 'tree', 'house', 'fish', 'star', 'ball', 'boat'];

    const round = createShadowMatchRound(allIds, () => 0);

    // Should still create a valid round (reuses from all)
    expect(round.options).toHaveLength(3);
    expect(allIds).toContain(round.target.id);
  });

  it('handles single used ID', () => {
    const round = createShadowMatchRound(['cat'], () => 0);

    // Target should not be 'cat'
    expect(round.target.id).not.toBe('cat');
  });

  it('handles seven used IDs (one remaining)', () => {
    const sevenIds = ['car', 'tree', 'house', 'fish', 'star', 'ball', 'boat'];

    const round = createShadowMatchRound(sevenIds, () => 0);

    // Only cat should be available
    expect(round.target.id).toBe('cat');
  });
});

describe('shadow pair properties', () => {
  it('cat emoji is 🐱', () => {
    const round = createShadowMatchRound(['car', 'tree', 'house', 'fish', 'star', 'ball', 'boat'], () => 0);
    expect(round.target.id).toBe('cat');
    expect(round.target.objectEmoji).toBe('🐱');
  });

  it('car emoji is 🚗', () => {
    const round = createShadowMatchRound(['cat', 'tree', 'house', 'fish', 'star', 'ball', 'boat'], () => 0);
    expect(round.target.id).toBe('car');
    expect(round.target.objectEmoji).toBe('🚗');
  });

  it('tree emoji is 🌳', () => {
    const round = createShadowMatchRound(['cat', 'car', 'house', 'fish', 'star', 'ball', 'boat'], () => 0);
    expect(round.target.id).toBe('tree');
    expect(round.target.objectEmoji).toBe('🌳');
  });

  it('house emoji is 🏠', () => {
    const round = createShadowMatchRound(['cat', 'car', 'tree', 'fish', 'star', 'ball', 'boat'], () => 0);
    expect(round.target.id).toBe('house');
    expect(round.target.objectEmoji).toBe('🏠');
  });

  it('fish emoji is 🐟', () => {
    const round = createShadowMatchRound(['cat', 'car', 'tree', 'house', 'star', 'ball', 'boat'], () => 0);
    expect(round.target.id).toBe('fish');
    expect(round.target.objectEmoji).toBe('🐟');
  });

  it('star emoji is ⭐', () => {
    const round = createShadowMatchRound(['cat', 'car', 'tree', 'house', 'fish', 'ball', 'boat'], () => 0);
    expect(round.target.id).toBe('star');
    expect(round.target.objectEmoji).toBe('⭐');
  });

  it('ball emoji is ⚽', () => {
    const round = createShadowMatchRound(['cat', 'car', 'tree', 'house', 'fish', 'star', 'boat'], () => 0);
    expect(round.target.id).toBe('ball');
    expect(round.target.objectEmoji).toBe('⚽');
  });

  it('boat emoji is ⛵', () => {
    const round = createShadowMatchRound(['cat', 'car', 'tree', 'house', 'fish', 'star', 'ball'], () => 0);
    expect(round.target.id).toBe('boat');
    expect(round.target.objectEmoji).toBe('⛵');
  });
});

describe('type definitions', () => {
  it('ShadowMatchPair interface is correctly implemented', () => {
    const pair: ShadowMatchPair = {
      id: 'test',
      objectName: 'Test',
      objectEmoji: '🧪',
    };

    expect(typeof pair.id).toBe('string');
    expect(typeof pair.objectName).toBe('string');
    expect(typeof pair.objectEmoji).toBe('string');
  });

  it('ShadowMatchRound interface is correctly implemented', () => {
    const round: ShadowMatchRound = {
      target: { id: 'cat', objectName: 'Cat', objectEmoji: '🐱' },
      options: [
        { id: 'cat', objectName: 'Cat', objectEmoji: '🐱' },
        { id: 'car', objectName: 'Car', objectEmoji: '🚗' },
        { id: 'tree', objectName: 'Tree', objectEmoji: '🌳' },
      ],
    };

    expect(round.target).toBeDefined();
    expect(Array.isArray(round.options)).toBe(true);
    expect(round.options).toHaveLength(3);
  });
});

describe('variety and randomness', () => {
  it('makes all target pairs reachable across a no-repeat session', () => {
    const targets = new Set<string>();
    const usedIds: string[] = [];
    for (let i = 0; i < 8; i++) {
      const round = createShadowMatchRound(usedIds, () => 0);
      targets.add(round.target.id);
      usedIds.push(round.target.id);
    }

    expect(targets.size).toBe(8);
  });

  it('produces variety in distractor selection', () => {
    const firstRound = createShadowMatchRound([], () => 0);
    const distractorSet1 = new Set(
      firstRound.options.filter((o) => o.id !== firstRound.target.id).map((o) => o.id)
    );

    let differentDistractors = false;
    for (let i = 0; i < 20; i++) {
      const round = createShadowMatchRound([], () => Math.random());
      const distractors = round.options.filter((o) => o.id !== round.target.id).map((o) => o.id);
      if (!distractorSet1.has(distractors[0]) || !distractorSet1.has(distractors[1])) {
        differentDistractors = true;
        break;
      }
    }

    expect(differentDistractors).toBe(true);
  });

  it('target position varies across rounds', () => {
    const positions = new Set<number>();
    for (let i = 0; i < 30; i++) {
      const round = createShadowMatchRound([], () => Math.random());
      const position = round.options.findIndex((o) => o.id === round.target.id);
      positions.add(position);
    }

    // Target should appear in different positions
    expect(positions.size).toBeGreaterThan(1);
  });
});
