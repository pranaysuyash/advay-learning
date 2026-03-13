/**
 * Logic Box Push Game Logic
 *
 * Sokoban-style puzzle game for ages 6-10
 * @ticket LOGIC-BOX-PUSH
 */

export type CellType = 'empty' | 'wall' | 'box' | 'target' | 'box-on-target' | 'player';

export interface Level {
  id: string;
  name: string;
  width: number;
  height: number;
  grid: CellType[][];
  playerStart: { x: number; y: number };
  movesLimit?: number;
}

export interface GameState {
  status: 'menu' | 'playing' | 'success' | 'failure';
  currentLevelId: string | null;
  grid: CellType[][];
  playerPos: { x: number; y: number };
  moves: number;
  pushes: number;
  score: number;
  timeElapsed: number;
}

export const LEVELS: Level[] = [
  {
    id: 'tutorial',
    name: 'First Steps',
    width: 5,
    height: 5,
    grid: [
      ['wall', 'wall', 'wall', 'wall', 'wall'],
      ['wall', 'empty', 'empty', 'empty', 'wall'],
      ['wall', 'box', 'empty', 'target', 'wall'],
      ['wall', 'empty', 'empty', 'empty', 'wall'],
      ['wall', 'wall', 'wall', 'wall', 'wall'],
    ],
    playerStart: { x: 1, y: 1 },
  },
  {
    id: 'beginner',
    name: 'Push It!',
    width: 6,
    height: 6,
    grid: [
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
      ['wall', 'empty', 'empty', 'empty', 'empty', 'wall'],
      ['wall', 'box', 'empty', 'box', 'target', 'wall'],
      ['wall', 'empty', 'wall', 'empty', 'target', 'wall'],
      ['wall', 'empty', 'empty', 'empty', 'empty', 'wall'],
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
    ],
    playerStart: { x: 1, y: 1 },
    movesLimit: 30,
  },
  {
    id: 'intermediate',
    name: 'Corners',
    width: 7,
    height: 7,
    grid: [
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
      ['wall', 'target', 'empty', 'empty', 'empty', 'empty', 'wall'],
      ['wall', 'empty', 'wall', 'box', 'wall', 'empty', 'wall'],
      ['wall', 'empty', 'empty', 'empty', 'box', 'empty', 'wall'],
      ['wall', 'empty', 'wall', 'empty', 'wall', 'target', 'wall'],
      ['wall', 'empty', 'empty', 'empty', 'empty', 'empty', 'wall'],
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
    ],
    playerStart: { x: 1, y: 5 },
    movesLimit: 50,
  },
  {
    id: 'advanced',
    name: 'Master Puzzle',
    width: 8,
    height: 8,
    grid: [
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
      ['wall', 'target', 'empty', 'empty', 'wall', 'empty', 'target', 'wall'],
      ['wall', 'empty', 'wall', 'box', 'empty', 'box', 'empty', 'wall'],
      ['wall', 'empty', 'empty', 'empty', 'wall', 'empty', 'empty', 'wall'],
      ['wall', 'wall', 'box', 'empty', 'box', 'empty', 'wall', 'wall'],
      ['wall', 'target', 'empty', 'wall', 'empty', 'empty', 'target', 'wall'],
      ['wall', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'wall'],
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
    ],
    playerStart: { x: 1, y: 6 },
    movesLimit: 80,
  },
];

export function createInitialState(): GameState {
  return {
    status: 'menu',
    currentLevelId: null,
    grid: [],
    playerPos: { x: 0, y: 0 },
    moves: 0,
    pushes: 0,
    score: 0,
    timeElapsed: 0,
  };
}

export function startLevel(state: GameState, levelId: string): GameState {
  const level = LEVELS.find((l) => l.id === levelId);
  if (!level) return state;

  return {
    ...state,
    status: 'playing',
    currentLevelId: levelId,
    grid: level.grid.map((row) => [...row]),
    playerPos: { ...level.playerStart },
    moves: 0,
    pushes: 0,
    timeElapsed: 0,
  };
}

export function movePlayer(
  state: GameState,
  direction: 'up' | 'down' | 'left' | 'right',
): GameState {
  if (state.status !== 'playing') return state;

  const dx = { up: 0, down: 0, left: -1, right: 1 }[direction];
  const dy = { up: -1, down: 1, left: 0, right: 0 }[direction];

  const newX = state.playerPos.x + dx;
  const newY = state.playerPos.y + dy;

  if (newY < 0 || newY >= state.grid.length || newX < 0 || newX >= state.grid[0].length) {
    return state;
  }

  const targetCell = state.grid[newY][newX];

  if (targetCell === 'wall') return state;

  const newGrid = state.grid.map((row) => [...row]);
  let newPushes = state.pushes;

  if (targetCell === 'box' || targetCell === 'box-on-target') {
    const boxNewX = newX + dx;
    const boxNewY = newY + dy;

    if (
      boxNewY < 0 ||
      boxNewY >= newGrid.length ||
      boxNewX < 0 ||
      boxNewX >= newGrid[0].length
    ) {
      return state;
    }

    const boxTargetCell = newGrid[boxNewY][boxNewX];
    if (boxTargetCell === 'wall' || boxTargetCell === 'box' || boxTargetCell === 'box-on-target') {
      return state;
    }

    newGrid[boxNewY][boxNewX] = boxTargetCell === 'target' ? 'box-on-target' : 'box';
    newGrid[newY][newX] = targetCell === 'box-on-target' ? 'target' : 'empty';
    newPushes++;
  }

  return {
    ...state,
    grid: newGrid,
    playerPos: { x: newX, y: newY },
    moves: state.moves + 1,
    pushes: newPushes,
  };
}

export function checkWin(state: GameState): boolean {
  return !state.grid.some((row) => row.includes('box'));
}

export function submitLevel(state: GameState): GameState {
  if (!checkWin(state)) {
    return { ...state, status: 'failure' };
  }

  const level = LEVELS.find((l) => l.id === state.currentLevelId);
  const movesBonus = level?.movesLimit ? Math.max(0, level.movesLimit - state.moves) * 5 : 0;
  const pushBonus = Math.max(0, 50 - state.pushes);

  return {
    ...state,
    status: 'success',
    score: state.score + 100 + movesBonus + pushBonus,
  };
}

export function resetLevel(state: GameState): GameState {
  if (!state.currentLevelId) return state;
  return startLevel(state, state.currentLevelId);
}
