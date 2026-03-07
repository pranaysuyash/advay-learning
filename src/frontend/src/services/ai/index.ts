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
  StoryGeneratorService,
  type ActivityGenerator,
  type ActivityParams,
  type ActivityResult,
  StubActivityGenerator,
  ActivityGeneratorService,
} from './generators';

// STT (Speech-to-Text)
export {
  STTService,
  sttService,
  WebSpeechSTTProvider,
  WhisperSTTProvider,
  type STTServiceOptions,
  type STTServiceStatus,
  type STTServiceDependencies,
  type STTProvider,
  type STTProviderOptions,
  type STTTranscript,
  type STTProviderStatus,
} from './stt';

// Vision (Hand/Pose/Face)
export {
  VisionService,
  visionService,
  MediaPipeVisionProvider,
  type VisionServiceOptions,
  type VisionServiceDependencies,
  type VisionProvider,
  type VisionTask,
  type VisionProviderOptions,
  type VisionResult,
  type VisionProviderStatus,
  type HandResult,
} from './vision';
