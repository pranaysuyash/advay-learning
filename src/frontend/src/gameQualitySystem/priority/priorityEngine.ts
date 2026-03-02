// Priority Engine for Game Quality System

import { PriorityScore, PriorityLevel, Game, CatalogEntry } from '../types';

export interface PriorityFactors {
    educationalImpact: number;
    userDemand: number;
    implementationEffort: number;
    strategicAlignment: number;
}

export class PriorityEngine {
    private readonly WEIGHTS: PriorityFactors = {
        educationalImpact: 0.4,
        userDemand: 0.3,
        implementationEffort: 0.2,
        strategicAlignment: 0.1,
    };

    private readonly SCORE_RANGES: Record<PriorityLevel, [number, number]> = {
        P0: [90, 100],
        P1: [70, 89],
        P2: [50, 69],
        P3: [0, 49],
    };

    public calculatePriorityScore(game: Game | CatalogEntry, factors: Partial<PriorityFactors> = {}): PriorityScore {
        const weightedFactors = this.applyWeights(factors);
        const totalScore = this.normalizeScore(
            weightedFactors.educationalImpact +
            weightedFactors.userDemand +
            weightedFactors.implementationEffort +
            weightedFactors.strategicAlignment
        );

        const priorityLevel = this.determinePriorityLevel(totalScore);

        return {
            gameId: game.id,
            totalScore,
            educationalImpact: weightedFactors.educationalImpact,
            userDemand: weightedFactors.userDemand,
            implementationEffort: weightedFactors.implementationEffort,
            strategicAlignment: weightedFactors.strategicAlignment,
            priorityLevel,
        };
    }

    public calculatePriorityScoreFromGame(game: Game): PriorityScore {
        const factors = this.extractFactorsFromGame(game);
        return this.calculatePriorityScore(game, factors);
    }

    public calculatePriorityScoreFromCatalog(catalogEntry: CatalogEntry): PriorityScore {
        const factors = this.extractFactorsFromCatalog(catalogEntry);
        return this.calculatePriorityScore(catalogEntry, factors);
    }

    public rankGames(games: (Game | CatalogEntry)[]): PriorityScore[] {
        const scores: PriorityScore[] = [];

        for (const game of games) {
            const score = this.calculatePriorityScore(game);
            scores.push(score);
        }

        return scores.sort((a, b) => b.totalScore - a.totalScore);
    }

    public getPriorityQueue(games: (Game | CatalogEntry)[], limit: number = 100): PriorityScore[] {
        const ranked = this.rankGames(games);
        return ranked.slice(0, limit);
    }

    public filterByPriorityLevel(scores: PriorityScore[], level: PriorityLevel): PriorityScore[] {
        return scores.filter(s => s.priorityLevel === level);
    }

    public getPriorityRange(level: PriorityLevel): [number, number] {
        return this.SCORE_RANGES[level];
    }

    public determinePriorityLevel(score: number): PriorityLevel {
        if (score >= 90) return 'P0';
        if (score >= 70) return 'P1';
        if (score >= 50) return 'P2';
        return 'P3';
    }

    private applyWeights(factors: Partial<PriorityFactors>): PriorityFactors {
        return {
            educationalImpact: factors.educationalImpact ?? 50,
            userDemand: factors.userDemand ?? 50,
            implementationEffort: factors.implementationEffort ?? 50,
            strategicAlignment: factors.strategicAlignment ?? 50,
        };
    }

    private normalizeScore(score: number): number {
        return Math.min(100, Math.max(0, score));
    }

    private extractFactorsFromGame(game: Game): Partial<PriorityFactors> {
        const factors: Partial<PriorityFactors> = {};

        factors.educationalImpact = this.calculateEducationalImpact(game);
        factors.userDemand = this.calculateUserDemand(game);
        factors.implementationEffort = this.calculateImplementationEffort(game);
        factors.strategicAlignment = this.calculateStrategicAlignment(game);

        return factors;
    }

    private extractFactorsFromCatalog(catalogEntry: CatalogEntry): Partial<PriorityFactors> {
        const factors: Partial<PriorityFactors> = {};

        factors.educationalImpact = this.calculateEducationalImpactFromCatalog(catalogEntry);
        factors.userDemand = this.calculateUserDemandFromCatalog(catalogEntry);
        factors.implementationEffort = this.calculateImplementationEffortFromCatalog(catalogEntry);
        factors.strategicAlignment = this.calculateStrategicAlignmentFromCatalog(catalogEntry);

        return factors;
    }

