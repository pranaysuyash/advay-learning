/**
 * Unified Analytics SDK - Core Storage
 * 
 * Responsibilities:
 * - Session lifecycle management
 * - localStorage persistence with schema validation
 * - Clock anomaly guards
 * - Export to progress tracking system
 */

import {
  ANALYTICS_SCHEMA_VERSION,
  ANALYTICS_STORAGE_KEY,
  MAX_SESSIONS,
  MAX_SESSION_DURATION_MS,
  MAX_EVENTS_PER_SESSION,
  getAnalyticsBuildVersion,
  type AnalyticsSession,
  type ActiveSession,
  type AnalyticsSummary,
  type GameExtension,
  type ProgressExportPayload,
  type WordBuilderExtension,
  type TracingExtension,
  type MemoryExtension,
} from './types';

// In-memory active session
let activeSession: ActiveSession | null = null;

// Event listeners for real-time updates
const listeners = new Set<() => void>();

function notifyListeners(): void {
  for (const fn of listeners) {
    try {
      fn();
    } catch (e) {
      console.warn('[Analytics] Listener error:', e);
    }
  }
}

/**
 * Subscribe to analytics changes
 */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ============ SESSION LIFECYCLE ============

/**
 * Start a new analytics session
 * Auto-ends previous session as abandoned if one exists
 */
export function startSession(
  gameId: string,
  childId?: string,
  initialExtension?: Partial<GameExtension>
): string {
  // Auto-end any active session to avoid silent data loss
  if (activeSession && !activeSession.isEnded) {
    console.warn('[Analytics] startSession called while session active; auto-ending previous as abandoned.');
    endSession('abandoned');
  }
  
  const now = Date.now();
  const sessionId = 
    (globalThis.crypto?.randomUUID?.() ?? `${now}-${Math.random().toString(36).slice(2, 9)}`);
  
  activeSession = {
    id: sessionId,
    startTime: now,
    gameId,
    childId,
    events: [],
    extensionData: initialExtension || {},
    isEnded: false,
    universalMetrics: {
      itemsCompleted: 0,
      accuracyPct: 0,
      struggleSignals: [],
    },
  };
  
  return sessionId;
}

/**
 * Log an event to the active session
 * Events are capped to prevent unbounded memory growth
 */
export function logEvent(type: string, payload: Record<string, unknown> = {}): void {
  if (!activeSession || activeSession.isEnded) {
    console.warn('[Analytics] No active session to log event');
    return;
  }
  
  // Cap events to prevent memory blowup
  if (activeSession.events.length >= MAX_EVENTS_PER_SESSION) {
    // Silently drop additional events
    return;
  }
  
  activeSession.events.push({
    type,
    timestamp: Date.now(),
    payload,
  });
}

/**
 * Update extension data incrementally
 */
export function updateExtension(data: Partial<GameExtension>): void {
  if (!activeSession || activeSession.isEnded) {
    console.warn('[Analytics] No active session to update');
    return;
  }
  
  activeSession.extensionData = {
    ...activeSession.extensionData,
    ...data,
  };
}

/**
 * Set universal metrics for the active session
 * Games should call this before endSession() to populate comparable fields
 */
export function setUniversalMetrics(metrics: {
  itemsCompleted?: number;
  accuracyPct?: number;
  difficultyTag?: string;
  struggleSignals?: string[];
}): void {
  if (!activeSession || activeSession.isEnded) {
    console.warn('[Analytics] No active session to set metrics');
    return;
  }
  
  activeSession.universalMetrics = {
    ...activeSession.universalMetrics,
    ...metrics,
    // Ensure arrays are copied, not referenced
    struggleSignals: metrics.struggleSignals 
      ? [...metrics.struggleSignals] 
      : activeSession.universalMetrics.struggleSignals,
  };
}

/**
 * End the current session and persist to storage
 */
