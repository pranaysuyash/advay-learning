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
    lastUpdated: string;
}
