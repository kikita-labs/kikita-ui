import type { Locator } from '@playwright/test';

import { expect, test } from '../../../tests/e2e/support/fixtures';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('/components/button');
  await page.mouse.move(0, 0);
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

for (const [sectionName, fileName] of [
  ['Default button example', 'button-default-320.png'],
  ['Extra small button variants', 'button-size-xs-320.png'],
  ['Small button variants', 'button-size-sm-320.png'],
  ['Medium button variants', 'button-size-md-320.png'],
  ['Large button variants', 'button-size-lg-320.png'],
  ['Button states', 'button-states-320.png'],
  ['Button composition examples', 'button-composition-320.png'],
] as const) {
  test(`captures ${sectionName.toLowerCase()} at 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 1280 });
    await page.goto('/components/button');

    const examples = page.getByRole('group', { name: sectionName, exact: true });
    const card = page.getByRole('article').filter({ has: examples });
    await card.scrollIntoViewIfNeeded();
    await expect(card).toBeVisible();

    if (sectionName === 'Button composition examples') {
      await expectCompositionIcons(examples);
    }

    const bounds = await card.boundingBox();
    expect(bounds, `${sectionName} should have visible bounds at 320px`).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(1280);

    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(documentWidth).toBeLessThanOrEqual(320);
    await expect(card).toHaveScreenshot(fileName, { animations: 'disabled' });
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
  const composition = page.getByRole('group', {
    name: 'Button composition examples',
    exact: true,
  });

  await expectCompositionIcons(composition);
  await expect(composition).toHaveScreenshot('button-composition.png', { animations: 'disabled' });
});

test('captures the interactive loading state', async ({ page }) => {
  const states = page.getByRole('group', { name: 'Button states' });
  await states.getByRole('button', { name: 'Simulate loading' }).click();

  const loadingButton = states.getByRole('button', { name: /^Save/ });
  await expect(loadingButton).toBeDisabled();
  await expect(loadingButton).toHaveAttribute('aria-busy', 'true');
  await expect(states).toHaveScreenshot('button-interactive-loading.png');
});

async function expectCompositionIcons(composition: Locator): Promise<void> {
  const leadingIcon = composition
    .getByRole('button', { name: 'Save with leading icon', exact: true })
    .locator('kui-icon svg');
  const trailingIcon = composition
    .getByRole('button', { name: 'Continue with trailing icon', exact: true })
    .locator('kui-icon svg');

  await expect(leadingIcon).toHaveCount(1);
  await expect(trailingIcon).toHaveCount(1);
}
