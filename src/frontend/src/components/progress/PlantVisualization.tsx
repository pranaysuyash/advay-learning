import { motion } from 'framer-motion';

interface PlantVisualizationProps {
  progressPercentage: number;
  growthStage: 'seed' | 'sprout' | 'young' | 'mature' | 'blooming';
  className?: string;
}

export function PlantVisualization({
  progressPercentage,
  growthStage,
  className = '',
}: PlantVisualizationProps) {
  // Plant growth stages with SVG paths
  const getPlantPath = (stage: string) => {
    switch (stage) {
      case 'seed':
        return 'M50 80 Q50 70 50 60 Q50 50 50 40'; // Just a small sprout
      case 'sprout':
        return 'M50 80 Q45 65 40 50 Q35 35 30 20'; // Small plant
      case 'young':
        return 'M50 80 Q40 60 35 40 Q30 25 25 10 M35 35 Q40 30 45 35 M25 25 Q30 20 35 25'; // Plant with leaves
      case 'mature':
        return 'M50 80 Q35 60 30 40 Q25 20 20 5 M35 40 Q45 35 50 40 M25 25 Q35 20 40 25 M40 20 Q50 15 55 20'; // Bigger plant with more leaves
      case 'blooming':
        return 'M50 80 Q30 60 25 40 Q20 15 15 0 M35 45 Q50 40 60 45 M25 30 Q40 25 50 30 M45 25 Q60 20 70 25 M30 15 Q45 10 55 15 M50 10 Q65 5 75 10'; // Full plant with flowers
      default:
        return 'M50 80 Q50 70 50 60 Q50 50 50 40';
    }
  };

  const getFlowerCount = (stage: string) => {
    switch (stage) {
      case 'blooming':
        return 3;
      case 'mature':
        return 1;
      default:
        return 0;
    }
  };

  const plantPath = getPlantPath(growthStage);
  const flowerCount = getFlowerCount(growthStage);

  return (
    <div className={`relative ${className}`}>
      {/* Soil */}
      <div className='w-full h-4 bg-[#b45309] rounded-b-xl mb-4 border-2 border-[#78350f]' />

      {/* Plant stem and leaves */}
      <svg
        viewBox='0 0 100 100'
        className='w-full h-32'
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
      >
        {/* Main stem */}
        <motion.path
          d={plantPath}
          stroke='#10B981'
          strokeWidth='4'
          fill='none'
          strokeLinecap='round'
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progressPercentage / 100 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />

        {/* Flowers */}
        {flowerCount > 0 && (
          <>
            {Array.from({ length: flowerCount }).map((_, i) => (
              <motion.circle
                key={i}
                cx={60 + i * 10}
                cy={10 + i * 5}
                r='4'
                fill='#F59E0B'
                stroke='#FFFFFF'
                strokeWidth='1.5'
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 + i * 0.2, duration: 0.5, type: 'spring' }}
              />
            ))}
          </>
        )}
      </svg>

      {/* Progress indicator */}
      <div className='text-center mt-4 bg-white p-3 border-2 border-slate-200 rounded-xl shadow-sm'>
        <div className='text-xs font-bold text-slate-500 uppercase tracking-widest mb-2'>Growth Progress</div>
        <div className='w-full bg-slate-100 rounded-full h-3 border border-slate-200 overflow-hidden'>
          <motion.div
            className='bg-[#10B981] h-full rounded-full border-r border-white/50'
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, delay: 0.5, type: 'spring' }}
          />
        </div>
        <div className='text-sm font-black text-slate-700 mt-2'>
          {progressPercentage}% Complete
        </div>
      </div>
    </div>
  );
}
