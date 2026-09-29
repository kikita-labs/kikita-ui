import type { Locator, Page } from '@playwright/test';

import { expect, test } from '../../../tests/e2e/support/fixtures';

const desktopViewport = { width: 1440, height: 1000 };
const tabletViewport = { width: 768, height: 1024 };
const mobileViewport = { width: 320, height: 844 };
// Tall enough for the shell's content scroller to show every catalogue card without clipping it.
const mobileCatalogueViewport = { width: 320, height: 2400 };

// 15:05 UTC is in the afternoon, so an unset 12-hour period that fell back to the wall clock would
// be PM. Every test pins `Date` so that fallback is deterministic; timers stay real.
const fixedBrowserTime = new Date('2026-05-14T15:05:00.000Z');

const groupNames = {
  default: 'Default time picker example',
  formats: 'Time picker formats example',
  steps: 'Time picker steps example',
  bounds: 'Time picker bounds example',
  fieldStates: 'Time picker clearable, disabled, and readonly examples',
  fieldWiring: 'Time picker field wiring example',
  sizes: 'Time picker sizes example',
  signalForms: 'Time picker Signal Forms example',
  inline: 'Inline time picker panel example',
} as const;

type GroupKey = keyof typeof groupNames;

function group(page: Page, key: GroupKey): Locator {
  return page.getByRole('group', { name: groupNames[key], exact: true });
}

function picker(page: Page, name: string): Locator {
  return page.getByRole('combobox', { name, exact: true });
}

function fieldOf(input: Locator): Locator {
  return input.locator('xpath=ancestor::kui-field');
}

function clearButton(input: Locator): Locator {
  return fieldOf(input).getByRole('button', { name: 'Clear', exact: true });
}

function column(panel: Locator, name: 'Hours' | 'Minutes' | 'Seconds'): Locator {
  return panel.getByRole('listbox', { name, exact: true });
}

function cell(panel: Locator, columnName: 'Hours' | 'Minutes' | 'Seconds', label: string): Locator {
  return column(panel, columnName).getByRole('option', { name: label, exact: true });
}

/** Resolves once every column has finished scrolling its selected cell to the middle (or the scroll limit). */
async function expectSelectedCellsCentered(panel: Locator): Promise<void> {
  await expect
    .poll(() =>
      panel.getByRole('listbox').evaluateAll((columns) =>
        columns.every((col) => {
          const selected = col.querySelector('[role="option"][aria-selected="true"]');
          if (!selected) return true;
          const columnRect = col.getBoundingClientRect();
          const cellRect = selected.getBoundingClientRect();
          const cellTop = col.scrollTop + (cellRect.top - columnRect.top);
          const wanted = Math.min(
            Math.max(cellTop - col.clientHeight / 2 + cellRect.height / 2, 0),
            col.scrollHeight - col.clientHeight,
          );
          return Math.abs(col.scrollTop - wanted) <= 1;
        }),
      ),
    )
    .toBe(true);
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
}

async function closeWithEscape(page: Page, input: Locator): Promise<void> {
  await input.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.clock.setFixedTime(fixedBrowserTime);
  await page.goto('/components/time-picker');
  await expect(page.getByRole('heading', { level: 1, name: 'Time Picker' })).toBeVisible();
});

test('server-renders the Time Picker route and hydrates its combobox interaction', async ({
  browser,
  page,
}) => {
  const routeUrl = new URL('/components/time-picker', page.url()).toString();
  const serverContext = await browser.newContext({ javaScriptEnabled: false });

  try {
    const serverPage = await serverContext.newPage();
    const response = await serverPage.goto(routeUrl);

    expect(response?.status()).toBe(200);
    await expect(serverPage.getByRole('heading', { level: 1, name: 'Time Picker' })).toBeVisible();
    const serverInput = picker(serverPage, 'Meeting time');
    await expect(serverInput).toHaveValue('');
    await expect(serverInput).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(serverInput).toHaveAttribute('placeholder', 'hh:mm');
    await expect(serverPage.getByRole('dialog')).toHaveCount(0);
    await expect(picker(serverPage, '12-hour time')).toHaveValue('02:30 PM');
  } finally {
    await serverContext.close();
  }

  const input = picker(page, 'Meeting time');
  await input.press('ArrowDown');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await expect(column(dialog, 'Hours')).toBeVisible();
  await expect(column(dialog, 'Minutes')).toBeVisible();
  await expect(column(dialog, 'Seconds')).toHaveCount(0);
  await closeWithEscape(page, input);
  await expect(input).toHaveAttribute('aria-expanded', 'false');
});

