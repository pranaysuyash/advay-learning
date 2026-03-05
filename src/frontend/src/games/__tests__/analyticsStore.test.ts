import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  startSession,
  endSession,
  recordWordCompleted,
  recordTouch,
  getStoredSessions,
  getAnalyticsSummary,
  exportAnalytics,
  clearAnalytics,
  getStorageSize,
} from '../analyticsStore';

describe('analyticsStore', () => {
  beforeEach(() => {
    // End any active session FIRST (before clearing storage)
    // This prevents the ended session from being persisted into clean storage
    endSession();
    // Use clearAnalytics() instead of localStorage.clear() to also invalidate cache
    clearAnalytics();
    vi.clearAllMocks();
  });

  describe('session lifecycle', () => {
    it('starts a session and returns session ID', () => {
      const sessionId = startSession('explore', 'cvc_a');
      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
    });

    it('ends a session and persists to storage', () => {
      startSession('explore', 'cvc_a');
      recordWordCompleted();
      
      const session = endSession();
      expect(session).not.toBeNull();
      expect(session?.mode).toBe('explore');
      expect(session?.stageId).toBe('cvc_a');
      expect(session?.wordsCompleted).toBe(1);
    });

    it('returns null when ending without active session', () => {
      const session = endSession();
      expect(session).toBeNull();
    });

    it('generates unique session IDs', () => {
      const id1 = startSession('explore');
      endSession();
      const id2 = startSession('explore');
      endSession();
      
      expect(id1).not.toBe(id2);
    });
  });

  describe('word completion tracking', () => {
    it('tracks multiple word completions', () => {
      startSession('phonics', 'cvc_all');
      
      recordWordCompleted();
      recordWordCompleted();
      recordWordCompleted();
      
      const session = endSession();
      expect(session?.wordsCompleted).toBe(3);
    });

    it('calculates average time per word', () => {
      vi.useFakeTimers();
      
      startSession('explore');
      
      vi.advanceTimersByTime(1000);
      recordWordCompleted();
      
      vi.advanceTimersByTime(2000);
      recordWordCompleted();
      
      const session = endSession();
      expect(session?.avgTimePerWordMs).toBe(1500); // Average of 1000 and 2000
      
      vi.useRealTimers();
    });
  });

  describe('touch tracking', () => {
    it('tracks correct touches', () => {
      startSession('explore');
      
      recordTouch('A', 'A', true);
      recordTouch('B', 'B', true);
      
      const session = endSession();
      expect(session?.correctTouches).toBe(2);
      expect(session?.incorrectTouches).toBe(0);
    });

    it('tracks incorrect touches and confusion pairs', () => {
      startSession('explore');
      
      recordTouch('A', 'B', false); // Expected A, got B
      recordTouch('A', 'B', false); // Same confusion again
      
      const session = endSession();
      expect(session?.incorrectTouches).toBe(2);
      expect(session?.confusionPairs['A/B']).toBe(2);
    });

    it('normalizes confusion pairs (sorted)', () => {
      startSession('explore');
      
      recordTouch('B', 'D', false); // B/D confusion
      recordTouch('D', 'B', false); // D/B confusion (should be counted as same pair)
      
      const session = endSession();
      // Both should be counted under 'B/D' (sorted)
      expect(session?.confusionPairs['B/D']).toBe(2);
      expect(session?.confusionPairs['D/B']).toBeUndefined();
    });
  });

  describe('storage and retrieval', () => {
    it('stores and retrieves sessions', () => {
      startSession('explore', 'cvc_a');
      recordWordCompleted();
      endSession();
      
      const sessions = getStoredSessions();
      expect(sessions.length).toBe(1);
      expect(sessions[0].mode).toBe('explore');
      expect(sessions[0].stageId).toBe('cvc_a');
    });

    it('enforces 50 session cap', () => {
      // Create 60 sessions
      for (let i = 0; i < 60; i++) {
        startSession('explore');
        recordWordCompleted();
        endSession();
      }
      
      const sessions = getStoredSessions();
      expect(sessions.length).toBe(50);
    });

    it('filters out invalid sessions on load', () => {
      // Manually inject invalid data
      localStorage.setItem('wordbuilder.analytics.v1', JSON.stringify([
        { schemaVersion: 1, id: 'valid', timestamp: Date.now(), mode: 'explore', wordsCompleted: 1, correctTouches: 1, incorrectTouches: 0, confusionPairs: {}, avgTimePerWordMs: 1000, totalDurationMs: 1000, buildVersion: 'test' },
        { schemaVersion: 999, id: 'invalid', timestamp: Date.now() }, // Wrong schema
        { id: 'also-invalid' }, // Missing required fields
      ]));
      
      const sessions = getStoredSessions();
      expect(sessions.length).toBe(1);
      expect(sessions[0].id).toBe('valid');
    });

    it('handles corrupt localStorage gracefully', () => {
      localStorage.setItem('wordbuilder.analytics.v1', 'not valid json');
      
      const sessions = getStoredSessions();
      expect(sessions).toEqual([]);
    });
  });

  describe('analytics summary', () => {
    it('returns empty summary when no sessions', () => {
      const summary = getAnalyticsSummary();
      expect(summary.totalSessions).toBe(0);
      expect(summary.totalWords).toBe(0);
      expect(summary.avgAccuracy).toBe(0);
    });

    it('calculates accuracy correctly', () => {
      startSession('explore');
      recordTouch('A', 'A', true);
      recordTouch('B', 'B', true);
      recordTouch('C', 'X', false);
      endSession();
      
      const summary = getAnalyticsSummary();
      expect(summary.totalSessions).toBe(1);
      expect(summary.avgAccuracy).toBeCloseTo(66.67, 1); // 2/3 = 66.67%
    });

    it('identifies top confusion pairs', () => {
      startSession('explore');
      recordTouch('B', 'D', false);
      recordTouch('B', 'D', false);
      recordTouch('B', 'D', false);
      recordTouch('A', 'E', false);
      recordTouch('A', 'E', false);
      endSession();
      
      const summary = getAnalyticsSummary();
      expect(summary.topConfusions.length).toBeGreaterThan(0);
      expect(summary.topConfusions[0][0]).toBe('B/D'); // Most frequent
      expect(summary.topConfusions[0][1]).toBe(3);
    });

    it('returns recent sessions sorted by timestamp', () => {
      // Create sessions with different timestamps
      for (let i = 0; i < 15; i++) {
        startSession('explore');
        recordWordCompleted();
        endSession();
        
        // Manually modify timestamp to simulate older sessions
        const sessions = getStoredSessions();
        sessions[sessions.length - 1].timestamp = Date.now() - i * 1000;
        localStorage.setItem('wordbuilder.analytics.v1', JSON.stringify(sessions));
      }
      
      const summary = getAnalyticsSummary();
      expect(summary.recentSessions.length).toBe(10); // Limited to 10
      
      // Should be sorted by timestamp desc (newest first)
      for (let i = 1; i < summary.recentSessions.length; i++) {
        expect(summary.recentSessions[i - 1].timestamp)
          .toBeGreaterThanOrEqual(summary.recentSessions[i].timestamp);
      }
    });
  });

  describe('export and reset', () => {
    it('exports analytics as JSON', () => {
      startSession('explore', 'cvc_a');
      recordWordCompleted();
      endSession();
      
      const exported = exportAnalytics();
      const parsed = JSON.parse(exported);
      
      expect(parsed.exportVersion).toBe(1);
      expect(parsed.sessions).toHaveLength(1);
      expect(parsed.appVersion).toBeDefined();
      expect(parsed.exportTime).toBeDefined();
    });

    it('clears all analytics', () => {
      startSession('explore');
      recordWordCompleted();
      endSession();
      
      expect(getStoredSessions().length).toBe(1);
      
      clearAnalytics();
      
      expect(getStoredSessions().length).toBe(0);
    });

    it('returns storage size', () => {
      startSession('explore');
      recordWordCompleted();
      endSession();
      
      const size = getStorageSize();
      expect(size).toBeGreaterThan(0);
    });
  });

  describe('clock anomaly guards', () => {
    it('clamps negative durations to 0', () => {
      vi.useFakeTimers();
      
      startSession('explore');
      
      // Simulate clock going backwards
      vi.setSystemTime(Date.now() - 1000);
      
      const session = endSession();
      expect(session?.totalDurationMs).toBe(0);
      
      vi.useRealTimers();
    });

    it('clamps absurd durations to max', () => {
      vi.useFakeTimers();
      
      startSession('explore');
      
      // Advance by more than 2 hours (max session duration)
      vi.advanceTimersByTime(3 * 60 * 60 * 1000);
      
      const session = endSession();
      expect(session?.totalDurationMs).toBeLessThanOrEqual(2 * 60 * 60 * 1000);
      
      vi.useRealTimers();
    });
  });
});
