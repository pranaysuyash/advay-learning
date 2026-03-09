// Unit tests for Integration Engine
// Tests audit-catalog comparison logic per Requirement 7.1

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { IntegrationEngine } from './integrationEngine';
import type { AuditReport, CatalogEntry, PriorityScore } from '../types';

describe('IntegrationEngine - Audit-Catalog Comparison', () => {
    const engine = new IntegrationEngine();

    const createMockAuditReport = (
        gameId: string,
        totalScore: number,
        isFlagged: boolean = false
    ): AuditReport => ({
        gameId,
        gameName: `Game ${gameId}`,
        auditDate: new Date().toISOString(),
        auditor: 'Test',
        scores: [
            { dimension: 'Educational_Value', score: 3, comments: '', issues: [] },
            { dimension: 'User_Experience', score: 3, comments: '', issues: [] },
            { dimension: 'Technical_Quality', score: 3, comments: '', issues: [] },
            { dimension: 'Accessibility', score: 3, comments: '', issues: [] },
            { dimension: 'Content_Completeness', score: 3, comments: '', issues: [] },
        ],
        totalScore,
        isFlaggedForImprovement: isFlagged,
        improvementRecommendations: [],
    });

    const createMockCatalogEntry = (
        gameId: string,
        priority?: string
    ): CatalogEntry => ({
        gameId,
        id: gameId,
        name: `Game ${gameId}`,
        description: 'Test game description',
        category: 'Math',
        subcategory: 'Addition',
        ageRange: '5-7',
        difficulty: 'Easy',
        estimatedTime: 30,
        requiredTechnologies: ['React'],
        successCriteria: ['Complete tasks'],
        educationalObjectives: ['Addition'],
        skillsDeveloped: ['Math'],
        isImplemented: true,
        implementationStatus: 'completed',
        priority: priority as 'P0' | 'P1' | 'P2' | 'P3',
        lastUpdated: new Date().toISOString(),
    });

    const createMockPriorityScore = (
        gameId: string,
        totalScore: number,
        priorityLevel: 'P0' | 'P1' | 'P2' | 'P3' = 'P1'
    ): PriorityScore => ({
        gameId,
        totalScore,
        educationalImpact: totalScore * 0.4,
        userDemand: totalScore * 0.3,
        implementationEffort: totalScore * 0.2,
        strategicAlignment: totalScore * 0.1,
        priorityLevel,
    });

    describe('compareAuditAndCatalog', () => {
        it('should return aligned when audit and catalog scores match', () => {
            const auditReports: Record<string, AuditReport> = {
                'game1': createMockAuditReport('game1', 18),
            };
            const catalogEntries: Record<string, CatalogEntry> = {
                'game1': createMockCatalogEntry('game1', 'P1'),
            };

            const results = engine.compareAuditAndCatalog(auditReports, catalogEntries);

            expect(results.length).toBe(1);
            expect(results[0].alignment).toBe('aligned');
            expect(results[0].recommendation).toBe('No action needed');
        });

        it('should detect mismatch when high audit score but low catalog priority', () => {
            const auditReports: Record<string, AuditReport> = {
                'game1': createMockAuditReport('game1', 20),
            };
            const catalogEntries: Record<string, CatalogEntry> = {
                'game1': createMockCatalogEntry('game1', 'P3'),
            };

            const results = engine.compareAuditAndCatalog(auditReports, catalogEntries);

            expect(results.length).toBe(1);
            expect(results[0].alignment).toBe('mismatch');
            expect(results[0].recommendation).toContain('Re-prioritize');
        });

        it('should detect low quality when low audit score but high catalog priority', () => {
            const auditReports: Record<string, AuditReport> = {
                'game1': createMockAuditReport('game1', 10),
            };
            const catalogEntries: Record<string, CatalogEntry> = {
                'game1': createMockCatalogEntry('game1', 'P0'),
            };

            const results = engine.compareAuditAndCatalog(auditReports, catalogEntries);

            expect(results.length).toBe(1);
            expect(results[0].alignment).toBe('low_quality');
            expect(results[0].recommendation).toContain('Investigate');
        });

        it('should handle games not in catalog', () => {
            const auditReports: Record<string, AuditReport> = {
                'game1': createMockAuditReport('game1', 18),
                'game2': createMockAuditReport('game2', 15),
            };
            const catalogEntries: Record<string, CatalogEntry> = {
                'game1': createMockCatalogEntry('game1', 'P1'),
            };

            const results = engine.compareAuditAndCatalog(auditReports, catalogEntries);

            expect(results.length).toBe(1);
            expect(results[0].gameId).toBe('game1');
        });

        it('should include reason with audit and catalog scores', () => {
            const auditReports: Record<string, AuditReport> = {
                'game1': createMockAuditReport('game1', 20),
            };
            const catalogEntries: Record<string, CatalogEntry> = {
                'game1': createMockCatalogEntry('game1', 'P3'),
            };

            const results = engine.compareAuditAndCatalog(auditReports, catalogEntries);

            expect(results[0].reason).toContain('20');
            expect(results[0].reason).toContain('low');
        });
    });

    describe('generateUnifiedPriorityList', () => {
        it('should generate unified priority list sorted by combined score', () => {
            const auditReports: Record<string, AuditReport> = {
                'game1': createMockAuditReport('game1', 20),
                'game2': createMockAuditReport('game2', 15),
            };
            const catalogEntries: Record<string, CatalogEntry> = {
                'game1': createMockCatalogEntry('game1', 'P1'),
                'game2': createMockCatalogEntry('game2', 'P1'),
            };
            const priorityScores: Record<string, PriorityScore> = {
                'game1': createMockPriorityScore('game1', 80, 'P1'),
                'game2': createMockPriorityScore('game2', 60, 'P2'),
            };

            const results = engine.generateUnifiedPriorityList(
                auditReports,
                catalogEntries,
                priorityScores
            );

            expect(results.length).toBe(2);
            expect(results[0].combinedScore).toBeGreaterThanOrEqual(results[1].combinedScore);
        });

        it('should include all required fields in unified entry', () => {
            const auditReports: Record<string, AuditReport> = {
                'game1': createMockAuditReport('game1', 18),
            };
            const catalogEntries: Record<string, CatalogEntry> = {
                'game1': createMockCatalogEntry('game1', 'P1'),
            };
            const priorityScores: Record<string, PriorityScore> = {
                'game1': createMockPriorityScore('game1', 75, 'P1'),
            };

            const results = engine.generateUnifiedPriorityList(
                auditReports,
                catalogEntries,
                priorityScores
            );

            expect(results[0]).toHaveProperty('gameId');
            expect(results[0]).toHaveProperty('gameName');
            expect(results[0]).toHaveProperty('combinedScore');
            expect(results[0]).toHaveProperty('auditScore');
            expect(results[0]).toHaveProperty('catalogPriority');
            expect(results[0]).toHaveProperty('priorityLevel');
        });
    });

    describe('calculateCombinedScore', () => {
        it('should calculate combined score with audit and priority weights', () => {
            const auditReport = createMockAuditReport('game1', 20);
            const priorityScore = createMockPriorityScore('game1', 80, 'P1');

            const combined = engine.calculateCombinedScore(auditReport, priorityScore);

            // Audit: 20/25 = 0.8, Priority: 80
            // Combined: 0.8 * 50 + 80 * 0.5 = 40 + 40 = 80
            expect(combined).toBe(80);
        });

        it('should handle maximum audit score', () => {
            const auditReport = createMockAuditReport('game1', 25);
            const priorityScore = createMockPriorityScore('game1', 100, 'P0');

            const combined = engine.calculateCombinedScore(auditReport, priorityScore);

            // Audit: 25/25 = 1.0, Priority: 100
            // Combined: 1.0 * 50 + 100 * 0.5 = 50 + 50 = 100
            expect(combined).toBe(100);
        });

        it('should handle minimum values', () => {
            const auditReport = createMockAuditReport('game1', 5);
            const priorityScore = createMockPriorityScore('game1', 0, 'P3');

            const combined = engine.calculateCombinedScore(auditReport, priorityScore);

            // Audit: 5/25 = 0.2, Priority: 0
            // Combined: 0.2 * 50 + 0 * 0.5 = 10
            expect(combined).toBe(10);
        });
    });

    describe('priorityToScore', () => {
        it('should convert P0 to 95', () => {
            expect(engine.priorityToScore('P0')).toBe(95);
        });

        it('should convert P1 to 80', () => {
            expect(engine.priorityToScore('P1')).toBe(80);
        });

        it('should convert P2 to 60', () => {
            expect(engine.priorityToScore('P2')).toBe(60);
        });

        it('should convert P3 to 30', () => {
            expect(engine.priorityToScore('P3')).toBe(30);
        });

        it('should return 50 for undefined priority', () => {
            expect(engine.priorityToScore(undefined)).toBe(50);
        });
    });

    describe('getRePrioritizationRecommendations', () => {
        it('should return recommendations for mismatched games', () => {
            const results = [
                {
                    gameId: 'game1',
                    auditScore: 20,
                    catalogPriority: 30,
                    alignment: 'mismatch' as const,
                    recommendation: 'Re-prioritize',
                    reason: 'High quality, low priority',
                },
                {
                    gameId: 'game2',
                    auditScore: 10,
                    catalogPriority: 95,
                    alignment: 'low_quality' as const,
                    recommendation: 'Investigate',
                    reason: 'Low quality, high priority',
                },
                {
                    gameId: 'game3',
                    auditScore: 18,
                    catalogPriority: 80,
                    alignment: 'aligned' as const,
                    recommendation: 'No action',
                    reason: 'Aligned',
                },
            ];

            const recommendations = engine.getRePrioritizationRecommendations(results);

            expect(recommendations.length).toBe(2);
            expect(recommendations[0]).toContain('game1');
            expect(recommendations[1]).toContain('game2');
        });
    });

    describe('generateVisualizationData', () => {
        it('should generate audit vs catalog visualization data', () => {
            const auditReports: Record<string, AuditReport> = {
                'game1': createMockAuditReport('game1', 20),
            };
            const catalogEntries: Record<string, CatalogEntry> = {
                'game1': createMockCatalogEntry('game1', 'P1'),
            };
            const priorityScores: Record<string, PriorityScore> = {
                'game1': createMockPriorityScore('game1', 80, 'P1'),
            };

            const data = engine.generateVisualizationData(auditReports, catalogEntries, priorityScores);

            expect(data.auditVsCatalog).toBeDefined();
            expect(data.auditVsCatalog.length).toBe(1);
            expect(data.auditVsCatalog[0]).toHaveProperty('x'); // auditScore
            expect(data.auditVsCatalog[0]).toHaveProperty('y'); // catalogPriority
            expect(data.auditVsCatalog[0]).toHaveProperty('gameId');
            expect(data.auditVsCatalog[0]).toHaveProperty('gameName');
        });

        it('should generate effort vs impact visualization data', () => {
            const auditReports: Record<string, AuditReport> = {
                'game1': createMockAuditReport('game1', 20),
            };
            const catalogEntries: Record<string, CatalogEntry> = {
                'game1': createMockCatalogEntry('game1', 'P1'),
            };
            const priorityScores: Record<string, PriorityScore> = {
                'game1': createMockPriorityScore('game1', 80, 'P1'),
            };

            const data = engine.generateVisualizationData(auditReports, catalogEntries, priorityScores);

            expect(data.effortVsImpact).toBeDefined();
            expect(data.effortVsImpact.length).toBe(1);
            expect(data.effortVsImpact[0]).toHaveProperty('x'); // implementationEffort
            expect(data.effortVsImpact[0]).toHaveProperty('y'); // educationalImpact
        });
    });
});

