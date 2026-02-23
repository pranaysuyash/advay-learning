/**
 * TimeLimitGate Component
 * Shows when child has reached daily time limit
 */
import { motion } from 'framer-motion';
import { UIIcon } from './ui/Icon';

interface TimeLimitGateProps {
  minutesUsed: number;
  timeLimit: number;
  onRequestMoreTime?: () => void;
}

export function TimeLimitGate({ minutesUsed, timeLimit, onRequestMoreTime }: TimeLimitGateProps) {
  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border-4 border-orange-200 rounded-[2.5rem] p-8 md:p-12 max-w-lg w-full text-center shadow-lg"
      >
        {/* Icon */}
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-orange-200">
          <UIIcon name="clock" size={48} className="text-orange-500" />
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">
          Time to Rest! 😴
        </h1>

        {/* Message */}
        <p className="text-lg text-slate-600 font-semibold mb-6">
          You've played for <span className="text-orange-600 font-bold">{minutesUsed} minutes</span> today.
          That's your daily limit of {timeLimit} minutes!
        </p>

        {/* Fun illustration/message */}
        <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-6 mb-8">
          <p className="text-blue-700 font-bold text-lg mb-2">
            🌟 Great job today!
          </p>
          <p className="text-blue-600">
            Pip is taking a nap. Come back tomorrow for more learning adventures!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-100">
            <div className="text-3xl font-black text-slate-800">{minutesUsed}m</div>
            <div className="text-sm font-bold text-slate-400 uppercase">Played Today</div>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-100">
            <div className="text-3xl font-black text-slate-800">{timeLimit}m</div>
            <div className="text-sm font-bold text-slate-400 uppercase">Daily Limit</div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {onRequestMoreTime && (
            <button
              onClick={onRequestMoreTime}
              className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl border-2 border-orange-600 transition-colors"
            >
              Ask Parent for More Time
            </button>
          )}
          <a
            href="/dashboard"
            className="block w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border-2 border-slate-200 transition-colors"
          >
            Back to Dashboard
          </a>
        </div>

        {/* Parent note */}
        <p className="mt-6 text-sm text-slate-400">
          Time limits help maintain healthy screen time habits.
        </p>
      </motion.div>
    </div>
  );
}
