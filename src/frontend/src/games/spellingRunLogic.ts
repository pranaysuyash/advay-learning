/**
 * Spelling Run Game Logic
 *
 * Handles word generation, letter spawning, platform management,
 * and collision detection for a vertical/horizontal runner.
 */

export interface Point {
    x: number;
    y: number;
}

export interface Platform {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Letter {
    id: string;
    char: string;
    x: number;
    y: number;
    isCollected: boolean;
    isCorrect: boolean;
}

export interface Enemy {
    id: number;
    x: number;
    y: number;
    type: 'slime';
}

export interface GameState {
    status: 'idle' | 'playing' | 'complete' | 'failed';
    player: {
        x: number;
        y: number;
        vy: number;
        isJumping: boolean;
        width: number;
        height: number;
    };
    platforms: Platform[];
    letters: Letter[];
    enemies: Enemy[];
    targetWord: string;
    currentWord: string;
    score: number;
    level: number;
    scrollX: number;
}

export const GRAVITY = 0.5;
export const JUMP_FORCE = -12;
export const PLAYER_SPEED = 5;
export const SPAWN_DISTANCE = 300; // Distance between letter spawns

const CVC_WORDS = ['CAT', 'DOG', 'HAT', 'BAT', 'SUN', 'BUS', 'PIG', 'BOX'];
const MEDIUM_WORDS = ['FROG', 'BIRD', 'FISH', 'JUMP', 'PLAY', 'STAR', 'BLUE'];
const HARD_WORDS = ['APPLE', 'BANANA', 'CHERRY', 'ORANGE', 'PURPLE', 'GARDEN'];

/**
 * Initializes a new game state.
 */
export const initializeGame = (level: number = 1): GameState => {
    const words = level === 1 ? CVC_WORDS : level === 2 ? MEDIUM_WORDS : HARD_WORDS;
    const targetWord = words[Math.floor(Math.random() * words.length)];

    const initialState: GameState = {
        status: 'idle',
        player: {
            x: 100,
            y: 400,
            vy: 0,
            isJumping: false,
            width: 50,
            height: 50,
        },
        platforms: [
            { id: 1, x: 0, y: 500, width: 2000, height: 100 }, // Starting long platform
        ],
        letters: [],
        enemies: [],
        targetWord,
        currentWord: '',
        score: 0,
        level,
        scrollX: 0,
    };

    return spawnItems(initialState);
};

/**
 * Spawns letters and enemies based on the target word.
 */
export const spawnItems = (state: GameState): GameState => {
    const letters: Letter[] = [];
    const enemies: Enemy[] = [];
    let lastX = 400;

    // Guaranteed correct letters in order but spread out
    for (let i = 0; i < state.targetWord.length; i++) {
        const char = state.targetWord[i];
        letters.push({
            id: `l-${i}`,
            char,
            x: lastX + 300 + Math.random() * 200,
            y: 350 + Math.random() * 50,
            isCollected: false,
            isCorrect: true,
        });

        // Add a distractor letter nearby
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const distractor = alphabet[Math.floor(Math.random() * alphabet.length)];
        letters.push({
            id: `d-${i}`,
            char: distractor,
            x: lastX + 500 + Math.random() * 200,
            y: 300 + Math.random() * 150,
            isCollected: false,
            isCorrect: false,
        });

        // Add a platform near the letter if it's high
        state.platforms.push({
            id: Date.now() + i,
            x: lastX + 300,
            y: 450,
            width: 200,
            height: 20,
        });

        lastX += 800;
    }

    return { ...state, letters, enemies };
};

/**
 * Updates player physics and collision.
 */
export const updatePhysics = (state: GameState, deltaTimeRatio: number = 1): GameState => {
    if (state.status !== 'playing') return state;

    const player = { ...state.player };

    // Apply gravity
    player.vy += GRAVITY * deltaTimeRatio;
    player.y += player.vy * deltaTimeRatio;

    // Horizontal movement (auto-scroll or finger controlled)
    player.x += PLAYER_SPEED * deltaTimeRatio;

    // Platform collision
    for (const platform of state.platforms) {
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height + player.vy
        ) {
            player.y = platform.y - player.height;
            player.vy = 0;
            player.isJumping = false;
        }
    }

    // Death by falling
    if (player.y > 800) {
        return { ...state, status: 'failed', player };
    }

    return { ...state, player };
};

/**
 * Checks for letter collection.
 */
export const checkCollisions = (state: GameState): GameState => {
    const player = state.player;
    let { currentWord, score, status } = state;

    const letters = state.letters.map(letter => {
        if (letter.isCollected) return letter;

        const dx = (player.x + player.width / 2) - letter.x;
        const dy = (player.y + player.height / 2) - letter.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 40) {
            // Check if it's the next correct character
            const nextChar = state.targetWord[currentWord.length];
            if (letter.isCorrect && letter.char === nextChar) {
                currentWord += letter.char;
                score += 100;
                if (currentWord === state.targetWord) {
                    status = 'complete';
                }
            } else {
                // Mistake penalty
                score = Math.max(0, score - 50);
                // Optional: reset word progress or just play error sound in UI
            }
            return { ...letter, isCollected: true };
        }
        return letter;
    });

    return { ...state, letters, currentWord, score, status };
};
