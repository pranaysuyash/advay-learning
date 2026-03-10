/**
 * Chemistry Lab Game Logic
 *
 * Core logic for mixing ingredients, discovering recipes,
 * and managing game progress.
 */

export interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredientIds: string[];
  resultColor: string;
  resultEmoji: string;
  description: string;
}

export interface MixResult {
  success: boolean;
  recipe: Recipe | null;
  isNewDiscovery: boolean;
}

export interface GameProgress {
  discoveredRecipeIds: string[];
  totalMixes: number;
  failedMixes: number;
  lastSessionTimestamp: number;
}

export const INGREDIENTS: Ingredient[] = [
  { id: 'red', name: 'Red', emoji: '🔴', color: '#EF4444' },
  { id: 'blue', name: 'Blue', emoji: '🔵', color: '#3B82F6' },
  { id: 'green', name: 'Green', emoji: '🟢', color: '#22C55E' },
  { id: 'yellow', name: 'Yellow', emoji: '🟡', color: '#EAB308' },
  { id: 'purple', name: 'Purple', emoji: '🟣', color: '#8B5CF6' },
  { id: 'orange', name: 'Orange', emoji: '🟠', color: '#F97316' },
  { id: 'white', name: 'White', emoji: '⚪', color: '#F9FAFB' },
  { id: 'black', name: 'Black', emoji: '⚫', color: '#1F2937' },
  { id: 'pink', name: 'Pink', emoji: '🩷', color: '#EC4899' },
  { id: 'cyan', name: 'Cyan', emoji: '🩵', color: '#06B6D4' },
  { id: 'gold', name: 'Gold', emoji: '✨', color: '#FBBF24' },
  { id: 'silver', name: 'Silver', emoji: '💫', color: '#9CA3AF' },
];

export const RECIPES: Recipe[] = [
  {
    id: 'purple-potion',
    name: 'Purple Potion',
    ingredientIds: ['red', 'blue'],
    resultColor: '#8B5CF6',
    resultEmoji: '💜',
    description: 'A magical purple elixir!',
  },
  {
    id: 'orange-potion',
    name: 'Orange Potion',
    ingredientIds: ['red', 'yellow'],
    resultColor: '#F97316',
    resultEmoji: '🧡',
    description: 'A warm orange mixture!',
  },
  {
    id: 'green-potion',
    name: 'Green Potion',
    ingredientIds: ['blue', 'yellow'],
    resultColor: '#22C55E',
    resultEmoji: '💚',
    description: 'A fresh green brew!',
  },
  {
    id: 'pink-potion',
    name: 'Pink Potion',
    ingredientIds: ['red', 'white'],
    resultColor: '#EC4899',
    resultEmoji: '💗',
    description: 'A lovely pink potion!',
  },
  {
    id: 'cyan-potion',
    name: 'Cyan Potion',
    ingredientIds: ['blue', 'green'],
    resultColor: '#06B6D4',
    resultEmoji: '💙',
    description: 'A cool cyan creation!',
  },
  {
    id: 'brown-potion',
    name: 'Brown Potion',
    ingredientIds: ['red', 'green', 'blue'],
    resultColor: '#78350F',
    resultEmoji: '🤎',
    description: 'A mysterious brown liquid!',
  },
  {
    id: 'gray-potion',
    name: 'Gray Potion',
    ingredientIds: ['black', 'white'],
    resultColor: '#6B7280',
    resultEmoji: '🩶',
    description: 'A neutral gray mixture!',
  },
  {
    id: 'magenta-potion',
    name: 'Magenta Potion',
    ingredientIds: ['red', 'blue', 'white'],
    resultColor: '#DB2777',
    resultEmoji: '💜',
    description: 'A vibrant magenta elixir!',
  },
  {
    id: 'lime-potion',
    name: 'Lime Potion',
    ingredientIds: ['green', 'yellow', 'white'],
    resultColor: '#84CC16',
    resultEmoji: '💚',
    description: 'A zesty lime brew!',
  },
  {
    id: 'golden-potion',
    name: 'Golden Potion',
    ingredientIds: ['yellow', 'gold'],
    resultColor: '#FBBF24',
    resultEmoji: '⭐',
    description: 'A legendary golden elixir!',
  },
  {
    id: 'teal-potion',
    name: 'Teal Potion',
    ingredientIds: ['blue', 'green', 'white'],
    resultColor: '#14B8A6',
    resultEmoji: '🩵',
    description: 'A refreshing teal mixture!',
  },
  {
    id: 'lavender-potion',
    name: 'Lavender Potion',
    ingredientIds: ['purple', 'white'],
    resultColor: '#C4B5FD',
    resultEmoji: '💜',
    description: 'A calming lavender brew!',
  },
  {
    id: 'amber-potion',
    name: 'Amber Potion',
    ingredientIds: ['orange', 'yellow'],
    resultColor: '#F59E0B',
    resultEmoji: '🧡',
    description: 'A warm amber elixir!',
  },
  {
    id: 'coral-potion',
    name: 'Coral Potion',
    ingredientIds: ['red', 'orange', 'white'],
    resultColor: '#FB7185',
    resultEmoji: '🩷',
    description: 'A lovely coral creation!',
  },
  {
    id: 'silver-potion',
    name: 'Silver Potion',
    ingredientIds: ['white', 'silver'],
    resultColor: '#E5E7EB',
    resultEmoji: '⚪',
    description: 'A shimmering silver mixture!',
  },
];

