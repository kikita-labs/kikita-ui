import type { Locator, Page } from '@playwright/test';

import { expect, test } from './support/fixtures';
import { expectNoDocumentOverflow } from './support/page-ready';
import { openWithHeldScripts } from './support/ssr';

const catalogueSections = [
  ['Default splitter example', 'default'],
  ['Splitter orientation examples', 'orientation'],
  ['Splitter size examples', 'sizes'],
  ['Splitter collapsible examples', 'collapsible'],
  ['Splitter multiple pane examples', 'multiple'],
  ['Nested splitter example', 'nested'],
  ['Disabled splitter example', 'disabled'],
  ['Splitter resize output example', 'output'],
] as const;

type Axis = 'x' | 'y';

interface Layout {
  /** Pane extents as a percentage of the space left after the gutters. */
  readonly percents: readonly number[];
  readonly panePx: readonly number[];
  readonly availablePx: number;
}

const percentTolerance = 0.6;

function group(page: Page, name: string): Locator {
  return page.getByRole('group', { name, exact: true });
}

/** Measures the splitter's own panes (not those of a nested splitter) from real geometry. */
async function measure(splitter: Locator, axis: Axis): Promise<Layout> {
  return splitter.evaluate((host, direction) => {
    const extent = (element: Element): number => {
      const box = element.getBoundingClientRect();
      return direction === 'x' ? box.width : box.height;
    };
    const panes = Array.from(host.children).filter(
      (child) => child.localName === 'kui-splitter-pane',
    );
    const gutters = Array.from(host.children).filter(
      (child) => child.localName === 'kui-splitter-gutter',
    );
    const total = direction === 'x' ? host.clientWidth : host.clientHeight;
    const availablePx = total - gutters.reduce((sum, gutter) => sum + extent(gutter), 0);
    const panePx = panes.map(extent);

    return { percents: panePx.map((px) => (px / availablePx) * 100), panePx, availablePx };
  }, axis);
}

async function expectLayout(splitter: Locator, axis: Axis, expected: readonly number[]) {
  await expect
    .poll(async () => {
      const { percents } = await measure(splitter, axis);
      return percents.every(
        (value, index) => Math.abs(value - expected[index]) <= percentTolerance,
      );
    })
    .toBe(true);
}

async function centerOf(locator: Locator): Promise<{ x: number; y: number }> {
  const box = await locator.boundingBox();
  if (!box) throw new Error('The locator needs a visible box.');

  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Presses the primary mouse button on a gutter and moves it, optionally leaving it held. */
async function dragGutter(
  page: Page,
  gutter: Locator,
  delta: { x: number; y: number },
  release = true,
): Promise<void> {
  await gutter.scrollIntoViewIfNeeded();

  const start = await centerOf(gutter);

  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + delta.x, start.y + delta.y, { steps: 6 });
  if (release) await page.mouse.up();
}

async function valueNow(gutter: Locator): Promise<number> {
  return Number(await gutter.getAttribute('aria-valuenow'));
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/components/splitter');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Splitter', exact: true }),
  ).toBeVisible();
});

test('server-renders the panes without gutters, hydrates them, and stays interactive', async ({
  page,
}) => {
  const held = await openWithHeldScripts(page, '/components/splitter');
  const defaultExample = group(page, 'Default splitter example');
  const firstPane = defaultExample.locator('kui-splitter-pane').first();

  // Scripts are held back: this markup came from the server alone.
  expect(held.serverHtml).toContain('ng-server-context="ssr"');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Splitter', exact: true }),
  ).toBeVisible();
  await expect(defaultExample.locator('kui-splitter-pane')).toHaveCount(2);
  await expect(defaultExample.getByRole('separator')).toHaveCount(0);
  await firstPane.evaluate((element) => element.setAttribute('data-server-node', ''));

  held.release();

  const gutter = defaultExample.getByRole('separator');
  await expect(gutter).toHaveCount(1);
  await expect(firstPane).toHaveAttribute('data-server-node', '');
  await gutter.focus();
  await page.keyboard.press('ArrowRight');
  await expect(gutter).toHaveAttribute('aria-valuenow', '52');
});

