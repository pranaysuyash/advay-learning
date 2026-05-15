/**
 * Feed the Monster 3D Game Logic
 *
 * Feed a hungry 3D monster with physics objects.
 * Educational value: Physics interaction, cause/effect, counting
 *
 * @ticket TCK-20250411-001
 */

// Game configuration
export const FEED_MONSTER_3D_CONFIG = {
  // Food settings
  FOOD_TYPES: [
    { id: 'apple', name: 'Apple', color: '#ef4444', points: 10 },
    { id: 'banana', name: 'Banana', color: '#eab308', points: 10 },
    { id: 'burger', name: 'Burger', color: '#f97316', points: 20 },
    { id: 'pizza', name: 'Pizza', color: '#fbbf24', points: 15 },
    { id: 'carrot', name: 'Carrot', color: '#f97316', points: 10 },
    { id: 'donut', name: 'Donut', color: '#ec4899', points: 15 },
  ] as const,

  // Monster settings
  MONSTER_HUNGER_MAX: 100,
  MONSTER_HUNGER_RATE: 2, // per second
  FEED_VALUE: 15,

  // Physics
  GRAVITY: -9.8,
  THROW_FORCE: 8,
  FOOD_SIZE: 0.3,

  // Scoring
  POINTS_PER_FEED: 10,
  VARIETY_BONUS: 5,
  PERFECT_FEED_BONUS: 5,

  // Game settings
  TARGET_FEEDS: 15,
  GAME_DURATION: 90,
} as const;

// Types
export type FoodType = typeof FEED_MONSTER_3D_CONFIG.FOOD_TYPES[number];

export interface FoodItem3D {
  id: string;
  type: FoodType;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  eaten: boolean;
}

export interface MonsterState {
  happiness: number;
  hunger: number;
  state: 'idle' | 'happy' | 'eating' | 'sad' | 'full';
  animationTime: number;
}

export interface GameState {
  foods: FoodItem3D[];
  monster: MonsterState;
  score: number;
  feeds: number;
  uniqueFoods: Set<string>;
  selectedFood: FoodType | null;
  isPlaying: boolean;
  gameOver: boolean;
  gameWon: boolean;
  feedback: string;
}

export interface FeedResult {
  success: boolean;
  fed: boolean;
  points: number;
  happinessChange: number;
}

