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
  delay = 0,
}: RecommendationCardProps) {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'insight':
        return {
          bg: 'bg-blue-50',
          border: 'border-[#3B82F6]',
          iconBg: 'bg-[#3B82F6]/20',
          iconColor: 'text-[#3B82F6]',
          titleColor: 'text-[#3B82F6]',
        };
      case 'recommendation':
        return {
          bg: 'bg-green-50',
          border: 'border-[#10B981]',
          iconBg: 'bg-[#10B981]/20',
          iconColor: 'text-[#10B981]',
          titleColor: 'text-[#10B981]',
        };
      case 'strength':
        return {
          bg: 'bg-yellow-50',
          border: 'border-[#F59E0B]',
          iconBg: 'bg-[#F59E0B]/20',
          iconColor: 'text-[#F59E0B]',
          titleColor: 'text-[#F59E0B]',
        };
      case 'improvement':
        return {
          bg: 'bg-orange-50',
          border: 'border-[#E85D04]',
          iconBg: 'bg-[#E85D04]/20',
          iconColor: 'text-[#E85D04]',
          titleColor: 'text-[#E85D04]',
        };
      default:
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-300',
          iconBg: 'bg-slate-200',
          iconColor: 'text-slate-600',
          titleColor: 'text-slate-700',
        };
    }
  };

  const config = getTypeConfig(type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`p-5 rounded-2xl border-2 ${config.bg} ${config.border} shadow-sm group`}
    >
      <div className='flex items-start gap-4'>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${config.iconBg} border-2 border-white group-hover:scale-110 transition-transform`}>
          <UIIcon name={icon as any} size={24} className={config.iconColor} />
        </div>
        <div className='flex-1 pt-1'>
          <h4 className={`font-black uppercase tracking-wider text-sm ${config.titleColor} mb-1`}>
            {title}
          </h4>
          <p className='text-base font-bold text-slate-600 leading-snug'>{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
