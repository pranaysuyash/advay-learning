import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useInventoryStore } from '../../store';

export function BackpackButton() {
  const navigate = useNavigate();
  const getTotalItemCount = useInventoryStore((s) => s.getTotalItemCount);
  const totalItems = getTotalItemCount();

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => navigate('/inventory')}
      className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-white border-4 border-slate-100 rounded-full shadow-lg flex items-center justify-center text-3xl hover:border-[#E85D04] transition-colors group"
      aria-label={`Backpack — ${totalItems} items`}
    >
      <span className="group-hover:animate-bounce">🎒</span>

      {totalItems > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-7 h-7 bg-[#E85D04] text-white text-xs font-black rounded-full flex items-center justify-center border-2 border-white shadow"
        >
          {totalItems > 99 ? '99+' : totalItems}
        </motion.span>
      )}
    </motion.button>
  );
}
