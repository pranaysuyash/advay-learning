import { useEffect, useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  useAuthStore,
  useProfileStore,
  useSettingsStore,
  useProgressStore,
  type Profile,
} from '../store';
import { getAlphabet } from '../data/alphabets';
import { LetterJourney } from '../components/LetterJourney';
import { UIIcon } from '../components/ui';
import { useToast } from '../components/ui/useToast';
import { AdventureMap } from '../components/Map';
import { StoryModal } from '../components/StoryModal';
import { useStoryStore } from '../store/storyStore';
import { QUESTS, getQuestsByIsland, isIslandUnlocked } from '../data/quests';
import {
  EmptyState,
  TipsSection,
  StatsBar,
  AddChildModal,
  EditProfileModal,
} from '../components/dashboard';
import { DemoInterface } from '../components/demo/DemoInterface';
import { hasBasicCameraSupport } from '../utils/featureDetection';

interface LanguageProgress {
  language: string;
  lettersLearned: number;
  totalLetters: number;
  averageAccuracy: number;
  totalTime: number;
}

interface ChildProfile {
  id: string;
  name: string;
  age: number;
  preferredLanguage: string;
  progress: {
    lettersLearned: number;
    totalLetters: number;
    averageAccuracy: number;
    totalTime: number;
  };
  languageProgress: LanguageProgress[];
}

interface LanguageProgress {
  language: string;
  lettersLearned: number;
  totalLetters: number;
  averageAccuracy: number;
  totalTime: number;
}

