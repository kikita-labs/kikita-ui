import type { Locator } from '@playwright/test';

import { expect, test } from './support/fixtures';

interface InputFieldReferenceState {
  inputId: string;
  hintId: string | null;
  errorId: string | null;
  describedBy: string | null;
}

const catalogueExamples = [
  ['Default input example', 'input-default-desktop.png', 'input-default-320.png'],
  ['Explicit input ID', 'input-explicit-id-desktop.png', 'input-explicit-id-320.png'],
  ['Input sizes', 'input-sizes-desktop.png', 'input-sizes-320.png'],
  ['Input native states', 'input-states-desktop.png', 'input-states-320.png'],
  ['Native input types', 'input-types-desktop.png', 'input-types-320.png'],
  ['Signal Forms validation', 'input-validation-desktop.png', 'input-validation-320.png'],
] as const;

async function readInputFieldReferences(input: Locator): Promise<InputFieldReferenceState> {
  return input.evaluate((element) => {
    const nativeInput = element as HTMLInputElement;
    const hintId = nativeInput.id ? `${nativeInput.id}-hint` : null;
    const errorId = nativeInput.id ? `${nativeInput.id}-error` : null;

    return {
      inputId: nativeInput.id,
      hintId: hintId && document.getElementById(hintId) ? hintId : null,
      errorId: errorId && document.getElementById(errorId) ? errorId : null,
      describedBy: nativeInput.getAttribute('aria-describedby'),
    };
  });
}

async function waitForStableInputFieldReferences(
  input: Locator,
): Promise<InputFieldReferenceState> {
  let previousState = '';
  let stablePolls = 0;

  await expect
    .poll(
      async () => {
        const state = await readInputFieldReferences(input);
        const serializedState = JSON.stringify(state);
        stablePolls = serializedState === previousState ? stablePolls + 1 : 0;
        previousState = serializedState;

        return stablePolls >= 1;
      },
      { intervals: [50, 100, 250] },
    )
    .toBe(true);

  return readInputFieldReferences(input);
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/components/input');
  await expect(page.getByRole('heading', { level: 1, name: 'Input', exact: true })).toBeVisible();
});

test('server-renders and hydrates the default Input field association', async ({
  browser,
  page,
}) => {
  const routeUrl = new URL('/components/input', page.url()).toString();
  const serverContext = await browser.newContext({ javaScriptEnabled: false });

  try {
    const serverPage = await serverContext.newPage();
    const response = await serverPage.goto(routeUrl);

    expect(response?.status()).toBe(200);

    const defaultExample = serverPage.getByRole('group', {
      name: 'Default input example',
      exact: true,
    });
    const input = defaultExample.getByRole('textbox', { name: 'Project name' });
    await expect(input).toHaveAttribute('data-kui-size', 'md');
    await expect(input).not.toHaveAttribute('data-kui-invalid');
    await expect(input).not.toHaveAttribute('aria-invalid');
    await expect(input).toHaveAttribute('id', /kui-field-\d+/);
    expect(
      await input.evaluate((element) => (element as HTMLInputElement).labels?.[0]?.htmlFor),
    ).toBe(await input.getAttribute('id'));
    await expect(input).not.toHaveAttribute('aria-describedby', /.+/);
  } finally {
    await serverContext.close();
  }

  const runtimeErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  await page.reload();

  const hydratedInput = page
    .getByRole('group', { name: 'Default input example', exact: true })
    .getByRole('textbox', { name: 'Project name' });
  await expect(hydratedInput).toHaveAttribute('data-kui-size', 'md');
  expect(
    await hydratedInput.evaluate((element) => (element as HTMLInputElement).labels?.[0]?.htmlFor),
  ).toBe(await hydratedInput.getAttribute('id'));
  await expect(hydratedInput).not.toHaveAttribute('aria-describedby', /.+/);
  expect(runtimeErrors).toEqual([]);
});

