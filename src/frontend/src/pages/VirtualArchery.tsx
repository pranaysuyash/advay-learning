import { useCallback, useEffect, useRef, useState } from 'react';
import { GameContainer } from '../components/GameContainer';
import { GameHUD } from '../components/game/GameHUD';
import { GameBackground } from '../components/game/GameBackground';
import { GameCursor } from '../components/game/GameCursor';
import { GameShell } from '../components/GameShell';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useAudio } from '../utils/hooks/useAudio';
import {
  VirtualArcheryState,
  Target,
  Arrow,
  createInitialState,
} from '../games/virtualArcheryLogic';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GRAVITY = 1200; 
const MAX_POWER = 1800;
const BOW_X = CANVAS_WIDTH / 2;
const BOW_Y = CANVAS_HEIGHT - 50;

interface PhysicsResult {
  state: VirtualArcheryState;
  arrowOutOfBounds: boolean;
  hitTarget: boolean;
}

function updatePhysics(
  state: VirtualArcheryState,
  dt: number,
): PhysicsResult {
  const s = { ...state };
  let arrowOutOfBounds = false;
  let hitTarget = false;

  // Update wind randomly
  if (Math.random() < 0.02) {
    s.wind += (Math.random() - 0.5) * 150;
    s.wind = Math.max(-300, Math.min(300, s.wind));
  }

  // Update targets
  s.targets = updateTargets(s.targets, dt);

  // Spawn new targets if needed
  if (s.targets.filter(t => t.active).length < 3) {
    s.targets.push(spawnTarget());
  }

  // Arrow physics
  if (s.arrow.active) {
    const collision = updateArrow(s, dt);
    hitTarget = collision.hit;
    arrowOutOfBounds = collision.outOfBounds;
  }

  return { state: s, arrowOutOfBounds, hitTarget };
}

function updateTargets(targets: Target[], dt: number): Target[] {
  return targets.map(t => {
    if (!t.active) return t;
    const nt = { ...t };
    nt.x += nt.vx * dt;
    nt.y += nt.vy * dt;
    if (nt.type === 'bullseye' && (nt.x < 50 || nt.x > CANVAS_WIDTH - 50)) {
      nt.vx *= -1;
    }
    if (nt.type === 'balloon' && nt.y < -50) {
      nt.active = false;
    }
    return nt;
  });
}

function spawnTarget(): Target {
  return {
    id: Math.random().toString(),
    x: Math.random() * (CANVAS_WIDTH - 100) + 50,
    y: Math.random() * (CANVAS_HEIGHT / 2),
    radius: Math.random() > 0.5 ? 40 : 25,
    points: Math.random() > 0.5 ? 10 : 30,
    type: Math.random() > 0.7 ? 'balloon' : 'bullseye',
    active: true,
    vx: Math.random() > 0.5 ? (Math.random() - 0.5) * 150 : 0,
    vy: Math.random() > 0.7 ? -40 : 0,
  };
}

interface ArrowUpdateResult {
  hit: boolean;
  outOfBounds: boolean;
}

function updateArrow(
  s: VirtualArcheryState,
  dt: number,
): ArrowUpdateResult {
  s.arrow = { ...s.arrow };
  s.arrow.vy += GRAVITY * dt;
  s.arrow.vx += s.wind * dt;
  s.arrow.x += s.arrow.vx * dt;
  s.arrow.y += s.arrow.vy * dt;
  s.arrow.rotation = Math.atan2(s.arrow.vy, s.arrow.vx);

  // Check collisions with targets
  for (const t of s.targets) {
    if (!t.active) continue;
    const dx = s.arrow.x - t.x;
    const dy = s.arrow.y - t.y;
    if (dx * dx + dy * dy < t.radius * t.radius) {
      t.active = false;
      s.score += t.points;
      s.arrow.active = false;
      s.bowState = 'idle';
      return { hit: true, outOfBounds: false };
    }
  }

  // Check out of bounds
  const offScreen =
    s.arrow.y > CANVAS_HEIGHT + 100 ||
    s.arrow.x < -100 ||
    s.arrow.x > CANVAS_WIDTH + 100;
  if (offScreen) {
    s.arrow.active = false;
    s.bowState = 'idle';
  }

  return { hit: false, outOfBounds: offScreen };
}

function renderFrame(
  ctx: CanvasRenderingContext2D,
  state: VirtualArcheryState,
  cursor: { x: number; y: number } | null,
  isPinching: boolean,
  isReady: boolean,
): void {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawWindIndicator(ctx, state.wind);
  drawTargets(ctx, state.targets);
  drawBow(ctx, state);
  drawFlyingArrow(ctx, state.arrow);
  drawCursor(ctx, cursor, isPinching, isReady, state.bowState);
}

