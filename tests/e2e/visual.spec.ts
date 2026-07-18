import { expect, type Page, test } from '@playwright/test';

import { gotoReady } from './support/page-ready';

const routes = ['/button', '/field', '/select', '/dialog', '/table', '/calendar'] as const;
const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
] as const;
const themes = ['light', 'dark'] as const;

async function setPlaygroundTheme(page: Page, theme: (typeof themes)[number]): Promise<void> {
  await page.getByRole('radio', { name: theme, exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-kui-theme', theme);
}

test.describe('visual baselines', () => {
  test.setTimeout(180_000);

  for (const route of routes) {
    for (const viewport of viewports) {
      for (const theme of themes) {
        test(`${route} ${viewport.name} ${theme}`, async ({ page }) => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await gotoReady(page, route);
          await setPlaygroundTheme(page, theme);

          await expect(page).toHaveScreenshot(`${route.slice(1)}-${viewport.name}-${theme}.png`, {
            fullPage: true,
          });
        });
      }
    }
  }
});
