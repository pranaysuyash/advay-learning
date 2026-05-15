/**
 * Word Ladder Game
 *
 * Change one letter at a time to transform words.
 * Educational focus: spelling, phonics, word manipulation.
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
  WORD_LADDERS,
  type LadderWord,
} from '../games/wordLadderLogic';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { GameCursor } from '../components/game/GameCursor';
import type { Point } from '../types/tracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

const WordLadderGame = memo(function WordLadderGameComponent() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [currentLadder, setCurrentLadder] = useState<LadderWord[] | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [targetWord, setTargetWord] = useState('');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState('');

  const { streak, showMilestone, scorePopup, incrementStreak, resetStreak, setScorePopup } = useStreakTracking();
  const { playClick, playSuccess, playCelebration } = useAudio();
  const { completeGame } = useGameCompletion('word-ladder');

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
    gameName: 'WordLadder',
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
    gameName: 'Word Ladder',
    score,
    level: 1,
    isPlaying: gameState === 'playing',
    metaData: { round, currentWord, target: targetWord },
  });

  const startGame = () => {
    setScore(0);
    setRound(0);
    setCurrentWord('');
    setFeedback('');
    resetStreak();
    nextLadder();
    setGameState('playing');
  };

  const nextLadder = () => {
    if (round >= 5) {
      setGameState('complete');
      return;
    }
    const ladder = WORD_LADDERS[Math.floor(Math.random() * WORD_LADDERS.length)];
    setCurrentLadder(ladder);
    setCurrentStepIndex(0);
    setCurrentWord(ladder[0].word);
    setTargetWord(ladder[ladder.length - 1].word);
    setRound((r) => r + 1);
  };

  const handleLetterChange = (index: number, newLetter: string) => {
    if (!currentLadder) return;
    playClick();

    const letters = currentWord.split('');
    letters[index] = newLetter.toUpperCase();
    const newWord = letters.join('');
    setCurrentWord(newWord);

    if (newWord === targetWord) {
      // Target reached!
      playSuccess();
      const newStreak = incrementStreak();
      const basePoints = 25;
      const streakBonus = Math.min(newStreak * 3, 20);
      const totalPoints = basePoints + streakBonus;
      
      setScore((s) => s + totalPoints);
      setScorePopup({ points: totalPoints, x: 50, y: 30 });
      setFeedback(`✅ ${currentLadder[0].word} → ${newWord}! ${currentLadder[currentLadder.length - 1].emoji}`);
      triggerHaptic('success');

      if (newStreak > 0 && newStreak % 5 === 0) {
        playCelebration();
        triggerHaptic('celebration');
      }

      setTimeout(() => {
        nextLadder();
      }, 2000);
    }
  };

  const handleStart = () => { playClick(); startGame(); };

  const handleFinish = useCallback(async () => {
    playClick();
    await completeGame({ score });
    navigate('/games');
  }, [score, completeGame, navigate, playClick]);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <GameContainer
      title="Word Ladder"
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
            <div className="text-6xl">🪜</div>
            <h1 className="text-4xl font-bold text-center">Word Ladder</h1>
            <p className="text-lg text-muted-foreground text-center max-w-md">
              Change one letter at a time to get from the start word to the target word!
            </p>
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-xl text-xl font-bold shadow-lg hover:scale-105 transition-transform"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState === 'playing' && currentLadder && (
          <>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Hint: {currentLadder[currentStepIndex]?.hint || 'Change one letter'}
              </p>
              <div className="text-5xl mb-2">{currentLadder[currentLadder.length - 1]?.emoji || '🎯'}</div>
              <p className="text-sm text-muted-foreground">Change one letter at a time</p>
            </div>

            {/* Word display with letter selectors */}
            <div className="flex gap-2">
              {currentWord.split('').map((letter, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <select
                    value={letter}
                    onChange={(e) => handleLetterChange(i, e.target.value)}
                    className="w-14 h-14 text-center text-2xl font-bold bg-card border-2 border-primary rounded-lg"
                  >
                    {alphabet.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-lg font-bold text-primary">
                {currentLadder[0]?.word} → {targetWord}
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Puzzle {round} / 5
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
            <h2 className="text-3xl font-bold">Ladder Master!</h2>
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

export { WordLadderGame };
export default WordLadderGame;
