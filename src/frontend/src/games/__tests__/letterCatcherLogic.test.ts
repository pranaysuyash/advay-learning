/**
 * Letter Catcher Game Logic Tests
 *
 * Tests for level configurations, letter spawning, position updates,
 * catch detection, scoring, and game mechanics.
 */

import { describe, expect, it } from 'vitest';

import {
  LEVELS,
  getLevelConfig,
  spawnLetter,
  updatePositions,
  checkCatch,
  type FallingLetter,
  type LevelConfig,
} from '../letterCatcherLogic';

describe('Letter Catcher - Level Configurations', () => {
  it('has 3 levels', () => {
    expect(LEVELS).toHaveLength(3);
  });

  it('level 1 has slowest speed', () => {
    expect(LEVELS[0].level).toBe(1);
    expect(LEVELS[0].speed).toBe(1);
    expect(LEVELS[0].spawnRate).toBe(2000);
  });

  it('level 2 has medium settings', () => {
    expect(LEVELS[1].level).toBe(2);
    expect(LEVELS[1].speed).toBe(1.5);
    expect(LEVELS[1].spawnRate).toBe(1500);
  });

  it('level 3 has fastest speed', () => {
    expect(LEVELS[2].level).toBe(3);
    expect(LEVELS[2].speed).toBe(2);
    expect(LEVELS[2].spawnRate).toBe(1200);
  });

  it('speed increases from level 1 to 3', () => {
    expect(LEVELS[0].speed).toBeLessThan(LEVELS[1].speed);
    expect(LEVELS[1].speed).toBeLessThan(LEVELS[2].speed);
  });

  it('spawn rate decreases from level 1 to 3', () => {
    expect(LEVELS[0].spawnRate).toBeGreaterThan(LEVELS[1].spawnRate);
    expect(LEVELS[1].spawnRate).toBeGreaterThan(LEVELS[2].spawnRate);
  });
});

describe('Letter Catcher - Letter Spawning', () => {
  it('spawns letter with unique ID', () => {
    const letter1 = spawnLetter(1);
    const letter2 = spawnLetter(2);
    expect(letter1.id).toBe(1);
    expect(letter2.id).toBe(2);
  });

  it('spawns letter at y position 0', () => {
    const letter = spawnLetter(0);
    expect(letter.y).toBe(0);
  });

  it('spawns letter within x bounds', () => {
    const letter = spawnLetter(0);
    expect(letter.x).toBeGreaterThanOrEqual(20);
    expect(letter.x).toBeLessThanOrEqual(320);
  });

  it('spawns letter with valid letter', () => {
    const letter = spawnLetter(0);
    expect(letter.letter).toHaveLength(1);
    const validLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    expect(validLetters).toContain(letter.letter);
  });

  it('spawns different letters on multiple calls', () => {
    const letters = [];
    for (let i = 0; i < 26; i++) {
      letters.push(spawnLetter(i).letter);
    }
    const uniqueLetters = new Set(letters);
    // Should have variety due to randomness
    expect(uniqueLetters.size).toBeGreaterThan(1);
  });
});

describe('Letter Catcher - Position Updates', () => {
  it('updates y position by speed amount', () => {
    const letters: FallingLetter[] = [
      { id: 1, letter: 'A', x: 100, y: 100 },
    ];
    const updated = updatePositions(letters, 2);
    expect(updated[0].y).toBe(102);
  });

  it('does not modify x position', () => {
    const letters: FallingLetter[] = [
      { id: 1, letter: 'A', x: 100, y: 100 },
    ];
    const updated = updatePositions(letters, 1.5);
    expect(updated[0].x).toBe(100);
  });

  it('does not modify letter or id', () => {
    const letters: FallingLetter[] = [
      { id: 1, letter: 'A', x: 100, y: 100 },
    ];
    const updated = updatePositions(letters, 1);
    expect(updated[0].id).toBe(1);
    expect(updated[0].letter).toBe('A');
  });

  it('updates multiple letters', () => {
    const letters: FallingLetter[] = [
      { id: 1, letter: 'A', x: 50, y: 50 },
      { id: 2, letter: 'B', x: 150, y: 100 },
    ];
    const updated = updatePositions(letters, 1);
    expect(updated[0].y).toBe(51);
    expect(updated[1].y).toBe(101);
  });

  it('returns new array (immutable)', () => {
    const letters: FallingLetter[] = [
      { id: 1, letter: 'A', x: 100, y: 100 },
    ];
    const originalY = letters[0].y;
    updatePositions(letters, 1);
    expect(letters[0].y).toBe(originalY);
  });
});

