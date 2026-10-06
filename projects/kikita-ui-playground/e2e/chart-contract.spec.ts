import type { Locator, Page } from '@playwright/test';

import { expect, test } from './support/fixtures';
import { waitForShellHydration } from './support/ssr';

/**
 * Chart contract (Plan 24): the behaviours that make a chart usable without a mouse, without colour
 * and at any width, measured in a real browser. Visual captures live in
 * `chart-playground.visual.spec.ts`; these tests assert behaviour only.
 */
const markSelector = '[role="graphics-symbol img"]';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 2400 });
  await page.goto('/components/chart');
  await expect(page.getByRole('heading', { level: 1, name: 'Chart' })).toBeVisible();
  await waitForShellHydration(page);
});

test.describe('shared tooltip', () => {
  test('is dismissed by Escape and stays closed until the pointer leaves and comes back', async ({
    page,
  }) => {
    const chart = minimalChart(page);
    const marks = chart.locator(markSelector);
    const tooltip = page.getByRole('tooltip');

    await marks.nth(1).hover({ force: true });
    await expect(tooltip).toHaveText('Sessions · Tue: 180');

    await page.keyboard.press('Escape');
    await expect(tooltip).toHaveCount(0);

    // Moving inside the same mark does not reopen it: the dismissal holds until a new trigger.
    await page.mouse.move(...(await center(marks.nth(1), 3, 0)));
    await expect(tooltip).toHaveCount(0);

    await page.mouse.move(2, 2);
    await marks.nth(2).hover({ force: true });
    await expect(tooltip).toHaveText('Sessions · Wed: 150');
  });

  test('follows the pointer without taking pointer events, and closes when it leaves the point', async ({
    page,
  }) => {
    const marks = minimalChart(page).locator(markSelector);
    const tooltip = page.getByRole('tooltip');

    await marks.nth(3).hover({ force: true });
    await expect(tooltip).toHaveText('Sessions · Thu: 220');
    // A tooltip that follows the pointer must never be a target of its own.
    await expect(tooltip).toHaveCSS('pointer-events', 'none');

    const [x, y] = await center(marks.nth(3));
    await page.mouse.move(x + 60, y + 60);
    await expect(tooltip).toHaveCount(0);
  });

  test('is dismissed by Escape on a plain [kuiTooltip] trigger too', async ({ page }) => {
    await page.goto('/components/tooltip');
    const trigger = page
      .getByRole('group', { name: 'Tooltip placement examples', exact: true })
      .getByRole('button')
      .first();
    const tooltip = page.getByRole('tooltip');

    await trigger.focus();
    await expect(tooltip).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(tooltip).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
});

test.describe('pointer', () => {
  test('shows a tooltip only while the pointer is on the point itself', async ({ page }) => {
    const chart = minimalChart(page);
    const mark = chart.locator(markSelector).nth(3);
    const [x, y] = await center(mark);

    await page.mouse.move(x, y + 70);
    await expect(page.getByRole('tooltip')).toHaveCount(0);

    await page.mouse.move(x, y);
    await expect(page.getByRole('tooltip')).toHaveText('Sessions · Thu: 220');
  });

  test('shows a tooltip on the bar itself and not between bars', async ({ page }) => {
    const chart = page.locator(
      '[role="graphics-document"][aria-label="Monthly and annual revenue by plan, vertical grouped bars"]',
    );
    // The first bar is a zero value with no height; aim at the first bar that has a body, because
    // the pointer position on a zero-height edge differs by a sub-pixel between engines.
    const bars = chart.locator('path.kui-chart__bar');
    let box = null;
    for (const bar of await bars.all()) {
      const candidate = await bar.boundingBox();
      if (candidate && candidate.height > 4 && candidate.width > 4) {
        box = candidate;
        break;
      }
    }

    if (!box) throw new Error('No bar has a body.');

    await page.mouse.move(box.x + box.width / 2, box.y - 30);
    await expect(page.getByRole('tooltip')).toHaveCount(0);

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page.getByRole('tooltip')).toHaveCount(1);

    await expect(chart.locator('.kui-chart__bar--hovered')).toHaveCount(1);
  });

  test('draws no focus frame around the chart when its plot is clicked', async ({ page }) => {
    const chart = minimalChart(page);
    const box = await chart.boundingBox();

    if (!box) throw new Error('The chart has no box.');

    await page.mouse.click(box.x + box.width * 0.4, box.y + box.height * 0.3);
    const outlines = await chart.evaluate((svg) =>
      Array.from(svg.querySelectorAll('g, rect, svg'))
        .concat(svg)
        .map((element) => getComputedStyle(element).outlineStyle),
    );

    expect(outlines.every((style) => style === 'none')).toBe(true);
  });

  test('focuses a mark when the point is pressed', async ({ page }) => {
    const chart = minimalChart(page);
    const marks = chart.locator(markSelector);
    const [x, y] = await center(marks.nth(4));

    await page.mouse.click(x, y);
    await expect(marks.nth(4)).toBeFocused();
  });
});

test.describe('hover', () => {
  test('highlights the legend entry of the hovered mark and dims the other series', async ({
    page,
  }) => {
    const chart = page.locator(
      '[role="graphics-document"][aria-label="Sessions, sign-ups, and trials per weekday"]',
    );
    const marks = chart.locator(markSelector);

    await marks.nth(1).hover({ force: true });
    await expect(page.getByRole('tooltip')).toHaveText('Sign-ups · Mon: 40');
    await expect(chart.locator('.kui-chart__line.kui-chart__series--dimmed')).toHaveCount(2);
    await expect(
      chart
        .locator('xpath=ancestor::section[1]')
        .getByRole('button', { name: 'Sign-ups', exact: true }),
    ).toHaveClass(/kui-chart__legend-item--active/);
  });
});

test.describe('keyboard', () => {
  test('moves between series with Up and Down and along a series with Left and Right', async ({
    page,
  }) => {
    const chart = page.locator(
      '[role="graphics-document"][aria-label="Sessions, sign-ups, and trials per weekday"]',
    );
    const marks = chart.locator(markSelector);

    await marks.first().focus();
    await expect(marks.first()).toHaveAttribute('aria-label', 'Sessions · Mon: 120');

    await page.keyboard.press('ArrowRight');
    await expect(page.locator(':focus')).toHaveAttribute('aria-label', 'Sessions · Tue: 180');
    await page.keyboard.press('ArrowDown');
    await expect(page.locator(':focus')).toHaveAttribute('aria-label', 'Sign-ups · Tue: 65');
    await page.keyboard.press('ArrowDown');
    await expect(page.locator(':focus')).toHaveAttribute('aria-label', 'Trials · Tue: 26');
    await page.keyboard.press('ArrowUp');
    await expect(page.locator(':focus')).toHaveAttribute('aria-label', 'Sign-ups · Tue: 65');
    await page.keyboard.press('End');
    await expect(page.locator(':focus')).toHaveAttribute('aria-label', 'Sign-ups · Sun: 120');
  });

  test('mirrors focus on hover: the focused mark shows its tooltip and highlights its series', async ({
    page,
  }) => {
    const chart = page.locator(
      '[role="graphics-document"][aria-label="Sessions, sign-ups, and trials per weekday"]',
    );
    const marks = chart.locator(markSelector);

    await marks.first().focus();
    await expect(page.getByRole('tooltip')).toHaveText('Sessions · Mon: 120');
    await expect(
      chart.locator('.kui-chart__series--dimmed[aria-label^="Sign-ups"]').first(),
    ).toBeAttached();
  });
});

test.describe('legibility', () => {
  test('draws axis and legend text at 12px or more on screen', async ({ page }) => {
    const sizes = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll<SVGTextElement>('svg.kui-chart__svg text.kui-chart__axis-text'),
      )
        .filter((text) => getComputedStyle(text).visibility !== 'hidden')
        .map((text) => {
          const scale = text.getScreenCTM()?.a ?? 1;

          return parseFloat(getComputedStyle(text).fontSize) * scale;
        }),
    );

    expect(sizes.length).toBeGreaterThan(50);
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(12);
  });

  test('gives legend buttons and scatter marks a target of at least 24px', async ({ page }) => {
    const heights = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.kui-chart__legend-item')).map(
        (item) => item.getBoundingClientRect().height,
      ),
    );
    const hits = await page.evaluate(() =>
      Array.from(document.querySelectorAll('circle.kui-chart__mark-hit')).map(
        (hit) => hit.getBoundingClientRect().width,
      ),
    );

    expect(Math.min(...heights)).toBeGreaterThanOrEqual(24);
    expect(hits.length).toBeGreaterThan(0);
    // The chart is measured in whole pixels, so a 24-unit circle can draw a hair under 24px.
    expect(Math.min(...hits)).toBeGreaterThanOrEqual(23.9);
  });

  test('keeps the plot at the pixel size of its text in a narrow container', async ({ page }) => {
    const narrow = page.locator('.chart-dense-examples__narrow').first();
    const svg = narrow.locator('svg.kui-chart__svg');
    const [box, viewBox] = await Promise.all([svg.boundingBox(), svg.getAttribute('viewBox')]);

    expect(box).not.toBeNull();
    const [, , width] = (viewBox ?? '').split(' ').map(Number);

    // One user unit per CSS pixel, so text is never scaled down with the container.
    expect(Math.abs(width - (box?.width ?? 0))).toBeLessThan(1);
  });
});