test('renders the minimal default splitter with default separator semantics', async ({ page }) => {
  const example = group(page, 'Default splitter example');
  const splitter = example.locator('kui-splitter');
  const gutter = example.getByRole('separator');

  await expect(splitter).toHaveAttribute('data-kui-orientation', 'horizontal');
  await expect(gutter).toHaveCount(1);
  await expect(gutter).toHaveAttribute('tabindex', '0');
  await expect(gutter).toHaveAttribute('aria-orientation', 'vertical');
  await expect(gutter).toHaveAttribute('aria-valuenow', '50');
  await expect(gutter).toHaveAttribute('aria-valuemin', '10');
  await expect(gutter).toHaveAttribute('aria-valuemax', '90');
  await expectLayout(splitter, 'x', [50, 50]);
});

test('lays out horizontal and vertical splitters on their own axis', async ({ page }) => {
  const horizontal = group(page, 'Horizontal');
  const vertical = group(page, 'Vertical');
  const horizontalSplitter = horizontal.locator('kui-splitter');
  const verticalSplitter = vertical.locator('kui-splitter');
  const horizontalGutter = horizontal.getByRole('separator');
  const verticalGutter = vertical.getByRole('separator');

  await expect(verticalSplitter).toHaveAttribute('data-kui-orientation', 'vertical');
  await expect(horizontalGutter).toHaveAttribute('aria-orientation', 'vertical');
  await expect(verticalGutter).toHaveAttribute('aria-orientation', 'horizontal');

  const [left, right] = await horizontal
    .locator('kui-splitter-pane')
    .evaluateAll((panes) => panes.map((pane) => pane.getBoundingClientRect()));
  const [top, bottom] = await vertical
    .locator('kui-splitter-pane')
    .evaluateAll((panes) => panes.map((pane) => pane.getBoundingClientRect()));

  expect(right.left).toBeGreaterThan(left.right);
  expect(right.top).toBeCloseTo(left.top, 0);
  expect(bottom.top).toBeGreaterThan(top.bottom);
  expect(bottom.left).toBeCloseTo(top.left, 0);

  await horizontalGutter.focus();
  await page.keyboard.press('ArrowDown');
  await expect(horizontalGutter).toHaveAttribute('aria-valuenow', '50');
  await page.keyboard.press('ArrowRight');
  await expect(horizontalGutter).toHaveAttribute('aria-valuenow', '52');
  await expectLayout(horizontalSplitter, 'x', [52, 48]);

  await verticalGutter.focus();
  await page.keyboard.press('ArrowRight');
  await expect(verticalGutter).toHaveAttribute('aria-valuenow', '50');
  await page.keyboard.press('ArrowDown');
  await expect(verticalGutter).toHaveAttribute('aria-valuenow', '52');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await expect(verticalGutter).toHaveAttribute('aria-valuenow', '48');
  await expectLayout(verticalSplitter, 'y', [48, 52]);
});

test('sizes panes from explicit, shared, and minimum-size inputs', async ({ page }) => {
  const explicit = group(page, 'Sizes 30 and 70');
  const shared = group(page, 'One explicit size of 20');
  const minimum = group(page, 'Minimum size 40');

  await expectLayout(explicit.locator('kui-splitter'), 'x', [30, 70]);
  await expect(explicit.getByRole('separator')).toHaveAttribute('aria-valuenow', '30');
  await expectLayout(shared.locator('kui-splitter'), 'x', [20, 40, 40]);
  await expect(shared.getByRole('separator')).toHaveCount(2);

  const gutter = minimum.getByRole('separator');

  await expect(gutter).toHaveAttribute('aria-valuemin', '40');
  await expect(gutter).toHaveAttribute('aria-valuemax', '60');
  await gutter.focus();
  await page.keyboard.press('Home');
  await expect(gutter).toHaveAttribute('aria-valuenow', '40');
  await page.keyboard.press('ArrowLeft');
  await expect(gutter).toHaveAttribute('aria-valuenow', '40');
  await page.keyboard.press('End');
  await expect(gutter).toHaveAttribute('aria-valuenow', '60');
  await expectLayout(minimum.locator('kui-splitter'), 'x', [60, 40]);
});