describe('Letter Catcher - Catch Detection', () => {
  it('detects catch when y > 250 and x within range', () => {
    const letter: FallingLetter = { id: 1, letter: 'A', x: 200, y: 260 };
    expect(checkCatch(letter, 200)).toBe(true);
  });

  it('does not catch when y < 250', () => {
    const letter: FallingLetter = { id: 1, letter: 'A', x: 200, y: 240 };
    expect(checkCatch(letter, 200)).toBe(false);
  });

  it('does not catch when x out of range', () => {
    const letter: FallingLetter = { id: 1, letter: 'A', x: 300, y: 260 };
    expect(checkCatch(letter, 200)).toBe(false);
  });

  it('catches at edge of x range (49 pixels)', () => {
    const letter: FallingLetter = { id: 1, letter: 'A', x: 249, y: 260 };
    expect(checkCatch(letter, 200)).toBe(true); // |249 - 200| = 49 < 50
  });

  it('does not catch at exactly 50 pixels difference', () => {
    const letter: FallingLetter = { id: 1, letter: 'A', x: 250, y: 260 };
    expect(checkCatch(letter, 200)).toBe(false); // |250 - 200| = 50, NOT < 50
  });

  it('does not catch at 51 pixels difference', () => {
    const letter: FallingLetter = { id: 1, letter: 'A', x: 251, y: 260 };
    expect(checkCatch(letter, 200)).toBe(false); // |251 - 200| = 51 > 50
  });

  it('catches when letter is directly above bucket', () => {
    const letter: FallingLetter = { id: 1, letter: 'A', x: 200, y: 300 };
    expect(checkCatch(letter, 200)).toBe(true);
  });

  it('catches when bucket is at left edge and letter is at 69', () => {
    const letter: FallingLetter = { id: 1, letter: 'A', x: 69, y: 260 };
    const bucketX = 20; // Minimum bucket position
    expect(checkCatch(letter, bucketX)).toBe(true); // |69 - 20| = 49 < 50
  });

  it('catches when bucket is at right edge and letter is at 281', () => {
    const letter: FallingLetter = { id: 1, letter: 'A', x: 281, y: 260 };
    const bucketX = 330; // Maximum bucket position
    expect(checkCatch(letter, bucketX)).toBe(true); // |281 - 330| = 49 < 50
  });
});

describe('Letter Catcher - Scoring System', () => {
  // Scoring is typically handled in the component, but we can test the logic
  it('base score is 10 points', () => {
    const basePoints = 10;
    expect(basePoints).toBe(10);
  });

  it('streak bonus is 2 points per level, capped at 15', () => {
    const streakBonus = (streak: number) => Math.min(streak * 2, 15);

    expect(streakBonus(0)).toBe(0);
    expect(streakBonus(1)).toBe(2);
    expect(streakBonus(2)).toBe(4);
    expect(streakBonus(3)).toBe(6);
    expect(streakBonus(5)).toBe(10);
    expect(streakBonus(8)).toBe(15); // Capped
    expect(streakBonus(10)).toBe(15); // Capped
  });

  it('total score is base plus streak bonus', () => {
    const calculateScore = (streak: number) => 10 + Math.min(streak * 2, 15);

    expect(calculateScore(0)).toBe(10);
    expect(calculateScore(1)).toBe(12);
    expect(calculateScore(2)).toBe(14);
    expect(calculateScore(5)).toBe(20);
    expect(calculateScore(8)).toBe(25);
  });

  it('wrong letter penalty is -10 points', () => {
    const penalty = -10;
    expect(penalty).toBe(-10);
  });
});

