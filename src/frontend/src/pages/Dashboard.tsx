import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  useAuthStore,
  useProfileStore,
  useSettingsStore,
  useProgressStore,
} from '../store';
import { getAlphabet } from '../data/alphabets';
import { LetterJourney } from '../components/LetterJourney';

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
}

export function Dashboard() {
  const { user } = useAuthStore();
  const { profiles, fetchProfiles, createProfile } = useProfileStore();
  const settings = useSettingsStore();
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Add Child Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState(5);
  const [newChildLanguage, setNewChildLanguage] = useState('en');
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

  // Get real progress data
  const { letterProgress, getMasteredLettersCount } = useProgressStore();

  // Transform profiles to include REAL progress data
  const children: ChildProfile[] = profiles.map((profile) => {
    // Map 2-letter codes to full names for alphabet lookup
    const langCode = profile.preferred_language || 'en';
    const lang = langCode === 'hi' ? 'hindi' 
               : langCode === 'kn' ? 'kannada'
               : langCode === 'te' ? 'telugu'
               : langCode === 'ta' ? 'tamil'
               : 'english';
    const alphabet = getAlphabet(langCode);
    const langProgress = letterProgress[lang] || [];

    // Calculate real stats
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
    };
  });

  const selectedChildData =
    children.find((c) => c.id === selectedChild) || children[0];

  const stats = selectedChildData
    ? [
        {
          label: 'Letters Learned',
          value: `${selectedChildData.progress.lettersLearned}/${selectedChildData.progress.totalLetters}`,
          icon: '🔤',
          percent:
            (selectedChildData.progress.lettersLearned /
              selectedChildData.progress.totalLetters) *
            100,
        },
        {
          label: 'Average Accuracy',
          value: `${selectedChildData.progress.averageAccuracy}%`,
          icon: '🎯',
          percent: selectedChildData.progress.averageAccuracy,
        },
        {
          label: 'Time Spent',
          value: `${Math.floor(selectedChildData.progress.totalTime / 60)}h ${selectedChildData.progress.totalTime % 60}m`,
          icon: '⏱️',
          percent: Math.min(
            (selectedChildData.progress.totalTime / 300) * 100,
            100,
          ),
        },
        {
          label: 'Current Streak',
          value: '5 days',
          icon: '🔥',
          percent: 75,
        },
      ]
    : [];

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
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className='mb-8 flex justify-between items-start'>
          <div>
            <h1 className='text-3xl font-bold'>Parent Dashboard</h1>
            <p className='text-white/60 mt-1'>
              Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting || children.length === 0}
            className='px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition disabled:opacity-50 flex items-center gap-2'
          >
            {exporting ? '⏳ Exporting...' : '📥 Export Data'}
          </button>
        </div>

        {/* Child Selector */}
        {children.length > 0 && (
          <div className='mb-6'>
            <label className='block text-sm font-medium text-white/60 mb-2'>
              Select Child
            </label>
            <div className='flex gap-2 flex-wrap'>
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child.id)}
                  className={`px-4 py-2 rounded-lg transition ${
                    selectedChildData?.id === child.id
                      ? 'bg-red-500 text-white'
                      : 'bg-white/10 border border-white/20 hover:bg-white/20'
                  }`}
                >
                  {child.name} ({child.age} yrs)
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {selectedChildData && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className='bg-white/5 border border-white/10 rounded-xl p-6'
              >
                <div className='text-3xl mb-2'>{stat.icon}</div>
                <div className='text-3xl font-bold'>{stat.value}</div>
                <div className='text-white/60 mb-3'>{stat.label}</div>
                {/* Progress bar */}
                <div className='h-2 bg-white/10 rounded-full overflow-hidden'>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.percent}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1 + 0.3 }}
                    className='h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full'
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {children.length === 0 && (
          <div className='bg-white/5 border border-white/10 rounded-xl p-12 text-center mb-8'>
            <div className='text-6xl mb-4'>👨‍👩‍👧‍👦</div>
            <h2 className='text-2xl font-semibold mb-2'>
              No Children Added Yet
            </h2>
            <p className='text-white/60 mb-6'>
              Add a child profile to start tracking their learning progress.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className='px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/30 transition'
            >
              Add Child Profile
            </button>
          </div>
        )}

        {/* Add Child Button (when children exist) */}
        {children.length > 0 && (
          <div className='mb-8 text-center'>
            <button
              onClick={() => setShowAddModal(true)}
              className='px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition text-sm'
            >
              + Add Another Child
            </button>
          </div>
        )}

        {/* Progress Chart */}
        {selectedChildData && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
            <div className='bg-white/5 border border-white/10 rounded-xl p-6'>
              <h2 className='text-xl font-semibold mb-4'>Learning Progress</h2>
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
                              : 'bg-white/10 text-white/40'
                          }`}
                        >
                          {letter.char}
                        </div>
                        <div className='flex-1'>
                          <div className='flex justify-between mb-1'>
                            <span className='text-sm'>{letter.name}</span>
                            <span className='text-sm text-white/60'>
                              {learned
                                ? `✓ Mastered (${Math.round(accuracy)}%)`
                                : accuracy > 0
                                  ? `○ ${Math.round(accuracy)}% best`
                                  : '○ Not started'}
                            </span>
                          </div>
                          <div className='h-2 bg-white/10 rounded-full overflow-hidden'>
                            <div
                              className={`h-full rounded-full transition-all ${
                                accuracy === 100
                                  ? 'bg-green-500'
                                  : accuracy >= 70
                                    ? 'bg-blue-500'
                                    : accuracy >= 40
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                              }`}
                              style={{ width: `${accuracy}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            <div className='bg-white/5 border border-white/10 rounded-xl p-6'>
              <h2 className='text-xl font-semibold mb-4'>Quick Actions</h2>
              <div className='space-y-3'>
                <Link
                  to='/game'
                  state={{ profileId: selectedChildData?.id }}
                  className='block w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/30 transition text-center'
                >
                  🎮 Start Learning Game
                </Link>
                <Link
                  to='/settings'
                  className='block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition text-center'
                >
                  ⚙️ Manage Settings
                </Link>
                <button
                  onClick={() => alert('Weekly report feature coming soon!')}
                  className='block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition text-center'
                >
                  📊 View Weekly Report
                </button>
              </div>

              <div className='mt-6 pt-6 border-t border-white/10'>
                <h3 className='font-medium mb-2'>Current Settings</h3>
                <div className='space-y-2 text-sm text-white/60'>
                  <div className='flex justify-between'>
                    <span>Language:</span>
                    <span className='text-white capitalize'>
                      {selectedChildData.preferredLanguage}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Difficulty:</span>
                    <span className='text-white capitalize'>
                      {settings.difficulty}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Time Limit:</span>
                    <span className='text-white'>
                      {settings.timeLimit > 0
                        ? `${settings.timeLimit} min`
                        : 'No limit'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Letter Journey */}
        {selectedChildData && (
          <div className='mb-8'>
            <LetterJourney language={selectedChildData.preferredLanguage} />
          </div>
        )}

        {/* Tips Section */}
        <div className='bg-blue-500/10 border border-blue-500/20 rounded-xl p-6'>
          <h2 className='text-lg font-semibold mb-3 text-blue-400'>
            💡 Learning Tips
          </h2>
          <ul className='space-y-2 text-white/70 text-sm'>
            <li>• Encourage your child to practice for 10-15 minutes daily</li>
            <li>• Celebrate achievements to keep motivation high</li>
            <li>• Use the tracing game to improve handwriting skills</li>
            <li>• Switch languages to build multilingual skills</li>
          </ul>
        </div>

        {/* Add Child Modal */}
        {showAddModal && (
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className='bg-gray-900 border border-white/10 rounded-xl p-6 max-w-md w-full'
            >
              <h2 className='text-2xl font-bold mb-4'>Add Child Profile</h2>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-white/80 mb-2'>
                    Child's Name *
                  </label>
                  <input
                    type='text'
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    placeholder='Enter name'
                    className='w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-red-500 transition'
                    autoFocus
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-white/80 mb-2'>
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
                    placeholder='Enter age (2-12, can use decimals like 2.5)'
                    className='w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-red-500 transition'
                  />
                  <p className='text-xs text-white/50 mt-1'>Use decimals for partial years (e.g., 2.5 for 2 years 6 months)</p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-white/80 mb-2'>
                    Preferred Language
                  </label>
                  <select
                    value={newChildLanguage}
                    onChange={(e) => setNewChildLanguage(e.target.value)}
                    aria-label='Preferred Language'
                    className='w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-red-500 transition'
                  >
                    <option value='en'>English</option>
                    <option value='hi'>Hindi (हिन्दी)</option>
                    <option value='kn'>Kannada (ಕನ್ನಡ)</option>
                    <option value='te'>Telugu (తెలుగు)</option>
                    <option value='ta'>Tamil (தமிழ்)</option>
                  </select>
                </div>
              </div>

              <div className='flex gap-3 mt-6'>
                <button
                  onClick={() => setShowAddModal(false)}
                  className='flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition'
                >
                  Cancel
                </button>
                <button
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
      </motion.div>
    </div>
  );
}
