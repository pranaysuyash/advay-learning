/**
 * Sound Garden Game
 *
 * Create music by touching flowers that play different notes!
 *
 * @ticket TCK-20260310-014
 */

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameShell } from '../components/GameShell';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useTTS } from '../hooks/useTTS';
import { triggerHaptic, HAPTIC_TYPES } from '../utils/haptics';
import { KenneyIcon } from '../components/ui/KenneyIcon';
import {
  FLOWERS,
  type Flower,
  calculateScore,
  calculateStars,
} from '../games/soundGardenLogic';

const NOTES_TO_PLAY = 15;

function SoundGardenGame() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [playedNotes, setPlayedNotes] = useState<Flower[]>([]);
  const [score, setScore] = useState(0);
  const [showNotePopup, setShowNotePopup] = useState<{ note: string; x: number; y: number } | null>(null);
  const [activeFlowers, setActiveFlowers] = useState<Flower[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const { playCelebration } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { completeGame } = useGameCompletion('sound-garden');

  useGameSessionProgress({
    gameName: 'Sound Garden',
    score,
    level: 1,
    isPlaying: gameState === 'playing',
    metaData: { notesPlayed: playedNotes.length },
  });

  const speakText = useCallback((text: string) => {
    if (ttsEnabled) {
      speak(text);
    }
  }, [speak, ttsEnabled]);

  const playNote = useCallback((flower: Flower) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = flower.frequency;
    oscillator.type = flower.instrument === 'drum' ? 'square' : 'sine';
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  }, []);

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  const startGame = () => {
    initAudio();
    setPlayedNotes([]);
    setScore(0);
    setActiveFlowers([...FLOWERS]);
    setGameState('playing');
    speakText('Touch the flowers to play music!');
  };

  const handleFlowerTouch = useCallback((flower: Flower, x: number, y: number) => {
    if (gameState !== 'playing') return;
    
    playNote(flower);
    triggerHaptic(HAPTIC_TYPES.SUCCESS);
    
    const newPlayed = [...playedNotes, flower];
    setPlayedNotes(newPlayed);
    setScore(calculateScore(newPlayed.length));
    
    setShowNotePopup({ note: flower.note, x, y });
    setTimeout(() => setShowNotePopup(null), 500);
    
    if (newPlayed.length >= NOTES_TO_PLAY) {
      setGameState('complete');
      playCelebration();
      (async () => {
        await completeGame({ score: calculateScore(newPlayed.length), level: 1 });
      })();
      speakText('Beautiful music! Great job!');
    }
  }, [gameState, playedNotes, playNote, playCelebration, completeGame, speakText]);

  const handlePlayAgain = () => {
    startGame();
  };

  const handleFinish = () => {
    navigate('/games');
  };

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const stars = calculateStars(playedNotes.length);

  return (
    <div 
      className="fixed inset-0 overflow-hidden"
      role="application"
      aria-label="Sound Garden Game"
      style={{
        background: 'linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 50%, #81C784 100%)',
      }}
    >
      {/* Note popup */}
      <AnimatePresence>
        {showNotePopup && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 0 }}
            animate={{ scale: 1.5, opacity: 1, y: -50 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed pointer-events-none text-4xl font-black text-purple-600"
            style={{ left: showNotePopup.x, top: showNotePopup.y }}
          >
            {showNotePopup.note}♫
          </motion.div>
        )}
      </AnimatePresence>

      {/* Start Screen */}
      {gameState === 'start' && (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="text-4xl font-black text-green-700 mb-4">♫ ♪ ♫</div>
            <h1 className="text-4xl font-black text-green-700 mb-4">
              Sound Garden!
            </h1>
            <p className="text-xl text-green-600 mb-8 max-w-md">
              Touch the flowers to play beautiful music! Create your own melody!
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {FLOWERS.slice(0, 5).map((flower) => (
              <motion.div
                key={flower.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2 shadow-md"
              >
                <span className="text-2xl">{flower.emoji}</span>
                <span className="font-bold text-green-700">{flower.note}</span>
              </motion.div>
            ))}
          </div>

          <button
            type="button"
            onClick={startGame}
            className="px-10 py-5 bg-green-500 hover:bg-green-600 text-white rounded-3xl font-black text-2xl shadow-lg transition-all transform hover:scale-105"
          >
            Start Playing! 🎹
          </button>
        </div>
      )}

      {/* Playing Screen */}
      {gameState === 'playing' && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-4">
            <button
              type="button"
              onClick={() => navigate('/games')}
              className="px-4 py-2 bg-white rounded-xl font-bold text-green-600 shadow"
            >
              ← Exit
            </button>
            <div className="text-lg font-bold text-green-700">
              {playedNotes.length} / {NOTES_TO_PLAY} notes
            </div>
          </div>

          {/* Progress */}
          <div className="w-full bg-gray-200 h-2 mb-4">
            <motion.div
              className="h-full bg-green-500"
              animate={{ width: `${(playedNotes.length / NOTES_TO_PLAY) * 100}%` }}
            />
          </div>

          {/* Garden Grid */}
          <div className="flex-1 p-4 grid grid-cols-4 gap-4 content-center">
            {activeFlowers.map((flower, idx) => (
              <motion.button
                key={flower.id}
                type="button"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  y: [0, -10, 0],
                }}
                transition={{ 
                  delay: idx * 0.05,
                  y: { repeat: Infinity, duration: 2 + idx * 0.2 }
                }}
                whileTap={{ scale: 0.8 }}
                onClick={(e) => handleFlowerTouch(flower, e.clientX, e.clientY)}
                className="aspect-square rounded-3xl flex flex-col items-center justify-center shadow-lg"
                style={{ backgroundColor: flower.color + '60' }}
              >
                <span className="text-5xl">{flower.emoji}</span>
                <span className="font-bold text-gray-700 mt-1">{flower.note}</span>
              </motion.button>
            ))}
          </div>

          {/* Played melody */}
          <div className="p-4 bg-white/50">
            <p className="text-sm text-green-600 font-bold mb-2">Your melody:</p>
            <div className="flex flex-wrap gap-1">
              {playedNotes.slice(-10).map((note, idx) => (
                <span key={`melody-${note.id}-${idx}`} className="text-2xl">{note.emoji}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Complete Screen */}
      {gameState === 'complete' && (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <div className="flex justify-center gap-2 mb-4">
              <KenneyIcon type="star" size={64} />
              <KenneyIcon type="heart" size={64} />
              <KenneyIcon type="star" size={64} />
            </div>
            <h2 className="text-4xl font-black text-green-600 mb-2">
              Beautiful Music!
            </h2>
            <p className="text-xl text-green-600 mb-6">
              You played {playedNotes.length} notes!
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-6">
              <motion.span
                key="star-s-0"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 1 ? 1 : 0.5, opacity: stars >= 1 ? 1 : 0.3 }}
              >
                <KenneyIcon type={stars >= 1 ? 'star' : 'heart_empty'} size={48} />
              </motion.span>
              <motion.span
                key="star-s-1"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 2 ? 1 : 0.5, opacity: stars >= 2 ? 1 : 0.3 }}
                transition={{ delay: 0.1 }}
              >
                <KenneyIcon type={stars >= 2 ? 'star' : 'heart_empty'} size={48} />
              </motion.span>
              <motion.span
                key="star-s-2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 3 ? 1 : 0.5, opacity: stars >= 3 ? 1 : 0.3 }}
                transition={{ delay: 0.2 }}
              >
                <KenneyIcon type={stars >= 3 ? 'star' : 'heart_empty'} size={48} />
              </motion.span>
              <motion.span
                key="star-s-3"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 4 ? 1 : 0.5, opacity: stars >= 4 ? 1 : 0.3 }}
                transition={{ delay: 0.3 }}
              >
                <KenneyIcon type={stars >= 4 ? 'star' : 'heart_empty'} size={48} />
              </motion.span>
              <motion.span
                key="star-s-4"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 5 ? 1 : 0.5, opacity: stars >= 5 ? 1 : 0.3 }}
                transition={{ delay: 0.4 }}
              >
                <KenneyIcon type={stars >= 5 ? 'star' : 'heart_empty'} size={48} />
              </motion.span>
            </div>

            {/* Score */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <p className="text-3xl font-black text-green-600">Score: {score}</p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handlePlayAgain}
                className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold text-xl shadow-lg transition-all"
              >
                Play More!
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-2xl font-bold text-xl transition-all"
              >
                Finish
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export const SoundGarden = memo(function SoundGardenComponent() {
  return (
    <GameShell
      gameId="sound-garden"
      gameName="Sound Garden"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <SoundGardenGame />
    </GameShell>
  );
});

export default SoundGarden;
