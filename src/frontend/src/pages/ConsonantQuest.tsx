/**
 * Consonant Quest Game
 *
 * Go on quests to learn consonant sounds.
 * Educational focus: consonant sounds, phonics.
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
  ALL_QUESTS,
  type ConsonantQuest,
} from '../games/consonantQuestLogic';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { GameCursor } from '../components/game/GameCursor';
import type { Point } from '../types/tracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

const ConsonantQuestGame = memo(function ConsonantQuestGameComponent() {
  const navigate = useNavigate();
  const { speak } = useTTS();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [currentQuest, setCurrentQuest] = useState<ConsonantQuest | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState('');

  const { streak, showMilestone, scorePopup, incrementStreak, resetStreak, setScorePopup } = useStreakTracking();
  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { completeGame } = useGameCompletion('consonant-quest');

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
    gameName: 'ConsonantQuest',
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
    gameName: 'Consonant Quest',
    score,
    level: 1,
    isPlaying: gameState === 'playing',
    metaData: { round, quest: currentQuest?.quest },
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
    const quest = ALL_QUESTS[Math.floor(Math.random() * ALL_QUESTS.length)];
    setCurrentQuest(quest);
    
    // Generate options
    const allOptions = [quest.answer];
    while (allOptions.length < 4) {
      const randomQuest = ALL_QUESTS[Math.floor(Math.random() * ALL_QUESTS.length)];
      const wrongOption = randomQuest.answer;
      if (!allOptions.includes(wrongOption)) {
        allOptions.push(wrongOption);
      }
    }
    
    setOptions(allOptions.sort(() => Math.random() - 0.5));
    setRound((r) => r + 1);
    speak(quest.quest);
  };

  const handleOptionClick = (option: string) => {
    if (!currentQuest) return;
    playClick();

    const isCorrect = option === currentQuest.answer;

    if (isCorrect) {
      playSuccess();
      const newStreak = incrementStreak();
      const basePoints = 15;
      const streakBonus = Math.min(newStreak * 2, 15);
      const totalPoints = basePoints + streakBonus;
      setScore((s) => s + totalPoints);
      setScorePopup({ points: totalPoints, x: 50, y: 30 });
      setFeedback(`✅ ${currentQuest.hint}`);
      speak(currentQuest.hint);
      triggerHaptic('success');

      if (newStreak > 0 && newStreak % 5 === 0) {
        playCelebration();
        triggerHaptic('celebration');
      }

      setTimeout(() => {
        nextRound();
      }, 2000);
    } else {
      playError();
      resetStreak();
      setFeedback(`❌ Try again! The answer was "${currentQuest.answer}"`);
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
      title="Consonant Quest"
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
            <div className="text-6xl">🗡️</div>
            <h1 className="text-4xl font-bold text-center">Consonant Quest</h1>
            <p className="text-lg text-muted-foreground text-center max-w-md">
              Go on a quest to find words with special consonant sounds!
            </p>
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-xl text-xl font-bold shadow-lg hover:scale-105 transition-transform"
            >
              Start Quest
            </button>
          </div>
        )}

        {gameState === 'playing' && currentQuest && (
          <>
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-2">Consonant Quest!</p>
              <div className="text-4xl mb-4">{currentQuest.emoji}</div>
              <p className="text-xl font-medium">{currentQuest.quest}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleOptionClick(option)}
                  className="w-28 h-16 bg-card hover:bg-accent border-2 border-border rounded-xl flex items-center justify-center font-bold text-2xl transition-all active:scale-95"
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Quest {round} / 8
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
            <h2 className="text-3xl font-bold">Quest Complete!</h2>
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

export { ConsonantQuestGame };
export default ConsonantQuestGame;
