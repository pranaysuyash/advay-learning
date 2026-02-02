import {
  useState,
  useCallback,
  useEffect,
  useRef,
  createContext,
  ReactNode,
} from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { UIIcon } from './Icon';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmDialogState extends ConfirmOptions {
  isOpen: boolean;
  resolve: ((value: boolean) => void) | null;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export { ConfirmContext };

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'info',
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({
        ...options,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'info',
        isOpen: true,
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    if (dialog.resolve) {
      dialog.resolve(true);
    }
    setDialog((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (dialog.resolve) {
      dialog.resolve(false);
    }
    setDialog((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog
        dialog={dialog}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
}

function ConfirmDialog({
  dialog,
  onConfirm,
  onCancel,
}: {
  dialog: ConfirmDialogState;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Focus cancel button when dialog opens
  useEffect(() => {
    if (dialog.isOpen) {
      cancelButtonRef.current?.focus();
    }
  }, [dialog.isOpen]);

  // Handle Esc key and focus trapping
  useEffect(() => {
    if (!dialog.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }

      // Focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dialog.isOpen, onCancel]);

  const getTypeStyles = () => {
    switch (dialog.type) {
      case 'danger':
        return {
          icon: 'warning' as const,
          iconBg: 'bg-red-500/20',
          iconColor: 'text-red-400',
          confirmBtn: 'bg-red-500 hover:bg-red-600 border-red-700',
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          iconBg: 'bg-yellow-500/20',
          iconColor: 'text-yellow-400',
          confirmBtn: 'bg-yellow-500 hover:bg-yellow-600 border-yellow-700',
        };
      default:
        return {
          icon: 'circle' as const,
          iconBg: 'bg-blue-500/20',
          iconColor: 'text-blue-400',
          confirmBtn: 'bg-blue-500 hover:bg-blue-600 border-blue-700',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      {dialog.isOpen && (
        <>
          <motion.div
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
            className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50'
            onClick={onCancel}
          />
          <dialog
            ref={dialogRef}
            open
            className='fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md'
            aria-modal='true'
            aria-labelledby='confirm-dialog-title'
          >
            <motion.div
              initial={
                reducedMotion ? false : { opacity: 0, scale: 0.9, y: 20 }
              }
              animate={
                reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }
              }
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.9, y: 20 }
              }
              transition={
                reducedMotion
                  ? { duration: 0.01 }
                  : { type: 'spring', stiffness: 400, damping: 30 }
              }
              className='bg-[#1a1a2e] border border-border rounded-2xl p-6 shadow-2xl mx-4'
            >
              <div className='flex items-start gap-4 mb-6'>
                <div
                  className={`w-12 h-12 rounded-xl ${styles.iconBg} flex items-center justify-center flex-shrink-0`}
                >
                  <UIIcon
                    name={styles.icon}
                    size={24}
                    className={styles.iconColor}
                  />
                </div>
                <div>
                  <h3
                    id='confirm-dialog-title'
                    className='text-xl font-bold mb-1'
                  >
                    {dialog.title}
                  </h3>
                  <p className='text-white/70 text-sm'>{dialog.message}</p>
                </div>
              </div>

              <div className='flex gap-3 justify-end'>
                <button
                  ref={cancelButtonRef}
                  type='button'
                  onClick={onCancel}
                  className='px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50'
                >
                  {dialog.cancelText}
                </button>
                <button
                  type='button'
                  onClick={onConfirm}
                  className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition border-b-4 active:border-b-0 active:translate-y-1 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#1a1a2e] ${styles.confirmBtn}`}
                >
                  {dialog.confirmText}
                </button>
              </div>
            </motion.div>
          </dialog>
        </>
      )}
    </AnimatePresence>
  );
}
