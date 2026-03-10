import { describe, it, expect } from 'vitest';
import {
  mixIngredients,
  checkDiscovery,
  updateProgress,
  getHint,
  getDefaultProgress,
  blendColors,
  shouldShowHint,
  getProgressPercentage,
  getIngredientsForLevel,
  getRecipesForLevel,
  INGREDIENTS,
  RECIPES,
} from '../chemistryLabLogic';

describe('chemistryLabLogic', () => {
  describe('mixIngredients', () => {
    it('should return success for red + blue = purple potion', () => {
      const result = mixIngredients(['red', 'blue']);
      expect(result.success).toBe(true);
      expect(result.recipe?.id).toBe('purple-potion');
      expect(result.recipe?.name).toBe('Purple Potion');
    });

    it('should return success for blue + red = purple potion (order independent)', () => {
      const result = mixIngredients(['blue', 'red']);
      expect(result.success).toBe(true);
      expect(result.recipe?.id).toBe('purple-potion');
    });

    it('should return success for red + yellow = orange potion', () => {
      const result = mixIngredients(['red', 'yellow']);
      expect(result.success).toBe(true);
      expect(result.recipe?.id).toBe('orange-potion');
    });

    it('should return success for red + blue + white = magenta potion', () => {
      const result = mixIngredients(['red', 'blue', 'white']);
      expect(result.success).toBe(true);
      expect(result.recipe?.id).toBe('magenta-potion');
    });

    it('should return success for orange + yellow = amber potion', () => {
      const result = mixIngredients(['orange', 'yellow']);
      expect(result.success).toBe(true);
      expect(result.recipe?.id).toBe('amber-potion');
    });

    it('should return success for purple + white = lavender potion', () => {
      const result = mixIngredients(['purple', 'white']);
      expect(result.success).toBe(true);
      expect(result.recipe?.id).toBe('lavender-potion');
    });

    it('should return success for red + orange + white = coral potion', () => {
      const result = mixIngredients(['red', 'orange', 'white']);
      expect(result.success).toBe(true);
      expect(result.recipe?.id).toBe('coral-potion');
    });

    it('should return success for blue + green + white = teal potion', () => {
      const result = mixIngredients(['blue', 'green', 'white']);
      expect(result.success).toBe(true);
      expect(result.recipe?.id).toBe('teal-potion');
    });

    it('should return success for white + silver = silver potion', () => {
      const result = mixIngredients(['white', 'silver']);
      expect(result.success).toBe(true);
      expect(result.recipe?.id).toBe('silver-potion');
    });

    it('should return failure for unknown combinations', () => {
      const result = mixIngredients(['red', 'green']);
      expect(result.success).toBe(false);
      expect(result.recipe).toBeNull();
    });

    it('should return failure for single ingredient', () => {
      const result = mixIngredients(['red']);
      expect(result.success).toBe(false);
      expect(result.recipe).toBeNull();
    });

    it('should return failure for empty array', () => {
      const result = mixIngredients([]);
      expect(result.success).toBe(false);
      expect(result.recipe).toBeNull();
    });

    it('should respect custom recipe list', () => {
      const customRecipes = RECIPES.filter(r => r.id === 'purple-potion');
      const result = mixIngredients(['red', 'yellow'], customRecipes);
      expect(result.success).toBe(false);
    });
  });

  describe('checkDiscovery', () => {
    it('should return true for undiscovered recipe', () => {
      const discovered = ['orange-potion'];
      const isNew = checkDiscovery('purple-potion', discovered);
      expect(isNew).toBe(true);
    });

    it('should return false for already discovered recipe', () => {
      const discovered = ['purple-potion', 'orange-potion'];
      const isNew = checkDiscovery('purple-potion', discovered);
      expect(isNew).toBe(false);
    });

    it('should return true when no recipes discovered', () => {
      const isNew = checkDiscovery('purple-potion', []);
      expect(isNew).toBe(true);
    });
  });

  describe('updateProgress', () => {
    it('should add discovered recipe to progress', () => {
      const progress = getDefaultProgress();
      const result = mixIngredients(['red', 'blue']);
      const newProgress = updateProgress(progress, result);

      expect(newProgress.discoveredRecipeIds).toContain('purple-potion');
      expect(newProgress.totalMixes).toBe(1);
      expect(newProgress.failedMixes).toBe(0);
    });

    it('should increment failedMixes on failed mix', () => {
      const progress = getDefaultProgress();
      const result = mixIngredients(['red', 'green']);
      const newProgress = updateProgress(progress, result);

      expect(newProgress.discoveredRecipeIds).toHaveLength(0);
      expect(newProgress.failedMixes).toBe(1);
    });

    it('should not duplicate discovered recipes', () => {
      const progress = {
        ...getDefaultProgress(),
        discoveredRecipeIds: ['purple-potion'],
      };
      const result = mixIngredients(['red', 'blue']);
      const newProgress = updateProgress(progress, result);

      expect(newProgress.discoveredRecipeIds.filter(id => id === 'purple-potion')).toHaveLength(1);
    });

    it('should reset failedMixes on discovery', () => {
      const progress = {
        ...getDefaultProgress(),
        failedMixes: 5,
      };
      const result = mixIngredients(['red', 'blue']);
      const newProgress = updateProgress(progress, result);

      expect(newProgress.failedMixes).toBe(0);
    });

    it('should update timestamp', () => {
      const progress = {
        ...getDefaultProgress(),
        lastSessionTimestamp: 1000,
      };
      const result = mixIngredients(['red', 'blue']);
      const newProgress = updateProgress(progress, result);

      expect(newProgress.lastSessionTimestamp).toBeGreaterThan(1000);
    });
  });

  describe('getHint', () => {
    it('should return ingredients for undiscovered recipe', () => {
      const discovered = ['purple-potion'];
      const hint = getHint(discovered);

      expect(hint).not.toBeNull();
      expect(hint!.length).toBeGreaterThanOrEqual(2);
      expect(hint!.every(ing => INGREDIENTS.includes(ing))).toBe(true);
    });

    it('should return null when all recipes discovered', () => {
      const allRecipeIds = RECIPES.map(r => r.id);
      const hint = getHint(allRecipeIds);

      expect(hint).toBeNull();
    });

    it('should not hint at already discovered recipes', () => {
      const discovered = ['purple-potion', 'orange-potion', 'green-potion'];
      
      for (let i = 0; i < 10; i++) {
        const hint = getHint(discovered);
        if (hint) {
          const hintRecipe = RECIPES.find(r => 
            r.ingredientIds.length === hint.length &&
            r.ingredientIds.every(id => hint.some(h => h.id === id))
          );
          expect(discovered).not.toContain(hintRecipe?.id);
        }
      }
    });
  });

  describe('blendColors', () => {
    it('should blend red and blue to purple-ish', () => {
      const color = blendColors(['red', 'blue']);
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should blend red, green, and blue', () => {
      const color = blendColors(['red', 'green', 'blue']);
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should return gray for empty array', () => {
      const color = blendColors([]);
      expect(color).toBe('#CCCCCC');
    });

    it('should return ingredient color for single ingredient', () => {
      const color = blendColors(['red']);
      expect(color.toUpperCase()).toBe('#EF4444');
    });
  });

  describe('shouldShowHint', () => {
    it('should show hint after 5 failed mixes', () => {
      const progress = { ...getDefaultProgress(), failedMixes: 5 };
      expect(shouldShowHint(progress)).toBe(true);
    });

    it('should show hint at 10, 15, 20 failed mixes', () => {
      expect(shouldShowHint({ ...getDefaultProgress(), failedMixes: 10 })).toBe(true);
      expect(shouldShowHint({ ...getDefaultProgress(), failedMixes: 15 })).toBe(true);
      expect(shouldShowHint({ ...getDefaultProgress(), failedMixes: 20 })).toBe(true);
    });

    it('should not show hint before 5 failed mixes', () => {
      expect(shouldShowHint({ ...getDefaultProgress(), failedMixes: 4 })).toBe(false);
      expect(shouldShowHint({ ...getDefaultProgress(), failedMixes: 3 })).toBe(false);
    });

    it('should not show hint at 6, 7, 8, 9 failed mixes', () => {
      expect(shouldShowHint({ ...getDefaultProgress(), failedMixes: 6 })).toBe(false);
      expect(shouldShowHint({ ...getDefaultProgress(), failedMixes: 7 })).toBe(false);
      expect(shouldShowHint({ ...getDefaultProgress(), failedMixes: 8 })).toBe(false);
      expect(shouldShowHint({ ...getDefaultProgress(), failedMixes: 9 })).toBe(false);
    });
  });

  describe('getProgressPercentage', () => {
    it('should return 0 when nothing discovered', () => {
      const percentage = getProgressPercentage([], 1);
      expect(percentage).toBe(0);
    });

    it('should return 100 when all level 1 recipes discovered', () => {
      const level1Recipes = getRecipesForLevel(1);
      const percentage = getProgressPercentage(
        level1Recipes.map(r => r.id),
        1,
      );
      expect(percentage).toBe(100);
    });

    it('should return 50 when half discovered', () => {
      const level1Recipes = getRecipesForLevel(1);
      const half = Math.floor(level1Recipes.length / 2);
      const discovered = level1Recipes.slice(0, half).map(r => r.id);
      const percentage = getProgressPercentage(discovered, 1);
      
      const expectedPercentage = (half / level1Recipes.length) * 100;
      expect(percentage).toBeCloseTo(expectedPercentage, 1);
    });

    it('should only count level-appropriate recipes', () => {
      const allRecipes = getRecipesForLevel(3);
      const level1Recipes = getRecipesForLevel(1);
      
      const percentage = getProgressPercentage(
        level1Recipes.map(r => r.id),
        1,
      );
      
      expect(percentage).toBe(100);
    });
  });

  describe('getIngredientsForLevel', () => {
    it('should return 5 ingredients for level 1', () => {
      const ingredients = getIngredientsForLevel(1);
      expect(ingredients).toHaveLength(5);
      expect(ingredients.map(i => i.id)).toEqual(['red', 'blue', 'green', 'yellow', 'purple']);
    });

    it('should return 8 ingredients for level 2', () => {
      const ingredients = getIngredientsForLevel(2);
      expect(ingredients).toHaveLength(8);
    });

    it('should return all 12 ingredients for level 3', () => {
      const ingredients = getIngredientsForLevel(3);
      expect(ingredients).toHaveLength(12);
    });
  });

  describe('getRecipesForLevel', () => {
    it('should return 8 recipes for level 1', () => {
      const recipes = getRecipesForLevel(1);
      expect(recipes.length).toBe(8);
    });

    it('should return 14 recipes for level 2', () => {
      const level1 = getRecipesForLevel(1);
      const level2 = getRecipesForLevel(2);
      expect(level2.length).toBeGreaterThan(level1.length);
      expect(level2.length).toBe(14);
    });

    it('should return all recipes for level 3', () => {
      const recipes = getRecipesForLevel(3);
      expect(recipes).toHaveLength(RECIPES.length);
      expect(recipes.length).toBe(15);
    });
  });

  describe('getDefaultProgress', () => {
    it('should return empty discovered list', () => {
      const progress = getDefaultProgress();
      expect(progress.discoveredRecipeIds).toEqual([]);
    });

    it('should return zero mixes', () => {
      const progress = getDefaultProgress();
      expect(progress.totalMixes).toBe(0);
      expect(progress.failedMixes).toBe(0);
    });

    it('should return current timestamp', () => {
      const before = Date.now();
      const progress = getDefaultProgress();
      const after = Date.now();
      
      expect(progress.lastSessionTimestamp).toBeGreaterThanOrEqual(before);
      expect(progress.lastSessionTimestamp).toBeLessThanOrEqual(after);
    });
  });
});
