import type { Locator, Page } from '@playwright/test';

import { expect, test } from './support/fixtures';
import { kuiMessage, loadKuiCatalogue } from './support/kui-catalogue';
import { openWithHeldScripts, readDuplicateIds } from './support/ssr';

const desktopViewport = { width: 1440, height: 1000 };
const tabletViewport = { width: 768, height: 1024 };
const mobileViewport = { width: 320, height: 2000 };

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/components/pagination');
  await expect(page.getByRole('heading', { level: 1, name: 'Pagination' })).toBeVisible();
});

test('server-renders the heading and default navigation, then hydrates and stays usable', async ({
  page,
}) => {
  const held = await openWithHeldScripts(page, '/components/pagination');
  const nav = page.getByRole('navigation', { name: 'Pagination', exact: true });

  expect(held.serverHtml).toContain('ng-server-context="ssr"');
  await expect(page.getByRole('heading', { level: 1, name: 'Pagination' })).toBeVisible();
  await expect(nav.getByRole('button', { name: 'Page 1, current', exact: true })).toBeVisible();
  await nav.getByRole('button', { name: 'Page 2', exact: true }).evaluate((element) => {
    element.setAttribute('data-server-node', '');
  });

  held.release();

  await expect(async () => {
    await nav.getByRole('button', { name: 'Next page', exact: true }).click({ timeout: 1_000 });
    await expect(nav.getByRole('button', { name: 'Page 2, current', exact: true })).toBeVisible({
      timeout: 1_000,
    });
  }).toPass();

  await expect(nav.getByRole('button', { name: 'Page 2, current', exact: true })).toHaveAttribute(
    'data-server-node',
    '',
  );
  expect(await readDuplicateIds(page)).toEqual([]);
});

test('renders the default pagination and steps through pages with every control @visual', async ({
  page,
}) => {
  const example = getGroup(page, 'Default pagination example');
  const nav = example.getByRole('navigation', { name: 'Pagination', exact: true });
  const current = (label: string) => nav.getByRole('button', { name: label, exact: true });

  await expect(nav.locator('xpath=..')).toHaveAttribute('data-kui-variant', 'compact');
  await expect(nav.locator('xpath=..')).toHaveAttribute('data-kui-size', 'md');
  await expect(current('Page 1, current')).toHaveAttribute('aria-current', 'page');
  await expect(current('First page')).toBeDisabled();
  await expect(current('Previous page')).toBeDisabled();
  await expect(current('Next page')).toBeEnabled();
  expect(await readSequence(nav)).toEqual(['1', '2', '3', '4', '5', '…', '10']);
  await expect(example).toHaveScreenshot('pagination-default-desktop.png');

  await current('Page 5').click();
  await expect(current('Page 5, current')).toHaveAttribute('aria-current', 'page');
  await expect.poll(() => readSequence(nav)).toEqual(['1', '…', '4', '5', '6', '…', '10']);
  await page.mouse.move(0, 0);
  await expect(example).toHaveScreenshot('pagination-default-page-5-desktop.png');

  await current('Last page').click();
  await expect(current('Page 10, current')).toBeVisible();
  await expect(current('Next page')).toBeDisabled();
  await expect(current('Last page')).toBeDisabled();

  await current('Previous page').click();
  await expect(current('Page 9, current')).toBeVisible();

  await current('First page').click();
  await expect(current('Page 1, current')).toBeVisible();

  await captureMobile(page, example, 'pagination-default-320.png');
});

