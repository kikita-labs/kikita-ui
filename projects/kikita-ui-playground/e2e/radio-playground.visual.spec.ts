import { expect, type Locator, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('/components/radio');
});

test('captures the default native radio group', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default radio example', exact: true });
  const plan = example.getByRole('group', { name: 'Billing plan', exact: true });

  await expect(page.getByRole('heading', { level: 1, name: 'Radio' })).toBeVisible();
  await expect(plan.getByRole('radio')).toHaveCount(3);
  const starter = plan.getByRole('radio', { name: 'Starter' });
  await expect(starter).toBeChecked();
  await expect(starter).toHaveAttribute('data-kui-size', 'md');
  await expect(starter).toHaveAttribute('id', /kui-field-\d+/);
  await expect(plan.getByRole('radio', { name: 'Professional' })).toHaveAttribute(
    'id',
    'playground-plan-pro',
  );
  await expect(example.getByRole('radio', { name: 'Starter' })).toHaveAttribute(
    'aria-describedby',
    /kui-field-\d+-hint/,
  );
  await expect(example).toHaveScreenshot('radio-default-desktop.png');
});

test('captures every supported radio size', async ({ page }) => {
  const sizes = page.getByRole('group', { name: 'Radio sizes', exact: true });
  const explicitSizes = sizes.getByRole('group', { name: 'Explicit sizes', exact: true });

  await expect(explicitSizes.getByRole('radio')).toHaveCount(4);
  for (const [name, size] of [
    ['Extra small', 'xs'],
    ['Small', 'sm'],
    ['Medium', 'md'],
    ['Large', 'lg'],
  ]) {
    const radio = explicitSizes.getByRole('radio', { name, exact: true });
    await expect(radio).toBeChecked();
    await expect(radio).toHaveAttribute('data-kui-size', size);
  }
  const fieldSize = sizes.getByRole('group', { name: 'Field size precedence', exact: true });
  await expect(fieldSize.getByRole('radio', { name: 'Inherited from Field (lg)' })).toHaveAttribute(
    'data-kui-size',
    'lg',
  );
  await expect(fieldSize.getByRole('radio', { name: 'Local size override (sm)' })).toHaveAttribute(
    'data-kui-size',
    'sm',
  );
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
  const captureWidth = 320;
  const captureHeight = 1280;
  await page.setViewportSize({ width: captureWidth, height: captureHeight });

  const expectGroupWithinCaptureViewport = async (group: Locator) => {
    await group.evaluate((element) => {
      element.scrollIntoView({ block: 'center', inline: 'nearest' });
    });
    const bounds = await group.boundingBox();
    if (!bounds) throw new Error('Expected the Radio example group to have a bounding box.');

    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.y).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(captureWidth);
    // Allow at most one CSS pixel for fractional scroll-position rounding.
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(captureHeight + 1);

    for (const radio of await group.getByRole('radio').all()) {
      await expect(radio).toBeVisible();
      const radioBounds = await radio.boundingBox();
      if (!radioBounds) throw new Error('Expected each Radio option to have a bounding box.');

      expect(radioBounds.x + radioBounds.width).toBeGreaterThan(0);
      expect(radioBounds.y + radioBounds.height).toBeGreaterThan(0);
      expect(radioBounds.x).toBeLessThan(captureWidth);
      expect(radioBounds.y).toBeLessThan(captureHeight);
    }
  };

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

  const defaultExample = page.getByRole('group', { name: 'Default radio example', exact: true });
  await expectGroupWithinCaptureViewport(defaultExample);
  await expect(defaultExample).toHaveScreenshot('radio-default-320.png');

  const sizes = page.getByRole('group', { name: 'Radio sizes', exact: true });
  const explicitSizes = sizes.getByRole('group', { name: 'Explicit sizes', exact: true });
  const fieldSize = sizes.getByRole('group', { name: 'Field size precedence', exact: true });
  await expect(explicitSizes.getByRole('radio')).toHaveCount(4);
  await expect(fieldSize.getByRole('radio')).toHaveCount(2);
  await expectGroupWithinCaptureViewport(explicitSizes);
  await expect(fieldSize.getByRole('radio', { name: 'Inherited from Field (lg)' })).toBeVisible();
  await expect(fieldSize.getByRole('radio', { name: 'Local size override (sm)' })).toBeVisible();
  await expect(explicitSizes).toHaveScreenshot('radio-explicit-sizes-320.png');
  await expectGroupWithinCaptureViewport(fieldSize);
  await expect(fieldSize).toHaveScreenshot('radio-field-size-precedence-320.png');

  const states = page.getByRole('group', { name: 'Radio states', exact: true });
  const stateExamples = [
    ['Selection', 'radio-selection-320.png'],
    ['Disabled options', 'radio-disabled-320.png'],
    ['Signal Forms payment', 'radio-signal-payment-320.png'],
    ['Standalone invalid options', 'radio-standalone-invalid-320.png'],
    ['Payment method', 'radio-payment-320.png'],
  ];
  for (const [name, screenshot] of stateExamples) {
    const group = states.getByRole('group', { name, exact: true });
    const radios = group.getByRole('radio');
    const captureTarget =
      name === 'Signal Forms payment'
        ? group.locator(
            'xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " radio-states__signal-frame ")][1]',
          )
        : group;
    await expect(radios).toHaveCount(2);
    await expectGroupWithinCaptureViewport(captureTarget);
    await expect(captureTarget).toHaveScreenshot(screenshot);
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

test('applies the touched-gated Signal Forms error to a native radio group', async ({ page }) => {
  const states = page.getByRole('group', { name: 'Radio states', exact: true });
  const signalPayment = states.getByRole('group', { name: 'Signal Forms payment', exact: true });
  const card = signalPayment.getByRole('radio', { name: 'Card', exact: true });
  const transfer = signalPayment.getByRole('radio', { name: 'Bank transfer', exact: true });
  const signalError = states
    .getByRole('alert')
    .filter({ hasText: 'Choose a payment option to continue.' });

  await expect(card).toHaveJSProperty('required', true);
  await expect(transfer).toHaveJSProperty('required', true);
  await expect(card).toHaveAttribute('name', /.+/);
  expect(await transfer.getAttribute('name')).toBe(await card.getAttribute('name'));
  await expect(card).not.toHaveAttribute('aria-invalid', /.+/);
  await expect(card).toHaveAttribute('aria-describedby', /kui-field-\d+-hint/);
  await expect(signalError).toHaveCount(0);

  await card.focus();
  await card.press('Tab');

  await expect(card).toHaveAttribute('aria-invalid', 'true');
  await expect(card).toHaveAttribute('aria-describedby', /kui-field-\d+-hint kui-field-\d+-error/);
  await expect(signalError).toHaveText('Choose a payment option to continue.');
  await expect(states).toHaveScreenshot('radio-signal-form-invalid.png', {
    animations: 'disabled',
  });

  await transfer.focus();
  await transfer.press('Space');

  await expect(transfer).toBeChecked();
  await expect(transfer).not.toHaveAttribute('aria-invalid', /.+/);
  await expect(signalError).toHaveCount(0);
  await expect(states).toHaveScreenshot('radio-signal-form-selected.png', {
    animations: 'disabled',
  });
});

test('switches Radio labels and Signal Forms errors to Russian at runtime', async ({ page }) => {
  const localeResponse = await page.request.get('/i18n/radio/ru.json');
  expect(localeResponse.ok()).toBeTruthy();
  const russian = await localeResponse.json();

  await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();

  await expect(
    page.getByRole('heading', { level: 1, name: russian.title, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('group', { name: russian.accessibility.default, exact: true }),
  ).toBeVisible();

  const signalPayment = page
    .getByRole('group', { name: russian.accessibility.states, exact: true })
    .getByRole('group', { name: russian.groups.signalPayment, exact: true });
  const card = signalPayment.getByRole('radio', { name: russian.labels.card, exact: true });
  const signalError = page
    .getByRole('group', { name: russian.accessibility.states, exact: true })
    .getByRole('alert')
    .filter({ hasText: russian.errors.signalPaymentRequired });

  await card.focus();
  await card.press('Tab');

  await expect(signalError).toHaveText(russian.errors.signalPaymentRequired);
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
