/**
 * Story Sequence Game Logic
 * 
 * Educational sequencing game where children arrange picture cards
 * in the correct temporal order to complete a story.
 * 
 * Targets: Logic, reasoning, temporal understanding, narrative comprehension
 * Age: 4-6 years
 */

import type { Point } from '../types/tracking';

export type SequenceTheme = 
  | 'lifeCycle' 
  | 'dailyRoutine' 
  | 'cooking' 
  | 'growth' 
  | 'weather' 
  | 'building'
  | 'transformation';

export interface SequenceCard {
  id: string;
  image: string;
  description: string;
  correctPosition: number;
  emoji: string;
}

export interface SequenceStory {
  id: string;
  theme: SequenceTheme;
  difficulty: 1 | 2 | 3;  // 3, 4, or 5 cards
  title: string;
  description: string;
  cards: SequenceCard[];
  narration: string;  // TTS narration for intro
}

export interface DragState {
  isDragging: boolean;
  cardId: string | null;
  position: Point;
  sourceIndex: number | null;  // null = from pool, number = from slot
}

export interface GameState {
  currentStory: SequenceStory | null;
  slots: (SequenceCard | null)[];
  pool: SequenceCard[];
  completed: boolean;
  attempts: number;
  hintsUsed: number;
}

// Story database
export const STORY_SEQUENCES: SequenceStory[] = [
  {
    id: 'chicken-life',
    theme: 'lifeCycle',
    difficulty: 1,
    title: 'From Egg to Chicken',
    description: 'Watch how a baby chicken grows!',
    narration: 'Let\'s learn how a chicken grows from an egg!',
    cards: [
      { 
        id: 'egg', 
        image: 'egg', 
        description: 'an egg', 
        correctPosition: 0,
        emoji: '🥚'
      },
      { 
        id: 'hatching', 
        image: 'hatching', 
        description: 'a chick hatching', 
        correctPosition: 1,
        emoji: '🐣'
      },
      { 
        id: 'chick', 
        image: 'chick', 
        description: 'a baby chick', 
        correctPosition: 2,
        emoji: '🐤'
      },
      { 
        id: 'chicken', 
        image: 'chicken', 
        description: 'a grown chicken', 
        correctPosition: 3,
        emoji: '🐔'
      },
    ]
  },
  {
    id: 'plant-growth',
    theme: 'growth',
    difficulty: 1,
    title: 'A Seed Grows',
    description: 'See how a tiny seed becomes a flower!',
    narration: 'Let\'s watch a seed grow into a beautiful flower!',
    cards: [
      { 
        id: 'seed', 
        image: 'seed', 
        description: 'a seed in the ground', 
        correctPosition: 0,
        emoji: '🌱'
      },
      { 
        id: 'sprout', 
        image: 'sprout', 
        description: 'a little sprout', 
        correctPosition: 1,
        emoji: '🌿'
      },
      { 
        id: 'plant', 
        image: 'plant', 
        description: 'a growing plant', 
        correctPosition: 2,
        emoji: '🪴'
      },
      { 
        id: 'flower', 
        image: 'flower', 
        description: 'a beautiful flower', 
        correctPosition: 3,
        emoji: '🌻'
      },
    ]
  },
  {
    id: 'morning-routine',
    theme: 'dailyRoutine',
    difficulty: 2,
    title: 'Getting Ready for School',
    description: 'What do you do in the morning?',
    narration: 'Let\'s put the morning routine in order!',
    cards: [
      { 
        id: 'wake', 
        image: 'wake', 
        description: 'waking up', 
        correctPosition: 0,
        emoji: '🛏️'
      },
      { 
        id: 'brush', 
        image: 'brush', 
        description: 'brushing teeth', 
        correctPosition: 1,
        emoji: '🪥'
      },
      { 
        id: 'breakfast', 
        image: 'breakfast', 
        description: 'eating breakfast', 
        correctPosition: 2,
        emoji: '🥣'
      },
      { 
        id: 'backpack', 
        image: 'backpack', 
        description: 'packing the backpack', 
        correctPosition: 3,
        emoji: '🎒'
      },
      { 
        id: 'school', 
        image: 'school', 
        description: 'going to school', 
        correctPosition: 4,
        emoji: '🏫'
      },
    ]
  },
  {
    id: 'caterpillar-butterfly',
    theme: 'transformation',
    difficulty: 1,
    title: 'Caterpillar to Butterfly',
    description: 'A magical transformation!',
    narration: 'Watch the caterpillar become a butterfly!',
    cards: [
      { 
        id: 'caterpillar', 
        image: 'caterpillar', 
        description: 'a hungry caterpillar', 
        correctPosition: 0,
        emoji: '🐛'
      },
      { 
        id: 'cocoon', 
        image: 'cocoon', 
        description: 'a cocoon', 
        correctPosition: 1,
        emoji: '🥥'
      },
      { 
        id: 'butterfly', 
        image: 'butterfly', 
        description: 'a beautiful butterfly', 
        correctPosition: 2,
        emoji: '🦋'
      },
    ]
  },
  {
    id: 'rainbow-weather',
    theme: 'weather',
    difficulty: 1,
    title: 'After the Rain',
    description: 'What happens when it rains?',
    narration: 'Let\'s see what happens after it rains!',
    cards: [
      { 
        id: 'clouds', 
        image: 'clouds', 
        description: 'rain clouds', 
        correctPosition: 0,
        emoji: '🌧️'
      },
      { 
        id: 'rain', 
        image: 'rain', 
        description: 'rain falling', 
        correctPosition: 1,
        emoji: '☔'
      },
      { 
        id: 'sun', 
        image: 'sun', 
        description: 'sun coming out', 
        correctPosition: 2,
        emoji: '🌤️'
      },
      { 
        id: 'rainbow', 
        image: 'rainbow', 
        description: 'a rainbow', 
        correctPosition: 3,
        emoji: '🌈'
      },
    ]
  },
  {
    id: 'building-house',
    theme: 'building',
    difficulty: 2,
    title: 'Building a House',
    description: 'How do we build a house?',
    narration: 'Let\'s see how a house is built!',
    cards: [
      { 
        id: 'foundation', 
        image: 'foundation', 
        description: 'the foundation', 
        correctPosition: 0,
        emoji: '🏗️'
      },
      { 
        id: 'walls', 
        image: 'walls', 
        description: 'building walls', 
        correctPosition: 1,
        emoji: '🧱'
      },
      { 
        id: 'roof', 
        image: 'roof', 
        description: 'adding the roof', 
        correctPosition: 2,
        emoji: '🏠'
      },
      { 
        id: 'paint', 
        image: 'paint', 
        description: 'painting the house', 
        correctPosition: 3,
        emoji: '🎨'
      },
      { 
        id: 'home', 
        image: 'home', 
        description: 'a cozy home', 
        correctPosition: 4,
        emoji: '🏡'
      },
    ]
  },
  {
    id: 'making-pizza',
    theme: 'cooking',
    difficulty: 2,
    title: 'Making Pizza',
    description: 'Let\'s make a yummy pizza!',
    narration: 'Let\'s put the pizza-making steps in order!',
    cards: [
      { 
        id: 'dough', 
        image: 'dough', 
        description: 'pizza dough', 
        correctPosition: 0,
        emoji: '🫓'
      },
      { 
        id: 'sauce', 
        image: 'sauce', 
        description: 'adding sauce', 
        correctPosition: 1,
        emoji: '🍅'
      },
      { 
        id: 'toppings', 
        image: 'toppings', 
        description: 'adding toppings', 
        correctPosition: 2,
        emoji: '🧀'
      },
      { 
        id: 'oven', 
        image: 'oven', 
        description: 'baking in oven', 
        correctPosition: 3,
        emoji: '🔥'
      },
      { 
        id: 'pizza', 
        image: 'pizza', 
        description: 'yummy pizza', 
        correctPosition: 4,
        emoji: '🍕'
      },
    ]
  },
  {
    id: 'frog-life',
    theme: 'lifeCycle',
    difficulty: 2,
    title: 'From Tadpole to Frog',
    description: 'A frog\'s amazing life!',
    narration: 'Let\'s learn how a frog grows!',
    cards: [
      { 
        id: 'eggs', 
        image: 'eggs', 
        description: 'frog eggs', 
        correctPosition: 0,
        emoji: '🫧'
      },
      { 
        id: 'tadpole', 
        image: 'tadpole', 
        description: 'a tadpole', 
        correctPosition: 1,
        emoji: '🐟'
      },
      { 
        id: 'tadpole-legs', 
        image: 'tadpole-legs', 
        description: 'tadpole with legs', 
        correctPosition: 2,
        emoji: '🦎'
      },
      { 
        id: 'frog', 
        image: 'frog', 
        description: 'a frog', 
        correctPosition: 3,
        emoji: '🐸'
      },
    ],
  },
];

