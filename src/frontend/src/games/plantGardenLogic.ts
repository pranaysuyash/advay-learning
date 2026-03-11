/**
 * Plant a Garden Game Logic
 *
 * Children grow plants by completing the right sequence:
 * 1. Dig a hole
 * 2. Plant a seed
 * 3. Water it
 * 4. Watch it grow!
 */

export type PlantType = 'flower' | 'vegetable' | 'fruit';
export type GardenStep = 'dig' | 'plant' | 'water' | 'grow';

export interface Plant {
  id: string;
  emoji: string;
  name: string;
  type: PlantType;
  color: string;
}

export interface GardenStage {
  step: GardenStep;
  emoji: string;
  instruction: string;
}

export const PLANTS: Plant[] = [
  { id: 'sunflower', emoji: '🌻', name: 'Sunflower', type: 'flower', color: '#FFD700' },
  { id: 'rose', emoji: '🌹', name: 'Rose', type: 'flower', color: '#FF4444' },
  { id: 'tulip', emoji: '🌷', name: 'Tulip', type: 'flower', color: '#FF69B4' },
  { id: 'carrot', emoji: '🥕', name: 'Carrot', type: 'vegetable', color: '#FF7F50' },
  { id: 'tomato', emoji: '🍅', name: 'Tomato', type: 'vegetable', color: '#FF6347' },
  { id: 'corn', emoji: '🌽', name: 'Corn', type: 'vegetable', color: '#FFD93D' },
  { id: 'apple', emoji: '🍎', name: 'Apple Tree', type: 'fruit', color: '#FF6B6B' },
  { id: 'lemon', emoji: '🍋', name: 'Lemon Tree', type: 'fruit', color: '#FFE066' },
];

export const GARDEN_STEPS: GardenStage[] = [
  { step: 'dig', emoji: '⛏️', instruction: 'Dig a hole in the soil!' },
  { step: 'plant', emoji: '🌱', instruction: 'Plant the seed!' },
  { step: 'water', emoji: '💧', instruction: 'Water the seed!' },
  { step: 'grow', emoji: '🌿', instruction: 'Watch it grow!' },
];

export interface GameState {
  currentPlant: Plant | null;
  currentStep: number;
  completedStages: number;
  score: number;
  isComplete: boolean;
  isPlaying: boolean;
}

export function createInitialState(): GameState {
  return {
    currentPlant: null,
    currentStep: 0,
    completedStages: 0,
    score: 0,
    isComplete: false,
    isPlaying: false,
  };
}

export function getRandomPlant(): Plant {
  return PLANTS[Math.floor(Math.random() * PLANTS.length)];
}

export function getCurrentStage(step: number): GardenStage {
  return GARDEN_STEPS[Math.min(step, GARDEN_STEPS.length - 1)];
}

export function calculateScore(steps: number): number {
  const baseScore = 100;
  const stepBonus = steps * 25;
  return baseScore + stepBonus;
}

export function calculateStars(score: number): number {
  if (score >= 200) return 5;
  if (score >= 175) return 4;
  if (score >= 150) return 3;
  if (score >= 125) return 2;
  return 1;
}
