/**
 * Phonics Fun Game
 *
 * Learn letter sounds interactively with audio and visuals.
 * Educational focus: phonics, letter-sound correspondence.
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
  PHONICS_SOUNDS,
  type PhonicsSound,
} from '../games/phonicsFunLogic';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { GameCursor } from '../components/game/GameCursor';
import type { Point } from '../types/tracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

const PhonicsFunGame = memo(function PhonicsFunGameComponent() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [currentSound, setCurrentSound] = useState<PhonicsSound | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [visitedSounds, setVisitedSounds] = useState<Set<string>>(new Set());

  const { speak } = useTTS();
  const { streak, showMilestone, scorePopup, incrementStreak, resetStreak, setScorePopup } = useStreakTracking();
  const { playClick, playSuccess: _playSuccess, playCelebration } = useAudio();
  const { completeGame } = useGameCompletion('phonics-fun');

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
    gameName: 'PhonicsFun',
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
    gameName: 'Phonics Fun',
    score,
    level: 1,
    isPlaying: gameState === 'playing',
    metaData: { round, letter: currentSound?.letter },
  });

  const startGame = () => {
    setScore(0);
    setRound(0);
    setVisitedSounds(new Set());
    setFeedback('');
    resetStreak();
    nextSound();
    setGameState('playing');
  };

  const nextSound = () => {
    if (visitedSounds.size >= 10) {
      setGameState('complete');
      return;
    }
    
    // Get unvisited sounds
    const availableSounds = PHONICS_SOUNDS.filter(s => !visitedSounds.has(s.letter));
    const sound = availableSounds[Math.floor(Math.random() * availableSounds.length)];
    
    setCurrentSound(sound);
    setVisitedSounds(prev => new Set([...prev, sound.letter]));
    setRound((r) => r + 1);
    
    // Auto-speak the letter sound
    setTimeout(() => {
      speak(`The letter ${sound.letter} makes the sound ${sound.sound}`);
    }, 500);
  };

  const handleLetterClick = () => {
    if (!currentSound) return;
    playClick();

    speak(`The letter ${currentSound.letter} makes the sound ${currentSound.sound}`);
    
    const newStreak = incrementStreak();
    const points = 10;
    setScore((s) => s + points);
    setScorePopup({ points, x: 50, y: 30 });
    setFeedback(`${currentSound.letter} says "${currentSound.sound}"`);
    triggerHaptic('success');

    if (newStreak > 0 && newStreak % 5 === 0) {
      playCelebration();
      triggerHaptic('celebration');
    }

    setTimeout(() => {
      nextSound();
    }, 2000);
  };

  const handleStart = () => { playClick(); startGame(); };

  const handleFinish = useCallback(async () => {
    playClick();
    await completeGame({ score });
    navigate('/games');
  }, [score, completeGame, navigate, playClick]);

  return (
    <GameContainer
      title="Phonics Fun"
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
            <h1 className="text-4xl font-bold text-center">Phonics Fun</h1>
            <p className="text-lg text-muted-foreground text-center max-w-md">
              Learn letter sounds! Tap the letter to hear its sound.
            </p>
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-xl text-xl font-bold shadow-lg hover:scale-105 transition-transform"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState === 'playing' && currentSound && (
          <>
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-4">Tap the letter to hear its sound!</p>
            </div>

            <button
              onClick={handleLetterClick}
              className="w-40 h-40 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex flex-col items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95"
            >
              <span className="text-7xl font-bold text-primary-foreground">{currentSound.letter}</span>
              <span className="text-4xl mt-2">{currentSound.emoji}</span>
            </button>

            <div className="text-center mt-4">
              <p className="text-2xl font-bold">"{currentSound.sound}"</p>
              <p className="text-muted-foreground">as in {currentSound.example}</p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Letter {round} / 10
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
            <h2 className="text-3xl font-bold">Phonics Master!</h2>
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

export { PhonicsFunGame };
export default PhonicsFunGame;
