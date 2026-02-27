import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useInventoryStore, useProfileStore } from '../store';
import { getItem, RARITY_CONFIG, type CollectibleItem } from '../data/collectibles';
import { RECIPES, findPartialRecipes, type Recipe } from '../data/recipes';
import { recordProgressActivity } from '../services/progressTracking';
import { useAudio } from '../utils/hooks/useAudio';

export function DiscoveryLab() {
  const navigate = useNavigate();
  const location = useLocation();
  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const currentProfileId = useProfileStore((state) => state.currentProfile?.id);
  const {
    ownedItems,
    discoveredRecipes,
    craft,
    getCraftableRecipes,
    getItemCount,
  } = useInventoryStore();

  const [, setSelectedRecipe] = useState<Recipe | null>(null);
  const [craftResult, setCraftResult] = useState<{
    success: boolean;
    item?: CollectibleItem;
    celebration?: string;
    scienceFact?: string;
  } | null>(null);

  const inventory = useMemo(() => {
    const inv: Record<string, number> = {};
    for (const [id, owned] of Object.entries(ownedItems)) {
      inv[id] = owned.quantity;
    }
    return inv;
  }, [ownedItems]);

  const craftableRecipes = getCraftableRecipes();
  const partialRecipes = useMemo(
    () => findPartialRecipes(inventory, discoveredRecipes),
    [inventory, discoveredRecipes]
  );

  const handleCraft = (recipe: Recipe) => {
    playClick();
    const wasNewDiscovery = !discoveredRecipes.includes(recipe.id);
    const result = craft(recipe.id);
    void recordProgressActivity({
      profileId: currentProfileId,
      activityType: 'discovery_craft',
      contentId: `recipe-${recipe.id}`,
      score: result.success ? 100 : 0,
      routePath: location.pathname,
      metaData: {
        recipe_id: recipe.id,
        recipe_output_id: recipe.outputId,
        success: result.success,
        is_new_discovery: result.success && wasNewDiscovery,
        output_item_id: result.outputItem?.id,
      },
    });

    if (result.success) {
      playSuccess();
      playCelebration();
      setCraftResult({
        success: true,
        item: result.outputItem,
        celebration: recipe.celebration,
        scienceFact: recipe.scienceFact,
      });
    } else {
      playError();
      setCraftResult({ success: false });
    }
    setSelectedRecipe(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-4 sm:p-8">
      <motion.div
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => { playClick(); navigate('/inventory'); }}
              className="flex items-center gap-2 px-4 py-2 bg-white border-3 border-[#F2CC8F] rounded-2xl font-bold text-text-secondary hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors"
            >
              Back to Backpack
            </button>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-advay-slate tracking-tight">
            Discovery <span className="text-[#a855f7]">Lab</span>
          </h1>
          <p className="text-lg text-text-secondary font-bold mt-2">
            Combine items from your backpack to discover new things!
          </p>
        </header>

        {/* Discovery Stats */}
        <div className="bg-white border-3 border-[#F2CC8F] rounded-2xl p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-black text-[#a855f7]">{discoveredRecipes.length}</p>
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Discovered</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-slate-400">{RECIPES.length}</p>
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Total</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-text-secondary text-sm">
              {Math.round((discoveredRecipes.length / RECIPES.length) * 100)}% complete
            </p>
          </div>
        </div>

        {/* Craftable NOW */}
        {craftableRecipes.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-black text-advay-slate mb-4">
              Ready to Craft ({craftableRecipes.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {craftableRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  canCraft={true}
                  isDiscovered={discoveredRecipes.includes(recipe.id)}
                  onCraft={() => handleCraft(recipe)}
                  onSelect={() => setSelectedRecipe(recipe)}
                  getItemCount={getItemCount}
                />
              ))}
            </div>
          </section>
        )}

        {/* Hints — recipes you have SOME ingredients for */}
        {partialRecipes.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-black text-advay-slate mb-4">
              Almost There... ({partialRecipes.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {partialRecipes.slice(0, 6).map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  canCraft={false}
                  isDiscovered={false}
                  onCraft={() => {}}
                  onSelect={() => setSelectedRecipe(recipe)}
                  getItemCount={getItemCount}
                />
              ))}
            </div>
          </section>
        )}

        {/* Already Discovered */}
        {discoveredRecipes.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-black text-advay-slate mb-4">
              Discovered Recipes ({discoveredRecipes.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {discoveredRecipes.map((recipeId) => {
                const recipe = RECIPES.find((r) => r.id === recipeId);
                if (!recipe) return null;
                return (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    canCraft={craftableRecipes.some((r) => r.id === recipe.id)}
                    isDiscovered={true}
                    onCraft={() => handleCraft(recipe)}
                    onSelect={() => setSelectedRecipe(recipe)}
                    getItemCount={getItemCount}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Empty state */}
        {craftableRecipes.length === 0 && partialRecipes.length === 0 && discoveredRecipes.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-4 flex justify-center"><svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='#a855f7' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M10 2v7.31'/><path d='M14 2v7.31'/><path d='M8.5 2h7'/><path d='M14 9.3a6.5 6.5 0 1 1-4 0'/></svg></div>
            <h2 className="text-2xl font-black text-slate-400 mb-2">
              Your lab is empty!
            </h2>
            <p className="text-slate-400 font-bold mb-6">
              Play some games to collect items, then come back to combine them!
            </p>
            <button
              onClick={() => { playClick(); navigate('/games'); }}
              className="px-6 py-3 bg-[#3B82F6] text-white rounded-2xl font-black hover:bg-blue-600 transition-colors"
            >
              Play Games
            </button>
          </div>
        )}

        {/* Craft Result Celebration */}
        <AnimatePresence>
          {craftResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
              onClick={() => { playClick(); setCraftResult(null); }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="bg-white border-3 border-[#F2CC8F] rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl text-center"
                onClick={(e) => e.stopPropagation()}
              >
                {craftResult.success && craftResult.item ? (
                  <>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                      className="w-28 h-28 rounded-3xl flex items-center justify-center text-6xl mx-auto mb-6 border-3"
                      style={{
                        backgroundColor: RARITY_CONFIG[craftResult.item.rarity].bg,
                        borderColor: RARITY_CONFIG[craftResult.item.rarity].color,
                        boxShadow: RARITY_CONFIG[craftResult.item.rarity].glow,
                      }}
                    >
                      <svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke={RARITY_CONFIG[craftResult.item.rarity].color} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M6 9H4.5a2.5 2.5 0 0 1 0-5H6'/><path d='M18 9h1.5a2.5 2.5 0 0 0 0-5H18'/><path d='M4 22h16'/><path d='M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22'/><path d='M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22'/><path d='M18 2H6v7a6 6 0 0 0 12 0V2Z'/></svg>
                    </motion.div>
                    <h3 className="text-2xl font-black text-advay-slate mb-2">
                      {craftResult.celebration}
                    </h3>
                    {craftResult.scienceFact && (
                      <div className="bg-[#3B82F6]/10 rounded-2xl p-4 mb-4 text-left">
                        <p className="text-sm font-bold text-[#3B82F6]">
                          {craftResult.scienceFact}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xl font-black text-slate-400 mb-4">
                    Hmm, that didn't work...
                  </p>
                )}
                <button
                  onClick={() => { playClick(); setCraftResult(null); }}
                  className="px-6 py-3 bg-[#E85D04] text-white rounded-2xl font-black hover:bg-[#d45304] transition-colors"
                >
                  {craftResult.success ? 'Awesome!' : 'Try Again'}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function RecipeCard({
  recipe,
  canCraft,
  isDiscovered,
  onCraft,
  getItemCount,
}: {
  recipe: Recipe;
  canCraft: boolean;
  isDiscovered: boolean;
  onCraft: () => void;
  onSelect?: () => void;
  getItemCount: (id: string) => number;
}) {
  const outputItem = getItem(recipe.outputId);

  return (
    <div
      className={`bg-white border-3 rounded-2xl p-4 transition-all ${
        canCraft
          ? 'border-[#a855f7] shadow-lg hover:shadow-xl'
          : 'border-[#F2CC8F] opacity-80'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Output preview */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 border-2"
          style={
            outputItem
              ? {
                  backgroundColor: RARITY_CONFIG[outputItem.rarity].bg,
                  borderColor: RARITY_CONFIG[outputItem.rarity].color,
                }
              : { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' }
          }
        >
          {isDiscovered && outputItem ? (
                      <svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='none' stroke={RARITY_CONFIG[outputItem.rarity].color} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M6 9H4.5a2.5 2.5 0 0 1 0-5H6'/><path d='M18 9h1.5a2.5 2.5 0 0 0 0-5H18'/><path d='M4 22h16'/><path d='M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22'/><path d='M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22'/><path d='M18 2H6v7a6 6 0 0 0 12 0V2Z'/></svg>
                    ) : (
                      <svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='#a855f7' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='10'/><path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3'/><path d='M12 17h.01'/></svg>
                    )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-black text-advay-slate text-sm">
            {isDiscovered && outputItem ? outputItem.name : recipe.hint}
          </h3>

          {/* Ingredients */}
          <div className="flex flex-wrap gap-1 mt-2">
            {recipe.inputs.map((input, i) => {
              const item = getItem(input.itemId);
              const has = getItemCount(input.itemId);
              const enough = has >= input.quantity;
              return (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${
                    enough
                      ? 'bg-[#10B981]/20 text-[#10B981]'
                      : 'bg-red-50 text-red-400'
                  }`}
                >
                  <svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='10'/><path d='m9 12 2 2 4-4'/></svg> {input.quantity}×{item?.name ?? input.itemId}
                  {enough ? '' : ` (${has})`}
                </span>
              );
            })}
          </div>
        </div>

        {/* Craft button */}
        {canCraft && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCraft();
            }}
            className="px-4 py-2 bg-[#a855f7] text-white rounded-xl font-black text-sm hover:bg-purple-600 transition-colors shrink-0"
          >
            Craft!
          </button>
        )}
      </div>
    </div>
  );
}
