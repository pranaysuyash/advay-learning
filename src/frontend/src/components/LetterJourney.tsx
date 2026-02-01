import { motion } from 'framer-motion';
import { useProgressStore, BATCH_SIZE } from '../store';
import { getAlphabet } from '../data/alphabets';
import { Icon } from './Icon';
import { UIIcon } from './ui/Icon';

interface LetterJourneyProps {
  language: string;
  onLetterClick?: (letter: string) => void;
}

const LETTER_COLOR_CLASS_MAP: Record<string, string> = {
  '#ef4444': 'letter-color-ef4444',
  '#dc2626': 'letter-color-dc2626',
  '#3b82f6': 'letter-color-3b82f6',
  '#f59e0b': 'letter-color-f59e0b',
  '#10b981': 'letter-color-10b981',
  '#8b5cf6': 'letter-color-8b5cf6',
  '#06b6d4': 'letter-color-06b6d4',
  '#84cc16': 'letter-color-84cc16',
  '#f97316': 'letter-color-f97316',
  '#ec4899': 'letter-color-ec4899',
  '#eab308': 'letter-color-eab308',
  '#6366f1': 'letter-color-6366f1',
  '#64748b': 'letter-color-64748b',
  '#a16207': 'letter-color-a16207',
  '#a855f7': 'letter-color-a855f7',
  '#16a34a': 'letter-color-16a34a',
  '#1f2937': 'letter-color-1f2937',
  '#fff': 'letter-color-ffffff',
  '#ffffff': 'letter-color-ffffff',
};

const getLetterColorClass = (color?: string) =>
  (color ? LETTER_COLOR_CLASS_MAP[color.toLowerCase()] : undefined) ??
  'text-white';

export function LetterJourney({ language, onLetterClick }: LetterJourneyProps) {
  const alphabet = getAlphabet(language);
  const {
    letterProgress,
    batchProgress,
    isLetterMastered,
    getBatchMasteryCount,
  } = useProgressStore();

  const langProgress = letterProgress[language] || [];
  const langBatches = batchProgress[language] || [];
  const totalBatches = Math.ceil(alphabet.letters.length / BATCH_SIZE);

  // Get unlocked batch indices
  const unlockedBatches = new Set([0]);
  langBatches.forEach((b) => {
    if (b.unlocked) unlockedBatches.add(b.batchIndex);
  });

  return (
    <div className='bg-white/10 border border-border rounded-xl p-6 shadow-sm'>
      <h2 className='text-2xl font-bold mb-2'>Letter Journey</h2>
      <p className='text-slate-300 mb-6'>
        Master 3 letters in each batch to unlock the next! (
        {langProgress.filter((p) => p.mastered).length} of{' '}
        {alphabet.letters.length} mastered)
      </p>

      <div className='space-y-6'>
        {Array.from({ length: totalBatches }, (_, batchIndex) => {
          const isUnlocked = unlockedBatches.has(batchIndex);
          const startIdx = batchIndex * BATCH_SIZE;
          const endIdx = Math.min(
            startIdx + BATCH_SIZE,
            alphabet.letters.length,
          );
          const batchLetters = alphabet.letters.slice(startIdx, endIdx);
          const masteredCount = getBatchMasteryCount(language, batchIndex);
          const isCompleted = masteredCount >= 3;

          return (
            <div key={batchIndex} className='relative'>
              {/* Batch header */}
              <div className='flex items-center gap-3 mb-3'>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isUnlocked
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/20 text-white/60'
                  }`}
                >
                  {isCompleted ? (
                    <UIIcon name='check' size={16} />
                  ) : (
                    batchIndex + 1
                  )}
                </div>
                <span className='font-medium flex items-center gap-2'>
                  Batch {batchIndex + 1}
                  {!isUnlocked && (
                    <UIIcon name='lock' size={14} className='text-slate-400' />
                  )}
                </span>
                <span className='text-sm text-slate-400'>
                  {masteredCount}/3 to unlock
                </span>
              </div>

              {/* Letters grid */}
              <div className='grid grid-cols-5 gap-2 ml-11'>
                {batchLetters.map((letter) => {
                  const isMastered = isLetterMastered(language, letter.char);
                  const letterProg = langProgress.find(
                    (p) => p.letter === letter.char,
                  );
                  const letterColorClass = getLetterColorClass(letter.color);

                  return (
                    <motion.button
                      key={letter.char}
                      whileHover={isUnlocked ? { scale: 1.05 } : {}}
                      whileTap={isUnlocked ? { scale: 0.95 } : {}}
                      onClick={() => isUnlocked && onLetterClick?.(letter.char)}
                      disabled={!isUnlocked}
                      className={`
                        aspect-square rounded-lg flex flex-col items-center justify-center gap-1
                        transition-all duration-200
                        ${
                          isUnlocked
                            ? 'cursor-pointer hover:shadow-lg'
                            : 'cursor-not-allowed opacity-50'
                        }
                        ${
                          isMastered
                            ? 'bg-green-500/30 border-2 border-green-500 shadow-md'
                            : isUnlocked
                              ? 'bg-white/10 border border-border hover:bg-white/20 hover:border-border-strong shadow-sm'
                              : 'bg-white/10 border border-border opacity-70'
                        }
                      `}
                    >
                      <span className={`text-xl font-bold ${letterColorClass}`}>
                        {letter.char}
                      </span>
                      <Icon
                        src={letter.icon}
                        alt={letter.name}
                        size={24}
                        className='opacity-90'
                        fallback={letter.emoji || '✨'}
                      />
                      {isMastered && (
                        <span className='text-xs text-green-400'>★</span>
                      )}
                      {letterProg && !isMastered && (
                        <span className='text-xs text-slate-400'>
                          {Math.round(letterProg.bestAccuracy)}%
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Connector line */}
              {batchIndex < totalBatches - 1 && (
                <div className='absolute left-4 top-14 w-0.5 h-6 bg-white/20' />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className='mt-6 pt-6 border-t border-border flex flex-wrap gap-4 text-sm'>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded bg-green-500/30 border border-green-500' />
          <span className='text-slate-400'>Mastered</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded bg-white/10 border border-border' />
          <span className='text-slate-400'>Available</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded bg-white/10 border border-border opacity-50' />
          <span className='text-slate-400'>Locked</span>
        </div>
      </div>
    </div>
  );
}
