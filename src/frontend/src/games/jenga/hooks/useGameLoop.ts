import { useEffect, useRef, useCallback } from 'react';
import { JengaGameState } from '../domain/GameState';
import { JENGA_CONSTANTS } from '../config/constants';

export function useGameLoop(
  gameState: JengaGameState | null,
  isActive: boolean = true,
  settleTimeMs: number = JENGA_CONSTANTS.STABILITY.SETTLE_TIME,
) {
  const settleTimeout = useRef<NodeJS.Timeout | null>(null);
  const settleGuardTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastStabilityCheck = useRef(0);
  
  // Handle settle phase
  useEffect(() => {
    if (!gameState || !isActive) return;
    
    if (gameState.phase === 'settle') {
      // Wait for physics to settle before checking stability
      settleTimeout.current = setTimeout(() => {
        gameState.forceStabilityCheck();
      }, settleTimeMs);

      // Guard against never-ending wobble states.
      settleGuardTimeout.current = setTimeout(() => {
        gameState.forceStabilityCheck();
      }, Math.max(settleTimeMs + 700, 1800));
    }
    
    return () => {
      if (settleTimeout.current) {
        clearTimeout(settleTimeout.current);
        settleTimeout.current = null;
      }
      if (settleGuardTimeout.current) {
        clearTimeout(settleGuardTimeout.current);
        settleGuardTimeout.current = null;
      }
    };
  }, [gameState?.phase, isActive, settleTimeMs]);
  
  // Periodic stability check during gameplay
  const checkStability = useCallback(() => {
    if (!gameState || !isActive) return;
    
    const now = Date.now();
    if (now - lastStabilityCheck.current < 100) return; // Limit checks
    
    lastStabilityCheck.current = now;
    
    // If tower collapsed during gameplay (not during settle), end game
    if (gameState.tower.hasCollapsed() && !gameState.isGameOver) {
      gameState.forceStabilityCheck();
    }
  }, [gameState, isActive]);
  
  // Run stability check periodically
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(checkStability, 100);
    return () => clearInterval(interval);
  }, [checkStability, isActive]);
  
  return {
    checkStability,
  };
}
