import { memo } from 'react';
import { motion } from 'framer-motion';
import { UIIcon, type IconName } from './ui/Icon';
import { Card } from './ui/Card';
import { Button, ButtonLink } from './ui/Button';

interface GameCardProps {
    id: string;
    title: string;
    description: string;
    path: string;
    icon: IconName;
    ageRange: string;
    category: string;
    difficulty: string;
    previewImage?: string;
    comingSoon?: boolean;
    isNew?: boolean;
    starsEarned?: number;
    playCount?: number;
    progress?: number;
    animationDelay?: number;
    onPlay?: () => void;
    buttonText?: string;
    reducedMotion?: boolean;
}

// Category color mappings - Bright, fun V1 colors
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'Alphabets': { bg: 'bg-[#3B82F6]/10', text: 'text-[#3B82F6]', border: 'border-[#3B82F6]/20' },
    'Numeracy': { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]', border: 'border-[#10B981]/20' },
    'Drawing': { bg: 'bg-[#8B5CF6]/10', text: 'text-[#8B5CF6]', border: 'border-[#8B5CF6]/20' },
    'Music': { bg: 'bg-[#EC4899]/10', text: 'text-[#EC4899]', border: 'border-[#EC4899]/20' },
    'Motor Skills': { bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]/20' },
    'Shapes': { bg: 'bg-[#06B6D4]/10', text: 'text-[#06B6D4]', border: 'border-[#06B6D4]/20' },
    'Colors': { bg: 'bg-[#EF4444]/10', text: 'text-[#EF4444]', border: 'border-[#EF4444]/20' },
    'Memory': { bg: 'bg-[#6366F1]/10', text: 'text-[#6366F1]', border: 'border-[#6366F1]/20' },
    'Movement': { bg: 'bg-[#14B8A6]/10', text: 'text-[#14B8A6]', border: 'border-[#14B8A6]/20' },
    'Science': { bg: 'bg-[#8B5CF6]/10', text: 'text-[#8B5CF6]', border: 'border-[#8B5CF6]/20' },
    'Literacy': { bg: 'bg-[#3B82F6]/10', text: 'text-[#3B82F6]', border: 'border-[#3B82F6]/20' },
    'Emotions': { bg: 'bg-[#F43F5E]/10', text: 'text-[#F43F5E]', border: 'border-[#F43F5E]/20' },
    'Creativity': { bg: 'bg-[#E85D04]/10', text: 'text-[#E85D04]', border: 'border-[#E85D04]/20' },
    'default': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
};

// Difficulty color mappings
const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'Easy': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    'Medium': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
    'Hard': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    'default': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
};

export const GameCard = memo(function GameCard({
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

    const diffLevel = difficulty.split(' ')[0];
    const diffColor = DIFFICULTY_COLORS[diffLevel] || DIFFICULTY_COLORS.default;

    const CardContent = (
        <Card
            hover={!comingSoon && !reducedMotion}
            className={`relative h-full overflow-hidden group flex flex-col ${comingSoon ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}
            padding="none"
        >
            <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
                animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                transition={reducedMotion ? { duration: 0.01 } : { delay: animationDelay, duration: 0.3 }}
                className="h-full flex flex-col"
            >
                {/* Preview Image or Icon Header */}
                <div className="relative h-40 bg-slate-50 overflow-hidden border-b-4 border-slate-100 shrink-0">
                    {previewImage ? (
                        <img
                            src={previewImage}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                            <div className="w-20 h-20 bg-white rounded-[1.5rem] shadow-sm flex items-center justify-center border-4 border-slate-100 group-hover:border-[#E85D04] transition-colors group-hover:scale-110 duration-300">
                                <UIIcon name={icon} size={40} className="text-[#E85D04]" />
                            </div>
                        </div>
                    )}

                    {/* NEW badge */}
                    {isNew && (
                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#E85D04] text-white text-xs font-black rounded-full shadow-sm tracking-widest uppercase border-2 border-white">
                            NEW
                        </div>
                    )}

                    {/* COMING SOON badge */}
                    {comingSoon && (
                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-black rounded-full shadow-sm tracking-widest uppercase border-2 border-white">
                            SOON
                        </div>
                    )}

                    {/* Stars display */}
                    {starsEarned > 0 && (
                        <div className="absolute top-4 right-4 flex gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm border-2 border-yellow-100">
                            {[1, 2, 3].map((star) => (
                                <span
                                    key={star}
                                    className={`text-xl -mt-1 drop-shadow-sm ${star <= starsEarned ? 'text-yellow-400' : 'text-slate-200'}`}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Category badge */}
                    <div className="absolute bottom-4 left-4">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border} backdrop-blur-sm bg-white/90`}>
                            {category}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-2xl font-black mb-2 text-slate-800 group-hover:text-[#3B82F6] transition-colors leading-tight tracking-tight">
                        {title}
                    </h3>

                    <p className="text-slate-600 font-semibold text-sm mb-5 line-clamp-2 leading-relaxed flex-1">
                        {description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                        <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-lg border-2 border-slate-200">
                            {ageRange}
                        </span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-lg border-2 ${diffColor.bg} ${diffColor.text} ${diffColor.border}`}>
                            {difficulty}
                        </span>
                    </div>

                    {/* Progress bar (if progress provided) */}
                    {progress !== undefined && (
                        <div className="mb-5">
                            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                                <span>Progress</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden border-2 border-slate-200">
                                <motion.div
                                    initial={reducedMotion ? false : { width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={reducedMotion ? { duration: 0.01 } : { delay: animationDelay + 0.3, duration: 0.5 }}
                                    className="h-full bg-green-500 rounded-full"
                                />
                            </div>
                        </div>
                    )}

                    {/* Play count */}
                    {playCount !== undefined && playCount > 0 && (
                        <div className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">
                            Played {playCount} time{playCount !== 1 ? 's' : ''}
                        </div>
                    )}

                    {/* Action button */}
                    <div className="mt-auto">
                        {comingSoon ? (
                            <Button fullWidth variant="ghost" disabled>
                                Coming Soon
                            </Button>
                        ) : onPlay ? (
                            <Button fullWidth onClick={onPlay}>
                                {buttonText}
                            </Button>
                        ) : (
                            <ButtonLink fullWidth to={path}>
                                {buttonText}
                            </ButtonLink>
                        )}
                    </div>
                </div>
            </motion.div>
        </Card>
    );

    return CardContent;
});

export default GameCard;