test('resizes with arrows, Shift, Home and End and stops at the limits', async ({ page }) => {
  const example = group(page, 'Two equal panes');
  const splitter = example.locator('kui-splitter');
  const gutter = example.getByRole('separator');

  await gutter.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(gutter).toHaveAttribute('aria-valuenow', '48');
  await page.keyboard.press('Shift+ArrowRight');
  await expect(gutter).toHaveAttribute('aria-valuenow', '58');
  await expectLayout(splitter, 'x', [58, 42]);
  await page.keyboard.press('End');
  await expect(gutter).toHaveAttribute('aria-valuenow', '90');
  await page.keyboard.press('ArrowRight');
  await expect(gutter).toHaveAttribute('aria-valuenow', '90');
  await expectLayout(splitter, 'x', [90, 10]);
  await page.keyboard.press('Home');
  await expect(gutter).toHaveAttribute('aria-valuenow', '10');
  await page.keyboard.press('Shift+ArrowLeft');
  await expect(gutter).toHaveAttribute('aria-valuenow', '10');
  await expectLayout(splitter, 'x', [10, 90]);
  await page.keyboard.press('Enter');
  await expect(gutter).toHaveAttribute('aria-valuenow', '10');
});

test('drags a horizontal gutter with the mouse and clamps at the minimum size', async ({
  page,
}) => {
  const example = group(page, 'Two equal panes');
  const splitter = example.locator('kui-splitter');
  const gutter = example.getByRole('separator');
  const before = await measure(splitter, 'x');
  const deltaPx = 80;

  await dragGutter(page, gutter, { x: deltaPx, y: 0 }, false);
  await expect(gutter).toHaveAttribute('data-kui-dragging', '');
  await page.mouse.up();
  await expect(gutter).not.toHaveAttribute('data-kui-dragging');

  const expected = 50 + (deltaPx / before.availablePx) * 100;

  await expectLayout(splitter, 'x', [expected, 100 - expected]);
  expect(Math.abs((await valueNow(gutter)) - expected)).toBeLessThanOrEqual(0.6);

  await dragGutter(page, gutter, { x: -2000, y: 0 });
  await expectLayout(splitter, 'x', [10, 90]);
  await expect(gutter).toHaveAttribute('aria-valuenow', '10');
  await expect(gutter).toBeFocused();
});

test('drags a vertical gutter with the mouse along the block axis', async ({ page }) => {
  const example = group(page, 'Vertical');
  const splitter = example.locator('kui-splitter');
  const gutter = example.getByRole('separator');
  const before = await measure(splitter, 'y');
  const deltaPx = -30;

  await dragGutter(page, gutter, { x: 0, y: deltaPx });

  const expected = 50 + (deltaPx / before.availablePx) * 100;

  await expectLayout(splitter, 'y', [expected, 100 - expected]);
  expect(Math.abs((await valueNow(gutter)) - expected)).toBeLessThanOrEqual(0.6);
});

test('cancels a mouse drag with Escape and restores the starting layout', async ({ page }) => {
  const example = group(page, 'Two equal panes');
  const splitter = example.locator('kui-splitter');
  const gutter = example.getByRole('separator');

  await dragGutter(page, gutter, { x: 120, y: 0 }, false);
  await expect.poll(() => valueNow(gutter)).toBeGreaterThan(55);
  await page.keyboard.press('Escape');
  await expectLayout(splitter, 'x', [50, 50]);
  await expect(gutter).not.toHaveAttribute('data-kui-dragging');
  await page.mouse.move(600, 300);
  await page.mouse.up();
  await expectLayout(splitter, 'x', [50, 50]);
});

