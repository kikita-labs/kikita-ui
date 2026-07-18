import { expect, type Page } from '@playwright/test';

const consoleBlocklist = [
  /hydration/i,
  /NG0?5\d{3}/,
  /ExpressionChangedAfterItHasBeenChecked/i,
  /TypeError/i,
  /ReferenceError/i,
];

export async function gotoReady(page: Page, route: string): Promise<void> {
  const errors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.emulateMedia({ reducedMotion: 'reduce' });

  const response = await page.goto(route);
  expect(response?.ok()).toBe(true);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).toBeVisible();

  const blockingErrors = errors.filter((message) =>
    consoleBlocklist.some((pattern) => pattern.test(message)),
  );

  expect(blockingErrors).toEqual([]);
}

export async function expectNoDocumentOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));

  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  expect(overflow.bodyScrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
}
