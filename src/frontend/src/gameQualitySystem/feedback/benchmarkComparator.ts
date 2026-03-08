// Benchmark Comparison Logic for Feedback Module
// Compares metrics against game-specific benchmarks and calculates deviations
// Validates: Requirement 10.2

import type { GameMetrics } from '../types';

/**
 * Game-specific benchmarks for comparing metrics
 * Each game can have its own benchmarks based on game type, difficulty, target audience, etc.
 */
export interface GameBenchmark {
    gameId: string;
    gameType: GameType;
    playCount: {
        target: number;
        minimum: number;
        maximum: number;
    };
    completionRate: {
        target: number;      // Target completion rate (percentage)
        minimum: number;     // Minimum acceptable rate (percentage)
        maximum: number;     // Maximum expected rate (percentage)
    };
    averageScore: {
        target: number;      // Target average score (0-100)
        minimum: number;     // Minimum acceptable score (0-100)
        maximum: number;     // Maximum expected score (0-100)
    };
    timeOnTask: {
        target: number;      // Target session duration in seconds
        minimum: number;     // Minimum expected duration (seconds)
        maximum: number;     // Maximum expected duration (seconds)
    };
    errorRate: {
        target: number;      // Target error rate (0-1)
        minimum: number;     // Minimum acceptable error rate (0-1)
        maximum: number;     // Maximum error rate threshold (0-1)
    };
}

/**
 * Game types that can have different benchmark expectations
 */
export type GameType =
    | 'puzzle'
    | 'action'
    | 'educational'
    | 'quiz'
    | 'simulation'
    | 'adventure';

/**
 * Result of comparing a single metric against its benchmark
 */
export interface MetricComparison {
    metricName: string;
    actualValue: number;
    benchmarkTarget: number;
    benchmarkMinimum: number;
    benchmarkMaximum: number;
    deviation: number;           // Deviation from target (positive = above target, negative = below)
    deviationPercentage: number; // Percentage deviation from target
    isWithinRange: boolean;      // Whether value is within min-max range
    status: 'above_target' | 'within_range' | 'below_minimum' | 'above_maximum';
}

/**
 * Complete benchmark comparison result for all metrics
 */
export interface BenchmarkComparisonResult {
    gameId: string;
    gameType: GameType;
    comparisonDate: string;
    overallStatus: 'meets_benchmark' | 'needs_attention' | 'below_standard';
    metricsComparison: {
        playCount: MetricComparison;
        completionRate: MetricComparison;
        averageScore: MetricComparison;
        timeOnTask: MetricComparison;
        errorRate: MetricComparison;
    };
    totalDeviation: number;      // Sum of absolute deviations
    metricsWithinBenchmark: number; // Count of metrics within acceptable range
    totalMetrics: number;
    recommendations: string[];
}

/**
 * Default benchmarks for different game types
 */
export const DEFAULT_BENCHMARKS: Record<GameType, Omit<GameBenchmark, 'gameId' | 'gameType'>> = {
    puzzle: {
        playCount: { target: 500, minimum: 100, maximum: 2000 },
        completionRate: { target: 70, minimum: 40, maximum: 95 },
        averageScore: { target: 75, minimum: 50, maximum: 95 },
        timeOnTask: { target: 300, minimum: 60, maximum: 600 },
        errorRate: { target: 0.05, minimum: 0, maximum: 0.15 },
    },
    action: {
        playCount: { target: 800, minimum: 200, maximum: 3000 },
        completionRate: { target: 60, minimum: 30, maximum: 90 },
        averageScore: { target: 70, minimum: 45, maximum: 90 },
        timeOnTask: { target: 180, minimum: 30, maximum: 400 },
        errorRate: { target: 0.08, minimum: 0, maximum: 0.2 },
    },
    educational: {
        playCount: { target: 400, minimum: 80, maximum: 1500 },
        completionRate: { target: 80, minimum: 50, maximum: 98 },
        averageScore: { target: 80, minimum: 55, maximum: 95 },
        timeOnTask: { target: 420, minimum: 120, maximum: 900 },
        errorRate: { target: 0.03, minimum: 0, maximum: 0.1 },
    },
    quiz: {
        playCount: { target: 600, minimum: 150, maximum: 2500 },
        completionRate: { target: 85, minimum: 60, maximum: 99 },
        averageScore: { target: 72, minimum: 50, maximum: 90 },
        timeOnTask: { target: 240, minimum: 60, maximum: 480 },
        errorRate: { target: 0.04, minimum: 0, maximum: 0.12 },
    },
    simulation: {
        playCount: { target: 300, minimum: 50, maximum: 1000 },
        completionRate: { target: 55, minimum: 25, maximum: 85 },
        averageScore: { target: 68, minimum: 40, maximum: 88 },
        timeOnTask: { target: 600, minimum: 180, maximum: 1800 },
        errorRate: { target: 0.06, minimum: 0, maximum: 0.15 },
    },
    adventure: {
        playCount: { target: 450, minimum: 100, maximum: 1800 },
        completionRate: { target: 65, minimum: 35, maximum: 92 },
        averageScore: { target: 73, minimum: 48, maximum: 92 },
        timeOnTask: { target: 480, minimum: 120, maximum: 1200 },
        errorRate: { target: 0.07, minimum: 0, maximum: 0.18 },
    },
};

