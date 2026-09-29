import type { Locator, Page } from '@playwright/test';

import { expect, test } from '../../../tests/e2e/support/fixtures';

const catalogueExamples = [
  [
    'Default Number Input example',
    'number-input-default-desktop.png',
    'number-input-default-320.png',
  ],
  ['Number Input variants', 'number-input-variants-desktop.png', 'number-input-variants-320.png'],
  ['Number Input sizes', 'number-input-sizes-desktop.png', 'number-input-sizes-320.png'],
  ['Number Input states', 'number-input-states-desktop.png', 'number-input-states-320.png'],
  [
    'Number Input Signal Forms validation',
    'number-input-validation-desktop.png',
    'number-input-validation-320.png',
  ],
  [
    'Number Input explicit id and local invalid state',
    'number-input-explicit-id-desktop.png',
    'number-input-explicit-id-320.png',
  ],
] as const;

const runtimeErrorsByPage = new WeakMap<Page, string[]>();

async function expectFieldErrorAssociation(
  input: Locator,
  error: Locator,
  message: string,
): Promise<void> {
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(error).toHaveText(message);

  const errorId = await error.getAttribute('id');
  if (!errorId) throw new Error('The rendered Field error should have an id.');

  const describedByIds = (await input.getAttribute('aria-describedby'))?.split(/\s+/) ?? [];
  expect(describedByIds).toContain(errorId);
  await expectValidDescribedBy(input);
}

async function expectValidDescribedBy(input: Locator): Promise<void> {
  expect(
    await input.evaluate((element) => {
      const ids = element.getAttribute('aria-describedby')?.split(/\s+/) ?? [];
      return ids.length > 0 && ids.every((id) => Boolean(document.getElementById(id)));
    }),
  ).toBe(true);
}

test.beforeEach(async ({ page }) => {
  const runtimeErrors: string[] = [];
  runtimeErrorsByPage.set(page, runtimeErrors);
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/components/number-input');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Number Input', exact: true }),
  ).toBeVisible();
});

test('server-renders the native input and hydrates its Number Input wrapper', async ({
  browser,
  page,
}) => {
  const routeUrl = new URL('/components/number-input', page.url()).toString();
  const serverContext = await browser.newContext({ javaScriptEnabled: false });

  try {
    const serverPage = await serverContext.newPage();
    const response = await serverPage.goto(routeUrl);

    expect(response?.status()).toBe(200);

    const serverDefault = serverPage.getByRole('group', {
      name: 'Default Number Input example',
      exact: true,
    });
    const serverInput = serverDefault.getByRole('spinbutton', { name: 'Quantity' });
    await expect(serverDefault.locator('.kui-number-input')).toHaveCount(0);
    await expect(serverDefault.getByRole('button', { name: 'Increase value' })).toHaveCount(0);
    await expect(serverInput).toHaveAttribute('id', /kui-field-\d+/);
    await expect(serverInput).toHaveAttribute('aria-describedby', /kui-field-\d+-hint/);
    expect(
      await serverInput.evaluate((element) => {
        const ids = element.getAttribute('aria-describedby')?.split(/\s+/) ?? [];
        return ids.length > 0 && ids.every((id) => Boolean(document.getElementById(id)));
      }),
    ).toBe(true);
    expect(
      await serverInput.evaluate((element) => (element as HTMLInputElement).labels?.[0]?.htmlFor),
    ).toBe(await serverInput.getAttribute('id'));
  } finally {
    await serverContext.close();
  }

  const defaultExample = page.getByRole('group', {
    name: 'Default Number Input example',
    exact: true,
  });
  const input = defaultExample.getByRole('spinbutton', { name: 'Quantity' });
  const wrapper = defaultExample.locator('.kui-number-input');

  await expect(wrapper).toHaveCount(1);
  await expect(wrapper.getByRole('button', { name: 'Decrease value' })).toHaveCount(1);
  await expect(wrapper.getByRole('button', { name: 'Increase value' })).toHaveCount(1);
  await expect(wrapper).toHaveAttribute('data-kui-size', 'md');
  await expect(input).toHaveAttribute('aria-describedby', /kui-field-\d+-hint/);
  expect(
    await input.evaluate((element) => (element as HTMLInputElement).labels?.[0]?.htmlFor),
  ).toBe(await input.getAttribute('id'));
  expect(runtimeErrorsByPage.get(page)).toEqual([]);
});

