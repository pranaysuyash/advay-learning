import { test, expect } from '@playwright/test';

test.describe('AlphabetGame visual state (in-game overlays)', () => {
  test('in-game view does not show giant filled hint letter overlay', async ({ page }) => {
    // Stub auth check so ProtectedRoute allows navigation.
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'u1',
          email: 'parent@example.com',
          role: 'parent',
          is_active: true,
        }),
      });
    });

    // Stub profile API so Dashboard sets a currentProfile.
    await page.route('**/api/v1/users/me/profiles**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'p1',
            name: 'Kid One',
            age: 6,
            preferred_language: 'en',
            created_at: new Date().toISOString(),
          },
        ]),
      });
    });

    // Avoid real camera permissions; force a fast failure so the game enters
    // "in-game" UI via the mouse/touch fallback path.
    await page.addInitScript(() => {
      // @ts-expect-error - Playwright init script
      navigator.mediaDevices = navigator.mediaDevices || {};
      // @ts-expect-error - Playwright init script
      navigator.mediaDevices.getUserMedia = async () => {
        throw new Error('denied');
      };
    });

    // Seed auth state so ProtectedRoute doesn't redirect to /login.
    await page.addInitScript(() => {
      try {
        localStorage.setItem('tutorialCompleted', 'true');
        localStorage.setItem(
          'auth-storage',
          JSON.stringify({
            state: { isAuthenticated: true, user: { id: 'u1', email: 'parent@example.com', role: 'parent', is_active: true } },
            version: 0,
          }),
        );
      } catch {
        // ignore
      }
    });

    // Visit dashboard first so profile fetch runs (sets currentProfile in store).
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForResponse(/\/api\/v1\/users\/me\/profiles/, { timeout: 15000 });

    // Navigate directly to the game. AlphabetGame falls back to currentProfile when route state is absent.
    await page.goto('/game', { waitUntil: 'domcontentloaded' });

    // Start game (will fall back to mouse/touch mode due to getUserMedia stub).
    await page
      .getByRole('button', { name: /start learning|play with mouse\/touch/i })
      .click();
    await page.waitForTimeout(700);

    // In-game layout should be present.
    const gameLayout = page.getByTestId('game-layout');
    await expect(gameLayout).toBeVisible();

    // Regression guard: should not block the in-game state with camera recovery UI.
    await expect(page.getByText(/camera needs help/i)).toHaveCount(0);

    // Regression guard: the old DOM-based giant filled hint letter overlay used
    // `.alphabet-hint-letter`. This should not exist in the in-game state.
    await expect(page.locator('.alphabet-hint-letter')).toHaveCount(0);

    // Stabilize screenshot:
    // - Prompt stage transitions from center -> side after ~1.8s
    // - Webcam video/canvas can be frame-updated; hide video and disable transitions for determinism
    await page.addStyleTag({
      content: `
        * { transition: none !important; animation: none !important; }
        video { display: none !important; }
      `,
    });
    await page.waitForTimeout(2500);

    // Screenshot for human review.
    await expect(gameLayout).toHaveScreenshot('alphabet-game-in-game.png', {
      animations: 'disabled',
      timeout: 15000,
    });
  });
});