/**
 * Creates a game benchmark with default values for the given game type
 */
export function createGameBenchmark(
    gameId: string,
    gameType: GameType,
    overrides?: Partial<GameBenchmark>
): GameBenchmark {
    const defaults = DEFAULT_BENCHMARKS[gameType];
    return {
        gameId,
        gameType,
        playCount: { ...defaults.playCount, ...overrides?.playCount },
        completionRate: { ...defaults.completionRate, ...overrides?.completionRate },
        averageScore: { ...defaults.averageScore, ...overrides?.averageScore },
        timeOnTask: { ...defaults.timeOnTask, ...overrides?.timeOnTask },
        errorRate: { ...defaults.errorRate, ...overrides?.errorRate },
    };
}

/**
 * Compares a single metric value against its benchmark
 */
function compareMetric(
    metricName: string,
    actualValue: number,
    benchmark: { target: number; minimum: number; maximum: number }
): MetricComparison {
    const deviation = actualValue - benchmark.target;
    const deviationPercentage = benchmark.target !== 0
        ? (deviation / benchmark.target) * 100
        : 0;

    let status: MetricComparison['status'];
    if (actualValue < benchmark.minimum) {
        status = 'below_minimum';
    } else if (actualValue > benchmark.maximum) {
        status = 'above_maximum';
    } else if (actualValue >= benchmark.target) {
        status = 'above_target';
    } else {
        status = 'within_range';
    }

    return {
        metricName,
        actualValue,
        benchmarkTarget: benchmark.target,
        benchmarkMinimum: benchmark.minimum,
        benchmarkMaximum: benchmark.maximum,
        deviation,
        deviationPercentage,
        isWithinRange: actualValue >= benchmark.minimum && actualValue <= benchmark.maximum,
        status,
    };
}

/**
 * Compares game metrics against game-specific benchmarks
 * Validates: Requirement 10.2 - "WHILE analyzing feedback, THE Feedback_Module SHALL compare against game-specific benchmarks"
 */
