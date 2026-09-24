import { expect, test } from '@playwright/test';

const desktopViewport = { width: 1440, height: 1000 };
const mobileViewport = { width: 320, height: 844 };
const tabletViewport = { width: 768, height: 1024 };
const fixedBrowserTime = new Date('2026-05-14T12:00:00.000Z');

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.clock.install({ time: fixedBrowserTime });
  await page.goto('/components/date-picker');
  await expect(page.getByRole('heading', { level: 1, name: 'Date Picker' })).toBeVisible();
});

test('server-renders the Date Picker route and hydrates its combobox interaction', async ({
  browser,
  page,
}) => {
  const routeUrl = new URL('/components/date-picker', page.url()).toString();
  const serverContext = await browser.newContext({ javaScriptEnabled: false });

  try {
    const serverPage = await serverContext.newPage();
    const response = await serverPage.goto(routeUrl);

    expect(response?.status()).toBe(200);
    await expect(serverPage.getByRole('heading', { level: 1, name: 'Date Picker' })).toBeVisible();
    const serverInput = serverPage.getByRole('combobox', { name: 'Meeting date' });
    await expect(serverInput).toHaveValue('');
    await expect(serverInput).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(serverPage.getByRole('dialog')).toHaveCount(0);
  } finally {
    await serverContext.close();
  }

  const runtimeErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.goto('/components/date-picker');
  const input = page.getByRole('combobox', { name: 'Meeting date' });
  await input.press('ArrowDown');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('role', 'dialog');
  await expect(dialog.getByRole('button', { name: 'June 2026', exact: true })).toBeVisible();
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await input.press('Escape');
  await expect(dialog).toBeHidden();
  expect(runtimeErrors).toEqual([]);
});

