import type { Locator, Page } from '@playwright/test';

import { expect, test } from '../../../tests/e2e/support/fixtures';

const examples = [
  ['Selection and touch', 'segmented-default-desktop.png', 'segmented-default-320.png'],
  ['Control sizes', 'segmented-sizes-desktop.png', 'segmented-sizes-320.png'],
  ['Disabled states', 'segmented-disabled-desktop.png', 'segmented-disabled-320.png'],
  ['Signal Forms validation', 'segmented-validation-desktop.png', 'segmented-validation-320.png'],
] as const;

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/components/segmented');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Segmented', exact: true }),
  ).toBeVisible();
});

test('server-renders and hydrates the named, selected Segmented group', async ({
  browser,
  page,
}) => {
  const routeUrl = new URL('/components/segmented', page.url()).toString();
  const serverContext = await browser.newContext({ javaScriptEnabled: false });

  try {
    const serverPage = await serverContext.newPage();
    const response = await serverPage.goto(routeUrl);
    expect(response?.status()).toBe(200);

    const group = serverPage.getByRole('radiogroup', { name: 'Page view', exact: true });
    await expect(group.getByRole('radio', { name: 'List', exact: true })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(group.getByRole('radio', { name: 'List', exact: true })).toHaveAttribute(
      'tabindex',
      '0',
    );
    await expect(group).toHaveAttribute('data-kui-size', 'md');
    await expect(group).not.toHaveAttribute('aria-invalid', 'true');
  } finally {
    await serverContext.close();
  }

  const runtimeErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  await page.reload();

  const hydratedGroup = page.getByRole('radiogroup', { name: 'Page view', exact: true });
  await expect(hydratedGroup.getByRole('radio', { name: 'List', exact: true })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await expect(hydratedGroup).toHaveAttribute('data-kui-size', 'md');
  expect(runtimeErrors).toEqual([]);
});

test('uses the current value model and emits touch for pointer selection', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Selection and touch', exact: true });
  const group = example.getByRole('radiogroup', { name: 'Page view', exact: true });

  await expect(example.getByText('Selected value: list', { exact: true })).toBeVisible();
  await expect(example.getByText('Touch events: 0', { exact: true })).toBeVisible();
  await group.getByRole('radio', { name: 'Grid', exact: true }).click();
  await expect(group.getByRole('radio', { name: 'Grid', exact: true })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await expect(example.getByText('Selected value: grid', { exact: true })).toBeVisible();
  await expect(example.getByText('Touch events: 1', { exact: true })).toBeVisible();
});

test('renders every supported size with an operable selected option', async ({ page }) => {
  const sizes = page.getByRole('group', { name: 'Control sizes', exact: true });
  for (const size of ['xs', 'sm', 'md', 'lg']) {
    const group = sizes.getByRole('radiogroup', { name: `Segmented size ${size}`, exact: true });
    const selected = group.getByRole('radio', { name: 'Grid', exact: true });
    await expect(selected).toHaveAttribute('aria-checked', 'true');
    await expect(selected).toHaveAttribute('tabindex', '0');
    await expect(group).toHaveAttribute('data-kui-size', size);
  }
});

test('shows per-segment and whole-group disabled behavior', async ({ page }) => {
  const disabled = page.getByRole('group', { name: 'Disabled states', exact: true });
  const oneDisabled = disabled.getByRole('radiogroup', {
    name: 'Page view with one disabled option',
    exact: true,
  });
  const disabledGrid = oneDisabled.getByRole('radio', { name: 'Grid', exact: true });
  await expect(oneDisabled.getByRole('radio', { name: 'List', exact: true })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await expect(disabledGrid).toBeDisabled();
  await expect(disabledGrid).toHaveAttribute('aria-disabled', 'true');
  await expect(disabledGrid).toHaveAttribute('tabindex', '-1');

  const wholeGroup = disabled.getByRole('radiogroup', {
    name: 'Disabled page view',
    exact: true,
  });
  await expect(wholeGroup).toHaveAttribute('aria-disabled', 'true');
  await expect(wholeGroup.getByRole('radio', { name: 'Grid', exact: true })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  for (const radio of await wholeGroup.getByRole('radio').all()) {
    await expect(radio).toBeDisabled();
    await expect(radio).toHaveAttribute('tabindex', '-1');
  }
});

test('binds Signal Forms validation without losing the enabled selection', async ({ page }) => {
  const validation = page.getByRole('group', { name: 'Signal Forms validation', exact: true });
  const group = validation.getByRole('radiogroup', { name: 'Preferred view', exact: true });
  const grid = group.getByRole('radio', { name: 'Grid', exact: true });
  const list = group.getByRole('radio', { name: 'List', exact: true });

  await expect(grid).toHaveAttribute('aria-checked', 'true');
  await expect(grid).toBeEnabled();
  await expect(grid).toHaveAttribute('tabindex', '0');
  await expect(group).toHaveAttribute('aria-invalid', 'true');
  await expect(validation.getByRole('alert')).toHaveCount(0);

  await grid.click();
  await expect(group).toHaveAttribute('aria-invalid', 'true');
  await expect(validation.getByRole('alert')).toHaveText('Choose List.');
  await expect(validation.getByText('Touch events: 1', { exact: true })).toBeVisible();
  await expect(validation).toHaveScreenshot('segmented-validation-invalid.png', {
    animations: 'disabled',
  });

  await list.click();
  await expect(group).not.toHaveAttribute('aria-invalid', 'true');
  await expect(validation.getByRole('alert')).toHaveCount(0);
  await expect(validation.getByText('Selected value: list', { exact: true })).toBeVisible();
  await expect(validation.getByText('Touch events: 2', { exact: true })).toBeVisible();
  await expect(validation).toHaveScreenshot('segmented-validation-corrected.png', {
    animations: 'disabled',
  });
});

test('uses actual pointer hover, keyboard focus-visible, and supported keyboard selection', async ({
  page,
}) => {
  const example = page.getByRole('group', { name: 'Selection and touch', exact: true });
  const group = example.getByRole('radiogroup', { name: 'Page view', exact: true });
  const list = group.getByRole('radio', { name: 'List', exact: true });
  const grid = group.getByRole('radio', { name: 'Grid', exact: true });
  const calendar = group.getByRole('radio', { name: 'Calendar', exact: true });

  await grid.hover();
  expect(await grid.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect(example).toHaveScreenshot('segmented-hover.png', { animations: 'disabled' });

  await page.mouse.move(0, 0);
  await tabTo(page, list);
  expect(await list.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(example).toHaveScreenshot('segmented-focus-visible.png', {
    animations: 'disabled',
  });
  await expect(example.getByText('Touch events: 0', { exact: true })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(example.getByText('Touch events: 0', { exact: true })).toBeVisible();
  await page.keyboard.press('Shift+Tab');
  await expect(list).toBeFocused();
  await expect(example.getByText('Selected value: list', { exact: true })).toBeVisible();

  await page.keyboard.press('ArrowRight');
  await expect(grid).toBeFocused();
  await expect(grid).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('ArrowDown');
  await expect(calendar).toBeFocused();
  await expect(calendar).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('ArrowLeft');
  await expect(grid).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(list).toBeFocused();
  await page.keyboard.press('Home');
  await expect(list).toBeFocused();
  await page.keyboard.press('End');
  await expect(calendar).toBeFocused();
  await expect(calendar).toHaveAttribute('aria-checked', 'true');
  await expect(calendar).toHaveAttribute('tabindex', '0');
  await expect(list).toHaveAttribute('tabindex', '-1');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  await expect(example.getByText('Selected value: calendar', { exact: true })).toBeVisible();
  await expect(example.getByText('Touch events: 8', { exact: true })).toBeVisible();
  await expect(example).toHaveScreenshot('segmented-keyboard-selection.png', {
    animations: 'disabled',
  });
});

test('loads the Segmented locale scope and updates the accessible group name', async ({ page }) => {
  const localeResponse = await page.request.get('/i18n/segmented/ru.json');
  expect(localeResponse.ok()).toBeTruthy();
  const translations = await localeResponse.json();

  await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: translations.title, exact: true }),
  ).toBeVisible();
  const defaultExample = page.getByRole('group', {
    name: translations.examples.default,
    exact: true,
  });
  const defaultGroup = defaultExample.getByRole('radiogroup', {
    name: translations.accessibility.defaultGroup,
    exact: true,
  });
  await expect(defaultGroup).toBeVisible();
  for (const option of Object.values(translations.options)) {
    await expect(defaultGroup.getByRole('radio', { name: option, exact: true })).toBeVisible();
  }

  const validation = page.getByRole('group', {
    name: translations.examples.validation,
    exact: true,
  });
  const validationGroup = validation.getByRole('radiogroup', {
    name: translations.accessibility.validationGroup,
    exact: true,
  });
  await expect(validationGroup).toHaveAttribute('aria-invalid', 'true');
  await validationGroup
    .getByRole('radio', { name: translations.options.grid, exact: true })
    .click();
  await expect(validation.getByRole('alert')).toHaveText(translations.forms.invalidMessage);

  for (const viewport of [
    { width: 768, height: 1024 },
    { width: 320, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true);
    await expect(defaultGroup).toBeVisible();
    await expect(validationGroup).toBeVisible();
  }
});

test('fits the catalogue at desktop, tablet, and 320px widths', async ({ page }) => {
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

test('captures each Segmented example at desktop and 320px', async ({ page }) => {
  for (const [name, desktopScreenshot] of examples) {
    await expect(page.getByRole('group', { name, exact: true })).toHaveScreenshot(
      desktopScreenshot,
      {
        animations: 'disabled',
      },
    );
  }

  await page.setViewportSize({ width: 320, height: 844 });
  for (const [name, , mobileScreenshot] of examples) {
    await expect(page.getByRole('group', { name, exact: true })).toHaveScreenshot(
      mobileScreenshot,
      {
        animations: 'disabled',
      },
    );
  }
});

async function tabTo(page: Page, target: Locator): Promise<void> {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((element) => document.activeElement === element)) return;
  }

  throw new Error('The selected Segmented radio was not reachable with Tab.');
}
