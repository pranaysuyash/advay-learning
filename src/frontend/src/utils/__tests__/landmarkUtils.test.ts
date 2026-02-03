import { describe, expect, it } from 'vitest';
import { getHandLandmarkLists } from '../landmarkUtils';

describe('getHandLandmarkLists', () => {
  it('returns [] for null/invalid inputs', () => {
    expect(getHandLandmarkLists(null)).toEqual([]);
    expect(getHandLandmarkLists(undefined)).toEqual([]);
    expect(getHandLandmarkLists(123)).toEqual([]);
  });

  it('prefers landmarks (current API)', () => {
    const landmarks = [[{ x: 0, y: 0 }]];
    expect(getHandLandmarkLists({ landmarks })).toBe(landmarks);
  });

  it('falls back to handLandmarks', () => {
    const handLandmarks = [[{ x: 0.1, y: 0.2 }]];
    expect(getHandLandmarkLists({ handLandmarks })).toBe(handLandmarks);
  });

  it('falls back to hands', () => {
    const hands = [[{ x: 0.1, y: 0.2 }]];
    expect(getHandLandmarkLists({ hands })).toBe(hands);
  });
});

