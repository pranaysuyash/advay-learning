/**
 * Feature Flag Configuration
 *
 * Centralized type-safe feature flags for progressive delivery.
 * Hierarchy: env var > user override > default
 *
 * @see docs/adr/ADR-007-FEATURE_FLAGS.md
 * @ticket ISSUE-006
 */

import { useSettingsStore } from '../store/settingsStore';

/** Feature flag definitions */
export interface FeatureFlags {
  /** Enable tap/dwell/snap fallback controls for CV games */
  'controls.fallbackV1': boolean;
  /** Enable standardized tracking-loss pause/recovery */
  'safety.pauseOnTrackingLoss': boolean;
  /** Enable content safety filtering for AI inputs */
  'safety.contentFilterV1': boolean;
  /** Enable deterministic rewards (non-RNG) */
  'rewards.deterministicV1': boolean;
  /** Enable voice-game tap fallbacks */
  'controls.voiceFallbackV1': boolean;
  /** Enable AI-generated LLM responses (contract-first rollout) */
  'ai.llmResponsesV1': boolean;
  /** Enable the new story generator service (Phase 3 rollout) */
  'ai.storyGeneratorV1': boolean;
  /** Enable the new activity generator service (Phase 3 rollout) */
  'ai.activityGeneratorV1': boolean;
  /** Enable STT (speech-to-text) for children to talk to Pip */
  'ai.sttV1': boolean;
  /** Enable TTS (text-to-speech) for Pip to speak */
  'ai.ttsV1': boolean;
  /** Enable cloud fallback path for AI providers (parent consent still required) */
  'ai.cloudFallbackV1': boolean;
}

/** Default flag values */
export const DEFAULT_FEATURES: FeatureFlags = {
  'controls.fallbackV1': false,
  'safety.pauseOnTrackingLoss': true,
  'safety.contentFilterV1': true, // Always on for children's safety
  'rewards.deterministicV1': false,
  'controls.voiceFallbackV1': false,
  'ai.llmResponsesV1': false,
  'ai.storyGeneratorV1': false,
  'ai.activityGeneratorV1': false,
  'ai.sttV1': false,
  'ai.ttsV1': true, // TTS already works
  'ai.cloudFallbackV1': false,
};

/** Feature flag metadata for UI display */
export interface FeatureFlagMeta {
  description: string;
  category: 'controls' | 'safety' | 'rewards' | 'ai';
  editable: boolean;
}

export const FEATURE_FLAG_META: Record<keyof FeatureFlags, FeatureFlagMeta> = {
  'controls.fallbackV1': {
    description: 'Enable tap, dwell, and snap alternatives to camera controls',
    category: 'controls',
    editable: true,
  },
  'safety.pauseOnTrackingLoss': {
    description: 'Pause game with recovery UI when camera tracking is lost',
    category: 'safety',
    editable: true,
  },
  'safety.contentFilterV1': {
    description: 'Filter inappropriate content from AI inputs',
    category: 'safety',
    editable: false, // Always on for children's safety
  },
  'rewards.deterministicV1': {
    description: 'Use deterministic progress rewards instead of random drops',
    category: 'rewards',
    editable: false, // Policy-driven, not user-configurable
  },
  'controls.voiceFallbackV1': {
    description: 'Enable tap fallback for voice-controlled games',
    category: 'controls',
    editable: true,
  },
  'ai.llmResponsesV1': {
    description: 'Enable LLM-backed dynamic Pip responses',
    category: 'ai',
    editable: true,
  },
  'ai.storyGeneratorV1': {
    description: 'Turn on the stubbed story generator service',
    category: 'ai',
    editable: true,
  },
  'ai.activityGeneratorV1': {
    description: 'Turn on the stubbed activity generator service',
    category: 'ai',
    editable: true,
  },
  'ai.sttV1': {
    description: 'Enable speech-to-text for children to talk to Pip',
    category: 'ai',
    editable: true,
  },
  'ai.ttsV1': {
    description: 'Enable text-to-speech for Pip to speak',
    category: 'ai',
    editable: false, // Already working
  },
  'ai.cloudFallbackV1': {
    description: 'Allow cloud AI fallback when local providers are unavailable',
    category: 'ai',
    editable: true,
  },
};

/** Get environment override for a flag */
function getEnvOverride(flag: keyof FeatureFlags): boolean | undefined {
  const envKey = `VITE_FEATURE_${flag.replace(/\./g, '_').toUpperCase()}`;
  const value = (import.meta as any).env?.[envKey];
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

/** Evaluate a feature flag with full hierarchy */
export function getFeatureFlag(
  flag: keyof FeatureFlags,
  userOverrides?: Partial<FeatureFlags>,
): boolean {
  // 1. Environment variable override (highest priority)
  const envValue = getEnvOverride(flag);
  if (envValue !== undefined) return envValue;

  // 2. User override from settings
  if (userOverrides?.[flag] !== undefined) {
    return userOverrides[flag];
  }

  // 3. Default value
  return DEFAULT_FEATURES[flag];
}

/** Hook to access feature flags with reactive updates */
export function useFeatureFlags(): {
  flags: FeatureFlags;
  isEnabled: (flag: keyof FeatureFlags) => boolean;
  updateFlag: (flag: keyof FeatureFlags, value: boolean) => void;
} {
  const settings = useSettingsStore();
  const userOverrides = settings.features ?? {};

  const flags: FeatureFlags = {
    'controls.fallbackV1': getFeatureFlag('controls.fallbackV1', userOverrides),
    'safety.pauseOnTrackingLoss': getFeatureFlag(
      'safety.pauseOnTrackingLoss',
      userOverrides,
    ),
    'safety.contentFilterV1': getFeatureFlag(
      'safety.contentFilterV1',
      userOverrides,
    ),
    'rewards.deterministicV1': getFeatureFlag(
      'rewards.deterministicV1',
      userOverrides,
    ),
    'controls.voiceFallbackV1': getFeatureFlag(
      'controls.voiceFallbackV1',
      userOverrides,
    ),
    'ai.llmResponsesV1': getFeatureFlag('ai.llmResponsesV1', userOverrides),
    'ai.storyGeneratorV1': getFeatureFlag('ai.storyGeneratorV1', userOverrides),
    'ai.activityGeneratorV1': getFeatureFlag(
      'ai.activityGeneratorV1',
      userOverrides,
    ),
    'ai.sttV1': getFeatureFlag('ai.sttV1', userOverrides),
    'ai.ttsV1': getFeatureFlag('ai.ttsV1', userOverrides),
    'ai.cloudFallbackV1': getFeatureFlag('ai.cloudFallbackV1', userOverrides),
  };

  const isEnabled = (flag: keyof FeatureFlags): boolean => flags[flag];

  const updateFlag = (flag: keyof FeatureFlags, value: boolean): void => {
    if (!FEATURE_FLAG_META[flag].editable) {
      console.warn(`Feature flag ${flag} is not user-editable`);
      return;
    }
    settings.updateSettings({
      features: { ...userOverrides, [flag]: value },
    });
  };

  return { flags, isEnabled, updateFlag };
}

/** Single flag hook for convenience */
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flag);
}
