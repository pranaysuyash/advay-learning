// Implementation Report Tests for Game Quality System

import { describe, it, expect, beforeEach } from 'vitest';
import { ImplementationReport, createImplementationReport, DEFAULT_IMPLEMENTATION_REPORT_CONFIG } from './implementationReport';
import type { AuditReport, Game, PriorityScore } from '../types';

describe('ImplementationReport', () => {
    let report: ImplementationReport;
    const mockGame: Game = {
        id: 'game-001',
        name: 'Math Blaster',
        description: 'A math learning game',
        category: 'Educational',
        ageRange: '6-10',
        difficulty: 'Medium',
        estimatedTime: 30,
        requiredTechnologies: ['React', 'TypeScript'],
        successCriteria: ['Complete 10 problems', 'Score 80% or higher'],
        isImplemented: true,
        implementationStatus: 'completed',
        educationalObjectives: ['Addition', 'Subtraction'],
        lastUpdated: new Date().toISOString(),
    };

    const mockPreAudit: AuditReport = {
        gameId: 'game-001',
        gameName: 'Math Blaster',
        auditDate: '2024-01-01',
        auditor: 'Initial Auditor',
        scores: [
            { dimension: 'Educational_Value', score: 3, comments: 'Acceptable', issues: [] },
            { dimension: 'User_Experience', score: 2, comments: 'Needs improvement', issues: ['UI issues'] },
            { dimension: 'Technical_Quality', score: 3, comments: 'Acceptable', issues: [] },
            { dimension: 'Accessibility', score: 2, comments: 'Needs improvement', issues: ['Contrast issues'] },
            { dimension: 'Content_Completeness', score: 3, comments: 'Acceptable', issues: [] },
        ],
        totalScore: 13,
        isFlaggedForImprovement: true,
        improvementRecommendations: ['Improve UI', 'Fix accessibility'],
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

    const mockPriorityScore: PriorityScore = {
        gameId: 'game-001',
        totalScore: 85,
        educationalImpact: 80,
        userDemand: 75,
        implementationEffort: 60,
        strategicAlignment: 90,
        priorityLevel: 'P1',
    };

    beforeEach(() => {
        report = new ImplementationReport();
    });

    describe('Constructor', () => {
        it('should create with default config', () => {
            const r = new ImplementationReport();
            expect(r).toBeDefined();
        });

        it('should create with custom config', () => {
            const r = new ImplementationReport({
                includeBeforeAfterComparisons: false,
                includeKeyDecisions: true,
            });
            expect(r).toBeDefined();
        });
    });

    describe('generateReport', () => {
        it('should generate a complete implementation report', () => {
            report.addKeyDecision({
                title: 'Technology Stack',
                description: 'Selected React with TypeScript',
                rationale: 'Type safety and component reusability',
                alternatives: ['Vanilla JS', 'Vue'],
                selectedOption: 'React with TypeScript',
                impact: 'high',
            });

            report.addLessonLearned({
                category: 'technical',
                description: 'State management complexity',
                recommendation: 'Use simpler state management for small games',
                priority: 'medium',
            });

            report.addNextStep({
                description: 'Add multiplayer support',
                priority: 'low',
                estimatedEffort: 40,
                dependencies: ['game-002'],
            });

            const markdown = report.generateReport(mockGame, mockPreAudit, mockPostAudit, mockPriorityScore);

            expect(markdown).toContain('# Implementation Report: Math Blaster');
            expect(markdown).toContain('**Game ID**: game-001');
            expect(markdown).toContain('Before/After Comparisons');
            expect(markdown).toContain('Key Decisions');
            expect(markdown).toContain('Lessons Learned');
            expect(markdown).toContain('Next Steps');
            expect(markdown).toContain('Priority Information');
        });

        it('should handle null preAudit', () => {
            const markdown = report.generateReport(mockGame, null, mockPostAudit, mockPriorityScore);

            expect(markdown).toContain('Post-Implementation Audit Scores');
            expect(markdown).toContain('**Total Score**: 20/25');
        });

        it('should include educational objectives', () => {
            const markdown = report.generateReport(mockGame, mockPreAudit, mockPostAudit, mockPriorityScore);

            expect(markdown).toContain('Addition');
            expect(markdown).toContain('Subtraction');
        });
    });

    describe('addKeyDecision', () => {
        it('should add a key decision', () => {
            report.addKeyDecision({
                title: 'UI Framework',
                description: 'Chose Material-UI',
                rationale: 'Consistent design language',
                alternatives: ['Bootstrap', 'Tailwind'],
                selectedOption: 'Material-UI',
                impact: 'medium',
            });

            const decisions = report.getKeyDecisions();
            expect(decisions.length).toBe(1);
            expect(decisions[0].title).toBe('UI Framework');
            expect(decisions[0].id).toBeDefined();
            expect(decisions[0].timestamp).toBeDefined();
        });
    });

    describe('addLessonLearned', () => {
        it('should add a lesson learned', () => {
            report.addLessonLearned({
                category: 'testing',
                description: 'Unit tests caught 15 bugs',
                recommendation: 'Increase test coverage to 80%',
                priority: 'high',
            });

            const lessons = report.getLessonsLearned();
            expect(lessons.length).toBe(1);
            expect(lessons[0].category).toBe('testing');
        });
    });

    describe('addNextStep', () => {
        it('should add a next step', () => {
            report.addNextStep({
                description: 'Add sound effects',
                priority: 'medium',
                estimatedEffort: 8,
                dependencies: [],
            });

            const steps = report.getNextSteps();
            expect(steps.length).toBe(1);
            expect(steps[0].description).toBe('Add sound effects');
        });

        it('should add next step with dependencies', () => {
            report.addNextStep({
                description: 'Add leaderboard',
                priority: 'high',
                estimatedEffort: 16,
                dependencies: ['game-003', 'game-004'],
            });

            const steps = report.getNextSteps();
            expect(steps[0].dependencies).toEqual(['game-003', 'game-004']);
        });
    });

    describe('calculateComparison', () => {
        it('should calculate comparison correctly', () => {
            const comparison = report.calculateComparison(10, 15);

            expect(comparison.before).toBe(10);
            expect(comparison.after).toBe(15);
            expect(comparison.absoluteChange).toBe(5);
            expect(comparison.percentageChange).toBe(50);
        });

        it('should handle negative change', () => {
            const comparison = report.calculateComparison(20, 15);

            expect(comparison.absoluteChange).toBe(-5);
            expect(comparison.percentageChange).toBe(-25);
        });

        it('should handle zero before value', () => {
            const comparison = report.calculateComparison(0, 20);

            expect(comparison.absoluteChange).toBe(20);
            expect(comparison.percentageChange).toBe(0);
        });
    });

    describe('determineStatisticalSignificance', () => {
        it('should return insufficient for small changes', () => {
            expect(report.determineStatisticalSignificance(3)).toBe('insufficient');
            expect(report.determineStatisticalSignificance(4)).toBe('insufficient');
        });

        it('should return low for medium-small changes', () => {
            expect(report.determineStatisticalSignificance(8)).toBe('low');
            expect(report.determineStatisticalSignificance(14)).toBe('low');
        });

        it('should return medium for medium changes', () => {
            expect(report.determineStatisticalSignificance(20)).toBe('medium');
            expect(report.determineStatisticalSignificance(25)).toBe('medium');
        });

        it('should return high for large changes', () => {
            expect(report.determineStatisticalSignificance(35)).toBe('high');
            expect(report.determineStatisticalSignificance(50)).toBe('high');
        });
    });

    describe('getKeyDecisions', () => {
        it('should return a copy of key decisions', () => {
            report.addKeyDecision({
                title: 'Test',
                description: 'Test',
                rationale: 'Test',
                alternatives: [],
                selectedOption: 'Test',
                impact: 'low',
            });

            const decisions1 = report.getKeyDecisions();
            const decisions2 = report.getKeyDecisions();

            expect(decisions1).not.toBe(decisions2);
            expect(decisions1).toEqual(decisions2);
        });
    });

    describe('getLessonsLearned', () => {
        it('should return a copy of lessons learned', () => {
            report.addLessonLearned({
                category: 'other',
                description: 'Test',
                recommendation: 'Test',
                priority: 'low',
            });

            const lessons1 = report.getLessonsLearned();
            const lessons2 = report.getLessonsLearned();

            expect(lessons1).not.toBe(lessons2);
            expect(lessons1).toEqual(lessons2);
        });
    });

    describe('getNextSteps', () => {
        it('should return a copy of next steps', () => {
            report.addNextStep({
                description: 'Test',
                priority: 'low',
                estimatedEffort: 1,
                dependencies: [],
            });

            const steps1 = report.getNextSteps();
            const steps2 = report.getNextSteps();

            expect(steps1).not.toBe(steps2);
            expect(steps1).toEqual(steps2);
        });
    });

    describe('clear', () => {
        it('should clear all data', () => {
            report.addKeyDecision({
                title: 'Test',
                description: 'Test',
                rationale: 'Test',
                alternatives: [],
                selectedOption: 'Test',
                impact: 'low',
            });
            report.addLessonLearned({
                category: 'other',
                description: 'Test',
                recommendation: 'Test',
                priority: 'low',
            });
            report.addNextStep({
                description: 'Test',
                priority: 'low',
                estimatedEffort: 1,
                dependencies: [],
            });

            report.clear();

            expect(report.getKeyDecisions().length).toBe(0);
            expect(report.getLessonsLearned().length).toBe(0);
            expect(report.getNextSteps().length).toBe(0);
        });
    });

    describe('factory function', () => {
        it('should create ImplementationReport instance', () => {
            const r = createImplementationReport();
            expect(r).toBeInstanceOf(ImplementationReport);
        });
    });
});

describe('ImplementationReport - Property Tests', () => {
    let report: ImplementationReport;

    beforeEach(() => {
        report = new ImplementationReport();
    });

    it('should always generate reports with valid structure', () => {
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

        const markdown = report.generateReport(game, preAudit, postAudit, priorityScore);

        expect(markdown).toContain('Implementation Report');
        expect(markdown).toContain('Test Game');
        expect(markdown).toContain('Priority Information');
    });

    it('should calculate percentage change correctly for any values', () => {
        const testCases = [
            { before: 10, after: 20, expectedChange: 100 },
            { before: 50, after: 75, expectedChange: 50 },
            { before: 100, after: 100, expectedChange: 0 },
            { before: 20, after: 10, expectedChange: -50 },
        ];

        for (const { before, after, expectedChange } of testCases) {
            const comparison = report.calculateComparison(before, after);
            expect(comparison.percentageChange).toBe(expectedChange);
        }
    });
});