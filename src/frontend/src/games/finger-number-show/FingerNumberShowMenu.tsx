import { AnimatePresence, motion } from 'framer-motion';
import { GameControls } from '../../components/GameControls';
import type { GameControl } from '../../components/GameControls';
import { GameSetupCard } from '../../components/game/GameSetupCard';
import { OptionChips } from '../../components/game/OptionChips';

type DifficultyLevel = {
  name: string;
  minNumber: number;
  maxNumber: number;
  rewardMultiplier: number;
};

type LanguageOption = {
  code: string;
  name: string;
  flagIcon?: string;
};

type GameMode = 'numbers' | 'letters';

type Props = {
  gameMode: GameMode;
  onGameModeChange: (mode: GameMode) => void;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  difficulty: number;
  onDifficultyChange: (difficultyIndex: number) => void;
  score: number;
  streak: number;
  isModelLoading: boolean;
  feedback: string;
  isPromptFeedback: boolean;
  menuControls: GameControl[];
  startGame: () => void;
  languages: LanguageOption[];
  difficultyLevels: DifficultyLevel[];
};

export function FingerNumberShowMenu(props: Props) {
  const {
    gameMode,
    onGameModeChange,
    selectedLanguage,
    onLanguageChange,
    difficulty,
    onDifficultyChange,
    score,
    streak,
    isModelLoading,
    feedback,
    isPromptFeedback,
    menuControls,
    startGame,
    languages,
    difficultyLevels,
  } = props;

  return (
    <section className='max-w-7xl mx-auto px-4 py-8'>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <header className='flex justify-between items-start mb-4'>
          <div>
            <h1 className='text-2xl md:text-3xl font-bold'>
              {gameMode === 'letters' ? 'Letter Finger Show' : 'Finger Number Show'}
            </h1>
            <p className='text-text-secondary text-sm md:text-base'>
              {gameMode === 'letters'
                ? 'Show letters by counting with your fingers!'
                : 'Show numbers with your fingers!'}
            </p>
          </div>
          <div className='text-right'>
            <output className='text-xl md:text-2xl font-bold text-text-primary block'>
              Score: {score}
            </output>
            <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-text-secondary mt-1'>
              <span className='flex items-center gap-1 min-w-fit'>
                <span className='text-pip-orange'>🔥</span>
                Streak: {streak}
              </span>
              <span className='min-w-fit'>
                {(difficultyLevels[difficulty] ?? difficultyLevels[0]).name}
              </span>
            </div>
          </div>
        </header>

        <GameSetupCard title='Choose Game Mode'>
          <OptionChips
            label='Game mode'
            options={[
              { id: 'numbers', label: 'Numbers', icon: '🔢' },
              { id: 'letters', label: 'Letters', icon: '🔤' },
            ]}
            selectedId={gameMode}
            onSelect={(id) => onGameModeChange(id as GameMode)}
            buttonMinHeightClassName='min-h-[56px]'
          />

          {gameMode === 'letters' ? (
            <div className='mt-4'>
              <div className='text-sm font-medium text-text-secondary mb-2'>
                Choose Language
              </div>
              <OptionChips
                label='Language'
                options={languages.map((lang) => ({
                  id: lang.code,
                  label: lang.name,
                  icon: lang.flagIcon ? (
                    <img
                      src={lang.flagIcon}
                      alt=''
                      className='w-4 h-4'
                      loading='lazy'
                    />
                  ) : (
                    '🌐'
                  ),
                }))}
                selectedId={selectedLanguage}
                onSelect={onLanguageChange}
                buttonMinHeightClassName='min-h-[56px]'
              />
            </div>
          ) : null}
        </GameSetupCard>

        {gameMode === 'numbers' ? (
          <div className='mt-6'>
            <GameSetupCard title='Choose Difficulty'>
              <OptionChips
                label='Difficulty'
                options={difficultyLevels.map((level, idx) => ({
                  id: String(idx),
                  label: level.name,
                  sublabel: `${level.minNumber}-${level.maxNumber}`,
                }))}
                selectedId={String(difficulty)}
                onSelect={(id) => onDifficultyChange(Number(id))}
                buttonMinHeightClassName='min-h-[56px]'
              />
            </GameSetupCard>
          </div>
        ) : null}

        <AnimatePresence>
          {feedback && !isPromptFeedback ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`rounded-xl p-4 mb-6 text-center font-semibold mt-6 ${
                feedback.includes('Great') || feedback.includes('Amazing')
                  ? 'bg-success/20 border border-success/30 text-text-success'
                  : 'bg-white border border-border text-text-secondary'
              }`}
            >
              {feedback}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className='bg-white border border-border rounded-2xl p-12 text-center relative overflow-hidden shadow-soft-lg mt-6'>
          <div className='absolute inset-0 opacity-20'>
            <div className='absolute top-10 left-10 w-16 h-16 rounded-full bg-brand-accent blur-xl' />
            <div className='absolute bottom-20 right-16 w-24 h-24 rounded-full bg-pip-orange blur-xl' />
            <div className='absolute top-1/2 right-1/4 w-12 h-12 rounded-full bg-vision-blue blur-xl' />
          </div>

          <div className='text-6xl mb-4'>{gameMode === 'letters' ? '🔤' : '🤚'}</div>
          <h2 className='text-3xl font-bold mb-4 text-advay-slate'>
            {gameMode === 'letters' ? 'Ready to Learn Letters?' : 'Ready to Count?'}
          </h2>
          <p className='text-text-secondary mb-8 max-w-md mx-auto text-lg'>
            {gameMode === 'letters'
              ? 'Show me letters by holding up the right number of fingers! A=1 finger, B=2 fingers, and so on.'
              : "Hold up your fingers to show numbers! The camera will count how many fingers you're showing."}
          </p>

          <GameControls
            controls={[
              ...menuControls,
              {
                id: 'start',
                icon: 'play',
                label: isModelLoading ? 'Loading...' : 'Start Game',
                onClick: startGame,
                variant: 'success',
                disabled: isModelLoading,
              },
            ]}
            position='bottom-center'
          />
        </div>
      </motion.div>
    </section>
  );
}
