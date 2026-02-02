interface TipsSectionProps {
  tips?: string[];
}

const DEFAULT_TIPS = [
  'Practice for 10-15 minutes daily for best results',
  'Celebrate small wins to keep motivation high',
  'Use multiple languages to enhance cognitive flexibility',
  'Take breaks when needed - quality over quantity',
];

/**
 * Displays learning tips and recommendations.
 * Static presentational component.
 */
export function TipsSection({ tips = DEFAULT_TIPS }: TipsSectionProps) {
  return (
    <section className='bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-soft'>
      <h2 className='text-lg font-semibold mb-4 text-blue-900 flex items-center gap-2'>
        <span>💡</span>
        Learning Tips
      </h2>
      <ul className='space-y-3'>
        {tips.map((tip) => (
          <li key={tip} className='flex items-start gap-3 text-sm text-blue-800'>
            <span className='text-blue-500 mt-0.5'>•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
