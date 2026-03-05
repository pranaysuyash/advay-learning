/**
 * Body Parts Game
 * 
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { memo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GamePage } from '../components/GamePage';
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useStreakTracking } from '../hooks/useStreakTracking';
import {
  LEVELS,
  getPartsForLevel,
  calculateScore,
  type BodyPart,
} from '../games/bodyPartsLogic';
import { triggerHaptic } from '../utils/haptics';

interface BodyPartsCtx {
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  currentLevel: number;
  setCurrentLevel: React.Dispatch<React.SetStateAction<number>>;
  finishContext: () => Promise<void>;
}

function BodyPartsGame({
  score,
  setScore,
  currentLevel,
  setCurrentLevel,
  finishContext,
}: BodyPartsCtx) {
  const navigate = useNavigate();
  const [parts, setParts] = useState<BodyPart[]>([]);
  const [targetPart, setTargetPart] = useState<BodyPart | null>(null);
  const [correct, setCorrect] = useState(0);
  const [round, setRound] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>(
    'start',
  );
  const [feedback, setFeedback] = useState('');
  const [, setError] = useState<Error | null>(null);
  const {
    streak,
    maxStreak,
    showMilestone,
    scorePopup,
    incrementStreak,
    resetStreak,
    setScorePopup,
  } = useStreakTracking();

  const { playClick, playSuccess, playError } = useAudio();
  const { onGameComplete } = useGameDrops('body-parts');

  useGameSessionProgress({
    gameName: 'Body Parts',
    score,
    level: currentLevel,
    isPlaying: gameState === 'playing',
    metaData: { correct, round },
  });

  // guard logic moved into wrapper (GamePage handles subscription, access, error)

  const startGame = () => {
    const newParts = getPartsForLevel(currentLevel);
    setParts(newParts);
    setTargetPart(newParts[Math.floor(Math.random() * newParts.length)]);
    setScore(0);
    setCorrect(0);
    setRound(0);
    resetStreak();
    setGameState('playing');
    setFeedback('');
  };

  const handleAnswer = (part: BodyPart) => {
    if (!targetPart || gameState !== 'playing') return;
    playClick();
    if (part.name === targetPart.name) {
      // Correct answer - build streak
      incrementStreak();

      // Calculate score with streak and level multiplier
      const points = calculateScore(streak + 1, currentLevel);
      setScore((s) => s + points);

      // Show score popup
      setScorePopup({ points, x: 50, y: 30 });
      setTimeout(() => setScorePopup(null), 700);

      // Haptic feedback
      triggerHaptic('success');

      playSuccess();
      setCorrect((c) => c + 1);
      setFeedback(`Correct! That's the ${part.name}!`);
    } else {
      // Wrong answer - break streak
      resetStreak();
      triggerHaptic('error');
      playError();
      setFeedback(`Oops! That's the ${part.name}.`);
    }
    setTimeout(() => {
      const newParts = getPartsForLevel(currentLevel);
      setParts(newParts);
      setTargetPart(newParts[Math.floor(Math.random() * newParts.length)]);
      setRound((r) => r + 1);
      setFeedback('');
      if (round >= 4) {
        setGameState('complete');
        triggerHaptic('celebration');
      }
    }, 2000);
  };

  const handleStart = () => {
    playClick();
    startGame();
  };
  const handleGameComplete = useCallback(
    async (finalScore: number) => {
      try {
        await finishContext(); // wrapper will record progress/additional metadata as needed
        onGameComplete(finalScore);
      } catch (err) {
        console.error('Failed to complete', err);
        setError(err as Error);
      }
    },
    [finishContext, onGameComplete],
  );

  const handleFinish = useCallback(async () => {
    playClick();
    await handleGameComplete(score);
    await onGameComplete(correct);
    navigate('/games');
  }, [correct, onGameComplete, navigate, playClick, handleGameComplete, score]);

  return (
    <GameContainer
      title='Body Parts'
      onHome={() => navigate('/games')}
      reportSession={false}
    >
      <div className='flex flex-col items-center gap-4 p-4'>
        <div className='flex gap-2'>
          {LEVELS.map((l) => (
            <button
              type='button'
              key={l.level}
              onClick={() => {
                playClick();
                setCurrentLevel(l.level);
              }}
              className={`px-4 py-2 rounded-full font-bold ${currentLevel === l.level ? 'bg-rose-500 text-white' : 'bg-gray-200'}`}
            >
              Level {l.level}
            </button>
          ))}
        </div>

        {gameState === 'start' && (
          <div className='text-center'>
            <p className='text-6xl mb-4'>🧘</p>
            <h2 className='text-2xl font-bold mb-2'>Body Parts!</h2>
            <p className='mb-2'>Point to the body part!</p>
            <div className='bg-rose-50 rounded-xl p-3 text-sm text-slate-600 mb-4 inline-block'>
              <p className='font-bold mb-1'>🎯 Scoring:</p>
              <p>Base 15 pts + streak bonus</p>
              <p>× Level: L1 1× | L2 1.5× | L3 2×</p>
            </div>
            <br />
            <button
              type='button'
              onClick={handleStart}
              className='px-8 py-4 bg-rose-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:scale-105 transition-transform'
            >
              Start!
            </button>
          </div>
        )}

        {gameState === 'playing' && targetPart && (
          <div className='text-center'>
            {/* Streak HUD */}
            <div className='flex items-center justify-center gap-3 bg-white rounded-xl border-2 border-orange-200 px-4 py-2 mb-4 shadow-sm'>
              <span className='font-black text-lg'>🔥 Streak</span>
              <div className='flex gap-1'>
                {[1, 2, 3, 4, 5].map((i) => (
                  <img
                    key={i}
                    src={
                      streak >= i * 2
                        ? '/assets/kenney/platformer/hud/hud_heart.png'
                        : '/assets/kenney/platformer/hud/hud_heart_empty.png'
                    }
                    alt={streak >= i * 2 ? 'filled heart' : 'empty heart'}
                    className='w-6 h-6'
                  />
                ))}
              </div>
              <span className='font-black text-2xl text-orange-500 min-w-[2ch] text-center'>
                {streak}
              </span>
            </div>

            {/* Streak milestone popup */}
            {showMilestone && (
              <div className='animate-bounce bg-orange-100 border-2 border-orange-300 rounded-xl px-6 py-3 mb-4 inline-block'>
                <p className='text-xl font-black text-orange-600'>
                  🔥 {streak} Streak! 🔥
                </p>
              </div>
            )}

            <p className='text-2xl font-bold mb-4'>Point to your:</p>
            <p className='text-5xl font-bold text-rose-600 mb-4'>
              {targetPart.name}
            </p>
            <div className='grid grid-cols-2 gap-4 mb-4'>
              {parts.map((part) => (
                <button
                  type='button'
                  key={part.name}
                  onClick={() => handleAnswer(part)}
                  className='p-6 bg-white rounded-xl shadow-md hover:bg-rose-50 transition-all text-6xl'
                >
                  {part.emoji}
                </button>
              ))}
            </div>
            {/* Score popup */}
            {scorePopup && (
              <div className='font-black text-3xl text-green-500 animate-bounce mb-2'>
                +{scorePopup.points}
              </div>
            )}

            <p className='text-lg font-medium text-purple-600'>{feedback}</p>
            <div className='flex gap-4 mt-4'>
              <div className='bg-green-100 px-4 py-2 rounded-xl text-center border-2 border-green-200'>
                <p className='text-xs font-black uppercase text-green-600'>Correct</p>
                <p className='text-2xl font-bold text-green-700'>{correct}</p>
              </div>
              <div className='bg-rose-100 px-4 py-2 rounded-xl text-center border-2 border-rose-200'>
                <p className='text-xs font-black uppercase text-rose-600'>Round</p>
                <p className='text-2xl font-bold text-rose-700'>{round + 1}/5</p>
              </div>
              <div className='bg-orange-100 px-4 py-2 rounded-xl text-center border-2 border-orange-200'>
                <p className='text-xs font-black uppercase text-orange-600'>Best Streak</p>
                <p className='text-2xl font-bold text-orange-700'>{maxStreak}</p>
              </div>
            </div>
          </div>
        )}

        {gameState === 'complete' && (
          <div className='text-center'>
            <p className='text-6xl mb-4'>🎉</p>
            <h2 className='text-2xl font-bold mb-2'>Great Job!</h2>
            <p className='text-xl mb-4'>You got {correct} right!</p>
            {/* Streak badge */}
            {maxStreak >= 5 && (
              <div className='flex items-center justify-center gap-2 bg-orange-100 border-2 border-orange-300 px-4 py-2 rounded-full mb-4'>
                <img
                  src='/assets/kenney/platformer/collectibles/star.png'
                  alt='star'
                  className='w-6 h-6'
                />
                <span className='font-black text-orange-700'>
                  Best Streak: {maxStreak}!
                </span>
              </div>
            )}
            <div className='flex justify-center gap-4 mb-4'>
              <div className='bg-rose-50 border-2 border-rose-200 px-6 py-3 rounded-xl text-center'>
                <p className='text-xs font-black uppercase text-rose-600'>Score</p>
                <p className='text-3xl font-black text-rose-700'>{score}</p>
              </div>
              <div className='bg-orange-50 border-2 border-orange-200 px-6 py-3 rounded-xl text-center'>
                <p className='text-xs font-black uppercase text-orange-600'>Max Streak</p>
                <p className='text-3xl font-black text-orange-700'>{maxStreak}</p>
              </div>
            </div>
            <button
              type='button'
              onClick={handleStart}
              className='px-6 py-3 bg-rose-500 text-white rounded-xl font-bold mr-4 hover:scale-105 transition-transform'
            >
              Play Again
            </button>
            <button
              type='button'
              onClick={handleFinish}
              className='px-6 py-3 bg-gray-200 rounded-xl font-bold hover:bg-gray-300 transition-colors'
            >
              Finish
            </button>
          </div>
        )}
      </div>
    </GameContainer>
  );
}

const BodyPartsPage = memo(function BodyPartsGameComponent() {
  return (
    <GamePage title='Body Parts' gameId='body-parts'>
      {({ score, setScore, currentLevel, setCurrentLevel, handleFinish }) => (
        <BodyPartsGame
          score={score}
          setScore={setScore}
          currentLevel={currentLevel}
          setCurrentLevel={setCurrentLevel}
          finishContext={handleFinish}
        />
      )}
    </GamePage>
  );
});

// Main export wrapped with GameShell
export const BodyParts = memo(function BodyPartsComponent() {
  return (
    <GameShell
      gameId="body-parts"
      gameName="Body Parts"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <BodyPartsPage />
    </GameShell>
  );
});
