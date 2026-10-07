import type { Locator, Page } from '@playwright/test';

import { expect, test } from './support/fixtures';

const desktopViewport = { width: 1440, height: 1000 };
const mobileViewport = { width: 320, height: 844 };

const appearanceGroups = [
  { appearance: 'neutral', name: 'Neutral chip sizes' },
  { appearance: 'primary', name: 'Primary chip sizes' },
  { appearance: 'success', name: 'Success chip sizes' },
  { appearance: 'warning', name: 'Warning chip sizes' },
  { appearance: 'danger', name: 'Danger chip sizes' },
  { appearance: 'info', name: 'Info chip sizes' },
] as const;

const sizes = ['xs', 'sm', 'md', 'lg'] as const;

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/components/chip');
});

test('server-renders Chip content and hydrates the generated remove button', async ({ page }) => {
  const response = await page.request.get('/components/chip');

  expect(response.ok()).toBe(true);

  const serverMarkup = await response.text();
  expect(serverMarkup).toContain('Design');
  expect(serverMarkup).toContain('Chip appearance and size variants');
  expect(serverMarkup).not.toContain('aria-label="Remove Angular"');

  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.goto('/components/chip');
  await expect(page.getByRole('heading', { level: 1, name: 'Chip' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remove Angular', exact: true })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('loads the Chip scope and updates generated remove labels when switching to Russian', async ({
  page,
}) => {
  const localeResponse = await page.request.get('/i18n/chip/ru.json');
  expect(localeResponse.ok()).toBeTruthy();
  const translations = await localeResponse.json();

  await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(
    page.getByRole('heading', { level: 1, name: translations.title, exact: true }),
  ).toBeVisible();

  const defaultExample = page.getByRole('group', {
    name: translations.accessibility.default,
    exact: true,
  });
  await expect(
    defaultExample.getByText(translations.labels.default, { exact: true }),
  ).toBeVisible();

  const generated = page.getByRole('group', {
    name: translations.accessibility.generatedRemoveButtons,
    exact: true,
  });
  await expect(
    generated.getByRole('button', {
      name: translations.accessibility.removeAngular,
      exact: true,
    }),
  ).toBeVisible();
});

test('shows the minimally configured default Chip @visual', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default chip example', exact: true });
  const chip = example.getByText('Design', { exact: true });

  await expect(page.getByRole('heading', { level: 1, name: 'Chip' })).toBeVisible();
  await expect(chip).toHaveAttribute('data-kui-appearance', 'neutral');
  await expect(chip).toHaveAttribute('data-kui-size', 'md');
  await expect(chip.locator('button')).toHaveCount(0);
  await expect(example).toHaveScreenshot('chip-default-desktop.png', { animations: 'disabled' });

  await captureMobile(page, example, 'chip-default-320.png');
});

test('shows every Chip appearance and size combination @visual', async ({ page }) => {
  const matrix = page.getByRole('group', {
    name: 'Chip appearance and size variants',
    exact: true,
  });

  for (const { appearance, name } of appearanceGroups) {
    const row = matrix.getByRole('group', { name, exact: true });

    await expect(row.getByRole('heading', { level: 3 })).toHaveText(
      appearance[0].toUpperCase() + appearance.slice(1),
    );

    for (const size of sizes) {
      const chip = row.getByText(size, { exact: true });

      await expect(chip).toHaveAttribute('data-kui-appearance', appearance);
      await expect(chip).toHaveAttribute('data-kui-size', size);
    }
  }

  await expect(matrix).toHaveScreenshot('chip-appearance-size-desktop.png', {
    animations: 'disabled',
  });

  await captureMobile(page, matrix, 'chip-appearance-size-320.png');
});

test('removes generated and custom Chip actions through consumer state @visual', async ({
  page,
}) => {
  const examples = page.getByRole('group', { name: 'Chip removal examples', exact: true });
  const generated = examples.getByRole('group', { name: 'Generated remove buttons', exact: true });
  const custom = examples.getByRole('group', { name: 'Custom remove buttons', exact: true });
  const reset = page.getByRole('button', { name: 'Reset removal examples', exact: true });
  const generatedRemove = generated.getByRole('button', { name: 'Remove Angular', exact: true });
  const customPlainRemove = custom.getByRole('button', { name: 'Remove custom tag', exact: true });
  const customIconButtonRemove = custom.getByRole('button', {
    name: 'Remove custom filter',
    exact: true,
  });

  await expect(generated.getByText('Angular', { exact: true })).toBeVisible();
  await expect(generatedRemove).toHaveAttribute('type', 'button');
  await expect(customPlainRemove).toHaveAttribute('type', 'button');
  await expect(customIconButtonRemove).toHaveAttribute('type', 'button');
  await expect(examples).toHaveScreenshot('chip-removal-before-desktop.png', {
    animations: 'disabled',
  });

  await captureMobile(page, examples, 'chip-removal-before-320.png');

  await page.setViewportSize(desktopViewport);
  await generatedRemove.click();
  await expect(generated.getByText('Angular', { exact: true })).toHaveCount(0);
  await expect(examples.getByRole('status', { name: 'Chip removal status' })).toHaveText(
    'Removed chips: 1.',
  );
  await expect(examples).toHaveScreenshot('chip-removal-after-generated-desktop.png', {
    animations: 'disabled',
  });

  await captureMobile(page, examples, 'chip-removal-after-generated-320.png');

  await page.setViewportSize(desktopViewport);
  await customIconButtonRemove.click();
  await expect(custom.getByText('Custom filter', { exact: true })).toHaveCount(0);
  await expect(examples.getByRole('status', { name: 'Chip removal status' })).toHaveText(
    'Removed chips: 2.',
  );
  await expect(examples).toHaveScreenshot('chip-removal-after-custom-desktop.png', {
    animations: 'disabled',
  });

  await captureMobile(page, examples, 'chip-removal-after-custom-320.png');
  await page.setViewportSize(desktopViewport);

  await reset.click();
  await expect(generated.getByText('Angular', { exact: true })).toBeVisible();
  await expect(custom.getByText('Custom filter', { exact: true })).toBeVisible();

  const generatedEnterRemove = generated.getByRole('button', {
    name: 'Remove Design',
    exact: true,
  });
  await tabTo(page, generatedEnterRemove);
  await expect(generatedEnterRemove).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(generated.getByText('Design', { exact: true })).toHaveCount(0);
  await expect(examples.getByRole('status', { name: 'Chip removal status' })).toHaveText(
    'Removed chips: 1.',
  );

  await reset.click();
  const generatedSpaceRemove = generated.getByRole('button', {
    name: 'Remove Backend',
    exact: true,
  });
  await tabTo(page, generatedSpaceRemove);
  await expect(generatedSpaceRemove).toBeFocused();
  await page.keyboard.press('Space');
  await expect(generated.getByText('Backend', { exact: true })).toHaveCount(0);
  await expect(examples.getByRole('status', { name: 'Chip removal status' })).toHaveText(
    'Removed chips: 1.',
  );

  await reset.click();

  await tabTo(page, customPlainRemove);
  await expect(customPlainRemove).toBeFocused();
  expect(await customPlainRemove.evaluate((element) => element.matches(':focus-visible'))).toBe(
    true,
  );
  await page.mouse.move(desktopViewport.width - 1, 0);
  expect(await customPlainRemove.evaluate((element) => element.matches(':focus-visible'))).toBe(
    true,
  );
  expect(await reset.evaluate((element) => element.matches(':hover'))).toBe(false);
  expect(await reset.evaluate((element) => element.matches(':focus'))).toBe(false);
  expect(await reset.evaluate((element) => element.matches(':focus-visible'))).toBe(false);
  await expect(custom).toHaveScreenshot('chip-removal-focus-desktop.png', {
    animations: 'disabled',
  });

  await page.setViewportSize(mobileViewport);
  await collapseMobileNavigation(page);
  await expectNoHorizontalOverflow(page);
  await tabTo(page, customPlainRemove);
  await expect(customPlainRemove).toBeFocused();
  expect(await customPlainRemove.evaluate((element) => element.matches(':focus-visible'))).toBe(
    true,
  );
  await page.mouse.move(mobileViewport.width - 1, 0);
  expect(await customPlainRemove.evaluate((element) => element.matches(':focus-visible'))).toBe(
    true,
  );
  expect(await reset.evaluate((element) => element.matches(':hover'))).toBe(false);
  expect(await reset.evaluate((element) => element.matches(':focus'))).toBe(false);
  expect(await reset.evaluate((element) => element.matches(':focus-visible'))).toBe(false);
  await expect(custom).toHaveScreenshot('chip-removal-focus-320.png', {
    animations: 'disabled',
  });
  await page.keyboard.press('Enter');
  await expect(custom.getByText('Custom tag', { exact: true })).toHaveCount(0);
  await expect(examples).toHaveScreenshot('chip-removal-after-keyboard-320.png', {
    animations: 'disabled',
  });
});

test('shows disabled and invalid states without adding form semantics @visual', async ({
  page,
}) => {
  const states = page.getByRole('group', { name: 'Chip state examples', exact: true });
  const disabledChip = states.getByText('Disabled', { exact: true });
  const disabledButton = states.getByRole('button', { name: 'Disabled action', exact: true });
  const disabledRemove = states.getByRole('button', { name: 'Remove disabled chip', exact: true });
  const invalidChip = states.getByText('Invalid style', { exact: true });

  await expect(disabledChip).toHaveAttribute('aria-disabled', 'true');
  await expect(disabledButton).toBeDisabled();
  await expect(disabledRemove).toBeDisabled();
  await expect(disabledRemove).toHaveAttribute('aria-disabled', 'true');
  await expect(invalidChip).toHaveClass(/kui-chip--invalid/);
  await expect(invalidChip).not.toHaveAttribute('aria-invalid');
  await expect(states).toHaveScreenshot('chip-states-desktop.png', { animations: 'disabled' });

  await captureMobile(page, states, 'chip-states-320.png');
});

test('shows projected icon, avatar, and long-label composition @visual', async ({ page }) => {
  const composition = page.getByRole('group', {
    name: 'Chip composition examples',
    exact: true,
  });

  await expect(composition.getByText('Role: Admin', { exact: true })).toBeVisible();
  await expect(composition.locator('kui-avatar')).toHaveAttribute('data-kui-size', 'xs');
  await expect(
    composition.getByText('A longer project label that uses the available chip width', {
      exact: true,
    }),
  ).toBeVisible();
  const longLabel = composition.locator('.chip-playground__long-chip .kui-chip-label');
  await expect(longLabel).toBeVisible();
  expect(await longLabel.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(
    true,
  );
  await expect(composition).toHaveScreenshot('chip-composition-desktop.png', {
    animations: 'disabled',
  });

  await page.setViewportSize(mobileViewport);
  await collapseMobileNavigation(page);
  await expectNoHorizontalOverflow(page);
  await expect(longLabel).toBeVisible();
  expect(await longLabel.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(
    true,
  );
  await expect(composition).toHaveScreenshot('chip-composition-320.png', {
    animations: 'disabled',
  });
});

test('preserves native button and link behavior for interactive Chips', async ({ page }) => {
  const examples = page.getByRole('group', {
    name: 'Chip native interactive host examples',
    exact: true,
  });
  const action = examples.getByRole('button', { name: 'Filter action', exact: true });
  const link = examples.getByRole('link', { name: 'Jump to default chip', exact: true });

  await expect(action).toHaveAttribute('type', 'button');
  await expect(link).toHaveAttribute('href', '/components/chip#chip-default-target');
  await action.click();
  await expect(examples.getByRole('status')).toHaveText('Filter actions activated: 1.');
  await link.click();
  await expect(page).toHaveURL(/\/components\/chip#chip-default-target$/);
  await expect(
    page.getByRole('group', { name: 'Default chip example', exact: true }),
  ).toBeInViewport();
});

test('captures real keyboard focus-visible on an interactive Chip @visual', async ({ page }) => {
  const examples = page.getByRole('group', {
    name: 'Chip native interactive host examples',
    exact: true,
  });
  const action = examples.getByRole('button', { name: 'Filter action', exact: true });

  await tabTo(page, action);
  await expect(action).toBeFocused();
  expect(await action.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(examples).toHaveScreenshot('chip-interactive-focus-desktop.png', {
    animations: 'disabled',
  });

  await page.setViewportSize(mobileViewport);
  await collapseMobileNavigation(page);
  await expectNoHorizontalOverflow(page);
  await tabTo(page, action);
  await expect(action).toBeFocused();
  expect(await action.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(examples).toHaveScreenshot('chip-interactive-focus-320.png', {
    animations: 'disabled',
  });
});

test('captures real pointer hover on a generated Chip remove button @visual', async ({ page }) => {
  const examples = page.getByRole('group', { name: 'Chip removal examples', exact: true });
  const generated = examples.getByRole('group', { name: 'Generated remove buttons', exact: true });
  const removeButton = generated.getByRole('button', { name: 'Remove Design', exact: true });

  const colors = await removeButton.evaluate((element) => {
    const probe = document.createElement('span');
    probe.style.color = 'var(--kui-chip-remove-color-hover, var(--kui-color-text))';
    element.parentElement?.append(probe);
    const hover = getComputedStyle(probe).color;
    probe.remove();

    return { base: getComputedStyle(element).color, hover };
  });

  expect(colors.base).not.toBe(colors.hover);
  await removeButton.hover();
  expect(await removeButton.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect
    .poll(() => removeButton.evaluate((element) => getComputedStyle(element).color))
    .toBe(colors.hover);
  await expect(examples).toHaveScreenshot('chip-removal-remove-hover-desktop.png', {
    animations: 'disabled',
  });

  await page.setViewportSize(mobileViewport);
  await collapseMobileNavigation(page);
  await removeButton.hover();
  await expectNoHorizontalOverflow(page);
  expect(await removeButton.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect
    .poll(() => removeButton.evaluate((element) => getComputedStyle(element).color))
    .toBe(colors.hover);
  await expect(examples).toHaveScreenshot('chip-removal-remove-hover-320.png', {
    animations: 'disabled',
  });
});

test('captures real pointer hover and pressed states on an interactive Chip @visual', async ({
  page,
}) => {
  const examples = page.getByRole('group', {
    name: 'Chip native interactive host examples',
    exact: true,
  });
  const action = examples.getByRole('button', { name: 'Filter action', exact: true });

  await action.hover();
  expect(await action.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect(examples).toHaveScreenshot('chip-interactive-hover-desktop.png', {
    animations: 'disabled',
  });

  await page.setViewportSize(mobileViewport);
  await collapseMobileNavigation(page);
  await action.hover();
  await expectNoHorizontalOverflow(page);
  expect(await action.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect(examples).toHaveScreenshot('chip-interactive-hover-320.png', {
    animations: 'disabled',
  });

  await page.setViewportSize(desktopViewport);
  await page.mouse.move(0, 0);
  await action.scrollIntoViewIfNeeded();
  const bounds = await action.boundingBox();

  if (!bounds) throw new Error('Expected the named Chip action button to have a visible box.');

  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  expect(await action.evaluate((element) => element.matches(':active'))).toBe(true);
  await expect(examples).toHaveScreenshot('chip-interactive-pressed-desktop.png', {
    animations: 'disabled',
  });
  await page.mouse.up();

  await page.goto('/components/chip');
  await page.setViewportSize(mobileViewport);
  await collapseMobileNavigation(page);
  await action.scrollIntoViewIfNeeded();
  const mobileBounds = await action.boundingBox();

  if (!mobileBounds)
    throw new Error('Expected the named Chip action button to have a visible box.');

  await page.mouse.move(
    mobileBounds.x + mobileBounds.width / 2,
    mobileBounds.y + mobileBounds.height / 2,
  );
  await page.mouse.down();
  await expectNoHorizontalOverflow(page);
  expect(await action.evaluate((element) => element.matches(':active'))).toBe(true);
  await expect(examples).toHaveScreenshot('chip-interactive-pressed-320.png', {
    animations: 'disabled',
  });
  await page.mouse.up();
});

async function captureMobile(page: Page, example: Locator, screenshotName: string): Promise<void> {
  await page.setViewportSize(mobileViewport);
  await collapseMobileNavigation(page);
  await expectNoHorizontalOverflow(page);
  await expect(example).toHaveScreenshot(screenshotName, { animations: 'disabled' });
}

async function collapseMobileNavigation(page: Page): Promise<void> {
  const navigation = page.getByRole('navigation', {
    name: 'Component navigation',
    exact: true,
  });

  for (const category of ['Actions', 'Forms', 'Surfaces', 'Feedback', 'Data and identity']) {
    const toggle = navigation.getByRole('button', { name: category, exact: true });

    if ((await toggle.getAttribute('aria-expanded')) === 'true') await toggle.click();
  }

  await navigation
    .getByRole('button', { name: 'Data and identity', exact: true })
    .scrollIntoViewIfNeeded();
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
}

async function tabTo(page: Page, target: Locator): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) return;

    await page.keyboard.press('Tab');
  }

  throw new Error('Keyboard navigation did not reach the named Chip action button.');
}
