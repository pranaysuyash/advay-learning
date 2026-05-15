/**
 * Letter Match Game
 *
 * Match uppercase and lowercase letters.
 * Educational focus: letter recognition, uppercase/lowercase correspondence.
 */

import { memo, useCallback, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { triggerHaptic } from '../utils/haptics';
import {
  LETTER_PAIRS,
  type LetterPair,
} from '../games/letterMatchLogic';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { GameCursor } from '../components/game/GameCursor';
import type { Point } from '../types/tracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

const LetterMatchGame = memo(function LetterMatchGameComponent() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [currentPair, setCurrentPair] = useState<LetterPair | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [matchType, setMatchType] = useState<'uppercase' | 'lowercase'>('lowercase');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState('');

  const { streak, showMilestone, scorePopup, incrementStreak, resetStreak, setScorePopup } = useStreakTracking();
  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { completeGame } = useGameCompletion('letter-match');

  const [cursor, setCursor] = useState<Point | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const isPlaying = gameState === 'playing';

  const handleFrame = useCallback((frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
    const tip = frame.indexTip;
    if (!tip) { setCursor(null); return; }
    setCursor(tip);
  }, []);

  const handleNoVideoFrame = useCallback(() => { setCursor(null); }, []);

  const { isLoading: isModelLoading, isReady: isHandTrackingReady, startTracking, webcamRef } = useGameHandTracking({
    gameName: 'LetterMatch',
    targetFps: 30,
    isRunning: isPlaying,
    onFrame: handleFrame,
    onNoVideoFrame: handleNoVideoFrame,
  });

  useEffect(() => {
    if (isPlaying && !isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  }, [isPlaying, isHandTrackingReady, isModelLoading, startTracking]);

  useGameSessionProgress({
    gameName: 'Letter Match',
    score,
    level: 1,
    isPlaying: gameState === 'playing',
    metaData: { round, letter: currentPair?.uppercase },
  });

  const startGame = () => {
    setScore(0);
    setRound(0);
    setFeedback('');
    resetStreak();
    nextRound();
    setGameState('playing');
  };

  const nextRound = () => {
    if (round >= 10) {
      setGameState('complete');
      return;
    }
    const pair = LETTER_PAIRS[Math.floor(Math.random() * LETTER_PAIRS.length)];
    setCurrentPair(pair);
    
    // Randomly decide if we show uppercase or lowercase
    const isUppercase = Math.random() > 0.5;
    setMatchType(isUppercase ? 'lowercase' : 'uppercase');
    
    // Generate options including correct answer
    const correctAnswer = isUppercase ? pair.lowercase : pair.uppercase;
    const wrongOptions: string[] = [];
    while (wrongOptions.length < 3) {
      const randomPair = LETTER_PAIRS[Math.floor(Math.random() * LETTER_PAIRS.length)];
      const wrongLetter = isUppercase ? randomPair.lowercase : randomPair.uppercase;
      if (wrongLetter !== correctAnswer && !wrongOptions.includes(wrongLetter)) {
        wrongOptions.push(wrongLetter);
      }
    }
    
    setOptions([correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5));
    setRound((r) => r + 1);
  };

  const handleOptionClick = (letter: string) => {
    if (!currentPair) return;
    playClick();

    const correctAnswer = matchType === 'lowercase' ? currentPair.uppercase : currentPair.lowercase;
    const isCorrect = letter === correctAnswer;

    if (isCorrect) {
      playSuccess();
      const newStreak = incrementStreak();
      const basePoints = 10;
      const streakBonus = Math.min(newStreak * 2, 15);
      const totalPoints = basePoints + streakBonus;
      setScore((s) => s + totalPoints);
      setScorePopup({ points: totalPoints, x: 50, y: 30 });
      setFeedback(`✅ ${currentPair.uppercase} = ${currentPair.lowercase}!`);
      triggerHaptic('success');

      if (newStreak > 0 && newStreak % 5 === 0) {
        playCelebration();
        triggerHaptic('celebration');
      }

      setTimeout(() => {
        nextRound();
      }, 1200);
    } else {
      playError();
      resetStreak();
      setFeedback(`❌ That's not ${matchType === 'lowercase' ? 'uppercase' : 'lowercase'} "${currentPair[matchType === 'lowercase' ? 'lowercase' : 'uppercase']}"`);
      triggerHaptic('error');
    }
  };

  const handleStart = () => { playClick(); startGame(); };

  const handleFinish = useCallback(async () => {
    playClick();
    await completeGame({ score });
    navigate('/games');
  }, [score, completeGame, navigate, playClick]);

  return (
    <GameContainer
      title="Letter Match"
      score={score}
      showScore
      onHome={() => navigate('/games')}
      reportSession={false}
      webcamRef={webcamRef}
      isHandDetected={isHandTrackingReady}
      isPlaying={isPlaying}
    >
      <div ref={gameAreaRef} className="relative flex flex-col items-center gap-6 p-6">
        {gameState === 'start' && (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="text-6xl">🔤</div>
            <h1 className="text-4xl font-bold text-center">Letter Match</h1>
            <p className="text-lg text-muted-foreground text-center max-w-md">
              Match uppercase and lowercase letters! Find the matching letter.
            </p>
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-xl text-xl font-bold shadow-lg hover:scale-105 transition-transform"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState === 'playing' && currentPair && (
          <>
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-2">
                Find the {matchType === 'lowercase' ? 'UPPERCASE' : 'lowercase'} for:
              </p>
              <div className="text-7xl font-bold text-primary">
                {matchType === 'lowercase' ? currentPair.lowercase : currentPair.uppercase}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              {options.map((letter) => (
                <button
                  key={letter}
                  onClick={() => handleOptionClick(letter)}
                  className="w-20 h-20 bg-card hover:bg-accent border-2 border-border rounded-xl flex items-center justify-center text-4xl font-bold transition-all active:scale-95"
                >
                  {letter}
                </button>
              ))}
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Round {round} / 10
              </p>
            </div>

            {feedback && (
              <div className="text-center text-lg font-medium">
                {feedback}
              </div>
            )}

            {showMilestone && (
              <div className="absolute top-20 bg-amber-100 border-2 border-amber-300 px-4 py-2 rounded-xl text-amber-800 font-bold">
                🔥 {streak} Streak! 🔥
              </div>
            )}

            {scorePopup && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="text-3xl font-black text-green-500 animate-bounce">
                  +{scorePopup.points}
                </div>
              </div>
            )}
          </>
        )}

        {gameState === 'complete' && (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="text-6xl">🏆</div>
            <h2 className="text-3xl font-bold">Complete!</h2>
            <p className="text-xl">Final Score: {score}</p>
            <button
              onClick={handleFinish}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-xl text-xl font-bold shadow-lg hover:scale-105 transition-transform"
            >
              Back to Games
            </button>
          </div>
        )}

        {cursor && isPlaying && (
          <GameCursor position={cursor} isHandDetected={true} />
        )}
      </div>
    </GameContainer>
  );
});

export { LetterMatchGame };
export default LetterMatchGame;
