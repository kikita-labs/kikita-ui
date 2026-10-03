import type { Locator, Page } from '@playwright/test';

import { expect, test } from './support/fixtures';
import { openWithHeldScripts } from './support/ssr';

/** The gridcell that owns a day button: `aria-selected` lives on the cell, not on the button. */
function gridcellOf(day: Locator): Locator {
  return day.locator('xpath=ancestor::*[@role="gridcell"]');
}

const sections = [
  { key: 'default', name: 'Default calendar range example' },
  { key: 'selection', name: 'Calendar range selection example' },
  { key: 'compact', name: 'Compact calendar range example' },
  { key: 'flat', name: 'Flat calendar range example' },
  { key: 'compact-flat', name: 'Compact flat calendar range example' },
  { key: 'footer-empty', name: 'Calendar range footer without a value example' },
  { key: 'footer-open', name: 'Calendar range footer with an open range example' },
  { key: 'footer-committed', name: 'Calendar range footer with a committed range example' },
  { key: 'constraints', name: 'Calendar range date limits and disabled date example' },
  { key: 'predicate', name: 'Calendar range disabled dates predicate example' },
  { key: 'navigation', name: 'Calendar range linked pair example' },
  { key: 'locales', name: 'Calendar range locale examples' },
] as const;

function group(page: Page, name: string): Locator {
  return page.getByRole('group', { name, exact: true });
}

/**
 * Waits until an example without an explicit locale renders the browser's en-US week.
 *
 * The server resolves `KUI_LOCALE` from the Node process locale, so the day grid can start on a
 * different weekday until hydration re-renders it. Every step that resolves dates must start
 * after that re-render.
 */
async function expectBrowserLocaleWeek(example: Locator): Promise<void> {
  const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
  const weekdays = Array.from({ length: 7 }, (_, index) =>
    weekdayFormatter.format(new Date(2026, 4, 3 + index)),
  );

  await expect(example.getByRole('row').first()).toHaveText(
    new RegExp(`^\\s*${weekdays.join('\\s*')}\\s*$`),
  );
}

async function moveMouseTo(page: Page, target: Locator): Promise<void> {
  await target.scrollIntoViewIfNeeded();
  const bounds = await target.boundingBox();
  if (!bounds) throw new Error('The target should have a visible bounding box.');
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.clock.setFixedTime(new Date('2026-05-14T12:00:00Z'));
  await page.goto('/components/calendar-range');
});

