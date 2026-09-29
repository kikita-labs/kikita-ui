import { expect, test } from '../../../tests/e2e/support/fixtures';

const catalogueExamples = [
  ['Default field example', 'field-default-desktop.png', 'field-default-320.png'],
  ['Field labels and messages', 'field-anatomy-desktop.png', 'field-anatomy-320.png'],
  ['Field sizes', 'field-sizes-desktop.png', 'field-sizes-320.png'],
  ['Field validation', 'field-validation-desktop.png', 'field-validation-320.png'],
  ['Projected field content', 'field-projected-desktop.png', 'field-projected-320.png'],
  ['Field provider defaults', 'field-providers-desktop.png', 'field-providers-320.png'],
  ['Field affixes and actions', 'field-affixes-desktop.png', 'field-affixes-320.png'],
] as const;

/** Verbatim `lucide-static@1` search icon, served locally so captures never race the CDN. */
const LUCIDE_SEARCH_ICON =
  '<svg class="lucide lucide-search" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></svg>';

test.beforeEach(async ({ page }) => {
  await page.route('https://cdn.jsdelivr.net/npm/lucide-static@1/icons/search.svg', (route) =>
    route.fulfill({ contentType: 'image/svg+xml', body: LUCIDE_SEARCH_ICON }),
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/components/field');
  await expect(page.getByRole('heading', { level: 1, name: 'Field', exact: true })).toBeVisible();
});

test('server-renders and hydrates Field labels and descriptions', async ({ browser, page }) => {
  const routeUrl = new URL('/components/field', page.url()).toString();
  const serverContext = await browser.newContext({ javaScriptEnabled: false });

  try {
    const serverPage = await serverContext.newPage();
    const response = await serverPage.goto(routeUrl);

    expect(response?.status()).toBe(200);
    await expect(
      serverPage.getByRole('heading', { level: 1, name: 'Field', exact: true }),
    ).toBeVisible();

    const defaultExample = serverPage.getByRole('group', {
      name: 'Default field example',
      exact: true,
    });
    const defaultInput = defaultExample.getByRole('textbox', { name: 'Project name' });
    await expect(defaultInput).toHaveAttribute('id', /kui-field-\d+/);
    expect(
      await defaultInput.evaluate((input) => (input as HTMLInputElement).labels?.[0]?.htmlFor),
    ).toBe(await defaultInput.getAttribute('id'));
  } finally {
    await serverContext.close();
  }

  const runtimeErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  await page.reload();

  const ownerEmail = page
    .getByRole('group', { name: 'Field labels and messages', exact: true })
    .getByRole('textbox', { name: 'Owner email' });
  await expect(ownerEmail).toHaveAttribute('aria-describedby', /kui-field-\d+-hint/);
  expect(runtimeErrors).toEqual([]);
});

test('shows all sizes and Field-owned accessible states', async ({ page }) => {
  const sizes = page.getByRole('group', { name: 'Field sizes', exact: true });
  await expect(sizes.getByRole('textbox')).toHaveCount(4);

  for (const [label, size] of [
    ['Field size xs', 'xs'],
    ['Field size sm', 'sm'],
    ['Field size md', 'md'],
    ['Field size lg', 'lg'],
  ]) {
    await expect(sizes.getByRole('textbox', { name: label, exact: true })).toHaveAttribute(
      'data-kui-size',
      size,
    );
  }

  const anatomy = page.getByRole('group', { name: 'Field labels and messages', exact: true });
  const hintedControl = anatomy.getByRole('textbox', { name: 'A control with hint only' });
  await expect(hintedControl).toHaveAttribute('aria-describedby', /kui-field-\d+-hint/);
  const unlabeledFieldControl = anatomy.getByRole('textbox', {
    name: 'A control without field content',
  });
  await expect(unlabeledFieldControl).not.toHaveAttribute('aria-describedby', /.+/);

  const projected = page.getByRole('group', { name: 'Projected field content', exact: true });
  const projectedControl = projected.getByRole('textbox', { name: 'Domain' });
  await expect(projectedControl).toHaveAttribute('aria-invalid', 'true');
  const projectedDescriptionIds = (await projectedControl.getAttribute('aria-describedby'))
    ?.split(/\s+/)
    .filter(Boolean);
  expect(projectedDescriptionIds).toEqual([
    expect.stringMatching(/^kui-field-hint-\d+$/),
    expect.stringMatching(/^kui-field-error-\d+$/),
  ]);
  await expect(projected.getByRole('alert')).toHaveText(
    'Use lowercase letters and numbers for your workspace URL.',
  );
});

test('shows Signal Forms errors after touch and preserves invalid state when messages are hidden', async ({
  page,
}) => {
  const validation = page.getByRole('group', { name: 'Field validation', exact: true });
  const requiredEmail = validation.getByRole('textbox', { name: 'Required email' });

  await expect(requiredEmail).not.toHaveAttribute('aria-invalid', 'true');
  await expect(validation.getByRole('alert')).toHaveCount(0);
  await expect(validation).toHaveScreenshot('field-validation-before-touch.png', {
    animations: 'disabled',
  });

  await requiredEmail.focus();
  await requiredEmail.blur();
  await expect(requiredEmail).toHaveAttribute('aria-invalid', 'true');
  await expect(validation.getByRole('alert')).toHaveText('Enter an email address.');
  await expect(requiredEmail).toHaveAttribute('aria-describedby', /kui-field-\d+-error/);
  await expect(validation).toHaveScreenshot('field-validation-after-touch.png', {
    animations: 'disabled',
  });

  const hiddenError = validation.getByRole('textbox', { name: 'Hidden error' });
  await expect(hiddenError).toHaveAttribute('aria-invalid', 'true');
  await expect(hiddenError).not.toHaveAttribute('aria-describedby', /.+/);
  await expect(
    validation.getByText('This explicit error remains invalid while its text is hidden.'),
  ).toHaveCount(0);

  const markerOverride = validation.getByRole('textbox', { name: 'Required rule without marker' });
  await expect(markerOverride).not.toHaveAttribute('aria-invalid', 'true');
  expect(
    await markerOverride.evaluate((input) =>
      (input as HTMLInputElement).labels?.[0]?.querySelector('[aria-hidden="true"]'),
    ),
  ).toBeNull();
});

test('resolves scoped defaults before local Field options', async ({ page }) => {
  const providers = page.getByRole('group', { name: 'Field provider defaults', exact: true });
  const inherited = providers.getByRole('textbox', { name: 'Provider default' });
  await expect(inherited).toHaveAttribute('data-kui-size', 'sm');
  await expect(inherited).toHaveAttribute('aria-invalid', 'true');
  await expect(inherited).not.toHaveAttribute('aria-describedby', /.+/);

  const localOverride = providers.getByRole('textbox', { name: 'Local override' });
  await expect(localOverride).toHaveAttribute('data-kui-size', 'lg');
  await expect(localOverride).toHaveAttribute('aria-invalid', 'true');
  await expect(localOverride).toHaveAttribute('aria-describedby', /kui-field-\d+-error/);
});

test('loads the Field scope in both languages and updates validation copy', async ({ page }) => {
  const localeResponse = await page.request.get('/i18n/field/ru.json');
  expect(localeResponse.ok()).toBeTruthy();
  const translations = await localeResponse.json();

  await page.getByRole('button', { name: 'Switch language to Russian' }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: translations.title, exact: true }),
  ).toBeVisible();

  const validation = page.getByRole('group', {
    name: translations.accessibility.validation,
    exact: true,
  });
  const requiredEmail = validation.getByRole('textbox', {
    name: translations.fields.requiredEmail,
  });
  await requiredEmail.focus();
  await requiredEmail.blur();

  await expect(validation.getByRole('alert')).toHaveText(translations.errors.required);
});

