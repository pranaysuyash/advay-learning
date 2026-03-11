/**
 * Shadow Portal - Level, Scoring, and Integration Tests
 */

import { describe, it, expect } from 'vitest';
import {
  updateMovingObstacle,
  createLevelObstacles,
  calculatePortalScore,
  calculateTimeBonus,
  areAllPortalsFull,
  getTotalPortalCount,
  getTotalPortalTarget,
  createPortalsFromConfig,
  DEFAULT_LEVELS,
  applyGravity,
  updateParticlePosition,
  constrainToBounds,
  checkPortalCollision,
  type Particle,
  type Portal,
  type Obstacle,
  type Vector2D,
  type LevelConfig,
} from '../particles';

describe('updateMovingObstacle', () => {
  it('should return static obstacle unchanged', () => {
    const obstacle: Obstacle = {
      x: 400,
      y: 300,
      width: 100,
      height: 80,
      type: 'static',
    };
    const result = updateMovingObstacle(obstacle, 1);
    expect(result).toEqual(obstacle);
  });

  it('should move obstacle in positive direction', () => {
    const obstacle: Obstacle = {
      x: 400,
      y: 300,
      width: 100,
      height: 80,
      type: 'moving',
      speed: 10,
      direction: 1,
      minX: 350,
      maxX: 600,
    };
    const result = updateMovingObstacle(obstacle, 1);
    expect(result.x).toBe(410);
  });

  it('should move obstacle in negative direction', () => {
    const obstacle: Obstacle = {
      x: 400,
      y: 300,
      width: 100,
      height: 80,
      type: 'moving',
      speed: 10,
      direction: -1,
      minX: 300,
      maxX: 500,
    };
    const result = updateMovingObstacle(obstacle, 1);
    expect(result.x).toBe(390);
  });

  it('should reverse direction at minX bound', () => {
    const obstacle: Obstacle = {
      x: 150,
      y: 300,
      width: 40,
      height: 150,
      type: 'moving',
      speed: 10,
      direction: -1,
      minX: 150,
    };
    const result = updateMovingObstacle(obstacle, 1);
    expect(result.direction).toBe(1);
  });

  it('should reverse direction at maxX bound', () => {
    const obstacle: Obstacle = {
      x: 310,
      y: 300,
      width: 40,
      height: 150,
      type: 'moving',
      speed: 10,
      direction: 1,
      maxX: 350,
    };
    const result = updateMovingObstacle(obstacle, 1);
    expect(result.direction).toBe(-1);
  });

  it('should clamp position within bounds', () => {
    const obstacle: Obstacle = {
      x: 300,
      y: 300,
      width: 40,
      height: 150,
      type: 'moving',
      speed: 100, // Large speed that would exceed bounds
      direction: 1,
      minX: 150,
      maxX: 350,
    };
    const result = updateMovingObstacle(obstacle, 1);
    expect(result.x).toBeLessThanOrEqual(350 - 40); // maxX - width
    expect(result.x).toBeGreaterThanOrEqual(150);
  });
});

describe('createLevelObstacles', () => {
  it('should return empty array for levels < 3', () => {
    expect(createLevelObstacles(1)).toEqual([]);
    expect(createLevelObstacles(2)).toEqual([]);
  });

  it('should create obstacles for level 3', () => {
    const obstacles = createLevelObstacles(3);
    expect(obstacles).toHaveLength(2);
  });

  it('should create moving obstacles', () => {
    const obstacles = createLevelObstacles(3);
    obstacles.forEach(obs => {
      expect(obs.type).toBe('moving');
    });
  });

  it('should have speed property on obstacles', () => {
    const obstacles = createLevelObstacles(3);
    obstacles.forEach(obs => {
      expect(obs.speed).toBeDefined();
    });
  });

  it('should have minX and maxX bounds', () => {
    const obstacles = createLevelObstacles(3);
    obstacles.forEach(obs => {
      expect(obs.minX).toBeDefined();
      expect(obs.maxX).toBeDefined();
    });
  });
});

describe('calculatePortalScore', () => {
  it('should return base points with no streak', () => {
    const score = calculatePortalScore(10, 0);
    expect(score).toBe(10);
  });

  it('should add streak bonus', () => {
    const score = calculatePortalScore(10, 3);
    // 10 + (3 * 5) = 25
    expect(score).toBe(25);
  });

  it('should cap streak bonus', () => {
    const score = calculatePortalScore(10, 10);
    // 10 + 25 (capped) = 35
    expect(score).toBe(35);
  });

  it('should use default values', () => {
    const score = calculatePortalScore();
    expect(score).toBe(1); // basePoints default
  });

  it('should scale with base points', () => {
    const score1 = calculatePortalScore(10, 0);
    const score2 = calculatePortalScore(20, 0);
    expect(score2).toBe(2 * score1);
  });
});

