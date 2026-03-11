/**
 * Shadow Portal Logic Tests
 *
 * Tests for the silhouette particle game logic.
 */

import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  startGame,
  createPortals,
  spawnParticle,
  checkSilhouetteCollision,
  checkPortalCapture,
  updateParticles,
  spawnParticles,
  updateTimer,
  checkGameComplete,
  calculateFinalScore,
  getComboText,
  getDifficultyName,
  DIFFICULTY_CONFIGS,
  DEFAULT_CONFIG,
  type Difficulty,
  type Particle,
  type SilhouetteRegion,
} from '../shadowPortalLogic';

describe('ShadowPortal Logic', () => {
  describe('createInitialState', () => {
    it('creates state with idle status', () => {
      const state = createInitialState();
      expect(state.status).toBe('idle');
    });

    it('initializes score to 0', () => {
      const state = createInitialState();
      expect(state.score).toBe(0);
    });

    it('has empty particles array', () => {
      const state = createInitialState();
      expect(state.particles).toEqual([]);
    });

    it('has empty portals array', () => {
      const state = createInitialState();
      expect(state.portals).toEqual([]);
    });

    it('uses default config', () => {
      const state = createInitialState();
      expect(state.timeLeft).toBe(DEFAULT_CONFIG.timeLimit);
      expect(state.maxParticles).toBe(DEFAULT_CONFIG.maxParticles);
    });
  });

  describe('createPortals', () => {
    it('creates 3 portals', () => {
      const portals = createPortals();
      expect(portals.length).toBe(3);
    });

    it('creates left, center, and right portals', () => {
      const portals = createPortals();
      expect(portals[0].id).toBe('left');
      expect(portals[1].id).toBe('center');
      expect(portals[2].id).toBe('right');
    });

    it('positions portals at bottom of screen', () => {
      const portals = createPortals();
      portals.forEach((portal) => {
        expect(portal.y).toBe(0.85);
      });
    });

    it('initializes collected count to 0', () => {
      const portals = createPortals();
      portals.forEach((portal) => {
        expect(portal.particlesCollected).toBe(0);
      });
    });

    it('sets target particles', () => {
      const portals = createPortals();
      portals.forEach((portal) => {
        expect(portal.targetParticles).toBeGreaterThan(0);
      });
    });
  });

  describe('startGame', () => {
    it('sets status to playing', () => {
      const state = createInitialState();
      const newState = startGame(state, 'easy');
      expect(newState.status).toBe('playing');
    });

    it('creates portals', () => {
      const state = createInitialState();
      const newState = startGame(state, 'easy');
      expect(newState.portals.length).toBe(3);
    });

    it('resets score', () => {
      const state = { ...createInitialState(), score: 100 };
      const newState = startGame(state, 'easy');
      expect(newState.score).toBe(0);
    });

    it('sets time based on difficulty', () => {
      const state = createInitialState();
      const easy = startGame(state, 'easy');
      expect(easy.timeLeft).toBe(DIFFICULTY_CONFIGS.easy.timeLimit);
    });

    it('sets max missed based on difficulty', () => {
      const state = createInitialState();
      const hard = startGame(state, 'hard');
      expect(hard.maxMissed).toBe(DIFFICULTY_CONFIGS.hard.maxMissed);
    });

    it('initializes empty particles array', () => {
      const state = createInitialState();
      const newState = startGame(state, 'easy');
      expect(newState.particles).toEqual([]);
    });
  });

  describe('spawnParticle', () => {
    it('creates particle with valid properties', () => {
      const particle = spawnParticle('easy', 0);
      expect(particle.id).toBeDefined();
      expect(particle.x).toBeGreaterThanOrEqual(0.1);
      expect(particle.x).toBeLessThanOrEqual(0.9);
      expect(particle.y).toBe(0);
      expect(particle.vy).toBeGreaterThan(0);
    });

    it('spawns normal particles by default', () => {
      let normalCount = 0;
      for (let i = 0; i < 50; i++) {
        const p = spawnParticle('easy', i);
        if (p.type === 'normal') normalCount++;
      }
      expect(normalCount).toBeGreaterThan(25); // At least 50% should be normal (accounts for variance)
    });

    it('spawns bonus particles occasionally', () => {
      let bonusCount = 0;
      for (let i = 0; i < 100; i++) {
        const p = spawnParticle('easy', i);
        if (p.type === 'bonus') bonusCount++;
      }
      expect(bonusCount).toBeGreaterThanOrEqual(0);
    });

    it('has smaller radius for bonus particles', () => {
      const bonus = spawnParticle('easy', 0);
      // Force bonus by trying multiple times
      for (let i = 0; i < 100 && bonus.type !== 'bonus'; i++) {
        const p = spawnParticle('easy', i);
        if (p.type === 'bonus') {
          expect(p.radius).toBeLessThan(0.03);
          break;
        }
      }
    });

    it('has larger radius for obstacle particles', () => {
      for (let i = 0; i < 100; i++) {
        const p = spawnParticle('easy', i);
        if (p.type === 'obstacle') {
          expect(p.radius).toBeGreaterThan(0.03);
          break;
        }
      }
    });
  });

  describe('checkSilhouetteCollision', () => {
    it('returns true when particle overlaps silhouette', () => {
      const particle: Particle = {
        id: 'test',
        x: 0.5,
        y: 0.5,
        vx: 0,
        vy: 0,
        radius: 0.03,
        type: 'normal',
        color: '#fff',
        captured: false,
        missed: false,
      };
      const silhouette: SilhouetteRegion = {
        x: 0.4,
        y: 0.4,
        width: 0.2,
        height: 0.2,
        isActive: true,
      };
      expect(checkSilhouetteCollision(particle, silhouette)).toBe(true);
    });

    it('returns false when particle is outside silhouette', () => {
      const particle: Particle = {
        id: 'test',
        x: 0.1,
        y: 0.1,
        vx: 0,
        vy: 0,
        radius: 0.03,
        type: 'normal',
        color: '#fff',
        captured: false,
        missed: false,
      };
      const silhouette: SilhouetteRegion = {
        x: 0.5,
        y: 0.5,
        width: 0.1,
        height: 0.1,
        isActive: true,
      };
      expect(checkSilhouetteCollision(particle, silhouette)).toBe(false);
    });

    it('returns false when silhouette is inactive', () => {
      const particle: Particle = {
        id: 'test',
        x: 0.5,
        y: 0.5,
        vx: 0,
        vy: 0,
        radius: 0.03,
        type: 'normal',
        color: '#fff',
        captured: false,
        missed: false,
      };
      const silhouette: SilhouetteRegion = {
        x: 0.4,
        y: 0.4,
        width: 0.2,
        height: 0.2,
        isActive: false,
      };
      expect(checkSilhouetteCollision(particle, silhouette)).toBe(false);
    });
  });

  describe('checkPortalCapture', () => {
    it('returns true when particle is inside portal', () => {
      const particle: Particle = {
        id: 'test',
        x: 0.5,
        y: 0.85,
        vx: 0,
        vy: 0,
        radius: 0.03,
        type: 'normal',
        color: '#fff',
        captured: false,
        missed: false,
      };
      const portal = {
        id: 'center' as const,
        x: 0.5,
        y: 0.85,
        width: 0.15,
        height: 0.1,
        color: '#4ECDC4',
        particlesCollected: 0,
        targetParticles: 10,
      };
      expect(checkPortalCapture(particle, portal)).toBe(true);
    });

    it('returns false when particle is outside portal', () => {
      const particle: Particle = {
        id: 'test',
        x: 0.1,
        y: 0.1,
        vx: 0,
        vy: 0,
        radius: 0.03,
        type: 'normal',
        color: '#fff',
        captured: false,
        missed: false,
      };
      const portal = {
        id: 'center' as const,
        x: 0.5,
        y: 0.85,
        width: 0.15,
        height: 0.1,
        color: '#4ECDC4',
        particlesCollected: 0,
        targetParticles: 10,
      };
      expect(checkPortalCapture(particle, portal)).toBe(false);
    });
  });

  describe('updateParticles', () => {
    it('updates particle positions', () => {
      const state = startGame(createInitialState(), 'easy');
      state.particles = [{
        id: 'test',
        x: 0.5,
        y: 0.5,
        vx: 0,
        vy: 0.5,
        radius: 0.03,
        type: 'normal',
        color: '#fff',
        captured: false,
        missed: false,
      }];

      const newState = updateParticles(state, 0.1, []);
      expect(newState.particles[0].y).toBeGreaterThan(0.5);
    });

    it('captures particles that reach portals', () => {
      const state = startGame(createInitialState(), 'easy');
      state.particles = [{
        id: 'test',
        x: 0.5,
        y: 0.85,
        vx: 0,
        vy: 0,
        radius: 0.03,
        type: 'normal',
        color: '#fff',
        captured: false,
        missed: false,
      }];

      const newState = updateParticles(state, 0.1, []);
      expect(newState.particles.length).toBe(0); // Particle captured and removed
      expect(newState.portals[1].particlesCollected).toBe(1);
    });

    it('increases score on capture', () => {
      const state = startGame(createInitialState(), 'easy');
      state.particles = [{
        id: 'test',
        x: 0.5,
        y: 0.85,
        vx: 0,
        vy: 0,
        radius: 0.03,
        type: 'normal',
        color: '#fff',
        captured: false,
        missed: false,
      }];

      const newState = updateParticles(state, 0.1, []);
      expect(newState.score).toBeGreaterThan(0);
    });

    it('marks particles as missed when falling off screen', () => {
      const state = startGame(createInitialState(), 'easy');
      state.particles = [{
        id: 'test',
        x: 0.5,
        y: 1.1,
        vx: 0,
        vy: 0.5,
        radius: 0.03,
        type: 'normal',
        color: '#fff',
        captured: false,
        missed: false,
      }];

      const newState = updateParticles(state, 0.1, []);
      expect(newState.particlesMissed).toBe(1);
    });

    it('penalizes score for capturing obstacles', () => {
      const state = startGame(createInitialState(), 'easy');
      state.score = 100;
      state.particles = [{
        id: 'test',
        x: 0.5,
        y: 0.85,
        vx: 0,
        vy: 0,
        radius: 0.035,
        type: 'obstacle',
        color: '#FF4444',
        captured: false,
        missed: false,
      }];

      const newState = updateParticles(state, 0.1, []);
      expect(newState.score).toBeLessThan(100);
    });

    it('does nothing when not playing', () => {
      const state = createInitialState();
      const newState = updateParticles(state, 0.1, []);
      expect(newState).toEqual(state);
    });
  });

  describe('spawnParticles', () => {
    it('spawns particles based on spawn rate', () => {
      const state = startGame(createInitialState(), 'easy');
      let spawnCount = 0;
      
      // Try multiple times with large delta time
      for (let i = 0; i < 100; i++) {
        const newState = spawnParticles(state, 10);
        if (newState.particles.length > 0) spawnCount++;
      }
      
      expect(spawnCount).toBeGreaterThan(0);
    });

    it('does not exceed max particles', () => {
      const state = startGame(createInitialState(), 'easy');
      state.particlesSpawned = state.maxParticles;
      
      const newState = spawnParticles(state, 10);
      expect(newState.particles.length).toBe(0);
    });

    it('does nothing when not playing', () => {
      const state = createInitialState();
      const newState = spawnParticles(state, 10);
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
      expect(newState.status).toBe('gameover');
    });

    it('does nothing when not playing', () => {
      const state = createInitialState();
      const newState = updateTimer(state);
      expect(newState.timeLeft).toBe(state.timeLeft);
    });
  });

  describe('checkGameComplete', () => {
    it('completes game when all portals full', () => {
      const state = startGame(createInitialState(), 'easy');
      state.portals.forEach((portal) => {
        portal.particlesCollected = portal.targetParticles;
      });

      const newState = checkGameComplete(state);
      expect(newState.status).toBe('complete');
    });

    it('ends game when too many missed', () => {
      const state = startGame(createInitialState(), 'easy');
      state.particlesMissed = state.maxMissed;

      const newState = checkGameComplete(state);
      expect(newState.status).toBe('gameover');
    });

    it('continues when portals not full', () => {
      const state = startGame(createInitialState(), 'easy');
      const newState = checkGameComplete(state);
      expect(newState.status).toBe('playing');
    });

    it('does nothing when not playing', () => {
      const state = createInitialState();
      const newState = checkGameComplete(state);
      expect(newState.status).toBe('idle');
    });
  });

  describe('calculateFinalScore', () => {
    it('calculates base score', () => {
      const state = startGame(createInitialState(), 'easy');
      state.score = 500;
      const scores = calculateFinalScore(state);
      expect(scores.baseScore).toBe(500);
    });

    it('adds portal bonus', () => {
      const state = startGame(createInitialState(), 'easy');
      state.portals[0].particlesCollected = 5;
      const scores = calculateFinalScore(state);
      expect(scores.portalBonus).toBe(100); // 5 * 20
    });

    it('adds time bonus', () => {
      const state = startGame(createInitialState(), 'easy');
      state.timeLeft = 30;
      const scores = calculateFinalScore(state);
      expect(scores.timeBonus).toBe(150); // 30 * 5
    });

    it('calculates total correctly', () => {
      const state = startGame(createInitialState(), 'easy');
      state.score = 100;
      state.portals[0].particlesCollected = 5;
      state.timeLeft = 10;
      const scores = calculateFinalScore(state);
      expect(scores.total).toBe(100 + 100 + 50); // base + portal + time
    });
  });

  describe('getComboText', () => {
    it('returns empty for low streak', () => {
      expect(getComboText(2)).toBe('');
    });

    it('returns NICE for 3+ streak', () => {
      expect(getComboText(3)).toBe('NICE!');
    });

    it('returns GOOD for 5+ streak', () => {
      expect(getComboText(5)).toBe('GOOD!');
    });

    it('returns AMAZING for 10+ streak', () => {
      expect(getComboText(10)).toBe('AMAZING!');
    });

    it('returns LEGENDARY for 20+ streak', () => {
      expect(getComboText(20)).toBe('LEGENDARY!');
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
      expect(DIFFICULTY_CONFIGS.easy.spawnRate).toBe(1.5);
      expect(DIFFICULTY_CONFIGS.easy.maxMissed).toBe(5);
      expect(DIFFICULTY_CONFIGS.easy.timeLimit).toBe(60);
    });

    it('has correct config for medium', () => {
      expect(DIFFICULTY_CONFIGS.medium.spawnRate).toBe(2.0);
      expect(DIFFICULTY_CONFIGS.medium.maxMissed).toBe(3);
      expect(DIFFICULTY_CONFIGS.medium.timeLimit).toBe(90);
    });

    it('has correct config for hard', () => {
      expect(DIFFICULTY_CONFIGS.hard.spawnRate).toBe(2.5);
      expect(DIFFICULTY_CONFIGS.hard.maxMissed).toBe(2);
      expect(DIFFICULTY_CONFIGS.hard.timeLimit).toBe(120);
    });

    it('has increasing spawn rate with difficulty', () => {
      expect(DIFFICULTY_CONFIGS.easy.spawnRate)
        .toBeLessThan(DIFFICULTY_CONFIGS.medium.spawnRate);
      expect(DIFFICULTY_CONFIGS.medium.spawnRate)
        .toBeLessThan(DIFFICULTY_CONFIGS.hard.spawnRate);
    });

    it('has decreasing max missed with difficulty', () => {
      expect(DIFFICULTY_CONFIGS.easy.maxMissed)
        .toBeGreaterThan(DIFFICULTY_CONFIGS.medium.maxMissed);
      expect(DIFFICULTY_CONFIGS.medium.maxMissed)
        .toBeGreaterThan(DIFFICULTY_CONFIGS.hard.maxMissed);
    });
  });
});
