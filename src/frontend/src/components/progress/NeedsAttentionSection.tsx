/**
 * NeedsAttentionSection Component
 * Shows activities where the child is struggling and needs parent intervention
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StruggleSummary } from '../../types/progress';
import { ActivityWithAttempts } from './ActivityWithAttempts';
import { UIIcon } from '../ui/Icon';

interface NeedsAttentionSectionProps {
  summary: StruggleSummary;
}

export function NeedsAttentionSection({ summary }: NeedsAttentionSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const { strugglingItems, needsAttentionCount, recommendations } = summary;

  // Only show if there are items needing attention
  if (needsAttentionCount === 0) {
    return (
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-[2rem] p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center border-2 border-emerald-200">
            <UIIcon name="check" size={28} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl font-black text-emerald-800">
              Great Progress! 🎉
            </h3>
            <p className="text-emerald-600 font-semibold">
              No items need special attention right now. Your child is doing well!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const highCount = strugglingItems.filter((i) => i.attentionLevel === 'high').length;
  const mediumCount = strugglingItems.filter((i) => i.attentionLevel === 'medium').length;

  return (
    <div className="bg-white border-3 border-orange-100 rounded-[2.5rem] p-6 md:p-8 mb-8 shadow-[0_4px_0_#E5B86E]">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center border-2 border-orange-200">
            <UIIcon name="warning" size={28} className="text-orange-600" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-advay-slate">
              Needs Attention
            </h3>
            <p className="text-text-secondary font-semibold">
              {needsAttentionCount} item{needsAttentionCount !== 1 ? 's' : ''} may need extra practice
            </p>
          </div>
        </div>
        
        {/* Expand/collapse button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl border-2 border-[#F2CC8F] transition-colors"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <UIIcon name="chevron-down" size={20} className="text-slate-400" />
          </motion.div>
        </button>
      </div>

      {/* Stats summary */}
      <div className="flex flex-wrap gap-3 mb-6">
        {highCount > 0 && (
          <div className="flex items-center gap-2 bg-orange-50 border-2 border-orange-200 rounded-xl px-4 py-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="font-bold text-orange-700">
              {highCount} need{highCount === 1 ? 's' : ''} focused help
            </span>
          </div>
        )}
        {mediumCount > 0 && (
          <div className="flex items-center gap-2 bg-yellow-50 border-2 border-yellow-200 rounded-xl px-4 py-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="font-bold text-yellow-700">
              {mediumCount} need{mediumCount === 1 ? 's' : ''} more practice
            </span>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <UIIcon name="lightbulb" size={20} className="text-blue-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            {recommendations.map((rec, i) => (
              <p key={i} className="text-blue-700 font-semibold text-sm">
                • {rec}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Items list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-3">
              {strugglingItems.slice(0, 5).map((analysis, index) => (
                <ActivityWithAttempts
                  key={analysis.item.id}
                  item={analysis.item}
                  attentionLevel={analysis.attentionLevel}
                  reason={analysis.reason}
                  index={index}
                />
              ))}
              {strugglingItems.length > 5 && (
                <p className="text-center text-slate-400 font-medium py-2">
                  + {strugglingItems.length - 5} more items
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
