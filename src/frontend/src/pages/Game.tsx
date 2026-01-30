import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { getLettersForGame } from '../data/alphabets';
import {
  useSettingsStore,
  useAuthStore,
  useProgressStore,
  useProfileStore,
  BATCH_SIZE,
} from '../store';
import { Mascot } from '../components/Mascot';
import { progressQueue } from '../services/progressQueue';
import { getRandomIcon } from '../utils/iconUtils';
import { UIIcon } from '../components/ui/Icon';
import { GameTutorial } from '../components/GameTutorial';

// Available languages for the game
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
] as const;

export function Game() {
  const location = useLocation();
  const navigate = useNavigate();
  const settings = useSettingsStore();
  useAuthStore();
  useProgressStore();

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, _setScore] = useState(0);
  const [streak, _setStreak] = useState<number>(0);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Model & drawing state (was missing after recent edits)
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPinching, setIsPinching] = useState(false);

  // Camera permission state
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [showPermissionWarning, setShowPermissionWarning] = useState(false);

  // Basic game controls and stubs
  const startGame = async () => {
    setIsModelLoading(false);
    
    // Check camera permission before starting
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
      setShowPermissionWarning(false);
      setIsPlaying(true);
    } catch {
      setCameraPermission('denied');
      setShowPermissionWarning(true);
      // Don't start the game if permission denied
    }
  };

  const stopGame = () => {
    setIsPlaying(false);
    setIsDrawing(false);
    setIsPinching(false);
    // Don't hide permission warning - user needs to know if they want to restart
  };

  const clearDrawing = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const checkProgress = async () => {
    // placeholder for progress checking logic
  };

  const nextLetter = () => {
    setCurrentLetterIndex((i) => Math.min(i + 1, LETTERS.length - 1));
  };

  const goToHome = () => {
    stopGame();
    navigate('/dashboard');
  };

  const handleTutorialComplete = () => {
    setTutorialCompleted(true);
    localStorage.setItem('tutorialCompleted', 'true');
  };

  const handleSkipTutorial = () => {
    setTutorialCompleted(true);
    localStorage.setItem('tutorialCompleted', 'true');
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };
  // Mark as used for now (can be removed if feature not needed)
  void toggleHighContrast;

  useEffect(() => {
    const hasCompletedTutorial = localStorage.getItem('tutorialCompleted') === 'true';
    setTutorialCompleted(hasCompletedTutorial);

    // Fetch profiles to ensure we have the latest data
    useProfileStore.getState().fetchProfiles();

    // Check camera permission on mount
    const checkCameraPermission = async () => {
      try {
        // Try using the Permissions API first
        const result = await navigator.permissions.query({
          name: 'camera' as PermissionName,
        });
        setCameraPermission(result.state as 'granted' | 'denied' | 'prompt');
        setShowPermissionWarning(result.state === 'denied');

        // Listen for permission changes
        result.addEventListener('change', () => {
          setCameraPermission(result.state as 'granted' | 'denied' | 'prompt');
          setShowPermissionWarning(result.state === 'denied');
        });
      } catch {
        // Fallback: try to get user media to check permission
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            stream.getTracks().forEach((track) => track.stop());
            setCameraPermission('granted');
            setShowPermissionWarning(false);
          })
          .catch(() => {
            setCameraPermission('denied');
            setShowPermissionWarning(true);
          });
      }
    };

    checkCameraPermission();
  }, []);

  // Get profile ID from route state (passed from Dashboard)
  const profileId = (location.state as any)?.profileId as string | undefined;

  // Redirect to dashboard if no profile selected
  if (!profileId) {
    return <Navigate to='/dashboard' replace />;
  }

  // Get profile to determine preferred language
  const { profiles } = useProfileStore();
  const profile = profiles.find(p => p.id === profileId);

  // Use profile's preferred language as default, fallback to settings, then to 'en'
  const defaultLanguage = profile?.preferred_language || settings.gameLanguage || 'en';

  // Language selection - user can switch anytime
  const [selectedLanguage, setSelectedLanguage] = useState<string>(defaultLanguage);

  const LETTERS = getLettersForGame(selectedLanguage);
  const [currentLetterIndex, setCurrentLetterIndex] = useState<number>(0);
  const currentLetter = LETTERS[currentLetterIndex] ?? LETTERS[0];
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [accuracy, _setAccuracy] = useState<number>(0);
  const [feedback, _setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setPendingCount(progressQueue.getPending(profileId || '').length);
    update();
    const unsubscribe = progressQueue.subscribe(update);
    return unsubscribe;
  }, [profileId]);

  return (
    <>
      {!tutorialCompleted && (
        <GameTutorial onComplete={handleTutorialComplete} onSkip={handleSkipTutorial} />
      )}
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className='flex justify-between items-center mb-6'>
            <div>
              <h1 className='text-3xl font-bold'>Learning Game</h1>
              <p className='text-white/60'>Trace letters with your finger!</p>
            </div>
          <div className='text-right'>
            <div className='text-2xl font-bold'>Score: {score}</div>
            <div className='flex items-center gap-4 text-sm text-white/60'>
              <span className="flex items-center gap-1">
                <UIIcon name="flame" size={16} className="text-orange-400" />
                Streak: {streak}
              </span>
              <span>
                Batch {Math.floor(currentLetterIndex / BATCH_SIZE) + 1} of{' '}
                {Math.ceil(LETTERS.length / BATCH_SIZE)}
              </span>
              {pendingCount > 0 && (
                <div className='ml-2 inline-flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-semibold'>
                  <UIIcon name="warning" size={14} />
                  Pending ({pendingCount})
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Letter Display */}
        <div className='bg-white/10 border border-border rounded-xl p-6 mb-6 shadow-sm'>
          <div className='flex items-center justify-center gap-8'>
            <div className='text-center'>
              <div
                className='text-8xl font-bold'
                style={{ color: currentLetter.color }}
              >
                {currentLetter.char}
              </div>
              {currentLetter.transliteration && (
                <div className='text-lg text-white/60 mt-2'>
                  {currentLetter.transliteration}
                </div>
              )}
            </div>
            <div className='w-20 h-20'>
              <img
                src={getRandomIcon(currentLetter)}
                alt={currentLetter.name}
                className='w-full h-full object-contain'
              />
            </div>
            <div className='text-center'>
              <div className='text-2xl'>{currentLetter.name}</div>
              {currentLetter.pronunciation && (
                <div className='text-sm text-white/60 mt-1'>
                  "{currentLetter.pronunciation}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Accuracy Bar */}
        {accuracy > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-white/10 border border-border rounded-xl p-4 mb-6 shadow-sm'
          >
            <div className='flex justify-between items-center mb-2'>
              <span className='text-white/80'>Tracing Accuracy</span>
              <span
                className='font-bold'
                style={{
                  color:
                    accuracy >= 70
                      ? '#10b981'
                      : accuracy >= 40
                        ? '#f59e0b'
                        : '#ef4444',
                }}
              >
                {accuracy}%
              </span>
            </div>
            <div className='h-3 bg-white/10 rounded-full overflow-hidden'>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${accuracy}%` }}
                transition={{ duration: 0.5 }}
                className='h-full rounded-full'
                style={{
                  backgroundColor:
                    accuracy >= 70
                      ? '#10b981'
                      : accuracy >= 40
                        ? '#f59e0b'
                        : '#ef4444',
                }}
              />
            </div>
          </motion.div>
        )}

        {/* Feedback */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl p-4 mb-6 text-center font-semibold ${
              feedback?.includes('Great')
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : feedback?.includes('Good')
                  ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400'
                  : 'bg-red-500/20 border border-red-500/30 text-red-400'
            }`}
          >
            {feedback}
          </motion.div>
        )}

        {/* Game Area */}
        <div className='relative'>
          {/* Permission Warning */}
          {showPermissionWarning && (
            <div className='bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-4 text-center'>
              <div className='flex items-center justify-center gap-2 text-red-400 font-semibold'>
                <UIIcon name="warning" size={20} />
                <span>Camera permission denied</span>
              </div>
              <p className='text-red-300/80 text-sm mt-1'>
                Please allow camera access in your browser settings to play.
              </p>
            </div>
          )}

          {!isPlaying ? (
            <div className='bg-white/10 border border-border rounded-xl p-12 text-center relative overflow-hidden shadow-sm'>
              {/* Mascot Preview */}
              <div className='absolute -bottom-4 -left-4 opacity-50 pointer-events-none'>
                <Mascot state='idle' />
              </div>

              <div className='w-24 h-24 mx-auto mb-4'>
                <img 
                  src="/assets/images/onboarding-hand.svg" 
                  alt="Hand tracking"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className='text-2xl font-semibold mb-4'>Ready to Learn?</h2>
              <p className='text-white/70 mb-4 max-w-md mx-auto'>
                Use your hand to trace letters! The camera will track your
                finger movements.
              </p>
              {/* Language Selector */}
              <div className='mb-6'>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  Choose Alphabet
                </label>
                <div className='flex flex-wrap justify-center gap-2'>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedLanguage === lang.code
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                      }`}
                    >
                      <span className='mr-2'>{lang.flag}</span>
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className='text-sm text-white/50 mb-8'>
                Difficulty:{' '}
                <span className='text-white/80 capitalize'>
                  {settings.difficulty}
                </span>
              </div>
              <div className='flex justify-center gap-4'>
                <button
                  onClick={goToHome}
                  className='px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold transition shadow-lg flex items-center gap-2'
                >
                  <UIIcon name="home" size={20} />
                  Home
                </button>
                {isModelLoading ? (
                  <div className='text-white/60 px-6 py-3'>
                    Loading hand tracking...
                  </div>
                ) : cameraPermission === 'denied' ? (
                  <button
                    disabled
                    className='px-8 py-3 bg-gray-500/50 rounded-lg font-semibold cursor-not-allowed text-white/60'
                  >
                    Camera Required
                  </button>
                ) : (
                  <button
                    onClick={startGame}
                    className='px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/30 transition shadow-red-900/20'
                  >
                    Start Game
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className='space-y-4'>
              <div className='relative bg-black rounded-xl overflow-hidden aspect-video shadow-2xl border-4 border-orange-400/30'>
                {/* Webcam video */}
                <Webcam
                  ref={webcamRef}
                  className={`absolute inset-0 w-full h-full object-cover ${highContrast ? 'opacity-70' : ''}`}
                  mirrored
                  videoConstraints={{ width: 640, height: 480 }}
                  onUserMedia={() => {
                    // Camera successfully started
                    setCameraPermission('granted');
                    setShowPermissionWarning(false);
                  }}
                  onUserMediaError={(err) => {
                    // Camera failed to start
                    console.error('[Game] Camera error:', err);
                    setCameraPermission('denied');
                    setShowPermissionWarning(true);
                    setIsPlaying(false);
                  }}
                />
                {/* Canvas overlay for tracing */}
                <canvas
                  ref={canvasRef}
                  className='absolute inset-0 w-full h-full'
                />

                {/* Controls overlay */}
                <div className='absolute top-4 left-4 flex gap-2'>
                  <div className='bg-black/50 backdrop-blur px-3 py-1 rounded-full text-sm font-bold border border-border flex items-center gap-1'>
                    <UIIcon name="target" size={14} />
                    Trace: {currentLetter.char}
                  </div>
                  <div className='bg-blue-500/50 backdrop-blur px-3 py-1 rounded-full text-sm font-bold border border-border'>
                    {LANGUAGES.find((l) => l.code === selectedLanguage)?.flag}{' '}
                    {LANGUAGES.find((l) => l.code === selectedLanguage)?.name}
                  </div>
                  {streak > 2 && (
                    <div className='bg-orange-500/90 text-white backdrop-blur px-3 py-1 rounded-full text-sm font-bold animate-pulse shadow-lg shadow-orange-500/20'>
                      🔥 {streak} streak!
                    </div>
                  )}
                </div>

                <div className='absolute top-4 right-4 flex gap-2'>
                  {isPlaying && (
                    <div className='bg-green-500/90 backdrop-blur px-3 py-1 rounded-full animate-pulse shadow-lg shadow-green-500/20 border border-green-400 flex items-center gap-1'>
                      <UIIcon name="camera" size={16} className="text-green-400" />
                      <div className='flex items-center gap-1'>
                        <div className='w-2 h-2 bg-red-500 rounded-full animate-ping' />
                        <span className='text-sm font-bold text-white'>Camera Active</span>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={goToHome}
                    className='px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold transition shadow-lg flex items-center gap-2'
                  >
                    <UIIcon name="home" size={20} />
                    Home
                  </button>
                  <button
                    onClick={goToHome}
                    className='px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 rounded-lg transition text-sm font-semibold shadow-lg flex items-center gap-2'
                  >
                    <UIIcon name="home" size={16} />
                    Home
                  </button>
                  <button
                    onClick={() => setIsDrawing(!isDrawing)}
                    className={`px-4 py-2 rounded-lg transition text-sm font-bold shadow-lg ${
                      isDrawing
                        ? 'bg-red-500 hover:bg-red-600 text-white border-b-4 border-red-700 active:border-b-0 active:translate-y-1'
                        : 'bg-green-500 hover:bg-green-600 text-white border-b-4 border-green-700 active:border-b-0 active:translate-y-1'
                    }`}
                  >
                    {isPinching
                      ? 'Pinching...'
                      : isDrawing
                        ? (
                          <>
                            <UIIcon name="hand" size={16} />
                            Stop Drawing
                          </>
                        )
                        : (
                          <>
                            <UIIcon name="pencil" size={16} />
                            Start Drawing
                          </>
                        )}
                  </button>
                  <button
                    onClick={clearDrawing}
                    className='px-4 py-2 bg-white/10 border border-border rounded-lg hover:bg-white/20 transition text-sm font-semibold backdrop-blur'
                  >
                    Clear
                  </button>
                  <button
                    onClick={stopGame}
                    className='px-4 py-2 bg-white/10 border border-border rounded-lg hover:bg-white/20 transition text-sm font-semibold backdrop-blur'
                  >
                    Stop
                  </button>
                </div>

                {/* In-Game Mascot */}
                <div className='absolute bottom-0 left-4 z-20'>
                  {(() => {
                    const mascotState =
                      (feedback?.includes('Great') || feedback?.includes('Amazing'))
                        ? 'happy'
                        : isDrawing
                          ? 'waiting'
                          : 'idle';
                    console.log(
                      '[Game] Mascot state:',
                      mascotState,
                      'Feedback:',
                      feedback,
                    );
                    return (
                      <Mascot
                        state={mascotState}
                        message={
                          feedback ||
                          (isDrawing ? 'Keep going!' : 'Trace the letter!')
                        }
                      />
                    );
                  })()}
                </div>
              </div>

              {/* Action buttons */}
              <div className='flex justify-center gap-4'>
                <button
                  onClick={checkProgress}
                  className='px-8 py-4 bg-gradient-to-b from-green-400 to-green-600 rounded-xl font-bold text-lg text-white shadow-xl hover:scale-105 transition border-b-4 border-green-800 active:border-b-0 active:translate-y-1'
                >
                  ✅ Check My Tracing
                </button>
                <button
                  onClick={nextLetter}
                  className='px-8 py-4 bg-gradient-to-b from-blue-400 to-blue-600 rounded-xl font-bold text-lg text-white shadow-xl hover:scale-105 transition border-b-4 border-blue-800 active:border-b-0 active:translate-y-1'
                >
                  Skip →
                </button>
              </div>

              <p className='text-center text-white/60 text-sm font-medium'>
                Hold your hand up and pinch thumb + index finger to draw! Or
                click the button.
                {settings.showHints &&
                  ' The faint letter shows where to trace.'}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  </>
  );
}