test('reports sizes through the output only for changes and shows them as percentages', async ({
  page,
}) => {
  const example = group(page, 'Splitter resize output example');
  const splitter = example.locator('kui-splitter');
  const gutter = example.getByRole('separator');
  const readout = example.getByRole('definition');

  await expect(readout).toHaveText(['None yet', '0']);

  await gutter.focus();
  await page.keyboard.press('ArrowRight');
  await expect(readout).toHaveText(['52 / 48', '1']);
  await page.keyboard.press('End');
  await expect(readout).toHaveText(['90 / 10', '2']);
  await page.keyboard.press('ArrowRight');
  await expect(readout).toHaveText(['90 / 10', '2']);

  const before = await measure(splitter, 'x');

  await dragGutter(page, gutter, { x: -200, y: 0 });

  const expected = 90 - (200 / before.availablePx) * 100;
  const changes = Number((await readout.nth(1).textContent()) ?? '0');

  expect(changes).toBeGreaterThan(2);
  await expectLayout(splitter, 'x', [expected, 100 - expected]);
  await expect(readout.first()).toHaveText(
    `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(expected)} / ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(100 - expected)}`,
  );
});

test('documents that cancelling a drag with Escape emits no further sizes', async ({ page }) => {
  const example = group(page, 'Splitter resize output example');
  const splitter = example.locator('kui-splitter');
  const gutter = example.getByRole('separator');
  const readout = example.getByRole('definition');

  await dragGutter(page, gutter, { x: 100, y: 0 }, false);
  await expect(readout.first()).not.toHaveText('None yet');

  const emitted = await readout.first().textContent();

  await page.keyboard.press('Escape');
  await page.mouse.up();
  await expectLayout(splitter, 'x', [50, 50]);
  // Observed contract: the revert is silent, so the consumer's last value is the abandoned drag.
  await expect(readout.first()).toHaveText(emitted ?? '');
});

test('collapses and restores the first pane with the gutter button, Enter, and readouts', async ({
  page,
}) => {
  const example = group(page, 'Collapsible first pane');
  const splitter = example.locator('kui-splitter');
  const gutter = example.getByRole('separator');
  const readout = example.getByRole('definition');

  await expectLayout(splitter, 'x', [30, 70]);
  await expect(readout).toHaveText(['30', 'No']);
  await expect(gutter).toHaveAttribute('aria-valuemin', '15');

  await example.getByRole('button', { name: 'Collapse pane', exact: true }).click();
  await expectLayout(splitter, 'x', [15, 85]);
  await expect(readout).toHaveText(['15', 'Yes']);
  await expect(example.getByRole('button', { name: 'Expand pane', exact: true })).toBeVisible();

  await example.getByRole('button', { name: 'Expand pane', exact: true }).click();
  await expectLayout(splitter, 'x', [30, 70]);
  await expect(readout).toHaveText(['30', 'No']);

  await gutter.focus();
  await page.keyboard.press('Enter');
  await expectLayout(splitter, 'x', [15, 85]);
  await expect(readout).toHaveText(['15', 'Yes']);
  await page.keyboard.press('Enter');
  await expectLayout(splitter, 'x', [30, 70]);
});

test('collapses the last pane and the vertical last pane toward their end edge', async ({
  page,
}) => {
  const last = group(page, 'Collapsible last pane');
  const vertical = group(page, 'Collapsible last pane, vertical');

  await expectLayout(last.locator('kui-splitter'), 'x', [70, 30]);
  await last.getByRole('button', { name: 'Collapse pane', exact: true }).click();
  await expectLayout(last.locator('kui-splitter'), 'x', [85, 15]);
  await expect(last.getByRole('definition')).toHaveText(['15', 'Yes']);
  await last.getByRole('button', { name: 'Expand pane', exact: true }).click();
  await expectLayout(last.locator('kui-splitter'), 'x', [70, 30]);

  await expectLayout(vertical.locator('kui-splitter'), 'y', [70, 30]);
  await vertical.getByRole('button', { name: 'Collapse pane', exact: true }).click();
  await expectLayout(vertical.locator('kui-splitter'), 'y', [85, 15]);
  await vertical.getByRole('separator').focus();
  await page.keyboard.press('Enter');
  await expectLayout(vertical.locator('kui-splitter'), 'y', [70, 30]);
});

