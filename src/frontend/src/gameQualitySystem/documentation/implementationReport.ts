// Implementation Report Generation Module for Game Quality System

import type { AuditReport, Game, PriorityScore } from '../types';

/**
 * Represents a before/after comparison for a metric
 */
export interface BeforeAfterComparison {
    before: number;
    after: number;
    absoluteChange: number;
    percentageChange: number;
}

/**
 * Represents key decisions made during implementation
 */
export interface KeyDecision {
    id: string;
    title: string;
    description: string;
    rationale: string;
    alternatives: string[];
    selectedOption: string;
    impact: 'high' | 'medium' | 'low';
    timestamp: string;
}

/**
 * Represents lessons learned during implementation
 */
export interface LessonLearned {
    id: string;
    category: 'technical' | 'process' | 'design' | 'testing' | 'other';
    description: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
    timestamp: string;
}

/**
 * Represents next steps for future work
 */
export interface NextStep {
    id: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimatedEffort: number; // in hours
    dependencies: string[];
    targetDate?: string;
}

/**
 * Configuration for implementation report generation
 */
export interface ImplementationReportConfig {
    includeBeforeAfterComparisons: boolean;
    includeKeyDecisions: boolean;
    includeLessonsLearned: boolean;
    includeNextSteps: boolean;
    statisticalSignificanceThreshold: number;
}

/**
 * Default configuration for implementation report generation
 */
export const DEFAULT_IMPLEMENTATION_REPORT_CONFIG: ImplementationReportConfig = {
    includeBeforeAfterComparisons: true,
    includeKeyDecisions: true,
    includeLessonsLearned: true,
    includeNextSteps: true,
    statisticalSignificanceThreshold: 15,
};

/**
 * ImplementationReport class for generating implementation reports
 * Requirement 8.2: Generate Implementation_Report with Before_After_Comparisons,
 * Key_Decisions, Lessons_Learned, Next_Steps
 */
export class ImplementationReport {
    private readonly config: ImplementationReportConfig;
    private keyDecisions: KeyDecision[];
    private lessonsLearned: LessonLearned[];
    private nextSteps: NextStep[];

    constructor(config: Partial<ImplementationReportConfig> = {}) {
        this.config = { ...DEFAULT_IMPLEMENTATION_REPORT_CONFIG, ...config };
        this.keyDecisions = [];
        this.lessonsLearned = [];
        this.nextSteps = [];
    }

    /**
     * Generate an implementation report for a game
     * @param game - The game that was implemented
     * @param preAudit - Pre-implementation audit (if available)
     * @param postAudit - Post-implementation audit
     * @param priorityScore - Priority score for the game
     * @returns Implementation report as a markdown string
     */
    public generateReport(
        game: Game,
        preAudit: AuditReport | null,
        postAudit: AuditReport,
        priorityScore: PriorityScore
    ): string {
        const sections: string[] = [];

        // Header
        sections.push(this.formatHeader(game, postAudit));

        // Before/After Comparisons
        if (this.config.includeBeforeAfterComparisons) {
            sections.push(this.formatBeforeAfterComparisons(preAudit, postAudit));
        }

        // Key Decisions
        if (this.config.includeKeyDecisions && this.keyDecisions.length > 0) {
            sections.push(this.formatKeyDecisions());
        }

        // Lessons Learned
        if (this.config.includeLessonsLearned && this.lessonsLearned.length > 0) {
            sections.push(this.formatLessonsLearned());
        }

        // Next Steps
        if (this.config.includeNextSteps && this.nextSteps.length > 0) {
            sections.push(this.formatNextSteps());
        }

        // Priority Information
        sections.push(this.formatPriorityInformation(priorityScore));

        return sections.join('\n\n');
    }

    /**
     * Add a key decision to the report
     * @param decision - The key decision to add
     */
    public addKeyDecision(decision: Omit<KeyDecision, 'id' | 'timestamp'>): void {
        const fullDecision: KeyDecision = {
            ...decision,
            id: `KD-${Date.now()}`,
            timestamp: new Date().toISOString(),
        };
        this.keyDecisions.push(fullDecision);
    }

