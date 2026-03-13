/**
 * Planet Sandbox Logic Tests
 */

import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  startChallenge,
  addPlanet,
  removePlanet,
  clearPlanets,
  checkChallenge,
  submitChallenge,
  updateTimer,
  getPlanetEmoji,
  getPlanetTypeColor,
  calculateOrbitalPeriod,
  calculateFinalScore,
  PLANET_TEMPLATES,
  CHALLENGES,
} from '../planetSandboxLogic';

describe('Planet Sandbox Logic', () => {
  describe('createInitialState', () => {
    it('creates state with menu status', () => {
      const state = createInitialState();
      expect(state.status).toBe('menu');
    });

    it('initializes empty planets array', () => {
      const state = createInitialState();
      expect(state.planets).toEqual([]);
    });

    it('starts with zero score', () => {
      const state = createInitialState();
      expect(state.score).toBe(0);
    });
  });

  describe('startChallenge', () => {
    it('sets status to playing', () => {
      const state = startChallenge(createInitialState(), 'inner-system');
      expect(state.status).toBe('playing');
    });

    it('sets challenge ID', () => {
      const state = startChallenge(createInitialState(), 'gas-giants');
      expect(state.currentChallengeId).toBe('gas-giants');
    });

    it('clears planets', () => {
      let state = createInitialState();
      state = addPlanet(state, 0, 1);
      state = startChallenge(state, 'inner-system');
      expect(state.planets).toEqual([]);
    });
  });

  describe('addPlanet', () => {
    it('adds a planet from template', () => {
      let state = startChallenge(createInitialState(), 'inner-system');
      state = addPlanet(state, 0, 1); // Mercury-like
      expect(state.planets).toHaveLength(1);
      expect(state.planets[0].type).toBe('rocky');
    });

    it('sets correct distance', () => {
      let state = startChallenge(createInitialState(), 'inner-system');
      state = addPlanet(state, 0, 3.5);
      expect(state.planets[0].distance).toBe(3.5);
    });

    it('clamps distance to valid range', () => {
      let state = startChallenge(createInitialState(), 'inner-system');
      state = addPlanet(state, 0, 20);
      expect(state.planets[0].distance).toBe(10);
    });

    it('generates unique IDs', () => {
      let state = startChallenge(createInitialState(), 'inner-system');
      state = addPlanet(state, 0, 1);
      state = addPlanet(state, 1, 2);
      expect(state.planets[0].id).not.toBe(state.planets[1].id);
    });

    it('copies all template properties', () => {
      let state = startChallenge(createInitialState(), 'inner-system');
      state = addPlanet(state, 0, 1);
      expect(state.planets[0].name).toBe('Mercury-like');
      expect(state.planets[0].moons).toBe(0);
      expect(state.planets[0].temperature).toBe(167);
    });
  });

  describe('removePlanet', () => {
    it('removes planet by ID', () => {
      let state = startChallenge(createInitialState(), 'inner-system');
      state = addPlanet(state, 0, 1);
      const id = state.planets[0].id;
      state = addPlanet(state, 1, 2);
      state = removePlanet(state, id);
      expect(state.planets).toHaveLength(1);
    });
  });

  describe('clearPlanets', () => {
    it('removes all planets', () => {
      let state = startChallenge(createInitialState(), 'inner-system');
      state = addPlanet(state, 0, 1);
      state = addPlanet(state, 1, 2);
      state = clearPlanets(state);
      expect(state.planets).toHaveLength(0);
    });
  });

  describe('checkChallenge', () => {
    it('returns error when no challenge selected', () => {
      const state = createInitialState();
      const result = checkChallenge(state);
      expect(result.success).toBe(false);
      expect(result.feedback).toContain('No challenge');
    });

    it('detects incomplete challenge', () => {
      let state = startChallenge(createInitialState(), 'inner-system');
      state = addPlanet(state, 0, 1); // Only 1 planet
      const result = checkChallenge(state);
      expect(result.success).toBe(false);
    });

    it('validates inner system challenge', () => {
      let state = startChallenge(createInitialState(), 'inner-system');
      // Add 4 rocky planets
      state = addPlanet(state, 0, 0.5); // Mercury
      state = addPlanet(state, 1, 1); // Venus
      state = addPlanet(state, 2, 2); // Earth
      state = addPlanet(state, 3, 3); // Mars
      const result = checkChallenge(state);
      expect(result.success).toBe(true);
    });

    it('validates gas giants challenge', () => {
      let state = startChallenge(createInitialState(), 'gas-giants');
      state = addPlanet(state, 4, 5); // Jupiter
      state = addPlanet(state, 5, 7); // Saturn
      const result = checkChallenge(state);
      expect(result.success).toBe(true);
    });

    it('provides feedback on failure', () => {
      let state = startChallenge(createInitialState(), 'inner-system');
      state = addPlanet(state, 4, 1); // Wrong type (gas instead of rocky)
      const result = checkChallenge(state);
      expect(result.success).toBe(false);
      expect(result.feedback).toContain('Need');
    });
  });

  describe('submitChallenge', () => {
    it('awards points on success', () => {
      let state = startChallenge(createInitialState(), 'gas-giants');
      state = addPlanet(state, 4, 5);
      state = addPlanet(state, 5, 7);
      state = submitChallenge(state);
      expect(state.status).toBe('success');
      expect(state.score).toBeGreaterThan(0);
    });

    it('increments attempts on failure', () => {
      let state = startChallenge(createInitialState(), 'inner-system');
      state = addPlanet(state, 0, 1);
      state = submitChallenge(state);
      expect(state.status).toBe('failure');
      expect(state.attempts).toBe(1);
    });
  });

  describe('updateTimer', () => {
    it('increments time elapsed', () => {
      let state = startChallenge(createInitialState(), 'inner-system');
      state = updateTimer(state);
      expect(state.timeElapsed).toBe(1);
    });
  });

  describe('getPlanetEmoji', () => {
    it('returns emoji for rocky', () => {
      expect(getPlanetEmoji('rocky')).toBe('🪨');
    });

    it('returns emoji for gas', () => {
      expect(getPlanetEmoji('gas')).toBe('🟠');
    });

    it('returns emoji for ice', () => {
      expect(getPlanetEmoji('ice')).toBe('❄️');
    });
  });

  describe('getPlanetTypeColor', () => {
    it('returns color for each type', () => {
      expect(getPlanetTypeColor('rocky')).toBe('#8B4513');
      expect(getPlanetTypeColor('gas')).toBe('#DAA520');
      expect(getPlanetTypeColor('ice')).toBe('#87CEEB');
    });
  });

  describe('calculateOrbitalPeriod', () => {
    it('calculates for Mercury distance (0.4 AU)', () => {
      const period = calculateOrbitalPeriod(0.4);
      expect(period).toBeCloseTo(0.25, 1);
    });

    it('calculates for Earth distance (1 AU)', () => {
      const period = calculateOrbitalPeriod(1);
      expect(period).toBe(1);
    });

    it('calculates for Jupiter distance (5 AU)', () => {
      const period = calculateOrbitalPeriod(5);
      expect(period).toBeCloseTo(11.2, 1);
    });

    it('increases with distance', () => {
      const mercury = calculateOrbitalPeriod(0.4);
      const earth = calculateOrbitalPeriod(1);
      const jupiter = calculateOrbitalPeriod(5);
      expect(mercury).toBeLessThan(earth);
      expect(earth).toBeLessThan(jupiter);
    });
  });

  describe('calculateFinalScore', () => {
    it('calculates total score', () => {
      const state = { ...createInitialState(), score: 250 };
      const result = calculateFinalScore(state);
      expect(result.totalScore).toBe(250);
    });

    it('counts planets created', () => {
      let state = startChallenge(createInitialState(), 'inner-system');
      state = addPlanet(state, 0, 1);
      state = addPlanet(state, 1, 2);
      const result = calculateFinalScore(state);
      expect(result.planetsCreated).toBe(2);
    });
  });

  describe('PLANET_TEMPLATES', () => {
    it('has 8 templates', () => {
      expect(PLANET_TEMPLATES).toHaveLength(8);
    });

    it('has unique names', () => {
      const names = PLANET_TEMPLATES.map((p) => p.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('includes all planet types', () => {
      const types = PLANET_TEMPLATES.map((p) => p.type);
      expect(types).toContain('rocky');
      expect(types).toContain('gas');
      expect(types).toContain('ice');
    });

    it('each has educational fact', () => {
      PLANET_TEMPLATES.forEach((template) => {
        expect(template.fact).toBeTruthy();
        expect(template.fact.length).toBeGreaterThan(10);
      });
    });
  });

  describe('CHALLENGES', () => {
    it('has 5 challenges', () => {
      expect(CHALLENGES).toHaveLength(5);
    });

    it('has full system challenge', () => {
      const full = CHALLENGES.find((c) => c.id === 'full-system');
      expect(full).toBeDefined();
      expect(full?.targetConfig).toHaveLength(8);
    });

    it('each has hint', () => {
      CHALLENGES.forEach((c) => {
        expect(c.hint).toBeTruthy();
      });
    });
  });
});
