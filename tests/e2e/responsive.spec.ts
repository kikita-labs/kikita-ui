import { test } from '@playwright/test';

import { expectNoDocumentOverflow, gotoReady } from './support/page-ready';

const widths = [320, 390, 768, 1440] as const;
const routes = [
  '/tokens',
  '/button',
  '/field',
  '/input',
  '/select',
  '/dropdown',
  '/dialog',
  '/table',
];

test('has no document overflow across representative routes', async ({ page }) => {
  test.setTimeout(180_000);

  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });

    for (const route of routes) {
      await gotoReady(page, route);
      await expectNoDocumentOverflow(page);
    }
  }
});