test('captures the default and compact date picker at desktop, tablet, and 320px', async ({
  page,
}) => {
  const defaultExample = page.getByRole('group', {
    name: 'Default date picker example',
    exact: true,
  });
  const compactExample = page.getByRole('group', {
    name: 'Compact date picker example',
    exact: true,
  });
  const selectedExample = page.getByRole('group', {
    name: 'Selected date picker example',
    exact: true,
  });
  const defaultInput = defaultExample.getByRole('combobox', { name: 'Meeting date' });
  const selectedInput = selectedExample.getByRole('combobox', { name: 'Preselected date' });

  await expect(defaultInput).toHaveValue('');
  await expect(selectedInput).toHaveValue('14.05.2026');
  await expect(defaultInput).toHaveAttribute('aria-haspopup', 'dialog');
  await expect(defaultInput).toHaveAttribute('aria-expanded', 'false');
  await expect(defaultInput).toHaveAttribute('placeholder', 'dd.mm.yyyy');
  await expect(defaultInput).toHaveAttribute('autocomplete', 'off');
  await expect(defaultInput).not.toHaveAttribute('aria-controls', /.+/);
  const defaultInputId = await defaultInput.getAttribute('id');
  expect(defaultInputId).toBeTruthy();
  expect(
    await defaultInput.evaluate((element) => (element as HTMLInputElement).labels?.[0]?.htmlFor),
  ).toBe(defaultInputId);
  await expect(defaultExample).toHaveScreenshot('date-picker-default-desktop.png');
  await expect(selectedExample).toHaveScreenshot('date-picker-selected-desktop.png');
  await expect(compactExample).toHaveScreenshot('date-picker-compact-desktop.png');

  await page.setViewportSize(mobileViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await expect(defaultExample).toHaveScreenshot('date-picker-default-320.png');
  await expect(selectedExample).toHaveScreenshot('date-picker-selected-320.png');
  await expect(compactExample).toHaveScreenshot('date-picker-compact-320.png');

  await page.setViewportSize(tabletViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await expect(defaultExample).toHaveScreenshot('date-picker-default-tablet.png');
  await expect(selectedExample).toHaveScreenshot('date-picker-selected-tablet.png');
  await expect(compactExample).toHaveScreenshot('date-picker-compact-tablet.png');

  await page.setViewportSize(mobileViewport);
  await defaultInput.click();
  const panel = page.getByRole('dialog');
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('button', { name: 'June 2026', exact: true })).toBeVisible();
  const panelId = await panel.getAttribute('id');
  expect(panelId).toBeTruthy();
  await expect(defaultInput).toHaveAttribute('aria-controls', panelId!);
  await expect(defaultInput).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toHaveScreenshot('date-picker-default-open-320.png');
  const panelBounds = await panel.boundingBox();
  expect(panelBounds).not.toBeNull();
  expect(panelBounds!.x).toBeGreaterThanOrEqual(0);
  expect(panelBounds!.x + panelBounds!.width).toBeLessThanOrEqual(mobileViewport.width);
  const calendarBounds = await panel.locator('kui-calendar').boundingBox();
  expect(calendarBounds).not.toBeNull();
  expect(calendarBounds!.x).toBeGreaterThanOrEqual(panelBounds!.x);
  expect(calendarBounds!.x + calendarBounds!.width).toBeLessThanOrEqual(
    panelBounds!.x + panelBounds!.width,
  );
});

test('captures input focus, hover, open, focused-day, hovered-day, and pressed-day states', async ({
  page,
}) => {
  const example = page.getByRole('group', { name: 'Selected date picker example', exact: true });
  const input = example.getByRole('combobox', { name: 'Preselected date' });

  await input.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(input).toBeFocused();
  expect(await input.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await page.mouse.move(1, 1);
  await expect(example).toHaveScreenshot('date-picker-input-focused.png', {
    animations: 'disabled',
  });

  await input.hover();
  expect(await input.evaluate((element) => element.matches(':hover'))).toBe(true);
  await input.evaluate((element) => element.blur());
  await expect(example).toHaveScreenshot('date-picker-input-hovered.png', {
    animations: 'disabled',
  });

  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  const panel = page.getByRole('dialog');
  const grid = panel.getByRole('grid');
  await expect(panel).toBeVisible();
  await expect(panel).toHaveScreenshot('date-picker-open.png');

  await input.press('ArrowDown');
  const focusedDay = grid.getByRole('button', { name: '14', exact: true });
  await expect(focusedDay).toBeFocused();
  expect(await focusedDay.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(panel).toHaveScreenshot('date-picker-calendar-focused-day.png', {
    animations: 'disabled',
  });

  const hoveredDay = grid.getByRole('button', { name: '15', exact: true });
  await hoveredDay.hover();
  expect(await hoveredDay.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect(panel).toHaveScreenshot('date-picker-calendar-hovered-day.png', {
    animations: 'disabled',
  });

  await page.mouse.down();
  expect(await hoveredDay.evaluate((element) => element.matches(':active'))).toBe(true);
  await expect(panel).toHaveScreenshot('date-picker-calendar-pressed-day.png', {
    animations: 'disabled',
  });
  await page.mouse.up();
  await expect(input).toHaveValue('15.05.2026');
});

test('auto-wires typed values, calendar selection, and the displayed month', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Selected date picker example', exact: true });
  const input = example.getByRole('combobox', { name: 'Preselected date' });

  await input.fill(' 20.06.2026 ');
  const panel = page.getByRole('dialog');
  const grid = panel.getByRole('grid');

  await expect(input).toHaveValue('20.06.2026');
  await expect(panel.getByRole('button', { name: 'June 2026', exact: true })).toBeVisible();
  await expect(grid.getByRole('button', { name: '20', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(panel).toHaveScreenshot('date-picker-typed-date-open.png');

  await grid.getByRole('button', { name: '21', exact: true }).click();
  await expect(input).toHaveValue('21.06.2026');
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
});

test('preserves four-digit years below 0100 while parsing typed dates', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Selected date picker example', exact: true });
  const input = example.getByRole('combobox', { name: 'Preselected date' });

  await input.fill('01.01.0001');
  await expect(input).toHaveValue('01.01.0001');
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');

  await input.fill('29.02.0000');
  await expect(input).toHaveValue('29.02.0000');
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');

  await input.fill('29.02.0001');
  await expect(input).toHaveValue('29.02.0001');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
});

test('keeps the dropdown keyboard-accessible and returns focus on Escape', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Selected date picker example', exact: true });
  const input = example.getByRole('combobox', { name: 'Preselected date' });

  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await input.press('Enter');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(input).toBeFocused();

  await input.press('ArrowDown');
  await expect(page.getByRole('dialog')).toBeVisible();
  await input.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(input).toBeFocused();

  await input.press('ArrowDown');
  await expect(page.getByRole('dialog')).toBeVisible();
  await input.press('Tab');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(example.getByRole('button', { name: 'Clear', exact: true })).toBeFocused();
});

test('moves focus into the calendar and selects a day with the calendar keyboard', async ({
  page,
}) => {
  const example = page.getByRole('group', { name: 'Selected date picker example', exact: true });
  const input = example.getByRole('combobox', { name: 'Preselected date' });

  await input.press('ArrowDown');
  await input.press('ArrowDown');
  const grid = page.getByRole('dialog').getByRole('grid');
  const selectedDay = grid.getByRole('button', { name: '14', exact: true });
  await expect(selectedDay).toBeFocused();

  await page.keyboard.press('ArrowRight');
  const nextDay = grid.getByRole('button', { name: '15', exact: true });
  await expect(nextDay).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(input).toHaveValue('15.05.2026');
  await expect(nextDay).toHaveAttribute('aria-selected', 'true');
});

test('captures bounded dates and marks malformed or out-of-range typed values invalid', async ({
  page,
}) => {
  const example = page.getByRole('group', {
    name: 'Date picker disabled, readonly, and clearable examples',
    exact: true,
  });
  const input = example.getByRole('combobox', { name: 'Booking date' });

  await expect(input).toHaveValue('14.05.2026');
  await input.press('ArrowDown');
  const panel = page.getByRole('dialog');
  const grid = panel.getByRole('grid');
  await expect(grid.getByRole('button', { name: '7', exact: true })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await expect(grid.getByRole('button', { name: '25', exact: true })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await expect(grid.getByRole('button', { name: '8', exact: true })).not.toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await expect(grid.getByRole('button', { name: '24', exact: true })).not.toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await expect(panel).toHaveScreenshot('date-picker-bounds-open.png');

  await input.fill('08.05.2026');
  await expect(input).toHaveValue('08.05.2026');
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  await input.fill('24.05.2026');
  await expect(input).toHaveValue('24.05.2026');
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');

  await input.fill('32.13.2026');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toHaveAttribute('data-kui-invalid', '');
  await expect(grid.getByRole('button', { name: '24', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(example).toHaveScreenshot('date-picker-invalid-format.png', {
    animations: 'disabled',
  });

  await input.fill('');
  await expect(input).toHaveValue('');
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  await expect(grid.getByRole('button', { name: '24', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );

  await input.fill('20.05.2026');
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  await expect(input).not.toHaveAttribute('data-kui-invalid', '');

  await input.fill('01.05.2026');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toHaveAttribute('data-kui-invalid', '');
  const firstOfMay = grid
    .locator('.kui-calendar-day:not(.kui-calendar-day--muted)')
    .filter({ hasText: /^1$/ });
  await expect(firstOfMay).toHaveCount(1);
  await expect(firstOfMay).toHaveAttribute('aria-selected', 'true');
  await expect(firstOfMay).toHaveAttribute('aria-disabled', 'true');
  await expect(example).toHaveScreenshot('date-picker-out-of-range.png', {
    animations: 'disabled',
  });

  await input.fill('31.05.2026');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(grid.getByRole('button', { name: '31', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(grid.getByRole('button', { name: '31', exact: true })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await expect(example).toHaveScreenshot('date-picker-out-of-range-after-max.png', {
    animations: 'disabled',
  });
});

test('preserves native disabled and readonly semantics and exposes clear settings', async ({
  page,
}) => {
  const examples = page.getByRole('group', {
    name: 'Date picker disabled, readonly, and clearable examples',
    exact: true,
  });
  const disabled = examples.getByRole('combobox', { name: 'Disabled date picker' });
  const readonly = examples.getByRole('combobox', { name: 'Readonly date picker' });
  const localClearFalse = examples.getByRole('combobox', {
    name: 'Local clear disabled (provider enabled)',
  });
  const inherited = examples.getByRole('combobox', { name: 'Inherited clear setting' });

  await expect(disabled).toBeDisabled();
  await expect(disabled).toHaveAttribute('aria-expanded', 'false');
  await expect(readonly).toHaveAttribute('readonly', '');
  await expect(readonly).toHaveAttribute('aria-expanded', 'false');
  expect(await localClearFalse.getAttribute('id')).toBeTruthy();
  expect(
    await localClearFalse.evaluate((element) => (element as HTMLInputElement).labels?.[0]?.htmlFor),
  ).toBe(await localClearFalse.getAttribute('id'));
  await expect(localClearFalse).toHaveAttribute('placeholder', 'Enter a date');
  await expect(localClearFalse).not.toHaveAttribute('data-has-clear', '');
  await expect(inherited).toHaveAttribute('data-has-clear', '');
  await expect(examples.getByRole('button', { name: 'Clear', exact: true })).toHaveCount(1);
  await expect(examples.getByRole('combobox')).toHaveCount(5);

  await readonly.press('ArrowDown');
  await expect(readonly).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await expect(examples).toHaveScreenshot('date-picker-field-states-desktop.png');

  await page.setViewportSize(mobileViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await expect(examples).toHaveScreenshot('date-picker-field-states-320.png');

  await page.setViewportSize(tabletViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await expect(examples).toHaveScreenshot('date-picker-field-states-tablet.png');
});

test('captures clear-affordance focus-visible, hover, pressed, and calendar-toggle states', async ({
  page,
}) => {
  const example = page.getByRole('group', { name: 'Selected date picker example', exact: true });
  const input = example.getByRole('combobox', { name: 'Preselected date' });
  const clear = example.getByRole('button', { name: 'Clear', exact: true });

  await input.focus();
  await page.keyboard.press('Tab');
  await expect(clear).toBeFocused();
  expect(await clear.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(example).toHaveScreenshot('date-picker-clear-focus-visible.png', {
    animations: 'disabled',
  });

  await clear.evaluate((element) => element.blur());
  await clear.hover();
  expect(await clear.evaluate((element) => element.matches(':hover'))).toBe(true);
  expect(await clear.evaluate((element) => element.matches(':focus-visible'))).toBe(false);
  await expect(example).toHaveScreenshot('date-picker-clear-hovered.png', {
    animations: 'disabled',
  });

  await page.mouse.down();
  expect(await clear.evaluate((element) => element.matches(':active'))).toBe(true);
  await expect(example).toHaveScreenshot('date-picker-clear-pressed.png', {
    animations: 'disabled',
  });
  await page.mouse.up();

  const calendarToggle = example.getByRole('button', { name: 'Open calendar', exact: true });
  await calendarToggle.click();
  const closeToggle = example.getByRole('button', { name: 'Close calendar', exact: true });
  await expect(closeToggle).toHaveAttribute('aria-expanded', 'true');
  const panel = page.getByRole('dialog');
  await expect(panel).toBeVisible();
  await expect(panel).toHaveScreenshot('date-picker-calendar-toggle-open.png', {
    animations: 'disabled',
  });

  await closeToggle.click();
  const openToggle = example.getByRole('button', { name: 'Open calendar', exact: true });
  await expect(openToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toBeHidden();
});

test('clears a selected date and restores focus to its native input', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Selected date picker example', exact: true });
  const input = example.getByRole('combobox', { name: 'Preselected date' });

  await expect(input).toHaveValue('14.05.2026');
  await example.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
  await expect(example.getByRole('button', { name: 'Clear', exact: true })).toHaveCount(0);

  await input.press('ArrowDown');
  await expect(
    page.getByRole('dialog').getByRole('grid').getByRole('button', { name: '14', exact: true }),
  ).not.toHaveAttribute('aria-selected', 'true');
});

test('shows Signal Forms required state, touch validation, and recovery after selection', async ({
  page,
}) => {
  const example = page.getByRole('group', {
    name: 'Date picker Signal Forms example',
    exact: true,
  });
  const input = example.getByRole('combobox', { name: 'Required delivery date' });

  expect(await input.getAttribute('id')).toBeTruthy();
  expect(
    await input.evaluate((element) => (element as HTMLInputElement).labels?.[0]?.htmlFor),
  ).toBe(await input.getAttribute('id'));
  await expect(input).toHaveAttribute('placeholder', 'dd.mm.yyyy');
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  await expect(example.getByText('A delivery date is required.', { exact: true })).toBeHidden();
  await expect(input).toHaveAttribute('aria-describedby', /-hint/);
  await input.press('ArrowDown');
  await input.press('Escape');
  const requiredError = example.getByRole('alert');
  await expect(requiredError).toHaveText('A delivery date is required.');
  await expect(requiredError).toBeVisible();
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  const requiredErrorId = await requiredError.getAttribute('id');
  expect(requiredErrorId).toBeTruthy();
  expect((await input.getAttribute('aria-describedby'))?.split(/\s+/)).toContain(requiredErrorId);
  await expect(example).toHaveScreenshot('date-picker-signal-form-required.png');

  await input.press('ArrowDown');
  const panel = page.getByRole('dialog');
  await panel.getByRole('grid').getByRole('button', { name: '18', exact: true }).click();
  await expect(input).toHaveValue('18.05.2026');
  await expect(example.getByText('A delivery date is required.', { exact: true })).toBeHidden();
});

test('keeps the documented manual calendar model bindings synchronized', async ({ page }) => {
  const example = page.getByRole('group', {
    name: 'Date picker manual calendar binding example',
    exact: true,
  });
  const input = example.getByRole('combobox', { name: 'Manually bound date' });

  await input.fill('17.05.2026');
  const panel = page.getByRole('dialog');
  const grid = panel.getByRole('grid');

  await expect(grid.getByRole('button', { name: '17', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await panel.getByRole('button', { name: 'Next month', exact: true }).click();
  await expect(panel.getByRole('button', { name: 'June 2026', exact: true })).toBeVisible();
  await expect(panel).toHaveScreenshot('date-picker-manual-binding-open.png');
});

test('keeps the page labels and field names translated in Russian', async ({ page }) => {
  const response = await page.request.get(
    new URL('/i18n/date-picker/ru.json', page.url()).toString(),
  );
  expect(response.ok()).toBeTruthy();
  const russian: {
    title: string;
    accessibility: { default: string };
    fields: { meetingDate: string };
  } = await response.json();

  const englishInput = page.getByRole('combobox', { name: 'Meeting date' });
  await englishInput.press('ArrowDown');
  const calendarPanel = page.getByRole('dialog');
  await expect(calendarPanel.getByRole('button', { name: 'June 2026', exact: true })).toBeVisible();
  const englishWeekdays = await page.evaluate(() =>
    Array.from({ length: 7 }, (_, index) =>
      new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' }).format(
        new Date(Date.UTC(2026, 5, 7 + index)),
      ),
    ),
  );
  const renderedWeekdays = () =>
    calendarPanel
      .getByRole('row')
      .evaluate((row) => Array.from(row.children, (child) => child.textContent?.trim() ?? ''));
  expect(await renderedWeekdays()).toEqual(englishWeekdays);
  await englishInput.press('Escape');

  await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();

  await expect(
    page.getByRole('banner').getByRole('button').filter({ hasText: 'EN' }),
  ).toBeVisible();
  await expect(
    page.getByRole('main').getByRole('heading', { level: 1, name: russian.title }),
  ).toBeVisible();
  await expect(
    page.getByRole('main').getByRole('group', {
      name: russian.accessibility.default,
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole('combobox', { name: russian.fields.meetingDate })).toHaveValue('');

  const russianInput = page.getByRole('combobox', { name: russian.fields.meetingDate });
  await russianInput.press('ArrowDown');
  const russianMonth = await page.evaluate(() =>
    new Intl.DateTimeFormat('ru-RU', { month: 'long', timeZone: 'UTC' }).format(
      new Date(Date.UTC(2026, 5, 1)),
    ),
  );
  await expect(
    calendarPanel.getByRole('button', { name: `${russianMonth} 2026`, exact: true }),
  ).toBeVisible();
  const russianWeekdays = await page.evaluate(() =>
    Array.from({ length: 7 }, (_, index) =>
      new Intl.DateTimeFormat('ru-RU', { weekday: 'short', timeZone: 'UTC' }).format(
        new Date(Date.UTC(2026, 5, 1 + index)),
      ),
    ),
  );
  await expect.poll(renderedWeekdays).toEqual(russianWeekdays);
});
