import { describe, it, expect, vi } from 'vitest';

// mock the mediapipe import to provide fake resolver and landmarkers
vi.mock('@mediapipe/tasks-vision', () => {
  class FakeLandmarker {
    detectForVideo(_video: HTMLVideoElement, _timestamp: number) {
      return {
        landmarks: [[{ x: 0, y: 0 }]],
        worldLandmarks: [[{ x: 0, y: 0 }]],
        handedness: [[{ categoryName: 'Right', probability: 0.9 }]],
      };
    }
    close() {}
  }

  class FakeResolver {
    static async forVisionTasks(_url: string) {
      return new FakeResolver();
    }
    async createHandLandmarker(_opts: any) {
      return new FakeLandmarker();
    }
    async createPoseLandmarker(_opts: any) {
      return new FakeLandmarker();
    }
    async createFaceLandmarker(_opts: any) {
      return new FakeLandmarker();
    }
  }

  return {
    FilesetResolver: FakeResolver,
    HandLandmarker: FakeLandmarker,
    PoseLandmarker: FakeLandmarker,
    FaceLandmarker: FakeLandmarker,
  };
});

import { MediaPipeVisionProvider } from './MediaPipeVisionProvider';

function makeVideo(): HTMLVideoElement {
  // create a dummy video element for tests
  return { currentTime: 0 } as any;
}

describe('MediaPipeVisionProvider', () => {
  it('initializes & detects hand results', async () => {
    const prov = new MediaPipeVisionProvider();
    const ready = await prov.init('hand');
    expect(ready).toBe(true);
    expect(prov.isReady('hand')).toBe(true);

    let result: any = prov.detect('hand', makeVideo());
    expect(result).not.toBeNull();
    expect(result?.hands?.[0]?.handedness[0].category).toBe('Right');
  });

  it('calls onResult callback', async () => {
    const prov = new MediaPipeVisionProvider();
    await prov.init('hand');
    let seen: any = null;
    prov.onResult((r) => {
      seen = r;
    });
    prov.detect('hand', makeVideo());
    expect(seen).not.toBeNull();
  });

  it('propagates errors via onError', async () => {
    const prov = new MediaPipeVisionProvider();
    await prov.init('hand');
    let err: any = null;
    prov.onError((e) => (err = e));

    // force error by monkey patching detectHands
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prov as any).detectHands = () => {
      throw new Error('test-fail');
    };

    const r = prov.detect('hand', makeVideo());
    expect(r).toBeNull();
    expect(err).toBeInstanceOf(Error);
  });

  it('returns pose and face data if requested', async () => {
    const prov = new MediaPipeVisionProvider();
    await prov.init('pose');
    const pose = prov.detect('pose', makeVideo());
    expect(pose?.poses).toBeDefined();

    await prov.init('face');
    const face = prov.detect('face', makeVideo());
    expect(face?.faces).toBeDefined();
  });
});
