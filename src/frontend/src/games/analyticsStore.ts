/**
 * Analytics Store for Word Builder
 * 
 * Responsibilities:
 * - Persist session analytics to localStorage
 * - Schema versioning and migration
 * - Aggregation and summary computation
 * - Export/reset functionality
 * 
 * UI-agnostic: Business rules live here, not in components.
 */

import { getVersionString } from '../utils/version';

const STORAGE_KEY = 'wordbuilder.analytics.v1';
const MAX_SESSIONS = 50;
const SCHEMA_VERSION = 1;

// Guard constants for clock anomalies
const MAX_SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours
const MAX_TIME_PER_WORD_MS = 5 * 60 * 1000; // 5 minutes

export type SelectionMode = 'explore' | 'phonics';

export interface SessionAnalytics {
  schemaVersion: number;
  buildVersion: string;
  id: string;
  timestamp: number;
  mode: SelectionMode;
  stageId?: string;
  wordsCompleted: number;
  correctTouches: number;
  incorrectTouches: number;
  confusionPairs: Record<string, number>;
  avgTimePerWordMs: number;
  totalDurationMs: number;
}

export interface AnalyticsSummary {
  totalSessions: number;
  totalWords: number;
  avgAccuracy: number;
  avgTimePerWordMs: number;
  topConfusions: [string, number][];
  recentSessions: SessionAnalytics[];
}

// In-memory session state
interface ActiveSession {
  id: string;
  startTime: number;
  wordStartTime: number;
  mode: SelectionMode;
  stageId?: string;
  wordsCompleted: number;
  correctTouches: number;
  incorrectTouches: number;
  confusionPairs: Record<string, number>;
  timeSamples: number[]; // For robust avg calculation
}

let activeSession: ActiveSession | null = null;

// Cache for getStoredSessions to avoid repeated localStorage reads/JSON parsing
let cachedSessions: SessionAnalytics[] | null = null;

// Invalidate cache when data changes
function invalidateCache(): void {
  cachedSessions = null;
}

// ============ SESSION LIFECYCLE ============

/**
 * Start a new analytics session.
 */
export function startSession(mode: SelectionMode, stageId?: string): string {
  const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  
  activeSession = {
    id: sessionId,
    startTime: Date.now(),
    wordStartTime: Date.now(),
    mode,
    stageId,
    wordsCompleted: 0,
    correctTouches: 0,
    incorrectTouches: 0,
    confusionPairs: {},
    timeSamples: [],
  };
  
  return sessionId;
}

/**
 * Record a word completion with timing.
 */
export function recordWordCompleted(): void {
  if (!activeSession) return;
  
  const now = Date.now();
  let timeSpent = now - activeSession.wordStartTime;
  
  // Clock anomaly guard
  if (timeSpent < 0 || timeSpent > MAX_TIME_PER_WORD_MS) {
    console.warn(`[Analytics] Time anomaly: ${timeSpent}ms, clamping`);
    timeSpent = Math.max(0, Math.min(timeSpent, MAX_TIME_PER_WORD_MS));
  }
  
  activeSession.timeSamples.push(timeSpent);
  activeSession.wordsCompleted++;
  activeSession.wordStartTime = now;
}

/**
 * Record a touch interaction.
 */
export function recordTouch(
  expectedLetter: string,
  touchedLetter: string,
  isCorrect: boolean
): void {
  if (!activeSession) return;
  
  if (isCorrect) {
    activeSession.correctTouches++;
  } else {
    activeSession.incorrectTouches++;
    
    // Track confusion pair (sorted for normalization)
    const pair = [expectedLetter, touchedLetter].sort().join('/');
    activeSession.confusionPairs[pair] = (activeSession.confusionPairs[pair] || 0) + 1;
  }
}

/**
 * End the current session and persist to storage.
 */
export function endSession(): SessionAnalytics | null {
  if (!activeSession) return null;
  
  const now = Date.now();
  let duration = now - activeSession.startTime;
  
  // Clock anomaly guard for total duration
  if (duration < 0 || duration > MAX_SESSION_DURATION_MS) {
    console.warn(`[Analytics] Duration anomaly: ${duration}ms, clamping`);
    duration = Math.max(0, Math.min(duration, MAX_SESSION_DURATION_MS));
  }
  
  // Compute robust average from samples
  const avgTime = activeSession.timeSamples.length > 0
    ? activeSession.timeSamples.reduce((a, b) => a + b, 0) / activeSession.timeSamples.length
    : 0;
  
  const session: SessionAnalytics = {
    schemaVersion: SCHEMA_VERSION,
    buildVersion: getVersionString(),
    id: activeSession.id,
    timestamp: activeSession.startTime,
    mode: activeSession.mode,
    stageId: activeSession.stageId,
    wordsCompleted: activeSession.wordsCompleted,
    correctTouches: activeSession.correctTouches,
    incorrectTouches: activeSession.incorrectTouches,
    confusionPairs: { ...activeSession.confusionPairs },
    avgTimePerWordMs: Math.round(avgTime),
    totalDurationMs: duration,
  };
  
  persistSession(session);
  activeSession = null;
  
  return session;
}

