import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../store';
import { progressApi } from '../services/api';
import { progressQueue } from '../services/progressQueue';
import apiClient from '../services/api';
import { UIIcon } from '../components/ui/Icon';
import { PlantVisualization } from '../components/progress/PlantVisualization';
import { MetricCard } from '../components/progress/MetricsCard';
import { RecommendationCard } from '../components/progress/RecommendationCard';
import { useProgressMetrics } from '../hooks/useProgressMetrics';
import { ProgressItem, ProgressStats } from '../types/progress';

export function Progress() {
  const navigate = useNavigate();
  const {
    profiles,
    isLoading: isLoadingProfiles,
    fetchProfiles,
  } = useProfileStore();
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [reportPeriod, setReportPeriod] = useState<'week' | 'month' | 'all'>(
    'all',
  );

  // Use the new progress metrics hook
  const { metrics, scorecard, honestStats, plantGrowth } =
    useProgressMetrics(progress);

  // Fetch profiles on mount
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

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
    if (!selectedProfileId) {
      setLoading(false);
      return;
    }

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

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1 className='text-3xl font-bold'>Learning Progress</h1>
            <p className='text-white/60 mt-1'>
              Track growth and celebrate achievements
            </p>
          </div>

          <div className='flex items-center gap-4'>
            {/* Period Selector */}
            <div className='flex bg-white/10 border border-border rounded-lg p-1'>
              {(['week', 'month', 'all'] as const).map((period) => (
                <button
                  key={period}
                  type='button'
                  onClick={() => setReportPeriod(period)}
                  className={`px-3 py-1 rounded-md text-sm capitalize ${
                    reportPeriod === period
                      ? 'bg-pip-orange text-white'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            {/* Pending indicator */}
            {pendingCount > 0 && (
              <div className='inline-flex items-center gap-2 bg-warning/20 border border-warning/30 text-warning px-3 py-1 rounded-full text-sm font-semibold'>
                <UIIcon name='warning' size={14} />
                Pending ({pendingCount})
              </div>
            )}

            <button
              type='button'
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
                aria-label='Select child profile'
                title='Select child profile'
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

        {/* Loading Profiles */}
        {isLoadingProfiles && (
          <div className='text-center py-12'>
            <div className='w-16 h-16 mx-auto mb-4'>
              <img
                src='/assets/images/loading-pip.svg'
                alt='Loading'
                className='w-full h-full object-contain'
              />
            </div>
            <p className='text-white/60'>Loading profiles...</p>
          </div>
        )}

        {/* Empty State - No Profiles */}
        {!isLoadingProfiles && !loading && profiles.length === 0 && (
          <div className='text-center py-16'>
            <div className='w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center'>
              <UIIcon name='star' size={48} className='text-white/60' />
            </div>
            <h3 className='text-xl font-semibold text-white mb-2'>
              No Profiles Yet
            </h3>
            <p className='text-white/60 mb-6 max-w-md mx-auto'>
              Add a child profile to start tracking their learning progress and
              see their achievements here.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className='px-6 py-3 bg-pip-orange text-white rounded-xl font-semibold hover:bg-pip-rust transition'
              type='button'
            >
              Go to Dashboard to Add Profile
            </button>
          </div>
        )}

        {/* Empty State - No Profile Selected */}
        {!isLoadingProfiles &&
          !loading &&
          profiles.length > 0 &&
          !selectedProfileId && (
            <div className='text-center py-16'>
              <div className='w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center'>
                <UIIcon name='heart' size={48} className='text-white/60' />
              </div>
              <h3 className='text-xl font-semibold text-white mb-2'>
                Select a Profile
              </h3>
              <p className='text-white/60 max-w-md mx-auto'>
                Choose a child profile from the dropdown above to view their
                learning progress.
              </p>
            </div>
          )}

        {loading && (
          <div className='text-center py-12'>
            <div className='w-16 h-16 mx-auto mb-4'>
              <img
                src='/assets/images/loading-pip.svg'
                alt='Loading'
                className='w-full h-full object-contain'
              />
            </div>
            <p className='text-white/60'>Loading progress...</p>
          </div>
        )}

        {error && (
          <div className='bg-red-500/20 border border-red-500/30 rounded-xl p-6 mb-8'>
            <p className='text-text-error'>{error}</p>
          </div>
        )}

        {!loading && !error && stats && (
          <>
            {/* Plant Visualization Section */}
            <div className='bg-white/10 border border-border rounded-xl p-8 mb-8'>
              <div className='text-center mb-6'>
                <h2 className='text-2xl font-bold text-white mb-2'>
                  Your Learning Garden
                </h2>
                <p className='text-white/60'>
                  Watch your knowledge grow with every practice session
                </p>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-center'>
                <div className='flex justify-center'>
                  <PlantVisualization
                    progressPercentage={plantGrowth.progress}
                    growthStage={plantGrowth.stage}
                    className='w-64 h-64'
                  />
                </div>

                <div className='space-y-4'>
                  <div className='bg-white/5 border border-border rounded-lg p-4'>
                    <h3 className='font-semibold text-white mb-2'>
                      Growth Stage: {plantGrowth.stage}
                    </h3>
                    <p className='text-sm text-white/80 mb-3'>
                      {plantGrowth.stage === 'seed' &&
                        'Your learning journey has just begun! Every practice helps the seed sprout.'}
                      {plantGrowth.stage === 'sprout' &&
                        'Great progress! Your plant is growing stronger with each activity.'}
                      {plantGrowth.stage === 'young' &&
                        'Wonderful growth! Your plant is developing leaves and getting ready to mature.'}
                      {plantGrowth.stage === 'mature' &&
                        'Excellent work! Your plant is strong and ready to bloom with knowledge.'}
                      {plantGrowth.stage === 'blooming' &&
                        'Amazing! Your plant is in full bloom, showcasing your learning achievements.'}
                    </p>
                    <p className='text-sm text-pip-orange font-medium'>
                      Next: {plantGrowth.nextMilestone}
                    </p>
                  </div>

                  <div className='text-center'>
                    <div className='text-3xl font-bold text-white mb-1'>
                      {scorecard.overallScore}/100
                    </div>
                    <div className='text-white/60'>Overall Learning Score</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Unified Metrics Section */}
            <div className='mb-8'>
              <h2 className='text-2xl font-bold text-white mb-6'>
                Learning Dimensions
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                <MetricCard
                  title='Practice'
                  score={metrics.practice.score}
                  level={metrics.practice.level}
                  description={metrics.practice.description}
                  icon='activity'
                  color='blue'
                  delay={0.1}
                />
                <MetricCard
                  title='Mastery'
                  score={metrics.mastery.score}
                  level={metrics.mastery.level}
                  description={metrics.mastery.description}
                  icon='target'
                  color='green'
                  delay={0.2}
                />
                <MetricCard
                  title='Challenge'
                  score={metrics.challenge.score}
                  level={metrics.challenge.level}
                  description={metrics.challenge.description}
                  icon='zap'
                  color='purple'
                  delay={0.3}
                />
                <MetricCard
                  title='Consistency'
                  score={metrics.consistency.score}
                  level={metrics.consistency.level}
                  description={metrics.consistency.description}
                  icon='calendar'
                  color='orange'
                  delay={0.4}
                />
              </div>
            </div>

            {/* Insights & Recommendations */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
              {/* Insights */}
              <div className='bg-white/10 border border-border rounded-xl p-6'>
                <h3 className='text-xl font-semibold text-white mb-4 flex items-center gap-2'>
                  <UIIcon
                    name='sparkles'
                    size={20}
                    className='text-yellow-400'
                  />
                  Insights
                </h3>
                <div className='space-y-3'>
                  {scorecard.insights.map((insight: string, i: number) => (
                    <RecommendationCard
                      key={i}
                      type='insight'
                      title='Learning Pattern'
                      description={insight}
                      icon='lightbulb'
                      delay={i * 0.1}
                    />
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className='bg-white/10 border border-border rounded-xl p-6'>
                <h3 className='text-xl font-semibold text-white mb-4 flex items-center gap-2'>
                  <UIIcon name='target' size={20} className='text-green-400' />
                  Recommendations
                </h3>
                <div className='space-y-3'>
                  {scorecard.recommendations.map((rec: string, i: number) => (
                    <RecommendationCard
                      key={i}
                      type='recommendation'
                      title='Next Step'
                      description={rec}
                      icon='compass'
                      delay={i * 0.1}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Strengths & Areas for Improvement */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
              {/* Strengths */}
              <div className='bg-white/10 border border-border rounded-xl p-6'>
                <h3 className='text-xl font-semibold text-white mb-4 flex items-center gap-2'>
                  <UIIcon name='star' size={20} className='text-yellow-400' />
                  Strengths
                </h3>
                <div className='space-y-3'>
                  {scorecard.strengths.map((strength: string, i: number) => (
                    <RecommendationCard
                      key={i}
                      type='strength'
                      title='Great at'
                      description={strength}
                      icon='star'
                      delay={i * 0.1}
                    />
                  ))}
                </div>
              </div>

              {/* Areas for Improvement */}
              <div className='bg-white/10 border border-border rounded-xl p-6'>
                <h3 className='text-xl font-semibold text-white mb-4 flex items-center gap-2'>
                  <UIIcon name='flame' size={20} className='text-orange-400' />
                  Growth Opportunities
                </h3>
                <div className='space-y-3'>
                  {scorecard.areasForImprovement.map(
                    (area: string, i: number) => (
                      <RecommendationCard
                        key={i}
                        type='improvement'
                        title='Focus Area'
                        description={area}
                        icon='arrow-up'
                        delay={i * 0.1}
                      />
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Honest Progress Stats */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
              <div className='bg-white/10 border border-border rounded-xl p-6 text-center'>
                <div className='text-3xl font-bold text-white mb-1'>
                  {honestStats.uniqueLettersPracticed}
                </div>
                <div className='text-white/60 text-sm'>
                  Unique Letters Practiced
                </div>
              </div>
              <div className='bg-white/10 border border-border rounded-xl p-6 text-center'>
                <div className='text-3xl font-bold text-white mb-1'>
                  {honestStats.avgTracingAccuracy}%
                </div>
                <div className='text-white/60 text-sm'>
                  Average Tracing Accuracy
                </div>
              </div>
              <div className='bg-white/10 border border-border rounded-xl p-6 text-center'>
                <div className='text-3xl font-bold text-white mb-1'>
                  {honestStats.totalActivities}
                </div>
                <div className='text-white/60 text-sm'>Total Activities</div>
              </div>
            </div>

            {/* Recent Activity (Properly sorted by date) */}
            <div className='bg-white/10 border border-border rounded-xl p-6'>
              <h2 className='text-xl font-semibold mb-4'>Recent Activity</h2>
              {honestStats.recentActivity.length === 0 ? (
                <p className='text-white/60 text-center py-8'>
                  No activity yet. Start learning to see your progress here!
                </p>
              ) : (
                <div className='space-y-4'>
                  {honestStats.recentActivity.map((activity, i) => (
                    <motion.div
                      key={`${activity.timestamp}-${i}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className='flex justify-between items-center py-3 border-b border-border last:border-0'
                    >
                      <div>
                        <div className='font-medium text-white'>
                          {activity.action}
                        </div>
                        <div className='text-sm text-white/60'>
                          {activity.time}
                        </div>
                      </div>
                      <div className='text-text-success font-semibold'>
                        {activity.score}
                      </div>
                    </motion.div>
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
