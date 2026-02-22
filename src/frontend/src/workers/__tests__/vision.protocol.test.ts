import { describe, expect, it } from 'vitest';

import {
  isWorkerErrorEvent,
  isWorkerFrameResult,
  isWorkerInitResponse,
} from '../vision.protocol';

describe('vision worker protocol guards', () => {
  it('recognizes frame result payloads', () => {
    const payload = { type: 'frame:result', id: 3, ok: true, processingMs: 3 };
    expect(isWorkerFrameResult(payload)).toBe(true);
    expect(isWorkerFrameResult({ type: 'frame:result' })).toBe(false);
  });

  it('recognizes init responses', () => {
    expect(isWorkerInitResponse({ type: 'init:result', ok: true })).toBe(true);
    expect(isWorkerInitResponse({ type: 'init:result', ok: 'yes' })).toBe(false);
  });

  it('recognizes error events', () => {
    expect(isWorkerErrorEvent({ type: 'error', error: 'boom' })).toBe(true);
    expect(isWorkerErrorEvent({ type: 'error', error: 100 })).toBe(false);
  });
});
