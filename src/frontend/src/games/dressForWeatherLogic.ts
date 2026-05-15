/**
 * Dress For Weather Game Logic
 *
 * Drag and drop clothing items onto a character based on weather conditions.
 * Teaches weather awareness and appropriate clothing choices.
 *
 * Educational Focus:
 * - Weather awareness (sunny, rainy, snowy, windy)
 * - Appropriate clothing choices
 * - Cause and effect understanding
 * - Fine motor skills (drag and drop)
 *
 * Age Range: 2-4 years (toddlers)
 *
 * @ticket GQ-002, GQ-003, GQ-004
 */

// ===== TYPES =====

export type WeatherType = 'sunny' | 'rainy' | 'snowy' | 'windy';

export interface ClothingItem {
  id: string;
  name: string;
  emoji: string;
  weathers: WeatherType[];
  color: string;
}

export interface Level {
  id: string;
  weather: WeatherType;
  name: string;
  backgroundColor: string;
  weatherIcon: string;
  description: string;
  requiredItems: string[];
  targetScore: number;
}

export interface GameState {
  status: 'menu' | 'playing' | 'success' | 'levelComplete' | 'gameComplete';
  currentLevel: number;
  score: number;
  streak: number;
  correctlyPlaced: Set<string>;
  draggedItem: string | null;
}

export interface DropZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  accepts: string[];
}

// ===== GAME DATA =====

export const CLOTHING_ITEMS: ClothingItem[] = [
  {
    id: 'sunglasses',
    name: 'Sunglasses',
    emoji: '🕶️',
    weathers: ['sunny'],
    color: '#FFE082',
  },
  {
    id: 't-shirt',
    name: 'T-Shirt',
    emoji: '👕',
    weathers: ['sunny', 'windy'],
    color: '#81D4FA',
  },
  {
    id: 'shorts',
    name: 'Shorts',
    emoji: '🩳',
    weathers: ['sunny'],
    color: '#FFB74D',
  },
  {
    id: 'sandals',
    name: 'Sandals',
    emoji: '🩴',
    weathers: ['sunny'],
    color: '#FFAB91',
  },
  {
    id: 'raincoat',
    name: 'Raincoat',
    emoji: '🧥',
    weathers: ['rainy'],
    color: '#FFF59D',
  },
  {
    id: 'umbrella',
    name: 'Umbrella',
    emoji: '☂️',
    weathers: ['rainy'],
    color: '#FF6B6B',
  },
  {
    id: 'rain-boots',
    name: 'Rain Boots',
    emoji: '👢',
    weathers: ['rainy', 'snowy'],
    color: '#A1887F',
  },
  {
    id: 'winter-coat',
    name: 'Winter Coat',
    emoji: '🧥',
    weathers: ['snowy', 'windy'],
    color: '#E3F2FD',
  },
  {
    id: 'scarf',
    name: 'Scarf',
    emoji: '🧣',
    weathers: ['snowy', 'windy'],
    color: '#FFCCBC',
  },
  {
    id: 'mittens',
    name: 'Mittens',
    emoji: '🧤',
    weathers: ['snowy'],
    color: '#F8BBD0',
  },
  {
    id: 'winter-hat',
    name: 'Winter Hat',
    emoji: '🎩',
    weathers: ['snowy', 'windy'],
    color: '#B39DDB',
  },
  {
    id: 'cap',
    name: 'Cap',
    emoji: '🧢',
    weathers: ['sunny', 'windy'],
    color: '#C5E1A5',
  },
];

