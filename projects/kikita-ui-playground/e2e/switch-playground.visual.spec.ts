import { expect, test } from '../../../tests/e2e/support/fixtures';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/components/switch');
  await expect(page.getByRole('heading', { level: 1, name: 'Switch', exact: true })).toBeVisible();
});

test('server-renders Switch semantics and hydrates field descriptions', async ({
  browser,
  page,
}) => {
  const routeUrl = new URL('/components/switch', page.url()).toString();
  const serverContext = await browser.newContext({ javaScriptEnabled: false });

  try {
    const serverPage = await serverContext.newPage();
    const response = await serverPage.goto(routeUrl);

    expect(response?.status()).toBe(200);
    await expect(
      serverPage.getByRole('heading', { level: 1, name: 'Switch', exact: true }),
    ).toBeVisible();

    const defaultSwitch = serverPage.getByRole('switch', {
      name: 'Default switch',
      exact: true,
    });
    await expect(defaultSwitch).toHaveAttribute('id', 'switch-default');
    await expect(defaultSwitch).toHaveAttribute('data-kui-size', 'md');
    expect(
      await defaultSwitch.evaluate((input) => (input as HTMLInputElement).labels?.[0]?.htmlFor),
    ).toBe('switch-default');

    const accountAlerts = serverPage.getByRole('switch', { name: 'Account alerts', exact: true });
    await expect(accountAlerts).toHaveAttribute('id', /kui-field-\d+/);
    await expect(accountAlerts).toHaveAttribute('data-kui-size', 'sm');
    await expect(accountAlerts).toHaveAttribute('aria-describedby', /kui-field-\d+-hint/);
    await expect(accountAlerts).not.toHaveAttribute('aria-invalid', 'true');
  } finally {
    await serverContext.close();
  }

  const runtimeErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  await page.reload();

  const hydratedField = page.getByRole('switch', { name: 'Account alerts', exact: true });
  await expect(hydratedField).toHaveAttribute('aria-describedby', /kui-field-\d+-hint/);
  expect(runtimeErrors).toEqual([]);
});

test('shows the default Switch and every size in both native values @visual', async ({ page }) => {
  const defaultExample = page.getByRole('group', {
    name: 'Default switch example',
    exact: true,
  });
  const defaultSwitch = defaultExample.getByRole('switch', { name: 'Default switch', exact: true });
  await expect(defaultSwitch).not.toBeChecked();
  await expect(defaultSwitch).toHaveAttribute('data-kui-size', 'md');

  const sizes = page.getByRole('group', { name: 'Switch sizes', exact: true });
  await expect(sizes.getByRole('switch')).toHaveCount(8);

  for (const [sizeName, size] of [
    ['Extra small', 'xs'],
    ['Small', 'sm'],
    ['Medium', 'md'],
    ['Large', 'lg'],
  ]) {
    const sizeGroup = sizes.getByRole('group', { name: sizeName, exact: true });
    const off = sizeGroup.getByRole('switch', { name: 'Off', exact: true });
    const on = sizeGroup.getByRole('switch', { name: 'On', exact: true });

    await expect(off).not.toBeChecked();
    await expect(on).toBeChecked();
    await expect(off).toHaveAttribute('data-kui-size', size);
    await expect(on).toHaveAttribute('data-kui-size', size);
  }

  await expect(defaultExample).toHaveScreenshot('switch-default-dark-desktop.png');
  await expect(sizes).toHaveScreenshot('switch-sizes-dark-desktop.png');
});

test('shows standalone invalid and native disabled Switch values @visual', async ({ page }) => {
  const states = page.getByRole('group', { name: 'Switch states', exact: true });
  const invalid = states.getByRole('group', { name: 'Invalid', exact: true });
  const invalidOff = invalid.getByRole('switch', { name: 'Off', exact: true });
  const invalidOn = invalid.getByRole('switch', { name: 'On', exact: true });

  await expect(invalidOff).toHaveAttribute('aria-invalid', 'true');
  await expect(invalidOff).toHaveAttribute('data-kui-invalid', '');
  await expect(invalidOn).toHaveAttribute('aria-invalid', 'true');
  await expect(invalidOn).toBeChecked();

  const disabled = states.getByRole('group', { name: 'Disabled', exact: true });
  const disabledOff = disabled.getByRole('switch', { name: 'Off', exact: true });
  const disabledOn = disabled.getByRole('switch', { name: 'On', exact: true });
  await expect(disabledOff).toBeDisabled();
  await expect(disabledOn).toBeDisabled();
  await expect(disabledOn).toBeChecked();

  await disabledOff.click({ force: true });
  await disabledOn.click({ force: true });
  await expect(disabledOff).not.toBeChecked();
  await expect(disabledOn).toBeChecked();
  await page.mouse.move(0, 0);

  await expect(states).toHaveScreenshot('switch-states-dark-desktop.png');
  await page.getByRole('button', { name: 'Switch to light theme', exact: true }).click();
  await expect(states).toHaveScreenshot('switch-states-light-desktop.png');
});

