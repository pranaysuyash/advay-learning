/**
 * Chemistry Lab Game Page
 * 
 * Virtual chemistry lab with drag-and-drop mixing using hand tracking.
 * Kids mix ingredients to discover colorful potions.
 * 
 * @ticket GQ-002
 */

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';

import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { GameControls, type GameControl } from '../components/GameControls';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { GameCursor } from '../components/game/GameCursor';
import { Mascot } from '../components/Mascot';
import { VoiceInstructions } from '../components/game/VoiceInstructions';

import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useAudio } from '../utils/hooks/useAudio';
import { useTTS } from '../hooks/useTTS';
import { triggerHaptic } from '../utils/haptics';

import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';
import type { Point } from '../types/tracking';

import {
  RECIPES,
  mixIngredients,
  checkDiscovery,
  updateProgress,
  getHint,
  getDefaultProgress,
  blendColors,
  shouldShowHint,
  getProgressPercentage,
  getIngredientsForLevel,
  getRecipesForLevel,
  type Ingredient,
  type Recipe,
  type MixResult,
  type GameProgress,
} from '../games/chemistryLabLogic';

interface DraggedIngredient {
  ingredient: Ingredient;
  position: Point;
  isDragging: boolean;
}

const BEAKER_POSITION = { x: 0.5, y: 0.6 };
const BEAKER_RADIUS = 0.15;

