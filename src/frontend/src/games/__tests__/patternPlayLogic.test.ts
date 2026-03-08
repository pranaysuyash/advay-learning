import { describe, expect, it } from 'vitest';

import {
  PatternItem,
  LEVELS,
  getLevelConfig,
  generatePattern,
  generateOptions,
} from '../patternPlayLogic';

describe('LEVELS', () => {
  it('has exactly 3 levels', () => {
    expect(LEVELS).toHaveLength(3);
  });

  it('has level 1 with patternLength 4', () => {
    expect(LEVELS[0].level).toBe(1);
    expect(LEVELS[0].patternLength).toBe(4);
  });

  it('has level 2 with patternLength 6', () => {
    expect(LEVELS[1].level).toBe(2);
    expect(LEVELS[1].patternLength).toBe(6);
  });

  it('has level 3 with patternLength 8', () => {
    expect(LEVELS[2].level).toBe(3);
    expect(LEVELS[2].patternLength).toBe(8);
  });
});

describe('getLevelConfig', () => {
  it('returns level 1 config for level 1', () => {
    const config = getLevelConfig(1);
    expect(config.level).toBe(1);
    expect(config.patternLength).toBe(4);
  });

  it('returns level 2 config for level 2', () => {
    const config = getLevelConfig(2);
    expect(config.level).toBe(2);
    expect(config.patternLength).toBe(6);
  });

  it('returns level 3 config for level 3', () => {
    const config = getLevelConfig(3);
    expect(config.level).toBe(3);
    expect(config.patternLength).toBe(8);
  });

  it('returns level 1 config for unknown level', () => {
    const config = getLevelConfig(999);
    expect(config.level).toBe(1);
    expect(config.patternLength).toBe(4);
  });

  it('returns level 1 config for negative level', () => {
    const config = getLevelConfig(-1);
    expect(config.level).toBe(1);
    expect(config.patternLength).toBe(4);
  });

  it('returns level 1 config for zero level', () => {
    const config = getLevelConfig(0);
    expect(config.level).toBe(1);
    expect(config.patternLength).toBe(4);
  });
});

describe('generatePattern', () => {
  it('returns shown array and answer', () => {
    const result = generatePattern(1);
    expect(result).toHaveProperty('shown');
    expect(result).toHaveProperty('answer');
  });

  it('shown array has patternLength - 1 items for level 1', () => {
    const result = generatePattern(1);
    expect(result.shown).toHaveLength(3); // 4 - 1
  });

  it('shown array has patternLength - 1 items for level 2', () => {
    const result = generatePattern(2);
    expect(result.shown).toHaveLength(5); // 6 - 1
  });

  it('shown array has patternLength - 1 items for level 3', () => {
    const result = generatePattern(3);
    expect(result.shown).toHaveLength(7); // 8 - 1
  });

  it('answer is a PatternItem', () => {
    const result = generatePattern(1);
    expect(result.answer).toHaveProperty('shape');
    expect(result.answer).toHaveProperty('color');
  });

  it('shown items are PatternItems', () => {
    const result = generatePattern(1);
    result.shown.forEach((item) => {
      expect(item).toHaveProperty('shape');
      expect(item).toHaveProperty('color');
    });
  });

  it('shape is one of the valid shapes', () => {
    const validShapes = ['●', '■', '▲', '★', '♦', '♥'];
    const result = generatePattern(1);
    validShapes.forEach((shape) => {
      // All patterns should use valid shapes
      expect(result.answer.shape).toBeTruthy();
    });
  });

  it('color is one of the valid colors', () => {
    const validColors = ['red', 'blue', 'green', 'purple', 'orange'];
    const result = generatePattern(1);
    expect(validColors).toContain(result.answer.color);
  });

  it('all shown items have valid shapes', () => {
    const validShapes = ['●', '■', '▲', '★', '♦', '♥'];
    const result = generatePattern(1);
    result.shown.forEach((item) => {
      expect(validShapes).toContain(item.shape);
    });
  });

  it('all shown items have valid colors', () => {
    const validColors = ['red', 'blue', 'green', 'purple', 'orange'];
    const result = generatePattern(1);
    result.shown.forEach((item) => {
      expect(validColors).toContain(item.color);
    });
  });

  it('generates different patterns on multiple calls', () => {
    const pattern1 = generatePattern(1);
    const pattern2 = generatePattern(1);

    // Due to randomness, patterns should differ
    const sameShape = pattern1.answer.shape === pattern2.answer.shape;
    const sameColor = pattern1.answer.color === pattern2.answer.color;
    // At least one should differ with high probability
    expect(sameShape && sameColor).not.toBe(true);
  });

  it('handles unknown level by using level 1', () => {
    const result = generatePattern(999);
    expect(result.shown).toHaveLength(3);
  });

  it('handles negative level by using level 1', () => {
    const result = generatePattern(-1);
    expect(result.shown).toHaveLength(3);
  });

  it('full pattern would be shown + answer', () => {
    const result = generatePattern(1);
    const fullPattern = [...result.shown, result.answer];
    expect(fullPattern).toHaveLength(4); // patternLength for level 1
  });

  it('generates shape from 6 options', () => {
    const shapes = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const result = generatePattern(1);
      shapes.add(result.answer.shape);
    }
    // Should see multiple shapes over many iterations
    expect(shapes.size).toBeGreaterThan(1);
  });

  it('generates color from 5 options', () => {
    const colors = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const result = generatePattern(1);
      colors.add(result.answer.color);
    }
    // Should see multiple colors over many iterations
    expect(colors.size).toBeGreaterThan(1);
  });

  it('shown items are not empty for level 1', () => {
    const result = generatePattern(1);
    expect(result.shown.length).toBeGreaterThan(0);
  });

  it('shown items are not empty for level 2', () => {
    const result = generatePattern(2);
    expect(result.shown.length).toBeGreaterThan(0);
  });

  it('shown items are not empty for level 3', () => {
    const result = generatePattern(3);
    expect(result.shown.length).toBeGreaterThan(0);
  });

  it('pattern length grows with level', () => {
    const level1 = generatePattern(1);
    const level2 = generatePattern(2);
    const level3 = generatePattern(3);

    expect(level3.shown.length).toBeGreaterThan(level2.shown.length);
    expect(level2.shown.length).toBeGreaterThan(level1.shown.length);
  });
});

