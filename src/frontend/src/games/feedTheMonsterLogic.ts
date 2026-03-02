/**
 * Feed the Monster game logic — match food to monster's emotion.
 */

export interface FoodItem {
  id: number;
  emoji: string;
  name: string;
  category: 'happy' | 'sad' | 'angry' | 'excited' | 'calm';
}

export interface MonsterEmotion {
  id: number;
  emotion: FoodItem['category'];
  emoji: string;
  prompt: string;
}

export interface LevelConfig {
  level: number;
  optionsCount: number;
}

export const FOODS: FoodItem[] = [
  { id: 1, emoji: '🍕', name: 'Pizza', category: 'happy' },
  { id: 2, emoji: '🥕', name: 'Carrot', category: 'happy' },
  { id: 3, emoji: '🍦', name: 'Ice Cream', category: 'happy' },
  { id: 4, emoji: '😢', name: 'Tissues', category: 'sad' },
  { id: 5, emoji: '🧸', name: 'Teddy Bear', category: 'sad' },
  { id: 6, emoji: '☕', name: 'Hot Cocoa', category: 'calm' },
  { id: 7, emoji: '🍵', name: 'Tea', category: 'calm' },
  { id: 8, emoji: '⚡', name: 'Energy Drink', category: 'excited' },
  { id: 9, emoji: '🍬', name: 'Candy', category: 'excited' },
  { id: 10, emoji: '🌶️', name: 'Hot Pepper', category: 'angry' },
  { id: 11, emoji: '🍋', name: 'Lemon', category: 'angry' },
];

export const MONSTER_EMOTIONS: MonsterEmotion[] = [
  { id: 1, emotion: 'happy', emoji: '😄', prompt: 'Yummy!' },
  { id: 2, emotion: 'sad', emoji: '😢', prompt: 'I need comfort food...' },
  { id: 3, emotion: 'calm', emoji: '😌', prompt: 'So peaceful...' },
  { id: 4, emotion: 'excited', emoji: '🤩', prompt: 'Wow! So exciting!' },
  { id: 5, emotion: 'angry', emoji: '😠', prompt: 'Too spicy!' },
];

export const LEVELS: LevelConfig[] = [
  { level: 1, optionsCount: 3 },
  { level: 2, optionsCount: 4 },
  { level: 3, optionsCount: 5 },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find(l => l.level === level) ?? LEVELS[0];
}

export function getEmotionForLevel(level: number): MonsterEmotion {
  const emotionsForLevel = MONSTER_EMOTIONS.slice(0, Math.min(2 + level, MONSTER_EMOTIONS.length));
  return emotionsForLevel[Math.floor(Math.random() * emotionsForLevel.length)];
}

export function generateOptions(emotion: FoodItem['category'], level: number): FoodItem[] {
  const config = getLevelConfig(level);
  const matchingFoods = FOODS.filter(f => f.category === emotion);
  const otherFoods = FOODS.filter(f => f.category !== emotion);

  const selected: FoodItem[] = [];

  if (matchingFoods.length > 0) {
    const correct = matchingFoods[Math.floor(Math.random() * matchingFoods.length)];
    selected.push(correct);
  }

  const shuffledOthers = otherFoods.sort(() => Math.random() - 0.5);
  for (const food of shuffledOthers) {
    if (selected.length >= config.optionsCount) break;
    if (!selected.find(f => f.id === food.id)) {
      selected.push(food);
    }
  }

  return selected.sort(() => Math.random() - 0.5);
}

export function checkAnswer(selectedFood: FoodItem, correctEmotion: FoodItem['category']): boolean {
  return selectedFood.category === correctEmotion;
}

export function calculateScore(isCorrect: boolean, timeLeft: number, combo: number): number {
  if (isCorrect) {
    return 100 + timeLeft * 5 + combo * 10;
  }
  return 0;
}