export function endSession(completionStatus: AnalyticsSession['completionStatus'] = 'completed'): AnalyticsSession | null {
  if (!activeSession) {
    return null;
  }
  
  if (activeSession.isEnded) {
    console.warn('[Analytics] Session already ended');
    return null;
  }
  
  activeSession.isEnded = true;
  
  const now = Date.now();
  let duration = now - activeSession.startTime;
  
  // Clock anomaly guard
  if (duration < 0 || duration > MAX_SESSION_DURATION_MS) {
    console.warn(`[Analytics] Duration anomaly: ${duration}ms, clamping`);
    duration = Math.max(0, Math.min(duration, MAX_SESSION_DURATION_MS));
  }
  
  const session: AnalyticsSession = {
    schemaVersion: ANALYTICS_SCHEMA_VERSION,
    buildVersion: getAnalyticsBuildVersion(),
    id: activeSession.id,
    timestamp: activeSession.startTime,
    gameId: activeSession.gameId,
    childId: activeSession.childId,
    durationMs: duration,
    eventsCount: activeSession.events.length,
    completionStatus,
    // Universal metrics (cross-game comparable)
    itemsCompleted: activeSession.universalMetrics.itemsCompleted,
    accuracyPct: activeSession.universalMetrics.accuracyPct,
    difficultyTag: activeSession.universalMetrics.difficultyTag,
    struggleSignals: [...activeSession.universalMetrics.struggleSignals],
    // Game-specific extension
    extension: activeSession.extensionData as GameExtension | null,
  };
  
  persistSession(session);
  activeSession = null;
  notifyListeners();
  
  return session;
}

/**
 * Get the currently active session (for UI)
 * Returns a defensive copy to prevent external mutation
 */
export function getActiveSession(): Readonly<ActiveSession> | null {
  if (!activeSession) return null;
  
  return {
    ...activeSession,
    events: [...activeSession.events],
    extensionData: { ...activeSession.extensionData },
    universalMetrics: {
      ...activeSession.universalMetrics,
      struggleSignals: [...activeSession.universalMetrics.struggleSignals],
    },
  };
}

/**
 * Abandon the current session (don't save)
 */
export function abandonSession(): void {
  if (activeSession) {
    activeSession.isEnded = true;
    activeSession = null;
  }
}

// ============ PERSISTENCE ============

function persistSession(session: AnalyticsSession): void {
  try {
    // Use validated loader to prevent corrupting with bad data
    const existing = getStoredSessions();
    
    // Deduplicate by ID
    const filtered = existing.filter(s => s.id !== session.id);
    
    // Add new, sort by timestamp, keep last MAX_SESSIONS
    const updated = [...filtered, session]
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-MAX_SESSIONS);
    
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('[Analytics] Failed to persist session:', e);
  }
}

/**
 * Load all stored sessions with validation
 */
export function getStoredSessions(): AnalyticsSession[] {
  try {
    const data = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data) as unknown[];
    
    // Validate and filter
    const valid: AnalyticsSession[] = [];
    for (const item of parsed) {
      if (isValidSession(item)) {
        valid.push(item as AnalyticsSession);
      } else {
        console.warn('[Analytics] Dropping invalid session:', item);
      }
    }
    
    return valid;
  } catch (e) {
    console.warn('[Analytics] Failed to load sessions:', e);
    return [];
  }
}

