// Metrics module exports

export { MetricsCollector } from './metricsCollector';
export type { MetricsData, MetricsConfig } from '../types';

// Improvement Metrics (Requirement 4.1)
export {
    ImprovementMetricsCalculator,
    createImprovementMetricsCalculator,
    type ImprovementBaseline,
    type ImprovementOutcome,
    type ImprovementMetrics,
    type ImprovementMetricsConfig,
    DEFAULT_IMPROVEMENT_METRICS_CONFIG,
} from './improvementMetrics';

// Engagement Metrics (Requirement 4.3)
export {
    EngagementMetricsCalculator,
    createEngagementMetricsCalculator,
    type SessionData,
    type UserPlayData,
    type FeedbackEntry,
    type EngagementDataInput,
    type EngagementMetrics,
    type EngagementMetricsConfig,
    DEFAULT_ENGAGEMENT_METRICS_CONFIG,
} from './engagementMetrics';

// Launch Metrics (Requirement 5.1)
export {
    LaunchMetricsCalculator,
    createLaunchMetricsCalculator,
    type LaunchWeekMetrics,
    type ThirtyDayMetrics,
    type NinetyDayMetrics,
    type LaunchMetrics,
    type LaunchDataInput,
    type LaunchMetricsConfig,
    DEFAULT_LAUNCH_METRICS_CONFIG,
} from './launchMetrics';

// Engagement Rate (Requirement 5.3)
export {
    EngagementRateCalculator,
    createEngagementRateCalculator,
    type EngagementRateInput,
    type EngagementRateResult,
    type EngagementRateConfig,
    DEFAULT_ENGAGEMENT_RATE_CONFIG,
} from './engagementRate';

// Low Engagement Flagging (Requirement 5.4)
export {
    LowEngagementFlagService,
    createLowEngagementFlagService,
    type GameEngagementData,
    type LowEngagementFlag,
    type LowEngagementFlagConfig,
    DEFAULT_LOW_ENGAGEMENT_FLAG_CONFIG,
} from './lowEngagementFlag';

// ROI Analysis (Requirement 5.5)
export {
    ROIAnalysisGenerator,
    createROIAnalysisGenerator,
    type BaselineProjections,
    type NinetyDayMetricsInput,
    type ROIAnalysis,
    type ROIAnalysisConfig,
    DEFAULT_ROI_ANALYSIS_CONFIG,
} from './roiAnalysis';
