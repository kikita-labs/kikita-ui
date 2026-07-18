import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4000';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 2 : 0,
  workers: 1,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'ssr', testMatch: /ssr-hydration\.spec\.ts/ }],
  webServer: {
    command: 'node dist/playground/server/server.mjs',
    url: baseURL,
    reuseExistingServer: !process.env['CI'],
    timeout: 30_000,
  },
});
