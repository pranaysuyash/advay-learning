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

  const scoreRef = useRef(score);
  const streakRef = useRef(streak);

  const { playPop, playError, playFanfare: playCelebration } = useAudio();
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

  const startGame = async (selectedDifficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
    setScore(0);
    setStreak(0);
    setDifficulty(selectedDifficulty);
    setFeedback(`Pinch inside the shape! ${selectedDifficulty.toUpperCase()} mode`);
    setCursor(null);
    spawnTarget();
    setIsPlaying(true);
    setShowMenu(false);
    if (ttsEnabled) {
      void speak(`Let's pop some shapes on ${selectedDifficulty} mode! Show me your hand!`);
    }
    playPop();

    if (!isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
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
      <div ref={gameAreaRef} className='absolute inset-0 bg-blue-50 overflow-hidden'>
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

        {showMenu && (
          <div className='absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30 flex items-center justify-center'>
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
