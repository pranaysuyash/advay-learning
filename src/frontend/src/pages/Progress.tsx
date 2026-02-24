import { memo, useEffect, useState, useMemo } from 'react';
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
import { DailyTimeChart } from '../components/progress/DailyTimeChart';
import { NeedsAttentionSection } from '../components/progress/NeedsAttentionSection';
import { ExportButton } from '../components/progress/ExportButton';
import { useProgressMetrics } from '../hooks/useProgressMetrics';
import { calculateDailyTimeBreakdown, analyzeStruggles } from '../utils/progressCalculations';
import { generateReportData, ReportData } from '../utils/reportExport';
import { ProgressItem, ProgressStats, TimeBreakdownSummary, StruggleSummary } from '../types/progress';

export const Progress = memo(function Progress() {
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
  const [timeBreakdown, setTimeBreakdown] = useState<TimeBreakdownSummary | null>(null);
  const [struggleSummary, setStruggleSummary] = useState<StruggleSummary | null>(null);

  const { metrics, scorecard, honestStats, plantGrowth } =
    useProgressMetrics(progress);

  // Calculate daily time breakdown when progress changes
  useEffect(() => {
    if (progress.length > 0) {
      const breakdown = calculateDailyTimeBreakdown(progress, 20); // 20 min default limit
      setTimeBreakdown(breakdown);
      const struggles = analyzeStruggles(progress);
      setStruggleSummary(struggles);
    } else {
      setTimeBreakdown(null);
      setStruggleSummary(null);
    }
  }, [progress]);

  // Generate report data for export
  const reportData: ReportData | null = useMemo(() => {
    if (!selectedProfileId || progress.length === 0) return null;
    const profile = profiles.find((p) => p.id === selectedProfileId);
    const childName = profile?.name || 'Child';
    return generateReportData(childName, progress);
  }, [progress, profiles, selectedProfileId]);

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
            <h1 className='text-4xl sm:text-5xl font-black text-advay-slate tracking-tight'>
              Learning <span className="text-[#10B981]">Progress</span>
            </h1>
            <p className='text-xl text-text-secondary font-bold mt-3'>
              Track growth and celebrate achievements.
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-4 bg-white p-3 rounded-[1.5rem] border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E]'>
            {/* Export Button */}
            {reportData && <ExportButton data={reportData} />}

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
              className='px-4 py-2 bg-slate-100 hover:bg-slate-200 border-2 border-[#F2CC8F] rounded-xl text-advay-slate font-bold text-sm tracking-wider uppercase transition-colors'
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
                  className='appearance-none px-6 py-2 pr-10 bg-white border-2 border-[#F2CC8F] rounded-xl text-advay-slate font-bold shadow-[0_4px_0_#E5B86E] focus:outline-none focus:border-[#3B82F6]'
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
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-secondary">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading Profiles */}
        {isLoadingProfiles && (
          <div className='text-center py-20 bg-white border-3 border-[#F2CC8F] rounded-[2.5rem] shadow-[0_4px_0_#E5B86E]'>
            <div className='w-20 h-20 mx-auto mb-6 bg-slate-50 rounded-full flex items-center justify-center border-3 border-[#F2CC8F]'>
              <UIIcon name={'loader' as any} size={40} className='text-slate-400 animate-spin' />
            </div>
            <p className='text-text-secondary font-bold text-xl'>Loading profiles...</p>
          </div>
        )}

        {/* Empty State - No Profiles */}
        {!isLoadingProfiles && !loading && profiles.length === 0 && (
          <div className='text-center py-20 bg-white border-3 border-[#F2CC8F] rounded-[2.5rem] shadow-[0_4px_0_#E5B86E]'>
            <div className='w-24 h-24 mx-auto mb-6 bg-[#E85D04]/10 rounded-full flex items-center justify-center border-3 border-[#E85D04]/20'>
              <UIIcon name='star' size={48} className='text-[#E85D04]' />
            </div>
            <h3 className='text-3xl font-black text-advay-slate mb-4'>
              No Profiles Yet
            </h3>
            <p className='text-text-secondary font-bold mb-8 max-w-lg mx-auto text-lg'>
              Add a child profile to start tracking their learning progress and
              see their achievements here.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className='px-8 py-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-2xl font-black text-xl border-3 border-[#000000] shadow-[0_6px_0_0_#000000] active:translate-y-[6px] active:shadow-none transition-all'
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
            <div className='text-center py-20 bg-white border-3 border-[#F2CC8F] rounded-[2.5rem] shadow-[0_4px_0_#E5B86E]'>
              <div className='w-24 h-24 mx-auto mb-6 bg-[#3B82F6]/10 rounded-full flex items-center justify-center border-3 border-[#3B82F6]/20'>
                <UIIcon name='heart' size={48} className='text-[#3B82F6]' />
              </div>
              <h3 className='text-3xl font-black text-advay-slate mb-4'>
                Select a Profile
              </h3>
              <p className='text-text-secondary font-bold max-w-lg mx-auto text-lg'>
                Choose a child profile from the dropdown above to view their
                learning progress.
              </p>
            </div>
          )}

        {loading && (
          <div className='text-center py-20 bg-white border-3 border-[#F2CC8F] rounded-[2.5rem] shadow-[0_4px_0_#E5B86E]'>
            <div className='w-20 h-20 mx-auto mb-6 bg-slate-50 rounded-full flex items-center justify-center border-3 border-[#F2CC8F]'>
              <UIIcon name={'loader' as any} size={40} className='text-slate-400 animate-spin' />
            </div>
            <p className='text-text-secondary font-bold text-xl'>Loading progress...</p>
          </div>
        )}

        {error && (
          <div className='bg-red-50 border-3 border-red-200 rounded-[2rem] p-8 mb-8 shadow-[0_4px_0_#E5B86E] flex items-center gap-4'>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <UIIcon name={'warning' as any} size={24} className="text-red-500" />
            </div>
            <p className='text-red-700 font-bold text-lg'>{error}</p>
          </div>
        )}

        {!loading && !error && stats && (
          <>
            {/* Needs Attention Section - Shows struggling items */}
            {struggleSummary && (
              <NeedsAttentionSection summary={struggleSummary} />
            )}

            {/* Plant Visualization Section */}
            <div className='bg-white border-3 border-[#F2CC8F] rounded-[2.5rem] p-8 md:p-12 mb-12 shadow-[0_4px_0_#E5B86E] relative overflow-hidden'>
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#10B981]/5 rounded-bl-full -z-10"></div>

              <div className='text-center mb-10'>
                <h2 className='text-4xl font-black text-advay-slate mb-2'>
                  Your Learning Garden
                </h2>
                <p className='text-xl text-text-secondary font-bold'>
                  Watch your knowledge grow with every practice session
                </p>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
                <div className='flex justify-center'>
                  <div className="w-72 h-72 bg-gradient-to-b from-blue-50 to-white rounded-full border-3 border-[#F2CC8F] flex items-center justify-center shadow-[0_4px_0_#E5B86E] relative pt-12">
                    <PlantVisualization
                      progressPercentage={plantGrowth.progress}
                      growthStage={plantGrowth.stage as any}
                      className='w-48 h-48'
                    />
                  </div>
                </div>

                <div className='space-y-6'>
                  <div className='bg-slate-50 border-3 border-[#F2CC8F] rounded-[2rem] p-8 shadow-[0_4px_0_#E5B86E]'>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#10B981] rounded-xl flex items-center justify-center text-white border-2 border-[#000]">
                        <UIIcon name={'star' as any} size={20} />
                      </div>
                      <h3 className='text-2xl font-black text-advay-slate uppercase tracking-tight'>
                        Stage: <span className="text-[#10B981]">{plantGrowth.stage}</span>
                      </h3>
                    </div>
                    <p className='text-lg font-semibold text-advay-slate mb-6 leading-relaxed'>
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
                    <div className='bg-white border-2 border-[#F2CC8F] rounded-xl p-4 flex justify-between items-center'>
                      <span className="font-bold text-text-secondary uppercase tracking-widest text-sm">Next Goal</span>
                      <span className='text-lg text-[#E85D04] font-black'>
                        {plantGrowth.nextMilestone}
                      </span>
                    </div>
                  </div>

                  <div className='text-center bg-white border-3 border-[#F2CC8F] rounded-[2rem] p-6 shadow-[0_4px_0_#E5B86E] flex items-center justify-between'>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-[#3B82F6]/10 rounded-2xl flex items-center justify-center">
                        <svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='#3B82F6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9H4.5a2.5 2.5 0 0 1 0-5H6'/><path d='M18 9h1.5a2.5 2.5 0 0 0 0-5H18'/><path d='M4 22h16'/><path d='M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22'/><path d='M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22'/><path d='M18 2H6v7a6 6 0 0 0 12 0V2Z'/></svg>
                      </div>
                      <div className='text-left'>
                        <div className='text-text-secondary font-bold uppercase tracking-wider text-sm'>Overall Score</div>
                        <div className='text-advay-slate font-black text-2xl'>Learning Average</div>
                      </div>
                    </div>
                    <div className='text-5xl font-black text-[#3B82F6]'>
                      {scorecard.overallScore}<span className="text-2xl text-slate-400">/100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Time Breakdown Chart */}
            {timeBreakdown && (
              <div className='mb-12'>
                <DailyTimeChart summary={timeBreakdown} />
              </div>
            )}

            {/* Unified Metrics Section */}
            <div className='mb-12'>
              <h2 className='text-3xl font-black text-advay-slate mb-8 flex items-center gap-3'>
                <svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 24 24' fill='none' stroke='#10B981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><line x1='18' x2='18' y1='20' y2='10'/><line x1='12' x2='12' y1='20' y2='4'/><line x1='6' x2='6' y1='20' y2='14'/></svg> Learning Dimensions
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
              <div className='bg-white border-3 border-[#F2CC8F] rounded-[2.5rem] p-8 shadow-[0_4px_0_#E5B86E]'>
                <h3 className='text-2xl font-black text-advay-slate mb-6 flex items-center gap-3'>
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
              <div className='bg-white border-3 border-[#F2CC8F] rounded-[2.5rem] p-8 shadow-[0_4px_0_#E5B86E]'>
                <h3 className='text-2xl font-black text-advay-slate mb-6 flex items-center gap-3'>
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
              <div className='bg-white border-3 border-[#F2CC8F] rounded-[2rem] p-8 text-center flex flex-col items-center shadow-[0_4px_0_#E5B86E] relative overflow-hidden group hover:border-[#F59E0B] transition-colors'>
                <div className='absolute -right-6 -top-6 w-24 h-24 bg-[#F59E0B]/10 rounded-full blur-xl group-hover:bg-[#F59E0B]/20 transition-colors'></div>
                <div className='w-16 h-16 bg-[#F59E0B]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform'><svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='#F59E0B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='4 7 4 4 20 4 20 7'/><line x1='9' x2='15' y1='20' y2='20'/><line x1='12' x2='12' y1='4' y2='20'/></svg></div>
                <div className='text-5xl font-black text-advay-slate mb-2'>
                  {honestStats.uniqueLettersPracticed}
                </div>
                <div className='text-text-secondary font-bold uppercase tracking-wider text-sm'>
                  Unique Letters Practiced
                </div>
              </div>
              <div className='bg-white border-3 border-[#F2CC8F] rounded-[2rem] p-8 text-center flex flex-col items-center shadow-[0_4px_0_#E5B86E] relative overflow-hidden group hover:border-[#10B981] transition-colors'>
                <div className='absolute -right-6 -top-6 w-24 h-24 bg-[#10B981]/10 rounded-full blur-xl group-hover:bg-[#10B981]/20 transition-colors'></div>
                <div className='w-16 h-16 bg-[#10B981]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform'><svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='#10B981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'/><circle cx='12' cy='12' r='6'/><circle cx='12' cy='12' r='2'/></svg></div>
                <div className='text-5xl font-black text-advay-slate mb-2'>
                  {honestStats.avgTracingAccuracy}%
                </div>
                <div className='text-text-secondary font-bold uppercase tracking-wider text-sm'>
                  Average Accuracy
                </div>
              </div>
              <div className='bg-white border-3 border-[#F2CC8F] rounded-[2rem] p-8 text-center flex flex-col items-center shadow-[0_4px_0_#E5B86E] relative overflow-hidden group hover:border-[#3B82F6] transition-colors'>
                <div className='absolute -right-6 -top-6 w-24 h-24 bg-[#3B82F6]/10 rounded-full blur-xl group-hover:bg-[#3B82F6]/20 transition-colors'></div>
                <div className='w-16 h-16 bg-[#3B82F6]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform'><svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='#3B82F6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z'/><path d='m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z'/><path d='M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0'/><path d='M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5'/></svg></div>
                <div className='text-5xl font-black text-advay-slate mb-2'>
                  {honestStats.totalActivities}
                </div>
                <div className='text-text-secondary font-bold uppercase tracking-wider text-sm'>Total Activities</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className='bg-white border-3 border-[#F2CC8F] rounded-[2.5rem] p-8 lg:p-12 shadow-[0_4px_0_#E5B86E]'>
              <h2 className='text-3xl font-black text-advay-slate mb-8 flex items-center gap-3'>
                <svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 24 24' fill='none' stroke='#E85D04' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'/><polyline points='12 6 12 12 16 14'/></svg> Recent Activity
              </h2>
              {honestStats.recentActivity.length === 0 ? (
                <div className='text-center py-12 bg-slate-50 rounded-[2rem] border-3 border-dashed border-[#F2CC8F]'>
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E]"><svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='#F59E0B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='11' cy='11' r='8'/><path d='m21 21-4.3-4.3'/></svg></div>
                  <p className='text-text-secondary font-bold text-lg'>
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
                      className='flex justify-between items-center p-5 bg-slate-50 border-2 border-[#F2CC8F] rounded-[1.5rem] hover:border-[#3B82F6]/30 transition-colors group'
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-[0_4px_0_#E5B86E] border border-[#F2CC8F] flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                          {activity.action.includes('Traced') ? (
                          <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='#F59E0B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m12 19 7-7 3 3-7 7-3-3z'/><path d='m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z'/><path d='m2 2 7.5 8.6'/><path d='M22 22l-5.5-5.5'/></svg>
                        ) : (
                          <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='#3B82F6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><line x1='6' x2='10' y1='12' y2='12'/><line x1='8' x2='8' y1='10' y2='14'/><line x1='15' x2='15.01' y1='13' y2='13'/><line x1='18' x2='18.01' y1='11' y2='11'/><rect width='20' height='12' x='2' y='6' rx='2'/></svg>
                        )}
                        </div>
                        <div>
                          <div className='font-black text-advay-slate text-lg group-hover:text-[#3B82F6] transition-colors'>
                            {activity.action}
                          </div>
                          <div className='text-sm font-bold text-text-secondary uppercase tracking-widest mt-1'>
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
});
export default Progress;