import { VisionService, MEDIAPIPE_CDN } from '../VisionService';
import type {
  VisionProvider,
  VisionTask,
  VisionResult,
} from '../VisionProvider';
import { vi } from 'vitest';

// a simple fake provider implementing VisionProvider interface
class FakeProvider implements VisionProvider {
  name = 'fake';
  supportedTasks: VisionTask[] = ['hand'];
  status: string = 'uninitialized';

  init = vi.fn(async (task: VisionTask) => {
    this.status = 'ready';
    return true;
  });

  isReady = vi.fn((task: VisionTask) => this.status === 'ready');
  getStatus = vi.fn(() => (this.status as any));
  detect = vi.fn((task: VisionTask) => {
    return { timestamp: Date.now(), hands: [] } as VisionResult;
  });
  onResult = vi.fn();
  onError = vi.fn();
  dispose = vi.fn();
}

describe('VisionService', () => {
  it('initializes provider via deps and sets status', async () => {
    const fake = new FakeProvider();
    const service = new VisionService({
      createMediaPipeProvider: () => fake,
    });

    expect(service.status).toBe('uninitialized');
    const ok = await service.init({ provider: 'mediapipe' });
    expect(ok).toBe(true);
    expect(fake.init).toHaveBeenCalledWith('hand');
    expect(service.status).toBe('ready');
  });

  it('falls back when createOnnxProvider returns null', async () => {
    const fake = new FakeProvider();
    const svc = new VisionService({
      createMediaPipeProvider: () => fake,
      createOnnxProvider: () => null,
    });
    await svc.init({ provider: 'onnx' });
    // provider not initialized, status remains uninitialized
    expect(svc.status).toBe('uninitialized');
  });

  it('ensureTask calls provider.init if not ready', async () => {
    const fake = new FakeProvider();
    const svc = new VisionService({
      createMediaPipeProvider: () => fake,
    });
    await svc.init();
    fake.isReady.mockReturnValue(false);
    fake.init.mockResolvedValueOnce(true);
    const r = await svc.ensureTask('hand');
    expect(r).toBe(true);
    expect(fake.init).toHaveBeenCalledWith('hand');
  });

  it('detect returns null when no provider', () => {
    const svc = new VisionService();
    expect(svc.detect('hand', document.createElement('video'))).toBeNull();
  });

  it('detect forwards result and notifies listeners', async () => {
    const fake = new FakeProvider();
    const svc = new VisionService({
      createMediaPipeProvider: () => fake,
    });
    await svc.init();
    const video = document.createElement('video');
    const spy = vi.fn();
    svc.onResult(spy);
    fake.isReady.mockReturnValue(true);
    fake.detect.mockReturnValue({ timestamp: 1, hands: [] });
    const res = svc.detect('hand', video);
    expect(res).not.toBeNull();
    expect(spy).toHaveBeenCalledWith(res);
  });

  it('getCDNConfig returns a copy', () => {
    const config = VisionService.prototype.getCDNConfig.call({} as any);
    expect(config).toEqual(MEDIAPIPE_CDN);
    expect(config).not.toBe(MEDIAPIPE_CDN);
  });

  it('dispose clears state', async () => {
    const fake = new FakeProvider();
    const svc = new VisionService({
      createMediaPipeProvider: () => fake,
    });
    await svc.init();
    svc.dispose();
    expect(svc.status).toBe('uninitialized');
  });
});
