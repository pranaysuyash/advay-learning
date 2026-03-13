import { useEffect, useRef, ReactNode } from 'react';
import { Modal } from './Modal';
import { UIIcon, IconName } from './Icon';
import { useAudio } from '../../utils/hooks/useAudio';

export type ConfirmType = 'danger' | 'warning' | 'info';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmType;
  confirmDisabled?: boolean;
}

const typeConfig: Record<ConfirmType, { icon: IconName; iconBg: string; iconColor: string; confirmBtn: string }> = {
  danger: {
    icon: 'warning',
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-400',
    confirmBtn: 'bg-red-500 hover:bg-red-600 border-red-700',
  },
  warning: {
    icon: 'warning',
    iconBg: 'bg-yellow-500/20',
    iconColor: 'text-yellow-400',
    confirmBtn: 'bg-yellow-500 hover:bg-yellow-600 border-yellow-700',
  },
  info: {
    icon: 'circle',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    confirmBtn: 'bg-blue-500 hover:bg-blue-600 border-blue-700',
  },
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  confirmDisabled = false,
}: ConfirmModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const { playPop, playClick } = useAudio();

  useEffect(() => {
    if (isOpen) {
      playPop();
      cancelButtonRef.current?.focus();
    }
  }, [isOpen, playPop]);

  const handleConfirm = () => {
    playClick();
    onConfirm();
  };

  const handleCancel = () => {
    playClick();
    onClose();
  };

  const config = typeConfig[type];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      ariaLabel={title}
    >
      <div className="bg-[#1a1a2e] border border-border rounded-2xl p-6 shadow-2xl">
        <div className="flex items-start gap-4 mb-6">
          <div
            className={`w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}
          >
            <UIIcon name={config.icon} size={24} className={config.iconColor} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">{title}</h3>
            {typeof message === 'string' ? (
              <p className="text-white/70 text-sm">{message}</p>
            ) : (
              message
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={confirmDisabled}
            className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition border-b-4 active:border-b-0 active:translate-y-1 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#1a1a2e] disabled:opacity-50 disabled:cursor-not-allowed ${config.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmModal;
