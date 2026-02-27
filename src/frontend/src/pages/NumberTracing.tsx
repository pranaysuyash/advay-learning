import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import {
  NUMBER_TEMPLATES,
  buildScore,
  calculateTraceCoverage,
  getTemplateForDigit,
  nextDigit,
  type TracePoint,
} from '../games/numberTracingLogic';

const CANVAS_SIZE = 360;

export function NumberTracing() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentDigit, setCurrentDigit] = useState(0);
  const [strokePoints, setStrokePoints] = useState<TracePoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastAccuracy, setLastAccuracy] = useState(0);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [feedback, setFeedback] = useState('Trace the number by following the dotted guide.');

  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { onGameComplete } = useGameDrops('number-tracing');
  const currentTemplate = useMemo(() => getTemplateForDigit(currentDigit), [currentDigit]);

  useGameSessionProgress({
    gameName: 'Number Tracing',
    score,
    level: currentDigit + 1,
    isPlaying: true,
    metaData: {
      digit: currentDigit,
      last_accuracy: lastAccuracy,
      hints_used: hintsUsed,
    },
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentTemplate) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    context.fillStyle = '#F8FAFC';
    context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    context.fillStyle = '#94A3B8';
    currentTemplate.guidePoints.forEach((point) => {
      context.beginPath();
      context.arc(point.x * CANVAS_SIZE, point.y * CANVAS_SIZE, 7, 0, Math.PI * 2);
      context.fill();
    });

    context.strokeStyle = '#60A5FA';
    context.lineWidth = 8;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    if (strokePoints.length > 0) {
      context.beginPath();
      context.moveTo(strokePoints[0].x * CANVAS_SIZE, strokePoints[0].y * CANVAS_SIZE);
      for (let i = 1; i < strokePoints.length; i += 1) {
        context.lineTo(strokePoints[i].x * CANVAS_SIZE, strokePoints[i].y * CANVAS_SIZE);
      }
      context.stroke();
    }
  }, [currentTemplate, strokePoints]);

  const getPointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>): TracePoint => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    return {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setStrokePoints([getPointFromEvent(event)]);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setStrokePoints((prev) => [...prev, getPointFromEvent(event)]);
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    setStrokePoints([]);
    setFeedback('Canvas cleared. Try tracing again.');
    playClick();
  };

  const handleHint = () => {
    setHintsUsed((prev) => prev + 1);
    setFeedback('Hint: start at the top and follow each dotted point in order.');
    playClick();
  };

  const handleCheck = () => {
    if (!currentTemplate) return;
    const accuracy = calculateTraceCoverage(strokePoints, currentTemplate.guidePoints);
    setLastAccuracy(accuracy);

    if (accuracy >= 70) {
      const roundScore = buildScore(accuracy, hintsUsed);
      const nextValue = score + roundScore;
      setScore(nextValue);
      setFeedback(`Great tracing! ${accuracy}% accuracy.`);
      playSuccess();

      if (currentDigit === 9) {
        playCelebration();
        onGameComplete(nextValue);
        setFeedback('Awesome! You completed all digits 0 to 9.');
      } else {
        setCurrentDigit(nextDigit(currentDigit));
        setStrokePoints([]);
      }
      setHintsUsed(0);
      return;
    }

    setFeedback(`Keep practicing. Accuracy: ${accuracy}% (need 70%).`);
    playError();
  };

  return (
    <GameContainer
      title='Number Tracing'
      score={score}
      level={currentDigit + 1}
      onHome={() => navigate('/games')}
      showScore
      reportSession={false}
    >
      <div className='h-full overflow-auto p-4 md:p-6'>
        <div className='max-w-5xl mx-auto space-y-4'>
          <section className='bg-white rounded-2xl border-2 border-[#F2CC8F] p-4 shadow-[0_4px_0_#E5B86E]'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div>
                <p className='text-sm font-black uppercase tracking-wide text-slate-500'>
                  Trace this number
                </p>
                <h2 className='text-5xl font-black text-slate-900'>
                  {currentTemplate?.digit}
                </h2>
                <p className='text-lg font-bold text-slate-700'>{currentTemplate?.name}</p>
              </div>
              <div className='text-right text-sm font-black text-slate-700'>
                <p>Last accuracy: {lastAccuracy}%</p>
                <p>Hints used: {hintsUsed}</p>
                <p>Progress: {currentDigit + 1}/10</p>
              </div>
            </div>
            <p className='mt-3 text-sm font-bold text-slate-600'>{feedback}</p>
          </section>

          <section className='bg-white rounded-2xl border-2 border-[#F2CC8F] p-4 shadow-[0_4px_0_#E5B86E] flex flex-col items-center gap-4'>
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className='w-full max-w-[360px] rounded-2xl border-2 border-slate-200 touch-none bg-slate-50'
            />
            <div className='flex flex-wrap gap-2 justify-center'>
              <button
                type='button'
                onClick={handleHint}
                className='px-4 py-2 rounded-xl border-2 border-[#F2CC8F] bg-white font-black'
              >
                Hint
              </button>
              <button
                type='button'
                onClick={handleClear}
                className='px-4 py-2 rounded-xl border-2 border-[#F2CC8F] bg-white font-black'
              >
                Clear
              </button>
              <button
                type='button'
                onClick={handleCheck}
                className='px-5 py-2 rounded-xl bg-[#3B82F6] text-white font-black'
              >
                Check Trace
              </button>
            </div>
            <div className='flex flex-wrap gap-2 justify-center'>
              {NUMBER_TEMPLATES.map((template) => (
                <button
                  key={template.digit}
                  type='button'
                  onClick={() => {
                    setCurrentDigit(template.digit);
                    setStrokePoints([]);
                    setHintsUsed(0);
                    setFeedback('Trace the number by following the dotted guide.');
                    playClick();
                  }}
                  className={`w-9 h-9 rounded-full border-2 font-black ${
                    template.digit === currentDigit
                      ? 'bg-[#3B82F6] text-white border-[#3B82F6]'
                      : 'bg-white border-[#F2CC8F] text-slate-700'
                  }`}
                >
                  {template.digit}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </GameContainer>
  );
}
