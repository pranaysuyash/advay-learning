import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    __BETA_LOCAL_AI_ENABLED__: false,
  },
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/e2e/**'],
    setupFiles: ['src/frontend/test/setupTests.ts'],
  },
});
