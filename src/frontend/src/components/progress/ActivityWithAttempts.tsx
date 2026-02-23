/**
 * ActivityWithAttempts Component
 * Shows a progress item with attempt count and accuracy
 */
import { motion } from 'framer-motion';
import { ProgressItem } from '../../types/progress';
import { StruggleIndicator, StruggleDot } from './StruggleIndicator';
import { formatAttempts } from '../../utils/progressCalculations';
import { UIIcon } from '../ui/Icon';

interface ActivityWithAttemptsProps {
  item: ProgressItem;
  attentionLevel: 'none' | 'low' | 'medium' | 'high';
  reason?: string;
  index?: number;
}

function getActivityIcon(activityType: string): string {
  const icons: Record<string, string> = {
    letter_tracing: 'letters',
    number_recognition: 'numbers',
    shape_matching: 'shapes',
    emoji_match: 'smile',
    color_matching: 'palette',
    word_building: 'book',
    default: 'star',
  };
  return icons[activityType] || icons.default;
}

function getActivityLabel(activityType: string, contentId: string): string {
  const labels: Record<string, string> = {
    letter_tracing: `Letter ${contentId.toUpperCase()}`,
    number_recognition: `Number ${contentId}`,
    shape_matching: `Shape: ${contentId}`,
    emoji_match: `Emoji Match`,
    color_matching: `Color: ${contentId}`,
    word_building: `Word: ${contentId}`,
  };
  return labels[activityType] || `${activityType}: ${contentId}`;
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-600';
  if (score >= 70) return 'text-blue-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-orange-600';
}

export function ActivityWithAttempts({
  item,
  attentionLevel,
  index = 0,
}: ActivityWithAttemptsProps) {
  const attempts = item.attempt_count ?? 1;
  const activityLabel = getActivityLabel(item.activity_type, item.content_id);
  const iconName = getActivityIcon(item.activity_type);
  const scoreColor = getScoreColor(item.score);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-4 p-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-slate-200 transition-colors"
    >
      {/* Attention dot */}
      <StruggleDot attentionLevel={attentionLevel} size="md" />

      {/* Activity icon */}
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border-2 border-slate-100 shrink-0">
        <UIIcon name={iconName as any} size={24} className="text-slate-400" />
      </div>

      {/* Activity info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-bold text-slate-800 truncate">{activityLabel}</h4>
          <span className="text-xs text-slate-400 font-medium">
            {new Date(item.completed_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {/* Score */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Accuracy</span>
            <span className={`font-black ${scoreColor}`}>{Math.round(item.score)}%</span>
          </div>
          
          {/* Divider */}
          <span className="text-slate-200">|</span>
          
          {/* Attempts */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Attempts</span>
            <span className={`font-black ${attempts > 3 ? 'text-orange-600' : 'text-slate-700'}`}>
              {attempts}
            </span>
          </div>
          
          {/* Format text */}
          <span className="text-xs text-slate-500 font-medium">
            ({formatAttempts(attempts)})
          </span>
        </div>
      </div>

      {/* Attention badge */}
      <div className="shrink-0">
        <StruggleIndicator
          attentionLevel={attentionLevel}
          showLabel={false}
          size="sm"
        />
      </div>
    </motion.div>
  );
}

/**
 * Compact version for lists
 */
export function ActivityWithAttemptsCompact({
  item,
  attentionLevel,
}: ActivityWithAttemptsProps) {
  const attempts = item.attempt_count ?? 1;
  const activityLabel = getActivityLabel(item.activity_type, item.content_id);

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-xl">
      <div className="flex items-center gap-2">
        <StruggleDot attentionLevel={attentionLevel} size="sm" />
        <span className="font-semibold text-slate-700 text-sm">{activityLabel}</span>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className={`font-bold ${getScoreColor(item.score)}`}>
          {Math.round(item.score)}%
        </span>
        <span className="text-slate-400">
          {attempts} {attempts === 1 ? 'try' : 'tries'}
        </span>
      </div>
    </div>
  );
}
