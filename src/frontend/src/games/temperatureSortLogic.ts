/**
 * Temperature Sort Game Logic
 *
 * Children sort items by temperature: hot, warm, or cold.
 */

export type TemperatureCategory = 'hot' | 'warm' | 'cold';

export interface TemperatureItem {
  id: string;
  emoji: string;
  name: string;
  category: TemperatureCategory;
  color: string;
}

export const TEMPERATURE_ITEMS: TemperatureItem[] = [
  { id: 'sun', emoji: '☀️', name: 'Sun', category: 'hot', color: '#FF6B35' },
  { id: 'fire', emoji: '🔥', name: 'Fire', category: 'hot', color: '#FF4500' },
  { id: 'stove', emoji: '🍳', name: 'Hot Stove', category: 'hot', color: '#FF6347' },
  { id: 'soup', emoji: '🍲', name: 'Hot Soup', category: 'hot', color: '#FF7F50' },
  { id: 'coffee', emoji: '☕', name: 'Hot Coffee', category: 'hot', color: '#8B4513' },
  
  { id: 'weather', emoji: '🌤️', name: 'Warm Day', category: 'warm', color: '#FFD93D' },
  { id: 'bath', emoji: '🛁', name: 'Warm Bath', category: 'warm', color: '#FFB6C1' },
  { id: 'bread', emoji: '🍞', name: 'Fresh Bread', category: 'warm', color: '#DEB887' },
  { id: 'bed', emoji: '🛏️', name: 'Warm Bed', category: 'warm', color: '#F5DEB3' },
  { id: 'puppy', emoji: '🐕', name: 'Warm Puppy', category: 'warm', color: '#D2691E' },
  
  { id: 'snow', emoji: '❄️', name: 'Snow', category: 'cold', color: '#87CEEB' },
  { id: 'icecream', emoji: '🍦', name: 'Ice Cream', category: 'cold', color: '#FFB6C1' },
  { id: 'ice', emoji: '🧊', name: 'Ice Cube', category: 'cold', color: '#ADD8E6' },
  { id: 'snowman', emoji: '⛄', name: 'Snowman', category: 'cold', color: '#F0F8FF' },
  { id: 'drink', emoji: '🥤', name: 'Cold Drink', category: 'cold', color: '#00CED1' },
];

export const TEMPERATURE_ZONES: Record<TemperatureCategory, { emoji: string; name: string; color: string }> = {
  hot: { emoji: '☀️', name: 'Hot', color: '#FF4444' },
  warm: { emoji: '🌤️', name: 'Warm', color: '#FFBB33' },
  cold: { emoji: '❄️', name: 'Cold', color: '#33BBFF' },
};

export interface GameState {
  currentLevel: number;
  sortedItems: TemperatureItem[];
  availableItems: TemperatureItem[];
  score: number;
  stars: number;
  isComplete: boolean;
  isPlaying: boolean;
}

export function createInitialState(): GameState {
  return {
    currentLevel: 1,
    sortedItems: [],
    availableItems: [],
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

export function getItemsForLevel(level: number): TemperatureItem[] {
  if (level === 1) {
    return shuffleArray(TEMPERATURE_ITEMS.filter(i => ['sun', 'snow', 'icecream'].includes(i.id)));
  } else if (level === 2) {
    return shuffleArray(TEMPERATURE_ITEMS.filter(i => !['coffee', 'puppy', 'drink'].includes(i.id)));
  } else {
    return shuffleArray(TEMPERATURE_ITEMS).slice(0, 9);
  }
}

export interface SortResult {
  hot: number;
  warm: number;
  cold: number;
  correct: number;
  total: number;
}

export function evaluateSorting(sorted: TemperatureItem[]): SortResult {
  const result: SortResult = { hot: 0, warm: 0, cold: 0, correct: 0, total: sorted.length };
  
  for (const item of sorted) {
    result[item.category]++;
  }
  
  result.correct = sorted.length;
  return result;
}

export function calculateScore(correct: number, total: number): number {
  const baseScore = correct * 20;
  const bonus = total >= 6 ? 30 : 0;
  return baseScore + bonus;
}

export function calculateStars(score: number, total: number): number {
  const cappedScore = Math.min(score, total * 20);
  const accuracy = total > 0 ? cappedScore / (total * 20) : 0;
  if (accuracy >= 1 && total >= 6) return 5;
  if (accuracy >= 0.8) return 4;
  if (accuracy >= 0.6) return 3;
  if (accuracy >= 0.4) return 2;
  return 1;
}