describe('calculateTimeBonus', () => {
  it('should return 0 for no time remaining', () => {
    expect(calculateTimeBonus(0)).toBe(0);
  });

  it('should calculate bonus based on remaining time', () => {
    const bonus = calculateTimeBonus(10);
    expect(bonus).toBe(50); // 10 * 5
  });

  it('should use default points per second', () => {
    expect(calculateTimeBonus(10)).toBe(50);
  });

  it('should scale with custom points per second', () => {
    const bonus = calculateTimeBonus(10, 10);
    expect(bonus).toBe(100); // 10 * 10
  });
});

describe('areAllPortalsFull', () => {
  it('should return true when all portals are full', () => {
    const portals: Portal[] = [
      { x: 400, y: 500, radius: 60, count: 10, target: 10 },
      { x: 200, y: 500, radius: 60, count: 15, target: 15 },
    ];
    expect(areAllPortalsFull(portals)).toBe(true);
  });

  it('should return false when any portal is not full', () => {
    const portals: Portal[] = [
      { x: 400, y: 500, radius: 60, count: 10, target: 10 },
      { x: 200, y: 500, radius: 60, count: 5, target: 15 },
    ];
    expect(areAllPortalsFull(portals)).toBe(false);
  });

  it('should return true for empty array', () => {
    expect(areAllPortalsFull([])).toBe(true);
  });
});

describe('getTotalPortalCount', () => {
  it('should sum counts across all portals', () => {
    const portals: Portal[] = [
      { x: 400, y: 500, radius: 60, count: 10, target: 10 },
      { x: 200, y: 500, radius: 60, count: 15, target: 15 },
    ];
    expect(getTotalPortalCount(portals)).toBe(25);
  });

  it('should return 0 for empty array', () => {
    expect(getTotalPortalCount([])).toBe(0);
  });
});

describe('getTotalPortalTarget', () => {
  it('should sum targets across all portals', () => {
    const portals: Portal[] = [
      { x: 400, y: 500, radius: 60, count: 10, target: 10 },
      { x: 200, y: 500, radius: 60, count: 15, target: 15 },
    ];
    expect(getTotalPortalTarget(portals)).toBe(25);
  });

  it('should return 0 for empty array', () => {
    expect(getTotalPortalTarget([])).toBe(0);
  });
});

describe('createPortalsFromConfig', () => {
  it('should create portals from config', () => {
    const config: LevelConfig = {
      level: 1,
      portals: [
        { x: 400, y: 500, target: 15 },
        { x: 200, y: 500, target: 20 },
      ],
      particleSpeed: 1.5,
      particleSpawnRate: 400,
      hasObstacle: false,
    };
    const portals = createPortalsFromConfig(config, 60);
    expect(portals).toHaveLength(2);
  });

  it('should set portal properties correctly', () => {
    const config: LevelConfig = {
      level: 1,
      portals: [{ x: 400, y: 500, target: 15 }],
      particleSpeed: 1.5,
      particleSpawnRate: 400,
      hasObstacle: false,
    };
    const portals = createPortalsFromConfig(config, 60);
    expect(portals[0].x).toBe(400);
    expect(portals[0].y).toBe(500);
    expect(portals[0].radius).toBe(60);
    expect(portals[0].count).toBe(0);
    expect(portals[0].target).toBe(15);
  });

  it('should initialize count to 0', () => {
    const config: LevelConfig = {
      level: 1,
      portals: [{ x: 400, y: 500, target: 15 }],
      particleSpeed: 1.5,
      particleSpawnRate: 400,
      hasObstacle: false,
    };
    const portals = createPortalsFromConfig(config, 60);
    portals.forEach(p => {
      expect(p.count).toBe(0);
    });
  });
});

