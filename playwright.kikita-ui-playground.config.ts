import { defineConfig, devices } from '@playwright/test';

const testPort = process.env['KIKITA_UI_PLAYGROUND_TEST_PORT'] ?? '4310';
const baseURL = `http://127.0.0.1:${testPort}`;

export default defineConfig({
  testDir: './projects/kikita-ui-playground/e2e',
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
  webServer: {
    command: 'node dist/kikita-ui-playground/server/server.mjs',
    env: { PORT: testPort },
    url: baseURL,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
