import { UIIcon } from '../../components/ui/Icon';
import type { Letter } from '../../data/alphabets';

type Props = {
  promptStage: 'center' | 'side';
  gameMode: 'numbers' | 'letters';
  targetNumber: number;
  targetLetter: Letter | null;
  currentCount: number;
  handsDetected: number;
  isDetectedMatch: boolean;
  numberNames: readonly string[];
};

export function FingerNumberShowHud(props: Props) {
  const {
    promptStage,
    gameMode,
    targetNumber,
    targetLetter,
    currentCount,
    handsDetected,
    isDetectedMatch,
    numberNames,
  } = props;

  return (
    <>
      {promptStage === 'side' ? (
        <div className='absolute top-4 left-4 flex gap-2 flex-wrap pointer-events-none'>
          <div className='bg-black/55 backdrop-blur px-4 py-2 rounded-full text-sm md:text-base font-bold border border-white/30 text-white shadow-soft'>
            <span className='flex items-center gap-2'>
              <UIIcon name='target' size={16} className='text-yellow-300' />
              Show{' '}
              <span className='font-extrabold'>
                {gameMode === 'letters' && targetLetter
                  ? targetLetter.char
                  : targetNumber}
              </span>
              {gameMode === 'letters' && targetLetter ? (
                <span className='opacity-80'>({targetLetter.name})</span>
              ) : null}
            </span>
          </div>
        </div>
      ) : null}

      <div className='absolute top-4 right-4 pointer-events-none'>
        <div className='bg-black/55 backdrop-blur px-4 py-2 rounded-full text-sm md:text-base font-bold border border-white/30 text-white shadow-soft'>
          <span className='flex items-center gap-2'>
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                isDetectedMatch
                  ? 'bg-success shadow-[0_0_10px_rgba(34,197,94,0.9)]'
                  : 'bg-white/40'
              }`}
            />
            {handsDetected > 0 ? `${currentCount} fingers` : 'No hands'}
          </span>
        </div>
      </div>

      {promptStage === 'center' ? (
        <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
          <div className='bg-black/65 backdrop-blur px-8 py-6 rounded-3xl border border-white/30 text-white shadow-soft-lg'>
            <div className='text-center'>
              {gameMode === 'letters' && targetLetter ? (
                <>
                  <div className='text-sm md:text-base opacity-85 font-semibold mb-2'>
                    Show me
                  </div>
                  <div className='text-7xl md:text-8xl font-black leading-none'>
                    {targetLetter.char}
                  </div>
                  <div className='text-base md:text-lg opacity-90 font-semibold mt-2'>
                    {targetLetter.name}
                  </div>
                  <div className='text-sm opacity-70 mt-1'>
                    ({targetLetter.pronunciation})
                  </div>
                </>
              ) : (
                <>
                  <div className='text-sm md:text-base opacity-85 font-semibold mb-2'>
                    {targetNumber === 0 ? 'Make a fist' : 'Show'}
                  </div>
                  <div className='text-7xl md:text-8xl font-black leading-none'>
                    {targetNumber}
                  </div>
                  <div className='text-base md:text-lg opacity-90 font-semibold mt-2'>
                    {numberNames[targetNumber] ?? ''}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

