import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameShell } from '../components/GameShell';
import { useGamePoseTracking } from '../hooks/useGamePoseTracking';
import {
  initGameState,
  updateGameState,
  MidlineViolatorState,
  INITIAL_CONFIG
} from '../games/midlineViolatorLogic';
import { useAudio } from '../utils/hooks/useAudio';
import Webcam from 'react-webcam';

const MidlineViolator: React.FC = () => {
  const [state, setState] = useState<MidlineViolatorState>(initGameState());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const webcamRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { playClick, playSuccess, playError } = useAudio();

  const lastTimeRef = useRef<number>(0);
  const poseDataRef = useRef<any>(null);

  const onPoseFrame = useCallback((landmarks: any[]) => {
    poseDataRef.current = landmarks;
  }, []);

  useGamePoseTracking({
    gameName: 'MidlineViolator',
    webcamRef,
    onFrame: onPoseFrame,
    enabled: isPlaying
  });

  const startGame = () => {
    setState(initGameState());
    setIsPlaying(true);
    playClick();
  };

  // Game Loop
  useEffect(() => {
    if (!isPlaying || state.isGameOver) return;

    let animationId: number;

    const loop = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      setState(prevState => {
        const nextState = updateGameState(
          prevState,
          time,
          deltaTime,
          poseDataRef.current,
          INITIAL_CONFIG
        );

        if (nextState.score > prevState.score) {
          playSuccess();
        } else if (nextState.feedback?.type === 'error' && prevState.feedback?.type !== 'error') {
          playError();
        }

        return nextState;
      });

      renderCanvas();
      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animationId);
      lastTimeRef.current = 0;
    };
  }, [isPlaying, state.isGameOver, playSuccess, playError]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Midline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Targets
    state.targets.forEach(target => {
      if (target.isHit) return;

      const tx = target.x * canvas.width;
      const ty = target.y * canvas.height;
      const tr = target.radius * canvas.width;
      const pulse = Math.sin(Date.now() / 200) * 5;

      ctx.fillStyle = target.targetHand === 'Left' ? '#3B82F6' : '#EF4444';
      ctx.beginPath();
      ctx.arc(tx, ty, tr + pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(target.type === 'gem' ? '💎' : '⭐', tx, ty + 7);
    });

    // Draw Hand Cursors
    if (poseDataRef.current) {
      const leftIndex = poseDataRef.current[19];
      const rightIndex = poseDataRef.current[20];

      if (leftIndex) {
        ctx.fillStyle = '#3B82F6';
        ctx.beginPath();
        ctx.arc(leftIndex.x * canvas.width, leftIndex.y * canvas.height, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      if (rightIndex) {
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(rightIndex.x * canvas.width, rightIndex.y * canvas.height, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    // Feedback message
    if (state.feedback) {
      ctx.fillStyle = state.feedback.type === 'success' ? '#10B981' : '#F59E0B';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(state.feedback.message, canvas.width / 2, 100);
    }
  };

  return (
    <GameShell
      gameId="midline-violator"
      gameName="Midline Violator"
    >
      <div ref={containerRef} className="relative w-full h-full bg-slate-900 overflow-hidden rounded-xl">
        <Webcam
          ref={webcamRef}
          audio={false}
          className="absolute top-0 left-0 w-full h-full object-cover opacity-0 pointer-events-none"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />

        {!isPlaying && !state.isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white p-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Cross the Line!</h1>
            <p className="text-xl mb-8">
              Hit <span className="text-blue-400 font-bold">Blue</span> targets with your <span className="text-blue-400">Left Hand</span>.<br/>
              Hit <span className="text-red-400 font-bold">Red</span> targets with your <span className="text-red-400">Right Hand</span>.
            </p>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 rounded-full text-2xl font-bold transition-all transform hover:scale-105"
            >
              Let's Go!
            </button>
          </div>
        )}

        {state.isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white">
            <h2 className="text-5xl font-bold mb-4">Time's Up!</h2>
            <p className="text-3xl mb-8">Score: {Math.floor(state.score)}</p>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-full text-2xl font-bold transition-all transform hover:scale-105"
            >
              Play Again
            </button>
          </div>
        )}

        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <div className="bg-black/50 px-4 py-2 rounded-lg text-white">
            <span className="text-sm uppercase opacity-70">Combo</span>
            <div className="text-2xl font-bold text-yellow-400">x{state.combo}</div>
          </div>
        </div>
      </div>
    </GameShell>
  );
};

export default MidlineViolator;