/**
 * Get the currently active session (for UI display).
 */
export function getActiveSession(): Readonly<Partial<ActiveSession>> | null {
  return activeSession;
}

// ============ PERSISTENCE ============

/**
 * Persist a session to storage with cap enforcement.
 */
function persistSession(session: SessionAnalytics): void {
  try {
    const existing = loadSessionsUnsafe();

    // Deduplicate by ID (shouldn't happen, but guard)
    const filtered = existing.filter(s => s.id !== session.id);

    // Add new, keep last MAX_SESSIONS
    const updated = [...filtered, session].slice(-MAX_SESSIONS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Invalidate cache after write
    invalidateCache();
  } catch (e) {
    // Storage failure (quota exceeded, private mode, etc.)
    console.warn('[Analytics] Failed to persist session:', e);
  }
}

/**
 * Load sessions with schema validation.
 * Results are cached until invalidated (on persist/clear).
 */
export function getStoredSessions(): SessionAnalytics[] {
  // Return cached result if available
  if (cachedSessions !== null) {
    return cachedSessions;
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      cachedSessions = [];
      return [];
    }

    const parsed = JSON.parse(data) as unknown[];

    // Validate and filter
    const valid: SessionAnalytics[] = [];
    for (const item of parsed) {
      if (isValidSession(item)) {
        valid.push(item as SessionAnalytics);
      } else {
        console.warn('[Analytics] Dropping invalid session:', item);
      }
    }

    cachedSessions = valid;
    return valid;
  } catch (e) {
    // Parse failure or storage unavailable
    console.warn('[Analytics] Failed to load sessions:', e);
    return [];
  }
}

/**
 * Unsafe load for internal use (no validation).
 */
function loadSessionsUnsafe(): SessionAnalytics[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Type guard for session validation.
 */
function isValidSession(obj: unknown): obj is SessionAnalytics {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const s = obj as Partial<SessionAnalytics>;
  
  // Required fields
  if (s.schemaVersion !== SCHEMA_VERSION) return false;
  if (typeof s.id !== 'string') return false;
  if (typeof s.timestamp !== 'number') return false;
  if (!['explore', 'phonics'].includes(s.mode as string)) return false;
  if (typeof s.wordsCompleted !== 'number') return false;
  
  // Sanity bounds
  if (s.wordsCompleted < 0 || s.wordsCompleted > 1000) return false;
  if (s.totalDurationMs && (s.totalDurationMs < 0 || s.totalDurationMs > MAX_SESSION_DURATION_MS)) return false;
  
  return true;
}

// ============ AGGREGATION ============

/**
 * Compute analytics summary from stored sessions.
 * O(n) complexity, memoizable.
 */
export function getAnalyticsSummary(): AnalyticsSummary {
  const sessions = getStoredSessions();
  
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalWords: 0,
      avgAccuracy: 0,
      avgTimePerWordMs: 0,
      topConfusions: [],
      recentSessions: [],
    };
  }
  
  // Aggregate totals
  let totalWords = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalTime = 0;
  let timeSampleCount = 0;
  
  const confusionAggregate: Record<string, number> = {};
  
  for (const s of sessions) {
    totalWords += s.wordsCompleted;
    totalCorrect += s.correctTouches;
    totalIncorrect += s.incorrectTouches;
    
    if (s.avgTimePerWordMs > 0 && s.wordsCompleted > 0) {
      totalTime += s.avgTimePerWordMs * s.wordsCompleted;
      timeSampleCount += s.wordsCompleted;
    }
    
    // Aggregate confusion pairs
    for (const [pair, count] of Object.entries(s.confusionPairs)) {
      confusionAggregate[pair] = (confusionAggregate[pair] || 0) + count;
    }
  }
  
  const totalTouches = totalCorrect + totalIncorrect;
  
  // Top confusions (sorted)
  const topConfusions = Object.entries(confusionAggregate)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) as [string, number][];
  
  // Recent sessions (last 10, sorted by timestamp desc)
  const recentSessions = [...sessions]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);
  
  return {
    totalSessions: sessions.length,
    totalWords,
    avgAccuracy: totalTouches > 0 ? (totalCorrect / totalTouches) * 100 : 0,
    avgTimePerWordMs: timeSampleCount > 0 ? totalTime / timeSampleCount : 0,
    topConfusions,
    recentSessions,
  };
}

// ============ EXPORT / RESET ============

/**
 * Export all sessions as JSON blob.
 */
export function exportAnalytics(): string {
  const sessions = getStoredSessions();
  return JSON.stringify({
    exportVersion: SCHEMA_VERSION,
    exportTime: new Date().toISOString(),
    appVersion: getVersionString(),
    sessions,
  }, null, 2);
}

/**
 * Clear all analytics data.
 */
export function clearAnalytics(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    invalidateCache();
  } catch (e) {
    console.warn('[Analytics] Failed to clear:', e);
  }
}

/**
 * Get storage size estimate (for diagnostics).
 */
export function getStorageSize(): number {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? new Blob([data]).size : 0;
  } catch {
    return 0;
  }
}
