import { expect, test } from '../../../tests/e2e/support/fixtures';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('/components/checkbox');
});

test('captures the default checkbox example', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'Checkbox' })).toBeVisible();

  const example = page.getByRole('group', { name: 'Default checkbox example', exact: true });
  const checkbox = example.getByRole('checkbox', { name: 'Receive product updates' });
  await expect(checkbox).not.toBeChecked();
  await expect(checkbox).toHaveAttribute('data-kui-size', 'md');
  await expect(checkbox).toHaveAttribute('id', /kui-field-\d+/);
  await expect(example).toHaveScreenshot('checkbox-default.png');
});

test('captures every supported checkbox size', async ({ page }) => {
  const sizes = page.getByRole('group', { name: 'Checkbox sizes', exact: true });

  await expect(sizes.getByRole('checkbox')).toHaveCount(4);

  for (const [name, size, checked] of [
    ['Extra small', 'xs', false],
    ['Small', 'sm', true],
    ['Medium', 'md', true],
    ['Large', 'lg', false],
  ] as const) {
    const checkbox = sizes.getByRole('checkbox', { name, exact: true });
    await expect(checkbox).toHaveAttribute('data-kui-size', size);
    await expect(checkbox).toHaveJSProperty('checked', checked);
  }

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

  const standaloneInvalid = states.getByRole('checkbox', {
    name: 'Standalone invalid',
    exact: true,
  });
  await expect(standaloneInvalid).toHaveAttribute('id', 'checkbox-standalone-invalid');
  await expect(standaloneInvalid).toHaveAttribute('data-kui-invalid', '');
  await expect(standaloneInvalid).toHaveAttribute('aria-invalid', 'true');
  await expect(standaloneInvalid).not.toHaveAttribute('aria-describedby', /.+/);

  await expect(
    states.getByRole('checkbox', { name: 'Indeterminate', exact: true }),
  ).toHaveJSProperty('indeterminate', true);
  const stateCard = page.getByRole('article').filter({ has: states });
  await expect(stateCard).toHaveScreenshot('checkbox-states.png');
});

test('captures the focus-visible checkbox example', async ({ page }) => {
  const states = page.getByRole('group', { name: 'Checkbox states', exact: true });
  const focused = states.getByRole('checkbox', { name: 'Focused', exact: true });

  await expect(focused).toBeFocused();
  expect(await focused.evaluate((checkbox) => checkbox.matches(':focus-visible'))).toBe(true);
  const stateCard = page.getByRole('article').filter({ has: states });
  await expect(stateCard).toHaveScreenshot('checkbox-focused.png', { animations: 'disabled' });
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

test('updates Checkbox labels when the shell language changes to Russian', async ({ page }) => {
  const localeResponse = await page.request.get('/i18n/checkbox/ru.json');
  expect(localeResponse.ok()).toBeTruthy();
  const russian = await localeResponse.json();

  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Switch language to Russian', exact: true })
    .click();

  await expect(
    page.getByRole('heading', { level: 1, name: russian.title, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('group', { name: russian.accessibility.states, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: russian.labels.standaloneInvalid, exact: true }),
  ).toBeVisible();
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

test('captures each Checkbox catalogue section at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 2048 });

  for (const [name, screenshot] of [
    ['Default checkbox example', 'checkbox-default-320.png'],
    ['Checkbox sizes', 'checkbox-sizes-320.png'],
    ['Checkbox states', 'checkbox-states-320.png'],
  ] as const) {
    const section = page.getByRole('group', { name, exact: true });
    const target =
      name === 'Checkbox states' ? page.getByRole('article').filter({ has: section }) : section;
    await expect(target).toHaveScreenshot(screenshot, {
      animations: 'disabled',
    });
  }
});

test('toggles the native default checkbox with pointer and keyboard input', async ({ page }) => {
  const checkbox = page.getByRole('checkbox', { name: 'Receive product updates' });

  await expect(checkbox).not.toBeChecked();
  await checkbox.click();
  await expect(checkbox).toBeChecked();
  await checkbox.press('Space');
  await expect(checkbox).not.toBeChecked();
});
