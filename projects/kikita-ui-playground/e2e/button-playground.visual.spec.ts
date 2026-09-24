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

test('captures the minimally configured default button', async ({ page }) => {
  const defaultExample = page.getByRole('group', { name: 'Default button example', exact: true });
  await expect(defaultExample).toHaveScreenshot('button-default.png');
});

test('captures button states', async ({ page }) => {
  await expect(page.getByRole('group', { name: 'Button states' })).toHaveScreenshot(
    'button-states.png',
  );
});

test('captures the keyboard-focused button state', async ({ page }) => {
  const states = page.getByRole('group', { name: 'Button states', exact: true });
  const saveButton = states.getByRole('button', { name: 'Save', exact: true });
  const focusedButton = states.getByRole('button', { name: 'Focused', exact: true });

  await saveButton.focus();
  await saveButton.press('Tab');

  await expect(focusedButton).toBeFocused();
  await expect(focusedButton).toHaveJSProperty('disabled', false);
  expect(await focusedButton.evaluate((button) => button.matches(':focus-visible'))).toBe(true);
  await expect(states).toHaveScreenshot('button-focused.png', { animations: 'disabled' });
});

test('captures pointer hover and pressed button states', async ({ page }) => {
  const states = page.getByRole('group', { name: 'Button states', exact: true });
  const button = states.getByRole('button', { name: 'Save', exact: true });

  await button.hover();
  expect(await button.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect(states).toHaveScreenshot('button-hover.png', { animations: 'disabled' });

  await page.mouse.down();
  expect(await button.evaluate((element) => element.matches(':active'))).toBe(true);
  await expect(states).toHaveScreenshot('button-pressed.png', { animations: 'disabled' });
  await page.mouse.up();
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
