/**
 * React hook for tracking answer streaks with milestone celebrations.
 * Consolidates repeated streak tracking pattern found in 60+ game components.
 *
 * @example
 * ```tsx
 * import { useStreakTracking } from '../hooks/useStreakTracking';
 * import { STREAK_MILESTONE_INTERVAL } from '../games/constants';
 *
 * function MyGame() {
 *   const {
 *     streak,
 *     maxStreak,
 *     showMilestone,
 *     scorePopup,
 *     incrementStreak,
 *     resetStreak,
 *     setScorePopup,
 *   } = useStreakTracking({
 *     milestoneInterval: STREAK_MILESTONE_INTERVAL,
 *     onMilestone: (streak) => console.log(`Milestone: ${streak}!`),
 *   });
 *
 *   const handleCorrectAnswer = () => {
 *     incrementStreak();
 *   };
 *
 *   const handleWrongAnswer = () => {
 *     resetStreak();
 *   };
 *
 *   return (
 *     <div>
 *       <p>Streak: {streak}</p>
 *       {showMilestone && <div>🔥 {streak} Streak! 🔥</div>}
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useCallback, useRef } from 'react';
import { STREAK_MILESTONE_INTERVAL, STREAK_MILESTONE_DURATION_MS } from '../games/constants';

/**
 * Score popup data for displaying points earned.
 */
export interface ScorePopup {
  points: number;
  x?: number;
  y?: number;
}

/**
 * Configuration options for useStreakTracking hook.
 */
export interface UseStreakTrackingConfig {
  /** Streak interval for milestone celebration (default: 5) */
  milestoneInterval?: number;
  /** Duration to show milestone celebration in ms (default: 1200) */
  milestoneDuration?: number;
  /** Optional callback when milestone is reached */
  onMilestone?: (streak: number) => void;
  /** Optional initial streak value */
  initialStreak?: number;
  /** Optional initial max streak value */
  initialMaxStreak?: number;
}

/**
 * Return value of useStreakTracking hook.
 */
export interface UseStreakTrackingReturn {
  /** Current streak count */
  streak: number;
  /** Maximum streak achieved in current session */
  maxStreak: number;
  /** Whether to show milestone celebration */
  showMilestone: boolean;
  /** Score popup data (if set) */
  scorePopup: ScorePopup | null;
  /** Increment streak by 1 (triggers milestone check) - returns new streak value */
  incrementStreak: (amount?: number) => number;
  /** Reset streak to 0 */
  resetStreak: () => void;
  /** Set streak to specific value */
  setStreak: (value: number) => void;
  /** Set score popup data */
  setScorePopup: (popup: ScorePopup | null) => void;
}

/**
 * Hook for tracking answer streaks with milestone celebrations.
 *
 * Automatically:
 * - Tracks current streak and max streak
 * - Detects milestone intervals (every N correct answers)
 * - Shows/hides milestone celebration after configured duration
 * - Provides streak manipulation functions
 *
 * @param config - Hook configuration options
 * @returns Streak state and manipulation functions
 *
 * @example
 * ```tsx
 * // Basic usage
 * const { streak, incrementStreak, resetStreak } = useStreakTracking();
 *
 * // With custom milestone interval
 * const { streak, showMilestone } = useStreakTracking({
 *   milestoneInterval: 10,
 * });
 *
 * // With milestone callback
 * const { streak } = useStreakTracking({
 *   onMilestone: (streak) => triggerConfetti(),
 * });
 * ```
 */
export function useStreakTracking(
  config: UseStreakTrackingConfig = {},
): UseStreakTrackingReturn {
  const {
    milestoneInterval = STREAK_MILESTONE_INTERVAL,
    milestoneDuration = STREAK_MILESTONE_DURATION_MS,
    onMilestone,
    initialStreak = 0,
    initialMaxStreak = 0,
  } = config;

  const [streak, setStreak] = useState(initialStreak);
  const [maxStreak, setMaxStreak] = useState(initialMaxStreak);
  const [showMilestone, setShowMilestone] = useState(false);
  const [scorePopup, setScorePopup] = useState<ScorePopup | null>(null);

  // Track milestone timeout for cleanup
  const milestoneTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Increment streak by 1 (or custom amount).
   * Updates max streak if needed, triggers milestone celebration.
   * Returns the new streak value.
   */
  const incrementStreak = useCallback((amount: number = 1) => {
    let newStreak = 0;
    setStreak((prev) => {
      newStreak = prev + amount;

      // Update max streak
      setMaxStreak((currentMax) => Math.max(currentMax, newStreak));

      // Check for milestone
      if (newStreak > 0 && newStreak % milestoneInterval === 0) {
        setShowMilestone(true);
        onMilestone?.(newStreak);

        // Clear existing timeout
        if (milestoneTimeoutRef.current) {
          clearTimeout(milestoneTimeoutRef.current);
        }

        // Auto-hide milestone after duration
        milestoneTimeoutRef.current = setTimeout(() => {
          setShowMilestone(false);
        }, milestoneDuration);
      }

      return newStreak;
    });
    return newStreak;
  }, [milestoneInterval, milestoneDuration, onMilestone]);

  /**
   * Reset streak to 0.
   * Does not affect maxStreak.
   */
  const resetStreak = useCallback(() => {
    setStreak(0);

    // Clear any pending milestone timeout
    if (milestoneTimeoutRef.current) {
      clearTimeout(milestoneTimeoutRef.current);
      milestoneTimeoutRef.current = null;
    }
    setShowMilestone(false);
  }, []);

  /**
   * Set streak to a specific value.
   * Useful for restoring streak from saved state.
   */
  const setStreakValue = useCallback((value: number) => {
    setStreak(value);
    setMaxStreak((currentMax) => Math.max(currentMax, value));
  }, []);

  return {
    streak,
    maxStreak,
    showMilestone,
    scorePopup,
    incrementStreak,
    resetStreak,
    setStreak: setStreakValue,
    setScorePopup,
  };
}

/**
 * Helper hook for creating a score popup at specific coordinates.
 *
 * @example
 * ```tsx
 * const { setScorePopup, showScorePopup } = useScorePopup();
 *
 * const handleClick = (e: MouseEvent) => {
 *   showScorePopup(10, e.clientX, e.clientY);
 * };
 * ```
 */
export function useScorePopup() {
  const [scorePopup, setScorePopup] = useState<ScorePopup | null>(null);

  /**
   * Show a score popup at the specified coordinates.
   * Automatically hides after animation (caller should manage timing).
   */
  const showScorePopup = useCallback((points: number, x: number, y: number) => {
    setScorePopup({ points, x, y });
  }, []);

  /**
   * Hide the score popup.
   */
  const hideScorePopup = useCallback(() => {
    setScorePopup(null);
  }, []);

  return {
    scorePopup,
    setScorePopup,
    showScorePopup,
    hideScorePopup,
  };
}
