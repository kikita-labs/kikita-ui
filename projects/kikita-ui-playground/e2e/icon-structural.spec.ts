import type { Locator, Page } from '@playwright/test';

import { expect, test } from './support/fixtures';
import { settleAnimations } from './support/page-ready';
import { openWithHeldScripts, waitForShellHydration } from './support/ssr';

/**
 * Structural icons (Plan 20): built-in chrome glyphs are drawn from data, follow the stroke tokens,
 * can be replaced per subtree with `defaults.icons`, and keep working in forced-colors mode.
 */
async function open(page: Page): Promise<void> {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('/components/icon');
  await expect(page.locator('.component-list__item[aria-current="page"]')).toHaveAttribute(
    'href',
    '/components/icon',
  );
  await expect(page.getByRole('heading', { level: 1, name: 'Icon', exact: true })).toBeVisible();
  await settleAnimations(page);
}

function strokeWidth(locator: Locator): Promise<number> {
  return locator.evaluate((element) => Number.parseFloat(getComputedStyle(element).strokeWidth));
}

function chromeGroup(page: Page, name: string): Locator {
  return page.getByRole('group', { name, exact: true });
}

test('draws structural icons in the server HTML as plain svg data', async ({ page }) => {
  const response = await page.request.get('/components/icon');

  expect(response.ok()).toBe(true);

  const markup = await response.text();
  const closeStart = markup.indexOf('kui-alert__close');

  expect(closeStart, 'the alert close button is server-rendered').toBeGreaterThan(-1);
  expect(markup.indexOf('class="kui-glyph', closeStart)).toBeGreaterThan(closeStart);
  expect(markup).not.toMatch(/<svg[^>]*kuiGlyph/);
});

test('keeps each call site weight by default and follows --kui-icon-stroke-width on a subtree', async ({
  page,
}) => {
  await open(page);

  const weights = async (name: string) => {
    const group = chromeGroup(page, name);

    await expect(group.locator('.kui-chip-remove svg')).toBeVisible();

    return {
      chipRemove: await strokeWidth(group.locator('.kui-chip-remove svg')),
      alertClose: await strokeWidth(group.locator('.kui-alert__close svg')),
      alertStatus: await strokeWidth(group.locator('.kui-alert__icon svg')),
    };
  };

  expect(await weights('Default structural icons')).toEqual({
    chipRemove: 2,
    alertClose: 1.5,
    alertStatus: 1.5,
  });
  expect(await weights('Thin structural icons')).toEqual({
    chipRemove: 1,
    alertClose: 1,
    alertStatus: 1,
  });
  expect(await weights('Thick structural icons')).toEqual({
    chipRemove: 3,
    alertClose: 3,
    alertStatus: 3,
  });
});

test('sets stroke width and non-scaling stroke on content icons only when asked', async ({
  page,
}) => {
  await open(page);

  for (const width of [1, 1.5, 2, 3]) {
    const icon = page
      .getByRole('group', { name: `Stroke width ${width}`, exact: true })
      .locator('kui-icon');

    await expect(icon.locator('svg.kui-icon__glyph')).toBeVisible();
    expect(await strokeWidth(icon.locator('svg.kui-icon__glyph')), `strokeWidth ${width}`).toBe(
      width,
    );
  }

  const effect = (name: string) =>
    page
      .getByRole('group', { name, exact: true })
      .locator('kui-icon svg.kui-icon__glyph path')
      .first()
      .evaluate((element) => getComputedStyle(element).vectorEffect);

  expect(await effect('Scaling stroke at 96 pixels')).toBe('none');
  expect(await effect('Constant pixel stroke at 96 pixels')).toBe('non-scaling-stroke');
});

test('keeps the stroke the same number of pixels at any size only in the constant-stroke row', async ({
  page,
}) => {
  await open(page);

  const rendered = async (name: string) =>
    page
      .getByRole('group', { name, exact: true })
      .locator('kui-icon svg.kui-icon__glyph path')
      .first()
      .evaluate((path) => {
        const element = path as SVGPathElement;
        const scale = element.getScreenCTM()?.a ?? 1;
        const styles = getComputedStyle(element);
        const strokeUnits = Number.parseFloat(styles.strokeWidth);

        // A non-scaling stroke is already measured in screen pixels.
        return styles.vectorEffect === 'non-scaling-stroke' ? strokeUnits : strokeUnits * scale;
      });

  const scaling = [
    await rendered('Scaling stroke at 24 pixels'),
    await rendered('Scaling stroke at 96 pixels'),
  ];
  const constant = [
    await rendered('Constant pixel stroke at 24 pixels'),
    await rendered('Constant pixel stroke at 96 pixels'),
  ];

  expect(scaling[1] / scaling[0], 'a scaling stroke grows with the icon').toBeCloseTo(4, 1);
  expect(constant[1] / constant[0], 'a constant stroke does not').toBeCloseTo(1, 1);
});