export function compareAgainstBenchmark(
    metrics: GameMetrics,
    benchmark: GameBenchmark
): BenchmarkComparisonResult {
    // Compare each metric against its benchmark
    const playCountComparison = compareMetric(
        'Play_Count',
        metrics.playCount,
        benchmark.playCount
    );

    const completionRateComparison = compareMetric(
        'Completion_Rate',
        metrics.completionRate,
        benchmark.completionRate
    );

    const averageScoreComparison = compareMetric(
        'Average_Score',
        metrics.averageScore,
        benchmark.averageScore
    );

    const timeOnTaskComparison = compareMetric(
        'Time_On_Task',
        metrics.timeOnTask,
        benchmark.timeOnTask
    );

    const errorRateComparison = compareMetric(
        'Error_Rate',
        metrics.errorRate,
        benchmark.errorRate
    );

    const metricsComparison = {
        playCount: playCountComparison,
        completionRate: completionRateComparison,
        averageScore: averageScoreComparison,
        timeOnTask: timeOnTaskComparison,
        errorRate: errorRateComparison,
    };

    // Calculate overall statistics
    const metricsWithinBenchmark = Object.values(metricsComparison).filter(m => m.isWithinRange).length;
    const totalMetrics = Object.keys(metricsComparison).length;

    // Calculate total deviation (sum of absolute percentage deviations)
    const totalDeviation = Object.values(metricsComparison).reduce(
        (sum, m) => sum + Math.abs(m.deviationPercentage),
        0
    );

    // Determine overall status
    let overallStatus: BenchmarkComparisonResult['overallStatus'];
    const belowMinimumCount = Object.values(metricsComparison).filter(
        m => m.status === 'below_minimum'
    ).length;

    if (metricsWithinBenchmark === totalMetrics) {
        overallStatus = 'meets_benchmark';
    } else if (belowMinimumCount >= 2 || totalDeviation > 100) {
        overallStatus = 'below_standard';
    } else {
        overallStatus = 'needs_attention';
    }

    // Generate recommendations based on comparison results
    const recommendations = generateRecommendations(metricsComparison);

    return {
        gameId: metrics.gameId,
        gameType: benchmark.gameType,
        comparisonDate: new Date().toISOString(),
        overallStatus,
        metricsComparison,
        totalDeviation,
        metricsWithinBenchmark,
        totalMetrics,
        recommendations,
    };
}

/**
 * Generates recommendations based on metric comparison results
 */
function generateRecommendations(
    metricsComparison: BenchmarkComparisonResult['metricsComparison']
): string[] {
    const recommendations: string[] = [];

    // Check play count
    if (metricsComparison.playCount.status === 'below_minimum') {
        recommendations.push('Consider marketing or promotion to increase play count');
    } else if (metricsComparison.playCount.status === 'above_target') {
        recommendations.push('High play count - consider adding new content or levels');
    }

    // Check completion rate
    if (metricsComparison.completionRate.status === 'below_minimum') {
        recommendations.push('Review game flow and reduce friction points to improve completion rate');
    } else if (metricsComparison.completionRate.deviationPercentage < -20) {
        // Requirement 10.3: Recommend review if completion rate is below benchmark by more than 20%
        recommendations.push('Completion rate is more than 20% below benchmark - review recommended');
    }

    // Check average score
    if (metricsComparison.averageScore.status === 'below_minimum') {
        recommendations.push('Investigate factors affecting scores - consider adjusting difficulty');
    } else if (metricsComparison.averageScore.status === 'above_target') {
        recommendations.push('High average scores - consider increasing difficulty for challenge');
    }

    // Check time on task
    if (metricsComparison.timeOnTask.status === 'below_minimum') {
        recommendations.push('Sessions are too short - add engaging content or reduce complexity');
    } else if (metricsComparison.timeOnTask.status === 'above_maximum') {
        recommendations.push('Sessions are too long - consider breaking into shorter segments');
    }

    // Check error rate
    if (metricsComparison.errorRate.status === 'above_maximum') {
        recommendations.push('High error rate - investigate and fix common errors');
    } else if (metricsComparison.errorRate.deviation > 0.05) {
        recommendations.push('Error rate is above target - prioritize bug fixes');
    }

    // Add general recommendation if all metrics are good
    if (recommendations.length === 0) {
        recommendations.push('All metrics are within acceptable range - continue monitoring');
    }

    return recommendations;
}

/**
 * Calculates the deviation percentage from benchmark for a specific metric
 * Useful for quick checks without full comparison result
 */
export function calculateDeviation(
    actualValue: number,
    targetValue: number
): number {
    if (targetValue === 0) {
        return actualValue > 0 ? 100 : 0;
    }
    return ((actualValue - targetValue) / targetValue) * 100;
}

/**
 * Checks if a metric is within acceptable range of the benchmark
 */
export function isWithinBenchmark(
    actualValue: number,
    minimum: number,
    maximum: number
): boolean {
    return actualValue >= minimum && actualValue <= maximum;
}

/**
 * Gets the status of a metric relative to its benchmark
 */
export function getMetricStatus(
    actualValue: number,
    target: number,
    minimum: number,
    maximum: number
): MetricComparison['status'] {
    if (actualValue < minimum) return 'below_minimum';
    if (actualValue > maximum) return 'above_maximum';
    if (actualValue >= target) return 'above_target';
    return 'within_range';
}