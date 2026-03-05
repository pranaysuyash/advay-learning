/**
 * Random number utilities using cryptographically secure randomness where available.
 *
 * @example
 * ```ts
 * import { randomFloat01, randomBetween, shuffle, pickRandom } from './utils/random';
 *
 * // Random float between 0 and 1
 * const r = randomFloat01();
 *
 * // Random float in range
 * const x = randomBetween(10, 20);
 *
 * // Shuffle an array (Fisher-Yates)
 * const shuffled = shuffle([1, 2, 3, 4, 5]);
 *
 * // Pick random element
 * const item = pickRandom(['a', 'b', 'c']);
 * ```
 */

const UINT32_MAX = 4294967295;

/**
 * Generate a random float between 0 and 1.
 * Uses cryptographically secure randomness when available.
 */
export function randomFloat01(): number {
  try {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] / UINT32_MAX;
  } catch {
    return Math.random();
  }
}

/**
 * Generate a random number in the inclusive range [min, max].
 *
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random number between min and max
 */
export function randomBetween(min: number, max: number): number {
  return min + randomFloat01() * (max - min);
}

/**
 * Fisher-Yates shuffle algorithm for properly distributed randomization.
 * Returns a new shuffled array (does not mutate the original).
 *
 * This is superior to `[...array].sort(() => Math.random() - 0.5)` which:
 * - Does not produce a uniform distribution
 * - Is slower due to multiple sort comparisons
 *
 * @param array - The array to shuffle
 * @returns A new shuffled array
 *
 * @example
 * ```ts
 * const original = [1, 2, 3, 4, 5];
 * const shuffled = shuffle(original);
 * // original is still [1, 2, 3, 4, 5]
 * // shuffled is a random permutation
 * ```
 */
export function shuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(randomFloat01() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Pick a random element from an array.
 *
 * @param array - The array to pick from
 * @returns A random element from the array, or undefined if empty
 *
 * @example
 * ```ts
 * const animals = ['cat', 'dog', 'bird'];
 * const chosen = pickRandom(animals); // 'cat', 'dog', or 'bird'
 * ```
 */
export function pickRandom<T>(array: readonly T[]): T | undefined {
  if (array.length === 0) {
    return undefined;
  }
  return array[Math.floor(randomFloat01() * array.length)];
}

/**
 * Pick N random elements from an array without replacement.
 *
 * @param array - The array to pick from
 * @param count - Number of elements to pick (will be capped at array length)
 * @returns An array of randomly chosen elements
 *
 * @example
 * ```ts
 * const animals = ['cat', 'dog', 'bird', 'fish', 'lizard'];
 * const chosen = pickRandomN(animals, 3); // 3 unique random animals
 * ```
 */
export function pickRandomN<T>(array: readonly T[], count: number): T[] {
  const shuffled = shuffle(array);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
