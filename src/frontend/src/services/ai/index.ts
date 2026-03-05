/**
 * AI Services Exports
 *
 * Central export for all AI-related services including TTS, STT, LLM, and
 * future generators. This file makes it convenient for callers to import
 * multiple functionalities from a single path.
 * @see docs/ai-native/ARCHITECTURE.md
 */

// TTS (Text-to-Speech)
export { TTSService, ttsService, type TTSOptions } from './tts';

// LLM (Text Generation)
export {
  LLMService,
  llmService,
  type LLMProvider,
  type LLMModel,
  type LLMRequest,
  type LLMResponse,
  type LLMRuntimeConfig,
  type LLMRuntimeEnvironment,
  type LLMRuntimePlan,
} from './llm';

// Generators (Phase 3)
export {
  type StoryGenerator,
  type StoryParams,
  type StoryResult,
  StubStoryGenerator,
  type ActivityGenerator,
  type ActivityParams,
  type ActivityResult,
  StubActivityGenerator,
} from './generators';
