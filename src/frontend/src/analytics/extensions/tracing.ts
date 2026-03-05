/**
 * Tracing Analytics Extension
 */

import { logEvent, updateExtension, getActiveSession } from '../store';
import type { TracingExtension, AnalyticsSession } from '../types';

export function initTracingSession(letter: string): void {
  updateExtension({
    game: 'tracing',
    letter,
    attempts: 0,
    accuracy: 0,
    timeToCompleteMs: 0,
    errorTypes: [],
  });
}

export function recordTracingAttempt(
  accuracy: number,
  errors: TracingExtension['errorTypes']
): void {
  const session = getActiveSession();
  if (!session) return;
  
  const current = session.extensionData as Partial<TracingExtension>;
  
  updateExtension({
    attempts: (current.attempts || 0) + 1,
    accuracy,
    errorTypes: [...(current.errorTypes || []), ...errors],
  });
  
  logEvent('tracing_attempt', { accuracy, errors });
}

export function finalizeTracing(timeToCompleteMs: number): void {
  updateExtension({ timeToCompleteMs });
  logEvent('tracing_completed', { timeToCompleteMs });
}

export function isTracingSession(
  session: AnalyticsSession
): session is AnalyticsSession & { extension: TracingExtension } {
  return session.extension?.game === 'tracing';
}
