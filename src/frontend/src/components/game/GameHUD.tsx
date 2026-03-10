import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameHUDProps {
    score?: number;
    streak?: number;
    maxStreakHearts?: number; // Visual limit, usually 5 hearts
    levelInfo?: React.ReactNode;
    progressPercentage?: number;
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
    maxStreakHearts = 5,
    levelInfo,
    progressPercentage,
    rightHeaderContent,
}) => {
    return (
        <div className="px-4 py-3 bg-white/90 backdrop-blur-md border-b-4 border-[#F2CC8F] z-10 relative shadow-[0_4px_15px_rgba(0,0,0,0.05)] rounded-b-2xl mb-4 max-w-4xl mx-auto w-full">
            <div className="flex justify-between items-center text-sm text-text-secondary mb-2">
                {levelInfo ? (
                    <span className="font-black text-advay-slate text-lg">{levelInfo}</span>
                ) : (
                    <div /> // Filler for flex space-between
                )}

                <div className="flex items-center gap-3">
                    {rightHeaderContent}
                    {score !== undefined && (
                        <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-200 px-3 py-1 rounded-xl shadow-inner">
                            <img src="/assets/kenney/platformer/collectibles/coin_gold.png" alt="Score" className="w-6 h-6 object-contain drop-shadow-sm" />
                            <span className="font-black text-green-600 text-xl tracking-wide">{score}</span>
                        </div>
                    )}
                </div>
            </div>

            {progressPercentage !== undefined && (
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner mb-3 border-2 border-slate-300/50">
                    <div
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]"
                        style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
                    />
                </div>
            )}

            {streak !== undefined && (
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
