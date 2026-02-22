import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getItem, rollDropsFromTable, type CollectibleItem } from '../data/collectibles';
import { RECIPES_BY_ID, findCraftableRecipes, type Recipe } from '../data/recipes';
import { getEasterEggById } from '../data/easterEggs';
import { getDropTable } from '../data/gameRegistry';


export interface OwnedItem {
  itemId: string;
  quantity: number;
  firstFoundAt: string;
  sourceGame: string;
  totalFound: number;
}

export interface CraftResult {
  success: boolean;
  recipe?: Recipe;
  outputItem?: CollectibleItem;
  error?: string;
}

export interface ItemDrop {
  item: CollectibleItem;
  isNew: boolean; // first time finding this item
}

interface InventoryState {
  ownedItems: Record<string, OwnedItem>;
  discoveredRecipes: string[];
  foundEasterEggs: string[];
  totalDiscoveries: number;
  lastDrops: ItemDrop[]; // most recent drops for toast display
  showDropToast: boolean;

  // Item actions
  addItem: (itemId: string, quantity: number, sourceGame: string) => void;
  removeItem: (itemId: string, quantity: number) => boolean;
  hasItem: (itemId: string, minQuantity?: number) => boolean;
  getItemCount: (itemId: string) => number;
  getOwnedItem: (itemId: string) => OwnedItem | undefined;

  // Game completion: roll drops + add items
  processGameCompletion: (gameId: string, score?: number) => ItemDrop[];

  // Crafting
  craft: (recipeId: string) => CraftResult;
  getCraftableRecipes: () => Recipe[];

  // Easter eggs
  findEasterEgg: (eggId: string) => ItemDrop | null;
  hasFoundEasterEgg: (eggId: string) => boolean;

  // UI state
  clearDropToast: () => void;

  // Stats
  getUniqueItemCount: () => number;
  getTotalItemCount: () => number;
  getCategoryItemCount: (category: string) => number;

  // Reset
  resetInventory: () => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      ownedItems: {},
      discoveredRecipes: [],
      foundEasterEggs: [],
      totalDiscoveries: 0,
      lastDrops: [],
      showDropToast: false,

      addItem: (itemId, quantity, sourceGame) => {
        set((state) => {
          const existing = state.ownedItems[itemId];
          const now = new Date().toISOString();

          return {
            ownedItems: {
              ...state.ownedItems,
              [itemId]: existing
                ? {
                    ...existing,
                    quantity: existing.quantity + quantity,
                    totalFound: existing.totalFound + quantity,
                  }
                : {
                    itemId,
                    quantity,
                    firstFoundAt: now,
                    sourceGame,
                    totalFound: quantity,
                  },
            },
          };
        });
      },

      removeItem: (itemId, quantity) => {
        const current = get().ownedItems[itemId];
        if (!current || current.quantity < quantity) return false;

        set((state) => {
          const updated = { ...state.ownedItems };
          if (current.quantity === quantity) {
            // Keep the record but set quantity to 0 (preserve discovery history)
            updated[itemId] = { ...current, quantity: 0 };
          } else {
            updated[itemId] = {
              ...current,
              quantity: current.quantity - quantity,
            };
          }
          return { ownedItems: updated };
        });
        return true;
      },

      hasItem: (itemId, minQuantity = 1) => {
        return (get().ownedItems[itemId]?.quantity ?? 0) >= minQuantity;
      },

      getItemCount: (itemId) => {
        return get().ownedItems[itemId]?.quantity ?? 0;
      },

      getOwnedItem: (itemId) => {
        return get().ownedItems[itemId];
      },

      processGameCompletion: (gameId, score) => {
        const dropTable = getDropTable(gameId);
        const droppedIds = rollDropsFromTable(dropTable, score);
        if (droppedIds.length === 0) return [];

        const drops: ItemDrop[] = [];
        const state = get();

        for (const itemId of droppedIds) {
          const item = getItem(itemId);
          if (!item) continue;

          const isNew = !state.ownedItems[itemId] || state.ownedItems[itemId].quantity === 0;
          drops.push({ item, isNew });
          get().addItem(itemId, 1, gameId);
        }

        if (drops.length > 0) {
          set({
            lastDrops: drops,
            showDropToast: true,
            totalDiscoveries: get().totalDiscoveries + drops.filter((d) => d.isNew).length,
          });
        }

        return drops;
      },

