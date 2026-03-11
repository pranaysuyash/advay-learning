import { describe, it, expect } from 'vitest';
import {
    initializeGame,
    updatePhysics,
    checkCollisions
} from './spellingRunLogic';

describe('spellingRunLogic', () => {
    describe('initializeGame', () => {
        it('should initialize with a target word and platforms', () => {
            const state = initializeGame(1);
            expect(state.targetWord).toBeDefined();
            expect(state.platforms.length).toBeGreaterThan(0);
            expect(state.status).toBe('idle');
        });
    });

    describe('updatePhysics', () => {
        it('should apply gravity when playing', () => {
            let state = initializeGame(1);
            state.status = 'playing';
            const initialY = state.player.y;
            state = updatePhysics(state, 1);
            expect(state.player.y).toBeGreaterThan(initialY);
        });

        it('should stop falling when hitting a platform', () => {
            let state = initializeGame(1);
            state.status = 'playing';
            // Place player just above platform 1 (y=500, height=100)
            state.player.y = 450;
            state.player.width = 50;
            state.player.height = 50;
            state.player.vy = 10;

            state = updatePhysics(state, 1);
            expect(state.player.y).toBe(450); // 500 - 50
            expect(state.player.vy).toBe(0);
            expect(state.player.isJumping).toBe(false);
        });
    });

    describe('checkCollisions', () => {
        it('should collect correct letter and advance progress', () => {
            let state = initializeGame(1);
            state.targetWord = 'CAT';
            state.currentWord = '';
            state.letters = [
                { id: 'l1', char: 'C', x: 200, y: 400, isCollected: false, isCorrect: true }
            ];
            state.player.x = 200 - 25; // Center on letter
            state.player.y = 400 - 25;
            state.player.width = 50;
            state.player.height = 50;

            state = checkCollisions(state);
            expect(state.currentWord).toBe('C');
            expect(state.letters[0].isCollected).toBe(true);
            expect(state.score).toBe(100);
        });

        it('should not advance if wrong letter is collected', () => {
            let state = initializeGame(1);
            state.targetWord = 'CAT';
            state.currentWord = 'C';
            state.letters = [
                { id: 'l1', char: 'X', x: 200, y: 400, isCollected: false, isCorrect: false }
            ];
            state.player.x = 175;
            state.player.y = 375;

            state = checkCollisions(state);
            expect(state.currentWord).toBe('C');
            expect(state.letters[0].isCollected).toBe(true);
            expect(state.score).toBe(0); // Mistake penalty (initialized with 0, so stays 0)
        });

        it('should complete game when last letter is collected', () => {
            let state = initializeGame(1);
            state.targetWord = 'CAT';
            state.currentWord = 'CA';
            state.letters = [
                { id: 'l1', char: 'T', x: 200, y: 400, isCollected: false, isCorrect: true }
            ];
            state.player.x = 175;
            state.player.y = 375;

            state = checkCollisions(state);
            expect(state.status).toBe('complete');
        });
    });
});
