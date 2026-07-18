import { expect, test } from '@playwright/test';

import { gotoReady } from './support/page-ready';

const routes = [
  '/tokens',
  '/button',
  '/field',
  '/input',
  '/select',
  '/dropdown',
  '/popover',
  '/dialog',
  '/number-input',
  '/table',
];

for (const route of routes) {
  test(`hydrates without console errors on ${route}`, async ({ page }) => {
    await gotoReady(page, route);
    await expect(page.locator('body')).toBeVisible();
  });
}
