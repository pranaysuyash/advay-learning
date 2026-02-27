// Master catalog of all collectible items in the platform
// Items are dropped by games, found as easter eggs, or crafted via recipes
import { getItemIconPath, getVisualTierFromRarity, type VisualTier } from '../utils/itemsManifest';

export type ItemCategory =
  | 'element'
  | 'color'
  | 'shape'
  | 'creature'
  | 'note'
  | 'emotion'
  | 'letter'
  | 'number'
  | 'material'
  | 'tool'
  | 'artifact'
  | 'food';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface CollectibleItem {
  id: string;
  name: string;
  emoji: string;
  icon?: string;
  category: ItemCategory;
  rarity: Rarity;
  visualTier?: VisualTier;
  description: string;
  funFact?: string;
}

export const RARITY_CONFIG: Record<Rarity, { label: string; color: string; bg: string; glow: string }> = {
  common:    { label: 'Common',    color: '#94a3b8', bg: '#f1f5f9', glow: 'none' },
  uncommon:  { label: 'Uncommon',  color: '#22c55e', bg: '#f0fdf4', glow: '0 0 8px #22c55e40' },
  rare:      { label: 'Rare',      color: '#3b82f6', bg: '#eff6ff', glow: '0 0 12px #3b82f640' },
  epic:      { label: 'Epic',      color: '#a855f7', bg: '#faf5ff', glow: '0 0 16px #a855f740' },
  legendary: { label: 'Legendary', color: '#f59e0b', bg: '#fffbeb', glow: '0 0 20px #f59e0b60' },
};

// ─── ELEMENTS (from Chemistry Lab + crafting) ───────────────────────────

const ELEMENTS: CollectibleItem[] = [
  { id: 'element-h',  name: 'Hydrogen',  emoji: '⚗️', category: 'element', rarity: 'common',   description: 'The lightest element!',          funFact: 'Hydrogen makes up 75% of all matter in the universe.' },
  { id: 'element-o',  name: 'Oxygen',    emoji: '💨', category: 'element', rarity: 'common',   description: 'We breathe this to live!',       funFact: 'Oxygen makes up about 21% of Earth\'s atmosphere.' },
  { id: 'element-c',  name: 'Carbon',    emoji: '⬛', category: 'element', rarity: 'common',   description: 'The building block of life.',     funFact: 'Diamonds are made of pure carbon!' },
  { id: 'element-n',  name: 'Nitrogen',  emoji: '🌫️', category: 'element', rarity: 'common',   description: 'Most of the air is nitrogen!',   funFact: '78% of the air you breathe is nitrogen.' },
  { id: 'element-na', name: 'Sodium',    emoji: '🧂', category: 'element', rarity: 'uncommon', description: 'Half of table salt!',             funFact: 'Sodium explodes when it touches water!' },
  { id: 'element-cl', name: 'Chlorine',  emoji: '🟢', category: 'element', rarity: 'uncommon', description: 'The other half of salt!',         funFact: 'Chlorine is used to keep swimming pools clean.' },
  { id: 'element-fe', name: 'Iron',      emoji: '🔩', category: 'element', rarity: 'uncommon', description: 'Strong metal for building!',      funFact: 'Earth\'s core is mostly made of iron.' },
  { id: 'element-au', name: 'Gold',      emoji: '🥇', category: 'element', rarity: 'rare',     description: 'The precious golden metal!',      funFact: 'All the gold ever mined would fit in 3.5 Olympic pools.' },
  { id: 'element-he', name: 'Helium',    emoji: '🎈', category: 'element', rarity: 'uncommon', description: 'Makes balloons float!',           funFact: 'Helium makes your voice squeaky because sound travels faster through it.' },
  { id: 'element-s',  name: 'Sulfur',    emoji: '🟡', category: 'element', rarity: 'common',   description: 'Smells like rotten eggs!',        funFact: 'Volcanoes release sulfur, giving them their smell.' },
];

// ─── COLORS (from Color Match Garden + Air Canvas) ──────────────────────

