import { motion } from 'framer-motion';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  onAddChild: () => void;
}

/**
 * Empty state displayed when no children have been added yet.
 * Shows mascot illustration and CTA to add first child.
 */
export function EmptyState({ onAddChild }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-white border border-border rounded-xl p-12 text-center mb-8 shadow-soft'
    >
      <div className='w-24 h-24 mx-auto mb-4'>
        <img
          src='/assets/images/empty-no-children.svg'
          alt='No children added yet'
          className='w-full h-full object-contain'
        />
      </div>
      <h2 className='text-2xl font-semibold mb-2'>
        No Children Added Yet
      </h2>
      <p className='text-slate-600 mb-6'>
        Add a child profile to start tracking their learning progress.
      </p>
      <Button
        type='button'
        onClick={onAddChild}
        size='lg'
      >
        Add Child Profile
      </Button>
    </motion.div>
  );
}
