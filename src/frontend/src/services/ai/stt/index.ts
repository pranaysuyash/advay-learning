/**
 * STT Service Exports
 *
 * Speech-to-Text service for children to talk to Pip.
 * @see docs/research/STT_PROVIDER_SURVEY_2026-03-05.md
 */

export {
  STTService,
  sttService,
  type STTServiceOptions,
  type STTServiceStatus,
  type STTServiceDependencies,
} from './STTService';
export {
  type STTProvider,
  type STTProviderOptions,
  type STTTranscript,
  type STTProviderStatus,
} from './STTProvider';
export { WebSpeechSTTProvider } from './WebSpeechSTTProvider';
export { WhisperSTTProvider } from './WhisperSTTProvider';