/**
 * Get stories filtered by difficulty
 */
export function getStoriesByDifficulty(difficulty?: 1 | 2 | 3): SequenceStory[] {
  if (!difficulty) return STORY_SEQUENCES;
  return STORY_SEQUENCES.filter(story => story.difficulty === difficulty);
}

/**
 * Get a random story
 */
export function getRandomStory(difficulty?: 1 | 2 | 3): SequenceStory {
  const stories = getStoriesByDifficulty(difficulty);
  return stories[Math.floor(Math.random() * stories.length)];
}

/**
 * Get a story by ID
 */
export function getStoryById(id: string): SequenceStory | undefined {
  return STORY_SEQUENCES.find(story => story.id === id);
}

/**
 * Shuffle cards for the pool
 */
export function shuffleCards(cards: SequenceCard[]): SequenceCard[] {
  return [...cards].sort(() => Math.random() - 0.5);
}

/**
 * Initialize game state for a story
 */
export function initializeGame(story: SequenceStory): GameState {
  return {
    currentStory: story,
    slots: new Array(story.cards.length).fill(null),
    pool: shuffleCards(story.cards),
    completed: false,
    attempts: 0,
    hintsUsed: 0,
  };
}

/**
 * Check if the current sequence is correct
 */
export function checkSequence(slots: (SequenceCard | null)[]): boolean {
  return slots.every((card, index) => card !== null && card.correctPosition === index);
}

