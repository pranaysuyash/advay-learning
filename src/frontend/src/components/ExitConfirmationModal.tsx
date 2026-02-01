import { motion, AnimatePresence } from 'framer-motion';
import { UIIcon } from './ui/Icon';
import { Mascot } from './Mascot';

interface ExitConfirmationModalProps {
  isOpen: boolean;
  onConfirmExit: () => void;
  onCancelExit: () => void;
  progressLabel?: string;
}

export function ExitConfirmationModal({
  isOpen,
  onConfirmExit,
  onCancelExit,
  progressLabel = 'your progress',
}: ExitConfirmationModalProps) {
  void progressLabel; // Displayed in parent UI

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className='bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl'
          >
            {/* Mascot */}
            <div className='flex justify-center mb-6'>
              <Mascot
                state='waiting'
                message="Wait! Want to save your progress before leaving?"
              />
            </div>

            {/* Message */}
            <div className='text-center mb-6'>
              <h2 className='text-2xl font-bold text-advay-slate mb-2'>
                Save Progress?
              </h2>
              <p className='text-text-secondary'>
                You've made great progress! Would you like to save before leaving?
              </p>
            </div>

            {/* Actions */}
            <div className='space-y-4'>
              {/* Save & Exit */}
              <button
                type='button'
                onClick={onConfirmExit}
                className='w-full px-6 py-4 bg-pip-orange text-white rounded-2xl font-bold text-lg shadow-soft hover:bg-pip-rust transition-all hover:scale-[1.02] flex items-center justify-center gap-3'
              >
                <UIIcon name='check' size={24} />
                Save & Go Home
              </button>

              {/* Cancel (Continue Playing) */}
              <button
                type='button'
                onClick={onCancelExit}
                className='w-full px-6 py-4 bg-bg-tertiary text-text-primary border border-border rounded-2xl font-bold text-lg hover:bg-white transition-all flex items-center justify-center gap-3'
              >
                <UIIcon name='pencil' size={24} />
                Keep Playing
              </button>
            </div>

            {/* Keyboard hint */}
            <p className='text-center text-text-muted text-sm mt-4'>
              Press <kbd className='px-2 py-1 bg-bg-tertiary rounded text-xs'>Esc</kbd> to cancel
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ExitConfirmationModal;
