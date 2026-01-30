import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Card, UIIcon } from '../components/ui';
import { useProfileStore } from '../store';

interface Game {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: string;
  ageRange: string;
  category: string;
  difficulty: string;
}

export function Games() {
  const navigate = useNavigate();
  const { currentProfile } = useProfileStore();

  const availableGames: Game[] = [
    {
      id: 'alphabet-tracing',
      title: 'Alphabet Tracing',
      description: 'Trace letters with your finger to learn alphabets in multiple languages',
      path: '/game',
      icon: 'letters',
      ageRange: '3-8 years',
      category: 'Alphabets',
      difficulty: 'Beginner to Advanced'
    },
    {
      id: 'finger-number-show',
      title: 'Finger Number Show',
      description: 'Show numbers with your fingers and the app will count them!',
      path: '/games/finger-number-show',
      icon: 'hand',
      ageRange: '4-7 years',
      category: 'Numeracy',
      difficulty: 'Easy to Hard'
    },
    // Placeholder for future games
    {
      id: 'connect-the-dots',
      title: 'Connect the Dots',
      description: 'Connect numbered dots to form letters, numbers, and shapes',
      path: '#', // Will be implemented later
      icon: 'target',
      ageRange: '4-6 years',
      category: 'Fine Motor',
      difficulty: 'Easy to Medium'
    },
    {
      id: 'letter-hunt',
      title: 'Letter Hunt',
      description: 'Find the target letter among distractors',
      path: '#', // Will be implemented later
      icon: 'target',
      ageRange: '3-6 years',
      category: 'Alphabets',
      difficulty: 'Beginner to Advanced'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Learning Games</h1>
          <p className="text-white/60 mt-2">
            Engaging activities to develop literacy, numeracy, and fine motor skills
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-red-500/20 rounded-lg">
                    <UIIcon name={game.icon as any} size={24} className="text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{game.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                        {game.category}
                      </span>
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded-full">
                        {game.ageRange}
                      </span>
                      <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                        {game.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-white/70 mb-4 flex-1">
                  {game.description}
                </p>
                
                <div className="mt-auto">
                  {game.path.startsWith('#') ? (
                    <button
                      className="w-full px-4 py-3 bg-white/10 border border-border rounded-lg text-white/50 cursor-not-allowed"
                      disabled
                    >
                      Coming Soon
                    </button>
                  ) : (
                    game.id === 'alphabet-tracing' ? (
                      <button
                        onClick={() => {
                          if (currentProfile) {
                            navigate(game.path, { state: { profileId: currentProfile.id } });
                          } else {
                            // If no profile is selected, redirect to dashboard to select one
                            navigate('/dashboard');
                          }
                        }}
                        className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/30 transition text-center"
                      >
                        Play Game
                      </button>
                    ) : (
                      <Link
                        to={game.path}
                        className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/30 transition text-center block"
                      >
                        Play Game
                      </Link>
                    )
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3 text-blue-400">About Our Games</h2>
          <ul className="space-y-2 text-white/70">
            <li>• Designed specifically for young learners (ages 3-8)</li>
            <li>• Uses hand tracking technology for engaging interaction</li>
            <li>• Multilingual support for diverse learning needs</li>
            <li>• Progressive difficulty to match learning pace</li>
            <li>• Safe, ad-free environment for children</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}