import { Mascot } from './Mascot';
import { Modal } from './ui/Modal';

export function StoryModal({
  open,
  onClose,
  title,
  badge,
  message,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  badge?: string;
  message?: string;
  onComplete?: () => void;
}) {
  const handleContinue = () => {
    if (onComplete) {
      onComplete();
    }
    onClose();
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      size="md"
      ariaLabel={title ?? 'Hooray!'}
      backdropClassName="!bg-[#FFF8F0]/80"
    >
      <div className="bg-white rounded-3xl p-8 w-full text-center shadow-[0_6px_0_0_#000000] border-3 border-[#F2CC8F]">
        <div className="flex justify-center mb-4">
          <Mascot state="celebrating" message={message || 'Amazing job!'} />
        </div>
        <h2 className="text-2xl font-bold text-advay-slate mb-2">
          {title ?? 'Hooray!'}
        </h2>
        {badge && (
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <span>🏆</span>
            <span>You earned: {badge}</span>
          </div>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            className="px-6 py-3 bg-gradient-to-r from-pip-orange to-pip-rust text-white rounded-xl font-bold shadow-soft hover:scale-105 transition-transform"
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </Modal>
  );
}
