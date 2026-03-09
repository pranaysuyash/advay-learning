/**
 * Tests for Engagement Rate Module
 * 
 * Tests engagement rate calculation:
 * - Formula: (Unique_Players / Total_Users) * 100
 * 
 * Requirement 5.3
 */

import { describe, it, expect } from 'vitest';
import {
    EngagementRateCalculator,
    createEngagementRateCalculator,
    type EngagementRateInput,
    DEFAULT_ENGAGEMENT_RATE_CONFIG,
} from './engagementRate';

describe('EngagementRateCalculator', () => {
    describe('calculateEngagementRate', () => {
        it('should calculate engagement rate correctly', () => {
            const calculator = createEngagementRateCalculator();
            const input: EngagementRateInput = {
                gameId: 'game-1',
                uniquePlayers: 500,
                totalUsers: 1000,
            };

            const result = calculator.calculateEngagementRate(input);

            expect(result.engagementRate).toBe(50); // (500/1000) * 100
            expect(result.gameId).toBe('game-1');
            expect(result.uniquePlayers).toBe(500);
            expect(result.totalUsers).toBe(1000);
            expect(result.isValid).toBe(true);
        });

        it('should return 0 for zero total users', () => {
            const calculator = createEngagementRateCalculator();
            const input: EngagementRateInput = {
                gameId: 'game-1',
                uniquePlayers: 100,
                totalUsers: 0,
            };

            const result = calculator.calculateEngagementRate(input);

            expect(result.engagementRate).toBe(0);
            expect(result.isValid).toBe(false);
        });

        it('should handle 100% engagement', () => {
            const calculator = createEngagementRateCalculator();
            const input: EngagementRateInput = {
                gameId: 'game-1',
                uniquePlayers: 1000,
                totalUsers: 1000,
            };

            const result = calculator.calculateEngagementRate(input);

            expect(result.engagementRate).toBe(100);
        });

        it('should handle 0% engagement', () => {
            const calculator = createEngagementRateCalculator();
            const input: EngagementRateInput = {
                gameId: 'game-1',
                uniquePlayers: 0,
                totalUsers: 1000,
            };

            const result = calculator.calculateEngagementRate(input);

            expect(result.engagementRate).toBe(0);
        });

        it('should include time period in result', () => {
            const calculator = createEngagementRateCalculator();
            const input: EngagementRateInput = {
                gameId: 'game-1',
                uniquePlayers: 500,
                totalUsers: 1000,
                timePeriod: 'month',
            };

            const result = calculator.calculateEngagementRate(input);

            expect(result.timePeriod).toBe('month');
        });

        it('should default to "all" time period', () => {
            const calculator = createEngagementRateCalculator();
            const input: EngagementRateInput = {
                gameId: 'game-1',
                uniquePlayers: 500,
                totalUsers: 1000,
            };

            const result = calculator.calculateEngagementRate(input);

            expect(result.timePeriod).toBe('all');
        });

        it('should mark as invalid when below minimum sample size', () => {
            const calculator = createEngagementRateCalculator({ minimumSampleSize: 100 });
            const input: EngagementRateInput = {
                gameId: 'game-1',
                uniquePlayers: 50,
                totalUsers: 100,
            };

            const result = calculator.calculateEngagementRate(input);

            expect(result.isValid).toBe(false);
        });

        it('should mark as valid when above minimum sample size', () => {
            const calculator = createEngagementRateCalculator({ minimumSampleSize: 100 });
            const input: EngagementRateInput = {
                gameId: 'game-1',
                uniquePlayers: 150,
                totalUsers: 300,
            };

            const result = calculator.calculateEngagementRate(input);

            expect(result.isValid).toBe(true);
        });
    });

    describe('calculateFromSessions', () => {
        it('should calculate from session user IDs', () => {
            const calculator = createEngagementRateCalculator();
            const sessionUserIds = ['u1', 'u2', 'u3', 'u1', 'u2']; // 3 unique users

            const result = calculator.calculateFromSessions('game-1', 100, sessionUserIds, 'week');

            expect(result.engagementRate).toBe(3); // (3/100) * 100
            expect(result.uniquePlayers).toBe(3);
            expect(result.timePeriod).toBe('week');
        });

        it('should handle empty session list', () => {
            const calculator = createEngagementRateCalculator();

            const result = calculator.calculateFromSessions('game-1', 100, [], 'day');

            expect(result.engagementRate).toBe(0);
            expect(result.uniquePlayers).toBe(0);
        });
    });

    describe('getEngagementLevel', () => {
        it('should return "low" for engagement below threshold', () => {
            const calculator = createEngagementRateCalculator();

            expect(calculator.getEngagementLevel(10)).toBe('low');
            expect(calculator.getEngagementLevel(14.9)).toBe('low');
        });

        it('should return "medium" for engagement in middle range', () => {
            const calculator = createEngagementRateCalculator();

            expect(calculator.getEngagementLevel(15)).toBe('medium');
            expect(calculator.getEngagementLevel(30)).toBe('medium');
            expect(calculator.getEngagementLevel(49.9)).toBe('medium');
        });

        it('should return "high" for engagement above threshold', () => {
            const calculator = createEngagementRateCalculator();

            expect(calculator.getEngagementLevel(50)).toBe('high');
            expect(calculator.getEngagementLevel(75)).toBe('high');
            expect(calculator.getEngagementLevel(100)).toBe('high');
        });
    });

    describe('isLowEngagement', () => {
        it('should return true for engagement below 15%', () => {
            const calculator = createEngagementRateCalculator();

            expect(calculator.isLowEngagement(14.9)).toBe(true);
            expect(calculator.isLowEngagement(10)).toBe(true);
            expect(calculator.isLowEngagement(0)).toBe(true);
        });

        it('should return false for engagement at or above 15%', () => {
            const calculator = createEngagementRateCalculator();

            expect(calculator.isLowEngagement(15)).toBe(false);
            expect(calculator.isLowEngagement(20)).toBe(false);
            expect(calculator.isLowEngagement(100)).toBe(false);
        });
    });

    describe('isHighEngagement', () => {
        it('should return true for engagement above 50%', () => {
            const calculator = createEngagementRateCalculator();

            expect(calculator.isHighEngagement(50.1)).toBe(true);
            expect(calculator.isHighEngagement(75)).toBe(true);
            expect(calculator.isHighEngagement(100)).toBe(true);
        });

        it('should return false for engagement at or below 50%', () => {
            const calculator = createEngagementRateCalculator();

            expect(calculator.isHighEngagement(50)).toBe(false);
            expect(calculator.isHighEngagement(30)).toBe(false);
            expect(calculator.isHighEngagement(0)).toBe(false);
        });
    });

    describe('compareEngagementRates', () => {
        it('should return empty results for empty list', () => {
            const calculator = createEngagementRateCalculator();
            const comparison = calculator.compareEngagementRates([]);

            expect(comparison.highest).toBeNull();
            expect(comparison.lowest).toBeNull();
            expect(comparison.average).toBe(0);
        });

        it('should identify highest and lowest engagement games', () => {
            const calculator = createEngagementRateCalculator();
            const results = [
                calculator.calculateEngagementRate({ gameId: 'game-1', uniquePlayers: 200, totalUsers: 1000 }), // 20%
                calculator.calculateEngagementRate({ gameId: 'game-2', uniquePlayers: 500, totalUsers: 1000 }), // 50%
                calculator.calculateEngagementRate({ gameId: 'game-3', uniquePlayers: 100, totalUsers: 1000 }), // 10%
            ];

            const comparison = calculator.compareEngagementRates(results);

            expect(comparison.highest).toBe('game-2');
            expect(comparison.lowest).toBe('game-3');
            expect(comparison.average).toBeCloseTo(26.67, 1); // (20 + 50 + 10) / 3
        });

        it('should identify games below and above threshold', () => {
            const calculator = createEngagementRateCalculator();
            const results = [
                calculator.calculateEngagementRate({ gameId: 'game-1', uniquePlayers: 100, totalUsers: 1000 }), // 10% - low
                calculator.calculateEngagementRate({ gameId: 'game-2', uniquePlayers: 300, totalUsers: 1000 }), // 30% - medium
                calculator.calculateEngagementRate({ gameId: 'game-3', uniquePlayers: 600, totalUsers: 1000 }), // 60% - high
            ];

            const comparison = calculator.compareEngagementRates(results);

            expect(comparison.belowThreshold).toContain('game-1');
            expect(comparison.aboveThreshold).toContain('game-3');
            expect(comparison.belowThreshold).not.toContain('game-2');
            expect(comparison.aboveThreshold).not.toContain('game-2');
        });
    });

    describe('generateSummary', () => {
        it('should return empty summary for empty list', () => {
            const calculator = createEngagementRateCalculator();
            const summary = calculator.generateSummary([]);

            expect(summary.totalGames).toBe(0);
            expect(summary.avgEngagementRate).toBe(0);
        });

        it('should calculate summary statistics', () => {
            const calculator = createEngagementRateCalculator();
            const results = [
                calculator.calculateEngagementRate({ gameId: 'game-1', uniquePlayers: 100, totalUsers: 1000 }), // 10%
                calculator.calculateEngagementRate({ gameId: 'game-2', uniquePlayers: 300, totalUsers: 1000 }), // 30%
                calculator.calculateEngagementRate({ gameId: 'game-3', uniquePlayers: 600, totalUsers: 1000 }), // 60%
            ];

            const summary = calculator.generateSummary(results);

            expect(summary.totalGames).toBe(3);
            expect(summary.avgEngagementRate).toBeCloseTo(33.33, 1); // (10 + 30 + 60) / 3
            expect(summary.lowEngagementGames).toBe(1);
            expect(summary.highEngagementGames).toBe(1);
            expect(summary.validCalculations).toBe(3);
            expect(summary.invalidCalculations).toBe(0);
        });
    });

    describe('getConfig', () => {
        it('should return the configuration', () => {
            const calculator = createEngagementRateCalculator({ lowEngagementThreshold: 20 });
            const config = calculator.getConfig();

            expect(config.lowEngagementThreshold).toBe(20);
            expect(config).toEqual({ ...DEFAULT_ENGAGEMENT_RATE_CONFIG, lowEngagementThreshold: 20 });
        });
    });
});

describe('createEngagementRateCalculator', () => {
    it('should create a calculator with default config', () => {
        const calculator = createEngagementRateCalculator();

        expect(calculator).toBeInstanceOf(EngagementRateCalculator);
    });

    it('should create a calculator with custom config', () => {
        const calculator = createEngagementRateCalculator({
            lowEngagementThreshold: 20,
            highEngagementThreshold: 60,
            minimumSampleSize: 50,
        });

        expect(calculator.getConfig().lowEngagementThreshold).toBe(20);
        expect(calculator.getConfig().highEngagementThreshold).toBe(60);
        expect(calculator.getConfig().minimumSampleSize).toBe(50);
    });
});