/**
 * Property 19: Integration module compares audit and catalog scores
 * Validates: Requirements 7.1
 * 
 * For any existing game audit, the Integration_Module SHALL compare audit scores 
 * to catalog priority scores and generate integration results.
 */
describe('Property 19: Integration module compares audit and catalog scores', () => {
    const engine = new IntegrationEngine();

    const createMockAuditReport = (gameId: string, totalScore: number): AuditReport => ({
        gameId,
        gameName: `Game ${gameId}`,
        auditDate: new Date().toISOString(),
        auditor: 'Test',
        scores: [
            { dimension: 'Educational_Value', score: 3, comments: '', issues: [] },
            { dimension: 'User_Experience', score: 3, comments: '', issues: [] },
            { dimension: 'Technical_Quality', score: 3, comments: '', issues: [] },
            { dimension: 'Accessibility', score: 3, comments: '', issues: [] },
            { dimension: 'Content_Completeness', score: 3, comments: '', issues: [] },
        ],
        totalScore,
        isFlaggedForImprovement: totalScore < 12,
        improvementRecommendations: [],
    });

    const createMockCatalogEntry = (gameId: string, priority?: string): CatalogEntry => ({
        gameId,
        id: gameId,
        name: `Game ${gameId}`,
        description: 'Test game',
        category: 'Math',
        subcategory: 'Addition',
        ageRange: '5-7',
        difficulty: 'Easy',
        estimatedTime: 30,
        requiredTechnologies: ['React'],
        successCriteria: ['Complete tasks'],
        educationalObjectives: ['Addition'],
        skillsDeveloped: ['Math'],
        isImplemented: true,
        implementationStatus: 'completed',
        priority: priority as 'P0' | 'P1' | 'P2' | 'P3',
        lastUpdated: new Date().toISOString(),
    });

    const createMockPriorityScore = (
        gameId: string,
        totalScore: number,
        priorityLevel: 'P0' | 'P1' | 'P2' | 'P3' = 'P1'
    ): PriorityScore => ({
        gameId,
        totalScore,
        educationalImpact: totalScore * 0.4,
        userDemand: totalScore * 0.3,
        implementationEffort: totalScore * 0.2,
        strategicAlignment: totalScore * 0.1,
        priorityLevel,
    });

    describe('compareAuditAndCatalog - Property-based tests', () => {
        it('should generate results for all games with both audit and catalog data', () => {
            fc.assert(
                fc.property(
                    fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }),
                    (gameIds) => {
                        const uniqueIds = [...new Set(gameIds)].filter(
                            (id) => id !== '__proto__' && id !== 'constructor' && id !== 'prototype'
                        );
                        if (uniqueIds.length === 0) {
                            return;
                        }

                        const auditReports: Record<string, AuditReport> = {};
                        const catalogEntries: Record<string, CatalogEntry> = {};
                        const priorities: ('P0' | 'P1' | 'P2' | 'P3')[] = ['P0', 'P1', 'P2', 'P3'];

                        for (const gameId of uniqueIds) {
                            const score = Math.floor(Math.random() * 21) + 5; // 5-25
                            const priorityIndex = Math.floor(Math.random() * 4);
                            auditReports[gameId] = createMockAuditReport(gameId, score);
                            catalogEntries[gameId] = createMockCatalogEntry(gameId, priorities[priorityIndex]);
                        }

                        const results = engine.compareAuditAndCatalog(auditReports, catalogEntries);

                        // Should have result for each game
                        expect(results.length).toBe(uniqueIds.length);

                        // Each result should have required fields
                        for (const result of results) {
                            expect(result.gameId).toBeDefined();
                            expect(typeof result.auditScore).toBe('number');
                            expect(typeof result.catalogPriority).toBe('number');
                            expect(['aligned', 'mismatch', 'low_quality']).toContain(result.alignment);
                        }
                    }
                ),
                { verbose: 0 }
            );
        });

        it('should detect mismatch for high audit scores with low catalog priority', () => {
            fc.assert(
                fc.property(
                    fc.nat({ max: 25 }),
                    (auditScore) => {
                        // Only test when audit score is high (>= 15)
                        if (auditScore < 15) return true;

                        const auditReports: Record<string, AuditReport> = {
                            'game1': createMockAuditReport('game1', auditScore),
                        };
                        const catalogEntries: Record<string, CatalogEntry> = {
                            'game1': createMockCatalogEntry('game1', 'P3'),
                        };

                        const results = engine.compareAuditAndCatalog(auditReports, catalogEntries);

                        // High audit + low catalog = mismatch
                        expect(results[0].alignment).toBe('mismatch');
                    }
                ),
                { verbose: 0 }
            );
        });

        it('should detect low quality for low audit scores with high catalog priority', () => {
            fc.assert(
                fc.property(
                    fc.nat({ max: 25 }),
                    (auditScore) => {
                        // Only test when audit score is low (< 12)
                        if (auditScore >= 12) return true;

                        const auditReports: Record<string, AuditReport> = {
                            'game1': createMockAuditReport('game1', auditScore),
                        };
                        const catalogEntries: Record<string, CatalogEntry> = {
                            'game1': createMockCatalogEntry('game1', 'P0'),
                        };

                        const results = engine.compareAuditAndCatalog(auditReports, catalogEntries);

                        // Low audit + high catalog = low_quality
                        expect(results[0].alignment).toBe('low_quality');
                    }
                ),
                { verbose: 0 }
            );
        });

        it('should return aligned for matching audit and catalog priority', () => {
            fc.assert(
                fc.property(
                    fc.nat({ max: 25 }),
                    (auditScore) => {
                        // Map audit score to expected priority level
                        let priority: 'P0' | 'P1' | 'P2' | 'P3';
                        if (auditScore >= 18) priority = 'P0';
                        else if (auditScore >= 14) priority = 'P1';
                        else if (auditScore >= 10) priority = 'P2';
                        else priority = 'P3';

                        const auditReports: Record<string, AuditReport> = {
                            'game1': createMockAuditReport('game1', auditScore),
                        };
                        const catalogEntries: Record<string, CatalogEntry> = {
                            'game1': createMockCatalogEntry('game1', priority),
                        };

                        const results = engine.compareAuditAndCatalog(auditReports, catalogEntries);

                        // Matching priority should be aligned
                        expect(results[0].alignment).toBe('aligned');
                    }
                ),
                { verbose: 0 }
            );
        });
    });

    describe('generateUnifiedPriorityList - Property-based tests', () => {
        it('should generate entries for all valid game combinations', () => {
            fc.assert(
                fc.property(
                    fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }),
                    (gameIds) => {
                        // Filter to unique game IDs (Records can't have duplicate keys)
                        const uniqueIds = [...new Set(gameIds)].filter(
                            (id) => id !== '__proto__' && id !== 'constructor' && id !== 'prototype'
                        );
                        if (uniqueIds.length === 0) {
                            return;
                        }
                        const auditReports: Record<string, AuditReport> = {};
                        const catalogEntries: Record<string, CatalogEntry> = {};
                        const priorityScores: Record<string, PriorityScore> = {};
                        const priorities: ('P0' | 'P1' | 'P2' | 'P3')[] = ['P0', 'P1', 'P2', 'P3'];

                        for (const gameId of uniqueIds) {
                            const score = Math.floor(Math.random() * 21) + 5;
                            const priorityIndex = Math.floor(Math.random() * 4);
                            const priorityLevel = priorities[priorityIndex];

                            auditReports[gameId] = createMockAuditReport(gameId, score);
                            catalogEntries[gameId] = createMockCatalogEntry(gameId, priorityLevel);
                            priorityScores[gameId] = createMockPriorityScore(gameId, score * 4, priorityLevel);
                        }

                        const results = engine.generateUnifiedPriorityList(
                            auditReports,
                            catalogEntries,
                            priorityScores
                        );

                        // Should have entry for each unique game ID
                        expect(results.length).toBe(uniqueIds.length);

                        // Should be sorted by combined score descending
                        for (let i = 1; i < results.length; i++) {
                            expect(results[i - 1].combinedScore).toBeGreaterThanOrEqual(results[i].combinedScore);
                        }
                    }
                ),
                { verbose: 0 }
            );
        });

        it('should calculate combined scores in valid range (0-100)', () => {
            fc.assert(
                fc.property(
                    fc.nat({ max: 25 }),
                    fc.nat({ max: 100 }),
                    (auditScore, priorityScore) => {
                        const auditReport = createMockAuditReport('game1', auditScore);
                        const priority = createMockPriorityScore('game1', priorityScore, 'P1');

                        const combined = engine.calculateCombinedScore(auditReport, priority);

                        expect(combined).toBeGreaterThanOrEqual(0);
                        expect(combined).toBeLessThanOrEqual(100);
                    }
                ),
                { verbose: 0 }
            );
        });
    });

    describe('generateVisualizationData - Property-based tests', () => {
        it('should generate visualization data for all valid games', () => {
            fc.assert(
                fc.property(
                    fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }),
                    (gameIds) => {
                        // Filter to unique game IDs (Records can't have duplicate keys)
                        const uniqueIds = [...new Set(gameIds)].filter(
                            (id) => id !== '__proto__' && id !== 'constructor' && id !== 'prototype'
                        );
                        if (uniqueIds.length === 0) {
                            return;
                        }
                        const auditReports: Record<string, AuditReport> = {};
                        const catalogEntries: Record<string, CatalogEntry> = {};
                        const priorityScores: Record<string, PriorityScore> = {};
                        const priorities: ('P0' | 'P1' | 'P2' | 'P3')[] = ['P0', 'P1', 'P2', 'P3'];

                        for (const gameId of uniqueIds) {
                            const auditScore = Math.floor(Math.random() * 21) + 5;
                            const priorityIndex = Math.floor(Math.random() * 4);
                            const priorityLevel = priorities[priorityIndex];

                            auditReports[gameId] = createMockAuditReport(gameId, auditScore);
                            catalogEntries[gameId] = createMockCatalogEntry(gameId, priorityLevel);
                            priorityScores[gameId] = createMockPriorityScore(gameId, auditScore * 4, priorityLevel);
                        }

                        const data = engine.generateVisualizationData(auditReports, catalogEntries, priorityScores);

                        // Should have data point for each unique game ID
                        expect(data.auditVsCatalog.length).toBe(uniqueIds.length);
                        expect(data.effortVsImpact.length).toBe(uniqueIds.length);

                        // Each data point should have required fields
                        for (const point of data.auditVsCatalog) {
                            expect(typeof point.x).toBe('number');
                            expect(typeof point.y).toBe('number');
                            expect(point.gameId).toBeDefined();
                        }
                    }
                ),
                { verbose: 0 }
            );
        });
    });
});

