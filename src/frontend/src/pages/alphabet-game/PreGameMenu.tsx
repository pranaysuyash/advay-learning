import { motion } from 'framer-motion';
import { Mascot } from '../../components/Mascot';
import { GameControls } from '../../components/GameControls';
import type { GameControl } from '../../components/GameControls';
import { UIIcon } from '../../components/ui/Icon';
import { LoadingState } from '../../components/LoadingState';
import { LanguageFlag } from '../../components/ui/LanguageFlag';
import { getAllIcons } from '../../utils/iconUtils';
import { BATCH_SIZE } from '../../store';

// eslint-disable-next-line react-refresh/only-export-components
export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'kn', name: 'Kannada' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
] as const;

interface PreGameMenuProps {
  score: number;
  streak: number;
  currentLetterIndex: number;
  letters: Array<any>;
  pendingCount: number;
  currentLetter: any;
  accuracy: number;
  accuracyColorClass: string;
  isHandTrackingLoading: boolean;
  feedback: string | null;
  showPermissionWarning: boolean;
  selectedLanguage: string;
  onLanguageSelect: (lang: string) => void;
  onIndexReset: () => void;
  difficulty: string;
  menuControls: GameControl[];
  onPlayClick: () => void;
  playClick: () => void;
}

export function PreGameMenu({
  score,
  streak,
  currentLetterIndex,
  letters,
  pendingCount,
  currentLetter,
  accuracy,
  accuracyColorClass,
  isHandTrackingLoading,
  feedback,
  showPermissionWarning,
  selectedLanguage,
  onLanguageSelect,
  onIndexReset,
  difficulty,
  menuControls,
  playClick,
}: PreGameMenuProps) {
  return (
    <section className='bg-discovery-cream min-h-screen max-w-7xl mx-auto px-4 py-8 md:py-12'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <header className='flex flex-col sm:flex-row justify-between items-start gap-4 mb-8'>
          <div>
            <h1 className='text-h1 md:text-[2.5rem] font-extrabold text-advay-slate tracking-tight'>
              Learning Game
            </h1>
            <p className='text-text-secondary text-base md:text-lg font-bold mt-2'>
              Trace letters with your finger!
            </p>
          </div>
          <div className='bg-white border-3 border-[#F2CC8F] rounded-3xl px-6 py-5 shadow-[0_8px_0_#E5B86E] w-full sm:w-auto relative top-[-4px]'>
            <output className='text-3xl md:text-4xl font-black text-pip-orange block text-left sm:text-right mb-1'>
              Score: {score}
            </output>
            <div className='flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1'>
              <span className='flex items-center gap-1 min-w-fit'>
                <UIIcon
                  name='flame'
                  size={16}
                  className='text-pip-orange pb-0.5'
                />
                Streak {streak}
              </span>
              <span className='min-w-fit text-slate-400'>
                Batch {Math.floor(currentLetterIndex / BATCH_SIZE) + 1}/
                {Math.ceil(letters.length / BATCH_SIZE)}
              </span>
              {pendingCount > 0 && (
                <div className='inline-flex items-center gap-1 bg-amber-50 border-2 border-amber-200 text-amber-600 px-3 py-1 rounded-full text-xs font-black'>
                  <UIIcon name='warning' size={14} className='pb-0.5' />
                  Pending ({pendingCount})
                </div>
              )}
            </div>
          </div>
        </header>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 items-start'>
          {/* Left column: current letter + status */}
          <div className='space-y-6'>
            {/* Animated Letter Display */}
            <div className='bg-discovery-cream border-3 border-[#F2CC8F] rounded-3xl p-8 md:p-12 shadow-[0_8px_0_#E5B86E] relative top-[-4px]'>
              <div className='flex flex-col items-center justify-center gap-6'>
                <div className='text-center'>
                  <div className='text-9xl md:text-[12rem] font-black mb-4 text-advay-slate drop-shadow-[0_4px_0_#E5B86E]'>
                    {currentLetter.char}
                  </div>
                  {currentLetter.transliteration && (
                    <div className='text-base md:text-lg text-text-secondary mt-2 font-black uppercase tracking-widest'>
                      {currentLetter.transliteration}
                    </div>
                  )}
                </div>
                <div className='w-32 h-32 mb-4 bg-pip-cream rounded-3xl p-6 border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] relative top-[-2px]'>
                  <UIIcon
                    src={getAllIcons(currentLetter)}
                    alt={currentLetter.name}
                    size={128}
                    className='w-full h-full object-contain drop-shadow-md hover:scale-110 transition-transform cursor-pointer'
                    fallback={currentLetter.emoji || ''}
                  />
                </div>
                <div className='text-center'>
                  <div className='text-4xl font-black text-advay-slate tracking-tight'>
                    {currentLetter.name}
                  </div>
                  {currentLetter.pronunciation && (
                    <div className='text-xl text-text-secondary mt-3 font-bold'>
                      &quot;{currentLetter.pronunciation}&quot;
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Accuracy Bar */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className='bg-white border-3 border-[#F2CC8F] rounded-2xl p-5 shadow-[0_4px_0_#E5B86E] relative top-[-2px]'
            >
              <div className='flex justify-between items-center mb-3'>
                <label
                  htmlFor='accuracy-progress'
                  className='text-text-secondary font-bold uppercase tracking-widest text-sm'
                >
                  Tracing Accuracy
                </label>
                <span className={`font-black text-lg ${accuracyColorClass}`}>
                  {accuracy}%
                </span>
              </div>
              <progress
                id='accuracy-progress'
                value={accuracy}
                max={100}
                className='w-full h-4 rounded-full'
              />
            </motion.div>

            {/* Loading State with Pip */}
            {isHandTrackingLoading && (
              <div className='bg-white border border-border rounded-xl p-4 shadow-soft'>
                <LoadingState message='Getting hand tracking ready...' />
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-xl p-4 text-center font-semibold ${feedback?.includes('Great')
                  ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                  : feedback?.includes('Good')
                    ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400'
                    : 'bg-red-500/20 border border-red-500/30 text-red-400'
                  }`}
              >
                {feedback}
              </motion.div>
            )}

            {/* Permission Warning */}
            {showPermissionWarning && (
              <div className='bg-blue-500/15 border-2 border-blue-400/40 rounded-2xl p-5 text-center shadow-lg'>
                <div className='flex items-center justify-center gap-3 text-blue-300 font-bold text-lg'>
                  <span className='text-2xl'>✋</span>
                  <span>Using Finger Magic Mode!</span>
                </div>
                <p className='text-blue-200/90 text-base mt-2 leading-relaxed'>
                  Pip can&apos;t see your hand right now (the Forgetfulness Fog
                  is blocking the camera), but that&apos;s okay! You can use
                  your finger on the screen to draw and rescue letters!
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className='mt-3 px-4 py-2 bg-blue-500/30 hover:bg-blue-500/50 text-blue-200 rounded-lg text-sm font-semibold transition'
                  type='button'
                >
                  Try Hand Magic Again 🔄
                </button>
              </div>
            )}
          </div>

          {/* Right column: setup + start */}
          <div className='space-y-6'>
            <div className='bg-white border-3 border-[#F2CC8F] rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-[0_8px_0_#E5B86E] top-[-4px]'>
              {/* Decorative elements */}
              <div className='absolute inset-0 opacity-10 pointer-events-none'>
                <div className='absolute top-10 left-10 w-32 h-32 rounded-full bg-vision-blue blur-3xl'></div>
                <div className='absolute bottom-20 right-16 w-40 h-40 rounded-full bg-pip-orange blur-3xl'></div>
                <div className='absolute top-1/2 right-1/4 w-24 h-24 rounded-full bg-success blur-3xl'></div>
              </div>

              {/* Mascot Preview */}
              <div className='absolute -bottom-4 -left-4 opacity-90 pointer-events-none drop-shadow-xl'>
                <Mascot state='happy' />
              </div>

              <div className='w-32 h-32 mx-auto mb-8 bg-pip-cream rounded-full flex items-center justify-center border-3 border-pip-orange/20 relative z-10'>
                <img
                  src='/assets/images/onboarding-hand.svg'
                  alt='Hand tracking'
                  className='w-20 h-20 object-contain drop-shadow-[0_4px_0_#E5B86E]'
                />
              </div>
              <h2 className='text-h2 md:text-4xl font-black mb-4 text-advay-slate tracking-tight relative z-10'>
                Ready to Learn?
              </h2>
              <p className='text-text-secondary font-bold mb-10 max-w-sm mx-auto text-lg leading-relaxed relative z-10'>
                Use your hand to trace letters! The camera will track your
                finger movements.
              </p>

              {/* Language Selector */}
              <div className='mb-8'>
                <label
                  className='block text-lg font-bold text-text-primary mb-4'
                  htmlFor='alphabet-select'
                >
                  Choose Your Alphabet
                </label>
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className='flex flex-wrap gap-3 justify-center'>
                    {LANGUAGES.map((lang) => (
                      <button
                        type='button'
                        key={lang.code}
                        onClick={() => {
                          playClick();
                          onLanguageSelect(lang.code);
                          onIndexReset();
                        }}
                        className={`px-6 py-3 rounded-2xl font-extrabold text-lg transition-all transform hover:scale-105 ${selectedLanguage === lang.code
                          ? 'bg-pip-orange text-white shadow-[0_6px_0_#D4561C] relative top-[-6px]'
                          : 'bg-discovery-cream text-advay-slate border-2 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] relative top-[-4px] hover:bg-white'
                          }`}
                      >
                        <span className='mr-3 text-xl'>
                          <LanguageFlag code={lang.code} />
                        </span>
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </form>
              </div>
              <p className='text-center text-text-secondary mt-4 text-base'>
                Progress is tracked separately for each language
              </p>

              <div className='text-lg text-text-secondary mb-8'>
                Difficulty:{' '}
                <span className='text-text-primary font-bold capitalize'>
                  {difficulty}
                </span>
              </div>

              {/* Standardized Menu Controls */}
              <div className='pb-10'>
                <GameControls
                  controls={menuControls}
                  position='bottom-center'
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