const COLORS: CollectibleItem[] = [
  { id: 'color-red',    name: 'Red',    emoji: '🔴', category: 'color', rarity: 'common',   description: 'The color of fire and love!',       funFact: 'Red is the first color babies can see.' },
  { id: 'color-blue',   name: 'Blue',   emoji: '🔵', category: 'color', rarity: 'common',   description: 'The color of sky and ocean!',       funFact: 'Blue is the most popular favorite color in the world.' },
  { id: 'color-yellow', name: 'Yellow', emoji: '🟡', category: 'color', rarity: 'common',   description: 'The color of sunshine!',            funFact: 'Yellow is the most visible color from a distance.' },
  { id: 'color-green',  name: 'Green',  emoji: '🟢', category: 'color', rarity: 'common',   description: 'The color of nature!',              funFact: 'The human eye can see more shades of green than any other color.' },
  { id: 'color-orange', name: 'Orange', emoji: '🟠', category: 'color', rarity: 'uncommon', description: 'Warm like a sunset!',               funFact: 'The color was named after the fruit, not the other way around!' },
  { id: 'color-purple', name: 'Purple', emoji: '🟣', category: 'color', rarity: 'uncommon', description: 'The color of royalty!',             funFact: 'In ancient Rome, only emperors could wear purple.' },
  { id: 'color-pink',   name: 'Pink',   emoji: '🩷', category: 'color', rarity: 'uncommon', description: 'Soft and sweet!',                  funFact: 'There is no pink wavelength of light — your brain invents it!' },
  { id: 'color-white',  name: 'White',  emoji: '⚪', category: 'color', rarity: 'common',   description: 'All colors combined!',              funFact: 'White light contains all colors of the rainbow.' },
  { id: 'color-black',  name: 'Black',  emoji: '⚫', category: 'color', rarity: 'common',   description: 'The absence of light.',             funFact: 'Vantablack absorbs 99.965% of light!' },
  { id: 'color-rainbow', name: 'Rainbow', emoji: '🌈', category: 'color', rarity: 'epic',   description: 'All colors together in harmony!',   funFact: 'Every rainbow is actually a full circle — you just see half from the ground.' },
];

// ─── SHAPES (from Shape Pop + Shape Sequence) ───────────────────────────

const SHAPES: CollectibleItem[] = [
  { id: 'shape-circle',   name: 'Circle',   emoji: '⭕', category: 'shape', rarity: 'common',   description: 'Round and round, no corners!',     funFact: 'A circle has infinite lines of symmetry.' },
  { id: 'shape-triangle', name: 'Triangle', emoji: '🔺', category: 'shape', rarity: 'common',   description: 'Three sides, three corners!',       funFact: 'Triangles are the strongest shape in engineering.' },
  { id: 'shape-square',   name: 'Square',   emoji: '🟧', category: 'shape', rarity: 'common',   description: 'Four equal sides!',                 funFact: 'A square is a special type of rectangle.' },
  { id: 'shape-star',     name: 'Star',     emoji: '⭐', category: 'shape', rarity: 'uncommon', description: 'Shining bright with five points!',  funFact: 'Real stars are actually sphere-shaped, not pointy!' },
  { id: 'shape-heart',    name: 'Heart',    emoji: '❤️', category: 'shape', rarity: 'uncommon', description: 'The shape of love!',                funFact: 'The heart shape may come from an ancient plant called silphium.' },
  { id: 'shape-diamond',  name: 'Diamond',  emoji: '💎', category: 'shape', rarity: 'rare',     description: 'Brilliant and precious!',           funFact: 'A diamond shape in math is called a rhombus.' },
];

// ─── CREATURES (from Yoga Animals + Word Builder) ───────────────────────

