import { describe, expect, it } from 'vitest';

import { VisionService } from './VisionService';
import type {
  VisionProvider,
  VisionProviderOptions,
  VisionProviderStatus,
  VisionResult,
  VisionTask,
} from './VisionProvider';

class FakeVisionProvider implements VisionProvider {
  readonly name = 'FakeVision';
  readonly supportedTasks: VisionTask[] = ['hand', 'pose', 'face'];

  private status: VisionProviderStatus = 'uninitialized';
  private readyTasks = new Set<VisionTask>();
  private errorCb: ((error: Error) => void) | null = null;

  async init(
    task: VisionTask,
    _options?: VisionProviderOptions,
  ): Promise<boolean> {
    this.readyTasks.add(task);
    this.status = 'ready';
    return true;
  }

  isReady(task: VisionTask): boolean {
    return this.readyTasks.has(task);
  }

  getStatus(): VisionProviderStatus {
    return this.status;
  }

  detect(
    task: VisionTask,
    _videoElement: HTMLVideoElement,
  ): VisionResult | null {
    if (!this.isReady(task)) return null;
    return { timestamp: Date.now(), hands: [] };
  }

  onResult(_callback: (result: VisionResult) => void): void {
    // no-op for this test provider
  }

  onError(callback: (error: Error) => void): void {
    this.errorCb = callback;
    void this.errorCb;
  }

  dispose(): void {
    this.readyTasks.clear();
    this.status = 'uninitialized';
  }
}

describe('VisionService', () => {
  it('initializes and detects with injected provider', async () => {
    const service = new VisionService({
      createMediaPipeProvider: () => new FakeVisionProvider(),
    });

    const ready = await service.init({ provider: 'mediapipe' });
    expect(ready).toBe(true);
    expect(service.status).toBe('ready');

    const taskReady = await service.ensureTask('hand');
    expect(taskReady).toBe(true);

    let seen = false;
    service.onResult(() => {
      seen = true;
    });

    const result = service.detect('hand', {} as HTMLVideoElement);
    expect(result).not.toBeNull();
    expect(seen).toBe(true);

    service.dispose();
    expect(service.status).toBe('uninitialized');
  });
});
