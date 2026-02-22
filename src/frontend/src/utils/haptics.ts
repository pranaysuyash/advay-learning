export type HapticType = 'success' | 'error' | 'celebration';

const DEFAULT_PATTERNS: Record<HapticType, number[]> = {
  success: [50, 30, 50],
  error: [100, 50, 100],
  celebration: [100, 50, 100, 50, 200],
};

export function supportsHaptics(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

export function triggerHaptic(type: HapticType, customPattern?: number[]): void {
  if (!supportsHaptics()) return;

  const pattern = customPattern ?? DEFAULT_PATTERNS[type];
  navigator.vibrate(pattern);
}
