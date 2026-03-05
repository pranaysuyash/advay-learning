/**
 * Haptic feedback utilities for touch-based interactions.
 *
 * Provides typed constants for haptic types to ensure autocomplete
 * and type safety across the codebase (150+ call sites).
 *
 * @example
 * ```tsx
 * import { triggerHaptic, HAPTIC_TYPES } from './utils/haptics';
 *
 * const handleCorrect = () => {
 *   triggerHaptic(HAPTIC_TYPES.SUCCESS); // Type-safe, autocomplete-friendly
 * };
 *
 * const handleError = () => {
 *   triggerHaptic(HAPTIC_TYPES.ERROR);
 * };
 *
 * const handleWin = () => {
 *   triggerHaptic(HAPTIC_TYPES.CELEBRATION);
 * };
 * ```
 */

/**
 * Supported haptic feedback types.
 */
export type HapticType = 'success' | 'error' | 'celebration';

/**
 * Typed haptic type constants for type-safe usage.
 * Use these instead of raw string literals for better autocomplete and refactoring support.
 *
 * @example
 * ```tsx
 * import { HAPTIC_TYPES } from './utils/haptics';
 *
 * triggerHaptic(HAPTIC_TYPES.SUCCESS);  // ✓ Type-safe
 * triggerHaptic('success');              // ✗ Avoid raw strings
 * ```
 */
export const HAPTIC_TYPES = {
  /** Short double-pulse for correct answers, successful actions */
  SUCCESS: 'success' as const,

  /** Longer pattern for errors, incorrect answers */
  ERROR: 'error' as const,

  /** Extended pattern for celebrations, level completions */
  CELEBRATION: 'celebration' as const,
} as const;

/**
 * Vibration patterns for each haptic type (in milliseconds).
 * Pattern format: [vibrate, pause, vibrate, pause, ...]
 */
const DEFAULT_PATTERNS: Record<HapticType, number[]> = {
  success: [50, 30, 50],
  error: [100, 50, 100],
  celebration: [100, 50, 100, 50, 200],
};

/**
 * Check if the current environment supports haptic feedback.
 *
 * @returns true if navigator.vibrate is available
 */
export function supportsHaptics(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

/**
 * Trigger haptic feedback with the specified type.
 *
 * @param type - The haptic type to trigger (use HAPTIC_TYPES constant)
 * @param customPattern - Optional custom vibration pattern (overrides default)
 *
 * @example
 * ```tsx
 * import { triggerHaptic, HAPTIC_TYPES } from './utils/haptics';
 *
 * // Using predefined type
 * triggerHaptic(HAPTIC_TYPES.SUCCESS);
 *
 * // Using custom pattern
 * triggerHaptic(HAPTIC_TYPES.SUCCESS, [100, 50, 100]);
 * ```
 */
export function triggerHaptic(type: HapticType, customPattern?: number[]): void {
  if (!supportsHaptics()) return;

  const pattern = customPattern ?? DEFAULT_PATTERNS[type];
  navigator.vibrate(pattern);
}