    /**
     * Add a lesson learned to the report
     * @param lesson - The lesson learned to add
     */
    public addLessonLearned(lesson: Omit<LessonLearned, 'id' | 'timestamp'>): void {
        const fullLesson: LessonLearned = {
            ...lesson,
            id: `LL-${Date.now()}`,
            timestamp: new Date().toISOString(),
        };
        this.lessonsLearned.push(fullLesson);
    }

    /**
     * Add a next step to the report
     * @param step - The next step to add
     */
    public addNextStep(step: Omit<NextStep, 'id'>): void {
        const fullStep: NextStep = {
            ...step,
            id: `NS-${Date.now()}`,
        };
        this.nextSteps.push(fullStep);
    }

    /**
     * Calculate before/after comparison for a metric
     * @param before - Pre-implementation value
     * @param after - Post-implementation value
     * @returns BeforeAfterComparison with absolute and percentage change
     */
    public calculateComparison(before: number, after: number): BeforeAfterComparison {
        const absoluteChange = after - before;
        let percentageChange: number;
        if (before !== 0) {
            percentageChange = (absoluteChange / before) * 100;
        } else if (after === 0) {
            percentageChange = 0;
        } else {
            // Avoid misleading "0%" when baseline is zero but result is non-zero.
            percentageChange = absoluteChange > 0 ? 100 : -100;
        }

        return {
            before,
            after,
            absoluteChange,
            percentageChange,
        };
    }

    /**
     * Determine statistical significance of a change
     * @param percentageChange - The percentage change to evaluate
     * @returns Statistical significance level
     */
    public determineStatisticalSignificance(percentageChange: number): 'high' | 'medium' | 'low' | 'insufficient' {
        const absChange = Math.abs(percentageChange);

        if (absChange < 5) return 'insufficient';
        if (absChange < this.config.statisticalSignificanceThreshold) return 'low';
        if (absChange < 30) return 'medium';
        return 'high';
    }

    /**
     * Get all key decisions
     * @returns Array of key decisions
     */
    public getKeyDecisions(): KeyDecision[] {
        return [...this.keyDecisions];
    }

    /**
     * Get all lessons learned
     * @returns Array of lessons learned
     */
    public getLessonsLearned(): LessonLearned[] {
        return [...this.lessonsLearned];
    }

    /**
     * Get all next steps
     * @returns Array of next steps
     */
    public getNextSteps(): NextStep[] {
        return [...this.nextSteps];
    }

    /**
     * Clear all report data
     */
    public clear(): void {
        this.keyDecisions = [];
        this.lessonsLearned = [];
        this.nextSteps = [];
    }

    /**
     * Format the report header
     * @param game - The game that was implemented
     * @param postAudit - Post-implementation audit
     * @returns Formatted header string
     */
    private formatHeader(game: Game, postAudit: AuditReport): string {
        return `# Implementation Report: ${game.name}

**Game ID**: ${game.id}
**Implementation Date**: ${new Date().toLocaleDateString()}
**Auditor**: ${postAudit.auditor}
**Audit Date**: ${postAudit.auditDate}

## Overview

This report documents the implementation of "${game.name}" - a ${game.difficulty} difficulty game
targeted at ages ${game.ageRange}. The game is categorized under "${game.category}" and is expected
to take approximately ${game.estimatedTime} hours to complete.

## Educational Objectives

${game.educationalObjectives?.map((obj) => `- ${obj}`).join('\n') || 'No educational objectives specified.'}

## Success Criteria

${game.successCriteria.map((criteria) => `- ${criteria}`).join('\n')}`;
    }