    private calculateEducationalImpact(game: Game): number {
        if (!game.educationalObjectives || game.educationalObjectives.length === 0) return 0;

        const objectiveCount = game.educationalObjectives.length;
        const ageRangeScore = this.calculateAgeRangeScore(game.ageRange);

        return Math.min(100, (objectiveCount * 15) + ageRangeScore);
    }

    private calculateEducationalImpactFromCatalog(catalogEntry: CatalogEntry): number {
        if (!catalogEntry.educationalObjectives || catalogEntry.educationalObjectives.length === 0) return 0;

        const objectiveCount = catalogEntry.educationalObjectives.length;
        const ageRangeScore = this.calculateAgeRangeScore(catalogEntry.ageRange);

        return Math.min(100, (objectiveCount * 15) + ageRangeScore);
    }

    private calculateAgeRangeScore(ageRange: string): number {
        if (!ageRange || ageRange === '') return 0;

        const ranges = ageRange.split('-');
        if (ranges.length !== 2) return 50;

        const minAge = parseInt(ranges[0], 10);
        const maxAge = parseInt(ranges[1], 10);

        if (isNaN(minAge) || isNaN(maxAge)) return 50;

        const rangeSize = maxAge - minAge;
        const baseScore = 50;

        if (rangeSize <= 1) return baseScore + 20;
        if (rangeSize <= 2) return baseScore + 15;
        if (rangeSize <= 4) return baseScore;
        return baseScore - 10;
    }

    private calculateUserDemand(game: Game): number {
        if (!game.userFeedback || game.userFeedback.length === 0) return 0;

        const positiveFeedback = game.userFeedback.filter((f: any) => f.sentiment === 'positive').length;
        const totalFeedback = game.userFeedback.length;
        const sentimentScore = (positiveFeedback / totalFeedback) * 50;

        const playCountScore = Math.min(50, (game.playCount || 0) / 100);

        return sentimentScore + playCountScore;
    }

    private calculateUserDemandFromCatalog(catalogEntry: CatalogEntry): number {
        if (!catalogEntry.userFeedback || catalogEntry.userFeedback.length === 0) return 0;

        const positiveFeedback = catalogEntry.userFeedback.filter((f: any) => f.sentiment === 'positive').length;
        const totalFeedback = catalogEntry.userFeedback.length;
        const sentimentScore = (positiveFeedback / totalFeedback) * 50;

        const playCountScore = Math.min(50, (catalogEntry.playCount || 0) / 100);

        return sentimentScore + playCountScore;
    }

    private calculateImplementationEffort(game: Game): number {
        if (!game.estimatedTime || game.estimatedTime === 0) return 50;

        const estimatedHours = game.estimatedTime;
        const baseScore = 100;

        if (estimatedHours <= 8) return baseScore;
        if (estimatedHours <= 16) return baseScore - 20;
        if (estimatedHours <= 40) return baseScore - 40;
        return baseScore - 60;
    }

    private calculateImplementationEffortFromCatalog(catalogEntry: CatalogEntry): number {
        if (!catalogEntry.estimatedTime || catalogEntry.estimatedTime === 0) return 50;

        const estimatedHours = catalogEntry.estimatedTime;
        const baseScore = 100;

        if (estimatedHours <= 8) return baseScore;
        if (estimatedHours <= 16) return baseScore - 20;
        if (estimatedHours <= 40) return baseScore - 40;
        return baseScore - 60;
    }

    private calculateStrategicAlignment(game: Game): number {
        if (!game.category || game.category === '') return 0;

        const strategicCategories = ['Literacy', 'Numeracy', 'Motor Skills', 'Social-Emotional'];
        const isStrategic = strategicCategories.includes(game.category);

        return isStrategic ? 100 : 50;
    }

    private calculateStrategicAlignmentFromCatalog(catalogEntry: CatalogEntry): number {
        if (!catalogEntry.category || catalogEntry.category === '') return 0;

        const strategicCategories = ['Literacy', 'Numeracy', 'Motor Skills', 'Social-Emotional'];
        const isStrategic = strategicCategories.includes(catalogEntry.category);

        return isStrategic ? 100 : 50;
    }
}
