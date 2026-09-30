import type { Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

import { expect, test } from './support/fixtures';
import { settleAnimations } from './support/page-ready';

const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

async function getAxeViolations(page: Page, excludeEmptyOverlayMount = false): Promise<unknown[]> {
  await page.addScriptTag({ content: axeSource });

  return page.evaluate(async (excludeMount) => {
    const context = excludeMount ? { exclude: ['.cdk-overlay-container'] } : document;
    const result = await window.axe.run(context as unknown as Document, {
      resultTypes: ['violations'],
    });

    return result.violations;
  }, excludeEmptyOverlayMount);
}

async function waitForStableDarkTheme(page: Page): Promise<void> {
  const root = page.locator('html');

  await expect(root).toHaveAttribute('data-kui-theme', 'dark');
  await expect(page.locator('#playground-theme')).toHaveCount(1);
  await expect
    .poll(() => page.locator('#playground-theme').textContent())
    .toContain('--kui-color-primary-soft-text: var(--kui-primary-4);');
  await expect
    .poll(() => page.locator('#playground-theme').textContent())
    .toContain('--kui-color-primary-soft-bg: var(--kui-primary-11);');
  await expect
    .poll(() =>
      root.evaluate((element) => {
        const styles = getComputedStyle(element);
        const selectedText = styles.getPropertyValue('--kui-color-primary-soft-text').trim();
        const selectedBackground = styles.getPropertyValue('--kui-color-primary-soft-bg').trim();

        return {
          selectedTextReady:
            selectedText !== '' &&
            selectedText === styles.getPropertyValue('--kui-primary-4').trim(),
          selectedBackgroundReady:
            selectedBackground !== '' &&
            selectedBackground === styles.getPropertyValue('--kui-primary-11').trim(),
        };
      }),
    )
    .toEqual({ selectedTextReady: true, selectedBackgroundReady: true });
}

declare global {
  interface Window {
    axe: {
      run: (
        context: Document,
        options: unknown,
      ) => Promise<{
        violations: unknown[];
      }>;
    };
  }
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('/components/select');
  await expect(page.getByRole('heading', { name: 'Select', level: 1 })).toBeVisible();
});

test('captures the Select catalogue groups @visual', async ({ page }) => {
  const groups = [
    {
      name: 'Default select example',
      desktop: 'select-default.png',
      tablet: 'select-default-768.png',
      mobile: 'select-default-320.png',
    },
    {
      name: 'Select with an explicit id',
      desktop: 'select-explicit-id.png',
      tablet: 'select-explicit-id-768.png',
      mobile: 'select-explicit-id-320.png',
    },
    {
      name: 'Select sizes',
      desktop: 'select-sizes.png',
      tablet: 'select-sizes-768.png',
      mobile: 'select-sizes-320.png',
    },
    {
      name: 'Select value and multiple-selection modes',
      desktop: 'select-modes.png',
      tablet: 'select-modes-768.png',
      mobile: 'select-modes-320.png',
    },
    {
      name: 'Select provider defaults',
      desktop: 'select-provider-defaults.png',
      tablet: 'select-provider-defaults-768.png',
      mobile: 'select-provider-defaults-320.png',
    },
    {
      name: 'Select Field provider fallback',
      desktop: 'select-field-defaults.png',
      tablet: 'select-field-defaults-768.png',
      mobile: 'select-field-defaults-320.png',
    },
    {
      name: 'Select states',
      desktop: 'select-states.png',
      tablet: 'select-states-768.png',
      mobile: 'select-states-320.png',
    },
    {
      name: 'Keyboard interaction example',
      desktop: 'select-keyboard.png',
      tablet: 'select-keyboard-768.png',
      mobile: 'select-keyboard-320.png',
    },
    {
      name: 'Required select validation example',
      desktop: 'select-validation.png',
      tablet: 'select-validation-768.png',
      mobile: 'select-validation-320.png',
    },
  ];

  for (const group of groups) {
    await expect(page.getByRole('group', { name: group.name, exact: true })).toHaveScreenshot(
      group.desktop,
      { animations: 'disabled' },
    );
  }

  await page.setViewportSize({ width: 768, height: 1024 });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);

  for (const group of groups) {
    await expect(page.getByRole('group', { name: group.name, exact: true })).toHaveScreenshot(
      group.tablet,
      { animations: 'disabled' },
    );
  }

  await page.setViewportSize({ width: 320, height: 844 });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);

  for (const group of groups) {
    await expect(page.getByRole('group', { name: group.name, exact: true })).toHaveScreenshot(
      group.mobile,
      { animations: 'disabled' },
    );
  }
});

