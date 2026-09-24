import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/components/color-input');
});

test('captures the minimally configured color input', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default color input', exact: true });
  const input = example.locator('input[kuiColorInput]');

  await expect(page.getByRole('heading', { level: 1, name: 'Color Input' })).toBeVisible();
  await expect(input).toHaveJSProperty('type', 'text');
  await expect(input).toBeEnabled();
  await expect(example).toHaveScreenshot('color-input-default.png');
});

test('captures all supported input sizes', async ({ page }) => {
  const sizes = page.getByRole('group', { name: 'Color input sizes', exact: true });

  await expect(sizes.locator('input[kuiColorInput]')).toHaveCount(4);
  await expect(sizes).toHaveScreenshot('color-input-sizes.png', { animations: 'disabled' });
});

test('captures supported hex and OKLCH values', async ({ page }) => {
  const values = page.getByRole('group', { name: 'Color input value formats', exact: true });

  await expect(values.getByRole('textbox')).toHaveCount(2);
  await expect(values).toHaveScreenshot('color-input-values.png', { animations: 'disabled' });
});

test('captures disabled, read-only, and invalid field states', async ({ page }) => {
  const states = page.getByRole('group', { name: 'Color input field states', exact: true });

  await expect(states.getByRole('textbox', { name: 'Disabled' })).toBeDisabled();
  await expect(states.getByRole('textbox', { name: 'Read-only' })).toHaveAttribute('readonly', '');
  await expect(states.getByRole('textbox', { name: 'Focused' })).toBeEnabled();
  await expect(states.getByRole('textbox', { name: 'Invalid' })).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await expect(states).toHaveScreenshot('color-input-states.png', { animations: 'disabled' });
});

test('captures the color input focus state', async ({ page }) => {
  const states = page.getByRole('group', { name: 'Color input field states', exact: true });
  const focusedInput = states.getByRole('textbox', { name: 'Focused' });

  await expect(page.getByRole('heading', { level: 1, name: 'Color Input' })).toBeVisible();
  await expect(states.locator('.kui-color-input')).toHaveCount(4);
  await focusedInput.click();
  await expect(focusedInput).toBeFocused();
  await expect(states).toHaveScreenshot('color-input-focused.png', { animations: 'disabled' });
});

test('captures the color input hover state', async ({ page }) => {
  const states = page.getByRole('group', { name: 'Color input field states', exact: true });
  const input = states.getByRole('textbox', { name: 'Read-only' });

  await input.hover();
  expect(await input.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect(states).toHaveScreenshot('color-input-hover.png', { animations: 'disabled' });
});

test('captures keyboard focus on the color picker trigger', async ({ page }) => {
  const values = page.getByRole('group', { name: 'Color input value formats', exact: true });
  const textInput = values.getByRole('textbox').first();
  const trigger = values.getByRole('button', { name: 'Choose color: #5b4fe0' }).first();

  await textInput.press('Shift+Tab');
  await expect(trigger).toBeFocused();
  expect(await trigger.evaluate((button) => button.matches(':focus-visible'))).toBe(true);
  await expect(values).toHaveScreenshot('color-input-picker-trigger-focused.png', {
    animations: 'disabled',
  });
});

test('updates the swatch label when a text color value changes', async ({ page }) => {
  const sizes = page.getByRole('group', { name: 'Color input sizes', exact: true });
  const input = sizes.getByRole('textbox', { name: 'Medium' });

  await input.fill('#27ae60');

  await expect(input).toHaveValue('#27ae60');
  await expect(sizes.getByRole('button', { name: 'Choose color: #27ae60' })).toBeVisible();
  await expect(sizes).toHaveScreenshot('color-input-edited-value.png', { animations: 'disabled' });
});

test('opens and captures the Kikita color picker popover', async ({ page }) => {
  const values = page.getByRole('group', { name: 'Color input value formats', exact: true });

  await values.getByRole('button', { name: 'Choose color: #5b4fe0' }).first().click();

  const picker = page.getByRole('dialog');
  await expect(picker).toBeVisible();
  await expect(picker).toHaveScreenshot('color-input-picker.png', { animations: 'disabled' });

  await page.keyboard.press('Escape');
  await expect(picker).not.toBeVisible();
});
