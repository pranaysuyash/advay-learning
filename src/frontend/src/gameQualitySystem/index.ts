// Game Quality System - Main entry point

export { AuditEngine } from './audit/auditEngine';
export type {
    AuditScore,
    AuditReport,
    Game,
    PriorityScore,
    PriorityLevel,
    QualityGateStatus,
} from './types';
export { PriorityEngine } from './priority/priorityEngine';
export {
    calculateEducationalImpact,
    calculateCurriculumAlignment,
    calculateAgeRangeBreadth,
    calculateSkillDiversity,
    isValidEducationalImpact,
    EDUCATIONAL_IMPACT_WEIGHTS,
    type EducationalImpactBreakdown,
} from './priority/educationalImpact';
export {
    calculatePriorityScore,
    determinePriorityLevel,
    createPriorityScore,
    isValidPriorityFactors,
    getPriorityFactorWeight,
    getPriorityRange,
    PRIORITY_SCORE_WEIGHTS,
} from './priority/calculatePriorityScore';
export {
    PriorityChangeLogger,
    createPriorityChangeEvent,
    hasPriorityChanged,
    type PriorityChangeEvent,
    type TrackedGamePriority,
    type PriorityListEntry,
    type PriorityList,
    type PriorityUpdateResult,
    DEFAULT_PRIORITY_CHANGE_CONFIG,
} from './priority/priorityChangeLog';
export { QualityGate } from './qualityGate/qualityGate';
export { FeedbackEngine } from './feedback/feedbackEngine';
export {
    extractMetrics,
    createMetricsExtractor,
    validateMetrics,
    DEFAULT_METRICS_CONFIG,
} from './feedback/metricsExtractor';
export { MetricsCollector } from './metrics/metricsCollector';
export { QueueGenerator } from './queue/queueGenerator';
export { DocumentationGenerator } from './documentation/documentationGenerator';
export { IntegrationEngine } from './integration/integrationEngine';
export { ImplementationGate } from './implementationGate/implementationGate';
