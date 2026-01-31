import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  useAuthStore,
  useProfileStore,
  useSettingsStore,
  useProgressStore,
  type Profile,
} from '../store';
import { getAlphabet } from '../data/alphabets';
import { LetterJourney } from '../components/LetterJourney';
import { Icon } from '../components/Icon';
import { UIIcon } from '../components/ui';
import { useToast } from '../components/ui/Toast';

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

export function Dashboard() {
  useAuthStore();
  const { profiles, fetchProfiles, createProfile, updateProfile } =
    useProfileStore();
  const toast = useToast();
  useSettingsStore();
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

  // Helper function to get star rating from percentage
  const getStarRating = (
    accuracy: number,
  ): { stars: number; emoji: string } => {
    if (accuracy >= 90) return { stars: 3, emoji: '⭐⭐⭐' };
    if (accuracy >= 70) return { stars: 2, emoji: '⭐⭐' };
    if (accuracy >= 40) return { stars: 1, emoji: '⭐' };
    return { stars: 0, emoji: '☆' };
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
        {/* Header - Clean, single title */}
        <header className='mb-6 flex justify-between items-center'>
          <h1 className='text-2xl font-bold'>Dashboard</h1>
          <button
            onClick={handleExport}
            disabled={exporting || children.length === 0}
            className='p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition disabled:opacity-30'
            title='Export progress data'
          >
            {exporting ? (
              <UIIcon name='hourglass' size={20} />
            ) : (
              <UIIcon name='download' size={20} />
            )}
          </button>
        </header>

        {/* Child Selector - Clean, minimal */}
        {children.length > 0 && (
          <div className='mb-4 flex items-center gap-2 flex-wrap'>
            {children.map((child) => (
              <div key={child.id} className='flex items-center'>
                <button
                  onClick={() => setSelectedChild(child.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition text-sm ${
                    selectedChildData?.id === child.id
                      ? 'bg-pip-orange text-white shadow-soft'
                      : 'bg-white border border-border hover:bg-bg-tertiary text-text-primary'
                  }`}
                >
                  <span className='font-medium'>{child.name}</span>
                  <span className='opacity-70 text-xs'>({child.age})</span>
                </button>
                <button
                  onClick={() => handleOpenEditModal(child)}
                  className='p-1.5 ml-0.5 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-md transition'
                  aria-label={`Edit ${child.name}'s profile`}
                  title='Edit'
                >
                  <svg
                    className='w-3.5 h-3.5'
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
              className='flex items-center gap-1 px-2 py-1.5 text-sm text-text-muted hover:text-pip-orange hover:bg-bg-tertiary rounded-lg transition border border-dashed border-transparent hover:border-pip-orange/30'
              title='Add child'
            >
              <svg
                className='w-4 h-4'
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
        {selectedChildData && (
          <div className='mb-6 flex flex-wrap items-center gap-4 py-3 px-4 bg-white border border-border rounded-xl shadow-soft'>
            {stats.map((stat, i) => (
              <div key={i} className='flex items-center gap-2'>
                <UIIcon
                  name={stat.iconName}
                  size={16}
                  className='text-text-muted'
                />
                <span className='text-sm text-text-secondary'>
                  {stat.label}:
                </span>
                <span className='text-sm font-semibold text-text-primary'>
                  {stat.value}
                </span>
                {stat.percent > 0 && (
                  <progress
                    value={stat.percent}
                    max={100}
                    className='w-16 h-1.5 rounded-full'
                    style={{ accentColor: '#E85D04' }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {children.length === 0 && (
          <div className='bg-white border border-border rounded-xl p-12 text-center mb-8 shadow-soft'>
            <div className='w-24 h-24 mx-auto mb-4'>
              <img
                src='/assets/images/empty-no-children.svg'
                alt='No children'
                className='w-full h-full object-contain'
              />
            </div>
            <h2 className='text-2xl font-semibold mb-2'>
              No Children Added Yet
            </h2>
            <p className='text-text-secondary mb-6'>
              Add a child profile to start tracking their learning progress.
            </p>
            <button
              type='button'
              onClick={() => setShowAddModal(true)}
              className='px-6 py-3 bg-pip-orange text-white rounded-lg font-semibold hover:bg-pip-rust shadow-soft hover:shadow-soft-lg transition'
            >
              Add Child Profile
            </button>
          </div>
        )}

        {/* Progress Chart */}
        {selectedChildData && (
          <section className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
            <article className='bg-white border border-border rounded-xl p-6 shadow-soft'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-semibold'>Learning Progress</h2>
                <div className='text-sm px-3 py-1 bg-bg-tertiary text-text-secondary border border-border rounded-full'>
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
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${
                            learned
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-bg-tertiary text-text-muted border border-border'
                          }`}
                        >
                          {letter.char}
                        </div>
                        <div className='flex-1'>
                          <div className='flex justify-between mb-1'>
                            <span className='text-sm flex items-center gap-2'>
                              <Icon
                                src={letter.icon}
                                alt={letter.name}
                                size={16}
                                className='opacity-80'
                                fallback={letter.emoji || '✨'}
                              />
                              {letter.name}
                            </span>
                            <span className='text-sm text-text-secondary'>
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
                                    className='inline mr-1 text-text-muted'
                                  />
                                  {Math.round(accuracy)}% best
                                </>
                              ) : (
                                <>
                                  <UIIcon
                                    name='circle'
                                    size={14}
                                    className='inline mr-1 text-text-muted'
                                  />
                                  Not started
                                </>
                              )}
                            </span>
                          </div>
                          <progress
                            value={accuracy}
                            max={100}
                            className='w-full h-2 rounded-full'
                            style={{
                              accentColor:
                                accuracy === 100
                                  ? '#5A8A72'
                                  : accuracy >= 70
                                    ? '#5A8A72'
                                    : accuracy >= 40
                                      ? '#B8956A'
                                      : '#B54A32',
                            }}
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
              <h2 className='text-xl font-semibold mb-4'>
                Multi-Language Progress
              </h2>
              {selectedChildData.languageProgress.length > 0 ? (
                <div className='space-y-3'>
                  {selectedChildData.languageProgress.map((langProg) => (
                    <div
                      key={langProg.language}
                      className='border border-border rounded-lg p-3'
                    >
                      <div className='flex justify-between items-center mb-2'>
                        <span className='font-medium capitalize'>
                          {langProg.language}
                        </span>
                        <span className='text-sm text-text-secondary'>
                          {langProg.lettersLearned}/{langProg.totalLetters}{' '}
                          letters
                        </span>
                      </div>
                      <div className='flex justify-between text-sm mb-1'>
                        <span>Avg. Accuracy:</span>
                        <span>{langProg.averageAccuracy}%</span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span>Time Spent:</span>
                        <span>
                          {Math.floor(langProg.totalTime / 60)}h{' '}
                          {langProg.totalTime % 60}m
                        </span>
                      </div>
                      <div className='h-2 bg-bg-tertiary rounded-full overflow-hidden mt-2'>
                        <div
                          className='h-full rounded-full bg-pip-orange'
                          style={{
                            width: `${(langProg.lettersLearned / langProg.totalLetters) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-6 text-text-secondary'>
                  <p>No progress recorded in other languages yet.</p>
                  <p className='text-sm mt-2'>
                    Try switching languages in the game to start learning!
                  </p>
                </div>
              )}

              {/* Play Games Button */}
              <div className='mt-6 pt-6 border-t border-border'>
                <Link
                  to='/games'
                  className='flex items-center justify-center gap-2 w-full px-4 py-3 bg-pip-orange text-white rounded-lg font-semibold hover:bg-pip-rust transition text-center'
                >
                  <UIIcon name='hand' size={20} />
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
              <h2 className='text-lg font-semibold'>Letter Journey</h2>
              <span className='text-xs text-text-muted capitalize'>
                {selectedChildData.preferredLanguage}
              </span>
            </div>
            <LetterJourney language={selectedChildData.preferredLanguage} />
          </section>
        )}

        {/* Tips Section */}
        <section className='bg-bg-secondary border border-border rounded-xl p-6 shadow-soft'>
          <h2 className='text-lg font-semibold mb-3 text-vision-blue'>
            💡 Learning Tips
          </h2>
          <ul className='space-y-2 text-text-secondary text-sm'>
            <li>• Encourage your child to practice for 10-15 minutes daily</li>
            <li>• Celebrate achievements to keep motivation high</li>
            <li>• Use the tracing game to improve handwriting skills</li>
            <li>• Switch languages to build multilingual skills</li>
          </ul>
        </section>

        {/* Add Child Modal */}
        {showAddModal && (
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className='bg-white border border-border rounded-xl p-6 max-w-md w-full shadow-soft-lg'
            >
              <h2 className='text-2xl font-bold mb-4'>Add Child Profile</h2>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-text-secondary mb-2'>
                    Child's Name *
                  </label>
                  <input
                    type='text'
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    placeholder="Child's name"
                    autoComplete='name'
                    className='w-full px-4 py-3 bg-bg-primary border border-border rounded-lg focus:outline-none focus:border-border-strong transition'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-text-secondary mb-2'>
                    Age (years)
                  </label>
                  <input
                    type='number'
                    min={2}
                    max={12}
                    step={0.1}
                    value={newChildAge}
                    onChange={(e) =>
                      setNewChildAge(parseFloat(e.target.value) || 5)
                    }
                    placeholder='Age (2-12 years)'
                    autoComplete='bday'
                    className='w-full px-4 py-3 bg-bg-primary border border-border rounded-lg focus:outline-none focus:border-border-strong transition'
                  />
                  <p className='text-xs text-text-secondary mt-1'>
                    Use decimals for partial years (e.g., 2.5 for 2 years 6
                    months)
                  </p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-text-secondary mb-2'>
                    Preferred Language
                  </label>
                  <select
                    value={newChildLanguage}
                    onChange={(e) => setNewChildLanguage(e.target.value)}
                    aria-label='Choose language'
                    className='w-full px-4 py-3 bg-bg-primary border border-border rounded-lg focus:outline-none focus:border-border-strong transition'
                  >
                    <option value='en'>🇬🇳 English</option>
                    <option value='hi'>🇮🇳 Hindi</option>
                    <option value='kn'>🇮🇳 Kannada</option>
                    <option value='te'>🇮🇳 Telugu</option>
                    <option value='ta'>🇮🇳 Tamil</option>
                  </select>
                </div>
              </div>

              <div className='flex gap-3 mt-6'>
                <button
                  type='button'
                  onClick={() => setShowAddModal(false)}
                  className='flex-1 px-4 py-3 bg-white/10 border border-border rounded-lg hover:bg-white/20 transition'
                >
                  Cancel
                </button>
                <button
                  type='button'
                  onClick={handleCreateProfile}
                  disabled={!newChildName.trim() || isCreating}
                  className='flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isCreating ? 'Creating...' : 'Add Child'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {showEditModal && editingProfile && (
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className='bg-bg-secondary rounded-2xl p-6 w-full max-w-md shadow-soft-lg border border-border'
            >
              <h3 className='text-xl font-semibold mb-1'>Edit Profile</h3>
              <p className='text-text-secondary text-sm mb-6'>
                Update {editingProfile.name}'s information
              </p>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-text-secondary mb-2'>
                    Child's Name
                  </label>
                  <input
                    type='text'
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter child's name"
                    className='w-full px-4 py-3 bg-bg-primary border border-border rounded-lg focus:outline-none focus:border-border-strong transition'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-text-secondary mb-2'>
                    Preferred Language
                  </label>
                  <select
                    value={editLanguage}
                    onChange={(e) => setEditLanguage(e.target.value)}
                    aria-label='Choose language'
                    className='w-full px-4 py-3 bg-bg-primary border border-border rounded-lg focus:outline-none focus:border-border-strong transition'
                  >
                    <option value='en'>🇬🇧 English</option>
                    <option value='hi'>🇮🇳 Hindi</option>
                    <option value='kn'>🇮🇳 Kannada</option>
                    <option value='te'>🇮🇳 Telugu</option>
                    <option value='ta'>🇮🇳 Tamil</option>
                  </select>
                  <p className='text-text-muted text-xs mt-2'>
                    This will change the alphabet language in games
                  </p>
                </div>
              </div>

              <div className='flex gap-3 mt-6'>
                <button
                  type='button'
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProfile(null);
                  }}
                  className='flex-1 px-4 py-3 bg-white/10 border border-border rounded-lg hover:bg-white/20 transition'
                >
                  Cancel
                </button>
                <button
                  type='button'
                  onClick={handleUpdateProfile}
                  disabled={!editName.trim() || isUpdating}
                  className='flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </section>
  );
}
