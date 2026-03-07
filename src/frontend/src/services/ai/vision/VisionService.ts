/**
 * VisionService v2 - Provider & Runtime Manager
 *
 * Centralized service for managing vision providers:
 * - MediaPipe FilesetResolver (shared singleton)
 * - HandLandmarker instance management
 * - Model caching and versioning
 * - Provider lifecycle management
 *
 * This service is the SINGLE SOURCE OF TRUTH for vision initialization.
 * Hooks and components should use this instead of direct MediaPipe initialization.
 *
 * @see docs/research/VISION_PROVIDER_SURVEY_2026-03-05.md
 * @ticket TCK-20260306-001
 */

import type {
  VisionProvider,
  VisionTask,
  VisionProviderOptions,
  VisionResult,
  VisionProviderStatus,
} from './VisionProvider';
import { MediaPipeVisionProvider } from './MediaPipeVisionProvider';
import type { HandLandmarker } from '@mediapipe/tasks-vision';

// CDN Configuration - Single source of truth for MediaPipe versions
const MEDIAPIPE_CDN = {
  wasm: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm',
  model: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
} as const;

export interface VisionServiceOptions {
  /** Preferred provider: 'auto' | 'mediapipe' | 'onnx' */
  provider?: 'auto' | 'mediapipe' | 'onnx';
}

export interface VisionServiceDependencies {
  createMediaPipeProvider?: () => VisionProvider;
  createOnnxProvider?: () => VisionProvider | null;
}

export interface HandLandmarkerConfig {
  numHands?: number;
  minDetectionConfidence?: number;
  minHandPresenceConfidence?: number;
  minTrackingConfidence?: number;
  delegate?: 'GPU' | 'CPU';
}

const DEFAULT_OPTIONS: Required<VisionServiceOptions> = {
  provider: 'mediapipe',
};

/**
 * VisionService v2 - Centralized Provider Manager
 *
 * Manages:
 * 1. Shared FilesetResolver (singleton)
 * 2. Cached HandLandmarker instances
 * 3. Provider lifecycle
 */
export class VisionService {
  private provider: VisionProvider | null = null;
  private options: Required<VisionServiceOptions> = { ...DEFAULT_OPTIONS };
  private _status: VisionProviderStatus = 'uninitialized';
  private statusListeners: Set<(status: VisionProviderStatus) => void> =
    new Set();
  private resultListeners: Set<(result: VisionResult) => void> = new Set();
  private readonly deps: Required<VisionServiceDependencies>;

  // v2: Shared MediaPipe resources
  private handLandmarker: HandLandmarker | null = null;
  private handLandmarkerConfig: string | null = null; // Cache key

  constructor(deps: VisionServiceDependencies = {}) {
    this.deps = {
      createMediaPipeProvider:
        deps.createMediaPipeProvider ?? (() => new MediaPipeVisionProvider()),
      createOnnxProvider: deps.createOnnxProvider ?? (() => null),
    };
  }

  /**
   * Get the MediaPipe WASM fileset for direct use
   * Use this when you need to create custom landmarkers
   */
  async getWasmFileset(): Promise<unknown | null> {
    try {
      const { FilesetResolver } = await import('@mediapipe/tasks-vision');
      return await FilesetResolver.forVisionTasks(MEDIAPIPE_CDN.wasm);
    } catch (error) {
      console.error('[VisionService] Failed to initialize WASM fileset:', error);
      this._status = 'error';
      return null;
    }
  }

