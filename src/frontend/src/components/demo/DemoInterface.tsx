import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '../../store';
import { Button } from '../ui/Button';
import { UIIcon } from '../ui/Icon';
import { hasBasicCameraSupport } from '../../utils/featureDetection';

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface DemoInterfaceProps {
  onComplete?: () => void;
  onExit?: () => void;
}

export function DemoInterface({ onComplete, onExit }: DemoInterfaceProps) {
  const { demoMode } = useSettingsStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLetter, setCurrentLetter] = useState('A');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([]);

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Check if we should show demo interface (no camera support or demo mode)
  const shouldShowDemo = demoMode && !hasBasicCameraSupport();

  useEffect(() => {
    if (!shouldShowDemo) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#3B82F6'; // Blue color
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [shouldShowDemo, currentLetter]);

  const getCanvasCoordinates = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      let clientX: number, clientY: number;

      if ('touches' in e) {
        clientX = e.touches[0]?.clientX || e.changedTouches[0]?.clientX || 0;
        clientY = e.touches[0]?.clientY || e.changedTouches[0]?.clientY || 0;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    [],
  );

  const startDrawing = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      setIsDrawing(true);
      const coords = getCanvasCoordinates(e);
      setTouchPoints([{ x: coords.x, y: coords.y, timestamp: Date.now() }]);
    },
    [getCanvasCoordinates],
  );

  const draw = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      if (!isDrawing) return;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const coords = getCanvasCoordinates(e);
      const newPoint = { x: coords.x, y: coords.y, timestamp: Date.now() };

      // Draw line
      ctx.beginPath();
      if (touchPoints.length > 0) {
        const lastPoint = touchPoints[touchPoints.length - 1];
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      }

      setTouchPoints((prev) => [...prev, newPoint]);
    },
    [isDrawing, getCanvasCoordinates, touchPoints],
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Simple scoring based on number of touch points (more points = better attempt)
    const attemptScore = Math.min(touchPoints.length / 10, 10); // Max 10 points
    setScore((prev) => prev + Math.round(attemptScore));
    setAttempts((prev) => prev + 1);

    // Clear touch points after a delay
    setTimeout(() => {
      setTouchPoints([]);
      // Clear canvas
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }, 1000);
  }, [isDrawing, touchPoints.length]);

  const nextLetter = () => {
    const currentIndex = letters.indexOf(currentLetter);
    if (currentIndex < letters.length - 1) {
      setCurrentLetter(letters[currentIndex + 1]);
    } else {
      // Completed all letters
      onComplete?.();
    }
  };

  const resetDemo = () => {
    setCurrentLetter('A');
    setScore(0);
    setAttempts(0);
    setTouchPoints([]);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Don't render if not in demo mode or if camera is supported
  if (!shouldShowDemo) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className='max-w-4xl mx-auto p-6 space-y-6'
      >
        {/* Header */}
        <div className='text-center space-y-2'>
          <h2 className='text-3xl font-bold text-text-primary'>
            Touch & Draw Demo
          </h2>
          <p className='text-text-secondary'>
            Practice letter tracing with touch gestures
          </p>
        </div>

        {/* Instructions */}
        <AnimatePresence>
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className='bg-blue-50 border border-blue-200 rounded-lg p-4'
            >
              <div className='flex justify-between items-start'>
                <div className='space-y-2'>
                  <h3 className='font-semibold text-blue-900 flex items-center gap-2'>
                    <UIIcon name='sparkles' size={20} />
                    How to Play
                  </h3>
                  <ul className='text-sm text-blue-800 space-y-1'>
                    <li>• Touch and drag on the canvas to draw the letter</li>
                    <li>• Try to trace the shape of the current letter</li>
                    <li>• Longer traces earn more points!</li>
                    <li>• Use one finger for best results</li>
                  </ul>
                </div>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => setShowInstructions(false)}
                  aria-label='Hide instructions'
                >
                  <UIIcon name='x' size={16} />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Letter Display */}
        <div className='text-center'>
          <div className='inline-block bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 shadow-lg'>
            <span className='text-8xl font-bold text-gray-800 select-none'>
              {currentLetter}
            </span>
          </div>
          <p className='mt-4 text-text-secondary'>
            Trace this letter by touching and dragging on the canvas below
          </p>
        </div>

        {/* Drawing Canvas */}
        <div className='relative'>
          <canvas
            ref={canvasRef}
            className='w-full h-64 border-2 border-dashed border-gray-300 rounded-lg bg-white touch-none'
            style={{ touchAction: 'none' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            aria-label={`Drawing canvas for letter ${currentLetter}`}
            role='img'
          />

          {/* Touch indicator */}
          {isDrawing && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className='absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium'
            >
              Drawing...
            </motion.div>
          )}
        </div>

        {/* Score and Progress */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='bg-white rounded-lg p-4 text-center shadow-sm border'>
            <div className='text-2xl font-bold text-blue-600'>{score}</div>
            <div className='text-sm text-text-secondary'>Points</div>
          </div>
          <div className='bg-white rounded-lg p-4 text-center shadow-sm border'>
            <div className='text-2xl font-bold text-green-600'>{attempts}</div>
            <div className='text-sm text-text-secondary'>Attempts</div>
          </div>
          <div className='bg-white rounded-lg p-4 text-center shadow-sm border'>
            <div className='text-2xl font-bold text-purple-600'>
              {letters.indexOf(currentLetter) + 1}
            </div>
            <div className='text-sm text-text-secondary'>Letter</div>
          </div>
          <div className='bg-white rounded-lg p-4 text-center shadow-sm border'>
            <div className='text-2xl font-bold text-orange-600'>
              {Math.round(
                ((letters.indexOf(currentLetter) + 1) / letters.length) * 100,
              )}
              %
            </div>
            <div className='text-sm text-text-secondary'>Progress</div>
          </div>
        </div>

        {/* Controls */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Button
            onClick={nextLetter}
            disabled={attempts === 0}
            className='flex-1 sm:flex-none'
          >
            <UIIcon name='chevron-down' size={16} className='mr-2' />
            Next Letter
          </Button>

          <Button
            variant='secondary'
            onClick={resetDemo}
            className='flex-1 sm:flex-none'
          >
            <UIIcon name='rotate-ccw' size={16} className='mr-2' />
            Reset
          </Button>

          {!showInstructions && (
            <Button
              variant='ghost'
              onClick={() => setShowInstructions(true)}
              className='flex-1 sm:flex-none'
            >
              <UIIcon name='sparkles' size={16} className='mr-2' />
              Show Help
            </Button>
          )}

          <Button
            variant='secondary'
            onClick={onExit}
            className='flex-1 sm:flex-none'
          >
            <UIIcon name='x' size={16} className='mr-2' />
            Exit Demo
          </Button>
        </div>

        {/* Accessibility note */}
        <div className='text-center text-sm text-text-secondary'>
          <p>
            This demo works entirely with touch input - no camera required! Try
            it on your phone or tablet for the best experience.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
