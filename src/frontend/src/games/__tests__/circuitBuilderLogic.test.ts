/**
 * Circuit Builder Logic Tests
 */

import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  startChallenge,
  addComponent,
  connectComponents,
  disconnectComponents,
  removeComponent,
  toggleSwitch,
  checkCircuit,
  submitCircuit,
  resetChallenge,
  updateTimer,
  getComponentInfo,
  calculateFinalScore,
  isConnected,
  CHALLENGES,
  type Component,
} from '../circuitBuilderLogic';

describe('Circuit Builder Logic', () => {
  describe('isConnected', () => {
    it('returns true for directly connected components', () => {
      const components: Component[] = [
        { id: 'bat1', type: 'battery', x: 0, y: 0, rotation: 0, connections: ['bulb1'] },
        { id: 'bulb1', type: 'bulb', x: 100, y: 0, rotation: 0, connections: ['bat1'] },
      ];
      expect(isConnected('bat1', 'bulb1', components)).toBe(true);
    });

    it('returns false for unconnected components', () => {
      const components: Component[] = [
        { id: 'bat1', type: 'battery', x: 0, y: 0, rotation: 0, connections: [] },
        { id: 'bulb1', type: 'bulb', x: 100, y: 0, rotation: 0, connections: [] },
      ];
      expect(isConnected('bat1', 'bulb1', components)).toBe(false);
    });

    it('returns true for same component', () => {
      const components: Component[] = [
        { id: 'bat1', type: 'battery', x: 0, y: 0, rotation: 0, connections: [] },
      ];
      expect(isConnected('bat1', 'bat1', components)).toBe(true);
    });
  });

  describe('createInitialState', () => {
    it('creates state with menu status', () => {
      const state = createInitialState();
      expect(state.status).toBe('menu');
    });

    it('initializes empty components array', () => {
      const state = createInitialState();
      expect(state.components).toEqual([]);
    });

    it('starts with zero score', () => {
      const state = createInitialState();
      expect(state.score).toBe(0);
    });
  });

  describe('startChallenge', () => {
    it('sets status to playing', () => {
      const state = startChallenge(createInitialState(), 'simple-circuit');
      expect(state.status).toBe('playing');
    });

    it('sets challenge ID', () => {
      const state = startChallenge(createInitialState(), 'series-circuit');
      expect(state.currentChallengeId).toBe('series-circuit');
    });

    it('clears components', () => {
      let state = addComponent(createInitialState(), 'battery', 100, 100);
      state = startChallenge(state, 'simple-circuit');
      expect(state.components).toEqual([]);
    });

    it('resets attempts', () => {
      let state = createInitialState();
      state = { ...state, attempts: 5 };
      state = startChallenge(state, 'simple-circuit');
      expect(state.attempts).toBe(0);
    });
  });

  describe('addComponent', () => {
    it('adds battery component', () => {
      const state = addComponent(createInitialState(), 'battery', 100, 200);
      expect(state.components).toHaveLength(1);
      expect(state.components[0].type).toBe('battery');
      expect(state.components[0].x).toBe(100);
      expect(state.components[0].y).toBe(200);
    });

    it('adds bulb component', () => {
      const state = addComponent(createInitialState(), 'bulb', 300, 400);
      expect(state.components[0].type).toBe('bulb');
    });

    it('generates unique IDs', () => {
      let state = addComponent(createInitialState(), 'battery', 0, 0);
      state = addComponent(state, 'battery', 0, 0);
      expect(state.components[0].id).not.toBe(state.components[1].id);
    });

    it('sets default battery voltage', () => {
      const state = addComponent(createInitialState(), 'battery', 0, 0);
      expect(state.components[0].value).toBe(9);
    });

    it('sets switch to open state', () => {
      const state = addComponent(createInitialState(), 'switch', 0, 0);
      expect(state.components[0].state).toBe('open');
    });

    it('initializes empty connections', () => {
      const state = addComponent(createInitialState(), 'resistor', 0, 0);
      expect(state.components[0].connections).toEqual([]);
    });
  });

  describe('connectComponents', () => {
    it('creates bidirectional connection', () => {
      let state = addComponent(createInitialState(), 'battery', 0, 0);
      state = addComponent(state, 'bulb', 100, 100);
      const batteryId = state.components[0].id;
      const bulbId = state.components[1].id;

      state = connectComponents(state, batteryId, bulbId);

      expect(state.components[0].connections).toContain(bulbId);
      expect(state.components[1].connections).toContain(batteryId);
    });

    it('prevents duplicate connections', () => {
      let state = addComponent(createInitialState(), 'battery', 0, 0);
      state = addComponent(state, 'bulb', 100, 100);
      const batteryId = state.components[0].id;
      const bulbId = state.components[1].id;

      state = connectComponents(state, batteryId, bulbId);
      state = connectComponents(state, batteryId, bulbId);

      expect(state.components[0].connections).toHaveLength(1);
    });

    it('handles multiple connections', () => {
      let state = addComponent(createInitialState(), 'battery', 0, 0);
      state = addComponent(state, 'bulb', 100, 100);
      state = addComponent(state, 'switch', 200, 200);
      const ids = state.components.map((c) => c.id);

      state = connectComponents(state, ids[0], ids[1]);
      state = connectComponents(state, ids[1], ids[2]);

      expect(state.components[0].connections).toHaveLength(1);
      expect(state.components[1].connections).toHaveLength(2);
    });
  });

  describe('disconnectComponents', () => {
    it('removes bidirectional connection', () => {
      let state = addComponent(createInitialState(), 'battery', 0, 0);
      state = addComponent(state, 'bulb', 100, 100);
      const batteryId = state.components[0].id;
      const bulbId = state.components[1].id;

      state = connectComponents(state, batteryId, bulbId);
      state = disconnectComponents(state, batteryId, bulbId);

      expect(state.components[0].connections).not.toContain(bulbId);
      expect(state.components[1].connections).not.toContain(batteryId);
    });
  });

  describe('removeComponent', () => {
    it('removes component from array', () => {
      let state = addComponent(createInitialState(), 'battery', 0, 0);
      const batteryId = state.components[0].id;

      state = removeComponent(state, batteryId);

      expect(state.components).toHaveLength(0);
    });

    it('removes connections to deleted component', () => {
      let state = addComponent(createInitialState(), 'battery', 0, 0);
      state = addComponent(state, 'bulb', 100, 100);
      state = addComponent(state, 'switch', 200, 200);
      const ids = state.components.map((c) => c.id);

      state = connectComponents(state, ids[0], ids[1]);
      state = connectComponents(state, ids[1], ids[2]);
      state = removeComponent(state, ids[1]);

      expect(state.components[0].connections).not.toContain(ids[1]);
      expect(state.components[1].connections).not.toContain(ids[1]);
    });
  });

  describe('toggleSwitch', () => {
    it('toggles from open to closed', () => {
      let state = addComponent(createInitialState(), 'switch', 0, 0);
      const switchId = state.components[0].id;

      state = toggleSwitch(state, switchId);

      expect(state.components[0].state).toBe('closed');
    });

    it('toggles from closed to open', () => {
      let state = addComponent(createInitialState(), 'switch', 0, 0);
      const switchId = state.components[0].id;

      state = toggleSwitch(state, switchId);
      state = toggleSwitch(state, switchId);

      expect(state.components[0].state).toBe('open');
    });

    it('does not affect other components', () => {
      let state = addComponent(createInitialState(), 'switch', 0, 0);
      state = addComponent(state, 'battery', 100, 100);
      const switchId = state.components[0].id;

      state = toggleSwitch(state, switchId);

      expect(state.components[1].state).toBeUndefined();
    });
  });

  describe('checkCircuit', () => {
    it('returns error when no challenge selected', () => {
      const state = createInitialState();
      const result = checkCircuit(state);
      expect(result.success).toBe(false);
      expect(result.feedback).toContain('No challenge');
    });

    it('detects missing components', () => {
      let state = startChallenge(createInitialState(), 'simple-circuit');
      const result = checkCircuit(state);
      expect(result.success).toBe(false);
      expect(result.feedback).toContain('Missing');
    });

    it('validates simple circuit', () => {
      let state = startChallenge(createInitialState(), 'simple-circuit');
      // Challenge requires: battery, bulb, wire
      state = addComponent(state, 'battery', 100, 100);
      state = addComponent(state, 'bulb', 300, 100);
      state = addComponent(state, 'wire', 200, 100);
      const batteryId = state.components[0].id;
      const bulbId = state.components[1].id;
      const wireId = state.components[2].id;

      // Connect: battery -> wire -> bulb
      state = connectComponents(state, batteryId, wireId);
      state = connectComponents(state, wireId, bulbId);

      const result = checkCircuit(state);
      expect(result.success).toBe(true);
    });

    it('fails unconnected circuit', () => {
      let state = startChallenge(createInitialState(), 'simple-circuit');
      state = addComponent(state, 'battery', 100, 100);
      state = addComponent(state, 'bulb', 300, 100);
      // Not connected!

      const result = checkCircuit(state);
      expect(result.success).toBe(false);
    });
  });

  describe('submitCircuit', () => {
    it('awards points on success', () => {
      let state = startChallenge(createInitialState(), 'simple-circuit');
      // Challenge requires: battery, bulb, wire
      state = addComponent(state, 'battery', 100, 100);
      state = addComponent(state, 'bulb', 300, 100);
      state = addComponent(state, 'wire', 200, 100);
      const batteryId = state.components[0].id;
      const bulbId = state.components[1].id;
      const wireId = state.components[2].id;

      // Connect: battery -> wire -> bulb
      state = connectComponents(state, batteryId, wireId);
      state = connectComponents(state, wireId, bulbId);

      state = submitCircuit(state);

      expect(state.status).toBe('success');
      expect(state.score).toBeGreaterThan(0);
    });

    it('increments attempts on failure', () => {
      let state = startChallenge(createInitialState(), 'simple-circuit');
      state = addComponent(state, 'battery', 100, 100);
      // Missing bulb!

      state = submitCircuit(state);

      expect(state.status).toBe('failure');
      expect(state.attempts).toBe(1);
    });
  });

  describe('resetChallenge', () => {
    it('clears all components', () => {
      let state = startChallenge(createInitialState(), 'simple-circuit');
      state = addComponent(state, 'battery', 100, 100);
      state = addComponent(state, 'bulb', 300, 100);

      state = resetChallenge(state);

      expect(state.components).toHaveLength(0);
    });

    it('sets status to playing', () => {
      let state = startChallenge(createInitialState(), 'simple-circuit');
      state = { ...state, status: 'success' };

      state = resetChallenge(state);

      expect(state.status).toBe('playing');
    });
  });

  describe('updateTimer', () => {
    it('increments time elapsed', () => {
      let state = createInitialState();
      state = updateTimer(state);
      expect(state.timeElapsed).toBe(1);
    });

    it('accumulates time', () => {
      let state = createInitialState();
      state = updateTimer(state);
      state = updateTimer(state);
      state = updateTimer(state);
      expect(state.timeElapsed).toBe(3);
    });
  });

  describe('getComponentInfo', () => {
    it('returns battery info', () => {
      const info = getComponentInfo('battery');
      expect(info.name).toBe('Battery');
      expect(info.icon).toBe('🔋');
    });

    it('returns bulb info', () => {
      const info = getComponentInfo('bulb');
      expect(info.name).toBe('Light Bulb');
      expect(info.color).toBe('#FFC107');
    });

    it('returns switch info', () => {
      const info = getComponentInfo('switch');
      expect(info.description).toContain('Opens or closes');
    });

    it('returns unique colors for each type', () => {
      const types = ['battery', 'bulb', 'switch', 'resistor', 'motor', 'buzzer', 'wire'] as const;
      const colors = types.map((t) => getComponentInfo(t).color);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(types.length);
    });
  });

  describe('calculateFinalScore', () => {
    it('calculates total score', () => {
      const state = { ...createInitialState(), score: 250 };
      const result = calculateFinalScore(state);
      expect(result.totalScore).toBe(250);
    });

    it('estimates challenges completed', () => {
      const state = { ...createInitialState(), score: 250 };
      const result = calculateFinalScore(state);
      expect(result.challengesCompleted).toBe(2);
    });

    it('calculates accuracy', () => {
      const state = { ...createInitialState(), score: 100, attempts: 2 };
      const result = calculateFinalScore(state);
      expect(result.accuracy).toBe(50);
    });
  });

  describe('CHALLENGES', () => {
    it('has 6 challenges', () => {
      expect(CHALLENGES).toHaveLength(6);
    });

    it('has simple-circuit challenge', () => {
      const challenge = CHALLENGES.find((c) => c.id === 'simple-circuit');
      expect(challenge).toBeDefined();
      expect(challenge?.requiredComponents).toContain('battery');
      expect(challenge?.requiredComponents).toContain('bulb');
    });

    it('has series-circuit challenge', () => {
      const challenge = CHALLENGES.find((c) => c.id === 'series-circuit');
      expect(challenge).toBeDefined();
    });

    it('each challenge has validation function', () => {
      CHALLENGES.forEach((challenge) => {
        expect(typeof challenge.validate).toBe('function');
      });
    });

    it('validates series circuit correctly', () => {
      const challenge = CHALLENGES.find((c) => c.id === 'series-circuit');
      const components: Component[] = [
        { id: 'bat1', type: 'battery', x: 0, y: 0, rotation: 0, connections: ['bulb1', 'bulb2'] },
        { id: 'bulb1', type: 'bulb', x: 100, y: 0, rotation: 0, connections: ['bat1'] },
        { id: 'bulb2', type: 'bulb', x: 200, y: 0, rotation: 0, connections: ['bat1'] },
      ];
      expect(challenge?.validate(components)).toBe(true);
    });
  });
});
