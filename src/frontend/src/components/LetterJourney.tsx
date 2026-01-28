import { motion } from 'framer-motion';
import { useProgressStore, BATCH_SIZE } from '../store';
import { getAlphabet } from '../data/alphabets';

interface LetterJourneyProps {
  language: string;
  onLetterClick?: (letter: string) => void;
}

export function LetterJourney({ language, onLetterClick }: LetterJourneyProps) {
  const alphabet = getAlphabet(language);
  const { 
    letterProgress, 
    batchProgress, 
    isLetterMastered, 
    getBatchMasteryCount 
  } = useProgressStore();
  
  const langProgress = letterProgress[language] || [];
  const langBatches = batchProgress[language] || [];
  const totalBatches = Math.ceil(alphabet.letters.length / BATCH_SIZE);
  
  // Get unlocked batch indices
  const unlockedBatches = new Set([0]);
  langBatches.forEach(b => {
    if (b.unlocked) unlockedBatches.add(b.batchIndex);
  });
  
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-2">Letter Journey</h2>
      <p className="text-white/60 mb-6">
        Master 3 letters in each batch to unlock the next! 
        ({langProgress.filter(p => p.mastered).length} of {alphabet.letters.length} mastered)
      </p>
      
      <div className="space-y-6">
        {Array.from({ length: totalBatches }, (_, batchIndex) => {
          const isUnlocked = unlockedBatches.has(batchIndex);
          const startIdx = batchIndex * BATCH_SIZE;
          const endIdx = Math.min(startIdx + BATCH_SIZE, alphabet.letters.length);
          const batchLetters = alphabet.letters.slice(startIdx, endIdx);
          const masteredCount = getBatchMasteryCount(language, batchIndex);
          const isCompleted = masteredCount >= 3;
          
          return (
            <div key={batchIndex} className="relative">
              {/* Batch header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isUnlocked 
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/20 text-white/60'
                }`}>
                  {isCompleted ? '✓' : batchIndex + 1}
                </div>
                <span className="font-medium">
                  Batch {batchIndex + 1}
                  {!isUnlocked && ' 🔒'}
                </span>
                <span className="text-sm text-white/60">
                  {masteredCount}/3 to unlock
                </span>
              </div>
              
              {/* Letters grid */}
              <div className="grid grid-cols-5 gap-2 ml-11">
                {batchLetters.map((letter) => {
                  const isMastered = isLetterMastered(language, letter.char);
                  const letterProg = langProgress.find(p => p.letter === letter.char);
                  
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
                        ${isUnlocked 
                          ? 'cursor-pointer hover:shadow-lg' 
                          : 'cursor-not-allowed opacity-50'
                        }
                        ${isMastered 
                          ? 'bg-green-500/30 border-2 border-green-500' 
                          : isUnlocked
                            ? 'bg-white/10 border border-white/20 hover:bg-white/20'
                            : 'bg-white/5 border border-white/10'
                        }
                      `}
                    >
                      <span className="text-2xl font-bold" style={{ color: letter.color }}>
                        {letter.char}
                      </span>
                      {isMastered && (
                        <span className="text-xs text-green-400">★</span>
                      )}
                      {letterProg && !isMastered && (
                        <span className="text-xs text-white/40">
                          {Math.round(letterProg.bestAccuracy)}%
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
              
              {/* Connector line */}
              {batchIndex < totalBatches - 1 && (
                <div className="absolute left-4 top-14 w-0.5 h-6 bg-white/10" />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500/30 border border-green-500" />
          <span className="text-white/60">Mastered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white/10 border border-white/20" />
          <span className="text-white/60">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white/5 border border-white/10 opacity-50" />
          <span className="text-white/60">Locked</span>
        </div>
      </div>
    </div>
  );
}
