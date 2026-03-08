// Priority module exports

export { PriorityEngine } from './priorityEngine';
export { normalizeToScale, normalizeFromZero, normalizePercentage, normalizeInverted, normalizeArray, clampToHundred } from './normalization';
export { calculateEducationalImpact, calculateCurriculumAlignment, calculateAgeRangeBreadth, calculateSkillDiversity, isValidEducationalImpact, EDUCATIONAL_IMPACT_WEIGHTS, type EducationalImpactBreakdown } from './educationalImpact';
export { calculatePriorityScore, determinePriorityLevel, createPriorityScore, isValidPriorityFactors, getPriorityFactorWeight, getPriorityRange, PRIORITY_SCORE_WEIGHTS } from './calculatePriorityScore';
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
} from './priorityChangeLog';
export type { PriorityScore, PriorityLevel, PriorityFactors } from '../types';
