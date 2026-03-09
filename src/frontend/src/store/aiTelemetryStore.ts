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

export interface VoiceErrorEvent {
  type: 'tts_failed' | 'voice_unavailable' | 'stt_failed';
  message: string;
  preferredVoice?: string;
  fallbackUsed: boolean;
  timestamp: string;
}

export interface SubscriptionErrorEvent {
  type: 'subscription_check_failed';
  gameId: string;
  reason: string;
  statusSource: string;
  timestamp: string;
}

interface AITelemetryState {
  totalRequests: number;
  totalCloudRequests: number;
  totalFallbacks: number;
  lastEvent: LLMUsageTelemetryEvent | null;
  recentEvents: LLMUsageTelemetryEvent[];
  recordLLMUsage: (event: LLMUsageTelemetryEvent) => void;
  // Voice error tracking
  voiceErrorCount: number;
  lastVoiceError: VoiceErrorEvent | null;
  recordVoiceError: (event: Omit<VoiceErrorEvent, 'timestamp'>) => void;
  // Subscription error tracking
  subscriptionErrorCount: number;
  lastSubscriptionError: SubscriptionErrorEvent | null;
  recordSubscriptionError: (event: Omit<SubscriptionErrorEvent, 'timestamp'>) => void;
  resetTelemetry: () => void;
}

const MAX_RECENT_EVENTS = 100;

const defaultTelemetryState: Omit<
  AITelemetryState,
  'recordLLMUsage' | 'recordVoiceError' | 'recordSubscriptionError' | 'resetTelemetry'
> = {
  totalRequests: 0,
  totalCloudRequests: 0,
  totalFallbacks: 0,
  lastEvent: null,
  recentEvents: [],
  voiceErrorCount: 0,
  lastVoiceError: null,
  subscriptionErrorCount: 0,
  lastSubscriptionError: null,
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
      recordVoiceError: (event) => {
        const fullEvent: VoiceErrorEvent = {
          ...event,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          voiceErrorCount: state.voiceErrorCount + 1,
          lastVoiceError: fullEvent,
        }));
        // Also log to console for debugging
        console.warn(`[VoiceTelemetry] ${event.type}:`, event.message);
      },
      recordSubscriptionError: (event) => {
        const fullEvent: SubscriptionErrorEvent = {
          ...event,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          subscriptionErrorCount: state.subscriptionErrorCount + 1,
          lastSubscriptionError: fullEvent,
        }));
        // Also log to console for debugging
        console.warn(`[SubscriptionTelemetry] ${event.type}:`, event.reason, 'gameId:', event.gameId);
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
