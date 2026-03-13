/**
 * Language Puppet Game Logic Tests
 *
 * @ticket LANGUAGE-PUPPET
 */

import {
  EXPRESSIONS,
  GESTURES,
  CHALLENGES,
  createInitialState,
  startChallenge,
  updateHandState,
  tick,
  calculateStars,
  getHandGesture,
  getExpressionFromHand,
} from '../languagePuppetLogic';

describe('Language Puppet Logic', () => {
  describe('EXPRESSIONS', () => {
    it('should have 5 expressions defined', () => {
      expect(EXPRESSIONS).toHaveLength(5);
    });

    it('should have valid expression ids', () => {
      const ids = EXPRESSIONS.map(e => e.id);
      expect(ids).toContain('happy');
      expect(ids).toContain('surprised');
      expect(ids).toContain('sad');
      expect(ids).toContain('silly');
      expect(ids).toContain('neutral');
    });
  });

  describe('GESTURES', () => {
    it('should have 5 gestures defined', () => {
      expect(GESTURES).toHaveLength(5);
    });

    it('should have valid gesture ids', () => {
      const ids = GESTURES.map(g => g.id);
      expect(ids).toContain('wave');
      expect(ids).toContain('point');
      expect(ids).toContain('grab');
      expect(ids).toContain('open');
      expect(ids).toContain('fist');
    });
  });

  describe('CHALLENGES', () => {
    it('should have 4 challenges defined', () => {
      expect(CHALLENGES).toHaveLength(4);
    });

    it('should have increasing difficulty', () => {
      const timeLimits = CHALLENGES.map(c => c.timeLimit);
      expect(timeLimits[0]).toBeLessThan(timeLimits[3]);
    });
  });

  describe('createInitialState', () => {
    it('should create initial state with correct defaults', () => {
      const state = createInitialState();
      
      expect(state.status).toBe('menu');
      expect(state.currentChallengeId).toBeNull();
      expect(state.score).toBe(0);
      expect(state.timeLeft).toBe(0);
      expect(state.streak).toBe(0);
      expect(state.completedExpressions).toEqual([]);
      expect(state.completedGestures).toEqual([]);
      expect(state.currentExpression).toBe('neutral');
      expect(state.currentGesture).toBe('open');
    });
  });

  describe('startChallenge', () => {
    it('should start a valid challenge', () => {
      const state = createInitialState();
      const newState = startChallenge(state, 'puppet-show');
      
      expect(newState.status).toBe('playing');
      expect(newState.currentChallengeId).toBe('puppet-show');
      expect(newState.timeLeft).toBe(45);
    });

    it('should return original state for invalid challenge', () => {
      const state = createInitialState();
      const newState = startChallenge(state, 'invalid');
      
      expect(newState).toEqual(state);
    });
  });

  describe('updateHandState', () => {
    it('should update expression and gesture', () => {
      const state = { 
        ...createInitialState(), 
        status: 'playing' as const, 
        currentChallengeId: 'puppet-show' 
      };
      const newState = updateHandState(state, 'happy', 'wave');
      
      expect(newState.currentExpression).toBe('happy');
      expect(newState.currentGesture).toBe('wave');
    });

    it('should earn points for matching target', () => {
      const state = { 
        ...createInitialState(), 
        status: 'playing' as const, 
        currentChallengeId: 'puppet-show' 
      };
      const newState = updateHandState(state, 'happy', 'wave');
      
      expect(newState.score).toBe(10);
      expect(newState.streak).toBe(1);
    });

    it('should track completed expressions', () => {
      const state = { 
        ...createInitialState(), 
        status: 'playing' as const, 
        currentChallengeId: 'emotion-master',
        completedExpressions: ['happy']
      };
      const newState = updateHandState(state, 'surprised', 'open');
      
      expect(newState.completedExpressions).toContain('surprised');
      expect(newState.completedExpressions).toHaveLength(2);
    });

    it('should track completed gestures', () => {
      const state = { 
        ...createInitialState(), 
        status: 'playing' as const, 
        currentChallengeId: 'gesture-dance',
        completedGestures: ['wave']
      };
      const newState = updateHandState(state, 'neutral', 'point');
      
      expect(newState.completedGestures).toContain('point');
      expect(newState.completedGestures).toHaveLength(2);
    });

    it('should succeed when all targets met', () => {
      const state = { 
        ...createInitialState(), 
        status: 'playing' as const, 
        currentChallengeId: 'puppet-show',
        completedExpressions: ['happy'],
        completedGestures: ['wave']
      };
      const newState = updateHandState(state, 'happy', 'wave');
      
      expect(newState.status).toBe('success');
    });

    it('should not update when not playing', () => {
      const state = createInitialState();
      const newState = updateHandState(state, 'happy', 'wave');
      
      expect(newState).toEqual(state);
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
  });

  describe('calculateStars', () => {
    it('should return 3 stars for score >= 60', () => {
      expect(calculateStars(60)).toBe(3);
      expect(calculateStars(100)).toBe(3);
    });

    it('should return 2 stars for score >= 30', () => {
      expect(calculateStars(30)).toBe(2);
      expect(calculateStars(59)).toBe(2);
    });

    it('should return 1 star for score >= 10', () => {
      expect(calculateStars(10)).toBe(1);
      expect(calculateStars(29)).toBe(1);
    });

    it('should return 0 stars for score < 10', () => {
      expect(calculateStars(0)).toBe(0);
      expect(calculateStars(9)).toBe(0);
    });
  });

  describe('getHandGesture', () => {
    it('should detect point gesture', () => {
      // [thumb, index, middle, ring, pinky]
      expect(getHandGesture([0, 1, 0, 0, 0])).toBe('point');
    });

    it('should detect open gesture', () => {
      expect(getHandGesture([1, 1, 1, 1, 1])).toBe('open');
    });

    it('should detect fist gesture', () => {
      expect(getHandGesture([0, 0, 0, 0, 0])).toBe('fist');
    });

    it('should detect grab gesture', () => {
      expect(getHandGesture([1, 0, 0, 0, 0])).toBe('grab');
    });
  });

  describe('getExpressionFromHand', () => {
    it('should return happy for high hand position', () => {
      expect(getExpressionFromHand(0.5, 0.3)).toBe('happy');
    });

    it('should return sad for low hand position', () => {
      expect(getExpressionFromHand(0.5, 0.8)).toBe('sad');
    });

    it('should return surprised for left position', () => {
      expect(getExpressionFromHand(0.2, 0.5)).toBe('surprised');
    });

    it('should return silly for right position', () => {
      expect(getExpressionFromHand(0.8, 0.5)).toBe('silly');
    });

    it('should return neutral for center position', () => {
      expect(getExpressionFromHand(0.5, 0.5)).toBe('neutral');
    });
  });
});