      craft: (recipeId) => {
        const recipe = RECIPES_BY_ID[recipeId];
        if (!recipe) return { success: false, error: 'Recipe not found' };

        const state = get();

        // Check all inputs are available
        for (const input of recipe.inputs) {
          if ((state.ownedItems[input.itemId]?.quantity ?? 0) < input.quantity) {
            return { success: false, error: `Not enough ${input.itemId}` };
          }
        }

        // Consume inputs
        for (const input of recipe.inputs) {
          get().removeItem(input.itemId, input.quantity);
        }

        // Add output
        const outputItem = getItem(recipe.outputId);
        get().addItem(recipe.outputId, recipe.outputQuantity, 'discovery-lab');

        // Record recipe discovery
        set((s) => ({
          discoveredRecipes: s.discoveredRecipes.includes(recipeId)
            ? s.discoveredRecipes
            : [...s.discoveredRecipes, recipeId],
          totalDiscoveries: s.totalDiscoveries + (s.discoveredRecipes.includes(recipeId) ? 0 : 1),
          lastDrops: outputItem ? [{ item: outputItem, isNew: true }] : [],
          showDropToast: true,
        }));

        return {
          success: true,
          recipe,
          outputItem: outputItem ?? undefined,
        };
      },

      getCraftableRecipes: () => {
        const state = get();
        const inventory: Record<string, number> = {};
        for (const [id, owned] of Object.entries(state.ownedItems)) {
          inventory[id] = owned.quantity;
        }
        return findCraftableRecipes(inventory);
      },

      findEasterEgg: (eggId) => {
        const state = get();
        if (state.foundEasterEggs.includes(eggId)) return null;

        const egg = getEasterEggById(eggId);
        if (!egg) return null;

        const item = getItem(egg.reward.itemId);
        if (!item) return null;

        const isNew = !state.ownedItems[egg.reward.itemId] || state.ownedItems[egg.reward.itemId].quantity === 0;

        get().addItem(egg.reward.itemId, egg.reward.quantity, egg.gameId);

        set((s) => ({
          foundEasterEggs: [...s.foundEasterEggs, eggId],
          totalDiscoveries: s.totalDiscoveries + 1,
          lastDrops: [{ item, isNew }],
          showDropToast: true,
        }));

        return { item, isNew };
      },

      hasFoundEasterEgg: (eggId) => {
        return get().foundEasterEggs.includes(eggId);
      },

      clearDropToast: () => {
        set({ showDropToast: false, lastDrops: [] });
      },

      getUniqueItemCount: () => {
        return Object.values(get().ownedItems).filter((o) => o.totalFound > 0).length;
      },

      getTotalItemCount: () => {
        return Object.values(get().ownedItems).reduce(
          (sum, o) => sum + o.quantity,
          0
        );
      },

      getCategoryItemCount: (category) => {
        let count = 0;
        for (const [id, owned] of Object.entries(get().ownedItems)) {
          const item = getItem(id);
          if (item && item.category === category && owned.totalFound > 0) {
            count++;
          }
        }
        return count;
      },

      resetInventory: () => {
        set({
          ownedItems: {},
          discoveredRecipes: [],
          foundEasterEggs: [],
          totalDiscoveries: 0,
          lastDrops: [],
          showDropToast: false,
        });
      },
    }),
    {
      name: 'advay-inventory',
      partialize: (state) => ({
        ownedItems: state.ownedItems,
        discoveredRecipes: state.discoveredRecipes,
        foundEasterEggs: state.foundEasterEggs,
        totalDiscoveries: state.totalDiscoveries,
      }),
    }
  )
);
