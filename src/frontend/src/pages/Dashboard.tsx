import { useState, useEffect, useMemo } from 'react';

import { useNavigate, Link } from 'react-router-dom';
import {
  useAuthStore,
  useProfileStore,
  useProgressStore,
  useSettingsStore,
} from '../store';
import { Mascot } from '../components/Mascot';
import { UIIcon } from '../components/ui/Icon';
import { GameCard } from '../components/GameCard';
import { DemoInterface } from '../components/demo/DemoInterface';
import { hasBasicCameraSupport } from '../utils/featureDetection';
import { useToast } from '../components/ui/useToast';
import { AdventureMap } from '../components/Map';
import type { IconName } from '../components/ui/Icon';

// Minimal recommended games for the dashboard
const RECOMMENDED_GAMES = [
  {
    id: 'alphabet-tracing',
    title: 'Draw Letters',
    description: 'Draw letters with your finger and see them come alive! 🎉',
    path: '/games/alphabet-tracing',
    icon: 'letters' as IconName,
    ageRange: '2-8 years',
    category: 'Alphabets',
    difficulty: 'Easy',
  },
  {
    id: 'finger-number-show',
    title: 'Finger Counting',
    description: 'Show numbers with your fingers and Pip will count them! 🔢',
    path: '/games/finger-number-show',
    icon: 'hand' as IconName,
    ageRange: '3-7 years',
    category: 'Numbers',
    difficulty: 'Easy',
  },
  {
    id: 'music-pinch-beat',
    title: 'Music Pinch Beat',
    description: 'Pinch on glowing lanes to play rhythm beats! 🎵',
    path: '/games/music-pinch-beat',
    icon: 'sparkles' as IconName,
    ageRange: '3-7 years',
    category: 'Music',
    difficulty: 'Easy',
    isNew: true,
  },
  {
    id: 'connect-the-dots',
    title: 'Connect Dots',
    description: 'Connect the dots to make fun pictures! 🎨',
    path: '/games/connect-the-dots',
    icon: 'target' as IconName,
    ageRange: '3-6 years',
    category: 'Drawing',
    difficulty: 'Easy',
  }
];

