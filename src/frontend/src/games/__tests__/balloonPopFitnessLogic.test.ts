/**
 * Balloon Pop Fitness Game Logic Tests
 *
 * Tests for balloon generation, collision detection, action detection,
 * game state management, scoring, and level progression.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  GAME_CONFIG,
  BALLOON_COLORS,
  BALLOON_ACTIONS,
  generateBalloon,
  updateBalloons,
  shouldSpawnBalloon,
  checkBalloonCollision,
  checkBodyCollisions,
  detectJumpAction,
  detectWaveAction,
  detectClapAction,
  detectAllActions,
  initializeGame,
  processPops,
  updateGameTimer,
  shouldAdvanceLevel,
  advanceLevel,
  getActionText,
  getBalloonEmoji,
  calculateFinalStats,
  type Balloon,
  type PopAction,
} from '../balloonPopFitnessLogic';

describe('GAME_CONFIG', () => {
  it('has correct spawn interval', () => {
    expect(GAME_CONFIG.SPAWN_INTERVAL).toBe(2000);
  });

  it('has 60 second game duration', () => {
    expect(GAME_CONFIG.GAME_DURATION).toBe(60000);
  });

  it('has 2 second combo window', () => {
    expect(GAME_CONFIG.COMBO_WINDOW).toBe(2000);
  });

  it('has defined balloon colors', () => {
    expect(BALLOON_COLORS.red).toBe('#EF4444');
    expect(BALLOON_COLORS.blue).toBe('#3B82F6');
    expect(BALLOON_COLORS.yellow).toBe('#EAB308');
  });

  it('maps colors to actions correctly', () => {
    expect(BALLOON_ACTIONS.red).toBe('jump');
    expect(BALLOON_ACTIONS.blue).toBe('wave');
    expect(BALLOON_ACTIONS.yellow).toBe('clap');
  });
});

describe('generateBalloon', () => {
  it('generates balloon with required properties', () => {
    const balloon = generateBalloon(1);
    expect(balloon.id).toBeDefined();
    expect(balloon.x).toBeGreaterThanOrEqual(0.1);
    expect(balloon.x).toBeLessThanOrEqual(0.9);
    expect(balloon.y).toBe(1.1);
    expect(balloon.size).toBeGreaterThan(0);
    expect(balloon.speed).toBeGreaterThan(0);
    expect(balloon.popped).toBe(false);
  });

  it('generates valid color', () => {
    const balloon = generateBalloon(1);
    expect(['red', 'blue', 'yellow']).toContain(balloon.color);
  });

  it('assigns correct action based on color', () => {
    // Generate many balloons and check color-action mapping
    for (let i = 0; i < 30; i++) {
      const balloon = generateBalloon(1);
      if (balloon.color === 'red') expect(balloon.action).toBe('jump');
      if (balloon.color === 'blue') expect(balloon.action).toBe('wave');
      if (balloon.color === 'yellow') expect(balloon.action).toBe('clap');
    }
  });

  it('speed increases with level', () => {
    const balloon1 = generateBalloon(1);
    const balloon2 = generateBalloon(2);
    const balloon3 = generateBalloon(3);
    expect(balloon2.speed).toBeGreaterThan(balloon1.speed);
    expect(balloon3.speed).toBeGreaterThan(balloon2.speed);
  });

  it('generates unique IDs', () => {
    const balloon1 = generateBalloon(1);
    const balloon2 = generateBalloon(1);
    expect(balloon1.id).not.toBe(balloon2.id);
  });
});

describe('updateBalloons', () => {
  it('moves balloons upward', () => {
    const balloons: Balloon[] = [
      { ...generateBalloon(1), y: 0.5, speed: 0.001, popped: false, id: '1', color: 'red', action: 'jump', createdAt: Date.now() }
    ];
    const deltaTime = 100;
    const updated = updateBalloons(balloons, deltaTime);
    expect(updated[0].y).toBeLessThan(0.5);
  });

  it('removes popped balloons', () => {
    const balloons: Balloon[] = [
      { ...generateBalloon(1), y: 0.5, popped: true, id: '1', color: 'red', action: 'jump', createdAt: Date.now(), speed: 0.001, size: 0.1 }
    ];
    const updated = updateBalloons(balloons, 100);
    expect(updated).toHaveLength(0);
  });

  it('removes off-screen balloons', () => {
    const balloons: Balloon[] = [
      { ...generateBalloon(1), y: -0.3, popped: false, id: '1', color: 'red', action: 'jump', createdAt: Date.now(), speed: 0.001, size: 0.1 }
    ];
    const updated = updateBalloons(balloons, 100);
    expect(updated).toHaveLength(0);
  });

  it('keeps valid balloons', () => {
    const balloons: Balloon[] = [
      { ...generateBalloon(1), y: 0.5, popped: false, id: '1', color: 'red', action: 'jump', createdAt: Date.now(), speed: 0.001, size: 0.1 }
    ];
    const updated = updateBalloons(balloons, 100);
    expect(updated).toHaveLength(1);
  });
});

describe('shouldSpawnBalloon', () => {
  it('spawns when interval passed', () => {
    const lastSpawnTime = Date.now() - 3000;
    const result = shouldSpawnBalloon(lastSpawnTime, 5);
    expect(result).toBe(true);
  });

  it('does not spawn when interval not passed', () => {
    const lastSpawnTime = Date.now() - 1000;
    const result = shouldSpawnBalloon(lastSpawnTime, 5);
    expect(result).toBe(false);
  });

  it('does not spawn when max balloons reached', () => {
    const lastSpawnTime = Date.now() - 3000;
    const result = shouldSpawnBalloon(lastSpawnTime, GAME_CONFIG.MAX_BALLOONS);
    expect(result).toBe(false);
  });

  it('spawns when under max and interval passed', () => {
    const lastSpawnTime = Date.now() - 3000;
    const result = shouldSpawnBalloon(lastSpawnTime, GAME_CONFIG.MAX_BALLOONS - 1);
    expect(result).toBe(true);
  });
});

describe('checkBalloonCollision', () => {
  const balloon: Balloon = {
    id: 'test',
    x: 0.5,
    y: 0.5,
    size: 0.1,
    color: 'red',
    action: 'jump',
    speed: 0.001,
    popped: false,
    createdAt: Date.now(),
  };

  it('detects collision when body point is within threshold', () => {
    const bodyPoint = { x: 0.5, y: 0.5 };
    expect(checkBalloonCollision(balloon, bodyPoint)).toBe(true);
  });

  it('does not detect collision when body point is far', () => {
    const bodyPoint = { x: 0.9, y: 0.9 };
    expect(checkBalloonCollision(balloon, bodyPoint)).toBe(false);
  });

  it('returns false for popped balloon', () => {
    const poppedBalloon = { ...balloon, popped: true };
    const bodyPoint = { x: 0.5, y: 0.5 };
    expect(checkBalloonCollision(poppedBalloon, bodyPoint)).toBe(false);
  });

  it('returns false for null body point', () => {
    expect(checkBalloonCollision(balloon, null)).toBe(false);
  });

  it('detects collision at edge of threshold', () => {
    const bodyPoint = { x: 0.5, y: 0.5 + balloon.size + GAME_CONFIG.POP_THRESHOLD - 0.01 };
    expect(checkBalloonCollision(balloon, bodyPoint)).toBe(true);
  });
});

describe('checkBodyCollisions', () => {
  const balloon: Balloon = {
    id: 'test',
    x: 0.5,
    y: 0.5,
    size: 0.1,
    color: 'red',
    action: 'jump',
    speed: 0.001,
    popped: false,
    createdAt: Date.now(),
  };

  it('detects collision with any body point', () => {
    const bodyPoints = [
      { x: 0.9, y: 0.9 },
      { x: 0.5, y: 0.5 },
    ];
    expect(checkBodyCollisions(balloon, bodyPoints)).toBe(true);
  });

  it('returns false when no points collide', () => {
    const bodyPoints = [
      { x: 0.9, y: 0.9 },
      { x: 0.8, y: 0.8 },
    ];
    expect(checkBodyCollisions(balloon, bodyPoints)).toBe(false);
  });

  it('handles null points in array', () => {
    const bodyPoints = [null, { x: 0.5, y: 0.5 }, null];
    expect(checkBodyCollisions(balloon, bodyPoints)).toBe(true);
  });

  it('returns false for all null points', () => {
    const bodyPoints = [null, null];
    expect(checkBodyCollisions(balloon, bodyPoints)).toBe(false);
  });
});

describe('detectJumpAction', () => {
  it('detects jump when ankles are above hips', () => {
    const landmarks = Array(33).fill({ x: 0.5, y: 0.5 });
    landmarks[23] = { x: 0.5, y: 0.6 }; // left hip
    landmarks[24] = { x: 0.5, y: 0.6 }; // right hip
    landmarks[27] = { x: 0.5, y: 0.3 }; // left ankle (above hips)
    landmarks[28] = { x: 0.5, y: 0.3 }; // right ankle (above hips)

    const result = detectJumpAction(landmarks);
    expect(result.detected).toBe(true);
    expect(result.confidence).toBe(0.8);
  });

  it('does not detect jump when ankles are below hips', () => {
    const landmarks = Array(33).fill({ x: 0.5, y: 0.5 });
    landmarks[23] = { x: 0.5, y: 0.5 }; // left hip
    landmarks[24] = { x: 0.5, y: 0.5 }; // right hip
    landmarks[27] = { x: 0.5, y: 0.8 }; // left ankle (below hips)
    landmarks[28] = { x: 0.5, y: 0.8 }; // right ankle (below hips)

    const result = detectJumpAction(landmarks);
    expect(result.detected).toBe(false);
    expect(result.confidence).toBe(0);
  });

  it('returns not detected for insufficient landmarks', () => {
    const landmarks = Array(10).fill({ x: 0.5, y: 0.5 });
    const result = detectJumpAction(landmarks);
    expect(result.detected).toBe(false);
  });

  it('handles null landmarks gracefully', () => {
    const landmarks = Array(33).fill(null);
    const result = detectJumpAction(landmarks);
    expect(result.detected).toBe(false);
  });
});

describe('detectWaveAction', () => {
  it('detects wave when left wrist is raised', () => {
    const landmarks = Array(17).fill({ x: 0.5, y: 0.5 });
    landmarks[11] = { x: 0.4, y: 0.6 }; // left shoulder
    landmarks[12] = { x: 0.6, y: 0.6 }; // right shoulder
    landmarks[15] = { x: 0.4, y: 0.3 }; // left wrist (raised)
    landmarks[16] = { x: 0.6, y: 0.6 }; // right wrist

    const result = detectWaveAction(landmarks);
    expect(result.detected).toBe(true);
    expect(result.confidence).toBe(0.75);
  });

  it('detects wave when right wrist is raised', () => {
    const landmarks = Array(17).fill({ x: 0.5, y: 0.5 });
    landmarks[11] = { x: 0.4, y: 0.6 }; // left shoulder
    landmarks[12] = { x: 0.6, y: 0.6 }; // right shoulder
    landmarks[15] = { x: 0.4, y: 0.6 }; // left wrist
    landmarks[16] = { x: 0.6, y: 0.3 }; // right wrist (raised)

    const result = detectWaveAction(landmarks);
    expect(result.detected).toBe(true);
  });

  it('does not detect wave when wrists are at shoulder level', () => {
    const landmarks = Array(17).fill({ x: 0.5, y: 0.5 });
    landmarks[11] = { x: 0.4, y: 0.6 }; // left shoulder
    landmarks[12] = { x: 0.6, y: 0.6 }; // right shoulder
    landmarks[15] = { x: 0.4, y: 0.6 }; // left wrist
    landmarks[16] = { x: 0.6, y: 0.6 }; // right wrist

    const result = detectWaveAction(landmarks);
    expect(result.detected).toBe(false);
  });

  it('returns not detected for insufficient landmarks', () => {
    const landmarks = Array(10).fill({ x: 0.5, y: 0.5 });
    const result = detectWaveAction(landmarks);
    expect(result.detected).toBe(false);
  });
});

describe('detectClapAction', () => {
  it('detects clap when hands are close together', () => {
    const landmarks = Array(17).fill({ x: 0.5, y: 0.5 });
    landmarks[15] = { x: 0.5, y: 0.5 }; // left wrist
    landmarks[16] = { x: 0.52, y: 0.5 }; // right wrist (close)

    const result = detectClapAction(landmarks);
    expect(result.detected).toBe(true);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('does not detect clap when hands are far apart', () => {
    const landmarks = Array(17).fill({ x: 0.5, y: 0.5 });
    landmarks[15] = { x: 0.3, y: 0.5 }; // left wrist
    landmarks[16] = { x: 0.7, y: 0.5 }; // right wrist (far)

    const result = detectClapAction(landmarks);
    expect(result.detected).toBe(false);
    expect(result.confidence).toBe(0);
  });

  it('confidence increases as hands get closer', () => {
    const landmarks1 = Array(17).fill({ x: 0.5, y: 0.5 });
    landmarks1[15] = { x: 0.5, y: 0.5 };
    landmarks1[16] = { x: 0.55, y: 0.5 };

    const landmarks2 = Array(17).fill({ x: 0.5, y: 0.5 });
    landmarks2[15] = { x: 0.5, y: 0.5 };
    landmarks2[16] = { x: 0.51, y: 0.5 };

    const result1 = detectClapAction(landmarks1);
    const result2 = detectClapAction(landmarks2);

    if (result1.detected && result2.detected) {
      expect(result2.confidence).toBeGreaterThan(result1.confidence);
    }
  });

  it('returns not detected for insufficient landmarks', () => {
    const landmarks = Array(10).fill({ x: 0.5, y: 0.5 });
    const result = detectClapAction(landmarks);
    expect(result.detected).toBe(false);
  });
});

describe('detectAllActions', () => {
  it('detects all three action types', () => {
    const landmarks = Array(33).fill({ x: 0.5, y: 0.5 });
    const actions = detectAllActions(landmarks);
    expect(actions).toHaveLength(3);
    expect(actions.map(a => a.type)).toEqual(['jump', 'wave', 'clap']);
  });

  it('all actions have required properties', () => {
    const landmarks = Array(33).fill({ x: 0.5, y: 0.5 });
    const actions = detectAllActions(landmarks);

    actions.forEach(action => {
      expect(action.type).toBeDefined();
      expect(typeof action.detected).toBe('boolean');
      expect(typeof action.confidence).toBe('number');
      expect(action.timestamp).toBeDefined();
    });
  });
});

describe('initializeGame', () => {
  it('creates initial game state', () => {
    const state = initializeGame(1);
    expect(state.balloons).toEqual([]);
    expect(state.score).toBe(0);
    expect(state.level).toBe(1);
    expect(state.timeRemaining).toBe(GAME_CONFIG.GAME_DURATION);
    expect(state.gameActive).toBe(true);
    expect(state.combo).toBe(0);
    expect(state.lastPopTime).toBe(0);
  });

  it('accepts custom level', () => {
    const state = initializeGame(3);
    expect(state.level).toBe(3);
  });

  it('defaults to level 1', () => {
    const state = initializeGame();
    expect(state.level).toBe(1);
  });
});

describe('processPops', () => {
  it('pops balloons when matching action detected', () => {
    const state = initializeGame(1);
    const redBalloon: Balloon = {
      id: 'red-1',
      x: 0.5,
      y: 0.5,
      size: 0.1,
      color: 'red',
      action: 'jump',
      speed: 0.001,
      popped: false,
      createdAt: Date.now(),
    };
    state.balloons = [redBalloon];

    const detectedActions: PopAction[] = [
      { type: 'jump', detected: true, confidence: 0.8, timestamp: Date.now() },
    ];

    const result = processPops(state, detectedActions);
    expect(result.updatedState.balloons[0].popped).toBe(true);
    expect(result.poppedBalloons).toHaveLength(1);
  });

  it('does not pop balloon with non-matching action', () => {
    const state = initializeGame(1);
    const redBalloon: Balloon = {
      id: 'red-1',
      x: 0.5,
      y: 0.5,
      size: 0.1,
      color: 'red',
      action: 'jump',
      speed: 0.001,
      popped: false,
      createdAt: Date.now(),
    };
    state.balloons = [redBalloon];

    const detectedActions: PopAction[] = [
      { type: 'wave', detected: true, confidence: 0.8, timestamp: Date.now() },
    ];

    const result = processPops(state, detectedActions);
    expect(result.updatedState.balloons[0].popped).toBe(false);
    expect(result.poppedBalloons).toHaveLength(0);
  });

  it('requires minimum confidence for pop', () => {
    const state = initializeGame(1);
    const redBalloon: Balloon = {
      id: 'red-1',
      x: 0.5,
      y: 0.5,
      size: 0.1,
      color: 'red',
      action: 'jump',
      speed: 0.001,
      popped: false,
      createdAt: Date.now(),
    };
    state.balloons = [redBalloon];

    const detectedActions: PopAction[] = [
      { type: 'jump', detected: true, confidence: 0.3, timestamp: Date.now() },
    ];

    const result = processPops(state, detectedActions);
    expect(result.updatedState.balloons[0].popped).toBe(false);
  });

  it('increases score for popped balloons', () => {
    const state = initializeGame(1);
    const balloon: Balloon = {
      id: 'test',
      x: 0.5,
      y: 0.5,
      size: 0.1,
      color: 'red',
      action: 'jump',
      speed: 0.001,
      popped: false,
      createdAt: Date.now(),
    };
    state.balloons = [balloon];

    const detectedActions: PopAction[] = [
      { type: 'jump', detected: true, confidence: 0.8, timestamp: Date.now() },
    ];

    const result = processPops(state, detectedActions);
    expect(result.updatedState.score).toBeGreaterThan(0);
  });

  it('applies combo multiplier for multiple pops', () => {
    const state = initializeGame(1);
    const balloon1: Balloon = {
      id: 'test1',
      x: 0.3,
      y: 0.5,
      size: 0.1,
      color: 'red',
      action: 'jump',
      speed: 0.001,
      popped: false,
      createdAt: Date.now(),
    };
    const balloon2: Balloon = {
      id: 'test2',
      x: 0.7,
      y: 0.5,
      size: 0.1,
      color: 'blue',
      action: 'wave',
      speed: 0.001,
      popped: false,
      createdAt: Date.now(),
    };
    state.balloons = [balloon1, balloon2];

    const detectedActions: PopAction[] = [
      { type: 'jump', detected: true, confidence: 0.8, timestamp: Date.now() },
      { type: 'wave', detected: true, confidence: 0.8, timestamp: Date.now() },
    ];

    const result = processPops(state, detectedActions);
    expect(result.updatedState.combo).toBe(2);
  });
});

describe('updateGameTimer', () => {
  it('decrements time remaining', () => {
    const state = initializeGame(1);
    const deltaTime = 1000;
    const updated = updateGameTimer(state, deltaTime);
    expect(updated.timeRemaining).toBe(state.timeRemaining - 1000);
  });

  it('sets gameActive to false when time reaches zero', () => {
    const state = initializeGame(1);
    state.timeRemaining = 500;
    const deltaTime = 1000;
    const updated = updateGameTimer(state, deltaTime);
    expect(updated.timeRemaining).toBe(0);
    expect(updated.gameActive).toBe(false);
  });

  it('never goes below zero', () => {
    const state = initializeGame(1);
    state.timeRemaining = 100;
    const deltaTime = 1000;
    const updated = updateGameTimer(state, deltaTime);
    expect(updated.timeRemaining).toBe(0);
  });
});

describe('shouldAdvanceLevel', () => {
  it('does not advance at game start', () => {
    const state = initializeGame(1);
    expect(shouldAdvanceLevel(state)).toBe(false);
  });

  it('advances level 1 at the first level boundary', () => {
    const state = {
      ...initializeGame(1),
      timeRemaining: GAME_CONFIG.GAME_DURATION - GAME_CONFIG.LEVEL_DURATION,
    };
    expect(shouldAdvanceLevel(state)).toBe(true);
  });

  it('does not advance level 2 before the second boundary', () => {
    const state = {
      ...initializeGame(2),
      timeRemaining: GAME_CONFIG.GAME_DURATION - GAME_CONFIG.LEVEL_DURATION - 1000,
    };
    expect(shouldAdvanceLevel(state)).toBe(false);
  });

  it('never advances when the timer has reached zero', () => {
    const state = {
      ...initializeGame(2),
      timeRemaining: 0,
      gameActive: false,
    };
    expect(shouldAdvanceLevel(state)).toBe(false);
  });

  it('advances after 30 seconds for level 1', () => {
    const state = {
      ...initializeGame(1),
      timeRemaining: GAME_CONFIG.GAME_DURATION - GAME_CONFIG.LEVEL_DURATION,
    };
    expect(shouldAdvanceLevel(state)).toBe(true);
  });
});

describe('advanceLevel', () => {
  it('increments level', () => {
    const state = initializeGame(1);
    const advanced = advanceLevel(state);
    expect(advanced.level).toBe(2);
  });

  it('preserves other state', () => {
    const state = initializeGame(1);
    state.score = 100;
    state.combo = 3;
    const advanced = advanceLevel(state);
    expect(advanced.score).toBe(100);
    expect(advanced.combo).toBe(3);
  });
});

describe('getActionText', () => {
  it('returns correct text for jump', () => {
    expect(getActionText('jump')).toBe('🔴 Jump and touch!');
  });

  it('returns correct text for wave', () => {
    expect(getActionText('wave')).toBe('🔵 Wave your hand!');
  });

  it('returns correct text for clap', () => {
    expect(getActionText('clap')).toBe('🟡 Clap your hands!');
  });
});

describe('getBalloonEmoji', () => {
  it('returns red emoji for red color', () => {
    expect(getBalloonEmoji('red')).toBe('🔴');
  });

  it('returns blue emoji for blue color', () => {
    expect(getBalloonEmoji('blue')).toBe('🔵');
  });

  it('returns yellow emoji for yellow color', () => {
    expect(getBalloonEmoji('yellow')).toBe('🟡');
  });
});

describe('calculateFinalStats', () => {
  it('calculates final statistics', () => {
    const state = initializeGame(1);
    state.score = 500;
    state.level = 3;
    state.combo = 5;
    state.balloons = [
      { id: '1', x: 0.5, y: 0.5, size: 0.1, color: 'red', action: 'jump', speed: 0.001, popped: true, createdAt: Date.now() },
      { id: '2', x: 0.3, y: 0.5, size: 0.1, color: 'blue', action: 'wave', speed: 0.001, popped: false, createdAt: Date.now() },
    ];

    const stats = calculateFinalStats(state);
    expect(stats.score).toBe(500);
    expect(stats.level).toBe(3);
    expect(stats.maxCombo).toBe(5);
    expect(stats.balloonsPopped).toBe(1);
    expect(stats.accuracy).toBe(50);
  });

  it('handles zero balloons gracefully', () => {
    const state = initializeGame(1);
    state.balloons = [];
    const stats = calculateFinalStats(state);
    expect(stats.accuracy).toBe(0);
  });
});

describe('Balloon Actions Mapping', () => {
  it('red balloons require jump action', () => {
    const balloon = generateBalloon(1);
    // Force red color
    const redBalloon = { ...balloon, color: 'red' as const, action: BALLOON_ACTIONS.red };
    expect(redBalloon.action).toBe('jump');
  });

  it('blue balloons require wave action', () => {
    const balloon = generateBalloon(1);
    const blueBalloon = { ...balloon, color: 'blue' as const, action: BALLOON_ACTIONS.blue };
    expect(blueBalloon.action).toBe('wave');
  });

  it('yellow balloons require clap action', () => {
    const balloon = generateBalloon(1);
    const yellowBalloon = { ...balloon, color: 'yellow' as const, action: BALLOON_ACTIONS.yellow };
    expect(yellowBalloon.action).toBe('clap');
  });
});
