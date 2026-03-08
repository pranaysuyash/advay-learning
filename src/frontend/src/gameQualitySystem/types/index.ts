// Core types for Game Quality System

export type GameId = string;
export type AuditDimension = 'Educational_Value' | 'User_Experience' | 'Technical_Quality' | 'Accessibility' | 'Content_Completeness';
export type PriorityLevel = 'P0' | 'P1' | 'P2' | 'P3';
export type QualityGateStatus = 'passed' | 'failed' | 'pending';

export interface Game {
    id: GameId;
    name: string;
    description: string;
    category: string;
    ageRange: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    estimatedTime: number;
    requiredTechnologies: string[];
    successCriteria: string[];
    isImplemented: boolean;
    implementationStatus?: 'not-started' | 'in-progress' | 'completed' | 'review' | 'production';
    catalogPriority?: PriorityLevel;
    educationalObjectives?: string[];
    userFeedback?: Array<{ sentiment?: string; score?: number;[key: string]: unknown }>;
    playCount?: number;
    completionRate?: number; // Percentage of users who complete the game (0-100)
    lastUpdated: string;
}

export interface AuditScore {
    dimension: AuditDimension;
    score: number;
    comments: string;
    issues: string[];
}

export interface AuditReport {
    gameId: GameId;
    gameName: string;
    auditDate: string;
    auditor: string;
    scores: AuditScore[];
    totalScore: number;
    isFlaggedForImprovement: boolean;
    improvementRecommendations: string[];
}

export interface PriorityScore {
    gameId: GameId;
    totalScore: number;
    educationalImpact: number;
    userDemand: number;
    implementationEffort: number;
    strategicAlignment: number;
    priorityLevel: PriorityLevel;
}

export interface QualityGateCheck {
    checkName: string;
    status: QualityGateStatus;
    details: string;
    timestamp: string;
    reviewer?: string;
}

export interface QualityGateResult {
    gameId: GameId;
    status: QualityGateStatus;
    checks: QualityGateCheck[];
    releaseCertificate?: string;
    failureReasons?: string[];
}

export interface AccessibilityCheck {
    colorContrastRatio: number;
    keyboardNavigation: boolean;
    screenReaderSupport: boolean;
    timeoutOptions: boolean;
    complianceLevel: 'WCAG-AA' | 'WCAG-AAA' | 'partial' | 'none';
}

export interface FeedbackData {
    playCount: number;
    completionRate: number;
    averageScore: number;
    timeOnTask: number;
    errorRate: number;
    userFeedback: string[];
    lastUpdated: string;
}

export interface MetricsData {
    gameId: GameId;
    preImprovement?: {
        qualityScore: number;
        engagementRate: number;
        completionRate: number;
        bugCount: number;
    };
    postImprovement?: {
        qualityScore: number;
        engagementRate: number;
        completionRate: number;
        bugCount: number;
    };
    changePercentage: number;
    statisticalSignificance: 'high' | 'medium' | 'low' | 'insufficient';
    lastUpdated: string;
}

export interface MetricsConfig {
    trackingPeriods: string[];
    requiredMetrics: string[];
    statisticalThreshold: number;
}

export interface FeedbackAnalysis {
    gameHealthScore: number;
    recentChanges: string[];
    recommendedActions: string[];
    issues: string[];
}

export interface PriorityFactors {
    educationalImpact: number;
    userDemand: number;
    implementationEffort: number;
    strategicAlignment: number;
}

/**
 * User Demand breakdown with individual component scores
 */
export interface UserDemandBreakdown {
    userFeedbackScore: number;    // 0-100: Aggregate score from user feedback
    playCount: number;            // 0-100: Normalized play count score
    completionRate: number;       // 0-100: Normalized completion rate score
    totalScore: number;           // 0-100: Weighted total user demand score
}

/**
 * Weights for user demand components
 */