test('renders each format with its value, placeholder mask, and seconds column', async ({
  page,
}) => {
  const formats = group(page, 'formats');
  const cases = [
    { name: '24-hour time', value: '14:30', placeholder: 'hh:mm', seconds: false },
    {
      name: '24-hour time with seconds',
      value: '14:30:45',
      placeholder: 'hh:mm:ss',
      seconds: true,
    },
    { name: '12-hour time', value: '02:30 PM', placeholder: 'hh:mm AM/PM', seconds: false },
    {
      name: '12-hour time with seconds',
      value: '09:05:30 AM',
      placeholder: 'hh:mm:ss AM/PM',
      seconds: true,
    },
  ];

  for (const item of cases) {
    const input = formats.getByRole('combobox', { name: item.name, exact: true });

    await expect(input).toHaveValue(item.value);
    await expect(input).toHaveAttribute('autocomplete', 'off');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).not.toHaveAttribute('aria-controls', /.+/);
    const inputId = await input.getAttribute('id');
    expect(inputId).toBeTruthy();
    expect(
      await input.evaluate((element) => (element as HTMLInputElement).labels?.[0]?.htmlFor),
    ).toBe(inputId);

    await input.press('ArrowDown');
    const panel = page.getByRole('dialog');
    await expect(panel).toBeVisible();
    await expect(column(panel, 'Seconds')).toHaveCount(item.seconds ? 1 : 0);
    await expect(panel.getByRole('radiogroup', { name: 'AM/PM' })).toHaveCount(
      item.name.startsWith('12') ? 1 : 0,
    );
    await closeWithEscape(page, input);

    await clearButton(input).click();
    await expect(input).toHaveValue('');
    await expect(input).toHaveAttribute('placeholder', item.placeholder);
    await expect(input).toBeFocused();
    await closeWithEscape(page, input);
  }
});

test('opens with a click, marks the picked cells, and keeps the panel open while picking', async ({
  page,
}) => {
  const input = picker(page, 'Meeting time');

  await input.click();
  const panel = page.getByRole('dialog');
  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute('role', 'dialog');
  const panelId = await panel.getAttribute('id');
  expect(panelId).toBeTruthy();
  await expect(input).toHaveAttribute('aria-controls', panelId!);

  await expect(panel.getByRole('option', { selected: true })).toHaveCount(0);
  await cell(panel, 'Hours', '09').click();
  await expect(input).toHaveValue('09:00');
  await expect(cell(panel, 'Hours', '09')).toHaveAttribute('aria-selected', 'true');
  await cell(panel, 'Minutes', '30').click();
  await expect(input).toHaveValue('09:30');
  await expect(cell(panel, 'Minutes', '30')).toHaveAttribute('aria-selected', 'true');
  await expect(panel).toBeVisible();
  await expect(input).toHaveAttribute('aria-expanded', 'true');

  await panel.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(panel).toBeHidden();
  await expect(input).toHaveValue('09:30');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
});

