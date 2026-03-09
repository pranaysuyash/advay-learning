/**
 * Counting Collect-a-thon Analytics Extension
 * 
 * Provides typed helpers for CV input validation tracking
 * and game-specific metrics.
 * 
 * STATUS: PHASE 3 IMPLEMENTED
 * IMPLEMENTED: recordCVError - logs CV input validation errors
 * FALLBACK: console.warn in countingCollectathonLogic.ts (lines 150-155) - TO BE REPLACED
 */

import { logEvent } from '../index';

// ============================================================================
// EXTENSION DATA TYPE
// ============================================================================

export interface CountingCollectathonExtension {
  game: 'counting-collectathon';
  
  // CV Error Tracking
  cvErrors: {
    invalidHandX: number;      // NaN/Infinity count
    invalidHandY: number;      // Future: Y validation
    totalFrames: number;       // For error rate calculation
  };
  
  // Gameplay Metrics
  itemsSpawned: number;
  itemsCollected: number;
  itemsMissed: number;
  perfectRounds: number;       // No misses in a round
}

// ============================================================================
// INTERFACE FUNCTIONS (TO IMPLEMENT IN PHASE 3)
// ============================================================================

/**
 * Initialize CountingCollectathon extension for a session
 * 
 * USAGE: Call when game starts (startGame or first spawn)
 * PHASE 3: Add to game start flow
 */
export function initCountingSession(): void {
  // TODO: Implement in Phase 3
  // updateExtension({
  //   game: 'counting-collectathon',
  //   cvErrors: { invalidHandX: 0, invalidHandY: 0, totalFrames: 0 },
  //   itemsSpawned: 0,
  //   itemsCollected: 0,
  //   itemsMissed: 0,
  //   perfectRounds: 0,
  // });
}

/**
 * Record CV input validation error
 * 
 * USAGE: Call in updatePlayerPosition when Number.isFinite() fails
 * PHASE 3: IMPLEMENTED - Replaces console.warn
 * 
 * DECISION-2026-03-08: Using logEvent directly instead of extension state
 * RATIONALE: Simpler implementation, extension state can be added later if needed
 * REVISIT: Add extension state tracking if CV error metrics become important
 * 
 * @param field - Which field failed validation ('handX', 'handY', etc.)
 * @param value - The invalid value received
 */
export function recordCVError(
  field: 'handX' | 'handY',
  value: number
): void {
  // Log the error event
  // Note: logEvent handles "no active session" internally (warns to console)
  // This provides graceful degradation - we try to log, but don't crash if no session
  logEvent('cv_input_error', {
    game: 'counting-collectathon',
    field,
    value: String(value), // Stringify to handle NaN/Infinity
    valueType: typeof value,
  });
  
  // Also log to console for development visibility
  // DECISION-2026-03-08: Keeping console.warn as fallback for debugging
  // RATIONALE: Helps developers see errors during development
  if (import.meta.env.DEV) {
    console.warn(`[CountingCollectathon] Invalid ${field} received:`, value);
  }
}

/**
 * Record frame processed (for error rate calculation)
 * 
 * USAGE: Call in game loop each frame
 * PHASE 3: Add to update loop
 */
export function recordFrameProcessed(): void {
  // TODO: Implement in Phase 3
  // Increments totalFrames for error rate % calculation
}

/**
 * Record item spawned
 * 
 * USAGE: Call in spawnItem when new item created
 * PHASE 3: Add to spawnItem function
 */
export function recordItemSpawned(): void {
  // TODO: Implement in Phase 3
}

/**
 * Record item collected/missed
 * 
 * USAGE: Call in checkCollisions
 * PHASE 3: Add to collision detection
 */
export function recordItemResult(
  _result: 'collected' | 'missed',
  _itemType: string
): void {
  // TODO: Implement in Phase 3
}

// ============================================================================
// MIGRATION NOTES
// ============================================================================

/**
 * Phase 3 Implementation Checklist:
 * 
 * - [ ] Create this file with full implementations
 * - [ ] Add export to analytics/index.ts extensions
 * - [ ] Replace console.warn in countingCollectathonLogic.ts (line 155):
 *       OLD: console.warn('[CountingCollectathon] Invalid handX received:', handX);
 *       NEW: import { recordCVError } from '@/analytics/extensions/countingCollectathon';
 *            recordCVError('handX', handX);
 * 
 * - [ ] Add initCountingSession() call in startGame
 * - [ ] Add recordFrameProcessed() to game loop
 * - [ ] Add recordItemSpawned() to spawnItem
 * - [ ] Add recordItemResult() to checkCollisions
 * - [ ] Add tests for extension functions
 */

// Export placeholder to prevent "empty module" warnings
export const COUNTING_EXTENSION_PLACEHOLDER = true;