test('server renders the Calendar Range route and hydrates its fixed catalogue', async ({
  page,
}) => {
  const held = await openWithHeldScripts(page, '/components/calendar-range');
  const serverHeadings = [...held.serverHtml.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map(
    ([, text]) => text.replace(/<[^>]+>/g, '').trim(),
  );
  expect(serverHeadings).toContain('Calendar Range');

  const heading = page.getByRole('heading', { level: 1, name: 'Calendar Range' });
  await expect(heading).toBeVisible();
  await heading.evaluate((node) => node.setAttribute('data-server-node', ''));
  held.release();

  await expect(group(page, sections[0].name).getByRole('grid')).toBeVisible();
  await expect(heading).toHaveAttribute('data-server-node', '');

  const russian = await (await page.request.get('/i18n/calendar-range/ru.json')).json();
  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Switch language to Russian', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 1, name: russian.title })).toBeVisible();
});

for (const section of sections) {
  test(`captures the ${section.key} section at desktop and 320px @visual`, async ({ page }) => {
    const example = group(page, section.name);

    await expect(example).toBeVisible();
    await expectBrowserLocaleWeek(example);
    await expect(example).toHaveScreenshot(`calendar-range-${section.key}.png`, {
      animations: 'disabled',
    });

    await page.setViewportSize({ width: 320, height: 2400 });
    await expectBrowserLocaleWeek(example);
    await expect(example).toHaveScreenshot(`calendar-range-${section.key}-320.png`, {
      animations: 'disabled',
    });
  });
}

test('renders the empty default range with the current day as the roving tab stop', async ({
  page,
}) => {
  const example = group(page, sections[0].name);
  const grid = example.getByRole('grid');

  await expectBrowserLocaleWeek(example);
  await expect(example.getByRole('button', { name: 'May 2026', exact: true })).toBeVisible();
  await expect(grid.locator('[aria-selected="true"]')).toHaveCount(0);
  await expect(grid.locator('[aria-current="date"]')).toHaveText('14');
  await expect(grid.locator('button[tabindex="0"]')).toHaveText('14');
});

test('builds, reverses, and restarts a range across real clicks', async ({ page }) => {
  const example = group(page, 'Calendar range selection example');
  const grid = example.getByRole('grid');

  await expectBrowserLocaleWeek(example);
  await expect(example.getByText('No range selected', { exact: true })).toBeVisible();

  await grid.locator('.kui-calendar-day').filter({ hasText: /^12$/ }).click();
  await expect(example.getByText('Start 2026-05-12, end open', { exact: true })).toBeVisible();
  await expect(
    gridcellOf(grid.locator('.kui-calendar-day').filter({ hasText: /^12$/ })),
  ).toHaveAttribute('aria-selected', 'true');

  await grid.locator('.kui-calendar-day').filter({ hasText: /^20$/ }).click();
  await expect(
    example.getByText('Selected 2026-05-12 to 2026-05-20', { exact: true }),
  ).toBeVisible();
  await expect(grid.locator('[aria-selected="true"]')).toHaveCount(2);
  await expect(
    gridcellOf(grid.locator('.kui-calendar-day').filter({ hasText: /^20$/ })),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(
    gridcellOf(grid.locator('.kui-calendar-day').filter({ hasText: /^15$/ })),
  ).not.toHaveAttribute('aria-selected', 'true');

  await grid.locator('.kui-calendar-day').filter({ hasText: /^8$/ }).click();
  await expect(example.getByText('Start 2026-05-08, end open', { exact: true })).toBeVisible();

  await grid.locator('.kui-calendar-day').filter({ hasText: /^5$/ }).nth(0).click();
  await expect(
    example.getByText('Selected 2026-05-05 to 2026-05-08', { exact: true }),
  ).toBeVisible();

  await grid.locator('.kui-calendar-day').filter({ hasText: /^18$/ }).click();
  await grid.locator('.kui-calendar-day').filter({ hasText: /^18$/ }).click();
  await expect(
    example.getByText('Selected 2026-05-18 to 2026-05-18', { exact: true }),
  ).toBeVisible();
});

test('shows a hover preview before the second click @visual', async ({ page }) => {
  const example = group(page, 'Calendar range selection example');
  const grid = example.getByRole('grid');

  await expectBrowserLocaleWeek(example);
  await grid.locator('.kui-calendar-day').filter({ hasText: /^12$/ }).click();
  await moveMouseTo(page, grid.locator('.kui-calendar-day').filter({ hasText: /^18$/ }));
  expect(
    await grid
      .locator('.kui-calendar-day')
      .filter({ hasText: /^18$/ })
      .evaluate((day) => day.matches(':hover')),
  ).toBe(true);
  await expect(example).toHaveScreenshot('calendar-range-preview.png', { animations: 'disabled' });

  await grid.locator('.kui-calendar-day').filter({ hasText: /^18$/ }).click();
  await expect(
    example.getByText('Selected 2026-05-12 to 2026-05-18', { exact: true }),
  ).toBeVisible();
  await expect(example).toHaveScreenshot('calendar-range-committed.png', {
    animations: 'disabled',
  });
});

test('navigates to another month when an outside-month day is chosen', async ({ page }) => {
  const example = group(page, 'Calendar range selection example');
  const grid = example.getByRole('grid');

  await expectBrowserLocaleWeek(example);
  await grid.getByRole('button').last().click();

  await expect(example.getByRole('button', { name: 'June 2026', exact: true })).toBeVisible();
  await expect(example.getByText('Start 2026-06-06, end open', { exact: true })).toBeVisible();
});

test('selects a range with the keyboard and moves across a month boundary', async ({ page }) => {
  const example = group(page, 'Calendar range selection example');
  const grid = example.getByRole('grid');
  const today = grid.locator('.kui-calendar-day').filter({ hasText: /^14$/ });

  await expectBrowserLocaleWeek(example);
  // The roving tab stop is asserted instead of DOM focus: the library keeps DOM focus on the
  // previous cell (see the fixme below), while Enter and Space act on the tab-stop date.
  const tabStop = grid.locator('button[tabindex="0"]');

  await today.focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabStop).toHaveText('15');
  await tabStop.focus();
  await page.keyboard.press('Enter');
  await expect(example.getByText('Start 2026-05-15, end open', { exact: true })).toBeVisible();

  await tabStop.focus();
  await page.keyboard.press('ArrowDown');
  await expect(tabStop).toHaveText('22');
  await tabStop.focus();
  await page.keyboard.press('Space');
  await expect(
    example.getByText('Selected 2026-05-15 to 2026-05-22', { exact: true }),
  ).toBeVisible();

  await tabStop.focus();
  await page.keyboard.press('Home');
  await expect(tabStop).toHaveText('17');
  await tabStop.focus();
  await page.keyboard.press('End');
  await expect(tabStop).toHaveText('23');

  await tabStop.focus();
  await page.keyboard.press('PageDown');
  await expect(example.getByRole('button', { name: 'June 2026', exact: true })).toBeVisible();
  const june23 = grid.locator('.kui-calendar-day').filter({ hasText: /^23$/ });
  await expect(june23).toHaveAttribute('tabindex', '0');
  await june23.focus();
  await june23.press('Shift+PageUp');
  await expect(example.getByRole('button', { name: 'June 2025', exact: true })).toBeVisible();
});

test('captures a date cell in keyboard focus @visual', async ({ page }) => {
  const example = group(page, sections[0].name);
  const nextMonth = example.getByRole('button', { name: 'Next month', exact: true });
  const tabStop = example.getByRole('grid').locator('button[tabindex="0"]');

  await expectBrowserLocaleWeek(example);
  await nextMonth.focus();
  await nextMonth.press('Tab');

  await expect(tabStop).toBeFocused();
  expect(await tabStop.evaluate((day) => day.matches(':focus-visible'))).toBe(true);
  await expect(example).toHaveScreenshot('calendar-range-focused-day.png', {
    animations: 'disabled',
  });
});

test('captures a hovered date cell @visual', async ({ page }) => {
  const example = group(page, sections[0].name);
  const day = example.getByRole('grid').locator('.kui-calendar-day').filter({ hasText: /^20$/ });

  await expectBrowserLocaleWeek(example);
  await moveMouseTo(page, day);
  expect(await day.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect(example).toHaveScreenshot('calendar-range-hovered-day.png', {
    animations: 'disabled',
  });
});

test('drills from days to months and decade years and back @visual', async ({ page }) => {
  const example = group(page, sections[0].name);

  await expectBrowserLocaleWeek(example);
  await example.getByRole('button', { name: 'May 2026', exact: true }).click();
  await expect(example.getByRole('button', { name: 'Previous year', exact: true })).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(example).toHaveScreenshot('calendar-range-months-view.png', {
    animations: 'disabled',
  });

  await example.getByRole('button', { name: '2026', exact: true }).click();
  await expect(example.getByText('2021–2032', { exact: true })).toBeVisible();
  await expect(example.getByRole('button', { name: 'Previous decade', exact: true })).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(example).toHaveScreenshot('calendar-range-years-view.png', {
    animations: 'disabled',
  });

  await example.getByRole('button', { name: 'Next decade', exact: true }).click();
  await expect(example.getByText('2031–2042', { exact: true })).toBeVisible();
  await example.getByRole('button', { name: 'Previous decade', exact: true }).click();

  await example.getByRole('button', { name: '2026', exact: true }).click();
  await example.getByRole('button', { name: 'Next year', exact: true }).click();
  await expect(example.getByRole('button', { name: '2027', exact: true })).toBeVisible();
  await example.getByRole('button', { name: 'Previous year', exact: true }).click();
  await example.getByRole('button', { name: 'May', exact: true }).click();
  await expect(example.getByRole('button', { name: 'May 2026', exact: true })).toBeVisible();
});

test('shows the footer value for empty, open, and committed ranges', async ({ page }) => {
  const empty = group(page, 'Calendar range footer without a value example');
  const open = group(page, 'Calendar range footer with an open range example');
  const committed = group(page, 'Calendar range footer with a committed range example');

  await expect(empty.getByText('—', { exact: true })).toBeVisible();
  await expect(open.getByText('2026-05-12 – …', { exact: true })).toBeVisible();
  await expect(committed.getByText('2026-05-12 – 2026-05-20', { exact: true })).toBeVisible();
});

test('moves the footer calendar back to the current day without changing its range', async ({
  page,
}) => {
  const example = group(page, 'Calendar range footer with a committed range example');
  const grid = example.getByRole('grid');

  await expectBrowserLocaleWeek(example);
  await example.getByRole('button', { name: 'Next month', exact: true }).click();
  await expect(example.getByRole('button', { name: 'June 2026', exact: true })).toBeVisible();

  await example.getByRole('button', { name: 'Today', exact: true }).click();
  await expect(example.getByRole('button', { name: 'May 2026', exact: true })).toBeVisible();
  await expect(grid.locator('button[tabindex="0"]')).toHaveText('14');
  await expect(grid.locator('[aria-current="date"]')).toHaveText('14');
  await expect(example.getByText('2026-05-12 – 2026-05-20', { exact: true })).toBeVisible();
  await expect(grid.locator('[aria-selected="true"]')).toHaveCount(2);
});

test('disables dates outside the limits and the listed exception', async ({ page }) => {
  const example = group(page, 'Calendar range date limits and disabled date example');
  const grid = example.getByRole('grid');

  await expectBrowserLocaleWeek(example);
  for (const day of ['8', '24']) {
    await expect(
      grid.locator('.kui-calendar-day').filter({ hasText: new RegExp(`^${day}$`) }),
    ).not.toHaveAttribute('aria-disabled', 'true');
  }
  for (const day of ['7', '18', '25']) {
    await expect(
      grid.locator('.kui-calendar-day').filter({ hasText: new RegExp(`^${day}$`) }),
    ).toHaveAttribute('aria-disabled', 'true');
  }

  const disabled = grid.locator('.kui-calendar-day').filter({ hasText: /^18$/ });
  await moveMouseTo(page, disabled);
  await page.mouse.down();
  await page.mouse.up();
  await expect(
    gridcellOf(grid.locator('.kui-calendar-day').filter({ hasText: /^12$/ })),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(
    gridcellOf(grid.locator('.kui-calendar-day').filter({ hasText: /^20$/ })),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(gridcellOf(disabled)).not.toHaveAttribute('aria-selected', 'true');
});

test('rejects a disabled date from the keyboard but commits a range across it', async ({
  page,
}) => {
  const example = group(page, 'Calendar range date limits and disabled date example');
  const grid = example.getByRole('grid');
  const day17 = grid.locator('.kui-calendar-day').filter({ hasText: /^17$/ });

  await expectBrowserLocaleWeek(example);
  await day17.focus();
  await page.keyboard.press('ArrowRight');
  const day18 = grid.locator('.kui-calendar-day').filter({ hasText: /^18$/ });
  await expect(day18).toHaveAttribute('tabindex', '0');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  await expect(
    gridcellOf(grid.locator('.kui-calendar-day').filter({ hasText: /^12$/ })),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(gridcellOf(day18)).not.toHaveAttribute('aria-selected', 'true');

  await grid.locator('.kui-calendar-day').filter({ hasText: /^15$/ }).click();
  await grid.locator('.kui-calendar-day').filter({ hasText: /^20$/ }).click();
  await expect(
    gridcellOf(grid.locator('.kui-calendar-day').filter({ hasText: /^15$/ })),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(
    gridcellOf(grid.locator('.kui-calendar-day').filter({ hasText: /^20$/ })),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(day18).toHaveAttribute('aria-disabled', 'true');
  await expect(gridcellOf(day18)).not.toHaveAttribute('aria-selected', 'true');
});

test('disables weekend days through the predicate', async ({ page }) => {
  const example = group(page, 'Calendar range disabled dates predicate example');
  const grid = example.getByRole('grid');

  await expectBrowserLocaleWeek(example);
  await expect(grid.locator('.kui-calendar-day').filter({ hasText: /^15$/ })).not.toHaveAttribute(
    'aria-disabled',
    'true',
  );
  for (const day of ['16', '17']) {
    await expect(
      grid.locator('.kui-calendar-day').filter({ hasText: new RegExp(`^${day}$`) }),
    ).toHaveAttribute('aria-disabled', 'true');
  }
});

test('keeps a linked pair one month apart with one navigation button each', async ({ page }) => {
  const example = group(page, 'Calendar range linked pair example');
  const previous = example.getByRole('button', { name: 'Previous month', exact: true });
  const next = example.getByRole('button', { name: 'Next month', exact: true });

  await expect(previous).toHaveCount(1);
  await expect(next).toHaveCount(1);
  await expect(example.getByRole('button', { name: 'May 2026', exact: true })).toBeVisible();
  await expect(example.getByRole('button', { name: 'June 2026', exact: true })).toBeVisible();

  await previous.click();
  await expect(example.getByRole('button', { name: 'April 2026', exact: true })).toBeVisible();
  await expect(example.getByRole('button', { name: 'May 2026', exact: true })).toBeVisible();

  await next.click();
  await next.click();
  await expect(example.getByRole('button', { name: 'June 2026', exact: true })).toBeVisible();
  await expect(example.getByRole('button', { name: 'July 2026', exact: true })).toBeVisible();

  await previous.click();
  const [leading, trailing] = await example.getByRole('grid').all();
  await expectBrowserLocaleWeek(example);
  await leading.locator('.kui-calendar-day').filter({ hasText: /^12$/ }).click();
  await trailing.locator('.kui-calendar-day').filter({ hasText: /^20$/ }).click();
  await expect(
    gridcellOf(leading.locator('.kui-calendar-day').filter({ hasText: /^12$/ })),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(
    gridcellOf(trailing.locator('.kui-calendar-day').filter({ hasText: /^20$/ })),
  ).toHaveAttribute('aria-selected', 'true');
});

test('updates page labels and verifies the Russian calendar month and week', async ({ page }) => {
  const localeResponse = await page.request.get('/i18n/calendar-range/ru.json');
  expect(localeResponse.ok()).toBeTruthy();
  const russian = await localeResponse.json();

  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Switch language to Russian', exact: true })
    .click();

  await expect(page.getByRole('heading', { level: 1, name: russian.title })).toBeVisible();
  const localeGroup = page.getByRole('group', {
    name: russian.accessibility.locales,
    exact: true,
  });
  const russianCalendar = localeGroup.getByRole('group', {
    name: russian.locales.russian,
    exact: true,
  });
  const monthLabel = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(
    new Date(2026, 4, 1),
  );
  await expect(
    russianCalendar.getByRole('button', { name: monthLabel, exact: true }),
  ).toBeVisible();

  const weekdayFormatter = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' });
  const expectedWeekdays = Array.from({ length: 7 }, (_, index) =>
    weekdayFormatter.format(new Date(2026, 4, 4 + index)),
  );
  const renderedWeek = await russianCalendar.getByRole('row').first().innerText();
  expect(renderedWeek.replace(/\s+/g, ' ').trim()).toBe(expectedWeekdays.join(' '));

  await expect(
    page.getByRole('group', { name: russian.accessibility.selection, exact: true }),
  ).toBeVisible();
});

test.fixme('keeps a roving tab stop in the displayed month after navigating away from today', async ({
  page,
}) => {
  // Library defect: kui-calendar-range never re-anchors its focus date (unlike kui-calendar), so
  // after navigating to a month that does not contain the current day no cell is tabbable.
  const example = group(page, sections[0].name);

  await expectBrowserLocaleWeek(example);
  await example.getByRole('button', { name: 'Next month', exact: true }).click();
  await expect(example.getByRole('button', { name: 'June 2026', exact: true })).toBeVisible();
  await expect(example.getByRole('grid').locator('button[tabindex="0"]')).toHaveCount(1);
});

test.fixme('moves DOM focus to the next day when an arrow key is pressed', async ({ page }) => {
  // Library defect: kui-calendar-range queries its tab stop in a microtask, before the re-render
  // moves it, so focus stays on the previous cell. kui-calendar waits for the next render.
  const example = group(page, sections[0].name);
  const grid = example.getByRole('grid');
  const today = grid.locator('.kui-calendar-day').filter({ hasText: /^14$/ });

  await expectBrowserLocaleWeek(example);
  await today.focus();
  await today.press('ArrowRight');
  await expect(grid.locator('.kui-calendar-day').filter({ hasText: /^15$/ })).toBeFocused();
});

test.fixme('announces the new month when the Next month button is used', async ({ page }) => {
  // Library gap: docs/calendar-range.md says month and year changes use an aria-live region, but
  // only picking a month from the month grid writes to it.
  const example = group(page, sections[0].name);

  await expectBrowserLocaleWeek(example);
  await example.getByRole('button', { name: 'Next month', exact: true }).click();
  await expect(example.locator('[aria-live="polite"]')).toHaveText('June 2026');
});

test('keeps the range catalogue inside tablet and 320px layouts @visual', async ({ page }) => {
  for (const viewport of [
    { width: 768, height: 7000, name: 'tablet-768' },
    { width: 320, height: 7000, name: 'mobile-320' },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/components/calendar-range');

    const main = page.getByRole('main');
    await expect(main).toBeVisible();
    await expectBrowserLocaleWeek(group(page, sections[0].name));
    const dimensions = await main.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    expect(
      dimensions.scrollWidth,
      `${viewport.name}: ${JSON.stringify(dimensions)}`,
    ).toBeLessThanOrEqual(dimensions.clientWidth);

    if (viewport.width === 320) {
      for (const calendar of await main.locator('kui-calendar-range').all()) {
        const calendarBounds = await calendar.boundingBox();
        const cardBounds = await calendar.locator('xpath=ancestor::article[1]').boundingBox();
        if (!calendarBounds || !cardBounds) throw new Error('A calendar or card has no bounds.');

        expect(calendarBounds.x).toBeGreaterThanOrEqual(cardBounds.x);
        expect(calendarBounds.x + calendarBounds.width).toBeLessThanOrEqual(
          cardBounds.x + cardBounds.width,
        );
      }
    }
    // Every section is captured separately at 320px; a single tall 320px capture is truncated by
    // the browser, so only the tablet layout gets a full-page capture.
    if (viewport.width > 320) {
      await expect(main).toHaveScreenshot(`calendar-range-page-${viewport.name}.png`, {
        animations: 'disabled',
      });
    }
  }
});
