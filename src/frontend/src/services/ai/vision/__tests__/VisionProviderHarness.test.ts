import { describe, expect, it, vi } from 'vitest';

import { MediaPipeVisionProvider } from '../MediaPipeVisionProvider';
import type {
  VisionProvider,
  VisionProviderOptions,
  VisionProviderStatus,
  VisionResult,
  VisionTask,
} from '../VisionProvider';
import { runVisionProviderHarness } from './visionProviderHarness';

// keep MediaPipe deterministic by stubbing service fileset
vi.mock('../VisionService', () => ({
  visionService: {
    getWasmFileset: vi.fn(async () => {
      return {
        createHandLandmarker: async (_opts: any) => ({
          detectForVideo: (_video: HTMLVideoElement, timestamp: number) => ({
            landmarks: [[{ x: 0, y: 0, z: 0 }]],
            worldLandmarks: [[{ x: 0, y: 0, z: 0 }]],
            handedness: [[{ categoryName: 'Right', probability: 0.92 }]],
          }),
          close: () => {},
        }),
      };
    }),
  },
}));

class HarnessFakeProvider implements VisionProvider {
  readonly name = 'HarnessFakeProvider';
  readonly supportedTasks: VisionTask[] = ['hand'];

  private status: VisionProviderStatus = 'uninitialized';
  private resultCb: ((result: VisionResult) => void) | null = null;
  private errorCb: ((error: Error) => void) | null = null;

  async init(
    task: VisionTask,
    _options?: VisionProviderOptions,
  ): Promise<boolean> {
    if (!this.supportedTasks.includes(task)) {
      this.status = 'error';
      this.errorCb?.(new Error(`unsupported-task:${task}`));
      return false;
    }
    this.status = 'ready';
    return true;
  }

  isReady(task: VisionTask): boolean {
    return this.status === 'ready' && this.supportedTasks.includes(task);
  }

  getStatus(): VisionProviderStatus {
    return this.status;
  }

  detect(
    task: VisionTask,
    _videoElement: HTMLVideoElement,
  ): VisionResult | null {
    if (!this.isReady(task)) return null;
    const payload: VisionResult = { timestamp: 1, hands: [] };
    this.resultCb?.(payload);
    return payload;
  }

  onResult(callback: (result: VisionResult) => void): void {
    this.resultCb = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.errorCb = callback;
  }

  dispose(): void {
    this.status = 'uninitialized';
    this.resultCb = null;
    this.errorCb = null;
  }
}

describe('Vision provider harness', () => {
  it('validates contract for a fake provider', async () => {
    await runVisionProviderHarness({
      provider: new HarnessFakeProvider(),
      task: 'hand',
      assertResult: (result) => {
        expect(result).not.toBeNull();
        expect(result?.hands).toBeDefined();
      },
    });
  });

  it('validates MediaPipe provider lifecycle for hand task', async () => {
    await runVisionProviderHarness({
      provider: new MediaPipeVisionProvider(),
      task: 'hand',
      assertResult: (result) => {
        expect(result).not.toBeNull();
        expect(result?.hands?.[0]?.handedness?.[0]?.category).toBe('Right');
      },
    });
  });
});
