import { defineConfig, devices } from '@playwright/test';

import base from './playwright.config';

export default defineConfig({
  ...base,
  projects: [
    {
      name: 'firefox',
      grepInvert: /@visual/,
      use: { ...devices['Desktop Firefox'], contextOptions: { reducedMotion: 'no-preference' } },
    },
    {
      name: 'webkit',
      grepInvert: /@visual/,
      use: { ...devices['Desktop Safari'], contextOptions: { reducedMotion: 'no-preference' } },
    },
  ],
});
