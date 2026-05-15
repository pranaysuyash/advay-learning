/**
 * Compound Words Game
 *
 * Match word parts to form compound words.
 * Educational focus: vocabulary building, word formation, reading comprehension.
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
  COMPOUND_WORDS,
  type CompoundWord,
} from '../games/compoundWordsLogic';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { GameCursor } from '../components/game/GameCursor';
import type { Point } from '../types/tracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

const CompoundWordsGame = memo(function CompoundWordsGameComponent() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [currentWord, setCurrentWord] = useState<CompoundWord | null>(null);
  const [selectedFirst, setSelectedFirst] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState('');

  const { streak, showMilestone, scorePopup, incrementStreak, resetStreak, setScorePopup } = useStreakTracking();
  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { completeGame } = useGameCompletion('compound-words');

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
    gameName: 'CompoundWords',
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
    gameName: 'Compound Words',
    score,
    level: 1,
    isPlaying: gameState === 'playing',
    metaData: { round, word: currentWord?.fullWord },
  });

  const startGame = () => {
    setScore(0);
    setRound(0);
    setSelectedFirst(null);
    setFeedback('');
    resetStreak();
    nextWord();
    setGameState('playing');
  };

  const nextWord = () => {
    if (round >= 8) {
      setGameState('complete');
      return;
    }
    const word = COMPOUND_WORDS[Math.floor(Math.random() * COMPOUND_WORDS.length)];
    setCurrentWord(word);
    setSelectedFirst(null);
    setRound((r) => r + 1);
  };

  const handleFirstPartClick = (part: string) => {
    playClick();
    setSelectedFirst(part);
  };

  const handleSecondPartClick = (part: string) => {
    if (!currentWord || !selectedFirst) return;
    playClick();

    const isCorrect = selectedFirst === currentWord.firstPart && part === currentWord.secondPart;

    if (isCorrect) {
      playSuccess();
      const newStreak = incrementStreak();
      const basePoints = 20;
      const streakBonus = Math.min(newStreak * 2, 20);
      const totalPoints = basePoints + streakBonus;
      setScore((s) => s + totalPoints);
      setScorePopup({ points: totalPoints, x: 50, y: 30 });
      setFeedback(`✅ ${currentWord.firstPart} + ${currentWord.secondPart} = ${currentWord.fullWord}! ${currentWord.emoji}`);
      triggerHaptic('success');

      if (newStreak > 0 && newStreak % 5 === 0) {
        playCelebration();
        triggerHaptic('celebration');
      }

      setTimeout(() => {
        nextWord();
      }, 2000);
    } else {
      playError();
      resetStreak();
      setFeedback('❌ Try a different combination!');
      triggerHaptic('error');
      setSelectedFirst(null);
    }
  };

  const handleStart = () => { playClick(); startGame(); };

  const handleFinish = useCallback(async () => {
    playClick();
    await completeGame({ score });
    navigate('/games');
  }, [score, completeGame, navigate, playClick]);

  // Generate fake parts for options
  const getFirstParts = () => {
    if (!currentWord) return [];
    const parts = [currentWord.firstPart];
    while (parts.length < 3) {
      const random = COMPOUND_WORDS[Math.floor(Math.random() * COMPOUND_WORDS.length)];
      if (!parts.includes(random.firstPart)) parts.push(random.firstPart);
    }
    return parts.sort(() => Math.random() - 0.5);
  };

  const getSecondParts = () => {
    if (!currentWord) return [];
    const parts = [currentWord.secondPart];
    while (parts.length < 3) {
      const random = COMPOUND_WORDS[Math.floor(Math.random() * COMPOUND_WORDS.length)];
      if (!parts.includes(random.secondPart)) parts.push(random.secondPart);
    }
    return parts.sort(() => Math.random() - 0.5);
  };

  return (
    <GameContainer
      title="Compound Words"
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
            <div className="text-6xl">🧩</div>
            <h1 className="text-4xl font-bold text-center">Compound Words</h1>
            <p className="text-lg text-muted-foreground text-center max-w-md">
              Combine two words to make a new word! Pick the first part, then the second part.
            </p>
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-xl text-xl font-bold shadow-lg hover:scale-105 transition-transform"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState === 'playing' && currentWord && (
          <>
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-2">Hint: {currentWord.hint}</p>
              <p className="text-sm text-muted-foreground">Combine two words to make a compound word!</p>
            </div>

            {/* Selected first part display */}
            {selectedFirst && (
              <div className="bg-primary/20 px-6 py-3 rounded-lg">
                <p className="text-xl font-bold text-primary">{selectedFirst} + ?</p>
              </div>
            )}

            {/* First parts */}
            {!selectedFirst && (
              <div className="flex flex-wrap justify-center gap-3">
                {getFirstParts().map((part) => (
                  <button
                    key={part}
                    onClick={() => handleFirstPartClick(part)}
                    className="px-4 py-3 bg-card hover:bg-accent border-2 border-border rounded-xl font-bold text-lg transition-all active:scale-95"
                  >
                    {part}
                  </button>
                ))}
              </div>
            )}

            {/* Second parts (only after selecting first) */}
            {selectedFirst && (
              <div className="flex flex-wrap justify-center gap-3">
                {getSecondParts().map((part) => (
                  <button
                    key={part}
                    onClick={() => handleSecondPartClick(part)}
                    className="px-4 py-3 bg-card hover:bg-accent border-2 border-border rounded-xl font-bold text-lg transition-all active:scale-95"
                  >
                    {part}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Word {round} / 8
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

export { CompoundWordsGame };
export default CompoundWordsGame;
