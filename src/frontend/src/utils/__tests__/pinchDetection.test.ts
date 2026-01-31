import { describe, it, expect } from 'vitest';
import {
  createDefaultPinchState,
  detectPinch,
  isPinching,
  getPinchDistance,
} from '../pinchDetection';
import type { Landmark, PinchState } from '../../types/tracking';

// Helper to create landmarks with thumb and index at specific distance
function createLandmarks(distance: number): Landmark[] {
  const landmarks: Landmark[] = new Array(21).fill(null).map(() => ({ x: 0, y: 0 }));
  // Thumb tip at (0, 0)
  landmarks[4] = { x: 0, y: 0 };
  // Index tip at (distance, 0)
  landmarks[8] = { x: distance, y: 0 };
  return landmarks;
}

describe('pinchDetection', () => {
  describe('createDefaultPinchState', () => {
    it('creates default state', () => {
      const state = createDefaultPinchState();
      
      expect(state.isPinching).toBe(false);
      expect(state.distance).toBe(1.0);
      expect(state.startThreshold).toBe(0.05);
      expect(state.releaseThreshold).toBe(0.07);
    });
    
    it('accepts custom thresholds', () => {
      const state = createDefaultPinchState({
        startThreshold: 0.1,
        releaseThreshold: 0.15,
      });
      
      expect(state.startThreshold).toBe(0.1);
      expect(state.releaseThreshold).toBe(0.15);
    });
  });
  
  describe('detectPinch', () => {
    it('returns default state for empty landmarks', () => {
      const result = detectPinch([], null);
      
      expect(result.transition).toBe('none');
      expect(result.state.isPinching).toBe(false);
    });
    
    it('starts pinch when distance below threshold', () => {
      const landmarks = createLandmarks(0.03); // Below 0.05
      const prevState: PinchState = {
        isPinching: false,
        distance: 0.1,
        startThreshold: 0.05,
        releaseThreshold: 0.07,
      };
      
      const result = detectPinch(landmarks, prevState);
      
      expect(result.transition).toBe('start');
      expect(result.state.isPinching).toBe(true);
    });
    
    it('continues pinch when in hysteresis zone', () => {
      // Distance is between start (0.05) and release (0.07)
      const landmarks = createLandmarks(0.06);
      const prevState: PinchState = {
        isPinching: true, // Was already pinching
        distance: 0.05,
        startThreshold: 0.05,
        releaseThreshold: 0.07,
      };
      
      const result = detectPinch(landmarks, prevState);
      
      expect(result.transition).toBe('continue');
      expect(result.state.isPinching).toBe(true);
    });
    
    it('releases pinch when distance above threshold', () => {
      const landmarks = createLandmarks(0.08); // Above 0.07
      const prevState: PinchState = {
        isPinching: true,
        distance: 0.05,
        startThreshold: 0.05,
        releaseThreshold: 0.07,
      };
      
      const result = detectPinch(landmarks, prevState);
      
      expect(result.transition).toBe('release');
      expect(result.state.isPinching).toBe(false);
    });
    
    it('does not start pinch in hysteresis zone', () => {
      // Distance is between start and release, but wasn't pinching
      const landmarks = createLandmarks(0.06);
      const prevState: PinchState = {
        isPinching: false,
        distance: 0.1,
        startThreshold: 0.05,
        releaseThreshold: 0.07,
      };
      
      const result = detectPinch(landmarks, prevState);
      
      expect(result.transition).toBe('none');
      expect(result.state.isPinching).toBe(false);
    });
  });
  
  describe('isPinching', () => {
    it('returns true when pinching', () => {
      const landmarks = createLandmarks(0.03);
      expect(isPinching(landmarks)).toBe(true);
    });
    
    it('returns false when not pinching', () => {
      const landmarks = createLandmarks(0.1);
      expect(isPinching(landmarks)).toBe(false);
    });
    
    it('returns false for invalid landmarks', () => {
      expect(isPinching([])).toBe(false);
    });
  });
  
  describe('getPinchDistance', () => {
    it('returns correct distance', () => {
      const landmarks = createLandmarks(0.05);
      expect(getPinchDistance(landmarks)).toBeCloseTo(0.05, 5);
    });
    
    it('returns 1.0 for invalid landmarks', () => {
      expect(getPinchDistance([])).toBe(1.0);
    });
  });
});