const CREATURES: CollectibleItem[] = [
  { id: 'creature-cat',      name: 'Cat Spirit',      emoji: '🐱', category: 'creature', rarity: 'common',   description: 'Flexible and curious!',       funFact: 'Cats spend 70% of their lives sleeping.' },
  { id: 'creature-dog',      name: 'Dog Spirit',      emoji: '🐶', category: 'creature', rarity: 'common',   description: 'Loyal and playful!',          funFact: 'Dogs can understand about 250 words and gestures.' },
  { id: 'creature-lion',     name: 'Lion Spirit',     emoji: '🦁', category: 'creature', rarity: 'uncommon', description: 'Brave and mighty!',           funFact: 'A lion\'s roar can be heard from 5 miles away.' },
  { id: 'creature-butterfly', name: 'Butterfly Spirit', emoji: '🦋', category: 'creature', rarity: 'uncommon', description: 'Beautiful transformation!', funFact: 'Butterflies taste with their feet!' },
  { id: 'creature-owl',      name: 'Owl Spirit',      emoji: '🦉', category: 'creature', rarity: 'rare',     description: 'Wise and watchful!',          funFact: 'Owls can rotate their heads 270 degrees.' },
  { id: 'creature-dragon',   name: 'Dragon Spirit',   emoji: '🐉', category: 'creature', rarity: 'epic',     description: 'Legendary and powerful!',     funFact: 'Dragons appear in myths from every continent.' },
  { id: 'creature-unicorn',  name: 'Unicorn Spirit',  emoji: '🦄', category: 'creature', rarity: 'legendary', description: 'Magical and rare!',          funFact: 'Scotland\'s national animal is the unicorn!' },
];

// ─── MUSICAL NOTES (from Music Pinch Beat + Bubble Pop Symphony) ────────

const NOTES: CollectibleItem[] = [
  { id: 'note-do',  name: 'Do',  emoji: '🎵', category: 'note', rarity: 'common',   description: 'The first note of the scale!',     funFact: '"Do" comes from "Dominus" meaning Lord in Latin.' },
  { id: 'note-re',  name: 'Re',  emoji: '🎵', category: 'note', rarity: 'common',   description: 'The second note!',                  funFact: '"Re" comes from "Resonare" meaning to resound.' },
  { id: 'note-mi',  name: 'Mi',  emoji: '🎵', category: 'note', rarity: 'common',   description: 'The third note!',                   funFact: '"Mi" comes from "Mira" meaning wonderful.' },
  { id: 'note-fa',  name: 'Fa',  emoji: '🎶', category: 'note', rarity: 'common',   description: 'The fourth note!',                  funFact: '"Fa" comes from "Famuli" meaning servants.' },
  { id: 'note-sol', name: 'Sol', emoji: '🎶', category: 'note', rarity: 'uncommon', description: 'Bright like the sun!',              funFact: '"Sol" means Sun — this note sounds bright and sunny.' },
  { id: 'note-la',  name: 'La',  emoji: '🎶', category: 'note', rarity: 'uncommon', description: 'The sixth note!',                   funFact: 'The note A (La) vibrates at exactly 440 Hz.' },
  { id: 'note-ti',  name: 'Ti',  emoji: '🎶', category: 'note', rarity: 'uncommon', description: 'Almost back to Do!',               funFact: '"Ti" creates tension that wants to resolve back to Do.' },
];

// ─── EMOTIONS (from Emoji Match) ────────────────────────────────────────

