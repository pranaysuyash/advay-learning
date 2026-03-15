import { memo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Button } from '../ui/Button';
import { UIIcon } from '../ui/Icon';
import { useAudio } from '../../utils/hooks/useAudio';

export interface GameOption {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface PreGameMenuProps {
  /** Game title */
  title: string;
  /** One-line description */
  description: string;
  /** Game illustration (centered, max 96px) */
  illustration?: React.ReactNode;
  /** Difficulty/mode options (max 3) */
  options?: GameOption[];
  /** Called with selected option id (or undefined if no options) */
  onStart: (optionId?: string) => void;
  /** How to play content (collapsed by default) */
  howToPlay?: React.ReactNode;
  /** Show tutorial replay button */
  onReplayTutorial?: () => void;
}

export const PreGameMenu = memo(function PreGameMenu({
  title,
  description,
  illustration,
  options,
  onStart,
  howToPlay,
  onReplayTutorial,
}: PreGameMenuProps) {
  const reducedMotion = useReducedMotion();
  const { playClick } = useAudio();
  const [selectedOption, setSelectedOption] = useState<string | null>(
    options?.[0]?.id ?? null,
  );
  const [showHelp, setShowHelp] = useState(false);

  const gridCols =
    options?.length === 2
      ? 'grid-cols-2'
      : options?.length === 3
        ? 'grid-cols-3'
        : 'grid-cols-1';

  return (
    <div className="absolute inset-0 z-50 bg-[#FFF8F0]/90 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reducedMotion ? 0.1 : 0.2 }}
        className="bg-white rounded-2xl border-3 border-[#F2CC8F] shadow-soft-lg p-8 text-center w-full max-w-md"
      >
        {/* Illustration */}
        {illustration && (
          <div className="flex justify-center mb-6">{illustration}</div>
        )}

        {/* Title */}
        <h2 className="text-h1 font-black text-advay-slate tracking-tight mb-2">
          {title}
        </h2>

        {/* Description */}
        <p className="text-body font-bold text-text-secondary mb-6">
          {description}
        </p>

        {/* Options */}
        {options && options.length > 0 && (
          <div className={`grid ${gridCols} gap-3 mb-6`}>
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  playClick();
                  setSelectedOption(option.id);
                }}
                className={`p-4 rounded-2xl border-3 transition-all text-center min-h-[60px] focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 ${
                  selectedOption === option.id
                    ? 'border-[#3B82F6] bg-blue-50'
                    : 'border-[#F2CC8F] hover:border-slate-300 bg-white'
                }`}
              >
                {option.icon && <div className="mb-2">{option.icon}</div>}
                <div className="font-black text-advay-slate text-sm">
                  {option.label}
                </div>
                {option.description && (
                  <div className="text-xs font-bold text-text-muted mt-1">
                    {option.description}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Start button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon="play"
          onClick={() => {
            onStart(selectedOption ?? undefined);
          }}
        >
          Start Playing
        </Button>

        {/* How to play */}
        {howToPlay && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                playClick();
                setShowHelp(!showHelp);
              }}
              className="text-sm font-bold text-text-muted hover:text-text-secondary flex items-center gap-1 mx-auto transition-colors"
            >
              <UIIcon
                name="chevron-down"
                size={16}
                className={`transition-transform ${showHelp ? 'rotate-180' : ''}`}
              />
              How to Play
            </button>
            <AnimatePresence>
              {showHelp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: reducedMotion ? 0.1 : 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="text-sm text-text-secondary text-left mt-2 p-4 bg-slate-50 rounded-2xl">
                    {howToPlay}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Replay tutorial */}
        {onReplayTutorial && (
          <button
            type="button"
            onClick={() => {
              playClick();
              onReplayTutorial();
            }}
            className="text-sm font-bold text-[#3B82F6] hover:underline mt-3"
          >
            Replay Tutorial
          </button>
        )}
      </motion.div>
    </div>
  );
});