describe('IntegrationEngine - Edge Cases', () => {
    const engine = new IntegrationEngine();

    const createMockAuditReport = (gameId: string, totalScore: number): AuditReport => ({
        gameId,
        gameName: `Game ${gameId}`,
        auditDate: new Date().toISOString(),
        auditor: 'Test',
        scores: [
            { dimension: 'Educational_Value', score: 3, comments: '', issues: [] },
            { dimension: 'User_Experience', score: 3, comments: '', issues: [] },
            { dimension: 'Technical_Quality', score: 3, comments: '', issues: [] },
            { dimension: 'Accessibility', score: 3, comments: '', issues: [] },
            { dimension: 'Content_Completeness', score: 3, comments: '', issues: [] },
        ],
        totalScore,
        isFlaggedForImprovement: totalScore < 12,
        improvementRecommendations: [],
    });

    const createMockCatalogEntry = (gameId: string, priority?: string): CatalogEntry => ({
        gameId,
        id: gameId,
        name: `Game ${gameId}`,
        description: 'Test game',
        category: 'Math',
        subcategory: 'Addition',
        ageRange: '5-7',
        difficulty: 'Easy',
        estimatedTime: 30,
        requiredTechnologies: ['React'],
        successCriteria: ['Complete tasks'],
        educationalObjectives: ['Addition'],
        skillsDeveloped: ['Math'],
        isImplemented: true,
        implementationStatus: 'completed',
        priority: priority as 'P0' | 'P1' | 'P2' | 'P3',
        lastUpdated: new Date().toISOString(),
    });

    const createMockPriorityScore = (
        gameId: string,
        totalScore: number,
        priorityLevel: 'P0' | 'P1' | 'P2' | 'P3' = 'P1'
    ): PriorityScore => ({
        gameId,
        totalScore,
        educationalImpact: totalScore * 0.4,
        userDemand: totalScore * 0.3,
        implementationEffort: totalScore * 0.2,
        strategicAlignment: totalScore * 0.1,
        priorityLevel,
    });

    it('should handle empty audit reports', () => {
        const results = engine.compareAuditAndCatalog({}, {});
        expect(results.length).toBe(0);
    });

    it('should handle empty unified priority list', () => {
        const results = engine.generateUnifiedPriorityList({}, {}, {});
        expect(results.length).toBe(0);
    });

    it('should handle empty visualization data', () => {
        const data = engine.generateVisualizationData({}, {}, {});
        expect(data.auditVsCatalog.length).toBe(0);
        expect(data.effortVsImpact.length).toBe(0);
    });

    it('should handle boundary audit score of 25 (maximum)', () => {
        const auditReports: Record<string, AuditReport> = {
            'game1': createMockAuditReport('game1', 25),
        };
        const catalogEntries: Record<string, CatalogEntry> = {
            'game1': createMockCatalogEntry('game1', 'P3'),
        };

        const results = engine.compareAuditAndCatalog(auditReports, catalogEntries);

        expect(results[0].auditScore).toBe(25);
        expect(results[0].alignment).toBe('mismatch');
    });

    it('should handle boundary audit score of 5 (minimum)', () => {
        const auditReports: Record<string, AuditReport> = {
            'game1': createMockAuditReport('game1', 5),
        };
        const catalogEntries: Record<string, CatalogEntry> = {
            'game1': createMockCatalogEntry('game1', 'P0'),
        };

        const results = engine.compareAuditAndCatalog(auditReports, catalogEntries);

        expect(results[0].auditScore).toBe(5);
        expect(results[0].alignment).toBe('low_quality');
    });

    it('should handle boundary catalog priority P0', () => {
        const auditReports: Record<string, AuditReport> = {
            'game1': createMockAuditReport('game1', 10),
        };
        const catalogEntries: Record<string, CatalogEntry> = {
            'game1': createMockCatalogEntry('game1', 'P0'),
        };

        const results = engine.compareAuditAndCatalog(auditReports, catalogEntries);

        expect(results[0].catalogPriority).toBe(95);
        expect(results[0].alignment).toBe('low_quality');
    });

    it('should handle boundary catalog priority P3', () => {
        const auditReports: Record<string, AuditReport> = {
            'game1': createMockAuditReport('game1', 20),
        };
        const catalogEntries: Record<string, CatalogEntry> = {
            'game1': createMockCatalogEntry('game1', 'P3'),
        };

        const results = engine.compareAuditAndCatalog(auditReports, catalogEntries);

        expect(results[0].catalogPriority).toBe(30);
        expect(results[0].alignment).toBe('mismatch');
    });

    it('should correctly calculate combined score at boundaries', () => {
        // Maximum: audit 25, priority 100
        const maxAudit = createMockAuditReport('game1', 25);
        const maxPriority = createMockPriorityScore('game1', 100, 'P0');
        expect(engine.calculateCombinedScore(maxAudit, maxPriority)).toBe(100);

        // Minimum: audit 5, priority 0
        const minAudit = createMockAuditReport('game2', 5);
        const minPriority = createMockPriorityScore('game2', 0, 'P3');
        expect(engine.calculateCombinedScore(minAudit, minPriority)).toBe(10);
    });
});