export const USER_DEMAND_WEIGHTS = {
    userFeedbackScore: 0.4,
    playCount: 0.3,
    completionRate: 0.3,
};

export interface QualityGateConfig {
    requiredChecks: string[];
    minAccessibilityScore: number;
    minTestCoverage: number;
    requireDocumentation: boolean;
}

export interface ImplementationPlan {
    gameId: GameId;
    tasks: ImplementationTask[];
    estimatedEffortHours: number;
    dependencies: GameId[];
    requiredAssets: string[];
    testRequirements: string[];
}

export interface ImplementationTask {
    id: string;
    description: string;
    estimatedHours: number;
    dependencies: string[];
    isTestTask: boolean;
    propertyNumber?: number;
    requirementRefs: string[];
}

export interface QueueEntry {
    gameId: GameId;
    gameName: string;
    priority: PriorityLevel;
    estimatedEffortHours: number;
    dependencies: GameId[];
    recommendedStartDate: string;
    status: 'pending' | 'in-progress' | 'completed';
}

export interface DocumentationEntry {
    gameId: GameId;
    changeLog: string[];
    implementationReport: string;
    metricsSummary: MetricsData;
    beforeAfterComparisons: {
        qualityScore: { before: number; after: number; change: number };
        engagementRate: { before: number; after: number; change: number };
        completionRate: { before: number; after: number; change: number };
    };
    keyDecisions: string[];
    lessonsLearned: string[];
    nextSteps: string[];
    timestamp: string;
}

export interface CatalogEntry {
    gameId: GameId;
    id?: GameId;
    name: string;
    description: string;
    category: string;
    subcategory: string;
    ageRange: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    estimatedTime: number;
    requiredTechnologies: string[];
    successCriteria: string[];
    educationalObjectives: string[];
    skillsDeveloped: string[];
    isImplemented: boolean;
    implementationStatus?: 'not-started' | 'in-progress' | 'completed' | 'review' | 'production';
    priority?: PriorityLevel;
    userFeedback?: Array<{ sentiment?: string; score?: number;[key: string]: unknown }>;
    playCount?: number;
    completionRate?: number; // Percentage of users who complete the game (0-100)
    lastUpdated: string;
}

/**
 * Game metrics extracted from user interaction data
 * Requirement 10.1: Extract Play_Count, Completion_Rate, Average_Score, Time_On_Task, and Error_Rate
 */
export interface GameMetrics {
    gameId: GameId;
    playCount: number;           // Number of unique play sessions
    completionRate: number;      // Percentage of sessions that completed (0-100)
    averageScore: number;        // Average score from completed sessions (0-100)
    timeOnTask: number;          // Average session duration in seconds
    errorRate: number;           // Errors per session (0-1 scale)
    lastUpdated: string;
}

/**
 * Raw interaction event from gameplay
 */
export interface InteractionEvent {
    eventType: 'click' | 'keypress' | 'drag' | 'drop' | 'hover' | 'input' | 'start' | 'complete' | 'pause' | 'resume';
    timestamp: number;
    targetElement?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Session data from gameplay sessions
 */
export interface SessionData {
    sessionId: string;
    startTime: number;
    endTime: number;
    gameId: string;
    userId?: string;
    completed: boolean;
    score?: number;
}

/**
 * Game result from a completed session
 */
export interface GameResult {
    resultId: string;
    sessionId: string;
    score: number;
    completed: boolean;
    completionTime: number;
    timestamp: number;
}

/**
 * Error event during gameplay
 */
export interface ErrorEvent {
    errorId: string;
    timestamp: number;
    errorType: string;
    errorMessage: string;
    sessionId: string;
    recoverable: boolean;
}

/**
 * Raw user interaction data for metrics extraction
 */
export interface RawInteractionData {
    events: InteractionEvent[];
    sessions: SessionData[];
    gameResults: GameResult[];
    errorEvents: ErrorEvent[];
}