test('opens from the chevron button and reports its expanded state', async ({ page }) => {
  const example = group(page, 'default');
  const input = picker(page, 'Meeting time');

  await example.getByRole('button', { name: 'Open time picker', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const close = example.getByRole('button', { name: 'Close time picker', exact: true });
  await expect(close).toHaveAttribute('aria-expanded', 'true');
  await expect(input).toBeFocused();

  await close.click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    example.getByRole('button', { name: 'Open time picker', exact: true }),
  ).toHaveAttribute('aria-expanded', 'false');
});

test('centers the selected cell of every column when the panel opens', async ({ page }) => {
  const input = group(page, 'formats').getByRole('combobox', {
    name: '24-hour time with seconds',
    exact: true,
  });

  await input.press('ArrowDown');
  const panel = page.getByRole('dialog');
  await expect(cell(panel, 'Hours', '14')).toHaveAttribute('aria-selected', 'true');
  await expect(cell(panel, 'Minutes', '30')).toHaveAttribute('aria-selected', 'true');
  await expect(cell(panel, 'Seconds', '45')).toHaveAttribute('aria-selected', 'true');
  await expectSelectedCellsCentered(panel);
  expect(await column(panel, 'Hours').evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  expect(await column(panel, 'Seconds').evaluate((element) => element.scrollTop)).toBeGreaterThan(
    0,
  );

  await cell(panel, 'Hours', '20').click();
  await expect(input).toHaveValue('20:30:45');
  await expectSelectedCellsCentered(panel);
});

test('moves through a column with the keyboard and wraps at both ends', async ({ page }) => {
  const input = picker(page, 'Meeting time');

  await input.focus();
  await input.press('ArrowDown');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(input).toBeFocused();
  await input.press('ArrowDown');
  const hours = column(page.getByRole('dialog'), 'Hours');
  await expect(hours).toBeFocused();

  await page.keyboard.press('ArrowDown');
  await expect(input).toHaveValue('00:00');
  await page.keyboard.press('ArrowDown');
  await expect(input).toHaveValue('01:00');
  await page.keyboard.press('End');
  await expect(input).toHaveValue('23:00');
  await page.keyboard.press('ArrowDown');
  await expect(input).toHaveValue('00:00');
  await page.keyboard.press('ArrowUp');
  await expect(input).toHaveValue('23:00');
  await page.keyboard.press('Home');
  await expect(input).toHaveValue('00:00');
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(input).toHaveValue('00:00');
});

test('toggles the input panel with Enter and closes it with Escape or Tab', async ({ page }) => {
  const example = group(page, 'formats');
  const input = example.getByRole('combobox', { name: '24-hour time', exact: true });

  await input.focus();
  await input.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await input.press('Enter');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(input).toBeFocused();

  await input.press('ArrowDown');
  await expect(page.getByRole('dialog')).toBeVisible();
  await input.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(input).toBeFocused();
  await expect(input).not.toHaveAttribute('aria-controls', /.+/);

  await input.press('ArrowDown');
  await expect(page.getByRole('dialog')).toBeVisible();
  await input.press('Tab');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(clearButton(input)).toBeFocused();
});

// Owner: queue item 10.3 (overlay focus handling). Reproduced on this page with the fixed clock:
// ArrowDown twice moves focus into the Hours column, and Escape then closes the panel but leaves
// `document.activeElement` on <body> instead of the input, so keyboard users lose their place. The
// input-level Escape path above restores focus correctly. Not fixed here (library code).
test.fixme('returns focus to the input when Escape closes the panel from inside it', async ({
  page,
}) => {
  const input = picker(page, 'Meeting time');

  await input.focus();
  await input.press('ArrowDown');
  await input.press('ArrowDown');
  await expect(column(page.getByRole('dialog'), 'Hours')).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(input).toBeFocused();
});

test('sets the current time from Now using the fixed clock', async ({ page }) => {
  const input = picker(page, 'Meeting time');

  await input.press('ArrowDown');
  const panel = page.getByRole('dialog');
  await panel.getByRole('button', { name: 'Now', exact: true }).click();

  await expect(input).toHaveValue('15:05');
  await expect(panel).toBeVisible();
  await expect(cell(panel, 'Hours', '15')).toHaveAttribute('aria-selected', 'true');
  await expect(cell(panel, 'Minutes', '05')).toHaveAttribute('aria-selected', 'true');
});

test('switches the 12-hour period with the AM/PM toggle and keeps the clock hour', async ({
  page,
}) => {
  const input = group(page, 'formats').getByRole('combobox', {
    name: '12-hour time',
    exact: true,
  });

  await input.press('ArrowDown');
  const panel = page.getByRole('dialog');
  const am = panel.getByRole('radio', { name: 'AM', exact: true });
  const pm = panel.getByRole('radio', { name: 'PM', exact: true });

  await expect(column(panel, 'Hours').getByRole('option')).toHaveCount(12);
  await expect(cell(panel, 'Hours', '02')).toHaveAttribute('aria-selected', 'true');
  await expect(pm).toBeChecked();

  await am.click();
  await expect(am).toBeChecked();
  await expect(input).toHaveValue('02:30 AM');
  await pm.click();
  await expect(pm).toBeChecked();
  await expect(input).toHaveValue('02:30 PM');

  await cell(panel, 'Hours', '12').click();
  await expect(input).toHaveValue('12:30 PM');
  await am.click();
  await expect(input).toHaveValue('12:30 AM');
});

test('snaps steps: the step examples thin the columns and typed values land on a cell', async ({
  page,
}) => {
  const steps = group(page, 'steps');
  const slots = steps.getByRole('combobox', { name: '15-minute and 15-second slots', exact: true });
  const hourSlots = steps.getByRole('combobox', { name: '3-hour slots', exact: true });

  await slots.press('ArrowDown');
  let panel = page.getByRole('dialog');
  await expect(column(panel, 'Minutes').getByRole('option')).toHaveText(['00', '15', '30', '45']);
  await expect(column(panel, 'Seconds').getByRole('option')).toHaveText(['00', '15', '30', '45']);
  await closeWithEscape(page, slots);

  await hourSlots.press('ArrowDown');
  panel = page.getByRole('dialog');
  await expect(column(panel, 'Hours').getByRole('option')).toHaveText([
    '00',
    '03',
    '06',
    '09',
    '12',
    '15',
    '18',
    '21',
  ]);
  await closeWithEscape(page, hourSlots);

  await hourSlots.fill('');
  await hourSlots.pressSequentially('1022');
  await expect(hourSlots).toHaveValue('09:15');
  await expect(hourSlots).not.toHaveAttribute('aria-invalid', 'true');
  await closeWithEscape(page, hourSlots);
});

test('masks typed text, clamps groups, and flags an incomplete group as invalid', async ({
  page,
}) => {
  const input = picker(page, 'Typed time');

  await input.click();
  await input.pressSequentially('2214');
  await expect(input).toHaveValue('22:14');
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');

  await input.fill('');
  await input.pressSequentially('9x9:9y9');
  await expect(input).toHaveValue('23:59');

  await input.fill('');
  await input.pressSequentially('12:3');
  await expect(input).toHaveValue('12:3');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toHaveAttribute('data-kui-invalid', '');
  await input.pressSequentially('4');
  await expect(input).toHaveValue('12:34');
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  await expect(input).not.toHaveAttribute('data-kui-invalid', '');

  const panel = page.getByRole('dialog');
  await expect(cell(panel, 'Hours', '12')).toHaveAttribute('aria-selected', 'true');
  await expect(cell(panel, 'Minutes', '34')).toHaveAttribute('aria-selected', 'true');
  await closeWithEscape(page, input);
});

test('types a 12-hour value with an optional period from the fixed clock', async ({ page }) => {
  const input = group(page, 'formats').getByRole('combobox', {
    name: '12-hour time',
    exact: true,
  });

  await input.fill('');
  await input.pressSequentially('0230');
  // No period typed and no previous value: the period defaults from the pinned 15:05 clock (PM).
  await expect(input).toHaveValue('02:30 PM');
  await input.pressSequentially('a');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await input.pressSequentially('m');
  await expect(input).toHaveValue('02:30 AM');
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByRole('dialog').getByRole('radio', { name: 'AM' })).toBeChecked();
  await closeWithEscape(page, input);
});

test('flags a typed 12-hour hour of 00 as invalid without committing it', async ({ page }) => {
  // Observed edge case: the mask clamps only the upper bound (12), so `00` stays in the field and
  // the parser rejects it. The docs say a fully typed value is never out of range; this is not.
  const input = group(page, 'formats').getByRole('combobox', {
    name: '12-hour time',
    exact: true,
  });

  await input.fill('');
  await input.pressSequentially('0030');
  await expect(input).toHaveValue('00:30');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  // The rejected text is not committed: the panel keeps showing the previous 02:30 PM value.
  await expect(cell(page.getByRole('dialog'), 'Hours', '02')).toHaveAttribute(
    'aria-selected',
    'true',
  );

  await input.fill('');
  await input.pressSequentially('0130');
  await expect(input).toHaveValue('01:30 PM');
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  await closeWithEscape(page, input);
});

test('disables cells outside the bounds and blocked slots for click and keyboard', async ({
  page,
}) => {
  const bounds = group(page, 'bounds');
  const business = bounds.getByRole('combobox', { name: 'Business hours', exact: true });
  const lunch = bounds.getByRole('combobox', { name: 'Lunch hour blocked', exact: true });
  const quarter = bounds.getByRole('combobox', { name: 'Quarter hour blocked', exact: true });
  const seconds = bounds.getByRole('combobox', { name: 'Seconds blocked', exact: true });

  await business.press('ArrowDown');
  let panel = page.getByRole('dialog');
  await expect(cell(panel, 'Hours', '08')).toHaveAttribute('aria-disabled', 'true');
  await expect(cell(panel, 'Hours', '09')).not.toHaveAttribute('aria-disabled', 'true');
  await expect(cell(panel, 'Hours', '17')).not.toHaveAttribute('aria-disabled', 'true');
  await expect(cell(panel, 'Hours', '19')).toHaveAttribute('aria-disabled', 'true');
  await cell(panel, 'Hours', '08').click({ force: true });
  await expect(business).toHaveValue('10:30');
  await column(panel, 'Hours').focus();
  await page.keyboard.press('End');
  await expect(business).toHaveValue('17:30');
  await page.keyboard.press('Home');
  await expect(business).toHaveValue('09:30');
  await closeWithEscape(page, business);

  await business.fill('0830');
  await expect(business).toHaveAttribute('aria-invalid', 'true');
  await expect(business).toHaveAttribute('data-kui-invalid', '');
  await business.fill('1830');
  await expect(business).toHaveAttribute('aria-invalid', 'true');
  await business.fill('1030');
  await expect(business).not.toHaveAttribute('aria-invalid', 'true');
  await closeWithEscape(page, business);

  await lunch.press('ArrowDown');
  panel = page.getByRole('dialog');
  await expect(cell(panel, 'Hours', '12')).toHaveAttribute('aria-disabled', 'true');
  await expect(cell(panel, 'Hours', '11')).not.toHaveAttribute('aria-disabled', 'true');
  await closeWithEscape(page, lunch);
  await lunch.fill('1200');
  await expect(lunch).toHaveAttribute('aria-invalid', 'true');
  await closeWithEscape(page, lunch);

  await quarter.press('ArrowDown');
  panel = page.getByRole('dialog');
  await expect(cell(panel, 'Minutes', '00')).toHaveAttribute('aria-disabled', 'true');
  await expect(cell(panel, 'Minutes', '14')).toHaveAttribute('aria-disabled', 'true');
  await expect(cell(panel, 'Minutes', '15')).not.toHaveAttribute('aria-disabled', 'true');
  await closeWithEscape(page, quarter);
  await quarter.fill('1005');
  await expect(quarter).toHaveAttribute('aria-invalid', 'true');
  await closeWithEscape(page, quarter);

  await seconds.press('ArrowDown');
  panel = page.getByRole('dialog');
  await expect(cell(panel, 'Seconds', '00')).toHaveAttribute('aria-disabled', 'true');
  await expect(cell(panel, 'Seconds', '15')).not.toHaveAttribute('aria-disabled', 'true');
  await closeWithEscape(page, seconds);
  await seconds.fill('103005');
  await expect(seconds).toHaveAttribute('aria-invalid', 'true');
  await closeWithEscape(page, seconds);
});

test('resolves clearable, disabled, readonly, and placeholder states natively', async ({
  page,
}) => {
  const states = group(page, 'fieldStates');
  const inherited = states.getByRole('combobox', { name: 'Inherited clear setting', exact: true });
  const localOn = states.getByRole('combobox', {
    name: 'Local clear enabled (provider disabled)',
    exact: true,
  });
  const disabled = states.getByRole('combobox', { name: 'Disabled time picker', exact: true });
  const readonly = states.getByRole('combobox', { name: 'Readonly time picker', exact: true });
  const custom = states.getByRole('combobox', { name: 'Custom placeholder', exact: true });

  await expect(states.getByRole('combobox')).toHaveCount(5);
  await expect(states.getByRole('button', { name: 'Clear', exact: true })).toHaveCount(1);
  await expect(localOn).toHaveAttribute('data-has-clear', '');
  await expect(inherited).not.toHaveAttribute('data-has-clear', '');
  await expect(custom).toHaveAttribute('placeholder', 'Enter a time');

  await expect(disabled).toBeDisabled();
  await expect(readonly).toHaveAttribute('readonly', '');
  await expect(readonly).toHaveValue('09:05');
  await expect(states.getByRole('button', { name: 'Open time picker', exact: true })).toHaveCount(
    5,
  );
  await expect(
    fieldOf(disabled).getByRole('button', { name: 'Open time picker', exact: true }),
  ).toBeDisabled();

  await readonly.press('ArrowDown');
  await readonly.press('Enter');
  await readonly.focus();
  await readonly.press('End');
  await readonly.pressSequentially('1234');
  await expect(readonly).toHaveValue('09:05');
  await expect(readonly).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await expect(inherited).toHaveValue('09:05');
  await states.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(localOn).toHaveValue('');
  await expect(localOn).toBeFocused();
  await expect(states.getByRole('button', { name: 'Clear', exact: true })).toHaveCount(0);
});

test('wires the Field hint and shows a visible required marker', async ({ page }) => {
  const wiring = group(page, 'fieldWiring');
  const input = wiring.getByRole('combobox', { name: /^Delivery time/ });

  await expect(wiring.locator('label', { hasText: 'Delivery time' })).toContainText('*');
  const hint = wiring.getByText('Business hours 09:00-18:00', { exact: true });
  await expect(hint).toBeVisible();
  const hintId = await hint.getAttribute('id');
  expect(hintId).toBeTruthy();
  expect((await input.getAttribute('aria-describedby'))?.split(/\s+/)).toContain(hintId);
});

test('renders one Field size per picker with strictly growing controls', async ({ page }) => {
  const sizes = group(page, 'sizes');
  const heights: number[] = [];

  for (const name of ['Extra small field', 'Small field', 'Medium field', 'Large field']) {
    const box = await sizes.getByRole('combobox', { name, exact: true }).boundingBox();

    expect(box).not.toBeNull();
    heights.push(box!.height);
  }

  expect([...heights].sort((left, right) => left - right)).toEqual(heights);
  expect(new Set(heights).size).toBe(4);
});

test('validates the Signal Forms field once touched and recovers after a pick', async ({
  page,
}) => {
  const example = group(page, 'signalForms');
  const input = example.getByRole('combobox', { name: 'Required delivery time', exact: true });

  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  await expect(example.getByRole('alert')).toHaveCount(0);
  await input.press('ArrowDown');
  await input.press('Escape');
  const error = example.getByRole('alert');
  await expect(error).toHaveText('A delivery time is required.');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  const errorId = await error.getAttribute('id');
  expect(errorId).toBeTruthy();
  expect((await input.getAttribute('aria-describedby'))?.split(/\s+/)).toContain(errorId);

  await input.press('ArrowDown');
  await cell(page.getByRole('dialog'), 'Hours', '10').click();
  await expect(input).toHaveValue('10:00');
  await expect(example.getByRole('alert')).toHaveCount(0);
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
});

test('renders the standalone panel inline with its own chrome and keeps Done inert', async ({
  page,
}) => {
  const inline = group(page, 'inline');
  const panel = inline.locator('kui-time-picker-panel');

  await expect(panel).toBeVisible();
  await expect(panel).not.toHaveAttribute('data-kui-flat', /.*/);
  await expect(cell(inline, 'Hours', '14')).toHaveAttribute('aria-selected', 'true');
  await expect(cell(inline, 'Minutes', '30')).toHaveAttribute('aria-selected', 'true');
  await expect(cell(inline, 'Seconds', '45')).toHaveAttribute('aria-selected', 'true');
  await expectSelectedCellsCentered(inline);

  await cell(inline, 'Seconds', '10').click();
  await expect(cell(inline, 'Seconds', '10')).toHaveAttribute('aria-selected', 'true');
  await inline.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(panel).toBeVisible();

  await inline.getByRole('button', { name: 'Now', exact: true }).click();
  await expect(cell(inline, 'Hours', '15')).toHaveAttribute('aria-selected', 'true');
  await expect(cell(inline, 'Minutes', '05')).toHaveAttribute('aria-selected', 'true');
  await expect(cell(inline, 'Seconds', '00')).toHaveAttribute('aria-selected', 'true');

  await picker(page, 'Meeting time').press('ArrowDown');
  await expect(page.getByRole('dialog').locator('kui-time-picker-panel')).toHaveAttribute(
    'data-kui-flat',
    '',
  );
});

test('switches the page copy to Russian while library-owned panel strings stay English', async ({
  page,
}) => {
  const response = await page.request.get(
    new URL('/i18n/time-picker/ru.json', page.url()).toString(),
  );
  expect(response.ok()).toBeTruthy();
  const russian: {
    title: string;
    accessibility: { default: string };
    fields: { meetingTime: string };
  } = await response.json();

  await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();

  await expect(
    page.getByRole('main').getByRole('heading', { level: 1, name: russian.title }),
  ).toBeVisible();
  await expect(
    page.getByRole('main').getByRole('group', { name: russian.accessibility.default, exact: true }),
  ).toBeVisible();
  const input = page.getByRole('combobox', { name: russian.fields.meetingTime, exact: true });
  await expect(input).toHaveValue('');
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  const panel = page.getByRole('dialog');
  await expect(column(panel, 'Hours')).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Now', exact: true })).toBeVisible();
});

test('keeps the page without horizontal overflow and the open panel on screen at 320px', async ({
  page,
}) => {
  for (const viewport of [mobileViewport, tabletViewport, desktopViewport]) {
    await page.setViewportSize(viewport);
    await expectNoHorizontalOverflow(page);
  }

  await page.setViewportSize(mobileViewport);
  const input = group(page, 'steps').getByRole('combobox', {
    name: '15-minute and 15-second slots',
    exact: true,
  });
  await input.click();
  const panel = page.getByRole('dialog');
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('radiogroup', { name: 'AM/PM' })).toBeVisible();
  const bounds = await panel.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(mobileViewport.width);
});