test('shows the default, all four sizes, native states, and representative input types', async ({
  page,
}) => {
  const defaultExample = page.getByRole('group', {
    name: 'Default input example',
    exact: true,
  });
  const defaultInput = defaultExample.getByRole('textbox', { name: 'Project name' });
  await expect(defaultInput).toHaveAttribute('data-kui-size', 'md');
  await expect(defaultInput).not.toHaveAttribute('data-kui-invalid');
  await expect(defaultInput).not.toHaveAttribute('aria-invalid', 'true');

  const sizes = page.getByRole('group', { name: 'Input sizes', exact: true });
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
  const explicitSizeNames = ['Extra small', 'Small', 'Medium', 'Large'] as const;
  const explicitSizeHeights = await Promise.all(
    explicitSizeNames.map((name) =>
      sizes
        .getByRole('textbox', { name, exact: true })
        .evaluate((element) => Number.parseFloat(getComputedStyle(element).blockSize)),
    ),
  );
  expect(explicitSizeHeights).toEqual([28, 32, 40, 44]);
  expect(explicitSizeHeights).toEqual(
    [...explicitSizeHeights].sort((first, second) => first - second),
  );
  expect(new Set(explicitSizeHeights).size).toBe(explicitSizeNames.length);

  const fieldSize = sizes.getByRole('group', {
    name: 'Input size inheritance and precedence',
    exact: true,
  });
  const localXs = fieldSize.getByRole('textbox', { name: 'Local xs inside lg Field', exact: true });
  await expect(localXs).toHaveAttribute('data-kui-size', 'xs');
  const localXsHeight = await localXs.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).blockSize),
  );
  expect(localXsHeight).toBe(explicitSizeHeights[0]);

  const inheritedLg = fieldSize.getByRole('textbox', { name: 'Inherited from Field (lg)' });
  await expect(inheritedLg).toHaveAttribute('data-kui-size', 'lg');
  const inheritedLgHeight = await inheritedLg.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).blockSize),
  );
  expect(inheritedLgHeight).toBe(explicitSizeHeights[3]);

  const states = page.getByRole('group', { name: 'Input native states', exact: true });
  await expect(states.getByRole('textbox', { name: 'Interactive' })).toBeEnabled();
  const readOnly = states.getByRole('textbox', { name: 'Read-only' });
  await expect(readOnly).toHaveAttribute('readonly', '');
  await expect(readOnly).toBeEnabled();
  const readOnlyValue = await readOnly.inputValue();
  await readOnly.focus();
  await expect(readOnly).toBeFocused();
  await readOnly.pressSequentially('cannot change');
  await expect(readOnly).toHaveValue(readOnlyValue);
  await expect(states.getByRole('textbox', { name: 'Disabled' })).toBeDisabled();
  const invalid = states.getByRole('textbox', { name: 'Invalid' });
  await expect(invalid).toHaveAttribute('data-kui-invalid', '');
  await expect(invalid).toHaveAttribute('aria-invalid', 'true');

  const types = page.getByRole('group', { name: 'Native input types', exact: true });
  await expect(types.getByRole('textbox', { name: 'Text' })).toHaveJSProperty('type', 'text');
  await expect(types.getByRole('textbox', { name: 'Email' })).toHaveJSProperty('type', 'email');
  await expect(types.getByRole('searchbox', { name: 'Search' })).toHaveJSProperty('type', 'search');
  await expect(types.getByLabel('Password')).toHaveJSProperty('type', 'password');
});

test('loads the Input scope and switches its accessible names at runtime', async ({ page }) => {
  const localeResponse = await page.request.get('/i18n/input/ru.json');
  expect(localeResponse.ok()).toBeTruthy();
  const translations = await localeResponse.json();

  await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();

  await expect(
    page.getByRole('heading', { level: 1, name: translations.title, exact: true }),
  ).toBeVisible();
  const defaultGroup = page.getByRole('group', {
    name: translations.accessibility.defaultGroup,
    exact: true,
  });
  await expect(defaultGroup).toBeVisible();
  await expect(
    defaultGroup.getByRole('textbox', { name: translations.fields.projectName, exact: true }),
  ).toBeVisible();

  const validation = page.getByRole('group', {
    name: translations.accessibility.validationGroup,
    exact: true,
  });
  const email = validation.getByRole('textbox', {
    name: translations.fields.requiredEmail,
    exact: true,
  });
  await email.click();
  await email.press('Tab');
  await expect(validation.getByRole('alert')).toHaveText(translations.errors.required);
  await expect(email).toHaveAttribute('aria-invalid', 'true');
});

