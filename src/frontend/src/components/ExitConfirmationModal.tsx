import { useEffect, useRef } from 'react';
import { UIIcon } from './ui/Icon';
import { Mascot } from './Mascot';
import { Modal } from './ui/Modal';

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
  void progressLabel;
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      cancelButtonRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancelExit}
      size="md"
      ariaLabel="Save Progress?"
      ariaDescribedBy="exit-confirm-desc"
    >
      <div className="bg-white rounded-3xl p-8 shadow-2xl">
        {/* Mascot */}
        <div className="flex justify-center mb-6">
          <Mascot
            state="waiting"
            message="Wait! Want to save your progress before leaving?"
          />
        </div>

        {/* Message */}
        <div className="text-center mb-6">
          <h2 id="exit-confirm-title" className="text-2xl font-bold text-advay-slate mb-2">
            Save Progress?
          </h2>
          <p id="exit-confirm-desc" className="text-text-secondary">
            You've made great progress! Would you like to save before leaving?
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={onConfirmExit}
            className="w-full px-6 py-4 bg-pip-orange text-white rounded-2xl font-bold text-lg shadow-soft hover:bg-pip-rust transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
          >
            <UIIcon name="check" size={24} />
            Save & Go Home
          </button>

          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancelExit}
            className="w-full px-6 py-4 bg-bg-tertiary text-text-primary border border-border rounded-2xl font-bold text-lg hover:bg-white transition-all flex items-center justify-center gap-3"
          >
            <UIIcon name="pencil" size={24} />
            Keep Playing
          </button>
        </div>

        {/* Keyboard hint */}
        <p className="text-center text-text-muted text-sm mt-4">
          Press <kbd className="px-2 py-1 bg-bg-tertiary rounded text-xs">Esc</kbd> to cancel
        </p>
      </div>
    </Modal>
  );
}

export default ExitConfirmationModal;
