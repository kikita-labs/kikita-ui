import { expect, test } from '@playwright/test';

const catalogueExamples = [
  ['Default textarea example', 'textarea-default-desktop.png', 'textarea-default-320.png'],
  ['Textarea sizes', 'textarea-sizes-desktop.png', 'textarea-sizes-320.png'],
  ['Native textarea states', 'textarea-states-desktop.png', 'textarea-states-320.png'],
  ['Explicit textarea ID', 'textarea-explicit-id-desktop.png', 'textarea-explicit-id-320.png'],
  ['Signal Forms validation', 'textarea-validation-desktop.png', 'textarea-validation-320.png'],
] as const;

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/components/textarea');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Textarea', exact: true }),
  ).toBeVisible();
});

test('server-renders and hydrates the default Textarea field association', async ({
  browser,
  page,
}) => {
  const routeUrl = new URL('/components/textarea', page.url()).toString();
  const serverContext = await browser.newContext({ javaScriptEnabled: false });

  try {
    const serverPage = await serverContext.newPage();
    const response = await serverPage.goto(routeUrl);

    expect(response?.status()).toBe(200);

    const defaultExample = serverPage.getByRole('group', {
      name: 'Default textarea example',
      exact: true,
    });
    const textarea = defaultExample.getByRole('textbox', { name: 'Project notes' });
    await expect(textarea).toHaveAttribute('data-kui-size', 'md');
    await expect(textarea).toHaveAttribute('rows', '3');
    await expect(textarea).toHaveAttribute('id', /kui-field-\d+/);
    expect(
      await textarea.evaluate((element) => (element as HTMLTextAreaElement).labels?.[0]?.htmlFor),
    ).toBe(await textarea.getAttribute('id'));
    await expect(textarea).toHaveAttribute('aria-describedby', /kui-field-\d+-hint/);
    await expect(textarea).not.toHaveAttribute('aria-invalid', 'true');
  } finally {
    await serverContext.close();
  }

  const runtimeErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  await page.reload();

  const hydratedTextarea = page
    .getByRole('group', { name: 'Default textarea example', exact: true })
    .getByRole('textbox', { name: 'Project notes' });
  await expect(hydratedTextarea).toHaveAttribute('data-kui-size', 'md');
  expect(
    await hydratedTextarea.evaluate(
      (element) => (element as HTMLTextAreaElement).labels?.[0]?.htmlFor,
    ),
  ).toBe(await hydratedTextarea.getAttribute('id'));
  expect(
    await hydratedTextarea.evaluate((element) => {
      const ids = element.getAttribute('aria-describedby')?.split(/\s+/) ?? [];
      return ids.length > 0 && ids.every((id) => document.getElementById(id));
    }),
  ).toBe(true);
  await expect(hydratedTextarea).not.toHaveAttribute('aria-invalid', 'true');
  expect(runtimeErrors).toEqual([]);
});

test('shows the default size, all four supported sizes, and native Textarea states', async ({
  page,
}) => {
  const defaultExample = page.getByRole('group', {
    name: 'Default textarea example',
    exact: true,
  });
  const defaultTextarea = defaultExample.getByRole('textbox', { name: 'Project notes' });
  await expect(defaultTextarea).toHaveAttribute('data-kui-size', 'md');
  await expect(defaultTextarea).not.toHaveAttribute('aria-invalid', 'true');
  expect(await defaultTextarea.evaluate((element) => getComputedStyle(element).resize)).toBe(
    'vertical',
  );

  const sizes = page.getByRole('group', { name: 'Textarea sizes', exact: true });
  for (const [name, size] of [
    ['Extra small', 'xs'],
    ['Small', 'sm'],
    ['Medium', 'md'],
    ['Large', 'lg'],
  ]) {
    await expect(sizes.getByRole('textbox', { name, exact: true })).toHaveAttribute(
      'data-kui-size',
      size,
    );
  }

  const states = page.getByRole('group', { name: 'Native textarea states', exact: true });
  await expect(states.getByRole('textbox', { name: 'Interactive' })).toBeEnabled();
  const readonly = states.getByRole('textbox', { name: 'Read-only' });
  await expect(readonly).toHaveAttribute('readonly', '');
  await expect(readonly).toHaveValue('Release notes are locked.');
  await readonly.focus();
  await expect(readonly).toBeFocused();
  await readonly.press('End');
  await readonly.press('x');
  await expect(readonly).toHaveValue('Release notes are locked.');
  const disabled = states.getByRole('textbox', { name: 'Disabled' });
  await expect(disabled).toBeDisabled();
  await expect(disabled).toHaveValue('Generated output is unavailable.');
  const invalid = states.getByRole('textbox', { name: 'Invalid' });
  await expect(invalid).toHaveAttribute('data-kui-invalid', '');
  await expect(invalid).toHaveAttribute('aria-invalid', 'true');
});