test('uses the affix click-to-focus behavior and keyboard-operable clear action', async ({
  page,
}) => {
  const affixes = page.getByRole('group', { name: 'Field affixes and actions', exact: true });
  const website = affixes.getByRole('textbox', { name: 'Website' });

  await expect(affixes.locator('kui-icon svg')).toBeVisible();
  await expect(affixes).toHaveScreenshot('field-affixes-before-prefix-click.png', {
    animations: 'disabled',
  });
  await affixes.getByText('https://', { exact: true }).click();
  await expect(website).toBeFocused();
  await expect(affixes).toHaveScreenshot('field-affixes-after-prefix-click-focus.png', {
    animations: 'disabled',
  });

  const search = affixes.getByRole('searchbox', { name: 'Search projects' });
  const clear = affixes.getByRole('button', { name: 'Clear search' });
  await expect(search).toHaveValue('kikita');
  await search.fill('kikita ui');
  await search.press('Tab');
  await expect(clear).toBeFocused();
  await expect(affixes).toHaveScreenshot('field-affixes-before-keyboard-clear.png', {
    animations: 'disabled',
  });
  await clear.press('Enter');
  await expect(search).toHaveValue('');
  await expect(affixes).toHaveScreenshot('field-affixes-after-keyboard-clear.png', {
    animations: 'disabled',
  });

  await expect(affixes.getByRole('status', { name: 'Checking amount' })).toBeVisible();
});

test('fits the Field catalogue without page overflow at desktop, tablet, and 320px', async ({
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
});

test('captures each labelled Field catalogue group at desktop and 320px', async ({ page }) => {
  await expect(
    page
      .getByRole('group', { name: 'Field affixes and actions', exact: true })
      .locator('kui-icon svg'),
  ).toBeVisible();

  for (const [name, desktopScreenshot] of catalogueExamples) {
    await expect(page.getByRole('group', { name, exact: true })).toHaveScreenshot(
      desktopScreenshot,
    );
  }

  await page.setViewportSize({ width: 320, height: 844 });
  for (const [name, , mobileScreenshot] of catalogueExamples) {
    await expect(page.getByRole('group', { name, exact: true })).toHaveScreenshot(mobileScreenshot);
  }
});