export const LEVELS: Level[] = [
  {
    id: 'sunny',
    weather: 'sunny',
    name: 'Sunny Day',
    backgroundColor: 'linear-gradient(135deg, #FFF9C4 0%, #FFE082 100%)',
    weatherIcon: '☀️',
    description: 'It\'s hot and sunny! Wear light clothes.',
    requiredItems: ['sunglasses', 't-shirt', 'shorts'],
    targetScore: 30,
  },
  {
    id: 'rainy',
    weather: 'rainy',
    name: 'Rainy Day',
    backgroundColor: 'linear-gradient(135deg, #B3E5FC 0%, #81D4FA 100%)',
    weatherIcon: '🌧️',
    description: 'It\'s raining! Stay dry with rain gear.',
    requiredItems: ['raincoat', 'umbrella', 'rain-boots'],
    targetScore: 30,
  },
  {
    id: 'snowy',
    weather: 'snowy',
    name: 'Snowy Day',
    backgroundColor: 'linear-gradient(135deg, #E1F5FE 0%, #B3E5FC 100%)',
    weatherIcon: '❄️',
    description: 'It\'s cold and snowy! Wear warm clothes.',
    requiredItems: ['winter-coat', 'scarf', 'mittens'],
    targetScore: 30,
  },
  {
    id: 'windy',
    weather: 'windy',
    name: 'Windy Day',
    backgroundColor: 'linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%)',
    weatherIcon: '💨',
    description: 'It\'s windy! Hold on to your hat!',
    requiredItems: ['cap', 't-shirt', 'scarf'],
    targetScore: 30,
  },
];

// ===== GAME CONFIGURATION =====

export const GAME_CONFIG = {
  ITEM_SIZE: 80,
  DROP_ZONE_SIZE: 250,
  MAGNETIC_THRESHOLD: 120,
  HITBOX_MULTIPLIER: 2.0,
  POINTS_PER_ITEM: 10,
  STREAK_BONUS: 2,
  MAX_STREAK_BONUS: 15,
  REQUIRED_ITEMS_PER_LEVEL: 3,
} as const;

// ===== GAME STATE MANAGEMENT =====

/**
 * Initialize a new game state.
 */
export function initializeGame(): GameState {
  return {
    status: 'menu',
    currentLevel: 0,
    score: 0,
    streak: 0,
    correctlyPlaced: new Set(),
    draggedItem: null,
  };
}

/**
 * Start the game from the menu.
 */
export function startGame(state: GameState): GameState {
  return {
    ...state,
    status: 'playing',
    currentLevel: 0,
    score: 0,
    streak: 0,
    correctlyPlaced: new Set(),
  };
}

/**
 * Get clothing items for the current level.
 * Returns a mix of correct and incorrect items.
 */
export function getItemsForLevel(levelIndex: number): ClothingItem[] {
  const level = LEVELS[levelIndex];
  if (!level) return [];

  // Get correct items for this weather
  const correctItems = CLOTHING_ITEMS.filter(item =>
    item.weathers.includes(level.weather)
  );

  // Get wrong items (items not suitable for this weather)
  const wrongItems = CLOTHING_ITEMS.filter(item =>
    !item.weathers.includes(level.weather)
  );

  // Mix correct and wrong items (4 correct + 2 wrong)
  const items = [
    ...correctItems.slice(0, 4),
    ...wrongItems.slice(0, 2),
  ];

  // Shuffle items
  return items.sort(() => Math.random() - 0.5);
}

/**
 * Check if an item is appropriate for the current level's weather.
 */
export function isCorrectItem(itemId: string, levelIndex: number): boolean {
  const level = LEVELS[levelIndex];
  if (!level) return false;

  const item = CLOTHING_ITEMS.find(i => i.id === itemId);
  if (!item) return false;

  return item.weathers.includes(level.weather);
}

/**
 * Handle an item being dropped on the character.
 * Returns the updated state and whether the drop was successful.
 */
export function handleItemDrop(
  state: GameState,
  itemId: string,
): { state: GameState; success: boolean; points: number } {
  const isCorrect = isCorrectItem(itemId, state.currentLevel);

  if (isCorrect && !state.correctlyPlaced.has(itemId)) {
    // Correct item placed
    const newStreak = state.streak + 1;
    const streakBonus = Math.min(newStreak * GAME_CONFIG.STREAK_BONUS, GAME_CONFIG.MAX_STREAK_BONUS);
    const points = GAME_CONFIG.POINTS_PER_ITEM + streakBonus;

    const newState: GameState = {
      ...state,
      score: state.score + points,
      streak: newStreak,
      correctlyPlaced: new Set(Array.from(state.correctlyPlaced).concat(itemId)),
      draggedItem: null,
    };

    return { state: newState, success: true, points };
  } else {
    // Wrong item - reset streak
    return {
      state: { ...state, streak: 0, draggedItem: null },
      success: false,
      points: 0,
    };
  }
}

/**
 * Check if the current level is complete.
 */