test('ignores the collapsible flag on a middle pane', async ({ page }) => {
  const example = group(page, 'Collapsible middle pane is ignored');
  const splitter = example.locator('kui-splitter');
  const gutters = example.getByRole('separator');

  await expect(gutters).toHaveCount(2);
  await expect(example.getByRole('button')).toHaveCount(0);
  await gutters.first().focus();
  await page.keyboard.press('Enter');
  await expect(gutters.first()).toHaveAttribute('aria-valuenow', '33');
  await expectLayout(splitter, 'x', [33.3, 33.3, 33.3]);
});

// Library defect (not fixed here): `collapsed()` and the collapse button label change only inside
// `toggleCollapse()`, so Home moves the pane to its minimum size without reporting it as collapsed.
// Reproduced on 2026-09-30 before marking fixme: the readout showed 15 / No. Owner: Kikita UI library.
test.fixme('reports a pane moved to its minimum size with Home as collapsed', async ({ page }) => {
  const example = group(page, 'Collapsible first pane');
  const gutter = example.getByRole('separator');
  const readout = example.getByRole('definition');

  await gutter.focus();
  await page.keyboard.press('Home');
  await expect(gutter).toHaveAttribute('aria-valuenow', '15');
  await expect(readout).toHaveText(['15', 'Yes']);
});

// Library defect (not fixed here): after a button collapse the pane grows back with the keyboard
// but `collapsed()` stays true and the button still reads "Expand pane". Reproduced on 2026-09-30
// before marking fixme: the readout showed 25 / Yes. Owner: Kikita UI library.
test.fixme('leaves the collapsed state when the pane grows back with the keyboard', async ({
  page,
}) => {
  const example = group(page, 'Collapsible first pane');
  const gutter = example.getByRole('separator');
  const readout = example.getByRole('definition');

  await example.getByRole('button', { name: 'Collapse pane', exact: true }).click();
  await expect(readout).toHaveText(['15', 'Yes']);
  await gutter.focus();
  await page.keyboard.press('Shift+ArrowRight');
  await expect(readout).toHaveText(['25', 'No']);
});

// Library defect (not fixed here): the gutter's `aria-controls` names `pane.id`, which is a TypeScript
// field never bound to a host attribute, so no element carries that id. Reproduced on 2026-09-30
// before marking fixme: zero elements matched. Owner: Kikita UI library.
test.fixme('points the gutter at an existing pane through aria-controls', async ({ page }) => {
  const gutter = group(page, 'Two equal panes').getByRole('separator');
  const controlled = await gutter.getAttribute('aria-controls');

  expect(controlled).toBeTruthy();
  expect(await page.locator(`[id="${controlled}"]`).count()).toBe(1);
});

test('keeps the disabled splitter out of the tab order while its pane content works', async ({
  page,
}) => {
  const example = group(page, 'Disabled panes');
  const splitter = example.locator('kui-splitter');
  const gutter = example.getByRole('separator');
  const button = example.getByRole('button', { name: 'Pressed 0 times', exact: true });

  await expect(splitter).toHaveAttribute('data-kui-disabled', '');
  await expect(gutter).toHaveAttribute('aria-disabled', 'true');
  await expect(gutter).toHaveAttribute('tabindex', '-1');

  await button.focus();
  await page.keyboard.press('Tab');
  await expect(gutter).not.toBeFocused();

  await gutter.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('End');
  await expect(gutter).toHaveAttribute('aria-valuenow', '50');

  const before = await measure(splitter, 'x');
  const start = await centerOf(gutter);

  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + 100, start.y, { steps: 4 });
  await page.mouse.up();
  expect((await measure(splitter, 'x')).panePx).toEqual(before.panePx);

  await button.click();
  await expect(example.getByRole('button', { name: 'Pressed 1 times', exact: true })).toBeVisible();
});

