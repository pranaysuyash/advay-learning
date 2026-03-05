import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  startSession,
  endSession,
  logEvent,
  updateExtension,
  setUniversalMetrics,
  getActiveSession,
  abandonSession,
  getStoredSessions,
  getAnalyticsSummary,
  exportAnalytics,
  clearAnalytics,
  getStorageSize,
  toProgressPayload,
  exportToProgressPayloads,
  subscribe,
} from '../store';
import { ANALYTICS_STORAGE_KEY, ANALYTICS_SCHEMA_VERSION } from '../types';

describe('Unified Analytics Store', () => {
  beforeEach(() => {
    // End any active session first, then clear storage
    endSession();
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('session lifecycle', () => {
    it('starts a session with game ID', () => {
      const id = startSession('wordbuilder', 'child-123');
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      
      const active = getActiveSession();
      expect(active?.gameId).toBe('wordbuilder');
      expect(active?.childId).toBe('child-123');
    });

    it('ends a session and persists it', () => {
      startSession('wordbuilder');
      logEvent('test', { data: 1 });
      
      const session = endSession('completed');
      expect(session).not.toBeNull();
      expect(session?.gameId).toBe('wordbuilder');
      expect(session?.completionStatus).toBe('completed');
      expect(session?.eventsCount).toBe(1);
      
      // Should be in storage
      const stored = getStoredSessions();
      expect(stored.length).toBe(1);
      expect(stored[0].id).toBe(session?.id);
    });

    it('generates unique session IDs', () => {
      const id1 = startSession('game1');
      endSession();
      const id2 = startSession('game2');
      endSession();
      
      expect(id1).not.toBe(id2);
    });

    it('returns null when ending without active session', () => {
      const session = endSession();
      expect(session).toBeNull();
    });

    it('prevents double-ending a session', () => {
      startSession('test');
      endSession('completed');
      
      const second = endSession('completed');
      expect(second).toBeNull();
    });

    it('can abandon a session', () => {
      startSession('test');
      logEvent('data', {});
      
      abandonSession();
      
      expect(getActiveSession()).toBeNull();
      expect(getStoredSessions().length).toBe(0);
    });
  });

  describe('events and extensions', () => {
    it('logs events to active session', () => {
      startSession('test');
      
      logEvent('move', { x: 10, y: 20 });
      logEvent('score', { points: 100 });
      
      const session = endSession('completed');
      expect(session?.eventsCount).toBe(2);
    });

    it('warns when logging without active session', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      logEvent('test', {});
      expect(spy).toHaveBeenCalledWith('[Analytics] No active session to log event');
      spy.mockRestore();
    });

    it('updates extension data', () => {
      startSession('test');
      
      updateExtension({ game: 'test', score: 100 });
      updateExtension({ level: 5 });
      
      const active = getActiveSession();
      expect(active?.extensionData).toEqual({
        game: 'test',
        score: 100,
        level: 5,
      });
    });

    it('merges extension data incrementally', () => {
      startSession('wordbuilder');
      
      updateExtension({ game: 'wordbuilder', mode: 'phonics' });
      updateExtension({ wordsCompleted: ['CAT'] });
      
      const session = endSession('completed');
      expect(session?.extension).toEqual({
        game: 'wordbuilder',
        mode: 'phonics',
        wordsCompleted: ['CAT'],
      });
    });
  });

  describe('storage and retrieval', () => {
    it('stores sessions with schema version', () => {
      startSession('test');
      const session = endSession('completed');
      
      expect(session?.schemaVersion).toBe(ANALYTICS_SCHEMA_VERSION);
      expect(session?.buildVersion).toBeDefined();
    });

    it('enforces 50 session cap', () => {
      for (let i = 0; i < 60; i++) {
        startSession('test');
        endSession('completed');
      }
      
      const sessions = getStoredSessions();
      expect(sessions.length).toBe(50);
    });

    it('filters invalid sessions on load', () => {
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify([
        { schemaVersion: ANALYTICS_SCHEMA_VERSION, id: 'valid', timestamp: Date.now(), gameId: 'test', durationMs: 1000, completionStatus: 'completed', eventsCount: 0, buildVersion: 'test' },
        { schemaVersion: 999, id: 'invalid' },
        { id: 'also-invalid' },
      ]));
      
      const sessions = getStoredSessions();
      expect(sessions.length).toBe(1);
      expect(sessions[0].id).toBe('valid');
    });

    it('handles corrupt localStorage gracefully', () => {
      localStorage.setItem(ANALYTICS_STORAGE_KEY, 'not valid json');
      
      const sessions = getStoredSessions();
      expect(sessions).toEqual([]);
    });

    it('gets sessions by game', () => {
      startSession('wordbuilder');
      endSession();
      startSession('tracing');
      endSession();
      startSession('wordbuilder');
      endSession();
      
      const wordBuilderSessions = getStoredSessions().filter(s => s.gameId === 'wordbuilder');
      expect(wordBuilderSessions.length).toBe(2);
    });

    it('gets sessions by child', () => {
      startSession('test', 'child-a');
      endSession();
      startSession('test', 'child-b');
      endSession();
      startSession('test', 'child-a');
      endSession();
      
      const childASessions = getStoredSessions().filter(s => s.childId === 'child-a');
      expect(childASessions.length).toBe(2);
    });
  });

  describe('analytics summary', () => {
    it('returns empty summary when no sessions', () => {
      const summary = getAnalyticsSummary();
      expect(summary.totalSessions).toBe(0);
      expect(summary.totalGames).toBe(0);
    });

    it('calculates game breakdown', () => {
      startSession('wordbuilder', 'child-1');
      endSession();
      startSession('tracing', 'child-1');
      endSession();
      startSession('wordbuilder', 'child-1');
      endSession();
      
      const summary = getAnalyticsSummary('child-1');
      expect(summary.totalSessions).toBe(3);
      expect(summary.totalGames).toBe(2);
      expect(summary.gameBreakdown).toEqual({
        wordbuilder: 2,
        tracing: 1,
      });
    });

    it('calculates time statistics', () => {
      vi.useFakeTimers();
      
      startSession('test');
      vi.advanceTimersByTime(60000); // 1 minute
      endSession();
      
      startSession('test');
      vi.advanceTimersByTime(120000); // 2 minutes
      endSession();
      
      const summary = getAnalyticsSummary();
      expect(summary.totalTimeMinutes).toBe(3);
      expect(summary.avgSessionMinutes).toBe(2);
      
      vi.useRealTimers();
    });

    it('aggregates struggle signals from universal metrics', () => {
      startSession('wordbuilder');
      setUniversalMetrics({
        itemsCompleted: 5,
        accuracyPct: 70,
        struggleSignals: ['confusion_bd', 'slow_response'],
      });
      endSession();
      
      startSession('wordbuilder');
      setUniversalMetrics({
        itemsCompleted: 3,
        accuracyPct: 80,
        struggleSignals: ['confusion_bd', 'high_error_rate'],
      });
      endSession();
      
      const summary = getAnalyticsSummary();
      expect(summary.topConfusions).toContainEqual(['confusion_bd', 2]);
      expect(summary.topConfusions).toContainEqual(['slow_response', 1]);
    });

    it('identifies games needing attention via universal metrics', () => {
      startSession('wordbuilder');
      setUniversalMetrics({
        itemsCompleted: 5,
        accuracyPct: 30,
        struggleSignals: ['high_error_rate'],
      });
      endSession();
      
      const summary = getAnalyticsSummary();
      expect(summary.gamesNeedingAttention).toContain('wordbuilder');
    });
    
    it('uses weighted accuracy by items completed', () => {
      // Session 1: 10 items, 100% accuracy
      startSession('game1');
      setUniversalMetrics({ itemsCompleted: 10, accuracyPct: 100 });
      endSession();
      
      // Session 2: 1 item, 0% accuracy
      startSession('game1');
      setUniversalMetrics({ itemsCompleted: 1, accuracyPct: 0 });
      endSession();
      
      // Weighted accuracy should be (10*100 + 1*0) / 11 = 90.9%, not (100+0)/2 = 50%
      const summary = getAnalyticsSummary();
      expect(summary.overallAccuracy).toBeGreaterThan(80);
    });
  });

  describe('export and clear', () => {
    it('exports analytics as JSON', () => {
      startSession('wordbuilder');
      updateExtension({ game: 'wordbuilder', mode: 'phonics' });
      endSession();
      
      const exported = exportAnalytics();
      const parsed = JSON.parse(exported);
      
      expect(parsed.exportVersion).toBe(ANALYTICS_SCHEMA_VERSION);
      expect(parsed.appVersion).toBeDefined();
      expect(parsed.sessions).toHaveLength(1);
    });

    it('clears all analytics', () => {
      startSession('test');
      endSession();
      
      expect(getStoredSessions().length).toBe(1);
      
      clearAnalytics();
      
      expect(getStoredSessions().length).toBe(0);
    });

    it('returns storage size', () => {
      startSession('test');
      endSession();
      
      const size = getStorageSize();
      expect(size).toBeGreaterThan(0);
    });
  });

  describe('progress tracking integration', () => {
    it('converts session to progress payload', () => {
      startSession('wordbuilder', 'child-1');
      updateExtension({
        game: 'wordbuilder',
        wordsCompleted: ['CAT', 'DOG'],
        accuracy: 85,
      });
      const session = endSession('completed')!;
      
      const payload = toProgressPayload(session);
      expect(payload).not.toBeNull();
      expect(payload?.profileId).toBe('child-1');
      expect(payload?.gameName).toBe('wordbuilder');
      expect(payload?.score).toBe(2); // 2 words
      expect(payload?.accuracy).toBe(85);
      expect(payload?.completed).toBe(true);
      expect(payload?.metaData.analyticsSessionId).toBe(session.id);
    });

    it('exports all sessions as progress payloads', () => {
      startSession('wordbuilder');
      updateExtension({ game: 'wordbuilder', wordsCompleted: ['CAT'] });
      endSession();
      
      startSession('tracing');
      updateExtension({ game: 'tracing', letter: 'A', accuracy: 0.9 });
      endSession();
      
      const payloads = exportToProgressPayloads();
      expect(payloads.length).toBe(2);
      expect(payloads[0]?.gameName).toBe('wordbuilder');
      expect(payloads[1]?.gameName).toBe('tracing');
    });

    it('returns null for sessions without extension', () => {
      startSession('test');
      const session = endSession('completed')!;
      
      const payload = toProgressPayload(session);
      expect(payload).toBeNull();
    });
  });

  describe('subscriptions', () => {
    it('notifies listeners on change', () => {
      const listener = vi.fn();
      const unsubscribe = subscribe(listener);
      
      startSession('test');
      endSession();
      
      expect(listener).toHaveBeenCalled();
      
      unsubscribe();
    });

    it('can unsubscribe', () => {
      const listener = vi.fn();
      const unsubscribe = subscribe(listener);
      
      unsubscribe();
      
      startSession('test');
      endSession();
      
      // Should not be called after unsubscribe
      expect(listener).toHaveBeenCalledTimes(0);
    });
  });

  describe('clock anomaly guards', () => {
    it('clamps negative durations to 0', () => {
      vi.useFakeTimers();
      
      startSession('test');
      vi.setSystemTime(Date.now() - 1000);
      
      const session = endSession('completed');
      expect(session?.durationMs).toBe(0);
      
      vi.useRealTimers();
    });

    it('clamps absurd durations to max', () => {
      vi.useFakeTimers();
      
      startSession('test');
      vi.advanceTimersByTime(3 * 60 * 60 * 1000); // 3 hours
      
      const session = endSession('completed');
      expect(session?.durationMs).toBeLessThanOrEqual(2 * 60 * 60 * 1000);
      
      vi.useRealTimers();
    });
  });
});
