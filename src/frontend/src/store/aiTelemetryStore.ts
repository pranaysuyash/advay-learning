import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LLMUsageTelemetryEvent {
  provider: string;
  source: 'local' | 'cloud' | 'mock';
  model: string;
  latencyMs: number;
  cached: boolean;
  fallbackUsed: boolean;
  reason: string;
  timestamp: string;
}

interface AITelemetryState {
  totalRequests: number;
  totalCloudRequests: number;
  totalFallbacks: number;
  lastEvent: LLMUsageTelemetryEvent | null;
  recentEvents: LLMUsageTelemetryEvent[];
  recordLLMUsage: (event: LLMUsageTelemetryEvent) => void;
  resetTelemetry: () => void;
}

const MAX_RECENT_EVENTS = 100;

const defaultTelemetryState: Omit<
  AITelemetryState,
  'recordLLMUsage' | 'resetTelemetry'
> = {
  totalRequests: 0,
  totalCloudRequests: 0,
  totalFallbacks: 0,
  lastEvent: null,
  recentEvents: [],
};

export const useAITelemetryStore = create<AITelemetryState>()(
  persist(
    (set) => ({
      ...defaultTelemetryState,
      recordLLMUsage: (event) => {
        set((state) => {
          const nextRecentEvents = [...state.recentEvents, event].slice(
            -MAX_RECENT_EVENTS,
          );

          return {
            totalRequests: state.totalRequests + 1,
            totalCloudRequests:
              state.totalCloudRequests + (event.source === 'cloud' ? 1 : 0),
            totalFallbacks: state.totalFallbacks + (event.fallbackUsed ? 1 : 0),
            lastEvent: event,
            recentEvents: nextRecentEvents,
          };
        });
      },
      resetTelemetry: () => {
        set({ ...defaultTelemetryState });
      },
    }),
    {
      name: 'advay-ai-telemetry-v1',
    },
  ),
);
