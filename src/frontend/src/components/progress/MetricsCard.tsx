import { motion } from 'framer-motion';
import { UIIcon } from '../ui/Icon';

interface MetricCardProps {
  title: string;
  score: number;
  level: string;
  description: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  delay?: number;
}

export function MetricCard({
  title,
  score,
  level,
  description,
  icon,
  color,
  delay = 0
}: MetricCardProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-500/25',
          border: 'border-blue-500/40',
          text: 'text-blue-400',
          icon: 'text-blue-400'
        };
      case 'green':
        return {
          bg: 'bg-green-500/25',
          border: 'border-green-500/40',
          text: 'text-green-400',
          icon: 'text-green-400'
        };
      case 'purple':
        return {
          bg: 'bg-purple-500/25',
          border: 'border-purple-500/40',
          text: 'text-purple-400',
          icon: 'text-purple-400'
        };
      case 'orange':
        return {
          bg: 'bg-orange-500/25',
          border: 'border-orange-500/40',
          text: 'text-orange-400',
          icon: 'text-orange-400'
        };
      default:
        return {
          bg: 'bg-white/15',
          border: 'border-border',
          text: 'text-white',
          icon: 'text-white'
        };
    }
  };

  const colors = getColorClasses(color);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`p-6 rounded-xl border ${colors.bg} ${colors.border} backdrop-blur-sm`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${colors.bg} ${colors.border}`}>
          <UIIcon name={icon as any} size={24} className={colors.icon} />
        </div>
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className={`text-sm capitalize ${colors.text}`}>{level}</p>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-white/80">Score</span>
          <span className="font-bold text-white">{score}/100</span>
        </div>
        <div className="w-full bg-white/30 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${color === 'blue' ? 'bg-blue-500' :
                                           color === 'green' ? 'bg-green-500' :
                                           color === 'purple' ? 'bg-purple-500' :
                                           'bg-orange-500'}`}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ delay: delay + 0.2, duration: 1 }}
          />
        </div>
      </div>

      <p className="text-sm text-white/80">{description}</p>
    </motion.div>
  );
}