test('shows both layouts, supported sizes, and local size precedence over Field', async ({
  page,
}) => {
  const variants = page.getByRole('group', { name: 'Number Input variants', exact: true });
  const splitInput = variants.getByRole('spinbutton', { name: 'Split layout' });
  const stackedInput = variants.getByRole('spinbutton', { name: 'Stacked layout' });
  await expect(splitInput.locator('xpath=..')).not.toHaveClass(/kui-number-input--stacked/);
  await expect(stackedInput.locator('xpath=..')).toHaveClass(/kui-number-input--stacked/);
  await expect(variants.getByRole('button', { name: 'Increase value' })).toHaveCount(2);
  await expect(variants.getByRole('button', { name: 'Decrease value' })).toHaveCount(2);

  const sizes = page.getByRole('group', { name: 'Number Input sizes', exact: true });
  const sizeCases = [
    ['Extra small (md appearance)', 'xs'],
    ['Small', 'sm'],
    ['Medium', 'md'],
    ['Large', 'lg'],
    ['Large inherited from Field', 'lg'],
    ['Small overrides large Field', 'sm'],
  ] as const;

  for (const [label, size] of sizeCases) {
    await expect(
      sizes.getByRole('spinbutton', { name: label, exact: true }).locator('xpath=..'),
    ).toHaveAttribute('data-kui-size', size);
  }

  const localSizeOverride = sizes.getByRole('spinbutton', {
    name: 'Small overrides large Field',
    exact: true,
  });
  await expect(localSizeOverride.locator('xpath=ancestor::kui-field')).toHaveAttribute(
    'data-kui-size',
    'lg',
  );

  const xsHeight = await sizes
    .getByRole('spinbutton', { name: 'Extra small (md appearance)' })
    .locator('xpath=..')
    .evaluate((element) => (element as HTMLElement).offsetHeight);
  const xsIconSize = await sizes
    .getByRole('spinbutton', { name: 'Extra small (md appearance)' })
    .locator('xpath=..')
    .getByRole('button', { name: 'Increase value' })
    .evaluate((element) => getComputedStyle(element).fontSize);
  const mdHeight = await sizes
    .getByRole('spinbutton', { name: 'Medium' })
    .locator('xpath=..')
    .evaluate((element) => (element as HTMLElement).offsetHeight);
  const mdIconSize = await sizes
    .getByRole('spinbutton', { name: 'Medium' })
    .locator('xpath=..')
    .getByRole('button', { name: 'Increase value' })
    .evaluate((element) => getComputedStyle(element).fontSize);
  expect(xsHeight).toBe(mdHeight);
  expect(xsIconSize).toBe(mdIconSize);
});

