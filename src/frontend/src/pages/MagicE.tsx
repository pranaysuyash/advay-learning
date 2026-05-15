/**
 * Magic E Game
 *
 * Learn the silent E pattern that changes vowel sounds.
 * Educational focus: phonics, vowel patterns, reading rules.
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
  MAGIC_E_PAIRS,
  type MagicEWord,
} from '../games/magicELogic';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { GameCursor } from '../components/game/GameCursor';
import type { Point } from '../types/tracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

const MagicEGame = memo(function MagicEGameComponent() {
  const navigate = useNavigate();
  const { speak } = useTTS();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [currentPair, setCurrentPair] = useState<MagicEWord | null>(null);
  const [showMagicE, setShowMagicE] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState('');

  const { streak, showMilestone, scorePopup, incrementStreak, resetStreak, setScorePopup } = useStreakTracking();
  const { playClick, playSuccess, playCelebration } = useAudio();
  const { completeGame } = useGameCompletion('magic-e');

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
    gameName: 'MagicE',
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
    gameName: 'Magic E',
    score,
    level: 1,
    isPlaying: gameState === 'playing',
    metaData: { round, word: currentPair?.shortForm },
  });

  const startGame = () => {
    setScore(0);
    setRound(0);
    setShowMagicE(false);
    setFeedback('');
    resetStreak();
    nextPair();
    setGameState('playing');
  };

  const nextPair = () => {
    if (round >= 8) {
      setGameState('complete');
      return;
    }
    const pair = MAGIC_E_PAIRS[Math.floor(Math.random() * MAGIC_E_PAIRS.length)];
    setCurrentPair(pair);
    setShowMagicE(false);
    setRound((r) => r + 1);
    
    // Speak the short word
    setTimeout(() => {
      speak(pair.shortForm);
    }, 500);
  };

  const handleAddMagicE = () => {
    if (!currentPair) return;
    playClick();
    setShowMagicE(true);
    
    playSuccess();
    const newStreak = incrementStreak();
    const basePoints = 15;
    const streakBonus = Math.min(newStreak * 2, 15);
    const totalPoints = basePoints + streakBonus;
    setScore((s) => s + totalPoints);
    setScorePopup({ points: totalPoints, x: 50, y: 30 });
    setFeedback(`${currentPair.shortForm} + E = ${currentPair.longForm}! ✨`);
    speak(`${currentPair.shortForm} becomes ${currentPair.longForm}`);
    triggerHaptic('success');

    if (newStreak > 0 && newStreak % 5 === 0) {
      playCelebration();
      triggerHaptic('celebration');
    }

    setTimeout(() => {
      nextPair();
    }, 2500);
  };

  const handleStart = () => { playClick(); startGame(); };

  const handleFinish = useCallback(async () => {
    playClick();
    await completeGame({ score });
    navigate('/games');
  }, [score, completeGame, navigate, playClick]);

  return (
    <GameContainer
      title="Magic E"
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
            <div className="text-6xl">✨</div>
            <h1 className="text-4xl font-bold text-center">Magic E</h1>
            <p className="text-lg text-muted-foreground text-center max-w-md">
              The Magic E makes vowels say their name! Tap the button to add the magic E.
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
              <p className="text-lg text-muted-foreground mb-4">The Magic E makes vowels say their name!</p>
            </div>

            <div className="flex items-center justify-center gap-4 text-5xl font-bold">
              <div className={`transition-all duration-500 ${showMagicE ? 'opacity-50' : 'opacity-100'}`}>
                <div className="bg-card px-6 py-4 rounded-xl border-2 border-border">
                  {currentPair.shortForm}
                </div>
                <p className="text-sm text-center mt-2">{currentPair.emoji}</p>
              </div>

              <div className="text-primary">+ E =</div>

              <div className={`transition-all duration-500 ${showMagicE ? 'opacity-100 scale-110' : 'opacity-0 scale-95'}`}>
                <div className="bg-primary text-primary-foreground px-6 py-4 rounded-xl shadow-lg">
                  {currentPair.longForm}
                </div>
                <p className="text-sm text-center mt-2">{currentPair.emoji}</p>
              </div>
            </div>

            {!showMagicE && (
              <button
                onClick={handleAddMagicE}
                className="mt-4 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-xl font-bold shadow-lg hover:scale-105 transition-transform active:scale-95"
              >
                ✨ Add Magic E!
              </button>
            )}

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Word {round} / 8
              </p>
            </div>

            {feedback && (
              <div className="text-center text-lg font-medium text-primary">
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
            <h2 className="text-3xl font-bold">Magic Complete!</h2>
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

export { MagicEGame };
export default MagicEGame;
