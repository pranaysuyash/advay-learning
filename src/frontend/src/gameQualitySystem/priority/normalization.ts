// Normalization utilities for Priority Engine
// Converts various metrics to a common 0-100 scale for weighted calculation

/**
 * Normalizes a value to a 0-100 scale based on min/max bounds.
 * 
 * @param value - The value to normalize
 * @param min - The minimum value in the range
 * @param max - The maximum value in the range
 * @returns A value between 0 and 100 (inclusive)
 * 
 * Edge cases handled:
 * - Single value (min === max): Returns 100 if value equals min, 0 otherwise
 * - Empty range: Returns 0
 * - Value below min: Returns 0
 * - Value above max: Returns 100
 */
export function normalizeToScale(value: number, min: number, max: number): number {
    // Handle edge case: empty range
    if (min >= max) {
        return 0;
    }

    // Handle edge case: single value (min === max)
    if (min === max) {
        return value === min ? 100 : 0;
    }

    // Calculate normalized value
    const normalized = ((value - min) / (max - min)) * 100;

    // Clamp to 0-100 range
    return Math.max(0, Math.min(100, normalized));
}

/**
 * Normalizes a value assuming 0 is the minimum (e.g., for counts).
 * 
 * @param value - The value to normalize
 * @param max - The maximum expected value
 * @returns A value between 0 and 100 (inclusive)
 */
export function normalizeFromZero(value: number, max: number): number {
    if (max <= 0) {
        return 0;
    }
    return Math.max(0, Math.min(100, (value / max) * 100));
}

/**
 * Normalizes a percentage value (0-100) to itself.
 * Useful for consistency in processing already-normalized values.
 * 
 * @param value - A percentage value
 * @returns The same value, clamped to 0-100
 */
export function normalizePercentage(value: number): number {
    return Math.max(0, Math.min(100, value));
}

/**
 * Normalizes a score that should be inverted (lower is better).
 * For example, implementation effort: lower hours = higher score.
 * 
 * @param value - The value to normalize
 * @param min - The minimum value (best case, maps to 100)
 * @param max - The maximum value (worst case, maps to 0)
 * @returns A value between 0 and 100 (inclusive), where lower input = higher output
 */
export function normalizeInverted(value: number, min: number, max: number): number {
    // Handle edge case: empty range
    if (min >= max) {
        return 0;
    }

    // Handle edge case: single value
    if (min === max) {
        return value === min ? 100 : 0;
    }

    // Handle out-of-range values by returning boundary values
    if (value < min) {
        return 100; // Best case for inverted scale
    }
    if (value > max) {
        return 0; // Worst case for inverted scale
    }

    // Calculate inverted normalized value
    const normalized = ((max - value) / (max - min)) * 100;

    // Clamp to 0-100 range
    return Math.max(0, Math.min(100, normalized));
}

/**
 * Normalizes an array of values to 0-100 scale based on min/max of the array.
 * Useful when you have a set of values and want to normalize them relative to each other.
 * 
 * @param values - Array of values to normalize
 * @returns Array of normalized values between 0 and 100
 */
export function normalizeArray(values: number[]): number[] {
    if (values.length === 0) {
        return [];
    }

    const validValues = values.filter((v): v is number => typeof v === 'number' && !isNaN(v));
    if (validValues.length === 0) {
        return values.map(() => 0);
    }

    const min = Math.min(...validValues);
    const max = Math.max(...validValues);

    if (min === max) {
        return values.map((v) => (v === min ? 100 : 0));
    }

    return values.map((v) => {
        if (typeof v !== 'number' || isNaN(v)) {
            return 0;
        }
        return normalizeToScale(v, min, max);
    });
}

/**
 * Clamps a value to the 0-100 range.
 * Useful as a final step to ensure values stay within bounds.
 * 
 * @param value - The value to clamp
 * @returns The value clamped to 0-100 range
 */
export function clampToHundred(value: number): number {
    return Math.max(0, Math.min(100, value));
}