    /**
     * Format before/after comparisons section
     * @param preAudit - Pre-implementation audit
     * @param postAudit - Post-implementation audit
     * @returns Formatted comparisons section
     */
    private formatBeforeAfterComparisons(preAudit: AuditReport | null, postAudit: AuditReport): string {
        const sections: string[] = ['## Before/After Comparisons\n'];

        if (preAudit) {
            sections.push('### Audit Score Comparison\n');
            sections.push('| Dimension | Before | After | Change | % Change |');
            sections.push('|-----------|--------|-------|--------|----------|');

            for (const postScore of postAudit.scores) {
                const preScore = preAudit.scores.find((s) => s.dimension === postScore.dimension);
                const before = preScore?.score || 0;
                const comparison = this.calculateComparison(before, postScore.score);

                sections.push(
                    `| ${postScore.dimension} | ${before} | ${postScore.score} | ` +
                    `${comparison.absoluteChange >= 0 ? '+' : ''}${comparison.absoluteChange} | ` +
                    `${comparison.percentageChange.toFixed(1)}% |`
                );
            }

            sections.push('');
            sections.push(`**Total Score**: ${preAudit.totalScore} → ${postAudit.totalScore} ` +
                `(${postAudit.totalScore - preAudit.totalScore >= 0 ? '+' : ''}${postAudit.totalScore - preAudit.totalScore})`);
        } else {
            sections.push('### Post-Implementation Audit Scores\n');
            sections.push('| Dimension | Score |');
            sections.push('|-----------|-------|');

            for (const score of postAudit.scores) {
                sections.push(`| ${score.dimension} | ${score.score} |`);
            }

            sections.push('');
            sections.push(`**Total Score**: ${postAudit.totalScore}/25`);
        }

        sections.push('');
        sections.push('### Improvement Recommendations Addressed\n');

        if (postAudit.improvementRecommendations.length > 0) {
            for (const [i, rec] of postAudit.improvementRecommendations.entries()) {
                sections.push(`${i + 1}. ${rec}`);
            }
        } else {
            sections.push('No improvement recommendations.');
        }

        return sections.join('\n');
    }

    /**
     * Format key decisions section
     * @returns Formatted key decisions section
     */
    private formatKeyDecisions(): string {
        const sections: string[] = ['## Key Decisions\n'];

        for (const decision of this.keyDecisions) {
            sections.push(`### ${decision.title}`);
            sections.push(`**Impact**: ${decision.impact}`);
            sections.push('');
            sections.push(`${decision.description}`);
            sections.push('');
            sections.push('**Rationale**:');
            sections.push(`${decision.rationale}`);
            sections.push('');
            sections.push('**Alternatives Considered**:');
            for (const alt of decision.alternatives) {
                sections.push(`- ${alt}`);
            }
            sections.push('');
            sections.push(`**Selected Option**: ${decision.selectedOption}`);
            sections.push('');
        }

        return sections.join('\n');
    }

    /**
     * Format lessons learned section
     * @returns Formatted lessons learned section
     */
    private formatLessonsLearned(): string {
        const sections: string[] = ['## Lessons Learned\n'];

        for (const lesson of this.lessonsLearned) {
            sections.push(`### [${lesson.category.toUpperCase()}] ${lesson.description}`);
            sections.push(`**Priority**: ${lesson.priority}`);
            sections.push('');
            sections.push('**Recommendation**:');
            sections.push(`${lesson.recommendation}`);
            sections.push('');
        }

        return sections.join('\n');
    }

    /**
     * Format next steps section
     * @returns Formatted next steps section
     */
    private formatNextSteps(): string {
        const sections: string[] = ['## Next Steps\n'];

        const sortedSteps = [...this.nextSteps].sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        for (const step of sortedSteps) {
            sections.push(`### ${step.description}`);
            sections.push(`- **Priority**: ${step.priority}`);
            sections.push(`- **Estimated Effort**: ${step.estimatedEffort} hours`);

            if (step.dependencies.length > 0) {
                sections.push(`- **Dependencies**: ${step.dependencies.join(', ')}`);
            }

            if (step.targetDate) {
                sections.push(`- **Target Date**: ${step.targetDate}`);
            }

            sections.push('');
        }

        return sections.join('\n');
    }

    /**
     * Format priority information section
     * @param priorityScore - The priority score for the game
     * @returns Formatted priority information section
     */
    private formatPriorityInformation(priorityScore: PriorityScore): string {
        return `## Priority Information

| Factor | Score |
|--------|-------|
| Educational Impact | ${priorityScore.educationalImpact}/100 |
| User Demand | ${priorityScore.userDemand}/100 |
| Implementation Effort | ${priorityScore.implementationEffort}/100 |
| Strategic Alignment | ${priorityScore.strategicAlignment}/100 |
| **Total Score** | **${priorityScore.totalScore}/100** |

**Priority Level**: ${priorityScore.priorityLevel}

---
*Report generated on ${new Date().toISOString()}*`;
    }
}

/**
 * Factory function to create an ImplementationReport instance
 * @param config - Optional configuration
 * @returns New ImplementationReport instance
 */
export function createImplementationReport(config?: Partial<ImplementationReportConfig>): ImplementationReport {
    return new ImplementationReport(config);
}
