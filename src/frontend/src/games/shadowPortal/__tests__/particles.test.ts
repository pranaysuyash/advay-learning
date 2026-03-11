/**
 * Shadow Portal - Particle Physics Tests
 *
 * Tests for particle physics simulation, collision detection, and scoring.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  PARTICLE_RADIUS,
  GRAVITY,
  BOUNCE_DAMPING,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  LEVEL_DURATION_SECONDS,
  PORTAL_RADIUS,
  MAX_PARTICLES,
  WIND_FORCE,
  generateParticleId,
  createParticle,
  createParticles,
  applyGravity,
  updateParticlePosition,
  applyWindForce,
  bounceOffAxis,
  constrainToBounds,
  distance,
  checkPortalCollision,
  checkBarrierCollision,
  pushFromBarrier,
  checkObstacleCollision,
  bounceOffObstacle,
  updateMovingObstacle,
  createLevelObstacles,
  calculatePortalScore,
  calculateTimeBonus,
  areAllPortalsFull,
  getTotalPortalCount,
  getTotalPortalTarget,
  createPortalsFromConfig,
  DEFAULT_LEVELS,
  type Particle,
  type Portal,
  type Obstacle,
  type Vector2D,
  type LevelConfig,
} from '../particles';

describe('Constants', () => {
  it('should have defined particle radius', () => {
    expect(PARTICLE_RADIUS).toBe(8);
  });

  it('should have defined gravity', () => {
    expect(GRAVITY).toBe(0.15);
  });

  it('should have defined bounce damping', () => {
    expect(BOUNCE_DAMPING).toBe(0.6);
  });

  it('should have defined canvas dimensions', () => {
    expect(CANVAS_WIDTH).toBe(800);
    expect(CANVAS_HEIGHT).toBe(600);
  });

  it('should have defined level duration', () => {
    expect(LEVEL_DURATION_SECONDS).toBe(60);
  });

  it('should have defined portal radius', () => {
    expect(PORTAL_RADIUS).toBe(60);
  });

  it('should have defined max particles', () => {
    expect(MAX_PARTICLES).toBe(100);
  });

  it('should have defined wind force', () => {
    expect(WIND_FORCE.x).toBe(0);
    expect(WIND_FORCE.y).toBe(-3);
  });
});

describe('generateParticleId', () => {
  let originalDateNow: () => number;

  beforeEach(() => {
    originalDateNow = Date.now;
    vi.useRealTimers();
  });

  afterEach(() => {
    Date.now = originalDateNow;
  });

  it('should generate unique IDs', () => {
    const id1 = generateParticleId();
    const id2 = generateParticleId();
    expect(id2).toBeGreaterThan(id1);
  });

  it('should increment IDs on each call', () => {
    const ids = [];
    for (let i = 0; i < 5; i++) {
      ids.push(generateParticleId());
    }
    // IDs should be monotonically increasing
    for (let i = 1; i < ids.length; i++) {
      expect(ids[i]).toBeGreaterThan(ids[i - 1]);
    }
  });
});

describe('createParticle', () => {
  it('should create particle with correct properties', () => {
    const particle = createParticle(100, 200, 1.5);
    expect(particle.id).toBeGreaterThan(0);
    expect(particle.x).toBe(100);
    expect(particle.y).toBe(200);
    expect(particle.active).toBe(true);
    expect(particle.inPortal).toBe(false);
    expect(typeof particle.vx).toBe('number');
    expect(typeof particle.vy).toBe('number');
  });

  it('should have positive vy for positive baseSpeed', () => {
    const particle = createParticle(100, 200, 1.5);
    expect(particle.vy).toBeGreaterThan(0);
  });

  it('should include random offset in vx', () => {
    const particle = createParticle(100, 200, 1.5, 0.5);
    // Random offset should add some variation
    expect(particle.vx).not.toBe(0);
  });

  it('should have vx within expected range with zero random offset', () => {
    const particle = createParticle(100, 200, 1.5, 0);
    // vx = (Math.random() - 0.5) * 0.5 + 0
    // This gives a value between -0.25 and 0.25
    expect(particle.vx).toBeGreaterThanOrEqual(-0.25);
    expect(particle.vx).toBeLessThanOrEqual(0.25);
  });
});

describe('createParticles', () => {
  it('should create specified number of particles', () => {
    const particles = createParticles(5, 1.5, 800);
    expect(particles).toHaveLength(5);
  });

  it('should spawn particles above screen', () => {
    const particles = createParticles(10, 1.5, 800);
    particles.forEach(p => {
      expect(p.y).toBeLessThan(0);
    });
  });

  it('should distribute particles across canvas width', () => {
    const particles = createParticles(50, 1.5, 800);
    const minX = Math.min(...particles.map(p => p.x));
    const maxX = Math.max(...particles.map(p => p.x));
    expect(minX).toBeGreaterThanOrEqual(100);
    expect(maxX).toBeLessThanOrEqual(700);
  });

  it('should create active particles', () => {
    const particles = createParticles(3, 1.5, 800);
    particles.forEach(p => {
      expect(p.active).toBe(true);
    });
  });
});

describe('applyGravity', () => {
  it('should increase vy over time', () => {
    const vy = 0;
    const newVy = applyGravity(vy, 1);
    expect(newVy).toBeGreaterThan(vy);
  });

  it('should apply gravity correctly', () => {
    // GRAVITY = 0.15, dt = 1
    const result = applyGravity(0, 1);
    expect(result).toBe(0.15);
  });

  it('should scale with dt', () => {
    const result1 = applyGravity(0, 1);
    const result2 = applyGravity(0, 2);
    expect(result2).toBe(result1 * 2);
  });
});

describe('updateParticlePosition', () => {
  it('should update x based on vx', () => {
    const particle: Particle = {
      id: 1,
      x: 100,
      y: 200,
      vx: 10,
      vy: 5,
      active: true,
      inPortal: false,
    };
    const updated = updateParticlePosition(particle, 1);
    expect(updated.x).toBe(110);
  });

  it('should update y based on vy', () => {
    const particle: Particle = {
      id: 1,
      x: 100,
      y: 200,
      vx: 5,
      vy: 10,
      active: true,
      inPortal: false,
    };
    const updated = updateParticlePosition(particle, 1);
    expect(updated.y).toBe(210);
  });

  it('should scale with dt', () => {
    const particle: Particle = {
      id: 1,
      x: 100,
      y: 200,
      vx: 10,
      vy: 5,
      active: true,
      inPortal: false,
    };
    const updated1 = updateParticlePosition(particle, 1);
    const updated2 = updateParticlePosition(particle, 2);
    expect(updated2.x - particle.x).toBe((updated1.x - particle.x) * 2);
  });

  it('should preserve other properties', () => {
    const particle: Particle = {
      id: 1,
      x: 100,
      y: 200,
      vx: 10,
      vy: 5,
      active: true,
      inPortal: false,
    };
    const updated = updateParticlePosition(particle, 1);
    expect(updated.id).toBe(1);
    expect(updated.active).toBe(true);
    expect(updated.inPortal).toBe(false);
  });
});

describe('applyWindForce', () => {
  it('should apply wind force to vy', () => {
    const particle: Particle = {
      id: 1,
      x: 100,
      y: 200,
      vx: 0,
      vy: 10,
      active: true,
      inPortal: false,
    };
    const wind: Vector2D = { x: 2, y: -3 };
    const updated = applyWindForce(particle, wind, 1);
    // vy should decrease (wind force is negative)
    expect(updated.vy).toBeLessThan(10);
  });

  it('should apply wind force to vx', () => {
    const particle: Particle = {
      id: 1,
      x: 100,
      y: 200,
      vx: 0,
      vy: 10,
      active: true,
      inPortal: false,
    };
    const wind: Vector2D = { x: 2, y: 0 };
    const updated = applyWindForce(particle, wind, 1);
    expect(updated.vx).toBeGreaterThan(0);
  });

  it('should scale with dt', () => {
    const particle: Particle = {
      id: 1,
      x: 100,
      y: 200,
      vx: 0,
      vy: 10,
      active: true,
      inPortal: false,
    };
    const wind: Vector2D = { x: 2, y: -3 };
    const updated1 = applyWindForce(particle, wind, 1);
    const updated2 = applyWindForce(particle, wind, 2);
    expect(updated2.vy).not.toBe(updated1.vy);
  });
});

describe('bounceOffAxis', () => {
  it('should reverse velocity direction', () => {
    const result = bounceOffAxis(10);
    expect(result).toBe(-10 * BOUNCE_DAMPING);
  });

  it('should apply damping', () => {
    const result = bounceOffAxis(10);
    expect(Math.abs(result)).toBeLessThan(10);
  });

  it('should handle zero velocity', () => {
    const result = bounceOffAxis(0);
    // bounceOffAxis returns velocity * -BOUNCE_DAMPING, which can be -0
    expect(Math.abs(result)).toBe(0);
  });

  it('should handle negative velocity', () => {
    const result = bounceOffAxis(-10);
    expect(result).toBeGreaterThan(-10);
  });
});

describe('constrainToBounds', () => {
  it('should not modify particle within bounds', () => {
    const particle: Particle = {
      id: 1,
      x: 400,
      y: 300,
      vx: 5,
      vy: 5,
      active: true,
      inPortal: false,
    };
    const result = constrainToBounds(particle, 800, 600);
    expect(result.particle.x).toBe(400);
    expect(result.particle.y).toBe(300);
    expect(result.didBounce).toBe(false);
  });

  it('should bounce off left wall', () => {
    const particle: Particle = {
      id: 1,
      x: 0,
      y: 300,
      vx: -5,
      vy: 0,
      active: true,
      inPortal: false,
    };
    const result = constrainToBounds(particle, 800, 600);
    expect(result.particle.x).toBe(PARTICLE_RADIUS);
    expect(result.particle.vx).toBeGreaterThan(-5); // Reversed
    expect(result.didBounce).toBe(true);
  });

  it('should bounce off right wall', () => {
    const particle: Particle = {
      id: 1,
      x: 800,
      y: 300,
      vx: 5,
      vy: 0,
      active: true,
      inPortal: false,
    };
    const result = constrainToBounds(particle, 800, 600);
    expect(result.particle.x).toBe(800 - PARTICLE_RADIUS);
    expect(result.particle.vx).toBeLessThan(5); // Reversed
    expect(result.didBounce).toBe(true);
  });

  it('should bounce off ceiling', () => {
    const particle: Particle = {
      id: 1,
      x: 400,
      y: 0,
      vx: 0,
      vy: -5,
      active: true,
      inPortal: false,
    };
    const result = constrainToBounds(particle, 800, 600);
    expect(result.particle.y).toBe(PARTICLE_RADIUS);
    expect(result.particle.vy).toBeGreaterThan(-5); // Reversed
    expect(result.didBounce).toBe(true);
  });

  it('should bounce off floor', () => {
    const particle: Particle = {
      id: 1,
      x: 400,
      y: 600,
      vx: 0,
      vy: 5,
      active: true,
      inPortal: false,
    };
    const result = constrainToBounds(particle, 800, 600);
    expect(result.particle.y).toBe(600 - PARTICLE_RADIUS);
    expect(result.particle.vy).toBeLessThan(5); // Reversed
    expect(result.didBounce).toBe(true);
  });

  it('should handle corner case (top-left)', () => {
    const particle: Particle = {
      id: 1,
      x: 0,
      y: 0,
      vx: -5,
      vy: -5,
      active: true,
      inPortal: false,
    };
    const result = constrainToBounds(particle, 800, 600);
    expect(result.didBounce).toBe(true);
  });
});

describe('distance', () => {
  it('should calculate distance between two points', () => {
    const dist = distance(0, 0, 3, 4);
    expect(dist).toBe(5); // 3-4-5 triangle
  });

  it('should return 0 for same point', () => {
    const dist = distance(100, 100, 100, 100);
    expect(dist).toBe(0);
  });

  it('should calculate horizontal distance', () => {
    const dist = distance(0, 0, 10, 0);
    expect(dist).toBe(10);
  });

  it('should calculate vertical distance', () => {
    const dist = distance(0, 0, 0, 10);
    expect(dist).toBe(10);
  });
});

describe('checkPortalCollision', () => {
  const particle: Particle = {
    id: 1,
    x: 400,
    y: 300,
    vx: 0,
    vy: 0,
    active: true,
    inPortal: false,
  };

  const portal: Portal = {
    x: 400,
    y: 300,
    radius: 60,
    count: 0,
    target: 10,
  };

  it('should detect collision when particle is at portal center', () => {
    const result = checkPortalCollision(particle, portal);
    expect(result).toBe(true);
  });

  it('should detect collision when particle is near portal edge', () => {
    const nearParticle = { ...particle, x: 400, y: 300 + (60 + 8 * 2 - 1) };
    const result = checkPortalCollision(nearParticle, portal);
    expect(result).toBe(true);
  });

  it('should not detect collision when particle is far from portal', () => {
    const farParticle = { ...particle, x: 100, y: 100 };
    const result = checkPortalCollision(farParticle, portal);
    expect(result).toBe(false);
  });

  it('should use hitbox multiplier', () => {
    // Distance from portal center: 60 (portal radius) + 16 (2 * PARTICLE_RADIUS) = 76
    const particleAtEdge = { ...particle, x: 400, y: 300 + 76 };
    // With hitboxMultiplier=1: hitRadius = 60 + 8 = 68, collision = false (76 >= 68)
    const result = checkPortalCollision(particleAtEdge, portal, 1);
    expect(result).toBe(false);

    // With hitboxMultiplier=2: hitRadius = 60 + 16 = 76, collision = false (76 < 76 is false)
    // Need a particle slightly inside to test the multiplier
    const particleInside = { ...particle, x: 400, y: 300 + 75 };
    const resultWithMultiplier = checkPortalCollision(particleInside, portal, 2);
    expect(resultWithMultiplier).toBe(true);

    // But with hitboxMultiplier=1, this particle should not collide
    const resultWithoutMultiplier = checkPortalCollision(particleInside, portal, 1);
    expect(resultWithoutMultiplier).toBe(false);
  });
});

describe('checkBarrierCollision', () => {
  const particle: Particle = {
    id: 1,
    x: 400,
    y: 300,
    vx: 0,
    vy: 0,
    active: true,
    inPortal: false,
  };

  const barrier: Vector2D = { x: 400, y: 300 };

  it('should detect collision when particle is at barrier center', () => {
    const result = checkBarrierCollision(particle, barrier, 50);
    expect(result).toBe(true);
  });

  it('should not detect collision when particle is far from barrier', () => {
    const farParticle = { ...particle, x: 100, y: 100 };
    const result = checkBarrierCollision(farParticle, barrier, 50);
    expect(result).toBe(false);
  });

  it('should respect barrier radius', () => {
    const particleAtEdge = { ...particle, x: 400, y: 300 + 49 };
    const result = checkBarrierCollision(particleAtEdge, barrier, 50);
    expect(result).toBe(true);

    const particleOutside = { ...particle, x: 400, y: 300 + 51 };
    const resultOutside = checkBarrierCollision(particleOutside, barrier, 50);
    expect(resultOutside).toBe(false);
  });
});

describe('pushFromBarrier', () => {
  const particle: Particle = {
    id: 1,
    x: 400,
    y: 300,
    vx: 0,
    vy: 0,
    active: true,
    inPortal: false,
  };

  const barrier: Vector2D = { x: 400, y: 300 };

  it('should push particle away from barrier', () => {
    const result = pushFromBarrier(particle, barrier, 5);
    // pushFromBarrier sets velocity away from barrier, but doesn't change position
    // Check that velocity points away from the barrier
    // Particle is at same position as barrier, so angle is 0 (undefined direction)
    // In this case, we verify the function returns a particle with modified velocity
    const speed = Math.sqrt(result.vx ** 2 + result.vy ** 2);
    expect(speed).toBeCloseTo(5, 1);
    // Position should be unchanged
    expect(result.x).toBe(particle.x);
    expect(result.y).toBe(particle.y);
  });

  it('should set velocity based on push speed', () => {
    const result = pushFromBarrier(particle, barrier, 10);
    const speed = Math.sqrt(result.vx ** 2 + result.vy ** 2);
    expect(speed).toBeCloseTo(10, 1);
  });

  it('should use default push speed', () => {
    const result = pushFromBarrier(particle, barrier);
    const speed = Math.sqrt(result.vx ** 2 + result.vy ** 2);
    expect(speed).toBeCloseTo(2, 1);
  });
});

describe('checkObstacleCollision', () => {
  const obstacle: Obstacle = {
    x: 400,
    y: 300,
    width: 100,
    height: 80,
    type: 'static',
  };

  it('should detect collision when particle center is inside obstacle', () => {
    const particle: Particle = {
      id: 1,
      x: 400,
      y: 300,
      vx: 0,
      vy: 0,
      active: true,
      inPortal: false,
    };
    expect(checkObstacleCollision(particle, obstacle)).toBe(true);
  });

  it('should detect collision when particle edge overlaps obstacle', () => {
    const particle: Particle = {
      id: 1,
      x: 400 + 8, // PARTICLE_RADIUS
      y: 300,
      vx: 0,
      vy: 0,
      active: true,
      inPortal: false,
    };
    expect(checkObstacleCollision(particle, obstacle)).toBe(true);
  });

  it('should not detect collision when particle is outside obstacle', () => {
    const particle: Particle = {
      id: 1,
      x: 300,
      y: 200,
      vx: 0,
      vy: 0,
      active: true,
      inPortal: false,
    };
    expect(checkObstacleCollision(particle, obstacle)).toBe(false);
  });
});

describe('bounceOffObstacle', () => {
  const obstacle: Obstacle = {
    x: 400,
    y: 300,
    width: 100,
    height: 80,
    type: 'static',
  };

  it('should bounce off when hitting from left', () => {
    const particle: Particle = {
      id: 1,
      x: 390, // Just left of obstacle (with radius)
      y: 350,
      vx: 10,
      vy: 0,
      active: true,
      inPortal: false,
    };
    const result = bounceOffObstacle(particle, obstacle);
    expect(result.vx).toBeLessThan(0); // Reversed
  });

  it('should bounce off when hitting from right', () => {
    const particle: Particle = {
      id: 1,
      x: 510, // Just right of obstacle
      y: 350,
      vx: -10,
      vy: 0,
      active: true,
      inPortal: false,
    };
    const result = bounceOffObstacle(particle, obstacle);
    expect(result.vx).toBeGreaterThan(0); // Reversed
  });

  it('should bounce off when hitting from top', () => {
    const particle: Particle = {
      id: 1,
      x: 450,
      y: 290, // Just above obstacle
      vx: 0,
      vy: 10,
      active: true,
      inPortal: false,
    };
    const result = bounceOffObstacle(particle, obstacle);
    expect(result.vy).toBeLessThan(0); // Reversed
  });

  it('should bounce off when hitting from bottom', () => {
    const particle: Particle = {
      id: 1,
      x: 450,
      y: 390, // Just below obstacle
      vx: 0,
      vy: -10,
      active: true,
      inPortal: false,
    };
    const result = bounceOffObstacle(particle, obstacle);
    expect(result.vy).toBeGreaterThan(0); // Reversed
  });

  it('should apply damping', () => {
    const particle: Particle = {
      id: 1,
      x: 390,
      y: 350,
      vx: 10,
      vy: 0,
      active: true,
      inPortal: false,
    };
    const result = bounceOffObstacle(particle, obstacle);
    expect(Math.abs(result.vx)).toBeLessThan(10);
  });
});