export function isLevelComplete(state: GameState): boolean {
  const level = LEVELS[state.currentLevel];
  if (!level) return false;

  // Level is complete when 3 correct items are placed
  return state.correctlyPlaced.size >= GAME_CONFIG.REQUIRED_ITEMS_PER_LEVEL;
}

/**
 * Advance to the next level.
 */
export function advanceLevel(state: GameState): GameState {
  if (state.currentLevel >= LEVELS.length - 1) {
    // Game complete
    return {
      ...state,
      status: 'gameComplete',
    };
  }

  return {
    ...state,
    status: 'levelComplete',
    currentLevel: state.currentLevel + 1,
    correctlyPlaced: new Set(),
  };
}

/**
 * Continue to the next level after level complete screen.
 */
export function continueToNextLevel(state: GameState): GameState {
  return {
    ...state,
    status: 'playing',
  };
}

/**
 * Reset the current level (if player wants to retry).
 */
export function resetLevel(state: GameState): GameState {
  return {
    ...state,
    correctlyPlaced: new Set(),
    streak: 0,
  };
}

/**
 * Start dragging an item.
 */
export function startDragging(state: GameState, itemId: string): GameState {
  return {
    ...state,
    draggedItem: itemId,
  };
}

/**
 * Stop dragging (when item is released without dropping on target).
 */
export function stopDragging(state: GameState): GameState {
  return {
    ...state,
    draggedItem: null,
  };
}

// ===== UTILITY FUNCTIONS =====

/**
 * Get the current level configuration.
 */
export function getCurrentLevel(state: GameState): Level | null {
  return LEVELS[state.currentLevel] || null;
}

/**
 * Get progress text for the current level.
 */
export function getProgressText(state: GameState): string {
  const placed = state.correctlyPlaced.size;
  const required = GAME_CONFIG.REQUIRED_ITEMS_PER_LEVEL;
  return `${placed} of ${required} items`;
}

/**
 * Calculate final game statistics.
 */
export function calculateFinalStats(state: GameState) {
  return {
    totalScore: state.score,
    levelsCompleted: state.currentLevel + 1,
    maxStreak: state.streak,
  };
}

/**
 * Get voice instruction text for the current level.
 */
export function getLevelVoiceInstruction(levelIndex: number): string {
  const level = LEVELS[levelIndex];
  if (!level) return '';

  return `It's a ${level.name}! ${level.description}`;
}

/**
 * Get feedback text for correct item placement.
 */
export function getCorrectFeedback(itemName: string, weatherName: string): string {
  const feedbacks = [
    `Great choice! ${itemName} is perfect for ${weatherName}!`,
    `Excellent! ${itemName} will keep you comfortable!`,
    `Smart thinking! ${itemName} is just right!`,
    `Perfect! ${itemName} is great for ${weatherName}!`,
  ];
  return feedbacks[Math.floor(Math.random() * feedbacks.length)];
}

/**
 * Get feedback text for incorrect item placement.
 */
export function getIncorrectFeedback(itemName: string, weatherName: string): string {
  const feedbacks = [
    `Hmm, ${itemName} isn't quite right for ${weatherName}. Try another!`,
    `That might not work well in ${weatherName}. Pick something else!`,
    `Think about what you'd wear in ${weatherName}. Try again!`,
    `${itemName} might not be the best choice. What else could work?`,
  ];
  return feedbacks[Math.floor(Math.random() * feedbacks.length)];
}

/**
 * Check if a point is within the drop zone.
 */
export function isInDropZone(
  pointX: number,
  pointY: number,
  zoneX: number,
  zoneY: number,
  zoneSize: number,
): boolean {
  const halfSize = zoneSize / 2;
  return (
    pointX >= zoneX - halfSize &&
    pointX <= zoneX + halfSize &&
    pointY >= zoneY - halfSize &&
    pointY <= zoneY + halfSize
  );
}

/**
 * Calculate magnetic snap position for an item near the drop zone.
 */
export function calculateMagneticSnap(
  itemX: number,
  itemY: number,
  zoneX: number,
  zoneY: number,
  threshold: number,
): { x: number; y: number; shouldSnap: boolean } {
  const dx = zoneX - itemX;
  const dy = zoneY - itemY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < threshold) {
    return { x: zoneX, y: zoneY, shouldSnap: true };
  }

  return { x: itemX, y: itemY, shouldSnap: false };
}
