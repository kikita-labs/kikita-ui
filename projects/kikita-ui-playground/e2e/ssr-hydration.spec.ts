import { expect, test } from '@playwright/test';

test('renders on the server and changes language after hydration', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.goto('/');

  await expect(page.locator('h1')).toHaveText('Kikita UI playground');
  await expect(page.locator('body')).toContainText('Language');

  await page.getByRole('radio', { name: 'Russian' }).check();
  await expect(page.locator('h1')).toHaveText(
    '\u041f\u0435\u0441\u043e\u0447\u043d\u0438\u0446\u0430 Kikita UI',
  );
  expect(consoleErrors).toEqual([]);
});
