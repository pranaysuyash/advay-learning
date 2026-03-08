// Report Generator for Game Quality System
// Generates detailed audit reports with specific improvement recommendations

import { AuditReport, AuditScore, AuditDimension } from '../types/index';

export interface DetailedRecommendation {
    dimension: AuditDimension;
    currentScore: number;
    targetScore: number;
    priority: 'critical' | 'high' | 'medium' | 'low';
    actionItems: string[];
    estimatedEffort: 'low' | 'medium' | 'high';
    expectedImpact: 'low' | 'medium' | 'high';
}

export interface DetailedAuditReport extends AuditReport {
    detailedRecommendations: DetailedRecommendation[];
    executiveSummary: string;
    priorityActions: string[];
    estimatedImprovementTime: string;
}

export class ReportGenerator {
    /**
     * Generate a detailed audit report with specific improvement recommendations
     * Requirement 1.5: Generate detailed report with specific improvement recommendations
     */
    public generateDetailedReport(auditReport: AuditReport): DetailedAuditReport {
        const detailedRecommendations = this.generateDetailedRecommendations(auditReport.scores);
        const executiveSummary = this.generateExecutiveSummary(auditReport, detailedRecommendations);
        const priorityActions = this.generatePriorityActions(detailedRecommendations);
        const estimatedImprovementTime = this.estimateImprovementTime(detailedRecommendations);

        return {
            ...auditReport,
            detailedRecommendations,
            executiveSummary,
            priorityActions,
            estimatedImprovementTime,
        };
    }

