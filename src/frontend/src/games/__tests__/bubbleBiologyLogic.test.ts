import { describe, it, expect } from 'vitest';
import {
  initializeGame,
  spawnCell,
  updateCells,
  checkJarCollision,
  calculateScore,
  grabCell,
  releaseCell,
  updateJarFill,
  isLevelComplete,
  getCellAtPoint,
  CELL_TYPES,
  LEVEL_CONFIG,
} from '../bubbleBiologyLogic';

describe('bubbleBiologyLogic', () => {
  describe('initializeGame', () => {
    it('should initialize game with default level 1', () => {
      const state = initializeGame();
      
      expect(state.score).toBe(0);
      expect(state.level).toBe(1);
      expect(state.cellsSorted).toBe(0);
      expect(state.cellsMissed).toBe(0);
      expect(state.currentCells).toEqual([]);
      expect(state.isPlaying).toBe(false);
      expect(state.grabbedCell).toBeNull();
    });
    
    it('should create 3 jars for 3 cell types', () => {
      const state = initializeGame();
      
      expect(state.jars).toHaveLength(3);
      expect(state.jars.map(j => j.type.id)).toEqual(['plant', 'animal', 'bacteria']);
    });
    
    it('should initialize jars with zero fill', () => {
      const state = initializeGame();
      
      state.jars.forEach(jar => {
        expect(jar.fillLevel).toBe(0);
        expect(jar.maxCapacity).toBeGreaterThan(0);
      });
    });
    
    it('should use level config for jar capacity', () => {
      const state = initializeGame(2);
      const config = LEVEL_CONFIG[2];
      
      state.jars.forEach(jar => {
        expect(jar.maxCapacity).toBe(config.jarCapacity);
      });
    });
  });
  
  describe('spawnCell', () => {
    it('should spawn a cell with valid type', () => {
      const cell = spawnCell(800);
      
      expect(cell.id).toBeDefined();
      expect(CELL_TYPES.find(t => t.id === cell.type.id)).toBeDefined();
      expect(cell.x).toBeGreaterThanOrEqual(cell.radius);
      expect(cell.x).toBeLessThanOrEqual(800 - cell.radius);
      expect(cell.y).toBe(-cell.radius);
      expect(cell.isGrabbed).toBe(false);
    });
    
    it('should spawn at random x position', () => {
      const cell1 = spawnCell(800, 1, () => 0.5);
      const cell2 = spawnCell(800, 1, () => 0.8);
      
      expect(cell1.x).not.toBe(cell2.x);
    });
    
    it('should use level config for cell size', () => {
      const cell1 = spawnCell(800, 1);
      const cell2 = spawnCell(800, 2);
      
      const config1 = LEVEL_CONFIG[1];
      const config2 = LEVEL_CONFIG[2];
      
      expect(cell1.radius).toBe(config1.cellRadius);
      expect(cell2.radius).toBe(config2.cellRadius);
    });
  });
  
  describe('updateCells', () => {
    it('should move cells downward', () => {
      const cells = [
        {
          id: 1,
          type: CELL_TYPES[0],
          x: 100,
          y: 50,
          radius: 30,
          speed: 0.5,
          isGrabbed: false,
        },
      ];
      
      const { updatedCells, missedCount } = updateCells(cells, 16, 600);
      
      expect(updatedCells[0].y).toBeGreaterThan(50);
      expect(missedCount).toBe(0);
    });
    
    it('should not move grabbed cells', () => {
      const cells = [
        {
          id: 1,
          type: CELL_TYPES[0],
          x: 100,
          y: 50,
          radius: 30,
          speed: 0.5,
          isGrabbed: true,
        },
      ];
      
      const { updatedCells } = updateCells(cells, 16, 600);
      
      expect(updatedCells[0].y).toBe(50);
    });
    
    it('should count cells that fall off screen as missed', () => {
      const cells = [
        {
          id: 1,
          type: CELL_TYPES[0],
          x: 100,
          y: 650,
          radius: 30,
          speed: 0.5,
          isGrabbed: false,
        },
      ];
      
      const { updatedCells, missedCount } = updateCells(cells, 16, 600);
      
      expect(updatedCells).toHaveLength(0);
      expect(missedCount).toBe(1);
    });
  });
  
  describe('checkJarCollision', () => {
    it('should detect collision when cell is in jar bounds', () => {
      const jar = {
        id: 'plant',
        type: CELL_TYPES[0],
        x: 0.2,
        y: 0.85,
        width: 0.15,
        height: 0.12,
        fillLevel: 0,
        maxCapacity: 5,
      };
      
      const cell = {
        id: 1,
        type: CELL_TYPES[0],
        x: 200,  // Middle of jar (0.2 * 800 + 0.075 * 800)
        y: 530,  // Middle of jar (0.85 * 600 + 0.06 * 600)
        radius: 30,
        speed: 0.5,
        isGrabbed: false,
      };
      
      const result = checkJarCollision(cell, [jar], 800, 600);
      
      expect(result.jar).not.toBeNull();
      expect(result.isCorrect).toBe(true);
    });
    
    it('should return isCorrect false if cell type does not match jar', () => {
      const jar = {
        id: 'plant',
        type: CELL_TYPES[0],
        x: 0.2,
        y: 0.85,
        width: 0.15,
        height: 0.12,
        fillLevel: 0,
        maxCapacity: 5,
      };
      
      const cell = {
        id: 1,
        type: CELL_TYPES[1], // Animal cell
        x: 200,
        y: 530,
        radius: 30,
        speed: 0.5,
        isGrabbed: false,
      };
      
      const result = checkJarCollision(cell, [jar], 800, 600);
      
      expect(result.jar).not.toBeNull();
      expect(result.isCorrect).toBe(false);
    });
    
    it('should return null if no collision', () => {
      const jar = {
        id: 'plant',
        type: CELL_TYPES[0],
        x: 0.2,
        y: 0.85,
        width: 0.15,
        height: 0.12,
        fillLevel: 0,
        maxCapacity: 5,
      };
      
      const cell = {
        id: 1,
        type: CELL_TYPES[0],
        x: 100,  // Outside jar
        y: 100,
        radius: 30,
        speed: 0.5,
        isGrabbed: false,
      };
      
      const result = checkJarCollision(cell, [jar], 800, 600);
      
      expect(result.jar).toBeNull();
    });
  });
  
  describe('calculateScore', () => {
    it('should penalize incorrect placement', () => {
      const score = calculateScore(false, 1, 0);
      expect(score).toBe(-5);
    });
    
    it('should award base points for correct placement', () => {
      const score = calculateScore(true, 1, 0);
      expect(score).toBeGreaterThan(0);
    });
    
    it('should add level bonus', () => {
      const score1 = calculateScore(true, 1, 0);
      const score2 = calculateScore(true, 2, 0);
      
      expect(score2).toBeGreaterThan(score1);
    });
    
    it('should add streak bonus', () => {
      const score1 = calculateScore(true, 1, 1);
      const score2 = calculateScore(true, 1, 5);
      
      expect(score2).toBeGreaterThan(score1);
    });
    
    it('should cap streak bonus at 20', () => {
      const score1 = calculateScore(true, 1, 10);
      const score2 = calculateScore(true, 1, 20);
      
      expect(score2).toBe(score1);
    });
  });
  
  describe('grabCell', () => {
    it('should grab cell when point is within radius', () => {
      const cells = [
        {
          id: 1,
          type: CELL_TYPES[0],
          x: 100,
          y: 100,
          radius: 30,
          speed: 0.5,
          isGrabbed: false,
        },
      ];
      
      const { updatedCells, grabbedCell } = grabCell(cells, 110, 110);
      
      expect(grabbedCell).not.toBeNull();
      expect(grabbedCell?.isGrabbed).toBe(true);
      expect(updatedCells[0].isGrabbed).toBe(true);
    });
    
    it('should not grab cell if point is outside radius', () => {
      const cells = [
        {
          id: 1,
          type: CELL_TYPES[0],
          x: 100,
          y: 100,
          radius: 30,
          speed: 0.5,
          isGrabbed: false,
        },
      ];
      
      const { updatedCells, grabbedCell } = grabCell(cells, 200, 200);
      
      expect(grabbedCell).toBeNull();
      expect(updatedCells[0].isGrabbed).toBe(false);
    });
    
    it('should not grab already grabbed cell', () => {
      const cells = [
        {
          id: 1,
          type: CELL_TYPES[0],
          x: 100,
          y: 100,
          radius: 30,
          speed: 0.5,
          isGrabbed: true,
        },
      ];
      
      const { grabbedCell } = grabCell(cells, 100, 100);
      
      expect(grabbedCell).toBeNull();
    });
  });
  
  describe('releaseCell', () => {
    it('should update cell position and set isGrabbed to false', () => {
      const cell = {
        id: 1,
        type: CELL_TYPES[0],
        x: 100,
        y: 100,
        radius: 30,
        speed: 0.5,
        isGrabbed: true,
      };
      
      const released = releaseCell(cell, 200, 300);
      
      expect(released.x).toBe(200);
      expect(released.y).toBe(300);
      expect(released.isGrabbed).toBe(false);
    });
  });
  
  describe('updateJarFill', () => {
    it('should increment fill level', () => {
      const jar = {
        id: 'plant',
        type: CELL_TYPES[0],
        x: 0.2,
        y: 0.85,
        width: 0.15,
        height: 0.12,
        fillLevel: 0,
        maxCapacity: 5,
      };
      
      const updated = updateJarFill(jar, 1);
      
      expect(updated.fillLevel).toBe(1);
    });
    
    it('should not exceed max capacity', () => {
      const jar = {
        id: 'plant',
        type: CELL_TYPES[0],
        x: 0.2,
        y: 0.85,
        width: 0.15,
        height: 0.12,
        fillLevel: 5,
        maxCapacity: 5,
      };
      
      const updated = updateJarFill(jar, 1);
      
      expect(updated.fillLevel).toBe(5);
    });
  });
  
  describe('isLevelComplete', () => {
    it('should return true when all jars are full', () => {
      const jars = [
        { fillLevel: 5, maxCapacity: 5 } as any,
        { fillLevel: 5, maxCapacity: 5 } as any,
        { fillLevel: 5, maxCapacity: 5 } as any,
      ];
      
      expect(isLevelComplete(jars)).toBe(true);
    });
    
    it('should return false when any jar is not full', () => {
      const jars = [
        { fillLevel: 5, maxCapacity: 5 } as any,
        { fillLevel: 3, maxCapacity: 5 } as any,
        { fillLevel: 5, maxCapacity: 5 } as any,
      ];
      
      expect(isLevelComplete(jars)).toBe(false);
    });
  });
  
  describe('getCellAtPoint', () => {
    it('should return cell when point is within radius', () => {
      const cells = [
        {
          id: 1,
          type: CELL_TYPES[0],
          x: 100,
          y: 100,
          radius: 30,
          speed: 0.5,
          isGrabbed: false,
        },
      ];
      
      const cell = getCellAtPoint(cells, 110, 110);
      
      expect(cell).not.toBeNull();
      expect(cell?.id).toBe(1);
    });
    
    it('should return null when no cell at point', () => {
      const cells = [
        {
          id: 1,
          type: CELL_TYPES[0],
          x: 100,
          y: 100,
          radius: 30,
          speed: 0.5,
          isGrabbed: false,
        },
      ];
      
      const cell = getCellAtPoint(cells, 200, 200);
      
      expect(cell).toBeNull();
    });
  });
});
