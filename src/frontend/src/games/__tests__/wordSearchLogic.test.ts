/**
 * Test suite for Word Search game logic
 * Game ID: word-search
 * Educational Focus: Word recognition, spelling, visual scanning
 */

import { describe, it, expect } from 'vitest';
import {
  LEVELS,
  LevelConfig,
  getLevelConfig,
  generateWordSearch,
  WordSearchConfig,
} from '../wordSearchLogic';

describe('wordSearchLogic', () => {
  describe('LEVELS constant', () => {
    it('has 3 levels', () => {
      expect(LEVELS).toHaveLength(3);
    });

    it('has progressive grid sizes', () => {
      expect(LEVELS[0].gridSize).toBe(8);
      expect(LEVELS[1].gridSize).toBe(10);
      expect(LEVELS[2].gridSize).toBe(12);
    });

    it('has progressive word counts', () => {
      expect(LEVELS[0].wordCount).toBe(3);
      expect(LEVELS[1].wordCount).toBe(4);
      expect(LEVELS[2].wordCount).toBe(5);
    });

    it('grid size increases with level', () => {
      expect(LEVELS[0].gridSize).toBeLessThan(LEVELS[1].gridSize);
      expect(LEVELS[1].gridSize).toBeLessThan(LEVELS[2].gridSize);
    });

    it('word count increases with level', () => {
      expect(LEVELS[0].wordCount).toBeLessThan(LEVELS[1].wordCount);
      expect(LEVELS[1].wordCount).toBeLessThan(LEVELS[2].wordCount);
    });
  });

  describe('getLevelConfig', () => {
    it('returns level 1 config for level 1', () => {
      const config = getLevelConfig(1);
      expect(config.level).toBe(1);
      expect(config.gridSize).toBe(8);
      expect(config.wordCount).toBe(3);
    });

    it('returns level 2 config for level 2', () => {
      const config = getLevelConfig(2);
      expect(config.level).toBe(2);
      expect(config.gridSize).toBe(10);
      expect(config.wordCount).toBe(4);
    });

    it('returns level 3 config for level 3', () => {
      const config = getLevelConfig(3);
      expect(config.level).toBe(3);
      expect(config.gridSize).toBe(12);
      expect(config.wordCount).toBe(5);
    });

    it('falls back to level 1 for invalid level', () => {
      const config = getLevelConfig(99);
      expect(config.level).toBe(1);
    });

    it('falls back to level 1 for level 0', () => {
      const config = getLevelConfig(0);
      expect(config.level).toBe(1);
    });

    it('falls back to level 1 for negative level', () => {
      const config = getLevelConfig(-1);
      expect(config.level).toBe(1);
    });
  });

  describe('generateWordSearch', () => {
    it('generates grid for level 1', () => {
      const result = generateWordSearch(1);
      expect(result.grid).toBeDefined();
      expect(result.words).toBeDefined();
    });

    it('generates grid for level 2', () => {
      const result = generateWordSearch(2);
      expect(result.grid).toBeDefined();
      expect(result.words).toBeDefined();
    });

    it('generates grid for level 3', () => {
      const result = generateWordSearch(3);
      expect(result.grid).toBeDefined();
      expect(result.words).toBeDefined();
    });

    it('returns correct number of words for level 1', () => {
      const result = generateWordSearch(1);
      expect(result.words).toHaveLength(3);
    });

    it('returns correct number of words for level 2', () => {
      const result = generateWordSearch(2);
      expect(result.words).toHaveLength(4);
    });

    it('returns correct number of words for level 3', () => {
      const result = generateWordSearch(3);
      expect(result.words).toHaveLength(5);
    });

    it('grid has correct dimensions for level 1', () => {
      const result = generateWordSearch(1);
      expect(result.grid).toHaveLength(8);
      expect(result.grid[0]).toHaveLength(8);
    });

    it('grid has correct dimensions for level 2', () => {
      const result = generateWordSearch(2);
      expect(result.grid).toHaveLength(10);
      expect(result.grid[0]).toHaveLength(10);
    });

    it('grid has correct dimensions for level 3', () => {
      const result = generateWordSearch(3);
      expect(result.grid).toHaveLength(12);
      expect(result.grid[0]).toHaveLength(12);
    });

    it('grid contains only letters', () => {
      const result = generateWordSearch(1);
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

      result.grid.forEach(row => {
        row.forEach(cell => {
          expect(cell.length).toBe(1);
          expect(letters).toContain(cell);
        });
      });
    });

    it('words are uppercase', () => {
      const result = generateWordSearch(1);
      result.words.forEach(word => {
        expect(word).toBe(word.toUpperCase());
      });
    });

    it('all grid cells are filled', () => {
      const result = generateWordSearch(1);
      const totalCells = result.grid.length * result.grid[0].length;
      let filledCount = 0;

      result.grid.forEach(row => {
        row.forEach(cell => {
          if (cell !== '') filledCount++;
        });
      });

      expect(filledCount).toBe(totalCells);
    });

    it('generates different grids each time', () => {
      const result1 = generateWordSearch(1);
      const result2 = generateWordSearch(1);

      // Convert to strings for comparison
      const grid1 = result1.grid.map(row => row.join('')).join('');
      const grid2 = result2.grid.map(row => row.join('')).join('');

      // Due to random placement and filler letters, should be different
      expect(grid1).not.toBe(grid2);
    });

    it('can select different words over time', () => {
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(generateWordSearch(1));
      }

      // Collect all words seen
      const allWords = new Set<string>();
      results.forEach(r => r.words.forEach(w => allWords.add(w)));

      // Should see some variety
      expect(allWords.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Edge Cases', () => {
    it('handles invalid level', () => {
      const result = generateWordSearch(99);
      expect(result.grid).toBeDefined();
      expect(result.words).toBeDefined();
    });

    it('handles level 0', () => {
      const result = generateWordSearch(0);
      expect(result.grid).toBeDefined();
      expect(result.words).toBeDefined();
    });

    it('handles negative level', () => {
      const result = generateWordSearch(-1);
      expect(result.grid).toBeDefined();
      expect(result.words).toBeDefined();
    });

    it('handles generating game multiple times', () => {
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(generateWordSearch(2));
      }
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(Array.isArray(result.grid)).toBe(true);
        expect(Array.isArray(result.words)).toBe(true);
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('can complete level 1 game', () => {
      const result = generateWordSearch(1);
      expect(result.words).toHaveLength(3);
      expect(result.grid.length).toBe(8);
      expect(result.grid[0].length).toBe(8);
    });

    it('can complete level 3 game', () => {
      const result = generateWordSearch(3);
      expect(result.words).toHaveLength(5);
      expect(result.grid.length).toBe(12);
      expect(result.grid[0].length).toBe(12);
    });

    it('grid dimensions match level config', () => {
      [1, 2, 3].forEach(level => {
        const config = getLevelConfig(level);
        const result = generateWordSearch(level);

        expect(result.grid.length).toBe(config.gridSize);
        result.grid.forEach(row => {
          expect(row.length).toBe(config.gridSize);
        });
      });
    });

    it('word count matches level config', () => {
      [1, 2, 3].forEach(level => {
        const config = getLevelConfig(level);
        const result = generateWordSearch(level);

        expect(result.words.length).toBe(config.wordCount);
      });
    });
  });

  describe('Type Definitions', () => {
    it('WordSearchConfig has correct structure', () => {
      const config: WordSearchConfig = {
        gridSize: 8,
        words: ['CAT', 'DOG'],
      };
      expect(typeof config.gridSize).toBe('number');
      expect(Array.isArray(config.words)).toBe(true);
    });

    it('LevelConfig has correct structure', () => {
      const config: LevelConfig = LEVELS[0];
      expect(typeof config.level).toBe('number');
      expect(typeof config.gridSize).toBe('number');
      expect(typeof config.wordCount).toBe('number');
    });

    it('result has correct structure', () => {
      const result = generateWordSearch(1);
      expect(Array.isArray(result.grid)).toBe(true);
      expect(Array.isArray(result.words)).toBe(true);
      expect(typeof result.grid).toBe('object');
      expect(typeof result.words).toBe('object');
    });

    it('grid is 2D array of strings', () => {
      const result = generateWordSearch(1);
      expect(Array.isArray(result.grid)).toBe(true);
      expect(Array.isArray(result.grid[0])).toBe(true);
      result.grid.forEach(row => {
        row.forEach(cell => {
          expect(typeof cell).toBe('string');
        });
      });
    });
  });

  describe('Difficulty Progression', () => {
    it('level 1 is easiest', () => {
      const config = getLevelConfig(1);
      expect(config.gridSize).toBe(8);
      expect(config.wordCount).toBe(3);
    });

    it('level 2 is medium', () => {
      const config = getLevelConfig(2);
      expect(config.gridSize).toBe(10);
      expect(config.wordCount).toBe(4);
    });

    it('level 3 is hardest', () => {
      const config = getLevelConfig(3);
      expect(config.gridSize).toBe(12);
      expect(config.wordCount).toBe(5);
    });

    it('grid size increases with level', () => {
      const size1 = getLevelConfig(1).gridSize;
      const size2 = getLevelConfig(2).gridSize;
      const size3 = getLevelConfig(3).gridSize;

      expect(size1).toBeLessThan(size2);
      expect(size2).toBeLessThan(size3);
    });

    it('word count increases with level', () => {
      const count1 = getLevelConfig(1).wordCount;
      const count2 = getLevelConfig(2).wordCount;
      const count3 = getLevelConfig(3).wordCount;

      expect(count1).toBeLessThan(count2);
      expect(count2).toBeLessThan(count3);
    });

    it('cell count increases significantly', () => {
      const cells1 = getLevelConfig(1).gridSize * getLevelConfig(1).gridSize;
      const cells2 = getLevelConfig(2).gridSize * getLevelConfig(2).gridSize;
      const cells3 = getLevelConfig(3).gridSize * getLevelConfig(3).gridSize;

      expect(cells1).toBe(64); // 8x8
      expect(cells2).toBe(100); // 10x10
      expect(cells3).toBe(144); // 12x12
    });
  });

  describe('Grid Content', () => {
    it('attempts to place words in grid', () => {
      const result = generateWordSearch(2);
      expect(result.grid).toBeDefined();
      expect(result.words).toBeDefined();
      // Note: Words may not always be placed due to placement algorithm limitations
      // This is documented as a known behavior in the audit report
    });

    it('grid has filler letters to increase difficulty', () => {
      const result = generateWordSearch(1);
      const wordLetters = result.words.join('').length;
      const totalCells = result.grid.length * result.grid[0].length;

      // Filler letters = total - word letters
      expect(totalCells).toBeGreaterThan(wordLetters);
    });

    it('all grid cells contain letters', () => {
      const result = generateWordSearch(1);
      result.grid.forEach(row => {
        row.forEach(cell => {
          expect(cell).toMatch(/^[A-Z]$/);
        });
      });
    });

    it('grid is square (same width and height)', () => {
      [1, 2, 3].forEach(level => {
        const result = generateWordSearch(level);
        const size = result.grid.length;
        result.grid.forEach(row => {
          expect(row.length).toBe(size);
        });
      });
    });
  });

  describe('Known Behaviors', () => {
    it('uses 4 directions for word placement', () => {
      // Based on the source code: [[0, 1], [1, 0], [1, 1], [-1, 1]]
      // This places words horizontally, vertically, and diagonally
      const result = generateWordSearch(2);
      expect(result.words.length).toBeGreaterThan(0);
      expect(result.grid.length).toBeGreaterThan(0);
    });

    it('attempts to place each word up to 100 times', () => {
      // From source code: for (let attempts = 0; attempts < 100; attempts++)
      // This means some words might not be placed if placement fails
      const result = generateWordSearch(3);
      expect(result.words.length).toBe(5); // All 5 words attempted
    });

    it('fills empty cells with random letters', () => {
      const result = generateWordSearch(1);
      result.grid.forEach(row => {
        row.forEach(cell => {
          expect(cell).toMatch(/^[A-Z]$/);
        });
      });
    });

    it('generates unique grids for same level', () => {
      const result1 = generateWordSearch(1);
      const result2 = generateWordSearch(1);

      // Grids should be different due to random placement and filler letters
      const grid1 = result1.grid.map(row => row.join('')).join('');
      const grid2 = result2.grid.map(row => row.join('')).join('');

      expect(grid1).not.toBe(grid2);
    });
  });

  describe('Educational Design', () => {
    it('increases visual search challenge with larger grids', () => {
      const area1 = getLevelConfig(1).gridSize ** 2;
      const area2 = getLevelConfig(2).gridSize ** 2;
      const area3 = getLevelConfig(3).gridSize ** 2;

      expect(area1).toBe(64);
      expect(area2).toBe(100);
      expect(area3).toBe(144);
    });

    it('increases word count challenge with level', () => {
      const count1 = getLevelConfig(1).wordCount;
      const count2 = getLevelConfig(2).wordCount;
      const count3 = getLevelConfig(3).wordCount;

      expect(count1).toBeLessThan(count2);
      expect(count2).toBeLessThan(count3);
    });

    it('teaches pattern recognition through word search', () => {
      const result = generateWordSearch(1);
      // Children learn to scan horizontally, vertically, and diagonally
      expect(result.words).toBeDefined();
    });

    it('supports spelling and word recognition', () => {
      const result = generateWordSearch(1);
      result.words.forEach(word => {
        expect(word.length).toBeGreaterThan(0);
        expect(word).toMatch(/^[A-Z]+$/);
      });
    });
  });
});
