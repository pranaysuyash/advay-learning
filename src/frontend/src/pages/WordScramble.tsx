/**
 * Word Scramble Game
 *
 * Unscramble letters to form words.
 * Educational focus: spelling, letter recognition, word patterns.
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
  SCRAMBLE_WORDS,
  type ScrambleWord,
} from '../games/wordScrambleLogic';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { GameCursor } from '../components/game/GameCursor';
import type { Point } from '../types/tracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

const WordScrambleGame = memo(function WordScrambleGameComponent() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [currentWord, setCurrentWord] = useState<ScrambleWord | null>(null);
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [placedLetters, setPlacedLetters] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState('');

  const { streak, showMilestone, scorePopup, incrementStreak, resetStreak, setScorePopup } = useStreakTracking();
  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { completeGame } = useGameCompletion('word-scramble');

  const [cursor, setCursor] = useState<Point | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const isPlaying = gameState === 'playing';

  const shuffleWord = (word: string): string[] => {
    const letters = word.split('');
    let shuffled = [...letters];
    // Shuffle until different from original
    while (shuffled.join('') === word) {
      shuffled.sort(() => Math.random() - 0.5);
    }
    return shuffled;
  };

  const handleFrame = useCallback((frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
    const tip = frame.indexTip;
    if (!tip) { setCursor(null); return; }
    setCursor(tip);
  }, []);

  const handleNoVideoFrame = useCallback(() => { setCursor(null); }, []);

  const { isLoading: isModelLoading, isReady: isHandTrackingReady, startTracking, webcamRef } = useGameHandTracking({
    gameName: 'WordScramble',
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
    gameName: 'Word Scramble',
    score,
    level: 1,
    isPlaying: gameState === 'playing',
    metaData: { round, word: currentWord?.word },
  });

  const startGame = () => {
    setScore(0);
    setRound(0);
    setPlacedLetters([]);
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
    const word = SCRAMBLE_WORDS[Math.floor(Math.random() * SCRAMBLE_WORDS.length)];
    setCurrentWord(word);
    setScrambledLetters(shuffleWord(word.word.toUpperCase()));
    setPlacedLetters([]);
    setRound((r) => r + 1);
  };

  const handleLetterClick = (letter: string, index: number) => {
    if (!currentWord) return;
    playClick();

    const newPlaced = [...placedLetters, letter];
    setPlacedLetters(newPlaced);
    
    // Remove from scrambled
    const newScrambled = [...scrambledLetters];
    newScrambled.splice(index, 1);
    setScrambledLetters(newScrambled);

    // Check if word is complete
    if (newPlaced.join('') === currentWord.word.toUpperCase()) {
      // Word complete!
      playSuccess();
      const newStreak = incrementStreak();
      const basePoints = 15;
      const streakBonus = Math.min(newStreak * 2, 15);
      const totalPoints = basePoints + streakBonus;
      setScore((s) => s + totalPoints);
      setScorePopup({ points: totalPoints, x: 50, y: 30 });
      setFeedback(`✅ "${currentWord.word}" — Unscrambled!`);
      triggerHaptic('success');

      if (newStreak > 0 && newStreak % 5 === 0) {
        playCelebration();
        triggerHaptic('celebration');
      }

      setTimeout(() => {
        nextRound();
      }, 1500);
    } else if (newPlaced.length === currentWord.word.length) {
      // Wrong word
      playError();
      resetStreak();
      setFeedback(`❌ Try again! The word was "${currentWord.word}"`);
      triggerHaptic('error');
      
      setTimeout(() => {
        nextRound();
      }, 2000);
    }
  };

  const handleReset = () => {
    playClick();
    if (currentWord) {
      setScrambledLetters(shuffleWord(currentWord.word.toUpperCase()));
      setPlacedLetters([]);
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
      title="Word Scramble"
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
            <div className="text-6xl">🌀</div>
            <h1 className="text-4xl font-bold text-center">Word Scramble</h1>
            <p className="text-lg text-muted-foreground text-center max-w-md">
              Unscramble the letters to make the word! Tap the letters in the right order.
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
              <p className="text-lg text-muted-foreground mb-2">Unscramble the word:</p>
              <div className="text-6xl mb-2">{currentWord.emoji}</div>
              <p className="text-sm text-muted-foreground">Hint: {currentWord.hint}</p>
            </div>

            {/* Answer slots */}
            <div className="flex gap-2 justify-center">
              {currentWord.word.split('').map((_, i) => (
                <div
                  key={i}
                  className="w-12 h-14 rounded-lg border-2 bg-card border-border flex items-center justify-center text-xl font-bold"
                >
                  {placedLetters[i] || '_'}
                </div>
              ))}
            </div>

            {/* Scrambled letters */}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {scrambledLetters.map((letter, i) => (
                <button
                  key={`${letter}-${i}`}
                  onClick={() => handleLetterClick(letter, i)}
                  className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-xl transition-all active:scale-95"
                >
                  {letter}
                </button>
              ))}
            </div>

            <button
              onClick={handleReset}
              className="mt-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              ↺ Reset
            </button>

            <div className="mt-2 text-center">
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
            <h2 className="text-3xl font-bold">Scramble Master!</h2>
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

export { WordScrambleGame };
export default WordScrambleGame;
