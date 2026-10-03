import type { Locator, Page } from '@playwright/test';

import { expect, test } from './support/fixtures';
import { kuiMessage, loadKuiCatalogue } from './support/kui-catalogue';

const desktopViewport = { width: 1440, height: 1000 };
const mobileViewport = { width: 320, height: 844 };

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/components/color-input');
});

test('captures the minimally configured color input @visual', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default color input', exact: true });
  const input = example.locator('input[kuiColorInput]');

  await expect(page.getByRole('heading', { level: 1, name: 'Color Input' })).toBeVisible();
  await expect(input).toHaveJSProperty('type', 'text');
  await expect(input).toHaveValue('');
  await expect(input).toBeEnabled();
  await expect(input.locator('..')).toHaveAttribute('data-kui-size', 'md');
  await expect(example).toHaveScreenshot('color-input-default.png');
});

test('captures all supported input sizes @visual', async ({ page }) => {
  const sizes = page.getByRole('group', { name: 'Color input sizes', exact: true });

  const controls = sizes.locator('.kui-color-input');
  await expect(controls).toHaveCount(4);

  for (const [index, size] of ['xs', 'sm', 'md', 'lg'].entries()) {
    await expect(controls.nth(index)).toHaveAttribute('data-kui-size', size);
  }

  await expect(sizes).toHaveScreenshot('color-input-sizes.png', { animations: 'disabled' });
});

test('captures supported hex and OKLCH values @visual', async ({ page }) => {
  const values = page.getByRole('group', { name: 'Color input value formats', exact: true });

  const inputs = values.getByRole('textbox');
  await expect(inputs).toHaveCount(2);
  await expect(inputs.nth(0)).toHaveValue('#5b4fe0');
  await expect(inputs.nth(1)).toHaveValue('oklch(0.52 0.25 285)');
  await expect(values).toHaveScreenshot('color-input-values.png', { animations: 'disabled' });
});