export function Dashboard() {
  const navigate = useNavigate();
  const { isGuest, guestSession } = useAuthStore();
  const { profiles, currentProfile, setCurrentProfile, fetchProfiles } = useProfileStore();
  const { letterProgress } = useProgressStore();
  const { demoMode, setDemoMode } = useSettingsStore();
  const { showToast } = useToast();

  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!isGuest) {
      fetchProfiles();
    }
  }, [fetchProfiles, isGuest]);

  // Handle guest data vs real profile data
  const defaultProfile = useMemo(() => {
    if (isGuest && guestSession) {
      return {
        id: guestSession.childProfile.id,
        name: guestSession.childProfile.name,
        age: guestSession.childProfile.age,
        preferred_language: guestSession.childProfile.preferredLanguage,
        created_at: new Date(guestSession.createdAt).toISOString(),
      };
    }
    return currentProfile || profiles[0];
  }, [isGuest, guestSession, currentProfile, profiles]);

  // Set initial profile
  useEffect(() => {
    if (defaultProfile && !currentProfile && !isGuest) {
      setCurrentProfile(defaultProfile);
    }
  }, [defaultProfile, currentProfile, setCurrentProfile, isGuest]);

  // Calculate total XP/Stars
  const totalStars = useMemo(() => {
    if (isGuest && guestSession) {
      return guestSession.progress.lettersLearned * 10;
    }

    let baseStars = profiles ? profiles.length * 50 : 0;

    if (letterProgress) {
      baseStars += Object.values(letterProgress).reduce((acc, itemArr) =>
        acc + itemArr.reduce((sum, item) => sum + (item.bestAccuracy > 0 ? 10 : 0), 0)
        , 0);
    }

    return baseStars;
  }, [letterProgress, isGuest, guestSession, profiles]);

  const handleExport = async () => {
    setExporting(true);
    const exportData = {
      exportDate: new Date().toISOString(),
      profiles: profiles,
      progress: letterProgress,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  return (
    <div className='min-h-screen bg-[#FFF8F0] font-nunito pb-24'>
      {/* Demo Interface */}
      {demoMode && !hasBasicCameraSupport() && (
        <DemoInterface
          onComplete={() => showToast('Demo completed! Ready to try with camera?', 'success')}
          onExit={() => { setDemoMode(false); navigate('/'); }}
        />
      )}

      {/* HEADER AREA */}
      <header className='px-6 py-6 lg:px-12 lg:py-8 flex justify-between items-start z-10 relative'>
        <div className='flex items-center gap-4'>
          <Mascot state='happy' responsiveSize='sm' hideOnMobile={false} className="hidden sm:block" />
          <div>
            <h1 className='text-3xl sm:text-4xl font-extrabold text-[#1E293B]'>
              Welcome back, {defaultProfile?.name || 'Explorer'}! <span className="text-yellow-400">🌟</span>
            </h1>
            <p className='text-lg font-medium text-slate-500 mt-1'>
              What magical adventure should we go on today?
            </p>
          </div>
        </div>

        <div className='flex items-center gap-4'>
          {/* STAR CURRENCY */}
          <div className='bg-white border-2 border-yellow-200 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm font-bold text-yellow-600 cursor-pointer hover:bg-yellow-50 transition-colors'>
            <span className='text-2xl'>⭐</span>
            <span className='text-xl'>{totalStars.toLocaleString()}</span>
          </div>

          {/* ACTION BUTTONS (Hidden on small mobile, moved to nav or menu) */}
          <div className='hidden md:flex gap-2'>
            <button
              onClick={handleExport}
              disabled={exporting || profiles.length === 0}
              className='w-12 h-12 flex items-center justify-center bg-white border-2 border-slate-200 rounded-full text-slate-500 hover:text-[#3B82F6] hover:border-[#3B82F6] transition shadow-sm disabled:opacity-50'
              title='Export progress data'
            >
              <UIIcon name={'download' as any} size={24} />
            </button>
            <Link
              to='/settings'
              className='w-12 h-12 flex items-center justify-center bg-white border-2 border-slate-200 rounded-full text-slate-500 hover:text-[#3B82F6] hover:border-[#3B82F6] transition shadow-sm'
              title='Settings'
            >
              <UIIcon name={'settings' as any} size={24} />
            </Link>
          </div>
        </div>
      </header>

      {/* MULTI-PROFILE SELECTOR (Subtle pill style if multiple) */}
      {!isGuest && profiles.length > 1 && (
        <div className='px-6 lg:px-12 mb-8'>
          <div className='inline-flex items-center gap-2 bg-white p-1 rounded-full border-2 border-slate-100 shadow-sm'>
            {profiles.map(p => (
              <button
                key={p.id}
                onClick={() => setCurrentProfile(p)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition ${p.id === currentProfile?.id ? 'bg-[#3B82F6] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CORE ACTION AREA: GAME GRID */}
      <main className='px-6 lg:px-12 space-y-12 max-w-[1600px] mx-auto'>

        <section>
          <div className='flex justify-between items-end mb-6'>
            <h2 className='text-2xl font-extrabold text-slate-800 flex items-center gap-2'>
              <span className="text-[#E85D04]">Featured Games</span> 🎮
            </h2>
            <Link to="/games" className='text-lg font-bold text-[#3B82F6] hover:underline'>
              See All →
            </Link>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {RECOMMENDED_GAMES.map((game, idx) => (
              <GameCard
                key={game.id}
                {...game}
                animationDelay={idx * 0.1}
                isNew={game.isNew}
                buttonText="Play Now!"
                onPlay={() => navigate(game.path, { state: { profileId: defaultProfile?.id } })}
                reducedMotion={false}
              />
            ))}
          </div>
        </section>

        {/* SECONDARY AREA: ADVENTURE MAP (Keep logic, style to match V1) */}
        <section className='bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-8 relative overflow-hidden'>
          <div className='absolute -right-10 -bottom-10 opacity-10 pointer-events-none'>
            <Mascot state='idle' responsiveSize='lg' />
          </div>

          <div className='flex items-center justify-between mb-8 relative z-10'>
            <div>
              <h2 className='text-2xl font-extrabold text-slate-800 flex items-center gap-2'>
                Your Learning Map 🗺️
              </h2>
              <p className='text-slate-500 font-medium'>Explore islands and complete quests!</p>
            </div>
          </div>

          <div className='relative z-10'>
            <AdventureMap />
          </div>
        </section>

      </main>
    </div>
  );
}
