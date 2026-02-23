/**
 * Daily Time Breakdown Chart Component
 * Shows parents how much time their child spent playing each day
 */
import { motion } from 'framer-motion';
import { TimeBreakdownSummary } from '../../types/progress';
import { UIIcon } from '../ui/Icon';

interface DailyTimeChartProps {
  summary: TimeBreakdownSummary;
}

export function DailyTimeChart({ summary }: DailyTimeChartProps) {
  const { dailyBreakdown, averageMinutesPerDay, totalMinutesWeek, daysExceededLimit, limitMinutes } = summary;

  // Find max minutes for scaling
  const maxMinutes = Math.max(...dailyBreakdown.map((d) => d.minutes), limitMinutes, 10);

  return (
    <div className="bg-white border-4 border-slate-100 rounded-[2.5rem] p-6 md:p-10 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3">
            <span className="text-3xl">⏱️</span>
            Daily Play Time
          </h3>
          <p className="text-slate-500 font-bold mt-1">
            Track how much time your child spends learning each day
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2">
          <UIIcon name="clock" size={18} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Daily Limit: {limitMinutes} min
          </span>
        </div>
      </div>

      {/* Weekly Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-blue-600">{totalMinutesWeek}</div>
          <div className="text-sm font-bold text-blue-500 uppercase tracking-wider">Total Minutes</div>
        </div>
        <div className="bg-green-50 border-2 border-green-100 rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-green-600">{averageMinutesPerDay}</div>
          <div className="text-sm font-bold text-green-500 uppercase tracking-wider">Daily Average</div>
        </div>
        <div className={`rounded-2xl p-4 text-center border-2 ${
          daysExceededLimit > 0
            ? 'bg-orange-50 border-orange-100'
            : 'bg-emerald-50 border-emerald-100'
        }`}>
          <div className={`text-3xl font-black ${
            daysExceededLimit > 0 ? 'text-orange-600' : 'text-emerald-600'
          }`}>
            {daysExceededLimit}
          </div>
          <div className={`text-sm font-bold uppercase tracking-wider ${
            daysExceededLimit > 0 ? 'text-orange-500' : 'text-emerald-500'
          }`}>
            Days Over Limit
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-12 w-12 flex flex-col justify-between text-xs font-bold text-slate-400">
          <span>{maxMinutes}m</span>
          <span>{Math.round(maxMinutes / 2)}m</span>
          <span>0m</span>
        </div>

        {/* Chart area */}
        <div className="ml-14">
          {/* Limit line indicator */}
          <div
            className="absolute left-14 right-0 border-t-2 border-dashed border-orange-300 z-10"
            style={{
              bottom: `${Math.max((limitMinutes / maxMinutes) * 100, 15)}%`,
            }}
          >
            <span className="absolute right-0 -top-5 text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded">
              Limit ({limitMinutes}m)
            </span>
          </div>

          {/* Bars */}
          <div className="flex justify-between items-end h-48 gap-2">
            {dailyBreakdown.map((day, index) => {
              const barHeight = day.minutes > 0 ? Math.max((day.minutes / maxMinutes) * 100, 8) : 4;

              return (
                <motion.div
                  key={day.date}
                  className="flex-1 flex flex-col items-center gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Bar */}
                  <div className="w-full relative">
                    <motion.div
                      className={`w-full rounded-t-xl transition-colors ${
                        day.minutes === 0
                          ? 'bg-slate-100'
                          : day.exceedsLimit
                            ? 'bg-gradient-to-t from-orange-500 to-orange-400'
                            : day.minutes >= limitMinutes * 0.8
                              ? 'bg-gradient-to-t from-yellow-400 to-yellow-300'
                              : 'bg-gradient-to-t from-emerald-500 to-emerald-400'
                      }`}
                      style={{ height: `${barHeight}%`, minHeight: day.minutes > 0 ? '16px' : '4px' }}
                      initial={{ height: 0 }}
                      animate={{ height: `${barHeight}%` }}
                      transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 100 }}
                    />
                    {/* Minute label */}
                    {day.minutes > 0 && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-black text-slate-600">
                        {day.minutes}m
                      </div>
                    )}
                  </div>

                  {/* Day label */}
                  <div className={`text-xs font-bold uppercase tracking-wider ${
                    day.isToday ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {day.isToday ? 'Today' : day.dayName}
                  </div>

                  {/* Activity count tooltip */}
                  {day.activityCount > 0 && (
                    <div className="text-xs text-slate-400 font-semibold">
                      {day.activityCount} activity{day.activityCount !== 1 ? 'ies' : 'y'}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 pt-6 border-t-2 border-slate-100 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-400" />
          <span className="text-sm font-bold text-slate-500">On Track</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-300" />
          <span className="text-sm font-bold text-slate-500">Near Limit (~80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-400" />
          <span className="text-sm font-bold text-slate-500">Over Limit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-100 border border-slate-200" />
          <span className="text-sm font-bold text-slate-500">No Activity</span>
        </div>
      </div>

      {/* Insight Message */}
      {daysExceededLimit > 0 ? (
        <div className="mt-6 bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 flex items-start gap-3">
          <UIIcon name="info" size={20} className="text-orange-500 shrink-0 mt-0.5" />
          <p className="text-orange-700 font-semibold text-sm">
            Your child exceeded the daily limit on {daysExceededLimit} day{daysExceededLimit !== 1 ? 's' : ''} this week.
            Consider adjusting the limit in Settings if this is intentional.
          </p>
        </div>
      ) : averageMinutesPerDay < limitMinutes * 0.5 ? (
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <UIIcon name="star" size={20} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-blue-700 font-semibold text-sm">
            Your child is averaging {averageMinutesPerDay} minutes per day. 
            Great for avoiding screen fatigue while still building consistency!
          </p>
        </div>
      ) : (
        <div className="mt-6 bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
          <UIIcon name="check" size={20} className="text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-emerald-700 font-semibold text-sm">
            Great balance! Your child is staying within the daily limit while maintaining regular practice.
          </p>
        </div>
      )}
    </div>
  );
}
