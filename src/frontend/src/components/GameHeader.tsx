import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UIIcon } from './ui/Icon';
import { Button } from './ui/Button';

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
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8 pointer-events-none"
        >
            {/* Left side - Title and back button */}
            <div className="flex items-center gap-4 bg-white/80 p-3 pr-6 rounded-[2rem] border-4 border-white shadow-sm backdrop-blur-md">
                {showBackButton && (
                    <button
                        onClick={handleBack}
                        className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-[1.25rem] border-2 border-slate-200 transition-colors focus:outline-none focus:border-[#3B82F6] pointer-events-auto shadow-sm"
                        aria-label="Go back"
                    >
                        <UIIcon name="back" size={24} />
                    </button>
                )}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{title}</h1>
                    {subtitle && (
                        <p className="text-slate-500 font-bold text-sm sm:text-base mt-0.5">{subtitle}</p>
                    )}
                </div>
            </div>

            {/* Right side - Stats and actions */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pointer-events-auto">

                {/* Level display */}
                {level !== undefined && (
                    <div className="flex items-center gap-2 bg-[#3B82F6] px-4 py-2 sm:py-3 rounded-[1.25rem] border-4 border-[#000000] shadow-[0_4px_0_0_#000000]">
                        <span className="text-sm font-bold text-blue-100 uppercase tracking-widest">Level</span>
                        <span className="font-black text-white text-lg sm:text-xl">{level}</span>
                    </div>
                )}

                {/* Score display */}
                {score !== undefined && (
                    <div className="flex items-center gap-2 bg-[#E85D04] px-4 py-2 sm:py-3 rounded-[1.25rem] border-4 border-[#000000] shadow-[0_4px_0_0_#000000]">
                        <UIIcon name="star" size={20} className="text-yellow-300" />
                        <output className="font-black text-white text-lg sm:text-xl">{score}</output>
                    </div>
                )}

                {/* Streak display */}
                {streak !== undefined && streak > 0 && (
                    <div className="flex items-center gap-2 bg-[#F59E0B] px-4 py-2 sm:py-3 rounded-[1.25rem] border-4 border-[#000000] shadow-[0_4px_0_0_#000000]">
                        <span className="text-yellow-100 text-lg">🔥</span>
                        <span className="font-black text-white text-lg sm:text-xl">{streak}</span>
                    </div>
                )}

                {/* Timer display */}
                {timeLeft !== undefined && (
                    <div className={`flex items-center gap-2 px-4 py-2 sm:py-3 rounded-[1.25rem] border-4 border-[#000000] shadow-[0_4px_0_0_#000000] ${timeLeft <= 10
                        ? 'bg-red-500 animate-pulse'
                        : timeLeft <= 30
                            ? 'bg-[#F59E0B]'
                            : 'bg-[#10B981]'
                        }`}>
                        <UIIcon name="timer" size={20} className="text-white" />
                        <span className="font-black tabular-nums text-white text-lg sm:text-xl">
                            {timeLeft}s
                        </span>
                    </div>
                )}

                {/* Custom info items */}
                {infoItems.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 bg-white px-4 py-2 sm:py-3 rounded-[1.25rem] border-4 border-slate-200 shadow-sm"
                    >
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                        <span className="font-black text-slate-800 text-lg">{item.value}</span>
                    </div>
                ))}

                {/* Action buttons */}
                {secondaryAction && (
                    <Button
                        onClick={secondaryAction.onClick}
                        variant="secondary"
                        icon={secondaryAction.icon as any}
                    >
                        {secondaryAction.label}
                    </Button>
                )}

                {primaryAction && (
                    <Button
                        onClick={primaryAction.onClick}
                        disabled={primaryAction.disabled}
                        icon={primaryAction.icon as any}
                    >
                        {primaryAction.label}
                    </Button>
                )}
            </div>
        </motion.header>
    );
});

export default GameHeader;
