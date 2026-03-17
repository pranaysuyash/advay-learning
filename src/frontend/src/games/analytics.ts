/**
 * Game Analytics Tracker
 *
 * General-purpose analytics tracking for all games.
 * Tracks activity completion, performance metrics, and engagement.
 *
 * Usage:
 *   import { trackGameActivity } from './games/analytics';
 *
 *   trackGameActivity({
 *     activityType: 'letter_tracing',
 *     contentId: 'letter-A',
 *     score: 85,
 *     durationSeconds: 45,
 *     metadata: { language: 'en', accuracy: 0.92 }
 *   });
 */

const STORAGE_KEY = 'game.analytics.v1';
const MAX_EVENTS = 1000;

export type ActivityType = 'drawing' | 'recognition' | 'game' | 'letter_tracing' | 'counting' | 'sequencing';

export interface GameAnalyticsEvent {
  id: string;
  timestamp: number;
  activityType: ActivityType;
  contentId: string;
  score: number;
  durationSeconds: number;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsSummary {
  totalActivities: number;
  avgScore: number;
  totalDurationSeconds: number;
  activitiesByType: Record<ActivityType, number>;
  recentActivities: GameAnalyticsEvent[];
}

// Cache for getStoredEvents
let cachedEvents: GameAnalyticsEvent[] | null = null;

function invalidateCache(): void {
  cachedEvents = null;
}

/**
 * Track a game activity completion.
 */
export function trackGameActivity(event: Omit<GameAnalyticsEvent, 'id' | 'timestamp'>): void {
  try {
    const analyticsEvent: GameAnalyticsEvent = {
      ...event,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
    };

    persistEvent(analyticsEvent);
  } catch (e) {
    console.warn('[GameAnalytics] Failed to track activity:', e);
  }
}

/**
 * Persist an event to storage with cap enforcement.
 */
function persistEvent(event: GameAnalyticsEvent): void {
  try {
    const existing = loadEventsUnsafe();

    // Add new, keep last MAX_EVENTS
    const updated = [...existing, event].slice(-MAX_EVENTS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Invalidate cache after write
    invalidateCache();
  } catch (e) {
    console.warn('[GameAnalytics] Failed to persist event:', e);
  }
}

/**
 * Load events with validation.
 */
export function getStoredEvents(): GameAnalyticsEvent[] {
  if (cachedEvents !== null) {
    return cachedEvents;
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      cachedEvents = [];
      return [];
    }

    const parsed = JSON.parse(data) as unknown[];

    // Validate and filter
    const valid: GameAnalyticsEvent[] = [];
    for (const item of parsed) {
      if (isValidEvent(item)) {
        valid.push(item as GameAnalyticsEvent);
      }
    }

    cachedEvents = valid;
    return valid;
  } catch (e) {
    console.warn('[GameAnalytics] Failed to load events:', e);
    return [];
  }
}

/**
 * Unsafe load for internal use.
 */
function loadEventsUnsafe(): GameAnalyticsEvent[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Type guard for event validation.
 */
function isValidEvent(obj: unknown): obj is GameAnalyticsEvent {
  if (typeof obj !== 'object' || obj === null) return false;

  const e = obj as Partial<GameAnalyticsEvent>;

  // Required fields
  if (typeof e.id !== 'string') return false;
  if (typeof e.timestamp !== 'number') return false;
  if (typeof e.activityType !== 'string') return false;
  if (typeof e.contentId !== 'string') return false;
  if (typeof e.score !== 'number') return false;
  if (typeof e.durationSeconds !== 'number') return false;

  return true;
}

/**
 * Compute analytics summary from stored events.
 */
export function getAnalyticsSummary(): AnalyticsSummary {
  const events = getStoredEvents();

  if (events.length === 0) {
    return {
      totalActivities: 0,
      avgScore: 0,
      totalDurationSeconds: 0,
      activitiesByType: { drawing: 0, recognition: 0, game: 0, letter_tracing: 0, counting: 0, sequencing: 0 },
      recentActivities: [],
    };
  }

  // Aggregate totals
  let totalScore = 0;
  let totalDuration = 0;
  const activitiesByType: Record<string, number> = {
    drawing: 0,
    recognition: 0,
    game: 0,
    letter_tracing: 0,
    counting: 0,
    sequencing: 0,
  };

  for (const e of events) {
    totalScore += e.score;
    totalDuration += e.durationSeconds;
    activitiesByType[e.activityType] = (activitiesByType[e.activityType] || 0) + 1;
  }

  // Recent activities (last 10, sorted by timestamp desc)
  const recentActivities = [...events]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

  return {
    totalActivities: events.length,
    avgScore: totalScore / events.length,
    totalDurationSeconds: totalDuration,
    activitiesByType: activitiesByType as Record<ActivityType, number>,
    recentActivities,
  };
}

/**
 * Export all events as JSON.
 */
export function exportAnalytics(): string {
  const events = getStoredEvents();
  return JSON.stringify({
    exportVersion: 1,
    exportTime: new Date().toISOString(),
    events,
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
    console.warn('[GameAnalytics] Failed to clear:', e);
  }
}
