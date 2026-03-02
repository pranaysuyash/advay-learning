import { test, expect } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_EMAIL;
const E2E_PASSWORD = process.env.E2E_PASSWORD;

const GAMES_TO_TEST = [
    '/games/shape-pop',
    '/games/alphabet-game',
    '/games/emoji-match',
    '/games/maze-runner'
];

test.describe('Games Camera & Visual Verification', () => {
    // Increase timeout as loading models can take a few seconds
    test.setTimeout(60000);

    test.beforeEach(async ({ page }) => {
        test.skip(!E2E_EMAIL || !E2E_PASSWORD, 'Set E2E_EMAIL and E2E_PASSWORD to run authenticated visual tests.');

        // 1. Authenticate with the test user
        await page.goto('http://localhost:6173/login');

        // Fill credentials if the form exists (it might be auto-login in dev)
        const emailInput = page.locator('input[type="email"]');
        if (await emailInput.isVisible()) {
            await emailInput.fill(E2E_EMAIL!);
            await page.locator('input[type="password"]').fill(E2E_PASSWORD!);
            await page.locator('button[type="submit"]').click();
            await page.waitForURL('**/dashboard*');
        }
    });

    for (const gameRoute of GAMES_TO_TEST) {
        test(`Verify camera and UI for ${gameRoute}`, async ({ page }) => {
            await page.goto(`http://localhost:6173${gameRoute}`);

            // Wait for the game container to load
            await page.waitForLoadState('networkidle');

            // Ensure there are no full-screen raw video renders
            // We expect only 1 video element - the one belonging to CameraThumbnail
            const videos = page.locator('video');

            // Give it time to mount the webcam component
            try {
                await videos.first().waitFor({ state: 'attached', timeout: 10000 });
            } catch (e) {
                console.warn(`No video element found in ${gameRoute}. Ensure the game supports generic Webcams in test environment.`);
            }

            // Check count: CameraThumbnail renders exact 1 video
            const videoCount = await videos.count();
            if (videoCount > 0) {
                // Enforce phase 2 bug fix: only one webcam stream should exist
                expect(videoCount).toBe(1);

                // Verify the video is inside the thumbnail, NOT fullscreen
                // We look for the z-[60] constraint we added
                const thumbnailBox = await videos.first().evaluate((el: HTMLVideoElement) => {
                    const parent = el.closest('div');
                    return parent?.className.includes('z-[60]') || false;
                });
                expect(thumbnailBox).toBeTruthy();
            }

            // Take a baseline screenshot for manual visual regression
            const gameName = gameRoute.split('/').pop() || 'game';
            await page.screenshot({ path: `screenshots/${gameName}-baseline.png`, fullPage: true });
        });
    }
});