test.describe('colour independence', () => {
  test('draws the marks of different series in different shapes', async ({ page }) => {
    const chart = page.locator(
      '[role="graphics-document"][aria-label="Sessions, sign-ups, and trials per weekday"]',
    );
    const shapes = await chart
      .locator('path.kui-chart__mark')
      .evaluateAll((marks) => new Set(marks.map((mark) => mark.getAttribute('d'))).size);

    expect(shapes).toBe(3);
  });

  test('fills bars with hatch patterns when patterns is on', async ({ page }) => {
    const chart = page.locator(
      '[role="graphics-document"][aria-label="Monthly and annual revenue by plan with hatch patterns"]',
    );
    const fills = await chart
      .locator('path.kui-chart__bar')
      .evaluateAll((bars) => new Set(bars.map((bar) => (bar as SVGElement).style.fill)).size);

    expect(fills).toBe(2);
    await expect(chart.locator('pattern')).toHaveCount(2);
  });

  test('switches to system colours, dashes and patterns in forced colours', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    const lines = page
      .locator(
        '[role="graphics-document"][aria-label="Sessions, sign-ups, and trials per weekday"]',
      )
      .locator('path.kui-chart__line');
    const dashes = await lines.evaluateAll((paths) =>
      paths.map((path) => getComputedStyle(path).strokeDasharray),
    );
    const bars = page
      .locator(
        '[role="graphics-document"][aria-label="Monthly and annual revenue by plan, vertical grouped bars"]',
      )
      .locator('path.kui-chart__bar');
    const fills = await bars.evaluateAll((rects) =>
      rects.map((rect) => getComputedStyle(rect).fill),
    );

    expect(new Set(dashes).size).toBe(3);
    expect(fills.every((fill) => fill.startsWith('url('))).toBe(true);
    expect(new Set(fills).size).toBe(2);
  });
});

