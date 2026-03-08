/**
 * Odd One Out game logic — identify which item doesn't belong.
 *
 * "Which one doesn't belong?" - 4 items, 3 same category, 1 different
 *
 * @see docs/COMPLETE_GAMES_UNIVERSE.md - Odd One Out P1
 */

export interface OddItem {
  name: string;
  emoji: string;
  category: string;
}

export interface OddOneOutRound {
  items: OddItem[];
  oddItem: OddItem;
  category: string;
}

export interface LevelConfig {
  level: number;
  roundCount: number;
  timePerRound: number;
  passThreshold: number;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, roundCount: 6, timePerRound: 25, passThreshold: 4 },
  { level: 2, roundCount: 8, timePerRound: 20, passThreshold: 6 },
  { level: 3, roundCount: 10, timePerRound: 15, passThreshold: 8 },
];

// Category-based item banks
export const CATEGORY_BANKS: Record<string, OddItem[]> = {
  fruits: [
    { name: 'Apple', emoji: '🍎', category: 'fruit' },
    { name: 'Banana', emoji: '🍌', category: 'fruit' },
    { name: 'Orange', emoji: '🍊', category: 'fruit' },
    { name: 'Grapes', emoji: '🍇', category: 'fruit' },
    { name: 'Watermelon', emoji: '🍉', category: 'fruit' },
    { name: 'Strawberry', emoji: '🍓', category: 'fruit' },
    { name: 'Pineapple', emoji: '🍍', category: 'fruit' },
    { name: 'Mango', emoji: '🥭', category: 'fruit' },
  ],
  animals: [
    { name: 'Dog', emoji: '🐕', category: 'animal' },
    { name: 'Cat', emoji: '🐱', category: 'animal' },
    { name: 'Bird', emoji: '🐦', category: 'animal' },
    { name: 'Fish', emoji: '🐟', category: 'animal' },
    { name: 'Rabbit', emoji: '🐰', category: 'animal' },
    { name: 'Elephant', emoji: '🐘', category: 'animal' },
    { name: 'Lion', emoji: '🦁', category: 'animal' },
    { name: 'Monkey', emoji: '🐵', category: 'animal' },
  ],
  colors: [
    { name: 'Red', emoji: '🔴', category: 'color' },
    { name: 'Blue', emoji: '🔵', category: 'color' },
    { name: 'Green', emoji: '🟢', category: 'color' },
    { name: 'Yellow', emoji: '🟡', category: 'color' },
    { name: 'Purple', emoji: '🟣', category: 'color' },
    { name: 'Orange', emoji: '🟠', category: 'color' },
  ],
  shapes: [
    { name: 'Circle', emoji: '⭕', category: 'shape' },
    { name: 'Square', emoji: '⬜', category: 'shape' },
    { name: 'Triangle', emoji: '🔺', category: 'shape' },
    { name: 'Star', emoji: '⭐', category: 'shape' },
    { name: 'Heart', emoji: '❤️', category: 'shape' },
    { name: 'Diamond', emoji: '💎', category: 'shape' },
  ],
  vehicles: [
    { name: 'Car', emoji: '🚗', category: 'vehicle' },
    { name: 'Bus', emoji: '🚌', category: 'vehicle' },
    { name: 'Train', emoji: '🚂', category: 'vehicle' },
    { name: 'Airplane', emoji: '✈️', category: 'vehicle' },
    { name: 'Boat', emoji: '⛵', category: 'vehicle' },
    { name: 'Bicycle', emoji: '🚲', category: 'vehicle' },
  ],
  food: [
    { name: 'Pizza', emoji: '🍕', category: 'food' },
    { name: 'Burger', emoji: '🍔', category: 'food' },
    { name: 'Ice Cream', emoji: '🍦', category: 'food' },
    { name: 'Cake', emoji: '🎂', category: 'food' },
    { name: 'Cookie', emoji: '🍪', category: 'food' },
    { name: 'Bread', emoji: '🍞', category: 'food' },
  ],
  clothing: [
    { name: 'Shirt', emoji: '👕', category: 'clothing' },
    { name: 'Pants', emoji: '👖', category: 'clothing' },
    { name: 'Dress', emoji: '👗', category: 'clothing' },
    { name: 'Hat', emoji: '🎩', category: 'clothing' },
    { name: 'Shoes', emoji: '👟', category: 'clothing' },
    { name: 'Socks', emoji: '🧦', category: 'clothing' },
  ],
  nature: [
    { name: 'Sun', emoji: '☀️', category: 'nature' },
    { name: 'Moon', emoji: '🌙', category: 'nature' },
    { name: 'Star', emoji: '⭐', category: 'nature' },
    { name: 'Cloud', emoji: '☁️', category: 'nature' },
    { name: 'Rain', emoji: '🌧️', category: 'nature' },
    { name: 'Tree', emoji: '🌳', category: 'nature' },
  ],
};