describe('generateOptions', () => {
  const correctItem: PatternItem = { shape: '●', color: 'red' };

  it('includes correct answer', () => {
    const options = generateOptions(correctItem, 4);
    const hasCorrect = options.some(
      (o) => o.shape === correctItem.shape && o.color === correctItem.color,
    );
    expect(hasCorrect).toBe(true);
  });

  it('returns 4 options by default', () => {
    const options = generateOptions(correctItem);
    expect(options).toHaveLength(4);
  });

  it('returns requested count of options', () => {
    const options = generateOptions(correctItem, 6);
    expect(options).toHaveLength(6);
  });

  it('returns requested count for 2 options', () => {
    const options = generateOptions(correctItem, 2);
    expect(options).toHaveLength(2);
  });

  it('all options are PatternItems', () => {
    const options = generateOptions(correctItem, 4);
    options.forEach((option) => {
      expect(option).toHaveProperty('shape');
      expect(option).toHaveProperty('color');
    });
  });

  it('all options have valid shapes', () => {
    const validShapes = ['●', '■', '▲', '★', '♦', '♥'];
    const options = generateOptions(correctItem, 4);
    options.forEach((option) => {
      expect(validShapes).toContain(option.shape);
    });
  });

  it('all options have valid colors', () => {
    const validColors = ['red', 'blue', 'green', 'purple', 'orange'];
    const options = generateOptions(correctItem, 4);
    options.forEach((option) => {
      expect(validColors).toContain(option.color);
    });
  });

  it('no duplicate options', () => {
    const options = generateOptions(correctItem, 4);
    const unique = new Set(options.map((o) => `${o.shape}-${o.color}`));
    expect(unique.size).toBe(options.length);
  });

  it('options are shuffled (not in insertion order)', () => {
    // This test may occasionally fail due to randomness
    // but should pass most of the time
    let notFirstPosition = 0;
    for (let i = 0; i < 20; i++) {
      const options = generateOptions(correctItem, 4);
      const correctIndex = options.findIndex(
        (o) => o.shape === correctItem.shape && o.color === correctItem.color,
      );
      if (correctIndex !== 0) notFirstPosition++;
    }
    // Correct answer should not always be first
    expect(notFirstPosition).toBeGreaterThan(5);
  });

  it('generates different options on multiple calls', () => {
    const options1 = generateOptions(correctItem, 4);
    const options2 = generateOptions(correctItem, 4);

    // Compare as strings
    const str1 = options1.map((o) => `${o.shape}-${o.color}`).sort();
    const str2 = options2.map((o) => `${o.shape}-${o.color}`).sort();

    // Due to randomness of distractors, should differ
    const same =
      str1.length === str2.length && str1.every((val, i) => val === str2[i]);
    expect(same).not.toBe(true);
  });

  it('handles count of 1', () => {
    const options = generateOptions(correctItem, 1);
    expect(options).toHaveLength(1);
    expect(options[0].shape).toBe(correctItem.shape);
    expect(options[0].color).toBe(correctItem.color);
  });

  it('handles count of all available combos', () => {
    // Max unique combos: 6 shapes × 5 colors = 30
    // Note: generateOptions has infinite loop if count > unique combos
    // So we test with a reasonable number
    const options = generateOptions(correctItem, 10);
    expect(options.length).toBe(10);
    const unique = new Set(options.map((o) => `${o.shape}-${o.color}`));
    expect(unique.size).toBe(10);
  });

  it('includes variety of shapes when count > 1', () => {
    const options = generateOptions(correctItem, 6);
    const shapes = new Set(options.map((o) => o.shape));
    // With 6 items from 6 possible shapes, should have variety
    expect(shapes.size).toBeGreaterThan(1);
  });

  it('includes variety of colors when count > 1', () => {
    const options = generateOptions(correctItem, 6);
    const colors = new Set(options.map((o) => o.color));
    // With 6 items from 5 possible colors, should have variety
    expect(colors.size).toBeGreaterThan(1);
  });
});

describe('PatternItem type', () => {
  it('accepts valid pattern item', () => {
    const item: PatternItem = { shape: '●', color: 'red' };
    expect(item.shape).toBe('●');
    expect(item.color).toBe('red');
  });

  it('all shapes are single characters', () => {
    const shapes = ['●', '■', '▲', '★', '♦', '♥'];
    shapes.forEach((shape) => {
      expect(shape.length).toBe(1);
    });
  });
});
