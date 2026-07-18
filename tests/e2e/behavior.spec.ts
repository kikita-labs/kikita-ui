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
