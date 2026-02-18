import { useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GameCard } from '../components/GameCard';
import { useProfileStore } from '../store';
import { Icon } from '../components/Icon';
import { ProfileSelector } from '../components/ui/ProfileSelector';
import { getLanguageByCode } from '../data/languages';
import type { IconName } from '../components/ui/Icon';
import type { Profile } from '../store';

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
  const { currentProfile, profiles, setCurrentProfile } = useProfileStore();
  const [showProfilePicker, setShowProfilePicker] = useState(false);

  const availableGames: Game[] = [
    {
      id: 'alphabet-tracing',
      title: 'Draw Letters',
      description: 'Draw letters with your finger and see them come alive! 🎉',
      path: '/games/alphabet-tracing',
      icon: 'letters',
      ageRange: '2-8 years',
      category: 'Alphabets',
      difficulty: 'Easy',
    },
    {
      id: 'finger-number-show',
      title: 'Finger Counting',
      description: 'Show numbers with your fingers and Pip will count them! 🔢',
      path: '/games/finger-number-show',
      icon: 'hand',
      ageRange: '3-7 years',
      category: 'Numbers',
      difficulty: 'Easy',
    },
    {
      id: 'connect-the-dots',
      title: 'Connect Dots',
      description: 'Connect the dots to make fun pictures! 🎨',
      path: '/games/connect-the-dots',
      icon: 'target',
      ageRange: '3-6 years',
      category: 'Drawing',
      difficulty: 'Easy',
    },
    {
      id: 'letter-hunt',
      title: 'Find the Letter',
      description: 'Find the hidden letters and win stars! ⭐',
      path: '/games/letter-hunt',
      icon: 'target',
      ageRange: '2-6 years',
      category: 'Alphabets',
      difficulty: 'Easy',
    },
    {
      id: 'music-pinch-beat',
      title: 'Music Pinch Beat',
      description:
        'Pinch on glowing lanes to play child-friendly rhythm beats! 🎵',
      path: '/games/music-pinch-beat',
      icon: 'sparkles',
      ageRange: '3-7 years',
      category: 'Music',
      difficulty: 'Easy',
      isNew: true,
    },
    {
      id: 'steady-hand-lab',
      title: 'Steady Hand Lab',
      description:
        'Hold your fingertip steady inside the target ring to build control! 🎯',
      path: '/games/steady-hand-lab',
      icon: 'circle',
      ageRange: '4-7 years',
      category: 'Motor Skills',
      difficulty: 'Medium',
      isNew: true,
    },
    {
      id: 'shape-pop',
      title: 'Shape Pop',
      description: 'Pop glowing shapes with a pinch for quick reaction fun! ✨',
      path: '/games/shape-pop',
      icon: 'sparkles',
      ageRange: '3-7 years',
      category: 'Shapes',
      difficulty: 'Easy',
      isNew: true,
    },
    {
      id: 'color-match-garden',
      title: 'Color Match Garden',
      description:
        'Pinch the flower with the asked color before time runs out! 🌸',
      path: '/games/color-match-garden',
      icon: 'drop',
      ageRange: '3-7 years',
      category: 'Colors',
      difficulty: 'Medium',
      isNew: true,
    },
    {
      id: 'number-tap-trail',
      title: 'Number Tap Trail',
      description: 'Pinch numbers in sequence and clear each level trail! 🔢',
      path: '/games/number-tap-trail',
      icon: 'circle',
      ageRange: '4-8 years',
      category: 'Numbers',
      difficulty: 'Medium',
      isNew: true,
    },
    {
      id: 'shape-sequence',
      title: 'Shape Sequence',
      description: 'Follow the shape order and pinch each one correctly! 🧩',
      path: '/games/shape-sequence',
      icon: 'sparkles',
      ageRange: '4-8 years',
      category: 'Memory',
      difficulty: 'Medium',
      isNew: true,
    },
    {
      id: 'yoga-animals',
      title: 'Yoga Animals',
      description:
        'Copy animal poses with your body and hold them to win! 🦁🌳',
      path: '/games/yoga-animals',
      icon: 'sparkles',
      ageRange: '3-8 years',
      category: 'Movement',
      difficulty: 'Easy',
      isNew: true,
    },
    {
      id: 'freeze-dance',
      title: 'Freeze Dance',
      description: 'Dance when the music plays, FREEZE when it stops! 💃❄️',
      path: '/games/freeze-dance',
      icon: 'sparkles',
      ageRange: '3-8 years',
      category: 'Movement',
      difficulty: 'Easy',
      isNew: true,
    },
    {
      id: 'simon-says',
      title: 'Simon Says',
      description:
        'Do body actions like Simon says - touch head, wave, arms up! 🧠👆',
      path: '/games/simon-says',
      icon: 'sparkles',
      ageRange: '3-8 years',
      category: 'Movement',
      difficulty: 'Easy',
      isNew: true,
    },
    {
      id: 'chemistry-lab',
      title: 'Chemistry Lab',
      description:
        'Mix chemicals in the virtual lab and discover amazing reactions! 🧪⚗️',
      path: '/games/chemistry-lab',
      icon: 'sparkles',
      ageRange: '4-8 years',
      category: 'Science',
      difficulty: 'Easy',
      isNew: true,
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

  const [selectedGamePath, setSelectedGamePath] = useState<string | null>(null);

  const handlePlayGame = async (gamePath: string) => {
    setSelectedGamePath(gamePath);
    if (currentProfile) {
      navigate(gamePath, { state: { profileId: currentProfile.id } });
    } else if (profiles.length > 0) {
      // If there are profiles but none is selected, show picker
      setShowProfilePicker(true);
    } else {
      // If no profiles exist, go directly to game and let it handle profile creation
      navigate(gamePath);
    }
  };

  const handleProfileSelect = (profile: Profile) => {
    setCurrentProfile(profile);
    setShowProfilePicker(false);
    if (selectedGamePath) {
      navigate(selectedGamePath, { state: { profileId: profile.id } });
    }
  };

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <header className='mb-8'>
          <motion.h1
            initial={reducedMotion ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className='text-3xl sm:text-4xl font-bold text-text-primary'
          >
            Learning Games
          </motion.h1>
          <motion.p
            initial={reducedMotion ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={reducedMotion ? { duration: 0.01 } : { delay: 0.1 }}
            className='text-text-secondary mt-2'
          >
            Engaging activities to develop literacy, numeracy, and fine motor
            skills
          </motion.p>

          {/* Quick stats */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reducedMotion ? { duration: 0.01 } : { delay: 0.2 }}
            className='flex gap-4 mt-4'
          >
            <div className='flex items-center gap-2 text-sm text-text-secondary'>
              <span className='text-pip-orange font-bold'>
                {availableGames.length}
              </span>
              Games Available
            </div>
            {currentProfile && (
              <div className='flex items-center gap-2 text-sm text-text-secondary'>
                Playing as{' '}
                <span className='text-pip-orange font-bold'>
                  {currentProfile.name}
                </span>
              </div>
            )}
            {currentProfile && (
              <div className='flex items-center gap-4 mt-4'>
                <div className='text-sm text-text-secondary'>
                  Switch profile:
                </div>
                <ProfileSelector currentProfile={currentProfile} />
              </div>
            )}
          </motion.div>
        </header>

        {/* Games Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12'>
          {availableGames.map((game, index) => (
            <GameCard
              key={game.id}
              {...game}
              animationDelay={index * 0.1}
              isNew={game.isNew}
              buttonText={
                game.id === 'alphabet-tracing' && currentProfile
                  ? `Play in ${getLanguageLabel(currentProfile.preferred_language)}`
                  : 'Play Game'
              }
              onPlay={() => handlePlayGame(game.path)}
              reducedMotion={!!reducedMotion}
            />
          ))}
        </div>

        {/* Info Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* About Our Games */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reducedMotion ? { duration: 0.01 } : { delay: 0.5 }}
            className='bg-white border border-border rounded-2xl p-6 shadow-soft'
          >
            <h2 className='text-xl font-semibold mb-4 text-text-primary flex items-center gap-2'>
              <span>🎮</span> About Our Games
            </h2>
            <ul className='space-y-2 text-text-secondary text-sm'>
              <li className='flex items-start gap-2'>
                <span className='text-text-success'>✓</span>
                Designed specifically for young learners (ages 3-8)
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-text-success'>✓</span>
                Uses hand tracking technology for engaging interaction
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-text-success'>✓</span>
                Multilingual support for diverse learning needs
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-text-success'>✓</span>
                Progressive difficulty to match learning pace
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-text-success'>✓</span>
                Safe, ad-free environment for children
              </li>
            </ul>
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reducedMotion ? { duration: 0.01 } : { delay: 0.6 }}
            className='bg-white border border-border rounded-2xl p-6 shadow-soft'
          >
            <h2 className='text-xl font-semibold mb-4 text-text-primary flex items-center gap-2'>
              <span>💡</span> How It Works
            </h2>
            <ul className='space-y-2 text-text-secondary text-sm'>
              <li className='flex items-start gap-2'>
                <span className='text-pip-orange font-bold'>1.</span>
                Alphabet Tracing uses the language from your child's profile
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-pip-orange font-bold'>2.</span>
                Change language in Settings or by editing the profile
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-pip-orange font-bold'>3.</span>
                Progress is tracked separately for each language
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-pip-orange font-bold'>4.</span>
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
            className='mt-6 text-center'
          >
            <a
              href='/test/mediapipe'
              className='text-sm text-text-secondary hover:text-text-primary underline'
            >
              🔧 MediaPipe Test Page (Dev)
            </a>
          </motion.div>
        )}

        {/* Profile Picker Modal */}
        <AnimatePresence>
          {showProfilePicker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'
              onClick={() => setShowProfilePicker(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className='bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl'
                onClick={(e) => e.stopPropagation()}
              >
                <div className='text-center mb-6'>
                  <div className='text-4xl mb-2'>👋</div>
                  <h2 className='text-2xl font-bold text-text-primary'>
                    Who's Playing?
                  </h2>
                  <p className='text-text-secondary mt-2'>
                    Select a profile to start playing
                  </p>
                </div>

                <div className='space-y-3'>
                  {profiles.map((profile: Profile) => (
                    <button
                      key={profile.id}
                      onClick={() => handleProfileSelect(profile)}
                      className='w-full flex items-center gap-4 p-4 bg-bg-secondary hover:bg-bg-tertiary border border-border rounded-xl transition text-left'
                    >
                      <div className='w-12 h-12 rounded-full bg-pip-orange text-white flex items-center justify-center text-xl font-bold'>
                        {profile.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className='font-semibold text-text-primary'>
                          {profile.name}
                        </p>
                        <p className='text-sm text-text-secondary'>
                          {(() => {
                            const lang = getLanguageByCode(
                              profile.preferred_language,
                            );
                            return lang ? (
                              <span className='flex items-center gap-1'>
                                <Icon
                                  src={lang.flagIcon}
                                  alt={lang.name}
                                  size={16}
                                />
                                {lang.nativeName}
                              </span>
                            ) : (
                              profile.preferred_language
                            );
                          })()}
                        </p>
                      </div>
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      setShowProfilePicker(false);
                      navigate('/dashboard');
                    }}
                    className='w-full p-4 border-2 border-dashed border-border hover:border-pip-orange rounded-xl text-text-secondary hover:text-pip-orange transition'
                  >
                    + Add New Profile
                  </button>
                </div>

                <button
                  onClick={() => setShowProfilePicker(false)}
                  className='w-full mt-4 py-3 text-text-secondary hover:text-text-primary transition'
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
