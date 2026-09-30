import { expect, test as base } from '@playwright/test';

import {
  type BrowserErrorAllowance,
  BrowserErrorCollector,
  flushBrowserEvents,
  lucideCdnOfflineAllowance,
} from './browser-errors';

export { expect };
export type { BrowserErrorAllowance };
export { BrowserErrorCollector };

interface HarnessFixtures {
  /**
   * Console and page errors collected for the whole test. It runs for every test (auto fixture)
   * and fails the test at teardown when an unexpected error was seen, including errors raised
   * after the last assertion. Call `browserErrors.expectNone()` for an earlier checkpoint.
   */
  browserErrors: BrowserErrorCollector;
}

interface HarnessOptions {
  /**
   * Justified, message-specific exceptions to the error check. Set with `test.use()` in the file or
   * describe block that owns the exception, never globally by a broad pattern.
   */
  browserErrorAllowances: readonly BrowserErrorAllowance[];
}

/**
 * Playwright `test` with the shared error-capture harness. Import it instead of
 * `@playwright/test` in every browser spec.
 */
export const test = base.extend<HarnessFixtures & HarnessOptions>({
  browserErrorAllowances: [[lucideCdnOfflineAllowance], { option: true }],

  browserErrors: [
    async ({ page, browserErrorAllowances, javaScriptEnabled }, use) => {
      const collector = new BrowserErrorCollector(page, browserErrorAllowances);

      await use(collector);

      // With scripts disabled nothing can be evaluated in the page, and no page script can fail.
      if (javaScriptEnabled) await flushBrowserEvents(page);
      collector.expectNone();
    },
    { auto: true },
  ],
});
