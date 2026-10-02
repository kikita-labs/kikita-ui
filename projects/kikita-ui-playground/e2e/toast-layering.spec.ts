import type { Page } from '@playwright/test';

import { expect, test } from './support/fixtures';

/**
 * Library overlays (dialog, drawer, menu, tooltip) are shown in the browser top layer, where
 * `z-index` has no effect. The toast region must stay above them, whether the toast was added
 * before or while the overlay was open.
 */

async function openDialog(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Surfaces', exact: true }).click();
  await page.getByRole('link', { name: 'Dialog', exact: true }).click();
  await expect(page).toHaveURL(/\/components\/dialog$/);
  await page
    .getByRole('group', { name: 'Dialog size examples', exact: true })
    .getByRole('button', { name: 'Open default', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

/** The element that receives a pointer at the centre of `locator`. */
function ownsCentre(page: Page, selector: string): Promise<boolean> {
  return page.evaluate((target) => {
    const element = document.querySelector(target);
    if (!element) return false;
    const box = element.getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    return hit !== null && element.contains(hit);
  }, selector);
}

/**
 * Shows a full-viewport manual popover, the same top-layer mechanism the library overlays use, so a
 * toast can be raised against an overlay without a demo page that owns both.
 */
async function showTopLayerCover(page: Page): Promise<void> {
  await page.evaluate(() => {
    const cover = document.createElement('div');
    cover.id = 'top-layer-cover';
    cover.setAttribute('popover', 'manual');
    cover.style.cssText = 'position:fixed;inset:0;margin:0;border:0;padding:0;background:#888';
    document.body.append(cover);
    cover.showPopover();
  });
}

test.describe('toast layering', () => {
  test('a toast shown before a dialog opens stays above the dialog', async ({ page }) => {
    await page.goto('/components/toast');
    await page.getByRole('button', { name: 'Open persistent toast' }).click();
    const toast = page.locator('.kui-toast');
    await expect(toast).toBeVisible();

    await openDialog(page);

    await expect.poll(() => ownsCentre(page, '.kui-toast')).toBe(true);
  });

  test('a toast added while an overlay is open is shown above it and stays operable', async ({
    page,
  }) => {
    await page.goto('/components/toast');
    await showTopLayerCover(page);
    await page.getByRole('button', { name: 'Open persistent toast' }).click({ force: true });
    await expect(page.locator('.kui-toast')).toBeVisible();

    await expect.poll(() => ownsCentre(page, '.kui-toast')).toBe(true);

    await page.locator('.kui-toast-close').click();
    await expect(page.locator('.kui-toast')).toHaveCount(0);
    expect(
      await page.locator('.kui-toast-region').evaluate((region) => region.matches(':popover-open')),
    ).toBe(false);
  });

  test('a toast shown after the region left the top layer returns to it', async ({ page }) => {
    await page.goto('/components/toast');
    await page.getByRole('button', { name: 'Open persistent toast' }).click();
    await expect(page.locator('.kui-toast')).toBeVisible();
    await page.locator('.kui-toast-close').click();
    await expect(page.locator('.kui-toast')).toHaveCount(0);

    await showTopLayerCover(page);
    await page.getByRole('button', { name: 'Open persistent toast' }).click({ force: true });
    await expect(page.locator('.kui-toast')).toBeVisible();

    await expect.poll(() => ownsCentre(page, '.kui-toast')).toBe(true);
  });

  test('an overlay opened later does not hide a visible toast', async ({ page }) => {
    await page.goto('/components/toast');
    await page.getByRole('button', { name: 'Open persistent toast' }).click();
    await expect(page.locator('.kui-toast')).toBeVisible();

    await showTopLayerCover(page);

    await expect.poll(() => ownsCentre(page, '.kui-toast')).toBe(true);
  });
});
