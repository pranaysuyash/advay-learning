import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  startSession,
  endSession,
  getActiveSession,
  setUniversalMetrics,
} from '../store';
import {
  initWordBuilderSession,
  recordWordCompleted,
  recordTouch,
  updateTiming,
  finalizeAccuracy,
  populateUniversalMetrics,
  isWordBuilderSession,
} from '../extensions/wordBuilder';
import type { AnalyticsSession } from '../types';

describe('WordBuilder Analytics Extension', () => {
  beforeEach(() => {
    endSession();
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('initWordBuilderSession', () => {
    it('initializes extension with mode and stage', () => {
      startSession('wordbuilder', 'child-123');
      initWordBuilderSession('phonics', 'cvc_a');
      
      const active = getActiveSession();
      expect(active?.extensionData).toMatchObject({
        game: 'wordbuilder',
        mode: 'phonics',
        stageId: 'cvc_a',
        wordsCompleted: [],
        confusionPairs: {},
        accuracy: 0,
        correctTouches: 0,
        incorrectTouches: 0,
        avgTimePerWordMs: 0,
      });
    });

    it('works with explore mode (no stage)', () => {
      startSession('wordbuilder');
      initWordBuilderSession('explore');
      
      const active = getActiveSession();
      expect(active?.extensionData.mode).toBe('explore');
      expect(active?.extensionData.stageId).toBeUndefined();
    });
  });

  describe('recordWordCompleted', () => {
    it('adds word to completed list', () => {
      startSession('wordbuilder');
      initWordBuilderSession('explore');
      
      recordWordCompleted('CAT');
      recordWordCompleted('DOG');
      
      const active = getActiveSession();
      expect(active?.extensionData.wordsCompleted).toEqual(['CAT', 'DOG']);
    });

    it('no-ops if no active session', () => {
      // Should not throw
      expect(() => recordWordCompleted('CAT')).not.toThrow();
    });
  });

  describe('recordTouch', () => {
    it('tracks correct touches', () => {
      startSession('wordbuilder');
      initWordBuilderSession('explore');
      
      recordTouch('A', 'A', true);
      recordTouch('B', 'B', true);
      
      const active = getActiveSession();
      expect(active?.extensionData.correctTouches).toBe(2);
      expect(active?.extensionData.incorrectTouches).toBe(0);
    });

    it('tracks incorrect touches and confusion pairs', () => {
      startSession('wordbuilder');
      initWordBuilderSession('explore');
      
      recordTouch('A', 'B', false); // Expected A, got B
      
      const active = getActiveSession();
      expect(active?.extensionData.incorrectTouches).toBe(1);
      expect(active?.extensionData.confusionPairs).toEqual({ 'A/B': 1 });
    });

    it('normalizes confusion pairs (sorted)', () => {
      startSession('wordbuilder');
      initWordBuilderSession('explore');
      
      recordTouch('B', 'D', false); // B/D confusion
      recordTouch('D', 'B', false); // D/B confusion (should count as same pair)
      
      const active = getActiveSession();
      // Both should be counted under 'B/D' (sorted)
      expect(active?.extensionData.confusionPairs).toEqual({ 'B/D': 2 });
    });

    it('accumulates multiple confusions of same pair', () => {
      startSession('wordbuilder');
      initWordBuilderSession('explore');
      
      recordTouch('A', 'B', false);
      recordTouch('A', 'B', false);
      recordTouch('A', 'B', false);
      
      const active = getActiveSession();
      expect(active?.extensionData.confusionPairs).toEqual({ 'A/B': 3 });
    });
  });

  describe('finalizeAccuracy', () => {
    it('calculates accuracy from touches', () => {
      startSession('wordbuilder');
      initWordBuilderSession('explore');
      
      recordTouch('A', 'A', true);  // correct
      recordTouch('B', 'B', true);  // correct
      recordTouch('C', 'X', false); // incorrect
      
      finalizeAccuracy();
      
      const active = getActiveSession();
      expect(active?.extensionData.accuracy).toBe(67); // 2/3 = 66.67% rounded
    });

    it('handles zero touches gracefully', () => {
      startSession('wordbuilder');
      initWordBuilderSession('explore');
      
      finalizeAccuracy();
      
      const active = getActiveSession();
      expect(active?.extensionData.accuracy).toBe(0);
    });
  });

  describe('populateUniversalMetrics', () => {
    it('maps wordsCompleted to itemsCompleted', () => {
      startSession('wordbuilder');
      initWordBuilderSession('phonics', 'cvc_a');
      
      recordWordCompleted('CAT');
      recordWordCompleted('DOG');
      recordTouch('A', 'A', true);
      finalizeAccuracy();
      populateUniversalMetrics();
      
      const active = getActiveSession();
      expect(active?.universalMetrics.itemsCompleted).toBe(2);
    });

    it('maps accuracy to accuracyPct', () => {
      startSession('wordbuilder');
      initWordBuilderSession('explore');
      
      recordTouch('A', 'A', true);
      recordTouch('B', 'X', false);
      finalizeAccuracy();
      populateUniversalMetrics();
      
      const active = getActiveSession();
      expect(active?.universalMetrics.accuracyPct).toBe(50);
    });

    it('maps stageId to difficultyTag', () => {
      startSession('wordbuilder');
      initWordBuilderSession('phonics', 'cvc_e');
      
      populateUniversalMetrics();
      
      const active = getActiveSession();
      expect(active?.universalMetrics.difficultyTag).toBe('cvc_e');
    });

    it('identifies B/D confusion as struggle signal', () => {
      startSession('wordbuilder');
      initWordBuilderSession('explore');
      
      recordTouch('B', 'D', false);
      populateUniversalMetrics();
      
      const active = getActiveSession();
      expect(active?.universalMetrics.struggleSignals).toContain('confusion_bd');
    });

    it('identifies P/Q confusion as struggle signal', () => {
      startSession('wordbuilder');
      initWordBuilderSession('explore');
      
      recordTouch('P', 'Q', false);
      populateUniversalMetrics();
      
      const active = getActiveSession();
      expect(active?.universalMetrics.struggleSignals).toContain('confusion_pq');
    });

    it('identifies M/N confusion as struggle signal', () => {
      startSession('wordbuilder');
      initWordBuilderSession('explore');
      
      recordTouch('M', 'N', false);
      populateUniversalMetrics();
      
      const active = getActiveSession();
      expect(active?.universalMetrics.struggleSignals).toContain('confusion_mn');
    });

    it('identifies high error rate as struggle signal', () => {
      startSession('wordbuilder');
      initWordBuilderSession('explore');
      
      // 5+ touches with < 50% accuracy
      recordTouch('A', 'A', true);   // correct
      recordTouch('B', 'X', false);  // wrong
      recordTouch('C', 'Y', false);  // wrong
      recordTouch('D', 'Z', false);  // wrong
      recordTouch('E', 'W', false);  // wrong
      finalizeAccuracy();
      populateUniversalMetrics();
      
      const active = getActiveSession();
      expect(active?.universalMetrics.struggleSignals).toContain('high_error_rate');
    });

    it('does not flag high error rate with less than 5 touches', () => {
      startSession('wordbuilder');
      initWordBuilderSession('explore');
      
      // 4 touches, 25% accuracy - but not enough samples
      recordTouch('A', 'A', true);
      recordTouch('B', 'X', false);
      recordTouch('C', 'Y', false);
      recordTouch('D', 'Z', false);
      finalizeAccuracy();
      populateUniversalMetrics();
      
      const active = getActiveSession();
      expect(active?.universalMetrics.struggleSignals).not.toContain('high_error_rate');
    });

    it('identifies slow response as struggle signal', () => {
      startSession('wordbuilder');
      initWordBuilderSession('explore');
      
      updateTiming(15000); // 15 seconds per word (threshold is 10s)
      populateUniversalMetrics();
      
      const active = getActiveSession();
      expect(active?.universalMetrics.struggleSignals).toContain('slow_response');
    });

    it('deduplicates struggle signals', () => {
      startSession('wordbuilder');
      initWordBuilderSession('explore');
      
      recordTouch('B', 'D', false);
      recordTouch('D', 'B', false); // Same pair, reversed
      populateUniversalMetrics();
      
      const active = getActiveSession();
      const signals = active?.universalMetrics.struggleSignals;
      expect(signals?.filter(s => s === 'confusion_bd').length).toBe(1);
    });
  });

  describe('isWordBuilderSession', () => {
    it('returns true for WordBuilder sessions', () => {
      const session: AnalyticsSession = {
        schemaVersion: 2,
        buildVersion: 'test',
        id: 'test',
        timestamp: Date.now(),
        gameId: 'wordbuilder',
        durationMs: 1000,
        eventsCount: 0,
        completionStatus: 'completed',
        itemsCompleted: 0,
        accuracyPct: 0,
        struggleSignals: [],
        extension: {
          game: 'wordbuilder',
          mode: 'explore',
          wordsCompleted: [],
          confusionPairs: {},
          accuracy: 0,
          correctTouches: 0,
          incorrectTouches: 0,
          avgTimePerWordMs: 0,
        },
      };
      
      expect(isWordBuilderSession(session)).toBe(true);
    });

    it('returns false for non-WordBuilder sessions', () => {
      const session: AnalyticsSession = {
        schemaVersion: 2,
        buildVersion: 'test',
        id: 'test',
        timestamp: Date.now(),
        gameId: 'tracing',
        durationMs: 1000,
        eventsCount: 0,
        completionStatus: 'completed',
        itemsCompleted: 0,
        accuracyPct: 0,
        struggleSignals: [],
        extension: {
          game: 'tracing',
          letter: 'A',
          attempts: 0,
          accuracy: 0,
          timeToCompleteMs: 0,
          errorTypes: [],
        },
      };
      
      expect(isWordBuilderSession(session)).toBe(false);
    });

    it('returns false for sessions without extension', () => {
      const session: AnalyticsSession = {
        schemaVersion: 2,
        buildVersion: 'test',
        id: 'test',
        timestamp: Date.now(),
        gameId: 'wordbuilder',
        durationMs: 1000,
        eventsCount: 0,
        completionStatus: 'completed',
        itemsCompleted: 0,
        accuracyPct: 0,
        struggleSignals: [],
        extension: null,
      };
      
      expect(isWordBuilderSession(session)).toBe(false);
    });
  });

  describe('integration: full session flow', () => {
    it('records a complete WordBuilder session with universal metrics', () => {
      // Start session
      startSession('wordbuilder', 'child-123');
      initWordBuilderSession('phonics', 'cvc_a');
      
      // Gameplay
      recordWordCompleted('CAT');
      recordWordCompleted('BAT');
      recordTouch('C', 'C', true);
      recordTouch('A', 'A', true);
      recordTouch('T', 'T', true);
      recordTouch('B', 'D', false); // B/D confusion
      recordTouch('A', 'A', true);
      recordTouch('T', 'T', true);
      
      // Finalize
      finalizeAccuracy();
      updateTiming(8000);
      populateUniversalMetrics();
      
      // End session
      const session = endSession('completed')!;
      
      // Verify extension
      expect(session.extension?.game).toBe('wordbuilder');
      expect(session.extension?.wordsCompleted).toEqual(['CAT', 'BAT']);
      expect(session.extension?.confusionPairs).toEqual({ 'B/D': 1 });
      
      // Verify universal metrics
      expect(session.itemsCompleted).toBe(2);
      expect(session.accuracyPct).toBe(83); // 5/6 correct (83% rounded)
      expect(session.difficultyTag).toBe('cvc_a');
      expect(session.struggleSignals).toContain('confusion_bd');
    });
  });
});
