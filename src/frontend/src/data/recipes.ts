// Discovery/Crafting recipes — combine items to discover new ones!
// Inspired by Little Alchemy but with real science and educational value.

export interface RecipeInput {
  itemId: string;
  quantity: number;
}

export interface Recipe {
  id: string;
  inputs: RecipeInput[];
  outputId: string;
  outputQuantity: number;
  hint: string;
  celebration: string;
  scienceFact?: string;
  category: 'science' | 'art' | 'nature' | 'music' | 'emotion' | 'magic' | 'food';
}

export const RECIPES: Recipe[] = [
  // ─── SCIENCE DISCOVERIES ──────────────────────────────────────────────
  {
    id: 'recipe-water',
    inputs: [
      { itemId: 'element-h', quantity: 2 },
      { itemId: 'element-o', quantity: 1 },
    ],
    outputId: 'material-water',
    outputQuantity: 1,
    hint: 'Two of the lightest element + one breathy one...',
    celebration: '💧 You discovered WATER! H₂O!',
    scienceFact: 'Two hydrogen atoms bond with one oxygen atom to make water — the most important molecule for life!',
    category: 'science',
  },
  {
    id: 'recipe-salt',
    inputs: [
      { itemId: 'element-na', quantity: 1 },
      { itemId: 'element-cl', quantity: 1 },
    ],
    outputId: 'material-salt',
    outputQuantity: 1,
    hint: 'One shiny metal + one pool chemical...',
    celebration: '🧂 You made SALT! NaCl!',
    scienceFact: 'Sodium (a metal that explodes in water) + Chlorine (a toxic gas) = ordinary table salt! Chemistry is wild!',
    category: 'science',
  },
  {
    id: 'recipe-rust',
    inputs: [
      { itemId: 'element-fe', quantity: 1 },
      { itemId: 'element-o', quantity: 1 },
    ],
    outputId: 'material-rust',
    outputQuantity: 1,
    hint: 'A strong metal meets the air...',
    celebration: '🟤 You created RUST! Iron Oxide!',
    scienceFact: 'Mars is called the Red Planet because its surface is covered in iron oxide — rust!',
    category: 'science',
  },
  {
    id: 'recipe-co2',
    inputs: [
      { itemId: 'element-c', quantity: 1 },
      { itemId: 'element-o', quantity: 2 },
    ],
    outputId: 'material-co2',
    outputQuantity: 1,
    hint: 'The building block of life meets what you breathe...',
    celebration: '🫧 You made CARBON DIOXIDE! CO₂!',
    scienceFact: 'You breathe out CO₂ with every breath, and plants breathe it IN to make food! You and plants help each other.',
    category: 'science',
  },
  {
    id: 'recipe-air',
    inputs: [
      { itemId: 'element-n', quantity: 2 },
      { itemId: 'element-o', quantity: 1 },
    ],
    outputId: 'material-air',
    outputQuantity: 1,
    hint: 'The two most common gases in our sky...',
    celebration: '🌬️ You made AIR!',
    scienceFact: 'Air is about 78% nitrogen and 21% oxygen, with tiny amounts of other gases.',
    category: 'science',
  },
  {
    id: 'recipe-steam',
    inputs: [
      { itemId: 'material-water', quantity: 1 },
      { itemId: 'material-sunshine', quantity: 1 },
    ],
    outputId: 'material-steam',
    outputQuantity: 1,
    hint: 'Heat up the liquid of life...',
    celebration: '♨️ You made STEAM! Water + Heat!',
    scienceFact: 'Steam powered the Industrial Revolution — trains, factories, and ships all ran on steam!',
    category: 'science',
  },
  {
    id: 'recipe-ice',
    inputs: [
      { itemId: 'material-water', quantity: 1 },
      { itemId: 'emotion-calm', quantity: 1 },
    ],
    outputId: 'material-ice',
    outputQuantity: 1,
    hint: 'Water + extreme calm (cold)...',
    celebration: '🧊 You froze WATER into ICE!',
    scienceFact: 'Ice floats because water expands when it freezes — this is very unusual for a liquid!',
    category: 'science',
  },
  {
    id: 'recipe-lava',
    inputs: [
      { itemId: 'material-rust', quantity: 1 },
      { itemId: 'material-sunshine', quantity: 2 },
    ],
    outputId: 'material-lava',
    outputQuantity: 1,
    hint: 'Heat rock to extreme temperatures...',
    celebration: '🌋 You created LAVA! Molten rock!',
    scienceFact: 'Lava can be hotter than 1,200°C — hot enough to melt steel!',
    category: 'science',
  },

  // ─── COLOR MIXING ─────────────────────────────────────────────────────
  {
    id: 'recipe-orange',
    inputs: [
      { itemId: 'color-red', quantity: 1 },
      { itemId: 'color-yellow', quantity: 1 },
    ],
    outputId: 'color-orange',
    outputQuantity: 1,
    hint: 'Fire + sunshine...',
    celebration: '🟠 You mixed ORANGE!',
    scienceFact: 'The color orange was named after the fruit, which came from Sanskrit "nāranga."',
    category: 'art',
  },
  {
    id: 'recipe-purple',
    inputs: [
      { itemId: 'color-red', quantity: 1 },
      { itemId: 'color-blue', quantity: 1 },
    ],
    outputId: 'color-purple',
    outputQuantity: 1,
    hint: 'Fire + sky...',
    celebration: '🟣 You mixed PURPLE! The royal color!',
    scienceFact: 'In ancient times, purple dye was so expensive that only royalty could afford it!',
    category: 'art',
  },
  {
    id: 'recipe-pink',
    inputs: [
      { itemId: 'color-red', quantity: 1 },
      { itemId: 'color-white', quantity: 1 },
    ],
    outputId: 'color-pink',
    outputQuantity: 1,
    hint: 'Lighten the color of love...',
    celebration: '🩷 You mixed PINK!',
    scienceFact: 'Pink doesn\'t exist in the rainbow — your brain creates it by mixing red and violet light!',
    category: 'art',
  },
  {
    id: 'recipe-rainbow',
    inputs: [
      { itemId: 'color-red', quantity: 1 },
      { itemId: 'color-orange', quantity: 1 },
      { itemId: 'color-yellow', quantity: 1 },
      { itemId: 'color-green', quantity: 1 },
      { itemId: 'color-blue', quantity: 1 },
      { itemId: 'color-purple', quantity: 1 },
    ],
    outputId: 'color-rainbow',
    outputQuantity: 1,
    hint: 'Collect ALL the colors and combine them...',
    celebration: '🌈 RAINBOW! All colors in harmony!',
    scienceFact: 'A rainbow is actually a full circle — you only see a half-arc because the ground gets in the way!',
    category: 'art',
  },

  // ─── NATURE / GROWTH ──────────────────────────────────────────────────
  {
    id: 'recipe-mud',
    inputs: [
      { itemId: 'material-water', quantity: 1 },
      { itemId: 'color-black', quantity: 1 },
    ],
    outputId: 'material-mud',
    outputQuantity: 1,
    hint: 'Water meets the earth...',
    celebration: '🟫 You made MUD! Squishy!',
    scienceFact: 'Adobe houses are made from mud bricks and can last hundreds of years!',
    category: 'nature',
  },
  {
    id: 'recipe-plant',
    inputs: [
      { itemId: 'material-seed', quantity: 1 },
      { itemId: 'material-water', quantity: 1 },
    ],
    outputId: 'material-seed', // grows from seed
    outputQuantity: 2,
    hint: 'Give the seed what it needs...',
    celebration: '🌿 Your seed is GROWING! Water + Seed!',
    scienceFact: 'Plants convert sunlight, water, and CO₂ into food through photosynthesis.',
    category: 'nature',
  },
  {
    id: 'recipe-flower',
    inputs: [
      { itemId: 'material-seed', quantity: 1 },
      { itemId: 'material-water', quantity: 1 },
      { itemId: 'material-sunshine', quantity: 1 },
    ],
    outputId: 'material-flower',
    outputQuantity: 1,
    hint: 'A seed needs water AND light...',
    celebration: '🌸 A FLOWER bloomed! Seed + Water + Sunshine!',
    scienceFact: 'Flowers evolved to attract pollinators like bees and butterflies — their colors and scents are like advertisements!',
    category: 'nature',
  },
  {
    id: 'recipe-crystal',
    inputs: [
      { itemId: 'material-salt', quantity: 2 },
      { itemId: 'material-water', quantity: 1 },
    ],
    outputId: 'material-crystal',
    outputQuantity: 1,
    hint: 'Dissolve salt in water and let it evaporate...',
    celebration: '🔮 A CRYSTAL formed! Salt crystals!',
    scienceFact: 'You can grow real crystals at home by dissolving salt or sugar in hot water and letting it cool slowly!',
    category: 'science',
  },

  // ─── MUSIC DISCOVERIES ────────────────────────────────────────────────
  {
    id: 'recipe-melody',
    inputs: [
      { itemId: 'note-do', quantity: 1 },
      { itemId: 'note-re', quantity: 1 },
      { itemId: 'note-mi', quantity: 1 },
    ],
    outputId: 'artifact-melody',
    outputQuantity: 1,
    hint: 'The first three notes of the scale...',
    celebration: '🎼 You composed your FIRST MELODY!',
    scienceFact: '"Do Re Mi" was popularized by The Sound of Music, but the system was invented by an Italian monk in the 11th century!',
    category: 'music',
  },

  // ─── EMOTION DISCOVERIES ──────────────────────────────────────────────
  {
    id: 'recipe-rainbow-heart',
    inputs: [
      { itemId: 'emotion-happy', quantity: 1 },
      { itemId: 'emotion-sad', quantity: 1 },
      { itemId: 'emotion-angry', quantity: 1 },
      { itemId: 'emotion-surprised', quantity: 1 },
      { itemId: 'emotion-scared', quantity: 1 },
      { itemId: 'emotion-love', quantity: 1 },
      { itemId: 'emotion-calm', quantity: 1 },
    ],
    outputId: 'artifact-rainbow-heart',
    outputQuantity: 1,
    hint: 'Collect ALL emotions — every feeling matters...',
    celebration: '🫶 RAINBOW HEART! You understand ALL emotions!',
    scienceFact: 'Emotional intelligence — understanding all emotions, not just happy ones — is one of the strongest predictors of success and happiness in life.',
    category: 'emotion',
  },

  // ─── LEGENDARY RECIPES ────────────────────────────────────────────────
  {
    id: 'recipe-philosophers-stone',
    inputs: [
      { itemId: 'element-au', quantity: 1 },
      { itemId: 'material-crystal', quantity: 1 },
      { itemId: 'material-lava', quantity: 1 },
      { itemId: 'material-flower', quantity: 1 },
    ],
    outputId: 'artifact-philosophers-stone',
    outputQuantity: 1,
    hint: 'Gold + Crystal + Fire + Life... the ultimate discovery!',
    celebration: '💠 THE PHILOSOPHER\'S STONE! You are a true alchemist!',
    scienceFact: 'Medieval alchemists believed a "philosopher\'s stone" could turn lead into gold. While they never found it, their experiments laid the groundwork for modern chemistry!',
    category: 'magic',
  },
  {
    id: 'recipe-star-map',
    inputs: [
      { itemId: 'shape-star', quantity: 5 },
      { itemId: 'tool-telescope', quantity: 1 },
    ],
    outputId: 'artifact-constellation',
    outputQuantity: 1,
    hint: 'Collect many stars and look through the right tool...',
    celebration: '🗺️ STAR MAP! You mapped the constellations!',
    scienceFact: 'Ancient sailors used constellations to navigate the oceans — the stars were their GPS!',
    category: 'science',
  },

  // ─── FOOD RECIPES ─────────────────────────────────────────────────────
  {
    id: 'recipe-cookie',
    inputs: [
      { itemId: 'material-flower', quantity: 1 },
      { itemId: 'material-sunshine', quantity: 1 },
    ],
    outputId: 'food-cookie',
    outputQuantity: 2,
    hint: 'Bake something sweet in the sunshine...',
    celebration: '🍪 You baked COOKIES!',
    scienceFact: 'Baking is actually chemistry — mixing flour, sugar, and heat creates chemical reactions!',
    category: 'food',
  },
  {
    id: 'recipe-cake',
    inputs: [
      { itemId: 'food-cookie', quantity: 3 },
      { itemId: 'emotion-love', quantity: 1 },
    ],
    outputId: 'food-cake',
    outputQuantity: 1,
    hint: 'Stack treats with love...',
    celebration: '🎂 You made a MAGIC CAKE!',
    scienceFact: 'The tradition of putting candles on birthday cakes started in ancient Greece — they were offerings to Artemis, goddess of the moon!',
    category: 'food',
  },

  // ─── EVOLUTION RECIPES (merge 3 of same rarity → 1 of next) ─────────
  {
    id: 'recipe-evolve-dragon',
    inputs: [
      { itemId: 'creature-lion', quantity: 1 },
      { itemId: 'material-lava', quantity: 1 },
      { itemId: 'creature-owl', quantity: 1 },
    ],
    outputId: 'creature-dragon',
    outputQuantity: 1,
    hint: 'Combine wisdom, bravery, and fire...',
    celebration: '🐉 A DRAGON was born! Wisdom + Courage + Fire!',
    scienceFact: 'Dragons appear in mythology from China, Europe, India, and the Americas — completely independently!',
    category: 'magic',
  },
  {
    id: 'recipe-unicorn',
    inputs: [
      { itemId: 'creature-butterfly', quantity: 1 },
      { itemId: 'color-rainbow', quantity: 1 },
      { itemId: 'emotion-love', quantity: 1 },
    ],
    outputId: 'creature-unicorn',
    outputQuantity: 1,
    hint: 'Beauty + all colors + pure love...',
    celebration: '🦄 A UNICORN appeared! Pure magic!',
    scienceFact: 'Scotland\'s national animal is the unicorn — it\'s been on the Royal Coat of Arms since the 12th century!',
    category: 'magic',
  },
  {
    id: 'recipe-wand',
    inputs: [
      { itemId: 'creature-dragon', quantity: 1 },
      { itemId: 'artifact-philosophers-stone', quantity: 1 },
    ],
    outputId: 'tool-wand',
    outputQuantity: 1,
    hint: 'The ultimate creature + the ultimate discovery...',
    celebration: '🪄 PIP\'S WAND! The most legendary item! You are a true master!',
    scienceFact: 'In many stories, a magic wand channels the wielder\'s intention — just like how learning channels your curiosity into knowledge!',
    category: 'magic',
  },
];

export const RECIPES_BY_ID: Record<string, Recipe> = Object.fromEntries(
  RECIPES.map((r) => [r.id, r])
);

/**
 * Find all recipes that can be crafted with the given inventory.
 */
export function findCraftableRecipes(
  inventory: Record<string, number>
): Recipe[] {
  return RECIPES.filter((recipe) =>
    recipe.inputs.every(
      (input) => (inventory[input.itemId] ?? 0) >= input.quantity
    )
  );
}

/**
 * Find recipes where the player has at least one input item
 * (for showing "almost craftable" hints).
 */
export function findPartialRecipes(
  inventory: Record<string, number>,
  discoveredRecipeIds: string[]
): Recipe[] {
  return RECIPES.filter((recipe) => {
    if (discoveredRecipeIds.includes(recipe.id)) return false;
    const hasAtLeastOne = recipe.inputs.some(
      (input) => (inventory[input.itemId] ?? 0) > 0
    );
    const cantCraftYet = !recipe.inputs.every(
      (input) => (inventory[input.itemId] ?? 0) >= input.quantity
    );
    return hasAtLeastOne && cantCraftYet;
  });
}
