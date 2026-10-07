import { expect, type Page } from '@playwright/test';

/**
 * One browser-side failure observed while a test was running.
 */
export interface BrowserErrorRecord {
  /** `console` for `console.error` output, `pageerror` for uncaught exceptions and rejections. */
  readonly kind: 'console' | 'pageerror' | 'crash';
  readonly text: string;
  /** Source URL reported by the browser, when it has one (for example a failed resource). */
  readonly url?: string;
}

/**
 * A browser error that is known and accepted. Every entry must say why, so the allowlist stays a
 * list of justified exceptions instead of a place to hide failures.
 *
 * The collector validates an allowance when it is created and throws for: no pattern at all, a blank
 * reason, a stateful pattern (`g` or `y` flag), and an obvious catch-all pattern, meaning one that
 * matches the empty string or every string in {@link catchAllProbes}. That is the whole guarantee.
 * A merely broad pattern such as `/error/i` is not detected and is left to review.
 */
export interface BrowserErrorAllowance {
  /** Matches the message text. */
  readonly message?: RegExp;
  /** Matches the URL the browser attributes the message to. */
  readonly url?: RegExp;
  /** Why this message is acceptable and who owns removing the exception. */
  readonly reason: string;
}

/**
 * Strings a catch-all pattern cannot avoid matching: a message, an error, a resource failure, a
 * framework code and two URLs. A pattern that matches all of them is treated as "match everything".
 */
export const catchAllProbes: readonly string[] = [
  'a',
  'Error: x',
  'TypeError: Cannot read properties of undefined',
  'Failed to load resource: the server responded with a status of 500',
  'NG0500: During hydration Angular expected a text node',
  'http://127.0.0.1:4310/main.js',
  'https://example.com/a.js',
];

/**
 * Throws when an allowance is not specific enough to be a justified exception.
 */
export function assertValidAllowance(allowance: BrowserErrorAllowance): void {
  if (!allowance.reason.trim()) {
    throw new Error('Browser error allowance needs a reason.');
  }
  if (!allowance.message && !allowance.url) {
    throw new Error(`Browser error allowance needs a message or url pattern: ${allowance.reason}`);
  }

  for (const [kind, pattern] of [
    ['message', allowance.message],
    ['url', allowance.url],
  ] as const) {
    if (!pattern) continue;

    if (pattern.global || pattern.sticky) {
      throw new Error(
        `Browser error allowance ${kind} pattern must not use the g or y flag: ${allowance.reason}`,
      );
    }
    if (pattern.test('') || catchAllProbes.every((probe) => pattern.test(probe))) {
      throw new Error(
        `Browser error allowance ${kind} pattern ${pattern} matches everything: ${allowance.reason}`,
      );
    }
  }
}

/**
 * Third-party icon CDN used by the default Lucide icon set. `kui-icon-lucide-default.ts` swallows
 * fetch failures by design, but Chrome still logs a failed request as a console error. An
 * environment without internet access must not turn that library fallback into a test failure;
 * icon rendering itself is covered by dedicated icon tests.
 */
export const lucideCdnOfflineAllowance: BrowserErrorAllowance = {
  message: /Failed to load resource/,
  url: /^https:\/\/cdn\.jsdelivr\.net\/npm\/lucide-static@[\d.]+\/icons\/[a-z0-9-]+\.svg$/,
  reason:
    'Default Lucide icons by name load from the jsDelivr CDN at a pinned version and the library swallows the failure by design. Structural icons never use the network.',
};

/**
 * Collects console errors and uncaught page errors for the whole life of a page, so an error raised
 * by a late timer, an overlay closing, or a route teardown is not lost between assertions.
 */
export class BrowserErrorCollector {
  private readonly records: BrowserErrorRecord[] = [];

  constructor(
    page: Page,
    private readonly allowances: readonly BrowserErrorAllowance[] = [],
  ) {
    allowances.forEach(assertValidAllowance);

    page.on('console', (message) => {
      if (message.type() !== 'error') return;
      const url = message.location().url;
      this.records.push({ kind: 'console', text: message.text(), ...(url ? { url } : {}) });
    });
    page.on('pageerror', (error) => {
      this.records.push({ kind: 'pageerror', text: error.stack ?? error.message });
    });
    page.on('crash', () => {
      this.records.push({ kind: 'crash', text: 'The page crashed.' });
    });
  }

  /** Errors seen so far that no allowance explains. */
  unexpected(): readonly BrowserErrorRecord[] {
    return this.records.filter((record) => !this.isAllowed(record));
  }

  /**
   * Fails immediately when an unexpected error has been seen. Use it as a checkpoint right after an
   * interaction; the fixture runs the same check again at teardown.
   */
  expectNone(): void {
    expect(this.unexpected(), 'Unexpected browser console or page errors').toEqual([]);
  }

  private isAllowed(record: BrowserErrorRecord): boolean {
    return this.allowances.some(
      (allowance) =>
        (!allowance.message || allowance.message.test(record.text)) &&
        (!allowance.url || (record.url !== undefined && allowance.url.test(record.url))),
    );
  }
}

/**
 * Lets work that an interaction already scheduled reach the collector before it is inspected: a
 * timer callback, a promise rejection or a queued console message.
 *
 * A Playwright action resolves as soon as the browser handled the input, not when everything the
 * input triggered has run. This waits one timer turn in the page (a timer scheduled during the last
 * interaction is due before this one) and then round-trips so the resulting events are delivered.
 * When a fake clock owns the page timers, a timer turn would never come, so only the round-trip runs.
 */
export async function flushBrowserEvents(page: Page): Promise<void> {
  if (page.isClosed()) return;

  await page
    .evaluate(
      () =>
        new Promise<void>((resolve) => {
          const timersAreFaked = 'clock' in setTimeout;

          if (timersAreFaked) resolve();
          else setTimeout(resolve, 0);
        }),
    )
    .catch(() => undefined);
  await page.evaluate(() => undefined).catch(() => undefined);
}