export function getIngredientsForLevel(level: number): Ingredient[] {
  if (level === 1) {
    return INGREDIENTS.slice(0, 5);
  } else if (level === 2) {
    return INGREDIENTS.slice(0, 8);
  } else {
    return INGREDIENTS;
  }
}

export function getRecipesForLevel(level: number): Recipe[] {
  const level1RecipeIds = [
    'purple-potion',
    'orange-potion',
    'green-potion',
    'pink-potion',
    'cyan-potion',
    'gray-potion',
    'amber-potion',
    'silver-potion',
  ];

  const level2RecipeIds = [
    ...level1RecipeIds,
    'brown-potion',
    'magenta-potion',
    'lime-potion',
    'lavender-potion',
    'coral-potion',
    'teal-potion',
  ];

  if (level === 1) {
    return RECIPES.filter(r => level1RecipeIds.includes(r.id));
  } else if (level === 2) {
    return RECIPES.filter(r => level2RecipeIds.includes(r.id));
  } else {
    return RECIPES;
  }
}

export function mixIngredients(
  ingredientIds: string[],
  recipes: Recipe[] = RECIPES,
): MixResult {
  if (ingredientIds.length < 2) {
    return { success: false, recipe: null, isNewDiscovery: false };
  }

  const sortedInput = [...ingredientIds].sort();

  const matchingRecipe = recipes.find(recipe => {
    const sortedRecipe = [...recipe.ingredientIds].sort();
    return (
      sortedInput.length === sortedRecipe.length &&
      sortedInput.every((id, index) => id === sortedRecipe[index])
    );
  });

  if (matchingRecipe) {
    return {
      success: true,
      recipe: matchingRecipe,
      isNewDiscovery: false,
    };
  }

  return { success: false, recipe: null, isNewDiscovery: false };
}

export function checkDiscovery(
  recipeId: string,
  discoveredRecipeIds: string[],
): boolean {
  return !discoveredRecipeIds.includes(recipeId);
}

export function updateProgress(
  currentProgress: GameProgress,
  mixResult: MixResult,
): GameProgress {
  const newProgress: GameProgress = {
    ...currentProgress,
    totalMixes: currentProgress.totalMixes + 1,
    lastSessionTimestamp: Date.now(),
  };

  if (!mixResult.success) {
    newProgress.failedMixes = currentProgress.failedMixes + 1;
  } else if (mixResult.recipe && checkDiscovery(mixResult.recipe.id, currentProgress.discoveredRecipeIds)) {
    newProgress.discoveredRecipeIds = [
      ...currentProgress.discoveredRecipeIds,
      mixResult.recipe.id,
    ];
    newProgress.failedMixes = 0;
  }

  return newProgress;
}

export function getHint(
  discoveredRecipeIds: string[],
  recipes: Recipe[] = RECIPES,
): Ingredient[] | null {
  const undiscovered = recipes.filter(r => !discoveredRecipeIds.includes(r.id));

  if (undiscovered.length === 0) {
    return null;
  }

  const randomUndiscovered = undiscovered[Math.floor(Math.random() * undiscovered.length)];

  return randomUndiscovered.ingredientIds.map(id =>
    INGREDIENTS.find(ing => ing.id === id)!,
  ).filter(Boolean);
}

export function getDefaultProgress(): GameProgress {
  return {
    discoveredRecipeIds: [],
    totalMixes: 0,
    failedMixes: 0,
    lastSessionTimestamp: Date.now(),
  };
}

export function blendColors(ingredientIds: string[]): string {
  const ingredients = ingredientIds
    .map(id => INGREDIENTS.find(ing => ing.id === id))
    .filter(Boolean) as Ingredient[];

  if (ingredients.length === 0) return '#CCCCCC';

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 128, g: 128, b: 128 };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b]
      .map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('');
  };

  const rgbSums = ingredients.reduce(
    (acc, ing) => {
      const rgb = hexToRgb(ing.color);
      return {
        r: acc.r + rgb.r,
        g: acc.g + rgb.g,
        b: acc.b + rgb.b,
      };
    },
    { r: 0, g: 0, b: 0 },
  );

  const avgRgb = {
    r: rgbSums.r / ingredients.length,
    g: rgbSums.g / ingredients.length,
    b: rgbSums.b / ingredients.length,
  };

  return rgbToHex(avgRgb.r, avgRgb.g, avgRgb.b);
}

export function shouldShowHint(progress: GameProgress): boolean {
  return progress.failedMixes >= 5 && progress.failedMixes % 5 === 0;
}

export function getProgressPercentage(
  discoveredRecipeIds: string[],
  level: number,
): number {
  const recipes = getRecipesForLevel(level);
  if (recipes.length === 0) return 0;
  return (discoveredRecipeIds.filter(id => recipes.some(r => r.id === id)).length / recipes.length) * 100;
}
