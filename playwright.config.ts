import {
  defineConfig,
  devices,
} from './src/frontend/node_modules/@playwright/test';

export default defineConfig({
  testDir: './src/frontend/src/**/*.e2e.test.ts',
  fullyParallel: false,
  forbidOnly: false,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:6173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:6173',
    reuseExistingServer: !process.env.CI,
    cwd: './src/frontend',
  },
});
