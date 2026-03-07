/**
 * Safety Service Exports
 *
 * Content filtering for children's AI interactions.
 * @see docs/research/CONTENT_SAFETY_MODERATION.md
 */

export { safetyService, type SafetyCategory, type SafetyResult } from './SafetyService';
export { SAFE_RESPONSES, getSafeResponse } from './SafeResponses';
