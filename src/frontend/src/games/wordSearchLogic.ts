/**
 * Word Search game logic — find hidden words.
 */

export interface WordSearchConfig {
  gridSize: number;
  words: string[];
}

export interface LevelConfig {
  level: number;
  gridSize: number;
  wordCount: number;
}

export const WORD_LISTS: Record<number, string[]> = {
  1: ['CAT', 'DOG', 'SUN', 'HAT', 'BAT', 'PIG', 'CUP', 'BUS'],
  2: ['FROG', 'FISH', 'BEAR', 'DUCK', 'LION', 'MOON', 'STAR', 'TREE'],
  3: ['APPLE', 'HOUSE', 'MOUSE', 'WATER', 'BREAD', 'GRAPE', 'TIGER', 'ZEBRA'],
};

export const LEVELS: LevelConfig[] = [
  { level: 1, gridSize: 8, wordCount: 3 },
  { level: 2, gridSize: 10, wordCount: 4 },
  { level: 3, gridSize: 12, wordCount: 5 },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find(l => l.level === level) ?? LEVELS[0];
}

function placeWord(grid: string[][], word: string): boolean {
  const size = grid.length;
  const directions: Array<[number, number]> = [[0, 1], [1, 0], [1, 1], [-1, 1]];
  
  for (let attempts = 0; attempts < 100; attempts++) {
    const dir = directions[Math.floor(Math.random() * directions.length)];
    const [dx, dy] = dir;

    const minX = dx === -1 ? word.length - 1 : 0;
    const maxX = dx === 1 ? size - word.length : size - 1;
    const minY = dy === -1 ? word.length - 1 : 0;
    const maxY = dy === 1 ? size - word.length : size - 1;

    if (maxX < minX || maxY < minY) {
      continue;
    }

    const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
    const y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
    
    let canPlace = true;
    for (let i = 0; i < word.length; i++) {
      const nx = x + i * dx;
      const ny = y + i * dy;
      if (nx < 0 || nx >= size || ny < 0 || ny >= size) {
        canPlace = false;
        break;
      }
      if (grid[nx][ny] !== '' && grid[nx][ny] !== word[i]) { canPlace = false; break; }
    }
    if (canPlace) {
      for (let i = 0; i < word.length; i++) {
        const nx = x + i * dx;
        const ny = y + i * dy;
        grid[nx][ny] = word[i];
      }
      return true;
    }
  }
  return false;
}

export function generateWordSearch(level: number): { grid: string[][]; words: string[] } {
  const config = getLevelConfig(level);
  const grid: string[][] = [];
  for (let i = 0; i < config.gridSize; i++) {
    grid.push(Array(config.gridSize).fill(''));
  }
  const words = WORD_LISTS[level]?.slice(0, config.wordCount) || WORD_LISTS[1].slice(0, 3);
  
  for (const word of words) {
    placeWord(grid, word);
  }
  
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < config.gridSize; i++) {
    for (let j = 0; j < config.gridSize; j++) {
      if (grid[i][j] === '') grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
    }
  }
  
  return { grid, words };
}