function isValidSession(obj: unknown): obj is AnalyticsSession {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const s = obj as Partial<AnalyticsSession>;
  
  // Schema and identification
  if (s.schemaVersion !== ANALYTICS_SCHEMA_VERSION) return false;
  if (typeof s.buildVersion !== 'string') return false;
  if (typeof s.id !== 'string') return false;
  if (typeof s.timestamp !== 'number' || !Number.isFinite(s.timestamp)) return false;
  if (typeof s.gameId !== 'string') return false;
  if (s.childId !== undefined && typeof s.childId !== 'string') return false;
  
  // Engagement metrics
  if (typeof s.durationMs !== 'number' || !Number.isFinite(s.durationMs)) return false;
  if (s.durationMs < 0 || s.durationMs > MAX_SESSION_DURATION_MS) return false;
  
  if (typeof s.eventsCount !== 'number' || !Number.isFinite(s.eventsCount)) return false;
  if (s.eventsCount < 0 || s.eventsCount > 10000) return false;
  
  // Valid completion status
  const validStatuses: AnalyticsSession['completionStatus'][] = ['completed', 'abandoned', 'error', 'in_progress'];
  if (!validStatuses.includes(s.completionStatus as any)) return false;
  
  // Universal metrics (new in v2, but backward compatible with defaults)
  const itemsCompleted = s.itemsCompleted ?? 0;
  const accuracyPct = s.accuracyPct ?? 0;
  const struggleSignals = s.struggleSignals ?? [];
  
  if (typeof itemsCompleted !== 'number' || itemsCompleted < 0 || itemsCompleted > 10000) return false;
  if (typeof accuracyPct !== 'number' || accuracyPct < 0 || accuracyPct > 100) return false;
  if (s.difficultyTag !== undefined && typeof s.difficultyTag !== 'string') return false;
  if (!Array.isArray(struggleSignals)) return false;
  if (!struggleSignals.every(sig => typeof sig === 'string')) return false;
  
  // Extension validation (optional - can be null, undefined, or empty object)
  if (s.extension !== null && s.extension !== undefined) {
    if (typeof s.extension !== 'object') return false;
    // Empty extension {} is valid (no game-specific data)
    // If extension has keys, it should have a game property
    const ext = s.extension as Record<string, unknown>;
    const keys = Object.keys(ext);
    if (keys.length > 0 && !keys.includes('game')) return false;
  }
  
  return true;
}

// ============ QUERIES ============

/**
 * Get sessions filtered by game
 */
export function getSessionsByGame(gameId: string): AnalyticsSession[] {
  return getStoredSessions().filter(s => s.gameId === gameId);
}

/**
 * Get sessions for a specific child
 */
export function getSessionsByChild(childId: string): AnalyticsSession[] {
  return getStoredSessions().filter(s => s.childId === childId);
}

/**
 * Compute analytics summary
 */
export function getAnalyticsSummary(childId?: string): AnalyticsSummary {
  const sessions = childId 
    ? getStoredSessions().filter(s => s.childId === childId)
    : getStoredSessions();
  
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalGames: 0,
      gameBreakdown: {},
      recentSessions: [],
      totalTimeMinutes: 0,
      avgSessionMinutes: 0,
      totalItemsCompleted: 0,
      overallAccuracy: 0,
      topConfusions: [],
      gamesNeedingAttention: [],
    };
  }
  
  // Game breakdown
  const gameBreakdown: Record<string, number> = {};
  sessions.forEach(s => {
    gameBreakdown[s.gameId] = (gameBreakdown[s.gameId] || 0) + 1;
  });
  
  // Time calculations
  const totalTimeMs = sessions.reduce((sum, s) => sum + s.durationMs, 0);
  
  // Aggregate using UNIVERSAL FIELDS (cross-game comparable)
  let totalItems = 0;
  let weightedAccuracySum = 0;
  let weightedItems = 0;
  const allStruggleSignals: string[] = [];
  const gamesWithLowAccuracy: string[] = [];
  
  for (const s of sessions) {
    // Use universal fields (preferred)
    const items = s.itemsCompleted ?? 0;
    const accuracy = s.accuracyPct ?? 0;
    
    totalItems += items;
    
    // Weighted accuracy by items (not sessions)
    if (items > 0) {
      weightedAccuracySum += accuracy * items;
      weightedItems += items;
    }
    
    // Collect struggle signals
    if (s.struggleSignals) {
      allStruggleSignals.push(...s.struggleSignals);
    }
    
    // Games needing attention (low accuracy)
    if (accuracy < 50 && items > 0) {
      gamesWithLowAccuracy.push(s.gameId);
    }
    
    // Fallback: aggregate from extension for legacy sessions without universal fields
    // This maintains backward compatibility during migration
    if (s.extension && (!s.itemsCompleted && !s.accuracyPct)) {
      if (s.extension.game === 'wordbuilder') {
        const ext = s.extension as WordBuilderExtension;
        const extItems = ext.wordsCompleted?.length || 0;
        const extAccuracy = ext.accuracy ?? 0;
        totalItems += extItems;
        if (extItems > 0) {
          weightedAccuracySum += extAccuracy * extItems;
          weightedItems += extItems;
        }
      }
    }
  }
  
  // Top struggle signals (frequency count)
  const struggleCounts: Record<string, number> = {};
  for (const sig of allStruggleSignals) {
    struggleCounts[sig] = (struggleCounts[sig] || 0) + 1;
  }
  const topConfusions = Object.entries(struggleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) as [string, number][];
  
  // Recent sessions (last 10)
  const recentSessions = [...sessions]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);
  
  return {
    totalSessions: sessions.length,
    totalGames: Object.keys(gameBreakdown).length,
    gameBreakdown,
    recentSessions,
    totalTimeMinutes: Math.round(totalTimeMs / 60000),
    avgSessionMinutes: Math.round((totalTimeMs / sessions.length) / 60000),
    totalItemsCompleted: totalItems,
    overallAccuracy: weightedItems > 0 ? weightedAccuracySum / weightedItems : 0,
    topConfusions,
    gamesNeedingAttention: [...new Set(gamesWithLowAccuracy)],
  };
}

