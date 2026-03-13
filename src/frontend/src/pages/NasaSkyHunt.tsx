/**
 * NASA Sky Hunt Game
 *
 * Space exploration and constellation finding for ages 6-12
 * @ticket NASA-SKY-HUNT
 */

import { memo, useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { AccessDenied } from '../components/ui/AccessDenied';
import { useSubscription } from '../hooks/useSubscription';
import { useAutoGameCompletion } from '../hooks/useAutoGameCompletion';
import { GlobalErrorBoundary } from '../components/errors/GlobalErrorBoundary';
import {
  createInitialState,
  startChallenge,
  findObjectAtPosition,
  markObjectFound,
  updateTimer,
  submitChallenge,
  getHint,
  getObjectById,
  getChallengeProgress,
  calculateFinalScore,
  CELESTIAL_OBJECTS,
  CHALLENGES,
  type GameState,
} from '../games/nasaSkyHuntLogic';
import { useAudio } from '../utils/hooks/useAudio';
import { useTTS } from '../hooks/useTTS';

// NASA APOD API Types
interface ApodData {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: string;
  date: string;
}

interface CachedApod {
  data: ApodData;
  timestamp: number;
}

const APOD_CACHE_KEY = 'nasa_apod_cache';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const APOD_API_URL = 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY';

// Fetch NASA APOD with caching
async function fetchApodWithCache(): Promise<ApodData | null> {
  try {
    // Check localStorage cache first
    const cached = localStorage.getItem(APOD_CACHE_KEY);
    if (cached) {
      const parsed: CachedApod = JSON.parse(cached);
      const now = Date.now();
      if (now - parsed.timestamp < CACHE_DURATION_MS) {
        return parsed.data;
      }
    }

    // Fetch fresh data
    const response = await fetch(APOD_API_URL);
    if (!response.ok) {
      throw new Error(`APOD API error: ${response.status}`);
    }

    const data: ApodData = await response.json();

    // Only cache if it's an image (not video)
    if (data.media_type === 'image') {
      const cacheEntry: CachedApod = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(APOD_CACHE_KEY, JSON.stringify(cacheEntry));
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch APOD:', error);
    return null;
  }
}

export const NasaSkyHuntContent = memo(function NasaSkyHuntComponent() {
  const navigate = useNavigate();
  const { canAccessGame, isLoading: subLoading } = useSubscription();
  const hasAccess = canAccessGame('nasa-sky-hunt');
  const { playClick, playSuccess, playError, playPop } = useAudio();
  const { speak } = useTTS();

  const [state, setState] = useState<GameState>(createInitialState());
  const [feedback, setFeedback] = useState<string | null>(null);
  const { resetAutoCompletion } = useAutoGameCompletion('nasa-sky-hunt', {
    when: state.status === 'success',
    score: calculateFinalScore(state).totalScore,
    level: CHALLENGES.findIndex((c) => c.id === state.currentChallengeId) + 1,
    metadata: {
      challengeId: state.currentChallengeId,
      foundObjects: state.foundObjects.length,
    },
  });

  // APOD state
  const [apodData, setApodData] = useState<ApodData | null>(null);
  const [apodLoading, setApodLoading] = useState(true);
  const [apodError, setApodError] = useState(false);

  // Fetch APOD on mount
  useEffect(() => {
    let cancelled = false;

    async function loadApod() {
      setApodLoading(true);
      setApodError(false);

      const data = await fetchApodWithCache();

      if (!cancelled) {
        if (data && data.media_type === 'image') {
          setApodData(data);
        } else {
          setApodError(true);
        }
        setApodLoading(false);
      }
    }

    void loadApod();

    return () => {
      cancelled = true;
    };
  }, []);

  // Timer
  useEffect(() => {
    if (state.status !== 'playing' || state.timeLeft <= 0) return;
    const timer = setInterval(() => {
      setState((prev) => updateTimer(prev));
    }, 1000);
    return () => clearInterval(timer);
  }, [state.status, state.timeLeft]);

  // Clear feedback after delay
  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const handleStartChallenge = useCallback(
    (challengeId: string) => {
      playClick();
      resetAutoCompletion();
      setState(startChallenge(createInitialState(), challengeId));
      setFeedback(null);
      const challenge = CHALLENGES.find((c) => c.id === challengeId);
      if (challenge) {
        void speak(challenge.description);
      }
    },
    [playClick, speak, resetAutoCompletion],
  );

  const handleSkyClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (state.status !== 'playing') return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const result = findObjectAtPosition(state, x, y);

      if (result.success && result.object) {
        playSuccess();
        setState((prev) => markObjectFound(prev, result.object!.id));
        setFeedback(result.feedback);
        void speak(`Found ${result.object.name}!`);
      } else if (result.object) {
        // Already found
        playPop();
        setFeedback(result.feedback);
      } else {
        playError();
        setFeedback(result.feedback);
      }
    },
    [state, playSuccess, playError, playPop, speak],
  );

  const handleSubmit = useCallback(() => {
    setState((prev) => {
      const newState = submitChallenge(prev);
      if (newState.status === 'success') {
        playSuccess();
        void speak('Challenge completed! Amazing space exploration!');
      } else {
        playError();
        setFeedback('Not all objects found yet. Keep exploring!');
      }
      return newState;
    });
  }, [playSuccess, playError, speak]);

  const handleShowHint = useCallback(() => {
    playClick();
    const hint = getHint(state);
    setFeedback(hint);
    void speak(hint);
  }, [state, playClick, speak]);

  // Loading state
  if (subLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500'></div>
      </div>
    );
  }

  // Access denied
  if (!hasAccess) {
    return <AccessDenied gameName='NASA Sky Hunt' gameId='nasa-sky-hunt' />;
  }

  // Menu state
  if (state.status === 'menu') {
    return (
      <GameContainer title='NASA Sky Hunt' onHome={() => navigate('/games')}>
        <div className='max-w-4xl mx-auto p-6'>
          <div className='text-center mb-8'>
            <h2 className='text-3xl font-bold text-indigo-700 mb-4'>
              🚀 NASA Sky Hunt 🌟
            </h2>
            <p className='text-gray-600 text-lg'>
              Explore the night sky! Find stars, planets, and galaxies while learning amazing space facts.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {CHALLENGES.map((challenge) => (
              <motion.button
                key={challenge.id}
                onClick={() => handleStartChallenge(challenge.id)}
                className='p-6 bg-white rounded-xl shadow-md hover:shadow-lg border-2 border-indigo-100 hover:border-indigo-300 text-left transition-all'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className='text-xl font-bold text-indigo-700 mb-2'>{challenge.name}</h3>
                <p className='text-gray-600 text-sm mb-3'>{challenge.description}</p>
                <div className='flex items-center gap-2 text-sm text-indigo-600'>
                  <span>⏱️ {challenge.timeLimit}s</span>
                  <span>•</span>
                  <span>🎯 {challenge.targetObjects.length} objects</span>
                </div>
              </motion.button>
            ))}
          </div>

          <div className='mt-8 p-4 bg-indigo-50 rounded-xl'>
            <h3 className='font-bold text-indigo-700 mb-2'>🔭 What You Will Find:</h3>
            <div className='grid grid-cols-2 md:grid-cols-5 gap-2'>
              {CELESTIAL_OBJECTS.map((obj) => (
                <div key={obj.id} className='flex items-center gap-2 text-sm text-indigo-600'>
                  <span>{obj.emoji}</span>
                  <span>{obj.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GameContainer>
    );
  }

  // Success state
  if (state.status === 'success') {
    const finalScore = calculateFinalScore(state);
    return (
      <GameContainer title='NASA Sky Hunt' onHome={() => navigate('/games')}>
        <div className='flex flex-col items-center justify-center min-h-[60vh] p-6'>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className='text-6xl mb-4'
          >
            🌌
          </motion.div>
          <h2 className='text-3xl font-bold text-green-600 mb-4'>Mission Complete!</h2>
          <p className='text-xl text-gray-700 mb-2'>Score: {finalScore.totalScore}</p>
          <p className='text-gray-600 mb-2'>Objects Found: {finalScore.objectsFound}</p>
          <p className='text-gray-600 mb-4'>Facts Learned: {finalScore.factsLearned}</p>
          <div className='flex gap-4'>
            <button
              onClick={() => { resetAutoCompletion(); setState(createInitialState()); }}
              className='px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors'
            >
              Back to Menu
            </button>
          </div>
        </div>
      </GameContainer>
    );
  }

  // Failure state
  if (state.status === 'failure') {
    return (
      <GameContainer title='NASA Sky Hunt' onHome={() => navigate('/games')}>
        <div className='flex flex-col items-center justify-center min-h-[60vh] p-6'>
          <motion.div className='text-6xl mb-4'>⏰</motion.div>
          <h2 className='text-3xl font-bold text-amber-600 mb-4'>Time Up!</h2>
          <p className='text-gray-600 mb-4'>Don't worry, space exploration takes practice!</p>
          <div className='flex gap-4'>
            <button
              onClick={() => { resetAutoCompletion(); setState(createInitialState()); }}
              className='px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors'
            >
              Back to Menu
            </button>
            <button
              onClick={() => handleStartChallenge(state.currentChallengeId || 'easy-hunt')}
              className='px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors'
            >
              Try Again
            </button>
          </div>
        </div>
      </GameContainer>
    );
  }

  const currentChallenge = CHALLENGES.find((c) => c.id === state.currentChallengeId);
  const progress = getChallengeProgress(state);

  // Build sky background style
  const skyBackgroundStyle: React.CSSProperties = apodData
    ? {
        backgroundImage: `linear-gradient(to bottom, rgba(23, 23, 56, 0.7), rgba(49, 27, 87, 0.8)), url(${apodData.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {};

  return (
    <GameContainer
      title={`NASA Sky Hunt: ${currentChallenge?.name || ''}`}
      onHome={() => navigate('/games')}
      score={state.score}
    >
      <div className='flex flex-col lg:flex-row gap-4 p-4'>
        {/* Info Panel */}
        <div className='lg:w-64 bg-white rounded-xl shadow-md p-4'>
          <h3 className='font-bold text-indigo-700 mb-4'>Mission Status</h3>

          {/* APOD Info */}
          {apodLoading ? (
            <div className='mb-4 p-3 bg-indigo-50 rounded-lg'>
              <div className='flex items-center gap-2 text-sm text-indigo-600'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500'></div>
                <span>Loading NASA image...</span>
              </div>
            </div>
          ) : apodData ? (
            <div className='mb-4 p-3 bg-indigo-50 rounded-lg'>
              <h4 className='text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1'>
                🌌 Image of the Day
              </h4>
              <p className='text-sm font-medium text-indigo-800 leading-tight'>
                {apodData.title}
              </p>
              <p className='text-xs text-indigo-600 mt-1 line-clamp-3'>
                {apodData.explanation}
              </p>
              <p className='text-xs text-indigo-400 mt-1'>{apodData.date}</p>
            </div>
          ) : apodError ? (
            <div className='mb-4 p-3 bg-gray-100 rounded-lg'>
              <p className='text-xs text-gray-500'>
                NASA image unavailable. Using default starfield.
              </p>
            </div>
          ) : null}

          {/* Timer */}
          <div className='mb-4'>
            <div className='flex justify-between text-sm text-gray-600 mb-1'>
              <span>Time Remaining</span>
              <span className={state.timeLeft < 10 ? 'text-red-500 font-bold' : ''}>
                {state.timeLeft}s
              </span>
            </div>
            <div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
              <div
                className={`h-full rounded-full transition-all ${
                  state.timeLeft < 10 ? 'bg-red-500' : 'bg-indigo-500'
                }`}
                style={{
                  width: `${(state.timeLeft / (currentChallenge?.timeLimit || 60)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Progress */}
          <div className='mb-4'>
            <div className='flex justify-between text-sm text-gray-600 mb-1'>
              <span>Progress</span>
              <span>{progress.found}/{progress.total}</span>
            </div>
            <div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
              <div
                className='h-full bg-green-500 rounded-full transition-all'
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          {/* Found Objects */}
          <div className='mb-4'>
            <h4 className='text-sm font-medium text-gray-700 mb-2'>Found Objects:</h4>
            <div className='flex flex-wrap gap-1'>
              {state.foundObjects.map((id) => {
                const obj = getObjectById(id);
                return obj ? (
                  <span
                    key={id}
                    className='px-2 py-1 bg-indigo-100 rounded-full text-xs'
                    title={obj.name}
                  >
                    {obj.emoji}
                  </span>
                ) : null;
              })}
            </div>
          </div>

          {/* Target Objects */}
          <div className='mb-4'>
            <h4 className='text-sm font-medium text-gray-700 mb-2'>Target Objects:</h4>
            <div className='flex flex-wrap gap-1'>
              {currentChallenge?.targetObjects.map((id) => {
                const obj = getObjectById(id);
                const isFound = state.foundObjects.includes(id);
                return obj ? (
                  <span
                    key={id}
                    className={`px-2 py-1 rounded-full text-xs ${
                      isFound ? 'bg-green-100' : 'bg-gray-100 opacity-50'
                    }`}
                    title={obj.name}
                  >
                    {obj.emoji} {isFound ? '✓' : '?'}
                  </span>
                ) : null;
              })}
            </div>
          </div>

          {/* Buttons */}
          <div className='space-y-2'>
            <button
              onClick={handleShowHint}
              className='w-full px-3 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm'
            >
              💡 Get Hint
            </button>
            <button
              onClick={handleSubmit}
              className='w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm'
            >
              ✓ Submit Discovery
            </button>
          </div>
        </div>

        {/* Sky View */}
        <div className='flex-1'>
          <div
            onClick={handleSkyClick}
            className={`relative rounded-xl overflow-hidden cursor-crosshair min-h-[500px] ${
              apodData ? '' : 'bg-gradient-to-b from-indigo-950 via-indigo-900 to-purple-950'
            }`}
            style={skyBackgroundStyle}
          >
            {/* Stars background (shown when APOD is loading or error) */}
            {!apodData && (
              <div className='absolute inset-0 opacity-50'>
                {Array.from({ length: 50 }).map((_, i) => (
                  <div
                    key={i}
                    className='absolute w-1 h-1 bg-white rounded-full animate-pulse'
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Celestial Objects */}
            {CELESTIAL_OBJECTS.map((obj) => {
              const isFound = state.foundObjects.includes(obj.id);
              const isTarget = currentChallenge?.targetObjects.includes(obj.id);

              return (
                <motion.button
                  key={obj.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSkyClick(e as any);
                  }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 text-3xl transition-all ${
                    isFound
                      ? 'opacity-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                      : isTarget
                        ? 'opacity-70 hover:opacity-100 cursor-pointer'
                        : 'opacity-30 hover:opacity-50'
                  }`}
                  style={{
                    left: `${obj.position.x}%`,
                    top: `${obj.position.y}%`,
                  }}
                  title={isFound ? `${obj.name} ✓` : obj.name}
                >
                  {obj.emoji}
                  {isFound && (
                    <span className='absolute -top-1 -right-1 text-green-400 text-lg'>✓</span>
                  )}
                </motion.button>
              );
            })}

            {/* Click instruction */}
            {state.foundObjects.length === 0 && (
              <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                <p className='text-white/70 text-lg bg-black/30 px-4 py-2 rounded-full'>
                  Click on celestial objects to find them!
                </p>
              </div>
            )}
          </div>

          {/* Feedback */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-xl text-center ${
                feedback.includes('Found') || feedback.includes('complete')
                  ? 'bg-green-100 text-green-700'
                  : feedback.includes('already')
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
              }`}
            >
              {feedback}
            </motion.div>
          )}
        </div>
      </div>
    </GameContainer>
  );
});

export const NasaSkyHunt = () => (
  <GlobalErrorBoundary>
    <GameShell gameId='nasa-sky-hunt' gameName='NASA Sky Hunt'>
      <NasaSkyHuntContent />
    </GameShell>
  </GlobalErrorBoundary>
);

export default NasaSkyHunt;
