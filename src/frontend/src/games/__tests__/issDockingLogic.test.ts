/**
 * ISS Docking Logic Tests
 */

import { describe, it, expect } from 'vitest';
import {
  createInitialState, startGame, applyThrust, rotateShip,
  updatePhysics, checkDocking, updateGame, calculateDistanceToISS,
  calculateSpeed, GAME_CONFIG,
} from '../issDockingLogic';

describe('ISS Docking Logic', () => {
  describe('createInitialState', () => {
    it('creates menu state', () => {
      const state = createInitialState();
      expect(state.status).toBe('menu');
    });

    it('initializes ship with fuel', () => {
      const state = createInitialState();
      expect(state.ship.fuel).toBe(GAME_CONFIG.maxFuel);
    });

    it('initializes ISS position', () => {
      const state = createInitialState();
      expect(state.iss.x).toBeDefined();
      expect(state.iss.y).toBeDefined();
    });
  });

  describe('startGame', () => {
    it('sets playing status', () => {
      const state = startGame(createInitialState());
      expect(state.status).toBe('playing');
    });

    it('resets ship position', () => {
      let state = createInitialState();
      state.ship.x = 500;
      state = startGame(state);
      expect(state.ship.x).toBe(200);
    });

    it('refuels ship', () => {
      let state = createInitialState();
      state.ship.fuel = 0;
      state = startGame(state);
      expect(state.ship.fuel).toBe(GAME_CONFIG.maxFuel);
    });
  });

  describe('applyThrust', () => {
    it('increases velocity', () => {
      let state = startGame(createInitialState());
      const initialVx = state.ship.velocityX;
      state = applyThrust(state);
      expect(state.ship.velocityX).toBeGreaterThan(initialVx);
    });

    it('consumes fuel', () => {
      let state = startGame(createInitialState());
      const initialFuel = state.ship.fuel;
      state = applyThrust(state);
      expect(state.ship.fuel).toBeLessThan(initialFuel);
    });

    it('does nothing when out of fuel', () => {
      let state = startGame(createInitialState());
      state.ship.fuel = 0;
      const initialVx = state.ship.velocityX;
      state = applyThrust(state);
      expect(state.ship.velocityX).toBe(initialVx);
    });
  });

  describe('rotateShip', () => {
    it('rotates left', () => {
      let state = startGame(createInitialState());
      state = rotateShip(state, 'left');
      expect(state.ship.rotation).toBeLessThan(0);
    });

    it('rotates right', () => {
      let state = startGame(createInitialState());
      state = rotateShip(state, 'right');
      expect(state.ship.rotation).toBeGreaterThan(0);
    });
  });

  describe('updatePhysics', () => {
    it('moves ship based on velocity', () => {
      let state = startGame(createInitialState());
      state.ship.velocityX = 5;
      state = updatePhysics(state);
      expect(state.ship.x).toBeGreaterThan(200);
    });

    it('keeps ship within bounds', () => {
      let state = startGame(createInitialState());
      state.ship.x = GAME_CONFIG.width - 10;
      state.ship.velocityX = 100;
      state = updatePhysics(state);
      expect(state.ship.x).toBeLessThanOrEqual(GAME_CONFIG.width - 20);
    });

    it('moves ISS in orbit', () => {
      let state = startGame(createInitialState());
      const initialAngle = state.iss.orbitAngle;
      state = updatePhysics(state);
      expect(state.iss.orbitAngle).toBeGreaterThan(initialAngle);
    });
  });

  describe('checkDocking', () => {
    it('fails when too far', () => {
      let state = startGame(createInitialState());
      state.ship.x = 0;
      state.ship.y = 0;
      const result = checkDocking(state);
      expect(result.success).toBe(false);
      expect(result.reason).toContain('far');
    });

    it('fails when too fast', () => {
      let state = startGame(createInitialState());
      state.ship.x = state.iss.x + 10;
      state.ship.y = state.iss.y;
      state.ship.velocityX = 10;
      const result = checkDocking(state);
      expect(result.success).toBe(false);
      expect(result.reason).toContain('fast');
    });
  });

  describe('calculateDistanceToISS', () => {
    it('calculates correctly', () => {
      let state = startGame(createInitialState());
      state.ship.x = state.iss.x + 100;
      state.ship.y = state.iss.y;
      const distance = calculateDistanceToISS(state);
      expect(distance).toBeCloseTo(100, 0);
    });
  });

  describe('calculateSpeed', () => {
    it('calculates correctly', () => {
      let state = startGame(createInitialState());
      state.ship.velocityX = 3;
      state.ship.velocityY = 4;
      const speed = calculateSpeed(state);
      expect(speed).toBeCloseTo(5, 0);
    });
  });
});
