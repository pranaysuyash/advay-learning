/**
 * WordBuilder Analytics Extension
 * 
 * Provides typed helpers for WordBuilder-specific analytics
 */

import { logEvent, updateExtension, getActiveSession, setUniversalMetrics } from '../store';
import type { WordBuilderExtension, AnalyticsSession } from '../types';

/**
 * Initialize WordBuilder extension for a session
 */
export function initWordBuilderSession(
  mode: WordBuilderExtension['mode'],
  stageId?: string
): void {
  updateExtension({
    game: 'wordbuilder',
    mode,
    stageId,
    wordsCompleted: [],
    confusionPairs: {},
    accuracy: 0,
    correctTouches: 0,
    incorrectTouches: 0,
    avgTimePerWordMs: 0,
  });
}

/**
 * Record a completed word
 */
export function recordWordCompleted(word: string): void {
  const session = getActiveSession();
  if (!session) return;
  
  const current = session.extensionData as Partial<WordBuilderExtension>;
  const words = current.wordsCompleted || [];
  
  updateExtension({
    wordsCompleted: [...words, word],
  });
  
  logEvent('word_completed', { word });
}

/**
 * Record a touch interaction
 */
export function recordTouch(
  expectedLetter: string,
  touchedLetter: string,
  isCorrect: boolean
): void {
  const session = getActiveSession();
  if (!session) return;
  
  const current = session.extensionData as Partial<WordBuilderExtension>;
  
  if (isCorrect) {
    updateExtension({
      correctTouches: (current.correctTouches || 0) + 1,
    });
  } else {
    updateExtension({
      incorrectTouches: (current.incorrectTouches || 0) + 1,
    });
    
    // Track confusion pair
    const pair = [expectedLetter, touchedLetter].sort().join('/');
    const confusions = current.confusionPairs || {};
    updateExtension({
      confusionPairs: {
        ...confusions,
        [pair]: (confusions[pair] || 0) + 1,
      },
    });
  }
  
  logEvent('touch', { expected: expectedLetter, touched: touchedLetter, isCorrect });
}

/**
 * Update timing statistics
 */
export function updateTiming(avgTimePerWordMs: number): void {
  updateExtension({ avgTimePerWordMs });
}

/**
 * Calculate and update accuracy
 */
export function finalizeAccuracy(): void {
  const session = getActiveSession();
  if (!session) return;
  
  const data = session.extensionData as Partial<WordBuilderExtension>;
  const correct = data.correctTouches || 0;
  const incorrect = data.incorrectTouches || 0;
  const total = correct + incorrect;
  
  if (total > 0) {
    updateExtension({
      accuracy: Math.round((correct / total) * 100),
    });
  }
}

/**
 * Populate universal metrics from WordBuilder extension data
 * Call this before endSession()
 */
export function populateUniversalMetrics(): void {
  const session = getActiveSession();
  if (!session) return;
  
  const data = session.extensionData as Partial<WordBuilderExtension>;
  
  // Map confusion pairs to standardized struggle signals
  const struggleSignals: string[] = [];
  const confusions = data.confusionPairs || {};
  
  for (const pair of Object.keys(confusions)) {
    if (confusions[pair]! > 0) {
      // Map to standard struggle signals
      if (pair === 'B/D' || pair === 'D/B') {
        struggleSignals.push('confusion_bd');
      } else if (pair === 'P/Q' || pair === 'Q/P') {
        struggleSignals.push('confusion_pq');
      } else if (pair === 'M/N' || pair === 'N/M') {
        struggleSignals.push('confusion_mn');
      }
    }
  }
  
  // Check for high error rate
  const correct = data.correctTouches || 0;
  const incorrect = data.incorrectTouches || 0;
  const total = correct + incorrect;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  
  if (accuracy < 50 && total >= 5) {
    struggleSignals.push('high_error_rate');
  }
  
  // Check for slow response (if timing data available)
  if (data.avgTimePerWordMs && data.avgTimePerWordMs > 10000) {
    struggleSignals.push('slow_response');
  }
  
  // Set universal metrics
  setUniversalMetrics({
    itemsCompleted: data.wordsCompleted?.length || 0,
    accuracyPct: accuracy,
    difficultyTag: data.stageId,
    struggleSignals: [...new Set(struggleSignals)], // Deduplicate
  });
}

/**
 * Type guard for WordBuilder sessions
 */
export function isWordBuilderSession(
  session: AnalyticsSession
): session is AnalyticsSession & { extension: WordBuilderExtension } {
  return session.extension?.game === 'wordbuilder';
}
