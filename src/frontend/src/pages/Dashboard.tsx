import { memo, useState, useEffect, useMemo } from 'react';

import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useAuthStore,
  useProfileStore,
  useProgressStore,
  useSettingsStore,
  type Profile,
} from '../store';
import { Mascot } from '../components/Mascot';
import { UIIcon } from '../components/ui/Icon';
import { GameCard } from '../components/GameCard';
import { DemoInterface } from '../components/demo/DemoInterface';
import { hasBasicCameraSupport } from '../utils/featureDetection';
import { useToast } from '../components/ui/useToast';
import { AdventureMap } from '../components/Map';
import type { IconName } from '../components/ui/Icon';
import { AddChildModal } from '../components/dashboard/AddChildModal';
import { EditProfileModal } from '../components/dashboard/EditProfileModal';
import { AvatarWithBadge, AvatarPickerModal, type AvatarConfig } from '../components/avatar';
import { subscriptionApi, type SubscriptionStatus } from '../services/api';

// Minimal recommended games for the dashboard
const RECOMMENDED_GAMES = [
  {
    id: 'alphabet-tracing',
    title: 'Draw Letters',
    description: 'Draw letters with your finger and see them come alive!',
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
    description: 'Pinch on glowing lanes to play rhythm beats!',
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
    description: 'Connect the dots to make fun pictures!',
    path: '/games/connect-the-dots',
    icon: 'target' as IconName,
    ageRange: '3-6 years',
    category: 'Drawing',
    difficulty: 'Easy',
  }
];

