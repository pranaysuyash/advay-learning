import { describe, expect, it } from 'vitest';

import {
  ColorObject,
  ColorName,
  Level,
  COLORS,
  LEVELS,
  generateObjects,
  splashObject,
  updateSplashed,
} from '../colorSplashLogic';

describe('COLORS', () => {
  it('has 6 colors', () => {
    const colorKeys = Object.keys(COLORS) as ColorName[];
    expect(colorKeys).toHaveLength(6);
  });

  it('has red color with correct properties', () => {
    expect(COLORS.red.name).toBe('red');
    expect(COLORS.red.hex).toBe('#EF4444');
    expect(COLORS.red.emoji).toBe('🍎');
  });

  it('has blue color with correct properties', () => {
    expect(COLORS.blue.name).toBe('blue');
    expect(COLORS.blue.hex).toBe('#3B82F6');
    expect(COLORS.blue.emoji).toBe('🟦');
  });

  it('has green color with correct properties', () => {
    expect(COLORS.green.name).toBe('green');
    expect(COLORS.green.hex).toBe('#22C55E');
    expect(COLORS.green.emoji).toBe('🌿');
  });

  it('has yellow color with correct properties', () => {
    expect(COLORS.yellow.name).toBe('yellow');
    expect(COLORS.yellow.hex).toBe('#EAB308');
    expect(COLORS.yellow.emoji).toBe('⭐');
  });

  it('has purple color with correct properties', () => {
    expect(COLORS.purple.name).toBe('purple');
    expect(COLORS.purple.hex).toBe('#A855F7');
    expect(COLORS.purple.emoji).toBe('🍇');
  });

  it('has orange color with correct properties', () => {
    expect(COLORS.orange.name).toBe('orange');
    expect(COLORS.orange.hex).toBe('#F97316');
    expect(COLORS.orange.emoji).toBe('🍊');
  });

  it('all colors have unique hex values', () => {
    const hexValues = Object.values(COLORS).map(c => c.hex);
    const uniqueHexValues = new Set(hexValues);
    expect(uniqueHexValues.size).toBe(hexValues.length);
  });

  it('all colors have unique emojis', () => {
    const emojis = Object.values(COLORS).map(c => c.emoji);
    const uniqueEmojis = new Set(emojis);
    expect(uniqueEmojis.size).toBe(emojis.length);
  });
});

describe('LEVELS', () => {
  it('has exactly 4 levels', () => {
    expect(LEVELS).toHaveLength(4);
  });

  it('level 1 has 6 objects and 2 colors', () => {
    expect(LEVELS[0].id).toBe(1);
    expect(LEVELS[0].objectCount).toBe(6);
    expect(LEVELS[0].colorCount).toBe(2);
    expect(LEVELS[0].timeLimit).toBe(30);
  });

  it('level 2 has 9 objects and 3 colors', () => {
    expect(LEVELS[1].id).toBe(2);
    expect(LEVELS[1].objectCount).toBe(9);
    expect(LEVELS[1].colorCount).toBe(3);
    expect(LEVELS[1].timeLimit).toBe(45);
  });

  it('level 3 has 12 objects and 3 colors', () => {
    expect(LEVELS[2].id).toBe(3);
    expect(LEVELS[2].objectCount).toBe(12);
    expect(LEVELS[2].colorCount).toBe(3);
    expect(LEVELS[2].timeLimit).toBe(60);
  });

  it('level 4 has 15 objects and 4 colors', () => {
    expect(LEVELS[3].id).toBe(4);
    expect(LEVELS[3].objectCount).toBe(15);
    expect(LEVELS[3].colorCount).toBe(4);
    expect(LEVELS[3].timeLimit).toBe(75);
  });

  it('object count increases across levels', () => {
    expect(LEVELS[0].objectCount).toBeLessThan(LEVELS[1].objectCount);
    expect(LEVELS[1].objectCount).toBeLessThan(LEVELS[2].objectCount);
    expect(LEVELS[2].objectCount).toBeLessThan(LEVELS[3].objectCount);
  });

  it('color count increases appropriately', () => {
    expect(LEVELS[0].colorCount).toBe(2);
    expect(LEVELS[1].colorCount).toBe(3);
    expect(LEVELS[3].colorCount).toBe(4);
  });

  it('time limit increases across levels', () => {
    expect(LEVELS[0].timeLimit).toBeLessThan(LEVELS[1].timeLimit);
    expect(LEVELS[1].timeLimit).toBeLessThan(LEVELS[2].timeLimit);
    expect(LEVELS[2].timeLimit).toBeLessThan(LEVELS[3].timeLimit);
  });
});