/**
 * Check if a specific slot has the correct card
 */
export function isSlotCorrect(slots: (SequenceCard | null)[], slotIndex: number): boolean {
  const card = slots[slotIndex];
  return card !== null && card.correctPosition === slotIndex;
}

/**
 * Get the number of correctly placed cards
 */
export function getCorrectCount(slots: (SequenceCard | null)[]): number {
  return slots.filter((card, index) => card !== null && card.correctPosition === index).length;
}

/**
 * Get a hint for the next empty or incorrect slot
 */
export function getHint(gameState: GameState): { slotIndex: number; hint: string } | null {
  const { slots, pool } = gameState;
  
  // Find first empty or incorrect slot
  for (let i = 0; i < slots.length; i++) {
    const card = slots[i];
    if (card === null || card.correctPosition !== i) {
      // Find the card that should go here
      const correctCard = pool.find(c => c.correctPosition === i) || 
                         slots.find((c, idx) => idx !== i && c?.correctPosition === i);
      
      if (correctCard) {
        return {
          slotIndex: i,
          hint: `Look for ${correctCard.description}!`,
        };
      }
    }
  }
  
  return null;
}

/**
 * Check if all slots are filled
 */
export function areAllSlotsFilled(slots: (SequenceCard | null)[]): boolean {
  return slots.every(slot => slot !== null);
}

/**
 * Check if a card can be placed in a slot
 * (Always allowed - validation happens after placement)
 */
export function canPlaceCard(slotIndex: number, slots: (SequenceCard | null)[]): boolean {
  return slotIndex >= 0 && slotIndex < slots.length;
}

/**
 * Place a card in a slot
 * Returns the displaced card (if any)
 */
export function placeCard(
  card: SequenceCard,
  slotIndex: number,
  slots: (SequenceCard | null)[],
  pool: SequenceCard[]
): {
  newSlots: (SequenceCard | null)[];
  newPool: SequenceCard[];
  displacedCard: SequenceCard | null;
} {
  const newSlots = [...slots];
  const newPool = [...pool];
  
  // Remove card from pool if it was there
  const poolIndex = newPool.findIndex(c => c.id === card.id);
  if (poolIndex !== -1) {
    newPool.splice(poolIndex, 1);
  }
  
  // Get displaced card from slot
  const displacedCard = newSlots[slotIndex];
  
  // Place new card
  newSlots[slotIndex] = card;
  
  // If there was a card in the slot, return it to pool
  if (displacedCard) {
    newPool.push(displacedCard);
  }
  
  return { newSlots, newPool, displacedCard };
}

/**
 * Move a card from one slot to another
 */
export function moveCardBetweenSlots(
  fromIndex: number,
  toIndex: number,
  slots: (SequenceCard | null)[]
): (SequenceCard | null)[] {
  if (fromIndex === toIndex) return slots;
  
  const newSlots = [...slots];
  const card = newSlots[fromIndex];
  
  if (!card) return slots;
  
  // If target slot has a card, swap them
  const targetCard = newSlots[toIndex];
  newSlots[toIndex] = card;
  newSlots[fromIndex] = targetCard;
  
  return newSlots;
}

/**
 * Return a card from a slot to the pool
 */
export function returnCardToPool(
  slotIndex: number,
  slots: (SequenceCard | null)[],
  pool: SequenceCard[]
): {
  newSlots: (SequenceCard | null)[];
  newPool: SequenceCard[];
} {
  const newSlots = [...slots];
  const newPool = [...pool];
  
  const card = newSlots[slotIndex];
  if (card) {
    newPool.push(card);
    newSlots[slotIndex] = null;
  }
  
  return { newSlots, newPool };
}

/**
 * Get theme display name
 */
export function getThemeDisplayName(theme: SequenceTheme): string {
  const names: Record<SequenceTheme, string> = {
    lifeCycle: 'Life Cycle',
    dailyRoutine: 'Daily Routine',
    cooking: 'Cooking',
    growth: 'Growing',
    weather: 'Weather',
    building: 'Building',
    transformation: 'Magic Change',
  };
  return names[theme];
}

/**
 * Get difficulty display
 */
export function getDifficultyDisplay(difficulty: number): { label: string; color: string } {
  switch (difficulty) {
    case 1:
      return { label: 'Easy', color: 'text-green-500' };
    case 2:
      return { label: 'Medium', color: 'text-yellow-500' };
    case 3:
      return { label: 'Hard', color: 'text-red-500' };
    default:
      return { label: 'Unknown', color: 'text-gray-500' };
  }
}
