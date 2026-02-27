import { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { progressQueue, type DeadLetterItem } from '../../services/progressQueue';
import { UIIcon } from './Icon';

interface DeadLetterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profileId?: string;
  onRetry?: (idempotencyKey: string) => void;
}

export const DeadLetterDialog = memo(function DeadLetterDialog({
  isOpen,
  onClose,
  profileId,
  onRetry,
}: DeadLetterDialogProps) {
  const [deadLetters, setDeadLetters] = useState<DeadLetterItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDeadLetters(progressQueue.getDeadLetters(profileId));
    }
  }, [isOpen, profileId]);

  const handleRetry = async (idempotencyKey: string) => {
    setLoading(true);
    try {
      const success = progressQueue.retryDeadLetter(idempotencyKey);
      if (success && onRetry) {
        onRetry(idempotencyKey);
      }
      setDeadLetters(progressQueue.getDeadLetters(profileId));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (idempotencyKey: string) => {
    setLoading(true);
    try {
      progressQueue.deleteDeadLetter(idempotencyKey);
      setDeadLetters(progressQueue.getDeadLetters(profileId));
    } finally {
      setLoading(false);
    }
  };

  const handleRetryAll = async () => {
    setLoading(true);
    try {
      for (const dl of deadLetters) {
        progressQueue.retryDeadLetter(dl.item.idempotency_key);
      }
      setDeadLetters(progressQueue.getDeadLetters(profileId));
      if (onRetry) {
        onRetry('all');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50'
            onClick={onClose}
          />
          <dialog
            open
            className='fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[80vh]'
            aria-modal='true'
            aria-labelledby='dead-letter-title'
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className='bg-[#1a1a2e] border border-border rounded-2xl shadow-2xl mx-4 overflow-hidden'
            >
              <div className='p-6 border-b border-white/10'>
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0'>
                    <UIIcon name='warning' size={24} className='text-red-400' />
                  </div>
                  <div>
                    <h3 id='dead-letter-title' className='text-xl font-bold text-white'>
                      Failed to Sync
                    </h3>
                    <p className='text-white/60 text-sm'>
                      These items could not be synced after multiple attempts
                    </p>
                  </div>
                </div>
              </div>

              <div className='p-6 max-h-[50vh] overflow-y-auto'>
                {deadLetters.length === 0 ? (
                  <div className='text-center py-8'>
                    <div className='w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center'>
                      <UIIcon name='check' size={32} className='text-green-400' />
                    </div>
                    <p className='text-white/70 font-medium'>
                      No failed items. All synced successfully!
                    </p>
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {deadLetters.map((dl) => (
                      <div
                        key={dl.item.idempotency_key}
                        className='bg-red-500/10 border border-red-500/20 rounded-xl p-4'
                      >
                        <div className='flex items-start justify-between gap-4'>
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2 mb-1'>
                              <span className='text-red-400 font-bold text-sm'>
                                {dl.item.activity_type}
                              </span>
                              <span className='text-white/40 text-xs'>
                                {dl.item.content_id}
                              </span>
                            </div>
                            <p className='text-white/60 text-sm mb-2 truncate'>
                              {dl.finalError}
                            </p>
                            <div className='text-white/40 text-xs'>
                              Failed: {formatDate(dl.failedAt)} • {dl.totalAttempts} attempts
                            </div>
                          </div>
                          <div className='flex gap-2 shrink-0'>
                            <button
                              type='button'
                              onClick={() => handleRetry(dl.item.idempotency_key)}
                              disabled={loading}
                              className='px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm font-medium rounded-lg transition disabled:opacity-50'
                            >
                              Retry
                            </button>
                            <button
                              type='button'
                              onClick={() => handleDelete(dl.item.idempotency_key)}
                              disabled={loading}
                              className='px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/60 text-sm font-medium rounded-lg transition disabled:opacity-50'
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className='p-6 border-t border-white/10 flex justify-between items-center'>
                <button
                  type='button'
                  onClick={onClose}
                  className='px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium text-white'
                >
                  Close
                </button>
                {deadLetters.length > 0 && (
                  <button
                    type='button'
                    onClick={handleRetryAll}
                    disabled={loading}
                    className='px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 disabled:opacity-50'
                  >
                    Retry All ({deadLetters.length})
                  </button>
                )}
              </div>
            </motion.div>
          </dialog>
        </>
      )}
    </AnimatePresence>
  );
});

export default DeadLetterDialog;
