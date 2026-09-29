import { expect, test } from './support/fixtures';
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
  '/pagination',
  '/date-picker',
  '/time-picker',
  '/link',
  '/chart',
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

// The library has no direction-aware behavior yet (see docs/browser-test-coverage.md), so this only
// protects layout: physical-side CSS must not push content past the viewport when the document
// direction flips.
test('has no document overflow and keeps overlays on screen in right-to-left layout', async ({
  page,
}) => {
  test.setTimeout(120_000);

  for (const width of [320, 1440] as const) {
    await page.setViewportSize({ width, height: 900 });

    for (const route of ['/field', '/select', '/table', '/dialog']) {
      await gotoReady(page, route);
      await page.evaluate(() => {
        document.documentElement.dir = 'rtl';
      });
      await expectNoDocumentOverflow(page);
    }

    await gotoReady(page, '/select');
    await page.evaluate(() => {
      document.documentElement.dir = 'rtl';
    });
    await page.locator('app-panel[num="02"]').getByRole('combobox', { name: 'User' }).click();

    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    const box = await listbox.boundingBox();

    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
  }
});
