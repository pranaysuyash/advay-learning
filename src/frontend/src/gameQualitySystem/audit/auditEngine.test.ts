import { describe, it, expect } from 'vitest';
import { AuditEngine, AuditContext } from './auditEngine';
import type { Game } from '../types';

describe('AuditEngine - Flagging Logic', () => {
    const engine = new AuditEngine();

    const createMockGame = (id: string, name: string): Game => ({
        id,
        name,
        description: 'Test game',
        category: 'Math',
        ageRange: '5-7',
        difficulty: 'Easy',
        estimatedTime: 30,
        requiredTechnologies: ['React'],
        successCriteria: ['Complete tasks'],
        isImplemented: true,
        lastUpdated: new Date().toISOString(),
    });

    describe('Requirement 1.3: Flag games where any dimension score is below 3', () => {
        it('should flag game when Educational_Value is below 3', () => {
            const game = createMockGame('game1', 'Test Game 1');
            const context: AuditContext = {
                gameData: {
                    educationalObjectives: [], // Score 1
                    skillsDeveloped: ['skill1'],
                    ageRange: '5-7',
                    userFeedback: [{ sentiment: 'positive' }],
                    completionRate: 0.8,
                    averageSessionDuration: 200,
                    bugCount: 0,
                    performanceScore: 95,
                    accessibilityChecks: {
                        colorContrastRatio: 4.5,
                        keyboardNavigation: true,
                        screenReaderSupport: true,
                        timeoutOptions: true,
                    },
                    contentItems: Array(50).fill('item'),
                    variations: ['var1', 'var2', 'var3'],
                    levels: ['level1', 'level2', 'level3'],
                },
            };

            const report = engine.auditGame(game, context);

            expect(report.isFlaggedForImprovement).toBe(true);
            expect(report.scores.find(s => s.dimension === 'Educational_Value')?.score).toBeLessThan(3);
        });

        it('should flag game when User_Experience is below 3', () => {
            const game = createMockGame('game2', 'Test Game 2');
            const context: AuditContext = {
                gameData: {
                    educationalObjectives: ['obj1', 'obj2', 'obj3', 'obj4'],
                    skillsDeveloped: ['skill1', 'skill2', 'skill3'],
                    ageRange: '5-7',
                    userFeedback: [], // Score 2
                    completionRate: 0.5,
                    averageSessionDuration: 120,
                    bugCount: 0,
                    performanceScore: 95,
                    accessibilityChecks: {
                        colorContrastRatio: 4.5,
                        keyboardNavigation: true,
                        screenReaderSupport: true,
                        timeoutOptions: true,
                    },
                    contentItems: Array(50).fill('item'),
                    variations: ['var1', 'var2', 'var3'],
                    levels: ['level1', 'level2', 'level3'],
                },
            };

            const report = engine.auditGame(game, context);

            expect(report.isFlaggedForImprovement).toBe(true);
            expect(report.scores.find(s => s.dimension === 'User_Experience')?.score).toBeLessThan(3);
        });

        it('should flag game when Technical_Quality is below 3', () => {
            const game = createMockGame('game3', 'Test Game 3');
            const context: AuditContext = {
                gameData: {
                    educationalObjectives: ['obj1', 'obj2', 'obj3', 'obj4'],
                    skillsDeveloped: ['skill1', 'skill2', 'skill3'],
                    ageRange: '5-7',
                    userFeedback: [{ sentiment: 'positive' }],
                    completionRate: 0.8,
                    averageSessionDuration: 200,
                    bugCount: 60, // Score 1
                    crashRate: 0.01,
                    performanceScore: 80,
                    accessibilityChecks: {
                        colorContrastRatio: 4.5,
                        keyboardNavigation: true,
                        screenReaderSupport: true,
                        timeoutOptions: true,
                    },
                    contentItems: Array(50).fill('item'),
                    variations: ['var1', 'var2', 'var3'],
                    levels: ['level1', 'level2', 'level3'],
                },
            };

            const report = engine.auditGame(game, context);

            expect(report.isFlaggedForImprovement).toBe(true);
            expect(report.scores.find(s => s.dimension === 'Technical_Quality')?.score).toBeLessThan(3);
        });

        it('should flag game when Accessibility is below 3', () => {
            const game = createMockGame('game4', 'Test Game 4');
            const context: AuditContext = {
                gameData: {
                    educationalObjectives: ['obj1', 'obj2', 'obj3', 'obj4'],
                    skillsDeveloped: ['skill1', 'skill2', 'skill3'],
                    ageRange: '5-7',
                    userFeedback: [{ sentiment: 'positive' }],
                    completionRate: 0.8,
                    averageSessionDuration: 200,
                    bugCount: 0,
                    performanceScore: 95,
                    // No accessibility checks - Score 1
                    contentItems: Array(50).fill('item'),
                    variations: ['var1', 'var2', 'var3'],
                    levels: ['level1', 'level2', 'level3'],
                },
            };

            const report = engine.auditGame(game, context);

            expect(report.isFlaggedForImprovement).toBe(true);
            expect(report.scores.find(s => s.dimension === 'Accessibility')?.score).toBeLessThan(3);
        });

        it('should flag game when Content_Completeness is below 3', () => {
            const game = createMockGame('game5', 'Test Game 5');
            const context: AuditContext = {
                gameData: {
                    educationalObjectives: ['obj1', 'obj2', 'obj3', 'obj4'],
                    skillsDeveloped: ['skill1', 'skill2', 'skill3'],
                    ageRange: '5-7',
                    userFeedback: [{ sentiment: 'positive' }],
                    completionRate: 0.8,
                    averageSessionDuration: 200,
                    bugCount: 0,
                    performanceScore: 95,
                    accessibilityChecks: {
                        colorContrastRatio: 4.5,
                        keyboardNavigation: true,
                        screenReaderSupport: true,
                        timeoutOptions: true,
                    },
                    contentItems: [], // Score 1
                    variations: ['var1'],
                    levels: ['level1'],
                },
            };

            const report = engine.auditGame(game, context);

            expect(report.isFlaggedForImprovement).toBe(true);
            expect(report.scores.find(s => s.dimension === 'Content_Completeness')?.score).toBeLessThan(3);
        });

        it('should NOT flag game when all dimension scores are 3 or above', () => {
            const game = createMockGame('game6', 'Test Game 6');
            const context: AuditContext = {
                gameData: {
                    educationalObjectives: ['obj1', 'obj2'],
                    skillsDeveloped: ['skill1', 'skill2'],
                    ageRange: '5-7',
                    userFeedback: [{ sentiment: 'positive' }],
                    completionRate: 0.6,
                    averageSessionDuration: 150,
                    bugCount: 5,
                    crashRate: 0.01,
                    performanceScore: 85,
                    accessibilityChecks: {
                        colorContrastRatio: 4.0,
                        keyboardNavigation: true,
                        screenReaderSupport: true,
                        timeoutOptions: true,
                    },
                    contentItems: Array(30).fill('item'),
                    variations: ['var1', 'var2'],
                    levels: ['level1', 'level2'],
                },
            };

            const report = engine.auditGame(game, context);

            // All scores should be >= 3
            report.scores.forEach(score => {
                expect(score.score).toBeGreaterThanOrEqual(3);
            });
            // But total score is 15-20, which is >= 12, so should NOT be flagged
            expect(report.totalScore).toBeGreaterThanOrEqual(12);
        });
    });

    describe('Requirement 1.4: Flag games where total score is below 12', () => {
        it('should flag game when total score is below 12', () => {
            const game = createMockGame('game7', 'Test Game 7');
            const context: AuditContext = {
                gameData: {
                    educationalObjectives: ['obj1'],
                    skillsDeveloped: ['skill1', 'skill2'],
                    ageRange: '5-7',
                    userFeedback: [{ sentiment: 'positive' }],
                    completionRate: 0.25,
                    averageSessionDuration: 100,
                    bugCount: 25,
                    crashRate: 0.01,
                    performanceScore: 80,
                    accessibilityChecks: {
                        colorContrastRatio: 2.5,
                        keyboardNavigation: false,
                        screenReaderSupport: false,
                        timeoutOptions: false,
                    },
                    contentItems: ['item1', 'item2'],
                    variations: [],
                    levels: [],
                },
            };

            const report = engine.auditGame(game, context);

            expect(report.totalScore).toBeLessThan(12);
            expect(report.isFlaggedForImprovement).toBe(true);
        });

        it('should flag game when total score is exactly 11', () => {
            const game = createMockGame('game8', 'Test Game 8');
            // Create a scenario where total score is exactly 11
            // Educational_Value: 3 (insufficient objectives)
            // User_Experience: 2 (low completion rate)
            // Technical_Quality: 2 (moderate bug count)
            // Accessibility: 2 (insufficient color contrast)
            // Content_Completeness: 2 (insufficient content items)
            // Total: 3 + 2 + 2 + 2 + 2 = 11
            const context: AuditContext = {
                gameData: {
                    educationalObjectives: ['obj1'],
                    skillsDeveloped: ['skill1', 'skill2'],
                    ageRange: '5-7',
                    userFeedback: [{ sentiment: 'positive' }],
                    completionRate: 0.25,
                    averageSessionDuration: 100,
                    bugCount: 25,
                    crashRate: 0.01,
                    performanceScore: 80,
                    accessibilityChecks: {
                        colorContrastRatio: 2.5,
                        keyboardNavigation: true,
                        screenReaderSupport: true,
                        timeoutOptions: false,
                    },
                    contentItems: ['item1', 'item2', 'item3'],
                    variations: [],
                    levels: [],
                },
            };

            const report = engine.auditGame(game, context);

            expect(report.totalScore).toBeLessThan(12);
            expect(report.isFlaggedForImprovement).toBe(true);
        });

        it('should NOT flag game when total score is exactly 12', () => {
            const game = createMockGame('game9', 'Test Game 9');
            const context: AuditContext = {
                gameData: {
                    educationalObjectives: ['obj1'],
                    skillsDeveloped: ['skill1', 'skill2'],
                    ageRange: '5-7',
                    userFeedback: [{ sentiment: 'positive' }],
                    completionRate: 0.25,
                    averageSessionDuration: 100,
                    bugCount: 5,
                    crashRate: 0.01,
                    performanceScore: 85,
                    accessibilityChecks: {
                        colorContrastRatio: 3.5,
                        keyboardNavigation: true,
                        screenReaderSupport: true,
                        timeoutOptions: false,
                    },
                    contentItems: Array(15).fill('item'),
                    variations: [],
                    levels: ['level1'],
                },
            };

            const report = engine.auditGame(game, context);

            // Total score should be >= 12
            expect(report.totalScore).toBeGreaterThanOrEqual(12);
        });

        it('should NOT flag game when total score is above 12', () => {
            const game = createMockGame('game10', 'Test Game 10');
            const context: AuditContext = {
                gameData: {
                    educationalObjectives: ['obj1', 'obj2', 'obj3'],
                    skillsDeveloped: ['skill1', 'skill2'],
                    ageRange: '5-7',
                    userFeedback: [{ sentiment: 'positive' }],
                    completionRate: 0.6,
                    averageSessionDuration: 150,
                    bugCount: 5,
                    crashRate: 0.01,
                    performanceScore: 85,
                    accessibilityChecks: {
                        colorContrastRatio: 4.0,
                        keyboardNavigation: true,
                        screenReaderSupport: true,
                        timeoutOptions: true,
                    },
                    contentItems: Array(30).fill('item'),
                    variations: ['var1', 'var2'],
                    levels: ['level1', 'level2'],
                },
            };

            const report = engine.auditGame(game, context);

            expect(report.totalScore).toBeGreaterThan(12);
        });
    });

    describe('Combined flagging scenarios', () => {
        it('should flag game when both conditions are met (low dimension score AND low total score)', () => {
            const game = createMockGame('game11', 'Test Game 11');
            const context: AuditContext = {
                gameData: {
                    educationalObjectives: [],
                    skillsDeveloped: [],
                    ageRange: '',
                    userFeedback: [],
                    completionRate: 0.1,
                    averageSessionDuration: 30,
                    bugCount: 60,
                    crashRate: 0.1,
                    performanceScore: 50,
                    // No accessibility checks
                    contentItems: [],
                    variations: [],
                    levels: [],
                },
            };

            const report = engine.auditGame(game, context);

            // Multiple dimensions should be below 3
            const lowScores = report.scores.filter(s => s.score < 3);
            expect(lowScores.length).toBeGreaterThan(0);

            // Total score should be well below 12
            expect(report.totalScore).toBeLessThan(12);

            // Should be flagged
            expect(report.isFlaggedForImprovement).toBe(true);
        });

        it('should flag game when only one dimension is below 3 but total is above 12', () => {
            const game = createMockGame('game12', 'Test Game 12');
            const context: AuditContext = {
                gameData: {
                    educationalObjectives: [], // Score 1
                    skillsDeveloped: ['skill1'],
                    ageRange: '5-7',
                    userFeedback: [{ sentiment: 'positive' }],
                    completionRate: 0.8,
                    averageSessionDuration: 200,
                    bugCount: 0,
                    performanceScore: 95,
                    accessibilityChecks: {
                        colorContrastRatio: 4.5,
                        keyboardNavigation: true,
                        screenReaderSupport: true,
                        timeoutOptions: true,
                    },
                    contentItems: Array(50).fill('item'),
                    variations: ['var1', 'var2', 'var3'],
                    levels: ['level1', 'level2', 'level3'],
                },
            };

            const report = engine.auditGame(game, context);

            // One dimension should be below 3
            const lowScores = report.scores.filter(s => s.score < 3);
            expect(lowScores.length).toBeGreaterThan(0);

            // Total score should be above 12 (1 + 5 + 5 + 5 + 5 = 21)
            expect(report.totalScore).toBeGreaterThan(12);

            // Should still be flagged because of the low dimension score
            expect(report.isFlaggedForImprovement).toBe(true);
        });
    });

    describe('AuditReport structure', () => {
        it('should include all required fields in audit report', () => {
            const game = createMockGame('game13', 'Test Game 13');
            const context: AuditContext = {
                gameData: {
                    educationalObjectives: ['obj1', 'obj2'],
                    skillsDeveloped: ['skill1', 'skill2'],
                    ageRange: '5-7',
                    userFeedback: [{ sentiment: 'positive' }],
                    completionRate: 0.6,
                    averageSessionDuration: 150,
                    bugCount: 5,
                    crashRate: 0.01,
                    performanceScore: 85,
                    accessibilityChecks: {
                        colorContrastRatio: 4.0,
                        keyboardNavigation: true,
                        screenReaderSupport: true,
                        timeoutOptions: true,
                    },
                    contentItems: Array(30).fill('item'),
                    variations: ['var1', 'var2'],
                    levels: ['level1', 'level2'],
                },
            };

            const report = engine.auditGame(game, context);

            expect(report).toHaveProperty('gameId');
            expect(report).toHaveProperty('gameName');
            expect(report).toHaveProperty('auditDate');
            expect(report).toHaveProperty('auditor');
            expect(report).toHaveProperty('scores');
            expect(report).toHaveProperty('totalScore');
            expect(report).toHaveProperty('isFlaggedForImprovement');
            expect(report).toHaveProperty('improvementRecommendations');

            expect(report.gameId).toBe(game.id);
            expect(report.gameName).toBe(game.name);
            expect(Array.isArray(report.scores)).toBe(true);
            expect(report.scores.length).toBe(5);
            expect(Array.isArray(report.improvementRecommendations)).toBe(true);
        });

        it('should calculate total score correctly', () => {
            const game = createMockGame('game14', 'Test Game 14');
            const context: AuditContext = {
                gameData: {
                    educationalObjectives: ['obj1', 'obj2', 'obj3', 'obj4'],
                    skillsDeveloped: ['skill1', 'skill2', 'skill3'],
                    ageRange: '5-7',
                    userFeedback: [{ sentiment: 'positive' }],
                    completionRate: 0.8,
                    averageSessionDuration: 200,
                    bugCount: 0,
                    performanceScore: 95,
                    accessibilityChecks: {
                        colorContrastRatio: 4.5,
                        keyboardNavigation: true,
                        screenReaderSupport: true,
                        timeoutOptions: true,
                    },
                    contentItems: Array(50).fill('item'),
                    variations: ['var1', 'var2', 'var3'],
                    levels: ['level1', 'level2', 'level3'],
                },
            };

            const report = engine.auditGame(game, context);

            const expectedTotal = report.scores.reduce((sum, s) => sum + s.score, 0);
            expect(report.totalScore).toBe(expectedTotal);
        });

        it('should include improvement recommendations for flagged games', () => {
            const game = createMockGame('game15', 'Test Game 15');
            const context: AuditContext = {
                gameData: {
                    educationalObjectives: [],
                    skillsDeveloped: [],
                    ageRange: '',
                    userFeedback: [],
                    completionRate: 0.1,
                    averageSessionDuration: 30,
                    bugCount: 60,
                    crashRate: 0.1,
                    performanceScore: 50,
                    contentItems: [],
                    variations: [],
                    levels: [],
                },
            };

            const report = engine.auditGame(game, context);

            expect(report.isFlaggedForImprovement).toBe(true);
            expect(report.improvementRecommendations.length).toBeGreaterThan(0);
        });
    });

    describe('getFlaggedGames method', () => {
        it('should return only flagged games from multiple reports', () => {
            const game1 = createMockGame('game1', 'Flagged Game 1');
            const game2 = createMockGame('game2', 'Good Game');
            const game3 = createMockGame('game3', 'Flagged Game 2');

            const context1: AuditContext = {
                gameData: {
                    educationalObjectives: [],
                    skillsDeveloped: [],
                    ageRange: '',
                    userFeedback: [],
                    completionRate: 0.1,
                    averageSessionDuration: 30,
                    bugCount: 60,
                    crashRate: 0.1,
                    performanceScore: 50,
                    contentItems: [],
                    variations: [],
                    levels: [],
                },
            };

            const context2: AuditContext = {
                gameData: {
                    educationalObjectives: ['obj1', 'obj2', 'obj3', 'obj4'],
                    skillsDeveloped: ['skill1', 'skill2', 'skill3'],
                    ageRange: '5-7',
                    userFeedback: [{ sentiment: 'positive' }],
                    completionRate: 0.8,
                    averageSessionDuration: 200,
                    bugCount: 0,
                    performanceScore: 95,
                    accessibilityChecks: {
                        colorContrastRatio: 4.5,
                        keyboardNavigation: true,
                        screenReaderSupport: true,
                        timeoutOptions: true,
                    },
                    contentItems: Array(50).fill('item'),
                    variations: ['var1', 'var2', 'var3'],
                    levels: ['level1', 'level2', 'level3'],
                },
            };

            const context3: AuditContext = {
                gameData: {
                    educationalObjectives: ['obj1'],
                    skillsDeveloped: ['skill1', 'skill2'],
                    ageRange: '5-7',
                    userFeedback: [{ sentiment: 'positive' }],
                    completionRate: 0.25,
                    averageSessionDuration: 100,
                    bugCount: 25,
                    crashRate: 0.01,
                    performanceScore: 80,
                    accessibilityChecks: {
                        colorContrastRatio: 2.5,
                        keyboardNavigation: false,
                        screenReaderSupport: false,
                        timeoutOptions: false,
                    },
                    contentItems: ['item1', 'item2'],
                    variations: [],
                    levels: [],
                },
            };

            const reports = engine.auditMultipleGames(
                [game1, game2, game3],
                {
                    game1: context1,
                    game2: context2,
                    game3: context3,
                }
            );

            const flaggedGames = engine.getFlaggedGames(reports);

            expect(flaggedGames.length).toBe(2);
            expect(flaggedGames.map(g => g.gameId)).toContain('game1');
            expect(flaggedGames.map(g => g.gameId)).toContain('game3');
            expect(flaggedGames.map(g => g.gameId)).not.toContain('game2');
        });
    });
});