export const Dashboard = memo(function DashboardComponent() {
  useAuthStore();
  const {
    profiles,
    fetchProfiles,
    createProfile,
    updateProfile,
    setCurrentProfile,
  } = useProfileStore();
  const toast = useToast();
  const { setDemoMode, demoMode } = useSettingsStore();
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Add Child Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState(5);
  const [newChildLanguage, setNewChildLanguage] = useState('en');

  // Edit Profile Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [editName, setEditName] = useState('');
  const [editLanguage, setEditLanguage] = useState('en');
  const [isUpdating, setIsUpdating] = useState(false);

  // Story/Map prototype state
  const {
    startQuest,
    completeQuest,
    totalXp,
    badges,
    completedQuests,
    unlockedIslands,
  } = useStoryStore();
  const [showStoryModal, setShowStoryModal] = useState(false);
  const navigate = useNavigate();

  const questSummary = useMemo(() => {
    const completedIds = new Set(completedQuests.map((q) => q.questId));
    const totalQuests = QUESTS.length;
    const completedCount = completedIds.size;
    const unlockedCount = unlockedIslands.length;
    const currentIslandId =
      unlockedIslands[unlockedIslands.length - 1] ?? 'alphabet-lighthouse';
    const currentIslandQuests = getQuestsByIsland(currentIslandId);
    const nextUnlockableIslandId = [
      'number-nook',
      'treasure-bay',
      'star-studio',
    ].find(
      (id) =>
        isIslandUnlocked(id, unlockedIslands) && !unlockedIslands.includes(id),
    );
    return {
      completedCount,
      totalQuests,
      unlockedCount,
      currentIslandQuestCount: currentIslandQuests.length,
      nextUnlockableIslandId,
    };
  }, [completedQuests, unlockedIslands]);

  // Helper function to get star rating from percentage
  const getStarRating = (
    accuracy: number,
  ): { stars: number; emoji: string } => {
    if (accuracy >= 90) return { stars: 3, emoji: '⭐⭐⭐' };
    if (accuracy >= 70) return { stars: 2, emoji: '⭐⭐' };
    if (accuracy >= 40) return { stars: 1, emoji: '⭐' };
    return { stars: 0, emoji: '☆' };
  };

  const getAccuracyProgressClass = (accuracy: number): string => {
    if (accuracy >= 70) return 'progress-accent-success';
    if (accuracy >= 40) return 'progress-accent-warning';
    return 'progress-accent-error';
  };

  // Helper function to format time kid-friendly
  const formatTimeKidFriendly = (minutes: number): string => {
    if (minutes < 60) return `${Math.floor(minutes)} minutes`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hours`;
    return `about ${Math.floor(minutes / 60)} hours`;
  };
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleCreateProfile = async () => {
    if (!newChildName.trim()) return;

    setIsCreating(true);
    try {
      await createProfile({
        name: newChildName.trim(),
        age: newChildAge,
        preferred_language: newChildLanguage,
      });
      // Reset form and close modal
      setNewChildName('');
      setNewChildAge(5);
      setNewChildLanguage('en');
      setShowAddModal(false);
      // Refresh profiles
      await fetchProfiles();
    } catch (error) {
      console.error('Failed to create profile:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle opening the edit modal
  const handleOpenEditModal = (child: ChildProfile) => {
    // Find the actual Profile from profiles array
    const profile = profiles.find((p) => p.id === child.id);
    if (!profile) return;
    setEditingProfile(profile);
    setEditName(profile.name);
    setEditLanguage(profile.preferred_language || 'en');
    setShowEditModal(true);
  };

  // Handle updating profile
  const handleUpdateProfile = async () => {
    if (!editingProfile || !editName.trim()) return;

    setIsUpdating(true);
    try {
      await updateProfile(editingProfile.id, {
        name: editName.trim(),
        preferred_language: editLanguage,
      });
      toast.showToast(`Updated ${editName}'s profile!`, 'success');
      setShowEditModal(false);
      setEditingProfile(null);
      setEditName('');
      setEditLanguage('en');
      // Refresh profiles to ensure consistency
      await fetchProfiles();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.showToast('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Get real progress data
  const { letterProgress, getMasteredLettersCount } = useProgressStore();

  // Transform profiles to include REAL progress data
  const children: ChildProfile[] = profiles.map((profile) => {
    // Map 2-letter codes to full names for alphabet lookup
    const langCode = profile.preferred_language || 'en';
    const lang =
      langCode === 'hi'
        ? 'hindi'
        : langCode === 'kn'
          ? 'kannada'
          : langCode === 'te'
            ? 'telugu'
            : langCode === 'ta'
              ? 'tamil'
              : 'english';
    const alphabet = getAlphabet(langCode);
    const langProgress = letterProgress[lang] || [];

    // Calculate real stats for the primary language
    const masteredCount = getMasteredLettersCount(lang);
    const totalLetters = alphabet.letters.length;

    // Calculate average accuracy from attempts
    const attemptsWithAccuracy = langProgress.filter((p) => p.attempts > 0);
    const averageAccuracy =
      attemptsWithAccuracy.length > 0
        ? Math.round(
            attemptsWithAccuracy.reduce((sum, p) => sum + p.bestAccuracy, 0) /
              attemptsWithAccuracy.length,
          )
        : 0;

    // Estimate time spent (5 minutes per attempt as rough estimate)
    const totalAttempts = langProgress.reduce((sum, p) => sum + p.attempts, 0);
    const estimatedTimeMinutes = totalAttempts * 2; // ~2 minutes per tracing session

    // Calculate progress for all languages
    const allLanguages = ['english', 'hindi', 'kannada', 'telugu', 'tamil'];
    const languageProgress: LanguageProgress[] = allLanguages
      .map((language) => {
        const langAlphabet = getAlphabet(language);
        const langProg = letterProgress[language] || [];

        const mastered = getMasteredLettersCount(language);
        const total = langAlphabet.letters.length;

        const attempts = langProg.filter((p) => p.attempts > 0);
        const avgAcc =
          attempts.length > 0
            ? Math.round(
                attempts.reduce((sum, p) => sum + p.bestAccuracy, 0) /
                  attempts.length,
              )
            : 0;

        const totalTime = langProg.reduce((sum, p) => sum + p.attempts, 0) * 2;

        return {
          language,
          lettersLearned: mastered,
          totalLetters: total,
          averageAccuracy: avgAcc,
          totalTime,
        };
      })
      .filter((lp) => lp.lettersLearned > 0); // Only show languages with progress

    return {
      id: profile.id,
      name: profile.name,
      age: profile.age || 5,
      preferredLanguage: lang,
      progress: {
        lettersLearned: masteredCount,
        totalLetters: totalLetters,
        averageAccuracy: averageAccuracy,
        totalTime: estimatedTimeMinutes,
      },
      languageProgress,
    };
  });

  const selectedChildData =
    children.find((c) => c.id === selectedChild) || children[0];

  // TODO: Replace with unified tracking from ANALYTICS_TRACKING_AUDIT.md
  // Currently only tracking Alphabet Tracing - need to add:
  // - FingerNumberShow metrics
  // - ConnectTheDots metrics
  // - LetterHunt metrics
  // - Overall literacy/numeracy/motor scores
  const stats = useMemo(
    () =>
      selectedChildData
        ? [
            {
              label: 'Literacy', // Was: Letters Learned
              value: `${selectedChildData.progress.lettersLearned}/${selectedChildData.progress.totalLetters}`,
              iconName: 'letters' as const,
              percent:
                (selectedChildData.progress.lettersLearned /
                  selectedChildData.progress.totalLetters) *
                100,
            },
            {
              label: 'Accuracy',
              value: getStarRating(selectedChildData.progress.averageAccuracy)
                .emoji,
              iconName: 'target' as const,
              percent: selectedChildData.progress.averageAccuracy,
            },
            {
              label: 'Time',
              value: formatTimeKidFriendly(
                selectedChildData.progress.totalTime,
              ),
              iconName: 'timer' as const,
              percent: Math.min(
                (selectedChildData.progress.totalTime / 300) * 100,
                100,
              ),
            },
            // TODO: Add when FingerNumberShow tracking is implemented:
            // {
            //   label: 'Numeracy',
            //   value: `${numbersMastered}/${totalNumbers}`,
            //   iconName: 'hand' as const,
            //   percent: (numbersMastered / totalNumbers) * 100,
            // },
          ]
        : [],
    [children, selectedChild, getStarRating, formatTimeKidFriendly],
  );

  const handleExport = async () => {
    setExporting(true);

    // Prepare export data
    const exportData = {
      exportDate: new Date().toISOString(),
      children: children.map((child) => ({
        name: child.name,
        age: child.age,
        language: child.preferredLanguage,
        progress: child.progress,
      })),
    };

    // Create and download file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
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
    <section className='max-w-7xl mx-auto px-4 py-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Demo Interface - Show when in demo mode without camera support */}
        {demoMode && !hasBasicCameraSupport() && (
          <DemoInterface
            onComplete={() => {
              toast.showToast(
                'Demo completed! Ready to try with camera?',
                'success',
              );
            }}
            onExit={() => {
              setDemoMode(false);
              navigate('/');
            }}
          />
        )}

        {/* Header - Clean, single title */}
        <header className='mb-6 flex justify-between items-center'>
          <h1 className='text-4xl font-bold'>Dashboard</h1>
          <button
            onClick={handleExport}
            disabled={exporting || children.length === 0}
            className='p-2 text-slate-500 hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition disabled:opacity-30'
            title='Export progress data'
            aria-label={exporting ? 'Export in progress' : 'Export progress data'}
          >
            {exporting ? (
              <UIIcon name='hourglass' size={20} aria-hidden="true" />
            ) : (
              <UIIcon name='download' size={20} aria-hidden="true" />
            )}
          </button>
        </header>

        {/* Child Selector - Clean, minimal */}
        {children.length > 0 && (
          <div className='mb-4 flex items-center gap-2 flex-wrap'>
            {children.map((child) => (
              <div key={child.id} className='flex items-center'>
                <button
                  onClick={() => {
                    const profile = profiles.find((p) => p.id === child.id);
                    if (profile) {
                      setCurrentProfile(profile);
                    }
                    setSelectedChild(child.id);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition text-base ${
                    selectedChildData?.id === child.id
                      ? 'bg-pip-orange text-white shadow-soft'
                      : 'bg-white border border-border hover:bg-bg-tertiary text-text-primary'
                  }`}
                >
                  <span className='font-medium text-lg'>{child.name}</span>
                  <span className='opacity-70 text-sm'>({child.age})</span>
                </button>
                <button
                  onClick={() => handleOpenEditModal(child)}
                  className='p-2 ml-1 text-slate-500 hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition min-h-[36px] min-w-[36px] flex items-center justify-center'
                  aria-label={`Edit ${child.name}'s profile`}
                  title='Edit'
                >
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
                    />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type='button'
              onClick={() => setShowAddModal(true)}
              className='flex items-center gap-2 px-4 py-2.5 text-lg text-slate-500 hover:text-pip-orange hover:bg-bg-tertiary rounded-lg transition border border-dashed border-transparent hover:border-pip-orange/30 min-h-[44px]'
              title='Add child'
            >
              <svg
                className='w-5 h-5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 4v16m8-8H4'
                />
              </svg>
              Add Child
            </button>
          </div>
        )}

        {/* Compact Stats Bar */}
        {selectedChildData && <StatsBar stats={stats} />}

        {/* Quick Play Card - Continue Learning */}
        {selectedChildData && (
          <div className='mt-4 p-4 bg-gradient-to-r from-pip-orange/20 to-pip-rust/10 border border-pip-orange/30 rounded-xl'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 bg-gradient-to-br from-pip-orange to-pip-rust rounded-xl flex items-center justify-center'>
                  <UIIcon name='play' size={24} className='text-white' aria-label='Play game' />
                </div>
                <div>
                  <h3 className='font-bold text-white text-lg'>Continue Learning</h3>
                  <p className='text-base text-white/70'>
                    Pick up where you left off!
                  </p>
                </div>
              </div>
              <Link
                to='/games/alphabet-tracing'
                className='px-4 py-2 bg-gradient-to-r from-pip-orange to-pip-rust text-white rounded-lg font-semibold text-base hover:scale-105 transition-transform'
              >
                Play Now →
              </Link>
            </div>
          </div>
        )}

        {/* Empty State */}
        {children.length === 0 && (
          <EmptyState onAddChild={() => setShowAddModal(true)} />
        )}

        {/* Progress Chart */}
        {selectedChildData && (
          <section className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
            <article className='bg-white border border-border rounded-xl p-6 shadow-soft'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-2xl font-semibold'>Learning Progress</h2>
                <div className='text-base px-3 py-1 bg-bg-tertiary text-slate-600 border border-border rounded-full'>
                  {selectedChildData.preferredLanguage}
                </div>
              </div>
              <div className='space-y-4'>
                {(() => {
                  const lang = selectedChildData.preferredLanguage;
                  const langProgress = letterProgress[lang] || [];
                  const alphabet = getAlphabet(lang);

                  // Show first 5 letters with real progress
                  return alphabet.letters.slice(0, 5).map((letter) => {
                    const letterProg = langProgress.find(
                      (p) => p.letter === letter.char,
                    );
                    const learned = letterProg?.mastered || false;
                    const accuracy = letterProg?.bestAccuracy || 0;

                    return (
                      <div
                        key={letter.char}
                        className='flex items-center gap-4'
                      >
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold ${
                            learned
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-bg-tertiary text-slate-500 border border-border'
                          }`}
                        >
                          {letter.char}
                        </div>
                        <div className='flex-1'>
                          <div className='flex justify-between mb-1'>
                            <span className='text-base flex items-center gap-2'>
                              <UIIcon
                                src={letter.icon}
                                alt={letter.name}
                                size={20}
                                className='opacity-80'
                                fallback={letter.emoji || '✨'}
                              />
                              {letter.name}
                            </span>
                            <span className='text-base text-slate-600'>
                              {learned ? (
                                <>
                                  <UIIcon
                                    name='check'
                                    size={14}
                                    className='inline mr-1 text-green-400'
                                  />
                                  Mastered ({Math.round(accuracy)}%)
                                </>
                              ) : accuracy > 0 ? (
                                <>
                                  <UIIcon
                                    name='circle'
                                    size={14}
                                    className='inline mr-1 text-slate-500'
                                  />
                                  {Math.round(accuracy)}% best
                                </>
                              ) : (
                                <>
                                  <UIIcon
                                    name='circle'
                                    size={14}
                                    className='inline mr-1 text-slate-500'
                                  />
                                  Not started
                                </>
                              )}
                            </span>
                          </div>
                          <progress
                            value={accuracy}
                            max={100}
                            className={`w-full h-2 rounded-full ${getAccuracyProgressClass(accuracy)}`}
                          />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </article>

            {/* Multi-Language Progress */}
            <article className='bg-white border border-border rounded-xl p-6 shadow-soft'>
              <h2 className='text-2xl font-semibold mb-4'>
                Multi-Language Progress
              </h2>
              {selectedChildData.languageProgress.length > 0 ? (
                <div className='space-y-3'>
                  {selectedChildData.languageProgress.map((langProg) => {
                    const percent =
                      langProg.totalLetters > 0
                        ? Math.round(
                            (langProg.lettersLearned / langProg.totalLetters) *
                              100,
                          )
                        : 0;

                    return (
                      <div
                        key={langProg.language}
                        className='border border-border rounded-lg p-3'
                      >
                        <div className='flex justify-between items-center mb-2'>
                          <span className='font-medium capitalize text-lg'>
                            {langProg.language}
                          </span>
                          <span className='text-base text-slate-600'>
                            {langProg.lettersLearned}/{langProg.totalLetters}{' '}
                            letters
                          </span>
                        </div>
                        <div className='flex justify-between text-base mb-1'>
                          <span>Avg. Accuracy:</span>
                          <span>{langProg.averageAccuracy}%</span>
                        </div>
                        <div className='flex justify-between text-base'>
                          <span>Time Spent:</span>
                          <span>
                            {Math.floor(langProg.totalTime / 60)}h{' '}
                            {langProg.totalTime % 60}m
                          </span>
                        </div>
                        <progress
                          value={percent}
                          max={100}
                          className='w-full h-2 rounded-full progress-accent-orange mt-2'
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className='text-center py-6 text-slate-600'>
                  <p className='text-lg'>No progress recorded in other languages yet.</p>
                  <p className='text-base mt-2'>
                    Try switching languages in the game to start learning!
                  </p>
                </div>
              )}

              {/* Adventure Map Section */}
              <div className='mt-6 pt-6 border-t border-border'>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-xl font-semibold flex items-center gap-2'>
                    <span>🗺️</span>
                    Adventure Map
                  </h2>
                  <div className='flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full'>
                    <span className='text-amber-400'>⭐</span>
                    <span className='text-amber-400 font-bold text-base'>
                      {totalXp} XP
                    </span>
                  </div>
                </div>

                <AdventureMap />

                <div className='mt-4 flex flex-wrap items-center gap-2 text-sm text-white/70'>
                  <span className='px-2 py-1 bg-white/10 border border-border rounded-full'>
                    Quests: {questSummary.completedCount}/
                    {questSummary.totalQuests}
                  </span>
                  <span className='px-2 py-1 bg-white/10 border border-border rounded-full'>
                    Islands: {questSummary.unlockedCount}
                  </span>
                  <span className='px-2 py-1 bg-white/10 border border-border rounded-full'>
                    Current island quests:{' '}
                    {questSummary.currentIslandQuestCount}
                  </span>
                  {questSummary.nextUnlockableIslandId && (
                    <span className='px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-300'>
                      Next island available:{' '}
                      {questSummary.nextUnlockableIslandId}
                    </span>
                  )}
                </div>

                {/* Quick Actions */}
                <div className='mt-4 flex gap-2'>
                  <button
                    type='button'
                    onClick={() => {
                      startQuest('quest-a-to-z');
                      navigate('/games/alphabet-tracing?quest=quest-a-to-z');
                    }}
                    className='flex-1 px-3 py-2 bg-gradient-to-r from-pip-orange to-pip-rust text-white rounded-lg font-semibold text-base hover:scale-[1.02] transition-transform'
                  >
                    Start Alphabet Quest
                  </button>
                  <Link
                    to='/games'
                    className='flex-1 px-3 py-2 bg-white/10 border border-border rounded-lg font-semibold text-white text-base hover:bg-white/20 transition text-center flex items-center justify-center gap-2'
                  >
                    <UIIcon name='search' size={16} aria-label='Browse all games' />
                    All Games
                  </Link>
                </div>

                {/* Badges Summary */}
                {badges.length > 0 && (
                  <div className='mt-4 p-3 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl'>
                    <p className='text-sm text-amber-400 font-semibold mb-2'>
                      🏆 Badges Earned
                    </p>
                    <div className='flex flex-wrap gap-1'>
                      {badges.slice(0, 6).map((badge) => (
                        <span
                          key={badge}
                          className='px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-sm text-amber-300'
                        >
                          {badge.replace('badge:', '')}
                        </span>
                      ))}
                      {badges.length > 6 && (
                        <span className='px-2 py-1 text-sm text-amber-400/70'>
                          +{badges.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Play Games Button */}
              <div className='mt-6 pt-6 border-t border-border'>
                <Link
                  to='/games'
                  className='flex items-center justify-center gap-2 w-full px-4 py-3 bg-pip-orange text-white rounded-lg font-semibold text-lg hover:bg-pip-rust transition text-center'
                >
                  <UIIcon name='hand' size={24} aria-label='Play games with hand tracking' />
                  Play Games
                </Link>
              </div>
            </article>
          </section>
        )}

        {/* Letter Journey - PROMINENT at top */}
        {selectedChildData && (
          <section className='mb-6'>
            <div className='flex items-center justify-between mb-2'>
              <h2 className='text-xl font-semibold'>Letter Journey</h2>
              <span className='text-sm text-slate-500 capitalize'>
                {selectedChildData.preferredLanguage}
              </span>
            </div>
            <LetterJourney language={selectedChildData.preferredLanguage} />
          </section>
        )}

        {/* Tips Section */}
        <TipsSection />

        {/* Add Child Modal */}
        <AddChildModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          childName={newChildName}
          onChildNameChange={setNewChildName}
          childAge={newChildAge}
          onChildAgeChange={setNewChildAge}
          childLanguage={newChildLanguage}
          onChildLanguageChange={setNewChildLanguage}
          onSubmit={handleCreateProfile}
          isSubmitting={isCreating}
        />

        {/* Edit Profile Modal */}
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingProfile(null);
          }}
          profile={editingProfile}
          editName={editName}
          onEditNameChange={setEditName}
          editLanguage={editLanguage}
          onEditLanguageChange={setEditLanguage}
          onSubmit={handleUpdateProfile}
          isSubmitting={isUpdating}
        />

        {/* Story Modal */}
        {showStoryModal && (
          <StoryModal
            open={true}
            onClose={() => {
              completeQuest('demo-quest');
              setShowStoryModal(false);
              toast.showToast('Quest completed! Badge earned 🎉', 'success');
            }}
            title='Quest Complete'
            badge='Explorer Badge'
          />
        )}
      </motion.div>
    </section>
  );
});
