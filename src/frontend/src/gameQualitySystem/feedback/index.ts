// Feedback module exports

export { FeedbackEngine } from './feedbackEngine';
export {
    extractMetrics,
    createMetricsExtractor,
    validateMetrics,
    DEFAULT_METRICS_CONFIG,
    type RawInteractionData,
    type SessionData,
    type GameResult,
    type ErrorEvent,
    type InteractionEvent,
    type MetricsExtractionConfig,
} from './metricsExtractor';
export {
    compareAgainstBenchmark,
    createGameBenchmark,
    calculateDeviation,
    isWithinBenchmark,
    getMetricStatus,
    DEFAULT_BENCHMARKS,
    type GameBenchmark,
    type GameType,
    type MetricComparison,
    type BenchmarkComparisonResult,
} from './benchmarkComparator';
export {
    shouldRecommendReview,
    batchReviewRecommendations,
    filterGamesNeedingReview,
    getReviewPriority,
    sortByReviewPriority,
    DEFAULT_REVIEW_RECOMMENDATION_CONFIG,
    type ReviewRecommendation,
    type ReviewRecommendationConfig,
    type ReviewRecommendationType,
} from './reviewRecommendation';
export {
    generateImprovementSuggestions,
    generateImprovementSuggestionsWithReview,
    filterSuggestionsByCategory,
    filterSuggestionsByPriority,
    getMostImpactfulSuggestion,
    generateSuggestionsSummary,
    DEFAULT_IMPROVEMENT_SUGGESTIONS_CONFIG,
    type ImprovementSuggestion,
    type ImprovementCategory,
    type SuggestionSupportingData,
    type ImprovementSuggestionsConfig,
    type ImprovementSuggestionsResult,
} from './improvementSuggestions';
export {
    generateDashboardData,
    generateDashboardDataWithAnalysis,
    getDashboardSummary,
    filterDashboardByPriority,
    generateDashboardReport,
    DEFAULT_DASHBOARD_CONFIG,
    type DashboardData,
    type RecentChange,
    type RecommendedAction,
    type GameHealthScoreBreakdown,
    type DashboardDataConfig,
} from './dashboardData';
export type { FeedbackAnalysis, FeedbackData, MetricsData } from '../types';
export type { GameMetrics } from '../types';
