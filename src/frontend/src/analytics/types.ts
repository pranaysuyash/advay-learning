/**
 * Unified Analytics SDK - Core Types
 * 
 * Schema v2: Game-agnostic core with per-game extensions
 * Storage: localStorage key 'advay.analytics.v2'
 */

// Build info injected at build time
declare const __APP_VERSION__: string;
declare const __GIT_SHA__: string;

export const ANALYTICS_SCHEMA_VERSION = 2;
export const ANALYTICS_STORAGE_KEY = 'advay.analytics.v2';
export const MAX_SESSIONS = 50;

// Clock anomaly guards
export const MAX_SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

// Event limits
export const MAX_EVENTS_PER_SESSION = 5000; // Prevent unbounded memory

/**
 * Core session data (all games)
 */
export interface AnalyticsSession {
  // Schema
  schemaVersion: number;
  buildVersion: string;
  
  // Identification
  id: string;
  timestamp: number; // Session start time
  gameId: string; // 'wordbuilder', 'tracing', 'memory', etc.
  childId?: string; // For multi-profile support
  
  // Engagement
  durationMs: number;
  eventsCount: number;
  completionStatus: 'completed' | 'abandoned' | 'error' | 'in_progress';
  
  // Universal metrics (cross-game comparable)
  itemsCompleted: number; // Primary units completed (words, letters, pairs, etc.)
  accuracyPct: number; // 0-100 success rate
  difficultyTag?: string; // Normalized difficulty (stage_id, level, etc.)
  struggleSignals: string[]; // Standardized struggle indicators
  
  // Extension (game-specific data)
  extension: GameExtension | null;
}

/**
 * Game extension union type
 */
export type GameExtension =
  | WordBuilderExtension
  | TracingExtension
  | MemoryExtension
  | GenericExtension;

/**
 * WordBuilder-specific analytics
 */
export interface WordBuilderExtension {
  game: 'wordbuilder';
  mode: 'explore' | 'phonics';
  stageId?: string;
  wordsCompleted: string[];
  confusionPairs: Record<string, number>;
  accuracy: number; // 0-100
  correctTouches: number;
  incorrectTouches: number;
  avgTimePerWordMs: number;
}

/**
 * Tracing-specific analytics
 */
export interface TracingExtension {
  game: 'tracing';
  letter: string;
  attempts: number;
  accuracy: number; // Path deviation score
  timeToCompleteMs: number;
  errorTypes: ('overshoot' | 'undershoot' | 'wrong_direction' | 'hesitation')[];
}

/**
 * Memory Match-specific analytics
 */
export interface MemoryExtension {
  game: 'memory';
  pairsCount: number;
  moves: number;
  accuracy: number; // matches / attempts
  avgTimePerMatchMs: number;
  mismatches: [string, string][]; // Pairs that were mismatched
}

/**
 * Generic fallback for games without specific extensions
 */
export interface GenericExtension {
  game: string;
  [key: string]: unknown;
}

/**
 * Active session (in-memory only)
 */
export interface ActiveSession {
  id: string;
  startTime: number;
  gameId: string;
  childId?: string;
  events: AnalyticsEvent[];
  extensionData: Partial<GameExtension>;
  isEnded: boolean;
  
  // Universal metrics (populated incrementally or at end)
  universalMetrics: {
    itemsCompleted: number;
    accuracyPct: number;
    difficultyTag?: string;
    struggleSignals: string[];
  };
}

/**
 * Individual analytics event
 */
export interface AnalyticsEvent {
  type: string;
  timestamp: number;
  payload: Record<string, unknown>;
}

/**
 * Summary statistics (for dashboard)
 */
export interface AnalyticsSummary {
  totalSessions: number;
  totalGames: number;
  gameBreakdown: Record<string, number>;
  recentSessions: AnalyticsSession[];
  
  // Engagement
  totalTimeMinutes: number;
  avgSessionMinutes: number;
  
  // Learning (aggregated across games)
  totalItemsCompleted: number;
  overallAccuracy: number;
  
  // Struggle indicators
  topConfusions: [string, number][];
  gamesNeedingAttention: string[];
}

/**
 * Options for starting a session
 */
export interface StartSessionOptions {
  gameId: string;
  childId?: string;
  initialExtension?: Partial<GameExtension>;
}

/**
 * Progress tracking integration payload
 */
export interface ProgressExportPayload {
  profileId: string | null;
  gameName: string;
  score: number;
  durationSeconds: number;
  accuracy?: number;
  completed: boolean;
  metaData: {
    analyticsSessionId: string;
    extensionType: string;
    [key: string]: unknown;
  };
}

/**
 * Type guards for extensions
 */
export function isWordBuilderExtension(ext: GameExtension | null | undefined): ext is WordBuilderExtension {
  return ext?.game === 'wordbuilder';
}

export function isTracingExtension(ext: GameExtension | null | undefined): ext is TracingExtension {
  return ext?.game === 'tracing';
}

export function isMemoryExtension(ext: GameExtension | null | undefined): ext is MemoryExtension {
  return ext?.game === 'memory';
}

/**
 * Get version string for telemetry
 */
export function getAnalyticsBuildVersion(): string {
  const version = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';
  const sha = typeof __GIT_SHA__ !== 'undefined' ? __GIT_SHA__ : 'unknown';
  return `${version}+${sha.slice(0, 7)}`;
}
