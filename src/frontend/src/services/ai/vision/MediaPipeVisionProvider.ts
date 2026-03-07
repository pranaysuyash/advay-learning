/**
 * MediaPipeVisionProvider - Google MediaPipe wrapper
 *
 * Wraps MediaPipe HandLandmarker, PoseLandmarker, and FaceLandmarker
 * with a unified interface.
 */

import {
  HandLandmarker,
  PoseLandmarker,
  FaceLandmarker,
} from '@mediapipe/tasks-vision';

import type {
  VisionProvider,
  VisionTask,
  VisionProviderOptions,
  VisionResult,
  VisionProviderStatus,
  HandResult,
} from './VisionProvider';
import { visionService } from './VisionService';

const DEFAULT_OPTIONS: Required<VisionProviderOptions> = {
  numHands: 2,
  minDetectionConfidence: 0.5,
  minHandPresenceConfidence: 0.5,
  minTrackingConfidence: 0.5,
  delegate: 'GPU',
};

export class MediaPipeVisionProvider implements VisionProvider {
  readonly name = 'MediaPipe';
  readonly supportedTasks: VisionTask[] = ['hand', 'pose', 'face'];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private filesetResolver: any | null = null;
  private handLandmarker: HandLandmarker | null = null;
  private poseLandmarker: PoseLandmarker | null = null;
  private faceLandmarker: FaceLandmarker | null = null;

  private _status: VisionProviderStatus = 'uninitialized';
  // underscored name to avoid unused-var error
  private errorCallback: ((error: Error) => void) | null = null;
  private resultCallback: ((result: VisionResult) => void) | null = null;
  private currentOptions: Map<VisionTask, Required<VisionProviderOptions>> =
    new Map();

  async init(
    task: VisionTask,
    options?: VisionProviderOptions,
  ): Promise<boolean> {
    const opts = {
      ...DEFAULT_OPTIONS,
      ...options,
    } as Required<VisionProviderOptions>;
    this.currentOptions.set(task, opts);

    try {
      this._status = 'loading';

      if (!this.filesetResolver) {
        // Use VisionService for consistent CDN URLs and shared fileset
        this.filesetResolver = await visionService.getWasmFileset();
        if (!this.filesetResolver) {
          throw new Error('Failed to get WASM fileset from VisionService');
        }
      }

      switch (task) {
        case 'hand':
          // @ts-ignore - types from @mediapipe/tasks-vision are incomplete
          this.handLandmarker = await (
            this.filesetResolver as any
          ).createHandLandmarker({
            numHands: opts.numHands,
            minHandPresenceConfidence: opts.minHandPresenceConfidence,
            minTrackingConfidence: opts.minTrackingConfidence,
            minDetectionConfidence: opts.minDetectionConfidence,
            runningMode: 'VIDEO',
          });
          break;
        case 'pose':
          // @ts-ignore - types are missing
          this.poseLandmarker = await (
            this.filesetResolver as any
          ).createPoseLandmarker({
            numPoses: 1,
            minTrackingConfidence: opts.minTrackingConfidence,
            minDetectionConfidence: opts.minDetectionConfidence,
            runningMode: 'VIDEO',
          });
          break;
        case 'face':
          // @ts-ignore - types are missing
          this.faceLandmarker = await (
            this.filesetResolver as any
          ).createFaceLandmarker({
            numFaces: 1,
            minTrackingConfidence: opts.minTrackingConfidence,
            minDetectionConfidence: opts.minDetectionConfidence,
            runningMode: 'VIDEO',
          });
          break;
      }

      this._status = 'ready';
      console.log(`[MediaPipeVisionProvider] Initialized ${task} task`);
      return true;
    } catch (e) {
      console.error('[MediaPipeVisionProvider] Init error:', e);
      this._status = 'error';
      this.errorCallback?.(e instanceof Error ? e : new Error(String(e)));
      return false;
    }
  }

  isReady(task: VisionTask): boolean {
    if (this._status !== 'ready') return false;

    switch (task) {
      case 'hand':
        return !!this.handLandmarker;
      case 'pose':
        return !!this.poseLandmarker;
      case 'face':
        return !!this.faceLandmarker;
      default:
        return false;
    }
  }

  getStatus(): VisionProviderStatus {
    return this._status;
  }

  detect(
    task: VisionTask,
    videoElement: HTMLVideoElement,
  ): VisionResult | null {
    if (!this.isReady(task)) {
      console.warn(`[MediaPipeVisionProvider] ${task} not ready`);
      return null;
    }

    const timestamp = performance.now();

    try {
      switch (task) {
        case 'hand':
          const handRes = this.detectHands(videoElement, timestamp);
          this.resultCallback?.(handRes);
          return handRes;
        case 'pose':
          const poseRes = this.detectPose(videoElement, timestamp);
          this.resultCallback?.(poseRes);
          return poseRes;
        case 'face':
          const faceRes = this.detectFace(videoElement, timestamp);
          this.resultCallback?.(faceRes);
          return faceRes;
        default:
          return null;
      }
    } catch (e) {
      console.error('[MediaPipeVisionProvider] Detect error:', e);
      this.errorCallback?.(e instanceof Error ? e : new Error(String(e)));
      return null;
    }
  }

  private detectHands(
    video: HTMLVideoElement,
    timestamp: number,
  ): VisionResult {
    const result = this.handLandmarker!.detectForVideo(video, timestamp);

    const hands: HandResult[] = [];

    if (result.landmarks && result.worldLandmarks && result.handedness) {
      for (let i = 0; i < result.landmarks.length; i++) {
        hands.push({
          landmarks: result.landmarks[i],
          worldLandmarks: result.worldLandmarks[i],
          handedness: result.handedness[i].map((h) => ({
            category: h.categoryName,
            // @ts-ignore - property name differs in types
            score: (h as any).probability,
          })),
        });
      }
    }

    return { timestamp, hands: hands.length > 0 ? hands : undefined };
  }

  private detectPose(video: HTMLVideoElement, timestamp: number): VisionResult {
    const result = this.poseLandmarker!.detectForVideo(video, timestamp) as any;

    const data: any[] = [];
    if (result.landmarks) {
      data.push(...result.landmarks);
    }

    return {
      timestamp,
      poses: data.length ? data : undefined,
    };
  }

  private detectFace(video: HTMLVideoElement, timestamp: number): VisionResult {
    const result = this.faceLandmarker!.detectForVideo(video, timestamp) as any;

    const data: any[] = [];
    if (result.landmarks) {
      data.push(...result.landmarks);
    }

    return {
      timestamp,
      faces: data.length ? data : undefined,
    };
  }

  // onResult is currently a no-op; callback storage will be added when
  // the provider is wired up to an async stream. Kept for interface
  // compatibility.
  onResult(callback: (result: VisionResult) => void): void {
    this.resultCallback = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.errorCallback = callback;
  }

  dispose(): void {
    this.handLandmarker?.close();
    this.poseLandmarker?.close();
    this.faceLandmarker?.close();

    this.handLandmarker = null;
    this.poseLandmarker = null;
    this.faceLandmarker = null;
    this.filesetResolver = null;

    this._status = 'uninitialized';
  }
}
