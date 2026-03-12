import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameHUDProps {
    score?: number;
    streak?: number;
    showHearts?: boolean; // Legacy no-op toggle used by older game pages
    maxStreakHearts?: number; // Visual limit, usually 5 hearts
    level?: number;
    levelInfo?: React.ReactNode;
    leftHeaderContent?: React.ReactNode; // Legacy/custom content slot
    round?: number;
    totalRounds?: number;
    progress?: number; // Legacy alias for progressPercentage
    progressPercentage?: number;
    timeLeft?: number; // Legacy timer prop used by some pages
    rightHeaderContent?: React.ReactNode;
}

/**
 * Universal Game HUD consuming Kenney assets.
 * Replaces hardcoded streak and score logic across multiple games
 * to ensure a standardized, high-quality visual representation.
 */
export const GameHUD: React.FC<GameHUDProps> = ({
    score,
    streak,
    showHearts = true,
    maxStreakHearts = 5,
    level,
    levelInfo,
    leftHeaderContent,
    round,
    totalRounds,
    progress,
    progressPercentage,
    timeLeft,
    rightHeaderContent,
}) => {
    const effectiveProgress = progressPercentage ?? progress;

    return (
        <div className="px-4 py-3 bg-white/90 backdrop-blur-md border-b-4 border-[#F2CC8F] z-10 relative shadow-[0_4px_15px_rgba(0,0,0,0.05)] rounded-b-2xl mb-4 max-w-4xl mx-auto w-full">
            <div className="flex justify-between items-start text-sm text-text-secondary mb-2">
                <div className="flex flex-col gap-1">
                    {leftHeaderContent}
                    {levelInfo ? (
                        <div className="font-black text-advay-slate text-lg">{levelInfo}</div>
                    ) : level !== undefined ? (
                        <div className="bg-amber-100 text-amber-700 px-4 py-1 rounded-xl font-black border-2 border-amber-200 shadow-sm text-sm uppercase tracking-wider inline-block">
                            Level {level}
                        </div>
                    ) : null}

                    {round !== undefined && (
                        <div className="text-slate-400 font-bold text-xs uppercase tracking-widest ml-1">
                            Round {round} {totalRounds !== undefined ? `/ ${totalRounds}` : ''}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {timeLeft !== undefined && (
                        <div className="bg-slate-50 border-2 border-slate-200 px-3 py-1 rounded-xl shadow-inner font-black text-slate-600 text-sm">
                            ⏱ {Math.ceil(timeLeft)}s
                        </div>
                    )}
                    {rightHeaderContent}
                    {score !== undefined && (
                        <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-200 px-3 py-1 rounded-xl shadow-inner">
                            <img src="/assets/kenney/platformer/collectibles/coin_gold.png" alt="Score" className="w-6 h-6 object-contain drop-shadow-sm" />
                            <span className="font-black text-green-600 text-xl tracking-wide">{score}</span>
                        </div>
                    )}
                </div>
            </div>

            {effectiveProgress !== undefined && (
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner mb-3 border-2 border-slate-300/50">
                    <div
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]"
                        style={{ width: `${Math.min(100, Math.max(0, effectiveProgress))}%` }}
                    />
                </div>
            )}

            {streak !== undefined && showHearts && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 bg-pink-50/50 rounded-xl px-3 py-2 border-2 border-pink-200 shadow-[0_2px_0_#FBCFE8]">
                        {/* Display up to maxStreakHearts based on 2 streak points = 1 full heart */}
                        {Array.from({ length: maxStreakHearts }).map((_, i) => (
                            <img
                                key={i}
                                src={streak >= (i + 1) * 2
                                    ? '/assets/kenney/platformer/hud/hud_heart.png'
                                    : '/assets/kenney/platformer/hud/hud_heart_empty.png'}
                                alt=""
                                className="w-7 h-7 object-contain drop-shadow-sm transition-transform hover:scale-110 object-bottom"
                            />
                        ))}
                        <span className="ml-2 text-sm font-black text-pink-600 tracking-wider">x{streak}</span>
                    </div>

                    <div className="h-8"> {/* Fixed height to prevent layout shift on appear */}
                        <AnimatePresence>
                            {streak > 1 && (
                                <motion.span
                                    initial={{ scale: 0, x: -20, opacity: 0 }}
                                    animate={{ scale: 1, x: 0, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1 rounded-full text-sm font-black border-b-2 border-red-700 shadow-md transform-gpu"
                                >
                                    🔥 {streak} STREAK!
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
};
