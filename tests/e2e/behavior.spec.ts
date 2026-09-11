import { expect, test } from '@playwright/test';

import { gotoReady } from './support/page-ready';

test('loads representative primitive playground routes', async ({ page }) => {
  for (const route of ['/tokens', '/button', '/field', '/select', '/dialog', '/table']) {
    await gotoReady(page, route);
    await expect(page.locator('body')).toBeVisible();
  }
});

test('keeps overlay primitives interactive', async ({ page }) => {
  await gotoReady(page, '/dialog');
  await page.getByRole('button', { name: /open/i }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();

  await gotoReady(page, '/dropdown');
  await page.getByRole('button').first().click();
  await expect(page.getByRole('listbox').or(page.getByRole('menu')).first()).toBeVisible();
  await page.keyboard.press('Escape');
});

test('does not dismiss a dialog when a text-selection drag leaves the panel', async ({ page }) => {
  await gotoReady(page, '/dialog');
  await page.getByRole('button', { name: 'Open long body' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  const body = dialog.locator('.kui-dialog-body');
  const bounds = await body.boundingBox();
  if (!bounds) throw new Error('Could not measure the dialog body.');

  await page.mouse.move(bounds.x + 40, bounds.y + 40);
  await page.mouse.down();
  await page.mouse.move(bounds.x - 40, bounds.y + 40, { steps: 5 });
  await page.mouse.up();

  await expect(dialog).toBeVisible();

  await page.mouse.click(20, 20);
  await expect(dialog).toBeHidden();
});

test('supports reactive and programmatic toast lifecycle controls', async ({ page }) => {
  await gotoReady(page, '/toast');

  await page.getByRole('button', { name: 'Open reactive persistent' }).click();
  const runningToast = page.getByRole('status').filter({ hasText: 'Background sync is running' });
  await expect(runningToast).toBeVisible();

  await page.getByRole('button', { name: 'Update to success' }).click();
  const completeToast = page.getByRole('status').filter({ hasText: 'Background sync complete' });
  await expect(completeToast).toBeVisible();

  await page.getByRole('button', { name: 'Dismiss all' }).click();
  await expect(completeToast).toBeHidden();
});

test('opens and dismisses mobile info tooltips from icon triggers', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoReady(page, '/tooltip');

  const trigger = page.getByRole('button', { name: 'Billing information' });
  const tooltip = page.getByRole('tooltip');

  await trigger.dispatchEvent('pointerdown', { pointerType: 'touch' });
  await trigger.dispatchEvent('click');
  await expect(tooltip).toBeVisible();

  await page.getByRole('heading', { name: 'Tooltip' }).click();
  await expect(tooltip).toBeHidden();
});

test('clicking a kui-field label focuses the first OTP Input cell', async ({ page }) => {
  // jsdom (unit tests) does not implement native label-activation behavior, so this real-browser
  // check is the only place `kui-otp-input`'s first-cell id adoption from `kui-field.controlId` is
  // actually verified end to end.
  await gotoReady(page, '/otp-input');

  const field = page.locator('kui-field', {
    has: page.getByText('Code from email', { exact: true }),
  });
  const label = field.getByText('Code from email', { exact: true });
  const firstCell = field.getByRole('textbox', { name: 'Digit 1 of 6' }).first();

  await label.click();
  await expect(firstCell).toBeFocused();
});

test('OTP Input keyboard navigation and paste distribute across cells', async ({ page }) => {
  await gotoReady(page, '/otp-input');

  const group = page.locator('kui-otp-input').first();
  const cells = group.locator('input');

  await cells.nth(0).focus();
  await page.keyboard.type('12');
  await expect(cells.nth(2)).toBeFocused();

  await page.keyboard.press('ArrowLeft');
  await expect(cells.nth(1)).toBeFocused();

  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
  await expect(cells.nth(0)).toBeFocused();

  await cells.nth(0).evaluate((el: HTMLInputElement) => {
    const data = new DataTransfer();
    data.setData('text', '654321');
    el.dispatchEvent(
      new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }),
    );
  });
  await expect(page.locator('.otp-demo__readout code').first()).toHaveText('654321');
});

test('Pagination: page clicks, boundary disabling, and rows-per-page reset to page 1', async ({
  page,
}) => {
  await gotoReady(page, '/pagination');

  const readout = page.locator('.pagination-demo__readout code').first();
  const nav = page.locator('app-panel[num="01"]').getByRole('navigation');

  await expect(readout).toHaveText('1');
  await nav.getByRole('button', { name: 'Page 3' }).click();
  await expect(readout).toHaveText('3');

  const first = nav.getByRole('button', { name: 'First page' });
  const prev = nav.getByRole('button', { name: 'Previous page' });
  await first.click();
  await expect(readout).toHaveText('1');
  await expect(first).toBeDisabled();
  await expect(prev).toBeDisabled();

  // variant="full" demo (app-panel num="04"): changing rows-per-page resets currentPage to 1.
  // Starts on page 5 (of 12), so "Page 6" is inside the initial window; "Page 1" is always
  // visible (boundary page).
  const fullPanel = page.locator('app-panel[num="04"]');
  await fullPanel.getByRole('button', { name: 'Page 6' }).click();
  await fullPanel.getByRole('combobox', { name: 'Rows per page' }).click();
  await page.getByRole('option', { name: '50' }).click();
  await expect(fullPanel.getByRole('button', { name: 'Page 1, current' })).toBeVisible();
});

test('clicking a kui-field label focuses the Time Picker input', async ({ page }) => {
  // jsdom (unit tests) does not implement native label-activation behavior, so this real-browser
  // check is the only place `input[kuiTimePicker]`'s `kui-field.controlId` adoption is actually
  // verified end to end (same gap OTP Input's own label-focus test above covers).
  await gotoReady(page, '/time-picker');

  // Scoped to the "01 Basic" panel -- "Meeting time" is also the label text in the "07 Wide
  // field" demo further down the same page.
  const field = page.locator('app-panel[num="01"] kui-field');
  const label = field.getByText('Meeting time', { exact: true });
  const input = field.getByRole('combobox');

  await label.click();
  await expect(input).toBeFocused();
});

test('Time Picker panel centers each scrollable column on its selected cell when opened', async ({
  page,
}) => {
  // Real-browser-only: centering reads `getBoundingClientRect`/`scrollTop`, neither meaningful in
  // jsdom, and this exact regression (columns opened at `scrollTop: 0` instead of centered on the
  // already-selected hour/minute) was only caught by manual browser testing, not the unit suite.
  await gotoReady(page, '/time-picker');

  const field = page.locator('app-panel[num="01"] kui-field');
  await field.getByRole('button', { name: 'Open time picker' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  const hours = dialog.getByRole('listbox', { name: 'Hours' });
  const minutes = dialog.getByRole('listbox', { name: 'Minutes' });
  await expect.poll(() => hours.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  await expect.poll(() => minutes.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);

  // Reopening after a close must re-center too, not just the first-ever open.
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await field.getByRole('button', { name: 'Open time picker' }).click();
  await expect(dialog).toBeVisible();
  await expect.poll(() => hours.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
});
