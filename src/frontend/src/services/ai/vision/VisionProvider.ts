/**
 * VisionProvider Interface
 *
 * Defines the contract for vision providers. Supports MediaPipe as primary
 * with ONNX runtime as potential future provider for object detection.
 */

import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export type VisionTask = 'hand' | 'pose' | 'face' | 'object';

export interface VisionProviderOptions {
  /** Number of hands/faces to detect */
  numHands?: number;
  /** Minimum detection confidence */
  minDetectionConfidence?: number;
  /** Minimum hand presence confidence */
  minHandPresenceConfidence?: number;
  /** Minimum tracking confidence */
  minTrackingConfidence?: number;
  /** Use GPU delegate */
  delegate?: 'GPU' | 'CPU';
}

export interface HandResult {
  landmarks: NormalizedLandmark[];
  worldLandmarks: NormalizedLandmark[];
  handedness: Array<{ category: string; score: number }>;
}

export interface VisionResult {
  timestamp: number;
  hands?: HandResult[];
  /** Generic pose results, shape depends on provider */
  poses?: any[];
  /** Generic face results, shape depends on provider */
  faces?: any[];
}

export type VisionProviderStatus =
  | 'uninitialized'
  | 'loading'
  | 'ready'
  | 'error';

export interface VisionProvider {
  /** Human-readable name */
  readonly name: string;

  /** Tasks this provider supports */
  readonly supportedTasks: VisionTask[];

  /** Initialize for specific task */
  init(task: VisionTask, options?: VisionProviderOptions): Promise<boolean>;

  /** Whether ready to detect */
  isReady(task: VisionTask): boolean;

  /** Current status */
  getStatus(): VisionProviderStatus;

  /** Process video frame and return results */
  detect(task: VisionTask, videoElement: HTMLVideoElement): VisionResult | null;

  /** Register callback for results */
  onResult(callback: (result: VisionResult) => void): void;

  /** Register callback for errors */
  onError(callback: (error: Error) => void): void;

  /** Dispose resources */
  dispose(): void;
}