const EMOTIONS: CollectibleItem[] = [
  { id: 'emotion-happy',     name: 'Joy Crystal',       emoji: '😊', category: 'emotion', rarity: 'common',   description: 'Pure happiness!',                funFact: 'Smiling actually makes you feel happier — it\'s not just the other way around!' },
  { id: 'emotion-sad',       name: 'Tear Drop',         emoji: '😢', category: 'emotion', rarity: 'common',   description: 'It\'s okay to feel sad.',        funFact: 'Crying releases stress hormones and actually helps you feel better.' },
  { id: 'emotion-angry',     name: 'Fire Ember',        emoji: '😠', category: 'emotion', rarity: 'common',   description: 'Anger is natural — breathe!',    funFact: 'Taking 3 deep breaths can calm anger in just 90 seconds.' },
  { id: 'emotion-surprised', name: 'Spark of Wonder',   emoji: '😲', category: 'emotion', rarity: 'uncommon', description: 'Wow, that\'s amazing!',           funFact: 'Surprise is the shortest emotion — it lasts only a moment.' },
  { id: 'emotion-scared',    name: 'Courage Seed',      emoji: '😨', category: 'emotion', rarity: 'uncommon', description: 'Bravery grows from facing fear.',  funFact: 'Being brave doesn\'t mean not being scared — it means acting despite fear.' },
  { id: 'emotion-love',      name: 'Heart Gem',         emoji: '🥰', category: 'emotion', rarity: 'rare',     description: 'The warmest feeling of all!',     funFact: 'Hugging someone for 20 seconds releases oxytocin, the "love hormone."' },
  { id: 'emotion-calm',      name: 'Peace Crystal',     emoji: '😌', category: 'emotion', rarity: 'rare',     description: 'Still and serene.',               funFact: 'Just 5 minutes of deep breathing can lower your heart rate.' },
];

// ─── MATERIALS (crafted/discovered via recipes) ─────────────────────────

const MATERIALS: CollectibleItem[] = [
  { id: 'material-water',    name: 'Water',       emoji: '💧', category: 'material', rarity: 'uncommon', description: 'The molecule of life!',           funFact: 'Water is the only substance that naturally exists in all 3 states: solid, liquid, gas.' },
  { id: 'material-salt',     name: 'Salt',        emoji: '🧂', category: 'material', rarity: 'uncommon', description: 'NaCl — sodium + chlorine!',       funFact: 'The word "salary" comes from the Latin word for salt — Roman soldiers were paid in salt!' },
  { id: 'material-rust',     name: 'Rust',        emoji: '🟤', category: 'material', rarity: 'uncommon', description: 'Iron + oxygen over time.',         funFact: 'Mars is red because its surface is covered in rust (iron oxide)!' },
  { id: 'material-co2',      name: 'Carbon Dioxide', emoji: '🫧', category: 'material', rarity: 'uncommon', description: 'What you breathe out!',       funFact: 'Plants breathe in CO₂ and breathe out oxygen — the opposite of us!' },
  { id: 'material-air',      name: 'Air',         emoji: '🌬️', category: 'material', rarity: 'common',   description: 'A mixture of gases!',             funFact: 'Air is about 78% nitrogen and 21% oxygen.' },
  { id: 'material-seed',     name: 'Magic Seed',  emoji: '🌱', category: 'material', rarity: 'uncommon', description: 'Plant it and watch it grow!',      funFact: 'The biggest tree in the world started from a tiny seed.' },
  { id: 'material-sunshine', name: 'Bottled Sunshine', emoji: '☀️', category: 'material', rarity: 'rare', description: 'Captured sunlight!',             funFact: 'Sunlight takes 8 minutes and 20 seconds to reach Earth.' },
  { id: 'material-flower',   name: 'Magic Flower', emoji: '🌸', category: 'material', rarity: 'rare',    description: 'Grown from seed + water + sun!',  funFact: 'The largest flower in the world is 3 feet wide and smells like rotting meat!' },
  { id: 'material-mud',      name: 'Mud',         emoji: '🟫', category: 'material', rarity: 'common',   description: 'Earth + water = mud!',            funFact: 'Some animals take mud baths to protect their skin from the sun.' },
  { id: 'material-steam',    name: 'Steam',       emoji: '♨️', category: 'material', rarity: 'uncommon', description: 'Hot water becomes steam!',         funFact: 'Steam engines powered the Industrial Revolution!' },
  { id: 'material-ice',      name: 'Ice',         emoji: '🧊', category: 'material', rarity: 'uncommon', description: 'Frozen water!',                   funFact: 'Ice is less dense than water — that\'s why it floats!' },
  { id: 'material-lava',     name: 'Lava',        emoji: '🌋', category: 'material', rarity: 'epic',     description: 'Molten rock from deep underground!', funFact: 'Lava can reach temperatures of 1,200°C (2,200°F)!' },
  { id: 'material-crystal',  name: 'Crystal',     emoji: '🔮', category: 'material', rarity: 'epic',     description: 'Formed under extreme pressure!',  funFact: 'Crystals grow atom by atom over thousands of years.' },
];

