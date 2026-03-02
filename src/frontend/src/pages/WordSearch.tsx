import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { LEVELS, generateWordSearch } from '../games/wordSearchLogic';

export function WordSearch() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [grid, setGrid] = useState<string[][]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selected, setSelected] = useState<{ x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>(
    'start',
  );

  const { playClick, playSuccess } = useAudio();
  const { onGameComplete } = useGameDrops('word-search');

  useGameSessionProgress({
    gameName: 'Word Search',
    score,
    level: currentLevel,
    isPlaying: true,
    metaData: { foundWords: foundWords.length },
  });

  const startGame = () => {
    const { grid: newGrid, words: newWords } = generateWordSearch(currentLevel);
    setGrid(newGrid);
    setWords(newWords);
    setFoundWords([]);
    setSelected([]);
    setScore(0);
    setGameState('playing');
  };

  const handleCellClick = (x: number, y: number) => {
    if (gameState !== 'playing') return;
    playClick();
    const alreadySelected = selected.find((s) => s.x === x && s.y === y);
    if (alreadySelected) {
      setSelected(selected.filter((s) => s.x !== x || s.y !== y));
      return;
    }
    const newSelected = [...selected, { x, y }];
    setSelected(newSelected);

    if (newSelected.length >= 2) {
      const word = newSelected.map((s) => grid[s.x][s.y]).join('');
      const reversed = word.split('').reverse().join('');
      if (words.includes(word) && !foundWords.includes(word)) {
        playSuccess();
        setFoundWords((f) => [...f, word]);
        setScore((s) => s + word.length * 10);
      } else if (words.includes(reversed) && !foundWords.includes(reversed)) {
        playSuccess();
        setFoundWords((f) => [...f, reversed]);
        setScore((s) => s + reversed.length * 10);
      }
      setSelected([]);

      if (foundWords.length + 1 >= words.length) {
        setScore((s) => s + 50);
        setGameState('complete');
      }
    }
  };

  const handleStart = () => {
    playClick();
    startGame();
  };
  const handleFinish = useCallback(async () => {
    playClick();
    await onGameComplete(foundWords.length);
    navigate('/games');
  }, [foundWords.length, onGameComplete, navigate, playClick]);

  return (
    <GameContainer
      title='Word Search'
      onHome={() => navigate('/games')}
      reportSession={false}
    >
      <div className='flex flex-col items-center gap-4 p-4'>
        <div className='flex gap-2'>
          {LEVELS.map((l) => (
            <button
              type='button'
              key={l.level}
              onClick={() => {
                playClick();
                setCurrentLevel(l.level);
              }}
              className={`px-4 py-2 rounded-full font-bold ${currentLevel === l.level ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Level {l.level}
            </button>
          ))}
        </div>

        {gameState === 'start' && (
          <div className='text-center'>
            <p className='text-6xl mb-4'>🔍</p>
            <h2 className='text-2xl font-bold mb-2'>Word Search!</h2>
            <p className='mb-4'>Find hidden words!</p>
            <button
              type='button'
              onClick={handleStart}
              className='px-8 py-4 bg-blue-500 text-white rounded-2xl font-bold text-xl'
            >
              Start!
            </button>
          </div>
        )}

        {gameState === 'playing' && grid.length > 0 && (
          <div className='text-center'>
            <div className='flex gap-2 mb-4 flex-wrap justify-center'>
              {words.map((word) => (
                <span
                  key={word}
                  className={`px-3 py-1 rounded-full text-sm font-bold ${foundWords.includes(word) ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                >
                  {word}
                </span>
              ))}
            </div>
            <div
              className='grid gap-1 mb-4'
              style={{ gridTemplateColumns: `repeat(${grid.length}, 1fr)` }}
            >
              {grid.map((row, i) =>
                row.map((cell, j) => (
                  <button
                    key={`${i}-${j}`}
                    type='button'
                    onClick={() => handleCellClick(i, j)}
                    className={`w-8 h-8 font-bold text-sm rounded ${selected.some((s) => s.x === i && s.y === j) ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {cell}
                  </button>
                )),
              )}
            </div>
            <div className='text-xl font-bold'>Score: {score}</div>
          </div>
        )}

        {gameState === 'complete' && (
          <div className='text-center'>
            <p className='text-6xl mb-4'>🎉</p>
            <h2 className='text-2xl font-bold mb-2'>Great Job!</h2>
            <p className='text-xl mb-4'>You found all words!</p>
            <p className='text-2xl font-bold text-green-600 mb-4'>
              Score: {score}
            </p>
            <button
              type='button'
              onClick={handleStart}
              className='px-6 py-3 bg-blue-500 text-white rounded-xl font-bold mr-4'
            >
              Play Again
            </button>
            <button
              type='button'
              onClick={handleFinish}
              className='px-6 py-3 bg-gray-200 rounded-xl font-bold'
            >
              Finish
            </button>
          </div>
        )}
      </div>
    </GameContainer>
  );
}