test.describe('loading', () => {
  test('shrinks the bar skeleton with its container instead of overflowing it', async ({
    page,
  }) => {
    const overflowing = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.kui-chart__loading-bars')).flatMap((bars) => {
        const edge = bars.getBoundingClientRect().right;

        return Array.from(bars.querySelectorAll('.kui-chart__loading-bars-bar'))
          .filter((bar) => bar.getBoundingClientRect().right > edge + 0.5)
          .map(() => Math.round(edge));
      }),
    );

    expect(overflowing).toEqual([]);
  });

  test('keeps the Chart page free of horizontal scroll', async ({ page }) => {
    const overflow = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('main *'))
        .filter((element) => element instanceof HTMLElement)
        .filter((element) => element.scrollWidth > element.clientWidth + 1)
        .filter((element) => getComputedStyle(element).overflowX === 'visible')
        .map(
          (element) => `${element.tagName.toLowerCase()}.${element.getAttribute('class') ?? ''}`,
        ),
    );

    expect(overflow).toEqual([]);
  });
});

test.describe('motion', () => {
  test('re-partitions the donut at once when reduced motion is on', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const example = page
      .getByRole('group', { name: 'Three slices', exact: true })
      .and(page.locator('section'));
    const slices = example.locator('path.kui-chart__slice');

    await expect(slices).toHaveCount(3);
    await example.getByRole('button', { name: 'Free' }).click();
    await expect(slices).toHaveCount(2, { timeout: 120 });
  });

  test('finishes the sweep early when reduced motion is turned on while it runs', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const example = page
      .getByRole('group', { name: 'Three slices', exact: true })
      .and(page.locator('section'));
    const slices = example.locator('path.kui-chart__slice');

    await example.getByRole('button', { name: 'Free' }).click();
    await expect(slices).toHaveCount(3);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(slices).toHaveCount(2, { timeout: 150 });
  });
});

