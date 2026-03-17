import { test, expect } from '@playwright/test';
import { getListedGames } from '../data/gameRegistry';

// Playwright should already be configured to start the dev server on localhost:6173.
// This test visits each listed game route and asserts it does not emit any console errors nor runtime exceptions.

function normalizeErrorText(text: string): string {
  // Normalize errors so they can be compared consistently across environments
  return text.trim().replace(/\s+/g, ' ');
}

async function attemptBasicInteraction(page: Parameters<typeof test>[0]['page']) {
  // Try to click an obvious start button if present
  const startButton = page.locator('button', {
    hasText: /start|play|go|begin|launch|continue|start game/i,
  });
  if ((await startButton.count()) > 0) {
    await startButton.first().click({ timeout: 2000 }).catch(() => null);
  }

  // Try to click the first canvas element, which often starts the game loop
  const canvas = page.locator('canvas');
  if ((await canvas.count()) > 0) {
    await canvas.first().click({ timeout: 2000 }).catch(() => null);
  }
}

test.describe('game pages smoke', () => {
  const listedGames = getListedGames();

  test('all listed games load and run without console errors or runtime exceptions', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    const runtimeExceptions: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(normalizeErrorText(msg.text()));
      }
    });

    page.on('pageerror', (err) => {
      pageErrors.push(normalizeErrorText(err.message));
    });

    const cdpSession = await page.context().newCDPSession(page);
    await cdpSession.send('Runtime.enable');
    cdpSession.on('Runtime.exceptionThrown', (event) => {
      runtimeExceptions.push(normalizeErrorText(event.exceptionDetails.text || 'Unknown exception'));
    });

    for (const game of listedGames) {
      console.log(`-> Testing game: ${game.id} @ ${game.path}`);

      // Some games may be behind a subscription gate. We just want to ensure they don't crash.
      await page.goto(game.path, { waitUntil: 'networkidle' });

      // Allow any startup async code to run briefly
      await page.waitForTimeout(500);

      // Try a minimal interaction path to exercise game logic/initialization
      await attemptBasicInteraction(page);

      // Wait a moment for any errors to surface
      await page.waitForTimeout(500);

      const errors = {
        console: [...consoleErrors],
        page: [...pageErrors],
        runtime: [...runtimeExceptions],
      };

      expect(errors.console, `Console errors for ${game.id}`).toEqual([]);
      expect(errors.page, `Page errors for ${game.id}`).toEqual([]);
      expect(errors.runtime, `Runtime exceptions for ${game.id}`).toEqual([]);

      // Reset error trackers for next game to prevent cross-game bleed
      consoleErrors.length = 0;
      pageErrors.length = 0;
      runtimeExceptions.length = 0;
    }
  });
});
