// Metrics Extraction Logic for Feedback Module
// Extracts Play_Count, Completion_Rate, Average_Score, Time_On_Task, and Error_Rate from user interaction data
// Validates: Requirement 10.1

import type { GameMetrics } from '../types';

/**
 * Raw user interaction data that can come from various sources
 */
export interface RawInteractionData {
    /** Individual interaction events from the game */
    events: InteractionEvent[];
    /** Session data with timing information */
    sessions: SessionData[];
    /** Game results/scores from completed sessions */
    gameResults: GameResult[];
    /** Error events logged during gameplay */
    errorEvents: ErrorEvent[];
}

/**
 * Individual interaction event from gameplay
 */
export interface InteractionEvent {
    eventType: 'click' | 'keypress' | 'drag' | 'drop' | 'hover' | 'input' | 'start' | 'complete' | 'pause' | 'resume';
    timestamp: number;
    targetElement?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Session data from gameplay sessions
 */
export interface SessionData {
    sessionId: string;
    startTime: number;
    endTime: number;
    gameId: string;
    userId?: string;
    completed: boolean;
    score?: number;
}

/**
 * Game result from a completed session
 */
export interface GameResult {
    resultId: string;
    sessionId: string;
    score: number;
    completed: boolean;
    completionTime: number;
    timestamp: number;
}

/**
 * Error event during gameplay
 */
export interface ErrorEvent {
    errorId: string;
    timestamp: number;
    errorType: string;
    errorMessage: string;
    sessionId: string;
    recoverable: boolean;
}

/**
 * Configuration for metrics extraction
 */
export interface MetricsExtractionConfig {
    /** Time window in milliseconds for filtering recent data */
    timeWindowMs?: number;
    /** Minimum sessions required for valid metrics */
    minSessions?: number;
    /** Whether to include only completed sessions */
    completedSessionsOnly?: boolean;
}

/**
 * Default configuration for metrics extraction
 */
export const DEFAULT_METRICS_CONFIG: MetricsExtractionConfig = {
    timeWindowMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    minSessions: 1,
    completedSessionsOnly: false,
};

/**
 * Extracts metrics from raw user interaction data
 * Requirement 10.1: Extract Play_Count, Completion_Rate, Average_Score, Time_On_Task, and Error_Rate
 */
export function extractMetrics(
    gameId: string,
    rawData: RawInteractionData,
    config: MetricsExtractionConfig = DEFAULT_METRICS_CONFIG
): GameMetrics {
    const now = Date.now();
    const effectiveConfig = { ...DEFAULT_METRICS_CONFIG, ...config };

    // Filter data by time window
    const filteredSessions = filterSessionsByTimeWindow(
        rawData.sessions,
        now,
        effectiveConfig.timeWindowMs
    );
    const filteredResults = filterResultsByTimeWindow(
        rawData.gameResults,
        now,
        effectiveConfig.timeWindowMs
    );
    const filteredErrors = filterErrorsByTimeWindow(
        rawData.errorEvents,
        now,
        effectiveConfig.timeWindowMs
    );

    // Apply completed sessions filter if configured
    const relevantSessions = effectiveConfig.completedSessionsOnly
        ? filteredSessions.filter(s => s.completed)
        : filteredSessions;

    const relevantResults = effectiveConfig.completedSessionsOnly
        ? filteredResults.filter(r => r.completed)
        : filteredResults;

    // Extract Play_Count: Number of unique sessions
    const playCount = extractPlayCount(relevantSessions);

    // Extract Completion_Rate: Percentage of sessions that completed
    const completionRate = extractCompletionRate(relevantSessions);

    // Extract Average_Score: Mean score from completed sessions
    const averageScore = extractAverageScore(relevantResults);

    // Extract Time_On_Task: Average session duration in seconds
    const timeOnTask = extractTimeOnTask(relevantSessions);

    // Extract Error_Rate: Errors per session
    const errorRate = extractErrorRate(filteredErrors, relevantSessions);

    return {
        gameId,
        playCount,
        completionRate,
        averageScore,
        timeOnTask,
        errorRate,
        lastUpdated: new Date().toISOString(),
    };
}

/**
 * Filter sessions by time window
 */
function filterSessionsByTimeWindow(
    sessions: SessionData[],
    now: number,
    timeWindowMs?: number
): SessionData[] {
    if (!timeWindowMs) return sessions;

    const cutoffTime = now - timeWindowMs;
    return sessions.filter(session => session.startTime >= cutoffTime);
}

/**
 * Filter game results by time window
 */
function filterResultsByTimeWindow(
    results: GameResult[],
    now: number,
    timeWindowMs?: number
): GameResult[] {
    if (!timeWindowMs) return results;

    const cutoffTime = now - timeWindowMs;
    return results.filter(result => result.timestamp >= cutoffTime);
}

/**
 * Filter error events by time window
 */
function filterErrorsByTimeWindow(
    errors: ErrorEvent[],
    now: number,
    timeWindowMs?: number
): ErrorEvent[] {
    if (!timeWindowMs) return errors;

    const cutoffTime = now - timeWindowMs;
    return errors.filter(error => error.timestamp >= cutoffTime);
}

/**
 * Extract Play_Count: Count of unique sessions
 */
function extractPlayCount(sessions: SessionData[]): number {
    const uniqueSessionIds = new Set(sessions.map(s => s.sessionId));
    return uniqueSessionIds.size;
}

/**
 * Extract Completion_Rate: Percentage of sessions that completed (0-100)
 */
function extractCompletionRate(sessions: SessionData[]): number {
    if (sessions.length === 0) return 0;

    const completedSessions = sessions.filter(s => s.completed);
    return (completedSessions.length / sessions.length) * 100;
}

/**
 * Extract Average_Score: Mean score from completed sessions (0-100)
 */
function extractAverageScore(results: GameResult[]): number {
    const completedResults = results.filter(r => r.completed && r.score !== undefined);

    if (completedResults.length === 0) return 0;

    const totalScore = completedResults.reduce((sum, r) => sum + r.score, 0);
    return totalScore / completedResults.length;
}

/**
 * Extract Time_On_Task: Average session duration in seconds
 */
function extractTimeOnTask(sessions: SessionData[]): number {
    if (sessions.length === 0) return 0;

    const totalDuration = sessions.reduce((sum, session) => {
        const duration = (session.endTime - session.startTime) / 1000; // Convert to seconds
        return sum + Math.max(0, duration); // Ensure non-negative
    }, 0);

    return totalDuration / sessions.length;
}

/**
 * Extract Error_Rate: Errors per session (0-1 scale)
 */
function extractErrorRate(errors: ErrorEvent[], sessions: SessionData[]): number {
    if (sessions.length === 0) return 0;

    const uniqueSessionIds = new Set(sessions.map(s => s.sessionId));
    const sessionCount = uniqueSessionIds.size;

    // Count unique errors per session
    const errorsBySession = new Map<string, number>();
    for (const error of errors) {
        const count = errorsBySession.get(error.sessionId) || 0;
        errorsBySession.set(error.sessionId, count + 1);
    }

    const totalErrors = Array.from(errorsBySession.values()).reduce((sum, c) => sum + c, 0);

    // Return error rate as a ratio (errors per session, capped at 1)
    return Math.min(totalErrors / sessionCount, 1);
}

/**
 * Create a metrics extractor with custom configuration
 */
export function createMetricsExtractor(config: MetricsExtractionConfig) {
    return {
        extract: (gameId: string, rawData: RawInteractionData) =>
            extractMetrics(gameId, rawData, config),
    };
}

/**
 * Validate that extracted metrics are within expected ranges
 */
export function validateMetrics(metrics: GameMetrics): {
    isValid: boolean;
    issues: string[];
} {
    const issues: string[] = [];

    if (metrics.playCount < 0) {
        issues.push('Play_Count cannot be negative');
    }

    if (metrics.completionRate < 0 || metrics.completionRate > 100) {
        issues.push('Completion_Rate must be between 0 and 100');
    }

    if (metrics.averageScore < 0 || metrics.averageScore > 100) {
        issues.push('Average_Score must be between 0 and 100');
    }

    if (metrics.timeOnTask < 0) {
        issues.push('Time_On_Task cannot be negative');
    }

    if (metrics.errorRate < 0 || metrics.errorRate > 1) {
        issues.push('Error_Rate must be between 0 and 1');
    }

    return {
        isValid: issues.length === 0,
        issues,
    };
}