test('captures disabled, read-only, and invalid field states @visual', async ({ page }) => {
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

test('keeps generated actions unavailable for disabled and read-only inputs', async ({ page }) => {
  const states = getGroup(page, 'Color input field states');
  const disabled = states.getByRole('textbox', { name: 'Disabled' });
  const readonly = states.getByRole('textbox', { name: 'Read-only' });

  await expect(disabled).toBeDisabled();
  await expect(
    disabled.locator('..').getByRole('button', { name: 'Choose color: #8b8b8b' }),
  ).toBeDisabled();
  await expect(disabled.locator('..').locator('.kui-color-input__trigger')).toBeDisabled();

  await expect(readonly).toHaveAttribute('readonly', '');
  await expect(
    readonly.locator('..').getByRole('button', { name: 'Choose color: #5b4fe0' }),
  ).toBeDisabled();
  await expect(readonly.locator('..').locator('.kui-color-input__trigger')).toBeHidden();
});

test('captures the color input focus state @visual', async ({ page }) => {
  const states = page.getByRole('group', { name: 'Color input field states', exact: true });
  const focusedInput = states.getByRole('textbox', { name: 'Focused' });

  await expect(page.getByRole('heading', { level: 1, name: 'Color Input' })).toBeVisible();
  await expect(states.locator('.kui-color-input')).toHaveCount(4);
  await focusedInput.click();
  await expect(focusedInput).toBeFocused();
  await expect(states).toHaveScreenshot('color-input-focused.png', { animations: 'disabled' });
});

test('captures the color input hover state @visual', async ({ page }) => {
  const states = page.getByRole('group', { name: 'Color input field states', exact: true });
  const input = states.getByRole('textbox', { name: 'Read-only' });

  await input.hover();
  expect(await input.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect(states).toHaveScreenshot('color-input-hover.png', { animations: 'disabled' });
});

test('captures keyboard focus on the color picker trigger @visual', async ({ page }) => {
  const values = page.getByRole('group', { name: 'Color input value formats', exact: true });
  const trigger = hexField(values).getByRole('button', { name: 'Choose color: #5b4fe0' });

  await trigger.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(trigger).toBeFocused();
  expect(await trigger.evaluate((button) => button.matches(':focus-visible'))).toBe(true);
  await page.mouse.move(0, 0);
  await expect(trigger.locator('..')).toHaveScreenshot('color-input-picker-trigger-focused.png', {
    animations: 'disabled',
  });
});

test('updates the swatch label when a text color value changes @visual', async ({ page }) => {
  const sizes = page.getByRole('group', { name: 'Color input sizes', exact: true });
  const input = sizes.getByRole('textbox', { name: 'Medium' });
  const swatch = getGeneratedSwatch(input);

  await expectBrowserEnhanced(input, 'Choose color: #5b4fe0');
  await input.fill('#27ae60');

  await expect(input).toHaveValue('#27ae60');
  await expect(swatch).toHaveAccessibleName('Choose color: #27ae60');
  await expect(sizes.getByRole('button', { name: 'Choose color: #27ae60' })).toHaveCount(1);
  await expect(sizes).toHaveScreenshot('color-input-edited-value.png', { animations: 'disabled' });
});

test('marks unsupported text invalid while preserving the last valid swatch @visual', async ({
  page,
}) => {
  const values = getGroup(page, 'Color input value formats');
  const input = hexField(values).getByRole('textbox');
  const swatch = getGeneratedSwatch(input);

  await expectBrowserEnhanced(input, 'Choose color: #5b4fe0');
  await input.fill('not-a-color');

  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(swatch).toHaveAccessibleName('Choose color: #5b4fe0');
  await input.blur();
  await expect(input).not.toBeFocused();
  await expect(values).toHaveScreenshot('color-input-parser-invalid.png', {
    animations: 'disabled',
  });
});

test('opens and captures the Kikita color picker popover @visual', async ({ page }) => {
  const values = getGroup(page, 'Color input value formats');

  await hexField(values).getByRole('button', { name: 'Choose color: #5b4fe0' }).click();

  const picker = page.getByRole('dialog');
  await expect(picker).toBeVisible();
  await expect(picker).toHaveScreenshot('color-input-picker.png', { animations: 'disabled' });

  await page.keyboard.press('Escape');
  await expect(picker).not.toBeVisible();
});

test('opens the picker from the chevron trigger', async ({ page }) => {
  const values = getGroup(page, 'Color input value formats');
  const trigger = hexField(values).locator('.kui-color-input__trigger');

  await trigger.click();

  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('changes the 2D lightness and chroma surface with the keyboard @visual', async ({ page }) => {
  const values = getGroup(page, 'Color input value formats');

  await hexField(values).getByRole('button', { name: 'Choose color: #5b4fe0' }).click();

  const picker = page.getByRole('slider', { name: 'Lightness and chroma', exact: true });
  const initialValue = await picker.getAttribute('aria-valuetext');

  await picker.press('ArrowUp');

  await expect(picker).toBeFocused();
  await expect(picker).not.toHaveAttribute('aria-valuetext', initialValue ?? '');
  await expect(picker).toHaveScreenshot('color-input-picker-keyboard.png', {
    animations: 'disabled',
  });
});

test('selects a shipped seed preset and commits a valid hex value @visual', async ({ page }) => {
  const values = getGroup(page, 'Color input value formats');
  const input = hexField(values).getByRole('textbox');

  await hexField(values).getByRole('button', { name: 'Choose color: #5b4fe0' }).click();
  const picker = page.getByRole('dialog');
  await picker.getByRole('button', { name: 'Neutral seed: #66635d', exact: true }).click();

  await expect(input).toHaveValue('#66635d');
  await expect(
    hexField(values).getByRole('button', { name: 'Choose color: #66635d' }),
  ).toBeVisible();
  await expect(picker).toHaveScreenshot('color-input-picker-preset.png', {
    animations: 'disabled',
  });

  const hexEditor = picker.locator('input.kui-color-input-hex');
  await hexEditor.fill('#27ae60');
  await hexEditor.press('Tab');

  await expect(input).toHaveValue('#27ae60');
  await expect(
    hexField(values).getByRole('button', { name: 'Choose color: #27ae60' }),
  ).toBeVisible();
  await expect(picker).toHaveScreenshot('color-input-picker-hex-committed.png', {
    animations: 'disabled',
  });
});

test('copies the currently selected hex value', async ({ page }) => {
  const values = getGroup(page, 'Color input value formats');
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

  await hexField(values).getByRole('button', { name: 'Choose color: #5b4fe0' }).click();
  const picker = page.getByRole('dialog');
  await picker.getByRole('button', { name: 'Copy value', exact: true }).click();

  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('#5b4fe0');
});

test('switches the page scope from English to Russian and back', async ({ page }) => {
  const kui = await loadKuiCatalogue(page, 'ru');
  const localeResponse = await page.request.get('/i18n/color-input/ru.json');
  expect(localeResponse.ok()).toBeTruthy();
  const russian = (await localeResponse.json()) as {
    title: string;
    accessibility: { valuesGroup: string };
    fields: { hexLabel: string; oklchLabel: string };
    actions: { swatch: string };
  };
  const shellLocaleResponse = await page.request.get('/i18n/ru.json');
  expect(shellLocaleResponse.ok()).toBeTruthy();
  const russianShell = (await shellLocaleResponse.json()) as {
    playground: { language: string };
  };

  await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(
    page.getByRole('heading', { level: 1, name: russian.title, exact: true }),
  ).toBeVisible();
  const russianValues = getGroup(page, russian.accessibility.valuesGroup);
  await expect(russianValues.getByRole('textbox', { name: russian.fields.hexLabel })).toBeVisible();
  await expect(
    russianValues.getByRole('textbox', { name: russian.fields.oklchLabel }),
  ).toBeVisible();
  await expect(
    russianValues.getByRole('button', { name: `${russian.actions.swatch}: #5b4fe0`, exact: true }),
  ).toBeVisible();
  await expect(hexField(russianValues).locator('.kui-color-input__trigger')).toHaveAccessibleName(
    kuiMessage(kui, 'colorInput', 'openPicker'),
  );

  await page.getByRole('button', { name: russianShell.playground.language, exact: true }).click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Color Input', exact: true }),
  ).toBeVisible();
  const englishValues = getGroup(page, 'Color input value formats');
  await expect(englishValues).toBeVisible();
  await expect(
    hexField(englishValues).getByRole('button', { name: 'Choose color: #5b4fe0', exact: true }),
  ).toBeVisible();
});

test('keeps all catalogue groups within a 320px viewport @visual', async ({ page }) => {
  const groups = [
    ['Default color input', 'color-input-default-320.png'],
    ['Color input sizes', 'color-input-sizes-320.png'],
    ['Color input value formats', 'color-input-values-320.png'],
    ['Color input field states', 'color-input-states-320.png'],
  ] as const;

  for (const [name, screenshot] of groups) {
    await captureMobile(page, getGroup(page, name), screenshot);
  }
});

/**
 * The value-format group holds a Hex field followed by an OKLCH field that show the same colour, so
 * their swatch buttons share an accessible name. The Hex field is always the first child.
 */
function hexField(values: Locator): Locator {
  return values.locator(':scope > kui-field:first-child');
}

function getGroup(page: Page, accessibleName: string): Locator {
  return page.getByRole('group', { name: accessibleName, exact: true });
}

/**
 * Returns the swatch button the directive generates next to a native input in the browser.
 * The server-rendered input has no swatch, so this resolves only after hydration and enhancement.
 */
function getGeneratedSwatch(input: Locator): Locator {
  return input.locator('..').locator('.kui-color-input__swatch');
}

/**
 * Waits until the server-rendered native input is hydrated and wrapped by the browser-only
 * picker controls, with the localized swatch name already applied. Typing before this point can
 * target the server markup while the directive moves the input into its wrapper, which drops
 * focus mid-fill and leaves the swatch label unsynchronized.
 */
async function expectBrowserEnhanced(input: Locator, swatchName: string): Promise<void> {
  await expect(input.locator('..')).toHaveClass(/\bkui-color-input\b/);
  await expect(getGeneratedSwatch(input)).toHaveAccessibleName(swatchName);
}

async function captureMobile(page: Page, group: Locator, screenshotName: string): Promise<void> {
  await page.setViewportSize(mobileViewport);
  await collapseMobileNavigation(page);
  await expectNoHorizontalOverflow(page);
  await group.scrollIntoViewIfNeeded();

  const bounds = await group.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds?.x).toBeGreaterThanOrEqual(0);
  expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(mobileViewport.width);
  await expect(group).toHaveScreenshot(screenshotName, { animations: 'disabled' });
}

async function collapseMobileNavigation(page: Page): Promise<void> {
  const navigation = page.getByRole('navigation', { name: 'Component navigation', exact: true });

  for (const category of ['Actions', 'Data and identity', 'Feedback', 'Surfaces']) {
    const toggle = navigation.getByRole('button', { name: category, exact: true });

    if ((await toggle.getAttribute('aria-expanded')) === 'true') await toggle.click();
  }

  const forms = navigation.getByRole('button', { name: 'Forms', exact: true });

  if ((await forms.getAttribute('aria-expanded')) === 'false') await forms.click();

  await forms.scrollIntoViewIfNeeded();
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
}
