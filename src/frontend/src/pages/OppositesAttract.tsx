/**
 * Opposites Attract Game
 *
 * Match opposite words.
 * Educational focus: antonyms, vocabulary expansion.
 */

import { memo, useCallback, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { triggerHaptic } from '../utils/haptics';
import { useTTS } from '../hooks/useTTS';
import {
  OPPOSITE_PAIRS,
  type OppositePair,
} from '../games/oppositesAttractLogic';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { GameCursor } from '../components/game/GameCursor';
import type { Point } from '../types/tracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

const OppositesAttractGame = memo(function OppositesAttractGameComponent() {
  const navigate = useNavigate();
  const { speak } = useTTS();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [currentPair, setCurrentPair] = useState<OppositePair | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState('');

  const { streak, showMilestone, scorePopup, incrementStreak, resetStreak, setScorePopup } = useStreakTracking();
  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { completeGame } = useGameCompletion('opposites-attract');

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
    gameName: 'OppositesAttract',
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
    gameName: 'Opposites Attract',
    score,
    level: 1,
    isPlaying: gameState === 'playing',
    metaData: { round, word: currentPair?.word },
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
    if (round >= 8) {
      setGameState('complete');
      return;
    }
    const pair = OPPOSITE_PAIRS[Math.floor(Math.random() * OPPOSITE_PAIRS.length)];
    setCurrentPair(pair);
    
    // Create options
    const allOptions = [pair.opposite];
    while (allOptions.length < 4) {
      const randomPair = OPPOSITE_PAIRS[Math.floor(Math.random() * OPPOSITE_PAIRS.length)];
      const wrongWord = randomPair.opposite;
      if (!allOptions.includes(wrongWord) && wrongWord !== pair.opposite) {
        allOptions.push(wrongWord);
      }
    }
    
    setOptions(allOptions.sort(() => Math.random() - 0.5));
    setRound((r) => r + 1);
    
    speak(`Find the opposite of ${pair.word}`);
  };

  const handleOptionClick = (word: string) => {
    if (!currentPair) return;
    playClick();

    const isCorrect = word === currentPair.opposite;

    if (isCorrect) {
      playSuccess();
      const newStreak = incrementStreak();
      const basePoints = 15;
      const streakBonus = Math.min(newStreak * 2, 15);
      const totalPoints = basePoints + streakBonus;
      setScore((s) => s + totalPoints);
      setScorePopup({ points: totalPoints, x: 50, y: 30 });
      setFeedback(`✅ ${currentPair.word} ↔ ${currentPair.opposite}! ${currentPair.wordEmoji}`);
      speak(`${currentPair.word} is opposite of ${currentPair.opposite}`);
      triggerHaptic('success');

      if (newStreak > 0 && newStreak % 5 === 0) {
        playCelebration();
        triggerHaptic('celebration');
      }

      setTimeout(() => {
        nextRound();
      }, 1800);
    } else {
      playError();
      resetStreak();
      setFeedback(`❌ "${word}" is not the opposite of "${currentPair.word}"`);
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
      title="Opposites Attract"
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
            <div className="text-6xl">🧲</div>
            <h1 className="text-4xl font-bold text-center">Opposites Attract</h1>
            <p className="text-lg text-muted-foreground text-center max-w-md">
              Match opposite words! Find the word that means the opposite.
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
              <p className="text-lg text-muted-foreground">Find the opposite of:</p>
              <div className="text-6xl font-bold text-primary mt-4">
                {currentPair.word}
              </div>
              <div className="text-5xl mt-2">{currentPair.wordEmoji}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {options.map((word) => (
                <button
                  key={word}
                  onClick={() => handleOptionClick(word)}
                  className="w-32 h-16 bg-card hover:bg-accent border-2 border-border rounded-xl flex items-center justify-center font-bold text-lg transition-all active:scale-95"
                >
                  {word}
                </button>
              ))}
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Round {round} / 8
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

export { OppositesAttractGame };
export default OppositesAttractGame;
