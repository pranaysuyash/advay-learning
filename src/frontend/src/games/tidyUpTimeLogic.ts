/**
 * Tidy Up Time Game Logic
 * 
 * Children organize a messy room by dragging items to their correct places.
 * Teaches categorization, responsibility, and spatial reasoning.
 * 
 * Research Insights:
 * - Responsibility and life skills development
 * - Categorization and sorting skills
 * - Spatial reasoning through object placement
 * - Timed challenges add excitement
 * 
 * Age: 3-5 years
 * Category: Everyday Life Skills
 */

export type RoomZone = 'toybox' | 'shelf' | 'hamper' | 'trash';

export interface RoomItem {
  id: string;
  name: string;
  emoji: string;
  correctZone: RoomZone;
  currentZone: RoomZone | null;
}

export interface RoomZoneInfo {
  id: RoomZone;
  name: string;
  emoji: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameState {
  items: RoomItem[];
  zones: RoomZoneInfo[];
  score: number;
  moves: number;
  timeRemaining: number;
  isComplete: boolean;
  isGameOver: boolean;
}

const ROOM_ITEMS: Omit<RoomItem, 'currentZone'>[] = [
  { id: 'teddy', name: 'Teddy Bear', emoji: '🧸', correctZone: 'toybox' },
  { id: 'ball', name: 'Ball', emoji: '⚽', correctZone: 'toybox' },
  { id: 'car', name: 'Toy Car', emoji: '🚗', correctZone: 'toybox' },
  { id: 'doll', name: 'Doll', emoji: '🎎', correctZone: 'toybox' },
  { id: 'book1', name: 'Red Book', emoji: '📕', correctZone: 'shelf' },
  { id: 'book2', name: 'Blue Book', emoji: '📘', correctZone: 'shelf' },
  { id: 'book3', name: 'Green Book', emoji: '📗', correctZone: 'shelf' },
  { id: 'shirt', name: 'Dirty Shirt', emoji: '👕', correctZone: 'hamper' },
  { id: 'socks', name: 'Dirty Socks', emoji: '🧦', correctZone: 'hamper' },
  { id: 'pants', name: 'Dirty Pants', emoji: '👖', correctZone: 'hamper' },
  { id: 'paper', name: 'Crumpled Paper', emoji: '📄', correctZone: 'trash' },
  { id: 'banana', name: 'Banana Peel', emoji: '🍌', correctZone: 'trash' },
];

const ZONES: RoomZoneInfo[] = [
  { id: 'toybox', name: 'Toy Box', emoji: '🧸', x: 20, y: 60, width: 25, height: 30 },
  { id: 'shelf', name: 'Book Shelf', emoji: '📚', x: 45, y: 20, width: 20, height: 35 },
  { id: 'hamper', name: 'Clothes Hamper', emoji: '🧺', x: 75, y: 55, width: 20, height: 35 },
  { id: 'trash', name: 'Trash Can', emoji: '🗑️', x: 75, y: 15, width: 15, height: 20 },
];

const GAME_DURATION = 60; // seconds

export function createInitialState(): GameState {
  // Shuffle items for randomness
  const shuffledItems = [...ROOM_ITEMS]
    .sort(() => Math.random() - 0.5)
    .slice(0, 8) // Use 8 items per game
    .map(item => ({ ...item, currentZone: null }));

  return {
    items: shuffledItems,
    zones: [...ZONES],
    score: 0,
    moves: 0,
    timeRemaining: GAME_DURATION,
    isComplete: false,
    isGameOver: false,
  };
}

export function moveItem(
  state: GameState,
  itemId: string,
  targetZone: RoomZone
): GameState {
  const itemIndex = state.items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return state;

  const item = state.items[itemIndex];
  const isCorrect = item.correctZone === targetZone;

  // Update item position
  const newItems = [...state.items];
  newItems[itemIndex] = { ...item, currentZone: targetZone };

  // Calculate score
  const scoreIncrease = isCorrect ? 100 : 25;
  const newScore = state.score + scoreIncrease;

  // Check if all items are correctly placed
  const allCorrect = newItems.every(i => i.currentZone === i.correctZone);

  return {
    ...state,
    items: newItems,
    score: newScore,
    moves: state.moves + 1,
    isComplete: allCorrect,
  };
}

export function tickTimer(state: GameState): GameState {
  if (state.isComplete || state.isGameOver) return state;

  const newTime = state.timeRemaining - 1;
  const isGameOver = newTime <= 0;

  return {
    ...state,
    timeRemaining: Math.max(0, newTime),
    isGameOver,
  };
}

export function getItemsInZone(items: RoomItem[], zone: RoomZone): RoomItem[] {
  return items.filter(item => item.currentZone === zone);
}

export function getUnplacedItems(items: RoomItem[]): RoomItem[] {
  return items.filter(item => item.currentZone === null);
}

export function getPlacedItems(items: RoomItem[]): RoomItem[] {
  return items.filter(item => item.currentZone !== null);
}

export function getCorrectlyPlacedCount(items: RoomItem[]): number {
  return items.filter(item => item.currentZone === item.correctZone).length;
}

export function getAccuracy(state: GameState): number {
  if (state.moves === 0) return 0;
  const correct = getCorrectlyPlacedCount(state.items);
  return Math.round((correct / state.items.length) * 100);
}

export function getStarRating(state: GameState): number {
  const accuracy = getAccuracy(state);
  if (accuracy >= 90) return 3;
  if (accuracy >= 70) return 2;
  if (accuracy >= 50) return 1;
  return 0;
}
