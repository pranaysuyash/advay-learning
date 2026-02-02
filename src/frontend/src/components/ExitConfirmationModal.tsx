import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';
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
  const reducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      cancelButtonRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancelExit();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const firstElement = focusableElements[0] as HTMLElement | undefined;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement | undefined;

        if (!firstElement || !lastElement) return;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancelExit]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'
          onClick={onCancelExit}
        >
          <motion.div
            initial={reducedMotion ? false : { scale: 0.9, opacity: 0 }}
            animate={reducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { scale: 0.9, opacity: 0 }}
            className='bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl'
            role='dialog'
            aria-modal='true'
            aria-labelledby='exit-confirm-title'
            aria-describedby='exit-confirm-desc'
            onClick={(e) => e.stopPropagation()}
            ref={dialogRef}
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
              <h2 id='exit-confirm-title' className='text-2xl font-bold text-advay-slate mb-2'>
                Save Progress?
              </h2>
              <p id='exit-confirm-desc' className='text-text-secondary'>
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
                ref={cancelButtonRef}
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
