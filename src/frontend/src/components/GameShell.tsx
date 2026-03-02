/**
 * GameShell Component
 * 
 * Wrapper component that provides standard game infrastructure:
 * - Subscription access control
 * - Error boundary
 * - Wellness timer
 * - Reduced motion support
 * 
 * This is the NEW standardized wrapper for game quality remediation.
 * For the layout container with header, use GameContainer.
 * 
 * @see docs/audit/GAME_QUALITY_REMEDIATION_PLAN.md
 * @ticket GQ-002, GQ-003, GQ-004, GQ-007
 */

import React, { useState, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useGameSubscription } from '../hooks/useGameSubscription';
import { useGameProgress } from '../hooks/useGameProgress';
import { GameErrorBoundary } from './errors/GameErrorBoundary';
import { Loading } from './ui/Loading';
import { Button } from './ui';
import WellnessTimer from './WellnessTimer';

interface GameShellProps {
  /** Unique game ID */
  gameId: string;
  /** Game display name */
  gameName: string;
  /** Game content */
  children: React.ReactNode;
  /** Optional: Custom access denied component */
  accessDeniedComponent?: React.ReactNode;
  /** Optional: Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Whether to show wellness timer (default: true) */
  showWellnessTimer?: boolean;
  /** Whether to enable error boundary (default: true) */
  enableErrorBoundary?: boolean;
}

/**
 * Standard game shell with infrastructure (subscription, error handling, wellness)
 * 
 * Use this for NEW games or when refactoring existing games for quality compliance.
 * For layout container with header, use GameContainer.
 * 
 * @example
 * ```tsx
 * <GameShell gameId="alphabet-tracing" gameName="Draw Letters">
 *   <AlphabetGameContent />
 * </GameShell>
 * ```
 */
export const GameShell: React.FC<GameShellProps> = ({
  gameId,
  gameName,
  children,
  accessDeniedComponent,
  loadingComponent,
  showWellnessTimer = true,
  enableErrorBoundary = true,
}) => {
  const { hasAccess, isLoading } = useGameSubscription(gameId);
  const reducedMotion = useReducedMotion();
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((err: Error) => {
    setError(err);
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
  }, []);

  // Loading state
  if (isLoading) {
    return loadingComponent ?? (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
        <Loading message={`Loading ${gameName}...`} />
      </div>
    );
  }

  // Access denied state
  if (!hasAccess) {
    return accessDeniedComponent ?? (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] p-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-black text-advay-slate mb-4">
            Premium Game
          </h1>
          <p className="text-lg text-text-secondary mb-6">
            {gameName} is available with a subscription. Ask a parent to unlock all games!
          </p>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/subscribe'}
            className="w-full"
          >
            View Plans
          </Button>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] p-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 border-3 border-red-200 shadow-[0_4px_0_#FECACA] text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-3xl font-black text-advay-slate mb-4">
            Oops! Something went wrong
          </h1>
          <p className="text-lg text-text-secondary mb-6">
            Don't worry, your progress is saved. Let's try again!
          </p>
          <Button
            variant="primary"
            onClick={handleRetry}
            className="w-full"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Wrap content with error boundary if enabled
  const content = enableErrorBoundary ? (
    <GameErrorBoundary gameName={gameName} onError={handleError}>
      {children}
    </GameErrorBoundary>
  ) : (
    children
  );

  return (
    <div className={`min-h-screen bg-[#FFF8F0] ${reducedMotion ? 'reduce-motion' : ''}`}>
      {showWellnessTimer && <WellnessTimer />}
      {content}
    </div>
  );
};

export default GameShell;
