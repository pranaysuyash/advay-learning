/**
 * Tests for Low Engagement Flagging Module
 * 
 * Tests low engagement flagging:
 * - Flag games with engagement rate below 15% after 30 days
 * 
 * Requirement 5.4
 */

import { describe, it, expect } from 'vitest';
import {
    LowEngagementFlagService,
    createLowEngagementFlagService,
    type GameEngagementData,
    DEFAULT_LOW_ENGAGEMENT_FLAG_CONFIG,
} from './lowEngagementFlag';

describe('LowEngagementFlagService', () => {
    describe('checkLowEngagement', () => {
        it('should flag game with engagement below 15% after 30 days', () => {
            const service = createLowEngagementFlagService();
            const data: GameEngagementData = {
                gameId: 'game-1',
                gameName: 'Test Game',
                launchDate: '2024-01-01',
                uniquePlayers30Day: 100,
                totalUsers30Day: 1000, // 10% engagement
                currentEngagementRate: 10,
                daysSinceLaunch: 30,
            };

            const result = service.checkLowEngagement(data);

            expect(result.isFlagged).toBe(true);
            expect(result.severity).toBe('warning');
            expect(result.engagementRate).toBe(10);
            expect(result.threshold).toBe(15);
            expect(result.recommendedActions.length).toBeGreaterThan(0);
        });

        it('should flag game with critical engagement below 5%', () => {
            const service = createLowEngagementFlagService();
            const data: GameEngagementData = {
                gameId: 'game-1',
                gameName: 'Test Game',
                launchDate: '2024-01-01',
                uniquePlayers30Day: 30,
                totalUsers30Day: 1000, // 3% engagement
                currentEngagementRate: 3,
                daysSinceLaunch: 30,
            };

            const result = service.checkLowEngagement(data);

            expect(result.isFlagged).toBe(true);
            expect(result.severity).toBe('critical');
            expect(result.engagementRate).toBe(3);
        });

        it('should not flag game with engagement at or above 15%', () => {
            const service = createLowEngagementFlagService();
            const data: GameEngagementData = {
                gameId: 'game-1',
                gameName: 'Test Game',
                launchDate: '2024-01-01',
                uniquePlayers30Day: 200,
                totalUsers30Day: 1000, // 20% engagement
                currentEngagementRate: 20,
                daysSinceLaunch: 30,
            };

            const result = service.checkLowEngagement(data);

            expect(result.isFlagged).toBe(false);
            expect(result.severity).toBe('none');
        });

        it('should not flag game before minimum days', () => {
            const service = createLowEngagementFlagService();
            const data: GameEngagementData = {
                gameId: 'game-1',
                gameName: 'Test Game',
                launchDate: '2024-01-01',
                uniquePlayers30Day: 50,
                totalUsers30Day: 1000, // 5% engagement
                currentEngagementRate: 5,
                daysSinceLaunch: 15, // Less than 30 days
            };

            const result = service.checkLowEngagement(data);

            expect(result.isFlagged).toBe(false);
            expect(result.severity).toBe('none');
            expect(result.reason).toContain('Insufficient data');
        });

        it('should not flag game during grace period', () => {
            const service = createLowEngagementFlagService();
            const data: GameEngagementData = {
                gameId: 'game-1',
                gameName: 'Test Game',
                launchDate: '2024-01-01',
                uniquePlayers30Day: 50,
                totalUsers30Day: 1000, // 5% engagement
                currentEngagementRate: 5,
                daysSinceLaunch: 5, // Within grace period
            };

            const result = service.checkLowEngagement(data);

            expect(result.isFlagged).toBe(false);
            expect(result.severity).toBe('none');
            expect(result.reason).toContain('grace period');
        });

        it('should include game name in result', () => {
            const service = createLowEngagementFlagService();
            const data: GameEngagementData = {
                gameId: 'game-1',
                gameName: 'My Awesome Game',
                launchDate: '2024-01-01',
                uniquePlayers30Day: 100,
                totalUsers30Day: 1000,
                currentEngagementRate: 10,
                daysSinceLaunch: 30,
            };

            const result = service.checkLowEngagement(data);

            expect(result.gameName).toBe('My Awesome Game');
        });

        it('should include days since launch in result', () => {
            const service = createLowEngagementFlagService();
            const data: GameEngagementData = {
                gameId: 'game-1',
                gameName: 'Test Game',
                launchDate: '2024-01-01',
                uniquePlayers30Day: 100,
                totalUsers30Day: 1000,
                currentEngagementRate: 10,
                daysSinceLaunch: 45,
            };

            const result = service.checkLowEngagement(data);

            expect(result.daysSinceLaunch).toBe(45);
        });

        it('should include timestamp in result', () => {
            const service = createLowEngagementFlagService();
            const data: GameEngagementData = {
                gameId: 'game-1',
                gameName: 'Test Game',
                launchDate: '2024-01-01',
                uniquePlayers30Day: 100,
                totalUsers30Day: 1000,
                currentEngagementRate: 10,
                daysSinceLaunch: 30,
            };

            const result = service.checkLowEngagement(data);

            expect(result.flaggedAt).toBeDefined();
            expect(new Date(result.flaggedAt).getTime()).toBeLessThanOrEqual(Date.now());
        });
    });

    describe('checkMultipleGames', () => {
        it('should check multiple games and return flags', () => {
            const service = createLowEngagementFlagService();
            const games: GameEngagementData[] = [
                {
                    gameId: 'game-1',
                    gameName: 'Good Game',
                    launchDate: '2024-01-01',
                    uniquePlayers30Day: 300,
                    totalUsers30Day: 1000, // 30% - healthy
                    currentEngagementRate: 30,
                    daysSinceLaunch: 30,
                },
                {
                    gameId: 'game-2',
                    gameName: 'Bad Game',
                    launchDate: '2024-01-01',
                    uniquePlayers30Day: 100,
                    totalUsers30Day: 1000, // 10% - flagged
                    currentEngagementRate: 10,
                    daysSinceLaunch: 30,
                },
                {
                    gameId: 'game-3',
                    gameName: 'Critical Game',
                    launchDate: '2024-01-01',
                    uniquePlayers30Day: 20,
                    totalUsers30Day: 1000, // 2% - critical
                    currentEngagementRate: 2,
                    daysSinceLaunch: 30,
                },
            ];

            const results = service.checkMultipleGames(games);

            expect(results).toHaveLength(3);
            expect(results[0].isFlagged).toBe(false);
            expect(results[1].isFlagged).toBe(true);
            expect(results[2].isFlagged).toBe(true);
            expect(results[2].severity).toBe('critical');
        });

        it('should return empty array for empty input', () => {
            const service = createLowEngagementFlagService();
            const results = service.checkMultipleGames([]);

            expect(results).toHaveLength(0);
        });
    });

    describe('getGamesNeedingReview', () => {
        it('should return only flagged games', () => {
            const service = createLowEngagementFlagService();
            const games: GameEngagementData[] = [
                {
                    gameId: 'game-1',
                    gameName: 'Good Game',
                    launchDate: '2024-01-01',
                    uniquePlayers30Day: 300,
                    totalUsers30Day: 1000,
                    currentEngagementRate: 30,
                    daysSinceLaunch: 30,
                },
                {
                    gameId: 'game-2',
                    gameName: 'Bad Game',
                    launchDate: '2024-01-01',
                    uniquePlayers30Day: 100,
                    totalUsers30Day: 1000,
                    currentEngagementRate: 10,
                    daysSinceLaunch: 30,
                },
            ];

            const flagged = service.getGamesNeedingReview(games);

            expect(flagged).toHaveLength(1);
            expect(flagged[0].gameId).toBe('game-2');
        });

        it('should return empty array when no games need review', () => {
            const service = createLowEngagementFlagService();
            const games: GameEngagementData[] = [
                {
                    gameId: 'game-1',
                    gameName: 'Good Game',
                    launchDate: '2024-01-01',
                    uniquePlayers30Day: 300,
                    totalUsers30Day: 1000,
                    currentEngagementRate: 30,
                    daysSinceLaunch: 30,
                },
            ];

            const flagged = service.getGamesNeedingReview(games);

            expect(flagged).toHaveLength(0);
        });
    });

    describe('getCriticalCases', () => {
        it('should return only critical severity games', () => {
            const service = createLowEngagementFlagService();
            const games: GameEngagementData[] = [
                {
                    gameId: 'game-1',
                    gameName: 'Warning Game',
                    launchDate: '2024-01-01',
                    uniquePlayers30Day: 100,
                    totalUsers30Day: 1000, // 10% - warning
                    currentEngagementRate: 10,
                    daysSinceLaunch: 30,
                },
                {
                    gameId: 'game-2',
                    gameName: 'Critical Game',
                    launchDate: '2024-01-01',
                    uniquePlayers30Day: 20,
                    totalUsers30Day: 1000, // 2% - critical
                    currentEngagementRate: 2,
                    daysSinceLaunch: 30,
                },
            ];

            const critical = service.getCriticalCases(games);

            expect(critical).toHaveLength(1);
            expect(critical[0].gameId).toBe('game-2');
        });
    });

    describe('generateSummary', () => {
        it('should return empty summary for empty flags', () => {
            const service = createLowEngagementFlagService();
            const summary = service.generateSummary([]);

            expect(summary.totalGames).toBe(0);
            expect(summary.flaggedGames).toBe(0);
        });

        it('should calculate summary statistics', () => {
            const service = createLowEngagementFlagService();
            const flags = [
                {
                    gameId: 'game-1',
                    gameName: 'Good Game',
                    isFlagged: false,
                    engagementRate: 30,
                    threshold: 15,
                    daysSinceLaunch: 30,
                    severity: 'none' as const,
                    reason: 'Healthy',
                    recommendedActions: [],
                    flaggedAt: new Date().toISOString(),
                },
                {
                    gameId: 'game-2',
                    gameName: 'Warning Game',
                    isFlagged: true,
                    engagementRate: 10,
                    threshold: 15,
                    daysSinceLaunch: 30,
                    severity: 'warning' as const,
                    reason: 'Low engagement',
                    recommendedActions: [],
                    flaggedAt: new Date().toISOString(),
                },
                {
                    gameId: 'game-3',
                    gameName: 'Critical Game',
                    isFlagged: true,
                    engagementRate: 3,
                    threshold: 15,
                    daysSinceLaunch: 30,
                    severity: 'critical' as const,
                    reason: 'Critical',
                    recommendedActions: [],
                    flaggedAt: new Date().toISOString(),
                },
            ];

            const summary = service.generateSummary(flags);

            expect(summary.totalGames).toBe(3);
            expect(summary.flaggedGames).toBe(2);
            expect(summary.criticalCases).toBe(1);
            expect(summary.warningCases).toBe(1);
            expect(summary.healthyGames).toBe(1);
            expect(summary.avgEngagementRate).toBeCloseTo(14.33, 1); // (30 + 10 + 3) / 3
            expect(summary.gamesBySeverity.critical).toContain('game-3');
            expect(summary.gamesBySeverity.warning).toContain('game-2');
            expect(summary.gamesBySeverity.healthy).toContain('game-1');
        });
    });

    describe('getConfig', () => {
        it('should return the configuration', () => {
            const service = createLowEngagementFlagService({ lowEngagementThreshold: 20 });
            const config = service.getConfig();

            expect(config.lowEngagementThreshold).toBe(20);
            expect(config).toEqual({ ...DEFAULT_LOW_ENGAGEMENT_FLAG_CONFIG, lowEngagementThreshold: 20 });
        });
    });
});

describe('createLowEngagementFlagService', () => {
    it('should create a service with default config', () => {
        const service = createLowEngagementFlagService();

        expect(service).toBeInstanceOf(LowEngagementFlagService);
    });

    it('should create a service with custom config', () => {
        const service = createLowEngagementFlagService({
            lowEngagementThreshold: 20,
            criticalThreshold: 10,
            minimumDaysForCheck: 45,
        });

        expect(service.getConfig().lowEngagementThreshold).toBe(20);
        expect(service.getConfig().criticalThreshold).toBe(10);
        expect(service.getConfig().minimumDaysForCheck).toBe(45);
    });
});