/**
 * Taste Match Game Logic
 *
 * Children match foods to their taste: sweet, salty, or sour.
 */

export type TasteCategory = 'sweet' | 'salty' | 'sour';

export interface FoodTaste {
  id: string;
  emoji: string;
  name: string;
  category: TasteCategory;
  color: string;
}

export const TASTE_FOODS: FoodTaste[] = [
  { id: 'candy', emoji: '🍬', name: 'Candy', category: 'sweet', color: '#FF69B4' },
  { id: 'cake', emoji: '🍰', name: 'Cake', category: 'sweet', color: '#FFB6C1' },
  { id: 'cookie', emoji: '🍪', name: 'Cookie', category: 'sweet', color: '#D2691E' },
  { id: 'icecream', emoji: '🍦', name: 'Ice Cream', category: 'sweet', color: '#FFE4B5' },
  { id: 'apple', emoji: '🍎', name: 'Apple', category: 'sweet', color: '#FF6B6B' },
  
  { id: 'chips', emoji: '🥔', name: 'Chips', category: 'salty', color: '#FFD700' },
  { id: 'nuts', emoji: '🥜', name: 'Nuts', category: 'salty', color: '#8B4513' },
  { id: 'pretzel', emoji: '🥨', name: 'Pretzel', category: 'salty', color: '#DEB887' },
  { id: 'popcorn', emoji: '🍿', name: 'Popcorn', category: 'salty', color: '#FFA500' },
  { id: 'cheese', emoji: '🧀', name: 'Cheese', category: 'salty', color: '#F39C12' },
  
  { id: 'lemon', emoji: '🍋', name: 'Lemon', category: 'sour', color: '#FFE066' },
  { id: 'grapefruit', emoji: '🍊', name: 'Grapefruit', category: 'sour', color: '#FFA500' },
  { id: 'pickle', emoji: '🥒', name: 'Pickle', category: 'sour', color: '#32CD32' },
  { id: 'yogurt', emoji: '🥛', name: 'Yogurt', category: 'sour', color: '#F5F5F5' },
  { id: 'tomato', emoji: '🍅', name: 'Tomato', category: 'sour', color: '#FF6347' },
];

export const TASTE_ZONES: Record<TasteCategory, { emoji: string; name: string; color: string }> = {
  sweet: { emoji: '🍬', name: 'Sweet', color: '#FF69B4' },
  salty: { emoji: '🧂', name: 'Salty', color: '#FFD700' },
  sour: { emoji: '🍋', name: 'Sour', color: '#FFE066' },
};

export interface GameState {
  currentTarget: TasteCategory | null;
  matched: number;
  score: number;
  isPlaying: boolean;
}

export function createInitialState(): GameState {
  return {
    currentTarget: null,
    matched: 0,
    score: 0,
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

export function getFoodsForLevel(level: number): FoodTaste[] {
  if (level === 1) {
    return shuffleArray(TASTE_FOODS.filter(f => ['candy', 'chips', 'lemon'].includes(f.id)));
  } else if (level === 2) {
    return shuffleArray(TASTE_FOODS.filter(f => !['grapefruit', 'pickle', 'yogurt'].includes(f.id)));
  } else {
    return shuffleArray(TASTE_FOODS).slice(0, 12);
  }
}

export function calculateScore(correct: number): number {
  return correct * 20;
}

export function calculateStars(correct: number): number {
  if (correct >= 10) return 5;
  if (correct >= 8) return 4;
  if (correct >= 6) return 3;
  if (correct >= 4) return 2;
  return 1;
}