export const Dashboard = memo(function Dashboard() {
  const { t } = useTranslation(['dashboard', 'common']);
  const navigate = useNavigate();
  const { isGuest, guestSession } = useAuthStore();
  const { profiles, currentProfile, setCurrentProfile, fetchProfiles, createProfile } = useProfileStore();
  const { letterProgress } = useProgressStore();
  const { demoMode, setDemoMode } = useSettingsStore();
  const { showToast } = useToast();

  const [exporting, setExporting] = useState(false);
  
  // Add Child Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState(5);
  const [childLanguage, setChildLanguage] = useState('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit Profile Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<typeof currentProfile>(null);
  const [editName, setEditName] = useState('');
  const [editLanguage, setEditLanguage] = useState('en');
  const [editAvatarConfig, setEditAvatarConfig] = useState<AvatarConfig | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => {
    if (!isGuest) {
      fetchProfiles();
    }
  }, [fetchProfiles, isGuest]);

  // Handle guest data vs real profile data
  const defaultProfile = useMemo<Profile | null>(() => {
    if (isGuest && guestSession) {
      return {
        id: guestSession.childProfile.id,
        name: guestSession.childProfile.name,
        age: guestSession.childProfile.age,
        preferred_language: guestSession.childProfile.preferredLanguage,
        created_at: new Date(guestSession.createdAt).toISOString(),
        updated_at: new Date(guestSession.createdAt).toISOString(),
        parent_id: 'guest',
        settings: {},
      };
    }
    return currentProfile || profiles[0] || null;
  }, [isGuest, guestSession, currentProfile, profiles]);

  // Set initial profile
  useEffect(() => {
    if (defaultProfile && !currentProfile && !isGuest) {
      setCurrentProfile(defaultProfile);
    }
  }, [defaultProfile, currentProfile, setCurrentProfile, isGuest]);
  
  const { updateProfile } = useProfileStore();

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
  
  const handleAddChild = async () => {
    if (!childName.trim()) return;
    
    setIsSubmitting(true);
    try {
      await createProfile({
        name: childName.trim(),
        age: childAge,
        preferred_language: childLanguage,
      });
      await fetchProfiles();
      setShowAddModal(false);
      setChildName('');
      setChildAge(5);
      setChildLanguage('en');
      showToast(t('dashboard:profile.childAdded'), 'success');
    } catch (error) {
      showToast(t('dashboard:profile.childAddError'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditProfile = (profile: typeof currentProfile) => {
    if (!profile) return;
    setEditingProfile(profile);
    setEditName(profile.name);
    setEditLanguage(profile.preferred_language);
    setEditAvatarConfig((profile.settings?.avatar_config as AvatarConfig) || null);
    setShowEditModal(true);
  };
  
  const handleSaveProfile = async () => {
    if (!editingProfile || !editName.trim()) return;
    
    setIsSubmitting(true);
    try {
      const updateData: Parameters<typeof updateProfile>[1] = {
        name: editName.trim(),
        preferred_language: editLanguage,
      };
      
      // Include avatar config if it was changed
      if (editAvatarConfig) {
        updateData.settings = {
          ...editingProfile.settings,
          avatar_config: editAvatarConfig,
        };
      }
      
      await updateProfile(editingProfile.id, updateData);
      await fetchProfiles();
      setShowEditModal(false);
      setEditingProfile(null);
      setEditAvatarConfig(null);
      showToast(t('dashboard:profile.saved'), 'success');
    } catch (error) {
      showToast(t('dashboard:profile.saveError'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-[#FFF8F0] font-nunito pb-24'>
      {/* Demo Interface */}
      {demoMode && !hasBasicCameraSupport() && (
        <DemoInterface
          onComplete={() => showToast(t('dashboard:demo.completed'), 'success')}
          onExit={() => { setDemoMode(false); navigate('/'); }}
        />
      )}

      {/* HEADER AREA */}
      <header className='px-6 py-6 lg:px-12 lg:py-8 flex justify-between items-start z-10 relative'>
        <div className='flex items-center gap-4'>
          <Mascot state='happy' responsiveSize='sm' hideOnMobile={false} className="hidden sm:block" />
          <div>
            <h1 className='text-3xl sm:text-4xl font-extrabold text-[#1E293B]'>
              {defaultProfile?.name
                ? t('dashboard:welcome.title', { name: defaultProfile.name })
                : t('dashboard:welcome.titleAnonymous')} <span className="text-yellow-400">★</span>
            </h1>
            <p className='text-lg font-medium text-slate-500 mt-1'>
              {t('dashboard:welcome.subtitle')}
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
              title={t('dashboard:actions.exportProgress')}
            >
              <UIIcon name={'download' as any} size={24} />
            </button>
            <Link
              to='/settings'
              className='w-12 h-12 flex items-center justify-center bg-white border-2 border-slate-200 rounded-full text-slate-500 hover:text-[#3B82F6] hover:border-[#3B82F6] transition shadow-sm'
              title={t('dashboard:actions.settings')}
            >
              <UIIcon name={'settings' as any} size={24} />
            </Link>
          </div>
        </div>
      </header>

      {/* MULTI-PROFILE SELECTOR with Avatars - Only for logged-in users */}
      {!isGuest && (
        <div className='px-6 lg:px-12 mb-8'>
          <div className='inline-flex items-center gap-3 bg-white p-2 rounded-full border-2 border-slate-100 shadow-sm'>
            {profiles.map(p => (
              <button
                key={p.id}
                onClick={() => setCurrentProfile(p)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleEditProfile(p);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition ${
                  p.id === currentProfile?.id 
                    ? 'bg-[#3B82F6] text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
                title={`${p.name}${p.age ? ` (${p.age} years)` : ''} - Right-click to edit`}
              >
                <AvatarWithBadge
                  config={p.settings?.avatar_config as AvatarConfig | null | undefined}
                  fallbackName={p.name}
                  age={p.age}
                  size="sm"
                  showAnimation={p.id === currentProfile?.id}
                />
                <span className="text-sm font-bold">{p.name}</span>
              </button>
            ))}
            {/* ADD CHILD BUTTON */}
            <button
              onClick={() => setShowAddModal(true)}
              className='px-3 py-1.5 rounded-full text-sm font-bold text-slate-400 hover:bg-slate-50 hover:text-[#3B82F6] transition border-2 border-dashed border-slate-200 hover:border-[#3B82F6] flex items-center gap-1'
              title={t('dashboard:profile.addChild', 'Add Child')}
            >
              <span>+</span>
              <span className='hidden sm:inline'>{t('dashboard:profile.addChild', 'Add')}</span>
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2 ml-2">
            Tip: Right-click a profile to edit
          </p>
        </div>
      )}

      {/* SUBSCRIPTION STATUS CARD */}
      {!isGuest && <SubscriptionCard />}

      {/* CORE ACTION AREA: GAME GRID */}
      <main className='px-6 lg:px-12 space-y-12 max-w-[1600px] mx-auto'>

        <section>
          <div className='flex justify-between items-end mb-6'>
            <h2 className='text-2xl font-extrabold text-slate-800 flex items-center gap-2'>
              <span className="text-[#E85D04]">Featured Games</span>
            </h2>
            <Link to="/games" className='text-lg font-bold text-[#3B82F6] hover:underline'>
              {t('dashboard:featuredGames.seeAll')} →
            </Link>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {RECOMMENDED_GAMES.map((game, idx) => (
              <GameCard
                key={game.id}
                {...game}
                animationDelay={idx * 0.1}
                isNew={game.isNew}
                buttonText={t('dashboard:featuredGames.playNow')}
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
                {t('dashboard:learningMap.title')} 🗺️
              </h2>
              <p className='text-slate-500 font-medium'>{t('dashboard:learningMap.subtitle')}</p>
            </div>
          </div>

          <div className='relative z-10'>
            <AdventureMap />
          </div>
        </section>

      </main>
      
      {/* ADD CHILD MODAL */}
      <AddChildModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        childName={childName}
        onChildNameChange={setChildName}
        childAge={childAge}
        onChildAgeChange={setChildAge}
        childLanguage={childLanguage}
        onChildLanguageChange={setChildLanguage}
        onSubmit={handleAddChild}
        isSubmitting={isSubmitting}
      />
      
      {/* EDIT PROFILE MODAL */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProfile(null);
          setEditAvatarConfig(null);
        }}
        profile={editingProfile}
        editName={editName}
        onEditNameChange={setEditName}
        editLanguage={editLanguage}
        onEditLanguageChange={setEditLanguage}
        editAvatarConfig={editAvatarConfig}
        onChangeAvatar={() => setShowAvatarPicker(true)}
        onSubmit={handleSaveProfile}
        isSubmitting={isSubmitting}
      />
      
      {/* AVATAR PICKER MODAL */}
      <AvatarPickerModal
        isOpen={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
        currentConfig={editAvatarConfig || (editingProfile?.settings?.avatar_config as AvatarConfig | null | undefined)}
        onSelect={(config) => {
          setEditAvatarConfig(config);
          setShowAvatarPicker(false);
          showToast('Avatar selected! Click Save to apply changes.', 'success');
        }}
        onSelectPhoto={() => {
          // Would open AvatarCapture component
          console.log('Photo avatar selected');
        }}
      />
    </div>
  );
});

// Subscription Card Component
function SubscriptionCard() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    subscriptionApi.getCurrent()
      .then((res) => setSubscription(res.data))
      .catch(() => setSubscription(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="px-6 lg:px-12">
        <div className="animate-pulse bg-white rounded-xl h-24 border-2 border-slate-100"></div>
      </div>
    );
  }

  if (!subscription?.has_active || !subscription.subscription) {
    return (
      <div className="px-6 lg:px-12 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Unlock More Games!</h3>
          <p className="text-blue-100 mb-4">Get access to 5, 10, or all games with a subscription.</p>
          <Link
            to="/pricing"
            className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50"
          >
            View Plans
          </Link>
        </div>
      </div>
    );
  }

  const sub = subscription.subscription;
  const planName = sub.plan_type?.replace('_', ' ').replace('game pack', 'Game Pack').replace('full annual', 'Full Annual');
  const isExpiringSoon = subscription.days_remaining !== null && subscription.days_remaining <= 14;
  const isAnnual = sub.plan_type === 'full_annual';

  return (
    <div className="px-6 lg:px-12 mb-6">
      <div className={`rounded-xl p-6 border-2 ${isExpiringSoon ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-slate-100'}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🎮</span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{planName}</h3>
                <span className={`text-sm ${sub.status === 'active' ? 'text-green-600' : 'text-slate-500'}`}>
                  {sub.status === 'active' ? 'Active' : sub.status}
                </span>
              </div>
            </div>
            
            {subscription.days_remaining !== null && (
              <p className={`text-sm ${isExpiringSoon ? 'text-yellow-700 font-semibold' : 'text-slate-500'}`}>
                {isExpiringSoon ? '⚠️ ' : ''}{subscription.days_remaining} days remaining
              </p>
            )}
          </div>

          <div className="flex gap-3">
            {!isAnnual && (
              <Link
                to="/game-selection"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
              >
                Change Games
              </Link>
            )}
            <Link
              to="/pricing"
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200"
            >
              {subscription.days_remaining !== null && subscription.days_remaining <= 30 ? 'Renew' : 'Upgrade'}
            </Link>
          </div>
        </div>

        {/* Selected Games (for packs) */}
        {!isAnnual && sub.game_selections && sub.game_selections.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-500 mb-2">Selected games ({sub.game_selections.length}):</p>
            <div className="flex flex-wrap gap-2">
              {sub.game_selections.slice(0, 5).map((game: any) => (
                <span key={game.game_id} className="text-xs bg-slate-100 px-2 py-1 rounded">
                  {game.game_id}
                </span>
              ))}
              {sub.game_selections.length > 5 && (
                <span className="text-xs text-slate-400">+{sub.game_selections.length - 5} more</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