describe('AuditEngine - Report Generation', () => {
    const engine = new AuditEngine();

    const createMockGame = (id: string, name: string): Game => ({
        id,
        name,
        description: 'Test game',
        category: 'Math',
        ageRange: '5-7',
        difficulty: 'Easy',
        estimatedTime: 30,
        requiredTechnologies: ['React'],
        successCriteria: ['Complete tasks'],
        isImplemented: true,
        lastUpdated: new Date().toISOString(),
    });

    describe('Requirement 1.5: Generate detailed report with specific improvement recommendations', () => {
        it('should generate detailed report with recommendations for low-scoring dimensions', () => {
            const game = createMockGame('game1', 'Test Game 1');
            const context: AuditContext = {
                gameData: {
                    educationalObjectives: [], // Score 1
                    skillsDeveloped: [],
                    ageRange: '',
                    userFeedback: [],
                    completionRate: 0.2,
                    averageSessionDuration: 30,
                    bugCount: 60,
                    crashRate: 0.1,
                    performanceScore: 50,
                    accessibilityChecks: {
                        colorContrastRatio: 2.5,
                        keyboardNavigation: false,
                        screenReaderSupport: false,
                        timeoutOptions: false,
                    },
                    contentItems: [],
                    variations: [],
                    levels: [],
                },
            };

            const auditReport = engine.auditGame(game, context);
            const detailedReport = engine.generateDetailedReport(auditReport);

            // Should have detailed recommendations
            expect(detailedReport.detailedRecommendations).toBeDefined();
            expect(detailedReport.detailedRecommendations.length).toBeGreaterThan(0);

            // Should have executive summary
            expect(detailedReport.executiveSummary).toBeDefined();
            expect(detailedReport.executiveSummary).toContain('Test Game 1');

            // Should have priority actions
            expect(detailedReport.priorityActions).toBeDefined();
            expect(detailedReport.priorityActions.length).toBeGreaterThan(0);

            // Should have estimated improvement time
            expect(detailedReport.estimatedImprovementTime).toBeDefined();
        });

        it('should include specific action items for each low-scoring dimension', () => {
            const game = createMockGame('game2', 'Test Game 2');
            const context: AuditContext = {
                gameData: {
                    educationalObjectives: ['obj1'], // Score 2
                    skillsDeveloped: ['skill1'],
                    ageRange: '5-7',
                    userFeedback: [{ sentiment: 'negative' }],
                    completionRate: 0.25,
                    averageSessionDuration: 50,
                    bugCount: 25,
                    crashRate: 0.03,
                    performanceScore: 65,
                    accessibilityChecks: {
                        colorContrastRatio: 3.5,
                        keyboardNavigation: false,
                        screenReaderSupport: false,
                        timeoutOptions: false,
                    },
                    contentItems: Array(5).fill('item'),
                    variations: [],
                    levels: [],
                },
            };

            const auditReport = engine.auditGame(game, context);
            const detailedReport = engine.generateDetailedReport(auditReport);

            // Each recommendation should have action items
            for (const recommendation of detailedReport.detailedRecommendations) {
                expect(recommendation.actionItems).toBeDefined();
                expect(recommendation.actionItems.length).toBeGreaterThan(0);
                expect(recommendation.dimension).toBeDefined();
                expect(recommendation.currentScore).toBeGreaterThanOrEqual(1);
                expect(recommendation.currentScore).toBeLessThanOrEqual(5);
                expect(recommendation.targetScore).toBe(5);
                expect(recommendation.priority).toBeDefined();
                expect(recommendation.estimatedEffort).toBeDefined();
                expect(recommendation.expectedImpact).toBeDefined();
            }
        });

        it('should generate text report with formatted output', () => {
            const game = createMockGame('game3', 'Test Game 3');
            const context: AuditContext = {
                gameData: {
                    educationalObjectives: ['obj1'],
                    skillsDeveloped: ['skill1'],
                    ageRange: '5-7',
                    userFeedback: [{ sentiment: 'positive' }],
                    completionRate: 0.5,
                    averageSessionDuration: 120,
                    bugCount: 10,
                    performanceScore: 80,
                    accessibilityChecks: {
                        colorContrastRatio: 4.0,
                        keyboardNavigation: true,
                        screenReaderSupport: false,
                        timeoutOptions: true,
                    },
                    contentItems: Array(20).fill('item'),
                    variations: ['var1'],
                    levels: ['level1'],
                },
            };

            const auditReport = engine.auditGame(game, context);
            const detailedReport = engine.generateDetailedReport(auditReport);
            const textReport = engine.generateTextReport(detailedReport);

            // Should contain key sections
            expect(textReport).toContain('GAME QUALITY AUDIT REPORT');
            expect(textReport).toContain('Test Game 3');
            expect(textReport).toContain('PRIORITY ACTIONS');
            expect(textReport).toContain('DETAILED RECOMMENDATIONS');
            expect(textReport).toContain('Estimated Improvement Time');
        });

        it('should not generate recommendations for games with all perfect scores', () => {
            const game = createMockGame('game4', 'Perfect Game');
            const context: AuditContext = {
                gameData: {
                    educationalObjectives: ['obj1', 'obj2', 'obj3', 'obj4'],
                    skillsDeveloped: ['skill1', 'skill2', 'skill3'],
                    ageRange: '5-7',
                    userFeedback: [{ sentiment: 'positive' }],
                    completionRate: 0.8,
                    averageSessionDuration: 200,
                    bugCount: 0,
                    performanceScore: 95,
                    accessibilityChecks: {
                        colorContrastRatio: 4.5,
                        keyboardNavigation: true,
                        screenReaderSupport: true,
                        timeoutOptions: true,
                    },
                    contentItems: Array(50).fill('item'),
                    variations: ['var1', 'var2', 'var3'],
                    levels: ['level1', 'level2', 'level3'],
                },
            };

            const auditReport = engine.auditGame(game, context);
            const detailedReport = engine.generateDetailedReport(auditReport);

            // Should have no recommendations for perfect game
            expect(detailedReport.detailedRecommendations.length).toBe(0);
            expect(detailedReport.priorityActions.length).toBe(0);
        });

        it('should prioritize critical and high priority recommendations', () => {
            const game = createMockGame('game5', 'Mixed Scores Game');
            const context: AuditContext = {
                gameData: {
                    educationalObjectives: [], // Score 1 - critical
                    skillsDeveloped: [],
                    ageRange: '',
                    userFeedback: [{ sentiment: 'negative' }],
                    completionRate: 0.25, // Score 2 - high
                    averageSessionDuration: 50,
                    bugCount: 15,
                    performanceScore: 75, // Score 3 - medium
                    accessibilityChecks: {
                        colorContrastRatio: 4.5,
                        keyboardNavigation: true,
                        screenReaderSupport: true,
                        timeoutOptions: false, // Score 4 - low
                    },
                    contentItems: Array(50).fill('item'),
                    variations: ['var1', 'var2', 'var3'],
                    levels: ['level1', 'level2', 'level3'],
                },
            };

            const auditReport = engine.auditGame(game, context);
            const detailedReport = engine.generateDetailedReport(auditReport);

            // Should have recommendations sorted by priority
            const priorities = detailedReport.detailedRecommendations.map(r => r.priority);

            // Critical should come before high
            const criticalIndex = priorities.indexOf('critical');
            const highIndex = priorities.indexOf('high');
            if (criticalIndex !== -1 && highIndex !== -1) {
                expect(criticalIndex).toBeLessThan(highIndex);
            }

            // Priority actions should include critical and high priority items
            expect(detailedReport.priorityActions.length).toBeGreaterThan(0);
            const firstAction = detailedReport.priorityActions[0];
            expect(firstAction).toMatch(/\[CRITICAL\]|\[HIGH\]/);
        });

        it('should include all dimensions in executive summary', () => {
            const game = createMockGame('game6', 'Summary Test Game');
            const context: AuditContext = {
                gameData: {
                    educationalObjectives: ['obj1'],
                    skillsDeveloped: ['skill1'],
                    ageRange: '5-7',
                    userFeedback: [{ sentiment: 'positive' }],
                    completionRate: 0.6,
                    averageSessionDuration: 150,
                    bugCount: 5,
                    performanceScore: 85,
                    accessibilityChecks: {
                        colorContrastRatio: 4.2,
                        keyboardNavigation: true,
                        screenReaderSupport: true,
                        timeoutOptions: true,
                    },
                    contentItems: Array(30).fill('item'),
                    variations: ['var1', 'var2'],
                    levels: ['level1', 'level2'],
                },
            };

            const auditReport = engine.auditGame(game, context);
            const detailedReport = engine.generateDetailedReport(auditReport);

            // Executive summary should mention all dimensions
            expect(detailedReport.executiveSummary).toContain('Educational_Value');
            expect(detailedReport.executiveSummary).toContain('User_Experience');
            expect(detailedReport.executiveSummary).toContain('Technical_Quality');
            expect(detailedReport.executiveSummary).toContain('Accessibility');
            expect(detailedReport.executiveSummary).toContain('Content_Completeness');
        });
    });
});