test.describe('touch', () => {
  test.use({ hasTouch: true });

  test('opens the panel with a tap and picks a cell', async ({ page }) => {
    const input = picker(page, 'Meeting time');

    await input.tap();
    const panel = page.getByRole('dialog');
    await expect(panel).toBeVisible();
    await cell(panel, 'Hours', '09').tap();
    await expect(input).toHaveValue('09:00');
    await panel.getByRole('button', { name: 'Done', exact: true }).tap();
    await expect(panel).toBeHidden();
  });
});

const cardKeys = Object.keys(groupNames) as GroupKey[];

test('captures every catalogue card at desktop and 320px @visual', async ({ page }) => {
  for (const key of cardKeys) {
    await expect(group(page, key)).toHaveScreenshot(`time-picker-${key}-desktop.png`, {
      animations: 'disabled',
    });
  }

  await page.setViewportSize(mobileCatalogueViewport);
  await expectNoHorizontalOverflow(page);

  for (const key of cardKeys) {
    await expect(group(page, key)).toHaveScreenshot(`time-picker-${key}-320.png`, {
      animations: 'disabled',
    });
  }
});

test('captures the input focus and hover states from real input @visual', async ({ page }) => {
  const example = group(page, 'formats');
  const input = example.getByRole('combobox', { name: '24-hour time', exact: true });

  await input.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(input).toBeFocused();
  expect(await input.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await page.mouse.move(1, 1);
  await expect(example).toHaveScreenshot('time-picker-input-focused.png', {
    animations: 'disabled',
  });

  await input.evaluate((element) => element.blur());
  await input.hover();
  expect(await input.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect(example).toHaveScreenshot('time-picker-input-hovered.png', {
    animations: 'disabled',
  });
});

test('captures the open 24-hour panel with focused and hovered cells @visual', async ({ page }) => {
  const input = group(page, 'formats').getByRole('combobox', {
    name: '24-hour time with seconds',
    exact: true,
  });

  await input.press('ArrowDown');
  const panel = page.getByRole('dialog');
  await expect(panel).toBeVisible();
  await expectSelectedCellsCentered(panel);
  await expect(panel).toHaveScreenshot('time-picker-open-24h-seconds.png', {
    animations: 'disabled',
  });

  await input.press('ArrowDown');
  await expect(column(panel, 'Hours')).toBeFocused();
  expect(
    await column(panel, 'Hours').evaluate((element) => element.matches(':focus-visible')),
  ).toBe(true);
  await expect(panel).toHaveScreenshot('time-picker-open-column-focused.png', {
    animations: 'disabled',
  });

  const hovered = cell(panel, 'Minutes', '31');
  await hovered.scrollIntoViewIfNeeded();
  await hovered.hover();
  expect(await hovered.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect(panel).toHaveScreenshot('time-picker-open-cell-hovered.png', {
    animations: 'disabled',
  });
});

test('captures the open 12-hour panel before and after the AM toggle at desktop and 320px @visual', async ({
  page,
}) => {
  const input = group(page, 'steps').getByRole('combobox', {
    name: '15-minute and 15-second slots',
    exact: true,
  });

  await input.press('ArrowDown');
  const panel = page.getByRole('dialog');
  await expect(panel.getByRole('radio', { name: 'PM', exact: true })).toBeChecked();
  await expectSelectedCellsCentered(panel);
  await expect(panel).toHaveScreenshot('time-picker-open-12h-pm.png', { animations: 'disabled' });

  await panel.getByRole('radio', { name: 'AM', exact: true }).click();
  await expect(input).toHaveValue('02:30:45 AM');
  await expect(panel).toHaveScreenshot('time-picker-open-12h-am.png', { animations: 'disabled' });
  await closeWithEscape(page, input);

  await page.setViewportSize(mobileViewport);
  await input.click();
  await expect(panel).toBeVisible();
  await expectSelectedCellsCentered(panel);
  await expect(panel).toHaveScreenshot('time-picker-open-12h-320.png', { animations: 'disabled' });
});

test('captures disabled bound cells and typed-invalid states @visual', async ({ page }) => {
  const bounds = group(page, 'bounds');
  const business = bounds.getByRole('combobox', { name: 'Business hours', exact: true });

  await business.press('ArrowDown');
  const panel = page.getByRole('dialog');
  await expect(cell(panel, 'Hours', '08')).toHaveAttribute('aria-disabled', 'true');
  await expectSelectedCellsCentered(panel);
  await expect(panel).toHaveScreenshot('time-picker-open-bounds.png', { animations: 'disabled' });
  await closeWithEscape(page, business);

  await business.fill('0830');
  await expect(business).toHaveAttribute('aria-invalid', 'true');
  await closeWithEscape(page, business);
  await expect(bounds).toHaveScreenshot('time-picker-bounds-invalid.png', {
    animations: 'disabled',
  });

  const typed = picker(page, 'Typed time');
  await typed.click();
  await typed.pressSequentially('12:3');
  await expect(typed).toHaveAttribute('aria-invalid', 'true');
  await closeWithEscape(page, typed);
  await expect(group(page, 'fieldWiring')).toHaveScreenshot('time-picker-typed-invalid.png', {
    animations: 'disabled',
  });
});

test('captures the Signal Forms required error and the clear affordance @visual', async ({
  page,
}) => {
  const example = group(page, 'signalForms');
  const input = example.getByRole('combobox', { name: 'Required delivery time', exact: true });

  await input.press('ArrowDown');
  await input.press('Escape');
  await expect(example.getByRole('alert')).toBeVisible();
  await expect(example).toHaveScreenshot('time-picker-signal-form-required.png', {
    animations: 'disabled',
  });

  const formats = group(page, 'formats');
  const formatInput = formats.getByRole('combobox', { name: '24-hour time', exact: true });
  const clear = clearButton(formatInput);
  await formatInput.focus();
  await page.keyboard.press('Tab');
  await expect(clear).toBeFocused();
  expect(await clear.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(formats).toHaveScreenshot('time-picker-clear-focus-visible.png', {
    animations: 'disabled',
  });
});
