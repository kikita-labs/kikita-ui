import type { Locator, Page } from '@playwright/test';

import { expect, test } from './support/fixtures';

const desktopViewport = { width: 1440, height: 1000 };
const tabletViewport = { width: 768, height: 1024 };
const mobileViewport = { width: 320, height: 844 };

const sizes = ['xs', 'sm', 'md', 'lg'] as const;
const originalOrder = ['Priya', 'Tomas', 'Noor', 'Liam', 'Ava'];

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/components/table');
});

test('server-renders Table examples and hydrates one accessible sort button per sortable header', async ({
  page,
}) => {
  const response = await page.request.get('/components/table');

  expect(response.ok()).toBe(true);

  const serverMarkup = await response.text();
  expect(serverMarkup).toContain('Team members');
  expect(serverMarkup).toContain('Sortable team members');

  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/components/table');
  await expect(page.getByRole('heading', { level: 1, name: 'Table' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sort Score ascending', exact: true })).toHaveCount(
    2,
  );
  await expect(
    page.getByRole('button', { name: 'Sort Status ascending', exact: true }),
  ).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Sort Email ascending', exact: true })).toHaveCount(
    1,
  );

  const sorting = getGroup(page, 'Local sorting and custom comparator');
  const scoreButton = sorting.getByRole('button', { name: 'Sort Score ascending', exact: true });
  await expect(scoreButton).toHaveCount(1);
  await expect(scoreButton.locator('..')).toHaveAttribute('aria-sort', 'none');
  expect(consoleErrors).toEqual([]);
});

test('shows the minimally configured Table at the resolved medium size @visual', async ({
  page,
}) => {
  const example = getGroup(page, 'Default table example');
  const table = example.getByRole('table', { name: 'Team members' });

  await expect(page.getByRole('heading', { level: 1, name: 'Table' })).toBeVisible();
  await expect(table).toHaveAttribute('data-kui-size', 'md');
  await expect(table.getByRole('row')).toHaveCount(6);
  await expect(table.getByRole('button')).toHaveCount(0);
  await expect(table.getByRole('checkbox')).toHaveCount(0);
  await expectRowNames(example.getByRole('region'), originalOrder);

  const emptyRegion = example.getByRole('region', { name: 'Empty data default table' });
  const emptyTable = emptyRegion.getByRole('table', { name: 'Empty team table' });
  await expect(emptyTable).toHaveAttribute('data-kui-size', 'md');
  await expect(emptyTable.getByRole('row')).toHaveCount(1);
  await expect(emptyTable.locator('tbody tr')).toHaveCount(0);
  await expect(emptyTable.getByRole('button')).toHaveCount(0);
  await expect(emptyTable.getByRole('checkbox')).toHaveCount(0);

  await expect(example).toHaveScreenshot('table-default-desktop.png', {
    animations: 'disabled',
  });

  await captureMobile(page, example, 'table-default-320.png');
});

test('shows all four Table sizes without changing the row content @visual', async ({ page }) => {
  const catalogue = getGroup(page, 'Table size examples');

  for (const size of sizes) {
    const example = catalogue.getByRole('group', { name: new RegExp(`\\(${size}\\)$`) });
    const table = example.getByRole('table', { name: 'Table size comparison' });

    await expect(table).toHaveAttribute('data-kui-size', size);
    await expect(table.getByRole('row')).toHaveCount(4);
  }

  await expect(catalogue).toHaveScreenshot('table-sizes-desktop.png', {
    animations: 'disabled',
  });

  for (const size of sizes) {
    const example = catalogue.getByRole('group', { name: new RegExp(`\\(${size}\\)$`) });

    await captureMobile(page, example, `table-size-${size}-320.png`);
  }
});

test('cycles local sorting by keyboard and applies the default string and custom comparators @visual', async ({
  page,
}) => {
  const examples = getGroup(page, 'Local sorting and custom comparator');
  const region = examples.getByRole('region', { name: 'Locally sorted team table' });
  const scoreButton = region.getByRole('button', { name: 'Sort Score ascending', exact: true });

  await expectRowNames(region, originalOrder);
  await expect(examples).toHaveScreenshot('table-local-sorting-default-desktop.png', {
    animations: 'disabled',
  });

  const emailHeader = region.locator('thead th').nth(1);
  const emailButton = emailHeader.getByRole('button', {
    name: 'Sort Email ascending',
    exact: true,
  });
  await emailButton.click();
  await expect(emailHeader).toHaveAttribute('aria-sort', 'ascending');
  await expectRowNames(region, ['Ava', 'Liam', 'Noor', 'Priya', 'Tomas']);
  await expect(examples).toHaveScreenshot('table-default-string-sort-email-ascending-desktop.png', {
    animations: 'disabled',
  });
  await region.getByRole('button', { name: 'Sort Email descending', exact: true }).click();
  await region.getByRole('button', { name: 'Clear Email sort', exact: true }).click();
  await expectRowNames(region, originalOrder);

  await tabTo(page, scoreButton);
  await expect(scoreButton).toBeFocused();
  expect(await scoreButton.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(examples).toHaveScreenshot('table-local-sorting-score-focused-desktop.png', {
    animations: 'disabled',
  });
  await page.keyboard.press('Enter');

  let activeScoreButton = region.getByRole('button', {
    name: 'Sort Score descending',
    exact: true,
  });
  await expect(activeScoreButton.locator('..')).toHaveAttribute('aria-sort', 'ascending');
  await expectRowNames(region, ['Liam', 'Noor', 'Tomas', 'Priya', 'Ava']);
  await expect(examples).toHaveScreenshot('table-local-sorting-ascending-desktop.png', {
    animations: 'disabled',
  });

  await page.keyboard.press('Space');
  activeScoreButton = region.getByRole('button', {
    name: 'Clear Score sort',
    exact: true,
  });
  await expect(activeScoreButton.locator('..')).toHaveAttribute('aria-sort', 'descending');
  await expectRowNames(region, ['Ava', 'Priya', 'Tomas', 'Noor', 'Liam']);
  await expect(examples).toHaveScreenshot('table-local-sorting-descending-desktop.png', {
    animations: 'disabled',
  });

  await page.keyboard.press('Enter');
  await expect(
    region.getByRole('button', { name: 'Sort Score ascending', exact: true }),
  ).toBeVisible();
  await expect(region.locator('th').filter({ hasText: 'Score' })).toHaveAttribute(
    'aria-sort',
    'none',
  );
  await expectRowNames(region, originalOrder);

  const statusHeader = region.locator('thead th').nth(2);
  const statusButton = statusHeader.getByRole('button', {
    name: 'Sort Status ascending',
    exact: true,
  });
  await statusButton.click();
  await expect(statusHeader).toHaveAttribute('aria-sort', 'ascending');
  await expectRowNames(region, ['Noor', 'Ava', 'Tomas', 'Liam', 'Priya']);
  await expect(examples).toHaveScreenshot('table-custom-comparator-ascending-desktop.png', {
    animations: 'disabled',
  });

  await captureMobile(page, examples, 'table-local-sorting-320.png');
});

test('uses the sortChange output to let the parent own row ordering @visual', async ({ page }) => {
  const examples = getGroup(page, 'Parent-controlled sorting');
  const region = examples.getByRole('region', { name: 'Parent-controlled sorted team table' });
  const scoreButton = region.getByRole('button', { name: 'Sort Score ascending', exact: true });

  await expect(examples.getByRole('status')).toHaveText('Parent order: original');
  await expectRowNames(region, originalOrder);
  await expect(examples).toHaveScreenshot('table-controlled-sorting-default-desktop.png', {
    animations: 'disabled',
  });

  await scoreButton.click();
  let activeButton = region.getByRole('button', { name: 'Sort Score descending', exact: true });
  await expect(activeButton.locator('..')).toHaveAttribute('aria-sort', 'ascending');
  await expect(examples.getByRole('status')).toHaveText('Parent order: score ascending');
  await expectRowNames(region, ['Liam', 'Noor', 'Tomas', 'Priya', 'Ava']);
  await expect(examples).toHaveScreenshot('table-controlled-sorting-ascending-desktop.png', {
    animations: 'disabled',
  });

  await activeButton.click();
  activeButton = region.getByRole('button', { name: 'Clear Score sort', exact: true });
  await expect(activeButton.locator('..')).toHaveAttribute('aria-sort', 'descending');
  await expect(examples.getByRole('status')).toHaveText('Parent order: score descending');
  await expectRowNames(region, ['Ava', 'Priya', 'Tomas', 'Noor', 'Liam']);
  await expect(examples).toHaveScreenshot('table-controlled-sorting-descending-desktop.png', {
    animations: 'disabled',
  });

  await activeButton.click();
  await expect(examples.getByRole('status')).toHaveText('Parent order: original');
  await expectRowNames(region, originalOrder);
  await expect(examples).toHaveScreenshot('table-controlled-sorting-cleared-desktop.png', {
    animations: 'disabled',
  });
  await captureMobile(page, examples, 'table-controlled-sorting-320.png');
});

test('reports row selection and progresses through indeterminate, all, and cleared states @visual', async ({
  page,
}) => {
  const examples = getGroup(page, 'Table selection');
  const mainExample = examples.locator('.table-selection-examples__main-example');
  const region = examples.getByRole('region', { name: 'Selectable team table' });
  const selectAll = region.getByRole('checkbox', { name: 'Select all team members', exact: true });
  const firstRow = region.getByRole('checkbox', { name: 'Select Priya', exact: true });
  const defaultLabelsRegion = examples.getByRole('region', {
    name: 'Table with default selection labels',
  });
  const defaultLabelsExample = examples.getByRole('group', {
    name: 'Default selection label example',
    exact: true,
  });
  const defaultSelectAll = defaultLabelsRegion.getByRole('checkbox', {
    name: 'Select all rows',
    exact: true,
  });
  const defaultSelectRow = defaultLabelsRegion.getByRole('checkbox', {
    name: 'Select row',
    exact: true,
  });

  await expect(selectAll).toBeVisible();
  await expect(selectAll).not.toBeChecked();
  await expect(firstRow).toBeVisible();
  await expect(firstRow).not.toBeChecked();
  await expect(region.getByRole('checkbox')).toHaveCount(6);
  await expect(examples.getByRole('status')).toHaveText('Selected 0 of 5 team members.');
  await expect(defaultSelectAll).not.toBeChecked();
  await expect(defaultSelectRow).not.toBeChecked();
  await expect(examples).toHaveScreenshot('table-selection-empty-desktop.png', {
    animations: 'disabled',
  });
  await captureMobile(page, mainExample, 'table-selection-main-empty-320.png');
  await expect(
    mainExample.getByText(
      'Swipe to see more columns, or focus this region and use the arrow keys.',
      { exact: true },
    ),
  ).toBeVisible();
  await expectMobileRegionToOwnHorizontalScroll(page, region);
  await captureMobile(page, defaultLabelsExample, 'table-selection-default-labels-320.png');

  await page.setViewportSize(desktopViewport);
  await defaultSelectRow.check();
  await expect(defaultSelectRow).toBeChecked();
  await expect(defaultLabelsRegion.locator('tbody tr').first()).toHaveClass(/kui-row--selected/);
  await expect(examples.getByText('Default-label rows selected: 1.')).toBeVisible();
  await defaultSelectRow.uncheck();
  await expect(defaultSelectRow).not.toBeChecked();
  await expect(defaultLabelsRegion.locator('tbody tr').first()).not.toHaveClass(
    /kui-row--selected/,
  );
  await expect(examples.getByText('Default-label rows selected: 0.')).toBeVisible();

  await tabTo(page, firstRow);
  await expect(firstRow).toBeFocused();
  expect(await firstRow.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await page.mouse.move(0, 0);
  await expect(examples).toHaveScreenshot('table-selection-row-focused-desktop.png', {
    animations: 'disabled',
  });
  await page.keyboard.press('Space');
  await expect(firstRow).toBeChecked();
  await expect(selectAll).not.toBeChecked();
  await expect
    .poll(() => selectAll.evaluate((element) => (element as HTMLInputElement).indeterminate))
    .toBe(true);
  await expect(region.locator('tbody tr').first()).toHaveClass(/kui-row--selected/);
  await expect(examples.getByRole('status')).toHaveText('Selected 1 of 5 team members.');
  await expect(examples).toHaveScreenshot('table-selection-one-row-desktop.png', {
    animations: 'disabled',
  });

  await page.keyboard.press('Shift+Tab');
  await expect(selectAll).toBeFocused();
  await page.keyboard.press('Space');
  await expect(selectAll).toBeChecked();
  await expect(firstRow).toBeChecked();
  await expect(examples.getByRole('status')).toHaveText('Selected 5 of 5 team members.');
  await expect(examples).toHaveScreenshot('table-selection-all-desktop.png', {
    animations: 'disabled',
  });

  await page.keyboard.press('Space');
  await expect(selectAll).not.toBeChecked();
  await expect(examples.getByRole('status')).toHaveText('Selected 0 of 5 team members.');
  await expect(examples).toHaveScreenshot('table-selection-cleared-desktop.png', {
    animations: 'disabled',
  });
});

test('keeps the sticky header at the top of its scroll region and confines horizontal overflow @visual', async ({
  page,
}) => {
  const examples = getGroup(page, 'Sticky header example');
  const region = examples.getByRole('region', { name: 'Scrollable sticky-header table' });

  await expect(region.getByRole('row')).toHaveCount(11);
  await expect(region.locator('thead tr')).toHaveClass(/kui-th-group--sticky/);
  await expect(region).toHaveScreenshot('table-sticky-header-default-desktop.png', {
    animations: 'disabled',
  });

  await region.evaluate((element) => {
    element.scrollTop = 120;
  });
  await expect.poll(() => region.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await expect
    .poll(() =>
      region.evaluate((element) => {
        const regionTop = element.getBoundingClientRect().top;
        const headerTop =
          element.querySelector('thead th')?.getBoundingClientRect().top ?? Infinity;

        return Math.abs(headerTop - regionTop) < 2;
      }),
    )
    .toBe(true);
  await expect(region).toHaveScreenshot('table-sticky-header-scrolled-desktop.png', {
    animations: 'disabled',
  });

  await region.evaluate((element) => {
    element.scrollTop = 0;
    element.scrollLeft = 0;
  });
  await captureMobile(page, examples, 'table-sticky-header-320.png');
  await expect(
    examples.getByText('Swipe to see more columns, or focus this region and use the arrow keys.', {
      exact: true,
    }),
  ).toBeVisible();
  await expectMobileRegionToOwnHorizontalScroll(page, region);
});

test('keeps the catalogue responsive at desktop, tablet, and phone widths', async ({ page }) => {
  for (const viewport of [desktopViewport, tabletViewport, mobileViewport]) {
    await page.setViewportSize(viewport);

    if (viewport.width === mobileViewport.width) await collapseMobileNavigation(page);

    await expectNoHorizontalOverflow(page);
    await expect(page.getByRole('heading', { level: 1, name: 'Table' })).toBeVisible();
    await expect
      .poll(() =>
        page
          .locator('.table-playground__catalogue')
          .evaluate((element) => element.scrollWidth <= element.clientWidth),
      )
      .toBe(true);
  }
});

test('loads the Table locale scope and translates consumer labels while sort actions stay English', async ({
  page,
}) => {
  const localeResponse = await page.request.get('/i18n/table/ru.json');
  expect(localeResponse.ok()).toBe(true);
  const russian = (await localeResponse.json()) as {
    title: string;
    accessibility: { sorting: string; selection: string };
    captions: { defaultSelectionLabels: string };
    columns: { score: string };
    hints: { horizontalScroll: string };
    regions: { sorting: string; defaultSelectionLabels: string };
    members: { priya: string };
    selection: { selectMember: string };
  };

  await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: russian.title })).toBeVisible();

  const sorting = getGroup(page, russian.accessibility.sorting);
  const region = sorting.getByRole('region', { name: russian.regions.sorting });
  await expect(region.locator('thead th').first()).toHaveText(russian.columns.name);
  await expect(region.locator('thead th').nth(3)).toHaveText('Score');
  const scoreButton = region.getByRole('button', { name: 'Sort Score ascending', exact: true });
  await expect(scoreButton).toBeVisible();
  await scoreButton.click();
  const descendingScoreButton = region.getByRole('button', {
    name: 'Sort Score descending',
    exact: true,
  });
  await expect(descendingScoreButton).toBeVisible();
  await descendingScoreButton.click();
  await expect(region.getByRole('button', { name: 'Clear Score sort', exact: true })).toBeVisible();
  await region.getByRole('button', { name: 'Clear Score sort', exact: true }).click();
  await expect(
    region.getByRole('button', { name: 'Sort Score ascending', exact: true }),
  ).toBeVisible();

  const selection = getGroup(page, russian.accessibility.selection);
  const translatedCheckboxName = russian.selection.selectMember.replace(
    '{{name}}',
    russian.members.priya,
  );
  await expect(
    selection.getByRole('checkbox', { name: translatedCheckboxName, exact: true }),
  ).toBeVisible();

  const defaultLabelsRegion = selection.getByRole('region', {
    name: russian.regions.defaultSelectionLabels,
  });
  await expect(
    defaultLabelsRegion.getByRole('table', { name: russian.captions.defaultSelectionLabels }),
  ).toBeVisible();
  await expect(
    defaultLabelsRegion.getByRole('checkbox', { name: 'Select all rows', exact: true }),
  ).toBeVisible();
  await expect(
    defaultLabelsRegion.getByRole('checkbox', { name: 'Select row', exact: true }),
  ).toBeVisible();

  await page.setViewportSize(mobileViewport);
  await collapseMobileNavigation(page);
  await expect(selection.getByText(russian.hints.horizontalScroll, { exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

function getGroup(page: Page, accessibleName: string): Locator {
  return page.getByRole('group', { name: accessibleName, exact: true });
}

async function expectRowNames(region: Locator, names: readonly string[]): Promise<void> {
  await expect(region.locator('tbody tr > td:first-child')).toHaveText([...names]);
}

async function captureMobile(page: Page, example: Locator, screenshotName: string): Promise<void> {
  await page.setViewportSize(mobileViewport);
  await collapseMobileNavigation(page);
  await example.scrollIntoViewIfNeeded();
  await expectNoHorizontalOverflow(page);
  await expect(example).toHaveScreenshot(screenshotName, { animations: 'disabled' });
}

async function collapseMobileNavigation(page: Page): Promise<void> {
  expect(page.viewportSize()).toEqual(mobileViewport);
  const navigation = page.locator('app-component-sidebar nav.component-sidebar:visible');
  const expandedToggles = navigation.locator('button[aria-expanded="true"]:visible');

  await expect(navigation).toBeVisible();

  while ((await expandedToggles.count()) > 0) {
    const expandedCount = await expandedToggles.count();
    const toggle = expandedToggles.first();
    const panelId = await toggle.getAttribute('aria-controls');
    const containsCurrentPage = panelId
      ? (await navigation.locator(`[id="${panelId}"] [aria-current="page"]`).count()) > 0
      : false;

    if (containsCurrentPage) break;

    await toggle.click();
    await expect(expandedToggles).toHaveCount(expandedCount - 1);
  }
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
}

async function expectMobileRegionToOwnHorizontalScroll(page: Page, region: Locator): Promise<void> {
  await expectNoHorizontalOverflow(page);
  const dimensions = await region.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));

  expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);
  await region.focus();
  await expect(region).toBeFocused();

  const initialScrollLeft = await region.evaluate((element) => element.scrollLeft);
  await page.keyboard.press('ArrowRight');
  await expect
    .poll(() => region.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(initialScrollLeft);

  await region.evaluate((element) => {
    element.scrollLeft = 0;
  });
  await expectNoHorizontalOverflow(page);
}

async function tabTo(page: Page, target: Locator): Promise<void> {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) return;

    await page.keyboard.press('Tab');
  }

  throw new Error('Keyboard navigation did not reach the named Table control.');
}