test('renders one gutter per adjacent pair and moves only the two panes it touches', async ({
  page,
}) => {
  const three = group(page, 'Three panes');
  const four = group(page, 'Four panes');

  await expect(three.getByRole('separator')).toHaveCount(2);
  await expect(four.getByRole('separator')).toHaveCount(3);
  await expectLayout(three.locator('kui-splitter'), 'x', [33.3, 33.3, 33.3]);
  await expectLayout(four.locator('kui-splitter'), 'x', [25, 25, 25, 25]);

  const [firstGutter, secondGutter] = await three.getByRole('separator').all();

  await firstGutter.focus();
  await page.keyboard.press('Shift+ArrowRight');
  await expectLayout(three.locator('kui-splitter'), 'x', [43.3, 23.3, 33.3]);
  await page.keyboard.press('Tab');
  await expect(secondGutter).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expectLayout(three.locator('kui-splitter'), 'x', [43.3, 21.3, 35.3]);
  await expect(secondGutter).toHaveAttribute('aria-valuenow', '21');
});

test('resizes only the inner splitter when its gutter is dragged', async ({ page }) => {
  const example = group(page, 'Vertical outer, horizontal inner');
  // The inner splitter sits in the outer's first pane, so its gutter comes first in document order.
  const [innerGutter, outerGutter] = [
    example.getByRole('separator').first(),
    example.getByRole('separator').nth(1),
  ];
  const outer = example.locator('kui-splitter').first();
  const inner = example.locator('kui-splitter').nth(1);

  await expect(example.getByRole('separator')).toHaveCount(2);
  await expect(outerGutter).toHaveAttribute('aria-orientation', 'horizontal');
  await expect(innerGutter).toHaveAttribute('aria-orientation', 'vertical');
  await expectLayout(outer, 'y', [70, 30]);
  await expectLayout(inner, 'x', [30, 70]);

  const innerBefore = await measure(inner, 'x');

  await dragGutter(page, innerGutter, { x: 60, y: 0 });

  const expected = 30 + (60 / innerBefore.availablePx) * 100;

  await expectLayout(inner, 'x', [expected, 100 - expected]);
  await expectLayout(outer, 'y', [70, 30]);
  await expect(outerGutter).toHaveAttribute('aria-valuenow', '70');
});

test('drags a gutter with real touch input without scrolling the page', async ({
  browser,
  page,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 1024, height: 900 },
  });

  try {
    const touchPage = await context.newPage();
    const client = await context.newCDPSession(touchPage);

    await touchPage.goto(new URL('/components/splitter', page.url()).toString());

    const gutter = group(touchPage, 'Two equal panes').getByRole('separator');
    const splitter = group(touchPage, 'Two equal panes').locator('kui-splitter');

    await expect(gutter).toHaveCount(1);
    await gutter.scrollIntoViewIfNeeded();

    const before = await measure(splitter, 'x');
    const start = await centerOf(gutter);
    const scrollBefore = await touchPage.evaluate(() => window.scrollY);
    const deltaPx = 70;
    const point = (x: number) => [{ x, y: start.y, id: 1 }];

    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: point(start.x),
    });
    for (const step of [1, 2, 3, 4]) {
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: point(start.x + (deltaPx * step) / 4),
      });
    }
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

    const expected = 50 + (deltaPx / before.availablePx) * 100;

    await expectLayout(splitter, 'x', [expected, 100 - expected]);
    expect(Math.abs((await valueNow(gutter)) - expected)).toBeLessThanOrEqual(0.6);
    expect(await touchPage.evaluate(() => window.scrollY)).toBe(scrollBefore);
  } finally {
    await context.close();
  }
});

test('collapses a pane with a real touch tap on the gutter button', async ({ browser, page }) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 1024, height: 900 },
  });

  try {
    const touchPage = await context.newPage();

    await touchPage.goto(new URL('/components/splitter', page.url()).toString());

    const collapsible = group(touchPage, 'Collapsible first pane');

    await collapsible.getByRole('button', { name: 'Collapse pane', exact: true }).tap();
    await expectLayout(collapsible.locator('kui-splitter'), 'x', [15, 85]);
    await expect(collapsible.getByRole('definition')).toHaveText(['15', 'Yes']);
  } finally {
    await context.close();
  }
});

