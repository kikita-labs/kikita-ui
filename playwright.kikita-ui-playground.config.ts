import { defineConfig, devices } from '@playwright/test';

const testPort = process.env['KIKITA_UI_PLAYGROUND_TEST_PORT'] ?? '4310';
const baseURL = `http://127.0.0.1:${testPort}`;

export default defineConfig({
  testDir: './projects/kikita-ui-playground/e2e',
  globalSetup: './tools/assert-replacement-playground-build.mjs',
  fullyParallel: false,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 2 : 0,
  workers: 1,
  // Baselines predate the project split and carry no project name; keep their paths unchanged.
  snapshotPathTemplate:
    '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-snapshotSuffix}{ext}',
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    locale: 'en-US',
    timezoneId: 'UTC',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  // Tests whose title carries `@visual` take screenshots and run with reduced motion so captures are
  // stable. Everything else runs with production motion, so a broken enter or exit animation is not
  // hidden. A test that verifies a specific motion mode emulates it itself.
  projects: [
    {
      name: 'behavior',
      grepInvert: /@visual/,
      use: { contextOptions: { reducedMotion: 'no-preference' } },
    },
    {
      name: 'visual',
      grep: /@visual/,
      use: { contextOptions: { reducedMotion: 'reduce' } },
    },
  ],
  webServer: {
    command: 'node dist/kikita-ui-playground/server/server.mjs',
    env: { PORT: testPort },
    url: baseURL,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