test('shows compact, simple, and full variants with their own controls @visual', async ({
  page,
}) => {
  const variants = getGroup(page, 'Pagination variants');
  const compact = getGroup(variants, 'Compact');
  const simple = getGroup(variants, 'Simple');
  const full = getGroup(variants, 'Full');

  await expect(compact.locator('kui-pagination')).toHaveAttribute('data-kui-variant', 'compact');
  await expect(compact.getByRole('button')).toHaveCount(9);
  await expect(compact.getByText(/Showing/)).toHaveCount(0);

  await expect(simple.locator('kui-pagination')).toHaveAttribute('data-kui-variant', 'simple');
  await expect(simple.getByRole('button')).toHaveCount(2);
  await expect(simple.getByText('Page 5 of 12', { exact: true })).toBeVisible();
  await simple.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(simple.getByText('Page 6 of 12', { exact: true })).toBeVisible();
  await simple.getByRole('button', { name: 'Previous page', exact: true }).click();
  await expect(simple.getByText('Page 5 of 12', { exact: true })).toBeVisible();

  await expect(full.locator('kui-pagination')).toHaveAttribute('data-kui-variant', 'full');
  await expect(full.getByText('Showing 101–125 of 289', { exact: true })).toBeVisible();
  await expect(full.getByRole('combobox', { name: 'Rows per page', exact: true })).toBeVisible();

  await page.mouse.move(0, 0);
  await expect(variants).toHaveScreenshot('pagination-variants-desktop.png');
  await captureMobile(page, variants, 'pagination-variants-320.png');
});

test('shows all four sizes with the shared control scale @visual', async ({ page }) => {
  const sizes = getGroup(page, 'Pagination sizes');
  const expected = [
    ['Extra small', 'xs', 28],
    ['Small', 'sm', 32],
    ['Medium', 'md', 40],
    ['Large', 'lg', 44],
  ] as const;

  for (const [label, size, height] of expected) {
    const example = getGroup(sizes, label);

    await expect(example.locator('kui-pagination')).toHaveAttribute('data-kui-size', size);
    await expect
      .poll(
        async () =>
          (await example.getByRole('button', { name: 'Next page' }).boundingBox())?.height,
      )
      .toBe(height);
    await expect
      .poll(
        async () =>
          (await example.getByRole('button', { name: 'Page 5, current' }).boundingBox())?.height,
      )
      .toBe(height);
  }

  await expect(sizes).toHaveScreenshot('pagination-sizes-desktop.png');
  await captureMobile(page, sizes, 'pagination-sizes-320.png');
});

test('keeps the page window stable around the current page @visual', async ({ page }) => {
  const windows = getGroup(page, 'Pagination page window');
  const expected: readonly (readonly [string, readonly string[]])[] = [
    ['Siblings 0', ['1', '…', '21', '…', '42']],
    ['Siblings 1 (default)', ['1', '…', '20', '21', '22', '…', '42']],
    ['Siblings 2', ['1', '…', '19', '20', '21', '22', '23', '…', '42']],
    ['Boundaries 0', ['…', '20', '21', '22', '…']],
    ['Boundaries 1 (default)', ['1', '…', '20', '21', '22', '…', '42']],
    ['Boundaries 2', ['1', '2', '…', '20', '21', '22', '…', '41', '42']],
  ];

  for (const [label, sequence] of expected) {
    const nav = getGroup(windows, label).getByRole('navigation');

    expect(await readSequence(nav), label).toEqual(sequence);
    await expect(nav.getByText('…').first()).toHaveAttribute('aria-hidden', 'true');
  }

  const siblings = getGroup(windows, 'Siblings 1 (default)').getByRole('navigation');

  await expect(windows).toHaveScreenshot('pagination-window-desktop.png');
  await captureMobile(page, windows, 'pagination-window-320.png');

  await siblings.getByRole('button', { name: 'Page 22', exact: true }).click();
  await expect.poll(() => readSequence(siblings)).toEqual(['1', '…', '21', '22', '23', '…', '42']);
  await siblings.getByRole('button', { name: 'Page 42', exact: true }).click();
  await expect.poll(() => readSequence(siblings)).toEqual(['1', '…', '38', '39', '40', '41', '42']);
  await expect(siblings.getByRole('button', { name: 'Next page', exact: true })).toBeDisabled();
});

