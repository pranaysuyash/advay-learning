/**
 * Engagement Metrics Tracking Module
 * 
 * Tracks user engagement metrics:
 * - Average_Session_Duration
 * - Repeat_Play_Rate
 * - Feedback_Score
 * 
 * Requirement 4.3: Track Average_Session_Duration, Repeat_Play_Rate, and Feedback_Score
 */

import type { GameId } from '../types';

/**
 * Session data for engagement calculation
 */
export interface SessionData {
    sessionId: string;
    userId: string;
    startTime: string;
    endTime: string;
    gameId: GameId;
    completed: boolean;
}

/**
 * User play data for repeat play calculation
 */
export interface UserPlayData {
    userId: string;
    playCount: number;
    lastPlayTime: string;
    totalSessions: number;
}

/**
 * Feedback data for feedback score calculation
 */
export interface FeedbackEntry {
    userId: string;
    score: number; // 1-5 scale
    comment?: string;
    timestamp: string;
}

/**
 * Calculated engagement metrics
 */
export interface EngagementMetrics {
    gameId: GameId;
    averageSessionDuration: number; // in seconds
    repeatPlayRate: number; // percentage (0-100)
    feedbackScore: number; // 1-5 scale
    totalSessions: number;
    uniquePlayers: number;
    completionRate: number; // percentage (0-100)
    calculatedAt: string;
}

/**
 * Raw engagement data input
 */
export interface EngagementDataInput {
    sessions: SessionData[];
    userPlays: UserPlayData[];
    feedback: FeedbackEntry[];
}

/**
 * Configuration for engagement metrics calculation
 */
export interface EngagementMetricsConfig {
    sessionTimeoutMinutes: number; // Sessions longer than this are considered outliers
    minFeedbackScore: number; // Minimum feedback score (1)
    maxFeedbackScore: number; // Maximum feedback score (5)
    repeatPlayThreshold: number; // Minimum plays to be considered "repeat" player
}

/**
 * Default configuration for engagement metrics
 */
export const DEFAULT_ENGAGEMENT_METRICS_CONFIG: EngagementMetricsConfig = {
    sessionTimeoutMinutes: 120, // 2 hours max for a session
    minFeedbackScore: 1,
    maxFeedbackScore: 5,
    repeatPlayThreshold: 2, // 2+ plays = repeat player
};

/**
 * Calculate session duration in seconds
 */
function calculateSessionDuration(session: SessionData): number {
    const start = new Date(session.startTime).getTime();
    const end = new Date(session.endTime).getTime();
    return (end - start) / 1000; // Convert to seconds
}

/**
 * Calculate average of an array of numbers
 */
function average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Engagement Metrics Calculator
 * 
 * Tracks and calculates user engagement metrics.
 * Validates: Requirement 4.3
 */
export class EngagementMetricsCalculator {
    private readonly config: EngagementMetricsConfig;

    constructor(config: Partial<EngagementMetricsConfig> = {}) {
        this.config = { ...DEFAULT_ENGAGEMENT_METRICS_CONFIG, ...config };
    }

    /**
     * Calculate all engagement metrics from raw data
     */
    public calculateEngagementMetrics(
        gameId: GameId,
        data: EngagementDataInput
    ): EngagementMetrics {
        const averageSessionDuration = this.calculateAverageSessionDuration(data.sessions);
        const repeatPlayRate = this.calculateRepeatPlayRate(data.userPlays);
        const feedbackScore = this.calculateFeedbackScore(data.feedback);
        const totalSessions = data.sessions.length;
        const uniquePlayers = this.calculateUniquePlayers(data.sessions);
        const completionRate = this.calculateCompletionRate(data.sessions);

        return {
            gameId,
            averageSessionDuration,
            repeatPlayRate,
            feedbackScore,
            totalSessions,
            uniquePlayers,
            completionRate,
            calculatedAt: new Date().toISOString(),
        };
    }

    /**
     * Calculate average session duration
     */
    public calculateAverageSessionDuration(sessions: SessionData[]): number {
        if (sessions.length === 0) return 0;

        const durations = sessions
            .map(s => calculateSessionDuration(s))
            .filter(d => d > 0 && d <= this.config.sessionTimeoutMinutes * 60);

        return average(durations);
    }

