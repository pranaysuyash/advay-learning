import { describe, expect, it } from 'vitest';

import {
  BASE_COLORS,
  COLOR_MIX_RECIPES,
  createColorMixRound,
  isColorMixAnswerCorrect,
  type BaseColorId,
  type ColorMixRecipe,
  type BaseColor,
  type ColorMixRound,
} from '../colorMixingLogic';

describe('BASE_COLORS', () => {
  it('has exactly 3 base colors', () => {
    expect(BASE_COLORS).toHaveLength(3);
  });

  it('contains red, yellow, and blue', () => {
    const ids = BASE_COLORS.map((c) => c.id);
    expect(ids).toContain('red');
    expect(ids).toContain('yellow');
    expect(ids).toContain('blue');
  });

  it('each base color has required properties', () => {
    for (const color of BASE_COLORS) {
      expect(typeof color.id).toBe('string');
      expect(typeof color.name).toBe('string');
      expect(typeof color.hex).toBe('string');
      expect(typeof color.emoji).toBe('string');
    }
  });

  it('red has correct properties', () => {
    const red = BASE_COLORS.find((c) => c.id === 'red');
    expect(red).toBeDefined();
    expect(red?.name).toBe('Red');
    expect(red?.hex).toBe('#EF4444');
    expect(red?.emoji).toBe('🔴');
  });

  it('yellow has correct properties', () => {
    const yellow = BASE_COLORS.find((c) => c.id === 'yellow');
    expect(yellow).toBeDefined();
    expect(yellow?.name).toBe('Yellow');
    expect(yellow?.hex).toBe('#FACC15');
    expect(yellow?.emoji).toBe('🟡');
  });

  it('blue has correct properties', () => {
    const blue = BASE_COLORS.find((c) => c.id === 'blue');
    expect(blue).toBeDefined();
    expect(blue?.name).toBe('Blue');
    expect(blue?.hex).toBe('#3B82F6');
    expect(blue?.emoji).toBe('🔵');
  });
});

describe('COLOR_MIX_RECIPES', () => {
  it('has exactly 3 recipes', () => {
    expect(COLOR_MIX_RECIPES).toHaveLength(3);
  });

  it('each recipe has required properties', () => {
    for (const recipe of COLOR_MIX_RECIPES) {
      expect(typeof recipe.id).toBe('string');
      expect(typeof recipe.left).toBe('string');
      expect(typeof recipe.right).toBe('string');
      expect(typeof recipe.resultName).toBe('string');
      expect(typeof recipe.resultHex).toBe('string');
      expect(typeof recipe.resultEmoji).toBe('string');
    }
  });

  it('has orange recipe with red + yellow', () => {
    const orange = COLOR_MIX_RECIPES.find((r) => r.id === 'orange');
    expect(orange).toBeDefined();
    expect(orange?.left).toBe('red');
    expect(orange?.right).toBe('yellow');
    expect(orange?.resultName).toBe('Orange');
    expect(orange?.resultEmoji).toBe('🟠');
  });

  it('has green recipe with yellow + blue', () => {
    const green = COLOR_MIX_RECIPES.find((r) => r.id === 'green');
    expect(green).toBeDefined();
    expect(green?.left).toBe('yellow');
    expect(green?.right).toBe('blue');
    expect(green?.resultName).toBe('Green');
    expect(green?.resultEmoji).toBe('🟢');
  });

  it('has purple recipe with red + blue', () => {
    const purple = COLOR_MIX_RECIPES.find((r) => r.id === 'purple');
    expect(purple).toBeDefined();
    expect(purple?.left).toBe('red');
    expect(purple?.right).toBe('blue');
    expect(purple?.resultName).toBe('Purple');
    expect(purple?.resultEmoji).toBe('🟣');
  });
});

