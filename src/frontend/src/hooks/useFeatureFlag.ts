/**
 * useFeatureFlag Hook
 * 
 * React hook for accessing feature flags with reactive updates.
 * 
 * @example
 * ```tsx
 * const fallbackEnabled = useFeatureFlag('controls.fallbackV1');
 * 
 * if (fallbackEnabled) {
 *   return <FallbackControls />;
 * }
 * ```
 */

export { useFeatureFlag, useFeatureFlags } from '../config/features';
