/**
 * Plant a Garden Game
 *
 * Grow plants by completing the sequence: dig → plant → water → grow!
 *
 * @ticket TCK-20260310-013
 */

import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameShell } from '../components/GameShell';
import Webcam from 'react-webcam';
import { GameCursor } from '../components/game/GameCursor';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { Point } from '../types/tracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useTTS } from '../hooks/useTTS';
import { triggerHaptic } from '../utils/haptics';
import { KenneyIcon } from '../components/ui/KenneyIcon';
import {
  GARDEN_STEPS,
  type Plant,
  getRandomPlant,
  calculateScore,
  calculateStars,
} from '../games/plantGardenLogic';

const STEPS_TO_COMPLETE = 4;

function PlantGardenGame() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [currentPlant, setCurrentPlant] = useState<Plant | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedPlants, setCompletedPlants] = useState(0);
  const [score, setScore] = useState(0);
  const [showGrowth, setShowGrowth] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  
  const holdIntervalRef = React.useRef<number | null>(null);

  const { playSuccess, playCelebration, playClick, playPop } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { onGameComplete } = useGameCompletion('plant-garden');

  useGameSessionProgress({
    gameName: 'Plant a Garden',
    score,
    level: completedPlants + 1,
    isPlaying: gameState === 'playing',
    metaData: { plantsGrown: completedPlants },
  });

  const webcamRef = useRef<Webcam>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState<Point | null>(null);

  const isPlaying = gameState === 'playing';
  const handleFrame = useCallback((frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
    const tip = frame.indexTip;
    if (!tip) { setCursor(null); return; }
    setCursor(tip);
  }, []);
  const handleNoVideoFrame = useCallback(() => { setCursor(null); }, []);
  const { isLoading: isModelLoading, isReady: isHandTrackingReady, startTracking } = useGameHandTracking({
    gameName: 'PlantGarden',
    targetFps: 30,
    isRunning: isPlaying,
    onFrame: handleFrame,
    onNoVideoFrame: handleNoVideoFrame,
  });
  useEffect(() => {
    if (isPlaying && !isHandTrackingReady && !isModelLoading) { void startTracking(); }
  }, [isHandTrackingReady, isModelLoading, isPlaying, startTracking]);

  const speakText = useCallback((text: string) => {
    if (ttsEnabled) {
      speak(text);
    }
  }, [speak, ttsEnabled]);

  useEffect(() => {
    if (gameState === 'playing' && currentPlant) {
      const stage = GARDEN_STEPS[currentStep];
      speakText(stage.instruction);
    }
  }, [gameState, currentStep, currentPlant, speakText]);

  const startGame = () => {
    setCurrentPlant(getRandomPlant());
    setCurrentStep(0);
    setCompletedPlants(0);
    setScore(0);
    setShowGrowth(false);
    setHoldProgress(0);
    setGameState('playing');
    playClick();
  };

  const handleAction = useCallback(() => {
    if (gameState !== 'playing' || !currentPlant) return;
    
    playPop();
    
    const newHoldProgress = holdProgress + 8;
    
    if (newHoldProgress >= 100) {
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
      }
      
      triggerHaptic('success');
      playSuccess();
      
      if (currentStep >= STEPS_TO_COMPLETE - 1) {
        const plantScore = calculateScore(0);
        setScore(s => s + plantScore);
        setCompletedPlants(c => c + 1);
        setShowGrowth(true);
        
        setTimeout(async () => {
          if (completedPlants + 1 >= 3) {
            const finalScore = score + plantScore;
            setScore(finalScore);
            setGameState('complete');
            playCelebration();
            await onGameComplete(finalScore);
            speakText('You grew a beautiful garden!');
          } else {
            setCurrentPlant(getRandomPlant());
            setCurrentStep(0);
            setShowGrowth(false);
            setHoldProgress(0);
            speakText('Great! Now grow another plant!');
          }
        }, 1500);
      } else {
        setCurrentStep(s => s + 1);
        setHoldProgress(0);
      }
    } else {
      setHoldProgress(newHoldProgress);
      
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
      }
      
      holdIntervalRef.current = window.setInterval(() => {
        setHoldProgress((prev: number) => {
          const next = prev + 4;
          if (next >= 100) {
            if (holdIntervalRef.current) {
              clearInterval(holdIntervalRef.current);
            }
            return 100;
          }
          return next;
        });
      }, 50);
    }
  }, [gameState, currentPlant, currentStep, holdProgress, completedPlants, score, playPop, playSuccess, playCelebration, speakText]);

  const handleActionStop = useCallback(() => {
    if (holdProgress > 0 && holdProgress < 100) {
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
      }
      setHoldProgress(0);
    }
  }, [holdProgress]);

  const handlePlayAgain = () => {
    startGame();
  };

  const handleFinish = () => {
    navigate('/games');
  };

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
      }
    };
  }, []);

  const currentStage = GARDEN_STEPS[currentStep];
  const stars = calculateStars(score);
  const growthEmoji = currentPlant?.emoji || '🌱';

  return (
    <GameContainer webcamRef={webcamRef} isHandDetected={isHandTrackingReady} isPlaying={isPlaying}>
      <div 
        ref={gameAreaRef}
        className="absolute inset-0 overflow-hidden"
        role="application"
        aria-label="Plant a Garden Game"
        style={{
          background: 'linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)',
        }}
        onMouseDown={handleAction}
        onMouseUp={handleActionStop}
        onMouseLeave={handleActionStop}
        onTouchStart={handleAction}
        onTouchEnd={handleActionStop}
      >
      {/* Start Screen */}
      {gameState === 'start' && (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="flex justify-center mb-4">
              <KenneyIcon type="heart" size={64} />
            </div>
            <h1 className="text-4xl font-black text-green-700 mb-4">
              Plant a Garden!
            </h1>
            <p className="text-xl text-green-600 mb-8 max-w-md">
              Grow 3 plants by completing the steps: dig, plant, water, and watch them grow!
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {GARDEN_STEPS.map((stage, idx) => (
              <motion.div
                key={stage.step}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 shadow-md"
              >
                <span className="text-2xl">{stage.emoji}</span>
                <span className="font-bold text-green-700 capitalize">{stage.step}</span>
              </motion.div>
            ))}
          </div>

          <button
            type="button"
            onClick={startGame}
            className="px-10 py-5 bg-green-500 hover:bg-green-600 text-white rounded-3xl font-black text-2xl shadow-lg transition-all transform hover:scale-105"
          >
            Start Gardening! 🌻
          </button>
        </div>
      )}

      {/* Playing Screen */}
      {gameState === 'playing' && currentPlant && (
        <div className="flex flex-col items-center h-full p-4">
          {/* Header */}
          <div className="flex justify-between items-center w-full mb-4">
            <button
              type="button"
              onClick={() => navigate('/games')}
              className="px-4 py-2 bg-white rounded-xl font-bold text-green-600 shadow"
            >
              ← Exit
            </button>
            <div className="flex gap-2">
              {[1, 2, 3].map((num) => (
                <span 
                  key={`plant-count-${num}`}
                  className={`text-2xl ${num <= completedPlants ? '' : 'opacity-30'}`}
                >
                  {num <= completedPlants ? <KenneyIcon type="star" size={32} /> : <KenneyIcon type="heart" size={32} />}
                </span>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="flex gap-2 mb-4">
            {GARDEN_STEPS.map((stage, idx) => (
              <motion.div
                key={stage.step}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                  idx < currentStep
                    ? 'bg-green-500 text-white'
                    : idx === currentStep
                    ? 'bg-green-400 text-white ring-4 ring-green-300'
                    : 'bg-gray-200'
                }`}
                animate={idx === currentStep ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                {stage.emoji}
              </motion.div>
            ))}
          </div>

          {/* Garden Plot */}
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            <AnimatePresence mode="wait">
              {showGrowth ? (
                <motion.div
                  key="growth"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-9xl mb-4"
                  >
                    {growthEmoji}
                  </motion.div>
                  <p className="text-3xl font-black text-green-600">
                    {currentPlant.name}!
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="stage"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  className="text-center"
                >
                  <div className="text-8xl mb-4">{currentStage.emoji}</div>
                  <h2 className="text-3xl font-black text-green-700 mb-2 capitalize">
                    {currentStage.step}
                  </h2>
                  <p className="text-xl text-green-600 mb-6">
                    {currentStage.instruction}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Button (visual) */}
            {!showGrowth && (
              <div className="mt-8">
                <div className="w-48 h-48 rounded-full bg-green-400 flex items-center justify-center shadow-2xl">
                  <div
                    className="w-44 h-44 rounded-full bg-white flex items-center justify-center overflow-hidden"
                    style={{
                      background: `conic-gradient(from 0deg, #22C55E ${holdProgress}%, #E5E7EB ${holdProgress}%)`,
                    }}
                  >
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                      <span className="text-4xl">👆</span>
                    </div>
                  </div>
                </div>
                <p className="text-center mt-4 text-green-600 font-bold">
                  {holdProgress < 100 ? 'Hold to complete!' : 'Done!'}
                </p>
              </div>
            )}
          </div>

          {/* Plant Preview */}
          <div className="mb-4">
            <p className="text-sm text-green-500">Growing:</p>
            <span className="text-4xl">{currentPlant.emoji} {currentPlant.name}</span>
          </div>
        </div>
      )}

      {/* Complete Screen */}
      {gameState === 'complete' && (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-8xl mb-4"
            >
              🌳🌻🌽
            </motion.div>
            <h2 className="text-4xl font-black text-green-600 mb-2">
              Garden Complete!
            </h2>
            <p className="text-xl text-green-600 mb-6">
              You grew 3 beautiful plants!
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-6">
              <motion.span
                key="star-g-0"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 1 ? 1 : 0.5, opacity: stars >= 1 ? 1 : 0.3 }}
              >
                <KenneyIcon type={stars >= 1 ? 'star' : 'heart_empty'} size={48} />
              </motion.span>
              <motion.span
                key="star-g-1"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 2 ? 1 : 0.5, opacity: stars >= 2 ? 1 : 0.3 }}
                transition={{ delay: 0.1 }}
              >
                <KenneyIcon type={stars >= 2 ? 'star' : 'heart_empty'} size={48} />
              </motion.span>
              <motion.span
                key="star-g-2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 3 ? 1 : 0.5, opacity: stars >= 3 ? 1 : 0.3 }}
                transition={{ delay: 0.2 }}
              >
                <KenneyIcon type={stars >= 3 ? 'star' : 'heart_empty'} size={48} />
              </motion.span>
              <motion.span
                key="star-g-3"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 4 ? 1 : 0.5, opacity: stars >= 4 ? 1 : 0.3 }}
                transition={{ delay: 0.3 }}
              >
                <KenneyIcon type={stars >= 4 ? 'star' : 'heart_empty'} size={48} />
              </motion.span>
              <motion.span
                key="star-g-4"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 5 ? 1 : 0.5, opacity: stars >= 5 ? 1 : 0.3 }}
                transition={{ delay: 0.4 }}
              >
                <KenneyIcon type={stars >= 5 ? 'star' : 'heart_empty'} size={48} />
              </motion.span>
            </div>

            {/* Score */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <p className="text-3xl font-black text-green-600">Score: {score}</p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handlePlayAgain}
                className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold text-xl shadow-lg transition-all"
              >
                Grow More!
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-2xl font-bold text-xl transition-all"
              >
                Finish
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </div>
      {cursor && (
        <GameCursor position={cursor} coordinateSpace="normalized" containerRef={gameAreaRef} isPinching={false} isHandDetected={isHandTrackingReady} size={64} color="#22c55e" />
      )}
    </GameContainer>
  );
}

export const PlantGarden = memo(function PlantGardenComponent() {
  return (
    <GameShell
      gameId="plant-garden"
      gameName="Plant a Garden"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <PlantGardenGame />
    </GameShell>
  );
});

export default PlantGarden;
