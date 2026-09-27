import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.clock.install({ time: new Date(2026, 0, 14, 12) });
  await page.goto('/components/calendar');
});

test('server renders the Calendar route and hydrates its fixed catalogue', async ({ page }) => {
  const response = await page.request.get('/components/calendar');

  expect(response.status()).toBe(200);
  const serverMarkup = await response.text();
  const serverHeadings = [...serverMarkup.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map(
    ([, text]) => text.replace(/<[^>]+>/g, '').trim(),
  );
  expect(serverHeadings).toContain('Calendar');

  await page.goto('/components/calendar');
  await expect(page.getByRole('heading', { level: 1, name: 'Calendar' })).toBeVisible();
  await expect(
    page.getByRole('group', { name: 'Default calendar example', exact: true }).getByRole('grid'),
  ).toBeVisible();
});

test('captures the default single-date calendar', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default calendar example', exact: true });
  const grid = example.getByRole('grid');

  await expect(page.getByRole('heading', { level: 1, name: 'Calendar' })).toBeVisible();
  await expect(example.getByRole('button', { name: 'May 2026', exact: true })).toBeVisible();
  await expect(grid.locator('[aria-selected="true"]')).toHaveCount(0);
  await expect(grid.locator('button[tabindex="0"]')).toHaveText('1');
  await expect(example).toHaveScreenshot('calendar-default.png');
});

test('captures compact and flat calendar examples', async ({ page }) => {
  await expect(
    page.getByRole('group', { name: 'Compact calendar example', exact: true }),
  ).toHaveScreenshot('calendar-compact.png');
  await expect(
    page.getByRole('group', { name: 'Flat calendar example', exact: true }),
  ).toHaveScreenshot('calendar-flat.png');

  const compactFlatExample = page.getByRole('group', {
    name: 'Compact flat calendar example',
    exact: true,
  });
  const compactFlatCalendar = compactFlatExample.locator('kui-calendar');
  await expect(compactFlatCalendar).toHaveAttribute('data-kui-size', 'sm');
  await expect(compactFlatCalendar).toHaveAttribute('data-kui-flat', '');
  await expect(compactFlatExample).toHaveScreenshot('calendar-compact-flat.png');
});

test('captures the calendar footer and constrained date states', async ({ page }) => {
  await expect(
    page.getByRole('group', { name: 'Calendar footer example', exact: true }),
  ).toHaveScreenshot('calendar-footer.png');

  const example = page.getByRole('group', {
    name: 'Calendar date limits and disabled date example',
    exact: true,
  });
  const grid = example.getByRole('grid');

  for (const day of ['5', '18', '25']) {
    const dates = grid.getByRole('button', { name: day, exact: true });
    await expect(dates).not.toHaveCount(0);

    for (const date of await dates.all()) {
      await expect(date).toHaveAttribute('aria-disabled', 'true');
    }
  }

  for (const day of ['8', '24']) {
    const endpoint = grid.getByRole('button', { name: day, exact: true });
    await expect(endpoint).toBeVisible();
    await expect(endpoint).not.toHaveAttribute('aria-disabled', 'true');
  }
  await expect(example).toHaveScreenshot('calendar-constraints.png');
});

test('moves the footer calendar to the frozen current day without changing its selected value', async ({
  page,
}) => {
  const example = page.getByRole('group', { name: 'Calendar footer example', exact: true });
  const calendar = example.locator('kui-calendar');
  const grid = calendar.getByRole('grid');
  const footerValue = calendar.locator('.kui-calendar-value');

  await expect(footerValue).toHaveText('2026-05-25');
  await calendar.getByRole('button', { name: 'Today', exact: true }).click();

  await expect(calendar.getByRole('button', { name: 'January 2026', exact: true })).toBeVisible();
  await expect(grid.locator('button[tabindex="0"]')).toHaveText('14');
  await expect(grid.locator('[aria-current="date"]')).toHaveText('14');
  await expect(grid.locator('[aria-selected="true"]')).toHaveCount(0);
  await expect(footerValue).toHaveText('2026-05-25');
  await expect(example).toHaveScreenshot('calendar-footer-today-view.png', {
    animations: 'disabled',
  });

  const today = grid.getByRole('button', { name: '14', exact: true });
  await today.click();
  await expect(today).toHaveAttribute('aria-selected', 'true');
  await expect(footerValue).toHaveText('2026-01-14');
});

test('captures explicit English and Russian locale examples', async ({ page }) => {
  await expect(
    page.getByRole('group', { name: 'Calendar locale examples', exact: true }),
  ).toHaveScreenshot('calendar-locales.png');
});

test('captures a date cell in keyboard focus', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default calendar example', exact: true });
  const nextMonth = example.getByRole('button', { name: 'Next month', exact: true });
  const grid = example.getByRole('grid');
  const firstDay = grid.locator('button[tabindex="0"]');

  await nextMonth.focus();
  await nextMonth.press('Tab');

  await expect(firstDay).toBeFocused();
  expect(await firstDay.evaluate((day) => day.matches(':focus-visible'))).toBe(true);
  await expect(example).toHaveScreenshot('calendar-focused-day.png', { animations: 'disabled' });
});

