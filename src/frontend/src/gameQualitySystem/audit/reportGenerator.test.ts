// Unit tests for Report Generator

import { describe, it, expect } from 'vitest';
import { ReportGenerator } from './reportGenerator';
import { AuditReport, AuditScore } from '../types/index';

describe('ReportGenerator', () => {
    const generator = new ReportGenerator();

    const createMockAuditReport = (scores: Partial<Record<string, number>>): AuditReport => {
        const defaultScores: AuditScore[] = [
            {
                dimension: 'Educational_Value',
                score: scores.Educational_Value || 3,
                comments: 'Test comment',
                issues: scores.Educational_Value && scores.Educational_Value < 3 ? ['Test issue'] : [],
            },
            {
                dimension: 'User_Experience',
                score: scores.User_Experience || 3,
                comments: 'Test comment',
                issues: scores.User_Experience && scores.User_Experience < 3 ? ['Test issue'] : [],
            },
            {
                dimension: 'Technical_Quality',
                score: scores.Technical_Quality || 3,
                comments: 'Test comment',
                issues: scores.Technical_Quality && scores.Technical_Quality < 3 ? ['Test issue'] : [],
            },
            {
                dimension: 'Accessibility',
                score: scores.Accessibility || 3,
                comments: 'Test comment',
                issues: scores.Accessibility && scores.Accessibility < 3 ? ['Test issue'] : [],
            },
            {
                dimension: 'Content_Completeness',
                score: scores.Content_Completeness || 3,
                comments: 'Test comment',
                issues: scores.Content_Completeness && scores.Content_Completeness < 3 ? ['Test issue'] : [],
            },
        ];

        const totalScore = defaultScores.reduce((sum, s) => sum + s.score, 0);
        const isFlaggedForImprovement = totalScore < 12 || defaultScores.some(s => s.score < 3);

        return {
            gameId: 'test-game-1',
            gameName: 'Test Game',
            auditDate: new Date().toISOString(),
            auditor: 'Test Auditor',
            scores: defaultScores,
            totalScore,
            isFlaggedForImprovement,
            improvementRecommendations: [],
        };
    };

    describe('generateDetailedReport', () => {
        it('should generate a detailed report with all required fields', () => {
            const auditReport = createMockAuditReport({ Educational_Value: 2 });
            const detailedReport = generator.generateDetailedReport(auditReport);

            expect(detailedReport).toHaveProperty('detailedRecommendations');
            expect(detailedReport).toHaveProperty('executiveSummary');
            expect(detailedReport).toHaveProperty('priorityActions');
            expect(detailedReport).toHaveProperty('estimatedImprovementTime');
            expect(detailedReport.gameId).toBe('test-game-1');
            expect(detailedReport.gameName).toBe('Test Game');
        });

        it('should generate recommendations for dimensions scoring below 5', () => {
            const auditReport = createMockAuditReport({
                Educational_Value: 2,
                User_Experience: 3,
                Technical_Quality: 4,
            });
            const detailedReport = generator.generateDetailedReport(auditReport);

            // Should have recommendations for scores 2, 3, and 4 (all below 5)
            expect(detailedReport.detailedRecommendations.length).toBeGreaterThan(0);
            expect(detailedReport.detailedRecommendations.length).toBeLessThanOrEqual(5);
        });

        it('should not generate recommendations for dimensions scoring 5', () => {
            const auditReport = createMockAuditReport({
                Educational_Value: 5,
                User_Experience: 5,
                Technical_Quality: 5,
                Accessibility: 5,
                Content_Completeness: 5,
            });
            const detailedReport = generator.generateDetailedReport(auditReport);

            expect(detailedReport.detailedRecommendations.length).toBe(0);
        });

        it('should sort recommendations by priority', () => {
            const auditReport = createMockAuditReport({
                Educational_Value: 1, // critical
                User_Experience: 2,   // high
                Technical_Quality: 3, // medium
                Accessibility: 4,     // low
            });
            const detailedReport = generator.generateDetailedReport(auditReport);

            const priorities = detailedReport.detailedRecommendations.map(r => r.priority);

            // Check that critical comes before high
            const criticalIndex = priorities.indexOf('critical');
            const highIndex = priorities.indexOf('high');
            if (criticalIndex !== -1 && highIndex !== -1) {
                expect(criticalIndex).toBeLessThan(highIndex);
            }
        });
    });

    describe('detailed recommendations', () => {
        it('should include dimension, scores, priority, and action items', () => {
            const auditReport = createMockAuditReport({ Educational_Value: 2 });
            const detailedReport = generator.generateDetailedReport(auditReport);

            const recommendation = detailedReport.detailedRecommendations.find(
                r => r.dimension === 'Educational_Value'
            );

            expect(recommendation).toBeDefined();
            expect(recommendation?.currentScore).toBe(2);
            expect(recommendation?.targetScore).toBe(5);
            expect(recommendation?.priority).toBe('high');
            expect(recommendation?.actionItems).toBeInstanceOf(Array);
            expect(recommendation?.actionItems.length).toBeGreaterThan(0);
            expect(recommendation?.estimatedEffort).toBeDefined();
            expect(recommendation?.expectedImpact).toBeDefined();
        });

        it('should assign critical priority to score 1', () => {
            const auditReport = createMockAuditReport({ Technical_Quality: 1 });
            const detailedReport = generator.generateDetailedReport(auditReport);

            const recommendation = detailedReport.detailedRecommendations.find(
                r => r.dimension === 'Technical_Quality'
            );

            expect(recommendation?.priority).toBe('critical');
        });

        it('should assign high priority to score 2', () => {
            const auditReport = createMockAuditReport({ Accessibility: 2 });
            const detailedReport = generator.generateDetailedReport(auditReport);

            const recommendation = detailedReport.detailedRecommendations.find(
                r => r.dimension === 'Accessibility'
            );

            expect(recommendation?.priority).toBe('high');
        });

        it('should assign medium priority to score 3', () => {
            const auditReport = createMockAuditReport({ User_Experience: 3 });
            const detailedReport = generator.generateDetailedReport(auditReport);

            const recommendation = detailedReport.detailedRecommendations.find(
                r => r.dimension === 'User_Experience'
            );

            expect(recommendation?.priority).toBe('medium');
        });

        it('should assign low priority to score 4', () => {
            const auditReport = createMockAuditReport({ Content_Completeness: 4 });
            const detailedReport = generator.generateDetailedReport(auditReport);

            const recommendation = detailedReport.detailedRecommendations.find(
                r => r.dimension === 'Content_Completeness'
            );

            expect(recommendation?.priority).toBe('low');
        });
    });

    describe('action items generation', () => {
        it('should generate specific action items for Educational_Value', () => {
            const auditReport = createMockAuditReport({ Educational_Value: 2 });
            const detailedReport = generator.generateDetailedReport(auditReport);

            const recommendation = detailedReport.detailedRecommendations.find(
                r => r.dimension === 'Educational_Value'
            );

            expect(recommendation?.actionItems.length).toBeGreaterThan(0);
            expect(recommendation?.actionItems.some(item =>
                item.toLowerCase().includes('educational') ||
                item.toLowerCase().includes('objective') ||
                item.toLowerCase().includes('skill')
            )).toBe(true);
        });

        it('should generate specific action items for User_Experience', () => {
            const auditReport = createMockAuditReport({ User_Experience: 2 });
            const detailedReport = generator.generateDetailedReport(auditReport);

            const recommendation = detailedReport.detailedRecommendations.find(
                r => r.dimension === 'User_Experience'
            );

            expect(recommendation?.actionItems.length).toBeGreaterThan(0);
            expect(recommendation?.actionItems.some(item =>
                item.toLowerCase().includes('user') ||
                item.toLowerCase().includes('navigation') ||
                item.toLowerCase().includes('testing')
            )).toBe(true);
        });

        it('should generate specific action items for Technical_Quality', () => {
            const auditReport = createMockAuditReport({ Technical_Quality: 1 });
            const detailedReport = generator.generateDetailedReport(auditReport);

            const recommendation = detailedReport.detailedRecommendations.find(
                r => r.dimension === 'Technical_Quality'
            );

            expect(recommendation?.actionItems.length).toBeGreaterThan(0);
            expect(recommendation?.actionItems.some(item =>
                item.toLowerCase().includes('bug') ||
                item.toLowerCase().includes('performance') ||
                item.toLowerCase().includes('crash')
            )).toBe(true);
        });

        it('should generate specific action items for Accessibility', () => {
            const auditReport = createMockAuditReport({ Accessibility: 2 });
            const detailedReport = generator.generateDetailedReport(auditReport);

            const recommendation = detailedReport.detailedRecommendations.find(
                r => r.dimension === 'Accessibility'
            );

            expect(recommendation?.actionItems.length).toBeGreaterThan(0);
            expect(recommendation?.actionItems.some(item =>
                item.toLowerCase().includes('accessibility') ||
                item.toLowerCase().includes('wcag') ||
                item.toLowerCase().includes('contrast') ||
                item.toLowerCase().includes('keyboard') ||
                item.toLowerCase().includes('screen reader')
            )).toBe(true);
        });

        it('should generate specific action items for Content_Completeness', () => {
            const auditReport = createMockAuditReport({ Content_Completeness: 2 });
            const detailedReport = generator.generateDetailedReport(auditReport);

            const recommendation = detailedReport.detailedRecommendations.find(
                r => r.dimension === 'Content_Completeness'
            );

            expect(recommendation?.actionItems.length).toBeGreaterThan(0);
            expect(recommendation?.actionItems.some(item =>
                item.toLowerCase().includes('content') ||
                item.toLowerCase().includes('variation') ||
                item.toLowerCase().includes('level')
            )).toBe(true);
        });
    });

    describe('executive summary', () => {
        it('should include game name and overall score', () => {
            const auditReport = createMockAuditReport({ Educational_Value: 3 });
            const detailedReport = generator.generateDetailedReport(auditReport);

            expect(detailedReport.executiveSummary).toContain('Test Game');
            expect(detailedReport.executiveSummary).toContain('/25');
        });

        it('should indicate flagged status for low scores', () => {
            const auditReport = createMockAuditReport({ Educational_Value: 1 });
            const detailedReport = generator.generateDetailedReport(auditReport);

            expect(detailedReport.executiveSummary).toContain('FLAGGED FOR IMPROVEMENT');
        });

        it('should list dimension scores', () => {
            const auditReport = createMockAuditReport({ Educational_Value: 2 });
            const detailedReport = generator.generateDetailedReport(auditReport);

            expect(detailedReport.executiveSummary).toContain('Educational_Value');
            expect(detailedReport.executiveSummary).toContain('User_Experience');
            expect(detailedReport.executiveSummary).toContain('Technical_Quality');
            expect(detailedReport.executiveSummary).toContain('Accessibility');
            expect(detailedReport.executiveSummary).toContain('Content_Completeness');
        });

        it('should include recommendation counts', () => {
            const auditReport = createMockAuditReport({
                Educational_Value: 1,
                User_Experience: 2,
            });
            const detailedReport = generator.generateDetailedReport(auditReport);

            expect(detailedReport.executiveSummary).toContain('Critical');
            expect(detailedReport.executiveSummary).toContain('High');
        });
    });

    describe('priority actions', () => {
        it('should include critical and high priority actions first', () => {
            const auditReport = createMockAuditReport({
                Educational_Value: 1, // critical
                User_Experience: 2,   // high
                Technical_Quality: 3, // medium
            });
            const detailedReport = generator.generateDetailedReport(auditReport);

            expect(detailedReport.priorityActions.length).toBeGreaterThan(0);

            // First action should be critical or high
            const firstAction = detailedReport.priorityActions[0];
            expect(firstAction).toMatch(/\[CRITICAL\]|\[HIGH\]/);
        });

        it('should format actions with priority level and dimension', () => {
            const auditReport = createMockAuditReport({ Educational_Value: 1 });
            const detailedReport = generator.generateDetailedReport(auditReport);

            const action = detailedReport.priorityActions[0];
            expect(action).toMatch(/\[CRITICAL\]/);
            expect(action).toContain('Educational_Value');
        });
    });

    describe('estimated improvement time', () => {
        it('should estimate short time for minimal improvements', () => {
            const auditReport = createMockAuditReport({
                Educational_Value: 5,
                User_Experience: 5,
                Technical_Quality: 5,
                Accessibility: 5,
                Content_Completeness: 4  // Only one dimension needs improvement
            });
            const detailedReport = generator.generateDetailedReport(auditReport);

            // With only one low-priority improvement, should be quick
            expect(['1 day', '1 week']).toContain(detailedReport.estimatedImprovementTime);
        });

        it('should estimate longer time for multiple high-effort improvements', () => {
            const auditReport = createMockAuditReport({
                Educational_Value: 1,
                User_Experience: 1,
                Technical_Quality: 1,
                Accessibility: 1,
                Content_Completeness: 1,
            });
            const detailedReport = generator.generateDetailedReport(auditReport);

            // With 5 dimensions at score 1, should require significant time
            expect(['1 month', '2+ months']).toContain(detailedReport.estimatedImprovementTime);
        });
    });

    describe('generateTextReport', () => {
        it('should generate a formatted text report', () => {
            const auditReport = createMockAuditReport({ Educational_Value: 2 });
            const detailedReport = generator.generateDetailedReport(auditReport);
            const textReport = generator.generateTextReport(detailedReport);

            expect(textReport).toContain('GAME QUALITY AUDIT REPORT');
            expect(textReport).toContain('Test Game');
            expect(textReport).toContain('PRIORITY ACTIONS');
            expect(textReport).toContain('DETAILED RECOMMENDATIONS');
            expect(textReport).toContain('Estimated Improvement Time');
        });

        it('should include all recommendations in text format', () => {
            const auditReport = createMockAuditReport({
                Educational_Value: 2,
                User_Experience: 3,
            });
            const detailedReport = generator.generateDetailedReport(auditReport);
            const textReport = generator.generateTextReport(detailedReport);

            expect(textReport).toContain('Educational_Value');
            expect(textReport).toContain('User_Experience');
            expect(textReport).toContain('Action Items:');
        });

        it('should format priority, effort, and impact information', () => {
            const auditReport = createMockAuditReport({ Technical_Quality: 1 });
            const detailedReport = generator.generateDetailedReport(auditReport);
            const textReport = generator.generateTextReport(detailedReport);

            expect(textReport).toContain('Priority:');
            expect(textReport).toContain('Effort:');
            expect(textReport).toContain('Impact:');
        });
    });

    describe('effort estimation', () => {
        it('should estimate higher effort for Accessibility improvements', () => {
            const auditReport = createMockAuditReport({ Accessibility: 1 });
            const detailedReport = generator.generateDetailedReport(auditReport);

            const recommendation = detailedReport.detailedRecommendations.find(
                r => r.dimension === 'Accessibility'
            );

            // Score 1 to 5 for Accessibility should be high effort
            expect(recommendation?.estimatedEffort).toBe('high');
        });

        it('should estimate higher effort for Technical_Quality improvements', () => {
            const auditReport = createMockAuditReport({ Technical_Quality: 1 });
            const detailedReport = generator.generateDetailedReport(auditReport);

            const recommendation = detailedReport.detailedRecommendations.find(
                r => r.dimension === 'Technical_Quality'
            );

            // Score 1 to 5 for Technical_Quality should be high effort
            expect(recommendation?.estimatedEffort).toBe('high');
        });
    });

    describe('impact estimation', () => {
        it('should estimate high impact for critical scores', () => {
            const auditReport = createMockAuditReport({ Educational_Value: 1 });
            const detailedReport = generator.generateDetailedReport(auditReport);

            const recommendation = detailedReport.detailedRecommendations.find(
                r => r.dimension === 'Educational_Value'
            );

            expect(recommendation?.expectedImpact).toBe('high');
        });

        it('should estimate high impact for Educational_Value improvements', () => {
            const auditReport = createMockAuditReport({ Educational_Value: 2 });
            const detailedReport = generator.generateDetailedReport(auditReport);

            const recommendation = detailedReport.detailedRecommendations.find(
                r => r.dimension === 'Educational_Value'
            );

            expect(recommendation?.expectedImpact).toBe('high');
        });

        it('should estimate high impact for User_Experience improvements', () => {
            const auditReport = createMockAuditReport({ User_Experience: 2 });
            const detailedReport = generator.generateDetailedReport(auditReport);

            const recommendation = detailedReport.detailedRecommendations.find(
                r => r.dimension === 'User_Experience'
            );

            expect(recommendation?.expectedImpact).toBe('high');
        });
    });

    describe('edge cases', () => {
        it('should handle game with all perfect scores', () => {
            const auditReport = createMockAuditReport({
                Educational_Value: 5,
                User_Experience: 5,
                Technical_Quality: 5,
                Accessibility: 5,
                Content_Completeness: 5,
            });
            const detailedReport = generator.generateDetailedReport(auditReport);

            expect(detailedReport.detailedRecommendations.length).toBe(0);
            expect(detailedReport.priorityActions.length).toBe(0);
            expect(detailedReport.estimatedImprovementTime).toBe('1 day');
        });

        it('should handle game with all failing scores', () => {
            const auditReport = createMockAuditReport({
                Educational_Value: 1,
                User_Experience: 1,
                Technical_Quality: 1,
                Accessibility: 1,
                Content_Completeness: 1,
            });
            const detailedReport = generator.generateDetailedReport(auditReport);

            expect(detailedReport.detailedRecommendations.length).toBe(5);
            expect(detailedReport.priorityActions.length).toBeGreaterThan(0);
            expect(detailedReport.executiveSummary).toContain('FLAGGED FOR IMPROVEMENT');
        });

        it('should handle mixed scores appropriately', () => {
            const auditReport = createMockAuditReport({
                Educational_Value: 5,
                User_Experience: 1,
                Technical_Quality: 3,
                Accessibility: 2,
                Content_Completeness: 4,
            });
            const detailedReport = generator.generateDetailedReport(auditReport);

            // Should have recommendations for scores 1, 2, 3, and 4 (not 5)
            expect(detailedReport.detailedRecommendations.length).toBe(4);

            // Should prioritize the critical (1) and high (2) scores
            const priorities = detailedReport.detailedRecommendations.map(r => r.priority);
            expect(priorities).toContain('critical');
            expect(priorities).toContain('high');
        });
    });
});