test('preserves the explicit id and its native label association', async ({ page }) => {
  const explicitId = page.getByRole('group', { name: 'Explicit textarea ID', exact: true });
  const textarea = explicitId.getByRole('textbox', { name: 'Explicit ID', exact: true });

  await expect(textarea).toHaveAttribute('id', 'textarea-explicit-id');
  expect(
    await textarea.evaluate((element) => (element as HTMLTextAreaElement).labels?.[0]?.htmlFor),
  ).toBe('textarea-explicit-id');
});

test('loads the Textarea scope and switches accessible names at runtime', async ({ page }) => {
  const localeResponse = await page.request.get('/i18n/textarea/ru.json');
  expect(localeResponse.ok()).toBeTruthy();
  const translations = await localeResponse.json();

  await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();

  await expect(
    page.getByRole('heading', { level: 1, name: translations.title, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('group', {
      name: translations.accessibility.defaultGroup,
      exact: true,
    }),
  ).toBeVisible();
});

test('captures real pointer hover and keyboard focus on a native textarea', async ({ page }) => {
  const states = page.getByRole('group', { name: 'Native textarea states', exact: true });
  const interactive = states.getByRole('textbox', { name: 'Interactive' });

  await interactive.hover();
  expect(await interactive.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect(states).toHaveScreenshot('textarea-hover.png', { animations: 'disabled' });

  await page.mouse.move(0, 0);
  const readonly = states.getByRole('textbox', { name: 'Read-only' });
  await readonly.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(interactive).toBeFocused();
  expect(await interactive.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(states).toHaveScreenshot('textarea-keyboard-focused.png', {
    animations: 'disabled',
  });
});

test('moves a required Signal Forms Textarea from untouched to invalid and corrected', async ({
  page,
}) => {
  const validation = page.getByRole('group', { name: 'Signal Forms validation', exact: true });
  const description = validation.getByRole('textbox', { name: 'Required description' });

  await expect(description).not.toHaveAttribute('aria-invalid', 'true');
  await expect(validation.getByRole('alert')).toHaveCount(0);
  await expect(description).toHaveAttribute('aria-describedby', /kui-field-\d+-hint/);
  await expect(description).not.toHaveAttribute('aria-describedby', /-error/);
  expect(
    await description.evaluate((element) =>
      (element as HTMLTextAreaElement).labels?.[0]?.querySelector('[aria-hidden="true"]'),
    ),
  ).not.toBeNull();

  await description.click();
  await description.press('Tab');

  await expect(description).toHaveAttribute('aria-invalid', 'true');
  await expect(validation.getByRole('alert')).toHaveText('Description is required.');
  await expect(description).toHaveAttribute('aria-describedby', /kui-field-\d+-error/);
  await expect(validation).toHaveScreenshot('textarea-validation-invalid.png', {
    animations: 'disabled',
  });

  await description.fill('A concise project description.');
  await description.press('Tab');

  await expect(description).not.toHaveAttribute('aria-invalid', 'true');
  await expect(validation.getByRole('alert')).toHaveCount(0);
  await expect(description).toHaveAttribute('aria-describedby', /kui-field-\d+-hint/);
  await expect(description).not.toHaveAttribute('aria-describedby', /-error/);
  await expect(validation).toHaveScreenshot('textarea-validation-corrected.png', {
    animations: 'disabled',
  });
});

test('fits the Textarea catalogue without page overflow at desktop, tablet, and 320px', async ({
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

test('captures each Textarea catalogue group at desktop and 320px', async ({ page }) => {
  for (const [name, desktopScreenshot] of catalogueExamples) {
    await expect(page.getByRole('group', { name, exact: true })).toHaveScreenshot(
      desktopScreenshot,
      { animations: 'disabled' },
    );
  }

  await page.setViewportSize({ width: 320, height: 844 });
  for (const [name, , mobileScreenshot] of catalogueExamples) {
    await expect(page.getByRole('group', { name, exact: true })).toHaveScreenshot(
      mobileScreenshot,
      { animations: 'disabled' },
    );
  }
});
