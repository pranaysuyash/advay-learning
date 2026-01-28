import { motion } from 'framer-motion';

export function Progress() {
  // TODO: Fetch actual progress data from API
  const progress = [
    { letter: 'A', status: 'completed', accuracy: 95 },
    { letter: 'B', status: 'completed', accuracy: 88 },
    { letter: 'C', status: 'in_progress', accuracy: 72 },
    { letter: 'D', status: 'locked', accuracy: 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-8">Learning Progress</h1>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Alphabet Mastery</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {progress.map((item, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg text-center ${
                  item.status === 'completed'
                    ? 'bg-green-500/20 border border-green-500/30'
                    : item.status === 'in_progress'
                    ? 'bg-yellow-500/20 border border-yellow-500/30'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className="text-2xl font-bold mb-1">{item.letter}</div>
                <div className="text-sm text-white/60">
                  {item.status === 'completed'
                    ? '✓ Done'
                    : item.status === 'in_progress'
                    ? '⋯ Learning'
                    : '🔒 Locked'}
                </div>
                {item.accuracy > 0 && (
                  <div className="text-sm mt-1">{item.accuracy}%</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { action: 'Completed letter B', time: '2 hours ago', score: '+50' },
              { action: 'Started letter C', time: '1 day ago', score: '+10' },
              { action: 'Completed letter A', time: '2 days ago', score: '+50' },
            ].map((activity, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-3 border-b border-white/10 last:border-0"
              >
                <div>
                  <div className="font-medium">{activity.action}</div>
                  <div className="text-sm text-white/60">{activity.time}</div>
                </div>
                <div className="text-green-400 font-semibold">{activity.score}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