// ============ EXPORT ============

/**
 * Export all sessions as JSON
 */
export function exportAnalytics(): string {
  const sessions = getStoredSessions();
  return JSON.stringify({
    exportVersion: ANALYTICS_SCHEMA_VERSION,
    exportTime: new Date().toISOString(),
    appVersion: getAnalyticsBuildVersion(),
    sessions,
  }, null, 2);
}

/**
 * Clear all analytics data
 */
export function clearAnalytics(): void {
  try {
    localStorage.removeItem(ANALYTICS_STORAGE_KEY);
    notifyListeners();
  } catch (e) {
    console.warn('[Analytics] Failed to clear:', e);
  }
}

/**
 * Get storage size estimate
 */
export function getStorageSize(): number {
  try {
    const data = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    return data ? new Blob([data]).size : 0;
  } catch {
    return 0;
  }
}

// ============ PROGRESS TRACKING INTEGRATION ============

/**
 * Convert analytics session to progress tracking payload
 */
export function toProgressPayload(session: AnalyticsSession): ProgressExportPayload | null {
  if (!session.extension || !session.extension.game) return null;
  
  const base = {
    profileId: session.childId || null,
    gameName: session.gameId,
    durationSeconds: Math.round(session.durationMs / 1000),
    completed: session.completionStatus === 'completed',
    metaData: {
      analyticsSessionId: session.id,
      extensionType: session.extension.game,
    },
  };
  
  // Game-specific mapping
  if (session.extension.game === 'wordbuilder') {
    const ext = session.extension as WordBuilderExtension;
    return {
      ...base,
      score: ext.wordsCompleted?.length || 0,
      accuracy: ext.accuracy,
    };
  }
  
  if (session.extension.game === 'tracing') {
    const ext = session.extension as TracingExtension;
    return {
      ...base,
      score: ext.attempts > 0 ? 1 : 0,
      accuracy: ext.accuracy * 100,
    };
  }
  
  if (session.extension.game === 'memory') {
    const ext = session.extension as MemoryExtension;
    return {
      ...base,
      score: ext.pairsCount || 0,
      accuracy: ext.accuracy * 100,
    };
  }
  
  // Generic fallback
  return {
    ...base,
    score: session.eventsCount,
  };
}

/**
 * Export all sessions to progress tracking format
 */
export function exportToProgressPayloads(): ProgressExportPayload[] {
  return getStoredSessions()
    .map(toProgressPayload)
    .filter((p): p is ProgressExportPayload => p !== null);
}
