import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tools/assert-playground-build.mjs',
  fullyParallel: false,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 2 : 1,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : 'list',
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.02,
    },
  },
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    colorScheme: 'light',
    // Pin what changes text and dates between machines. Motion is set per project below.
    locale: 'en-US',
    timezoneId: 'UTC',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  // Behavior, accessibility and responsive projects run with production motion. Only screenshot
  // baselines stabilize motion, so a broken enter/exit animation is still caught by behavior tests.
  projects: [
    {
      name: 'e2e',
      testMatch: /(behavior|harness|interaction|interaction-widgets|touch)\.spec\.ts/,
      use: { contextOptions: { reducedMotion: 'no-preference' } },
    },
    {
      name: 'a11y',
      testMatch: /accessibility\.spec\.ts/,
      use: { contextOptions: { reducedMotion: 'no-preference' } },
    },
    {
      name: 'responsive',
      testMatch: /responsive\.spec\.ts/,
      use: { contextOptions: { reducedMotion: 'no-preference' } },
    },
    {
      name: 'visual',
      testMatch: /visual\.spec\.ts/,
      use: { contextOptions: { reducedMotion: 'reduce' } },
    },
  ],
  webServer: {
    command: 'node tools/serve-playground-dist.mjs',
    url: baseURL,
    reuseExistingServer: !process.env['CI'],
    timeout: 30_000,
  },
});
