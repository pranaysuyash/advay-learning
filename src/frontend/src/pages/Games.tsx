import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GameCard } from '../components/GameCard';
import { useProfileStore } from '../store';
import type { IconName } from '../components/ui/Icon';

interface Game {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: IconName;
  ageRange: string;
  category: string;
  difficulty: string;
  isNew?: boolean;
}

export function Games() {
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const { currentProfile } = useProfileStore();

  const availableGames: Game[] = [
    {
      id: 'alphabet-tracing',
      title: 'Alphabet Tracing',
      description: 'Trace letters with your finger to learn alphabets. Features celebration animations and phonics sounds!',
      path: '/game',
      icon: 'letters',
      ageRange: '3-8 years',
      category: 'Alphabets',
      difficulty: 'Easy to Advanced',
    },
    {
      id: 'finger-number-show',
      title: 'Finger Number Show',
      description: 'Show numbers with your fingers and the app will count them! Supports up to 20 fingers with Duo Mode.',
      path: '/games/finger-number-show',
      icon: 'hand',
      ageRange: '4-7 years',
      category: 'Numeracy',
      difficulty: 'Easy to Hard',
    },
    {
      id: 'connect-the-dots',
      title: 'Connect the Dots',
      description: 'Connect numbered dots in sequence to complete levels. Use mouse or hand tracking gestures!',
      path: '/games/connect-the-dots',
      icon: 'target',
      ageRange: '4-6 years',
      category: 'Fine Motor',
      difficulty: 'Easy to Medium',
    },
    {
      id: 'letter-hunt',
      title: 'Letter Hunt',
      description: 'Find the target letter among distractors using hand gestures. Fast answers score more points!',
      path: '/games/letter-hunt',
      icon: 'target',
      ageRange: '3-6 years',
      category: 'Alphabets',
      difficulty: 'Easy to Medium',
    },
  ];

  const getLanguageLabel = (code: string) => {
    const labels: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      kn: 'Kannada',
      te: 'Telugu',
      ta: 'Tamil',
    };
    return labels[code] || 'English';
  };

  const handlePlayAlphabetGame = () => {
    if (currentProfile) {
      navigate('/game', { state: { profileId: currentProfile.id } });
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <header className="mb-8">
          <motion.h1
            initial={reducedMotion ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl sm:text-4xl font-bold text-text-primary"
          >
            Learning Games
          </motion.h1>
          <motion.p
            initial={reducedMotion ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={reducedMotion ? { duration: 0.01 } : { delay: 0.1 }}
            className="text-text-secondary mt-2"
          >
            Engaging activities to develop literacy, numeracy, and fine motor skills
          </motion.p>

          {/* Quick stats */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reducedMotion ? { duration: 0.01 } : { delay: 0.2 }}
            className="flex gap-4 mt-4"
          >
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <span className="text-pip-orange font-bold">{availableGames.length}</span>
              Games Available
            </div>
            {currentProfile && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                Playing as <span className="text-pip-orange font-bold">{currentProfile.name}</span>
              </div>
            )}
          </motion.div>
        </header>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {availableGames.map((game, index) => (
            <GameCard
              key={game.id}
              {...game}
              animationDelay={index * 0.1}
              isNew={game.id === 'letter-hunt'}
              buttonText={
                game.id === 'alphabet-tracing' && currentProfile
                  ? `Play in ${getLanguageLabel(currentProfile.preferred_language)}`
                  : game.id === 'alphabet-tracing'
                    ? 'Select Profile First'
                    : 'Play Game'
              }
              onPlay={game.id === 'alphabet-tracing' ? handlePlayAlphabetGame : undefined}
              reducedMotion={!!reducedMotion}
            />
          ))}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* About Our Games */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reducedMotion ? { duration: 0.01 } : { delay: 0.5 }}
            className="bg-white border border-border rounded-2xl p-6 shadow-soft"
          >
            <h2 className="text-xl font-semibold mb-4 text-text-primary flex items-center gap-2">
              <span>🎮</span> About Our Games
            </h2>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li className="flex items-start gap-2">
                <span className="text-text-success">✓</span>
                Designed specifically for young learners (ages 3-8)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-text-success">✓</span>
                Uses hand tracking technology for engaging interaction
              </li>
              <li className="flex items-start gap-2">
                <span className="text-text-success">✓</span>
                Multilingual support for diverse learning needs
              </li>
              <li className="flex items-start gap-2">
                <span className="text-text-success">✓</span>
                Progressive difficulty to match learning pace
              </li>
              <li className="flex items-start gap-2">
                <span className="text-text-success">✓</span>
                Safe, ad-free environment for children
              </li>
            </ul>
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reducedMotion ? { duration: 0.01 } : { delay: 0.6 }}
            className="bg-white border border-border rounded-2xl p-6 shadow-soft"
          >
            <h2 className="text-xl font-semibold mb-4 text-text-primary flex items-center gap-2">
              <span>💡</span> How It Works
            </h2>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li className="flex items-start gap-2">
                <span className="text-pip-orange font-bold">1.</span>
                Alphabet Tracing uses the language from your child's profile
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pip-orange font-bold">2.</span>
                Change language in Settings or by editing the profile
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pip-orange font-bold">3.</span>
                Progress is tracked separately for each language
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pip-orange font-bold">4.</span>
                Allow camera access for hand tracking features
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Test Link (dev only) */}
        {/* @ts-expect-error - Vite env types might be missing in this context */}
        {import.meta.env.DEV && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reducedMotion ? { duration: 0.01 } : { delay: 0.8 }}
            className="mt-6 text-center"
          >
            <a
              href="/test/mediapipe"
              className="text-sm text-text-secondary hover:text-text-primary underline"
            >
              🔧 MediaPipe Test Page (Dev)
            </a>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
