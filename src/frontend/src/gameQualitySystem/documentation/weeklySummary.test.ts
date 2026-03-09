// Weekly Summary Tests for Game Quality System

import { describe, it, expect, beforeEach } from 'vitest';
import { WeeklySummary, createWeeklySummary, DEFAULT_WEEKLY_SUMMARY_CONFIG } from './weeklySummary';
import type { AuditReport, Game, PriorityScore } from '../types';

describe('WeeklySummary', () => {
    let weeklySummary: WeeklySummary;

    const mockGame1: Game = {
        id: 'game-001',
        name: 'Math Blaster',
        description: 'A math learning game',
        category: 'Educational',
        ageRange: '6-10',
        difficulty: 'Medium',
        estimatedTime: 30,
        requiredTechnologies: ['React', 'TypeScript'],
        successCriteria: ['Complete 10 problems'],
        isImplemented: true,
        implementationStatus: 'completed',
        educationalObjectives: ['Addition', 'Subtraction'],
        lastUpdated: new Date().toISOString(),
    };

    const mockGame2: Game = {
        id: 'game-002',
        name: 'Science Quest',
        description: 'A science learning game',
        category: 'Science',
        ageRange: '8-12',
        difficulty: 'Hard',
        estimatedTime: 45,
        requiredTechnologies: ['React', 'Canvas'],
        successCriteria: ['Complete 5 experiments'],
        isImplemented: true,
        implementationStatus: 'completed',
        educationalObjectives: ['Physics', 'Chemistry'],
        lastUpdated: new Date().toISOString(),
    };

    const mockPreAudit: AuditReport = {
        gameId: 'game-001',
        gameName: 'Math Blaster',
        auditDate: '2024-01-01',
        auditor: 'Initial Auditor',
        scores: [
            { dimension: 'Educational_Value', score: 3, comments: 'Acceptable', issues: [] },
            { dimension: 'User_Experience', score: 2, comments: 'Needs improvement', issues: [] },
            { dimension: 'Technical_Quality', score: 3, comments: 'Acceptable', issues: [] },
            { dimension: 'Accessibility', score: 2, comments: 'Needs improvement', issues: [] },
            { dimension: 'Content_Completeness', score: 3, comments: 'Acceptable', issues: [] },
        ],
        totalScore: 13,
        isFlaggedForImprovement: true,
        improvementRecommendations: [],
    };

    const mockPostAudit: AuditReport = {
        gameId: 'game-001',
        gameName: 'Math Blaster',
        auditDate: '2024-01-15',
        auditor: 'Final Auditor',
        scores: [
            { dimension: 'Educational_Value', score: 4, comments: 'Good', issues: [] },
            { dimension: 'User_Experience', score: 4, comments: 'Good', issues: [] },
            { dimension: 'Technical_Quality', score: 4, comments: 'Good', issues: [] },
            { dimension: 'Accessibility', score: 4, comments: 'Good', issues: [] },
            { dimension: 'Content_Completeness', score: 4, comments: 'Good', issues: [] },
        ],
        totalScore: 20,
        isFlaggedForImprovement: false,
        improvementRecommendations: [],
    };

    const mockPriorityScoreP0: PriorityScore = {
        gameId: 'game-002',
        totalScore: 92,
        educationalImpact: 90,
        userDemand: 85,
        implementationEffort: 70,
        strategicAlignment: 95,
        priorityLevel: 'P0',
    };

    const mockPriorityScoreP1: PriorityScore = {
        gameId: 'game-001',
        totalScore: 78,
        educationalImpact: 75,
        userDemand: 80,
        implementationEffort: 60,
        strategicAlignment: 70,
        priorityLevel: 'P1',
    };

    beforeEach(() => {
        weeklySummary = new WeeklySummary();
    });

    describe('Constructor', () => {
        it('should create with default config', () => {
            const ws = new WeeklySummary();
            expect(ws).toBeDefined();
        });

        it('should create with custom config', () => {
            const ws = new WeeklySummary({
                weekStartDay: 0,
                impactScoreWeights: {
                    gamesImproved: 0.5,
                    gamesImplemented: 0.3,
                    effortEfficiency: 0.2,
                },
                includeDetailedBreakdown: false,
            });
            expect(ws).toBeDefined();
        });
    });

    describe('addGameImproved', () => {
        it('should add a game that was improved', () => {
            weeklySummary.addGameImproved(mockGame1, mockPreAudit, mockPostAudit, 12);

            expect(weeklySummary.getGamesImprovedCount()).toBe(1);
        });

        it('should calculate improvement percentage correctly', () => {
            weeklySummary.addGameImproved(mockGame1, mockPreAudit, mockPostAudit, 12);

            const summary = weeklySummary.generateSummary('2024-01-15', '2024-01-21');
            expect(summary.gamesImproved[0].improvementPercentage).toBeCloseTo(53.85, 1);
        });

        it('should identify dimensions that improved', () => {
            weeklySummary.addGameImproved(mockGame1, mockPreAudit, mockPostAudit, 12);

            const summary = weeklySummary.generateSummary('2024-01-15', '2024-01-21');
            expect(summary.gamesImproved[0].dimensionsImproved.length).toBe(5);
        });
    });

    describe('addGameImplemented', () => {
        it('should add a game that was implemented', () => {
            weeklySummary.addGameImplemented(mockGame2, mockPriorityScoreP0, 24);

            expect(weeklySummary.getGamesImplementedCount()).toBe(1);
        });

        it('should store priority level', () => {
            weeklySummary.addGameImplemented(mockGame2, mockPriorityScoreP0, 24);

            const summary = weeklySummary.generateSummary('2024-01-15', '2024-01-21');
            expect(summary.gamesImplemented[0].priorityLevel).toBe('P0');
        });
    });

    describe('generateSummary', () => {
        it('should generate a complete weekly summary', () => {
            weeklySummary.addGameImproved(mockGame1, mockPreAudit, mockPostAudit, 12);
            weeklySummary.addGameImplemented(mockGame2, mockPriorityScoreP0, 24);

            const summary = weeklySummary.generateSummary('2024-01-15', '2024-01-21');

            expect(summary.weekStartDate).toBe('2024-01-15');
            expect(summary.weekEndDate).toBe('2024-01-21');
            expect(summary.gamesImproved.length).toBe(1);
            expect(summary.gamesImplemented.length).toBe(1);
            expect(summary.totalEffortHours).toBe(36);
            expect(summary.impactScore).toBeGreaterThan(0);
        });

        it('should include key achievements', () => {
            weeklySummary.addGameImproved(mockGame1, mockPreAudit, mockPostAudit, 12);
            weeklySummary.addGameImplemented(mockGame2, mockPriorityScoreP0, 24);

            const summary = weeklySummary.generateSummary('2024-01-15', '2024-01-21');

            expect(summary.keyAchievements.length).toBeGreaterThan(0);
            expect(summary.keyAchievements[0]).toContain('Improved');
        });

        it('should include challenges', () => {
            weeklySummary.addGameImproved(mockGame1, mockPreAudit, mockPostAudit, 12);
            weeklySummary.addGameImplemented(mockGame2, mockPriorityScoreP0, 24);

            const summary = weeklySummary.generateSummary('2024-01-15', '2024-01-21');

            expect(summary.challenges).toBeDefined();
        });

        it('should include next week goals', () => {
            weeklySummary.addGameImproved(mockGame1, mockPreAudit, mockPostAudit, 12);
            weeklySummary.addGameImplemented(mockGame2, mockPriorityScoreP0, 24);

            const summary = weeklySummary.generateSummary('2024-01-15', '2024-01-21');

            expect(summary.nextWeekGoals.length).toBeGreaterThan(0);
        });
    });

    describe('formatAsMarkdown', () => {
        it('should format summary as markdown', () => {
            weeklySummary.addGameImproved(mockGame1, mockPreAudit, mockPostAudit, 12);
            weeklySummary.addGameImplemented(mockGame2, mockPriorityScoreP0, 24);

            const summary = weeklySummary.generateSummary('2024-01-15', '2024-01-21');
            const markdown = weeklySummary.formatAsMarkdown(summary);

            expect(markdown).toContain('# Weekly Summary Report');
            expect(markdown).toContain('Week');
            expect(markdown).toContain('Overview');
            expect(markdown).toContain('Games Improved');
            expect(markdown).toContain('Games Implemented');
        });

        it('should include effort distribution', () => {
            weeklySummary.addGameImproved(mockGame1, mockPreAudit, mockPostAudit, 12);
            weeklySummary.addGameImplemented(mockGame2, mockPriorityScoreP0, 24);

            const summary = weeklySummary.generateSummary('2024-01-15', '2024-01-21');
            const markdown = weeklySummary.formatAsMarkdown(summary);

            expect(markdown).toContain('Effort Distribution');
            expect(markdown).toContain('Math Blaster');
            expect(markdown).toContain('Science Quest');
        });

        it('should include priority distribution', () => {
            weeklySummary.addGameImplemented(mockGame2, mockPriorityScoreP0, 24);
            weeklySummary.addGameImplemented(mockGame1, mockPriorityScoreP1, 20);

            const summary = weeklySummary.generateSummary('2024-01-15', '2024-01-21');
            const markdown = weeklySummary.formatAsMarkdown(summary);

            expect(markdown).toContain('Priority Distribution');
            expect(markdown).toContain('P0');
            expect(markdown).toContain('P1');
        });
    });

    describe('calculateTotalEffortHours', () => {
        it('should calculate total effort hours correctly', () => {
            weeklySummary.addGameImproved(mockGame1, mockPreAudit, mockPostAudit, 12);
            weeklySummary.addGameImplemented(mockGame2, mockPriorityScoreP0, 24);

            expect(weeklySummary.calculateTotalEffortHours()).toBe(36);
        });

        it('should return 0 when no games', () => {
            expect(weeklySummary.calculateTotalEffortHours()).toBe(0);
        });
    });

    describe('calculateImpactScore', () => {
        it('should calculate impact score correctly', () => {
            weeklySummary.addGameImproved(mockGame1, mockPreAudit, mockPostAudit, 12);
            weeklySummary.addGameImplemented(mockGame2, mockPriorityScoreP0, 24);

            const impactScore = weeklySummary.calculateImpactScore(36);

            // 2 games improved = 20 points (max 40)
            // 1 game implemented = 10 points (max 40)
            // Efficiency = (3/36) * 10 = ~0.83 points (max 20)
            expect(impactScore).toBeGreaterThan(0);
            expect(impactScore).toBeLessThanOrEqual(100);
        });

        it('should return 0 when no games', () => {
            const impactScore = weeklySummary.calculateImpactScore(0);
            // With default weights: 0 * 0.4 + 0 * 0.4 + 20 * 0.2 = 4
            expect(impactScore).toBe(4);
        });
    });

    describe('getGamesImprovedCount', () => {
        it('should return correct count', () => {
            expect(weeklySummary.getGamesImprovedCount()).toBe(0);

            weeklySummary.addGameImproved(mockGame1, mockPreAudit, mockPostAudit, 12);
            expect(weeklySummary.getGamesImprovedCount()).toBe(1);

            weeklySummary.addGameImproved(mockGame2, mockPreAudit, mockPostAudit, 8);
            expect(weeklySummary.getGamesImprovedCount()).toBe(2);
        });
    });

    describe('getGamesImplementedCount', () => {
        it('should return correct count', () => {
            expect(weeklySummary.getGamesImplementedCount()).toBe(0);

            weeklySummary.addGameImplemented(mockGame1, mockPriorityScoreP0, 12);
            expect(weeklySummary.getGamesImplementedCount()).toBe(1);
        });
    });

    describe('clear', () => {
        it('should clear all data', () => {
            weeklySummary.addGameImproved(mockGame1, mockPreAudit, mockPostAudit, 12);
            weeklySummary.addGameImplemented(mockGame2, mockPriorityScoreP0, 24);

            weeklySummary.clear();

            expect(weeklySummary.getGamesImprovedCount()).toBe(0);
            expect(weeklySummary.getGamesImplementedCount()).toBe(0);
            expect(weeklySummary.calculateTotalEffortHours()).toBe(0);
        });
    });

    describe('factory function', () => {
        it('should create WeeklySummary instance', () => {
            const ws = createWeeklySummary();
            expect(ws).toBeInstanceOf(WeeklySummary);
        });
    });
});

