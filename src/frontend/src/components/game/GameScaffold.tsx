import { memo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { GameTopBar } from './GameTopBar';
import { GameFeedback } from './GameFeedback';
import { GameActionDock } from './GameActionDock';
import type { GameTopBarProps } from './GameTopBar';
import type { GameFeedbackProps } from './GameFeedback';
import type { GameAction } from './GameActionDock';

export type GamePhase = 'intro' | 'playing' | 'paused' | 'complete' | 'gameOver';

export interface GameScaffoldProps {
  /** Current game phase — controls which overlay is visible */
  phase: GamePhase;

  /** Persistent top bar config */
  topBar: GameTopBarProps;

  /** Decorative background layer */
  background?: React.ReactNode;

  /** Auxiliary overlay (camera thumbnail, etc.) */
  auxiliary?: React.ReactNode;

  /** Action buttons during play (max 3) */
  controls?: GameAction[];
  /** Position of the action dock */
  controlsPosition?: 'bottom-right' | 'bottom-center';

  /** Single feedback message */
  feedback?: string | null;
  feedbackVariant?: GameFeedbackProps['variant'];
  /** Auto-dismiss duration for feedback (ms, 0 = no auto-dismiss) */
  feedbackDuration?: number;
  onFeedbackDismiss?: () => void;

  /** Phase-specific screens */
  intro?: React.ReactNode;
  paused?: React.ReactNode;
  result?: React.ReactNode;

  /** The actual game scene */
  children: React.ReactNode;

  /** Optional class for the outer container */
  className?: string;
}

export const GameScaffold = memo(function GameScaffold({
  phase,
  topBar,
  background,
  auxiliary,
  controls,
  controlsPosition,
  feedback,
  feedbackVariant,
  feedbackDuration,
  onFeedbackDismiss,
  intro,
  paused,
  result,
  children,
  className = '',
}: GameScaffoldProps) {
  const showOverlay = phase !== 'playing';
  const overlayContent =
    phase === 'intro'
      ? intro
      : phase === 'paused'
        ? paused
        : phase === 'complete' || phase === 'gameOver'
          ? result
          : null;

  return (
    <div
      className={`fixed inset-0 bg-[#FFF8F0] font-sans flex flex-col overflow-hidden ${className}`}
    >
      {/* Persistent top bar */}
      <GameTopBar {...topBar} />

      {/* Game stage */}
      <main className="flex-1 relative overflow-hidden">
        {/* Background layer */}
        {background && (
          <div className="absolute inset-0 z-0" aria-hidden="true">
            {background}
          </div>
        )}

        {/* Game scene */}
        <div className="relative z-10 h-full">
          {children}
        </div>

        {/* Auxiliary (camera thumbnail, etc.) */}
        {auxiliary && (
          <div className="absolute z-20">
            {auxiliary}
          </div>
        )}

        {/* Feedback (single channel) */}
        {phase === 'playing' && (
          <GameFeedback
            message={feedback ?? null}
            variant={feedbackVariant}
            duration={feedbackDuration}
            onDismiss={onFeedbackDismiss}
          />
        )}

        {/* Action dock */}
        {phase === 'playing' && controls && controls.length > 0 && (
          <GameActionDock actions={controls} position={controlsPosition} />
        )}

        {/* Phase overlays — only one visible at a time */}
        <AnimatePresence>
          {showOverlay && overlayContent ? overlayContent : null}
        </AnimatePresence>
      </main>
    </div>
  );
});
