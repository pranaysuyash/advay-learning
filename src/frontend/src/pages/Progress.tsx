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

  const { metrics, scorecard, honestStats, plantGrowth } =
    useProgressMetrics(progress);

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

  useEffect(() => {
    if (profiles.length > 0 && !selectedProfileId) {
      setSelectedProfileId(profiles[0].id);
    }
  }, [profiles, selectedProfileId]);

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
    <div className='max-w-7xl mx-auto px-4 py-8 lg:py-12 bg-[#FFF8F0] min-h-screen'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className='flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12'>
          <div>
            <h1 className='text-4xl sm:text-5xl font-black text-slate-800 tracking-tight'>
              Learning <span className="text-[#10B981]">Progress</span>
            </h1>
            <p className='text-xl text-slate-500 font-bold mt-3'>
              Track growth and celebrate achievements.
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-4 bg-white p-3 rounded-[1.5rem] border-4 border-slate-100 shadow-sm'>
            {/* Period Selector */}
            <div className='flex bg-slate-50 border-2 border-slate-200 rounded-xl p-1'>
              {(['week', 'month', 'all'] as const).map((period) => (
                <button
                  key={period}
                  type='button'
                  onClick={() => setReportPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors ${reportPeriod === period
                      ? 'bg-[#E85D04] text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-200'
                    }`}
                >
                  {period}
                </button>
              ))}
            </div>

            {/* Pending indicator */}
            {pendingCount > 0 && (
              <div className='inline-flex items-center gap-2 bg-yellow-100 border-2 border-yellow-200 text-yellow-700 px-4 py-2 rounded-xl text-sm font-bold'>
                <UIIcon name='warning' size={16} />
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
              className='px-4 py-2 bg-slate-100 hover:bg-slate-200 border-2 border-slate-200 rounded-xl text-slate-600 font-bold text-sm tracking-wider uppercase transition-colors'
              disabled={syncing}
            >
              {syncing ? 'Syncing...' : 'Sync now'}
            </button>

            {/* Profile Selector */}
            {profiles.length > 0 && (
              <div className="relative">
                <select
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  aria-label='Select child profile'
                  title='Select child profile'
                  className='appearance-none px-6 py-2 pr-10 bg-white border-2 border-slate-200 rounded-xl text-slate-800 font-bold shadow-sm focus:outline-none focus:border-[#3B82F6]'
                >
                  {profiles.map((profile) => (
                    <option
                      key={profile.id}
                      value={profile.id}
                    >
                      {profile.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading Profiles */}
        {isLoadingProfiles && (
          <div className='text-center py-20 bg-white border-4 border-slate-100 rounded-[2.5rem] shadow-sm'>
            <div className='w-20 h-20 mx-auto mb-6 bg-slate-50 rounded-full flex items-center justify-center border-4 border-slate-100'>
              <UIIcon name={'loader' as any} size={40} className='text-slate-400 animate-spin' />
            </div>
            <p className='text-slate-500 font-bold text-xl'>Loading profiles...</p>
          </div>
        )}

        {/* Empty State - No Profiles */}
        {!isLoadingProfiles && !loading && profiles.length === 0 && (
          <div className='text-center py-20 bg-white border-4 border-slate-100 rounded-[2.5rem] shadow-sm'>
            <div className='w-24 h-24 mx-auto mb-6 bg-[#E85D04]/10 rounded-full flex items-center justify-center border-4 border-[#E85D04]/20'>
              <UIIcon name='star' size={48} className='text-[#E85D04]' />
            </div>
            <h3 className='text-3xl font-black text-slate-800 mb-4'>
              No Profiles Yet
            </h3>
            <p className='text-slate-500 font-bold mb-8 max-w-lg mx-auto text-lg'>
              Add a child profile to start tracking their learning progress and
              see their achievements here.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className='px-8 py-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-2xl font-black text-xl border-4 border-[#000000] shadow-[0_6px_0_0_#000000] active:translate-y-[6px] active:shadow-none transition-all'
              type='button'
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Empty State - No Profile Selected */}
        {!isLoadingProfiles &&
          !loading &&
          profiles.length > 0 &&
          !selectedProfileId && (
            <div className='text-center py-20 bg-white border-4 border-slate-100 rounded-[2.5rem] shadow-sm'>
              <div className='w-24 h-24 mx-auto mb-6 bg-[#3B82F6]/10 rounded-full flex items-center justify-center border-4 border-[#3B82F6]/20'>
                <UIIcon name='heart' size={48} className='text-[#3B82F6]' />
              </div>
              <h3 className='text-3xl font-black text-slate-800 mb-4'>
                Select a Profile
              </h3>
              <p className='text-slate-500 font-bold max-w-lg mx-auto text-lg'>
                Choose a child profile from the dropdown above to view their
                learning progress.
              </p>
            </div>
          )}

        {loading && (
          <div className='text-center py-20 bg-white border-4 border-slate-100 rounded-[2.5rem] shadow-sm'>
            <div className='w-20 h-20 mx-auto mb-6 bg-slate-50 rounded-full flex items-center justify-center border-4 border-slate-100'>
              <UIIcon name={'loader' as any} size={40} className='text-slate-400 animate-spin' />
            </div>
            <p className='text-slate-500 font-bold text-xl'>Loading progress...</p>
          </div>
        )}

        {error && (
          <div className='bg-red-50 border-4 border-red-200 rounded-[2rem] p-8 mb-8 shadow-sm flex items-center gap-4'>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <UIIcon name={'warning' as any} size={24} className="text-red-500" />
            </div>
            <p className='text-red-700 font-bold text-lg'>{error}</p>
          </div>
        )}

        {!loading && !error && stats && (
          <>
            {/* Plant Visualization Section */}
            <div className='bg-white border-4 border-slate-100 rounded-[2.5rem] p-8 md:p-12 mb-12 shadow-sm relative overflow-hidden'>
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#10B981]/5 rounded-bl-full -z-10"></div>

              <div className='text-center mb-10'>
                <h2 className='text-4xl font-black text-slate-800 mb-2'>
                  Your Learning Garden
                </h2>
                <p className='text-xl text-slate-500 font-bold'>
                  Watch your knowledge grow with every practice session
                </p>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
                <div className='flex justify-center'>
                  <div className="w-72 h-72 bg-gradient-to-b from-blue-50 to-white rounded-full border-4 border-slate-100 flex items-center justify-center shadow-sm relative pt-12">
                    <PlantVisualization
                      progressPercentage={plantGrowth.progress}
                      growthStage={plantGrowth.stage as any}
                      className='w-48 h-48'
                    />
                  </div>
                </div>

                <div className='space-y-6'>
                  <div className='bg-slate-50 border-4 border-slate-100 rounded-[2rem] p-8 shadow-sm'>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#10B981] rounded-xl flex items-center justify-center text-white border-2 border-[#000]">
                        <UIIcon name={'star' as any} size={20} />
                      </div>
                      <h3 className='text-2xl font-black text-slate-800 uppercase tracking-tight'>
                        Stage: <span className="text-[#10B981]">{plantGrowth.stage}</span>
                      </h3>
                    </div>
                    <p className='text-lg font-semibold text-slate-600 mb-6 leading-relaxed'>
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
                    <div className='bg-white border-2 border-slate-200 rounded-xl p-4 flex justify-between items-center'>
                      <span className="font-bold text-slate-500 uppercase tracking-widest text-sm">Next Goal</span>
                      <span className='text-lg text-[#E85D04] font-black'>
                        {plantGrowth.nextMilestone}
                      </span>
                    </div>
                  </div>

                  <div className='text-center bg-white border-4 border-slate-100 rounded-[2rem] p-6 shadow-sm flex items-center justify-between'>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-[#3B82F6]/10 rounded-2xl flex items-center justify-center">
                        <span className="text-3xl">🏆</span>
                      </div>
                      <div className='text-left'>
                        <div className='text-slate-500 font-bold uppercase tracking-wider text-sm'>Overall Score</div>
                        <div className='text-slate-800 font-black text-2xl'>Learning Average</div>
                      </div>
                    </div>
                    <div className='text-5xl font-black text-[#3B82F6]'>
                      {scorecard.overallScore}<span className="text-2xl text-slate-400">/100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Unified Metrics Section */}
            <div className='mb-12'>
              <h2 className='text-3xl font-black text-slate-800 mb-8 flex items-center gap-3'>
                <span className="text-4xl text-[#10B981]">📊</span> Learning Dimensions
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
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12'>
              {/* Insights */}
              <div className='bg-white border-4 border-slate-100 rounded-[2.5rem] p-8 shadow-sm'>
                <h3 className='text-2xl font-black text-slate-800 mb-6 flex items-center gap-3'>
                  <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <UIIcon
                      name='sparkles'
                      size={20}
                      className='text-yellow-600'
                    />
                  </div>
                  Insights
                </h3>
                <div className='space-y-4'>
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
              <div className='bg-white border-4 border-slate-100 rounded-[2.5rem] p-8 shadow-sm'>
                <h3 className='text-2xl font-black text-slate-800 mb-6 flex items-center gap-3'>
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <UIIcon name='target' size={20} className='text-green-600' />
                  </div>
                  Recommendations
                </h3>
                <div className='space-y-4'>
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

            {/* Honest Progress Stats */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'>
              <div className='bg-white border-4 border-slate-100 rounded-[2rem] p-8 text-center flex flex-col items-center shadow-sm relative overflow-hidden group hover:border-[#F59E0B] transition-colors'>
                <div className='absolute -right-6 -top-6 w-24 h-24 bg-[#F59E0B]/10 rounded-full blur-xl group-hover:bg-[#F59E0B]/20 transition-colors'></div>
                <div className='w-16 h-16 bg-[#F59E0B]/10 rounded-2xl flex items-center justify-center mb-4 text-3xl group-hover:scale-110 transition-transform'>🔤</div>
                <div className='text-5xl font-black text-slate-800 mb-2'>
                  {honestStats.uniqueLettersPracticed}
                </div>
                <div className='text-slate-500 font-bold uppercase tracking-wider text-sm'>
                  Unique Letters Practiced
                </div>
              </div>
              <div className='bg-white border-4 border-slate-100 rounded-[2rem] p-8 text-center flex flex-col items-center shadow-sm relative overflow-hidden group hover:border-[#10B981] transition-colors'>
                <div className='absolute -right-6 -top-6 w-24 h-24 bg-[#10B981]/10 rounded-full blur-xl group-hover:bg-[#10B981]/20 transition-colors'></div>
                <div className='w-16 h-16 bg-[#10B981]/10 rounded-2xl flex items-center justify-center mb-4 text-3xl group-hover:scale-110 transition-transform'>🎯</div>
                <div className='text-5xl font-black text-slate-800 mb-2'>
                  {honestStats.avgTracingAccuracy}%
                </div>
                <div className='text-slate-500 font-bold uppercase tracking-wider text-sm'>
                  Average Accuracy
                </div>
              </div>
              <div className='bg-white border-4 border-slate-100 rounded-[2rem] p-8 text-center flex flex-col items-center shadow-sm relative overflow-hidden group hover:border-[#3B82F6] transition-colors'>
                <div className='absolute -right-6 -top-6 w-24 h-24 bg-[#3B82F6]/10 rounded-full blur-xl group-hover:bg-[#3B82F6]/20 transition-colors'></div>
                <div className='w-16 h-16 bg-[#3B82F6]/10 rounded-2xl flex items-center justify-center mb-4 text-3xl group-hover:scale-110 transition-transform'>🚀</div>
                <div className='text-5xl font-black text-slate-800 mb-2'>
                  {honestStats.totalActivities}
                </div>
                <div className='text-slate-500 font-bold uppercase tracking-wider text-sm'>Total Activities</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className='bg-white border-4 border-slate-100 rounded-[2.5rem] p-8 lg:p-12 shadow-sm'>
              <h2 className='text-3xl font-black text-slate-800 mb-8 flex items-center gap-3'>
                <span className="text-4xl">⏱️</span> Recent Activity
              </h2>
              {honestStats.recentActivity.length === 0 ? (
                <div className='text-center py-12 bg-slate-50 rounded-[2rem] border-4 border-dashed border-slate-200'>
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-slate-100 shadow-sm text-2xl">🔍</div>
                  <p className='text-slate-500 font-bold text-lg'>
                    No activity yet. Start learning to see your progress here!
                  </p>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {honestStats.recentActivity.map((activity, i) => (
                    <motion.div
                      key={`${activity.timestamp}-${i}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className='flex justify-between items-center p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] hover:border-[#3B82F6]/30 transition-colors group'
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                          {activity.action.includes('Traced') ? '✏️' : '🎮'}
                        </div>
                        <div>
                          <div className='font-black text-slate-800 text-lg group-hover:text-[#3B82F6] transition-colors'>
                            {activity.action}
                          </div>
                          <div className='text-sm font-bold text-slate-500 uppercase tracking-widest mt-1'>
                            {activity.time}
                          </div>
                        </div>
                      </div>
                      <div className='bg-[#10B981]/10 text-[#10B981] font-black px-4 py-2 rounded-xl border-2 border-[#10B981]/20'>
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
