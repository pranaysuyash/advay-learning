import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import {
  calculateScore,
  calculateTraceAccuracy,
  getLetterData,
  getLetterGuidePoints,
  getLevelConfig,
  getNextLetter,
  isTracingComplete,
  LEVELS,
  type TracePoint,
} from '../games/phonicsTracingLogic';

const CANVAS_SIZE = 400;

export function PhonicsTracing() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentLetter, setCurrentLetter] = useState('S');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [strokePoints, setStrokePoints] = useState<TracePoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [lettersCompleted, setLettersCompleted] = useState(0);
  const [feedback, setFeedback] = useState('Trace the letter and hear the sound!');
  const [showIntro, setShowIntro] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [lastAccuracy, setLastAccuracy] = useState(0);

  const { playClick, playCelebration, playPop } = useAudio();
  const { onGameComplete } = useGameDrops('phonics-tracing');

  const letterData = useMemo(() => getLetterData(currentLetter), [currentLetter]);
  const levelConfig = useMemo(() => getLevelConfig(currentLevel), [currentLevel]);
  const guidePoints = useMemo(() => getLetterGuidePoints(currentLetter), [currentLetter]);

  useGameSessionProgress({
    gameName: 'Phonics Tracing',
    score: totalScore,
    level: currentLevel,
    isPlaying: true,
    metaData: {
      letter: currentLetter,
      last_accuracy: lastAccuracy,
      letters_completed: lettersCompleted,
    },
  });

  const speakLetter = useCallback((letter: string) => {
    const data = getLetterData(letter);
    if (!data) return;

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`${data.ttsIntro} ${data.exampleWord}! ${data.exampleEmoji}`);
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      speechSynthesis.speak(utterance);
    }
  }, []);

  const speakSound = useCallback((letter: string, isTracing: boolean) => {
    const data = getLetterData(letter);
    if (!data) return;

    if ('speechSynthesis' in window) {
      let text = '';
      switch (data.soundType) {
        case 'continuous':
          text = isTracing ? `${data.letter} ${data.letter} ${data.letter}` : data.soundType;
          break;
        case 'burst':
          text = `${data.letter}!`;
          break;
        case 'vowel':
          text = isTracing ? `${data.letter} ${data.letter}` : data.letter;
          break;
        default:
          text = data.letter;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = data.soundType === 'continuous' ? 0.5 : 0.8;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
  }, []);

  useEffect(() => {
    if (showIntro && letterData) {
      const timer = setTimeout(() => {
        speakLetter(currentLetter);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showIntro, letterData, currentLetter, speakLetter]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (guidePoints.length > 0) {
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 12;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.setLineDash([15, 10]);
      ctx.beginPath();
      ctx.moveTo(guidePoints[0].x * CANVAS_SIZE, guidePoints[0].y * CANVAS_SIZE);
      for (let i = 1; i < guidePoints.length; i++) {
        ctx.lineTo(guidePoints[i].x * CANVAS_SIZE, guidePoints[i].y * CANVAS_SIZE);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (letterData) {
      ctx.font = 'bold 200px Fredoke One, Bubblegum Sans, sans-serif';
      ctx.fillStyle = '#E2E8F0';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letterData.letter, CANVAS_SIZE / 2, CANVAS_SIZE / 2);
    }

    if (strokePoints.length > 0) {
      const gradient = ctx.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      gradient.addColorStop(0, '#8B5CF6');
      gradient.addColorStop(1, '#EC4899');
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 16;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(strokePoints[0].x * CANVAS_SIZE, strokePoints[0].y * CANVAS_SIZE);
      for (let i = 1; i < strokePoints.length; i++) {
        ctx.lineTo(strokePoints[i].x * CANVAS_SIZE, strokePoints[i].y * CANVAS_SIZE);
      }
      ctx.stroke();
    }
  }, [strokePoints, guidePoints, letterData]);

  const getPointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>): TracePoint => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)), timestamp: Date.now() };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (showIntro) {
      setShowIntro(false);
      playPop();
      return;
    }

    if (sessionComplete) return;

    setIsDrawing(true);
    const point = getPointFromEvent(event);
    setStrokePoints([point]);

    speakSound(currentLetter, false);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || sessionComplete) return;

    const point = getPointFromEvent(event);
    setStrokePoints((prev) => [...prev, point]);

    if (strokePoints.length > 0 && strokePoints.length % 10 === 0) {
      speakSound(currentLetter, true);
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const complete = isTracingComplete(strokePoints);
    if (complete) {
      const accuracy = calculateTraceAccuracy(strokePoints, currentLetter);
      const roundScore = calculateScore(accuracy, 10, levelConfig.timePerLetter);

      setLastAccuracy(accuracy);
      setScore(roundScore);
      setTotalScore((prev) => prev + roundScore);
      setLettersCompleted((prev) => prev + 1);

      playCelebration();

      if (accuracy >= levelConfig.passThreshold) {
        setFeedback(`Great job! ${currentLetter} sounds like ${letterData?.exampleWord}! ${letterData?.exampleEmoji}`);
        speakLetter(currentLetter);

        setTimeout(() => {
          const next = getNextLetter(currentLetter, currentLevel);
          setCurrentLetter(next);
          setStrokePoints([]);
          setFeedback('Trace the next letter!');
        }, 2000);
      } else {
        setFeedback('Try again! Trace the letter more completely.');
        setTimeout(() => {
          setStrokePoints([]);
          setFeedback('Trace the letter and hear the sound!');
        }, 1500);
      }
    } else {
      setFeedback('Keep tracing! Cover the whole letter.');
    }
  };

  const handleLevelChange = (level: number) => {
    playClick();
    setCurrentLevel(level);
    const config = getLevelConfig(level);
    setCurrentLetter(config.letters[0]);
    setStrokePoints([]);
    setScore(0);
    setTotalScore(0);
    setLettersCompleted(0);
    setShowIntro(true);
    setSessionComplete(false);
  };

  const handleFinish = useCallback(async () => {
    playClick();
    const finalScore = Math.round(totalScore / Math.max(1, lettersCompleted) || 0);
    await onGameComplete(finalScore);
    navigate('/games');
  }, [totalScore, lettersCompleted, onGameComplete, navigate, playClick]);

  const handleRestart = () => {
    playClick();
    setStrokePoints([]);
    setScore(0);
    setTotalScore(0);
    setLettersCompleted(0);
    setShowIntro(true);
    setSessionComplete(false);
    const config = getLevelConfig(currentLevel);
    setCurrentLetter(config.letters[0]);
  };

  return (
    <GameContainer
      title="Phonics Tracing"
      onHome={() => navigate('/games')}
      reportSession={false}
    >
      <div className="flex flex-col items-center gap-4 p-4 max-w-2xl mx-auto">
        <div className="flex gap-2">
          {LEVELS.map((level) => (
            <button
              type="button"
              key={level.level}
              onClick={() => handleLevelChange(level.level)}
              className={`px-4 py-2 rounded-full font-bold transition-all ${currentLevel === level.level
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-slate-50 border-2 border-slate-200 text-slate-700 hover:border-slate-400'
                }`}
            >
              Level {level.level}
            </button>
          ))}
        </div>

        <div className="text-center">
          <p className="text-lg text-gray-700 font-medium">{feedback}</p>
          {letterData && (
            <p className="text-sm text-gray-500 mt-1">
              {letterData.ttsExample} {letterData.exampleEmoji}
            </p>
          )}
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="touch-none cursor-crosshair rounded-2xl shadow-xl border-4 border-purple-200 bg-white"
            style={{ maxWidth: '100%', height: 'auto' }}
          />

          {showIntro && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl">
              <div className="bg-white p-6 rounded-2xl text-center shadow-2xl">
                <p className="text-2xl font-bold text-purple-600 mb-2">
                  Trace {currentLetter}!
                </p>
                <p className="text-gray-600">Tap to start</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 text-center">
          <div className="bg-purple-100 px-4 py-2 rounded-xl">
            <p className="text-sm text-purple-600 font-medium">This Round</p>
            <p className="text-2xl font-bold text-purple-700">{score}</p>
          </div>
          <div className="bg-pink-100 px-4 py-2 rounded-xl">
            <p className="text-sm text-pink-600 font-medium">Total</p>
            <p className="text-2xl font-bold text-pink-700">{totalScore}</p>
          </div>
          <div className="bg-green-100 px-4 py-2 rounded-xl">
            <p className="text-sm text-green-600 font-medium">Letters</p>
            <p className="text-2xl font-bold text-green-700">{lettersCompleted}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleRestart}
            className="px-6 py-3 bg-slate-100 border-2 border-slate-200 hover:bg-slate-200 text-slate-700 rounded-xl font-black transition-all"
          >
            Restart
          </button>
          <button
            type="button"
            onClick={handleFinish}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold shadow-lg transition-all"
          >
            Finish
          </button>
        </div>
      </div>
    </GameContainer>
  );
}