test('enforces native bounds, step size, disabled, read-only, and explicit invalid state', async ({
  page,
}) => {
  const states = page.getByRole('group', { name: 'Number Input states', exact: true });

  const atMinimum = states.getByRole('spinbutton', { name: 'At minimum' });
  await expect(atMinimum).toHaveValue('0');
  await expect(
    atMinimum.locator('xpath=..').getByRole('button', { name: 'Decrease value' }),
  ).toBeDisabled();

  const atMaximum = states.getByRole('spinbutton', { name: 'At maximum' });
  await expect(
    atMaximum.locator('xpath=..').getByRole('button', { name: 'Increase value' }),
  ).toBeDisabled();

  const stepFive = states.getByRole('spinbutton', { name: 'Step by 5' });
  await stepFive.locator('xpath=..').getByRole('button', { name: 'Increase value' }).click();
  await expect(stepFive).toHaveValue('15');
  await stepFive.locator('xpath=..').getByRole('button', { name: 'Decrease value' }).click();
  await expect(stepFive).toHaveValue('10');

  const disabled = states.getByRole('spinbutton', { name: 'Disabled' });
  await expect(disabled).toBeDisabled();
  await expect(disabled.locator('xpath=..')).toHaveAttribute('data-kui-disabled', '');
  await expect(
    disabled.locator('xpath=..').getByRole('button', { name: 'Increase value' }),
  ).toBeDisabled();
  await disabled.focus();
  await expect(disabled).not.toBeFocused();

  const readOnly = states.getByRole('spinbutton', { name: 'Read-only' });
  await expect(readOnly).toHaveAttribute('readonly', '');
  await expect(readOnly.locator('xpath=..')).toHaveAttribute('data-kui-readonly', '');
  await expect(
    readOnly.locator('xpath=..').getByRole('button', { name: 'Increase value' }),
  ).toBeDisabled();
  await readOnly.focus();
  await expect(readOnly).toBeFocused();
  await readOnly.press('ArrowUp');
  await expect(readOnly).toHaveValue('4');

  const invalid = states.getByRole('spinbutton', { name: 'Explicitly invalid' });
  await expect(invalid).toHaveAttribute('aria-invalid', 'true');
  await expect(invalid).toHaveAttribute('aria-describedby', /kui-field-\d+-hint/);
  await expect(invalid).toHaveAttribute('aria-describedby', /kui-field-\d+-error/);
});

test('uses native keyboard stepping and keyboard-operable generated buttons', async ({ page }) => {
  const defaultExample = page.getByRole('group', {
    name: 'Default Number Input example',
    exact: true,
  });
  const input = defaultExample.getByRole('spinbutton', { name: 'Quantity' });
  const wrapper = defaultExample.locator('.kui-number-input');
  const increase = wrapper.getByRole('button', { name: 'Increase value' });

  await increase.click();
  await expect(input).toHaveValue('1');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('2');
  await input.press('ArrowDown');
  await expect(input).toHaveValue('1');

  const bounded = page
    .getByRole('group', { name: 'Number Input states', exact: true })
    .getByRole('spinbutton', { name: 'Bounded from 0 to 10' });
  await bounded.fill('4');
  await bounded.press('ArrowUp');
  await expect(bounded).toHaveValue('5');
  await bounded.press('ArrowDown');
  await expect(bounded).toHaveValue('4');
  await bounded.fill('4');
  const boundedIncrease = bounded.locator('xpath=..').getByRole('button', {
    name: 'Increase value',
  });
  await boundedIncrease.focus();
  await boundedIncrease.press('Enter');
  await expect(bounded).toHaveValue('5');
  await boundedIncrease.press('Space');
  await expect(bounded).toHaveValue('6');
});

test('repeats generated-button stepping after the hold delay and stops on release', async ({
  page,
}) => {
  const defaultExample = page.getByRole('group', {
    name: 'Default Number Input example',
    exact: true,
  });
  const input = defaultExample.getByRole('spinbutton', { name: 'Quantity' });
  const increase = defaultExample
    .locator('.kui-number-input')
    .getByRole('button', { name: 'Increase value' });

  await page.clock.install();
  await increase.hover();
  await page.mouse.down();
  await expect(input).toHaveValue('1');

  await page.clock.runFor(399);
  await expect(input).toHaveValue('1');
  await page.clock.runFor(1);
  await page.clock.runFor(240);
  await expect(input).toHaveValue('4');

  await page.mouse.up();
  await page.clock.runFor(160);
  await expect(input).toHaveValue('4');
});

