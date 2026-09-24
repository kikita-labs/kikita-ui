import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('/components/radio');
});

test('captures the default native radio group', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default radio example', exact: true });
  const plan = example.getByRole('group', { name: 'Billing plan', exact: true });

  await expect(page.getByRole('heading', { level: 1, name: 'Radio' })).toBeVisible();
  await expect(plan.getByRole('radio')).toHaveCount(3);
  await expect(plan.getByRole('radio', { name: 'Starter' })).toBeChecked();
  await expect(example.getByRole('radio', { name: 'Starter' })).toHaveAttribute(
    'aria-describedby',
    /kui-field-\d+-hint/,
  );
  await expect(example).toHaveScreenshot('radio-default-desktop.png');
});

test('captures every supported radio size', async ({ page }) => {
  const sizes = page.getByRole('group', { name: 'Radio sizes', exact: true });

  await expect(sizes.getByRole('radio')).toHaveCount(4);
  for (const [name, size] of [
    ['Extra small', 'xs'],
    ['Small', 'sm'],
    ['Medium', 'md'],
    ['Large', 'lg'],
  ]) {
    const radio = sizes.getByRole('radio', { name, exact: true });
    await expect(radio).toBeChecked();
    await expect(radio).toHaveAttribute('data-kui-size', size);
  }
  await expect(sizes).toHaveScreenshot('radio-sizes-desktop.png');
});

test('captures selection, disabled, and invalid states', async ({ page }) => {
  const states = page.getByRole('group', { name: 'Radio states', exact: true });
  const selection = states.getByRole('group', { name: 'Selection', exact: true });
  const disabled = states.getByRole('group', { name: 'Disabled options', exact: true });
  const standaloneInvalid = states.getByRole('group', {
    name: 'Standalone invalid options',
    exact: true,
  });
  const fieldInvalid = states.getByRole('group', { name: 'Payment method', exact: true });

  await expect(selection.getByRole('radio', { name: 'Selected', exact: true })).toBeChecked();
  await expect(selection.getByRole('radio', { name: 'Unselected', exact: true })).not.toBeChecked();
  await expect(disabled.getByRole('radio', { name: 'Disabled', exact: true })).toBeDisabled();
  const disabledChecked = disabled.getByRole('radio', {
    name: 'Disabled and selected',
    exact: true,
  });
  await expect(disabledChecked).toBeDisabled();
  await expect(disabledChecked).toBeChecked();
  await expect(standaloneInvalid.getByRole('radio', { name: 'Card' })).toHaveAttribute(
    'aria-invalid',
    'true',
  );

  const requiredPayment = fieldInvalid.getByRole('radio', { name: 'Card' });
  await expect(requiredPayment).toHaveAttribute('aria-invalid', 'true');
  await expect(requiredPayment).toHaveAttribute('aria-describedby', /kui-field-\d+-error/);
  await expect(states.getByText('Select a payment method to continue.')).toBeVisible();
  await expect(states).toHaveScreenshot('radio-states-desktop.png');
});

test('captures radio examples at 320 pixels', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  for (const category of ['Actions', 'Forms']) {
    const toggle = page.getByRole('button', { name: category, exact: true });
    if ((await toggle.getAttribute('aria-expanded')) === 'true') await toggle.click();
  }

  await expect(page.getByRole('heading', { level: 1, name: 'Radio' })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    ),
  ).toBe(false);

  await expect(
    page.getByRole('group', { name: 'Default radio example', exact: true }),
  ).toHaveScreenshot('radio-default-320.png');
  await expect(page.getByRole('group', { name: 'Radio sizes', exact: true })).toHaveScreenshot(
    'radio-sizes-320.png',
  );
  const states = page.getByRole('group', { name: 'Radio states', exact: true });
  const stateExamples = [
    ['Selection', 'radio-selection-320.png'],
    ['Disabled options', 'radio-disabled-320.png'],
    ['Standalone invalid options', 'radio-standalone-invalid-320.png'],
    ['Payment method', 'radio-payment-320.png'],
  ];
  for (const [name, screenshot] of stateExamples) {
    await expect(states.getByRole('group', { name, exact: true })).toHaveScreenshot(screenshot);
  }
});

test('moves the native radio selection with arrow keys', async ({ page }) => {
  const plan = page
    .getByRole('group', { name: 'Default radio example', exact: true })
    .getByRole('group', { name: 'Billing plan', exact: true });
  const starter = plan.getByRole('radio', { name: 'Starter' });
  const pro = plan.getByRole('radio', { name: 'Professional' });

  await starter.click();
  await starter.press('ArrowDown');

  await expect(pro).toBeChecked();
  await expect(plan).toHaveScreenshot('radio-keyboard-selection.png', {
    animations: 'disabled',
  });
});

test('captures the real focus-visible radio state', async ({ page }) => {
  const starter = page.getByRole('radio', { name: 'Starter' });
  const pro = page.getByRole('radio', { name: 'Professional' });

  await pro.click();
  await pro.press('ArrowUp');

  await expect(starter).toBeFocused();
  await expect(starter).toBeChecked();
  expect(await starter.evaluate((radio) => radio.matches(':focus-visible'))).toBe(true);
  await expect(
    page.getByRole('group', { name: 'Default radio example', exact: true }),
  ).toHaveScreenshot('radio-focus-visible.png', { animations: 'disabled' });
});

test('captures real hover and pressed radio states', async ({ page }) => {
  const pro = page.getByRole('radio', { name: 'Professional' });
  const example = page.getByRole('group', { name: 'Default radio example', exact: true });

  await pro.hover();
  expect(await pro.evaluate((radio) => radio.matches(':hover'))).toBe(true);
  await expect(example).toHaveScreenshot('radio-hover.png', { animations: 'disabled' });

  const bounds = await pro.boundingBox();
  if (!bounds) throw new Error('The Professional radio should have a visible bounding box.');
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  expect(await pro.evaluate((radio) => radio.matches(':active'))).toBe(true);
  await expect(example).toHaveScreenshot('radio-pressed.png', { animations: 'disabled' });
  await page.mouse.up();
});
