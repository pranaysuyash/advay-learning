/**
 * Memory Match Analytics Extension
 */

import { logEvent, updateExtension, getActiveSession } from '../store';
import type { MemoryExtension, AnalyticsSession } from '../types';

export function initMemorySession(pairsCount: number): void {
  updateExtension({
    game: 'memory',
    pairsCount,
    moves: 0,
    accuracy: 0,
    avgTimePerMatchMs: 0,
    mismatches: [],
  });
}

export function recordMove(
  card1: string,
  card2: string,
  isMatch: boolean,
  timeMs: number
): void {
  const session = getActiveSession();
  if (!session) return;
  
  const current = session.extensionData as Partial<MemoryExtension>;
  const moves = (current.moves || 0) + 1;
  
  const mismatches = current.mismatches || [];
  if (!isMatch) {
    mismatches.push([card1, card2]);
  }
  
  // Calculate running accuracy
  const matches = moves - mismatches.length;
  const accuracy = moves > 0 ? matches / moves : 0;
  
  updateExtension({
    moves,
    accuracy,
    mismatches,
  });
  
  logEvent('memory_move', { card1, card2, isMatch, timeMs });
}

export function finalizeMemory(totalTimeMs: number): void {
  const session = getActiveSession();
  if (!session) return;
  
  const current = session.extensionData as Partial<MemoryExtension>;
  const pairs = current.pairsCount || 1;
  
  updateExtension({
    avgTimePerMatchMs: Math.round(totalTimeMs / pairs),
  });
}

export function isMemorySession(
  session: AnalyticsSession
): session is AnalyticsSession & { extension: MemoryExtension } {
  return session.extension?.game === 'memory';
}