test('captures real stepper hover and keyboard focus states @visual', async ({ page }) => {
  const defaultExample = page.getByRole('group', {
    name: 'Default Number Input example',
    exact: true,
  });
  const input = defaultExample.getByRole('spinbutton', { name: 'Quantity' });
  const wrapper = defaultExample.locator('.kui-number-input');
  const increase = wrapper.getByRole('button', { name: 'Increase value' });

  await increase.hover();
  expect(await increase.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect(defaultExample).toHaveScreenshot('number-input-stepper-hover.png', {
    animations: 'disabled',
  });

  await page.mouse.move(0, 0);
  await input.focus();
  await page.keyboard.press('Tab');
  await expect(increase).toBeFocused();
  expect(await increase.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(defaultExample).toHaveScreenshot('number-input-stepper-keyboard-focused.png', {
    animations: 'disabled',
  });
});

test('captures the real pressed state for split and stacked steppers @visual', async ({ page }) => {
  const variants = page.getByRole('group', { name: 'Number Input variants', exact: true });
  const examples = [
    {
      inputName: 'Split layout',
      screenshots: [
        'number-input-split-stepper-pressed-desktop.png',
        'number-input-split-stepper-pressed-320.png',
      ],
    },
    {
      inputName: 'Stacked layout',
      screenshots: [
        'number-input-stacked-stepper-pressed-desktop.png',
        'number-input-stacked-stepper-pressed-320.png',
      ],
    },
  ] as const;

  for (const [viewport, screenshotIndex] of [
    [{ width: 1440, height: 1000 }, 0],
    [{ width: 320, height: 844 }, 1],
  ] as const) {
    await page.setViewportSize(viewport);

    for (const example of examples) {
      const input = variants.getByRole('spinbutton', { name: example.inputName, exact: true });
      const numberInput = input.locator('xpath=..');
      const increase = numberInput.getByRole('button', { name: 'Increase value', exact: true });

      await input.fill('4');
      await increase.hover();
      await page.mouse.down();
      expect(await increase.evaluate((element) => element.matches(':active'))).toBe(true);
      await expect(numberInput).toHaveScreenshot(example.screenshots[screenshotIndex], {
        animations: 'disabled',
      });
      await page.mouse.up();
    }
  }
});

test('moves Signal Forms validation from untouched through bounds to corrected @visual', async ({
  page,
}) => {
  const validation = page.getByRole('group', {
    name: 'Number Input Signal Forms validation',
    exact: true,
  });
  const quantity = validation.getByRole('spinbutton', { name: 'Validated quantity' });

  await expect(quantity).toHaveValue('0');
  await expect(quantity).toHaveAttribute('required', '');
  expect(
    await quantity.evaluate(
      (input) => input.labels?.[0]?.querySelector('[aria-hidden="true"]') != null,
    ),
  ).toBe(true);
  await expect(quantity).not.toHaveAttribute('aria-invalid', 'true');
  await expect(validation.getByRole('alert')).toHaveCount(0);
  await expect(quantity).toHaveAttribute('aria-describedby', /kui-field-\d+-hint/);
  await expect(quantity).not.toHaveAttribute('aria-describedby', /-error/);
  await expect(validation).toHaveScreenshot('number-input-validation-untouched.png', {
    animations: 'disabled',
  });

  await quantity.focus();
  await quantity.blur();
  const minimumError = validation.getByRole('alert');
  await expectFieldErrorAssociation(quantity, minimumError, 'Enter at least 1.');
  await expect(validation).toHaveScreenshot('number-input-validation-minimum-error.png', {
    animations: 'disabled',
  });

  await quantity.locator('xpath=..').getByRole('button', { name: 'Increase value' }).click();
  await expect(quantity).toHaveValue('1');
  await expect(quantity).not.toHaveAttribute('aria-invalid', 'true');
  await expect(validation.getByRole('alert')).toHaveCount(0);

  await quantity.fill('');
  await quantity.blur();
  const requiredError = validation.getByRole('alert');
  await expectFieldErrorAssociation(quantity, requiredError, 'Enter a quantity.');
  await expect(validation).toHaveScreenshot('number-input-validation-required-error.png', {
    animations: 'disabled',
  });

  await quantity.fill('11');
  await quantity.blur();
  const maximumError = validation.getByRole('alert');
  await expectFieldErrorAssociation(quantity, maximumError, 'Enter no more than 10.');
  await expect(validation).toHaveScreenshot('number-input-validation-maximum-error.png', {
    animations: 'disabled',
  });

  await quantity.fill('5');
  await quantity.blur();
  await expect(quantity).not.toHaveAttribute('aria-invalid', 'true');
  await expect(validation.getByRole('alert')).toHaveCount(0);
  await expect(quantity).toHaveAttribute('aria-describedby', /kui-field-\d+-hint/);
  await expect(quantity).not.toHaveAttribute('aria-describedby', /-error/);
  await expectValidDescribedBy(quantity);
  await expect(validation).toHaveScreenshot('number-input-validation-corrected.png', {
    animations: 'disabled',
  });
});

test('loads the Number Input scope and keeps generated stepper names English', async ({ page }) => {
  const localeResponse = await page.request.get('/i18n/number-input/ru.json');
  expect(localeResponse.ok()).toBeTruthy();
  const translations = await localeResponse.json();

  await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();

  await expect(
    page.getByRole('heading', { level: 1, name: translations.title, exact: true }),
  ).toBeVisible();
  const defaultExample = page.getByRole('group', {
    name: translations.accessibility.default,
    exact: true,
  });
  await expect(
    defaultExample.getByRole('spinbutton', { name: translations.fields.quantity }),
  ).toBeVisible();
  await expect(defaultExample.getByRole('button', { name: 'Increase value' })).toBeVisible();

  const validation = page.getByRole('group', {
    name: translations.accessibility.validation,
    exact: true,
  });
  const quantity = validation.getByRole('spinbutton', {
    name: translations.fields.validatedQuantity,
  });
  await quantity.focus();
  await quantity.blur();
  await expect(validation.getByRole('alert')).toHaveText(translations.errors.minimum);
});

test('preserves the explicit id and matching native label', async ({ page }) => {
  const explicitId = page.getByRole('group', {
    name: 'Number Input explicit id and local invalid state',
    exact: true,
  });
  const input = explicitId.getByRole('spinbutton', {
    name: 'Quantity with explicit id (invalid)',
    exact: true,
  });

  await expect(input).toHaveAttribute('id', 'explicit-number-input-id');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).not.toHaveAttribute('aria-describedby', /.+/);
  expect(
    await input.evaluate((element) => (element as HTMLInputElement).labels?.[0]?.htmlFor),
  ).toBe('explicit-number-input-id');
});

test('fits the Number Input catalogue at desktop, tablet, and 320px', async ({ page }) => {
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

test('keeps the complete state grid within the 320px workspace', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });

  const states = page.getByRole('group', { name: 'Number Input states', exact: true });
  const workspace = page.locator('.playground-shell__workspace');
  const statesHeight = await states.evaluate((element) => element.getBoundingClientRect().height);
  const workspaceHeight = await workspace.evaluate((element) => element.clientHeight);

  expect(statesHeight).toBeLessThanOrEqual(workspaceHeight);
});

test('captures each Number Input catalogue group at desktop and 320px @visual', async ({
  page,
}) => {
  for (const [name, desktopScreenshot] of catalogueExamples) {
    await expect(page.getByRole('group', { name, exact: true })).toHaveScreenshot(
      desktopScreenshot,
      { animations: 'disabled' },
    );
  }

  for (const [name, , mobileScreenshot] of catalogueExamples) {
    // The sizes catalogue has six stacked examples, so give its 320px capture
    // enough viewport height to include the final Field precedence example.
    await page.setViewportSize({ width: 320, height: name === 'Number Input sizes' ? 1200 : 844 });
    await expect(page.getByRole('group', { name, exact: true })).toHaveScreenshot(
      mobileScreenshot,
      { animations: 'disabled' },
    );
  }
});
