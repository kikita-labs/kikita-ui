import { BrowserErrorCollector, lucideCdnOfflineAllowance } from './support/browser-errors';
import { expect, test } from './support/fixtures';

/**
 * These tests protect the harness itself. A green suite proves nothing if the error check cannot
 * fail, so each test forces a failure mode and asserts the harness notices it.
 *
 * Probe pages come from `context.newPage()` because the auto fixture only watches `page`; an
 * intentional error on `page` would fail the test that provokes it.
 */
const lateErrorMarkup = `
  <button>Trigger</button>
  <script>
    document.querySelector('button').addEventListener('click', () => {
      setTimeout(() => {
        throw new Error('late failure after interaction');
      }, 0);
    });
  </script>
`;

test.describe('browser error harness', () => {
  test('records an uncaught error raised by a timer after an interaction', async ({ context }) => {
    const probe = await context.newPage();
    const collector = new BrowserErrorCollector(probe);
    await probe.setContent(lateErrorMarkup);

    collector.expectNone();
    await probe.getByRole('button', { name: 'Trigger' }).click();

    await expect
      .poll(() => collector.unexpected().map((record) => record.kind))
      .toEqual(['pageerror']);
    expect(collector.unexpected()[0]?.text).toContain('late failure after interaction');
    expect(() => collector.expectNone()).toThrow();
  });

  test('records console errors and ignores warnings and logs', async ({ context }) => {
    const probe = await context.newPage();
    const collector = new BrowserErrorCollector(probe);

    await probe.evaluate(() => {
      console.warn('warning is not an error');
      console.log('log is not an error');
      console.error('real console error');
    });

    await expect
      .poll(() => collector.unexpected().map((record) => record.text))
      .toEqual(['real console error']);
  });

  test('accepts only messages that match a justified allowance', async ({ context }) => {
    const probe = await context.newPage();
    const collector = new BrowserErrorCollector(probe, [
      { message: /^known noisy dependency:/, reason: 'Probe: a documented third-party message.' },
    ]);

    await probe.evaluate(() => {
      console.error('known noisy dependency: retry scheduled');
      console.error('known noisy dependency is not the same as an application failure');
    });

    await expect
      .poll(() => collector.unexpected().map((record) => record.text))
      .toEqual(['known noisy dependency is not the same as an application failure']);
  });

  test('rejects an allowance with no pattern or no reason', async ({ context }) => {
    const probe = await context.newPage();

    expect(() => new BrowserErrorCollector(probe, [{ reason: 'no pattern at all' }])).toThrow(
      /message or url pattern/,
    );
    expect(
      () => new BrowserErrorCollector(probe, [{ message: /^specific failure$/, reason: '   ' }]),
    ).toThrow(/needs a reason/);
  });

  // Each of these has a non-empty reason, so only the catch-all rule can reject them.
  for (const pattern of [/.*/, /[\s\S]*/, /(?:)/, /^/, /./, /.+/s, /\w|\W/]) {
    test(`rejects the catch-all pattern ${pattern}`, async ({ context }) => {
      const probe = await context.newPage();

      expect(
        () =>
          new BrowserErrorCollector(probe, [{ message: pattern, reason: 'Probe: a real reason.' }]),
      ).toThrow(/matches everything/);
      expect(
        () => new BrowserErrorCollector(probe, [{ url: pattern, reason: 'Probe: a real reason.' }]),
      ).toThrow(/matches everything/);
    });
  }

  test('rejects stateful patterns', async ({ context }) => {
    const probe = await context.newPage();

    expect(
      () =>
        new BrowserErrorCollector(probe, [
          { message: /^specific failure$/g, reason: 'Probe: a real reason.' },
        ]),
    ).toThrow(/g or y flag/);
  });

  test('accepts narrow patterns, including the Lucide CDN exception', async ({ context }) => {
    const probe = await context.newPage();

    expect(
      () =>
        new BrowserErrorCollector(probe, [
          lucideCdnOfflineAllowance,
          {
            message: /^known noisy dependency:/,
            reason: 'Probe: a documented third-party message.',
          },
          { url: /^https:\/\/cdn\.example\.com\//, reason: 'Probe: a specific host.' },
        ]),
    ).not.toThrow();
  });

  // The fixture asserts at teardown. `test.fail()` makes this test pass only when that teardown
  // assertion fails it, so removing or weakening the check turns this test red.
  test.fail(
    'fails the test at teardown for a timer error after its last assertion',
    async ({ page }) => {
      await page.setContent(`
      <button>Trigger</button>
      <script>
        document.querySelector('button').addEventListener('click', () => {
          setTimeout(() => {
            throw new Error('error after the last assertion');
          }, 0);
        });
      </script>
    `);
      await page.getByRole('button', { name: 'Trigger' }).click();
    },
  );

  test('runs behavior projects with production motion', async ({ page }) => {
    await page.setContent('<p>motion</p>');

    const prefersReducedMotion = await page.evaluate(
      () => matchMedia('(prefers-reduced-motion: reduce)').matches,
    );

    expect(prefersReducedMotion).toBe(false);
  });

  // Only the visual project stabilizes motion. Behavior tests run with production motion, so a
  // broken enter or exit animation cannot hide behind the screenshot setup.
  test('runs visual captures with reduced motion @visual', async ({ page }) => {
    await page.setContent('<p>motion</p>');

    const prefersReducedMotion = await page.evaluate(
      () => matchMedia('(prefers-reduced-motion: reduce)').matches,
    );

    expect(prefersReducedMotion).toBe(true);
  });
});
