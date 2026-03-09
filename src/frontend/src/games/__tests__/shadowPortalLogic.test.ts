/**
 * Shadow Portal - Particle Logic Tests
 *
 * @spec docs/games/shadow-portal-spec.md
 */

import { describe, it, expect } from 'vitest';
import {
  createParticle,
  createParticles,
  generateParticleId,
  applyGravity,
  updateParticlePosition,
  applyWindForce,
  bounceOffAxis,
  constrainToBounds,
  distance,
  checkPortalCollision,
  checkBarrierCollision,
  pushFromBarrier,
  calculatePortalScore,
  calculateTimeBonus,
  areAllPortalsFull,
  getTotalPortalCount,
  getTotalPortalTarget,
  createPortalsFromConfig,
  createLevelObstacles,
  checkObstacleCollision,
  bounceOffObstacle,
  updateMovingObstacle,
  DEFAULT_LEVELS,
  PARTICLE_RADIUS,
  GRAVITY,
  BOUNCE_DAMPING,
  WIND_FORCE,
  PORTAL_RADIUS,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  type Particle,
  type Portal,
  type Obstacle,
} from '../shadowPortal/particles';

describe('Shadow Portal - Particle Logic', () => {
  describe('Particle Creation', () => {
    it('should create a particle with unique ID', () => {
      const p1 = createParticle(100, 200, 2);
      const p2 = createParticle(100, 200, 2);
      expect(p1.id).not.toBe(p2.id);
    });

    it('should create particle at specified position', () => {
      const particle = createParticle(150, 300, 2);
      expect(particle.x).toBe(150);
      expect(particle.y).toBe(300);
    });

    it('should create particle with active state', () => {
      const particle = createParticle(100, 200, 2);
      expect(particle.active).toBe(true);
      expect(particle.inPortal).toBe(false);
    });

    it('should create multiple particles', () => {
      const particles = createParticles(5, 2, 800);
      expect(particles).toHaveLength(5);
      particles.forEach(p => {
        expect(p.active).toBe(true);
        expect(p.y).toBeLessThan(0); // Above screen
      });
    });
  });

  describe('Physics', () => {
    it('should apply gravity to velocity', () => {
      const vy = 0;
      const dt = 1; // Normalized to 60fps
      const newVy = applyGravity(vy, dt);
      expect(newVy).toBe(GRAVITY);
    });

    it('should update particle position based on velocity', () => {
      const particle: Particle = {
        id: 1,
        x: 100,
        y: 100,
        vx: 10,
        vy: 5,
        active: true,
        inPortal: false,
      };
      const updated = updateParticlePosition(particle, 1);
      expect(updated.x).toBe(110);
      expect(updated.y).toBe(105);
    });

    it('should bounce velocity with damping', () => {
      const velocity = 10;
      const bounced = bounceOffAxis(velocity);
      expect(bounced).toBe(-10 * BOUNCE_DAMPING);
    });

    it('should apply wind force to particle', () => {
      const particle: Particle = {
        id: 1,
        x: 400,
        y: 300,
        vx: 0,
        vy: 0,
        active: true,
        inPortal: false,
      };
      const updated = applyWindForce(particle, WIND_FORCE, 1);
      expect(updated.vy).toBeLessThan(0); // Should push upward
    });
  });

  describe('Boundary Constraints', () => {
    it('should constrain particle within canvas bounds', () => {
      const particle: Particle = {
        id: 1,
        x: -10, // Outside left
        y: 300,
        vx: -5,
        vy: 0,
        active: true,
        inPortal: false,
      };
      const { particle: constrained, didBounce } = constrainToBounds(
        particle,
        CANVAS_WIDTH,
        CANVAS_HEIGHT
      );
      expect(constrained.x).toBe(PARTICLE_RADIUS);
      expect(constrained.vx).toBeGreaterThan(0); // Reversed
      expect(didBounce).toBe(true);
    });

    it('should constrain particle at right wall', () => {
      const particle: Particle = {
        id: 1,
        x: CANVAS_WIDTH + 10, // Outside right
        y: 300,
        vx: 5,
        vy: 0,
        active: true,
        inPortal: false,
      };
      const { particle: constrained } = constrainToBounds(
        particle,
        CANVAS_WIDTH,
        CANVAS_HEIGHT
      );
      expect(constrained.x).toBe(CANVAS_WIDTH - PARTICLE_RADIUS);
      expect(constrained.vx).toBeLessThan(0); // Reversed
    });

    it('should constrain particle at floor', () => {
      const particle: Particle = {
        id: 1,
        x: 400,
        y: CANVAS_HEIGHT + 10, // Below floor
        vx: 0,
        vy: 5,
        active: true,
        inPortal: false,
      };
      const { particle: constrained } = constrainToBounds(
        particle,
        CANVAS_WIDTH,
        CANVAS_HEIGHT
      );
      expect(constrained.y).toBe(CANVAS_HEIGHT - PARTICLE_RADIUS);
      expect(constrained.vy).toBeLessThan(0); // Reversed
    });

    it('should not constrain particle already within bounds', () => {
      const particle: Particle = {
        id: 1,
        x: 400,
        y: 300,
        vx: 0,
        vy: 0,
        active: true,
        inPortal: false,
      };
      const { didBounce } = constrainToBounds(particle, CANVAS_WIDTH, CANVAS_HEIGHT);
      expect(didBounce).toBe(false);
    });
  });

  describe('Collision Detection', () => {
    it('should calculate distance between two points', () => {
      const dist = distance(0, 0, 3, 4);
      expect(dist).toBe(5);
    });

    it('should detect collision with portal', () => {
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
        radius: PORTAL_RADIUS,
        count: 0,
        target: 10,
      };
      expect(checkPortalCollision(particle, portal)).toBe(true);
    });

    it('should not detect collision when particle is far from portal', () => {
      const particle: Particle = {
        id: 1,
        x: 100,
        y: 100,
        vx: 0,
        vy: 0,
        active: true,
        inPortal: false,
      };
      const portal: Portal = {
        x: 400,
        y: 500,
        radius: PORTAL_RADIUS,
        count: 0,
        target: 10,
      };
      expect(checkPortalCollision(particle, portal)).toBe(false);
    });

    it('should use generous hitbox (2x radius) for portal collision', () => {
      const particle: Particle = {
        id: 1,
        x: 400,
        y: 500 + PORTAL_RADIUS + PARTICLE_RADIUS * 1.5, // Just inside 2x hitbox
        vx: 0,
        vy: 0,
        active: true,
        inPortal: false,
      };
      const portal: Portal = {
        x: 400,
        y: 500,
        radius: PORTAL_RADIUS,
        count: 0,
        target: 10,
      };
      expect(checkPortalCollision(particle, portal, 2)).toBe(true);
    });

    it('should detect collision with barrier', () => {
      const particle: Particle = {
        id: 1,
        x: 400,
        y: 300,
        vx: 0,
        vy: 0,
        active: true,
        inPortal: false,
      };
      const barrier = { x: 400, y: 300 };
      expect(checkBarrierCollision(particle, barrier, 60)).toBe(true);
    });

    it('should push particle away from barrier', () => {
      const particle: Particle = {
        id: 1,
        x: 400,
        y: 300,
        vx: 0,
        vy: 0,
        active: true,
        inPortal: false,
      };
      const barrier = { x: 380, y: 300 }; // Particle is to the right
      const pushed = pushFromBarrier(particle, barrier);
      expect(pushed.vx).toBeGreaterThan(0); // Pushed right
    });
  });

  describe('Scoring', () => {
    it('should calculate base score without streak', () => {
      const score = calculatePortalScore(1, 0);
      expect(score).toBe(1);
    });

    it('should calculate score with streak bonus', () => {
      const score = calculatePortalScore(1, 5);
      expect(score).toBe(1 + 25); // 1 + (5 * 5)
    });

    it('should cap streak bonus at maximum', () => {
      const score = calculatePortalScore(1, 10, 25, 5);
      expect(score).toBe(26); // 1 + 25 (capped)
    });

    it('should calculate time bonus', () => {
      const bonus = calculateTimeBonus(30, 5);
      expect(bonus).toBe(150); // 30 * 5
    });

    it('should return zero time bonus when no time remaining', () => {
      const bonus = calculateTimeBonus(0);
      expect(bonus).toBe(0);
    });

    it('should not return negative time bonus', () => {
      const bonus = calculateTimeBonus(-10);
      expect(bonus).toBe(0);
    });
  });

  describe('Level Progression', () => {
    it('should detect when all portals are full', () => {
      const portals: Portal[] = [
        { x: 200, y: 500, radius: 60, count: 10, target: 10 },
        { x: 600, y: 500, radius: 60, count: 10, target: 10 },
      ];
      expect(areAllPortalsFull(portals)).toBe(true);
    });

    it('should detect when not all portals are full', () => {
      const portals: Portal[] = [
        { x: 200, y: 500, radius: 60, count: 10, target: 10 },
        { x: 600, y: 500, radius: 60, count: 5, target: 10 },
      ];
      expect(areAllPortalsFull(portals)).toBe(false);
    });

    it('should calculate total portal count', () => {
      const portals: Portal[] = [
        { x: 200, y: 500, radius: 60, count: 10, target: 10 },
        { x: 600, y: 500, radius: 60, count: 5, target: 10 },
      ];
      expect(getTotalPortalCount(portals)).toBe(15);
    });

    it('should calculate total target count', () => {
      const portals: Portal[] = [
        { x: 200, y: 500, radius: 60, count: 0, target: 15 },
        { x: 600, y: 500, radius: 60, count: 0, target: 20 },
      ];
      expect(getTotalPortalTarget(portals)).toBe(35);
    });

    it('should create portals from level config', () => {
      const config = DEFAULT_LEVELS[0];
      const portals = createPortalsFromConfig(config, 60);
      expect(portals).toHaveLength(1);
      expect(portals[0].target).toBe(15);
      expect(portals[0].count).toBe(0);
      expect(portals[0].radius).toBe(60);
    });

    it('should have 3 default levels', () => {
      expect(DEFAULT_LEVELS).toHaveLength(3);
      expect(DEFAULT_LEVELS[0].level).toBe(1);
      expect(DEFAULT_LEVELS[1].level).toBe(2);
      expect(DEFAULT_LEVELS[2].level).toBe(3);
    });

    it('should increase difficulty across levels', () => {
      const level1 = DEFAULT_LEVELS[0];
      const level2 = DEFAULT_LEVELS[1];
      const level3 = DEFAULT_LEVELS[2];

      expect(level2.particleSpeed).toBeGreaterThan(level1.particleSpeed);
      expect(level3.particleSpeed).toBeGreaterThan(level2.particleSpeed);

      expect(level2.particleSpawnRate).toBeLessThan(level1.particleSpawnRate);
      expect(level3.particleSpawnRate).toBeLessThan(level2.particleSpawnRate);
    });
  });

  describe('Obstacles', () => {
    it('should detect collision with rectangular obstacle', () => {
      const particle: Particle = {
        id: 1,
        x: 300,
        y: 300,
        vx: 0,
        vy: 0,
        active: true,
        inPortal: false,
      };
      const obstacle = {
        x: 280,
        y: 280,
        width: 40,
        height: 40,
        type: 'static' as const,
      };
      expect(checkObstacleCollision(particle, obstacle)).toBe(true);
    });

    it('should not detect collision when particle is outside obstacle', () => {
      const particle: Particle = {
        id: 1,
        x: 200,
        y: 200,
        vx: 0,
        vy: 0,
        active: true,
        inPortal: false,
      };
      const obstacle = {
        x: 300,
        y: 300,
        width: 40,
        height: 40,
        type: 'static' as const,
      };
      expect(checkObstacleCollision(particle, obstacle)).toBe(false);
    });

    it('should bounce particle off obstacle from the left', () => {
      const particle: Particle = {
        id: 1,
        x: 275, // About to hit obstacle from left
        y: 300,
        vx: 5,
        vy: 0,
        active: true,
        inPortal: false,
      };
      const obstacle = {
        x: 280,
        y: 280,
        width: 40,
        height: 40,
        type: 'static' as const,
      };
      const bounced = bounceOffObstacle(particle, obstacle);
      expect(bounced.vx).toBeLessThan(0); // Reversed
    });

    it('should bounce particle off obstacle from the top', () => {
      const particle: Particle = {
        id: 1,
        x: 300,
        y: 275, // About to hit obstacle from top
        vx: 0,
        vy: 5,
        active: true,
        inPortal: false,
      };
      const obstacle = {
        x: 280,
        y: 280,
        width: 40,
        height: 40,
        type: 'static' as const,
      };
      const bounced = bounceOffObstacle(particle, obstacle);
      expect(bounced.vy).toBeLessThan(0); // Reversed
    });

    it('should update moving obstacle position', () => {
      const obstacle = {
        x: 200,
        y: 200,
        width: 40,
        height: 40,
        type: 'moving' as const,
        speed: 1,
        direction: 1 as 1 | -1,
        minX: 150,
        maxX: 400,
      };
      const updated = updateMovingObstacle(obstacle, 10); // dt = 10
      expect(updated.x).toBeGreaterThan(200); // Moved right
    });

    it('should reverse moving obstacle direction at bounds', () => {
      const obstacle = {
        x: 395, // Near maxX (400)
        y: 200,
        width: 40,
        height: 40,
        type: 'moving' as const,
        speed: 1,
        direction: 1 as 1 | -1,
        minX: 150,
        maxX: 400,
      };
      const updated = updateMovingObstacle(obstacle, 10);
      expect(updated.direction).toBe(-1); // Reversed
    });

    it('should create obstacles for level 3 only', () => {
      const level1Obstacles = createLevelObstacles(1);
      const level2Obstacles = createLevelObstacles(2);
      const level3Obstacles = createLevelObstacles(3);

      expect(level1Obstacles).toHaveLength(0);
      expect(level2Obstacles).toHaveLength(0);
      expect(level3Obstacles.length).toBeGreaterThan(0);
    });

    it('should create two moving obstacles for level 3', () => {
      const obstacles = createLevelObstacles(3);
      expect(obstacles).toHaveLength(2);
      expect(obstacles.every(o => o.type === 'moving')).toBe(true);
    });
  });

  describe('Constants', () => {
    it('should have defined canvas dimensions', () => {
      expect(CANVAS_WIDTH).toBe(800);
      expect(CANVAS_HEIGHT).toBe(600);
    });

    it('should have defined game constants', () => {
      expect(PARTICLE_RADIUS).toBe(8);
      expect(GRAVITY).toBe(0.15);
      expect(BOUNCE_DAMPING).toBe(0.6);
      expect(PORTAL_RADIUS).toBe(60);
    });

    it('should have wind force pushing upward', () => {
      expect(WIND_FORCE.x).toBe(0);
      expect(WIND_FORCE.y).toBeLessThan(0);
    });
  });
});
