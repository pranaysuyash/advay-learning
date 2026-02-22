import { describe, expect, it, beforeAll } from 'vitest';

import {
  SAFARI_SCENES,
  getRandomScene,
  initializeGame,
  findShapeAtPoint,
  checkShapeComplete,
  getHint,
  checkAllShapesFound,
  getShapeDisplayName,
  getProgress,
  calculateFinalScore,
  getScenesByDifficulty,
} from '../shapeSafariLogic';

// Mock Path2D for Node.js environment
beforeAll(() => {
  if (typeof Path2D === 'undefined') {
    (global as any).Path2D = class Path2D {
      moveTo() {}
      lineTo() {}
      closePath() {}
    };
  }
});

describe('SAFARI_SCENES', () => {
  it('has 5 scene themes', () => {
    expect(SAFARI_SCENES).toHaveLength(5);
  });

  it('each theme has id, name, background, and shapes', () => {
    for (const theme of SAFARI_SCENES) {
      expect(typeof theme.id).toBe('string');
      expect(typeof theme.name).toBe('string');
      expect(typeof theme.background).toBe('string');
      expect(Array.isArray(theme.shapes)).toBe(true);
      expect(theme.shapes.length).toBeGreaterThan(0);
    }
  });
});

describe('getScenesByDifficulty', () => {
  it('returns scenes for difficulty 1', () => {
    const scenes = getScenesByDifficulty(1);
    expect(scenes.length).toBeGreaterThan(0);
  });

  it('returns scenes for difficulty 2', () => {
    const scenes = getScenesByDifficulty(2);
    expect(scenes.length).toBeGreaterThan(0);
  });

  it('returns scenes for difficulty 3', () => {
    const scenes = getScenesByDifficulty(3);
    expect(scenes.length).toBeGreaterThan(0);
  });

  it('returns all scenes when no difficulty specified', () => {
    const scenes = getScenesByDifficulty();
    expect(scenes.length).toBe(SAFARI_SCENES.length);
  });
});

describe('getRandomScene', () => {
  it('returns a valid scene', () => {
    const scene = getRandomScene();
    expect(scene).toHaveProperty('id');
    expect(scene).toHaveProperty('name');
    expect(scene).toHaveProperty('background');
    expect(scene).toHaveProperty('shapes');
    expect(Array.isArray(scene.shapes)).toBe(true);
  });

  it('returns shapes with required properties', () => {
    const scene = getRandomScene();
    for (const shape of scene.shapes) {
      expect(shape).toHaveProperty('type');
      expect(shape).toHaveProperty('normalizedCenter');
      expect(shape).toHaveProperty('normalizedSize');
      expect(shape).toHaveProperty('isFound');
      expect(typeof shape.isFound).toBe('boolean');
    }
  });
});

describe('initializeGame', () => {
  it('returns initial game state', () => {
    const scene = getRandomScene();
    const state = initializeGame(scene, 800, 600);
    
    expect(state).toHaveProperty('currentScene');
    expect(state).toHaveProperty('foundShapes');
    expect(state).toHaveProperty('tracingState');
    expect(state).toHaveProperty('score', 0);
    expect(state).toHaveProperty('hintsUsed', 0);
    expect(state).toHaveProperty('completed', false);
  });

  it('initializes with empty found shapes', () => {
    const scene = getRandomScene();
    const state = initializeGame(scene, 800, 600);
    expect(state.foundShapes.size).toBe(0);
  });

  it('initializes tracing state', () => {
    const scene = getRandomScene();
    const state = initializeGame(scene, 800, 600);
    expect(state.tracingState.isTracing).toBe(false);
    expect(state.tracingState.currentPath).toEqual([]);
    expect(state.tracingState.progress).toBe(0);
  });
});

describe('findShapeAtPoint', () => {
  it('returns null when no shape at point', () => {
    const scene = getRandomScene();
    const shapes = scene.shapes;
    // Point far from any shape
    const result = findShapeAtPoint({ x: 0.99, y: 0.99 }, shapes, 800, 600, 5);
    expect(result).toBeNull();
  });

  it('returns shape when point is near shape', () => {
    const scene = getRandomScene();
    const shapes = scene.shapes;
    const shape = shapes[0];
    // Point near shape center
    const point = {
      x: shape.normalizedCenter.x * 800,
      y: shape.normalizedCenter.y * 600,
    };
    
    const result = findShapeAtPoint(point, shapes, 800, 600, 100);
    expect(result).not.toBeNull();
  });
});

