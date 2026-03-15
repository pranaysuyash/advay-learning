/**
 * Color Potions Game
 *
 * Mix colorful ingredients to create magical potions and discover amazing reactions!
 *
 * Educational Focus:
 * - Basic chemistry concepts (mixing, reactions)
 * - Color theory and blending
 * - Experimentation and discovery
 * - Pattern recognition
 *
 * Controls:
 * - Tap ingredient to select
 * - Tap beaker to add ingredient
 * - Tap "Mix" button to create potion
 * - Mouse/Touch only (no CV required)
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { GameControls } from '../components/GameControls';
import type { GameControl } from '../components/GameControls';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { CursorEmbodiment } from '../components/game/CursorEmbodiment';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { triggerHaptic } from '../utils/haptics';
import { useTTS } from '../hooks/useTTS';
import { VoiceInstructions } from '../components/game/VoiceInstructions';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { Point } from '../types/tracking';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import {
  INGREDIENTS,
  getIngredientsForLevel,
  getRecipesForLevel,
  mixIngredients,
  updateProgress,
  getDefaultProgress,
  blendColors,
  shouldShowHint,
  getHint,
  getProgressPercentage,
  type Ingredient,
  type Recipe,
  type GameProgress,
  type MixResult,
} from '../games/chemistryLabLogic';

const STORAGE_KEY = 'color-potions-progress';

interface PotionDiscovery {
  recipe: Recipe;
  timestamp: number;
}

const ColorPotionsContent = memo(function ColorPotionsContent() {
  // Game state
  const [showMenu, setShowMenu] = useState(true);
  const [level] = useState(1);
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>(
    [],
  );
  const [beakerContents, setBeakerContents] = useState<Ingredient[]>([]);
  const [progress, setProgress] = useState<GameProgress>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : getDefaultProgress();
  });

  // Discovery state
  const [recentDiscovery, setRecentDiscovery] =
    useState<PotionDiscovery | null>(null);
  const [showRecipeBook, setShowRecipeBook] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState<Ingredient[] | null>(null);

  // Animation state
  const [isMixing, setIsMixing] = useState(false);
  const [mixColor, setMixColor] = useState<string>('#CCCCCC');
  const [showCelebration, setShowCelebration] = useState(false);
  const [feedback, setFeedback] = useState('Select ingredients and mix them!');

  // Streak tracking
  const { streak, incrementStreak, resetStreak } = useStreakTracking();

  // Hand tracking state
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [isHandTrackingActive, setIsHandTrackingActive] = useState(false);

  // Refs
  const progressRef = useRef(progress);
  const streakRef = useRef(streak);

  // Hooks
  const {
    playPop,
    playSuccess,
    playError,
    playCelebration: playCelebrationSound,
    playLevelUp,
  } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { completeGame } = useGameCompletion('color-potions');

  // Keep refs in sync
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    streakRef.current = streak;
  }, [streak]);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  // Get available ingredients and recipes for current level
  const availableIngredients = getIngredientsForLevel(level);
  const availableRecipes = getRecipesForLevel(level);
  const progressPercentage = getProgressPercentage(
    progress.discoveredRecipeIds,
    level,
  );

  // Handle ingredient selection
  const handleIngredientClick = useCallback(
    (ingredient: Ingredient) => {
      if (showMenu || isMixing) return;

      playPop();
      triggerHaptic('success');

      setSelectedIngredients((prev) => {
        // Remove if already selected
        if (prev.find((i) => i.id === ingredient.id)) {
          return prev.filter((i) => i.id !== ingredient.id);
        }
        // Add if not selected (max 3)
        if (prev.length < 3) {
          return [...prev, ingredient];
        }
        return prev;
      });
    },
    [showMenu, isMixing, playPop],
  );

  // Add ingredients to beaker
  const handleAddToBeaker = useCallback(() => {
    if (selectedIngredients.length === 0 || isMixing) return;

    playPop();
    triggerHaptic('success');
    setBeakerContents(selectedIngredients);

    // Calculate blend color for visual preview
    const color = blendColors(selectedIngredients.map((i) => i.id));
    setMixColor(color);

    setSelectedIngredients([]);
    setFeedback('Ready to mix! 🧪');
  }, [selectedIngredients, isMixing, playPop]);

  // Mix ingredients
  const handleMix = useCallback(() => {
    if (beakerContents.length < 2 || isMixing) return;

    setIsMixing(true);
    playPop();

    // Perform mix
    const result: MixResult = mixIngredients(
      beakerContents.map((i) => i.id),
      availableRecipes,
    );

    // Check if discovery
    const isNewDiscovery =
      result.success && result.recipe
        ? !progress.discoveredRecipeIds.includes(result.recipe.id)
        : false;

    // Update progress
    const newProgress = updateProgress(progress, { ...result, isNewDiscovery });
    setProgress(newProgress);

    // Delay for animation
    setTimeout(() => {
      if (result.success && result.recipe) {
        // Success!
        playSuccess();
        triggerHaptic('success');
        incrementStreak();

        setMixColor(result.recipe.resultColor);
        setFeedback(`${result.recipe.resultEmoji} ${result.recipe.name}!`);

        if (isNewDiscovery) {
          // New discovery!
          setTimeout(() => {
            playCelebrationSound();
            triggerHaptic('celebration');
            setShowCelebration(true);
            setRecentDiscovery({
              recipe: result.recipe!,
              timestamp: Date.now(),
            });

            if (ttsEnabled) {
              const isRarePotion = ['golden-potion', 'silver-potion'].includes(
                result.recipe!.id,
              );
              const isFirstDiscovery =
                progress.discoveredRecipeIds.length === 0;

              if (isFirstDiscovery) {
                setTimeout(
                  () => speak('Amazing! You discovered your first potion!'),
                  500,
                );
              } else if (isRarePotion) {
                setTimeout(
                  () =>
                    speak(
                      `Wow! You discovered the legendary ${result.recipe!.name}!`,
                    ),
                  500,
                );
              } else {
                setTimeout(
                  () => speak(`You discovered ${result.recipe!.name}!`),
                  500,
                );
              }
            }

            setTimeout(() => setShowCelebration(false), 2000);
          }, 500);
        }

        // Streak milestone announcements
        if (ttsEnabled && streakRef.current > 0) {
          const newStreak = streakRef.current + 1;
          if (newStreak === 3) {
            setTimeout(() => speak('Great job! Three potions in a row!'), 1000);
          } else if (newStreak === 5) {
            setTimeout(
              () => speak("You're on fire! Five discoveries in a row!"),
              1000,
            );
          } else if (newStreak === 10) {
            setTimeout(
              () =>
                speak(
                  'Incredible! Ten discoveries in a row! You are a master alchemist!',
                ),
              1000,
            );
          }
        }

        // Check for level completion
        const newPercentage = getProgressPercentage(
          newProgress.discoveredRecipeIds,
          level,
        );
        if (newPercentage === 100 && level < 3) {
          setTimeout(() => {
            playLevelUp();
            triggerHaptic('celebration');
            setFeedback(`Level ${level} complete!`);
            if (ttsEnabled) {
              speak(`Amazing! You discovered all the level ${level} potions!`);
            }
          }, 1500);
        }
      } else {
        // Failed mix
        playError();
        triggerHaptic('error');
        resetStreak();
        setMixColor('#CCCCCC');
        setFeedback('Fizz... Nothing happened! 💨');

        // Show hint if needed
        if (shouldShowHint(newProgress)) {
          const hint = getHint(
            newProgress.discoveredRecipeIds,
            availableRecipes,
          );
          if (hint) {
            setCurrentHint(hint);
            setShowHint(true);
          }
        }
      }

      // Clear beaker
      setTimeout(() => {
        setBeakerContents([]);
        setIsMixing(false);
        if (!result.success) {
          setFeedback('Try mixing different ingredients!');
        }
      }, 1000);
    }, 500);
  }, [
    beakerContents,
    isMixing,
    availableRecipes,
    progress,
    playPop,
    playSuccess,
    playError,
    playCelebrationSound,
    playLevelUp,
    incrementStreak,
    resetStreak,
    level,
    ttsEnabled,
    speak,
  ]);

  // Clear beaker
  const handleClear = useCallback(() => {
    playPop();
    triggerHaptic('success');
    setBeakerContents([]);
    setSelectedIngredients([]);
    setMixColor('#CCCCCC');
    setFeedback('Select ingredients and mix them!');
  }, [playPop]);

  // Start game
  const handleStart = useCallback(() => {
    playPop();
    setShowMenu(false);
    setFeedback('Select ingredients and mix them!');

    if (ttsEnabled && progress.discoveredRecipeIds.length === 0) {
      speak(
        'Welcome to the color potions lab! Mix ingredients to discover potions!',
      );
    }
  }, [playPop, ttsEnabled, speak, progress]);

  // Finish game
  const handleFinish = useCallback(async () => {
    playPop();
    await completeGame({
      score: progress.discoveredRecipeIds.length,
      completed: true,
      level: 1,
    });
  }, [playPop, completeGame, progress.discoveredRecipeIds.length]);

  // Menu controls
  const menuControls: GameControl[] = [
    { id: 'play', label: 'Play', icon: 'play', onClick: handleStart },
    {
      id: 'recipe-book',
      label: 'Recipe Book',
      icon: 'sparkles',
      onClick: () => setShowRecipeBook(true),
    },
  ];

  // Game controls
  const gameControls: GameControl[] = [
    {
      id: 'add',
      label: 'Add to Beaker',
      icon: 'drop',
      onClick: handleAddToBeaker,
      disabled: selectedIngredients.length === 0,
    },
    {
      id: 'mix',
      label: 'Mix!',
      icon: 'sparkles',
      onClick: handleMix,
      disabled: beakerContents.length < 2 || isMixing,
    },
    { id: 'clear', label: 'Clear', icon: 'rotate-ccw', onClick: handleClear },
    {
      id: 'menu',
      label: 'Menu',
      icon: 'home',
      onClick: () => setShowMenu(true),
    },
  ];

  // Render ingredient shelf
  const renderIngredientShelf = () => (
    <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-900/90 to-amber-800/80 p-4'>
      <div className='flex gap-3 justify-center flex-wrap max-w-4xl mx-auto'>
        {availableIngredients.map((ingredient) => {
          const isSelected = selectedIngredients.find(
            (i) => i.id === ingredient.id,
          );
          return (
            <motion.button
              key={ingredient.id}
              onClick={() => handleIngredientClick(ingredient)}
              className={`
                relative w-16 h-16 rounded-xl flex items-center justify-center text-4xl
                transition-all shadow-lg
                ${isSelected ? 'ring-4 ring-yellow-400 scale-110' : 'hover:scale-105'}
              `}
              style={{ backgroundColor: ingredient.color + '40' }}
              whileHover={{ scale: isSelected ? 1.1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              type='button'
              aria-label={`${ingredient.name} ingredient`}
            >
              {ingredient.emoji}
              {isSelected && (
                <motion.div
                  className='absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-sm'
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {selectedIngredients.findIndex(
                    (i) => i.id === ingredient.id,
                  ) + 1}
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  // Render beaker
  const renderBeaker = () => (
    <div className='flex-1 flex items-center justify-center'>
      <motion.div
        className='relative w-48 h-72'
        animate={isMixing ? { rotate: [0, -5, 5, -5, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        {/* Beaker shape */}
        <div className='absolute inset-0 flex items-end justify-center'>
          <div
            className='w-40 h-56 rounded-b-3xl border-4 border-gray-300 bg-white/20 backdrop-blur-sm overflow-hidden relative'
            style={{
              boxShadow: 'inset 0 0 20px rgba(255,255,255,0.3)',
            }}
          >
            {/* Liquid */}
            <AnimatePresence>
              {beakerContents.length > 0 && (
                <motion.div
                  className='absolute bottom-0 left-0 right-0'
                  initial={{ height: 0 }}
                  animate={{ height: '60%' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div
                    className='w-full h-full'
                    style={{
                      backgroundColor: mixColor,
                      opacity: 0.8,
                    }}
                  />
                  {/* Bubbles */}
                  {isMixing && (
                    <div className='absolute inset-0 overflow-hidden'>
                      {[...Array(10)].map((_, i) => (
                        <motion.div
                          key={`bubble-${i}-${Date.now()}`}
                          className='absolute w-4 h-4 rounded-full bg-white/50'
                          style={{
                            left: `${Math.random() * 80 + 10}%`,
                            bottom: '10%',
                          }}
                          animate={{
                            y: [0, -200],
                            opacity: [1, 0],
                          }}
                          transition={{
                            duration: 1 + Math.random(),
                            repeat: Infinity,
                            delay: Math.random() * 0.5,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Beaker neck */}
        <div className='absolute top-0 left-1/2 -translate-x-1/2 w-24 h-12 border-4 border-b-0 border-gray-300 bg-white/10' />
      </motion.div>
    </div>
  );

  // Render recipe book
  const renderRecipeBook = () => (
    <AnimatePresence>
      {showRecipeBook && (
        <motion.div
          className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowRecipeBook(false)}
        >
          <motion.div
            className='bg-amber-100 rounded-2xl p-6 max-w-2xl max-h-[80vh] overflow-y-auto'
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-2xl font-bold text-amber-900'>
                Recipe Book 📖
              </h2>
              <button
                onClick={() => setShowRecipeBook(false)}
                className='text-2xl'
                type='button'
                aria-label='Close recipe book'
              >
                ✕
              </button>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              {availableRecipes.map((recipe) => {
                const isDiscovered = progress.discoveredRecipeIds.includes(
                  recipe.id,
                );
                return (
                  <div
                    key={recipe.id}
                    className={`
                      p-4 rounded-xl border-2
                      ${isDiscovered ? 'bg-white border-amber-300' : 'bg-gray-200 border-gray-300'}
                    `}
                  >
                    <div className='text-3xl mb-2'>
                      {isDiscovered ? recipe.resultEmoji : '❓'}
                    </div>
                    <div className='font-bold'>
                      {isDiscovered ? recipe.name : '???'}
                    </div>
                    {isDiscovered && (
                      <div className='text-sm text-gray-600 mt-2'>
                        {recipe.ingredientIds
                          .map((id) => {
                            const ing = INGREDIENTS.find((i) => i.id === id);
                            return ing ? ing.emoji : '';
                          })
                          .join(' + ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className='mt-4 text-center text-amber-900'>
              Discovered:{' '}
              {
                progress.discoveredRecipeIds.filter((id) =>
                  availableRecipes.some((r) => r.id === id),
                ).length
              }{' '}
              / {availableRecipes.length}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render hint modal
  const renderHint = () => (
    <AnimatePresence>
      {showHint && currentHint && (
        <motion.div
          className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowHint(false)}
        >
          <motion.div
            className='bg-white rounded-2xl p-6 max-w-md'
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className='text-xl font-bold mb-4'>💡 Hint!</h3>
            <p className='mb-4'>Try mixing these ingredients:</p>
            <div className='flex gap-4 justify-center text-4xl'>
              {currentHint.map((ing) => (
                <span key={ing.id}>{ing.emoji}</span>
              ))}
            </div>
            <button
              onClick={() => setShowHint(false)}
              className='mt-4 w-full bg-blue-500 text-white py-2 rounded-lg'
              type='button'
            >
              Got it!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Hand tracking
  const handleHandTrackingFrame = useCallback((frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
    if (!frame.indexTip) { setCursor(null); setIsHandTrackingActive(false); return; }
    setCursor({ x: frame.indexTip.x, y: frame.indexTip.y });
    setIsHandTrackingActive(true);
  }, []);

  const { webcamRef: _webcamRef } = useGameHandTracking({ gameName: 'ColorPotions', targetFps: 24, onFrame: handleHandTrackingFrame });

  return (
    <GameContainer webcamRef={_webcamRef} isHandDetected={isHandTrackingActive} isPlaying={!showMenu}>
      <div ref={gameAreaRef} className='flex-1 relative'>
        <CursorEmbodiment position={cursor ?? { x: 0, y: 0 }} isHandDetected={isHandTrackingActive} />
        <VoiceInstructions instructions='Welcome to the color potions lab! Mix colorful ingredients to discover magical potions!' />

      {/* Header */}
      {!showMenu && (
        <div className='absolute top-4 left-4 right-4 flex justify-between items-center z-10'>
          <div className='bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg'>
            <div className='text-sm text-gray-600'>Discovered</div>
            <div className='text-xl font-bold text-amber-900'>
              {
                progress.discoveredRecipeIds.filter((id) =>
                  availableRecipes.some((r) => r.id === id),
                ).length
              }{' '}
              / {availableRecipes.length}
            </div>
          </div>

          <div className='bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg'>
            <div className='text-sm text-gray-600'>Level {level}</div>
            <div className='w-32 h-2 bg-gray-200 rounded-full overflow-hidden'>
              <div
                className='h-full bg-amber-500 transition-all'
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Feedback */}
      {!showMenu && (
        <div className='absolute top-20 left-1/2 -translate-x-1/2 z-10'>
          <motion.div
            className='bg-white/90 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg text-lg'
            key={feedback}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {feedback}
          </motion.div>
        </div>
      )}

      {/* Game Area */}
      {showMenu ? (
        <div className='flex-1 flex flex-col items-center justify-center p-8'>
          <h1 className='text-4xl font-bold text-amber-900 mb-4'>
            Color Potions 🧪
          </h1>
          <p className='text-lg text-amber-800 mb-8 text-center max-w-md'>
            Mix colorful ingredients to discover magical potions!
          </p>
          <GameControls controls={menuControls} />
        </div>
      ) : (
        <>
          {renderBeaker()}
          {renderIngredientShelf()}
        </>
      )}

      {/* Controls */}
      {!showMenu && <GameControls controls={gameControls} />}

      {/* Finish button */}
      {!showMenu && (
        <button
          onClick={handleFinish}
          className='absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-20'
          type='button'
        >
          Done
        </button>
      )}

      {/* Modals */}
      {renderRecipeBook()}
      {renderHint()}

      {/* Celebrations */}
      <CelebrationOverlay
        show={showCelebration}
        letter={recentDiscovery?.recipe?.name?.[0] || 'P'}
        accuracy={100}
        message={
          recentDiscovery?.recipe
            ? `Discovered ${recentDiscovery.recipe.name}!`
            : ''
        }
        onComplete={() => setShowCelebration(false)}
      />
      </div>
    </GameContainer>
  );
});

export default function ColorPotions() {
  return (
    <GameShell gameName='Color Potions' gameId='color-potions'>
      <ColorPotionsContent />
    </GameShell>
  );
}

export { ColorPotions };
