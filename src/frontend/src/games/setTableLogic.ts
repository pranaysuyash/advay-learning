/**
 * Set the Table Game Logic
 *
 * Children learn to set a table by dragging utensils to correct positions.
 * Learn left/right placement, counting, and table manners.
 */

export type UtensilPosition = 'left' | 'right' | 'center';

export interface UtensilItem {
  id: string;
  emoji: string;
  name: string;
  position: UtensilPosition;
  color: string;
}

export interface TableSpot {
  id: string;
  position: UtensilPosition;
  accepts: UtensilPosition;
  x: number;
  y: number;
}

export const UTENSIL_ITEMS: UtensilItem[] = [
  { id: 'plate', emoji: '🍽️', name: 'Plate', position: 'center', color: '#E8E8E8' },
  { id: 'fork', emoji: '🍴', name: 'Fork', position: 'left', color: '#C0C0C0' },
  { id: 'knife', emoji: '🔪', name: 'Knife', position: 'right', color: '#C0C0C0' },
  { id: 'spoon', emoji: '🥄', name: 'Spoon', position: 'right', color: '#C0C0C0' },
  { id: 'cup', emoji: '🥛', name: 'Cup', position: 'right', color: '#87CEEB' },
  { id: 'napkin', emoji: '🧻', name: 'Napkin', position: 'left', color: '#FFFFFF' },
];

export interface GameState {
  currentLevel: number;
  placedItems: UtensilItem[];
  availableItems: UtensilItem[];
  score: number;
  stars: number;
  isComplete: boolean;
  isPlaying: boolean;
}

export function createInitialState(): GameState {
  return {
    currentLevel: 1,
    placedItems: [],
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

export function getUtensilsForLevel(level: number): UtensilItem[] {
  if (level === 1) {
    return shuffleArray(UTENSIL_ITEMS.filter(u => ['plate', 'fork', 'knife'].includes(u.id)));
  } else if (level === 2) {
    return shuffleArray(UTENSIL_ITEMS.filter(u => !['napkin'].includes(u.id)));
  } else {
    return shuffleArray(UTENSIL_ITEMS);
  }
}

export interface TableResult {
  correct: number;
  total: number;
  isCorrect: boolean;
}

export function evaluateTable(placed: UtensilItem[]): TableResult {
  let correct = 0;
  for (const item of placed) {
    if (item.position === 'center') {
      if (placed.some(p => p.id === 'plate' && p.id === item.id)) correct++;
    } else {
      correct++;
    }
  }
  return {
    correct,
    total: placed.length,
    isCorrect: correct === placed.length && placed.length >= 3,
  };
}

export function calculateScore(placed: UtensilItem[], attempts: number): number {
  const result = evaluateTable(placed);
  let score = result.correct * 30;
  
  if (result.isCorrect) score += 50;
  
  const attemptPenalty = Math.max(0, (attempts - 1) * 10);
  return Math.max(10, score - attemptPenalty);
}

export function calculateStars(score: number): number {
  if (score >= 150) return 5;
  if (score >= 120) return 4;
  if (score >= 90) return 3;
  if (score >= 60) return 2;
  return 1;
}
