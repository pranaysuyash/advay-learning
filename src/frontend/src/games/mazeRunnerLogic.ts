/**
 * Maze Runner game logic — pure functions for the hand-tracking maze game.
 *
 * Navigate your finger through the maze without touching the walls!
 * Race against the clock to find the exit.
 *
 * @see docs/GAME_IDEAS_CATALOG.md - Maze Runner
 */
// INTENTIONAL_EXPORT_REMOVAL: LEVELS, MazeLevel, createMaze, canMove, checkWin, getLevelConfig

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Position {
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
}

export interface MazeCell {
  x: number;
  y: number;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  visited: boolean;
}

export interface Maze {
  width: number;
  height: number;
  cells: MazeCell[][];
  start: Position;
  end: Position;
}

export interface GameState {
  status: 'idle' | 'playing' | 'wall-hit' | 'complete';
  score: number;
  level: number;
  difficulty: Difficulty;
  maze: Maze | null;
  playerPos: Position;
  path: Position[];
  timeLeft: number;
  wallHits: number;
  maxWallHits: number;
}

export interface GameConfig {
  difficulty: Difficulty;
  timeLimit: number;
  maxWallHits: number;
}

export const DEFAULT_CONFIG: GameConfig = {
  difficulty: 'easy',
  timeLimit: 60,
  maxWallHits: 3,
};

// Difficulty configurations
export const DIFFICULTY_CONFIGS: Record<Difficulty, { mazeSize: number; timeLimit: number; maxWallHits: number }> = {
  easy: {
    mazeSize: 8,
    timeLimit: 60,
    maxWallHits: 5,
  },
  medium: {
    mazeSize: 12,
    timeLimit: 90,
    maxWallHits: 3,
  },
  hard: {
    mazeSize: 16,
    timeLimit: 120,
    maxWallHits: 2,
  },
};

/**
 * Generate a maze using recursive backtracking algorithm.
 */
export function generateMaze(size: number): Maze {
  // Initialize cells with all walls
  const cells: MazeCell[][] = [];
  for (let y = 0; y < size; y++) {
    cells[y] = [];
    for (let x = 0; x < size; x++) {
      cells[y][x] = {
        x,
        y,
        walls: { top: true, right: true, bottom: true, left: true },
        visited: false,
      };
    }
  }

  // Recursive backtracking
  const stack: MazeCell[] = [];
  let current = cells[0][0];
  current.visited = true;

  const getUnvisitedNeighbors = (cell: MazeCell): MazeCell[] => {
    const neighbors: MazeCell[] = [];
    const { x, y } = cell;

    if (y > 0 && !cells[y - 1][x].visited) neighbors.push(cells[y - 1][x]);
    if (x < size - 1 && !cells[y][x + 1].visited) neighbors.push(cells[y][x + 1]);
    if (y < size - 1 && !cells[y + 1][x].visited) neighbors.push(cells[y + 1][x]);
    if (x > 0 && !cells[y][x - 1].visited) neighbors.push(cells[y][x - 1]);

    return neighbors;
  };

  const removeWall = (a: MazeCell, b: MazeCell) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;

    if (dx === 1) {
      a.walls.right = false;
      b.walls.left = false;
    } else if (dx === -1) {
      a.walls.left = false;
      b.walls.right = false;
    } else if (dy === 1) {
      a.walls.bottom = false;
      b.walls.top = false;
    } else if (dy === -1) {
      a.walls.top = false;
      b.walls.bottom = false;
    }
  };

  while (true) {
    const neighbors = getUnvisitedNeighbors(current);

    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      stack.push(current);
      removeWall(current, next);
      next.visited = true;
      current = next;
    } else if (stack.length > 0) {
      current = stack.pop()!;
    } else {
      break;
    }
  }

  // Reset visited flags for gameplay
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      cells[y][x].visited = false;
    }
  }

  return {
    width: size,
    height: size,
    cells,
    start: { x: 0.5 / size, y: 0.5 / size }, // Center of top-left cell
    end: { x: (size - 0.5) / size, y: (size - 0.5) / size }, // Center of bottom-right cell
  };
}

/**
 * Create initial game state.
 */
export function createInitialState(config: GameConfig = DEFAULT_CONFIG): GameState {
  return {
    status: 'idle',
    score: 0,
    level: 1,
    difficulty: config.difficulty,
    maze: null,
    playerPos: { x: 0, y: 0 },
    path: [],
    timeLeft: config.timeLimit,
    wallHits: 0,
    maxWallHits: config.maxWallHits,
  };
}

/**
 * Start a new game.
 */
export function startGame(state: GameState, difficulty: Difficulty): GameState {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const maze = generateMaze(config.mazeSize);

  return {
    ...state,
    status: 'playing',
    score: 0,
    level: 1,
    difficulty,
    maze,
    playerPos: { ...maze.start },
    path: [{ ...maze.start }],
    timeLeft: config.timeLimit,
    wallHits: 0,
    maxWallHits: config.maxWallHits,
  };
}

