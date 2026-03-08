import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../gameStore';

describe('gameStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useGameStore.setState({
      isPlaying: false,
      score: 0,
      currentLevel: 1,
      timeLeft: 30,
      handData: null,
      isTracking: false,
      strokes: [],
      currentStroke: [],
    });
  });

  describe('initial state', () => {
    it('has correct initial values', () => {
      const state = useGameStore.getState();
      
      expect(state.isPlaying).toBe(false);
      expect(state.score).toBe(0);
      expect(state.currentLevel).toBe(1);
      expect(state.timeLeft).toBe(30);
      expect(state.handData).toBeNull();
      expect(state.isTracking).toBe(false);
      expect(state.strokes).toEqual([]);
      expect(state.currentStroke).toEqual([]);
    });
  });

  describe('startGame', () => {
    it('sets isPlaying to true', () => {
      useGameStore.getState().startGame();
      
      expect(useGameStore.getState().isPlaying).toBe(true);
    });

    it('resets score to 0', () => {
      useGameStore.setState({ score: 100 });
      useGameStore.getState().startGame();
      
      expect(useGameStore.getState().score).toBe(0);
    });

    it('resets timeLeft to 30', () => {
      useGameStore.setState({ timeLeft: 10 });
      useGameStore.getState().startGame();
      
      expect(useGameStore.getState().timeLeft).toBe(30);
    });

    it('clears strokes', () => {
      useGameStore.setState({
        strokes: [[{ x: 0, y: 0 }, { x: 1, y: 1 }]],
        currentStroke: [{ x: 2, y: 2 }],
      });
      useGameStore.getState().startGame();
      
      expect(useGameStore.getState().strokes).toEqual([]);
      expect(useGameStore.getState().currentStroke).toEqual([]);
    });
  });

  describe('stopGame', () => {
    it('sets isPlaying to false', () => {
      useGameStore.setState({ isPlaying: true });
      useGameStore.getState().stopGame();
      
      expect(useGameStore.getState().isPlaying).toBe(false);
    });

    it('sets isTracking to false', () => {
      useGameStore.setState({ isTracking: true });
      useGameStore.getState().stopGame();
      
      expect(useGameStore.getState().isTracking).toBe(false);
    });
  });

  describe('updateScore', () => {
    it('adds points to score', () => {
      useGameStore.getState().updateScore(10);
      
      expect(useGameStore.getState().score).toBe(10);
    });

    it('accumulates points', () => {
      useGameStore.getState().updateScore(10);
      useGameStore.getState().updateScore(20);
      useGameStore.getState().updateScore(5);
      
      expect(useGameStore.getState().score).toBe(35);
    });

    it('handles negative points', () => {
      useGameStore.setState({ score: 50 });
      useGameStore.getState().updateScore(-10);
      
      expect(useGameStore.getState().score).toBe(40);
    });
  });

  describe('setHandData', () => {
    it('sets hand data', () => {
      const handData = {
        landmarks: [{ x: 0.5, y: 0.5, z: 0 }],
        pointer: { x: 100, y: 100 },
        presence: true,
        confidence: 0.9,
      };
      
      useGameStore.getState().setHandData(handData);
      
      expect(useGameStore.getState().handData).toEqual(handData);
    });

    it('sets isTracking to true when presence is true', () => {
      const handData = {
        landmarks: [],
        pointer: { x: 0, y: 0 },
        presence: true,
        confidence: 0.8,
      };
      
      useGameStore.getState().setHandData(handData);
      
      expect(useGameStore.getState().isTracking).toBe(true);
    });

    it('sets isTracking to false when presence is false', () => {
      const handData = {
        landmarks: [],
        pointer: { x: 0, y: 0 },
        presence: false,
        confidence: 0,
      };
      
      useGameStore.getState().setHandData(handData);
      
      expect(useGameStore.getState().isTracking).toBe(false);
    });

    it('sets isTracking to false when data is null', () => {
      useGameStore.setState({ isTracking: true });
      useGameStore.getState().setHandData(null);
      
      expect(useGameStore.getState().handData).toBeNull();
      expect(useGameStore.getState().isTracking).toBe(false);
    });
  });

  describe('addPointToStroke', () => {
    it('adds point to current stroke', () => {
      useGameStore.getState().addPointToStroke({ x: 10, y: 20 });
      
      expect(useGameStore.getState().currentStroke).toEqual([{ x: 10, y: 20 }]);
    });

    it('accumulates points in current stroke', () => {
      useGameStore.getState().addPointToStroke({ x: 10, y: 20 });
      useGameStore.getState().addPointToStroke({ x: 30, y: 40 });
      useGameStore.getState().addPointToStroke({ x: 50, y: 60 });
      
      expect(useGameStore.getState().currentStroke).toEqual([
        { x: 10, y: 20 },
        { x: 30, y: 40 },
        { x: 50, y: 60 },
      ]);
    });
  });

  describe('endStroke', () => {
    it('moves current stroke to strokes', () => {
      useGameStore.setState({
        currentStroke: [{ x: 10, y: 20 }, { x: 30, y: 40 }],
      });
      
      useGameStore.getState().endStroke();
      
      expect(useGameStore.getState().strokes).toEqual([
        [{ x: 10, y: 20 }, { x: 30, y: 40 }],
      ]);
      expect(useGameStore.getState().currentStroke).toEqual([]);
    });

    it('accumulates multiple strokes', () => {
      // First stroke
      useGameStore.setState({
        currentStroke: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
      });
      useGameStore.getState().endStroke();
      
      // Second stroke
      useGameStore.setState({
        currentStroke: [{ x: 3, y: 3 }, { x: 4, y: 4 }],
      });
      useGameStore.getState().endStroke();
      
      expect(useGameStore.getState().strokes).toEqual([
        [{ x: 1, y: 1 }, { x: 2, y: 2 }],
        [{ x: 3, y: 3 }, { x: 4, y: 4 }],
      ]);
    });

    it('handles empty current stroke', () => {
      useGameStore.getState().endStroke();
      
      expect(useGameStore.getState().strokes).toEqual([[]]);
    });
  });

  describe('clearCanvas', () => {
    it('clears all strokes', () => {
      useGameStore.setState({
        strokes: [[{ x: 1, y: 1 }], [{ x: 2, y: 2 }]],
        currentStroke: [{ x: 3, y: 3 }],
      });
      
      useGameStore.getState().clearCanvas();
      
      expect(useGameStore.getState().strokes).toEqual([]);
      expect(useGameStore.getState().currentStroke).toEqual([]);
    });
  });

  describe('tick', () => {
    it('decrements timeLeft by 1', () => {
      useGameStore.setState({ timeLeft: 30 });
      useGameStore.getState().tick();
      
      expect(useGameStore.getState().timeLeft).toBe(29);
    });

    it('does not go below 0', () => {
      useGameStore.setState({ timeLeft: 0 });
      useGameStore.getState().tick();
      
      expect(useGameStore.getState().timeLeft).toBe(0);
      
      useGameStore.getState().tick();
      expect(useGameStore.getState().timeLeft).toBe(0);
    });

    it('handles multiple ticks', () => {
      useGameStore.setState({ timeLeft: 10 });
      
      for (let i = 0; i < 5; i++) {
        useGameStore.getState().tick();
      }
      
      expect(useGameStore.getState().timeLeft).toBe(5);
    });
  });
});