test.describe('identity and hydration', () => {
  test('server markup and hydrated markup carry the same chart ids', async ({ page }) => {
    const server = await (await page.request.get('/components/chart')).text();
    const serverIds = new Set(
      Array.from(server.matchAll(/id="(kui-[a-z-]+-chart-\d+-(?:mark|slice|bar)-\d+)"/g)).map(
        (match) => match[1],
      ),
    );
    const clientIds = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[id^="kui-"][id*="-chart-"]')).map(
        (element) => element.id,
      ),
    );

    expect(serverIds.size).toBeGreaterThan(50);
    for (const id of serverIds) expect(clientIds).toContain(id);
  });

  test('never repeats an id when many charts share one page', async ({ page }) => {
    const duplicates = await page.evaluate(() => {
      const seen = new Map<string, number>();

      for (const element of document.querySelectorAll('[id]')) {
        seen.set(element.id, (seen.get(element.id) ?? 0) + 1);
      }

      return [...seen].filter(([, count]) => count > 1).map(([id]) => id);
    });

    expect(duplicates).toEqual([]);
  });
});

test.describe('performance', () => {
  // The budgets are generous ceilings, not goals; the measured numbers are in docs/chart.md.
  for (const [count, budget] of [
    [500, 500],
    [2000, 1000],
    [5000, 2000],
  ] as const) {
    test(`draws ${count} points within ${budget}ms`, async ({ page }) => {
      const button = page.locator(`[data-stress-size="${count}"]`);

      await button.scrollIntoViewIfNeeded();
      const elapsed = await page.evaluate(async (size) => {
        const trigger = document.querySelector<HTMLElement>(`[data-stress-size="${size}"]`);
        const start = performance.now();

        trigger?.click();
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

        return performance.now() - start;
      }, count);
      const nodes = await page.evaluate(
        () => document.querySelector('[data-stress-charts]')?.querySelectorAll('*').length ?? 0,
      );

      test.info().annotations.push({
        type: 'measurement',
        description: `${count} points: ${Math.round(elapsed)}ms to paint, ${nodes} DOM nodes`,
      });
      expect(elapsed).toBeLessThan(budget);
      await expect(page.locator('[data-stress-charts] svg.kui-chart__svg')).toHaveCount(2);
    });
  }

  test('draws only the focused mark of a dense line chart and every point of a scatter chart', async ({
    page,
  }) => {
    await page.locator('[data-stress-size="2000"]').click();
    const charts = page.locator('[data-stress-charts]');

    await expect(charts.locator('path.kui-chart__mark').first()).toBeAttached();
    await expect(
      charts
        .locator('[role="graphics-document"][aria-label="Sessions over many days"]')
        .locator(markSelector),
    ).toHaveCount(1);
    await expect(
      charts
        .locator('[role="graphics-document"][aria-label="Age and income for many accounts"]')
        .locator(markSelector),
    ).toHaveCount(2000);
  });

  test('hides and shows a series quickly on a dense chart', async ({ page }) => {
    await page.locator('[data-stress-size="2000"]').click();
    const legend = page.locator('[data-stress-charts] .kui-chart__legend-item').first();

    await legend.scrollIntoViewIfNeeded();
    const elapsed = await page.evaluate(async () => {
      const item = document.querySelector<HTMLElement>(
        '[data-stress-charts] .kui-chart__legend-item',
      );
      const start = performance.now();

      item?.click();
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      return performance.now() - start;
    });

    test.info().annotations.push({
      type: 'measurement',
      description: `hide on 2000 points: ${Math.round(elapsed)}ms to paint`,
    });
    expect(elapsed).toBeLessThan(1000);
  });
});

function minimalChart(page: Page): Locator {
  return page
    .getByRole('group', { name: 'Minimal chart', exact: true })
    .and(page.locator('section'))
    .locator('[role="graphics-document"][aria-label="Sessions per weekday"]');
}

/** The centre of an element in page coordinates, optionally shifted. */
async function center(locator: Locator, dx = 0, dy = 0): Promise<[number, number]> {
  const box = await locator.boundingBox();

  if (!box) throw new Error('The element has no box.');

  return [box.x + box.width / 2 + dx, box.y + box.height / 2 + dy];
}
