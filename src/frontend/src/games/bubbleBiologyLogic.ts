/**
 * Bubble Biology Game Logic
 *
 * Simple cell sorting game where players pinch to grab cells
 * and drop them into matching jars.
 *
 * Educational Focus:
 * - Basic biology vocabulary (cells, organisms)
 * - Classification skills
 * - Fine motor control (pinch gesture)
 */

export interface Cell {
  id: number;
  type: CellType;
  x: number;
  y: number;
  radius: number;
  speed: number;
  isGrabbed: boolean;
}

export interface CellType {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
}

export interface Jar {
  id: string;
  type: CellType;
  x: number;
  y: number;
  width: number;
  height: number;
  fillLevel: number;
  maxCapacity: number;
}

export interface GameState {
  score: number;
  level: number;
  cellsSorted: number;
  cellsMissed: number;
  currentCells: Cell[];
  jars: Jar[];
  isPlaying: boolean;
  grabbedCell: Cell | null;
}

export const CELL_TYPES: CellType[] = [
  {
    id: 'plant',
    name: 'Plant Cell',
    emoji: '🌱',
    color: '#22C55E',
    description: 'Has a cell wall!',
  },
  {
    id: 'animal',
    name: 'Animal Cell',
    emoji: '🦠',
    color: '#3B82F6',
    description: 'Flexible membrane!',
  },
  {
    id: 'bacteria',
    name: 'Bacteria',
    emoji: '🔴',
    color: '#EF4444',
    description: 'Single-celled organism!',
  },
];

export const LEVEL_CONFIG = {
  1: {
    cellSpeed: 0.5,
    spawnRate: 3000,
    jarCapacity: 5,
    cellRadius: 40,
  },
  2: {
    cellSpeed: 0.8,
    spawnRate: 2500,
    jarCapacity: 7,
    cellRadius: 35,
  },
  3: {
    cellSpeed: 1.0,
    spawnRate: 2000,
    jarCapacity: 10,
    cellRadius: 30,
  },
} as const;

export type DifficultyLevel = keyof typeof LEVEL_CONFIG;

function getLevelConfig(level: number) {
  return LEVEL_CONFIG[(level as DifficultyLevel) in LEVEL_CONFIG ? (level as DifficultyLevel) : 1];
}

export function initializeGame(level: number = 1): GameState {
  const config = getLevelConfig(level);
  
  const jars: Jar[] = CELL_TYPES.map((type, index) => ({
    id: type.id,
    type,
    x: 0.2 + (index * 0.3),
    y: 0.85,
    width: 0.15,
    height: 0.12,
    fillLevel: 0,
    maxCapacity: config.jarCapacity,
  }));
  
  return {
    score: 0,
    level,
    cellsSorted: 0,
    cellsMissed: 0,
    currentCells: [],
    jars,
    isPlaying: false,
    grabbedCell: null,
  };
}

export function spawnCell(
  canvasWidth: number,
  level: number = 1,
  random: () => number = Math.random
): Cell {
  const config = getLevelConfig(level);
  const cellType = CELL_TYPES[Math.floor(random() * CELL_TYPES.length)];
  
  return {
    id: Date.now() + Math.random(),
    type: cellType,
    x: random() * (canvasWidth - config.cellRadius * 2) + config.cellRadius,
    y: -config.cellRadius,
    radius: config.cellRadius,
    speed: config.cellSpeed,
    isGrabbed: false,
  };
}

export function updateCells(
  cells: Cell[],
  deltaTime: number,
  canvasHeight: number
): { updatedCells: Cell[]; missedCount: number } {
  // Each cell carries its own speed from spawnCell — no config lookup needed here
  let missedCount = 0;
  
  const updatedCells = cells
    .map(cell => {
      if (cell.isGrabbed) return cell;
      
      const newY = cell.y + cell.speed * deltaTime;
      
      if (newY > canvasHeight + cell.radius) {
        missedCount++;
        return null;
      }
      
      return { ...cell, y: newY };
    })
    .filter((cell): cell is Cell => cell !== null);
  
  return { updatedCells, missedCount };
}

export function checkJarCollision(
  cell: Cell,
  jars: Jar[],
  canvasWidth: number,
  canvasHeight: number
): { jar: Jar | null; isCorrect: boolean } {
  for (const jar of jars) {
    const jarX = jar.x * canvasWidth;
    const jarY = jar.y * canvasHeight;
    const jarWidth = jar.width * canvasWidth;
    const jarHeight = jar.height * canvasHeight;
    
    const cellInJar =
      cell.x > jarX &&
      cell.x < jarX + jarWidth &&
      cell.y > jarY &&
      cell.y < jarY + jarHeight;
    
    if (cellInJar) {
      return {
        jar,
        isCorrect: cell.type.id === jar.type.id,
      };
    }
  }
  
  return { jar: null, isCorrect: false };
}

export function calculateScore(
  isCorrect: boolean,
  level: number,
  streak: number
): number {
  if (!isCorrect) return -5;
  
  const baseScore = 10;
  const levelBonus = level * 2;
  const streakBonus = Math.min(streak * 2, 20);
  
  return baseScore + levelBonus + streakBonus;
}

export function grabCell(
  cells: Cell[],
  pointX: number,
  pointY: number
): { updatedCells: Cell[]; grabbedCell: Cell | null } {
  for (const cell of cells) {
    const distance = Math.sqrt(
      Math.pow(cell.x - pointX, 2) + Math.pow(cell.y - pointY, 2)
    );
    
    if (distance < cell.radius && !cell.isGrabbed) {
      const updatedCells = cells.map(c =>
        c.id === cell.id ? { ...c, isGrabbed: true } : c
      );
      
      return {
        updatedCells,
        grabbedCell: { ...cell, isGrabbed: true },
      };
    }
  }
  
  return { updatedCells: cells, grabbedCell: null };
}

export function releaseCell(
  cell: Cell,
  pointX: number,
  pointY: number
): Cell {
  return {
    ...cell,
    x: pointX,
    y: pointY,
    isGrabbed: false,
  };
}

export function updateJarFill(jar: Jar, amount: number = 1): Jar {
  return {
    ...jar,
    fillLevel: Math.min(jar.fillLevel + amount, jar.maxCapacity),
  };
}

export function isLevelComplete(jars: Jar[]): boolean {
  return jars.every(jar => jar.fillLevel >= jar.maxCapacity);
}

export function getCellAtPoint(
  cells: Cell[],
  pointX: number,
  pointY: number
): Cell | null {
  for (const cell of cells) {
    const distance = Math.sqrt(
      Math.pow(cell.x - pointX, 2) + Math.pow(cell.y - pointY, 2)
    );
    
    if (distance < cell.radius) {
      return cell;
    }
  }
  
  return null;
}
