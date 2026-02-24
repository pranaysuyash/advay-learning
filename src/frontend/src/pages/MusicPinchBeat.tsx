import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';

import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { GameContainer } from '../components/GameContainer';
import { GameControls } from '../components/GameControls';
import type { GameControl } from '../components/GameControls';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import { useGameDrops } from '../hooks/useGameDrops';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useTTS } from '../hooks/useTTS';
import { VoiceInstructions } from '../components/game/VoiceInstructions';
import { getLaneFromNormalizedX, pickNextLane } from '../games/musicPinchLogic';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

const LANE_COUNT = 3;
const LANE_LABELS = ['Sa', 'Re', 'Ga'] as const;

export const MusicPinchBeat = memo(function MusicPinchBeatComponent() {
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [targetLane, setTargetLane] = useState(1);
  const [cursorX, setCursorX] = useState<number | null>(null);
  const [selectedLane, setSelectedLane] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('Pinch on the glowing lane to play the beat!');
  const [showCelebration, setShowCelebration] = useState(false);

  const targetLaneRef = useRef(targetLane);
  const streakRef = useRef(streak);

  const { playPop, playError, playCelebration, playStart } = useSoundEffects();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { onGameComplete } = useGameDrops('music-pinch-beat');

  useEffect(() => {
    targetLaneRef.current = targetLane;
  }, [targetLane]);

  useEffect(() => {
    streakRef.current = streak;
  }, [streak]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTargetLane((prev) => pickNextLane(prev, LANE_COUNT));
    }, 1800);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleFrame = useCallback(
    (frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
      const tip = frame.indexTip;
      if (!tip) {
        if (cursorX !== null) setCursorX(null);
        if (selectedLane !== null) setSelectedLane(null);
        return;
      }

      if (cursorX !== tip.x) setCursorX(tip.x);
      const lane = getLaneFromNormalizedX(tip.x, LANE_COUNT);
      if (selectedLane !== lane) setSelectedLane(lane);

      if (frame.pinch.transition !== 'start') return;

      if (lane === targetLaneRef.current) {
        void playPop();

        const nextStreak = streakRef.current + 1;
        setStreak(nextStreak);
        setScore((prev) => prev + 10 + Math.min(20, nextStreak * 2));
        setFeedback(`Nice rhythm! ${LANE_LABELS[lane]} lane hit.`);
        if (ttsEnabled && nextStreak % 5 === 0) {
          void speak('Great rhythm! Keep going!');
        }

        if (nextStreak > 0 && nextStreak % 5 === 0) {
          setShowCelebration(true);
          void playCelebration();
          setTimeout(() => setShowCelebration(false), 1800);
        }

        setTargetLane((prev) => pickNextLane(prev, LANE_COUNT));
      } else {
        void playError();
        setStreak(0);
        setFeedback('Missed beat. Move to the glowing lane and pinch again!');
        if (ttsEnabled) {
          void speak('Move to the glowing lane and pinch!');
        }
      }
    },
    [cursorX, playCelebration, playError, playPop, selectedLane, speak, ttsEnabled],
  );

  const { isLoading: isModelLoading, isReady: isHandTrackingReady, startTracking, webcamRef } =
    useGameHandTracking({
      gameName: 'MusicPinchBeat',
      targetFps: 30,
      isRunning: isPlaying,
      onFrame: handleFrame,
      onNoVideoFrame: () => {
        if (cursorX !== null) setCursorX(null);
        if (selectedLane !== null) setSelectedLane(null);
      },
    });

  useEffect(() => {
    if (isPlaying && !isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  }, [isHandTrackingReady, isModelLoading, isPlaying, startTracking]);

  const startGame = async () => {
    setScore(0);
    setStreak(0);
    setFeedback('Follow the beat: pinch when your finger is on the glowing lane.');
    setTargetLane(1);
    setCursorX(null);
    setSelectedLane(null);
    setIsPlaying(true);
    if (ttsEnabled) {
      void speak('Move your finger to the glowing lane and pinch to play the beat!');
    }
    await playStart();

    if (!isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  };

  const stopGame = () => {
    onGameComplete();
    setIsPlaying(false);
    setCursorX(null);
    setSelectedLane(null);
    setFeedback('Pinch on the glowing lane to play the beat!');
  };

  const goHome = () => {
    stopGame();
    navigate('/dashboard');
  };

  const controls: GameControl[] = [
    {
      id: 'start-stop',
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
    <GameContainer title='Music Pinch Beat' score={score} level={Math.max(1, Math.floor(score / 80) + 1)} onHome={goHome} isHandDetected={isHandTrackingReady} isPlaying={isPlaying}>
      <div className='absolute inset-0 bg-blue-50 overflow-hidden'>
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored
          className='absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-multiply'
          videoConstraints={{ facingMode: 'user' }}
        />

        <div className='absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-blue-100/40 pointer-events-none' />

        <div className='absolute inset-x-4 top-24 bottom-24 grid grid-cols-3 gap-4 md:gap-8'>
          {Array.from({ length: LANE_COUNT }).map((_, laneIndex) => {
            const isTarget = laneIndex === targetLane;
            const isSelected = laneIndex === selectedLane;

            return (
              <div
                key={laneIndex}
                className='relative flex items-center justify-center'
              >
                <div
                  className={`absolute inset-0 rounded-[2.5rem] border-3 transition-all duration-300 ${isTarget
                      ? 'bg-amber-100/50 border-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.5)]'
                      : 'bg-white/40 border-[#F2CC8F]'
                    }`}
                />
                <div
                  className={`relative z-10 mt-12 text-5xl font-black tracking-widest ${isSelected ? 'text-[#3B82F6] scale-110' : 'text-slate-400'
                    } transition-transform drop-shadow-[0_4px_0_#E5B86E]`}
                >
                  {LANE_LABELS[laneIndex]}
                </div>
              </div>
            );
          })}
        </div>

        {cursorX !== null && (
          <div
            className='absolute bottom-32 w-[84px] h-[84px] rounded-full border-3 border-[#3B82F6] bg-blue-100/50 shadow-[0_0_30px_rgba(59,130,246,0.6)] -translate-x-1/2 pointer-events-none transition-all flex items-center justify-center'
            style={{ left: `${cursorX * 100}%` }}
            aria-hidden='true'
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l3 3-3 3 3 3"/><path d="M18 15V9a2 2 0 0 0-2-2h-2"/><path d="M10 15V9a2 2 0 0 1 2-2h2"/></svg>
          </div>
        )}

        <div className='absolute top-6 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full bg-white/95 backdrop-blur-sm border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] text-advay-slate font-bold text-lg text-center min-w-[300px]'>
          {feedback}
        </div>

        {!isPlaying && (
          <div className='absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30 flex items-center justify-center'>
            <div className='bg-white border-3 border-[#F2CC8F] rounded-[3rem] p-12 text-center max-w-md w-[90%] shadow-[0_4px_0_#E5B86E] relative'>
              <div className='w-20 h-20 mx-auto mb-4 drop-shadow-[0_4px_0_#E5B86E] hover:scale-110 transition-transform flex items-center justify-center bg-purple-100 rounded-3xl border-4 border-purple-200'>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9333EA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
              </div>
              <h2 className='text-3xl md:text-4xl font-black text-advay-slate tracking-tight mb-4'>Music Pinch Beat</h2>
              <p className='text-text-secondary font-bold text-xl mb-10'>
                Move your finger to the glowing lane and pinch to play the beat!
              </p>
              {ttsEnabled && (
                <VoiceInstructions
                  instructions={[
                    'Watch for the glowing lane.',
                    'Move your finger there.',
                    'Pinch to play the beat!',
                  ]}
                  autoSpeak={true}
                  showReplayButton={true}
                  replayButtonPosition='bottom-right'
                />
              )}
              <button
                type='button'
                onClick={startGame}
                className='w-full px-12 py-5 bg-[#3B82F6] hover:bg-blue-600 border-3 border-blue-200 hover:border-blue-300 text-white font-black rounded-full shadow-[0_4px_0_#E5B86E] text-2xl transition-transform hover:scale-[1.02] active:scale-95'
              >
                Start Music Game
              </button>
            </div>
          </div>
        )}

        <div className='absolute top-6 right-6 px-6 py-3 rounded-full bg-white/95 backdrop-blur-sm border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] text-text-secondary font-bold text-lg'>
          Streak: <span className='font-black text-amber-500 text-2xl ml-2'>{streak}</span>
        </div>

        <GameControls controls={controls} position='bottom-right' />
      </div>

      {showCelebration && (
        <CelebrationOverlay
          show={showCelebration}
          letter='♪'
          accuracy={100}
          message='Great Rhythm! You are keeping the beat.'
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </GameContainer>
  );
});

export default MusicPinchBeat;
