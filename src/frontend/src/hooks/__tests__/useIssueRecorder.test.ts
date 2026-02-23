import { describe, expect, it, vi } from 'vitest';

import { pickSupportedRecorderMimeType } from '../useIssueRecorder';

describe('pickSupportedRecorderMimeType', () => {
  it('returns first supported mime type from candidates', () => {
    const isTypeSupported = vi.fn((mime: string) => mime === 'video/webm');
    vi.stubGlobal('MediaRecorder', {
      isTypeSupported,
    } as unknown as typeof MediaRecorder);

    const selected = pickSupportedRecorderMimeType([
      'video/webm;codecs=vp9,opus',
      'video/webm',
      'video/mp4',
    ]);

    expect(selected).toBe('video/webm');
    expect(isTypeSupported).toHaveBeenCalledTimes(2);
  });

  it('returns null when no candidate is supported', () => {
    vi.stubGlobal('MediaRecorder', {
      isTypeSupported: vi.fn(() => false),
    } as unknown as typeof MediaRecorder);

    const selected = pickSupportedRecorderMimeType(['video/mp4', 'video/webm']);

    expect(selected).toBeNull();
  });

  it('returns null when MediaRecorder is unavailable', () => {
    vi.stubGlobal('MediaRecorder', undefined);

    const selected = pickSupportedRecorderMimeType(['video/webm']);

    expect(selected).toBeNull();
  });
});
