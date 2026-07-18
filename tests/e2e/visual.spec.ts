import { expect, test } from '@playwright/test';

import { gotoReady } from './support/page-ready';

test('captures representative light playground smoke screenshots', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  for (const route of ['/button', '/field', '/table']) {
    await gotoReady(page, route);
    const screenshot = await page.screenshot({ fullPage: true });
    expect(screenshot.length).toBeGreaterThan(10_000);
  }
});
