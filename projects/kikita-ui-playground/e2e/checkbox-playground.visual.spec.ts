import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('/components/checkbox');
});

test('captures the default checkbox example', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'Checkbox' })).toBeVisible();

  const example = page.getByRole('group', { name: 'Default checkbox example', exact: true });
  await expect(
    example.getByRole('checkbox', { name: 'Receive product updates' }),
  ).not.toBeChecked();
  await expect(example).toHaveScreenshot('checkbox-default.png');
});

test('captures every supported checkbox size', async ({ page }) => {
  const sizes = page.getByRole('group', { name: 'Checkbox sizes', exact: true });

  await expect(sizes.getByRole('checkbox')).toHaveCount(4);
  await expect(sizes.getByRole('checkbox', { name: 'Extra small', exact: true })).not.toBeChecked();
  await expect(sizes.getByRole('checkbox', { name: 'Small', exact: true })).toBeChecked();
  await expect(sizes.getByRole('checkbox', { name: 'Medium', exact: true })).toBeChecked();
  await expect(sizes.getByRole('checkbox', { name: 'Large', exact: true })).not.toBeChecked();
  await expect(sizes).toHaveScreenshot('checkbox-sizes.png');
});

test('captures checked, disabled, invalid, and indeterminate states', async ({ page }) => {
  const states = page.getByRole('group', { name: 'Checkbox states', exact: true });

  await expect(states.getByRole('checkbox', { name: 'Checked', exact: true })).toBeChecked();
  await expect(states.getByRole('checkbox', { name: 'Disabled', exact: true })).toBeDisabled();
  await expect(
    states.getByRole('checkbox', { name: 'Disabled and checked', exact: true }),
  ).toBeDisabled();
  await expect(
    states.getByRole('checkbox', { name: 'Disabled and checked', exact: true }),
  ).toBeChecked();

  const invalid = states.getByRole('checkbox', { name: 'Required preference' });
  await expect(invalid).toHaveAttribute('aria-invalid', 'true');
  await expect(invalid).toHaveAttribute('aria-describedby', /kui-field-\d+-error/);
  await expect(states.getByText('Select this preference to continue.')).toBeVisible();

  await expect(
    states.getByRole('checkbox', { name: 'Indeterminate', exact: true }),
  ).toHaveJSProperty('indeterminate', true);
  await expect(states).toHaveScreenshot('checkbox-states.png');
});

test('captures the focus-visible checkbox example', async ({ page }) => {
  const states = page.getByRole('group', { name: 'Checkbox states', exact: true });
  const focused = states.getByRole('checkbox', { name: 'Focused', exact: true });

  await expect(focused).toBeFocused();
  expect(await focused.evaluate((checkbox) => checkbox.matches(':focus-visible'))).toBe(true);
  await expect(states).toHaveScreenshot('checkbox-focused.png', { animations: 'disabled' });
});

test('keeps the focused checkbox example visible after sidebar navigation', async ({ page }) => {
  await page.goto('/components/button');
  await page.getByRole('button', { name: 'Forms', exact: true }).click();
  await page.getByRole('link', { name: 'Checkbox', exact: true }).click();

  const focused = page.getByRole('checkbox', { name: 'Focused', exact: true });
  await expect(page).toHaveURL(/\/components\/checkbox$/);
  await expect(focused).toBeFocused();
  expect(await focused.evaluate((checkbox) => checkbox.matches(':focus-visible'))).toBe(true);
});

test('captures pointer hover and pressed checkbox states', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default checkbox example', exact: true });
  const checkbox = example.getByRole('checkbox', { name: 'Receive product updates' });

  await checkbox.hover();
  expect(await checkbox.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect(checkbox).toHaveScreenshot('checkbox-hover.png', { animations: 'disabled' });

  await page.mouse.down();
  expect(await checkbox.evaluate((element) => element.matches(':active'))).toBe(true);
  await expect(checkbox).toHaveScreenshot('checkbox-pressed.png', { animations: 'disabled' });
  await page.mouse.up();
});

test('toggles the native default checkbox with pointer and keyboard input', async ({ page }) => {
  const checkbox = page.getByRole('checkbox', { name: 'Receive product updates' });

  await expect(checkbox).not.toBeChecked();
  await checkbox.click();
  await expect(checkbox).toBeChecked();
  await checkbox.press('Space');
  await expect(checkbox).not.toBeChecked();
});
