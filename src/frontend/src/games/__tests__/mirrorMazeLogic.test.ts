import { describe, it, expect } from 'vitest';
import {
  initializeGame,
  updateBall,
  checkBallWallCollision,
  checkGoalReached,
  normalizeTilt,
  calculateScore,
  getCurrentMaze,
  MAZES,
} from '../mirrorMazeLogic';

describe('mirrorMazeLogic', () => {
  describe('initializeGame', () => {
    it('should initialize game with level 1', () => {
      const state = initializeGame(1);
      
      expect(state.level).toBe(1);
      expect(state.isPlaying).toBe(false);
      expect(state.moves).toBe(0);
      expect(state.completed).toBe(false);
      expect(state.ball).toBeDefined();
      expect(state.ball.radius).toBe(20);
    });
    
    it('should place ball at maze start position', () => {
      const maze = MAZES[0];
      const state = initializeGame(1);
      
      expect(state.ball.x).toBe(maze.start.x);
      expect(state.ball.y).toBe(maze.start.y);
    });
    
    it('should initialize with zero velocity', () => {
      const state = initializeGame(1);
      
      expect(state.ball.vx).toBe(0);
      expect(state.ball.vy).toBe(0);
    });
  });
  
  describe('updateBall', () => {
    it('should apply tilt as acceleration', () => {
      const ball = { x: 400, y: 300, vx: 0, vy: 0, radius: 20 };
      const walls: any[] = [];
      
      const updated = updateBall(ball, 1, 0, walls, 800, 600);
      
      expect(updated.vx).toBeGreaterThan(0);
      expect(updated.x).toBeGreaterThan(ball.x);
    });
    
    it('should apply friction', () => {
      const ball = { x: 400, y: 300, vx: 5, vy: 5, radius: 20 };
      const walls: any[] = [];
      
      const updated = updateBall(ball, 0, 0, walls, 800, 600);
      
      expect(Math.abs(updated.vx)).toBeLessThan(Math.abs(ball.vx));
      expect(Math.abs(updated.vy)).toBeLessThan(Math.abs(ball.vy));
    });
    
    it('should clamp maximum speed', () => {
      const ball = { x: 400, y: 300, vx: 0, vy: 0, radius: 20 };
      const walls: any[] = [];
      
      const updated = updateBall(ball, 10, 10, walls, 800, 600);
      
      expect(Math.abs(updated.vx)).toBeLessThanOrEqual(8);
      expect(Math.abs(updated.vy)).toBeLessThanOrEqual(8);
    });
    
    it('should handle wall collision', () => {
      const ball = { x: 50, y: 300, vx: 5, vy: 0, radius: 20 };
      const walls = [{ x: 60, y: 200, width: 20, height: 200 }];
      
      const updated = updateBall(ball, 1, 0, walls, 800, 600);
      
      // Ball should bounce back
      expect(updated.x).toBeLessThanOrEqual(ball.x + ball.radius);
    });
    
    it('should handle boundary collision', () => {
      const ball = { x: 10, y: 300, vx: -5, vy: 0, radius: 20 };
      const walls: any[] = [];
      
      const updated = updateBall(ball, -1, 0, walls, 800, 600);
      
      expect(updated.x).toBeGreaterThanOrEqual(ball.radius);
    });
  });
  
  describe('checkBallWallCollision', () => {
    it('should detect collision when ball overlaps wall', () => {
      const ball = { x: 100, y: 100, radius: 20 };
      const wall = { x: 90, y: 90, width: 20, height: 100 };
      
      const result = checkBallWallCollision(ball, wall);
      
      expect(result.collided).toBe(true);
    });
    
    it('should not detect collision when ball is far from wall', () => {
      const ball = { x: 500, y: 500, radius: 20 };
      const wall = { x: 100, y: 100, width: 20, height: 100 };
      
      const result = checkBallWallCollision(ball, wall);
      
      expect(result.collided).toBe(false);
    });

    it('should identify collision axis', () => {
      // Ball overlapping primarily on X-axis (vertical wall)
      const ballX = { x: 90, y: 300, radius: 20 };
      const wallX = { x: 95, y: 200, width: 10, height: 200 };

      const resultX = checkBallWallCollision(ballX, wallX);
      expect(resultX.axis).toBe('x');

      // Ball overlapping primarily on Y-axis (horizontal wall)
      const ballY = { x: 300, y: 90, radius: 20 };
      const wallY = { x: 200, y: 95, width: 200, height: 10 };

      const resultY = checkBallWallCollision(ballY, wallY);
      expect(resultY.axis).toBe('y');
    });
  });
  
  describe('checkGoalReached', () => {
    it('should return true when ball is at goal', () => {
      const ball = { x: 700, y: 300, radius: 20 };
      const goal = { x: 700, y: 300, radius: 40 };
      
      expect(checkGoalReached(ball, goal)).toBe(true);
    });
    
    it('should return true when ball overlaps goal', () => {
      const ball = { x: 720, y: 300, radius: 20 };
      const goal = { x: 700, y: 300, radius: 40 };
      
      expect(checkGoalReached(ball, goal)).toBe(true);
    });
    
    it('should return false when ball is far from goal', () => {
      const ball = { x: 100, y: 100, radius: 20 };
      const goal = { x: 700, y: 300, radius: 40 };
      
      expect(checkGoalReached(ball, goal)).toBe(false);
    });
  });
  
  describe('normalizeTilt', () => {
    it('should normalize tilt values', () => {
      const result = normalizeTilt(0.5, -0.3);
      
      expect(result.x).toBeCloseTo(0.5);
      expect(result.y).toBeCloseTo(-0.3);
    });
    
    it('should apply sensitivity multiplier', () => {
      const result = normalizeTilt(0.5, 0.5, 2.0);
      
      expect(result.x).toBeCloseTo(1.0);
      expect(result.y).toBeCloseTo(1.0);
    });
    
    it('should clamp to valid range', () => {
      const result = normalizeTilt(10, -10);
      
      expect(result.x).toBe(1);
      expect(result.y).toBe(-1);
    });
  });
  
  describe('calculateScore', () => {
    it('should calculate base score', () => {
      const score = calculateScore(10, 5000, 1);
      
      expect(score).toBeGreaterThan(0);
    });
    
    it('should penalize excessive moves', () => {
      const score1 = calculateScore(20, 5000, 1);
      const score2 = calculateScore(50, 5000, 1);
      
      expect(score2).toBeLessThan(score1);
    });
    
    it('should penalize long time', () => {
      const score1 = calculateScore(20, 5000, 1);
      const score2 = calculateScore(20, 20000, 1);
      
      expect(score2).toBeLessThan(score1);
    });
    
    it('should add level bonus', () => {
      const score1 = calculateScore(20, 5000, 1);
      const score2 = calculateScore(20, 5000, 2);
      
      expect(score2).toBeGreaterThan(score1);
    });
    
    it('should not return negative score', () => {
      const score = calculateScore(1000, 100000, 1);
      
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('getCurrentMaze', () => {
    it('should return maze for valid level', () => {
      const maze = getCurrentMaze(1);
      
      expect(maze).toBeDefined();
      expect(maze.walls).toBeDefined();
      expect(maze.start).toBeDefined();
      expect(maze.goal).toBeDefined();
    });
    
    it('should return different mazes for different levels', () => {
      const maze1 = getCurrentMaze(1);
      const maze2 = getCurrentMaze(2);
      
      expect(maze1.walls.length).not.toBe(maze2.walls.length);
    });
    
    it('should return first maze for invalid level', () => {
      const maze = getCurrentMaze(999);
      const maze1 = getCurrentMaze(1);
      
      expect(maze).toEqual(maze1);
    });
  });
  
  describe('MAZES', () => {
    it('should have 3 mazes defined', () => {
      expect(MAZES).toHaveLength(3);
    });
    
    it('should have valid structure for each maze', () => {
      MAZES.forEach((maze, index) => {
        expect(maze.width).toBeGreaterThan(0);
        expect(maze.height).toBeGreaterThan(0);
        expect(maze.start).toBeDefined();
        expect(maze.goal).toBeDefined();
        expect(maze.walls).toBeInstanceOf(Array);
        expect(maze.goal.radius).toBeGreaterThan(0);
      });
    });
    
    it('should have increasing complexity', () => {
      expect(MAZES[0].walls.length).toBeLessThan(MAZES[1].walls.length);
      expect(MAZES[1].walls.length).toBeLessThan(MAZES[2].walls.length);
    });
  });
});
