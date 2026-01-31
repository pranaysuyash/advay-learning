import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UIIcon } from '../components/ui/Icon';
import { Mascot } from '../components/Mascot';

interface Dot {
  id: number;
  x: number;
  y: number;
  connected: boolean;
  number: number;
}

export function ConnectTheDots() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dots, setDots] = useState<Dot[]>([]);
  const [currentDotIndex, setCurrentDotIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60); // 60 seconds per level
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [level, setLevel] = useState<number>(1);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  // Initialize dots for the current level
  useEffect(() => {
    if (!gameStarted) return;

    const numDots = Math.min(5 + level * 2, 15); // Increase dots with level, max 15
    const newDots: Dot[] = [];

    for (let i = 0; i < numDots; i++) {
      // Generate random positions within the canvas bounds
      const x = 100 + Math.random() * 600; // Canvas width is 800
      const y = 100 + Math.random() * 400; // Canvas height is 600
      
      newDots.push({
        id: i,
        x,
        y,
        connected: false,
        number: i + 1
      });
    }

    setDots(newDots);
    setCurrentDotIndex(0);
  }, [level, gameStarted]);

  // Timer effect
  useEffect(() => {
    if (!gameStarted || timeLeft <= 0 || gameCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, timeLeft, gameCompleted]);

  // Check if level is completed
  useEffect(() => {
    if (dots.length > 0 && dots.every(dot => dot.connected)) {
      // Level completed
      setScore(prev => prev + timeLeft * 10); // Bonus points for remaining time
      setTimeout(() => {
        if (level >= 5) {
          setGameCompleted(true);
        } else {
          setLevel(prev => prev + 1);
          setTimeLeft(60); // Reset timer for next level
        }
      }, 2000);
    }
  }, [dots, timeLeft, level]);

  const startGame = () => {
    setGameStarted(true);
    setGameCompleted(false);
    setScore(0);
    setLevel(1);
    setTimeLeft(60);
  };

  const handleDotClick = (dotId: number) => {
    if (!gameStarted || gameCompleted) return;
    
    // Check if clicked the correct next dot
    if (dotId === currentDotIndex) {
      const updatedDots = [...dots];
      updatedDots[dotId] = { ...updatedDots[dotId], connected: true };
      setDots(updatedDots);
      
      if (currentDotIndex < dots.length - 1) {
        setCurrentDotIndex(prev => prev + 1);
      }
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setDots([]);
    setCurrentDotIndex(0);
    setScore(0);
    setLevel(1);
    setTimeLeft(60);
  };

  const goToHome = () => {
    navigate('/dashboard');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Connect The Dots</h1>
            <p className="text-white/60">Connect the numbered dots in sequence to reveal the picture!</p>
          </div>
          
          <div className="text-right">
            <output className="block text-2xl font-bold">Score: {score}</output>
            <div className="flex items-center gap-4 text-sm text-white/60">
              <span>Level: {level}</span>
              <span>Time: {timeLeft}s</span>
            </div>
          </div>
        </header>

        {/* Game Area */}
        <div className="bg-white/10 border border-border rounded-xl p-6 mb-6 shadow-sm">
          {!gameStarted ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-24 h-24 mx-auto mb-6">
                <img
                  src="/assets/images/connect-the-dots.svg"
                  alt="Connect the Dots"
                  className="w-full h-full object-contain"
                />
              </div>
              
              <h2 className="text-2xl font-semibold mb-4">Connect the Dots Challenge</h2>
              <p className="text-white/70 mb-6 max-w-md text-center">
                Connect the numbered dots in sequence to reveal the hidden picture. 
                Complete levels as fast as you can to earn more points!
              </p>
              
              <div className="mb-6 w-full max-w-md">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Difficulty
                </label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        difficulty === diff
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                      }`}
                    >
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={goToHome}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold transition shadow-lg flex items-center gap-2"
                >
                  <UIIcon name="home" size={20} />
                  Home
                </button>
                <button
                  onClick={startGame}
                  className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/30 transition shadow-red-900/20"
                >
                  Start Game
                </button>
              </div>
            </div>
          ) : gameCompleted ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-24 h-24 mx-auto mb-6">
                <img
                  src="/assets/images/trophy.svg"
                  alt="Trophy"
                  className="w-full h-full object-contain"
                />
              </div>
              
              <h2 className="text-3xl font-bold text-green-400 mb-2">Congratulations!</h2>
              <p className="text-xl mb-6">You completed all levels!</p>
              <div className="text-2xl font-bold mb-8">Final Score: {score}</div>
              
              <div className="flex gap-4">
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition"
                >
                  Play Again
                </button>
                <button
                  onClick={goToHome}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition"
                >
                  Home
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <figure className="relative bg-black rounded-xl overflow-hidden aspect-[4/3] shadow-2xl border-4 border-orange-400/30 m-0">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="w-full h-full"
                  onClick={(e) => {
                    if (!canvasRef.current) return;
                    
                    const rect = canvasRef.current.getBoundingClientRect();
                    // Canvas internal coordinates are fixed (800x600). The element is responsive,
                    // so map from CSS pixels → canvas pixels to keep hit-testing correct.
                    const scaleX = canvasRef.current.width / rect.width;
                    const scaleY = canvasRef.current.height / rect.height;
                    const x = (e.clientX - rect.left) * scaleX;
                    const y = (e.clientY - rect.top) * scaleY;
                    
                    // Find the closest dot within a certain radius
                    const radius = 30;
                    for (let i = 0; i < dots.length; i++) {
                      const dot = dots[i];
                      const distance = Math.sqrt(Math.pow(x - dot.x, 2) + Math.pow(y - dot.y, 2));
                      
                      if (distance <= radius) {
                        handleDotClick(i);
                        break;
                      }
                    }
                  }}
                />
                
                {/* Draw dots and lines */}
                {dots.length > 0 && (
                  <svg 
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    width="800" 
                    height="600"
                  >
                    {/* Draw connecting lines */}
                    {dots.slice(0, -1).map((dot, index) => {
                      if (dot.connected && dots[index + 1].connected) {
                        return (
                          <line
                            key={`line-${index}`}
                            x1={dot.x}
                            y1={dot.y}
                            x2={dots[index + 1].x}
                            y2={dots[index + 1].y}
                            stroke="#EF4444"
                            strokeWidth="3"
                          />
                        );
                      }
                      return null;
                    })}
                    
                    {/* Draw dots */}
                    {dots.map((dot) => (
                      <g key={dot.id}>
                        <circle
                          cx={dot.x}
                          cy={dot.y}
                          r={dot.id === currentDotIndex ? 20 : 15}
                          fill={dot.connected ? "#10B981" : "#EF4444"}
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                        <text
                          x={dot.x}
                          y={dot.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#FFFFFF"
                          fontSize="14"
                          fontWeight="bold"
                        >
                          {dot.number}
                        </text>
                      </g>
                    ))}
                  </svg>
                )}
                
                {/* Game Controls Overlay */}
                <fieldset className="absolute top-4 right-4 flex gap-2 border-0 p-0 m-0" aria-label="Game controls">
                  <legend className="sr-only">Game Controls</legend>
                  <button
                    onClick={goToHome}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 rounded-lg transition text-sm font-semibold shadow-lg flex items-center gap-2"
                  >
                    <UIIcon name="home" size={16} />
                    Home
                  </button>
                  <button
                    onClick={resetGame}
                    className="px-4 py-2 bg-white/10 border border-border rounded-lg hover:bg-white/20 transition text-sm font-semibold backdrop-blur"
                  >
                    Reset
                  </button>
                </fieldset>
                
                {/* Current Target Indicator */}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-sm font-bold border border-border flex items-center gap-1">
                  <UIIcon name="target" size={14} />
                  Connect: {currentDotIndex + 1}
                </div>
                
                {/* Mascot */}
                <div className="absolute bottom-4 left-4 z-20">
                  <Mascot 
                    state={currentDotIndex === 0 ? 'idle' : 'happy'} 
                    message={`Connect to dot #${currentDotIndex + 1}`}
                  />
                </div>
              </figure>
              
              <div className="mt-4 text-center text-white/60 text-sm font-medium">
                Click on the numbered dots in sequence (1, 2, 3...) to connect them!
              </div>
            </div>
          )}
        </div>
        
        {/* Game Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-3 text-blue-400">How to Play</h2>
          <ul className="space-y-2 text-white/70 text-sm">
            <li>• Connect the numbered dots in ascending order (1, 2, 3...)</li>
            <li>• Complete each level as fast as you can to earn bonus points</li>
            <li>• Levels get progressively harder with more dots to connect</li>
            <li>• Finish all 5 levels to win the game!</li>
          </ul>
        </div>
      </motion.div>
    </section>
  );
}
