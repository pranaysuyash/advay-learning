import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';

import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { GameContainer } from '../components/GameContainer';
import { GameControls } from '../components/GameControls';
import type { GameControl } from '../components/GameControls';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useHandClick } from '../hooks/useHandClick';
import { AttentionMeter } from '../components/game/AttentionMeter';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import { useAudio } from '../utils/hooks/useAudio';
import { useTTS } from '../hooks/useTTS';
import { VoiceInstructions } from '../components/game/VoiceInstructions';
import {
  assetLoader,
  SOUND_ASSETS,
  WEATHER_BACKGROUNDS,
} from '../utils/assets';
import {
  LEVELS,
  getTemplatesForLevel,
  mirrorPoint,
  calculateMatchScore,
  type MirrorTemplate,
  type MatchScore,
} from '../games/mirrorDrawLogic';
import type { Point } from '../types/tracking';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

const MAX_LEVEL = 4;
const TEMPLATES_TO_PASS = 3; // pass 3/5 to unlock next level

export const MirrorDraw = memo(function MirrorDrawComponent() {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const levelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const isSubmittingRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [templateIndex, setTemplateIndex] = useState(0);
  const [template, setTemplate] = useState<MirrorTemplate | null>(null);
  const [userPoints, setUserPoints] = useState<Point[]>([]);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [feedback, setFeedback] = useState('Trace the other half!');
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastScore, setLastScore] = useState<MatchScore | null>(null);
  const [passedCount, setPassedCount] = useState(0);

  const userPointsRef = useRef<Point[]>([]);
  const isDrawingRef = useRef(false);
  const templateRef = useRef<MirrorTemplate | null>(null);

  const { playPop, playError, playCelebration, playClick } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { onGameComplete, triggerEasterEgg } = useGameDrops('mirror-draw');

  useEffect(() => {
    let mounted = true;

    async function preloadAssets() {
      try {
        await assetLoader.loadImages([WEATHER_BACKGROUNDS.windy]);
        await assetLoader.loadSounds(Object.values(SOUND_ASSETS));

        if (!mounted) return;
        backgroundImageRef.current = assetLoader.getImage(
          WEATHER_BACKGROUNDS.windy.id,
        );
      } catch (error) {
        console.error('Failed to preload MirrorDraw assets', error);
      }
    }

    void preloadAssets();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => { userPointsRef.current = userPoints; }, [userPoints]);
  useEffect(() => { isDrawingRef.current = isDrawing; }, [isDrawing]);
  useEffect(() => { templateRef.current = template; }, [template]);

  const loadTemplate = useCallback((lvl: number, idx: number) => {
    const templates = getTemplatesForLevel(lvl);
    if (idx < templates.length) {
      setTemplate(templates[idx]);
      setUserPoints([]);
      setLastScore(null);
      setFeedback(`Trace the ${templates[idx].name}! ${templates[idx].emoji}`);
    }
  }, []);

  useEffect(() => {
    if (isPlaying && !gameCompleted) {
      loadTemplate(level, templateIndex);
    }
  }, [isPlaying, level, templateIndex, gameCompleted, loadTemplate]);

  // Draw template & user strokes on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !template) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // V1 Bright Background
    ctx.fillStyle = '#FFF8F0';
    ctx.fillRect(0, 0, w, h);

    const backgroundImage = backgroundImageRef.current;
    if (backgroundImage?.src) {
      ctx.globalAlpha = 0.05; // Make the noise/pattern subtle
      ctx.drawImage(backgroundImage, 0, 0, w, h);
      ctx.globalAlpha = 1;
    }

    // Center line - V1 thick dashed line
    ctx.beginPath();
    ctx.setLineDash([12, 12]);
    ctx.strokeStyle = '#CBD5E1'; // slate-300
    ctx.lineWidth = 4;
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw template (left half) — solid vibrant guide
    if (template.points.length > 1) {
      ctx.beginPath();
      ctx.moveTo(template.points[0].x * w, template.points[0].y * h);
      for (let i = 1; i < template.points.length; i++) {
        ctx.lineTo(template.points[i].x * w, template.points[i].y * h);
      }
      ctx.strokeStyle = '#3B82F6'; // Vibrancy!
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Ghost guide on right side (faint mirror)
      ctx.beginPath();
      const mirrored = template.points.map(mirrorPoint);
      ctx.moveTo(mirrored[0].x * w, mirrored[0].y * h);
      for (let i = 1; i < mirrored.length; i++) {
        ctx.lineTo(mirrored[i].x * w, mirrored[i].y * h);
      }
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)'; // Faint blue
      ctx.lineWidth = 6;
      ctx.setLineDash([8, 12]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw user strokes (right side)
    if (userPoints.length > 1) {
      ctx.beginPath();
      ctx.moveTo(userPoints[0].x * w, userPoints[0].y * h);
      for (let i = 1; i < userPoints.length; i++) {
        ctx.lineTo(userPoints[i].x * w, userPoints[i].y * h);
      }
      ctx.strokeStyle = '#10B981'; // Success Green
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // V1 Bubbly Cursor - Increased size for toddlers
    if (cursor) {
      ctx.beginPath();
      ctx.arc(cursor.x * w, cursor.y * h, isDrawing ? 24 : 18, 0, Math.PI * 2);
      ctx.fillStyle = isDrawing ? '#10B981' : '#E85D04';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.stroke();
      // Add emoji indicator
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isDrawing ? '✏️' : '👆', cursor.x * w, cursor.y * h);
    }
  }, [template, userPoints, cursor, isDrawing]);

  const submitDrawing = useCallback(() => {
    if (isSubmittingRef.current) return;

    const tmpl = templateRef.current;
    if (!tmpl || userPointsRef.current.length < 5) {
      setFeedback('Keep tracing! Draw more of the shape. ✨');
      return;
    }

    isSubmittingRef.current = true;

    const result = calculateMatchScore(userPointsRef.current, tmpl, level);
    setLastScore(result);

    if (result.passed) {
      const pts = 10 + result.stars * 5;
      setScore((prev) => prev + pts);
      setPassedCount((prev) => prev + 1);
      const feedbackMsg = `${result.stars === 3 ? 'Perfect!' : result.stars === 2 ? 'Great!' : 'Nice!'} ${tmpl.emoji} ${Math.round(result.accuracy * 100)}%`;
      setFeedback(feedbackMsg);
      if (ttsEnabled) {
        void speak(`${result.stars === 3 ? 'Perfect tracing' : result.stars === 2 ? 'Great job' : 'Nice work'}! You matched the ${tmpl.name}!`);
      }
      assetLoader.playSound('success', 0.45);
      void playPop();
      if (result.accuracy >= 0.95) {
        triggerEasterEgg('egg-perfect-symmetry');
      }
    } else {
      const tryAgainMsg = `Try again! ${Math.round(result.accuracy * 100)}% — you need ${Math.round(LEVELS[level - 1].passThreshold * 100)}%`;
      setFeedback(tryAgainMsg);
      if (ttsEnabled) {
        void speak('Keep trying! Trace the shape more carefully!');
      }
      assetLoader.playSound('wrong', 0.42);
      void playError();
    }

    // Advance after a short delay
    advanceTimeoutRef.current = setTimeout(() => {
      const templates = getTemplatesForLevel(level);
      if (templateIndex + 1 < templates.length) {
        setTemplateIndex((prev) => prev + 1);
        isSubmittingRef.current = false;
      } else {
        // Level complete
        if (passedCount + (result.passed ? 1 : 0) >= TEMPLATES_TO_PASS) {
          assetLoader.playSound('level-complete', 0.55);
          void playCelebration();
          setShowCelebration(true);
          if (ttsEnabled) {
            if (level >= MAX_LEVEL) {
              void speak('Amazing! You completed all the mirror drawings!');
            } else {
              void speak('Level complete! Great mirror drawing!');
            }
          }
          levelTimeoutRef.current = setTimeout(() => {
            setShowCelebration(false);
            if (level >= MAX_LEVEL) {
              onGameComplete();
              setGameCompleted(true);
              setIsPlaying(false);
            } else {
              setLevel((prev) => prev + 1);
              setTemplateIndex(0);
              setPassedCount(0);
            }
            isSubmittingRef.current = false;
          }, 2500);
        } else {
          setFeedback(`Need ${TEMPLATES_TO_PASS} passes to advance. Try the level again!`);
          setTemplateIndex(0);
          setPassedCount(0);
          isSubmittingRef.current = false;
        }
      }
    }, 1500);
  }, [level, templateIndex, passedCount, playCelebration, playPop, playError]);

  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
        advanceTimeoutRef.current = null;
      }
      if (levelTimeoutRef.current) {
        clearTimeout(levelTimeoutRef.current);
        levelTimeoutRef.current = null;
      }
      isSubmittingRef.current = false;
    };
  }, []);

  const handleFrame = useCallback(
    (frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
      const tip = frame.indexTip;
      if (!tip) {
        if (isDrawingRef.current) {
          setIsDrawing(false);
          // Finger lost — auto-submit if enough points
          if (userPointsRef.current.length >= 10) {
            submitDrawing();
          }
        }
        setCursor(null);
        return;
      }

      setCursor(tip);

      // Only draw on right half (x > 0.5)
      if (tip.x > 0.5) {
        if (frame.pinch.state.isPinching) {
          setIsDrawing(true);
          setUserPoints((prev) => [...prev, { x: tip.x, y: tip.y }]);
        } else if (isDrawingRef.current) {
          setIsDrawing(false);
          if (userPointsRef.current.length >= 10) {
            submitDrawing();
          }
        }
      } else {
        if (isDrawingRef.current) {
          setIsDrawing(false);
        }
      }
    },
    [submitDrawing],
  );

  const { isLoading: isModelLoading, isReady: isHandTrackingReady, startTracking, pinch } =
    useGameHandTracking({
      gameName: 'MirrorDraw',
      isRunning: isPlaying && !gameCompleted,
      webcamRef,
      targetFps: 24,
      onFrame: handleFrame,
      onNoVideoFrame: () => {
        setCursor(null);
        if (isDrawingRef.current) setIsDrawing(false);
      },
    });

  useHandClick(pinch?.isPinching ?? false, cursor, true);

  useEffect(() => {
    if (isPlaying && !gameCompleted && !isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  }, [gameCompleted, isHandTrackingReady, isModelLoading, isPlaying, startTracking]);

  const startGame = async () => {
    setGameCompleted(false);
    setScore(0);
    setLevel(1);
    setTemplateIndex(0);
    setPassedCount(0);
    setUserPoints([]);
    setLastScore(null);
    setFeedback("Let's go! Trace the other half! ✨");
    setCursor(null);
    setIsPlaying(true);
    isSubmittingRef.current = false;
    assetLoader.playSound('pop', 0.35);
    playClick();

    if (!isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  };

  const resetGame = () => {
    if (levelTimeoutRef.current) {
      clearTimeout(levelTimeoutRef.current);
      levelTimeoutRef.current = null;
    }
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
    isSubmittingRef.current = false;
    setIsPlaying(false);
    setGameCompleted(false);
    setTemplate(null);
    setUserPoints([]);
    setCursor(null);
    setFeedback('Trace the other half!');
  };

  const goHome = () => {
    resetGame();
    navigate('/dashboard');
  };

  const controls: GameControl[] = [
    {
      id: 'start',
      icon: (isPlaying ? 'rotate-ccw' : 'play') as any,
      label: isPlaying ? 'Restart' : 'Start',
      onClick: startGame,
      variant: isPlaying ? 'secondary' : 'success',
    },
    {
      id: 'clear',
      icon: 'rotate-ccw' as any,
      label: 'Clear',
      onClick: () => {
        setUserPoints([]);
        setLastScore(null);
        isSubmittingRef.current = false;
        assetLoader.playSound('pop', 0.24);
      },
      variant: 'secondary',
      disabled: !isPlaying || userPoints.length === 0,
    },
    {
      id: 'submit',
      icon: 'check' as any,
      label: 'Done',
      onClick: submitDrawing,
      variant: 'primary',
      disabled: !isPlaying || userPoints.length < 5,
    },
    {
      id: 'home',
      icon: 'home' as any,
      label: 'Home',
      onClick: goHome,
      variant: 'primary',
    },
  ];

  return (
    <GameContainer
      title='Mirror Draw'
      score={score}
      level={level}
      onHome={goHome}
      isHandDetected={isHandTrackingReady}
      isPlaying={isPlaying}
    >
      <div className='absolute inset-0 bg-[#FFF8F0]'>
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored
          className='absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay'
          videoConstraints={{ facingMode: 'user' }}
        />

        <AttentionMeter webcamRef={webcamRef} className="bottom-6 left-6" />

        <canvas
          ref={canvasRef}
          className='absolute inset-0 w-full h-full'
          width={800}
          height={600}
        />

        {/* V1 Bubbly Floating Overlays */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className='absolute top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl bg-white border-3 border-[#F2CC8F] text-advay-slate font-bold tracking-wide text-lg text-center max-w-[90%] shadow-[0_4px_0_#E5B86E] z-10'
          >
            {feedback}
          </motion.div>
        </AnimatePresence>

        {template && (
          <div className='absolute top-6 left-6 px-6 py-3 rounded-2xl bg-white border-3 border-[#F2CC8F] text-advay-slate font-bold text-lg shadow-[0_4px_0_#E5B86E] z-10'>
            {template.emoji} {template.name}
            <span className='text-sm text-slate-400 font-black ml-3 bg-slate-100 px-3 py-1 rounded-lg'>
              {templateIndex + 1}/{getTemplatesForLevel(level).length}
            </span>
          </div>
        )}

        {lastScore && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`absolute top-6 right-6 px-6 py-3 rounded-2xl border-3 font-black text-xl shadow-[0_4px_0_#E5B86E] z-10 ${lastScore.passed ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'
              }`}
          >
            {'⭐'.repeat(lastScore.stars)}{'☆'.repeat(3 - lastScore.stars)}
            <span className='ml-3 tracking-widest'>{Math.round(lastScore.accuracy * 100)}%</span>
          </motion.div>
        )}

        {!isPlaying && !gameCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className='absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6 z-20'
          >
            <div className='w-24 h-24 drop-shadow-xl'><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="w-full h-full text-advay-slate"><path d="M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z"/><path d="M12 19a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/><path d="M15 12h.01"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg></div>
            <div className='bg-white p-8 rounded-[2.5rem] border-3 border-[#F2CC8F] shadow-xl max-w-lg text-center flex flex-col items-center relative'>
              <h2 className='text-4xl font-black text-advay-slate mb-4 tracking-tight'>Mirror Draw</h2>
              <p className='text-text-secondary font-bold text-lg mb-8 leading-relaxed'>
                See the shape on the left? Trace its mirror on the right side!
              </p>
              {ttsEnabled && (
                <VoiceInstructions
                  instructions={[
                    'Look at the shape on the left.',
                    'Trace its mirror on the right.',
                    'Pinch and draw with your finger!',
                  ]}
                  autoSpeak={true}
                  showReplayButton={true}
                  replayButtonPosition='bottom-right'
                />
              )}
              <button
                type='button'
                onClick={startGame}
                className='px-10 py-5 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-black rounded-2xl text-xl uppercase tracking-wider border-3 border-[#000000] shadow-[0_6px_0_0_#000000] active:translate-y-[6px] active:shadow-none transition-all w-full leading-none'
              >
                Start Drawing!
              </button>
            </div>
          </motion.div>
        )}

        {gameCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className='absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6 z-20'
          >
            <div className='bg-white p-10 rounded-[2.5rem] border-3 border-[#F59E0B] shadow-xl max-w-lg text-center flex flex-col items-center'>
              <div className='w-16 h-16 mb-4'><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="w-full h-full text-[#F59E0B]"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg></div>
              <h2 className='text-4xl font-black text-advay-slate mb-2'>Symmetry Master!</h2>
              <p className='text-[#F59E0B] font-black text-2xl mb-8'>Final Score: {score}</p>
              <button
                type='button'
                onClick={goHome}
                className='px-10 py-5 bg-[#E85D04] hover:bg-[#ff6c14] text-white font-black rounded-2xl text-xl uppercase tracking-wider border-3 border-[#000000] shadow-[0_6px_0_0_#000000] active:translate-y-[6px] active:shadow-none transition-all w-full leading-none'
              >
                Return Home
              </button>
            </div>
          </motion.div>
        )}

        <GameControls controls={controls} position='bottom-right' />
      </div>

      {showCelebration && (
        <CelebrationOverlay
          show={showCelebration}
          letter={template?.emoji ?? '⭐'}
          accuracy={lastScore ? Math.round(lastScore.accuracy * 100) : 100}
          message={`Level ${level} complete!`}
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </GameContainer>
  );
});

export default MirrorDraw;
