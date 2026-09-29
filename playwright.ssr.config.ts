import { defineConfig, devices } from '@playwright/test';

const testPort = process.env['KIKITA_UI_SSR_TEST_PORT'] ?? '4000';
const baseURL = `http://127.0.0.1:${testPort}`;

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tools/assert-playground-build.mjs',
  fullyParallel: false,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 2 : 0,
  workers: 1,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    locale: 'en-US',
    timezoneId: 'UTC',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'ssr', testMatch: /ssr-hydration\.spec\.ts/ }],
  webServer: {
    // Not `dist/playground/server/server.mjs` alone: it renders routes but serves no client scripts.
    command: 'node tools/serve-playground-ssr.mjs',
    env: { PORT: testPort },
    url: baseURL,
    // A reused server keeps serving the bundle it loaded at start, which can hide a stale build.
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
