import { useState, useMemo } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GameCard } from '../components/GameCard';
import { useProfileStore } from '../store';
import { Icon } from '../components/Icon';
import { ProfileSelector } from '../components/ui/ProfileSelector';
import { getLanguageByCode } from '../data/languages';
import { getListedGames, getAllWorlds, VIBE_CONFIG, type GameManifest } from '../data/gameRegistry';
import { WORLDS_BY_ID } from '../data/worlds';
import type { IconName } from '../components/ui/Icon';
import type { Profile } from '../store';

export function Games() {
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const { currentProfile, profiles, setCurrentProfile } = useProfileStore();
  const [showProfilePicker, setShowProfilePicker] = useState(false);
  const [selectedWorld, setSelectedWorld] = useState<string | 'all'>('all');

  // Games come from the registry — single source of truth
  const allGames = useMemo(() => getListedGames(), []);
  const worlds = useMemo(() => getAllWorlds(), []);

  const availableGames = useMemo(() => {
    if (selectedWorld === 'all') return allGames;
    return allGames.filter((g) => g.worldId === selectedWorld);
  }, [allGames, selectedWorld]);

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
    <div className='max-w-7xl mx-auto px-4 py-8 lg:py-12'>
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <header className='mb-12'>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <motion.h1
                initial={reducedMotion ? false : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className='text-4xl sm:text-5xl font-black text-slate-800 tracking-tight'
              >
                Play &amp; <span className="text-[#3B82F6]">Discover</span>
              </motion.h1>
              <motion.p
                initial={reducedMotion ? false : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={reducedMotion ? { duration: 0.01 } : { delay: 0.1 }}
                className='text-xl text-slate-500 font-bold mt-3'
              >
                Explore worlds, collect items, and discover amazing things.
              </motion.p>
            </div>

            {/* Quick stats & Profile */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0.01 } : { delay: 0.2 }}
              className='flex flex-wrap items-center gap-4 bg-white p-4 rounded-[2rem] border-4 border-slate-100 shadow-sm'
            >
              <div className='flex items-center gap-2 px-4 border-r-2 border-slate-100'>
                <span className='text-3xl font-black text-[#E85D04]'>
                  {allGames.length}
                </span>
                <span className='text-sm font-bold text-slate-500 uppercase tracking-widest leading-tight'>Games<br />Ready</span>
              </div>

              {currentProfile && (
                <div className='flex items-center gap-3 px-2'>
                  <div className='text-sm font-bold text-slate-500 uppercase tracking-widest text-right'>
                    Playing as<br />
                    <span className='text-[#3B82F6] text-base'>{currentProfile.name}</span>
                  </div>
                  <ProfileSelector currentProfile={currentProfile} />
                </div>
              )}
            </motion.div>
          </div>
        </header>

        {/* World Filter Tabs */}
        <div className='flex flex-wrap gap-2 mb-8'>
          <button
            onClick={() => setSelectedWorld('all')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${selectedWorld === 'all'
                ? 'bg-[#3B82F6] text-white shadow-lg'
                : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-[#3B82F6]'
              }`}
          >
            ✨ All Worlds
          </button>
          {worlds.map((wId) => {
            const world = WORLDS_BY_ID[wId];
            if (!world) return null;
            return (
              <button
                key={wId}
                onClick={() => setSelectedWorld(wId)}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${selectedWorld === wId
                    ? 'text-white shadow-lg'
                    : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                style={selectedWorld === wId ? { backgroundColor: world.color } : undefined}
              >
                {world.emoji} {world.name}
              </button>
            );
          })}
        </div>

        {/* Games Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16'>
          {availableGames.map((game, index) => {
            const world = WORLDS_BY_ID[game.worldId];
            const vibe = VIBE_CONFIG[game.vibe];
            return (
              <GameCard
                key={game.id}
                id={game.id}
                title={game.name}
                description={game.tagline}
                path={game.path}
                icon={game.icon}
                ageRange={`${game.ageRange} years`}
                category={world?.name ?? game.worldId}
                difficulty={vibe.label}
                animationDelay={index * 0.05}
                isNew={game.isNew}
                buttonText={
                  game.id === 'alphabet-tracing' && currentProfile
                    ? `Play in ${getLanguageLabel(currentProfile.preferred_language)}`
                    : 'Jump In!'
                }
                onPlay={() => handlePlayGame(game.path)}
                reducedMotion={!!reducedMotion}
              />
            );
          })}
        </div>

        {/* Info Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {/* About Our Games */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reducedMotion ? { duration: 0.01 } : { delay: 0.5 }}
            className='bg-white border-4 border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col'
          >
            <div className="w-16 h-16 bg-[#3B82F6]/10 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-3xl">🎮</span>
            </div>
            <h2 className='text-3xl font-black mb-6 text-slate-800 tracking-tight'>
              What Makes This Special
            </h2>
            <ul className='space-y-4 text-slate-600 font-bold text-lg flex-1'>
              <li className='flex items-start gap-3'>
                <div className='w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center text-[#10B981] shrink-0 mt-0.5'>✓</div>
                Your hands and body ARE the controller — no buttons needed
              </li>
              <li className='flex items-start gap-3'>
                <div className='w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center text-[#10B981] shrink-0 mt-0.5'>✓</div>
                Collect items, discover recipes, and find hidden easter eggs
              </li>
              <li className='flex items-start gap-3'>
                <div className='w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center text-[#10B981] shrink-0 mt-0.5'>✓</div>
                Explore different worlds — each one full of surprises
              </li>
              <li className='flex items-start gap-3'>
                <div className='w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center text-[#10B981] shrink-0 mt-0.5'>✓</div>
                100% ad-free and runs privately on your device
              </li>
            </ul>
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reducedMotion ? { duration: 0.01 } : { delay: 0.6 }}
            className='bg-slate-800 border-4 border-slate-700 rounded-[2.5rem] p-8 shadow-sm flex flex-col relative overflow-hidden'
          >
            <div className='absolute -right-10 -top-10 w-40 h-40 bg-[#E85D04]/20 rounded-full blur-3xl'></div>
            <div className="w-16 h-16 bg-[#E85D04]/20 rounded-2xl flex items-center justify-center mb-6 relative z-10">
              <span className="text-3xl">💡</span>
            </div>
            <h2 className='text-3xl font-black mb-6 text-white tracking-tight relative z-10'>
              How It Works
            </h2>
            <ul className='space-y-4 text-slate-300 font-bold text-lg flex-1 relative z-10'>
              <li className='flex items-start gap-3'>
                <div className='w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white shrink-0 mt-0.5'>1</div>
                Alphabet Tracing uses the language from your child's profile.
              </li>
              <li className='flex items-start gap-3'>
                <div className='w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white shrink-0 mt-0.5'>2</div>
                Change language in Settings or by editing their profile card.
              </li>
              <li className='flex items-start gap-3'>
                <div className='w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white shrink-0 mt-0.5'>3</div>
                Progress & Stars are tracked separately for each learning language!
              </li>
              <li className='flex items-start gap-3'>
                <div className='w-8 h-8 rounded-full bg-[#E85D04] border-2 border-[#000000] shadow-[0_2px_0_0_#000000] flex items-center justify-center text-white shrink-0 mt-0.5'>!</div>
                <span className="text-white">Allow camera access on the next screen to play safely.</span>
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
            className='mt-12 text-center'
          >
            <a
              href='/test/mediapipe'
              className='inline-flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-600 rounded-full font-bold hover:bg-slate-300 transition-colors'
            >
              <span>🔧</span> MediaPipe Test Page (Dev)
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
              className='fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4'
              onClick={() => setShowProfilePicker(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className='bg-white border-4 border-slate-100 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative overflow-hidden'
                onClick={(e) => e.stopPropagation()}
              >
                <div className='absolute top-0 left-0 w-full h-32 bg-[#3B82F6]/10 -z-10'></div>
                <div className='text-center mb-8 pt-4'>
                  <div className='w-20 h-20 bg-white border-4 border-[#3B82F6] shadow-sm rounded-full flex items-center justify-center text-4xl mx-auto mb-4 -mt-12'>👋</div>
                  <h2 className='text-4xl font-black text-slate-800 tracking-tight'>
                    Who's Playing?
                  </h2>
                  <p className='text-lg font-bold text-slate-500 mt-2'>
                    Select a profile to start playing
                  </p>
                </div>

                <div className='space-y-4'>
                  {profiles.map((profile: Profile) => (
                    <button
                      key={profile.id}
                      onClick={() => handleProfileSelect(profile)}
                      className='w-full flex items-center gap-5 p-5 bg-slate-50 hover:bg-[#3B82F6]/5 border-4 border-slate-100 hover:border-[#3B82F6] rounded-[2rem] transition-all text-left group'
                    >
                      <div className='w-16 h-16 rounded-[1.5rem] bg-[#E85D04] text-white flex items-center justify-center shadow-sm border-2 border-white text-3xl font-black group-hover:scale-110 transition-transform'>
                        {profile.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className='text-2xl font-black text-slate-800 tracking-tight'>
                          {profile.name}
                        </p>
                        <p className='text-slate-500 font-bold'>
                          {(() => {
                            const lang = getLanguageByCode(
                              profile.preferred_language,
                            );
                            return lang ? (
                              <span className='flex items-center gap-2 mt-1'>
                                <Icon
                                  src={lang.flagIcon}
                                  alt={lang.name}
                                  size={20}
                                />
                                {lang.nativeName}
                              </span>
                            ) : (
                              profile.preferred_language
                            );
                          })()}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-[#3B82F6] group-hover:text-white transition-colors">
                        ➡️
                      </div>
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      setShowProfilePicker(false);
                      navigate('/dashboard');
                    }}
                    className='w-full p-6 border-4 border-dashed border-slate-200 hover:border-[#E85D04] hover:bg-[#E85D04]/5 rounded-[2rem] font-black text-xl text-slate-500 hover:text-[#E85D04] transition-all uppercase tracking-widest'
                  >
                    + Add New Profile
                  </button>
                </div>

                <button
                  onClick={() => setShowProfilePicker(false)}
                  className='w-full mt-6 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest'
                >
                  Cancel & Go Back
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