    /**
     * Calculate repeat play rate
     * Repeat play rate = (users with 2+ plays / total unique users) * 100
     */
    public calculateRepeatPlayRate(userPlays: UserPlayData[]): number {
        if (userPlays.length === 0) return 0;

        const repeatPlayers = userPlays.filter(
            up => up.playCount >= this.config.repeatPlayThreshold
        ).length;

        return (repeatPlayers / userPlays.length) * 100;
    }

    /**
     * Calculate feedback score (average of all feedback)
     */
    public calculateFeedbackScore(feedback: FeedbackEntry[]): number {
        if (feedback.length === 0) return 0;

        const validScores = feedback
            .map(f => f.score)
            .filter(s => s >= this.config.minFeedbackScore && s <= this.config.maxFeedbackScore);

        if (validScores.length === 0) return 0;

        return average(validScores);
    }

    /**
     * Calculate number of unique players
     */
    public calculateUniquePlayers(sessions: SessionData[]): number {
        const uniqueUserIds = new Set(sessions.map(s => s.userId));
        return uniqueUserIds.size;
    }

    /**
     * Calculate completion rate
     * Completion rate = (completed sessions / total sessions) * 100
     */
    public calculateCompletionRate(sessions: SessionData[]): number {
        if (sessions.length === 0) return 0;

        const completedSessions = sessions.filter(s => s.completed).length;
        return (completedSessions / sessions.length) * 100;
    }

    /**
     * Calculate engagement score (weighted composite)
     */
    public calculateEngagementScore(metrics: EngagementMetrics): number {
        // Normalize each component to 0-100 scale
        const normalizedDuration = Math.min(metrics.averageSessionDuration / 300, 1) * 100; // 5 min = max
        const normalizedRepeat = metrics.repeatPlayRate;
        const normalizedFeedback = Math.max(
            0,
            ((metrics.feedbackScore - 1) / 4) * 100
        ); // 1-5 scale to 0-100
        const normalizedCompletion = metrics.completionRate;

        // Weighted average
        return (
            normalizedDuration * 0.2 +
            normalizedRepeat * 0.25 +
            normalizedFeedback * 0.30 +
            normalizedCompletion * 0.25
        );
    }

    /**
     * Generate a summary of engagement metrics across multiple games
     */
    public generateSummary(metrics: EngagementMetrics[]): {
        totalGames: number;
        avgSessionDuration: number;
        avgRepeatPlayRate: number;
        avgFeedbackScore: number;
        avgCompletionRate: number;
        topPerformingGame: string | null;
        lowestPerformingGame: string | null;
    } {
        if (metrics.length === 0) {
            return {
                totalGames: 0,
                avgSessionDuration: 0,
                avgRepeatPlayRate: 0,
                avgFeedbackScore: 0,
                avgCompletionRate: 0,
                topPerformingGame: null,
                lowestPerformingGame: null,
            };
        }

        const totalGames = metrics.length;
        const avgSessionDuration = average(metrics.map(m => m.averageSessionDuration));
        const avgRepeatPlayRate = average(metrics.map(m => m.repeatPlayRate));
        const avgFeedbackScore = average(metrics.map(m => m.feedbackScore));
        const avgCompletionRate = average(metrics.map(m => m.completionRate));

        // Find top and bottom performers by engagement score
        const scores = metrics.map(m => ({
            gameId: m.gameId,
            score: this.calculateEngagementScore(m),
        }));

        scores.sort((a, b) => b.score - a.score);

        return {
            totalGames,
            avgSessionDuration,
            avgRepeatPlayRate,
            avgFeedbackScore,
            avgCompletionRate,
            topPerformingGame: scores[0]?.gameId || null,
            lowestPerformingGame: scores[scores.length - 1]?.gameId || null,
        };
    }

    /**
     * Get the configuration
     */
    public getConfig(): EngagementMetricsConfig {
        return { ...this.config };
    }
}

/**
 * Create a default engagement metrics calculator
 */
export function createEngagementMetricsCalculator(
    config?: Partial<EngagementMetricsConfig>
): EngagementMetricsCalculator {
    return new EngagementMetricsCalculator(config);
}