test('server-renders and hydrates the Select page without browser errors', async ({ page }) => {
  const response = await page.request.get('/components/select');

  expect(response.ok()).toBe(true);

  const serverMarkup = await response.text();
  expect(serverMarkup).toContain('Select');
  expect(serverMarkup).toContain('Default select example');
  expect(serverMarkup).toContain('Choose a role');

  const browserErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });
  page.on('pageerror', (error) => browserErrors.push(error.message));

  await page.goto('/components/select');
  await expect(page.getByRole('heading', { name: 'Select', level: 1 })).toBeVisible();
  await expect(
    page
      .getByRole('group', { name: 'Default select example', exact: true })
      .getByRole('combobox', { name: 'Role', exact: true }),
  ).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test('checks Select accessibility and records the CDK overlay landmark boundary', async ({
  page,
}) => {
  await waitForStableDarkTheme(page);

  const overlayContainer = page.locator('.cdk-overlay-container');
  const overlayMountExists = (await overlayContainer.count()) > 0;
  if (overlayMountExists) await expect(overlayContainer).toBeEmpty();

  const closedViolations = await getAxeViolations(page, overlayMountExists);
  expect(closedViolations).toEqual([]);

  const modes = page.getByRole('group', {
    name: 'Select value and multiple-selection modes',
    exact: true,
  });
  const input = modes.getByRole('combobox', { name: 'Default chip limit', exact: true });
  await input.focus();
  await input.press('ArrowDown');
  await expect(page.getByRole('listbox')).toBeVisible();
  await waitForStableDarkTheme(page);
  await expect(page.locator('.cdk-overlay-container .kui-dropdown')).toHaveCSS('opacity', '1');

  const openViolations = await getAxeViolations(page);
  expect(openViolations).toHaveLength(1);
  expect(openViolations[0]).toMatchObject({
    id: 'region',
    nodes: [{ target: ['.cdk-overlay-container'] }],
  });
});

test('opens the minimal Select with the keyboard and selects an option @visual', async ({
  page,
}) => {
  const example = page.getByRole('group', { name: 'Default select example', exact: true });
  const input = example.getByRole('combobox', { name: 'Role', exact: true });
  await expect(input).toHaveAttribute('aria-haspopup', 'listbox');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(input).toHaveAttribute('placeholder', 'Choose a role');
  await expect(input).toHaveValue('');
  await expect(example.getByRole('button', { name: 'Clear', exact: true })).toHaveCount(0);

  await input.focus();
  await input.press('ArrowDown');

  const listbox = page.getByRole('listbox');
  const designer = listbox.getByRole('option', { name: 'Designer', exact: true });
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await expect(listbox).toBeVisible();
  const listboxId = await input.getAttribute('aria-controls');
  expect(listboxId).toBeTruthy();
  await expect(listbox).toHaveAttribute('id', listboxId ?? '');
  await expect(designer).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(input).toHaveValue('designer');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(input).not.toHaveAttribute('aria-controls');
  await expect(example.getByRole('status')).toHaveText('Selected value: Designer');
  await expect(input).toBeFocused();
  await expect(example).toHaveScreenshot('select-default-selected.png', {
    animations: 'disabled',
  });
});

test('connects the explicit Select id to its native label', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Select with an explicit id', exact: true });
  const label = example.getByText('Explicit select id', { exact: true });
  const input = example.getByRole('combobox', { name: 'Explicit select id', exact: true });

  await expect(label).toHaveAttribute('for', 'select-explicit-id');
  await expect(input).toHaveAttribute('id', 'select-explicit-id');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
});

test('applies each supported Select field size', async ({ page }) => {
  const examples = page.getByRole('group', { name: 'Select sizes', exact: true });

  for (const { label, size, blockSize } of [
    { label: 'Extra small', size: 'xs', blockSize: 28 },
    { label: 'Small', size: 'sm', blockSize: 32 },
    { label: 'Medium', size: 'md', blockSize: 40 },
    { label: 'Large', size: 'lg', blockSize: 44 },
  ]) {
    const input = examples.getByRole('combobox', { name: label, exact: true });
    const field = input.locator('xpath=ancestor::kui-field[1]');
    await expect(field).toHaveAttribute('data-kui-size', size);
    expect(
      await input.evaluate((element) => Number.parseFloat(getComputedStyle(element).blockSize)),
    ).toBe(blockSize);
  }
});

