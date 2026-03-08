import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { GameCursor } from '../components/game/GameCursor';
import { GameContainer } from '../components/GameContainer';
import { GameControls } from '../components/GameControls';
import type { GameControl } from '../components/GameControls';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import { useGameDrops } from '../hooks/useGameDrops';
import { useAudio } from '../utils/hooks/useAudio';
import { useTTS } from '../hooks/useTTS';
import { VoiceInstructions } from '../components/game/VoiceInstructions';
import { triggerHaptic } from '../utils/haptics';
import { isPointInCircle, pickRandomPoint } from '../games/targetPracticeLogic';
import type { Point } from '../types/tracking';
import { randomFloat01 } from '../utils/random';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

// Game configuration with difficulty levels
const GAME_CONFIG = {
  easy: { targetSize: 180, popRadius: 0.20, cursorSize: 100 },
  medium: { targetSize: 144, popRadius: 0.16, cursorSize: 84 },
  hard: { targetSize: 120, popRadius: 0.12, cursorSize: 72 },
} as const;

// Kenney collectibles as targets
const KENNEY_TARGETS = [
  { id: 'gem', name: 'Gem', src: '/assets/kenney/platformer/collectibles/gem_blue.png', points: 15 },
  { id: 'coin', name: 'Coin', src: '/assets/kenney/platformer/collectibles/coin_gold.png', points: 10 },
  { id: 'star', name: 'Star', src: '/assets/kenney/platformer/collectibles/star.png', points: 20 },
] as const;

// Heart HUD for streak visualization
const HEART_FULL = '/assets/kenney/platformer/hud/hud_heart.png';
const HEART_EMPTY = '/assets/kenney/platformer/hud/hud_heart_empty.png';

// Particle effect types
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  scale: number;
}

