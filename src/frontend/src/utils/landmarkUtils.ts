import type { Landmark } from '../types/tracking';

type MaybeHandLandmarkerResult = {
  // Current MediaPipe Tasks API (0.10.x)
  landmarks?: Landmark[][];
  // Historical / alternate shapes seen in earlier iterations
  handLandmarks?: Landmark[][];
  hands?: Landmark[][];
};

/**
 * Normalizes hand-landmark results across API shape drift.
 * Returns a list of hands, where each hand is a list of 21 landmarks.
 */
export function getHandLandmarkLists(results: unknown): Landmark[][] {
  if (!results || typeof results !== 'object') return [];
  const r = results as MaybeHandLandmarkerResult;
  return r.landmarks ?? r.handLandmarks ?? r.hands ?? [];
}