  /**
   * Get or create a HandLandmarker instance
   * Uses caching - returns existing instance if config matches
   */
  async getHandLandmarker(
    config: HandLandmarkerConfig = {},
  ): Promise<HandLandmarker | null> {
    const cacheKey = JSON.stringify(config);

    // Return cached instance if config matches
    if (this.handLandmarker && this.handLandmarkerConfig === cacheKey) {
      return this.handLandmarker;
    }

    // Dispose old instance if config changed
    if (this.handLandmarker) {
      this.handLandmarker.close();
      this.handLandmarker = null;
    }

    const vision = await this.getWasmFileset();
    if (!vision) {
      return null;
    }

    try {
      const { HandLandmarker } = await import('@mediapipe/tasks-vision');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.handLandmarker = await HandLandmarker.createFromOptions(vision as any, {
        baseOptions: {
          modelAssetPath: MEDIAPIPE_CDN.model,
          delegate: config.delegate ?? 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: config.numHands ?? 2,
        minHandDetectionConfidence: config.minDetectionConfidence ?? 0.3,
        minHandPresenceConfidence: config.minHandPresenceConfidence ?? 0.3,
        minTrackingConfidence: config.minTrackingConfidence ?? 0.3,
      });

      this.handLandmarkerConfig = cacheKey;
      this._status = 'ready';
      return this.handLandmarker;
    } catch (error) {
      console.error('[VisionService] Failed to create HandLandmarker:', error);
      this._status = 'error';
      return null;
    }
  }

  /**
   * Legacy method for backward compatibility
   * Initializes the full VisionProvider (hand, pose, face)
   */
  async init(options?: VisionServiceOptions): Promise<boolean> {
    this.options = { ...DEFAULT_OPTIONS, ...options };

    if (this.options.provider === 'auto') {
      this.options.provider = 'mediapipe';
    }

    await this.initializeProvider();
    return this._status !== 'uninitialized' && this._status !== 'error';
  }

  private async initializeProvider(): Promise<void> {
    switch (this.options.provider) {
      case 'mediapipe':
        this.provider = this.deps.createMediaPipeProvider();
        break;
      case 'onnx':
        this.provider = this.deps.createOnnxProvider();
        if (!this.provider) {
          console.warn('[VisionService] ONNX provider not yet implemented');
          this._status = 'uninitialized';
          return;
        }
        break;
      default:
        console.error(
          '[VisionService] Unknown provider:',
          this.options.provider,
        );
        this._status = 'uninitialized';
        return;
    }

    this.provider.onError((error) => {
      console.error('[VisionService] Provider error:', error);
      this._status = 'error';
    });

    // Initialize default hand tracking
    const ready = await this.provider.init('hand');
    this._status = ready ? 'ready' : 'error';
  }

  async ensureTask(
    task: VisionTask,
    options?: VisionProviderOptions,
  ): Promise<boolean> {
    if (!this.provider) {
      console.warn('[VisionService] Not initialized');
      return false;
    }

    if (this.provider.isReady(task)) {
      return true;
    }

    return this.provider.init(task, options);
  }

  detect(
    task: VisionTask,
    videoElement: HTMLVideoElement,
  ): VisionResult | null {
    if (!this.provider || !this.provider.isReady(task)) {
      return null;
    }

    const result = this.provider.detect(task, videoElement);

    if (result) {
      this.resultListeners.forEach((cb) => cb(result));
    }

    return result;
  }

  get status(): VisionProviderStatus {
    return this._status;
  }

  onStatusChange(callback: (status: VisionProviderStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this._status);
    return () => this.statusListeners.delete(callback);
  }

  onResult(callback: (result: VisionResult) => void): () => void {
    this.resultListeners.add(callback);
    return () => this.resultListeners.delete(callback);
  }

  /**
   * Get CDN configuration
   * Useful for hooks that need consistent MediaPipe URLs
   */
  getCDNConfig(): typeof MEDIAPIPE_CDN {
    return { ...MEDIAPIPE_CDN };
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    this.handLandmarker?.close();
    this.handLandmarker = null;
    this.handLandmarkerConfig = null;

    this.provider?.dispose();
    this.provider = null;
    this.statusListeners.clear();
    this.resultListeners.clear();
    this._status = 'uninitialized';
  }

  /**
   * Reset hand landmarker (useful for delegate fallback)
   */
  resetHandLandmarker(): void {
    this.handLandmarker?.close();
    this.handLandmarker = null;
    this.handLandmarkerConfig = null;
  }
}

// Global singleton instance
export const visionService = new VisionService();

// Export CDN config for direct use
export { MEDIAPIPE_CDN };
