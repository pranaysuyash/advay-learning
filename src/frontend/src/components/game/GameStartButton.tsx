import React from 'react';
import { motion } from 'framer-motion';

interface GameStartButtonProps {
    onClick: () => void;
    text?: string;
    className?: string;
    disabled?: boolean;
}

/**
 * Universal, highly-obvious "Play" button designed for children 4-8.
 * Replaces disparate start buttons across games to provide a single,
 * undeniable affordance for starting a game.
 *
 * Includes an aggressive but playful continuous bounce to draw the eye.
 */
export const GameStartButton: React.FC<GameStartButtonProps> = ({
    onClick,
    text = "PLAY",
    className = "",
    disabled = false,
}) => {
    return (
        <motion.button
            data-testid="universal-start-button"
            onClick={onClick}
            disabled={disabled}
            className={`
        relative px-12 py-6 bg-[#10B981] text-white rounded-3xl
        font-black text-4xl sm:text-5xl tracking-widest
        border-b-8 border-emerald-700 shadow-[0_12px_30px_-5px_#10B981]
        active:border-b-0 active:translate-y-2
        transition-colors hover:bg-emerald-400
        disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale
        z-50
        ${className}
      `}
            animate={disabled ? undefined : {
                y: [0, -15, 0],
            }}
            transition={disabled ? undefined : {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        >
            <div className="flex items-center gap-4">
                <span>{text}</span>
                <span className="text-5xl translate-y-[2px]">▶️</span>
            </div>
        </motion.button>
    );
};