test('supports pointer opening and selection', async ({ page }) => {
  const input = page
    .getByRole('group', { name: 'Default select example', exact: true })
    .getByRole('combobox', { name: 'Role', exact: true });
  await input.click();

  const listbox = page.getByRole('listbox');
  await expect(listbox).toBeVisible();
  await listbox.getByRole('option', { name: 'Engineer', exact: true }).click();

  await expect(input).toHaveValue('engineer');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
});

test('captures a real hovered Select option @visual', async ({ page }) => {
  const input = page
    .getByRole('group', { name: 'Default select example', exact: true })
    .getByRole('combobox', { name: 'Role', exact: true });
  await input.focus();
  await input.press('ArrowDown');

  const listbox = page.getByRole('listbox');
  const option = listbox.getByRole('option', { name: 'Engineer', exact: true });
  await option.hover();
  expect(await option.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect(listbox).toHaveScreenshot('select-option-hovered.png', { animations: 'disabled' });
});

test('skips disabled options during keyboard navigation', async ({ page }) => {
  const input = page
    .getByRole('group', { name: 'Keyboard interaction example', exact: true })
    .getByRole('combobox', { name: 'Keyboard navigation', exact: true });
  await input.focus();
  await input.press('ArrowDown');

  const listbox = page.getByRole('listbox');
  const designer = listbox.getByRole('option', { name: 'Designer', exact: true });
  const researcher = listbox.getByRole('option', { name: 'Researcher', exact: true });
  const manager = listbox.getByRole('option', { name: 'Manager', exact: true });
  await expect(designer).toBeFocused();
  await expect(designer).toHaveAttribute('aria-selected', 'false');
  await expect(manager).toHaveAttribute('aria-disabled', 'true');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(researcher).toBeFocused();
  await expect(manager).not.toBeFocused();

  await page.keyboard.press('Enter');
  await expect(input).toHaveValue('researcher');
  await expect(researcher).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('listbox')).toBeHidden();
});