const ChemistryLabGame = memo(function ChemistryLabComponent() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const lastUIUpdateAtRef = useRef(0);

  // Game state
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState<GameProgress>(getDefaultProgress());
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [currentMixResult, setCurrentMixResult] = useState<MixResult | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [lastDiscovery, setLastDiscovery] = useState<Recipe | null>(null);

  // Hand tracking state
  const [isPinching, setIsPinching] = useState(false);
  const [handCursor, setHandCursor] = useState<Point | null>(null);
  const [isHandTrackingEnabled, setIsHandTrackingEnabled] = useState(true);
  const [draggedIngredient, setDraggedIngredient] = useState<DraggedIngredient | null>(null);

  // Audio and TTS
  const { playFanfare, playPop, playSuccess, playError } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { completeGame } = useGameCompletion('chemistry-lab');

  const availableIngredients = getIngredientsForLevel(level);
  const availableRecipes = getRecipesForLevel(level);
  const progressPercentage = getProgressPercentage(
    progress.discoveredRecipeIds,
    level
  );

  // Handle hand tracking frame
  const handleTrackingFrame = useCallback(
    (frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const now = performance.now();
      const tip = frame.indexTip;

      if (!tip) {
        if (now - lastUIUpdateAtRef.current >= 100) {
          setHandCursor(null);
          setIsPinching(false);
          lastUIUpdateAtRef.current = now;
        }
        return;
      }

      const canvasX = tip.x;
      const canvasY = tip.y;

      if (now - lastUIUpdateAtRef.current >= 100) {
        setHandCursor({ x: canvasX, y: canvasY });
        setIsPinching(frame.pinch.state.isPinching);
        lastUIUpdateAtRef.current = now;
      }

      // Handle drag and drop
      if (frame.pinch.transition === 'start' && gameStarted && !gameCompleted) {
        // Check if pinching on an ingredient
        const ingredient = checkIngredientHit(canvasX, canvasY);
        if (ingredient) {
          setDraggedIngredient({
            ingredient,
            position: { x: canvasX, y: canvasY },
            isDragging: true,
          });
          playPop();
          triggerHaptic('light');
        }
      } else if (
        frame.pinch.transition === 'release' &&
        draggedIngredient
      ) {
        // Drop ingredient
        const { x, y } = draggedIngredient.position;
        const beakerX = BEAKER_POSITION.x;
        const beakerY = BEAKER_POSITION.y;
        const distance = Math.hypot(x - beakerX, y - beakerY);

        if (distance <= BEAKER_RADIUS) {
          // Dropped in beaker
          addIngredient(draggedIngredient.ingredient);
        }

        setDraggedIngredient(null);
      } else if (
        frame.pinch.state.isPinching &&
        draggedIngredient
      ) {
        // Update dragged position
        setDraggedIngredient({
          ...draggedIngredient,
          position: { x: canvasX, y: canvasY },
        });
      }
    },
    [gameStarted, gameCompleted, draggedIngredient]
  );

  const { isReady: isHandTrackingReady } = useGameHandTracking({
    gameName: 'ChemistryLab',
    isRunning: gameStarted && isHandTrackingEnabled && !gameCompleted,
    webcamRef,
    targetFps: 30,
    onFrame: handleTrackingFrame,
    onNoVideoFrame: () => {
      const now = performance.now();
      if (now - lastUIUpdateAtRef.current >= 100) {
        setHandCursor(null);
        setIsPinching(false);
        lastUIUpdateAtRef.current = now;
      }
    },
  });

  // Check if cursor is over an ingredient
  const checkIngredientHit = (x: number, y: number): Ingredient | null => {
    const ingredientPositions = getIngredientPositions();
    for (const { ingredient, position } of ingredientPositions) {
      const distance = Math.hypot(x - position.x, y - position.y);
      if (distance <= 0.08) {
        return ingredient;
      }
    }
    return null;
  };

  // Get positions for ingredient displays
  const getIngredientPositions = (): Array<{ ingredient: Ingredient; position: Point }> => {
    const positions: Array<{ ingredient: Ingredient; position: Point }> = [];
    const startX = 0.15;
    const startY = 0.2;
    const gapX = 0.12;
    const gapY = 0.15;

    availableIngredients.forEach((ingredient, index) => {
      const row = Math.floor(index / 4);
      const col = index % 4;
      positions.push({
        ingredient,
        position: {
          x: startX + col * gapX,
          y: startY + row * gapY,
        },
      });
    });

    return positions;
  };

  // Add ingredient to beaker
  const addIngredient = (ingredient: Ingredient) => {
    if (selectedIngredients.length >= 4) {
      playError();
      if (ttsEnabled) speak('Beaker is full! Mix or clear first.');
      return;
    }

    setSelectedIngredients([...selectedIngredients, ingredient]);
    playPop();
    triggerHaptic('light');

    if (ttsEnabled) {
      speak(`${ingredient.name} added!`);
    }
  };

  // Mix ingredients
  const mix = () => {
    if (selectedIngredients.length < 2) {
      playError();
      if (ttsEnabled) speak('Add more ingredients to mix!');
      return;
    }

    const ingredientIds = selectedIngredients.map((i) => i.id);
    const result = mixIngredients(ingredientIds, availableRecipes);
    setCurrentMixResult(result);

    if (result.success && result.recipe) {
      const isNew = checkDiscovery(result.recipe.id, progress.discoveredRecipeIds);
      
      if (isNew) {
        playFanfare();
        triggerHaptic('celebration');
        setLastDiscovery(result.recipe);
        setShowCelebration(true);

        const newProgress = updateProgress(progress, result);
        setProgress(newProgress);

        if (ttsEnabled) {
          speak(`Amazing! You discovered ${result.recipe.name}! ${result.recipe.description}`);
        }

        // Check if level complete
        if (newProgress.discoveredRecipeIds.length >= availableRecipes.length) {
          if (level < 3) {
            setTimeout(() => {
              setLevel(level + 1);
              if (ttsEnabled) speak(`Level ${level + 1} unlocked!`);
            }, 2000);
          } else {
            setGameCompleted(true);
            completeGame({ score: progress.totalMixes * 100, completed: true });
          }
        }
      } else {
        playSuccess();
        triggerHaptic('success');
        if (ttsEnabled) speak(`You made ${result.recipe.name} again!`);
      }
    } else {
      playError();
      triggerHaptic('error');
      const newProgress = updateProgress(progress, result);
      setProgress(newProgress);

      if (ttsEnabled) {
        speak("That didn't work. Try different ingredients!");
      }

      // Show hint after 5 failures
      if (shouldShowHint(newProgress)) {
        setShowHint(true);
      }
    }
  };

  // Clear beaker
  const clearBeaker = () => {
    setSelectedIngredients([]);
    setCurrentMixResult(null);
    playPop();
  };

  // Start game
  const startGame = () => {
    setGameStarted(true);
    if (ttsEnabled) {
      speak('Welcome to the Chemistry Lab! Drag ingredients to the beaker and mix them!');
    }
  };

  // Reset game
  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setLevel(1);
    setProgress(getDefaultProgress());
    setSelectedIngredients([]);
    setCurrentMixResult(null);
    setShowCelebration(false);
    setShowHint(false);
  };

  // Go home
  const goToHome = () => {
    playPop();
    navigate('/dashboard');
  };

  // Get mixed color
  const mixedColor = useMemo(() => {
    if (currentMixResult?.success && currentMixResult.recipe) {
      return currentMixResult.recipe.resultColor;
    }
    return blendColors(selectedIngredients.map((i) => i.id));
  }, [currentMixResult, selectedIngredients]);

  // Game controls
  const gameControls: GameControl[] = useMemo(
    () => [
      {
        id: 'mode',
        icon: isHandTrackingEnabled ? 'hand' : 'pencil',
        label: isHandTrackingEnabled ? 'Hand Mode' : 'Mouse Mode',
        onClick: () => setIsHandTrackingEnabled(!isHandTrackingEnabled),
        variant: 'primary',
        isActive: isHandTrackingEnabled,
      },
      {
        id: 'clear',
        icon: 'x',
        label: 'Clear',
        onClick: clearBeaker,
        variant: 'danger',
      },
      {
        id: 'mix',
        icon: 'flask',
        label: 'Mix!',
        onClick: mix,
        variant: 'success',
        disabled: selectedIngredients.length < 2,
      },
    ],
    [isHandTrackingEnabled, selectedIngredients.length]
  );

  // Menu controls
  const menuControls: GameControl[] = useMemo(
    () => [
      {
        id: 'home',
        icon: 'home',
        label: 'Home',
        onClick: goToHome,
        variant: 'secondary',
      },
      {
        id: 'start',
        icon: 'flask',
        label: 'Start Experiment!',
        onClick: startGame,
        variant: 'success',
      },
    ],
    [goToHome, startGame]
  );

  // Completion controls
  const completionControls: GameControl[] = useMemo(
    () => [
      {
        id: 'play-again',
        icon: 'rotate-ccw',
        label: 'Play Again',
        onClick: resetGame,
        variant: 'primary',
      },
      {
        id: 'home',
        icon: 'home',
        label: 'Home',
        onClick: goToHome,
        variant: 'secondary',
      },
    ],
    [resetGame, goToHome]
  );

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw beaker
    const beakerX = BEAKER_POSITION.x * canvas.width;
    const beakerY = BEAKER_POSITION.y * canvas.height;
    const beakerRadius = BEAKER_RADIUS * canvas.width;

    // Beaker outline
    ctx.beginPath();
    ctx.arc(beakerX, beakerY, beakerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#6B7280';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Beaker fill (liquid)
    if (selectedIngredients.length > 0) {
      ctx.beginPath();
      ctx.arc(beakerX, beakerY, beakerRadius - 4, 0, Math.PI * 2);
      ctx.fillStyle = mixedColor;
      ctx.fill();

      // Liquid shine
      ctx.beginPath();
      ctx.arc(beakerX - 20, beakerY - 20, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fill();
    }

    // Draw ingredients
    const ingredientPositions = getIngredientPositions();
    ingredientPositions.forEach(({ ingredient, position }) => {
      const x = position.x * canvas.width;
      const y = position.y * canvas.height;
      const size = 40;

      // Ingredient circle
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = ingredient.color;
      ctx.fill();
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Ingredient emoji
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ingredient.emoji, x, y);

      // Ingredient name
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#374151';
      ctx.fillText(ingredient.name, x, y + 30);
    });

    // Draw dragged ingredient
    if (draggedIngredient) {
      const x = draggedIngredient.position.x * canvas.width;
      const y = draggedIngredient.position.y * canvas.height;
      const size = 50;

      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = draggedIngredient.ingredient.color;
      ctx.fill();
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = '30px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(draggedIngredient.ingredient.emoji, x, y);
    }
  }, [selectedIngredients, draggedIngredient, mixedColor, availableIngredients]);

  return (
    <>
      {gameStarted && !gameCompleted ? (
        <GameContainer
          webcamRef={webcamRef}
          title="Chemistry Lab"
          score={progress.totalMixes * 10}
          level={level}
          onHome={goToHome}
          isHandDetected={isHandTrackingReady}
          isPlaying={gameStarted && !gameCompleted}
        >
          <div
            ref={gameAreaRef}
            className="relative w-full h-full bg-gradient-to-br from-slate-50 to-slate-100"
            role="main"
            aria-label="Chemistry Lab mixing game"
          >
            {/* Progress Bar */}
            <div className="absolute top-4 left-4 right-4 z-40">
              <div className="bg-white px-4 py-2 rounded-2xl border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-text-secondary">
                    Level {level} Progress
                  </span>
                  <span className="text-sm font-black text-[#3B82F6]">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="text-xs text-text-secondary mt-1">
                  {progress.discoveredRecipeIds.length} / {availableRecipes.length} recipes discovered
                </div>
              </div>
            </div>

            {/* Hint */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-24 left-1/2 -translate-x-1/2 z-40"
                >
                  <div className="bg-yellow-100 px-6 py-3 rounded-2xl border-2 border-yellow-300 shadow-lg">
                    <span className="text-yellow-800 font-bold">
                      💡 Hint: Try mixing {getHint(progress.discoveredRecipeIds, availableRecipes)?.map(i => i.emoji).join(' + ')}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Canvas */}
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="w-full h-full"
              onClick={(e) => {
                if (!isHandTrackingEnabled) {
                  const rect = canvasRef.current?.getBoundingClientRect();
                  if (rect) {
                    const x = (e.clientX - rect.left) / rect.width;
                    const y = (e.clientY - rect.top) / rect.height;
                    const ingredient = checkIngredientHit(x, y);
                    if (ingredient) {
                      addIngredient(ingredient);
                    } else {
                      const beakerX = BEAKER_POSITION.x;
                      const beakerY = BEAKER_POSITION.y;
                      const distance = Math.hypot(x - beakerX, y - beakerY);
                      if (distance <= BEAKER_RADIUS && selectedIngredients.length >= 2) {
                        mix();
                      }
                    }
                  }
                }
              }}
            />

            {/* Current Mix Result */}
            {currentMixResult?.success && currentMixResult.recipe && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute bottom-32 left-1/2 -translate-x-1/2 z-40"
              >
                <div className="bg-white px-6 py-4 rounded-2xl border-3 border-green-300 shadow-xl text-center">
                  <div className="text-4xl mb-2">{currentMixResult.recipe.resultEmoji}</div>
                  <div className="font-black text-lg text-green-600">
                    {currentMixResult.recipe.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {currentMixResult.recipe.description}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Hand tracking cursor */}
            {handCursor && isHandTrackingEnabled && (
              <GameCursor
                position={handCursor}
                coordinateSpace="normalized"
                containerRef={gameAreaRef}
                isPinching={isPinching}
                isHandDetected
                size={64}
                color="#8B5CF6"
              />
            )}

            {/* Mascot */}
            <div className="absolute bottom-4 left-4 z-20">
              <Mascot
                state={selectedIngredients.length > 0 ? 'happy' : 'idle'}
                message={
                  selectedIngredients.length === 0
                    ? 'Drag ingredients to the beaker!'
                    : selectedIngredients.length === 1
                    ? 'Add more ingredients to mix!'
                    : 'Ready to mix! Click the Mix button!'
                }
              />
            </div>

            {/* Game Controls */}
            <GameControls controls={gameControls} position="bottom-right" />
          </div>
        </GameContainer>
      ) : (
        /* Menu / Completion Screen */
        <section className="max-w-5xl mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
              <div>
                <h1 className="text-4xl font-black text-advay-slate mb-2 tracking-tight">
                  Chemistry Lab
                </h1>
                <p className="text-text-secondary font-bold text-lg">
                  Mix ingredients to discover magical potions!
                </p>
              </div>

              <div className="text-left sm:text-right bg-white p-4 rounded-2xl border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E]">
                <output className="block text-3xl font-black text-[#10B981] mb-1">
                  Mixes: {progress.totalMixes}
                </output>
                <div className="text-sm font-bold text-slate-500">
                  {progress.discoveredRecipeIds.length} recipes found
                </div>
              </div>
            </header>

            {/* Game Area */}
            <div className="bg-white border-3 border-[#F2CC8F] rounded-[2.5rem] p-8 md:p-12 mb-8 shadow-[0_4px_0_#E5B86E]">
              {!gameStarted ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center border-3 border-purple-200">
                    <span className="text-6xl">⚗️</span>
                  </div>

                  <h2 className="text-4xl font-black text-advay-slate mb-4">
                    Welcome to the Lab!
                  </h2>
                  <p className="text-text-secondary font-bold mb-10 max-w-lg text-center text-lg leading-relaxed">
                    Drag colorful ingredients into the beaker and mix them to discover
                    magical potions! Can you find all the secret recipes?
                  </p>

                  <GameControls controls={menuControls} position="bottom-center" />

                  {ttsEnabled && (
                    <VoiceInstructions
                      instructions={[
                        'Drag ingredients to the beaker.',
                        'Mix two or more ingredients.',
                        'Discover secret recipes!',
                        'Find all the potions!',
                      ]}
                      autoSpeak={true}
                    />
                  )}
                </div>
              ) : (
                /* Game Completed Screen */
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-32 h-32 mx-auto mb-8 text-7xl">🏆</div>

                  <h2 className="text-4xl font-black text-[#10B981] mb-2">
                    Master Chemist!
                  </h2>
                  <p className="text-xl text-text-secondary font-bold mb-8">
                    You discovered all {RECIPES.length} recipes!
                  </p>
                  <div className="text-3xl font-black text-advay-slate mb-10 border-3 border-[#F2CC8F] bg-slate-50 px-8 py-4 rounded-3xl">
                    Total Mixes: <span className="text-[#3B82F6]">{progress.totalMixes}</span>
                  </div>

                  <GameControls controls={completionControls} position="bottom-center" />
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-purple-50 border-3 border-purple-100 rounded-[2rem] p-8">
              <h2 className="text-2xl font-black mb-4 text-purple-600">
                How to Play
              </h2>
              <ul className="space-y-3 text-advay-slate font-bold text-lg">
                <li>• Drag ingredients from the shelf to the beaker</li>
                <li>• Mix 2-4 ingredients to create potions</li>
                <li>• Discover all {RECIPES.length} secret recipes</li>
                <li>• Progress through 3 levels with more ingredients</li>
                <li className="pt-2">
                  <strong className="text-purple-600">Hand Tracking:</strong>{' '}
                  Pinch and drag ingredients with your finger!
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Celebration Overlay */}
          <CelebrationOverlay
            show={showCelebration}
            letter={lastDiscovery?.resultEmoji || '⚗️'}
            accuracy={100}
            message={lastDiscovery ? `Discovered: ${lastDiscovery.name}!` : 'New Discovery!'}
            onComplete={() => setShowCelebration(false)}
          />
        </section>
      )}
    </>
  );
});

export const ChemistryLab = memo(function ChemistryLabShell() {
  return (
    <GameShell
      gameId="chemistry-lab"
      gameName="Chemistry Lab"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <ChemistryLabGame />
    </GameShell>
  );
});

export default ChemistryLab;
