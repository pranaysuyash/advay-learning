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
  delay = 0,
}: MetricCardProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          border: 'border-[#3B82F6]',
          iconBg: 'bg-[#3B82F6]',
          iconColor: 'text-white',
          text: 'text-[#3B82F6]',
          bar: 'bg-[#3B82F6]',
        };
      case 'green':
        return {
          bg: 'bg-green-50',
          border: 'border-[#10B981]',
          iconBg: 'bg-[#10B981]',
          iconColor: 'text-white',
          text: 'text-[#10B981]',
          bar: 'bg-[#10B981]',
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          border: 'border-[#8B5CF6]',
          iconBg: 'bg-[#8B5CF6]',
          iconColor: 'text-white',
          text: 'text-[#8B5CF6]',
          bar: 'bg-[#8B5CF6]',
        };
      case 'orange':
        return {
          bg: 'bg-orange-50',
          border: 'border-[#E85D04]',
          iconBg: 'bg-[#E85D04]',
          iconColor: 'text-white',
          text: 'text-[#E85D04]',
          bar: 'bg-[#E85D04]',
        };
      default:
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-300',
          iconBg: 'bg-slate-300',
          iconColor: 'text-slate-700',
          text: 'text-slate-700',
          bar: 'bg-slate-400',
        };
    }
  };

  const colors = getColorClasses(color);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`p-6 rounded-[2rem] border-4 ${colors.border} ${colors.bg} shadow-sm relative overflow-hidden`}
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 ${colors.iconBg}/10 rounded-full blur-2xl`}></div>

      <div className='flex items-center gap-4 mb-6 relative z-10'>
        <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center ${colors.iconBg} shadow-sm border-2 border-white`}>
          <UIIcon name={icon as any} size={28} className={colors.iconColor} />
        </div>
        <div>
          <h3 className='text-2xl font-black text-slate-800 tracking-tight'>{title}</h3>
          <p className={`font-bold uppercase tracking-wider text-sm ${colors.text}`}>{level}</p>
        </div>
      </div>

      <div className='mb-4 relative z-10'>
        <div className='flex justify-between items-end mb-2'>
          <span className='font-bold text-slate-500 uppercase tracking-wider text-sm'>Score</span>
          <span className={`font-black text-xl ${colors.text}`}>{score}<span className="text-slate-400 text-sm">/100</span></span>
        </div>
        <div className='w-full bg-white border-2 border-slate-200 rounded-full h-4 overflow-hidden'>
          <motion.div
            className={`h-full ${colors.bar} rounded-full border-r-2 border-white/50`}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ delay: delay + 0.2, duration: 1, type: 'spring' }}
          />
        </div>
      </div>

      <p className='text-base font-semibold text-slate-600 relative z-10'>{description}</p>
    </motion.div>
  );
}