function drawWindIndicator(ctx: CanvasRenderingContext2D, wind: number): void {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillRect(CANVAS_WIDTH / 2 - 100, 20, 200, 10);
  ctx.fillStyle = 'white';
  const barX = CANVAS_WIDTH / 2 + (wind / 300) * 100 - (wind < 0 ? 0 : 5);
  const barW = 5 + Math.abs((wind / 300) * 100);
  ctx.fillRect(barX, 18, barW, 14);
}

function drawTargets(ctx: CanvasRenderingContext2D, targets: Target[]): void {
  targets.forEach(t => {
    if (!t.active) return;
    if (t.type === 'bullseye') {
      drawBullseye(ctx, t);
    } else {
      drawBalloon(ctx, t);
    }
  });
}

function drawBullseye(ctx: CanvasRenderingContext2D, t: Target): void {
  ctx.beginPath();
  ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
  ctx.fillStyle = 'red';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(t.x, t.y, t.radius * 0.6, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(t.x, t.y, t.radius * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = 'red';
  ctx.fill();
}

function drawBalloon(ctx: CanvasRenderingContext2D, t: Target): void {
  ctx.beginPath();
  ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#4ade80';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(t.x, t.y + t.radius);
  ctx.lineTo(t.x - 5, t.y + t.radius + 10);
  ctx.lineTo(t.x + 5, t.y + t.radius + 10);
  ctx.fillStyle = '#4ade80';
  ctx.fill();
}

function drawBow(ctx: CanvasRenderingContext2D, state: VirtualArcheryState): void {
  ctx.save();
  ctx.translate(BOW_X, BOW_Y);

  let renderAngle = -Math.PI / 2;
  let stringPull = 0;
  if (state.bowState === 'drawing') {
    renderAngle = state.drawAngle;
    stringPull = state.drawPower * 40;
  } else if (state.arrow.active) {
    renderAngle = -Math.PI / 2;
  }

  ctx.rotate(renderAngle + Math.PI / 2);

  // Bow arc
  ctx.beginPath();
  ctx.moveTo(0, -60);
  ctx.quadraticCurveTo(30, 0, 0, 60);
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.stroke();

  // String
  ctx.beginPath();
  ctx.moveTo(0, -60);
  ctx.lineTo(-stringPull, 0);
  ctx.lineTo(0, 60);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Loaded arrow
  if (state.bowState === 'drawing') {
    ctx.beginPath();
    ctx.moveTo(-stringPull, 0);
    ctx.lineTo(-stringPull + 80, 0);
    ctx.strokeStyle = '#DEB887';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = '#A9A9A9';
    ctx.moveTo(-stringPull + 80, -5);
    ctx.lineTo(-stringPull + 95, 0);
    ctx.lineTo(-stringPull + 80, 5);
    ctx.fill();
  }
  ctx.restore();
}

function drawFlyingArrow(ctx: CanvasRenderingContext2D, arrow: Arrow): void {
  if (!arrow.active) return;
  ctx.save();
  ctx.translate(arrow.x, arrow.y);
  ctx.rotate(arrow.rotation);

  ctx.beginPath();
  ctx.moveTo(-40, 0);
  ctx.lineTo(40, 0);
  ctx.strokeStyle = '#DEB887';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(40, -5);
  ctx.lineTo(55, 0);
  ctx.lineTo(40, 5);
  ctx.fillStyle = '#A9A9A9';
  ctx.fill();
  ctx.restore();
}

function drawCursor(
  ctx: CanvasRenderingContext2D,
  cursor: { x: number; y: number } | null,
  isPinching: boolean,
  isReady: boolean,
  bowState: string,
): void {
  if (!cursor || !isReady) return;
  const cx = cursor.x * CANVAS_WIDTH;
  const cy = cursor.y * CANVAS_HEIGHT;

  ctx.beginPath();
  ctx.arc(cx, cy, 15, 0, Math.PI * 2);
  ctx.fillStyle = isPinching ? 'rgba(74, 222, 128, 0.8)' : 'rgba(255, 255, 255, 0.8)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();

  if (bowState === 'drawing') {
    ctx.beginPath();
    ctx.moveTo(BOW_X, BOW_Y);
    ctx.lineTo(cx, cy);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

export function VirtualArcheryContent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const webcamRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameState, setGameState] = useState<VirtualArcheryState>(createInitialState());
  const stateRef = useRef<VirtualArcheryState>(gameState);
  
  const { playPop, playClick } = useAudio();

  const {
    cursor,
    pinch: { isPinching, transition },
    startTracking,
    stopTracking,
    isReady
  } = useGameHandTracking({
    gameName: 'VirtualArchery',
    targetFps: 60,
    webcamRef,
  });

  useEffect(() => {
    if (isPlaying) {
      startTracking();
    } else {
      stopTracking();
    }
  }, [isPlaying, startTracking, stopTracking]);

  useEffect(() => {
    if (!isPlaying) return;

    if (transition === 'start') {
      playClick();
    } else if (transition === 'release') {
      if (stateRef.current.bowState === 'drawing' && stateRef.current.drawPower > 0.1) {
        stateRef.current = {
          ...stateRef.current,
          bowState: 'released',
          arrow: {
            active: true,
            x: BOW_X,
            y: BOW_Y,
            vx: Math.cos(stateRef.current.drawAngle) * (stateRef.current.drawPower * MAX_POWER),
            vy: Math.sin(stateRef.current.drawAngle) * (stateRef.current.drawPower * MAX_POWER),
            rotation: stateRef.current.drawAngle,
          },
          drawPower: 0,
        };
        playPop();
      } else {
        stateRef.current = { ...stateRef.current, bowState: 'idle', drawPower: 0 };
      }
    }
  }, [transition, isPlaying, playClick, playPop]);

  useEffect(() => {
    if (!isPlaying) return;

    let lastTime = performance.now();
    let animationId: number;

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) {
        animationId = requestAnimationFrame(render);
        return;
      }

      // Hand/bow drag logic
      if (isPinching && cursor && stateRef.current.bowState !== 'released') {
        const cx = cursor.x * CANVAS_WIDTH;
        const cy = cursor.y * CANVAS_HEIGHT;
        const dx = cx - BOW_X;
        const dy = cy - BOW_Y;
        const distance = Math.min(Math.sqrt(dx * dx + dy * dy), 200);
        const angle = Math.atan2(-dy, -dx);
        if (dy > 0) {
          stateRef.current = {
            ...stateRef.current,
            bowState: 'drawing',
            drawPower: distance / 200,
            drawAngle: angle,
          };
        }
      }

      // Physics update
      const { state: newState, hitTarget } = updatePhysics(stateRef.current, dt);
      stateRef.current = newState;
      setGameState(newState);

      if (hitTarget) {
        playPop();
      }

      // Rendering
      renderFrame(ctx, stateRef.current, cursor, isPinching, isReady);

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, isPinching, cursor, isReady]);

  const handleStart = useCallback(() => {
    setIsPlaying(true);
    setGameState(createInitialState());
    stateRef.current = createInitialState();
  }, []);

  return (
    <GameContainer
      title="Virtual Archery"
      onHome={() => window.location.href = '/dashboard'}
      isHandDetected={isReady}
      isPlaying={isPlaying}
      webcamRef={webcamRef}
    >
      <div ref={gameAreaRef} className="relative w-full h-full">
      <GameBackground type="hills" variant="color" className="absolute inset-0" />
      
      {!isPlaying && (
        <GameHUD
          score={0}
          level={1}
          streak={0}
        />
      )}
      
      {!isPlaying && (
         <div className='absolute inset-0 bg-[#FFF8F0]/80 backdrop-blur-sm z-30 flex items-center justify-center'>
            <div className='bg-white border-3 border-[#F2CC8F] rounded-[3rem] p-12 text-center max-w-2xl w-[90%] shadow-[0_4px_0_#E5B86E] relative'>
              <h2 className='text-3xl md:text-4xl font-black text-advay-slate tracking-tight mb-2'>Virtual Archery</h2>
              <p className='text-text-secondary font-bold text-lg mb-6'>
                Pinch near the bottom center to grab the bow string.
              </p>
              <button
                type='button'
                onClick={handleStart}
                className='flex flex-col items-center gap-1 mx-auto p-4 rounded-2xl border-3 border-[#F2CC8F] bg-white hover:border-blue-400 hover:scale-105 transition-all shadow-[0_4px_0_#E5B86E] active:scale-95'
              >
                <span className='font-black text-advay-slate text-xl'>Start</span>
              </button>
            </div>
         </div>
      )}
      
      {isPlaying && (
        <div className="absolute top-4 left-4 z-10 text-white font-bold text-2xl drop-shadow-md">
          Score: {gameState.score}
        </div>
      )}
      
      {isPlaying && (
        <div className="absolute top-4 right-4 z-10 bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/50 text-white font-bold text-xl drop-shadow-md">
          Wind
        </div>
      )}

      <div className="w-full h-full flex items-center justify-center pointer-events-none relative z-20">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="max-w-full max-h-[85vh] object-contain w-full drop-shadow-2xl"
          style={{ aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}` }}
        />
      </div>

      {cursor && (
        <GameCursor
          position={cursor}
          coordinateSpace="normalized"
          containerRef={gameAreaRef}
          isPinching={isPinching}
          isHandDetected={isReady}
          size={64}
          color="#22c55e"
        />
      )}
      </div>
    </GameContainer>
  );
}

export default function VirtualArchery() {
  return (
    <GameShell
      gameId="virtual-archery"
      gameName="Virtual Archery"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <VirtualArcheryContent />
    </GameShell>
  );
}
