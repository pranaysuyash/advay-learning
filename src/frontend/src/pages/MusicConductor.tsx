import { useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import {
  LEVELS,
  updateNotes,
  checkNoteHit,
  generatePattern,
  calculateComboScore,
  type ConductorNote,
} from '../games/musicConductorLogic';
import { CelebrationOverlay } from '../components/CelebrationOverlay';

const LANE_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
const HIT_Y = 0.85;

export function MusicConductor() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<ConductorNote[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>(
    'start',
  );
  const [showCelebration, setShowCelebration] = useState(false);
  const [laneActive, setLaneActive] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);

  const startTimeRef = useRef<number>(0);
  const lastNoteTimeRef = useRef<number>(0);
  const animationRef = useRef<number>(0);
  const currentLevelRef = useRef(1);

  const { playClick, playSuccess, playError } = useAudio();
  const { onGameComplete } = useGameDrops('music-conductor');
  useGameSessionProgress({
    gameName: 'Music Conductor',
    score,
    level: currentLevelRef.current,
    isPlaying: gameState === 'playing',
  });

  const level = LEVELS[0];

  useEffect(() => {
    if (gameState === 'playing') {
      startTimeRef.current = Date.now();
      lastNoteTimeRef.current = Date.now();
    }
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    let lastTime = performance.now();

    const gameLoop = () => {
      const now = performance.now();
      const deltaMs = now - lastTime;
      lastTime = now;
      const elapsedMs = Date.now() - startTimeRef.current;

      if (elapsedMs >= level.duration * 1000) {
        handleComplete();
        return;
      }

      const newNotes = generatePattern(
        level,
        elapsedMs,
        lastNoteTimeRef.current,
        level.bpm,
      );
      if (newNotes.length > 0) {
        lastNoteTimeRef.current = elapsedMs;
        setNotes((prev) => [...prev, ...newNotes]);
      }

      setNotes((prev) => updateNotes(prev, deltaMs, 1.2));

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationRef.current);
  }, [gameState, level]);

  const handleLaneTap = useCallback(
    (lane: number) => {
      setLaneActive((prev) => {
        const newPoses = [...prev];
        newPoses[lane] = true;
        return newPoses;
      });

      setNotes((prev) => {
        const { hit, score: noteScore } = checkNoteHit(prev, lane, HIT_Y);
        if (hit) {
          const comboScore = calculateComboScore(noteScore, combo);
          setScore((s) => s + comboScore);
          setCombo((c) => c + 1);
          playClick();
          return prev.map((n) => (n.id === hit.id ? { ...n, hit: true } : n));
        } else {
          setCombo(0);
          playError();
          return prev;
        }
      });

      setTimeout(() => {
        setLaneActive((prev) => {
          const newPoses = [...prev];
          newPoses[lane] = false;
          return newPoses;
        });
      }, 150);
    },
    [combo, playClick, playError],
  );

  const handleStart = useCallback(() => {
    setNotes([]);
    setScore(0);
    setCombo(0);
    setGameState('playing');
    playClick();
  }, [playClick]);

  const handleComplete = useCallback(() => {
    setGameState('complete');
    onGameComplete(score);
    playSuccess();
    setShowCelebration(true);
  }, [score, onGameComplete, playSuccess]);

  const handleBack = useCallback(() => {
    navigate('/games');
  }, [navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      const keyMap: Record<string, number> = { a: 0, s: 1, d: 2, f: 3 };
      if (e.key in keyMap && keyMap[e.key] < level.lanes) {
        handleLaneTap(keyMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, level.lanes, handleLaneTap]);

  return (
    <GameContainer
      title='Music Conductor'
      onHome={handleBack}
      reportSession={false}
    >
      <div className='relative w-full h-full bg-gradient-to-b from-indigo-900 to-purple-900 rounded-lg overflow-hidden'>
        {gameState === 'start' && (
          <div className='absolute inset-0 flex flex-col items-center justify-center z-10'>
            <h2 className='text-4xl font-bold text-white mb-4'>
              Music Conductor
            </h2>
            <p className='text-lg text-indigo-200 mb-8 text-center px-4'>
              Tap the lanes or press A/S/D/F to hit the notes!
            </p>
            <button
              type='button'
              onClick={handleStart}
              className='px-8 py-4 bg-indigo-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-indigo-600 transition-colors'
            >
              Start Conducting!
            </button>
          </div>
        )}

        {gameState === 'complete' && (
          <div className='absolute inset-0 flex flex-col items-center justify-center z-10'>
            <h2 className='text-4xl font-bold text-white mb-4'>
              Amazing Performance!
            </h2>
            <p className='text-2xl text-indigo-200 mb-2'>
              Final Score: {score}
            </p>
            <p className='text-lg text-indigo-300 mb-8'>Combo: {combo}</p>
            <button
              type='button'
              onClick={handleBack}
              className='px-8 py-4 bg-indigo-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-indigo-600 transition-colors'
            >
              Play More Games!
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <>
            <div className='absolute top-4 left-4 text-white'>
              <p className='text-xl'>Combo: {combo}</p>
            </div>

            <div className='absolute top-4 right-4 text-white'>
              <p className='text-xl'>
                Time:{' '}
                {Math.max(
                  0,
                  Math.floor(
                    (level.duration * 1000 -
                      (Date.now() - startTimeRef.current)) /
                      1000,
                  ),
                )}
                s
              </p>
            </div>

            <div className='absolute inset-0 flex'>
              {Array.from({ length: level.lanes }).map((_, i) => (
                <button
                  key={i}
                  type='button'
                  onClick={() => handleLaneTap(i)}
                  className={`flex-1 border-r border-white/20 transition-all ${
                    laneActive[i] ? 'bg-white/40' : 'hover:bg-white/10'
                  }`}
                  style={{
                    backgroundColor: laneActive[i]
                      ? LANE_COLORS[i % LANE_COLORS.length] + '60'
                      : undefined,
                  }}
                />
              ))}
            </div>

            <div
              className='absolute left-0 right-0 h-4'
              style={{
                top: `${HIT_Y * 100}%`,
                backgroundColor: 'rgba(255,255,255,0.3)',
              }}
            />

            {notes.map((note) => (
              <div
                key={note.id}
                className={`absolute w-16 h-16 rounded-full transition-opacity ${
                  note.hit ? 'opacity-50' : ''
                }`}
                style={{
                  left: `${(note.lane / level.lanes) * 100 + (100 / level.lanes / 2 - 8)}%`,
                  top: `${note.y * 100}%`,
                  backgroundColor: LANE_COLORS[note.lane % LANE_COLORS.length],
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}
          </>
        )}

        {showCelebration && (
          <CelebrationOverlay
            show={showCelebration}
            letter='🎵'
            accuracy={100}
            onComplete={() => setShowCelebration(false)}
          />
        )}
      </div>
    </GameContainer>
  );
}
