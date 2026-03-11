/**
 * Pack Lunchbox Game Logic
 *
 * Children pack a healthy lunchbox by dragging foods into categories:
 * - Fruit
 * - Vegetable  
 * - Protein
 * - Treat (limited)
 *
 * Goal: One of each healthy food + max 1 treat = balanced lunch!
 */

export type FoodCategory = 'fruit' | 'vegetable' | 'protein' | 'treat';

export interface FoodItem {
  id: string;
  emoji: string;
  name: string;
  category: FoodCategory;
  color: string;
}

export interface GameLevel {
  id: number;
  name: string;
  description: string;
  targetBasket: FoodCategory[];
}

export const FOOD_ITEMS: FoodItem[] = [
  { id: 'apple', emoji: '🍎', name: 'Apple', category: 'fruit', color: '#FF6B6B' },
  { id: 'banana', emoji: '🍌', name: 'Banana', category: 'fruit', color: '#FFE066' },
  { id: 'grapes', emoji: '🍇', name: 'Grapes', category: 'fruit', color: '#9B59B6' },
  { id: 'orange', emoji: '🍊', name: 'Orange', category: 'fruit', color: '#FFA502' },
  { id: 'strawberry', emoji: '🍓', name: 'Strawberry', category: 'fruit', color: '#EE5A5A' },
  
  { id: 'carrot', emoji: '🥕', name: 'Carrot', category: 'vegetable', color: '#FF7F50' },
  { id: 'broccoli', emoji: '🥦', name: 'Broccoli', category: 'vegetable', color: '#2ECC71' },
  { id: 'corn', emoji: '🌽', name: 'Corn', category: 'vegetable', color: '#F1C40F' },
  { id: 'cucumber', emoji: '🥒', name: 'Cucumber', category: 'vegetable', color: '#27AE60' },
  { id: 'tomato', emoji: '🍅', name: 'Tomato', category: 'vegetable', color: '#E74C3C' },
  
  { id: 'chicken', emoji: '🍗', name: 'Chicken', category: 'protein', color: '#D35400' },
  { id: 'egg', emoji: '🥚', name: 'Egg', category: 'protein', color: '#F5DEB3' },
  { id: 'fish', emoji: '🐟', name: 'Fish', category: 'protein', color: '#3498DB' },
  { id: 'beans', emoji: '🫘', name: 'Beans', category: 'protein', color: '#8B4513' },
  { id: 'cheese', emoji: '🧀', name: 'Cheese', category: 'protein', color: '#F39C12' },
  
  { id: 'cookie', emoji: '🍪', name: 'Cookie', category: 'treat', color: '#D2691E' },
  { id: 'candy', emoji: '🍬', name: 'Candy', category: 'treat', color: '#FF69B4' },
  { id: 'chocolate', emoji: '🍫', name: 'Chocolate', category: 'treat', color: '#5D4037' },
  { id: 'icecream', emoji: '🍦', name: 'Ice Cream', category: 'treat', color: '#FFB6C1' },
  { id: 'cake', emoji: '🍰', name: 'Cake', category: 'treat', color: '#DEB887' },
];

export const CATEGORY_INFO: Record<FoodCategory, { emoji: string; name: string; color: string }> = {
  fruit: { emoji: '🍎', name: 'Fruit', color: '#FF6B6B' },
  vegetable: { emoji: '🥦', name: 'Vegetable', color: '#2ECC71' },
  protein: { emoji: '🍗', name: 'Protein', color: '#D35400' },
  treat: { emoji: '🍪', name: 'Treat', color: '#9B59B6' },
};

export interface GameState {
  currentLevel: number;
  foodsInLunchbox: FoodItem[];
  availableFoods: FoodItem[];
  score: number;
  stars: number;
  isComplete: boolean;
  isPlaying: boolean;
}

export function createInitialState(): GameState {
  return {
    currentLevel: 1,
    foodsInLunchbox: [],
    availableFoods: [],
    score: 0,
    stars: 0,
    isComplete: false,
    isPlaying: false,
  };
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getFoodsForLevel(level: number): FoodItem[] {
  const allFoods = FOOD_ITEMS;

  if (level === 1) {
    return shuffleArray(allFoods.filter(f => f.category !== 'treat')).slice(0, 6);
  } else if (level === 2) {
    return shuffleArray(allFoods.filter(f => f.category !== 'treat')).slice(0, 8);
  } else {
    // Level 3: ensure at least 2 treats are always included
    const treats = shuffleArray(allFoods.filter(f => f.category === 'treat')).slice(0, 2);
    const nonTreats = shuffleArray(allFoods.filter(f => f.category !== 'treat')).slice(0, 8);
    return shuffleArray([...treats, ...nonTreats]);
  }
}

export interface LunchboxResult {
  fruits: number;
  vegetables: number;
  proteins: number;
  treats: number;
  isBalanced: boolean;
}

export function evaluateLunchbox(foods: FoodItem[]): LunchboxResult {
  const result: LunchboxResult = {
    fruits: 0,
    vegetables: 0,
    proteins: 0,
    treats: 0,
    isBalanced: false,
  };
  
  for (const food of foods) {
    if (food.category === 'fruit') result.fruits++;
    else if (food.category === 'vegetable') result.vegetables++;
    else if (food.category === 'protein') result.proteins++;
    else if (food.category === 'treat') result.treats++;
  }
  
  result.isBalanced = result.fruits >= 1 && result.vegetables >= 1 && result.proteins >= 1 && result.treats <= 1;
  
  return result;
}

export function calculateScore(foods: FoodItem[]): number {
  const result = evaluateLunchbox(foods);
  let score = 0;
  
  score += result.fruits * 15;
  score += result.vegetables * 20;
  score += result.proteins * 20;
  
  if (result.treats === 0) score += 20;
  else if (result.treats === 1) score += 10;
  else score -= result.treats * 10;
  
  if (result.isBalanced) score += 30;
  
  return Math.max(0, score);
}

export function calculateStars(score: number): number {
  if (score >= 120) return 5;
  if (score >= 100) return 4;
  if (score >= 80) return 3;
  if (score >= 50) return 2;
  return 1;
}
