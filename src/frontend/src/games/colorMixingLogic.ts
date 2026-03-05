export type BaseColorId = 'red' | 'yellow' | 'blue';

export interface BaseColor {
  id: BaseColorId;
  name: string;
  hex: string;
  emoji: string;
}

export interface ColorMixRecipe {
  id: string;
  left: BaseColorId;
  right: BaseColorId;
  resultName: string;
  resultHex: string;
  resultEmoji: string;
}

export interface ColorMixRound {
  recipe: ColorMixRecipe;
  options: string[];
}

export const BASE_COLORS: BaseColor[] = [
  { id: 'red', name: 'Red', hex: '#EF4444', emoji: '🔴' },
  { id: 'yellow', name: 'Yellow', hex: '#FACC15', emoji: '🟡' },
  { id: 'blue', name: 'Blue', hex: '#3B82F6', emoji: '🔵' },
];

export const COLOR_MIX_RECIPES: ColorMixRecipe[] = [
  {
    id: 'orange',
    left: 'red',
    right: 'yellow',
    resultName: 'Orange',
    resultHex: '#FB923C',
    resultEmoji: '🟠',
  },
  {
    id: 'green',
    left: 'yellow',
    right: 'blue',
    resultName: 'Green',
    resultHex: '#22C55E',
    resultEmoji: '🟢',
  },
  {
    id: 'purple',
    left: 'red',
    right: 'blue',
    resultName: 'Purple',
    resultHex: '#A855F7',
    resultEmoji: '🟣',
  },
];

function shuffle<T>(items: T[], rng: () => number): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function createColorMixRound(rng: () => number = Math.random): ColorMixRound {
  const recipe = COLOR_MIX_RECIPES[Math.floor(rng() * COLOR_MIX_RECIPES.length)];
  const options = shuffle(
    COLOR_MIX_RECIPES.map((entry) => entry.resultName),
    rng,
  );
  return { recipe, options };
}

export function isColorMixAnswerCorrect(round: ColorMixRound, selectedName: string): boolean {
  return round.recipe.resultName === selectedName;
}