/**
 * Convert normalized position to cell coordinates.
 */
export function posToCell(pos: Position, mazeSize: number): { x: number; y: number } {
  return {
    x: Math.floor(pos.x * mazeSize),
    y: Math.floor(pos.y * mazeSize),
  };
}

/**
 * Check if a position is within a cell (not near walls).
 */
export function isSafePosition(pos: Position, maze: Maze): boolean {
  if (!Number.isFinite(pos.x) || !Number.isFinite(pos.y)) {
    return false;
  }
  const cellSize = 1 / maze.width;
  const margin = cellSize * 0.2; // 20% margin from walls

  const cellX = Math.floor(pos.x * maze.width);
  const cellY = Math.floor(pos.y * maze.height);

  // Check bounds
  if (cellX < 0 || cellX >= maze.width || cellY < 0 || cellY >= maze.height) {
    return false;
  }

  const cell = maze.cells[cellY][cellX];
  const localX = (pos.x * maze.width) - cellX;
  const localY = (pos.y * maze.height) - cellY;

  // Check against walls with margin
  if (cell.walls.top && localY < margin) return false;
  if (cell.walls.bottom && localY > 1 - margin) return false;
  if (cell.walls.left && localX < margin) return false;
  if (cell.walls.right && localX > 1 - margin) return false;

  return true;
}

/**
 * Check if player has reached the exit.
 */
export function checkExitReached(pos: Position, maze: Maze): boolean {
  const distance = Math.sqrt(
    Math.pow(pos.x - maze.end.x, 2) + Math.pow(pos.y - maze.end.y, 2)
  );
  return distance < 0.05; // Within 5% of exit
}

/**
 * Update player position with collision detection.
 */
export function updatePlayerPosition(
  state: GameState,
  newPos: Position
): { state: GameState; hitWall: boolean; reachedExit: boolean } {
  if (state.status !== 'playing' || !state.maze) {
    return { state, hitWall: false, reachedExit: false };
  }

  // Check if new position hits a wall
  if (!isSafePosition(newPos, state.maze)) {
    const newWallHits = state.wallHits + 1;
    
    // Check if too many wall hits
    if (newWallHits >= state.maxWallHits) {
      return {
        state: {
          ...state,
          wallHits: newWallHits,
          status: 'wall-hit',
        },
        hitWall: true,
        reachedExit: false,
      };
    }

    return {
      state: {
        ...state,
        wallHits: newWallHits,
      },
      hitWall: true,
      reachedExit: false,
    };
  }

  // Check if reached exit
  if (checkExitReached(newPos, state.maze)) {
    return {
      state: {
        ...state,
        playerPos: newPos,
        path: [...state.path, newPos],
        status: 'complete',
      },
      hitWall: false,
      reachedExit: true,
    };
  }

  // Normal movement
  return {
    state: {
      ...state,
      playerPos: newPos,
      path: [...state.path, newPos],
    },
    hitWall: false,
    reachedExit: false,
  };
}

/**
 * Update game timer.
 */
export function updateTimer(state: GameState): GameState {
  if (state.status !== 'playing') return state;

  const newTimeLeft = state.timeLeft - 1;

  if (newTimeLeft <= 0) {
    return {
      ...state,
      timeLeft: 0,
      status: 'wall-hit', // Time's up = game over
    };
  }

  return {
    ...state,
    timeLeft: newTimeLeft,
  };
}

/**
 * Calculate final score.
 */
export function calculateFinalScore(state: GameState): {
  baseScore: number;
  timeBonus: number;
  pathBonus: number;
  wallPenalty: number;
  total: number;
} {
  const baseScore = 500;
  const timeBonus = state.timeLeft * 10;
  const pathBonus = Math.max(0, 100 - state.path.length); // Shorter path = better
  const wallPenalty = state.wallHits * 50;

  return {
    baseScore,
    timeBonus,
    pathBonus,
    wallPenalty,
    total: Math.max(0, baseScore + timeBonus + pathBonus - wallPenalty),
  };
}

/**
 * Get wall hit feedback message.
 */
export function getWallHitMessage(wallHits: number, maxWallHits: number): string {
  const remaining = maxWallHits - wallHits;
  if (remaining === 1) return 'Careful! One more hit and you\'re out!';
  if (remaining === 2) return 'Watch the walls!';
  return `Ouch! ${remaining} chances left.`;
}

/**
 * Get difficulty display name.
 */
export function getDifficultyName(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'easy':
      return 'Easy';
    case 'medium':
      return 'Medium';
    case 'hard':
      return 'Hard';
    default:
      return 'Easy';
  }
}