// ─── TOOLS (rare drops + achievements) ──────────────────────────────────

const TOOLS: CollectibleItem[] = [
  { id: 'tool-paintbrush',   name: 'Golden Paintbrush',   emoji: '🖌️', category: 'tool', rarity: 'rare',      description: 'Creates golden brush strokes!',      funFact: 'The most expensive paintbrush is made from the hair of a Kolinsky sable.' },
  { id: 'tool-magnifier',    name: 'Magic Magnifier',     emoji: '🔍', category: 'tool', rarity: 'rare',      description: 'Reveals hidden things!',              funFact: 'A magnifying glass can start a fire by focusing sunlight.' },
  { id: 'tool-telescope',    name: 'Star Telescope',      emoji: '🔭', category: 'tool', rarity: 'epic',      description: 'See the stars up close!',             funFact: 'The Hubble Space Telescope orbits Earth every 97 minutes.' },
  { id: 'tool-microscope',   name: 'Micro Scope',         emoji: '🔬', category: 'tool', rarity: 'epic',      description: 'See the invisible world!',            funFact: 'The first microscope was invented in 1590 by Hans Lippershey.' },
  { id: 'tool-wand',         name: 'Pip\'s Wand',         emoji: '🪄', category: 'tool', rarity: 'legendary', description: 'Pip\'s personal magic wand!',         funFact: 'Wave it to unlock special celebrations.' },
];

// ─── ARTIFACTS (major milestones + legendary finds) ─────────────────────

const ARTIFACTS: CollectibleItem[] = [
  { id: 'artifact-first-word',   name: 'First Word Scroll',   emoji: '📜', category: 'artifact', rarity: 'rare',      description: 'Your very first spelled word!',    funFact: 'The first word most children learn to write is their own name.' },
  { id: 'artifact-periodic-key', name: 'Periodic Key',        emoji: '🗝️', category: 'artifact', rarity: 'epic',      description: 'Unlocks the periodic table!',      funFact: 'There are 118 known elements in the periodic table.' },
  { id: 'artifact-melody',       name: 'First Melody',        emoji: '🎼', category: 'artifact', rarity: 'rare',      description: 'Your first complete melody!',      funFact: '"Twinkle Twinkle Little Star" uses the same melody as the ABC song!' },
  { id: 'artifact-constellation', name: 'Star Map',           emoji: '🗺️', category: 'artifact', rarity: 'epic',      description: 'A map of the constellations!',     funFact: 'There are 88 officially recognized constellations.' },
  { id: 'artifact-philosophers-stone', name: 'Philosopher\'s Stone', emoji: '💠', category: 'artifact', rarity: 'legendary', description: 'The ultimate discovery — master of all elements!', funFact: 'Alchemists spent centuries searching for this mythical stone.' },
  { id: 'artifact-rainbow-heart', name: 'Rainbow Heart',     emoji: '🫶', category: 'artifact', rarity: 'legendary', description: 'All emotions understood and embraced.', funFact: 'Emotional intelligence is one of the strongest predictors of success in life.' },
];

// ─── FOOD (from crafting, future cooking games) ─────────────────────────

const FOOD: CollectibleItem[] = [
  { id: 'food-cookie',    name: 'Cookie',       emoji: '🍪', category: 'food', rarity: 'common',   description: 'A yummy treat!',                funFact: 'The chocolate chip cookie was invented by accident in 1938.' },
  { id: 'food-apple',     name: 'Apple',        emoji: '🍎', category: 'food', rarity: 'common',   description: 'Crunchy and healthy!',           funFact: 'There are over 7,500 varieties of apples in the world.' },
  { id: 'food-pizza',     name: 'Pizza Slice',  emoji: '🍕', category: 'food', rarity: 'uncommon', description: 'Everyone\'s favorite!',          funFact: 'The first pizza was made in Naples, Italy in 1889.' },
  { id: 'food-icecream',  name: 'Ice Cream',    emoji: '🍦', category: 'food', rarity: 'uncommon', description: 'Cold and sweet!',                funFact: 'It takes about 50 licks to finish a single scoop of ice cream.' },
  { id: 'food-cake',      name: 'Magic Cake',   emoji: '🎂', category: 'food', rarity: 'rare',     description: 'A celebration cake!',            funFact: 'The tradition of birthday cakes started in ancient Greece.' },
];