test('keeps the collapse button labels of the library in English when the language changes', async ({
  page,
}) => {
  const localeResponse = await page.request.get('/i18n/splitter/ru.json');
  expect(localeResponse.ok()).toBeTruthy();
  const translations = await localeResponse.json();
  const shellResponse = await page.request.get('/i18n/ru.json');
  expect(shellResponse.ok()).toBeTruthy();
  const shellTranslations = await shellResponse.json();

  await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: translations.title, exact: true }),
  ).toBeVisible();

  const first = group(page, translations.variants.firstCollapsible);

  await expect(first.getByRole('definition')).toHaveText(['30', translations.status.no]);
  await expect(first.getByRole('term').first()).toHaveText(translations.status.size);
  await expect(first.getByRole('button', { name: 'Collapse pane', exact: true })).toBeVisible();
  await expect(group(page, translations.accessibility.default)).toBeVisible();

  await page
    .getByRole('button', { name: shellTranslations.playground.language, exact: true })
    .click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Splitter', exact: true }),
  ).toBeVisible();
});

test('fits the catalogue without horizontal document overflow at every width', async ({ page }) => {
  for (const [width, height] of [
    [1440, 1000],
    [768, 1024],
    [320, 900],
  ] as const) {
    await page.setViewportSize({ width, height });
    await expectNoDocumentOverflow(page, `splitter ${width}px`);
  }
});

test('captures every catalogue section at desktop and 320px @visual', async ({ page }) => {
  for (const [name, width, height] of [
    ['desktop', 1440, 1000],
    ['320', 320, 2000],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));

    for (const [groupName, screenshotBase] of catalogueSections) {
      const section = group(page, groupName);

      await section.scrollIntoViewIfNeeded();
      await expect(section).toHaveScreenshot(`splitter-${screenshotBase}-${name}.png`, {
        animations: 'disabled',
      });
    }
  }
});

test('captures the hovered, focused, and dragging gutter with real input @visual', async ({
  page,
}) => {
  const example = group(page, 'Default splitter example');
  const gutter = example.getByRole('separator');

  await gutter.scrollIntoViewIfNeeded();

  const center = await centerOf(gutter);

  await page.mouse.move(center.x, center.y);
  await expect(example).toHaveScreenshot('splitter-default-gutter-hover.png', {
    animations: 'disabled',
  });

  await page.mouse.move(0, 0);
  await gutter.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(gutter).toBeFocused();
  expect(await gutter.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(example).toHaveScreenshot('splitter-default-gutter-focus.png', {
    animations: 'disabled',
  });

  await dragGutter(page, gutter, { x: 90, y: 0 }, false);
  await expect(gutter).toHaveAttribute('data-kui-dragging', '');
  await expect(example).toHaveScreenshot('splitter-default-gutter-dragging.png', {
    animations: 'disabled',
  });
  await page.mouse.up();
});

test('captures collapsed panes and the resized output example @visual', async ({ page }) => {
  const first = group(page, 'Collapsible first pane');
  const last = group(page, 'Collapsible last pane');
  const output = group(page, 'Splitter resize output example');

  await first.getByRole('button', { name: 'Collapse pane', exact: true }).click();
  await last.getByRole('button', { name: 'Collapse pane', exact: true }).click();
  await page.mouse.move(0, 0);
  await expect(first.getByRole('definition')).toHaveText(['15', 'Yes']);
  await expect(first).toHaveScreenshot('splitter-collapsed-first.png', { animations: 'disabled' });
  await expect(last).toHaveScreenshot('splitter-collapsed-last.png', { animations: 'disabled' });

  await output.getByRole('separator').focus();
  await page.keyboard.press('Shift+ArrowLeft');
  await expect(output.getByRole('definition').first()).toHaveText('40 / 60');
  await expect(output).toHaveScreenshot('splitter-output-after-resize.png', {
    animations: 'disabled',
  });
});

test('captures the collapsible catalogue in the light theme @visual', async ({ page }) => {
  await page.getByRole('button', { name: 'Switch to light theme', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-kui-theme', 'light');

  const section = group(page, 'Splitter collapsible examples');

  await section.scrollIntoViewIfNeeded();
  await expect(section).toHaveScreenshot('splitter-collapsible-light-desktop.png', {
    animations: 'disabled',
  });
});
