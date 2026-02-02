import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UIIcon } from './ui/Icon';

interface GameHeaderProps {
    /** Game title displayed in header */
    title: string;
    /** Game subtitle/description */
    subtitle?: string;
    /** Current score */
    score?: number;
    /** Current level */
    level?: number;
    /** Current streak */
    streak?: number;
    /** Time remaining in seconds */
    timeLeft?: number;
    /** Additional info items to display */
    infoItems?: Array<{ label: string; value: string | number }>;
    /** Whether to show back button */
    showBackButton?: boolean;
    /** Custom back navigation path */
    backPath?: string;
    /** Callback when back is clicked */
    onBack?: () => void;
    /** Primary action button config */
    primaryAction?: {
        label: string;
        onClick: () => void;
        icon?: string;
        disabled?: boolean;
    };
    /** Secondary action button config */
    secondaryAction?: {
        label: string;
        onClick: () => void;
        icon?: string;
    };
}

/**
 * Unified game header component for consistent UI across all games
 */
export const GameHeader = memo(function GameHeader({
    title,
    subtitle,
    score,
    level,
    streak,
    timeLeft,
    infoItems = [],
    showBackButton = true,
    backPath = '/games',
    onBack,
    primaryAction,
    secondaryAction,
}: GameHeaderProps) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(backPath);
        }
    };

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pointer-events-none"
        >
            {/* Left side - Title and back button */}
            <div className="flex items-center gap-4">
                {showBackButton && (
                    <button
                        onClick={handleBack}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-xl border border-border transition pointer-events-auto"
                        aria-label="Go back"
                    >
                        <UIIcon name="back" size={20} />
                    </button>
                )}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
                    {subtitle && (
                        <p className="text-white/60 text-sm sm:text-base">{subtitle}</p>
                    )}
                </div>
            </div>

            {/* Right side - Stats and actions */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {/* Score display */}
                {score !== undefined && (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-4 py-2 rounded-xl border border-yellow-500/30">
                        <UIIcon name="star" size={18} className="text-yellow-400" />
                        <output className="font-bold text-lg">{score}</output>
                    </div>
                )}

                {/* Level display */}
                {level !== undefined && (
                    <div className="flex items-center gap-2 bg-blue-500/20 px-3 py-2 rounded-xl border border-blue-500/30">
                        <span className="text-sm text-blue-300">Level</span>
                        <span className="font-bold text-blue-400">{level}</span>
                    </div>
                )}

                {/* Streak display */}
                {streak !== undefined && streak > 0 && (
                    <div className="flex items-center gap-1 bg-orange-500/20 px-3 py-2 rounded-xl border border-orange-500/30">
                        <span className="text-orange-400">🔥</span>
                        <span className="font-bold text-orange-400">{streak}</span>
                    </div>
                )}

                {/* Timer display */}
                {timeLeft !== undefined && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${timeLeft <= 10
                        ? 'bg-red-500/20 border-red-500/30 animate-pulse'
                        : timeLeft <= 30
                            ? 'bg-yellow-500/20 border-yellow-500/30'
                            : 'bg-green-500/20 border-green-500/30'
                        }`}>
                        <UIIcon name="timer" size={16} className={
                            timeLeft <= 10 ? 'text-red-400' : timeLeft <= 30 ? 'text-yellow-400' : 'text-green-400'
                        } />
                        <span className={`font-bold tabular-nums ${timeLeft <= 10 ? 'text-red-400' : timeLeft <= 30 ? 'text-yellow-400' : 'text-green-400'
                            }`}>
                            {timeLeft}s
                        </span>
                    </div>
                )}

                {/* Custom info items */}
                {infoItems.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl border border-border"
                    >
                        <span className="text-sm text-white/60">{item.label}</span>
                        <span className="font-bold">{item.value}</span>
                    </div>
                ))}

                {/* Action buttons */}
                {secondaryAction && (
                    <button
                        onClick={secondaryAction.onClick}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl border border-border transition flex items-center gap-2 font-medium pointer-events-auto"
                    >
                        {secondaryAction.icon && <UIIcon name={secondaryAction.icon as any} size={16} />}
                        {secondaryAction.label}
                    </button>
                )}

                {primaryAction && (
                    <button
                        onClick={primaryAction.onClick}
                        disabled={primaryAction.disabled}
                        className="px-4 py-2 bg-gradient-to-r from-pip-orange to-pip-rust hover:shadow-lg hover:shadow-pip-orange/30 rounded-xl transition flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
                    >
                        {primaryAction.icon && <UIIcon name={primaryAction.icon as any} size={16} />}
                        {primaryAction.label}
                    </button>
                )}
            </div>
        </motion.header>
    );
});

export default GameHeader;
