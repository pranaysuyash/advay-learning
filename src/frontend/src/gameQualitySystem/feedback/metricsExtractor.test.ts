// Metrics Extractor Tests
// Validates: Requirement 10.1

import { describe, it, expect } from 'vitest';
import {
    extractMetrics,
    createMetricsExtractor,
    validateMetrics,
    DEFAULT_METRICS_CONFIG,
    type RawInteractionData,
} from './metricsExtractor';

describe('Metrics Extractor', () => {
    describe('extractMetrics', () => {
        it('should extract all required metrics from user interaction data', () => {
            const rawData: RawInteractionData = {
                events: [],
                sessions: [
                    {
                        sessionId: 'session-1',
                        startTime: Date.now() - 60000,
                        endTime: Date.now(),
                        gameId: 'game-1',
                        completed: true,
                        score: 85,
                    },
                ],
                gameResults: [
                    {
                        resultId: 'result-1',
                        sessionId: 'session-1',
                        score: 85,
                        completed: true,
                        completionTime: 60,
                        timestamp: Date.now(),
                    },
                ],
                errorEvents: [],
            };

            const metrics = extractMetrics('game-1', rawData);

            expect(metrics.gameId).toBe('game-1');
            expect(metrics.playCount).toBe(1);
            expect(metrics.completionRate).toBe(100);
            expect(metrics.averageScore).toBe(85);
            expect(metrics.timeOnTask).toBeGreaterThan(0);
            expect(metrics.errorRate).toBe(0);
        });

        it('should handle empty interaction data', () => {
            const rawData: RawInteractionData = {
                events: [],
                sessions: [],
                gameResults: [],
                errorEvents: [],
            };

            const metrics = extractMetrics('game-1', rawData);

            expect(metrics.playCount).toBe(0);
            expect(metrics.completionRate).toBe(0);
            expect(metrics.averageScore).toBe(0);
            expect(metrics.timeOnTask).toBe(0);
            expect(metrics.errorRate).toBe(0);
        });

        it('should calculate play count from unique sessions', () => {
            const now = Date.now();
            const rawData: RawInteractionData = {
                events: [],
                sessions: [
                    { sessionId: 'session-1', startTime: now - 1000, endTime: now, gameId: 'game-1', completed: true },
                    { sessionId: 'session-2', startTime: now - 2000, endTime: now - 1000, gameId: 'game-1', completed: true },
                    { sessionId: 'session-1', startTime: now - 3000, endTime: now - 2000, gameId: 'game-1', completed: true }, // Duplicate session
                ],
                gameResults: [],
                errorEvents: [],
            };

            const metrics = extractMetrics('game-1', rawData);

            expect(metrics.playCount).toBe(2); // Only unique sessions
        });

        it('should calculate completion rate correctly', () => {
            const now = Date.now();
            const rawData: RawInteractionData = {
                events: [],
                sessions: [
                    { sessionId: 'session-1', startTime: now - 4000, endTime: now - 3000, gameId: 'game-1', completed: true },
                    { sessionId: 'session-2', startTime: now - 3000, endTime: now - 2000, gameId: 'game-1', completed: true },
                    { sessionId: 'session-3', startTime: now - 2000, endTime: now - 1000, gameId: 'game-1', completed: false },
                    { sessionId: 'session-4', startTime: now - 1000, endTime: now, gameId: 'game-1', completed: false },
                ],
                gameResults: [],
                errorEvents: [],
            };

            const metrics = extractMetrics('game-1', rawData);

            expect(metrics.completionRate).toBe(50); // 2 out of 4 = 50%
        });

        it('should calculate average score from completed sessions', () => {
            const rawData: RawInteractionData = {
                events: [],
                sessions: [],
                gameResults: [
                    { resultId: 'r1', sessionId: 's1', score: 80, completed: true, completionTime: 60, timestamp: Date.now() },
                    { resultId: 'r2', sessionId: 's2', score: 90, completed: true, completionTime: 60, timestamp: Date.now() },
                    { resultId: 'r3', sessionId: 's3', score: 70, completed: true, completionTime: 60, timestamp: Date.now() },
                ],
                errorEvents: [],
            };

            const metrics = extractMetrics('game-1', rawData);

            expect(metrics.averageScore).toBe(80); // (80 + 90 + 70) / 3 = 80
        });

        it('should ignore incomplete sessions for average score', () => {
            const rawData: RawInteractionData = {
                events: [],
                sessions: [],
                gameResults: [
                    { resultId: 'r1', sessionId: 's1', score: 80, completed: true, completionTime: 60, timestamp: Date.now() },
                    { resultId: 'r2', sessionId: 's2', score: 90, completed: false, completionTime: 60, timestamp: Date.now() },
                    { resultId: 'r3', sessionId: 's3', score: 70, completed: true, completionTime: 60, timestamp: Date.now() },
                ],
                errorEvents: [],
            };

            const metrics = extractMetrics('game-1', rawData);

            expect(metrics.averageScore).toBe(75); // (80 + 70) / 2 = 75
        });

        it('should calculate time on task in seconds', () => {
            const startTime = Date.now() - 120000; // 2 minutes ago
            const endTime = Date.now() - 60000; // 1 minute ago

            const rawData: RawInteractionData = {
                events: [],
                sessions: [
                    { sessionId: 'session-1', startTime, endTime, gameId: 'game-1', completed: true },
                ],
                gameResults: [],
                errorEvents: [],
            };

            const metrics = extractMetrics('game-1', rawData);

            expect(metrics.timeOnTask).toBeCloseTo(60, 0); // ~60 seconds
        });

        it('should calculate error rate as errors per session', () => {
            const now = Date.now();
            const rawData: RawInteractionData = {
                events: [],
                sessions: [
                    { sessionId: 'session-1', startTime: now - 2000, endTime: now - 1000, gameId: 'game-1', completed: true },
                    { sessionId: 'session-2', startTime: now - 1000, endTime: now, gameId: 'game-1', completed: true },
                ],
                gameResults: [],
                errorEvents: [
                    { errorId: 'e1', timestamp: now - 1500, errorType: 'TypeError', errorMessage: 'Test error', sessionId: 'session-1', recoverable: true },
                    { errorId: 'e2', timestamp: now - 1400, errorType: 'TypeError', errorMessage: 'Test error', sessionId: 'session-1', recoverable: true },
                    { errorId: 'e3', timestamp: now - 500, errorType: 'TypeError', errorMessage: 'Test error', sessionId: 'session-2', recoverable: true },
                ],
            };

            const metrics = extractMetrics('game-1', rawData);

            // 3 errors / 2 sessions = 1.5, but capped at 1
            expect(metrics.errorRate).toBe(1);
        });

        it('should cap error rate at 1', () => {
            const now = Date.now();
            const rawData: RawInteractionData = {
                events: [],
                sessions: [
                    { sessionId: 'session-1', startTime: now - 1000, endTime: now, gameId: 'game-1', completed: true },
                ],
                gameResults: [],
                errorEvents: [
                    { errorId: 'e1', timestamp: now - 500, errorType: 'TypeError', errorMessage: 'Test error', sessionId: 'session-1', recoverable: true },
                    { errorId: 'e2', timestamp: now - 400, errorType: 'TypeError', errorMessage: 'Test error', sessionId: 'session-1', recoverable: true },
                    { errorId: 'e3', timestamp: now - 300, errorType: 'TypeError', errorMessage: 'Test error', sessionId: 'session-1', recoverable: true },
                ],
            };

            const metrics = extractMetrics('game-1', rawData);

            expect(metrics.errorRate).toBe(1); // Capped at 1
        });

        it('should filter by time window', () => {
            const now = Date.now();
            const rawData: RawInteractionData = {
                events: [],
                sessions: [
                    { sessionId: 'session-old', startTime: now - 60 * 24 * 60 * 60 * 1000, endTime: now - 60 * 24 * 60 * 60 * 1000 + 1000, gameId: 'game-1', completed: true }, // 60 days ago
                    { sessionId: 'session-new', startTime: now - 1000, endTime: now, gameId: 'game-1', completed: true }, // Recent
                ],
                gameResults: [],
                errorEvents: [],
            };

            const metrics = extractMetrics('game-1', rawData, {
                timeWindowMs: 30 * 24 * 60 * 60 * 1000, // 30 days
            });

            expect(metrics.playCount).toBe(1); // Only recent session
        });

        it('should only include completed sessions when configured', () => {
            const now = Date.now();
            const rawData: RawInteractionData = {
                events: [],
                sessions: [
                    { sessionId: 'session-1', startTime: now - 2000, endTime: now - 1000, gameId: 'game-1', completed: true },
                    { sessionId: 'session-2', startTime: now - 1000, endTime: now, gameId: 'game-1', completed: false },
                ],
                gameResults: [],
                errorEvents: [],
            };

            const metrics = extractMetrics('game-1', rawData, {
                completedSessionsOnly: true,
            });

            expect(metrics.playCount).toBe(1); // Only completed session
            expect(metrics.completionRate).toBe(100); // 1/1 completed
        });
    });

    describe('createMetricsExtractor', () => {
        it('should create a configured extractor', () => {
            const extractor = createMetricsExtractor({
                timeWindowMs: 7 * 24 * 60 * 60 * 1000,
                minSessions: 5,
                completedSessionsOnly: true,
            });

            const rawData: RawInteractionData = {
                events: [],
                sessions: [
                    { sessionId: 's1', startTime: Date.now() - 1000, endTime: Date.now(), gameId: 'game-1', completed: true },
                ],
                gameResults: [],
                errorEvents: [],
            };

            const metrics = extractor.extract('game-1', rawData);

            expect(metrics.gameId).toBe('game-1');
        });
    });

    describe('validateMetrics', () => {
        it('should validate correct metrics', () => {
            const metrics = {
                gameId: 'game-1',
                playCount: 100,
                completionRate: 75,
                averageScore: 85,
                timeOnTask: 120,
                errorRate: 0.05,
                lastUpdated: new Date().toISOString(),
            };

            const result = validateMetrics(metrics);

            expect(result.isValid).toBe(true);
            expect(result.issues).toHaveLength(0);
        });

        it('should detect negative play count', () => {
            const metrics = {
                gameId: 'game-1',
                playCount: -1,
                completionRate: 75,
                averageScore: 85,
                timeOnTask: 120,
                errorRate: 0.05,
                lastUpdated: new Date().toISOString(),
            };

            const result = validateMetrics(metrics);

            expect(result.isValid).toBe(false);
            expect(result.issues).toContain('Play_Count cannot be negative');
        });

        it('should detect invalid completion rate', () => {
            const metrics = {
                gameId: 'game-1',
                playCount: 100,
                completionRate: 150, // Over 100
                averageScore: 85,
                timeOnTask: 120,
                errorRate: 0.05,
                lastUpdated: new Date().toISOString(),
            };

            const result = validateMetrics(metrics);

            expect(result.isValid).toBe(false);
            expect(result.issues).toContain('Completion_Rate must be between 0 and 100');
        });

        it('should detect invalid average score', () => {
            const metrics = {
                gameId: 'game-1',
                playCount: 100,
                completionRate: 75,
                averageScore: -10, // Negative
                timeOnTask: 120,
                errorRate: 0.05,
                lastUpdated: new Date().toISOString(),
            };

            const result = validateMetrics(metrics);

            expect(result.isValid).toBe(false);
            expect(result.issues).toContain('Average_Score must be between 0 and 100');
        });

        it('should detect negative time on task', () => {
            const metrics = {
                gameId: 'game-1',
                playCount: 100,
                completionRate: 75,
                averageScore: 85,
                timeOnTask: -50, // Negative
                errorRate: 0.05,
                lastUpdated: new Date().toISOString(),
            };

            const result = validateMetrics(metrics);

            expect(result.isValid).toBe(false);
            expect(result.issues).toContain('Time_On_Task cannot be negative');
        });

        it('should detect invalid error rate', () => {
            const metrics = {
                gameId: 'game-1',
                playCount: 100,
                completionRate: 75,
                averageScore: 85,
                timeOnTask: 120,
                errorRate: 2, // Over 1
                lastUpdated: new Date().toISOString(),
            };

            const result = validateMetrics(metrics);

            expect(result.isValid).toBe(false);
            expect(result.issues).toContain('Error_Rate must be between 0 and 1');
        });

        it('should collect multiple validation issues', () => {
            const metrics = {
                gameId: 'game-1',
                playCount: -5,
                completionRate: 150,
                averageScore: -10,
                timeOnTask: -50,
                errorRate: 2,
                lastUpdated: new Date().toISOString(),
            };

            const result = validateMetrics(metrics);

            expect(result.isValid).toBe(false);
            expect(result.issues.length).toBe(5);
        });
    });

    describe('DEFAULT_METRICS_CONFIG', () => {
        it('should have correct default values', () => {
            expect(DEFAULT_METRICS_CONFIG.timeWindowMs).toBe(30 * 24 * 60 * 60 * 1000);
            expect(DEFAULT_METRICS_CONFIG.minSessions).toBe(1);
            expect(DEFAULT_METRICS_CONFIG.completedSessionsOnly).toBe(false);
        });
    });
});

