/**
 * Unified Analytics SDK
 * 
 * Game-agnostic analytics with per-game extensions.
 * 
 * Usage:
 * ```typescript
 * import { 
 *   startSession, 
 *   endSession, 
 *   logEvent,
 *   wordBuilder 
 * } from '@/analytics';
 * 
 * // Start session
 * startSession('wordbuilder', childId);
 * wordBuilder.init('phonics', 'cvc_a');
 * 
 * // During gameplay
 * wordBuilder.recordTouch('A', 'B', false);
 * wordBuilder.recordWordCompleted('CAT');
 * 
 * // End session
 * endSession('completed');
 * ```
 */

// Core API
export {
  startSession,
  endSession,
  logEvent,
  updateExtension,
  setUniversalMetrics,
  getActiveSession,
  abandonSession,
  getStoredSessions,
  getSessionsByGame,
  getSessionsByChild,
  getAnalyticsSummary,
  exportAnalytics,
  clearAnalytics,
  getStorageSize,
  toProgressPayload,
  exportToProgressPayloads,
  subscribe,
} from './store';

// Types
export type {
  AnalyticsSession,
  ActiveSession,
  AnalyticsEvent,
  AnalyticsSummary,
  GameExtension,
  WordBuilderExtension,
  TracingExtension,
  MemoryExtension,
  GenericExtension,
  ProgressExportPayload,
  StartSessionOptions,
} from './types';

// Type guards
export {
  isWordBuilderExtension,
  isTracingExtension,
  isMemoryExtension,
  getAnalyticsBuildVersion,
} from './types';

// Game extensions
export * as wordBuilder from './extensions/wordBuilder';
export * as tracing from './extensions/tracing';
export * as memory from './extensions/memory';

// Constants
export {
  ANALYTICS_SCHEMA_VERSION,
  ANALYTICS_STORAGE_KEY,
  MAX_SESSIONS,
  MAX_SESSION_DURATION_MS,
  MAX_EVENTS_PER_SESSION,
} from './types';
