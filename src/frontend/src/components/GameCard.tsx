import { memo } from 'react';
import { motion } from 'framer-motion';
import { UIIcon, type IconName } from './ui/Icon';
import { Card } from './ui/Card';
import { Button, ButtonLink } from './ui/Button';

interface GameCardProps {
    /** Unique game identifier */
    id: string;
    /** Game title */
    title: string;
    /** Short description */
    description: string;
    /** Navigation path */
    path: string;
    /** Icon name from UIIcon */
    icon: IconName;
    /** Target age range */
    ageRange: string;
    /** Game category */
    category: string;
    /** Difficulty description */
    difficulty: string;
    /** Optional preview image path */
    previewImage?: string;
    /** Whether game is coming soon */
    comingSoon?: boolean;
    /** Is this a new game? Shows badge */
    isNew?: boolean;
    /** Stars earned (0-3) */
    starsEarned?: number;
    /** Total plays count */
    playCount?: number;
    /** Progress percentage (0-100) */
    progress?: number;
    /** Animation delay for stagger effect */
    animationDelay?: number;
    /** Callback when play is clicked */
    onPlay?: () => void;
    /** Custom button text */
    buttonText?: string;
    /** Reduced motion preference from caller */
    reducedMotion?: boolean;
}

// Category color mappings
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'Alphabets': { bg: 'bg-bg-tertiary', text: 'text-text-secondary', border: 'border-border' },
    'Numeracy': { bg: 'bg-bg-tertiary', text: 'text-text-secondary', border: 'border-border' },
    'Fine Motor': { bg: 'bg-bg-tertiary', text: 'text-text-secondary', border: 'border-border' },
    'default': { bg: 'bg-bg-tertiary', text: 'text-text-secondary', border: 'border-border' },
};

// Difficulty color mappings
const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'Easy': { bg: 'bg-bg-tertiary', text: 'text-text-secondary', border: 'border-border' },
    'Medium': { bg: 'bg-bg-tertiary', text: 'text-text-secondary', border: 'border-border' },
    'Hard': { bg: 'bg-bg-tertiary', text: 'text-text-secondary', border: 'border-border' },
    'default': { bg: 'bg-bg-tertiary', text: 'text-text-secondary', border: 'border-border' },
};

/**
 * Beautiful game card component for the games list
 */
export const GameCard = memo(function GameCard({
    // id, // Not currently used but kept in props for identification
    title,
    description,
    path,
    icon,
    ageRange,
    category,
    difficulty,
    previewImage,
    comingSoon = false,
    isNew = false,
    starsEarned = 0,
    playCount,
    progress,
    animationDelay = 0,
    onPlay,
    buttonText = 'Play Game',
    reducedMotion = false,
}: GameCardProps) {
    const categoryColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.default;

    // Determine difficulty color based on first word
    const diffLevel = difficulty.split(' ')[0];
    const diffColor = DIFFICULTY_COLORS[diffLevel] || DIFFICULTY_COLORS.default;

    const CardContent = (
        <Card
            hover={!comingSoon && !reducedMotion}
            className="relative h-full overflow-hidden group"
            padding="none"
        >
            <motion.article
                initial={reducedMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
                animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                transition={reducedMotion ? { duration: 0.01 } : { delay: animationDelay, duration: 0.3 }}
                className={`h-full ${comingSoon ? 'opacity-60 grayscale' : ''}`}
            >
            {/* Preview Image or Icon Header */}
            <div className="relative h-32 bg-bg-tertiary overflow-hidden border-b border-border">
                {previewImage ? (
                    <img
                        src={previewImage}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="p-4 bg-white rounded-2xl shadow-soft border border-border">
                            <UIIcon name={icon} size={48} className="text-pip-orange" />
                        </div>
                    </div>
                )}

                {/* NEW badge */}
                {isNew && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-success text-white text-xs font-bold rounded-full shadow-soft">
                        NEW
                    </div>
                )}

                {/* COMING SOON badge */}
                {comingSoon && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-text-muted text-white text-xs font-bold rounded-full shadow-soft">
                        COMING SOON
                    </div>
                )}

                {/* Stars display */}
                {starsEarned > 0 && (
                    <div className="absolute top-3 right-3 flex gap-0.5">
                        {[1, 2, 3].map((star) => (
                            <span
                                key={star}
                                className={`text-lg ${star <= starsEarned ? 'text-warning' : 'text-border'}`}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                )}

                {/* Category badge on image */}
                <div className="absolute bottom-3 left-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border}`}>
                        {category}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Title */}
                <h3 className="text-xl font-bold mb-2 text-text-primary group-hover:text-pip-orange transition-colors">
                    {title}
                </h3>

                {/* Description */}
                <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                    {description}
                </p>

                {/* Tags row */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs px-2 py-1 bg-bg-tertiary text-text-secondary rounded-full border border-border">
                        {ageRange}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full border ${diffColor.bg} ${diffColor.text} ${diffColor.border}`}>
                        {difficulty}
                    </span>
                </div>

                {/* Progress bar (if progress provided) */}
                {progress !== undefined && (
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-text-secondary mb-1">
                            <span>Progress</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden border border-border">
                            <motion.div
                                initial={reducedMotion ? false : { width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={reducedMotion ? { duration: 0.01 } : { delay: animationDelay + 0.3, duration: 0.5 }}
                                className="h-full bg-pip-orange rounded-full"
                            />
                        </div>
                    </div>
                )}

                {/* Play count */}
                {playCount !== undefined && playCount > 0 && (
                    <div className="text-xs text-text-secondary mb-3">
                        Played {playCount} time{playCount !== 1 ? 's' : ''}
                    </div>
                )}

                {/* Action button */}
                {comingSoon ? (
                    <Button fullWidth variant="ghost" disabled>
                        Coming Soon
                    </Button>
                ) : onPlay ? (
                    <Button fullWidth size="md" icon="sparkles" onClick={onPlay}>
                        {buttonText}
                    </Button>
                ) : (
                    <ButtonLink fullWidth size="md" icon="sparkles" to={path}>
                        {buttonText}
                    </ButtonLink>
                )}
            </div>
            </motion.article>
        </Card>
    );

    return CardContent;
});

export default GameCard;
