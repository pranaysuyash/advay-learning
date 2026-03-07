import { MediaPipeVisionProvider } from '../MediaPipeVisionProvider';
import { vi } from 'vitest';
import type { VisionTask, VisionResult } from '../VisionProvider';

// stub visionService to provide a fake fileset resolver
vi.mock('../VisionService', () => ({
  visionService: {
    getWasmFileset: vi.fn(async () => {
      return {
        createHandLandmarker: async (opts: any) => ({
          detectForVideo: (video: HTMLVideoElement, t: number) => ({
            landmarks: [],
            worldLandmarks: [],
            handedness: [],
          }),
          close: () => {},
        }),
        createPoseLandmarker: async (opts: any) => ({
          detectForVideo: (video: HTMLVideoElement, t: number) => ({
            landmarks: [],
          }),
          close: () => {},
        }),
        createFaceLandmarker: async (opts: any) => ({
          detectForVideo: (video: HTMLVideoElement, t: number) => ({
            landmarks: [],
          }),
          close: () => {},
        }),
      };
    }),
  },
}));

describe('MediaPipeVisionProvider', () => {
  it('initializes hand task and reports ready', async () => {
    const prov = new MediaPipeVisionProvider();
    const ok = await prov.init('hand');
    expect(ok).toBe(true);
    expect(prov.getStatus()).toBe('ready');
    expect(prov.isReady('hand')).toBe(true);
  });

  it('detect returns result when ready', async () => {
    const prov = new MediaPipeVisionProvider();
    await prov.init('hand');
    const video = document.createElement('video');
    const res = prov.detect('hand', video);
    expect(res).not.toBeNull();
    // stub returns no landmarks so hands may be undefined but timestamp should exist
    expect(res?.timestamp).toBeGreaterThan(0);
  });

  it('detect returns null when not initialized', () => {
    const prov = new MediaPipeVisionProvider();
    const res = prov.detect('hand', document.createElement('video'));
    expect(res).toBeNull();
  });

  it('dispose resets state', async () => {
    const prov = new MediaPipeVisionProvider();
    await prov.init('hand');
    prov.dispose();
    expect(prov.getStatus()).toBe('uninitialized');
    expect(prov.isReady('hand')).toBe(false);
  });

  it('resets error callback on initialization failure', async () => {
    // override getWasmFileset to fail
    const { visionService } = await import('../VisionService');
    (visionService.getWasmFileset as any).mockResolvedValueOnce(null);
    const prov = new MediaPipeVisionProvider();
    const spy = vi.fn();
    prov.onError(spy);
    const ok = await prov.init('hand');
    expect(ok).toBe(false);
    expect(spy).toHaveBeenCalled();
  });
});
