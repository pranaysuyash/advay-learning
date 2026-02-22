import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useInventoryStore } from '../store';
import {
  ALL_ITEMS,
  RARITY_CONFIG,
  type ItemCategory,
  type CollectibleItem,
} from '../data/collectibles';


const CATEGORY_CONFIG: Record<
  ItemCategory,
  { label: string; emoji: string }
> = {
  element: { label: 'Elements', emoji: '⚗️' },
  color: { label: 'Colors', emoji: '🎨' },
  shape: { label: 'Shapes', emoji: '🔷' },
  creature: { label: 'Creatures', emoji: '🐾' },
  note: { label: 'Notes', emoji: '🎵' },
  emotion: { label: 'Emotions', emoji: '💖' },
  material: { label: 'Materials', emoji: '🧪' },
  tool: { label: 'Tools', emoji: '🔧' },
  artifact: { label: 'Artifacts', emoji: '🏆' },
  food: { label: 'Food', emoji: '🍪' },
  letter: { label: 'Letters', emoji: '🔤' },
  number: { label: 'Numbers', emoji: '🔢' },
};

const CATEGORIES = Object.keys(CATEGORY_CONFIG) as ItemCategory[];

export function Inventory() {
  const navigate = useNavigate();
  const {
    ownedItems,
    discoveredRecipes,
    foundEasterEggs,
    getUniqueItemCount,
    getTotalItemCount,
  } = useInventoryStore();

  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<CollectibleItem | null>(null);

  const uniqueCount = getUniqueItemCount();
  const totalCount = getTotalItemCount();

  const filteredItems = useMemo(() => {
    const items = selectedCategory === 'all'
      ? ALL_ITEMS
      : ALL_ITEMS.filter((i) => i.category === selectedCategory);

    return items.map((item) => ({
      ...item,
      owned: ownedItems[item.id],
      discovered: (ownedItems[item.id]?.totalFound ?? 0) > 0,
    }));
  }, [selectedCategory, ownedItems]);

  const discoveredCount = filteredItems.filter((i) => i.discovered).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 sm:p-8">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/games')}
              className="flex items-center gap-2 px-4 py-2 bg-white border-4 border-slate-100 rounded-2xl font-bold text-slate-500 hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors"
            >
              ← Back to Games
            </button>

            <button
              onClick={() => navigate('/discovery-lab')}
              className="flex items-center gap-2 px-6 py-3 bg-[#E85D04] text-white rounded-2xl font-black text-lg hover:bg-[#d45304] transition-colors shadow-lg"
            >
              🧪 Discovery Lab
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight">
                🎒 My <span className="text-[#E85D04]">Backpack</span>
              </h1>
              <p className="text-lg text-slate-500 font-bold mt-2">
                Your collection of discoveries, items, and treasures!
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-3">
              <div className="bg-white border-4 border-slate-100 rounded-2xl px-4 py-3 text-center">
                <p className="text-2xl font-black text-[#E85D04]">{uniqueCount}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Unique</p>
              </div>
              <div className="bg-white border-4 border-slate-100 rounded-2xl px-4 py-3 text-center">
                <p className="text-2xl font-black text-[#3B82F6]">{totalCount}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total</p>
              </div>
              <div className="bg-white border-4 border-slate-100 rounded-2xl px-4 py-3 text-center">
                <p className="text-2xl font-black text-[#10B981]">{discoveredRecipes.length}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recipes</p>
              </div>
              <div className="bg-white border-4 border-slate-100 rounded-2xl px-4 py-3 text-center">
                <p className="text-2xl font-black text-[#a855f7]">{foundEasterEggs.length}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Eggs</p>
              </div>
            </div>
          </div>
        </header>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#3B82F6] text-white shadow-lg'
                : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-[#3B82F6]'
            }`}
          >
            ✨ All ({ALL_ITEMS.length})
          </button>
          {CATEGORIES.map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            const catItems = ALL_ITEMS.filter((i) => i.category === cat);
            if (catItems.length === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#3B82F6] text-white shadow-lg'
                    : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-[#3B82F6]'
                }`}
              >
                {config.emoji} {config.label}
              </button>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="bg-white border-4 border-slate-100 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-600 text-sm">
              {discoveredCount} / {filteredItems.length} discovered
            </span>
            <span className="font-bold text-[#E85D04] text-sm">
              {Math.round((discoveredCount / filteredItems.length) * 100)}%
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#E85D04] to-[#f59e0b] rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${(discoveredCount / filteredItems.length) * 100}%`,
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Item Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {filteredItems.map((item) => {
            const rarity = RARITY_CONFIG[item.rarity];
            const qty = item.owned?.quantity ?? 0;

            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedItem(item)}
                className={`relative aspect-square rounded-2xl border-4 flex flex-col items-center justify-center gap-1 transition-all ${
                  item.discovered
                    ? 'bg-white border-slate-100 hover:border-[#E85D04] shadow-sm'
                    : 'bg-slate-100 border-slate-200 opacity-40'
                }`}
                style={
                  item.discovered
                    ? { boxShadow: rarity.glow }
                    : undefined
                }
              >
                <span className={`text-2xl sm:text-3xl ${!item.discovered ? 'blur-sm' : ''}`}>
                  {item.discovered ? item.emoji : '❓'}
                </span>
                <span className="text-[10px] font-bold text-slate-500 truncate w-full text-center px-1">
                  {item.discovered ? item.name : '???'}
                </span>

                {qty > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-[#E85D04] text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {qty}
                  </span>
                )}

                {item.discovered && (
                  <span
                    className="absolute bottom-1 left-1 w-2 h-2 rounded-full"
                    style={{ backgroundColor: rarity.color }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Item Detail Modal */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 30 }}
                className="bg-white border-4 border-slate-100 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <ItemDetail item={selectedItem} onClose={() => setSelectedItem(null)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function ItemDetail({
  item,
  onClose,
}: {
  item: CollectibleItem & { owned?: { quantity: number; totalFound: number; firstFoundAt: string; sourceGame: string } | null; discovered?: boolean };
  onClose: () => void;
}) {
  const rarity = RARITY_CONFIG[item.rarity];

  if (!item.discovered) {
    return (
      <div className="text-center">
        <div className="text-6xl mb-4 opacity-30">❓</div>
        <h3 className="text-2xl font-black text-slate-400 mb-2">Undiscovered</h3>
        <p className="text-slate-400 font-bold mb-6">
          Keep playing games to discover this item!
        </p>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-300 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-4 border-4"
        style={{
          backgroundColor: rarity.bg,
          borderColor: rarity.color,
          boxShadow: rarity.glow,
        }}
      >
        {item.emoji}
      </motion.div>

      <h3 className="text-2xl font-black text-slate-800 mb-1">{item.name}</h3>
      <p
        className="text-sm font-bold uppercase tracking-widest mb-4"
        style={{ color: rarity.color }}
      >
        {rarity.label}
      </p>

      <p className="text-slate-600 font-bold mb-3">{item.description}</p>

      {item.funFact && (
        <div className="bg-[#3B82F6]/10 rounded-2xl p-4 mb-4 text-left">
          <p className="text-sm font-bold text-[#3B82F6]">
            💡 Fun Fact: {item.funFact}
          </p>
        </div>
      )}

      {item.owned && (
        <div className="flex justify-center gap-4 mb-4 text-sm">
          <div className="text-center">
            <p className="font-black text-[#E85D04] text-lg">{item.owned.quantity}</p>
            <p className="text-slate-500 font-bold">Owned</p>
          </div>
          <div className="text-center">
            <p className="font-black text-[#3B82F6] text-lg">{item.owned.totalFound}</p>
            <p className="text-slate-500 font-bold">Total Found</p>
          </div>
          <div className="text-center">
            <p className="font-black text-[#10B981] text-lg">{item.owned.sourceGame}</p>
            <p className="text-slate-500 font-bold">Source</p>
          </div>
        </div>
      )}

      <button
        onClick={onClose}
        className="px-6 py-3 bg-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-300 transition-colors"
      >
        Close
      </button>
    </div>
  );
}