test('captures a hovered date cell', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default calendar example', exact: true });
  const day = example.getByRole('grid').getByRole('button', { name: '15', exact: true });

  await day.scrollIntoViewIfNeeded();
  const bounds = await day.boundingBox();
  if (!bounds) throw new Error('Calendar day should have a visible bounding box.');
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  expect(await day.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect(example).toHaveScreenshot('calendar-hovered-day.png', { animations: 'disabled' });
});

test('moves keyboard focus through week, week edges, month, and year boundaries', async ({
  page,
}) => {
  const example = page.getByRole('group', { name: 'Default calendar example', exact: true });
  const grid = example.getByRole('grid');
  const selectedDay = grid.getByRole('button', { name: '14', exact: true });

  await selectedDay.focus();
  await selectedDay.press('ArrowRight');
  const day15 = grid.getByRole('button', { name: '15', exact: true });
  await expect(day15).toBeFocused();

  await day15.press('ArrowDown');
  const day22 = grid.getByRole('button', { name: '22', exact: true });
  await expect(day22).toBeFocused();

  await day22.press('Home');
  const weekStart = grid.getByRole('button', { name: '17', exact: true });
  await expect(weekStart).toBeFocused();

  await weekStart.press('End');
  const weekEnd = grid.getByRole('button', { name: '23', exact: true });
  await expect(weekEnd).toBeFocused();

  await weekEnd.press('PageDown');
  await expect(example.getByRole('button', { name: 'June 2026', exact: true })).toBeVisible();
  const june23 = grid.getByRole('button', { name: '23', exact: true });
  await expect(june23).toHaveAttribute('tabindex', '0');
  await june23.focus();

  await june23.press('Shift+PageUp');
  await expect(example.getByRole('button', { name: 'June 2025', exact: true })).toBeVisible();
  const june23PreviousYear = grid.getByRole('button', { name: '23', exact: true });
  await expect(june23PreviousYear).toHaveAttribute('tabindex', '0');
  await june23PreviousYear.focus();
  await june23PreviousYear.press('Enter');
  await expect(june23PreviousYear).toHaveAttribute('aria-selected', 'true');
});

test('navigates to the next month and selects a date', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default calendar example', exact: true });
  const grid = example.getByRole('grid');

  await example.getByRole('button', { name: 'Next month', exact: true }).click();
  await expect(example.getByRole('button', { name: 'June 2026', exact: true })).toBeVisible();

  const selectedDay = grid.getByRole('button', { name: '20', exact: true });
  await selectedDay.click();
  await expect(selectedDay).toHaveAttribute('aria-selected', 'true');
  await expect(example).toHaveScreenshot('calendar-date-selected.png', { animations: 'disabled' });
});

test('opens month and year pickers and navigates the decade range', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default calendar example', exact: true });

  await example.getByRole('button', { name: 'May 2026', exact: true }).click();
  const yearButton = example.getByRole('button', { name: '2026', exact: true });
  await expect(yearButton).toBeVisible();
  await yearButton.click();

  await expect(example.getByText('2021–2032', { exact: true })).toBeVisible();
  await example.getByRole('button', { name: 'Next decade', exact: true }).click();
  await expect(example.getByText('2031–2042', { exact: true })).toBeVisible();
  await example.getByRole('button', { name: 'Previous decade', exact: true }).click();

  await example.getByRole('button', { name: '2026', exact: true }).click();
  await expect(example.getByRole('button', { name: 'May', exact: true })).toBeVisible();
  await example.getByRole('button', { name: 'May', exact: true }).click();
  await expect(example.getByRole('button', { name: 'May 2026', exact: true })).toBeVisible();
});

test('keeps a disabled date unselected when activated', async ({ page }) => {
  const example = page.getByRole('group', {
    name: 'Calendar date limits and disabled date example',
    exact: true,
  });
  const grid = example.getByRole('grid');
  const selectedDate = grid.getByRole('button', { name: '14', exact: true });
  const disabledDate = grid.getByRole('button', { name: '18', exact: true });

  await expect(selectedDate).toHaveCount(1);
  await expect(disabledDate).toHaveAttribute('aria-disabled', 'true');
  const selectedDateLabel = await selectedDate.textContent();

  const bounds = await disabledDate.boundingBox();
  if (!bounds) throw new Error('The disabled Calendar day should have a visible bounding box.');
  await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);

  await expect(selectedDate).toHaveAttribute('aria-selected', 'true');
  await expect(selectedDate).toHaveText(selectedDateLabel ?? '');
  await expect(disabledDate).not.toHaveAttribute('aria-selected', 'true');
});