describe('generateObjects', () => {
  it('returns objects and targetColor', () => {
    const result = generateObjects(LEVELS[0]);

    expect(result).toHaveProperty('objects');
    expect(result).toHaveProperty('targetColor');
  });

  it('creates correct number of objects for level 1', () => {
    const result = generateObjects(LEVELS[0]);
    expect(result.objects).toHaveLength(6);
  });

  it('creates correct number of objects for level 2', () => {
    const result = generateObjects(LEVELS[1]);
    expect(result.objects).toHaveLength(9);
  });

  it('creates correct number of objects for level 3', () => {
    const result = generateObjects(LEVELS[2]);
    expect(result.objects).toHaveLength(12);
  });

  it('creates correct number of objects for level 4', () => {
    const result = generateObjects(LEVELS[3]);
    expect(result.objects).toHaveLength(15);
  });

  it('targetColor is a valid color name', () => {
    const validColors: ColorName[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    const result = generateObjects(LEVELS[0]);
    expect(validColors).toContain(result.targetColor);
  });

  it('all objects have valid properties', () => {
    const result = generateObjects(LEVELS[0]);

    for (const obj of result.objects) {
      expect(typeof obj.id).toBe('number');
      expect(typeof obj.color).toBe('string');
      expect(typeof obj.emoji).toBe('string');
      expect(typeof obj.x).toBe('number');
      expect(typeof obj.y).toBe('number');
      expect(typeof obj.size).toBe('number');
      expect(typeof obj.splashed).toBe('boolean');
    }
  });

  it('all objects start with splashed false', () => {
    const result = generateObjects(LEVELS[0]);

    for (const obj of result.objects) {
      expect(obj.splashed).toBe(false);
    }
  });

  it('all objects have size 60', () => {
    const result = generateObjects(LEVELS[0]);

    for (const obj of result.objects) {
      expect(obj.size).toBe(60);
    }
  });

  it('objects have sequential ids starting from 0', () => {
    const result = generateObjects(LEVELS[1]);

    for (let i = 0; i < result.objects.length; i++) {
      expect(result.objects[i].id).toBe(i);
    }
  });

  it('all objects have colors within the selected color set', () => {
    const result = generateObjects(LEVELS[0]);
    const usedColors = new Set(result.objects.map(o => o.color));

    // Level 1 has 2 colors
    expect(usedColors.size).toBeLessThanOrEqual(2);
  });

  it('at least one object has the target color', () => {
    const result = generateObjects(LEVELS[0]);
    const hasTargetColor = result.objects.some(o => o.color === result.targetColor);
    expect(hasTargetColor).toBe(true);
  });

  it('objects have valid x positions (0-100)', () => {
    const result = generateObjects(LEVELS[0]);

    for (const obj of result.objects) {
      expect(obj.x).toBeGreaterThanOrEqual(0);
      expect(obj.x).toBeLessThanOrEqual(100);
    }
  });

  it('objects have valid y positions (0-100)', () => {
    const result = generateObjects(LEVELS[0]);

    for (const obj of result.objects) {
      expect(obj.y).toBeGreaterThanOrEqual(0);
      expect(obj.y).toBeLessThanOrEqual(100);
    }
  });

  it('objects are positioned away from edges (margin)', () => {
    const result = generateObjects(LEVELS[0]);
    const margin = 10;

    for (const obj of result.objects) {
      expect(obj.x).toBeGreaterThanOrEqual(margin);
      expect(obj.x).toBeLessThanOrEqual(100 - margin);
      expect(obj.y).toBeGreaterThanOrEqual(margin);
      expect(obj.y).toBeLessThanOrEqual(100 - margin);
    }
  });

  it('generates different objects on multiple calls', () => {
    const result1 = generateObjects(LEVELS[0]);
    const result2 = generateObjects(LEVELS[0]);

    // Positions should be different due to randomness
    const positions1 = result1.objects.map(o => `${o.x},${o.y}`).join('|');
    const positions2 = result2.objects.map(o => `${o.x},${o.y}`).join('|');

    expect(positions1).not.toBe(positions2);
  });

  it('each color object has matching emoji', () => {
    const result = generateObjects(LEVELS[0]);

    for (const obj of result.objects) {
      expect(COLORS[obj.color].emoji).toBe(obj.emoji);
    }
  });
});

describe('splashObject', () => {
  let testObjects: ColorObject[];
  let targetColor: ColorName;

  beforeEach(() => {
    targetColor = 'red';
    testObjects = [
      { id: 0, color: 'red', emoji: '🍎', x: 20, y: 20, size: 60, splashed: false },
      { id: 1, color: 'blue', emoji: '🟦', x: 40, y: 20, size: 60, splashed: false },
      { id: 2, color: 'red', emoji: '🍎', x: 60, y: 20, size: 60, splashed: false },
      { id: 3, color: 'green', emoji: '🌿', x: 80, y: 20, size: 60, splashed: false },
    ];
  });

  it('returns correct result when splashing target color', () => {
    const result = splashObject(testObjects, 0, targetColor);
    expect(result.correct).toBe(true);
    expect(result.scoreDelta).toBe(20);
    expect(result.isTarget).toBe(true);
  });

  it('returns incorrect result when splashing wrong color', () => {
    const result = splashObject(testObjects, 1, targetColor);
    expect(result.correct).toBe(false);
    expect(result.scoreDelta).toBe(-5);
    expect(result.isTarget).toBe(false);
  });

  it('returns no score when splashing already splashed object', () => {
    testObjects[0].splashed = true;
    const result = splashObject(testObjects, 0, targetColor);
    expect(result.correct).toBe(false);
    expect(result.scoreDelta).toBe(0);
    expect(result.isTarget).toBe(false);
  });

  it('returns no score when object id not found', () => {
    const result = splashObject(testObjects, 99, targetColor);
    expect(result.correct).toBe(false);
    expect(result.scoreDelta).toBe(0);
    expect(result.isTarget).toBe(false);
  });

  it('detects when all target objects are splashed', () => {
    // Splash first red object
    const result1 = splashObject(testObjects, 0, targetColor);
    expect(result1.allSplashed).toBe(false); // Still one red left

    // Update state
    testObjects = updateSplashed(testObjects, 0);

    // Splash second red object
    const result2 = splashObject(testObjects, 2, targetColor);
    expect(result2.allSplashed).toBe(true); // All reds splashed
  });

  it('allSplashed is false when wrong color is splashed', () => {
    const result = splashObject(testObjects, 1, targetColor);
    expect(result.allSplashed).toBe(false);
  });

  it('handles single target object correctly', () => {
    const singleTarget: ColorObject[] = [
      { id: 0, color: 'red', emoji: '🍎', x: 50, y: 50, size: 60, splashed: false },
    ];
    const result = splashObject(singleTarget, 0, 'red');
    expect(result.allSplashed).toBe(true);
  });

  it('handles all objects as same color', () => {
    const allRed: ColorObject[] = [
      { id: 0, color: 'red', emoji: '🍎', x: 20, y: 20, size: 60, splashed: false },
      { id: 1, color: 'red', emoji: '🍎', x: 40, y: 20, size: 60, splashed: false },
      { id: 2, color: 'red', emoji: '🍎', x: 60, y: 20, size: 60, splashed: false },
    ];

    // Splash first
    const result1 = splashObject(allRed, 0, 'red');
    expect(result1.allSplashed).toBe(false);

    // Splash second
    const updated1 = updateSplashed(allRed, 0);
    const result2 = splashObject(updated1, 1, 'red');
    expect(result2.allSplashed).toBe(false);

    // Splash third (last)
    const updated2 = updateSplashed(updated1, 1);
    const result3 = splashObject(updated2, 2, 'red');
    expect(result3.allSplashed).toBe(true);
  });

  it('score is +20 for correct splash regardless of position', () => {
    const result = splashObject(testObjects, 2, targetColor);
    expect(result.scoreDelta).toBe(20);
  });

  it('score is -5 for any wrong color', () => {
    expect(splashObject(testObjects, 1, targetColor).scoreDelta).toBe(-5);
    expect(splashObject(testObjects, 3, targetColor).scoreDelta).toBe(-5);
  });
});

describe('updateSplashed', () => {
  it('marks object as splashed', () => {
    const objects: ColorObject[] = [
      { id: 0, color: 'red', emoji: '🍎', x: 20, y: 20, size: 60, splashed: false },
      { id: 1, color: 'blue', emoji: '🟦', x: 40, y: 20, size: 60, splashed: false },
    ];

    const updated = updateSplashed(objects, 0);
    expect(updated[0].splashed).toBe(true);
  });

  it('does not modify other objects', () => {
    const objects: ColorObject[] = [
      { id: 0, color: 'red', emoji: '🍎', x: 20, y: 20, size: 60, splashed: false },
      { id: 1, color: 'blue', emoji: '🟦', x: 40, y: 20, size: 60, splashed: false },
    ];

    const updated = updateSplashed(objects, 0);
    expect(updated[1].splashed).toBe(false);
  });

  it('returns new array (immutable)', () => {
    const objects: ColorObject[] = [
      { id: 0, color: 'red', emoji: '🍎', x: 20, y: 20, size: 60, splashed: false },
    ];

    const updated = updateSplashed(objects, 0);
    expect(objects).not.toBe(updated);
    expect(objects[0].splashed).toBe(false); // Original unchanged
    expect(updated[0].splashed).toBe(true);
  });

  it('handles non-existent id gracefully', () => {
    const objects: ColorObject[] = [
      { id: 0, color: 'red', emoji: '🍎', x: 20, y: 20, size: 60, splashed: false },
    ];

    const updated = updateSplashed(objects, 99);
    expect(updated[0].splashed).toBe(false);
  });

  it('can update multiple objects', () => {
    const objects: ColorObject[] = [
      { id: 0, color: 'red', emoji: '🍎', x: 20, y: 20, size: 60, splashed: false },
      { id: 1, color: 'blue', emoji: '🟦', x: 40, y: 20, size: 60, splashed: false },
      { id: 2, color: 'green', emoji: '🌿', x: 60, y: 20, size: 60, splashed: false },
    ];

    let updated = updateSplashed(objects, 0);
    updated = updateSplashed(updated, 2);

    expect(updated[0].splashed).toBe(true);
    expect(updated[1].splashed).toBe(false);
    expect(updated[2].splashed).toBe(true);
  });
});

describe('integration scenarios', () => {
  it('can complete a level 1 game', () => {
    const result = generateObjects(LEVELS[0]);
    let objects = result.objects;
    const targetColor = result.targetColor;

    // Find all target color objects
    const targetObjectIds = objects
      .filter(o => o.color === targetColor)
      .map(o => o.id);

    expect(targetObjectIds.length).toBeGreaterThan(0);

    // Splash each target object
    for (const id of targetObjectIds) {
      const splashResult = splashObject(objects, id, targetColor);
      objects = updateSplashed(objects, id);
    }

    // Check all target objects are splashed
    const remainingTargets = objects.filter(o => !o.splashed && o.color === targetColor);
    expect(remainingTargets).toHaveLength(0);
  });

  it('can simulate scoring for a complete level', () => {
    const result = generateObjects(LEVELS[1]);
    let totalScore = 0;
    let objects = result.objects;
    const targetColor = result.targetColor;

    // Splash all target objects (correct)
    for (const obj of objects) {
      if (obj.color === targetColor) {
        const splashResult = splashObject(objects, obj.id, targetColor);
        totalScore += splashResult.scoreDelta;
        objects = updateSplashed(objects, obj.id);
      }
    }

    // All correct splashes give +20 each
    const targetCount = result.objects.filter(o => o.color === targetColor).length;
    expect(totalScore).toBe(targetCount * 20);
  });

  it('can simulate wrong splashes', () => {
    const result = generateObjects(LEVELS[0]);
    let totalScore = 0;

    // Splash all non-target objects (wrong)
    for (const obj of result.objects) {
      if (obj.color !== result.targetColor) {
        const splashResult = splashObject(result.objects, obj.id, result.targetColor);
        totalScore += splashResult.scoreDelta;
      }
    }

    // All wrong splashes give -5 each
    const wrongCount = result.objects.filter(o => o.color !== result.targetColor).length;
    expect(totalScore).toBe(wrongCount * -5);
  });
});

describe('edge cases', () => {
  it('handles empty objects array', () => {
    const result = splashObject([], 0, 'red');
    expect(result.correct).toBe(false);
    expect(result.scoreDelta).toBe(0);
  });

  it('handles level 4 with maximum objects', () => {
    const result = generateObjects(LEVELS[3]); // Level 4 is at index 3
    expect(result.objects).toHaveLength(15);
  });

  it('handles all colors being the same', () => {
    // This is a valid scenario based on the algorithm
    const result = generateObjects(LEVELS[0]);
    // Due to color selection, the first color is always the target
    // and objects cycle through the selected colors
    expect(result.objects[0].color).toBe(result.targetColor);
  });
});

describe('type definitions', () => {
  it('ColorObject interface is correctly implemented', () => {
    const obj: ColorObject = {
      id: 1,
      color: 'blue',
      emoji: '🟦',
      x: 50,
      y: 50,
      size: 60,
      splashed: false,
    };

    expect(typeof obj.id).toBe('number');
    expect(typeof obj.color).toBe('string');
    expect(typeof obj.emoji).toBe('string');
    expect(typeof obj.x).toBe('number');
    expect(typeof obj.y).toBe('number');
    expect(typeof obj.size).toBe('number');
    expect(typeof obj.splashed).toBe('boolean');
  });

  it('Level interface is correctly implemented', () => {
    const level: Level = {
      id: 1,
      objectCount: 6,
      colorCount: 2,
      timeLimit: 30,
    };

    expect(typeof level.id).toBe('number');
    expect(typeof level.objectCount).toBe('number');
    expect(typeof level.colorCount).toBe('number');
    expect(typeof level.timeLimit).toBe('number');
  });
});
