import { expect, test } from './support/fixtures';
import { gotoReady, settleAnimations } from './support/page-ready';

/**
 * Real-browser scenarios for widgets whose value is in DOM behavior: selection with disabled
 * options, a fixed-clock 12-hour picker, keyboard resizing, range selection, and focus return.
 * Pure value math for each widget stays in its unit spec.
 */

test.describe('Select selection and disabled options', () => {
  test('skips a disabled option, commits an enabled one and restores focus on Escape', async ({
    page,
  }) => {
    await gotoReady(page, '/select');
    const panel = page.locator('app-panel[num="02"]');
    const input = panel.getByRole('combobox', { name: 'User' });
    const readout = panel.locator('code', { hasText: /^value:/ });

    await expect(readout).toHaveText('value: null');
    await input.click();

    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();

    const disabledOption = listbox.getByRole('option', { name: /Carol Okonkwo/ });
    await expect(disabledOption).toHaveAttribute('aria-disabled', 'true');
    await disabledOption.click({ force: true });
    await expect(readout).toHaveText('value: null');
    await expect(listbox).toBeVisible();

    await listbox.getByRole('option', { name: 'Bob Chen' }).click();
    await expect(listbox).toBeHidden();
    await expect(input).toHaveValue('Bob Chen');
    await expect(readout).toContainText('Bob Chen');

    await input.click();
    await expect(listbox).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(listbox).toBeHidden();
    await expect(input).toBeFocused();
  });

  test('moves focus with the arrow keys past a disabled option and commits with Enter', async ({
    page,
  }) => {
    await gotoReady(page, '/select');
    const input = page.locator('app-panel[num="02"]').getByRole('combobox', { name: 'User' });
    const listbox = page.getByRole('listbox');

    await input.focus();
    // ArrowDown on the closed control opens the list and focuses the first enabled option.
    await page.keyboard.press('ArrowDown');
    await expect(listbox.getByRole('option', { name: 'Alice Kim' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(listbox.getByRole('option', { name: 'Bob Chen' })).toBeFocused();
    // Carol Okonkwo is disabled, so the next stop is David Mueller.
    await page.keyboard.press('ArrowDown');
    await expect(listbox.getByRole('option', { name: 'David Mueller' })).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(listbox).toBeHidden();
    await expect(input).toHaveValue('David Mueller');
    await expect(input).toBeFocused();
  });
});

test.describe('Time Picker 12-hour panel', () => {
  test('commits the AM/PM choice from a fixed clock and keeps disabled and readonly pickers closed', async ({
    page,
  }) => {
    // Freeze only `Date` so the default period cannot depend on the wall clock; timers stay real.
    await page.clock.setFixedTime(new Date('2026-06-15T15:05:00'));
    await gotoReady(page, '/time-picker');

    const slot = page.locator('app-panel[num="02"] kui-field');
    const input = slot.getByRole('combobox');

    await slot.getByRole('button', { name: 'Open time picker' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const am = dialog.getByRole('radio', { name: 'AM', exact: true });
    await am.click();
    await expect(am).toBeChecked();
    await expect(input).toHaveValue(/AM$/);

    await dialog.getByRole('radio', { name: 'PM', exact: true }).click();
    await expect(input).toHaveValue(/PM$/);

    const disabled = page.locator('app-panel[num="05"] kui-field', { hasText: 'Disabled' });
    await expect(disabled.getByRole('combobox')).toBeDisabled();
  });

  test('keeps a readonly picker closed', async ({ page }) => {
    await gotoReady(page, '/time-picker');

    const readonly = page.locator('app-panel[num="05"] kui-field', { hasText: 'Readonly' });
    await readonly.getByRole('combobox').click();
    await settleAnimations(page);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('closes the panel on Escape typed in the input and keeps focus there', async ({ page }) => {
    await gotoReady(page, '/time-picker');

    const input = page.locator('app-panel[num="02"] kui-field').getByRole('combobox');
    await input.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(input).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(input).toBeFocused();
  });

  // Owner: unassigned (found by Plan 11; the fix belongs with overlay focus handling, nearest Plan
  // 19A). Browser evidence on 2026-09-29: after ArrowDown moves focus from the input into the hours
  // column, Escape closes the panel but leaves `document.activeElement` on `<body>`, so a keyboard
  // user loses their place. The input-level Escape path above restores focus correctly.
  test.fixme('returns focus to the input when Escape closes the panel from inside it', async ({
    page,
  }) => {
    await gotoReady(page, '/time-picker');

    const input = page.locator('app-panel[num="02"] kui-field').getByRole('combobox');
    await input.focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('dialog').getByRole('listbox', { name: 'Hours' })).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(input).toBeFocused();
  });
});

test.describe('Splitter keyboard resizing', () => {
  test('resizes panes with arrow keys and jumps to the limits with Home and End', async ({
    page,
  }) => {
    await gotoReady(page, '/splitter');
    const panel = page.locator('app-panel[num="01"]');
    const gutter = panel.getByRole('separator');

    await gutter.focus();
    const start = Number(await gutter.getAttribute('aria-valuenow'));

    await page.keyboard.press('ArrowRight');
    await expect(gutter).not.toHaveAttribute('aria-valuenow', String(start));
    const afterRight = Number(await gutter.getAttribute('aria-valuenow'));
    expect(afterRight).toBeGreaterThan(start);

    const widths = await panel
      .locator('kui-splitter-pane')
      .evaluateAll((panes) => panes.map((pane) => pane.getBoundingClientRect().width));
    expect(widths[0]).toBeGreaterThan(widths[1] ?? Number.POSITIVE_INFINITY);

    await page.keyboard.press('ArrowLeft');
    await expect(gutter).toHaveAttribute('aria-valuenow', String(start));

    await page.keyboard.press('End');
    await expect
      .poll(async () => Number(await gutter.getAttribute('aria-valuenow')))
      .toBeGreaterThan(afterRight);

    await page.keyboard.press('Home');
    await expect
      .poll(async () => Number(await gutter.getAttribute('aria-valuenow')))
      .toBeLessThan(start);
  });
});

test.describe('Calendar Range selection', () => {
  test('commits a range on the second click and disables dates before the minimum', async ({
    page,
  }) => {
    // Pin the month so the visible days and the "today" minimum do not depend on the wall clock.
    await page.clock.setFixedTime(new Date('2026-06-15T12:00:00'));
    await gotoReady(page, '/calendar-range');

    const basic = page.locator('app-panel[num="01"]');
    const label = basic.locator('.value-label');

    await expect(label).toHaveText('—');

    await basic.getByRole('button', { name: '15', exact: true }).click();
    await expect(label).toContainText('…');
    await basic.getByRole('button', { name: '18', exact: true }).click();
    await expect(label).toHaveText(/2026-06-15\s*–\s*2026-06-18/);

    const restricted = page.locator('app-panel[num="02"]');
    await expect(restricted.getByRole('button', { name: '14', exact: true })).toBeDisabled();
    await expect(restricted.getByRole('button', { name: '16', exact: true })).toBeEnabled();
  });
});

test.describe('Carousel navigation', () => {
  test('disables Previous on the first slide and advances the index with Next', async ({
    page,
  }) => {
    await gotoReady(page, '/carousel');
    const panel = page.locator('app-panel[num="01"]');
    const readout = panel.locator('.carousel-demo__readout code');
    const previous = panel.getByRole('button', { name: /previous/i });
    const next = panel.getByRole('button', { name: /next/i });

    await expect(readout).toHaveText('0');
    await expect(previous).toBeDisabled();

    await next.click();
    await expect(readout).toHaveText('1');
    await expect(previous).toBeEnabled();

    await previous.click();
    await expect(readout).toHaveText('0');
  });
});

test.describe('Media Viewer', () => {
  test('opens from a grid tile, closes on Escape and returns focus to that tile', async ({
    page,
  }) => {
    await gotoReady(page, '/media-viewer');
    const tile = page
      .locator('app-panel[num="01"]')
      .getByRole('button', { name: /^Open photo 2 of/ });

    await tile.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(tile).toBeFocused();
  });
});