    /**
     * Generate detailed recommendations for each dimension
     * Provides specific, actionable improvement suggestions
     */
    private generateDetailedRecommendations(scores: AuditScore[]): DetailedRecommendation[] {
        const recommendations: DetailedRecommendation[] = [];

        for (const score of scores) {
            // Generate recommendations for dimensions scoring below 5
            if (score.score < 5) {
                const recommendation = this.createRecommendationForDimension(score);
                recommendations.push(recommendation);
            }
        }

        // Sort by priority (critical first, then high, medium, low)
        return recommendations.sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    /**
     * Create a detailed recommendation for a specific dimension
     */
    private createRecommendationForDimension(score: AuditScore): DetailedRecommendation {
        const dimension = score.dimension;
        const currentScore = score.score;
        const targetScore = 5; // Always aim for excellence

        // Determine priority based on current score
        const priority = this.determinePriority(currentScore);

        // Generate specific action items based on dimension and score
        const actionItems = this.generateActionItems(dimension, currentScore, score.issues);

        // Estimate effort and impact
        const estimatedEffort = this.estimateEffort(dimension, currentScore, targetScore);
        const expectedImpact = this.estimateImpact(dimension, currentScore, targetScore);

        return {
            dimension,
            currentScore,
            targetScore,
            priority,
            actionItems,
            estimatedEffort,
            expectedImpact,
        };
    }

    /**
     * Determine priority level based on current score
     */
    private determinePriority(score: number): 'critical' | 'high' | 'medium' | 'low' {
        if (score === 1) return 'critical';
        if (score === 2) return 'high';
        if (score === 3) return 'medium';
        return 'low';
    }

    /**
     * Generate specific action items for a dimension
     */
    private generateActionItems(
        dimension: AuditDimension,
        currentScore: number,
        issues: string[]
    ): string[] {
        const actionItems: string[] = [];

        switch (dimension) {
            case 'Educational_Value':
                actionItems.push(...this.getEducationalValueActions(currentScore, issues));
                break;
            case 'User_Experience':
                actionItems.push(...this.getUserExperienceActions(currentScore, issues));
                break;
            case 'Technical_Quality':
                actionItems.push(...this.getTechnicalQualityActions(currentScore, issues));
                break;
            case 'Accessibility':
                actionItems.push(...this.getAccessibilityActions(currentScore, issues));
                break;
            case 'Content_Completeness':
                actionItems.push(...this.getContentCompletenessActions(currentScore, issues));
                break;
        }

        return actionItems;
    }

    private getEducationalValueActions(score: number, issues: string[]): string[] {
        const actions: string[] = [];

        if (score <= 2) {
            actions.push('Define clear educational objectives aligned with curriculum standards');
            actions.push('Document specific skills that the game develops');
            actions.push('Specify appropriate age range for the game');
        }

        if (score === 3) {
            actions.push('Expand educational objectives to cover at least 4 learning goals');
            actions.push('Document at least 3 distinct skills developed by the game');
            actions.push('Add learning outcome assessments');
        }

        if (score === 4) {
            actions.push('Add advanced learning objectives for differentiation');
            actions.push('Include cross-curricular connections');
            actions.push('Develop assessment rubrics for learning outcomes');
        }

        // Add issue-specific actions
        for (const issue of issues) {
            if (issue.includes('educational objectives')) {
                actions.push('Create comprehensive list of educational objectives with measurable outcomes');
            }
            if (issue.includes('skills developed')) {
                actions.push('Document cognitive, social, and motor skills developed through gameplay');
            }
        }

        return actions;
    }

    private getUserExperienceActions(score: number, issues: string[]): string[] {
        const actions: string[] = [];

        if (score <= 2) {
            actions.push('Conduct user testing with target age group');
            actions.push('Simplify navigation and reduce friction points');
            actions.push('Add clear instructions and tutorials');
            actions.push('Improve visual feedback for user actions');
        }

        if (score === 3) {
            actions.push('Optimize user flow to reduce confusion');
            actions.push('Add contextual help and hints');
            actions.push('Improve visual design and consistency');
            actions.push('Reduce loading times and transitions');
        }

        if (score === 4) {
            actions.push('Add delightful animations and micro-interactions');
            actions.push('Implement personalization features');
            actions.push('Add progress tracking and achievements');
        }

        // Add issue-specific actions
        for (const issue of issues) {
            if (issue.includes('completion rate')) {
                actions.push('Analyze drop-off points and simplify difficult sections');
                actions.push('Add checkpoints and save progress functionality');
            }
            if (issue.includes('session')) {
                actions.push('Increase engagement with varied activities and rewards');
            }
            if (issue.includes('feedback')) {
                actions.push('Address specific user complaints from feedback data');
            }
        }

        return actions;
    }

    private getTechnicalQualityActions(score: number, issues: string[]): string[] {
        const actions: string[] = [];

        if (score <= 2) {
            actions.push('Fix critical bugs causing crashes or data loss');
            actions.push('Implement error handling and recovery mechanisms');
            actions.push('Optimize performance for target devices');
            actions.push('Add comprehensive error logging');
        }

        if (score === 3) {
            actions.push('Address remaining minor bugs');
            actions.push('Improve code quality and maintainability');
            actions.push('Add unit tests for critical functionality');
            actions.push('Optimize asset loading and memory usage');
        }

        if (score === 4) {
            actions.push('Achieve 100% test coverage for core features');
            actions.push('Implement performance monitoring');
            actions.push('Add automated regression testing');
        }

        // Add issue-specific actions
        for (const issue of issues) {
            if (issue.includes('bug count')) {
                actions.push('Prioritize and fix bugs based on severity and frequency');
                actions.push('Implement bug tracking and resolution workflow');
            }
            if (issue.includes('crash rate')) {
                actions.push('Add crash reporting and analytics');
                actions.push('Fix critical crash-causing bugs immediately');
            }
            if (issue.includes('performance')) {
                actions.push('Profile and optimize performance bottlenecks');
                actions.push('Reduce asset sizes and optimize rendering');
            }
        }

        return actions;
    }

    private getAccessibilityActions(score: number, issues: string[]): string[] {
        const actions: string[] = [];

        if (score <= 2) {
            actions.push('Ensure color contrast ratio meets WCAG AA standards (4.5:1)');
            actions.push('Implement full keyboard navigation support');
            actions.push('Add screen reader support with ARIA labels');
            actions.push('Provide timeout options and pause functionality');
        }

        if (score === 3) {
            actions.push('Enhance keyboard navigation with visible focus indicators');
            actions.push('Add alternative text for all images and icons');
            actions.push('Implement adjustable text sizes');
            actions.push('Add audio descriptions for visual content');
        }

        if (score === 4) {
            actions.push('Achieve WCAG AAA compliance where possible');
            actions.push('Add multiple input method support (touch, mouse, keyboard, voice)');
            actions.push('Implement customizable color schemes for color blindness');
            actions.push('Add closed captions for all audio content');
        }

        // Add issue-specific actions
        for (const issue of issues) {
            if (issue.includes('color contrast')) {
                actions.push('Audit all color combinations and adjust to meet 4.5:1 ratio');
                actions.push('Provide high-contrast mode option');
            }
            if (issue.includes('keyboard')) {
                actions.push('Test all functionality with keyboard-only navigation');
                actions.push('Add keyboard shortcuts for common actions');
            }
            if (issue.includes('screen reader')) {
                actions.push('Test with popular screen readers (NVDA, JAWS, VoiceOver)');
                actions.push('Add semantic HTML and ARIA landmarks');
            }
            if (issue.includes('timeout')) {
                actions.push('Add configurable timeout settings');
                actions.push('Implement pause/resume functionality');
            }
        }

        return actions;
    }

    private getContentCompletenessActions(score: number, issues: string[]): string[] {
        const actions: string[] = [];

        if (score <= 2) {
            actions.push('Add core content items to reach minimum viable product');
            actions.push('Implement essential game features');
            actions.push('Create basic content variations');
        }

        if (score === 3) {
            actions.push('Expand content library to at least 50 items');
            actions.push('Add at least 3 content variations');
            actions.push('Implement multiple difficulty levels');
            actions.push('Add progression system');
        }

        if (score === 4) {
            actions.push('Create extensive content library (100+ items)');
            actions.push('Add seasonal or themed content variations');
            actions.push('Implement adaptive difficulty');
            actions.push('Add bonus content and unlockables');
        }

        // Add issue-specific actions
        for (const issue of issues) {
            if (issue.includes('content items')) {
                actions.push('Develop content creation pipeline for scalability');
                actions.push('Prioritize high-value content based on learning objectives');
            }
            if (issue.includes('variations')) {
                actions.push('Create content variations to maintain engagement');
                actions.push('Add randomization to prevent repetition');
            }
            if (issue.includes('levels')) {
                actions.push('Design progressive difficulty levels');
                actions.push('Implement adaptive difficulty based on performance');
            }
        }

        return actions;
    }

    /**
     * Estimate effort required for improvement
     */
    private estimateEffort(
        dimension: AuditDimension,
        currentScore: number,
        targetScore: number
    ): 'low' | 'medium' | 'high' {
        const scoreDelta = targetScore - currentScore;

        // Accessibility and Technical Quality typically require more effort
        if (dimension === 'Accessibility' || dimension === 'Technical_Quality') {
            if (scoreDelta >= 3) return 'high';
            if (scoreDelta >= 2) return 'medium';
            return 'low';
        }

        // Content Completeness can be high effort for large content additions
        if (dimension === 'Content_Completeness') {
            if (scoreDelta >= 3) return 'high';
            if (scoreDelta >= 2) return 'medium';
            return 'low';
        }

        // Educational Value and User Experience are typically medium effort
        if (scoreDelta >= 3) return 'medium';
        if (scoreDelta >= 2) return 'medium';
        return 'low';
    }

    /**
     * Estimate impact of improvement
     */
    private estimateImpact(
        dimension: AuditDimension,
        currentScore: number,
        targetScore: number
    ): 'low' | 'medium' | 'high' {
        const scoreDelta = targetScore - currentScore;

        // Critical scores (1-2) have high impact when improved
        if (currentScore <= 2) return 'high';

        // Educational Value improvements have high impact
        if (dimension === 'Educational_Value' && scoreDelta >= 2) return 'high';

        // User Experience improvements have high impact on engagement
        if (dimension === 'User_Experience' && scoreDelta >= 2) return 'high';

        // Accessibility improvements have high social impact
        if (dimension === 'Accessibility' && scoreDelta >= 2) return 'high';

        if (scoreDelta >= 2) return 'medium';
        return 'low';
    }

    /**
     * Generate executive summary of audit results
     */
    private generateExecutiveSummary(
        auditReport: AuditReport,
        recommendations: DetailedRecommendation[]
    ): string {
        const { gameName, totalScore, isFlaggedForImprovement, scores } = auditReport;

        const criticalCount = recommendations.filter(r => r.priority === 'critical').length;
        const highCount = recommendations.filter(r => r.priority === 'high').length;

        let summary = `Audit Summary for "${gameName}":\n\n`;
        summary += `Overall Score: ${totalScore}/25 (${((totalScore / 25) * 100).toFixed(1)}%)\n`;
        summary += `Status: ${isFlaggedForImprovement ? 'FLAGGED FOR IMPROVEMENT' : 'ACCEPTABLE'}\n\n`;

        if (isFlaggedForImprovement) {
            summary += `This game requires improvement. `;
            if (criticalCount > 0) {
                summary += `${criticalCount} critical issue${criticalCount > 1 ? 's' : ''} identified. `;
            }
            if (highCount > 0) {
                summary += `${highCount} high-priority issue${highCount > 1 ? 's' : ''} identified. `;
            }
            summary += '\n\n';
        }

        summary += 'Dimension Scores:\n';
        for (const score of scores) {
            const status = score.score < 3 ? '⚠️' : score.score >= 4 ? '✓' : '○';
            summary += `${status} ${score.dimension}: ${score.score}/5\n`;
        }

        summary += '\n';
        summary += `Total Recommendations: ${recommendations.length}\n`;
        summary += `Critical: ${criticalCount}, High: ${highCount}, Medium: ${recommendations.filter(r => r.priority === 'medium').length}, Low: ${recommendations.filter(r => r.priority === 'low').length}\n`;

        return summary;
    }

    /**
     * Generate prioritized list of actions
     */
    private generatePriorityActions(recommendations: DetailedRecommendation[]): string[] {
        const priorityActions: string[] = [];

        // Add critical and high priority actions first
        const criticalAndHigh = recommendations.filter(
            r => r.priority === 'critical' || r.priority === 'high'
        );

        for (const rec of criticalAndHigh) {
            priorityActions.push(
                `[${rec.priority.toUpperCase()}] ${rec.dimension}: ${rec.actionItems[0]}`
            );
        }

        // Add top medium priority actions
        const medium = recommendations.filter(r => r.priority === 'medium');
        for (const rec of medium.slice(0, 3)) {
            priorityActions.push(
                `[MEDIUM] ${rec.dimension}: ${rec.actionItems[0]}`
            );
        }

        return priorityActions;
    }

    /**
     * Estimate total time required for improvements
     */
    private estimateImprovementTime(recommendations: DetailedRecommendation[]): string {
        let totalHours = 0;

        for (const rec of recommendations) {
            // Estimate hours based on effort level
            switch (rec.estimatedEffort) {
                case 'low':
                    totalHours += 4;
                    break;
                case 'medium':
                    totalHours += 16;
                    break;
                case 'high':
                    totalHours += 40;
                    break;
            }
        }

        if (totalHours <= 8) return '1 day';
        if (totalHours <= 40) return '1 week';
        if (totalHours <= 80) return '2 weeks';
        if (totalHours <= 160) return '1 month';
        return '2+ months';
    }

    /**
     * Generate a formatted text report
     */
    public generateTextReport(detailedReport: DetailedAuditReport): string {
        let report = '='.repeat(80) + '\n';
        report += `GAME QUALITY AUDIT REPORT\n`;
        report += '='.repeat(80) + '\n\n';

        report += `Game: ${detailedReport.gameName}\n`;
        report += `Game ID: ${detailedReport.gameId}\n`;
        report += `Audit Date: ${new Date(detailedReport.auditDate).toLocaleDateString()}\n`;
        report += `Auditor: ${detailedReport.auditor}\n\n`;

        report += detailedReport.executiveSummary + '\n';

        report += '='.repeat(80) + '\n';
        report += 'PRIORITY ACTIONS\n';
        report += '='.repeat(80) + '\n\n';

        for (const action of detailedReport.priorityActions) {
            report += `• ${action}\n`;
        }

        report += '\n';
        report += '='.repeat(80) + '\n';
        report += 'DETAILED RECOMMENDATIONS\n';
        report += '='.repeat(80) + '\n\n';

        for (const rec of detailedReport.detailedRecommendations) {
            report += `-`.repeat(80) + '\n';
            report += `Dimension: ${rec.dimension}\n`;
            report += `Current Score: ${rec.currentScore}/5 | Target Score: ${rec.targetScore}/5\n`;
            report += `Priority: ${rec.priority.toUpperCase()} | Effort: ${rec.estimatedEffort.toUpperCase()} | Impact: ${rec.expectedImpact.toUpperCase()}\n\n`;

            report += 'Action Items:\n';
            for (let i = 0; i < rec.actionItems.length; i++) {
                report += `  ${i + 1}. ${rec.actionItems[i]}\n`;
            }
            report += '\n';
        }

        report += '='.repeat(80) + '\n';
        report += `Estimated Improvement Time: ${detailedReport.estimatedImprovementTime}\n`;
        report += '='.repeat(80) + '\n';

        return report;
    }
}
