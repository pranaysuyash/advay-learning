/**
 * Farm Friends Game Logic
 *
 * Children feed animals the correct food by dragging food to animals.
 */

export type AnimalType = 'cow' | 'pig' | 'chicken' | 'dog' | 'cat' | 'sheep';

export interface Animal {
  id: string;
  emoji: string;
  name: string;
  type: AnimalType;
  likes: string[];
  color: string;
}

export interface FoodItem {
  id: string;
  emoji: string;
  name: string;
  category: string;
}

export const ANIMALS: Animal[] = [
  { id: 'cow', emoji: '🐄', name: 'Cow', type: 'cow', likes: ['grass', 'hay'], color: '#F5F5DC' },
  { id: 'pig', emoji: '🐷', name: 'Pig', type: 'pig', likes: ['apple', 'carrot'], color: '#FFB6C1' },
  { id: 'chicken', emoji: '🐔', name: 'Chicken', type: 'chicken', likes: ['seed', 'grain'], color: '#FFD700' },
  { id: 'dog', emoji: '🐕', name: 'Dog', type: 'dog', likes: ['bone', 'meat'], color: '#D2691E' },
  { id: 'cat', emoji: '🐱', name: 'Cat', type: 'cat', likes: ['fish', 'milk'], color: '#FFA500' },
  { id: 'sheep', emoji: '🐑', name: 'Sheep', type: 'sheep', likes: ['grass', 'hay'], color: '#F5F5F5' },
];

export const FOODS: FoodItem[] = [
  { id: 'grass', emoji: '🌿', name: 'Grass', category: 'grass' },
  { id: 'hay', emoji: '🌾', name: 'Hay', category: 'hay' },
  { id: 'apple', emoji: '🍎', name: 'Apple', category: 'apple' },
  { id: 'carrot', emoji: '🥕', name: 'Carrot', category: 'carrot' },
  { id: 'seed', emoji: '🌱', name: 'Seeds', category: 'seed' },
  { id: 'grain', emoji: '🌾', name: 'Grain', category: 'grain' },
  { id: 'bone', emoji: '🦴', name: 'Bone', category: 'bone' },
  { id: 'meat', emoji: '🥩', name: 'Meat', category: 'meat' },
  { id: 'fish', emoji: '🐟', name: 'Fish', category: 'fish' },
  { id: 'milk', emoji: '🥛', name: 'Milk', category: 'milk' },
];

export interface GameState {
  currentAnimal: Animal | null;
  fedCount: number;
  mistakes: number;
  score: number;
  isComplete: boolean;
  isPlaying: boolean;
}

export function createInitialState(): GameState {
  return {
    currentAnimal: null,
    fedCount: 0,
    mistakes: 0,
    score: 0,
    isComplete: false,
    isPlaying: false,
  };
}

export function getRandomAnimal(): Animal {
  return ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
}

export function getCorrectFoods(animal: Animal): FoodItem[] {
  return FOODS.filter(f => animal.likes.includes(f.category));
}

export function getAllFoods(): FoodItem[] {
  return [...FOODS].sort(() => Math.random() - 0.5);
}

export function isFoodCorrect(animal: Animal, food: FoodItem): boolean {
  return animal.likes.includes(food.category);
}

export function calculateScore(correct: number, mistakes: number): number {
  return correct * 25 - mistakes * 10;
}

export function calculateStars(score: number): number {
  if (score >= 100) return 5;
  if (score >= 80) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  return 1;
}