export const CATEGORY_NAMES = Object.keys(CATEGORY_BANKS);

export function getCategoriesForLevel(level: number): string[] {
  if (level === 1) return ['fruits', 'animals', 'colors'];
  if (level === 2) return ['fruits', 'animals', 'colors', 'shapes', 'vehicles'];
  return CATEGORY_NAMES;
}

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

export function buildOddOneOutRound(
  _level: number,
  usedCategories: string[] = [],
  random: () => number = Math.random,
): OddOneOutRound {
  const availableCategories = CATEGORY_NAMES.filter((c) => !usedCategories.includes(c));
  const categoryPool = availableCategories.length > 0 ? availableCategories : CATEGORY_NAMES;
  
  const category = categoryPool[Math.floor(random() * categoryPool.length)];
  const items = CATEGORY_BANKS[category];
  
  if (!items || items.length < 4) {
    // Fallback to any category with enough items
    const fallbackCat = CATEGORY_NAMES.find((c) => CATEGORY_BANKS[c].length >= 4) || 'fruits';
    const fallbackItems = CATEGORY_BANKS[fallbackCat];
    const shuffled = [...fallbackItems].sort(() => random() - 0.5);
    const sameItems = shuffled.slice(0, 3);
    
    const differentCategories = CATEGORY_NAMES.filter((c) => c !== fallbackCat);
    const oddCategory = differentCategories[Math.floor(random() * differentCategories.length)];
    const oddPool = CATEGORY_BANKS[oddCategory];
    const oddItem = oddPool[Math.floor(random() * oddPool.length)];

    const allItems = [...sameItems, oddItem].sort(() => random() - 0.5);

    return {
      items: allItems,
      oddItem,
      category: fallbackCat,
    };
  }

  // Shuffle and pick 3 for the "same" group
  const shuffled = [...items].sort(() => random() - 0.5);
  const sameItems = shuffled.slice(0, 3);
  
  // Pick a different category's item as the odd one
  const differentCategories = CATEGORY_NAMES.filter((c) => c !== category);
  const oddCategory = differentCategories[Math.floor(random() * differentCategories.length)];
  const oddPool = CATEGORY_BANKS[oddCategory];
  const oddItem = oddPool[Math.floor(random() * oddPool.length)];

  // Combine and shuffle
  const allItems = [...sameItems, oddItem].sort(() => random() - 0.5);

  return {
    items: allItems,
    oddItem,
    category,
  };
}

export function checkAnswer(selectedItem: OddItem, oddItem: OddItem): boolean {
  return selectedItem.name === oddItem.name;
}

export function calculateScore(correct: boolean, timeUsed: number, timeLimit: number): number {
  if (!correct) return 0;
  const baseScore = 20;
  const timeBonus = Math.max(0, Math.round(((timeLimit - timeUsed) / timeLimit) * 5));
  return Math.min(25, baseScore + timeBonus);
}