// Legacy IDs still referenced in game drop tables.
const LEGACY_COMPAT_ITEMS: CollectibleItem[] = [
  { id: 'music-note',        name: 'Music Note',         emoji: '🎵', category: 'note',     rarity: 'common',   description: 'A classic melody note.' },
  { id: 'star-gold',         name: 'Gold Star',          emoji: '⭐', category: 'shape',    rarity: 'rare',     description: 'A shiny gold achievement star.' },
  { id: 'star-silver',       name: 'Silver Star',        emoji: '⭐', category: 'shape',    rarity: 'uncommon', description: 'A bright silver achievement star.' },
  { id: 'star-bronze',       name: 'Bronze Star',        emoji: '⭐', category: 'shape',    rarity: 'common',   description: 'A bronze achievement star.' },
  { id: 'fruit-apple',       name: 'Apple',              emoji: '🍎', category: 'food',     rarity: 'common',   description: 'A crunchy apple snack.' },
  { id: 'tool-knife',        name: 'Safe Prep Knife',    emoji: '🔪', category: 'tool',     rarity: 'uncommon', description: 'A pretend kitchen tool for learning games.' },
  { id: 'number-one',        name: 'Number One',         emoji: '1️⃣', category: 'number',   rarity: 'common',   description: 'The number one token.' },
  { id: 'math-plus',         name: 'Plus Sign',          emoji: '➕', category: 'number',   rarity: 'common',   description: 'A math plus operator token.' },
  { id: 'trophy-bronze',     name: 'Bronze Trophy',      emoji: '🏆', category: 'artifact', rarity: 'uncommon', description: 'A trophy for steady progress.' },
  { id: 'letter-a',          name: 'Letter A',           emoji: '🅰️', category: 'letter',   rarity: 'common',   description: 'The letter A collectible.' },
  { id: 'book-blue',         name: 'Blue Book',          emoji: '📘', category: 'artifact', rarity: 'common',   description: 'A blue learning book collectible.' },
  { id: 'material-balloon',  name: 'Balloon',            emoji: '🎈', category: 'material', rarity: 'common',   description: 'A colorful balloon material.' },
  { id: 'material-confetti', name: 'Confetti',           emoji: '🎊', category: 'material', rarity: 'uncommon', description: 'A burst of celebration confetti.' },
];

// ─── MASTER CATALOG ─────────────────────────────────────────────────────

export const ALL_ITEMS: CollectibleItem[] = [
  ...ELEMENTS,
  ...COLORS,
  ...SHAPES,
  ...CREATURES,
  ...NOTES,
  ...EMOTIONS,
  ...MATERIALS,
  ...TOOLS,
  ...ARTIFACTS,
  ...FOOD,
  ...LEGACY_COMPAT_ITEMS,
].map((item) => ({
  ...item,
  icon: getItemIconPath(item.id, item.icon),
  visualTier: item.visualTier ?? getVisualTierFromRarity(item.rarity),
}));

export const ITEMS_BY_ID: Record<string, CollectibleItem> = Object.fromEntries(
  ALL_ITEMS.map((item) => [item.id, item])
);

export function getItem(id: string): CollectibleItem | undefined {
  return ITEMS_BY_ID[id];
}

export function getItemsByCategory(category: ItemCategory): CollectibleItem[] {
  return ALL_ITEMS.filter((item) => item.category === category);
}

export function getItemsByRarity(rarity: Rarity): CollectibleItem[] {
  return ALL_ITEMS.filter((item) => item.rarity === rarity);
}