describe('DEFAULT_LEVELS', () => {
  it('should have 3 levels', () => {
    expect(DEFAULT_LEVELS).toHaveLength(3);
  });

  it('level 1 should have one portal', () => {
    expect(DEFAULT_LEVELS[0].level).toBe(1);
    expect(DEFAULT_LEVELS[0].portals).toHaveLength(1);
    expect(DEFAULT_LEVELS[0].hasObstacle).toBe(false);
  });

  it('level 2 should have two portals', () => {
    expect(DEFAULT_LEVELS[1].level).toBe(2);
    expect(DEFAULT_LEVELS[1].portals).toHaveLength(2);
    expect(DEFAULT_LEVELS[1].hasObstacle).toBe(false);
  });

  it('level 3 should have two portals and obstacles', () => {
    expect(DEFAULT_LEVELS[2].level).toBe(3);
    expect(DEFAULT_LEVELS[2].portals).toHaveLength(2);
    expect(DEFAULT_LEVELS[2].hasObstacle).toBe(true);
  });

  it('should have increasing particle speed', () => {
    expect(DEFAULT_LEVELS[0].particleSpeed).toBeLessThan(DEFAULT_LEVELS[1].particleSpeed);
    expect(DEFAULT_LEVELS[1].particleSpeed).toBeLessThan(DEFAULT_LEVELS[2].particleSpeed);
  });

  it('should have decreasing spawn rate', () => {
    expect(DEFAULT_LEVELS[0].particleSpawnRate).toBeGreaterThan(DEFAULT_LEVELS[1].particleSpawnRate);
    expect(DEFAULT_LEVELS[1].particleSpawnRate).toBeGreaterThan(DEFAULT_LEVELS[2].particleSpawnRate);
  });
});

describe('Type Safety', () => {
  it('should accept Particle type', () => {
    const particle: Particle = {
      id: 1,
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      active: true,
      inPortal: false,
    };
    expect(typeof particle.id).toBe('number');
    expect(typeof particle.x).toBe('number');
    expect(typeof particle.active).toBe('boolean');
  });

  it('should accept Portal type', () => {
    const portal: Portal = {
      x: 400,
      y: 500,
      radius: 60,
      count: 0,
      target: 10,
    };
    expect(typeof portal.x).toBe('number');
    expect(typeof portal.count).toBe('number');
  });

  it('should accept Obstacle type', () => {
    const obstacle: Obstacle = {
      x: 400,
      y: 300,
      width: 100,
      height: 80,
      type: 'static',
    };
    expect(typeof obstacle.width).toBe('number');
    expect(['static', 'moving']).toContain(obstacle.type);
  });

  it('should accept Vector2D type', () => {
    const vector: Vector2D = { x: 1, y: 2 };
    expect(typeof vector.x).toBe('number');
    expect(typeof vector.y).toBe('number');
  });
});

describe('Integration - Particle Lifecycle', () => {
  it('should simulate particle falling and bouncing', () => {
    let particle: Particle = {
      id: 1,
      x: 400,
      y: 100,
      vx: 0,
      vy: 0,
      active: true,
      inPortal: false,
    };

    // Apply gravity multiple times to accelerate
    particle.vy = applyGravity(particle.vy, 60); // 60 frames of gravity

    // Update position (falling down)
    particle = updateParticlePosition(particle, 1);
    expect(particle.y).toBeGreaterThan(100);

    // Set particle position to near floor to test bounce
    particle.y = 595; // Just above the floor (600 - PARTICLE_RADIUS = 592)

    // Hit floor and bounce
    const result = constrainToBounds(particle, 800, 600);
    expect(result.didBounce).toBe(true);
    expect(result.particle.vy).toBeLessThan(0); // Reversed
  });

  it('should handle particle entering portal', () => {
    const particle: Particle = {
      id: 1,
      x: 400,
      y: 500,
      vx: 0,
      vy: 0,
      active: true,
      inPortal: false,
    };

    const portal: Portal = {
      x: 400,
      y: 500,
      radius: 60,
      count: 0,
      target: 10,
    };

    expect(checkPortalCollision(particle, portal)).toBe(true);
  });

  it('should calculate total score for level completion', () => {
    const portals: Portal[] = [
      { x: 400, y: 500, radius: 60, count: 15, target: 15 },
      { x: 200, y: 500, radius: 60, count: 20, target: 20 },
    ];

    const portalScore = calculatePortalScore(1, 5); // 1 + 25 = 26
    const totalPortalScore = portalScore * getTotalPortalCount(portals); // 26 * 35
    const timeBonus = calculateTimeBonus(30); // 30 * 5 = 150

    expect(getTotalPortalCount(portals)).toBe(35);
    expect(getTotalPortalTarget(portals)).toBe(35);
    expect(areAllPortalsFull(portals)).toBe(true);
    expect(totalPortalScore + timeBonus).toBeGreaterThan(0);
  });
});
