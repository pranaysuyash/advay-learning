import { memo, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Backpack,
  Sparkles,
  BadgeHelp,
  Lightbulb,
} from 'lucide-react';
import { useInventoryStore } from '../store';
import { useProfileStore } from '../store/profileStore';
import {
  ALL_ITEMS,
  RARITY_CONFIG,
  getItem,
  type ItemCategory,
  type CollectibleItem,
} from '../data/collectibles';
import { getListedGames } from '../data/gameRegistry';
import { ItemIcon } from '../components/ui/ItemIcon';

const CATEGORY_CONFIG: Record<ItemCategory, { label: string; emoji: string }> =
{
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

export const Inventory = memo(function Inventory() {
  const navigate = useNavigate();
  const {
    ownedItems,
    discoveredRecipes,
    foundEasterEggs,
    getEggHints,
    getUniqueItemCount,
    getTotalItemCount,
  } = useInventoryStore();
  const profileAge = useProfileStore((s) => s.currentProfile?.age);

  const [selectedCategory, setSelectedCategory] = useState<
    ItemCategory | 'all'
  >('all');
  const [selectedItem, setSelectedItem] = useState<CollectibleItem | null>(
    null,
  );

  const uniqueCount = getUniqueItemCount();
  const totalCount = getTotalItemCount();
  const ageBand = profileAge !== undefined && profileAge < 6 ? '2-5' : '6-9';
  const gamesWithEggs = useMemo(
    () => getListedGames().filter((game) => game.easterEggs.length > 0),
    [],
  );
  const [selectedEggGame, setSelectedEggGame] = useState<string | null>(
    gamesWithEggs[0]?.id ?? null,
  );

  const filteredItems = useMemo(() => {
    const items =
      selectedCategory === 'all'
        ? ALL_ITEMS
        : ALL_ITEMS.filter((i) => i.category === selectedCategory);

    return items.map((item) => ({
      ...item,
      owned: ownedItems[item.id],
      discovered: (ownedItems[item.id]?.totalFound ?? 0) > 0,
    }));
  }, [selectedCategory, ownedItems]);

  const discoveredCount = filteredItems.filter((i) => i.discovered).length;
  const eggProgressByGame = useMemo(
    () =>
      gamesWithEggs.map((game) => {
        const hints = getEggHints(game.id, ageBand);
        const discovered = hints.filter((hint) => hint.discovered).length;
        return {
          gameId: game.id,
          name: game.name,
          discovered,
          total: hints.length,
          hints,
        };
      }),
    [gamesWithEggs, getEggHints, ageBand],
  );
  const activeEggGame = useMemo(
    () =>
      eggProgressByGame.find((game) => game.gameId === selectedEggGame) ??
      eggProgressByGame[0],
    [eggProgressByGame, selectedEggGame],
  );

  return (
    <div className='min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 sm:p-8'>
      <motion.div
        className='max-w-6xl mx-auto'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <header className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <button
              onClick={() => navigate('/games')}
              className='flex items-center gap-2 px-4 py-2 bg-white border-3 border-[#F2CC8F] rounded-2xl font-bold text-text-secondary hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors'
            >
              ← Back to Games
            </button>

            <button
              onClick={() => navigate('/discovery-lab')}
              className='flex items-center gap-2 px-6 py-3 bg-[#E85D04] text-white rounded-2xl font-black text-lg hover:bg-[#d45304] transition-colors shadow-lg'
            >
              <FlaskConical className='w-5 h-5' />
              Discovery Lab
            </button>
          </div>

          <div className='flex flex-col md:flex-row md:items-end justify-between gap-4'>
            <div>
              <h1 className='text-4xl sm:text-5xl font-black text-advay-slate tracking-tight flex items-center gap-3'>
                <Backpack className='w-10 h-10 sm:w-12 sm:h-12 text-[#E85D04]' />
                My <span className='text-[#E85D04]'>Backpack</span>
              </h1>
              <p className='text-lg text-text-secondary font-bold mt-2'>
                Your collection of discoveries, items, and treasures!
              </p>
            </div>

            {/* Stats */}
            <div className='flex gap-3'>
              <div className='bg-white border-3 border-[#F2CC8F] rounded-2xl px-4 py-3 text-center'>
                <p className='text-2xl font-black text-[#E85D04]'>
                  {uniqueCount}
                </p>
                <p className='text-xs font-bold text-text-secondary uppercase tracking-widest'>
                  Unique
                </p>
              </div>
              <div className='bg-white border-3 border-[#F2CC8F] rounded-2xl px-4 py-3 text-center'>
                <p className='text-2xl font-black text-[#3B82F6]'>
                  {totalCount}
                </p>
                <p className='text-xs font-bold text-text-secondary uppercase tracking-widest'>
                  Total
                </p>
              </div>
              <div className='bg-white border-3 border-[#F2CC8F] rounded-2xl px-4 py-3 text-center'>
                <p className='text-2xl font-black text-[#10B981]'>
                  {discoveredRecipes.length}
                </p>
                <p className='text-xs font-bold text-text-secondary uppercase tracking-widest'>
                  Recipes
                </p>
              </div>
              <div className='bg-white border-3 border-[#F2CC8F] rounded-2xl px-4 py-3 text-center'>
                <p className='text-2xl font-black text-[#a855f7]'>
                  {foundEasterEggs.length}
                </p>
                <p className='text-xs font-bold text-text-secondary uppercase tracking-widest'>
                  Eggs
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Category Tabs */}
        <div className='flex flex-wrap gap-2 mb-6'>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${selectedCategory === 'all'
                ? 'bg-[#3B82F6] text-white shadow-lg'
                : 'bg-white border-2 border-[#F2CC8F] text-advay-slate hover:border-[#3B82F6]'
              }`}
          >
            <span className='flex items-center gap-1'>
              <Sparkles className='w-4 h-4' />
              All ({ALL_ITEMS.length})
            </span>
          </button>
          {CATEGORIES.map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            const catItems = ALL_ITEMS.filter((i) => i.category === cat);
            if (catItems.length === 0) {
              // render disabled button so tabs remain consistent even when empty
              return (
                <button
                  key={cat}
                  disabled
                  className='px-4 py-2 rounded-xl font-bold text-sm bg-slate-100 text-slate-400 cursor-not-allowed'
                  aria-disabled='true'
                  title='No items yet'
                >
                  {config.emoji} {config.label}
                </button>
              );
            }
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${selectedCategory === cat
                    ? 'bg-[#3B82F6] text-white shadow-lg'
                    : 'bg-white border-2 border-[#F2CC8F] text-advay-slate hover:border-[#3B82F6]'
                  }`}
              >
                {config.emoji} {config.label}
              </button>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className='bg-white border-3 border-[#F2CC8F] rounded-2xl p-4 mb-6'>
          <div className='flex items-center justify-between mb-2'>
            <span className='font-bold text-advay-slate text-sm'>
              {discoveredCount} / {filteredItems.length} discovered
            </span>
            <span className='font-bold text-[#E85D04] text-sm'>
              {Math.round((discoveredCount / filteredItems.length) * 100)}%
            </span>
          </div>
          <div className='h-3 bg-slate-100 rounded-full overflow-hidden'>
            <motion.div
              className='h-full bg-gradient-to-r from-[#E85D04] to-[#f59e0b] rounded-full'
              initial={{ width: 0 }}
              animate={{
                width: `${(discoveredCount / filteredItems.length) * 100}%`,
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {eggProgressByGame.length > 0 && (
          <div className='bg-white border-3 border-[#F2CC8F] rounded-2xl p-4 mb-6'>
            <div className='flex items-center justify-between gap-3 mb-3'>
              <h2 className='font-black text-advay-slate text-lg'>
                Easter Egg Discovery
              </h2>
              <span className='text-xs font-bold text-text-secondary'>
                Age layer: {ageBand}
              </span>
            </div>

            <div className='flex flex-wrap gap-2 mb-3'>
              {eggProgressByGame.map((game) => (
                <button
                  key={game.gameId}
                  onClick={() => setSelectedEggGame(game.gameId)}
                  className={`px-3 py-2 rounded-xl text-xs font-black border-2 transition ${selectedEggGame === game.gameId ? 'bg-[#3B82F6] text-white border-[#3B82F6]' : 'bg-white text-advay-slate border-[#F2CC8F]'}`}
                >
                  {game.name} ({game.discovered}/{game.total})
                </button>
              ))}
            </div>

            {activeEggGame && (
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'>
                {activeEggGame.hints.map((hint) => {
                  const eggReward = hint.discovered
                    ? getItem(hint.rewardItemId)
                    : null;
                  const stageDots = [0, 1, 2, 3];
                  return (
                    <div
                      key={hint.eggId}
                      className={`rounded-2xl border-2 p-3 ${hint.discovered ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-[#F2CC8F]'}`}
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <div
                          className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center ${hint.discovered ? 'bg-white border-emerald-300' : 'bg-slate-100 border-slate-200'}`}
                        >
                          {hint.discovered && eggReward ? (
                            <ItemIcon item={eggReward} size={28} />
                          ) : (
                            <span
                              className={`${hint.discovered ? '' : 'opacity-60 blur-[1px]'}`}
                            >
                              🥚
                            </span>
                          )}
                        </div>
                        <span className='text-xs font-black text-text-secondary'>
                          S{hint.stage}
                        </span>
                      </div>
                      <p className='text-xs font-black text-advay-slate truncate mb-1'>
                        {hint.title}
                      </p>
                      <p className='text-[11px] font-bold text-text-secondary min-h-[2rem]'>
                        {hint.hintText}
                      </p>
                      <div className='flex gap-1 mt-2'>
                        {stageDots.map((dot) => (
                          <span
                            key={`${hint.eggId}-${dot}`}
                            className={`w-2 h-2 rounded-full ${dot <= hint.stage ? 'bg-[#3B82F6]' : 'bg-slate-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Item Grid */}
        <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3'>
          {filteredItems.map((item) => {
            const rarity = RARITY_CONFIG[item.rarity];
            const qty = item.owned?.quantity ?? 0;

            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedItem(item)}
                className={`relative aspect-square rounded-2xl border-3 flex flex-col items-center justify-center gap-1 transition-all ${item.discovered
                    ? 'bg-white border-[#F2CC8F] hover:border-[#E85D04] shadow-[0_4px_0_#E5B86E]'
                    : 'bg-slate-100 border-[#F2CC8F] opacity-40'
                  }`}
                style={item.discovered ? { boxShadow: rarity.glow } : undefined}
              >
                <span
                  className={`text-2xl sm:text-3xl ${!item.discovered ? 'blur-sm' : ''}`}
                >
                  {item.discovered ? <ItemIcon item={item} size={34} /> : '❓'}
                </span>
                <span className='text-[10px] font-bold text-text-secondary truncate w-full text-center px-1'>
                  {item.discovered ? item.name : '???'}
                </span>

                {qty > 0 && (
                  <span className='absolute top-1 right-1 w-5 h-5 bg-[#E85D04] text-white text-[10px] font-black rounded-full flex items-center justify-center'>
                    {qty}
                  </span>
                )}

                {item.discovered && (
                  <span
                    className='absolute bottom-1 left-1 w-2 h-2 rounded-full'
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
              className='fixed inset-0 bg-[#FFF8F0]/80 backdrop-blur-md flex items-center justify-center z-50 p-4'
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 30 }}
                className='bg-white border-3 border-[#F2CC8F] rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl'
                onClick={(e) => e.stopPropagation()}
              >
                <ItemDetail
                  item={selectedItem}
                  onClose={() => setSelectedItem(null)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
});

function ItemDetail({
  item,
  onClose,
}: {
  item: CollectibleItem & {
    owned?: {
      quantity: number;
      totalFound: number;
      firstFoundAt: string;
      sourceGame: string;
    } | null;
    discovered?: boolean;
  };
  onClose: () => void;
}) {
  const rarity = RARITY_CONFIG[item.rarity];

  if (!item.discovered) {
    return (
      <div className='text-center'>
        <div className='flex justify-center mb-4'>
          <BadgeHelp className='w-16 h-16 text-slate-300' />
        </div>
        <h3 className='text-2xl font-black text-slate-400 mb-2'>
          Undiscovered
        </h3>
        <p className='text-slate-400 font-bold mb-6'>
          Keep playing games to discover this item!
        </p>
        <button
          onClick={onClose}
          className='px-6 py-3 bg-slate-200 text-advay-slate rounded-2xl font-bold hover:bg-slate-300 transition-colors'
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className='text-center'>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className='w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-4 border-3'
        style={{
          backgroundColor: rarity.bg,
          borderColor: rarity.color,
          boxShadow: rarity.glow,
        }}
      >
        <ItemIcon item={item} size={72} />
      </motion.div>

      <h3 className='text-2xl font-black text-advay-slate mb-1'>{item.name}</h3>
      <p
        className='text-sm font-bold uppercase tracking-widest mb-4'
        style={{ color: rarity.color }}
      >
        {rarity.label}
      </p>

      <p className='text-advay-slate font-bold mb-3'>{item.description}</p>

      {item.funFact && (
        <div className='bg-[#3B82F6]/10 rounded-2xl p-4 mb-4 text-left'>
          <p className='text-sm font-bold text-[#3B82F6] flex items-center gap-1'>
            <Lightbulb className='w-4 h-4' />
            Fun Fact: {item.funFact}
          </p>
        </div>
      )}

      {item.owned && (
        <div className='flex justify-center gap-4 mb-4 text-sm'>
          <div className='text-center'>
            <p className='font-black text-[#E85D04] text-lg'>
              {item.owned.quantity}
            </p>
            <p className='text-text-secondary font-bold'>Owned</p>
          </div>
          <div className='text-center'>
            <p className='font-black text-[#3B82F6] text-lg'>
              {item.owned.totalFound}
            </p>
            <p className='text-text-secondary font-bold'>Total Found</p>
          </div>
          <div className='text-center'>
            <p className='font-black text-[#10B981] text-lg'>
              {item.owned.sourceGame}
            </p>
            <p className='text-text-secondary font-bold'>Source</p>
          </div>
        </div>
      )}

      <button
        onClick={onClose}
        className='px-6 py-3 bg-slate-200 text-advay-slate rounded-2xl font-bold hover:bg-slate-300 transition-colors'
      >
        Close
      </button>
    </div>
  );
}
export default Inventory;
