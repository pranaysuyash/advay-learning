/**
 * Vowel Valley Game Logic
 * 
 * Distinguishes between short and long vowel sounds.
 */

export type VowelType = 'short' | 'long';

export interface VowelWord {
    id: string;
    word: string;
    vowel: string;
    type: VowelType;
    emoji: string;
}

export interface GameState {
    status: 'idle' | 'playing' | 'complete';
    score: number;
    streak: number;
    currentWord: VowelWord | null;
    itemsSorted: number;
    totalItems: number;
    lives: number;
}

export const VOWEL_WORDS: VowelWord[] = [
    // Short A
    { id: 'cat', word: 'Cat', vowel: 'A', type: 'short', emoji: '🐱' },
    { id: 'hat', word: 'Hat', vowel: 'A', type: 'short', emoji: '👒' },
    { id: 'bat', word: 'Bat', vowel: 'A', type: 'short', emoji: '🦇' },
    // Long A
    { id: 'cake', word: 'Cake', vowel: 'A', type: 'long', emoji: '🍰' },
    { id: 'lake', word: 'Lake', vowel: 'A', type: 'long', emoji: '🌅' },
    { id: 'snake', word: 'Snake', vowel: 'A', type: 'long', emoji: '🐍' },
    // Short E
    { id: 'bed', word: 'Bed', vowel: 'E', type: 'short', emoji: '🛏️' },
    { id: 'hen', word: 'Hen', vowel: 'E', type: 'short', emoji: '🐔' },
    { id: 'pen', word: 'Pen', vowel: 'E', type: 'short', emoji: '🖊️' },
    // Long E
    { id: 'bee', word: 'Bee', vowel: 'E', type: 'long', emoji: '🐝' },
    { id: 'tree', word: 'Tree', vowel: 'E', type: 'long', emoji: '🌳' },
    { id: 'feet', word: 'Feet', vowel: 'E', type: 'long', emoji: '👣' },
    // Short I
    { id: 'pig', word: 'Pig', vowel: 'I', type: 'short', emoji: '🐷' },
    { id: 'bib', word: 'Bib', vowel: 'I', type: 'short', emoji: '👶' },
    { id: 'fish', word: 'Fish', vowel: 'I', type: 'short', emoji: '🐟' },
    // Long I
    { id: 'kite', word: 'Kite', vowel: 'I', type: 'long', emoji: '🪁' },
    { id: 'bike', word: 'Bike', vowel: 'I', type: 'long', emoji: '🚲' },
    { id: 'ice', word: 'Ice', vowel: 'I', type: 'long', emoji: '🧊' },
    // Short O
    { id: 'dog', word: 'Dog', vowel: 'O', type: 'short', emoji: '🐶' },
    { id: 'mop', word: 'Mop', vowel: 'O', type: 'short', emoji: '🧹' },
    { id: 'pot', word: 'Pot', vowel: 'O', type: 'short', emoji: '🍲' },
    // Long O
    { id: 'boat', word: 'Boat', vowel: 'O', type: 'long', emoji: '⛵' },
    { id: 'coat', word: 'Coat', vowel: 'O', type: 'long', emoji: '🧥' },
    { id: 'rope', word: 'Rope', vowel: 'O', type: 'long', emoji: '🧶' },
    // Short U
    { id: 'sun', word: 'Sun', vowel: 'U', type: 'short', emoji: '☀️' },
    { id: 'cup', word: 'Cup', vowel: 'U', type: 'short', emoji: '🥤' },
    { id: 'bug', word: 'Bug', vowel: 'U', type: 'short', emoji: '🐞' },
    // Long U
    { id: 'tube', word: 'Tube', vowel: 'U', type: 'long', emoji: '🧪' },
    { id: 'blue', word: 'Blue', vowel: 'U', type: 'long', emoji: '🔵' },
    { id: 'cute', word: 'Cute', vowel: 'U', type: 'long', emoji: '🧸' },
];

export function createInitialState(): GameState {
    return {
        status: 'idle',
        score: 0,
        streak: 0,
        currentWord: null,
        itemsSorted: 0,
        totalItems: 10,
        lives: 3,
    };
}

export function getRandomWord(): VowelWord {
    return VOWEL_WORDS[Math.floor(Math.random() * VOWEL_WORDS.length)];
}

export function checkSelection(word: VowelWord, selection: VowelType): boolean {
    return word.type === selection;
}