describe('createColorMixRound', () => {
  it('returns a valid round structure', () => {
    const round = createColorMixRound();

    expect(round).toHaveProperty('recipe');
    expect(round).toHaveProperty('options');
    expect(Array.isArray(round.options)).toBe(true);
  });

  it('recipe is one of the valid recipes', () => {
    const round = createColorMixRound();
    const validIds = COLOR_MIX_RECIPES.map((r) => r.id);
    expect(validIds).toContain(round.recipe.id);
  });

  it('options array has 3 items', () => {
    const round = createColorMixRound();
    expect(round.options).toHaveLength(3);
  });

  it('options contains all three secondary colors', () => {
    const round = createColorMixRound();
    expect(round.options).toContain('Orange');
    expect(round.options).toContain('Green');
    expect(round.options).toContain('Purple');
  });

  it('correct answer is in options', () => {
    const round = createColorMixRound();
    expect(round.options).toContain(round.recipe.resultName);
  });

  it('produces different rounds on multiple calls', () => {
    const rounds = Array.from({ length: 10 }, () => createColorMixRound());
    const uniqueRecipes = new Set(rounds.map((r) => r.recipe.id));
    // Should have at least 2 different recipes out of 10 calls
    expect(uniqueRecipes.size).toBeGreaterThan(1);
  });

  it('uses provided RNG function', () => {
    // Use RNG that always returns 0 (should select first recipe)
    const zeroRng = () => 0;
    const round = createColorMixRound(zeroRng);
    expect(round.recipe.id).toBe(COLOR_MIX_RECIPES[0].id);
  });

  it('uses RNG that returns 0.5', () => {
    const midRng = () => 0.5;
    const round = createColorMixRound(midRng);
    expect(COLOR_MIX_RECIPES.map((r) => r.id)).toContain(round.recipe.id);
  });

  it('produces consistent results with same RNG seed', () => {
    const makeSeededRng = (seed: number) => {
      return () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
      };
    };

    const rng1 = makeSeededRng(42);
    const round1 = createColorMixRound(rng1);

    const rng2 = makeSeededRng(42);
    const round2 = createColorMixRound(rng2);

    expect(round1.recipe.id).toBe(round2.recipe.id);
    expect(round1.options).toEqual(round2.options);
  });
});

describe('isColorMixAnswerCorrect', () => {
  it('returns true for correct orange answer', () => {
    const round: ColorMixRound = {
      recipe: COLOR_MIX_RECIPES.find((r) => r.id === 'orange')!,
      options: ['Orange', 'Green', 'Purple'],
    };
    expect(isColorMixAnswerCorrect(round, 'Orange')).toBe(true);
  });

  it('returns true for correct green answer', () => {
    const round: ColorMixRound = {
      recipe: COLOR_MIX_RECIPES.find((r) => r.id === 'green')!,
      options: ['Orange', 'Green', 'Purple'],
    };
    expect(isColorMixAnswerCorrect(round, 'Green')).toBe(true);
  });

  it('returns true for correct purple answer', () => {
    const round: ColorMixRound = {
      recipe: COLOR_MIX_RECIPES.find((r) => r.id === 'purple')!,
      options: ['Orange', 'Green', 'Purple'],
    };
    expect(isColorMixAnswerCorrect(round, 'Purple')).toBe(true);
  });

  it('returns false for incorrect answer', () => {
    const round: ColorMixRound = {
      recipe: COLOR_MIX_RECIPES.find((r) => r.id === 'orange')!,
      options: ['Orange', 'Green', 'Purple'],
    };
    expect(isColorMixAnswerCorrect(round, 'Green')).toBe(false);
    expect(isColorMixAnswerCorrect(round, 'Purple')).toBe(false);
  });

  it('returns false for invalid color name', () => {
    const round: ColorMixRound = {
      recipe: COLOR_MIX_RECIPES[0],
      options: ['Orange', 'Green', 'Purple'],
    };
    expect(isColorMixAnswerCorrect(round, 'Red')).toBe(false);
    expect(isColorMixAnswerCorrect(round, 'Blue')).toBe(false);
    expect(isColorMixAnswerCorrect(round, '')).toBe(false);
  });

  it('handles case-sensitive comparison', () => {
    const round: ColorMixRound = {
      recipe: COLOR_MIX_RECIPES[0],
      options: ['Orange', 'Green', 'Purple'],
    };
    expect(isColorMixAnswerCorrect(round, 'orange')).toBe(false);
    expect(isColorMixAnswerCorrect(round, 'ORANGE')).toBe(false);
    expect(isColorMixAnswerCorrect(round, 'Orange')).toBe(true);
  });

  it('compares against recipe resultName', () => {
    const round: ColorMixRound = {
      recipe: COLOR_MIX_RECIPES[0],
      options: ['Wrong', 'Options'],
    };
    expect(isColorMixAnswerCorrect(round, round.recipe.resultName)).toBe(true);
  });
});

