import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UIIcon } from '../components/ui/Icon';
import { Mascot } from '../components/Mascot';
import { getAlphabet } from '../data/alphabets';
import { useSettingsStore } from '../store';

interface LetterOption {
  id: number;
  char: string;
  name: string;
  color: string;
  isTarget: boolean;
}

export function LetterHunt() {
  const navigate = useNavigate();
  const settings = useSettingsStore();
  const [score, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(30); // 30 seconds per level
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [targetLetter, setTargetLetter] = useState<string>('');
  const [options, setOptions] = useState<LetterOption[]>([]);
  const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [round, setRound] = useState<number>(1);
  const [totalRounds] = useState<number>(10); // 10 rounds per level

  // Get alphabet based on settings
  const alphabet = getAlphabet(settings.gameLanguage || 'en');

  // Initialize a round
  useEffect(() => {
    if (!gameStarted) return;

    // Select a random target letter
    const randomIndex = Math.floor(Math.random() * alphabet.letters.length);
    const target = alphabet.letters[randomIndex].char;
    setTargetLetter(target);

    // Create options - 1 target + 4 distractors
    const newOptions: LetterOption[] = [];
    
    // Add target letter
    newOptions.push({
      id: 0,
      char: target,
      name: alphabet.letters[randomIndex].name,
      color: alphabet.letters[randomIndex].color,
      isTarget: true
    });

    // Add 4 distractors
    const usedIndices = new Set([randomIndex]);
    for (let i = 1; i < 5; i++) {
      let randomIdx;
      do {
        randomIdx = Math.floor(Math.random() * alphabet.letters.length);
      } while (usedIndices.has(randomIdx));
      
      usedIndices.add(randomIdx);
      newOptions.push({
        id: i,
        char: alphabet.letters[randomIdx].char,
        name: alphabet.letters[randomIdx].name,
        color: alphabet.letters[randomIdx].color,
        isTarget: false
      });
    }

    // Shuffle options
    setOptions(newOptions.sort(() => Math.random() - 0.5));
  }, [round, gameStarted, alphabet]);

  // Timer effect
  useEffect(() => {
    if (!gameStarted || timeLeft <= 0 || gameCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, timeLeft, gameCompleted]);

  const handleTimeout = () => {
    setFeedback({ message: `Time's up! The target was ${targetLetter}`, type: 'error' });
    setTimeout(nextRound, 1500);
  };

  const handleLetterClick = (option: LetterOption) => {
    if (option.isTarget) {
      // Correct answer
      setScore(prev => prev + timeLeft * 5); // More points for faster answers
      setFeedback({ message: 'Correct! Great job!', type: 'success' });
      setTimeout(nextRound, 1500);
    } else {
      // Wrong answer
      setFeedback({ message: `Oops! That was ${option.char}, not ${targetLetter}`, type: 'error' });
      setTimeout(nextRound, 1500);
    }
  };

  const nextRound = () => {
    setFeedback(null);
    setTimeLeft(30);
    
    if (round >= totalRounds) {
      // Level completed
      if (level >= 3) {
        // Game completed
        setGameCompleted(true);
      } else {
        // Move to next level
        setLevel(prev => prev + 1);
        setRound(1);
      }
    } else {
      setRound(prev => prev + 1);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setGameCompleted(false);
    setScore(0);
    setLevel(1);
    setRound(1);
    setTimeLeft(30);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setScore(0);
    setLevel(1);
    setRound(1);
    setTimeLeft(30);
    setFeedback(null);
  };

  const goToHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Letter Hunt</h1>
            <p className="text-white/60">Find the target letter among the options!</p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold">Score: {score}</div>
            <div className="flex items-center gap-4 text-sm text-white/60">
              <span>Level: {level}</span>
              <span>Round: {round}/{totalRounds}</span>
              <span>Time: {timeLeft}s</span>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="bg-white/10 border border-border rounded-xl p-6 mb-6 shadow-sm">
          {!gameStarted ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-24 h-24 mx-auto mb-6">
                <img
                  src="/assets/images/letter-hunt.svg"
                  alt="Letter Hunt"
                  className="w-full h-full object-contain"
                />
              </div>
              
              <h2 className="text-2xl font-semibold mb-4">Letter Hunt Challenge</h2>
              <p className="text-white/70 mb-6 max-w-md text-center">
                Find the target letter among the options. Look carefully and tap the correct one!
                Complete all rounds to advance to the next level.
              </p>
              
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
            <div className="space-y-6">
              {/* Target Letter Display */}
              <div className="bg-white/10 border border-border rounded-xl p-6 text-center">
                <div className="text-sm text-white/60 mb-2">Find this letter:</div>
                <div 
                  className="text-8xl font-bold mx-auto inline-block"
                  style={{ color: alphabet.letters.find(l => l.char === targetLetter)?.color || '#EF4444' }}
                >
                  {targetLetter}
                </div>
                <div className="mt-2 text-lg">
                  {alphabet.letters.find(l => l.char === targetLetter)?.name}
                </div>
              </div>

              {/* Feedback */}
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-xl p-4 text-center font-semibold ${
                    feedback.type === 'success'
                      ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                      : 'bg-red-500/20 border border-red-500/30 text-red-400'
                  }`}
                >
                  {feedback.message}
                </motion.div>
              )}

              {/* Letter Options */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {options.map((option) => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleLetterClick(option)}
                    className="bg-white/10 border border-border rounded-xl p-6 flex flex-col items-center justify-center hover:bg-white/20 transition"
                    style={{ borderColor: option.color + '40' }}
                  >
                    <div 
                      className="text-6xl font-bold mb-2"
                      style={{ color: option.color }}
                    >
                      {option.char}
                    </div>
                    <div className="text-sm text-white/70">{option.name}</div>
                  </motion.button>
                ))}
              </div>

              {/* Game Controls */}
              <div className="flex justify-between items-center">
                <button
                  onClick={goToHome}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold transition flex items-center gap-2"
                >
                  <UIIcon name="home" size={16} />
                  Home
                </button>
                
                <div className="text-center">
                  <div className="text-sm text-white/60">Round {round} of {totalRounds}</div>
                  <div className="text-sm text-white/60">Level {level}</div>
                </div>
                
                <button
                  onClick={resetGame}
                  className="px-4 py-2 bg-white/10 border border-border rounded-lg hover:bg-white/20 transition"
                >
                  Reset
                </button>
              </div>

              {/* Mascot */}
              <div className="flex justify-center">
                <Mascot 
                  state={feedback?.type === 'success' ? 'happy' : feedback?.type === 'error' ? 'thinking' : 'idle'} 
                  message={feedback?.message || `Find the letter "${targetLetter}"!`}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Game Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-3 text-blue-400">How to Play</h2>
          <ul className="space-y-2 text-white/70 text-sm">
            <li>• A target letter will be displayed at the top</li>
            <li>• Find that letter among the options below</li>
            <li>• Tap on the correct letter to score points</li>
            <li>• You have 30 seconds per round - answer quickly for bonus points!</li>
            <li>• Complete all 10 rounds to advance to the next level</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
