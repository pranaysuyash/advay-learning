/**
 * TrackingLossOverlay Component
 * 
 * Displays when camera hand tracking is lost for an extended period.
 * Provides options to retry camera or switch to fallback controls.
 * 
 * @see docs/components/TRACKING_LOSS_OVERLAY.md
 * @ticket ISSUE-002
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mascot } from '../Mascot';
import { UIIcon } from '../ui/Icon';

export interface TrackingLossOverlayProps {
  /** Whether the overlay is visible */
  isVisible: boolean;
  /** Called when user wants to retry camera */
  onRetryCamera: () => void;
  /** Called when user wants to switch to tap/dwell mode (optional) */
  onSwitchToTapMode?: () => void;
  /** How long tracking has been lost (for display) */
  lossDurationMs?: number;
  /** Whether fallback controls are available */
  fallbackAvailable?: boolean;
  /** Optional callback for exiting to games route (SPA-safe) */
  onExitToGames?: () => void;
}

export const TrackingLossOverlay: React.FC<TrackingLossOverlayProps> = React.memo(
  ({ 
    isVisible, 
    onRetryCamera, 
    onSwitchToTapMode,
    lossDurationMs = 0,
    fallbackAvailable = false,
    onExitToGames,
  }) => {
    const [showHelp, setShowHelp] = useState(false);

    // Auto-show help after 3 seconds of tracking loss
    useEffect(() => {
      if (!isVisible) {
        setShowHelp(false);
        return;
      }
      const timer = setTimeout(() => setShowHelp(true), 3000);
      return () => clearTimeout(timer);
    }, [isVisible]);

    if (!isVisible) return null;

    const lossSeconds = Math.floor(lossDurationMs / 1000);

    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl border-3 border-[#F2CC8F]"
            >
              {/* Mascot Header */}
              <div className="flex justify-center mb-6 bg-amber-50 py-6 rounded-3xl border-3 border-amber-100">
                <Mascot 
                  state="thinking" 
                  message={lossSeconds > 5 
                    ? "I can't see your hand! Let's fix this." 
                    : "Hmm, where did your hand go?"
                  } 
                />
              </div>

              {/* Title & Status */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-black text-advay-slate tracking-tight mb-2">
                  Camera Paused
                </h2>
                <p className="text-text-secondary font-bold text-lg">
                  We lost track of your hand{lossSeconds > 0 && ` ${lossSeconds}s ago`}
                </p>
              </div>

              {/* Help Tips (shown after delay) */}
              <AnimatePresence>
                {showHelp && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-blue-50 rounded-2xl p-4 mb-6 border-2 border-blue-100">
                      <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                        <UIIcon name="info" size={20} />
                        Try these tips:
                      </h3>
                      <ul className="text-sm text-blue-700 space-y-1 ml-6 list-disc">
                        <li>Make sure your hand is visible in the camera</li>
                        <li>Check that camera permissions are allowed</li>
                        <li>Move to a brighter area</li>
                        <li>Keep your hand away from your face</li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Primary: Retry Camera */}
                <button
                  type="button"
                  onClick={onRetryCamera}
                  className="w-full px-6 py-4 min-h-[64px] bg-[#10B981] hover:bg-emerald-600 text-white rounded-[1.5rem] font-black text-xl shadow-[0_4px_0_#059669] transition-all hover:scale-105 flex items-center justify-center gap-3"
                >
                  <UIIcon name="refresh" size={28} />
                  Try Camera Again
                </button>

                {/* Secondary: Switch to Tap Mode (if available) */}
                {fallbackAvailable && onSwitchToTapMode && (
                  <button
                    type="button"
                    onClick={onSwitchToTapMode}
                    className="w-full px-6 py-4 min-h-[64px] bg-[#F59E0B] hover:bg-amber-600 text-white rounded-[1.5rem] font-black text-xl shadow-[0_4px_0_#D97706] transition-all hover:scale-105 flex items-center justify-center gap-3"
                  >
                    <UIIcon name="hand" size={28} />
                    Switch to Tap Mode
                  </button>
                )}

                {/* Tertiary: Exit */}
                <button
                  type="button"
                  onClick={() => {
                    if (onExitToGames) {
                      onExitToGames();
                      return;
                    }
                    window.location.assign('/games');
                  }}
                  className="w-full px-6 py-4 min-h-[64px] bg-slate-50 text-advay-slate border-3 border-[#F2CC8F] rounded-[1.5rem] font-black text-xl hover:bg-white hover:border-slate-300 transition-all flex items-center justify-center gap-3"
                >
                  <UIIcon name="home" size={24} />
                  Exit to Games
                </button>
              </div>

              {/* Reassurance Text */}
              <p className="text-center text-slate-400 text-sm mt-4">
                Your progress is saved! You won't lose your place.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

TrackingLossOverlay.displayName = 'TrackingLossOverlay';
