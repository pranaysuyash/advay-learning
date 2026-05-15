import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { GameContainer } from '../../components/GameContainer';
import { GameControls } from '../../components/GameControls';
import type { GameControl } from '../../components/GameControls';
import { GameShell } from '../../components/GameShell';
import { GameCursor } from '../../components/game/GameCursor';
import { useGameCompletion } from '../../hooks/useGameCompletion';
import { useGameHandTracking } from '../../hooks/useGameHandTracking';
import { useAudio } from '../../utils/hooks/useAudio';
import { useTTS } from '../../hooks/useTTS';
import { VoiceInstructions } from '../../components/game/VoiceInstructions';
import { triggerHaptic } from '../../utils/haptics';
import type { TrackedHandFrame } from '../../utils/handTrackingFrame';

/**
 * PatternPop3D2 - Pop bubbles in the correct pattern sequence
 *
 * Game Mechanics:
 * - Watch the pattern sequence
 * - Pop bubbles in the same order
 * - Progressive difficulty
 */

interface Bubble3D {
  id: number;
  x: number;
  y: number;
  z: number;
  color: string;
  popped: boolean;
  popping: boolean;
}

interface Pattern {
  sequence: number[];
  speed: number;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
const BUBBLE_COUNT = 9;

function createBubbles(): Bubble3D[] {
  const bubbles: Bubble3D[] = [];
  for (let i = 0; i < BUBBLE_COUNT; i++) {
    const angle = (i / BUBBLE_COUNT) * Math.PI * 2;
    const radius = 180;
    bubbles.push({
      id: i,
      x: 400 + Math.cos(angle) * radius,
      y: 300 + Math.sin(angle) * radius * 0.7,
      z: Math.random() * 50,
      color: COLORS[i % COLORS.length],
      popped: false,
      popping: false,
    });
  }
  return bubbles;
}

function generatePattern(level: number): Pattern {
  const length = Math.min(3 + level, 7);
  const sequence: number[] = [];
  for (let i = 0; i < length; i++) {
    sequence.push(Math.floor(Math.random() * BUBBLE_COUNT));
  }
  return { sequence, speed: 1000 - level * 100 };
}

const PatternPop3D2Content = memo(function PatternPop3D2Component() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [bubbles, setBubbles] = useState<Bubble3D[]>(createBubbles());
  const [pattern, setPattern] = useState<Pattern>({ sequence: [], speed: 1000 });
  const [playerIndex, setPlayerIndex] = useState(0);
  const [showingPattern, setShowingPattern] = useState(true);
  const [patternIndex, setPatternIndex] = useState(0);
  const [feedback, setFeedback] = useState('Watch the pattern...');
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const { playPop, playFanfare, playError } = useAudio();
  const { speak } = useTTS();
  const { completeGame } = useGameCompletion('pattern-pop-3d-2');

  const startLevel = useCallback((newLevel: number) => {
    const newPattern = generatePattern(newLevel);
    setPattern(newPattern);
    setPlayerIndex(0);
    setPatternIndex(0);
    setShowingPattern(true);
    setFeedback('Watch carefully...');
    speak(`Level ${newLevel}. Watch the pattern.`);

    // Reset bubbles
    setBubbles(createBubbles());

    // Show pattern
    const showPattern = () => {
      if (patternIndex >= newPattern.sequence.length) {
        setShowingPattern(false);
        setFeedback('Your turn! Pop the bubbles in order.');
        speak('Your turn!');
        return;
      }

      const bubbleId = newPattern.sequence[patternIndex];
      setBubbles(prev => prev.map(b =>
        b.id === bubbleId ? { ...b, popping: true } : b
      ));

      setTimeout(() => {
        setBubbles(prev => prev.map(b =>
          b.id === bubbleId ? { ...b, popping: false } : b
        ));
        setPatternIndex(prev => prev + 1);
        setTimeout(showPattern, 500);
      }, 600);
    };

    setTimeout(showPattern, 1000);
  }, [speak]);

  useEffect(() => {
    startLevel(1);
  }, [startLevel]);

  // Handle frame updates for cursor tracking and pinch detection
  const handleFrame = useCallback((frame: TrackedHandFrame) => {
    // Update cursor position
    const tip = frame.indexTip;
    if (tip) {
      setCursor(tip);
    } else if (cursor !== null) {
      setCursor(null);
    }

    // Handle pinch for popping bubbles
    if (!isPlaying || showingPattern || frame.pinch.transition !== 'start' || !tip) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const x = tip.x * canvas.width;
    const y = tip.y * canvas.height;

    // Find bubble under cursor
    const clickedBubble = bubbles.find(b => {
      if (b.popped || b.popping) return false;
      const dx = x - b.x;
      const dy = y - b.y;
      return Math.sqrt(dx * dx + dy * dy) < 35;
    });

    if (clickedBubble) {
      const expectedId = pattern.sequence[playerIndex];

      if (clickedBubble.id === expectedId) {
        // Correct!
        setBubbles(prev => prev.map(b =>
          b.id === clickedBubble.id ? { ...b, popped: true, popping: true } : b
        ));
        playPop();
        triggerHaptic('light');

        const newPlayerIndex = playerIndex + 1;
        setPlayerIndex(newPlayerIndex);

        if (newPlayerIndex >= pattern.sequence.length) {
          // Level complete!
          setFeedback('Perfect! Next level!');
          playFanfare();
          triggerHaptic('success');
          setScore(prev => prev + pattern.sequence.length * 10);
          speak('Amazing!');

          setTimeout(() => {
            if (level >= 5) {
              completeGame({ score: score + pattern.sequence.length * 10 });
            } else {
              const newLevel = level + 1;
              setLevel(newLevel);
              startLevel(newLevel);
            }
          }, 1500);
        }
      } else {
        // Wrong!
        playError();
        setFeedback('Wrong! Start over.');
        speak('Oops! Wrong one.');
        triggerHaptic('error');
        setPlayerIndex(0);
        setBubbles(prev => prev.map(b => ({ ...b, popped: false })));

        setTimeout(() => {
          startLevel(level);
        }, 1500);
      }
    }
  }, [isPlaying, showingPattern, bubbles, pattern, playerIndex, level, score, playPop, playError, playFanfare, speak, triggerHaptic, startLevel, cursor]);

  const { isReady, startTracking } = useGameHandTracking({
    gameName: 'PatternPop3D2',
    targetFps: 30,
    isRunning: isPlaying,
    onFrame: handleFrame,
  });

  // Auto-start tracking when playing
  useEffect(() => {
    if (isPlaying && isReady) {
      void startTracking();
    }
  }, [isPlaying, isReady, startTracking]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 3D gradient background
      const gradient = ctx.createRadialGradient(400, 300, 0, 400, 300, 500);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Sort by z for depth
      const sorted = [...bubbles].sort((a, b) => a.z - b.z);

      sorted.forEach(bubble => {
        if (bubble.popped && !bubble.popping) return;

        // Animate pop
        if (bubble.popped) {
          bubble.popping = false;
        }

        const scale = bubble.popping ? 1.3 : 1;
        const baseSize = 35 * scale;
        const alpha = bubble.popped ? 0.7 : 1;

        // Shadow
        ctx.beginPath();
        ctx.arc(bubble.x + 5, bubble.y + 5, baseSize, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fill();

        // Bubble body
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, baseSize, 0, Math.PI * 2);

        // 3D gradient
        const bubbleGrad = ctx.createRadialGradient(
          bubble.x - baseSize / 3, bubble.y - baseSize / 3, 0,
          bubble.x, bubble.y, baseSize
        );
        bubbleGrad.addColorStop(0, `rgba(255,255,255,${alpha})`);
        bubbleGrad.addColorStop(0.3, `${bubble.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
        bubbleGrad.addColorStop(1, `rgba(0,0,0,${alpha * 0.3})`);

        ctx.fillStyle = bubbleGrad;
        ctx.fill();

        // Highlight
        if (!bubble.popped) {
          ctx.beginPath();
          ctx.arc(bubble.x - baseSize / 3, bubble.y - baseSize / 3, baseSize / 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.fill();

          // Number
          ctx.fillStyle = 'white';
          ctx.font = `bold ${20 * scale}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(bubble.id.toString(), bubble.x, bubble.y);
        }
      });

      // Pattern display
      if (showingPattern && pattern.sequence.length > 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(200, 20, 400, 50);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Pattern: ${pattern.sequence.join(' → ')}`, 400, 50);
      }

      // Progress
      if (!showingPattern) {
        ctx.fillStyle = 'white';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Progress: ${playerIndex} / ${pattern.sequence.length}`, 400, 55);
      }
    };

