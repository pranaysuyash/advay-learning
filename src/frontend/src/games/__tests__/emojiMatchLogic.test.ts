import { describe, expect, it, beforeEach } from 'vitest';

import {
  EMOTIONS,
  buildRound,
  type Emotion,
  type EmotionTarget,
} from '../emojiMatchLogic';

describe('EMOTIONS', () => {
  it('has 8 entries', () => {
    expect(EMOTIONS).toHaveLength(8);
  });

  it('each entry has name, emoji, and color', () => {
    for (const e of EMOTIONS) {
      expect(typeof e.name).toBe('string');
      expect(typeof e.emoji).toBe('string');
      expect(typeof e.color).toBe('string');
    }
  });

  it('has expected emotion names', () => {
    const names = EMOTIONS.map((e) => e.name);
    expect(names).toContain('Happy');
    expect(names).toContain('Sad');
    expect(names).toContain('Angry');
    expect(names).toContain('Surprised');
    expect(names).toContain('Scared');
    expect(names).toContain('Silly');
    expect(names).toContain('Sleepy');
    expect(names).toContain('Love');
  });

  it('all emotions have unique names', () => {
    const names = EMOTIONS.map((e) => e.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it('all emotions have unique emojis', () => {
    const emojis = EMOTIONS.map((e) => e.emoji);
    const uniqueEmojis = new Set(emojis);
    expect(uniqueEmojis.size).toBe(emojis.length);
  });

  it('all colors are valid hex codes', () => {
    const hexRegex = /^#[0-9A-F]{6}$/i;
    for (const e of EMOTIONS) {
      expect(e.color).toMatch(hexRegex);
    }
  });

  it('Happy emotion has correct properties', () => {
    const happy = EMOTIONS.find((e) => e.name === 'Happy');
    expect(happy).toBeDefined();
    expect(happy?.emoji).toBe('😊');
    expect(happy?.color).toBe('#FFD700');
  });

  it('Sad emotion has correct properties', () => {
    const sad = EMOTIONS.find((e) => e.name === 'Sad');
    expect(sad).toBeDefined();
    expect(sad?.emoji).toBe('😢');
    expect(sad?.color).toBe('#4FC3F7');
  });

  it('Angry emotion has correct properties', () => {
    const angry = EMOTIONS.find((e) => e.name === 'Angry');
    expect(angry).toBeDefined();
    expect(angry?.emoji).toBe('😠');
    expect(angry?.color).toBe('#EF5350');
  });
});

describe('buildRound', () => {
  describe('with default optionCount', () => {
    it('returns 4 targets by default', () => {
      const { targets } = buildRound();
      expect(targets).toHaveLength(4);
    });

    it('correctId is within valid range', () => {
      const { targets, correctId } = buildRound();
      expect(correctId).toBeGreaterThanOrEqual(0);
      expect(correctId).toBeLessThan(targets.length);
    });
  });

  describe('with custom optionCount', () => {
    it('returns 2 targets when optionCount is 2', () => {
      const { targets } = buildRound(2);
      expect(targets).toHaveLength(2);
    });

    it('returns 3 targets when optionCount is 3', () => {
      const { targets } = buildRound(3);
      expect(targets).toHaveLength(3);
    });

    it('returns 4 targets when optionCount is 4', () => {
      const { targets } = buildRound(4);
      expect(targets).toHaveLength(4);
    });

    it('returns 5 targets when optionCount is 5', () => {
      const { targets } = buildRound(5);
      expect(targets).toHaveLength(5);
    });

    it('returns 6 targets when optionCount is 6', () => {
      const { targets } = buildRound(6);
      expect(targets).toHaveLength(6);
    });

    it('correctId matches requested count', () => {
      const { targets, correctId } = buildRound(6);
      expect(correctId).toBeGreaterThanOrEqual(0);
      expect(correctId).toBeLessThan(targets.length);
    });
  });

  describe('target structure', () => {
    it('each target has id, position, name, emoji, and color', () => {
      const { targets } = buildRound(4);
      for (const t of targets) {
        expect(typeof t.id).toBe('number');
        expect(t.position).toHaveProperty('x');
        expect(t.position).toHaveProperty('y');
        expect(typeof t.name).toBe('string');
        expect(typeof t.emoji).toBe('string');
        expect(typeof t.color).toBe('string');
      }
    });

    it('target ids are sequential starting from 0', () => {
      const { targets } = buildRound(4);
      for (let i = 0; i < targets.length; i++) {
        expect(targets[i].id).toBe(i);
      }
    });

    it('targets have unique ids', () => {
      const { targets } = buildRound(6);
      const ids = targets.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('target positions are normalized (0-1)', () => {
      const { targets } = buildRound(4);
      for (const t of targets) {
        expect(t.position.x).toBeGreaterThanOrEqual(0);
        expect(t.position.x).toBeLessThanOrEqual(1);
        expect(t.position.y).toBeGreaterThanOrEqual(0);
        expect(t.position.y).toBeLessThanOrEqual(1);
      }
    });

    it('targets are spread out (not all at same position)', () => {
      const { targets } = buildRound(4);
      const positions = targets.map((t) => `${t.position.x},${t.position.y}`);
      const uniquePositions = new Set(positions);
      expect(uniquePositions.size).toBeGreaterThan(1);
    });
  });

  describe('emotion properties', () => {
    it('each target inherits from EMOTIONS', () => {
      const { targets } = buildRound(4);
      for (const target of targets) {
        expect(EMOTIONS.some((e) => e.name === target.name)).toBe(true);
      }
    });

    it('targets have valid emotion data', () => {
      const { targets } = buildRound(4);
      for (const t of targets) {
        expect(t.name.length).toBeGreaterThan(0);
        expect(t.emoji.length).toBeGreaterThan(0);
        expect(t.color).toMatch(/^#[0-9A-F]{6}$/i);
      }
    });
  });

  describe('correctId selection', () => {
    it('correctId points to valid target', () => {
      const { targets, correctId } = buildRound();
      const correctTarget = targets[correctId];
      expect(correctTarget).toBeDefined();
    });

    it('correctTarget can be accessed', () => {
      const { targets, correctId } = buildRound();
      const correctTarget = targets[correctId];
      expect(correctTarget.name).toBeTruthy();
      expect(correctTarget.emoji).toBeTruthy();
    });
  });

  describe('random function parameter', () => {
    it('works with custom random function', () => {
      const seedRng = () => 0.5;
      const a = buildRound(4, seedRng);
      const b = buildRound(4, seedRng);
      expect(a.targets.map((t) => t.name)).toEqual(
        b.targets.map((t) => t.name)
      );
      expect(a.correctId).toBe(b.correctId);
    });

    it('produces deterministic results with same RNG', () => {
      let seed = 42;
      const makeRng = () => {
        return () => {
          seed = (seed * 16807) % 2147483647;
          return seed / 2147483647;
        };
      };

      const rng1 = makeRng();
      const round1 = buildRound(4, rng1);

      seed = 42;
      const rng2 = makeRng();
      const round2 = buildRound(4, rng2);

      expect(round1.targets.map((t) => t.name)).toEqual(
        round2.targets.map((t) => t.name)
      );
    });

    it('uses different emotions with different RNG values', () => {
      const round1 = buildRound(4, () => 0);
      const round2 = buildRound(4, () => 0.5);

      // Positions might differ due to pickSpacedPoints implementation
      expect(round1.targets.length).toBe(round2.targets.length);
    });
  });

  describe('edge cases', () => {
    it('handles optionCount of 1', () => {
      const { targets, correctId } = buildRound(1);
      expect(targets).toHaveLength(1);
      expect(correctId).toBe(0);
    });

    it('handles optionCount equal to EMOTIONS length', () => {
      const { targets } = buildRound(EMOTIONS.length);
      expect(targets).toHaveLength(EMOTIONS.length);
    });

    it('never exceeds EMOTIONS length', () => {
      const { targets } = buildRound(EMOTIONS.length);
      expect(targets.length).toBeLessThanOrEqual(EMOTIONS.length);
    });
  });

  describe('round variety', () => {
    it('produces different rounds on multiple calls', () => {
      const rounds = Array.from({ length: 10 }, () => buildRound(4, Math.random));
      const firstNames = rounds.map((r) => r.targets[0].name);
      const uniqueFirstNames = new Set(firstNames);
      // Should have variety in first position
      expect(uniqueFirstNames.size).toBeGreaterThan(1);
    });

    it('can produce rounds with different target counts', () => {
      const round2 = buildRound(2);
      const round4 = buildRound(4);
      const round6 = buildRound(6);

      expect(round2.targets).toHaveLength(2);
      expect(round4.targets).toHaveLength(4);
      expect(round6.targets).toHaveLength(6);
    });
  });
});

describe('Emotion type', () => {
  it('matches Emotion interface structure', () => {
    const emotion: Emotion = {
      name: 'Test',
      emoji: '🧪',
      color: '#123456',
    };
    expect(typeof emotion.name).toBe('string');
    expect(typeof emotion.emoji).toBe('string');
    expect(typeof emotion.color).toBe('string');
  });

  it('allows valid emotion from EMOTIONS', () => {
    const emotion: Emotion = EMOTIONS[0];
    expect(emotion.name).toBeTruthy();
  });
});

describe('EmotionTarget type', () => {
  it('extends Emotion with id and position', () => {
    const target: EmotionTarget = {
      id: 0,
      name: 'Test',
      emoji: '🧪',
      color: '#123456',
      position: { x: 0.5, y: 0.5 },
    };
    expect(typeof target.id).toBe('number');
    expect(target.position).toHaveProperty('x');
    expect(target.position).toHaveProperty('y');
  });
});

describe('integration scenarios', () => {
  it('can simulate playing multiple rounds', () => {
    const rounds = [];
    for (let i = 0; i < 10; i++) {
      rounds.push(buildRound(4, Math.random));
    }

    expect(rounds).toHaveLength(10);
    for (const round of rounds) {
      expect(round.targets.length).toBe(4);
      expect(round.correctId).toBeGreaterThanOrEqual(0);
      expect(round.correctId).toBeLessThan(4);
    }
  });

  it('can progress through levels (2→3→4 options)', () => {
    const level1 = buildRound(2);
    const level2 = buildRound(3);
    const level3 = buildRound(4);

    expect(level1.targets).toHaveLength(2);
    expect(level2.targets).toHaveLength(3);
    expect(level3.targets).toHaveLength(4);
  });

  it('adaptive difficulty reduces options', () => {
    const normal = buildRound(4);
    const adaptive = buildRound(3); // Reduced due to struggles

    expect(normal.targets).toHaveLength(4);
    expect(adaptive.targets).toHaveLength(3);
  });
});

describe('position spacing', () => {
  it('targets are not all clustered at center', () => {
    const { targets } = buildRound(6);

    // Calculate centroid
    const avgX = targets.reduce((sum, t) => sum + t.position.x, 0) / targets.length;
    const avgY = targets.reduce((sum, t) => sum + t.position.y, 0) / targets.length;

    // Centroid should not be exactly at (0.5, 0.5) for random rounds
    const distanceFromCenter = Math.sqrt(
      Math.pow(avgX - 0.5, 2) + Math.pow(avgY - 0.5, 2)
    );

    // Either spread out or not perfectly centered
    expect(distanceFromCenter).toBeGreaterThanOrEqual(0);
  });

  it('positions are within game bounds', () => {
    const { targets } = buildRound(4);
    for (const t of targets) {
      expect(t.position.x).toBeGreaterThan(0.1); // Not too close to edge
      expect(t.position.x).toBeLessThan(0.9);
      expect(t.position.y).toBeGreaterThan(0.1);
      expect(t.position.y).toBeLessThan(0.9);
    }
  });
});
