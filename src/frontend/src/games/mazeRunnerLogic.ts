/**
 * Maze Runner game logic — navigate through mazes.
 *
 * Guide through the maze from start to finish.
 */

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
