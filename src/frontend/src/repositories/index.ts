/**
 * Progress Repository Module
 * 
 * Provides dependency injection for progress storage operations.
 * 
 * Usage:
 * ```typescript
 * // Production
 * import { progressRepository } from './repositories';
 * 
 * // Testing
 * import { InMemoryProgressRepository } from './repositories';
 * const testRepo = new InMemoryProgressRepository();
 * ```
 */

export type { ProgressRepository, DeadLetterItem, QueueStats } from './ProgressRepository';
export { LocalStorageProgressRepository, progressRepository } from './LocalStorageProgressRepository';
export { InMemoryProgressRepository } from './InMemoryProgressRepository';