test('disables the boundary step buttons at the first, last, and only page @visual', async ({
  page,
}) => {
  const boundaries = getGroup(page, 'Pagination range boundaries');
  const step = (example: Locator, name: string) =>
    example.getByRole('button', { name, exact: true });
  const first = getGroup(boundaries, 'On the first page');
  const last = getGroup(boundaries, 'On the last page');
  const single = getGroup(boundaries, 'Only one page');

  await expect(step(first, 'First page')).toBeDisabled();
  await expect(step(first, 'Previous page')).toBeDisabled();
  await expect(step(first, 'Next page')).toBeEnabled();
  await expect(step(first, 'Last page')).toBeEnabled();

  await expect(step(last, 'Page 12, current')).toBeVisible();
  await expect(step(last, 'First page')).toBeEnabled();
  await expect(step(last, 'Previous page')).toBeEnabled();
  await expect(step(last, 'Next page')).toBeDisabled();
  await expect(step(last, 'Last page')).toBeDisabled();

  expect(await readSequence(single.getByRole('navigation'))).toEqual(['1']);
  for (const name of ['First page', 'Previous page', 'Next page', 'Last page']) {
    await expect(step(single, name)).toBeDisabled();
  }

  await expect(boundaries).toHaveScreenshot('pagination-boundaries-desktop.png');
  await captureMobile(page, boundaries, 'pagination-boundaries-320.png');
});

test('resets to page 1 when rows per page changes and reports both outputs @visual', async ({
  page,
}) => {
  const examples = getGroup(page, 'Rows per page examples');
  const example = getGroup(examples, 'Rows per page');
  const nav = example.getByRole('navigation');
  const status = example.getByRole('status');

  await expect(nav.getByRole('button', { name: 'Page 5, current', exact: true })).toBeVisible();
  await expect(example.getByText('Showing 101–125 of 289', { exact: true })).toBeVisible();
  await expect(status).toHaveText('Page 5, 25 per page. Page changes: 0. Size changes: 0.');
  await expect(examples).toHaveScreenshot('pagination-rows-per-page-before-desktop.png');
  await captureMobile(page, examples, 'pagination-rows-per-page-320.png');

  await nav.getByRole('combobox', { name: 'Rows per page', exact: true }).click();
  await page.getByRole('listbox').getByRole('option', { name: '50', exact: true }).click();

  await expect(nav.getByRole('button', { name: 'Page 1, current', exact: true })).toBeVisible();
  await expect(example.getByText('Showing 1–50 of 289', { exact: true })).toBeVisible();
  await expect(status).toHaveText('Page 1, 50 per page. Page changes: 1. Size changes: 1.');
  await page.mouse.move(0, 0);
  await expect(examples).toHaveScreenshot('pagination-rows-per-page-after-desktop.png');

  await nav.getByRole('button', { name: 'Last page', exact: true }).click();
  await expect(nav.getByRole('button', { name: 'Page 6, current', exact: true })).toBeVisible();
  await expect(example.getByText('Showing 251–289 of 289', { exact: true })).toBeVisible();

  const fallback = getGroup(examples, 'Without total items');

  await expect(fallback.getByText('Showing 1–25 of 300', { exact: true })).toBeVisible();
  await fallback.getByRole('combobox', { name: 'Rows per page', exact: true }).click();
  await page.getByRole('listbox').getByRole('option', { name: '10', exact: true }).click();
  await expect(fallback.getByText('Showing 1–10 of 120', { exact: true })).toBeVisible();
});

test('disables every control of every variant natively @visual', async ({ page }) => {
  const disabled = getGroup(page, 'Disabled pagination examples');

  for (const label of ['Compact, disabled', 'Simple, disabled', 'Full, disabled']) {
    const example = getGroup(disabled, label);

    for (const button of await example.getByRole('button').all()) {
      await expect(button).toBeDisabled();
    }
  }

  await expect(
    getGroup(disabled, 'Full, disabled').getByRole('combobox', { name: 'Rows per page' }),
  ).toBeDisabled();
  await expect(disabled).toHaveScreenshot('pagination-disabled-desktop.png');
  await captureMobile(page, disabled, 'pagination-disabled-320.png');
});