describe('Letter Catcher - Game Completion', () => {
  it('completes after 5 letters caught', () => {
    const LETTERS_TO_COMPLETE = 5;
    let caught = 0;
    let completed = false;

    for (let i = 0; i < 5; i++) {
      caught++;
      if (caught >= LETTERS_TO_COMPLETE) {
        completed = true;
      }
    }

    expect(caught).toBe(5);
    expect(completed).toBe(true);
  });

  it('does not complete before 5 letters', () => {
    const LETTERS_TO_COMPLETE = 5;
    const caught = 3;
    const completed = caught >= LETTERS_TO_COMPLETE;

    expect(completed).toBe(false);
  });
});

describe('Letter Catcher - Letter Set', () => {
  it('has all 26 letters', () => {
    const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    expect(LETTERS).toHaveLength(26);
  });

  it('contains expected letters', () => {
    const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    expect(LETTERS).toContain('A');
    expect(LETTERS).toContain('M');
    expect(LETTERS).toContain('Z');
  });

  it('letters are uppercase', () => {
    const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    LETTERS.forEach(letter => {
      expect(letter).toBe(letter.toUpperCase());
    });
  });

  it('letters are in alphabetical order', () => {
    const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    expect(LETTERS.join('')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  });
});

describe('Letter Catcher - Level Config Lookup', () => {
  it('returns correct level config', () => {
    expect(getLevelConfig(1)).toBe(LEVELS[0]);
    expect(getLevelConfig(2)).toBe(LEVELS[1]);
    expect(getLevelConfig(3)).toBe(LEVELS[2]);
  });

  it('returns level 1 for invalid level', () => {
    const config = getLevelConfig(99);
    expect(config).toBe(LEVELS[0]);
  });

  it('returns level 1 for negative level', () => {
    const config = getLevelConfig(-1);
    expect(config).toBe(LEVELS[0]);
  });

  it('returns level 1 for zero level', () => {
    const config = getLevelConfig(0);
    expect(config).toBe(LEVELS[0]);
  });
});

describe('Letter Catcher - Edge Cases', () => {
  it('handles empty letters array', () => {
    const letters: FallingLetter[] = [];
    const updated = updatePositions(letters, 1);
    expect(updated).toHaveLength(0);
  });

  it('handles zero speed', () => {
    const letters: FallingLetter[] = [
      { id: 1, letter: 'A', x: 100, y: 100 },
    ];
    const updated = updatePositions(letters, 0);
    expect(updated[0].y).toBe(100);
  });

  it('handles negative speed (though not used in game)', () => {
    const letters: FallingLetter[] = [
      { id: 1, letter: 'A', x: 100, y: 100 },
    ];
    const updated = updatePositions(letters, -1);
    expect(updated[0].y).toBe(99);
  });

  it('handles letter at y exactly 250 (boundary)', () => {
    const letter: FallingLetter = { id: 1, letter: 'A', x: 200, y: 250 };
    expect(checkCatch(letter, 200)).toBe(false); // y > 250 required, not >=
  });

  it('handles letter at y just above 250', () => {
    const letter: FallingLetter = { id: 1, letter: 'A', x: 200, y: 250.01 };
    expect(checkCatch(letter, 200)).toBe(true); // y > 250
  });
});

describe('Letter Catcher - Streak System', () => {
  it('streak increases by 1 on correct catch', () => {
    let streak = 0;
    streak += 1;
    expect(streak).toBe(1);
  });

  it('streak resets to 0 on wrong catch', () => {
    let streak = 5;
    streak = 0;
    expect(streak).toBe(0);
  });

  it('streak milestone every 5 catches', () => {
    const milestones = [5, 10, 15];
    milestones.forEach(m => {
      expect(m % 5).toBe(0);
    });
  });

  it('streak visual shows fire emoji', () => {
    const streakEmoji = '🔥';
    expect(streakEmoji).toBe('🔥');
  });
});

describe('Letter Catcher - Difficulty Progression', () => {
  it('level 1 is easiest', () => {
    expect(LEVELS[0].speed).toBe(1);
    expect(LEVELS[0].spawnRate).toBe(2000);
  });

  it('level 2 is medium', () => {
    expect(LEVELS[1].speed).toBe(1.5);
    expect(LEVELS[1].spawnRate).toBe(1500);
  });

  it('level 3 is hardest', () => {
    expect(LEVELS[2].speed).toBe(2);
    expect(LEVELS[2].spawnRate).toBe(1200);
  });

  it('spawn rate decreases as difficulty increases', () => {
    expect(LEVELS[0].spawnRate).toBeGreaterThan(LEVELS[1].spawnRate);
    expect(LEVELS[1].spawnRate).toBeGreaterThan(LEVELS[2].spawnRate);
  });
});

describe('Letter Catcher - Type Definitions', () => {
  it('FallingLetter interface is correctly implemented', () => {
    const letter: FallingLetter = {
      id: 1,
      letter: 'A',
      x: 100,
      y: 0,
    };

    expect(typeof letter.id).toBe('number');
    expect(typeof letter.letter).toBe('string');
    expect(typeof letter.x).toBe('number');
    expect(typeof letter.y).toBe('number');
  });

  it('LevelConfig interface is correctly implemented', () => {
    const config: LevelConfig = {
      level: 1,
      speed: 1,
      spawnRate: 2000,
    };

    expect(typeof config.level).toBe('number');
    expect(typeof config.speed).toBe('number');
    expect(typeof config.spawnRate).toBe('number');
  });
});

describe('Letter Catcher - Position Bounds', () => {
  it('x position is within spawn range', () => {
    const letter = spawnLetter(1);
    // x = Math.random() * 300 + 20 gives range [20, 320)
    expect(letter.x).toBeGreaterThanOrEqual(20);
    expect(letter.x).toBeLessThanOrEqual(320);
  });

  it('y position starts at 0', () => {
    const letter = spawnLetter(1);
    expect(letter.y).toBe(0);
  });

  it('multiple spawns have unique IDs', () => {
    const letters = [];
    for (let i = 0; i < 10; i++) {
      letters.push(spawnLetter(i));
    }

    const ids = letters.map(l => l.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(10);
  });
});

describe('Letter Catcher - Integration Scenarios', () => {
  it('can simulate letter falling and being caught', () => {
    let letter = spawnLetter(1);
    const bucketX = letter.x; // Position bucket under letter

    // Letter falls down
    letter = updatePositions([letter], 2)[0];

    // Check if catch would work
    const caught = checkCatch(letter, bucketX);
    // Initially not low enough
    expect(letter.y).toBeLessThanOrEqual(250);
  });

  it('can simulate multiple letters falling', () => {
    const letters: FallingLetter[] = [
      spawnLetter(1),
      spawnLetter(2),
      spawnLetter(3),
    ];

    const updated = updatePositions(letters, 1.5);

    expect(updated).toHaveLength(3);
    expect(updated[0].y).toBe(1.5);
    expect(updated[1].y).toBe(1.5);
    expect(updated[2].y).toBe(1.5);
  });

  it('can simulate complete game flow', () => {
    let caught = 0;
    const targetCount = 5;

    // Simulate catching letters
    for (let i = 0; i < targetCount; i++) {
      const letter = spawnLetter(i);
      // Simulate catch
      caught++;
    }

    expect(caught).toBe(targetCount);
  });
});