export const ShapePop = memo(function ShapePopComponent() {
  const navigate = useNavigate();
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [targetCenter, setTargetCenter] = useState<Point>(
    pickRandomPoint(0.4, 0.55, 0.18),
  );
  const [targetCollectible, setTargetCollectible] = useState<typeof KENNEY_TARGETS[number]>(KENNEY_TARGETS[1]);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [feedback, setFeedback] = useState(
    'Pinch when your finger is inside the shape ring.',
  );
  const [showCelebration, setShowCelebration] = useState(false);

  // Combo/scoring system
  const [streak, setStreak] = useState(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showMenu, setShowMenu] = useState(true);

  // Visual feedback system - Unit 2
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [screenShake, setScreenShake] = useState(0);

  // Tutorial system - Unit 3
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const hasCompletedTutorial = localStorage.getItem('shape-pop-tutorial-completed') === 'true';

  const scoreRef = useRef(score);
  const streakRef = useRef(streak);
  const particleIdRef = useRef(0);
  const textIdRef = useRef(0);

  const { playPop, playError, playFanfare: playCelebration } = useAudio();

  // Visual feedback helpers - Unit 2
  const spawnParticles = useCallback((x: number, y: number, count: number, color: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + randomFloat01() * 0.5;
      const speed = 2 + randomFloat01() * 3;
      newParticles.push({
        id: particleIdRef.current++,
        x: x * 100, // Convert to percentage
        y: y * 100,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color,
        size: 4 + randomFloat01() * 4,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  }, []);

  const spawnFloatingText = useCallback((x: number, y: number, text: string, color: string) => {
    setFloatingTexts((prev) => [
      ...prev,
      {
        id: textIdRef.current++,
        x: x * 100,
        y: y * 100,
        text,
        color,
        life: 1,
        scale: 1,
      },
    ]);
  }, []);

  // Update particles and floating text
  useEffect(() => {
    if (particles.length === 0 && floatingTexts.length === 0) return;

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * 0.1,
            y: p.y + p.vy * 0.1,
            vy: p.vy + 0.5, // Gravity
            life: p.life - 0.03,
          }))
          .filter((p) => p.life > 0)
      );

      setFloatingTexts((prev) =>
        prev
          .map((t) => ({
            ...t,
            y: t.y - 0.5, // Float up
            life: t.life - 0.02,
            scale: t.scale + 0.01,
          }))
          .filter((t) => t.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [particles.length, floatingTexts.length]);

  // Screen shake effect
  useEffect(() => {
    if (screenShake <= 0) return;

    const timer = setTimeout(() => {
      setScreenShake((prev) => prev - 1);
    }, 50);

    return () => clearTimeout(timer);
  }, [screenShake]);
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { onGameComplete, triggerEasterEgg } = useGameDrops('shape-pop');
  const popWindowRef = useRef<number[]>([]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    streakRef.current = streak;
  }, [streak]);

  const spawnTarget = useCallback(() => {
    setTargetCenter(pickRandomPoint(randomFloat01(), randomFloat01(), 0.18));
    const randomIndex = Math.floor(randomFloat01() * KENNEY_TARGETS.length);
    setTargetCollectible(KENNEY_TARGETS[randomIndex] ?? KENNEY_TARGETS[1]);
  }, []);

  // Calculate score with combo bonus and collectible type
  const calculateScore = useCallback((currentStreak: number, basePoints: number) => {
    const comboBonus = Math.min(currentStreak * 2, 10); // +2 per streak, max +10
    const streakBonus = currentStreak >= 5 ? 25 : 0; // Bonus at 5x streak
    return basePoints + comboBonus + streakBonus;
  }, []);

  const handleFrame = useCallback(
    (frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
      const tip = frame.indexTip;
      if (!tip) {
        if (cursor !== null) setCursor(null);
        return;
      }

      if (!cursor || cursor.x !== tip.x || cursor.y !== tip.y) {
        setCursor(tip);
      }

      if (frame.pinch.transition !== 'start') return;

      const inside = isPointInCircle(tip, targetCenter, GAME_CONFIG[difficulty].popRadius);
      if (inside) {
        // Hit - update streak and calculate score
        const newStreak = streakRef.current + 1;
        setStreak(newStreak);

        const collectiblePoints = targetCollectible.points;
        const points = calculateScore(newStreak, collectiblePoints);
        const nextScore = scoreRef.current + points;
        setScore(nextScore);

        // Feedback with collectible and streak info
        const collectibleName = targetCollectible.name;
        if (newStreak >= 5) {
          setFeedback(`🔥 ${newStreak}x STREAK! ${collectibleName} +${points} pts!`);
          if (ttsEnabled) void speak(`${newStreak} in a row! ${collectibleName} popped! Incredible!`);
        } else if (newStreak >= 3) {
          setFeedback(`✨ ${newStreak}x streak! ${collectibleName} +${points} pts`);
          if (ttsEnabled) void speak(`Nice streak! ${collectibleName} popped! ${newStreak} in a row!`);
        } else {
          setFeedback(`${collectibleName} popped! +${points} pts`);
          if (ttsEnabled) {
            void speak(`${collectibleName} popped! Great hit!`);
          }
        }

        void playPop();
        triggerHaptic('success');

        // Visual feedback - Unit 2
        const particleColor = targetCollectible.id === 'gem' ? '#3B82F6' : targetCollectible.id === 'star' ? '#F59E0B' : '#10B981';
        spawnParticles(targetCenter.x, targetCenter.y, 12, particleColor);
        spawnFloatingText(targetCenter.x, targetCenter.y - 0.05, `+${points}`, '#10B981');
        if (newStreak >= 5) {
          spawnFloatingText(targetCenter.x, targetCenter.y - 0.12, '🔥 STREAK!', '#F59E0B');
        }

        const now = Date.now();
        popWindowRef.current.push(now);
        popWindowRef.current = popWindowRef.current.filter((t) => now - t < 30000);
        if (popWindowRef.current.length >= 20) {
          triggerEasterEgg('egg-diamond-pop');
        }

        if (nextScore > 0 && nextScore % 120 === 0) {
          setShowCelebration(true);
          triggerHaptic('celebration');
          void playCelebration();
          if (ttsEnabled) {
            void speak('Amazing! You are doing great!');
          }
          setTimeout(() => setShowCelebration(false), 3000);
        }

        spawnTarget();
      } else {
        // Miss - reset streak
        const lostStreak = streakRef.current;
        setStreak(0);

        // Visual feedback for miss - Unit 2
        spawnParticles(tip.x, tip.y, 6, '#EF4444');
        spawnFloatingText(tip.x, tip.y - 0.05, lostStreak >= 3 ? '💔 Streak Lost!' : 'Miss!', '#EF4444');
        setScreenShake(5); // Screen shake effect

        if (lostStreak >= 5 && ttsEnabled) {
          void speak('Oops! Streak lost! Try again!');
        }

        setFeedback(lostStreak >= 3 ? `💥 Streak lost! Try again!` : 'Close! Move into the ring, then pinch.');
        if (ttsEnabled && lostStreak < 3) {
          void speak('Pinch when you are inside the target!');
        }
        void playError();
        triggerHaptic('error');
      }
    },
    [cursor, playCelebration, playError, playPop, spawnTarget, targetCenter, speak, ttsEnabled, targetCollectible, calculateScore, streak],
  );

  const { isLoading: isModelLoading, isReady: isHandTrackingReady, startTracking, webcamRef: _webcamRef } =
    useGameHandTracking({
      gameName: 'ShapePop',
      targetFps: 30,
      isRunning: isPlaying && !showMenu,
      onFrame: handleFrame,
      onNoVideoFrame: () => {
        if (cursor !== null) setCursor(null);
      },
    });

  useEffect(() => {
    if (isPlaying && !isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  }, [isHandTrackingReady, isModelLoading, isPlaying, startTracking, showMenu]);

  const TUTORIAL_STEPS = [
    {
      title: 'Move Your Finger',
      text: 'Move your hand to control the blue finger cursor.',
      highlight: 'cursor',
    },
    {
      title: 'Aim at the Target',
      text: 'Move your finger inside the purple ring around the shape.',
      highlight: 'target',
    },
    {
      title: 'Pinch to Pop!',
      text: 'Pinch your thumb and finger together to collect the shape!',
      highlight: 'target',
    },
    {
      title: 'Build Your Streak',
      text: 'Pop shapes without missing to build a streak for bonus points!',
      highlight: 'streak',
    },
  ];

  const startGame = async (selectedDifficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
    setScore(0);
    setStreak(0);
    setDifficulty(selectedDifficulty);
    setFeedback(`Pinch inside the shape! ${selectedDifficulty.toUpperCase()} mode`);
    setCursor(null);
    spawnTarget();
    setIsPlaying(true);
    setShowMenu(false);

    // Show tutorial for first-time players - Unit 3
    if (!hasCompletedTutorial) {
      setShowTutorial(true);
      setTutorialStep(0);
    }

    if (ttsEnabled) {
      void speak(`Let's pop some shapes on ${selectedDifficulty} mode! Show me your hand!`);
    }
    playPop();

    if (!isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  };

  const nextTutorialStep = () => {
    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      completeTutorial();
    }
  };

  const completeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('shape-pop-tutorial-completed', 'true');
    if (ttsEnabled) {
      void speak('Great! Now try to pop as many shapes as you can!');
    }
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('shape-pop-tutorial-completed', 'true');
  };

  const resetGame = () => {
    onGameComplete();
    setIsPlaying(false);
    setCursor(null);
    setShowMenu(true);
    setStreak(0);
    setFeedback('Pinch when your finger is inside the shape ring.');
  };

  const goHome = () => {
    resetGame();
    navigate('/dashboard');
  };

  const controls: GameControl[] = [
    {
      id: 'start',
      icon: isPlaying ? 'rotate-ccw' : 'play',
      label: isPlaying ? 'Restart' : 'Start',
      onClick: startGame,
      variant: isPlaying ? 'secondary' : 'success',
    },
    {
      id: 'home',
      icon: 'home',
      label: 'Home',
      onClick: goHome,
      variant: 'primary',
    },
  ];

  return (
    <GameContainer
      title='Shape Pop'
      score={score}
      level={Math.max(1, Math.floor(score / 120) + 1)}
      onHome={goHome}
      isHandDetected={isHandTrackingReady}
      isPlaying={isPlaying}
    >
      <div
        ref={gameAreaRef}
        className='absolute inset-0 bg-blue-50 overflow-hidden'
        style={{
          transform: screenShake > 0
            ? `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`
            : undefined,
          transition: screenShake > 0 ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <div className='absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-fuchsia-100/40 backdrop-blur-sm pointer-events-none' />

        <div className='absolute top-6 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full bg-white/95 backdrop-blur-sm border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] text-advay-slate font-bold text-lg text-center min-w-[320px]'>
          {feedback}
        </div>

        {/* Streak display with Kenney hearts */}
        {isPlaying && (
          <div className='absolute top-6 right-6 flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-2xl border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E]'>
            <span className='font-bold text-advay-slate mr-2'>Streak:</span>
            {[1, 2, 3, 4, 5].map((i) => (
              <img
                key={i}
                src={streak >= i ? HEART_FULL : HEART_EMPTY}
                alt={streak >= i ? 'Full heart' : 'Empty heart'}
                className='w-6 h-6'
              />
            ))}
          </div>
        )}

        {/* Kenney collectible target */}
        <div
          className='absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform hover:scale-110'
          style={{
            left: `${targetCenter.x * 100}%`,
            top: `${targetCenter.y * 100}%`,
            width: `${GAME_CONFIG[difficulty].targetSize}px`,
            height: `${GAME_CONFIG[difficulty].targetSize}px`,
          }}
          aria-hidden='true'
        >
          <div className='absolute inset-0 rounded-full border-[6px] border-[#D946EF] bg-fuchsia-100/30 shadow-[0_0_30px_rgba(217,70,239,0.3)] backdrop-blur-sm' />
          <div className='absolute inset-0 flex items-center justify-center'>
            <img
              src={targetCollectible.src}
              alt={targetCollectible.name}
              className='w-16 h-16 md:w-20 md:h-20 drop-shadow-[0_4px_0_#E5B86E] animate-bounce'
              style={{ animationDuration: '2s' }}
            />
          </div>
        </div>

        {/* Particle effects - Unit 2 */}
        {particles.map((p) => (
          <div
            key={p.id}
            className='absolute rounded-full pointer-events-none'
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: p.life,
              transform: `scale(${p.life})`,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            }}
          />
        ))}

        {/* Floating text - Unit 2 */}
        {floatingTexts.map((t) => (
          <div
            key={t.id}
            className='absolute pointer-events-none font-black text-2xl'
            style={{
              left: `${t.x}%`,
              top: `${t.y}%`,
              color: t.color,
              opacity: t.life,
              transform: `scale(${t.scale})`,
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            {t.text}
          </div>
        ))}

        {cursor && (
          <GameCursor
            position={cursor}
            coordinateSpace='normalized'
            containerRef={gameAreaRef}
            isPinching={false}
            isHandDetected={isPlaying}
            size={GAME_CONFIG[difficulty].cursorSize}
            color='#3B82F6'
            highContrast={true}
            icon='👆'
          />
        )}

        {/* Tutorial Overlay - Unit 3 */}
        {showTutorial && isPlaying && (
          <div className='absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center'>
            <div className='bg-white border-4 border-[#F2CC8F] rounded-[2rem] p-8 max-w-md w-[90%] shadow-[0_8px_0_#E5B86E] text-center'>
              <div className='text-5xl mb-4'>
                {TUTORIAL_STEPS[tutorialStep].highlight === 'cursor' && '👆'}
                {TUTORIAL_STEPS[tutorialStep].highlight === 'target' && '🎯'}
                {TUTORIAL_STEPS[tutorialStep].highlight === 'streak' && '🔥'}
              </div>
              <h3 className='text-2xl font-black text-advay-slate mb-3'>
                {TUTORIAL_STEPS[tutorialStep].title}
              </h3>
              <p className='text-text-secondary font-bold text-lg mb-6'>
                {TUTORIAL_STEPS[tutorialStep].text}
              </p>

              {/* Progress dots */}
              <div className='flex justify-center gap-2 mb-6'>
                {TUTORIAL_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i === tutorialStep ? 'bg-[#F2CC8F]' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              <div className='flex gap-3'>
                <button
                  onClick={skipTutorial}
                  className='flex-1 py-3 px-4 rounded-xl border-2 border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-colors'
                >
                  Skip
                </button>
                <button
                  onClick={nextTutorialStep}
                  className='flex-1 py-3 px-4 rounded-xl bg-[#F2CC8F] text-advay-slate font-bold hover:bg-[#E5B86E] transition-colors shadow-[0_4px_0_#D4A574] active:shadow-none active:translate-y-[4px]'
                >
                  {tutorialStep < TUTORIAL_STEPS.length - 1 ? 'Next' : 'Start Playing!'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showMenu && (
          <div className='absolute inset-0 bg-[#FFF8F0]/80 backdrop-blur-sm z-30 flex items-center justify-center'>
            <div className='bg-white border-3 border-[#F2CC8F] rounded-[3rem] p-12 text-center max-w-2xl w-[90%] shadow-[0_4px_0_#E5B86E] relative'>
              <div className='mb-4 drop-shadow-[0_4px_0_#E5B86E] hover:scale-110 transition-transform text-[#3B82F6]'>
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
              </div>
              <h2 className='text-3xl md:text-4xl font-black text-advay-slate tracking-tight mb-2'>Shape Pop</h2>
              <p className='text-text-secondary font-bold text-lg mb-2'>
                Pop gems, coins, and stars!
              </p>
              <p className='text-sm text-slate-400 font-bold mb-6'>
                Build streaks for bonus points!
              </p>

              {/* Kenney collectibles preview */}
              <div className='flex items-center justify-center gap-4 mb-6'>
                {KENNEY_TARGETS.map((target) => (
                  <div key={target.id} className='flex flex-col items-center gap-1'>
                    <img src={target.src} alt={target.name} className='w-12 h-12' />
                    <span className='text-xs font-bold text-text-secondary'>{target.points} pts</span>
                  </div>
                ))}
              </div>

              {/* Tutorial replay button */}
              {hasCompletedTutorial && (
                <button
                  onClick={() => {
                    localStorage.removeItem('shape-pop-tutorial-completed');
                    startGame('medium');
                  }}
                  className='mb-4 py-2 px-4 rounded-xl border-2 border-blue-200 text-blue-600 font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2'
                >
                  <span>❓</span>
                  <span>Replay Tutorial</span>
                </button>
              )}

              {/* Difficulty selection */}
              <div className='grid grid-cols-3 gap-3 mb-6'>
                {[
                  { key: 'easy', label: 'Easy', emoji: '🌱', desc: 'Big targets' },
                  { key: 'medium', label: 'Medium', emoji: '🌟', desc: 'Standard' },
                  { key: 'hard', label: 'Hard', emoji: '🔥', desc: 'Small targets' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type='button'
                    onClick={() => startGame(opt.key as 'easy' | 'medium' | 'hard')}
                    className='flex flex-col items-center gap-1 p-4 rounded-2xl border-3 border-[#F2CC8F] bg-white hover:border-blue-400 hover:scale-105 transition-all shadow-[0_4px_0_#E5B86E] active:scale-95'
                  >
                    <span className='text-3xl'>{opt.emoji}</span>
                    <span className='font-black text-advay-slate'>{opt.label}</span>
                    <span className='text-xs text-text-secondary'>{opt.desc}</span>
                  </button>
                ))}
              </div>

              {ttsEnabled && (
                <VoiceInstructions
                  instructions={[
                    'Pop gems, coins, and stars!',
                    'Point with your finger.',
                    'Pinch to collect!',
                    'Build a streak for bonus points!',
                  ]}
                  autoSpeak={true}
                  showReplayButton={true}
                  replayButtonPosition='bottom-right'
                />
              )}
            </div>
          </div>
        )}

        <GameControls controls={controls} position='bottom-right' />
      </div>

      {showCelebration && (
        <CelebrationOverlay
          show={showCelebration}
          letter='★'
          accuracy={100}
          message='Awesome popping!'
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </GameContainer>
  );
});

export default ShapePop;
