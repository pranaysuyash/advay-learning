// Documentation Generator for Game Quality System

import type { DocumentationEntry } from '../types';

export interface ReportConfig {
    outputDirectory: string;
    changeLogDirectory: string;
    implementationReportDirectory: string;
}

export class DocumentationGenerator {
    private readonly DEFAULT_CONFIG: ReportConfig = {
        outputDirectory: 'docs/game_improvements',
        changeLogDirectory: 'docs/game_improvements/changelogs',
        implementationReportDirectory: 'docs/game_implementations',
    };

    private config: ReportConfig;

    constructor(config: Partial<ReportConfig> = {}) {
        this.config = { ...this.DEFAULT_CONFIG, ...config };
    }

    public generateChangeLog(gameId: string, improvements: string[]): DocumentationEntry {
        const changeLog = improvements.map((imp, index) => {
            const date = new Date().toISOString().split('T')[0];
            return `[${date}] Improvement ${index + 1}: ${imp}`;
        });

        return {
            gameId,
            changeLog,
            implementationReport: '',
            metricsSummary: {
                gameId,
                changePercentage: 0,
                statisticalSignificance: 'insufficient',
                lastUpdated: new Date().toISOString(),
            },
            beforeAfterComparisons: {
                qualityScore: { before: 0, after: 0, change: 0 },
                engagementRate: { before: 0, after: 0, change: 0 },
                completionRate: { before: 0, after: 0, change: 0 },
            },
            keyDecisions: [],
            lessonsLearned: [],
            nextSteps: [],
            timestamp: new Date().toISOString(),
        };
    }

    public generateImplementationReport(
        gameId: string,
        beforeAfter: {
            qualityScore: { before: number; after: number };
            engagementRate: { before: number; after: number };
            completionRate: { before: number; after: number };
        },
        keyDecisions: string[],
        lessonsLearned: string[],
        nextSteps: string[]
    ): DocumentationEntry {
        const qualityChange = beforeAfter.qualityScore.after - beforeAfter.qualityScore.before;
        const engagementChange = beforeAfter.engagementRate.after - beforeAfter.engagementRate.before;
        const completionChange = beforeAfter.completionRate.after - beforeAfter.completionRate.before;

        return {
            gameId,
            changeLog: [],
            implementationReport: this.formatImplementationReport(
                gameId,
                beforeAfter,
                keyDecisions,
                lessonsLearned,
                nextSteps
            ),
            metricsSummary: {
                gameId,
                changePercentage: qualityChange,
                statisticalSignificance: this.determineStatisticalSignificance(qualityChange),
                lastUpdated: new Date().toISOString(),
            },
            beforeAfterComparisons: {
                qualityScore: {
                    before: beforeAfter.qualityScore.before,
                    after: beforeAfter.qualityScore.after,
                    change: qualityChange,
                },
                engagementRate: {
                    before: beforeAfter.engagementRate.before,
                    after: beforeAfter.engagementRate.after,
                    change: engagementChange,
                },
                completionRate: {
                    before: beforeAfter.completionRate.before,
                    after: beforeAfter.completionRate.after,
                    change: completionChange,
                },
            },
            keyDecisions,
            lessonsLearned,
            nextSteps,
            timestamp: new Date().toISOString(),
        };
    }

    public generateWeeklySummary(
        gamesImproved: number,
        gamesImplemented: number,
        totalEffortHours: number,
        impactScore: number
    ): DocumentationEntry {
        return {
            gameId: 'weekly-summary',
            changeLog: [],
            implementationReport: this.formatWeeklySummary(
                gamesImproved,
                gamesImplemented,
                totalEffortHours,
                impactScore
            ),
            metricsSummary: {
                gameId: 'weekly-summary',
                changePercentage: impactScore,
                statisticalSignificance: 'high',
                lastUpdated: new Date().toISOString(),
            },
            beforeAfterComparisons: {
                qualityScore: { before: 0, after: impactScore, change: impactScore },
                engagementRate: { before: 0, after: 0, change: 0 },
                completionRate: { before: 0, after: 0, change: 0 },
            },
            keyDecisions: [],
            lessonsLearned: [],
            nextSteps: ['Continue monitoring game performance', 'Plan next improvement cycle'],
            timestamp: new Date().toISOString(),
        };
    }

    public formatImplementationReport(
        gameId: string,
        beforeAfter: {
            qualityScore: { before: number; after: number };
            engagementRate: { before: number; after: number };
            completionRate: { before: number; after: number };
        },
        keyDecisions: string[],
        lessonsLearned: string[],
        nextSteps: string[]
    ): string {
        const qualityChange = beforeAfter.qualityScore.after - beforeAfter.qualityScore.before;
        const engagementChange = beforeAfter.engagementRate.after - beforeAfter.engagementRate.before;
        const completionChange = beforeAfter.completionRate.after - beforeAfter.completionRate.before;

        return `
# Implementation Report: ${gameId}

## Before/After Comparisons

### Quality Score
- Before: ${beforeAfter.qualityScore.before}
- After: ${beforeAfter.qualityScore.after}
- Change: ${qualityChange > 0 ? '+' : ''}${qualityChange}

### Engagement Rate
- Before: ${beforeAfter.engagementRate.before}%
- After: ${beforeAfter.engagementRate.after}%
- Change: ${engagementChange > 0 ? '+' : ''}${engagementChange}%

### Completion Rate
- Before: ${beforeAfter.completionRate.before}%
- After: ${beforeAfter.completionRate.after}%
- Change: ${completionChange > 0 ? '+' : ''}${completionChange}%

## Key Decisions

${keyDecisions.map((d, i) => `${i + 1}. ${d}`).join('\n')}

## Lessons Learned

${lessonsLearned.map((l, i) => `${i + 1}. ${l}`).join('\n')}

## Next Steps

${nextSteps.map((n, i) => `${i + 1}. ${n}`).join('\n')}
`.trim();
    }

    public formatWeeklySummary(
        gamesImproved: number,
        gamesImplemented: number,
        totalEffortHours: number,
        impactScore: number
    ): string {
        return `
# Weekly Summary

## Games Improved: ${gamesImproved}
## Games Implemented: ${gamesImplemented}
## Total Effort Hours: ${totalEffortHours}
## Impact Score: ${impactScore}

## Key Achievements

- Improved ${gamesImproved} existing games
- Implemented ${gamesImplemented} new games
- Total development effort: ${totalEffortHours} hours
- Overall impact score: ${impactScore}

## Next Steps

- Continue monitoring game performance
- Plan next improvement cycle
- Review feedback from improved/implemented games
`.trim();
    }

    public determineStatisticalSignificance(changePercentage: number): 'high' | 'medium' | 'low' | 'insufficient' {
        if (Math.abs(changePercentage) < 5) return 'insufficient';
        if (Math.abs(changePercentage) < 15) return 'low';
        if (Math.abs(changePercentage) < 30) return 'medium';
        return 'high';
    }

    public storeReport(entry: DocumentationEntry, type: 'improvement' | 'implementation'): string {
        const directory = type === 'improvement'
            ? this.config.changeLogDirectory
            : this.config.implementationReportDirectory;

        const filename = `${entry.gameId}-${new Date().toISOString().split('T')[0]}.md`;
        const fullPath = `${directory}/${filename}`;

        return fullPath;
    }
}
