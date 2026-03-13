/**
 * GamePauseModal Component
 * 
 * Standardized pause modal for all games.
 * 
 * @ticket ISSUE-002 (Updated with fallback button support)
 */

import React from 'react';
import { Modal } from '../ui/Modal';
import { Mascot } from '../Mascot';
import { UIIcon } from '../ui/Icon';
import { useAudio } from '../../utils/hooks/useAudio';

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
        const { playClick, playHover } = useAudio();

        if (!isVisible) return null;

        return (
            <Modal
                isOpen={isVisible}
                onClose={onResume}
                size="sm"
                showBackdrop={true}
                closeOnBackdrop={false}
                closeOnEscape={false}
                preventClose={true}
                ariaLabel="Game Paused"
            >
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.1),_0_6px_0_#E5B86E] border-4 border-[#F2CC8F]">
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
                            onMouseEnter={playHover}
                            onClick={() => {
                                playClick();
                                onResume();
                            }}
                            className="w-full px-6 py-4 min-h-[64px] bg-[#10B981] hover:bg-emerald-600 text-white rounded-[1.5rem] font-black text-xl border-3 border-emerald-700 shadow-[0_6px_0_#047857] transition-all hover:-translate-y-1 active:translate-y-[4px] active:shadow-[0_2px_0_#047857] flex items-center justify-center gap-3"
                        >
                            <UIIcon name="check" size={28} />
                            Resume Game
                        </button>

                        {/* Fallback Mode Button (when available) */}
                        {fallbackAvailable && onSwitchToFallback && (
                            <button
                                type="button"
                                onMouseEnter={playHover}
                                onClick={() => {
                                    playClick();
                                    onSwitchToFallback();
                                }}
                                className="w-full px-6 py-4 min-h-[64px] bg-[#F59E0B] hover:bg-amber-600 text-white rounded-[1.5rem] font-black text-xl border-3 border-amber-700 shadow-[0_6px_0_#B45309] transition-all hover:-translate-y-1 active:translate-y-[4px] active:shadow-[0_2px_0_#B45309] flex items-center justify-center gap-3"
                            >
                                <UIIcon name="hand" size={28} />
                                Use Tap Mode
                            </button>
                        )}

                        <button
                            type="button"
                            onMouseEnter={playHover}
                            onClick={() => {
                                playClick();
                                onExit();
                            }}
                            className="w-full px-6 py-4 min-h-[64px] bg-slate-50 hover:bg-white text-advay-slate border-3 border-[#F2CC8F] rounded-[1.5rem] font-black text-xl shadow-[0_6px_0_#E5B86E] transition-all hover:-translate-y-1 active:translate-y-[4px] active:shadow-[0_2px_0_#E5B86E] flex items-center justify-center gap-3"
                        >
                            <UIIcon name="home" size={24} />
                            Exit to Home
                        </button>
                    </div>
                </div>
            </Modal>
        );
    }
);

GamePauseModal.displayName = 'GamePauseModal';