// ─── DROP SYSTEM ────────────────────────────────────────────────────────

export interface DropEntry {
  itemId: string;
  chance: number; // 0-1 probability per completion
  minScore?: number; // minimum score/accuracy needed
}

export interface DeterministicDropInput {
  gameId: string;
  completionCount: number;
  score?: number;
}

export interface RewardModelConfig {
  deterministicCore: boolean;
  enableOlderBonus: boolean;
  olderBonusMinAge: number;
  olderBonusChance: number;
}

export const REWARD_MODEL_CONFIG: RewardModelConfig = {
  deterministicCore: true,
  enableOlderBonus: false, // default OFF until explicitly enabled
  olderBonusMinAge: 6,
  olderBonusChance: 0.1,
};

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function deterministicIndex(seed: string, modulo: number): number {
  if (modulo <= 0) return 0;
  return hashSeed(seed) % modulo;
}

function normalizeWeight(chance: number): number {
  if (!Number.isFinite(chance)) return 1;
  return Math.max(chance, 0.0001);
}

function weightedDeterministicPick(table: DropEntry[], seed: string): string | null {
  if (table.length === 0) return null;
  const totalWeight = table.reduce((sum, entry) => sum + normalizeWeight(entry.chance), 0);
  if (totalWeight <= 0) return table[deterministicIndex(seed, table.length)]?.itemId ?? null;

  const target = (hashSeed(seed) / 0xffffffff) * totalWeight;
  let cursor = 0;
  for (const entry of table) {
    cursor += normalizeWeight(entry.chance);
    if (target <= cursor) return entry.itemId;
  }
  return table[table.length - 1]?.itemId ?? null;
}

function withOptionalScoreGate(table: DropEntry[], score?: number): DropEntry[] {
  if (score === undefined) return table;
  return table.filter((entry) => entry.minScore === undefined || score >= entry.minScore);
}

/**
 * Roll drops from a drop table.
 * Pass the table directly (from gameRegistry.getDropTable).
 */
export function rollDropsFromTable(table: DropEntry[], score?: number): string[] {
  if (!table || table.length === 0) return [];

  const drops: string[] = [];
  for (const entry of table) {
    if (entry.minScore && score !== undefined && score < entry.minScore) continue;
    if (Math.random() < entry.chance) {
      drops.push(entry.itemId);
    }
  }
  return drops;
}

/**
 * Deterministic core reward selector.
 * Guarantees one item when the table has entries by using a stable seeded pick.
 * Core reward intentionally ignores minScore to avoid silent no-reward outcomes.
 */
export function getDeterministicCoreDrop(table: DropEntry[], input: DeterministicDropInput): string | null {
  if (!table || table.length === 0) return null;
  const seed = `core:${input.gameId}:${input.completionCount}`;
  return weightedDeterministicPick(table, seed);
}

/**
 * Optional additive bonus reward for older kids.
 * This never replaces the core reward.
 */
export function maybeGetDeterministicBonusDrop(
  table: DropEntry[],
  input: DeterministicDropInput,
  profileAge?: number,
  enableOlderBonus?: boolean
): string | null {
  const bonusEnabled = enableOlderBonus ?? REWARD_MODEL_CONFIG.enableOlderBonus;
  if (!bonusEnabled) return null;
  if (profileAge === undefined || profileAge < REWARD_MODEL_CONFIG.olderBonusMinAge) return null;
  if (!table || table.length === 0) return null;

  const eligible = withOptionalScoreGate(table, input.score);
  if (eligible.length === 0) return null;

  const triggerSeed = `bonus-trigger:${input.gameId}:${input.completionCount}`;
  const trigger = hashSeed(triggerSeed) / 0xffffffff;
  if (trigger >= REWARD_MODEL_CONFIG.olderBonusChance) return null;

  const pickSeed = `bonus-pick:${input.gameId}:${input.completionCount}`;
  return weightedDeterministicPick(eligible, pickSeed);
}
