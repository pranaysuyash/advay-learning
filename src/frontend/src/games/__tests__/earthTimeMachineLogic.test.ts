/**
 * Earth Time Machine Game Logic Tests
 *
 * @ticket EARTH-TIME-MACHINE
 */

import {
  ERAS,
  TIME_ITEMS,
  CHALLENGES,
  createInitialState,
  startChallenge,
  moveToEra,
  findItem,
  tick,
  getEraById,
  getItemsForEra,
  calculateStars,
} from '../earthTimeMachineLogic';

describe('Earth Time Machine Logic', () => {
  describe('ERAS', () => {
    it('should have 4 eras defined', () => {
      expect(ERAS).toHaveLength(4);
    });

    it('should have correct era ids', () => {
      expect(ERAS.map((e) => e.id)).toEqual(['present', 'ice-age', 'dinosaur', 'first-life']);
    });

    it('should have valid colors for all eras', () => {
      ERAS.forEach((era) => {
        expect(era.color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });

  describe('TIME_ITEMS', () => {
    it('should have 9 items defined', () => {
      expect(TIME_ITEMS).toHaveLength(9);
    });

    it('should have valid difficulty levels', () => {
      const validDifficulties = ['easy', 'medium', 'hard'];
      TIME_ITEMS.forEach((item) => {
        expect(validDifficulties).toContain(item.difficulty);
      });
    });

    it('should have items linked to valid eras', () => {
      const eraIds = ERAS.map((e) => e.id);
      TIME_ITEMS.forEach((item) => {
        expect(eraIds).toContain(item.eraId);
      });
    });
  });

  describe('CHALLENGES', () => {
    it('should have 4 challenges defined', () => {
      expect(CHALLENGES).toHaveLength(4);
    });

    it('should have increasing difficulty', () => {
      expect(CHALLENGES[0].timeLimit).toBeLessThan(CHALLENGES[3].timeLimit);
    });

    it('should reference valid era ids', () => {
      const eraIds = ERAS.map((e) => e.id);
      CHALLENGES.forEach((challenge) => {
        challenge.targetEras.forEach((eraId) => {
          expect(eraIds).toContain(eraId);
        });
      });
    });
  });

  describe('createInitialState', () => {
    it('should create initial state with correct defaults', () => {
      const state = createInitialState();
      
      expect(state.status).toBe('menu');
      expect(state.currentChallengeId).toBeNull();
      expect(state.currentEraId).toBe('present');
      expect(state.foundItems).toEqual([]);
      expect(state.score).toBe(0);
      expect(state.timeLeft).toBe(0);
      expect(state.discoveredFacts).toEqual([]);
      expect(state.streak).toBe(0);
    });
  });

  describe('startChallenge', () => {
    it('should start a valid challenge', () => {
      const state = createInitialState();
      const newState = startChallenge(state, 'era-explorer');
      
      expect(newState.status).toBe('playing');
      expect(newState.currentChallengeId).toBe('era-explorer');
      expect(newState.currentEraId).toBe('present');
      expect(newState.timeLeft).toBe(60);
    });

    it('should return original state for invalid challenge', () => {
      const state = createInitialState();
      const newState = startChallenge(state, 'invalid-challenge');
      
      expect(newState).toEqual(state);
    });
  });

  describe('moveToEra', () => {
    it('should change current era when playing', () => {
      const state = { ...createInitialState(), status: 'playing' as const };
      const newState = moveToEra(state, 'dinosaur');
      
      expect(newState.currentEraId).toBe('dinosaur');
    });

    it('should not change era when not playing', () => {
      const state = createInitialState();
      const newState = moveToEra(state, 'dinosaur');
      
      expect(newState.currentEraId).toBe('present');
    });

    it('should not change to invalid era', () => {
      const state = { ...createInitialState(), status: 'playing' as const };
      const newState = moveToEra(state, 'invalid-era');
      
      expect(newState.currentEraId).toBe('present');
    });
  });

  describe('findItem', () => {
    it('should find correct item and earn points', () => {
      const state = { 
        ...createInitialState(), 
        status: 'playing' as const, 
        currentChallengeId: 'era-explorer',
        currentEraId: 'present' 
      };
      const newState = findItem(state, 'human');
      
      expect(newState.foundItems).toContain('human');
      expect(newState.score).toBe(10);
      expect(newState.streak).toBe(1);
    });

    it('should fail if item is from wrong era', () => {
      const state = { 
        ...createInitialState(), 
        status: 'playing' as const,
        currentChallengeId: 'era-explorer',
        currentEraId: 'present',
        streak: 3
      };
      const newState = findItem(state, 'mammoth');
      
      expect(newState.status).toBe('failure');
      expect(newState.streak).toBe(0);
    });

    it('should not find already found items', () => {
      const state = { 
        ...createInitialState(), 
        status: 'playing' as const,
        currentChallengeId: 'era-explorer',
        currentEraId: 'present',
        foundItems: ['human'],
        score: 10
      };
      const newState = findItem(state, 'human');
      
      expect(newState.foundItems).toHaveLength(1);
      expect(newState.score).toBe(10);
    });

    it('should add streak bonus for consecutive correct answers', () => {
      const state = { 
        ...createInitialState(), 
        status: 'playing' as const,
        currentChallengeId: 'era-explorer',
        currentEraId: 'present',
        streak: 2,
        score: 20
      };
      const newState = findItem(state, 'car');
      
      expect(newState.score).toBe(40); // 10 + (2 * 5 streak bonus) + 10 base
    });

    it('should discover facts when finding items', () => {
      const state = { 
        ...createInitialState(), 
        status: 'playing' as const,
        currentChallengeId: 'era-explorer',
        currentEraId: 'present'
      };
      const newState = findItem(state, 'human');
      
      expect(newState.discoveredFacts).toHaveLength(1);
    });
  });

  describe('tick', () => {
    it('should decrease time by 1 second', () => {
      const state = { 
        ...createInitialState(), 
        status: 'playing' as const, 
        timeLeft: 30 
      };
      const newState = tick(state);
      
      expect(newState.timeLeft).toBe(29);
    });

    it('should fail when time runs out', () => {
      const state = { 
        ...createInitialState(), 
        status: 'playing' as const, 
        timeLeft: 1 
      };
      const newState = tick(state);
      
      expect(newState.timeLeft).toBe(0);
      expect(newState.status).toBe('failure');
    });

    it('should not tick when not playing', () => {
      const state = createInitialState();
      const newState = tick(state);
      
      expect(newState).toEqual(state);
    });
  });

  describe('getEraById', () => {
    it('should return correct era', () => {
      const era = getEraById('dinosaur');
      expect(era?.name).toBe('Dinosaur Era');
    });

    it('should return undefined for invalid id', () => {
      const era = getEraById('invalid');
      expect(era).toBeUndefined();
    });
  });

  describe('getItemsForEra', () => {
    it('should return items for a specific era', () => {
      const items = getItemsForEra('present');
      expect(items.length).toBeGreaterThan(0);
      items.forEach((item) => {
        expect(item.eraId).toBe('present');
      });
    });

    it('should return empty array for era with no items', () => {
      const items = getItemsForEra('invalid');
      expect(items).toEqual([]);
    });
  });

  describe('calculateStars', () => {
    it('should return 3 stars for score >= 100', () => {
      expect(calculateStars(100)).toBe(3);
      expect(calculateStars(150)).toBe(3);
    });

    it('should return 2 stars for score >= 50', () => {
      expect(calculateStars(50)).toBe(2);
      expect(calculateStars(99)).toBe(2);
    });

    it('should return 1 star for score >= 10', () => {
      expect(calculateStars(10)).toBe(1);
      expect(calculateStars(49)).toBe(1);
    });

    it('should return 0 stars for score < 10', () => {
      expect(calculateStars(0)).toBe(0);
      expect(calculateStars(9)).toBe(0);
    });
  });
});
