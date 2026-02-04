import { UIIcon } from '../ui';

interface Stat {
  label: string;
  value: string;
  iconName: 'letters' | 'target' | 'timer' | 'hand';
  percent: number;
}

interface StatsBarProps {
  stats: Stat[];
}

/**
 * Displays compact stats row with icons and progress bars.
 * Shows Literacy, Accuracy, and Time stats for selected child.
 */
export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className='mb-6 flex flex-wrap items-center gap-4 py-3 px-4 bg-white border border-border rounded-xl shadow-soft'>
      {stats.map((stat) => (
        <div key={stat.label} className='flex items-center gap-2'>
          <UIIcon
            name={stat.iconName}
            size={16}
            className='text-slate-500'
            aria-label={
              stat.iconName === 'letters' ? 'Letters learned' :
              stat.iconName === 'target' ? 'Target accuracy goal' :
              stat.iconName === 'timer' ? 'Time spent learning' :
              stat.iconName === 'hand' ? 'Hand tracking activity' : 'Statistics icon'
            }
          />
          <span className='text-sm text-slate-600'>{stat.label}:</span>
          <span className='text-sm font-semibold text-text-primary'>
            {stat.value}
          </span>
          {stat.percent > 0 && (
            <progress
              value={stat.percent}
              max={100}
              className='w-16 h-1.5 rounded-full progress-accent-orange'
              aria-label={
                stat.iconName === 'letters' ? `Letters learned: ${stat.value}` :
                stat.iconName === 'target' ? `Accuracy goal: ${stat.value}` :
                stat.iconName === 'timer' ? `Time spent: ${stat.value}` :
                stat.iconName === 'hand' ? `Hand tracking: ${stat.value}` : `Progress: ${stat.value}`
              }
            />
          )}
        </div>
      ))}
    </div>
  );
}
