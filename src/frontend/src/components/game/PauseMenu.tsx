import { memo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Mascot } from '../Mascot';

export interface PauseMenuProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
  /** Optional settings content */
  settings?: React.ReactNode;
}

export const PauseMenu = memo(function PauseMenu({
  isOpen,
  onResume,
  onRestart,
  onExit,
  settings,
}: PauseMenuProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onResume}
      size="sm"
      ariaLabel="Game Paused"
      closeOnBackdrop={false}
      closeOnEscape
    >
      <div className="bg-white rounded-2xl border-3 border-[#F2CC8F] shadow-soft-lg p-8">
        {/* Mascot */}
        <div className="flex justify-center mb-6">
          <Mascot state="waiting" message="Taking a break?" />
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h2 className="text-h1 font-black text-advay-slate tracking-tight mb-2">
            Paused
          </h2>
          <p className="text-body font-bold text-text-secondary">
            Your progress is saved.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="success"
            size="lg"
            fullWidth
            icon="play"
            onClick={onResume}
          >
            Resume
          </Button>

          <Button
            variant="secondary"
            size="md"
            fullWidth
            icon="rotate-ccw"
            onClick={onRestart}
          >
            Restart
          </Button>

          <Button
            variant="ghost"
            size="md"
            fullWidth
            icon="home"
            onClick={onExit}
          >
            Exit Game
          </Button>
        </div>

        {/* Optional settings */}
        {settings && (
          <div className="mt-6 pt-6 border-t-2 border-slate-100">
            {settings}
          </div>
        )}
      </div>
    </Modal>
  );
});