    const animate = () => {
      render();
      requestAnimationFrame(animate);
    };
    animate();
  }, [bubbles, pattern, showingPattern, patternIndex, playerIndex]);

  const handleStart = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handleExit = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const controls: GameControl[] = [
    { id: 'start', icon: 'play', label: 'Start', onClick: handleStart, variant: 'primary' },
    { id: 'exit', icon: 'home', label: 'Exit', onClick: handleExit },
  ];

  return (
    <GameShell gameId="pattern-pop-3d-2" gameName="Pattern Pop 3D">
      <GameContainer title="Pattern Pop 3D" onHome={handleExit}>
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
          {!isPlaying ? (
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4 text-white">✨ Pattern Pop 3D</h1>
              <p className="text-xl mb-4 text-white">Watch the pattern, then pop bubbles in order!</p>
              <VoiceInstructions
                instructions="Watch which bubbles highlight, then pinch them in the same sequence"
              />
            </div>
          ) : (
            <>
              {/* Score */}
              <div className="absolute top-4 left-4 bg-white/90 rounded-lg p-4 shadow">
                <p className="text-lg font-bold">Level: {level}</p>
                <p className="text-lg font-bold">Score: {score}</p>
              </div>

              {/* Canvas */}
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="rounded-lg shadow-2xl"
              />

              {/* Feedback */}
              <div className="absolute bottom-24 bg-white/90 rounded-lg px-6 py-3">
                <p className="text-lg font-semibold">{feedback}</p>
              </div>
            </>
          )}

          {cursor && <GameCursor position={cursor} coordinateSpace="normalized" />}
        </div>

        <GameControls controls={controls} />
      </GameContainer>
    </GameShell>
  );
});

export default function PatternPop3D2() {
  return <PatternPop3D2Content />;
}