test('pages a table through the page owner and localizes numbers per language @visual', async ({
  page,
}) => {
  const example = getGroup(page, 'Pagination with a table');
  const table = example.getByRole('table', { name: 'Orders', exact: true });
  const nav = example.getByRole('navigation', { name: 'Orders pagination', exact: true });
  const status = example.getByRole('status').filter({ hasText: 'orders' });

  await expect(table.getByRole('row')).toHaveCount(11);
  await expect(table.getByRole('cell', { name: 'Order 1,001', exact: true })).toBeVisible();
  await expect(status).toHaveText('Page 1 of 129, 1,284 orders');
  await expect(example.getByText('Showing 1–10 of 1,284', { exact: true })).toBeVisible();
  await expect(example).toHaveScreenshot('pagination-table-desktop.png');
  await captureMobile(page, example, 'pagination-table-320.png');

  await nav.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(table.getByRole('cell', { name: 'Order 1,011', exact: true })).toBeVisible();
  await expect(status).toHaveText('Page 2 of 129, 1,284 orders');
  await page.mouse.move(0, 0);
  await expect(example).toHaveScreenshot('pagination-table-page-2-desktop.png');

  await nav.getByRole('combobox', { name: 'Rows per page', exact: true }).click();
  await page.getByRole('listbox').getByRole('option', { name: '20', exact: true }).click();
  await expect(status).toHaveText('Page 1 of 65, 1,284 orders');
  await expect(table.getByRole('row')).toHaveCount(21);

  await nav.getByRole('button', { name: 'Last page', exact: true }).click();
  await expect(status).toHaveText('Page 65 of 65, 1,284 orders');
  await expect(table.getByRole('row')).toHaveCount(5);
  await expect(example.getByText('Showing 1,281–1,284 of 1,284', { exact: true })).toBeVisible();
});

test('moves through every control in visual order with real keyboard input', async ({ page }) => {
  const full = getGroup(getGroup(page, 'Pagination variants'), 'Full');
  const nav = full.getByRole('navigation');
  const picker = full.getByRole('combobox', { name: 'Rows per page', exact: true });

  await nav.getByRole('button', { name: 'First page', exact: true }).focus();

  const order: string[] = [];
  for (let step = 0; step < 12; step += 1) {
    order.push(await readFocusedName(page));
    if (await picker.evaluate((element) => element === document.activeElement)) break;

    await page.keyboard.press('Tab');
  }

  expect(order).toEqual([
    'First page',
    'Previous page',
    'Page 1',
    'Page 4',
    'Page 5, current',
    'Page 6',
    'Page 12',
    'Next page',
    'Last page',
    'Rows per page',
  ]);
});

