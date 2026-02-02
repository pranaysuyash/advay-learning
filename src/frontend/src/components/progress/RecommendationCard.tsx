import { motion } from 'framer-motion';
import { UIIcon } from '../ui/Icon';

interface RecommendationCardProps {
  type: 'insight' | 'recommendation' | 'strength' | 'improvement';
  title: string;
  description: string;
  icon: string;
  delay?: number;
}

export function RecommendationCard({
  type,
  title,
  description,
  icon,
  delay = 0
}: RecommendationCardProps) {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'insight':
        return {
          bg: 'bg-blue-500/15',
          border: 'border-blue-500/30',
          iconColor: 'text-blue-400',
          titleColor: 'text-blue-300'
        };
      case 'recommendation':
        return {
          bg: 'bg-green-500/15',
          border: 'border-green-500/30',
          iconColor: 'text-green-400',
          titleColor: 'text-green-300'
        };
      case 'strength':
        return {
          bg: 'bg-yellow-500/15',
          border: 'border-yellow-500/30',
          iconColor: 'text-yellow-400',
          titleColor: 'text-yellow-300'
        };
      case 'improvement':
        return {
          bg: 'bg-orange-500/15',
          border: 'border-orange-500/30',
          iconColor: 'text-orange-400',
          titleColor: 'text-orange-300'
        };
      default:
        return {
          bg: 'bg-white/15',
          border: 'border-border',
          iconColor: 'text-white',
          titleColor: 'text-white'
        };
    }
  };

  const config = getTypeConfig(type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`p-4 rounded-lg border ${config.bg} ${config.border} backdrop-blur-sm`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-1 rounded ${config.bg}`}>
          <UIIcon name={icon as any} size={16} className={config.iconColor} />
        </div>
        <div className="flex-1">
          <h4 className={`font-medium text-sm ${config.titleColor} mb-1`}>
            {title}
          </h4>
          <p className="text-sm text-white/80">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}