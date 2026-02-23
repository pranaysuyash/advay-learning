/**
 * Calm Mode Utilities
 * 
 * Provides utilities for implementing Calm Mode - a reduced-stimulation
 * experience for sensory-sensitive children.
 * 
 * Based on Dr. Meera Sharma's findings:
 * - Muted color palette (pastels instead of bright primaries)
 * - Slower animations (2x duration)
 * - No background music, only essential sound effects
 * - Reduced celebration intensity
 */

import { useSettingsStore } from '../store';

/**
 * Hook to access calm mode state
 */
export function useCalmMode(): boolean {
  return useSettingsStore((state) => state.calmMode);
}

/**
 * Animation duration multiplier
 * In calm mode: 2x slower animations
 */
export function getAnimationDuration(baseDuration: number, isCalmMode: boolean): number {
  return isCalmMode ? baseDuration * 2 : baseDuration;
}

/**
 * Color palette for calm mode
 * Muted pastels instead of bright primaries
 */
export const CALM_MODE_COLORS = {
  // Backgrounds
  background: '#F5F5F0',      // Warm off-white instead of bright #FFF8F0
  card: '#FAFAF8',            // Soft cream instead of white
  
  // Primary actions (muted versions)
  primary: '#7C9CB5',         // Muted blue instead of #3B82F6
  primaryHover: '#6B8BA4',    // Slightly darker
  
  // Accents (softened)
  accent: '#B8A89A',          // Soft taupe instead of #E85D04
  success: '#8FB996',         // Muted green instead of #10B981
  warning: '#D4B896',         // Soft amber instead of bright yellow
  
  // Borders
  border: '#E8E4E0',          // Soft gray instead of #F2CC8F
  
  // Text
  text: '#5A5A5A',            // Soft dark gray instead of #1E293B
  textSecondary: '#8A8A8A',   // Lighter gray
} as const;

/**
 * Standard color palette (non-calm mode)
 */
export const STANDARD_COLORS = {
  background: '#FFF8F0',
  card: '#FFFFFF',
  primary: '#3B82F6',
  primaryHover: '#2563EB',
  accent: '#E85D04',
  success: '#10B981',
  warning: '#F59E0B',
  border: '#F2CC8F',
  text: '#1E293B',
  textSecondary: '#64748B',
} as const;

/**
 * Get appropriate color based on calm mode
 */
export function getColor(
  colorKey: keyof typeof STANDARD_COLORS,
  isCalmMode: boolean
): string {
  return isCalmMode ? CALM_MODE_COLORS[colorKey] : STANDARD_COLORS[colorKey];
}

/**
 * CSS class modifiers for calm mode
 */
export const CALM_MODE_CLASSES = {
  // Reduce motion and intensity
  container: 'calm-mode:transition-none',
  animation: 'calm-mode:animate-none calm-mode:duration-500',
  
  // Muted colors
  bgPrimary: 'calm-mode:bg-[#7C9CB5]',
  bgAccent: 'calm-mode:bg-[#B8A89A]',
  bgSuccess: 'calm-mode:bg-[#8FB996]',
  
  // Reduced shadows
  shadow: 'calm-mode:shadow-none',
  shadowSm: 'calm-mode:shadow-none',
  
  // Softer borders
  border: 'calm-mode:border-[#E8E4E0]',
} as const;

/**
 * Framer Motion transition config for calm mode
 */
export function getMotionTransition(isCalmMode: boolean, baseDuration: number = 0.3) {
  return {
    duration: isCalmMode ? baseDuration * 2 : baseDuration,
    ease: isCalmMode ? 'linear' : 'easeOut', // Linear is less jarring
  };
}

/**
 * Check if celebrations should be reduced
 */
export function shouldReduceCelebrations(isCalmMode: boolean): boolean {
  return isCalmMode;
}

/**
 * Celebration style based on calm mode
 */
export function getCelebrationStyle(isCalmMode: boolean): {
  hasSparkles: boolean;
  hasMascotDance: boolean;
  hasSound: boolean;
  animationDuration: number;
} {
  if (isCalmMode) {
    return {
      hasSparkles: false,
      hasMascotDance: false,
      hasSound: false, // Only essential feedback
      animationDuration: 0.5, // Shorter, calmer
    };
  }
  
  return {
    hasSparkles: true,
    hasMascotDance: true,
    hasSound: true,
    animationDuration: 1.0, // Full celebration
  };
}

/**
 * Background music should play?
 */
export function shouldPlayBackgroundMusic(
  isCalmMode: boolean,
  userSoundEnabled: boolean
): boolean {
  return !isCalmMode && userSoundEnabled;
}

/**
 * Sound effects should play?
 */
export function shouldPlaySoundEffects(
  isCalmMode: boolean,
  userSoundEnabled: boolean,
  isEssential: boolean = false
): boolean {
  if (!userSoundEnabled) return false;
  if (isCalmMode && !isEssential) return false;
  return true;
}