test('opens at the last enabled option with ArrowUp and closes with Escape', async ({ page }) => {
  const input = page
    .getByRole('group', { name: 'Default select example', exact: true })
    .getByRole('combobox', { name: 'Role', exact: true });
  await input.focus();
  await input.press('ArrowUp');

  const listbox = page.getByRole('listbox');
  await expect(listbox.getByRole('option', { name: 'Manager', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(input).not.toHaveAttribute('aria-controls');
});

test('ignores a click on a disabled option, commits an enabled one and restores focus on Escape', async ({
  page,
}) => {
  const input = page
    .getByRole('group', { name: 'Keyboard interaction example', exact: true })
    .getByRole('combobox', { name: 'Keyboard navigation', exact: true });
  const listbox = page.getByRole('listbox');

  await input.click();
  await expect(listbox).toBeVisible();

  // `force` skips the stability check, so let the open animation finish before clicking.
  await settleAnimations(page);
  await listbox.getByRole('option', { name: 'Manager', exact: true }).click({ force: true });
  await expect(input).toHaveValue('');
  await expect(listbox).toBeVisible();

  await listbox.getByRole('option', { name: 'Researcher', exact: true }).click();
  await expect(listbox).toBeHidden();
  await expect(input).toHaveValue('researcher');

  await input.click();
  await expect(listbox).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(listbox).toBeHidden();
  await expect(input).toBeFocused();
});

test('commits the focused option with Enter and keeps focus on the input', async ({ page }) => {
  const input = page
    .getByRole('group', { name: 'Keyboard interaction example', exact: true })
    .getByRole('combobox', { name: 'Keyboard navigation', exact: true });
  const listbox = page.getByRole('listbox');

  await input.focus();
  await input.press('ArrowDown');
  await expect(listbox.getByRole('option', { name: 'Designer', exact: true })).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(listbox).toBeHidden();
  await expect(input).toHaveValue('designer');
  await expect(input).toBeFocused();
});

test('opens with Space and selects with a second Space', async ({ page }) => {
  const input = page
    .getByRole('group', { name: 'Default select example', exact: true })
    .getByRole('combobox', { name: 'Role', exact: true });
  await input.focus();
  await input.press('Space');

  const listbox = page.getByRole('listbox');
  const designer = listbox.getByRole('option', { name: 'Designer', exact: true });
  await expect(designer).toBeFocused();
  await page.keyboard.press('Space');

  await expect(input).toHaveValue('designer');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
});

test('closes the Select through the option Tab flow', async ({ page }) => {
  const input = page
    .getByRole('group', { name: 'Default select example', exact: true })
    .getByRole('combobox', { name: 'Role', exact: true });
  await input.focus();
  await input.press('ArrowDown');
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
});

test('keeps a multiple Select open while toggling values and clears them @visual', async ({
  page,
}) => {
  const example = page.getByRole('group', {
    name: 'Select value and multiple-selection modes',
    exact: true,
  });
  const defaultChipLimit = example.getByRole('combobox', { name: 'Default chip limit' });
  await expect(defaultChipLimit).toHaveValue('Owner, Editor, Reviewer, Viewer');
  await expect(
    defaultChipLimit.locator('xpath=ancestor::kui-field[1]').getByText('+1', { exact: true }),
  ).toBeVisible();
  const customLimit = example.getByRole('combobox', { name: 'Multiple values as chips' });
  await expect(customLimit).toHaveValue('Owner, Editor, Reviewer');
  await expect(
    customLimit.locator('xpath=ancestor::kui-field[1]').getByText('+1', { exact: true }),
  ).toBeVisible();
  await expect(example.getByRole('combobox', { name: 'Multiple values as text' })).toHaveValue(
    'Editor · Viewer',
  );

  const input = customLimit;
  await input.focus();
  await input.press('ArrowDown');
  const listbox = page.getByRole('listbox');
  await expect(listbox.getByRole('option', { name: 'Owner', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(listbox.getByRole('option', { name: 'Viewer', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await expect(input).toHaveValue('Owner, Editor, Reviewer, Viewer');
  await expect(listbox.getByRole('option', { name: 'Viewer', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(example).toHaveScreenshot('select-multiple-selected.png', {
    animations: 'disabled',
  });

  const clear = example.getByRole('button', { name: 'Clear', exact: true });
  await clear.click();
  await expect(input).toHaveValue('');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(input).toBeFocused();
  await expect(example).toHaveScreenshot('select-multiple-cleared.png', {
    animations: 'disabled',
  });
});

test('uses provider defaults when local Select inputs are omitted', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Select provider defaults', exact: true });
  const input = example.getByRole('combobox', { name: 'Provider defaults', exact: true });

  await expect(input).toHaveValue('Owner, Editor, Reviewer, Viewer');
  await expect(example.getByText('+2', { exact: true })).toBeVisible();

  const clear = example.getByRole('button', { name: 'Clear', exact: true });
  await expect(clear).toBeVisible();

  const localOverride = example.getByRole('combobox', {
    name: 'Local clear disabled',
    exact: true,
  });
  await expect(localOverride).toHaveValue('Owner');
  await expect(
    localOverride
      .locator('xpath=ancestor::kui-field[1]')
      .getByRole('button', { name: 'Clear', exact: true }),
  ).toHaveCount(0);

  await clear.click();

  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
});

test('uses Field clearability when no Select or local default is set', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Select Field provider fallback', exact: true });
  const input = example.getByRole('combobox', {
    name: 'Field-provided clearability',
    exact: true,
  });
  await expect(input).toHaveValue('Owner');

  const clear = example.getByRole('button', { name: 'Clear', exact: true });
  await expect(clear).toBeVisible();
  await clear.click();
  await expect(input).toHaveValue('');
});

test('removes a custom selected value through its native button', async ({ page }) => {
  const example = page.getByRole('group', {
    name: 'Select value and multiple-selection modes',
    exact: true,
  });
  const input = example.getByRole('combobox', { name: 'Custom selected-value template' });
  const field = input.locator('xpath=ancestor::kui-field[1]');

  await field.getByRole('button', { name: 'Remove Owner', exact: true }).click();

  await expect(input).toHaveValue('Reviewer, Viewer');
});

test('distinguishes readonly and disabled from an enabled clearable Select', async ({ page }) => {
  const states = page.getByRole('group', { name: 'Select states', exact: true });
  const disabled = states.getByRole('combobox', { name: 'Disabled', exact: true });
  const readonly = states.getByRole('combobox', { name: 'Readonly', exact: true });
  const invalid = states.getByRole('combobox', { name: 'Invalid', exact: true });

  await expect(disabled).toBeDisabled();
  await expect(disabled).toHaveValue('manager');
  await expect(disabled).toHaveAttribute('aria-expanded', 'false');
  await expect(readonly).toHaveAttribute('readonly');
  await expect(invalid).toHaveAttribute('aria-invalid', 'true');
  const invalidError = states.getByText('Choose a supported role.', { exact: true });
  await expect(invalidError).toBeVisible();
  const invalidErrorId = await invalidError.getAttribute('id');
  const invalidDescribedBy = await invalid.getAttribute('aria-describedby');
  expect(invalidErrorId).toBeTruthy();
  expect(invalidDescribedBy?.split(' ')).toContain(invalidErrorId);
  await expect(states.getByRole('button', { name: 'Clear', exact: true })).toHaveCount(2);
  const readonlyClear = readonly
    .locator('xpath=ancestor::kui-field[1]')
    .getByRole('button', { name: 'Clear', exact: true });
  const enabledClear = states
    .getByRole('combobox', { name: 'Clearable', exact: true })
    .locator('xpath=ancestor::kui-field[1]')
    .getByRole('button', { name: 'Clear', exact: true });
  await expect(readonly).toHaveValue('editor');
  await expect(readonlyClear).toBeDisabled();
  await expect(enabledClear).toBeEnabled();
  await readonly.click();
  await expect(readonly).toHaveValue('editor');
  await expect(readonly).toHaveAttribute('aria-expanded', 'false');
});

test('captures actual keyboard focus on the Select control @visual', async ({ page }) => {
  const states = page.getByRole('group', { name: 'Select states', exact: true });
  const input = states.getByRole('combobox', { name: 'Focus target', exact: true });
  const field = input.locator('xpath=ancestor::kui-field[1]');

  await input.focus();
  await page.keyboard.press('Tab');
  await expect(field.getByRole('button', { name: 'Open options', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(input).toBeFocused();
  expect(await input.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(states).toHaveScreenshot('select-focused.png', { animations: 'disabled' });
});

test('captures the actual hovered Select control @visual', async ({ page }) => {
  const states = page.getByRole('group', { name: 'Select states', exact: true });
  const input = states.getByRole('combobox', { name: 'Focus target', exact: true });

  await states.scrollIntoViewIfNeeded();
  await input.hover();
  expect(await input.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect(states.getByRole('combobox', { name: 'Disabled', exact: true })).toHaveValue(
    'manager',
  );
  await expect(states).toHaveScreenshot('select-hovered.png', { animations: 'disabled' });
});

test('captures the default Select in the shell light theme @visual', async ({ page }) => {
  const example = page.getByRole('group', {
    name: 'Default select example',
    exact: true,
  });

  await expect(page.locator('html')).toHaveAttribute('data-kui-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light theme', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-kui-theme', 'light');
  await expect(example).toHaveScreenshot('select-default-light.png', { animations: 'disabled' });
});

test('touches a required Select when its opened list closes, then clears the error after selection @visual', async ({
  page,
}) => {
  const example = page.getByRole('group', {
    name: 'Required select validation example',
    exact: true,
  });
  const input = example.getByRole('combobox', { name: 'Required role', exact: true });
  const error = example.getByText('Choose a role to continue.', { exact: true });

  await expect(error).toBeHidden();
  await input.focus();
  await input.press('ArrowDown');
  await page.keyboard.press('Escape');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(error).toBeVisible();
  const errorId = await error.getAttribute('id');
  const describedBy = await input.getAttribute('aria-describedby');
  expect(errorId).toBeTruthy();
  expect(describedBy?.split(' ')).toContain(errorId);
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(example).toHaveScreenshot('select-validation-invalid.png', {
    animations: 'disabled',
  });

  await input.press('ArrowDown');
  const listbox = page.getByRole('listbox');
  const designer = listbox.getByRole('option', { name: 'Designer', exact: true });
  await expect(designer).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(input).toHaveValue('designer');
  await expect(example.getByText('Choose a role to continue.', { exact: true })).toBeHidden();
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  await expect(example).toHaveScreenshot('select-validation-corrected.png', {
    animations: 'disabled',
  });
});

test('keeps the catalogue within tablet and 320px viewports', async ({ page }) => {
  for (const viewport of [
    { width: 768, height: 1024 },
    { width: 320, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.reload();

    await expect(page.getByRole('heading', { name: 'Select', level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);
  }
});

test('switches the Select examples and generated labels to Russian', async ({ page }) => {
  const localeResponse = await page.request.get('/i18n/select/ru.json');
  expect(localeResponse.ok()).toBe(true);
  const russian = (await localeResponse.json()) as {
    accessibility: {
      default: string;
      fieldDefaults: string;
      modes: string;
      providerDefaults: string;
      validation: string;
    };
    actions: { remove: string };
    fields: {
      role: string;
      objectValue: string;
      multipleText: string;
      fieldClearable: string;
      localClearableOff: string;
      customValues: string;
      providerDefaults: string;
      requiredRole: string;
    };
    errors: { required: string };
    options: { designer: string; editor: string; viewer: string; owner: string; reviewer: string };
    teams: { engineering: string };
    status: { selected: string };
    title: string;
  };

  await page.getByRole('button', { name: 'Switch language to Russian' }).click();

  const example = page.getByRole('group', { name: russian.accessibility.default, exact: true });
  await expect(page.getByRole('heading', { name: russian.title, level: 1 })).toBeVisible();
  const input = example.getByRole('combobox', { name: russian.fields.role, exact: true });
  await input.focus();
  await input.press('ArrowDown');
  await expect(
    page.getByRole('listbox').getByRole('option', { name: russian.options.designer }),
  ).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(input).toHaveValue('designer');
  await expect(example.getByRole('status')).toHaveText(
    russian.status.selected.replace('{{value}}', russian.options.designer),
  );

  const modes = page.getByRole('group', { name: russian.accessibility.modes, exact: true });
  await expect(
    modes.getByRole('combobox', { name: russian.fields.multipleText, exact: true }),
  ).toHaveValue(`${russian.options.editor} · ${russian.options.viewer}`);
  await expect(
    modes.getByRole('button', {
      name: russian.actions.remove.replace('{{value}}', russian.options.owner),
      exact: true,
    }),
  ).toBeVisible();

  const providerDefaults = page.getByRole('group', {
    name: russian.accessibility.providerDefaults,
    exact: true,
  });
  const providerInput = providerDefaults.getByRole('combobox', {
    name: russian.fields.providerDefaults,
    exact: true,
  });
  await expect(providerInput).toHaveValue(
    [
      russian.options.owner,
      russian.options.editor,
      russian.options.reviewer,
      russian.options.viewer,
    ].join(', '),
  );
  await expect(providerDefaults.getByText('+2', { exact: true })).toBeVisible();

  const fieldDefaults = page.getByRole('group', {
    name: russian.accessibility.fieldDefaults,
    exact: true,
  });
  const fieldClearable = fieldDefaults.getByRole('combobox', {
    name: russian.fields.fieldClearable,
    exact: true,
  });
  await expect(fieldDefaults.getByRole('button', { name: 'Clear', exact: true })).toBeVisible();
  await expect(
    providerDefaults
      .getByRole('combobox', { name: russian.fields.localClearableOff, exact: true })
      .locator('xpath=ancestor::kui-field[1]')
      .getByRole('button', { name: 'Clear', exact: true }),
  ).toHaveCount(0);
  await expect(fieldClearable).toHaveValue(russian.options.owner);

  const objectSelect = modes.getByRole('combobox', { name: russian.fields.objectValue });
  await objectSelect.focus();
  await objectSelect.press('ArrowDown');
  await expect(
    page
      .getByRole('listbox')
      .getByRole('option', { name: `Ada Lovelace · ${russian.teams.engineering}` }),
  ).toBeVisible();
  await page.keyboard.press('Escape');

  const validation = page.getByRole('group', {
    name: russian.accessibility.validation,
    exact: true,
  });
  const requiredSelect = validation.getByRole('combobox', {
    name: russian.fields.requiredRole,
    exact: true,
  });
  await requiredSelect.focus();
  await requiredSelect.press('ArrowDown');
  await page.keyboard.press('Escape');
  await expect(validation.getByText(russian.errors.required, { exact: true })).toBeVisible();
});
