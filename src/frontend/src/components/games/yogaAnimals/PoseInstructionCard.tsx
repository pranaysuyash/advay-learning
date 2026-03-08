/**
 * Pose Instruction Card
 *
 * Displays the current animal pose to mimic, including:
 * - Large animal icon
 * - Pose name
 * - Description
 * - Instruction text with lightbulb icon
 * - Current round/pose number
 */

import { Lightbulb } from 'lucide-react';

interface PoseInstructionCardProps {
  icon: React.ReactNode;
  name: string;
  description?: string;
  instruction: string;
  currentIndex: number;
  totalCount: number;
}

export function PoseInstructionCard({
  icon,
  name,
  description,
  instruction,
  currentIndex,
  totalCount,
}: PoseInstructionCardProps) {
  return (
    <div className='text-center mb-10'>
      <div className='inline-flex items-center justify-center bg-[#FFF8F0] border-3 border-[#F2CC8F] rounded-[2rem] p-6 text-[5rem] mb-6 drop-shadow-[0_4px_0_#E5B86E]'>
        {icon}
      </div>
      <h3 className='text-4xl font-black text-advay-slate tracking-tight mb-4'>
        {name}
      </h3>
      {description && (
        <p className='text-xl font-bold text-text-secondary mb-8'>
          {description}
        </p>
      )}

      <div className='bg-blue-50 border-3 border-blue-100 rounded-2xl p-4 inline-block text-left'>
        <p className='text-lg text-blue-800 font-bold flex items-center gap-2'>
          <Lightbulb className='w-5 h-5' /> {instruction}
        </p>
      </div>

      <p className='text-sm font-bold text-gray-400 mt-6'>
        Pose {currentIndex + 1} of {totalCount}
      </p>
    </div>
  );
}
