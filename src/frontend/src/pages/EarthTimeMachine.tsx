/**
 * Earth Time Machine Game
 *
 * Travel through Earth's history and discover amazing facts!
 * @ticket EARTH-TIME-MACHINE
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { AccessDenied } from '../components/ui/AccessDenied';
import { useSubscription } from '../hooks/useSubscription';
import { useAutoGameCompletion } from '../hooks/useAutoGameCompletion';
import { GlobalErrorBoundary } from '../components/errors/GlobalErrorBoundary';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { Point } from '../types/tracking';
import {
  ERAS,
  TIME_ITEMS,
  CHALLENGES,
  createInitialState,
  startChallenge,
  moveToEra,
  findItem,
  tick,
  getItemsForEra,
  calculateStars,
  type GameState,
} from '../games/earthTimeMachineLogic';
import { useAudio } from '../utils/hooks/useAudio';
import { useTTS } from '../hooks/useTTS';

const TIMER_INTERVAL = 1000;

function EarthTimeMachineContent() {
  const navigate = useNavigate();
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const { canAccessGame, isLoading: subLoading } = useSubscription();
  const hasAccess = canAccessGame('earth-time-machine');
  const { playClick, playSuccess, playError } = useAudio();
  const { speak } = useTTS();

  // Hand tracking state
  const [cursor, setCursor] = useState<Point | null>(null);
  const [isHandTrackingActive, setIsHandTrackingActive] = useState(false);

  const [state, setState] = useState<GameState>(createInitialState());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showFact, setShowFact] = useState<string | null>(null);
  const { resetAutoCompletion } = useAutoGameCompletion('earth-time-machine', {
    when: state.status === 'success',
    score: state.score,
    level: CHALLENGES.findIndex((c) => c.id === state.currentChallengeId) + 1,
    metadata: {
      challengeId: state.currentChallengeId,
      streak: state.streak,
    },
  });

  const currentChallenge = CHALLENGES.find(
    (c) => c.id === state.currentChallengeId,
  );
  const currentEra = ERAS.find((e) => e.id === state.currentEraId);
  const availableItems = getItemsForEra(state.currentEraId);

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(timeout);
  }, [feedback]);

  // Hand tracking frame handler
  const handleFrame = useCallback(
    (frame: import('../utils/handTrackingFrame').TrackedHandFrame) => {
      const hand = frame;
      if (!hand || !hand.indexTip) {
        setCursor(null);
        setIsHandTrackingActive(false);
        return;
      }

      const newCursor: Point = { x: hand.indexTip.x, y: hand.indexTip.y };
      setCursor(newCursor);
      setIsHandTrackingActive(true);
    },
    [],
  );

  const { webcamRef: _webcamRef } = useGameHandTracking({
    gameName: 'earth-time-machine',
    targetFps: 24,
    onFrame: handleFrame,
  });

  useEffect(() => {
    if (state.status !== 'playing') return;

    const interval = setInterval(() => {
      setState((prev) => tick(prev));
    }, TIMER_INTERVAL);

    return () => clearInterval(interval);
  }, [state.status]);

  const handleStartChallenge = useCallback(
    (challengeId: string) => {
      playClick();
      resetAutoCompletion();
      setState(startChallenge(createInitialState(), challengeId));
      setFeedback(null);
      setShowFact(null);
      const challenge = CHALLENGES.find((c) => c.id === challengeId);
      if (challenge) void speak(challenge.description);
    },
    [playClick, speak, resetAutoCompletion],
  );

  const handleEraSelect = useCallback(
    (eraId: string) => {
      playClick();
      setState((prev) => moveToEra(prev, eraId));
      setShowFact(null);
      const era = ERAS.find((e) => e.id === eraId);
      if (era) void speak(era.description);
    },
    [playClick, speak],
  );

  const handleItemClick = useCallback(
    (itemId: string) => {
      const item = TIME_ITEMS.find((i) => i.id === itemId);
      if (!item) return;

      const wasFound = state.foundItems.includes(itemId);
      if (wasFound) return;

      playClick();

      const newState = findItem(state, itemId);
      setState(newState);

      if (newState.status === 'success') {
        playSuccess();
        void speak('Great job! You completed the challenge!');
      } else if (newState.status === 'failure') {
        playError();
        void speak(
          `Oops! ${item.name} lived in the ${item.eraId.replace('-', ' ')} era.`,
        );
      } else {
        setShowFact(item.fact);
        void speak(item.fact);
      }
    },
    [state, playClick, playSuccess, playError, speak],
  );

  const handleBackToMenu = useCallback(() => {
    playClick();
    resetAutoCompletion();
    setState(createInitialState());
    setFeedback(null);
    setShowFact(null);
  }, [playClick, resetAutoCompletion]);

  if (subLoading) {
    return (
      <GameShell gameId='earth-time-machine' gameName='Earth Time Machine'>
        Loading...
      </GameShell>
    );
  }

  if (!hasAccess) {
    return (
      <AccessDenied gameName='Earth Time Machine' gameId='earth-time-machine' />
    );
  }

  return (
    <GameShell gameId='earth-time-machine' gameName='Earth Time Machine'>
      <GameContainer
        onHome={() => navigate('/games')}
        webcamRef={_webcamRef}
        isHandDetected={isHandTrackingActive}
        isPlaying={state.status === 'playing'}
      >
        <div ref={gameAreaRef} className='flex-1 relative'>
          {/* Hand cursor */}
          {cursor && isHandTrackingActive && (
            <div
              className='fixed pointer-events-none z-50'
              style={{
                left: cursor.x * window.innerWidth,
                top: cursor.y * window.innerHeight,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className='w-16 h-16 bg-yellow-400 rounded-full opacity-50' />
            </div>
          )}

          <AnimatePresence mode='wait'>
            {state.status === 'menu' && (
              <motion.div
                key='menu'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className='flex flex-col items-center justify-center min-h-[60vh] gap-8'
              >
                <div className='text-center'>
                  <h1 className='text-4xl font-bold text-white mb-4'>
                    Earth Time Machine
                  </h1>
                  <p className='text-xl text-blue-200 mb-8'>
                    Travel through time and discover Earth's history!
                  </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {CHALLENGES.map((challenge) => (
                    <motion.button
                      key={challenge.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStartChallenge(challenge.id)}
                      className='bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white p-6 rounded-2xl shadow-lg border-2 border-white/20 min-w-[200px]'
                    >
                      <div className='text-2xl font-bold mb-2'>
                        {challenge.name}
                      </div>
                      <div className='text-sm opacity-80 mb-2'>
                        {challenge.description}
                      </div>
                      <div className='text-xs opacity-60'>
                        ⏱️ {challenge.timeLimit}s
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {state.status === 'playing' && currentChallenge && currentEra && (
              <motion.div
                key='playing'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='flex flex-col items-center gap-4 w-full'
              >
                <div className='flex justify-between items-center w-full max-w-2xl bg-white/10 rounded-xl p-4'>
                  <div className='text-white'>
                    <span className='font-bold'>Score:</span> {state.score}
                  </div>
                  <div
                    className={`text-2xl font-bold ${state.timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}
                  >
                    {Math.floor(state.timeLeft / 60)}:
                    {(state.timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                  <div className='text-white'>
                    <span className='font-bold'>Streak:</span> {state.streak} 🔥
                  </div>
                </div>

                <div className='w-full max-w-2xl bg-white/5 rounded-xl p-4'>
                  <h3 className='text-white text-lg font-bold mb-4 text-center'>
                    Time Travel Slider
                  </h3>
                  <div className='flex justify-between items-center gap-2'>
                    {ERAS.map((era) => (
                      <motion.button
                        key={era.id}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEraSelect(era.id)}
                        className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                          state.currentEraId === era.id
                            ? 'bg-white/30 ring-2 ring-white'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        <span className='text-3xl'>{era.emoji}</span>
                        <span className='text-xs text-white mt-1 font-medium'>
                          {era.name}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <motion.div
                  key={currentEra.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className='w-full max-w-2xl bg-white/10 rounded-2xl p-6 text-center'
                >
                  <div
                    className='text-8xl mb-4'
                    style={{ color: currentEra.color }}
                  >
                    {currentEra.emoji}
                  </div>
                  <h2 className='text-3xl font-bold text-white mb-2'>
                    {currentEra.name}
                  </h2>
                  <p className='text-blue-200 mb-2'>{currentEra.description}</p>
                  <p className='text-sm text-purple-300'>
                    {currentEra.yearsAgo === 0
                      ? 'Present Day'
                      : `${currentEra.yearsAgo} million years ago`}
                  </p>
                </motion.div>

                {showFact && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-xl p-4 max-w-xl'
                  >
                    <p className='text-amber-200 text-center'>{showFact}</p>
                  </motion.div>
                )}

                <div className='w-full max-w-2xl'>
                  <h3 className='text-white text-lg font-bold mb-4 text-center'>
                    What can you find in {currentEra.name}?
                  </h3>
                  <div className='grid grid-cols-3 md:grid-cols-5 gap-3'>
                    {availableItems.map((item) => {
                      const isFound = state.foundItems.includes(item.id);
                      return (
                        <motion.button
                          key={item.id}
                          whileHover={!isFound ? { scale: 1.1 } : {}}
                          whileTap={!isFound ? { scale: 0.9 } : {}}
                          onClick={() => handleItemClick(item.id)}
                          disabled={isFound}
                          className={`p-4 rounded-xl text-center transition-all ${
                            isFound
                              ? 'bg-green-500/30 opacity-50'
                              : 'bg-white/10 hover:bg-white/30'
                          }`}
                        >
                          <div className='text-4xl'>
                            {isFound ? '✅' : item.emoji}
                          </div>
                          <div className='text-xs text-white mt-1'>
                            {item.name}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div className='text-white/60 text-sm mt-4'>
                  Found: {state.foundItems.length} /{' '}
                  {currentChallenge.itemsToFind.length}
                </div>
              </motion.div>
            )}

            {(state.status === 'success' || state.status === 'failure') && (
              <motion.div
                key='result'
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className='flex flex-col items-center gap-6 text-center'
              >
                <div className='text-8xl'>
                  {state.status === 'success' ? '🎉' : '⏰'}
                </div>
                <h2 className='text-4xl font-bold text-white'>
                  {state.status === 'success' ? 'Time Master!' : 'Time Up!'}
                </h2>

                <div className='bg-white/10 rounded-2xl p-6 max-w-md'>
                  <div className='text-6xl mb-4'>
                    {'⭐'.repeat(calculateStars(state.score))}
                  </div>
                  <div className='text-2xl text-white mb-2'>
                    Score: {state.score}
                  </div>
                  <div className='text-blue-200'>
                    You discovered {state.foundItems.length} items from history!
                  </div>
                </div>

                {state.discoveredFacts.length > 0 && (
                  <div className='bg-purple-500/20 rounded-xl p-4 max-w-lg'>
                    <h3 className='text-purple-200 font-bold mb-2'>
                      Facts You Learned:
                    </h3>
                    <ul className='text-sm text-purple-100 text-left space-y-1'>
                      {state.discoveredFacts.slice(0, 3).map((fact) => (
                        <li key={fact.substring(0, 20)}>• {fact}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className='flex gap-4'>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBackToMenu}
                    className='bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-xl font-bold'
                  >
                    Back to Menu
                  </motion.button>
                  {currentChallenge && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStartChallenge(currentChallenge.id)}
                      className='bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-bold'
                    >
                      Play Again
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GameContainer>
    </GameShell>
  );
}

export const EarthTimeMachine = memo(function EarthTimeMachine() {
  return (
    <GlobalErrorBoundary>
      <EarthTimeMachineContent />
    </GlobalErrorBoundary>
  );
});