// Generate unique ID
function generateId(): string {
  return `ftm3d-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create food item
export function createFoodItem(type: FoodType): FoodItem3D {
  return {
    id: generateId(),
    type,
    position: {
      x: (Math.random() - 0.5) * 2,
      y: 2,
      z: -3,
    },
    velocity: {
      x: (Math.random() - 0.5) * 3,
      y: FEED_MONSTER_3D_CONFIG.THROW_FORCE,
      z: 2 + Math.random() * 2,
    },
    rotation: {
      x: Math.random() * Math.PI,
      y: Math.random() * Math.PI,
      z: 0,
    },
    eaten: false,
  };
}

// Initialize game
export function initializeGame(): GameState {
  return {
    foods: [],
    monster: {
      happiness: 50,
      hunger: 100,
      state: 'idle',
      animationTime: 0,
    },
    score: 0,
    feeds: 0,
    uniqueFoods: new Set(),
    selectedFood: null,
    isPlaying: false,
    gameOver: false,
    gameWon: false,
    feedback: 'Feed the monster!',
  };
}

// Start game
export function startGame(_state: GameState): GameState {
  return {
    ...initializeGame(),
    isPlaying: true,
    feedback: 'Select food and throw!',
  };
}

// Select food type
export function selectFood(state: GameState, food: FoodType): GameState {
  return {
    ...state,
    selectedFood: food,
    feedback: `Throw the ${food.name}!`,
  };
}

// Throw selected food
export function throwFood(state: GameState): { state: GameState; food: FoodItem3D | null } {
  if (!state.selectedFood) {
    return { state, food: null };
  }

  const food = createFoodItem(state.selectedFood);
  return {
    state: {
      ...state,
      foods: [...state.foods, food],
      selectedFood: null,
    },
    food,
  };
}

// Update physics
export function updatePhysics(state: GameState, deltaTime: number): GameState {
  if (!state.isPlaying) return state;

  const dt = deltaTime / 1000;

  // Update foods
  const updatedFoods: FoodItem3D[] = [];
  let eatenCount = 0;

  for (const food of state.foods) {
    if (food.eaten) {
      eatenCount++;
      continue;
    }

    // Apply gravity
    const newY = food.position.y + food.velocity.y * dt;
    const newVelocityY = food.velocity.y + FEED_MONSTER_3D_CONFIG.GRAVITY * dt;

    // Check collision with monster (simple distance check)
    const distanceToMonster = Math.sqrt(
      food.position.x * food.position.x +
      newY * newY +
      food.position.z * food.position.z
    );

    if (distanceToMonster < 1.5 && newY > 0 && newY < 2) {
      // Eaten!
      eatenCount++;
      continue;
    }

    // Remove if fell too far
    if (newY < -3) {
      continue;
    }

    updatedFoods.push({
      ...food,
      position: {
        x: food.position.x + food.velocity.x * dt,
        y: newY,
        z: food.position.z + food.velocity.z * dt,
      },
      velocity: {
        ...food.velocity,
        y: newVelocityY,
      },
      rotation: {
        x: food.rotation.x + 0.05,
        y: food.rotation.y + 0.03,
        z: food.rotation.z,
      },
    });
  }

  // Update monster hunger
  const newHunger = Math.max(0, state.monster.hunger - FEED_MONSTER_3D_CONFIG.MONSTER_HUNGER_RATE * dt);
  let monsterState = state.monster.state;

  if (newHunger > 70) {
    monsterState = 'idle';
  } else if (newHunger > 30) {
    monsterState = 'sad';
  } else {
    monsterState = 'sad';
  }

  const gameOver = newHunger <= 0;

  return {
    ...state,
    foods: updatedFoods,
    monster: {
      ...state.monster,
      hunger: newHunger,
      state: monsterState,
    },
    gameOver,
    isPlaying: !gameOver,
  };
}

// Process food eaten
export function processFoodEaten(
  state: GameState,
  food: FoodItem3D,
): GameState {
  const basePoints = food.type.points;
  const varietyBonus = state.uniqueFoods.has(food.type.id) ? 0 : FEED_MONSTER_3D_CONFIG.VARIETY_BONUS;
  const points = basePoints + varietyBonus;

  const newUniqueFoods = new Set(state.uniqueFoods);
  newUniqueFoods.add(food.type.id);

  const newHappiness = Math.min(100, state.monster.happiness + 5 + varietyBonus);
  const newHunger = Math.min(100, state.monster.hunger + FEED_MONSTER_3D_CONFIG.FEED_VALUE);

  const newFeeds = state.feeds + 1;
  const gameWon = newFeeds >= FEED_MONSTER_3D_CONFIG.TARGET_FEEDS;

  return {
    ...state,
    score: state.score + points,
    feeds: newFeeds,
    uniqueFoods: newUniqueFoods,
    monster: {
      ...state.monster,
      happiness: newHappiness,
      hunger: newHunger,
      state: 'eating',
    },
    isPlaying: !gameWon,
    gameWon,
    feedback: gameWon ? 'Monster is full! You win!' : `Yum! +${points} points`,
  };
}

// Get monster reaction
export function getMonsterReaction(happiness: number): string {
  if (happiness >= 80) return '😋';
  if (happiness >= 60) return '😊';
  if (happiness >= 40) return '😐';
  if (happiness >= 20) return '😟';
  return '😢';
}

// Get progress
export function getProgress(state: GameState): number {
  return (state.feeds / FEED_MONSTER_3D_CONFIG.TARGET_FEEDS) * 100;
}
