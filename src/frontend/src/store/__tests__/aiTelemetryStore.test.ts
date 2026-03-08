import { beforeEach, describe, expect, it } from 'vitest';

import { useAITelemetryStore } from '../aiTelemetryStore';

const baseEvent = {
  provider: 'mock',
  source: 'mock' as const,
  model: 'qwen3.5-0.5b-instruct',
  latencyMs: 12,
  cached: false,
  fallbackUsed: false,
  reason: 'category_mock',
  timestamp: '2026-03-08T12:00:00.000Z',
};

describe('aiTelemetryStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAITelemetryStore.getState().resetTelemetry();
  });

  it('records request totals and last event', () => {
    useAITelemetryStore.getState().recordLLMUsage(baseEvent);

    const state = useAITelemetryStore.getState();
    expect(state.totalRequests).toBe(1);
    expect(state.totalCloudRequests).toBe(0);
    expect(state.totalFallbacks).toBe(0);
    expect(state.lastEvent).toEqual(baseEvent);
    expect(state.recentEvents).toEqual([baseEvent]);
  });

  it('tracks cloud and fallback counters', () => {
    useAITelemetryStore.getState().recordLLMUsage({
      ...baseEvent,
      source: 'cloud',
      fallbackUsed: true,
      reason: 'provider_error_fallback',
    });

    const state = useAITelemetryStore.getState();
    expect(state.totalRequests).toBe(1);
    expect(state.totalCloudRequests).toBe(1);
    expect(state.totalFallbacks).toBe(1);
  });

  it('caps recent events to 100 entries', () => {
    for (let i = 0; i < 105; i += 1) {
      useAITelemetryStore.getState().recordLLMUsage({
        ...baseEvent,
        timestamp: `2026-03-08T12:00:${String(i).padStart(2, '0')}.000Z`,
      });
    }

    const state = useAITelemetryStore.getState();
    expect(state.totalRequests).toBe(105);
    expect(state.recentEvents).toHaveLength(100);
  });

  it('resets telemetry to defaults', () => {
    useAITelemetryStore.getState().recordLLMUsage(baseEvent);
    useAITelemetryStore.getState().resetTelemetry();

    const state = useAITelemetryStore.getState();
    expect(state.totalRequests).toBe(0);
    expect(state.totalCloudRequests).toBe(0);
    expect(state.totalFallbacks).toBe(0);
    expect(state.lastEvent).toBeNull();
    expect(state.recentEvents).toEqual([]);
  });
});
