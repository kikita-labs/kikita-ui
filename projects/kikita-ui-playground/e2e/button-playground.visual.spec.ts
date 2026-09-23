import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('/components/button');
});

for (const [size, fileName] of [
  ['Extra small', 'button-size-xs.png'],
  ['Small', 'button-size-sm.png'],
  ['Medium', 'button-size-md.png'],
  ['Large', 'button-size-lg.png'],
] as const) {
  test(`captures the ${size.toLowerCase()} button matrix`, async ({ page }) => {
    const matrix = page.getByRole('group', { name: `${size} button variants`, exact: true });
    await matrix.scrollIntoViewIfNeeded();
    await expect(matrix).toHaveScreenshot(fileName, { animations: 'disabled' });
  });
}

test('captures button states', async ({ page }) => {
  await expect(page.getByRole('group', { name: 'Button states' })).toHaveScreenshot(
    'button-states.png',
  );
});

test('captures button composition examples', async ({ page }) => {
  await expect(page.getByRole('group', { name: 'Button composition examples' })).toHaveScreenshot(
    'button-composition.png',
  );
});

test('captures the interactive loading state', async ({ page }) => {
  const states = page.getByRole('group', { name: 'Button states' });
  await states.getByRole('button', { name: 'Simulate loading' }).click();

  const loadingButton = states.getByRole('button', { name: /^Save/ });
  await expect(loadingButton).toBeDisabled();
  await expect(loadingButton).toHaveAttribute('aria-busy', 'true');
  await expect(states).toHaveScreenshot('button-interactive-loading.png');
});