test('does not select a disabled date through keyboard activation', async ({ page }) => {
  const example = page.getByRole('group', {
    name: 'Calendar date limits and disabled date example',
    exact: true,
  });
  const grid = example.getByRole('grid');
  const selectedDate = grid.getByRole('button', { name: '14', exact: true });
  const dayBeforeDisabled = grid.getByRole('button', { name: '17', exact: true });
  const disabledDate = grid.getByRole('button', { name: '18', exact: true });

  await expect(selectedDate).toHaveAttribute('aria-selected', 'true');
  await dayBeforeDisabled.focus();
  await dayBeforeDisabled.press('ArrowRight');

  await expect(disabledDate).toBeFocused();
  await expect(disabledDate).toHaveAttribute('aria-disabled', 'true');
  await disabledDate.press('Enter');
  await expect(selectedDate).toHaveAttribute('aria-selected', 'true');
  await expect(disabledDate).not.toHaveAttribute('aria-selected', 'true');

  await disabledDate.press('Space');
  await expect(selectedDate).toHaveAttribute('aria-selected', 'true');
  await expect(disabledDate).not.toHaveAttribute('aria-selected', 'true');
});

test('allows both inclusive date-limit endpoints to be selected', async ({ page }) => {
  const example = page.getByRole('group', {
    name: 'Calendar date limits and disabled date example',
    exact: true,
  });
  const grid = example.getByRole('grid');

  for (const day of ['8', '24']) {
    const endpoint = grid.getByRole('button', { name: day, exact: true });
    await expect(endpoint).not.toHaveAttribute('aria-disabled', 'true');
    await endpoint.click();
    await expect(endpoint).toHaveAttribute('aria-selected', 'true');
  }
});

test('updates localized page labels and verifies Russian Calendar month and week labels', async ({
  page,
}) => {
  const localeResponse = await page.request.get('/i18n/calendar/ru.json');
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
  const monthLabel = `${new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(
    new Date(2026, 4, 1),
  )} 2026`;
  await expect(
    russianCalendar.getByRole('button', { name: monthLabel, exact: true }),
  ).toBeVisible();

  const weekdayFormatter = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' });
  const expectedWeekdays = Array.from({ length: 7 }, (_, index) =>
    weekdayFormatter.format(new Date(2026, 4, 4 + index)),
  );
  const renderedWeek = await russianCalendar.getByRole('row').first().innerText();
  expect(renderedWeek.replace(/\s+/g, ' ').trim()).toBe(expectedWeekdays.join(' '));
});

test('keeps the calendar catalogue inside tablet and 320px layouts', async ({ page }) => {
  for (const viewport of [
    { width: 768, height: 1024, name: 'tablet-768' },
    { width: 320, height: 640, name: 'mobile-320' },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/components/calendar');

    const main = page.getByRole('main');
    await expect(main).toBeVisible();
    const dimensions = await main.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return {
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        overflowingElements: Array.from(element.querySelectorAll<HTMLElement>('*'))
          .map((child) => {
            const childBounds = child.getBoundingClientRect();
            return {
              tag: child.tagName.toLowerCase(),
              className: typeof child.className === 'string' ? child.className : '',
              left: Math.round(childBounds.left - bounds.left),
              right: Math.round(childBounds.right - bounds.left),
              width: Math.round(childBounds.width),
              scrollWidth: child.scrollWidth,
              clientWidth: child.clientWidth,
            };
          })
          .filter(
            (child) => child.right > bounds.width + 1 || child.scrollWidth > child.clientWidth + 1,
          ),
      };
    });
    expect(
      dimensions.scrollWidth,
      `${viewport.name}: ${JSON.stringify(dimensions)}`,
    ).toBeLessThanOrEqual(dimensions.clientWidth);
    if (viewport.width === 320) {
      const calendars = await main.locator('kui-calendar').all();
      for (const calendar of calendars) {
        const calendarBounds = await calendar.boundingBox();
        const cardBounds = await calendar.locator('xpath=ancestor::article[1]').boundingBox();
        const exampleName = await calendar.evaluate(
          (element) =>
            element.closest<HTMLElement>('[role="group"]')?.getAttribute('aria-label') ??
            'unnamed Calendar example',
        );

        if (!calendarBounds || !cardBounds) {
          throw new Error(`${exampleName}: Calendar or example card has no visible bounds.`);
        }

        const calendarRight = calendarBounds.x + calendarBounds.width;
        const cardRight = cardBounds.x + cardBounds.width;
        const boundsMessage =
          `${exampleName}: Calendar bounds [${calendarBounds.x}, ${calendarRight}] ` +
          `must fit example card bounds [${cardBounds.x}, ${cardRight}].`;

        expect(calendarBounds.x, boundsMessage).toBeGreaterThanOrEqual(cardBounds.x);
        expect(calendarRight, boundsMessage).toBeLessThanOrEqual(cardRight);
      }
    }
    await expect(main).toHaveScreenshot(`calendar-page-${viewport.name}.png`, {
      animations: 'disabled',
    });
  }
});
