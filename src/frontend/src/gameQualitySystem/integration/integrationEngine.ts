// Integration Engine for Game Quality System

import { PriorityScore, AuditReport, CatalogEntry } from '../types';

export interface IntegrationResult {
    gameId: string;
    auditScore: number;
    catalogPriority: number;
    alignment: 'aligned' | 'mismatch' | 'low_quality';
    recommendation: string;
    reason: string;
}

export interface UnifiedPriorityEntry {
    gameId: string;
    gameName: string;
    combinedScore: number;
    auditScore: number;
    catalogPriority: number;
    priorityLevel: string;
}

export class IntegrationEngine {
    public compareAuditAndCatalog(
        auditReports: Record<string, AuditReport>,
        catalogEntries: Record<string, CatalogEntry>
    ): IntegrationResult[] {
        const results: IntegrationResult[] = [];

        for (const [gameId, report] of Object.entries(auditReports)) {
            const catalogEntry = catalogEntries[gameId];
            if (!catalogEntry) continue;

            const auditScore = report.totalScore;
            const catalogPriority = this.priorityToScore(catalogEntry.priority);

            let alignment: IntegrationResult['alignment'] = 'aligned';
            let recommendation = 'No action needed';
            let reason = 'Audit score and catalog priority are aligned';

            if (auditScore >= 15 && catalogPriority < 70) {
                alignment = 'mismatch';
                recommendation = 'Re-prioritize: High quality, low catalog priority';
                reason = `Audit score ${auditScore} indicates high quality, but catalog priority ${catalogPriority} is low`;
            } else if (auditScore < 12 && catalogPriority >= 70) {
                alignment = 'low_quality';
                recommendation = 'Investigate: Low quality, high catalog priority';
                reason = `Audit score ${auditScore} indicates quality issues, but catalog priority ${catalogPriority} is high`;
            }

            results.push({
                gameId,
                auditScore,
                catalogPriority,
                alignment,
                recommendation,
                reason,
            });
        }

        return results;
    }

    public generateUnifiedPriorityList(
        auditReports: Record<string, AuditReport>,
        catalogEntries: Record<string, CatalogEntry>,
        priorityScores: Record<string, PriorityScore>
    ): UnifiedPriorityEntry[] {
        const entries: UnifiedPriorityEntry[] = [];

        for (const [gameId, report] of Object.entries(auditReports)) {
            const catalogEntry = catalogEntries[gameId];
            const priorityScore = priorityScores[gameId];

            if (!catalogEntry || !priorityScore) continue;

            const combinedScore = this.calculateCombinedScore(report, priorityScore);

            entries.push({
                gameId,
                gameName: catalogEntry.name,
                combinedScore,
                auditScore: report.totalScore,
                catalogPriority: this.priorityToScore(catalogEntry.priority),
                priorityLevel: priorityScore.priorityLevel,
            });
        }

        return entries.sort((a, b) => b.combinedScore - a.combinedScore);
    }

    public calculateCombinedScore(auditReport: AuditReport, priorityScore: PriorityScore): number {
        const auditComponent = (auditReport.totalScore / 25) * 100;
        const priorityComponent = priorityScore.totalScore;

        return (auditComponent * 0.5) + (priorityComponent * 0.5);
    }

    public priorityToScore(priority?: string): number {
        switch (priority) {
            case 'P0': return 95;
            case 'P1': return 80;
            case 'P2': return 60;
            case 'P3': return 30;
            default: return 50;
        }
    }

    public getRePrioritizationRecommendations(results: IntegrationResult[]): string[] {
        const recommendations: string[] = [];

        for (const result of results) {
            if (result.alignment === 'mismatch') {
                recommendations.push(`Re-prioritize ${result.gameId}: ${result.reason}`);
            } else if (result.alignment === 'low_quality') {
                recommendations.push(`Investigate ${result.gameId}: ${result.reason}`);
            }
        }

        return recommendations;
    }

    public generateVisualizationData(
        auditReports: Record<string, AuditReport>,
        catalogEntries: Record<string, CatalogEntry>,
        priorityScores: Record<string, PriorityScore>
    ): any {
        const dataPoints: any[] = [];

        for (const [gameId, report] of Object.entries(auditReports)) {
            const catalogEntry = catalogEntries[gameId];
            const priorityScore = priorityScores[gameId];

            if (!catalogEntry || !priorityScore) continue;

            dataPoints.push({
                gameId,
                gameName: catalogEntry.name,
                auditScore: report.totalScore,
                catalogPriority: this.priorityToScore(catalogEntry.priority),
                educationalImpact: priorityScore.educationalImpact,
                implementationEffort: priorityScore.implementationEffort,
                priorityLevel: priorityScore.priorityLevel,
            });
        }

        return {
            auditVsCatalog: dataPoints.map(d => ({
                x: d.auditScore,
                y: d.catalogPriority,
                gameId: d.gameId,
                gameName: d.gameName,
            })),
            effortVsImpact: dataPoints.map(d => ({
                x: d.implementationEffort,
                y: d.educationalImpact,
                gameId: d.gameId,
                gameName: d.gameName,
            })),
        };
    }
}