describe('Metrics Extractor - Edge Cases', () => {
    it('should handle sessions with zero duration', () => {
        const rawData: RawInteractionData = {
            events: [],
            sessions: [
                { sessionId: 'session-1', startTime: 1000, endTime: 1000, gameId: 'game-1', completed: true },
            ],
            gameResults: [],
            errorEvents: [],
        };

        const metrics = extractMetrics('game-1', rawData);

        expect(metrics.timeOnTask).toBe(0);
    });

    it('should handle sessions with negative duration gracefully', () => {
        const rawData: RawInteractionData = {
            events: [],
            sessions: [
                { sessionId: 'session-1', startTime: 2000, endTime: 1000, gameId: 'game-1', completed: true }, // end before start
            ],
            gameResults: [],
            errorEvents: [],
        };

        const metrics = extractMetrics('game-1', rawData);

        expect(metrics.timeOnTask).toBe(0); // Should be 0, not negative
    });

    it('should handle results without scores', () => {
        const rawData: RawInteractionData = {
            events: [],
            sessions: [],
            gameResults: [
                { resultId: 'r1', sessionId: 's1', score: 0, completed: true, completionTime: 60, timestamp: Date.now() },
            ],
            errorEvents: [],
        };

        const metrics = extractMetrics('game-1', rawData);

        expect(metrics.averageScore).toBe(0);
    });

    it('should handle errors from sessions that do not exist', () => {
        const rawData: RawInteractionData = {
            events: [],
            sessions: [],
            gameResults: [],
            errorEvents: [
                { errorId: 'e1', timestamp: 500, errorType: 'TypeError', errorMessage: 'Test error', sessionId: 'unknown-session', recoverable: true },
            ],
        };

        const metrics = extractMetrics('game-1', rawData);

        expect(metrics.errorRate).toBe(0); // No sessions to count against
    });
});