describe('Color mixing theory', () => {
  it('red + yellow makes orange', () => {
    const recipe = COLOR_MIX_RECIPES.find(
      (r) => r.left === 'red' && r.right === 'yellow'
    );
    expect(recipe).toBeDefined();
    expect(recipe?.resultName).toBe('Orange');
  });

  it('yellow + blue makes green', () => {
    const recipe = COLOR_MIX_RECIPES.find(
      (r) => r.left === 'yellow' && r.right === 'blue'
    );
    expect(recipe).toBeDefined();
    expect(recipe?.resultName).toBe('Green');
  });

  it('red + blue makes purple', () => {
    const recipe = COLOR_MIX_RECIPES.find(
      (r) => r.left === 'red' && r.right === 'blue'
    );
    expect(recipe).toBeDefined();
    expect(recipe?.resultName).toBe('Purple');
  });

  it('all recipes have unique results', () => {
    const results = COLOR_MIX_RECIPES.map((r) => r.resultName);
    const uniqueResults = new Set(results);
    expect(uniqueResults.size).toBe(results.length);
  });

  it('all recipes use valid base colors', () => {
    const validIds: BaseColorId[] = ['red', 'yellow', 'blue'];
    for (const recipe of COLOR_MIX_RECIPES) {
      expect(validIds).toContain(recipe.left);
      expect(validIds).toContain(recipe.right);
    }
  });

  it('no recipe uses same color for both inputs', () => {
    for (const recipe of COLOR_MIX_RECIPES) {
      expect(recipe.left).not.toBe(recipe.right);
    }
  });
});

describe('Integration scenarios', () => {
  it('can play a complete round sequence', () => {
    const rounds = Array.from({ length: 8 }, () => createColorMixRound());

    for (const round of rounds) {
      expect(round.recipe).toBeDefined();
      expect(round.options).toHaveLength(3);
      expect(round.options).toContain(round.recipe.resultName);
    }
  });

  it('all color combinations are covered', () => {
    // Generate many rounds to ensure all recipes appear
    const rounds = Array.from({ length: 100 }, () => createColorMixRound());
    const recipeIds = new Set(rounds.map((r) => r.recipe.id));

    expect(recipeIds.size).toBe(3);
    expect(recipeIds).toContain('orange');
    expect(recipeIds).toContain('green');
    expect(recipeIds).toContain('purple');
  });

  it('options are always shuffled (not predictable)', () => {
    const rounds = Array.from({ length: 50 }, () =>
      createColorMixRound(() => Math.random())
    );

    // Check that first option varies
    const firstOptions = rounds.map((r) => r.options[0]);
    const uniqueFirstOptions = new Set(firstOptions);
    expect(uniqueFirstOptions.size).toBeGreaterThan(1);
  });
});

describe('Type definitions', () => {
  it('BaseColorId type matches base color ids', () => {
    const ids: BaseColorId[] = ['red', 'yellow', 'blue'];
    expect(BASE_COLORS.map((c) => c.id)).toEqual(ids);
  });

  it('BaseColor interface is correctly implemented', () => {
    const color: BaseColor = {
      id: 'red',
      name: 'Red',
      hex: '#EF4444',
      emoji: '🔴',
    };
    expect(typeof color.id).toBe('string');
    expect(typeof color.name).toBe('string');
    expect(typeof color.hex).toBe('string');
    expect(typeof color.emoji).toBe('string');
  });

  it('ColorMixRecipe interface is correctly implemented', () => {
    const recipe: ColorMixRecipe = {
      id: 'test',
      left: 'red',
      right: 'yellow',
      resultName: 'Test',
      resultHex: '#000000',
      resultEmoji: '⚫',
    };
    expect(typeof recipe.id).toBe('string');
    expect(typeof recipe.left).toBe('string');
    expect(typeof recipe.right).toBe('string');
    expect(typeof recipe.resultName).toBe('string');
    expect(typeof recipe.resultHex).toBe('string');
    expect(typeof recipe.resultEmoji).toBe('string');
  });

  it('ColorMixRound interface is correctly implemented', () => {
    const round: ColorMixRound = {
      recipe: COLOR_MIX_RECIPES[0],
      options: ['Orange', 'Green', 'Purple'],
    };
    expect(round.recipe).toBeDefined();
    expect(Array.isArray(round.options)).toBe(true);
  });
});