test('uses native click and Space activation and captures real hover, focus, and pressed states @visual', async ({
  page,
}) => {
  const defaultSwitch = page
    .getByRole('group', { name: 'Default switch example', exact: true })
    .getByRole('switch', { name: 'Default switch', exact: true });

  await defaultSwitch.click();
  await expect(defaultSwitch).toBeChecked();
  await defaultSwitch.press('Space');
  await expect(defaultSwitch).not.toBeChecked();

  const interactions = page.getByRole('group', { name: 'Switch interactions', exact: true });
  const pointerSample = interactions.getByRole('switch', {
    name: 'Pointer sample',
    exact: true,
  });
  const keyboardSample = interactions.getByRole('switch', {
    name: 'Keyboard sample',
    exact: true,
  });

  await pointerSample.hover();
  expect(await pointerSample.evaluate((input) => input.matches(':hover'))).toBe(true);
  await expect(interactions).toHaveScreenshot('switch-hover-desktop.png', {
    animations: 'disabled',
  });

  await pointerSample.focus();
  await page.keyboard.press('Tab');
  await expect(keyboardSample).toBeFocused();
  expect(await keyboardSample.evaluate((input) => input.matches(':focus-visible'))).toBe(true);
  await page.mouse.move(0, 0);
  expect(await keyboardSample.evaluate((input) => input.matches(':focus-visible'))).toBe(true);
  await expect(interactions).toHaveScreenshot('switch-focus-visible-desktop.png', {
    animations: 'disabled',
  });

  await keyboardSample.press('Space');
  await expect(keyboardSample).toBeChecked();

  const bounds = await pointerSample.boundingBox();
  if (!bounds) throw new Error('The pointer sample should have a visible bounding box.');
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  expect(await pointerSample.evaluate((input) => input.matches(':active'))).toBe(true);
  await expect(interactions).toHaveScreenshot('switch-pressed-desktop.png', {
    animations: 'disabled',
  });
  await page.mouse.up();
});

test('shows field size precedence and the Signal Forms touched-to-valid lifecycle @visual', async ({
  page,
}) => {
  const fields = page.getByRole('group', { name: 'Switch field examples', exact: true });
  const inherited = fields.getByRole('switch', { name: 'Inherited field size', exact: true });
  const localOverride = fields.getByRole('switch', { name: 'Local size override', exact: true });

  await expect(inherited).toHaveAttribute('data-kui-size', 'sm');
  await expect(inherited).toHaveAttribute('aria-describedby', /kui-field-\d+-hint/);
  await expect(localOverride).toHaveAttribute('data-kui-size', 'lg');

  const accountAlerts = fields.getByRole('switch', { name: 'Account alerts', exact: true });
  await expect(accountAlerts).not.toHaveAttribute('aria-invalid', 'true');
  await expect(fields.getByRole('alert')).toHaveCount(0);
  await accountAlerts.focus();
  await accountAlerts.blur();

  await expect(accountAlerts).toHaveAttribute('aria-invalid', 'true');
  await expect(accountAlerts).toHaveAttribute('aria-describedby', /kui-field-\d+-hint/);
  await expect(accountAlerts).toHaveAttribute('aria-describedby', /kui-field-\d+-error/);
  await expect(fields.getByRole('alert')).toHaveText('Enable account alerts to continue.');
  await expect(fields).toHaveScreenshot('switch-field-invalid-desktop.png', {
    animations: 'disabled',
  });

  await accountAlerts.check();
  await expect(accountAlerts).toBeChecked();
  await expect(accountAlerts).not.toHaveAttribute('aria-invalid', 'true');
  await expect(accountAlerts).toHaveAttribute('aria-describedby', /kui-field-\d+-hint/);
  await expect(accountAlerts).not.toHaveAttribute('aria-describedby', /kui-field-\d+-error/);
  await expect(fields.getByRole('alert')).toHaveCount(0);
  await page.mouse.move(0, 0);
  await expect(fields).toHaveScreenshot('switch-field-corrected-desktop.png', {
    animations: 'disabled',
  });
});

test('loads the Switch scope in both languages and localizes the field error', async ({ page }) => {
  const localeResponse = await page.request.get('/i18n/switch/ru.json');
  expect(localeResponse.ok()).toBeTruthy();
  const translations = await localeResponse.json();

  await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: translations.title, exact: true }),
  ).toBeVisible();

  const fields = page.getByRole('group', { name: translations.accessibility.field, exact: true });
  const accountAlerts = fields.getByRole('switch', {
    name: translations.labels.accountAlerts,
    exact: true,
  });
  await accountAlerts.focus();
  await accountAlerts.blur();
  await expect(fields.getByRole('alert')).toHaveText(translations.errors.activationRequired);
});

test('fits desktop, tablet, and 320px and captures each catalogue section on mobile @visual', async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 768, height: 1024 },
    { width: 320, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true);
  }

  for (const category of ['Actions', 'Forms']) {
    const toggle = page.getByRole('button', { name: category, exact: true });
    if ((await toggle.getAttribute('aria-expanded')) === 'true') await toggle.click();
  }

  await expect(page.getByRole('heading', { level: 1, name: 'Switch', exact: true })).toBeVisible();
  await expect(
    page.getByRole('group', { name: 'Default switch example', exact: true }),
  ).toHaveScreenshot('switch-default-320.png');
  await expect(page.getByRole('group', { name: 'Switch sizes', exact: true })).toHaveScreenshot(
    'switch-sizes-320.png',
  );
  await expect(page.getByRole('group', { name: 'Switch states', exact: true })).toHaveScreenshot(
    'switch-states-320.png',
  );
  await expect(
    page.getByRole('group', { name: 'Switch interactions', exact: true }),
  ).toHaveScreenshot('switch-interactions-320.png');
  await expect(
    page.getByRole('group', { name: 'Switch field examples', exact: true }),
  ).toHaveScreenshot('switch-field-320.png');
});
