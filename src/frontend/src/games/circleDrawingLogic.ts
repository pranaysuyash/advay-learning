/**
 * Circle Drawing Game Logic
 * 
 * Handles circular path generation, point-on-path validation,
 * and speed-regulated tracing logic.
 */

export interface Point {
    x: number;
    y: number;
}

export interface CirclePath {
    center: Point;
    radius: number;
    startAngle: number;
}

export const DEFAULT_TOLERANCE = 0.05; // 5% of screen width
export const MAX_SPEED = 0.15; // Normalized units per second (slow)
export const MIN_SPEED = 0.02; // Very slow threshold

/**
 * Creates a standard circle path for the game.
 */
export const createCirclePath = (level: number = 1): CirclePath => {
    // Center is roughly middle (0.5, 0.5)
    // Radius decreases slightly with level to increase difficulty/precision
    const radius = level === 1 ? 0.3 : level === 2 ? 0.25 : 0.2;

    return {
        center: { x: 0.5, y: 0.5 },
        radius,
        startAngle: 0
    };
};

/**
 * Checks if a point is within the tolerance zone of the circular path.
 */
export const isPointOnCircle = (
    point: Point,
    circle: CirclePath,
    tolerance: number = DEFAULT_TOLERANCE
): boolean => {
    const dx = point.x - circle.center.x;
    const dy = point.y - circle.center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return Math.abs(distance - circle.radius) <= tolerance;
};

/**
 * Calculates current progress (0-100) based on the angle reached.
 * Assumes tracing starts at startAngle and moves clockwise.
 */
export const calculateProgress = (
    currentPoint: Point,
    circle: CirclePath,
    startAngle: number = 0
): number => {
    const dx = currentPoint.x - circle.center.x;
    const dy = currentPoint.y - circle.center.y;

    let angle = Math.atan2(dy, dx); // -PI to PI
    if (angle < 0) angle += 2 * Math.PI; // 0 to 2PI

    // Normalize based on startAngle
    let normalizedAngle = angle - startAngle;
    if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;

    const percent = (normalizedAngle / (2 * Math.PI)) * 100;
    return Math.min(100, Math.max(0, percent));
};

/**
 * Validates tracing speed.
 * Returns true if the speed is within acceptable "slow" limits.
 */
export const isSpeedValid = (
    prevPoint: Point,
    currPoint: Point,
    deltaTimeMs: number,
    maxSpeed: number = MAX_SPEED
): { isValid: boolean; speed: number } => {
    if (deltaTimeMs <= 0) return { isValid: true, speed: 0 };

    const dx = currPoint.x - prevPoint.x;
    const dy = currPoint.y - prevPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const speed = (distance / deltaTimeMs) * 1000; // units per second

    return {
        isValid: speed <= maxSpeed,
        speed
    };
};
