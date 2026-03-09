/**
 * Tests for Engagement Metrics Module
 * 
 * Tests engagement metrics tracking:
 * - Average_Session_Duration
 * - Repeat_Play_Rate
 * - Feedback_Score
 * 
 * Requirement 4.3
 */

import { describe, it, expect } from 'vitest';
import {
    EngagementMetricsCalculator,
    createEngagementMetricsCalculator,
    type SessionData,
    type UserPlayData,
    type FeedbackEntry,
    type EngagementDataInput,
    DEFAULT_ENGAGEMENT_METRICS_CONFIG,
} from './engagementMetrics';

describe('EngagementMetricsCalculator', () => {
    describe('calculateEngagementMetrics', () => {
        it('should calculate all engagement metrics correctly', () => {
            const calculator = createEngagementMetricsCalculator();
            const data: EngagementDataInput = {
                sessions: [
                    {
                        sessionId: 's1',
                        userId: 'u1',
                        startTime: '2024-01-01T10:00:00Z',
                        endTime: '2024-01-01T10:05:00Z',
                        gameId: 'game-1',
                        completed: true,
                    },
                    {
                        sessionId: 's2',
                        userId: 'u2',
                        startTime: '2024-01-01T10:00:00Z',
                        endTime: '2024-01-01T10:10:00Z',
                        gameId: 'game-1',
                        completed: true,
                    },
                ],
                userPlays: [
                    { userId: 'u1', playCount: 3, lastPlayTime: '2024-01-01', totalSessions: 3 },
                    { userId: 'u2', playCount: 1, lastPlayTime: '2024-01-01', totalSessions: 1 },
                ],
                feedback: [
                    { userId: 'u1', score: 4, timestamp: '2024-01-01' },
                    { userId: 'u2', score: 5, timestamp: '2024-01-01' },
                ],
            };

            const result = calculator.calculateEngagementMetrics('game-1', data);

            expect(result.gameId).toBe('game-1');
            expect(result.averageSessionDuration).toBe(450); // (300 + 600) / 2 = 450 seconds
            expect(result.repeatPlayRate).toBe(50); // 1 of 2 users has 2+ plays
            expect(result.feedbackScore).toBe(4.5); // (4 + 5) / 2
            expect(result.totalSessions).toBe(2);
            expect(result.uniquePlayers).toBe(2);
            expect(result.completionRate).toBe(100); // Both completed
        });

        it('should return zeros for empty data', () => {
            const calculator = createEngagementMetricsCalculator();
            const data: EngagementDataInput = {
                sessions: [],
                userPlays: [],
                feedback: [],
            };

            const result = calculator.calculateEngagementMetrics('game-1', data);

            expect(result.averageSessionDuration).toBe(0);
            expect(result.repeatPlayRate).toBe(0);
            expect(result.feedbackScore).toBe(0);
            expect(result.totalSessions).toBe(0);
            expect(result.uniquePlayers).toBe(0);
            expect(result.completionRate).toBe(0);
        });
    });

    describe('calculateAverageSessionDuration', () => {
        it('should calculate average session duration correctly', () => {
            const calculator = createEngagementMetricsCalculator();
            const sessions: SessionData[] = [
                {
                    sessionId: 's1',
                    userId: 'u1',
                    startTime: '2024-01-01T10:00:00Z',
                    endTime: '2024-01-01T10:05:00Z',
                    gameId: 'game-1',
                    completed: true,
                },
                {
                    sessionId: 's2',
                    userId: 'u2',
                    startTime: '2024-01-01T10:00:00Z',
                    endTime: '2024-01-01T10:15:00Z',
                    gameId: 'game-1',
                    completed: true,
                },
            ];

            const result = calculator.calculateAverageSessionDuration(sessions);

            expect(result).toBe(600); // (300 + 900) / 2 = 600 seconds
        });

        it('should filter out sessions longer than timeout', () => {
            const calculator = createEngagementMetricsCalculator({ sessionTimeoutMinutes: 10 });
            const sessions: SessionData[] = [
                {
                    sessionId: 's1',
                    userId: 'u1',
                    startTime: '2024-01-01T10:00:00Z',
                    endTime: '2024-01-01T10:05:00Z',
                    gameId: 'game-1',
                    completed: true,
                },
                {
                    sessionId: 's2',
                    userId: 'u2',
                    startTime: '2024-01-01T10:00:00Z',
                    endTime: '2024-01-01T11:00:00Z', // 60 minutes - should be filtered
                    gameId: 'game-1',
                    completed: true,
                },
            ];

            const result = calculator.calculateAverageSessionDuration(sessions);

            expect(result).toBe(300); // Only first session counted
        });

        it('should return 0 for empty sessions', () => {
            const calculator = createEngagementMetricsCalculator();
            const result = calculator.calculateAverageSessionDuration([]);
            expect(result).toBe(0);
        });
    });

    describe('calculateRepeatPlayRate', () => {
        it('should calculate repeat play rate correctly', () => {
            const calculator = createEngagementMetricsCalculator();
            const userPlays: UserPlayData[] = [
                { userId: 'u1', playCount: 5, lastPlayTime: '2024-01-01', totalSessions: 5 },
                { userId: 'u2', playCount: 3, lastPlayTime: '2024-01-01', totalSessions: 3 },
                { userId: 'u3', playCount: 1, lastPlayTime: '2024-01-01', totalSessions: 1 },
            ];

            const result = calculator.calculateRepeatPlayRate(userPlays);

            expect(result).toBeCloseTo(66.67, 1); // 2 of 3 users have 2+ plays
        });

        it('should return 0 when no repeat players', () => {
            const calculator = createEngagementMetricsCalculator();
            const userPlays: UserPlayData[] = [
                { userId: 'u1', playCount: 1, lastPlayTime: '2024-01-01', totalSessions: 1 },
                { userId: 'u2', playCount: 1, lastPlayTime: '2024-01-01', totalSessions: 1 },
            ];

            const result = calculator.calculateRepeatPlayRate(userPlays);

            expect(result).toBe(0);
        });

        it('should return 0 for empty user plays', () => {
            const calculator = createEngagementMetricsCalculator();
            const result = calculator.calculateRepeatPlayRate([]);
            expect(result).toBe(0);
        });
    });

    describe('calculateFeedbackScore', () => {
        it('should calculate average feedback score correctly', () => {
            const calculator = createEngagementMetricsCalculator();
            const feedback: FeedbackEntry[] = [
                { userId: 'u1', score: 5, timestamp: '2024-01-01' },
                { userId: 'u2', score: 4, timestamp: '2024-01-01' },
                { userId: 'u3', score: 3, timestamp: '2024-01-01' },
            ];

            const result = calculator.calculateFeedbackScore(feedback);

            expect(result).toBe(4); // (5 + 4 + 3) / 3 = 4
        });

        it('should filter out invalid scores', () => {
            const calculator = createEngagementMetricsCalculator();
            const feedback: FeedbackEntry[] = [
                { userId: 'u1', score: 5, timestamp: '2024-01-01' },
                { userId: 'u2', score: 0, timestamp: '2024-01-01' }, // Invalid
                { userId: 'u3', score: 6, timestamp: '2024-01-01' }, // Invalid
                { userId: 'u4', score: 4, timestamp: '2024-01-01' },
            ];

            const result = calculator.calculateFeedbackScore(feedback);

            expect(result).toBe(4.5); // (5 + 4) / 2
        });

        it('should return 0 for empty feedback', () => {
            const calculator = createEngagementMetricsCalculator();
            const result = calculator.calculateFeedbackScore([]);
            expect(result).toBe(0);
        });
    });

    describe('calculateUniquePlayers', () => {
        it('should count unique players correctly', () => {
            const calculator = createEngagementMetricsCalculator();
            const sessions: SessionData[] = [
                { sessionId: 's1', userId: 'u1', startTime: '2024-01-01', endTime: '2024-01-01', gameId: 'game-1', completed: true },
                { sessionId: 's2', userId: 'u2', startTime: '2024-01-01', endTime: '2024-01-01', gameId: 'game-1', completed: true },
                { sessionId: 's3', userId: 'u1', startTime: '2024-01-01', endTime: '2024-01-01', gameId: 'game-1', completed: true },
            ];

            const result = calculator.calculateUniquePlayers(sessions);

            expect(result).toBe(2); // u1 and u2
        });

        it('should return 0 for empty sessions', () => {
            const calculator = createEngagementMetricsCalculator();
            const result = calculator.calculateUniquePlayers([]);
            expect(result).toBe(0);
        });
    });

    describe('calculateCompletionRate', () => {
        it('should calculate completion rate correctly', () => {
            const calculator = createEngagementMetricsCalculator();
            const sessions: SessionData[] = [
                { sessionId: 's1', userId: 'u1', startTime: '2024-01-01', endTime: '2024-01-01', gameId: 'game-1', completed: true },
                { sessionId: 's2', userId: 'u2', startTime: '2024-01-01', endTime: '2024-01-01', gameId: 'game-1', completed: true },
                { sessionId: 's3', userId: 'u3', startTime: '2024-01-01', endTime: '2024-01-01', gameId: 'game-1', completed: false },
            ];

            const result = calculator.calculateCompletionRate(sessions);

            expect(result).toBeCloseTo(66.67, 1); // 2 of 3 completed
        });

        it('should return 0 for empty sessions', () => {
            const calculator = createEngagementMetricsCalculator();
            const result = calculator.calculateCompletionRate([]);
            expect(result).toBe(0);
        });
    });

    describe('calculateEngagementScore', () => {
        it('should calculate weighted engagement score', () => {
            const calculator = createEngagementMetricsCalculator();
            const metrics = {
                gameId: 'game-1' as const,
                averageSessionDuration: 300, // 5 minutes
                repeatPlayRate: 50, // 50%
                feedbackScore: 4, // 4/5
                completionRate: 80, // 80%
                totalSessions: 100,
                uniquePlayers: 80,
                calculatedAt: '2024-01-01',
            };

            const result = calculator.calculateEngagementScore(metrics);

            // Normalized: duration=100, repeat=50, feedback=75, completion=80
            // Weighted: 100*0.2 + 50*0.25 + 75*0.30 + 80*0.25 = 20 + 12.5 + 22.5 + 20 = 75
            expect(result).toBeCloseTo(75, 0);
        });
    });

    describe('generateSummary', () => {
        it('should return empty summary for empty metrics', () => {
            const calculator = createEngagementMetricsCalculator();
            const summary = calculator.generateSummary([]);

            expect(summary.totalGames).toBe(0);
            expect(summary.topPerformingGame).toBeNull();
        });

        it('should calculate summary across multiple games', () => {
            const calculator = createEngagementMetricsCalculator();
            const metrics = [
                calculator.calculateEngagementMetrics('game-1', {
                    sessions: [{ sessionId: 's1', userId: 'u1', startTime: '2024-01-01', endTime: '2024-01-01', gameId: 'game-1', completed: true }],
                    userPlays: [{ userId: 'u1', playCount: 5, lastPlayTime: '2024-01-01', totalSessions: 5 }],
                    feedback: [{ userId: 'u1', score: 5, timestamp: '2024-01-01' }],
                }),
                calculator.calculateEngagementMetrics('game-2', {
                    sessions: [{ sessionId: 's2', userId: 'u2', startTime: '2024-01-01', endTime: '2024-01-01', gameId: 'game-2', completed: true }],
                    userPlays: [{ userId: 'u2', playCount: 1, lastPlayTime: '2024-01-01', totalSessions: 1 }],
                    feedback: [{ userId: 'u2', score: 3, timestamp: '2024-01-01' }],
                }),
            ];

            const summary = calculator.generateSummary(metrics);

            expect(summary.totalGames).toBe(2);
            expect(summary.avgFeedbackScore).toBe(4); // (5 + 3) / 2
            expect(summary.topPerformingGame).toBe('game-1');
            expect(summary.lowestPerformingGame).toBe('game-2');
        });
    });

    describe('getConfig', () => {
        it('should return the configuration', () => {
            const calculator = createEngagementMetricsCalculator({ sessionTimeoutMinutes: 60 });
            const config = calculator.getConfig();

            expect(config.sessionTimeoutMinutes).toBe(60);
            expect(config).toEqual({ ...DEFAULT_ENGAGEMENT_METRICS_CONFIG, sessionTimeoutMinutes: 60 });
        });
    });
});

describe('createEngagementMetricsCalculator', () => {
    it('should create a calculator with default config', () => {
        const calculator = createEngagementMetricsCalculator();

        expect(calculator).toBeInstanceOf(EngagementMetricsCalculator);
    });

    it('should create a calculator with custom config', () => {
        const calculator = createEngagementMetricsCalculator({
            sessionTimeoutMinutes: 30,
            repeatPlayThreshold: 3,
        });

        expect(calculator.getConfig().sessionTimeoutMinutes).toBe(30);
        expect(calculator.getConfig().repeatPlayThreshold).toBe(3);
    });
});