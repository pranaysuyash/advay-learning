import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { LEVELS, generateNoteSequence, type GuitarNote } from '../games/airGuitarHeroLogic';

export function AirGuitarHero() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [noteSequence, setNoteSequence] = useState<GuitarNote[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [feedback, setFeedback] = useState('Strum to play the note!');

  const { playClick, playPop, playCelebration } = useAudio();
  const { onGameComplete } = useGameDrops('air-guitar-hero');
  const levelConfig = useMemo(() => LEVELS[currentLevel - 1], [currentLevel]);

  useGameSessionProgress({
    gameName: 'Air Guitar Hero',
    score,
    level: currentLevel,
    isPlaying: gameState === 'playing',
    metaData: { correct: correctCount, total: levelConfig.notesToPlay },
  });

  const handleStart = () => {
    playClick();
    const notes = generateNoteSequence(levelConfig.notesToPlay);
    setNoteSequence(notes);
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    setGameState('playing');
    setFeedback('Strum to play the note!');
  };

  const handleStrum = () => {
    if (gameState !== 'playing' || currentIndex >= noteSequence.length) return;

    const currentNote = noteSequence[currentIndex];
    playPop();
    setCorrectCount((prev) => prev + 1);
    setScore((prev) => prev + 25);
    setFeedback(`Playing ${currentNote.name}!`);

    const nextIndex = currentIndex + 1;
    if (nextIndex >= levelConfig.notesToPlay) {
      setGameState('complete');
      playCelebration();
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  const handleLevelChange = (level: number) => {
    playClick();
    setCurrentLevel(level);
  };

  const handleFinish = useCallback(async () => {
    playClick();
    const finalScore = Math.round(score / levelConfig.notesToPlay);
    await onGameComplete(finalScore);
    navigate('/games');
  }, [score, levelConfig, onGameComplete, navigate, playClick]);

  return (
    <GameContainer title="Air Guitar Hero" onHome={() => navigate('/games')} reportSession={false}>
      <div className="flex flex-col items-center gap-4 p-4 max-w-2xl mx-auto">
        <div className="flex gap-2">
          {LEVELS.map((level) => (
            <button type="button" key={level.level} onClick={() => handleLevelChange(level.level)}
              className={`px-4 py-2 rounded-full font-bold transition-all ${currentLevel === level.level ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}>
              Level {level.level}
            </button>
          ))}
        </div>

        {gameState === 'start' && (
          <div className="text-center">
            <p className="text-6xl mb-4">🎸</p>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Air Guitar Hero!</h2>
            <p className="text-gray-600 mb-4">Strum your finger to play rockstar melodies!</p>
            <button type="button" onClick={handleStart}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-xl shadow-lg">
              Start Rockin'! 🎵
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <>
            <p className="text-2xl font-bold text-purple-600">{feedback}</p>
            
            <div className="w-full h-48 bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
              <div className="text-8xl animate-bounce">🎸</div>
              <button type="button" onClick={handleStrum}
                className="absolute bottom-4 px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded-full font-bold shadow-lg transform hover:scale-110 transition-all">
                STRUM! 🎵
              </button>
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              {noteSequence.map((note, idx) => (
                <div key={`${note.id}-${idx}`} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${idx < currentIndex ? 'bg-green-500' : idx === currentIndex ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'}`}>
                  {note.name}
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <div className="bg-green-100 px-4 py-2 rounded-xl text-center">
                <p className="text-sm text-green-600">Played</p>
                <p className="text-2xl font-bold">{correctCount}</p>
              </div>
              <div className="bg-purple-100 px-4 py-2 rounded-xl text-center">
                <p className="text-sm text-purple-600">Score</p>
                <p className="text-2xl font-bold">{score}</p>
              </div>
            </div>
          </>
        )}

        {gameState === 'complete' && (
          <div className="text-center">
            <p className="text-4xl mb-4">🎸🎸🎸</p>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Rockstar!</h2>
            <p className="text-xl text-gray-600 mb-4">You played {correctCount} notes!</p>
            <p className="text-2xl font-bold text-purple-600 mb-6">Score: {score}</p>
          </div>
        )}

        {gameState !== 'start' && (
          <div className="flex gap-3">
            <button type="button" onClick={handleStart} className="px-6 py-3 bg-gray-200 rounded-xl font-bold">Play Again</button>
            <button type="button" onClick={handleFinish} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold">Finish</button>
          </div>
        )}
      </div>
    </GameContainer>
  );
}
