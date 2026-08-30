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