test('activates page buttons with Enter and Space and ignores arrow keys', async ({ page }) => {
  const example = getGroup(page, 'Default pagination example');
  const nav = example.getByRole('navigation', { name: 'Pagination', exact: true });

  await nav.getByRole('button', { name: 'Page 3', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(nav.getByRole('button', { name: 'Page 3', exact: true })).toBeFocused();
  await expect(nav.getByRole('button', { name: 'Page 1, current', exact: true })).toBeVisible();

  await page.keyboard.press('Enter');
  await expect(nav.getByRole('button', { name: 'Page 3, current', exact: true })).toBeVisible();

  await page.keyboard.press('Tab');
  await expect(nav.getByRole('button', { name: 'Page 4', exact: true })).toBeFocused();
  await page.keyboard.press('Space');
  await expect(nav.getByRole('button', { name: 'Page 4, current', exact: true })).toBeVisible();
});

test('skips disabled boundary controls when tabbing backward from page 1', async ({ page }) => {
  const example = getGroup(page, 'Default pagination example');
  const nav = example.getByRole('navigation', { name: 'Pagination', exact: true });

  await nav.getByRole('button', { name: 'Page 1, current', exact: true }).focus();
  await page.keyboard.press('Shift+Tab');
  await expect(nav.locator(':focus')).toHaveCount(0);

  await page.keyboard.press('Tab');
  await expect(nav.getByRole('button', { name: 'Page 1, current', exact: true })).toBeFocused();
});

test('shows a real keyboard focus ring on a page button @visual', async ({ page }) => {
  const example = getGroup(page, 'Default pagination example');
  const nav = example.getByRole('navigation', { name: 'Pagination', exact: true });
  const target = nav.getByRole('button', { name: 'Page 3', exact: true });

  await nav.getByRole('button', { name: 'Page 1, current', exact: true }).focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(target).toBeFocused();
  expect(await target.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(example).toHaveScreenshot('pagination-default-focus-desktop.png');
});

test.fixme('keeps keyboard focus in the navigation after Next reaches the last page', async ({
  page,
}) => {
  // Reproduced: at page 9 of 10, focus Next and press Enter. The page changes to 10, Next becomes
  // disabled in the same update, and focus falls to document.body, so a keyboard user loses their
  // place. Library defect owned by kui-pagination; this page must not work around it.
  const example = getGroup(page, 'Default pagination example');
  const nav = example.getByRole('navigation', { name: 'Pagination', exact: true });

  await nav.getByRole('button', { name: 'Last page', exact: true }).click();
  await nav.getByRole('button', { name: 'Previous page', exact: true }).click();
  await nav.getByRole('button', { name: 'Next page', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(nav.getByRole('button', { name: 'Page 10, current', exact: true })).toBeVisible();
  await expect(nav.locator(':focus')).toHaveCount(1);
});

test('translates page-owned and library text and formats numbers per language', async ({
  page,
}) => {
  const kui = await loadKuiCatalogue(page, 'ru');
  const response = await page.request.get('/i18n/pagination/ru.json');
  expect(response.ok()).toBe(true);
  const russian = (await response.json()) as {
    title: string;
    navigation: string;
    accessibility: { table: string };
    labels: { compact: string };
    table: { caption: string; navigation: string; orderLabel: string; status: string };
  };
  const nbsp = ' ';

  await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: russian.title })).toBeVisible();

  const compact = getGroup(page, russian.labels.compact);
  await expect(
    compact.getByRole('navigation', {
      name: fill(russian.navigation, { label: russian.labels.compact }),
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    compact.getByRole('button', { name: kuiMessage(kui, 'pagination', 'next'), exact: true }),
  ).toBeVisible();

  const table = getGroup(page, russian.accessibility.table);
  const expectedStatus = fill(russian.table.status, {
    page: '1',
    pages: '129',
    total: `1${nbsp}284`,
  });

  await expect(
    table.getByRole('table', { name: russian.table.caption, exact: true }),
  ).toBeVisible();
  await expect(
    table.getByRole('cell', {
      name: fill(russian.table.orderLabel, { number: `1${nbsp}001` }),
      exact: true,
    }),
  ).toBeVisible();
  await expect(table.getByRole('status').filter({ hasText: expectedStatus })).toHaveText(
    expectedStatus,
  );
  await expect(
    table.getByRole('navigation', { name: russian.table.navigation, exact: true }),
  ).toBeVisible();
  await expect(
    table.getByText(
      kuiMessage(kui, 'pagination', 'summary', { start: '1', end: '10', total: `1${nbsp}284` }),
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    table.getByRole('combobox', {
      name: kuiMessage(kui, 'pagination', 'rowsPerPage'),
      exact: true,
    }),
  ).toBeVisible();
});

test('keeps the catalogue within the viewport at desktop, tablet, and phone widths', async ({
  page,
}) => {
  for (const viewport of [desktopViewport, tabletViewport, { width: 320, height: 844 }]) {
    await page.setViewportSize(viewport);
    await expectNoHorizontalOverflow(page);
    await expect(page.getByRole('heading', { level: 1, name: 'Pagination' })).toBeVisible();
  }
});

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => values[key] ?? '');
}

function getGroup(scope: Page | Locator, accessibleName: string): Locator {
  return scope.getByRole('group', { name: accessibleName, exact: true });
}

async function readSequence(nav: Locator): Promise<string[]> {
  return nav.evaluate((element) =>
    Array.from(element.children, (child) => child.textContent?.trim() ?? '').filter(
      (text) => text !== '' && /^(\d+|…)$/.test(text),
    ),
  );
}

async function readFocusedName(page: Page): Promise<string> {
  return page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? '');
}

async function captureMobile(page: Page, example: Locator, screenshotName: string): Promise<void> {
  await page.setViewportSize(mobileViewport);
  await example.scrollIntoViewIfNeeded();
  await expectNoHorizontalOverflow(page);
  await expect(example).toHaveScreenshot(screenshotName);
  await page.setViewportSize(desktopViewport);
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
}
