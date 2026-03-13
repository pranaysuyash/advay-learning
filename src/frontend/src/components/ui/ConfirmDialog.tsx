import { useState, useCallback, useEffect, useRef, createContext, ReactNode } from 'react';
import { Modal } from './Modal';
import { UIIcon } from './Icon';
import { useAudio } from '../../utils/hooks/useAudio';

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

const typeStyles = {
  danger: {
    icon: 'warning' as const,
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-400',
    confirmBtn: 'bg-red-500 hover:bg-red-600 border-red-700',
  },
  warning: {
    icon: 'warning' as const,
    iconBg: 'bg-yellow-500/20',
    iconColor: 'text-yellow-400',
    confirmBtn: 'bg-yellow-500 hover:bg-yellow-600 border-yellow-700',
  },
  info: {
    icon: 'circle' as const,
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    confirmBtn: 'bg-blue-500 hover:bg-blue-600 border-blue-700',
  },
};

function ConfirmDialog({
  dialog,
  onConfirm,
  onCancel,
}: {
  dialog: ConfirmDialogState;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const { playPop, playClick } = useAudio();

  useEffect(() => {
    if (dialog.isOpen) {
      playPop();
      cancelButtonRef.current?.focus();
    }
  }, [dialog.isOpen, playPop]);

  const handleConfirm = () => {
    playClick();
    onConfirm();
  };

  const handleCancel = () => {
    playClick();
    onCancel();
  };

  const styles = typeStyles[dialog.type || 'info'];

  return (
    <Modal
      isOpen={dialog.isOpen}
      onClose={onCancel}
      size="md"
      ariaLabel={dialog.title}
    >
      <div className="bg-[#1a1a2e] border border-border rounded-2xl p-6 shadow-2xl">
        <div className="flex items-start gap-4 mb-6">
          <div
            className={`w-12 h-12 rounded-xl ${styles.iconBg} flex items-center justify-center flex-shrink-0`}
          >
            <UIIcon name={styles.icon} size={24} className={styles.iconColor} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">{dialog.title}</h3>
            <p className="text-white/70 text-sm">{dialog.message}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            {dialog.cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition border-b-4 active:border-b-0 active:translate-y-1 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#1a1a2e] ${styles.confirmBtn}`}
          >
            {dialog.confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
