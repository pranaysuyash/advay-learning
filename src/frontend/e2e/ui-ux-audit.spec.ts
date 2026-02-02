import { test } from '@playwright/test';

test.describe('UI/UX Audit Screenshots', () => {
  const pages = [
    { path: '/', name: 'home' },
    { path: '/login', name: 'login' },
    { path: '/register', name: 'register' },
    { path: '/dashboard', name: 'dashboard', auth: true },
    { path: '/games', name: 'games', auth: true },
    {
      path: '/games/finger-number-show',
      name: 'finger-number-show',
      auth: true,
    },
    { path: '/games/connect-the-dots', name: 'connect-the-dots', auth: true },
    { path: '/games/letter-hunt', name: 'letter-hunt', auth: true },
    { path: '/progress', name: 'progress', auth: true },
    { path: '/settings', name: 'settings', auth: true },
  ];

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet', width: 834, height: 1112 },
    { name: 'mobile', width: 390, height: 844 },
  ];

  pages.forEach((pageInfo) => {
    test.describe(`Page: ${pageInfo.name}`, () => {
      viewports.forEach((vp) => {
        test(`Capture ${vp.name} view`, async ({ page }) => {
          // Set viewport
          await page.setViewportSize({ width: vp.width, height: vp.height });

          // Navigate to page
          await page.goto(pageInfo.path);

          // Wait for page to load
          await page.waitForLoadState('networkidle', { timeout: 10000 });

          // Handle login if needed
          if (pageInfo.auth) {
            // Check if already authenticated by checking URL or auth state
            const currentUrl = page.url();
            if (
              currentUrl.includes('/login') ||
              currentUrl === 'http://localhost:6173/login'
            ) {
              // Auto-login for screenshot purposes
              await page.fill(
                'input[name="email"], input[type="email"]',
                'pranay.suyash@gmail.com',
              );
              await page.fill(
                'input[name="password"], input[type="password"]',
                'pranaysuyash',
              );
              await page.click('button[type="submit"]');
              await page.waitForLoadState('networkidle', { timeout: 15000 });
              // Navigate back to intended page
              await page.goto(pageInfo.path);
              await page.waitForLoadState('networkidle', { timeout: 15000 });
            } else if (currentUrl === 'http://localhost:6173/') {
              // Navigate to login first
              await page.goto('/login');
              await page.fill(
                'input[name="email"], input[type="email"]',
                'pranay.suyash@gmail.com',
              );
              await page.fill(
                'input[name="password"], input[type="password"]',
                'pranaysuyash',
              );
              await page.click('button[type="submit"]');
              await page.waitForLoadState('networkidle', { timeout: 15000 });
              // Navigate to intended page
              await page.goto(pageInfo.path);
              await page.waitForLoadState('networkidle', { timeout: 15000 });
            }
          }

          // Wait a bit more for animations to settle
          await page.waitForTimeout(1000);

          // Capture full page screenshot
          await page.screenshot({
            path: `docs/audit/screenshots/${pageInfo.name}-${vp.name}-full.png`,
            fullPage: true,
          });

          // Capture above the fold
          await page.screenshot({
            path: `docs/audit/screenshots/${pageInfo.name}-${vp.name}-above-fold.png`,
            fullPage: false,
          });

          console.log(`Captured ${pageInfo.name} - ${vp.name}`);
        });
      });
    });
  });

  // Capture interactive states for key pages
  test.describe('Interactive States', () => {
    test('Home - Button hover states', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/');
      await page.waitForLoadState('networkidle', { timeout: 10000 });

      // Find primary buttons and capture hover
      const buttons = await page.locator('button').all();
      for (let i = 0; i < Math.min(buttons.length, 3); i++) {
        await buttons[i].hover();
        await page.screenshot({
          path: `docs/audit/screenshots/home-button-${i}-hover.png`,
        });
      }
    });

    test('Dashboard - Empty state (if applicable)', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      await page.screenshot({
        path: `docs/audit/screenshots/dashboard-empty.png`,
        fullPage: true,
      });
    });
  });

  // Capture modal/dialog states
  test.describe('Modal and Overlay States', () => {
    test('Tutorial Overlay', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/');
      await page.waitForLoadState('networkidle', { timeout: 10000 });

      // Look for tutorial or onboarding
      const hasTutorial =
        (await page
          .locator('[class*="tutorial"], [class*="onboarding"]')
          .count()) > 0;
      if (hasTutorial) {
        await page.screenshot({
          path: `docs/audit/screenshots/home-tutorial-overlay.png`,
          fullPage: true,
        });
      }
    });
  });
});