describe('checkShapeComplete', () => {
  it('returns false for empty trace', () => {
    const result = checkShapeComplete([]);
    expect(result).toBe(false);
  });

  it('returns false for trace with few points', () => {
    const result = checkShapeComplete([{ x: 0.5, y: 0.5 }]);
    expect(result).toBe(false);
  });

  it('returns true for trace with many points', () => {
    const trace = Array.from({ length: 50 }, (_, i) => ({
      x: 0.5 + i * 0.01,
      y: 0.5 + i * 0.01,
    }));
    const result = checkShapeComplete(trace);
    expect(result).toBe(true);
  });
});

describe('getHint', () => {
  it('returns null when all shapes found', () => {
    const scene = getRandomScene();
    const state = initializeGame(scene, 800, 600);
    // Mark all shapes as found
    scene.shapes.forEach(s => state.foundShapes.add(s.id));
    
    const hint = getHint(state);
    expect(hint).toBeNull();
  });

  it('returns hint for incomplete game', () => {
    const scene = getRandomScene();
    const state = initializeGame(scene, 800, 600);
    
    const hint = getHint(state);
    expect(hint).not.toBeNull();
    expect(hint).toHaveProperty('shape');
    expect(hint).toHaveProperty('hint');
  });
});

describe('checkAllShapesFound', () => {
  it('returns false when no shapes found', () => {
    const scene = getRandomScene();
    const state = initializeGame(scene, 800, 600);
    expect(checkAllShapesFound(state)).toBe(false);
  });

  it('returns true when all shapes found', () => {
    const scene = getRandomScene();
    const state = initializeGame(scene, 800, 600);
    scene.shapes.forEach(s => {
      state.foundShapes.add(s.id);
      s.isFound = true;
    });
    expect(checkAllShapesFound(state)).toBe(true);
  });
});

describe('getShapeDisplayName', () => {
  it('returns display name for all shape types', () => {
    const shapeTypes = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond', 'oval', 'rectangle'];
    
    for (const type of shapeTypes) {
      const name = getShapeDisplayName(type as any);
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    }
  });

  it('returns "Shape" for unknown type', () => {
    const name = getShapeDisplayName('unknown' as any);
    expect(name).toBe('Shape');
  });
});

describe('getProgress', () => {
  it('returns 0 for new game', () => {
    const scene = getRandomScene();
    const state = initializeGame(scene, 800, 600);
    const progress = getProgress(state);
    expect(progress.found).toBe(0);
  });

  it('returns correct total', () => {
    const scene = getRandomScene();
    const state = initializeGame(scene, 800, 600);
    const progress = getProgress(state);
    expect(progress.total).toBe(scene.shapes.length);
  });

  it('returns correct count when shapes found', () => {
    const scene = getRandomScene();
    const state = initializeGame(scene, 800, 600);
    state.currentScene!.shapes[0].isFound = true;
    const progress = getProgress(state);
    expect(progress.found).toBe(1);
  });
});

describe('calculateFinalScore', () => {
  it('returns base score for empty game', () => {
    const scene = getRandomScene();
    const state = initializeGame(scene, 800, 600);
    state.startTime = Date.now() - 10000; // 10 seconds ago
    const score = calculateFinalScore(state);
    expect(typeof score).toBe('number');
  });

  it('returns higher score with more found shapes', () => {
    const scene = getRandomScene();
    const state1 = initializeGame(scene, 800, 600);
    const state2 = initializeGame(scene, 800, 600);
    
    state1.startTime = Date.now() - 10000;
    state2.startTime = Date.now() - 10000;
    
    // Find some shapes in state2
    state2.foundShapes.add(scene.shapes[0].id);
    
    const score1 = calculateFinalScore(state1);
    const score2 = calculateFinalScore(state2);
    expect(score2).toBeGreaterThan(score1);
  });
});
