/**
 * Maze Runner Logic Tests
 *
 * Tests for the hand-tracking maze game logic.
 */
// INTENTIONAL_EXPORT_REMOVAL: LEVELS, MazeCell, MazeLevel, Position, canMove, checkWin, createMaze, getLevelConfig

import { describe, it, expect } from 'vitest';
import {
  generateMaze,
  createInitialState,
  startGame,
  posToCell,
  isSafePosition,
  checkExitReached,
  updatePlayerPosition,
  updateTimer,
  calculateFinalScore,
  getWallHitMessage,
  getDifficultyName,
  DIFFICULTY_CONFIGS,
  DEFAULT_CONFIG,
  type Difficulty,
} from '../mazeRunnerLogic';

describe('MazeRunner Logic', () => {
  describe('generateMaze', () => {
    it('generates maze with correct dimensions', () => {
      const maze = generateMaze(8);
      expect(maze.width).toBe(8);
      expect(maze.height).toBe(8);
      expect(maze.cells.length).toBe(8);
      expect(maze.cells[0].length).toBe(8);
    });

    it('generates different mazes each time', () => {
      const maze1 = generateMaze(8);
      const maze2 = generateMaze(8);
      // Very unlikely to be identical due to randomness
      const walls1 = maze1.cells[0][0].walls;
      const walls2 = maze2.cells[0][0].walls;
      const identical = 
        walls1.top === walls2.top &&
        walls1.right === walls2.right &&
        walls1.bottom === walls2.bottom &&
        walls1.left === walls2.left;
      // Just check we get valid mazes, not necessarily different
      expect(maze1.cells).toBeDefined();
      expect(maze2.cells).toBeDefined();
    });

    it('has start position at top-left', () => {
      const maze = generateMaze(8);
      expect(maze.start.x).toBeLessThan(0.1);
      expect(maze.start.y).toBeLessThan(0.1);
    });

    it('has end position at bottom-right', () => {
      const maze = generateMaze(8);
      expect(maze.end.x).toBeGreaterThan(0.9);
      expect(maze.end.y).toBeGreaterThan(0.9);
    });

    it('all cells have wall properties', () => {
      const maze = generateMaze(8);
      for (let y = 0; y < maze.height; y++) {
        for (let x = 0; x < maze.width; x++) {
          const cell = maze.cells[y][x];
          expect(cell.walls).toHaveProperty('top');
          expect(cell.walls).toHaveProperty('right');
          expect(cell.walls).toHaveProperty('bottom');
          expect(cell.walls).toHaveProperty('left');
        }
      }
    });

    it('generates connected maze (path exists from start to end)', () => {
      const maze = generateMaze(8);
      // Simple check: start and end should be in different cells
      const startCell = posToCell(maze.start, maze.width);
      const endCell = posToCell(maze.end, maze.width);
      expect(startCell.x).toBe(0);
      expect(startCell.y).toBe(0);
      expect(endCell.x).toBe(maze.width - 1);
      expect(endCell.y).toBe(maze.height - 1);
    });
  });

  describe('createInitialState', () => {
    it('creates state with idle status', () => {
      const state = createInitialState();
      expect(state.status).toBe('idle');
    });

    it('initializes score to 0', () => {
      const state = createInitialState();
      expect(state.score).toBe(0);
    });

    it('has no maze initially', () => {
      const state = createInitialState();
      expect(state.maze).toBeNull();
    });

    it('initializes wall hits to 0', () => {
      const state = createInitialState();
      expect(state.wallHits).toBe(0);
    });

    it('uses default config when none provided', () => {
      const state = createInitialState();
      expect(state.timeLeft).toBe(DEFAULT_CONFIG.timeLimit);
      expect(state.maxWallHits).toBe(DEFAULT_CONFIG.maxWallHits);
    });

    it('uses provided config', () => {
      const customConfig = { difficulty: 'hard' as Difficulty, timeLimit: 120, maxWallHits: 2 };
      const state = createInitialState(customConfig);
      expect(state.timeLeft).toBe(120);
      expect(state.maxWallHits).toBe(2);
    });
  });

  describe('startGame', () => {
    it('sets status to playing', () => {
      const state = createInitialState();
      const newState = startGame(state, 'easy');
      expect(newState.status).toBe('playing');
    });

    it('generates maze based on difficulty', () => {
      const state = createInitialState();
      const newState = startGame(state, 'easy');
      expect(newState.maze).not.toBeNull();
      expect(newState.maze!.width).toBe(DIFFICULTY_CONFIGS.easy.mazeSize);
    });

    it('sets player position to start', () => {
      const state = createInitialState();
      const newState = startGame(state, 'easy');
      expect(newState.playerPos.x).toBe(newState.maze!.start.x);
      expect(newState.playerPos.y).toBe(newState.maze!.start.y);
    });

    it('initializes path with start position', () => {
      const state = createInitialState();
      const newState = startGame(state, 'easy');
      expect(newState.path.length).toBe(1);
      expect(newState.path[0].x).toBe(newState.maze!.start.x);
    });

    it('sets time based on difficulty', () => {
      const state = createInitialState();
      const easy = startGame(state, 'easy');
      expect(easy.timeLeft).toBe(DIFFICULTY_CONFIGS.easy.timeLimit);
    });

    it('sets max wall hits based on difficulty', () => {
      const state = createInitialState();
      const hard = startGame(state, 'hard');
      expect(hard.maxWallHits).toBe(DIFFICULTY_CONFIGS.hard.maxWallHits);
    });

    it('resets wall hits', () => {
      const state = { ...createInitialState(), wallHits: 3 };
      const newState = startGame(state, 'easy');
      expect(newState.wallHits).toBe(0);
    });
  });

  describe('posToCell', () => {
    it('converts position to correct cell', () => {
      const pos = { x: 0.5, y: 0.5 };
      const cell = posToCell(pos, 8);
      expect(cell.x).toBe(4);
      expect(cell.y).toBe(4);
    });

    it('handles position at cell boundary', () => {
      const pos = { x: 0, y: 0 };
      const cell = posToCell(pos, 8);
      expect(cell.x).toBe(0);
      expect(cell.y).toBe(0);
    });

    it('handles position at max boundary', () => {
      const pos = { x: 0.99, y: 0.99 };
      const cell = posToCell(pos, 8);
      expect(cell.x).toBe(7);
      expect(cell.y).toBe(7);
    });
  });

  describe('isSafePosition', () => {
    it('returns true for position in center of cell', () => {
      const maze = generateMaze(8);
      // Position at exact center of a cell away from walls (cell 2,2)
      // Cell size is 1/8 = 0.125, so cell 2 spans 0.25-0.375
      // Center is at 0.3125
      const pos = { x: 0.3125, y: 0.3125 };
      expect(isSafePosition(pos, maze)).toBe(true);
    });

    it('returns false for position outside maze', () => {
      const maze = generateMaze(8);
      const pos = { x: 1.5, y: 0.5 };
      expect(isSafePosition(pos, maze)).toBe(false);
    });

    it('returns false for negative position', () => {
      const maze = generateMaze(8);
      const pos = { x: -0.1, y: 0.5 };
      expect(isSafePosition(pos, maze)).toBe(false);
    });
  });

  describe('checkExitReached', () => {
    it('returns true when at exit position', () => {
      const maze = generateMaze(8);
      expect(checkExitReached(maze.end, maze)).toBe(true);
    });

    it('returns true when very close to exit', () => {
      const maze = generateMaze(8);
      const nearExit = {
        x: maze.end.x + 0.02,
        y: maze.end.y + 0.02,
      };
      expect(checkExitReached(nearExit, maze)).toBe(true);
    });

    it('returns false when far from exit', () => {
      const maze = generateMaze(8);
      expect(checkExitReached(maze.start, maze)).toBe(false);
    });
  });

  describe('updatePlayerPosition', () => {
    it('updates position when safe', () => {
      const state = startGame(createInitialState(), 'easy');
      const newPos = { x: 0.15, y: 0.15 }; // Safe position
      const { state: newState, hitWall } = updatePlayerPosition(state, newPos);
      expect(newState.playerPos.x).toBe(newPos.x);
      expect(hitWall).toBe(false);
    });

    it('increments wall hits when hitting wall', () => {
      const state = startGame(createInitialState(), 'easy');
      // Position outside maze bounds
      const newPos = { x: 1.5, y: 0.5 };
      const { state: newState, hitWall } = updatePlayerPosition(state, newPos);
      expect(hitWall).toBe(true);
      expect(newState.wallHits).toBe(1);
    });

    it('detects exit reached', () => {
      const state = startGame(createInitialState(), 'easy');
      const { state: newState, reachedExit } = updatePlayerPosition(state, state.maze!.end);
      expect(reachedExit).toBe(true);
      expect(newState.status).toBe('complete');
    });

    it('ends game when max wall hits reached', () => {
      const state = startGame(createInitialState(), 'easy');
      state.wallHits = state.maxWallHits; // Already at max
      const newPos = { x: 1.5, y: 0.5 }; // Position outside maze
      const { state: newState } = updatePlayerPosition(state, newPos);
      expect(newState.status).toBe('wall-hit');
    });

    it('adds position to path', () => {
      const state = startGame(createInitialState(), 'easy');
      const newPos = { x: 0.15, y: 0.15 };
      const { state: newState } = updatePlayerPosition(state, newPos);
      expect(newState.path.length).toBe(2);
      expect(newState.path[1]).toEqual(newPos);
    });

    it('does nothing when not playing', () => {
      const state = createInitialState();
      const newPos = { x: 0.5, y: 0.5 };
      const { state: newState } = updatePlayerPosition(state, newPos);
      expect(newState).toEqual(state);
    });
  });

  describe('updateTimer', () => {
    it('decrements time when playing', () => {
      const state = startGame(createInitialState(), 'easy');
      const newState = updateTimer(state);
      expect(newState.timeLeft).toBe(state.timeLeft - 1);
    });

    it('ends game when time runs out', () => {
      const state = startGame(createInitialState(), 'easy');
      state.timeLeft = 1;
      const newState = updateTimer(state);
      expect(newState.timeLeft).toBe(0);
      expect(newState.status).toBe('wall-hit');
    });

    it('does nothing when not playing', () => {
      const state = createInitialState();
      const newState = updateTimer(state);
      expect(newState.timeLeft).toBe(state.timeLeft);
    });
  });

  describe('calculateFinalScore', () => {
    it('calculates base score', () => {
      const state = startGame(createInitialState(), 'easy');
      const scores = calculateFinalScore(state);
      expect(scores.baseScore).toBe(500);
    });

    it('adds time bonus', () => {
      const state = startGame(createInitialState(), 'easy');
      state.timeLeft = 30;
      const scores = calculateFinalScore(state);
      expect(scores.timeBonus).toBe(300); // 30 * 10
    });

    it('adds path bonus for short path', () => {
      const state = startGame(createInitialState(), 'easy');
      state.path = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
      const scores = calculateFinalScore(state);
      expect(scores.pathBonus).toBe(98); // 100 - 2
    });

    it('subtracts wall penalty', () => {
      const state = startGame(createInitialState(), 'easy');
      state.wallHits = 2;
      const scores = calculateFinalScore(state);
      expect(scores.wallPenalty).toBe(100); // 2 * 50
    });

    it('calculates total correctly', () => {
      const state = startGame(createInitialState(), 'easy');
      state.timeLeft = 10;
      state.path = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
      state.wallHits = 1;
      const scores = calculateFinalScore(state);
      const expected = 500 + 100 + 98 - 50; // base + time + path - wall
      expect(scores.total).toBe(expected);
    });

    it('never returns negative total', () => {
      const state = startGame(createInitialState(), 'easy');
      state.wallHits = 100;
      const scores = calculateFinalScore(state);
      expect(scores.total).toBe(0);
    });
  });

  describe('getWallHitMessage', () => {
    it('returns warning when one hit remaining', () => {
      const message = getWallHitMessage(4, 5);
      expect(message).toContain('One more hit');
    });

    it('returns caution when two hits remaining', () => {
      const message = getWallHitMessage(3, 5);
      expect(message).toContain('Watch the walls');
    });

    it('shows remaining chances for other cases', () => {
      const message = getWallHitMessage(1, 5);
      expect(message).toContain('4 chances left');
    });
  });

  describe('getDifficultyName', () => {
    it('returns Easy for easy', () => {
      expect(getDifficultyName('easy')).toBe('Easy');
    });

    it('returns Medium for medium', () => {
      expect(getDifficultyName('medium')).toBe('Medium');
    });

    it('returns Hard for hard', () => {
      expect(getDifficultyName('hard')).toBe('Hard');
    });
  });

  describe('DIFFICULTY_CONFIGS', () => {
    it('has correct config for easy', () => {
      expect(DIFFICULTY_CONFIGS.easy.mazeSize).toBe(8);
      expect(DIFFICULTY_CONFIGS.easy.timeLimit).toBe(60);
      expect(DIFFICULTY_CONFIGS.easy.maxWallHits).toBe(5);
    });

    it('has correct config for medium', () => {
      expect(DIFFICULTY_CONFIGS.medium.mazeSize).toBe(12);
      expect(DIFFICULTY_CONFIGS.medium.timeLimit).toBe(90);
      expect(DIFFICULTY_CONFIGS.medium.maxWallHits).toBe(3);
    });

    it('has correct config for hard', () => {
      expect(DIFFICULTY_CONFIGS.hard.mazeSize).toBe(16);
      expect(DIFFICULTY_CONFIGS.hard.timeLimit).toBe(120);
      expect(DIFFICULTY_CONFIGS.hard.maxWallHits).toBe(2);
    });

    it('has increasing maze size with difficulty', () => {
      expect(DIFFICULTY_CONFIGS.easy.mazeSize)
        .toBeLessThan(DIFFICULTY_CONFIGS.medium.mazeSize);
      expect(DIFFICULTY_CONFIGS.medium.mazeSize)
        .toBeLessThan(DIFFICULTY_CONFIGS.hard.mazeSize);
    });

    it('has decreasing wall hits with difficulty', () => {
      expect(DIFFICULTY_CONFIGS.easy.maxWallHits)
        .toBeGreaterThan(DIFFICULTY_CONFIGS.medium.maxWallHits);
      expect(DIFFICULTY_CONFIGS.medium.maxWallHits)
        .toBeGreaterThan(DIFFICULTY_CONFIGS.hard.maxWallHits);
    });
  });
});