describe('WeeklySummary - Property Tests', () => {
    let weeklySummary: WeeklySummary;

    beforeEach(() => {
        weeklySummary = new WeeklySummary();
    });

    it('should always generate valid summary structure', () => {
        const game: Game = {
            id: 'test-game',
            name: 'Test Game',
            description: 'Test',
            category: 'Test',
            ageRange: '5-10',
            difficulty: 'Easy',
            estimatedTime: 15,
            requiredTechnologies: [],
            successCriteria: [],
            isImplemented: true,
            lastUpdated: new Date().toISOString(),
        };

        const preAudit: AuditReport = {
            gameId: 'test-game',
            gameName: 'Test Game',
            auditDate: '2024-01-01',
            auditor: 'Test',
            scores: [
                { dimension: 'Educational_Value', score: 3, comments: '', issues: [] },
                { dimension: 'User_Experience', score: 3, comments: '', issues: [] },
                { dimension: 'Technical_Quality', score: 3, comments: '', issues: [] },
                { dimension: 'Accessibility', score: 3, comments: '', issues: [] },
                { dimension: 'Content_Completeness', score: 3, comments: '', issues: [] },
            ],
            totalScore: 15,
            isFlaggedForImprovement: false,
            improvementRecommendations: [],
        };

        const postAudit: AuditReport = {
            ...preAudit,
            auditDate: '2024-01-15',
            totalScore: 20,
        };

        const priorityScore: PriorityScore = {
            gameId: 'test-game',
            totalScore: 75,
            educationalImpact: 70,
            userDemand: 80,
            implementationEffort: 60,
            strategicAlignment: 70,
            priorityLevel: 'P1',
        };

        weeklySummary.addGameImproved(game, preAudit, postAudit, 10);
        weeklySummary.addGameImplemented(game, priorityScore, 15);

        const summary = weeklySummary.generateSummary('2024-01-15', '2024-01-21');

        expect(summary.weekStartDate).toBe('2024-01-15');
        expect(summary.weekEndDate).toBe('2024-01-21');
        expect(summary.gamesImproved.length).toBe(1);
        expect(summary.gamesImplemented.length).toBe(1);
        expect(summary.totalEffortHours).toBe(25);
        expect(summary.impactScore).toBeGreaterThanOrEqual(0);
        expect(summary.impactScore).toBeLessThanOrEqual(100);
    });

    it('should always have non-negative effort hours', () => {
        const game: Game = {
            id: 'test-game',
            name: 'Test Game',
            description: 'Test',
            category: 'Test',
            ageRange: '5-10',
            difficulty: 'Easy',
            estimatedTime: 15,
            requiredTechnologies: [],
            successCriteria: [],
            isImplemented: true,
            lastUpdated: new Date().toISOString(),
        };

        const preAudit: AuditReport = {
            gameId: 'test-game',
            gameName: 'Test Game',
            auditDate: '2024-01-01',
            auditor: 'Test',
            scores: [
                { dimension: 'Educational_Value', score: 3, comments: '', issues: [] },
                { dimension: 'User_Experience', score: 3, comments: '', issues: [] },
                { dimension: 'Technical_Quality', score: 3, comments: '', issues: [] },
                { dimension: 'Accessibility', score: 3, comments: '', issues: [] },
                { dimension: 'Content_Completeness', score: 3, comments: '', issues: [] },
            ],
            totalScore: 15,
            isFlaggedForImprovement: false,
            improvementRecommendations: [],
        };

        const postAudit: AuditReport = {
            ...preAudit,
            auditDate: '2024-01-15',
            totalScore: 20,
        };

        weeklySummary.addGameImproved(game, preAudit, postAudit, 10);

        const totalHours = weeklySummary.calculateTotalEffortHours();
        expect(totalHours).toBeGreaterThanOrEqual(0);
    });

    it('should always have valid impact score range', () => {
        const game: Game = {
            id: 'test-game',
            name: 'Test Game',
            description: 'Test',
            category: 'Test',
            ageRange: '5-10',
            difficulty: 'Easy',
            estimatedTime: 15,
            requiredTechnologies: [],
            successCriteria: [],
            isImplemented: true,
            lastUpdated: new Date().toISOString(),
        };

        const preAudit: AuditReport = {
            gameId: 'test-game',
            gameName: 'Test Game',
            auditDate: '2024-01-01',
            auditor: 'Test',
            scores: [
                { dimension: 'Educational_Value', score: 3, comments: '', issues: [] },
                { dimension: 'User_Experience', score: 3, comments: '', issues: [] },
                { dimension: 'Technical_Quality', score: 3, comments: '', issues: [] },
                { dimension: 'Accessibility', score: 3, comments: '', issues: [] },
                { dimension: 'Content_Completeness', score: 3, comments: '', issues: [] },
            ],
            totalScore: 15,
            isFlaggedForImprovement: false,
            improvementRecommendations: [],
        };

        const postAudit: AuditReport = {
            ...preAudit,
            auditDate: '2024-01-15',
            totalScore: 20,
        };

        const priorityScore: PriorityScore = {
            gameId: 'test-game',
            totalScore: 75,
            educationalImpact: 70,
            userDemand: 80,
            implementationEffort: 60,
            strategicAlignment: 70,
            priorityLevel: 'P1',
        };

        // Add multiple games
        weeklySummary.addGameImproved(game, preAudit, postAudit, 10);
        weeklySummary.addGameImplemented(game, priorityScore, 15);
        weeklySummary.addGameImproved(game, preAudit, postAudit, 8);
        weeklySummary.addGameImplemented(game, priorityScore, 12);

        const impactScore = weeklySummary.calculateImpactScore(45);

        expect(impactScore).toBeGreaterThanOrEqual(0);
        expect(impactScore).toBeLessThanOrEqual(100);
    });
});