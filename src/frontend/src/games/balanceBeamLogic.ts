/**
 * Balance Beam Game Logic
 * 
 * Teaches balance, posture, and gross motor control.
 */

export interface GameState {
    status: 'idle' | 'playing' | 'complete' | 'fallen';
    balance: number; // -100 to 100 (0 is perfect center)
    wobble: number; // Current wobble intensity
    timeLeft: number;
    score: number;
    level: number;
}

export function createInitialState(): GameState {
    return {
        status: 'idle',
        balance: 0,
        wobble: 0,
        timeLeft: 30,
        score: 0,
        level: 1,
    };
}

export function updateBalance(
    currentBalance: number,
    poseAlignment: number, // -1 to 1 (left to right)
    difficulty: number = 1
): { newBalance: number; wobble: number } {
    // Natural wobble
    const time = Date.now() / 1000;
    const naturalWobble = Math.sin(time * 2) * 5 * difficulty;

    // Apply pose feedback (if player tilts right, balance shifts right)
    const poseShift = poseAlignment * 10;

    // Drift towards falling if already unbalanced
    const drift = currentBalance * 0.05 * difficulty;

    let newBalance = currentBalance + naturalWobble + poseShift + drift;

    // Clamp
    newBalance = Math.max(-100, Math.min(100, newBalance));

    return {
        newBalance,
        wobble: Math.abs(naturalWobble)
    };
}

export function checkFalling(balance: number): boolean {
    return Math.abs(balance) >= 95;
}
