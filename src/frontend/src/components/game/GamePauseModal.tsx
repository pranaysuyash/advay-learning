/**
 * GamePauseModal Component
 * 
 * Standardized pause modal for all games.
 * 
 * @ticket ISSUE-002 (Updated with fallback button support)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Mascot } from '../Mascot';
import { UIIcon } from '../ui/Icon';

interface GamePauseModalProps {
    isVisible: boolean;
    onResume: () => void;
    onExit: () => void;
    /** Optional: Switch to fallback controls (tap/dwell mode) */
    onSwitchToFallback?: () => void;
    /** Whether fallback controls are available */
    fallbackAvailable?: boolean;
    /** Custom message for the mascot */
    mascotMessage?: string;
}

export const GamePauseModal: React.FC<GamePauseModalProps> = React.memo(
    ({ isVisible, onResume, onExit, onSwitchToFallback, fallbackAvailable = false, mascotMessage }) => {
        if (!isVisible) return null;

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl border-3 border-[#F2CC8F]"
                >
                    <div className="flex justify-center mb-8 bg-blue-50 py-6 rounded-3xl border-3 border-blue-100">
                        <Mascot state="waiting" message={mascotMessage ?? "Paused! Take a breather."} />
                    </div>
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-advay-slate tracking-tight mb-2">
                            Game Paused
                        </h2>
                        <p className="text-text-secondary font-bold text-lg">
                            Your progress is saved. Ready to continue?
                        </p>
                    </div>
                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={onResume}
                            className="w-full px-6 py-4 min-h-[64px] bg-[#10B981] hover:bg-emerald-600 text-white rounded-[1.5rem] font-black text-xl shadow-[0_4px_0_#E5B86E] transition-all hover:scale-105 flex items-center justify-center gap-3"
                        >
                            <UIIcon name="check" size={28} />
                            Resume Game
                        </button>
                        
                        {/* Fallback Mode Button (when available) */}
                        {fallbackAvailable && onSwitchToFallback && (
                            <button
                                type="button"
                                onClick={onSwitchToFallback}
                                className="w-full px-6 py-4 min-h-[64px] bg-[#F59E0B] hover:bg-amber-600 text-white rounded-[1.5rem] font-black text-xl shadow-[0_4px_0_#D97706] transition-all hover:scale-105 flex items-center justify-center gap-3"
                            >
                                <UIIcon name="hand" size={28} />
                                Use Tap Mode
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onExit}
                            className="w-full px-6 py-4 min-h-[64px] bg-slate-50 text-advay-slate border-3 border-[#F2CC8F] rounded-[1.5rem] font-black text-xl hover:bg-white hover:border-slate-300 transition-all flex items-center justify-center gap-3"
                        >
                            <UIIcon name="home" size={24} />
                            Exit to Home
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        );
    }
);

GamePauseModal.displayName = 'GamePauseModal';
