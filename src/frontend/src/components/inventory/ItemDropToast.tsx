import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventoryStore } from '../../store';
import { RARITY_CONFIG } from '../../data/collectibles';

export function ItemDropToast() {
  const { lastDrops, showDropToast, clearDropToast } = useInventoryStore();

  useEffect(() => {
    if (showDropToast && lastDrops.length > 0) {
      const timer = setTimeout(clearDropToast, 4000);
      return () => clearTimeout(timer);
    }
  }, [showDropToast, lastDrops, clearDropToast]);

  return (
    <AnimatePresence>
      {showDropToast && lastDrops.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto"
          onClick={clearDropToast}
        >
          <div className="bg-white/95 backdrop-blur-xl border-4 border-slate-100 rounded-[2rem] shadow-2xl px-6 py-4 flex items-center gap-4 max-w-md">
            {/* Item icons */}
            <div className="flex -space-x-2">
              {lastDrops.slice(0, 3).map((drop, i) => {
                const rarity = RARITY_CONFIG[drop.item.rarity];
                return (
                  <motion.div
                    key={`${drop.item.id}-${i}`}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 border-white"
                    style={{
                      backgroundColor: rarity.bg,
                      boxShadow: rarity.glow,
                    }}
                  >
                    {drop.item.emoji}
                  </motion.div>
                );
              })}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              {lastDrops.length === 1 ? (
                <>
                  <p className="font-black text-slate-800 text-sm truncate">
                    {lastDrops[0].isNew ? '🆕 New Discovery!' : 'Found!'}{' '}
                    {lastDrops[0].item.name}
                  </p>
                  <p
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: RARITY_CONFIG[lastDrops[0].item.rarity].color }}
                  >
                    {RARITY_CONFIG[lastDrops[0].item.rarity].label}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-black text-slate-800 text-sm">
                    Found {lastDrops.length} items!
                  </p>
                  <p className="text-xs font-bold text-slate-500 truncate">
                    {lastDrops.map((d) => d.item.name).join(', ')}
                  </p>
                </>
              )}
            </div>

            {/* Backpack hint */}
            <div className="text-2xl shrink-0">🎒</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
