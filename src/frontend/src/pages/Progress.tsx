import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useProfileStore, useProgressStore } from '../store';
import { progressApi } from '../services/api';
import { progressQueue } from '../services/progressQueue';
import apiClient from '../services/api';
import { UIIcon } from '../components/ui/Icon';
import { getAlphabet } from '../data/alphabets';

interface ProgressItem {
  id: string;
  activity_type: string;
  content_id: string;
  score: number;
  completed_at: string;
}

interface ProgressStats {
  total_activities: number;
  total_score: number;
  average_score: number;
  completed_content: string[];
  completion_count: number;
}

export function Progress() {
  const { profiles } = useProfileStore();
  const { letterProgress: localLetterProgress } = useProgressStore();
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [reportPeriod, setReportPeriod] = useState<'week' | 'month' | 'all'>('all');

  useEffect(() => {
    const update = () =>
      setPendingCount(progressQueue.getPending(selectedProfileId || '').length);
    update();
    const unsubscribe = progressQueue.subscribe(update);
    return unsubscribe;
  }, [selectedProfileId]);

  // Set default profile on mount
  useEffect(() => {
    if (profiles.length > 0 && !selectedProfileId) {
      setSelectedProfileId(profiles[0].id);
    }
  }, [profiles, selectedProfileId]);

  // Fetch progress when profile changes
  useEffect(() => {
    if (!selectedProfileId) return;

    const fetchProgress = async () => {
      setLoading(true);
      setError(null);
      try {
        const [progressRes, statsRes] = await Promise.all([
          progressApi.getProgress(selectedProfileId),
          progressApi.getStats(selectedProfileId),
        ]);
        setProgress(progressRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Failed to fetch progress:', err);
        setError('Failed to load progress data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [selectedProfileId]);

  // Get profile to determine preferred language
  const profile = profiles.find(p => p.id === selectedProfileId);
  const profileLanguage = profile?.preferred_language || 'en';
  const alphabet = getAlphabet(profileLanguage);

  // Transform progress data for display
  const letterProgressDisplay = progress
    .filter((p) => p.activity_type === 'letter_tracing')
    .reduce(
      (acc, item) => {
        const existing = acc.find((a) => a.letter === item.content_id);
        if (existing) {
          // Keep the highest score
          existing.accuracy = Math.max(existing.accuracy, item.score);
          existing.status =
            existing.accuracy >= 80 ? 'completed' : 'in_progress';
        } else {
          acc.push({
            letter: item.content_id,
            accuracy: item.score,
            status:
              item.score >= 80
                ? 'completed'
                : item.score > 0
                  ? 'in_progress'
                  : 'locked',
          });
        }
        return acc;
      },
      [] as {
        letter: string;
        accuracy: number;
        status: 'completed' | 'in_progress' | 'locked';
      }[],
    );

  // Sort by letter
  letterProgressDisplay.sort((a, b) => a.letter.localeCompare(b.letter));

  // Get recent activity
  const recentActivity = progress.slice(0, 10).map((item) => ({
    action:
      item.activity_type === 'letter_tracing'
        ? `Practiced letter ${item.content_id}`
        : `Completed ${item.activity_type}`,
    time: new Date(item.completed_at).toLocaleDateString(),
    score: `+${Math.round(item.score)}`,
  }));

  // Calculate weekly/monthly progress
  const calculatePeriodProgress = () => {
    const now = new Date();
    const periodAgo = new Date(now);

    if (reportPeriod === 'week') {
      periodAgo.setDate(now.getDate() - 7);
    } else if (reportPeriod === 'month') {
      periodAgo.setMonth(now.getMonth() - 1);
    } else {
      // For 'all', return all progress
      return progress;
    }

    return progress.filter(item => {
      const itemDate = new Date(item.completed_at);
      return itemDate >= periodAgo && itemDate <= now;
    });
  };

  const periodProgress = calculatePeriodProgress();
  const periodStats = {
    activities: periodProgress.length,
    avgAccuracy: periodProgress.length > 0
      ? Math.round(periodProgress.reduce((sum, item) => sum + item.score, 0) / periodProgress.length)
      : 0,
    newLetters: periodProgress.filter(p => p.activity_type === 'letter_tracing').length
  };

  // Get progress by language
  const languageProgress = Object.entries(localLetterProgress).map(([lang, progress]) => {
    const mastered = progress.filter(p => p.mastered).length;
    const total = getAlphabet(lang).letters.length;
    return {
      language: lang,
      mastered,
      total,
      percentage: total > 0 ? Math.round((mastered / total) * 100) : 0
    };
  });

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold'>Learning Progress</h1>

          <div className='flex items-center gap-4'>
            {/* Period Selector */}
            <div className='flex bg-white/10 border border-border rounded-lg p-1'>
              {(['week', 'month', 'all'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setReportPeriod(period)}
                  className={`px-3 py-1 rounded-md text-sm capitalize ${
                    reportPeriod === period
                      ? 'bg-red-500 text-white'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            {/* Pending indicator */}
            {pendingCount > 0 && (
              <div className='inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-semibold'>
                <UIIcon name="warning" size={14} />
                Pending ({pendingCount})
              </div>
            )}

            <button
              onClick={async () => {
                setSyncing(true);
                try {
                  await progressQueue.syncAll(apiClient);
                } finally {
                  setSyncing(false);
                }
              }}
              className='px-3 py-2 bg-white/10 border border-border rounded-lg text-white text-sm'
              disabled={syncing}
            >
              {syncing ? 'Syncing...' : 'Sync now'}
            </button>

            {/* Profile Selector */}
            {profiles.length > 0 && (
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className='px-4 py-2 bg-white/10 border border-border rounded-lg text-white shadow-sm'
              >
                {profiles.map((profile) => (
                  <option
                    key={profile.id}
                    value={profile.id}
                    className='bg-gray-800'
                  >
                    {profile.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {loading && (
          <div className='text-center py-12'>
            <div className='w-16 h-16 mx-auto mb-4'>
              <img
                src="/assets/images/loading-pip.svg"
                alt="Loading"
                className="w-full h-full object-contain"
              />
            </div>
            <p className='text-white/60'>Loading progress...</p>
          </div>
        )}

        {error && (
          <div className='bg-red-500/20 border border-red-500/30 rounded-xl p-6 mb-8'>
            <p className='text-red-400'>{error}</p>
          </div>
        )}

        {!loading && !error && stats && (
          <>
            {/* Period Stats Overview */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
              <div className='bg-white/10 border border-border rounded-xl p-6 text-center shadow-sm'>
                <div className='text-3xl font-bold'>
                  {periodStats.activities}
                </div>
                <div className='text-white/60'>Activities in {reportPeriod}</div>
              </div>
              <div className='bg-white/10 border border-border rounded-xl p-6 text-center shadow-sm'>
                <div className='text-3xl font-bold'>
                  {periodStats.newLetters}
                </div>
                <div className='text-white/60'>Letters Practiced</div>
              </div>
              <div className='bg-white/10 border border-border rounded-xl p-6 text-center shadow-sm'>
                <div className='text-3xl font-bold'>
                  {periodStats.avgAccuracy}%
                </div>
                <div className='text-white/60'>Avg. Accuracy</div>
              </div>
              <div className='bg-white/10 border border-border rounded-xl p-6 text-center shadow-sm'>
                <div className='text-3xl font-bold'>{stats.total_score}</div>
                <div className='text-white/60'>Total Points</div>
              </div>
            </div>

            {/* Multi-Language Progress */}
            <div className='bg-white/10 border border-border rounded-xl p-6 mb-8 shadow-sm'>
              <h2 className='text-xl font-semibold mb-4'>Multi-Language Progress</h2>
              {languageProgress.length > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {languageProgress.map((langProg) => (
                    <div key={langProg.language} className='border border-border rounded-lg p-3'>
                      <div className='flex justify-between items-center mb-2'>
                        <span className='font-medium capitalize'>{langProg.language}</span>
                        <span className='text-sm text-white/60'>
                          {langProg.mastered}/{langProg.total} letters
                        </span>
                      </div>
                      <div className='flex justify-between text-sm mb-1'>
                        <span>Completion:</span>
                        <span>{langProg.percentage}%</span>
                      </div>
                      <div className='h-2 bg-white/10 rounded-full overflow-hidden mt-2'>
                        <div
                          className='h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500'
                          style={{ width: `${langProg.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-white/60 text-center py-4'>
                  No progress in other languages yet.
                </p>
              )}
            </div>

            {/* Letter Progress */}
            <div className='bg-white/10 border border-border rounded-xl p-6 mb-8 shadow-sm'>
              <h2 className='text-xl font-semibold mb-4'>Alphabet Mastery</h2>
              {letterProgressDisplay.length === 0 ? (
                <p className='text-white/60 text-center py-8'>
                  No progress yet. Start playing to track your learning!
                </p>
              ) : (
                <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
                  {letterProgressDisplay.map((item) => (
                    <div
                      key={item.letter}
                      className={`p-4 rounded-lg text-center ${
                        item.status === 'completed'
                          ? 'bg-green-500/20 border border-green-500/30'
                          : item.status === 'in_progress'
                            ? 'bg-yellow-500/20 border border-yellow-500/30'
                            : 'bg-white/10 border border-border'
                      }`}
                    >
                      <div className='text-2xl font-bold mb-1'>
                        {item.letter}
                      </div>
                      <div className='text-sm text-white/60 flex items-center gap-1'>
                        {item.status === 'completed' ? (
                          <>
                            <UIIcon name="check" size={12} className="text-green-400" />
                            Done
                          </>
                        ) : item.status === 'in_progress' ? (
                          <>
                            <UIIcon name="circle" size={12} />
                            Learning
                          </>
                        ) : (
                          <>
                            <UIIcon name="lock" size={12} />
                            Locked
                          </>
                        )}
                      </div>
                      {item.accuracy > 0 && (
                        <div className='text-sm mt-1'>
                          {Math.round(item.accuracy)}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className='bg-white/10 border border-border rounded-xl p-6 shadow-sm'>
              <h2 className='text-xl font-semibold mb-4'>Recent Activity</h2>
              {recentActivity.length === 0 ? (
                <p className='text-white/60 text-center py-8'>
                  No activity yet. Start learning to see your progress here!
                </p>
              ) : (
                <div className='space-y-4'>
                  {recentActivity.map((activity, i) => (
                    <div
                      key={i}
                      className='flex justify-between items-center py-3 border-b border-border last:border-0'
                    >
                      <div>
                        <div className='font-medium'>{activity.action}</div>
                        <div className='text-sm text-white/60'>
                          {activity.time}
                        </div>
                      </div>
                      <div className='text-green-400 font-semibold'>
                        {activity.score}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
