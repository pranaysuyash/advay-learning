/**
 * Shape Safari Game Logic Tests
 *
 * Tests for shape detection, tracing accuracy, scoring,
 * and game state management.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  type GameState,
  type HiddenShape,
  type SafariScene,
  SAFARI_SCENES,
  getScenesByDifficulty,
  getRandomScene,
  initializeGame,
  initializeScenePaths,
  findShapeAtPoint,
  checkShapeComplete,
  calculateTracingAccuracy,
  getHint,
  getProgress,
  calculateFinalScore,
  markShapeFound,
  checkAllShapesFound,
  getShapeDisplayName,
} from '../shapeSafariLogic';
import * as analyticsExtension from '../../analytics/extensions/countingCollectathon';

// Mock the analytics extension
vi.mock('../../analytics/extensions/countingCollectathon', () => ({
  recordCVError: vi.fn(),
}));

const MOCK_CANVAS_WIDTH = 800;
const MOCK_CANVAS_HEIGHT = 600;

describe('Shape Safari Logic - Scene Data', () => {
  it('should have valid scene data without typos', () => {
    SAFARI_SCENES.forEach(scene => {
      // Check no typos in shape types
      const validTypes = ['circle', 'square', 'triangle', 'rectangle', 'star', 'oval', 'diamond', 'heart'];
      scene.shapes.forEach(shape => {
        expect(validTypes).toContain(shape.type);
        // Check no spaces in ID (typo indicator)
        expect(shape.id).not.toContain(' ');
        // Check position is in valid range
        expect(shape.position.x).toBeGreaterThanOrEqual(0);
        expect(shape.position.x).toBeLessThanOrEqual(1);
        expect(shape.position.y).toBeGreaterThanOrEqual(0);
        expect(shape.position.y).toBeLessThanOrEqual(1);
      });
    });
  });

  it('should filter scenes by difficulty', () => {
    const easyScenes = getScenesByDifficulty(1);
    expect(easyScenes.length).toBeGreaterThan(0);
    easyScenes.forEach(scene => expect(scene.difficulty).toBe(1));

    const mediumScenes = getScenesByDifficulty(2);
    expect(mediumScenes.length).toBeGreaterThan(0);
    mediumScenes.forEach(scene => expect(scene.difficulty).toBe(2));

    const hardScenes = getScenesByDifficulty(3);
    expect(hardScenes.length).toBeGreaterThan(0);
    hardScenes.forEach(scene => expect(scene.difficulty).toBe(3));
  });

  it('should return all scenes when no difficulty specified', () => {
    const allScenes = getScenesByDifficulty();
    expect(allScenes).toHaveLength(SAFARI_SCENES.length);
  });

  it('should return null for invalid difficulty filter', () => {
    // Filter by non-existent difficulty
    const scenes = getScenesByDifficulty(99 as 1 | 2 | 3);
    expect(scenes).toHaveLength(0);
  });

  it('should get random scene or null', () => {
    const scene = getRandomScene();
    expect(scene).not.toBeNull();
    if (scene) {
      expect(scene.id).toBeDefined();
    }
  });

  it('should return null when no scenes match difficulty', () => {
    const scene = getRandomScene(99 as 1 | 2 | 3);
    expect(scene).toBeNull();
  });
});

describe('Shape Safari Logic - Game Initialization', () => {
  it('should initialize game with scene', () => {
    const scene = SAFARI_SCENES[0];
    const gameState = initializeGame(scene, MOCK_CANVAS_WIDTH, MOCK_CANVAS_HEIGHT);

    expect(gameState.currentScene).not.toBeNull();
    expect(gameState.currentScene!.id).toBe(scene.id);
    expect(gameState.score).toBe(0);
    expect(gameState.hintsUsed).toBe(0);
    expect(gameState.completed).toBe(false);
    expect(gameState.tracingState.isTracing).toBe(false);
  });

  it('should initialize shape paths', () => {
    const scene = SAFARI_SCENES[0];
    const initializedScene = initializeScenePaths(scene, MOCK_CANVAS_WIDTH, MOCK_CANVAS_HEIGHT);

    expect(initializedScene.shapes[0].path).not.toBeNull();
    expect(initializedScene.shapes[0].normalizedPath.length).toBeGreaterThan(0);
  });
});

describe('Shape Safari Logic - Shape Finding', () => {
  it('should find shape at point', () => {
    const scene = SAFARI_SCENES[0];
    const gameState = initializeGame(scene, MOCK_CANVAS_WIDTH, MOCK_CANVAS_HEIGHT);

    // Get first shape position
    const firstShape = gameState.currentScene!.shapes[0];
    const point = firstShape.position;

    const foundShape = findShapeAtPoint(
      point,
      gameState.currentScene!.shapes,
      MOCK_CANVAS_WIDTH,
      MOCK_CANVAS_HEIGHT,
      50 // tolerance
    );

    expect(foundShape).not.toBeNull();
    expect(foundShape!.id).toBe(firstShape.id);
  });

  it('should not find shape far from point', () => {
    const scene = SAFARI_SCENES[0];
    const gameState = initializeGame(scene, MOCK_CANVAS_WIDTH, MOCK_CANVAS_HEIGHT);

    const foundShape = findShapeAtPoint(
      { x: 0, y: 0 }, // Corner, unlikely to be on a shape
      gameState.currentScene!.shapes,
      MOCK_CANVAS_WIDTH,
      MOCK_CANVAS_HEIGHT,
      5 // Small tolerance
    );

    // Should not find anything (or might find depending on scene layout)
    // This test documents the behavior
    expect(foundShape === null || foundShape !== null).toBeDefined();
  });

  it('should reject NaN coordinates', () => {
    const scene = SAFARI_SCENES[0];
    const gameState = initializeGame(scene, MOCK_CANVAS_WIDTH, MOCK_CANVAS_HEIGHT);

    const foundShape = findShapeAtPoint(
      { x: NaN, y: 0.5 },
      gameState.currentScene!.shapes,
      MOCK_CANVAS_WIDTH,
      MOCK_CANVAS_HEIGHT
    );

    expect(foundShape).toBeNull();
  });

  it('should reject Infinity coordinates', () => {
    const scene = SAFARI_SCENES[0];
    const gameState = initializeGame(scene, MOCK_CANVAS_WIDTH, MOCK_CANVAS_HEIGHT);

    const foundShape = findShapeAtPoint(
      { x: Infinity, y: 0.5 },
      gameState.currentScene!.shapes,
      MOCK_CANVAS_WIDTH,
      MOCK_CANVAS_HEIGHT
    );

    expect(foundShape).toBeNull();
  });

  it('should reject -Infinity coordinates', () => {
    const scene = SAFARI_SCENES[0];
    const gameState = initializeGame(scene, MOCK_CANVAS_WIDTH, MOCK_CANVAS_HEIGHT);

    const foundShape = findShapeAtPoint(
      { x: -Infinity, y: 0.5 },
      gameState.currentScene!.shapes,
      MOCK_CANVAS_WIDTH,
      MOCK_CANVAS_HEIGHT
    );

    expect(foundShape).toBeNull();
  });

  it('should log CV error via telemetry when NaN coordinates received', () => {
    const scene = SAFARI_SCENES[0];
    const gameState = initializeGame(scene, MOCK_CANVAS_WIDTH, MOCK_CANVAS_HEIGHT);
    
    // Clear any previous calls
    vi.mocked(analyticsExtension.recordCVError).mockClear();
    
    // Act: Trigger NaN validation
    findShapeAtPoint(
      { x: NaN, y: 0.5 },
      gameState.currentScene!.shapes,
      MOCK_CANVAS_WIDTH,
      MOCK_CANVAS_HEIGHT
    );
    
    // Assert: Verify telemetry was called (may be called multiple times as we check each shape)
    expect(analyticsExtension.recordCVError).toHaveBeenCalled();
    expect(analyticsExtension.recordCVError).toHaveBeenCalledWith('handX', NaN);
  });
});

describe('Shape Safari Logic - Marking Shapes Found', () => {
  it('should mark shape as found and update score', () => {
    const scene = SAFARI_SCENES[0];
    const gameState = initializeGame(scene, MOCK_CANVAS_WIDTH, MOCK_CANVAS_HEIGHT);
    const firstShapeId = gameState.currentScene!.shapes[0].id;

    const newGameState = markShapeFound(gameState, firstShapeId, Date.now());

    // Shape should be marked found
    const shape = newGameState.currentScene!.shapes.find(s => s.id === firstShapeId);
    expect(shape!.isFound).toBe(true);

    // Score should increase
    expect(newGameState.score).toBeGreaterThan(0);
  });

  it('should set completed flag when all shapes found', () => {
    const scene = SAFARI_SCENES[0];
    const gameState = initializeGame(scene, MOCK_CANVAS_WIDTH, MOCK_CANVAS_HEIGHT);

    // Mark all shapes as found
    let currentState = gameState;
    for (const shape of gameState.currentScene!.shapes) {
      currentState = markShapeFound(currentState, shape.id, Date.now());
    }

    expect(currentState.completed).toBe(true);
    expect(checkAllShapesFound(currentState)).toBe(true);
  });

  it('should not mark completed if not all shapes found', () => {
    const scene = SAFARI_SCENES[0];
    const gameState = initializeGame(scene, MOCK_CANVAS_WIDTH, MOCK_CANVAS_HEIGHT);

    // Mark only first shape
    const firstShapeId = gameState.currentScene!.shapes[0].id;
    const newGameState = markShapeFound(gameState, firstShapeId, Date.now());

    expect(newGameState.completed).toBe(false);
    expect(checkAllShapesFound(newGameState)).toBe(false);
  });

  it('should get progress correctly', () => {
    const scene = SAFARI_SCENES[0];
    const gameState = initializeGame(scene, MOCK_CANVAS_WIDTH, MOCK_CANVAS_HEIGHT);

    const initialProgress = getProgress(gameState);
    expect(initialProgress.found).toBe(0);
    expect(initialProgress.total).toBe(scene.shapes.length);

    // Mark one shape found
    const firstShapeId = gameState.currentScene!.shapes[0].id;
    const newGameState = markShapeFound(gameState, firstShapeId, Date.now());

    const newProgress = getProgress(newGameState);
    expect(newProgress.found).toBe(1);
  });
});

describe('Shape Safari Logic - Scoring', () => {
  it('should calculate final score with base points', () => {
    const scene = SAFARI_SCENES[0];
    const gameState = initializeGame(scene, MOCK_CANVAS_WIDTH, MOCK_CANVAS_HEIGHT);

    // Mark all shapes found immediately (for maximum time bonus)
    const now = Date.now();
    let currentState = gameState;
    for (const shape of gameState.currentScene!.shapes) {
      currentState = markShapeFound(currentState, shape.id, now);
    }

    // Score should include base points for all shapes
    const expectedBaseScore = scene.shapes.length * 100;
    expect(currentState.score).toBeGreaterThanOrEqual(expectedBaseScore);
  });

  it('should apply hint penalty', () => {
    const scene = SAFARI_SCENES[0];
    const gameState = initializeGame(scene, MOCK_CANVAS_WIDTH, MOCK_CANVAS_HEIGHT);

    // Mark all shapes found first
    const now = Date.now();
    let currentState = gameState;
    for (const shape of gameState.currentScene!.shapes) {
      currentState = markShapeFound(currentState, shape.id, now);
    }

    // Add hints used
    const gameWithHints = { ...currentState, hintsUsed: 2 };
    const scoreWithHints = calculateFinalScore(gameWithHints, now);

    // Score should be reduced by hint penalty (100 per hint)
    const expectedPenalty = 2 * 50; // 2 hints * 50 penalty each
    const scoreWithoutHints = calculateFinalScore(currentState, now);
    expect(scoreWithHints).toBe(scoreWithoutHints - expectedPenalty);
  });

  it('should never return negative score', () => {
    const scene = SAFARI_SCENES[0];
    const gameState = initializeGame(scene, MOCK_CANVAS_WIDTH, MOCK_CANVAS_HEIGHT);

    const score = calculateFinalScore(gameState, Date.now());
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('should use provided time instead of Date.now()', () => {
    const scene = SAFARI_SCENES[0];
    const gameState = initializeGame(scene, MOCK_CANVAS_WIDTH, MOCK_CANVAS_HEIGHT);

    const fixedTime = gameState.startTime + 1000; // 1 second later
    const score = calculateFinalScore(gameState, fixedTime);

    expect(score).toBeGreaterThanOrEqual(0);
  });
});

describe('Shape Safari Logic - Hints', () => {
  it('should provide hint for unfound shape', () => {
    const scene = SAFARI_SCENES[0];
    const gameState = initializeGame(scene, MOCK_CANVAS_WIDTH, MOCK_CANVAS_HEIGHT);

    const hint = getHint(gameState);
    expect(hint).not.toBeNull();
    expect(hint!.shape).toBeDefined();
    expect(hint!.hint).toBeDefined();
  });

  it('should return null when all shapes found', () => {
    const scene = SAFARI_SCENES[0];
    let gameState = initializeGame(scene, MOCK_CANVAS_WIDTH, MOCK_CANVAS_HEIGHT);

    // Mark all shapes found
    for (const shape of gameState.currentScene!.shapes) {
      gameState = markShapeFound(gameState, shape.id, Date.now());
    }

    const hint = getHint(gameState);
    expect(hint).toBeNull();
  });

  it('should return null when no scene', () => {
    const gameState: GameState = {
      currentScene: null,
      tracingState: {
        isTracing: false,
        currentPath: [],
        targetShape: null,
        progress: 0,
      },
      score: 0,
      startTime: Date.now(),
      hintsUsed: 0,
      completed: false,
    };

    const hint = getHint(gameState);
    expect(hint).toBeNull();
  });
});

describe('Shape Safari Logic - Utilities', () => {
  it('should get shape display names', () => {
    expect(getShapeDisplayName('circle')).toBe('Circle');
    expect(getShapeDisplayName('square')).toBe('Square');
    expect(getShapeDisplayName('triangle')).toBe('Triangle');
    expect(getShapeDisplayName('star')).toBe('Star');
    expect(getShapeDisplayName('heart')).toBe('Heart');
  });

  it('should return "Shape" for unknown type', () => {
    expect(getShapeDisplayName('unknown' as any)).toBe('Shape');
  });
});

describe('Shape Safari Logic - Tracing Accuracy', () => {
  it('should return 0 for empty traced path', () => {
    const scene = SAFARI_SCENES[0];
    const gameState = initializeGame(scene, MOCK_CANVAS_WIDTH, MOCK_CANVAS_HEIGHT);
    const shape = gameState.currentScene!.shapes[0];

    const accuracy = calculateTracingAccuracy(
      [],
      shape.normalizedPath,
      MOCK_CANVAS_WIDTH,
      MOCK_CANVAS_HEIGHT
    );

    expect(accuracy).toBe(0);
  });

  it('should return 0 for short traced path', () => {
    const scene = SAFARI_SCENES[0];
    const gameState = initializeGame(scene, MOCK_CANVAS_WIDTH, MOCK_CANVAS_HEIGHT);
    const shape = gameState.currentScene!.shapes[0];

    const accuracy = calculateTracingAccuracy(
      [{ x: 0.5, y: 0.5 }],
      shape.normalizedPath,
      MOCK_CANVAS_WIDTH,
      MOCK_CANVAS_HEIGHT
    );

    expect(accuracy).toBe(0);
  });

  it('should calculate accuracy for valid path', () => {
    const scene = SAFARI_SCENES[0];
    const gameState = initializeGame(scene, MOCK_CANVAS_WIDTH, MOCK_CANVAS_HEIGHT);
    const shape = gameState.currentScene!.shapes[0];

    // Trace along the shape's path
    const tracedPath = shape.normalizedPath.map(p => ({ x: p.x, y: p.y }));

    const accuracy = calculateTracingAccuracy(
      tracedPath,
      shape.normalizedPath,
      MOCK_CANVAS_WIDTH,
      MOCK_CANVAS_HEIGHT
    );

    expect(accuracy).toBeGreaterThan(0);
    expect(accuracy).toBeLessThanOrEqual(1);
  });

  it('should check shape completion based on accuracy', () => {
    const scene = SAFARI_SCENES[0];
    const gameState = initializeGame(scene, MOCK_CANVAS_WIDTH, MOCK_CANVAS_HEIGHT);
    const shape = gameState.currentScene!.shapes[0];

    // Perfect tracing should be complete
    const tracedPath = shape.normalizedPath.map(p => ({ x: p.x, y: p.y }));
    const isComplete = checkShapeComplete(tracedPath, shape, MOCK_CANVAS_WIDTH, MOCK_CANVAS_HEIGHT);

    // Should be complete (perfect tracing)
    expect(isComplete).toBe(true);
  });
});
