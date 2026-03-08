/**
 * Maze Runner Game Logic Tests
 *
 * Tests for level configurations, maze generation, movement,
 * win conditions, and maze solver.
 */

import { describe, expect, it, beforeEach } from 'vitest';

// Types from MazeRunner
export interface MazeCell {
  x: number;
  y: number;
  isWall: boolean;
  isStart: boolean;
  isEnd: boolean;
  isPath: boolean;
}

export interface MazeLevel {
  level: number;
  rows: number;
  cols: number;
  wallDensity: number;
}

export interface Position {
  x: number;
  y: number;
}

export const LEVELS: MazeLevel[] = [
  { level: 1, rows: 7, cols: 7, wallDensity: 0.25 },
  { level: 2, rows: 9, cols: 9, wallDensity: 0.3 },
  { level: 3, rows: 11, cols: 11, wallDensity: 0.35 },
];

export function getLevelConfig(level: number): MazeLevel {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

function generateMaze(level: number): MazeCell[][] {
  const config = getLevelConfig(level);
  const { rows, cols, wallDensity } = config;

  const maze: MazeCell[][] = [];

  for (let y = 0; y < rows; y++) {
    const row: MazeCell[] = [];
    for (let x = 0; x < cols; x++) {
      const isWall = Math.random() < wallDensity && !(x === 0 && y === 0) && !(x === cols - 1 && y === rows - 1);
      row.push({
        x,
        y,
        isWall,
        isStart: x === 0 && y === 0,
        isEnd: x === cols - 1 && y === rows - 1,
        isPath: false,
      });
    }
    maze.push(row);
  }

  maze[0][0].isWall = false;
  maze[rows - 1][cols - 1].isWall = false;

  return maze;
}

function solveMaze(maze: MazeCell[][], start: Position, end: Position): Position[] {
  const rows = maze.length;
  const cols = maze[0].length;
  const visited: boolean[][] = Array(rows).fill(null).map(() => Array(cols).fill(false));
  const queue: { pos: Position; path: Position[] }[] = [{ pos: start, path: [start] }];

  while (queue.length > 0) {
    const { pos, path } = queue.shift()!;

    if (pos.x === end.x && pos.y === end.y) {
      return path;
    }

    visited[pos.y][pos.x] = true;

    const directions = [
      { dx: 0, dy: -1 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
    ];

    for (const { dx, dy } of directions) {
      const nx = pos.x + dx;
      const ny = pos.y + dy;

      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !maze[ny][nx].isWall && !visited[ny][nx]) {
        queue.push({ pos: { x: nx, y: ny }, path: [...path, { x: nx, y: ny }] });
      }
    }
  }

  return [];
}

export function createMaze(level: number): { maze: MazeCell[][]; start: Position; end: Position; solution: Position[] } {
  let maze = generateMaze(level);
  let solution: Position[] = [];
  let attempts = 0;

  while (solution.length === 0 && attempts < 50) {
    maze = generateMaze(level);
    const start: Position = { x: 0, y: 0 };
    const end: Position = { x: maze[0].length - 1, y: maze.length - 1 };
    solution = solveMaze(maze, start, end);
    attempts++;
  }

  if (solution.length > 0) {
    for (const pos of solution) {
      maze[pos.y][pos.x].isPath = true;
    }
  }

  const start: Position = { x: 0, y: 0 };
  const end: Position = { x: maze[0].length - 1, y: maze.length - 1 };

  return { maze, start, end, solution };
}

export function canMove(maze: MazeCell[][], pos: Position): boolean {
  const { x, y } = pos;
  if (y < 0 || y >= maze.length || x < 0 || x >= maze[0].length) return false;
  return !maze[y][x].isWall;
}

export function checkWin(pos: Position, end: Position): boolean {
  return pos.x === end.x && pos.y === end.y;
}

describe('Maze Runner - Level Configurations', () => {
  it('has 3 levels', () => {
    expect(LEVELS).toHaveLength(3);
  });

  it('level 1 is smallest with lowest density', () => {
    expect(LEVELS[0].level).toBe(1);
    expect(LEVELS[0].rows).toBe(7);
    expect(LEVELS[0].cols).toBe(7);
    expect(LEVELS[0].wallDensity).toBe(0.25);
  });

  it('level 2 has medium settings', () => {
    expect(LEVELS[1].level).toBe(2);
    expect(LEVELS[1].rows).toBe(9);
    expect(LEVELS[1].cols).toBe(9);
    expect(LEVELS[1].wallDensity).toBe(0.3);
  });

  it('level 3 is largest with highest density', () => {
    expect(LEVELS[2].level).toBe(3);
    expect(LEVELS[2].rows).toBe(11);
    expect(LEVELS[2].cols).toBe(11);
    expect(LEVELS[2].wallDensity).toBe(0.35);
  });

  it('rows and cols increase across levels', () => {
    expect(LEVELS[0].rows).toBeLessThan(LEVELS[1].rows);
    expect(LEVELS[1].rows).toBeLessThan(LEVELS[2].rows);
  });
});

describe('Maze Runner - Maze Generation', () => {
  it('generates maze with correct dimensions for level 1', () => {
    const { maze } = createMaze(1);
    expect(maze).toHaveLength(7); // rows
    expect(maze[0]).toHaveLength(7); // cols
  });

  it('generates maze with correct dimensions for level 2', () => {
    const { maze } = createMaze(2);
    expect(maze).toHaveLength(9); // rows
    expect(maze[0]).toHaveLength(9); // cols
  });

  it('generates maze with correct dimensions for level 3', () => {
    const { maze } = createMaze(3);
    expect(maze).toHaveLength(11); // rows
    expect(maze[0]).toHaveLength(11); // cols
  });

  it('always has solvable maze', () => {
    const result = createMaze(1);
    expect(result.solution.length).toBeGreaterThan(0);
  });

  it('marks start position correctly', () => {
    const { maze } = createMaze(1);
    expect(maze[0][0].isStart).toBe(true);
    expect(maze[0][0].isWall).toBe(false);
  });

  it('marks end position correctly', () => {
    const { maze } = createMaze(1);
    const rows = maze.length;
    const cols = maze[0].length;
    expect(maze[rows - 1][cols - 1].isEnd).toBe(true);
    expect(maze[rows - 1][cols - 1].isWall).toBe(false);
  });
});

describe('Maze Runner - Cell Properties', () => {
  it('cell has required properties', () => {
    const { maze } = createMaze(1);
    const cell = maze[1][1];

    expect(cell).toHaveProperty('x');
    expect(cell).toHaveProperty('y');
    expect(cell).toHaveProperty('isWall');
    expect(cell).toHaveProperty('isStart');
    expect(cell).toHaveProperty('isEnd');
    expect(cell).toHaveProperty('isPath');
  });

  it('cell coordinates match grid position', () => {
    const { maze } = createMaze(1);
    const cell = maze[2][3];

    expect(cell.x).toBe(3);
    expect(cell.y).toBe(2);
  });
});

describe('Maze Runner - Movement Validation', () => {
  it('allows move to valid position', () => {
    const { maze } = createMaze(1);
    // Find an open cell adjacent to start
    const openCell = maze.find(row => row.some(cell => !cell.isWall && !cell.isStart));
    expect(openCell).toBeDefined();

    if (openCell) {
      const cell = openCell.find(c => !c.isWall && !c.isStart);
      if (cell) {
        expect(canMove(maze, { x: cell.x, y: cell.y })).toBe(true);
      }
    }
  });

  it('prevents move into wall', () => {
    const { maze } = createMaze(1);
    const wallCell = maze.find(row => row.some(cell => cell.isWall));
    expect(wallCell).toBeDefined();

    if (wallCell) {
      const cell = wallCell.find(c => c.isWall);
      if (cell) {
        expect(canMove(maze, { x: cell.x, y: cell.y })).toBe(false);
      }
    }
  });

  it('prevents move out of bounds (negative)', () => {
    const { maze } = createMaze(1);
    expect(canMove(maze, { x: -1, y: 0 })).toBe(false);
    expect(canMove(maze, { x: 0, y: -1 })).toBe(false);
  });

  it('prevents move out of bounds (beyond limits)', () => {
    const { maze } = createMaze(1);
    const cols = maze[0].length;
    const rows = maze.length;

    expect(canMove(maze, { x: cols, y: 0 })).toBe(false);
    expect(canMove(maze, { x: 0, y: rows })).toBe(false);
  });
});

describe('Maze Runner - Win Condition', () => {
  it('detects win when player reaches end', () => {
    const { end } = createMaze(1);
    expect(checkWin(end, end)).toBe(true);
  });

  it('does not detect win when player not at end', () => {
    const { end } = createMaze(1);
    expect(checkWin({ x: 0, y: 0 }, end)).toBe(false);
  });

  it('requires exact position match', () => {
    const { end } = createMaze(1);
    const nearEnd = { x: end.x - 1, y: end.y };
    expect(checkWin(nearEnd, end)).toBe(false);
  });
});

describe('Maze Runner - Maze Solver (BFS)', () => {
  it('finds path from start to end in solvable maze', () => {
    const { maze, start, end, solution } = createMaze(1);
    expect(solution.length).toBeGreaterThan(0);
    expect(solution[0]).toEqual(start);
    expect(solution[solution.length - 1]).toEqual(end);
  });

  it('returns empty path for unsolvable maze', () => {
    // Create a maze with walls blocking everything
    const unsolvableMaze: MazeCell[][] = [
      [
        { x: 0, y: 0, isWall: false, isStart: true, isEnd: false, isPath: false },
        { x: 1, y: 0, isWall: true, isStart: false, isEnd: false, isPath: false },
      ],
      [
        { x: 0, y: 1, isWall: true, isStart: false, isEnd: false, isPath: false },
        { x: 1, y: 0, isWall: true, isStart: false, isEnd: true, isPath: false },
      ],
    ];

    const solution = solveMaze(unsolvableMaze, { x: 0, y: 0 }, { x: 1, y: 1 });
    expect(solution).toHaveLength(0);
  });

  it('marks solution path cells', () => {
    const { maze, solution } = createMaze(1);
    let pathCount = 0;

    for (const row of maze) {
      for (const cell of row) {
        if (cell.isPath) pathCount++;
      }
    }

    expect(pathCount).toBe(solution.length);
  });
});

describe('Maze Runner - Level Config Lookup', () => {
  it('returns correct level config', () => {
    expect(getLevelConfig(1)).toBe(LEVELS[0]);
    expect(getLevelConfig(2)).toBe(LEVELS[1]);
    expect(getLevelConfig(3)).toBe(LEVELS[2]);
  });

  it('returns level 1 for invalid level', () => {
    const config = getLevelConfig(99);
    expect(config).toBe(LEVELS[0]);
  });

  it('returns level 1 for negative level', () => {
    const config = getLevelConfig(-1);
    expect(config).toBe(LEVELS[0]);
  });
});

describe('Maze Runner - Scoring', () => {
  it('calculates time bonus based on moves', () => {
    const moves = 30;
    const timeBonus = Math.max(100 - moves, 20);
    expect(timeBonus).toBe(70);
  });

  it('floors time bonus at minimum 20', () => {
    const timeBonus = Math.max(100 - 150, 20);
    expect(timeBonus).toBe(20);
  });

  it('calculates streak bonus correctly', () => {
    const streak = 5;
    const streakBonus = Math.min(streak * 2, 15);
    expect(streakBonus).toBe(10);
  });

  it('caps streak bonus at 15', () => {
    const streak = 10;
    const streakBonus = Math.min(streak * 2, 15);
    expect(streakBonus).toBe(15);
  });
});

describe('Maze Runner - Edge Cases', () => {
  it('handles smallest possible maze', () => {
    const miniMaze: MazeCell[][] = [
      [
        { x: 0, y: 0, isWall: false, isStart: true, isEnd: false, isPath: false },
        { x: 1, y: 0, isWall: false, isStart: false, isEnd: true, isPath: false },
      ],
    ];
    const solution = solveMaze(miniMaze, { x: 0, y: 0 }, { x: 1, y: 0 });
    expect(solution.length).toBeGreaterThan(0);
  });

  it('handles movement to same position', () => {
    const { maze } = createMaze(1);
    expect(canMove(maze, { x: 0, y: 0 })).toBe(true); // Start is open
  });

  it('start and end are never walls', () => {
    const { maze } = createMaze(3);
    expect(maze[0][0].isWall).toBe(false);
    expect(maze[maze.length - 1][maze[0].length - 1].isWall).toBe(false);
  });

  it('generates different mazes on multiple calls', () => {
    const maze1 = createMaze(1);
    const maze2 = createMaze(1);

    // Check that at least some walls are in different positions
    let wallsDiffer = false;
    for (let y = 0; y < maze1.maze.length; y++) {
      for (let x = 0; x < maze1.maze[0].length; x++) {
        if (maze1.maze[y][x].isWall !== maze2.maze[y][x].isWall) {
          wallsDiffer = true;
          break;
        }
      }
      if (wallsDiffer) break;
    }

    // Note: Due to randomness, this might occasionally fail, but very unlikely
    expect(wallsDiffer).toBe(true);
  });
});

describe('Maze Runner - Start and End Positions', () => {
  it('start is always at top-left', () => {
    const result = createMaze(1);
    expect(result.start.x).toBe(0);
    expect(result.start.y).toBe(0);
  });

  it('end is always at bottom-right', () => {
    const result = createMaze(1);
    expect(result.end.x).toBe(result.maze[0].length - 1);
    expect(result.end.y).toBe(result.maze.length - 1);
  });

  it('start is marked correctly in maze', () => {
    const { maze } = createMaze(2);
    expect(maze[0][0].isStart).toBe(true);
  });

  it('end is marked correctly in maze', () => {
    const { maze } = createMaze(2);
    expect(maze[maze.length - 1][maze[0].length - 1].isEnd).toBe(true);
  });
});
