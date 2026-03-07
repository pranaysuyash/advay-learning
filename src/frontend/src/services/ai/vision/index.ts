/**
 * Vision Service Exports
 *
 * Unified vision service for hand tracking, pose, and face detection.
 * @see docs/research/VISION_PROVIDER_SURVEY_2026-03-05.md
 */

export {
  VisionService,
  visionService,
  MEDIAPIPE_CDN,
  type VisionServiceOptions,
  type VisionServiceDependencies,
  type HandLandmarkerConfig,
} from './VisionService';
export {
  type VisionProvider,
  type VisionTask,
  type VisionProviderOptions,
  type VisionResult,
  type VisionProviderStatus,
  type HandResult,
} from './VisionProvider';
export { MediaPipeVisionProvider } from './MediaPipeVisionProvider';
