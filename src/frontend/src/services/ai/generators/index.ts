/**
 * AI Generators Index
 * 
 * Factory pattern for creating appropriate story and activity generators
 * based on feature flags. Provides seamless fallback from LLM to stubs.
 */

import { getFeatureFlag } from '../../../config/features';
import { LLMStoryGenerator } from './LLMStoryGenerator';
import { 
  StubStoryGenerator, 
  StoryGeneratorService,
  type StoryGenerator, 
  type StoryParams, 
  type StoryResult 
} from './StoryGenerator';
import { 
  StubActivityGenerator,
  ActivityGeneratorService,
  type ActivityGenerator, 
  type ActivityParams, 
  type ActivityResult 
} from './ActivityGenerator';

// Re-export types
export type { 
  StoryGenerator, 
  StoryParams, 
  StoryResult,
  ActivityGenerator,
  ActivityParams, 
  ActivityResult,
};

// Re-export classes for direct use
export { 
  LLMStoryGenerator,
  StubStoryGenerator,
  StoryGeneratorService,
  StubActivityGenerator,
  ActivityGeneratorService,
};

// Re-export cache and fallback for advanced use
export { StoryCache } from './StoryCache';
export { FallbackStoryLibrary } from './FallbackStoryLibrary';

// Re-export LLM result type
export type { LLMStoryResult } from './LLMStoryGenerator';

/**
 * Factory function to create the appropriate story generator
 * based on feature flags.
 * 
 * Usage:
 * ```typescript
 * const generator = createStoryGenerator();
 * const story = await generator.generate({ prompt: 'tiger', age: 5 });
 * ```
 */
export function createStoryGenerator(): StoryGenerator {
  // Check feature flag
  if (getFeatureFlag('ai.storyGeneratorV1')) {
    return new LLMStoryGenerator();
  }
  
  // Return template-based service if feature disabled
  return new StoryGeneratorService();
}

/**
 * Factory function to create the appropriate activity generator
 * based on feature flags.
 * 
 * Usage:
 * ```typescript
 * const generator = createActivityGenerator();
 * const activity = await generator.generate({ topic: 'letters', age: 4 });
 * ```
 */
export function createActivityGenerator(): ActivityGenerator {
  // Check feature flag
  if (getFeatureFlag('ai.activityGeneratorV1')) {
    // TODO: Implement LLMActivityGenerator when ready
    // For now, return ActivityGeneratorService even if flag is enabled
    console.warn('[createActivityGenerator] LLM activity generator not yet implemented, using template-based');
    return new ActivityGeneratorService();
  }
  
  // Return template-based service if feature disabled
  return new ActivityGeneratorService();
}

/**
 * Check if LLM story generation is available
 */
export function isLLMStoryGenerationEnabled(): boolean {
  return getFeatureFlag('ai.storyGeneratorV1');
}

/**
 * Check if LLM activity generation is available
 */
export function isLLMActivityGenerationEnabled(): boolean {
  return getFeatureFlag('ai.activityGeneratorV1');
}

/**
 * Get a story generator that always uses LLM (for testing/override)
 * Bypasses feature flags
 */
export function createForcedLLMStoryGenerator(): LLMStoryGenerator {
  return new LLMStoryGenerator();
}

/**
 * Get a story generator that always uses fallback library (for offline mode)
 */
export function createOfflineStoryGenerator(): StubStoryGenerator {
  return new StubStoryGenerator();
}
