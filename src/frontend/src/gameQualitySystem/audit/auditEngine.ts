// Audit Engine for Game Quality System

import { AuditScore, AuditReport, Game, AuditDimension } from '../types';
import { scoreDimension, AUDIT_CRITERIA } from './auditDimensions';

export interface AuditContext {
    gameData: any;
    historicalData?: any;
    userFeedback?: any[];
    performanceMetrics?: any;
}

export class AuditEngine {
    private readonly MIN_TOTAL_SCORE = 12;
    private readonly MIN_DIMENSION_SCORE = 3;

    public auditGame(game: Game, context: AuditContext): AuditReport {
        const scores: AuditScore[] = [];
        const issues: string[] = [];

        for (const dimension of Object.keys(AUDIT_CRITERIA) as AuditDimension[]) {
            const score = scoreDimension(dimension, context.gameData, context);
            scores.push(score);

            if (score.score < this.MIN_DIMENSION_SCORE) {
                issues.push(`${dimension}: ${score.comments}`);
            }
        }

        const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
        const isFlaggedForImprovement = totalScore < this.MIN_TOTAL_SCORE;

        const improvementRecommendations = this.generateRecommendations(scores, issues);

        return {
            gameId: game.id,
            gameName: game.name,
            auditDate: new Date().toISOString(),
            auditor: 'GameQualitySystem',
            scores,
            totalScore,
            isFlaggedForImprovement,
            improvementRecommendations,
        };
    }

    public auditMultipleGames(games: Game[], contexts: Record<string, AuditContext>): Record<string, AuditReport> {
        const reports: Record<string, AuditReport> = {};

        for (const game of games) {
            const context = contexts[game.id] || { gameData: {} };
            reports[game.id] = this.auditGame(game, context);
        }

        return reports;
    }

    public getFlaggedGames(reports: Record<string, AuditReport>): AuditReport[] {
        return Object.values(reports).filter(report => report.isFlaggedForImprovement);
    }

    public getTopImprovementCandidates(reports: Record<string, AuditReport>, limit: number = 10): AuditReport[] {
        const flagged = this.getFlaggedGames(reports);
        return flagged.sort((a, b) => a.totalScore - b.totalScore).slice(0, limit);
    }

    private generateRecommendations(scores: AuditScore[], issues: string[]): string[] {
        const recommendations: string[] = [];

        for (const score of scores) {
            if (score.score < this.MIN_DIMENSION_SCORE) {
                recommendations.push(
                    `Improve ${score.dimension}: ${score.comments}. Issues: ${score.issues.join(', ')}`
                );
            }
        }

        if (issues.length > 0) {
            recommendations.push(`Address critical issues: ${issues.join('; ')}`);
        }

        return recommendations;
    }

    public calculateAverageScore(reports: AuditReport[]): number {
        if (reports.length === 0) return 0;
        const total = reports.reduce((sum, r) => sum + r.totalScore, 0);
        return total / reports.length;
    }

    public getDimensionBreakdown(reports: AuditReport[]): Record<string, number> {
        const breakdown: Record<string, number> = {};

        for (const report of reports) {
            for (const score of report.scores) {
                if (!breakdown[score.dimension]) {
                    breakdown[score.dimension] = 0;
                }
                breakdown[score.dimension] += score.score;
            }
        }

        const count = reports.length;
        for (const dimension in breakdown) {
            breakdown[dimension] = breakdown[dimension] / count;
        }

        return breakdown;
    }
}