test('preserves the explicit id and its native label association', async ({ page }) => {
  const explicitId = page.getByRole('group', { name: 'Explicit input ID', exact: true });
  const input = explicitId.getByRole('textbox', { name: 'Explicit ID', exact: true });

  await expect(input).toHaveAttribute('id', 'explicit-input-id');
  expect(
    await input.evaluate((element) => (element as HTMLInputElement).labels?.[0]?.htmlFor),
  ).toBe('explicit-input-id');
});

test('captures real pointer hover and keyboard focus on a native input @visual', async ({
  page,
}) => {
  const states = page.getByRole('group', { name: 'Input native states', exact: true });
  const interactive = states.getByRole('textbox', { name: 'Interactive' });
  const restingBorder = await interactive.evaluate(
    (element) => getComputedStyle(element).borderTopColor,
  );

  await interactive.hover();
  expect(await interactive.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect
    .poll(() => interactive.evaluate((element) => getComputedStyle(element).borderTopColor))
    .not.toBe(restingBorder);
  await expect(states).toHaveScreenshot('input-hover.png', { animations: 'disabled' });

  await page.mouse.move(0, 0);
  const readonly = states.getByRole('textbox', { name: 'Read-only' });
  await readonly.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(interactive).toBeFocused();
  expect(await interactive.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect
    .poll(() => interactive.evaluate((element) => getComputedStyle(element).boxShadow))
    .not.toBe('none');
  await expect(states).toHaveScreenshot('input-keyboard-focused.png', {
    animations: 'disabled',
  });
});

test('moves a required Signal Forms input from untouched to invalid and corrected @visual', async ({
  page,
}) => {
  const validation = page.getByRole('group', { name: 'Signal Forms validation', exact: true });
  const email = validation.getByRole('textbox', { name: 'Required email' });
  const hint = validation.getByText('Required. Leave empty, then enter an email address.', {
    exact: true,
  });

  await expect(email).toHaveJSProperty('required', true);
  await expect(email).not.toHaveAttribute('aria-invalid', 'true');
  await expect(validation.getByRole('alert')).toHaveCount(0);
  expect(
    await email.evaluate((input) =>
      (input as HTMLInputElement).labels?.[0]?.querySelector('[aria-hidden="true"]'),
    ),
  ).not.toBeNull();

  await email.click();
  await email.press('Tab');

  await expect(email).toHaveAttribute('aria-invalid', 'true');
  const error = validation.getByRole('alert');
  await expect(error).toHaveText('Email is required.');
  const references = await waitForStableInputFieldReferences(email);

  if (!references.hintId) throw new Error('The required email hint is missing its hydrated id.');
  if (!references.errorId) throw new Error('The required email alert is missing its hydrated id.');

  expect(references.hintId).toMatch(/^kui-field-\d+-hint$/);
  expect(references.errorId).toMatch(/^kui-field-\d+-error$/);
  await expect(hint).toHaveAttribute('id', references.hintId);
  await expect(error).toHaveAttribute('id', references.errorId);
  expect(references.describedBy?.split(/\s+/)).toEqual([references.hintId, references.errorId]);
  await expect(email).toHaveAttribute(
    'aria-describedby',
    `${references.hintId} ${references.errorId}`,
  );
  await expect(validation).toHaveScreenshot('input-validation-invalid.png', {
    animations: 'disabled',
  });

  await email.fill('reader@example.com');
  await email.press('Tab');

  await expect(email).not.toHaveAttribute('aria-invalid', 'true');
  await expect(validation.getByRole('alert')).toHaveCount(0);
  await expect(email).toHaveAttribute('aria-describedby', references.hintId);
  await expect(email).not.toHaveAttribute('aria-describedby', /-error/);
  await expect(validation).toHaveScreenshot('input-validation-corrected.png', {
    animations: 'disabled',
  });
});

test('fits the Input catalogue without page overflow at desktop, tablet, and 320px', async ({
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

test('captures each Input catalogue group at desktop and 320px @visual', async ({ page }) => {
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
