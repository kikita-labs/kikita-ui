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

  /**
   * `page.goto()` also waits for Angular hydration, so a test never types or clicks into server
   * markup whose handlers are not attached yet (the replayed event would otherwise race the
   * assertions). Angular removes the `ngh` attribute from each host as it hydrates, so none left
   * means the page is interactive. A navigation that stops at `waitUntil: 'commit'` is meant to
   * inspect the server response and is left alone, as are tests without JavaScript.
   */
  page: async ({ page, javaScriptEnabled }, use) => {
    if (javaScriptEnabled) {
      const goto = page.goto.bind(page);

      page.goto = async (url, options) => {
        const response = await goto(url, options);

        if (options?.waitUntil !== 'commit') {
          await page.waitForFunction(() => document.querySelector('[ngh]') === null);
        }

        return response;
      };
    }

    await use(page);
  },

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