test('replaces structural icons only inside the subtree that provides defaults.icons', async ({
  page,
}) => {
  await open(page);

  const builtIn = chromeGroup(page, 'Built-in structural icons');
  const overridden = chromeGroup(page, 'Overridden structural icons');

  await expect(builtIn.locator('.kui-chip-remove svg')).toBeVisible();
  await expect(overridden.locator('.kui-chip-remove svg')).toBeVisible();

  // Built-in remove glyph is a plain cross; the override is a cross inside a circle.
  await expect(builtIn.locator('.kui-chip-remove svg circle')).toHaveCount(0);
  await expect(overridden.locator('.kui-chip-remove svg circle')).toHaveCount(1);
  await expect(builtIn.locator('.kui-alert__close svg circle')).toHaveCount(0);
  await expect(overridden.locator('.kui-alert__close svg circle')).toHaveCount(1);

  const glyphPath = (group: Locator, pages: string, name: string) =>
    group
      .getByRole('navigation', { name: pages, exact: true })
      .getByRole('button', { name, exact: true })
      .locator('svg path')
      .first()
      .getAttribute('d');

  expect(await glyphPath(builtIn, 'Built-in pages', 'Previous page')).toBe('m15 18-6-6 6-6');
  expect(await glyphPath(overridden, 'Overridden pages', 'Previous page')).toBe('m12 19-7-7 7-7');
  expect(await glyphPath(builtIn, 'Built-in pages', 'Next page')).toBe('m9 18 6-6-6-6');
  expect(await glyphPath(overridden, 'Overridden pages', 'Next page')).toBe('M5 12h14');

  // The override changes the drawing, never the accessible name or the state of the control.
  await expect(
    overridden.getByRole('button', { name: 'Remove Backend', exact: true }),
  ).toBeVisible();
  await expect(
    overridden.getByRole('button', { name: 'Close notification', exact: true }),
  ).toBeVisible();
});

test('keeps structural and data icons visible in forced-colors mode', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', colorScheme: 'light' });
  await open(page);

  expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);

  const targets: [string, Locator][] = [
    ['chip remove', chromeGroup(page, 'Default structural icons').locator('.kui-chip-remove svg')],
    ['alert close', chromeGroup(page, 'Default structural icons').locator('.kui-alert__close svg')],
    [
      'data icon',
      page
        .getByRole('group', { name: 'Stroke width 2', exact: true })
        .locator('kui-icon svg.kui-icon__glyph'),
    ],
  ];

  for (const [label, svg] of targets) {
    await expect(svg, label).toBeVisible();

    const paint = await svg.evaluate((element) => {
      const styles = getComputedStyle(element);
      const box = element.getBoundingClientRect();

      return { stroke: styles.stroke, color: styles.color, width: box.width, height: box.height };
    });

    // `currentColor` resolves to the system text colour, so the drawing keeps a visible paint.
    expect(paint.stroke, `${label} stroke`).not.toBe('none');
    expect(paint.stroke, `${label} stroke follows the system colour`).toBe(paint.color);
    expect(paint.width, `${label} has a box`).toBeGreaterThan(0);
    expect(paint.height, `${label} has a box`).toBeGreaterThan(0);
  }
});

test('keeps the server-rendered structural icon node through hydration', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });

  const held = await openWithHeldScripts(page, '/components/icon');
  const closeGlyph = page.locator('.kui-alert__close svg.kui-glyph').first();
  const brandIcon = page.locator('kui-icon[name="kikita-brand"] svg').first();

  // Scripts are held, so both icons below were produced by the server alone.
  await expect(closeGlyph).toBeVisible();
  await expect(brandIcon).toBeVisible();
  await closeGlyph.evaluate((element) => element.setAttribute('data-ssr-node', ''));

  held.release();
  await waitForShellHydration(page);

  // Hydration reuses the glyph node instead of replacing it, and the registered icon stays drawn.
  await expect(
    page.locator('.kui-alert__close svg.kui-glyph[data-ssr-node]').first(),
  ).toBeVisible();
  await expect(page.locator('kui-icon[name="kikita-brand"] svg').first()).toBeVisible();
});
