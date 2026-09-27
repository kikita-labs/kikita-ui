import { expect, test } from '@playwright/test';

const desktopViewport = { width: 1440, height: 1000 };
const tabletViewport = { width: 768, height: 1024 };
const mobileViewport = { width: 320, height: 844 };

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/components/stepper');
});

test('renders the minimal horizontal default in both themes and at 320px', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'Stepper', exact: true })).toBeVisible();

  const example = page.getByRole('group', { name: 'Default horizontal stepper', exact: true });
  const list = example.getByRole('list', { name: 'Progress', exact: true });
  const items = list.getByRole('listitem');

  await expect(list).toHaveAttribute('data-kui-size', 'md');
  await expect(list).not.toHaveAttribute('data-kui-orientation');
  await expect(items).toHaveCount(3);
  await expect(items.nth(0)).toHaveAttribute('aria-current', 'step');
  await expect(items.nth(0)).toHaveAttribute('data-kui-state', 'current');
  await expect(items.nth(1)).toHaveAttribute('data-kui-state', 'upcoming');
  await expect(example).toHaveScreenshot('stepper-default-dark.png', { animations: 'disabled' });

  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Switch to light theme', exact: true })
    .click();
  await expect(example).toHaveScreenshot('stepper-default-light.png', { animations: 'disabled' });

  await page.setViewportSize(mobileViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await expect(example).toHaveScreenshot('stepper-default-320.png', { animations: 'disabled' });
});

test('changes the controlled linear model with consumer controls and a keyboard step button', async ({
  page,
}) => {
  const example = page.getByRole('group', { name: 'Linear navigation stepper', exact: true });
  const exampleCard = page.getByRole('article').filter({
    has: page.getByRole('heading', { level: 2, name: 'Linear navigation', exact: true }),
  });
  const list = example.getByRole('list', { name: 'Progress', exact: true });
  const items = list.getByRole('listitem');
  const backToAccount = example.getByRole('button', { name: 'Back to step Account', exact: true });

  await expect(items.nth(0)).toHaveAttribute('data-kui-state', 'done');
  await expect(items.nth(1)).toHaveAttribute('aria-current', 'step');
  await expect(items.nth(2)).toHaveAttribute('data-kui-state', 'upcoming');
  await expect(items.nth(2).getByRole('button')).toHaveCount(0);
  await expect(example).toHaveScreenshot('stepper-linear-start.png', { animations: 'disabled' });
  await page.mouse.move(0, 0);

  let reachedByKeyboard = false;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    await page.keyboard.press('Tab');
    if (await backToAccount.evaluate((element) => element === document.activeElement)) {
      reachedByKeyboard = true;
      break;
    }
  }

  expect(reachedByKeyboard, 'the completed step should be reachable by Tab').toBe(true);
  await expect(backToAccount).toBeFocused();
  await expect(exampleCard).toHaveScreenshot('stepper-linear-keyboard-focus.png', {
    animations: 'disabled',
  });
  await page.keyboard.press('Enter');
  await expect(items.nth(0)).toHaveAttribute('aria-current', 'step');

  await example.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(items.nth(1)).toHaveAttribute('aria-current', 'step');
  await backToAccount.focus();
  await expect(backToAccount).toBeFocused();
  await page.keyboard.press('Space');
  await expect(items.nth(0)).toHaveAttribute('aria-current', 'step');
});

test('shows vertical descriptions and all supported sizes', async ({ page }) => {
  const vertical = page.getByRole('group', {
    name: 'Vertical stepper with descriptions',
    exact: true,
  });
  const verticalList = vertical.getByRole('list', { name: 'Progress', exact: true });

  await expect(verticalList).toHaveAttribute('data-kui-orientation', 'vertical');
  await expect(verticalList.getByRole('listitem')).toHaveCount(3);
  await expect(vertical).toContainText('Name, email, and password');
  await expect(vertical).toHaveScreenshot('stepper-vertical-descriptions.png', {
    animations: 'disabled',
  });

  const sizes = page.getByRole('article').filter({
    has: page.getByRole('heading', { level: 2, name: 'Sizes', exact: true }),
  });

  for (const size of ['sm', 'md', 'lg']) {
    const row = sizes.getByRole('group', { name: `${size} size stepper`, exact: true });
    await expect(row.getByRole('list', { name: 'Progress', exact: true })).toHaveAttribute(
      'data-kui-size',
      size,
    );
    await expect(row.getByRole('listitem')).toHaveCount(3);
  }

  await expect(sizes).toHaveScreenshot('stepper-sizes-desktop.png', { animations: 'disabled' });
  await page.setViewportSize(tabletViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await expect(sizes).toHaveScreenshot('stepper-sizes-768.png', { animations: 'disabled' });
  await page.setViewportSize(mobileViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await expect(sizes).toHaveScreenshot('stepper-sizes-320.png', { animations: 'disabled' });
});

test('distinguishes explicit disabled from error-derived disabled steps', async ({ page }) => {
  const disabled = page.getByRole('group', {
    name: 'Stepper with an explicitly disabled step',
    exact: true,
  });
  const disabledItems = disabled.getByRole('listitem');

  await expect(disabledItems.nth(1)).toHaveAttribute('aria-current', 'step');
  await expect(disabledItems.nth(2)).toHaveAttribute('data-kui-state', 'disabled');
  await expect(disabledItems.nth(2).getByRole('button')).toHaveCount(0);
  await expect(disabled).toHaveScreenshot('stepper-disabled.png', { animations: 'disabled' });

  const error = page.getByRole('group', { name: 'Stepper with an error step', exact: true });
  const errorItems = error.getByRole('listitem');

  await expect(errorItems.nth(1)).toHaveAttribute('data-kui-state', 'error');
  await expect(errorItems.nth(1)).not.toHaveAttribute('aria-current');
  await expect(errorItems.nth(2)).toHaveAttribute('data-kui-state', 'disabled');
  await expect(errorItems.nth(2).getByRole('button')).toHaveCount(0);
  await expect(error).toHaveScreenshot('stepper-error.png', { animations: 'disabled' });

  await error.getByRole('button', { name: 'Toggle payment error', exact: true }).click();
  await expect(errorItems.nth(1)).toHaveAttribute('aria-current', 'step');
  await expect(errorItems.nth(2)).toHaveAttribute('data-kui-state', 'upcoming');
  await expect(error).not.toContainText('Card declined');
  await expect(error).toHaveScreenshot('stepper-error-cleared.png', { animations: 'disabled' });
});

test('keeps compact step names accessible while showing dots only', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Compact step progress', exact: true });
  const list = example.getByRole('list', { name: 'Progress', exact: true });

  await expect(list).toHaveAttribute('data-kui-compact', '');
  await expect(list.getByRole('listitem', { name: 'Account step', exact: true })).toHaveAttribute(
    'data-kui-state',
    'done',
  );
  await expect(list.getByRole('listitem', { name: 'Workspace step', exact: true })).toHaveAttribute(
    'aria-current',
    'step',
  );
  await expect(list.getByRole('listitem', { name: 'Review step', exact: true })).toHaveAttribute(
    'data-kui-state',
    'upcoming',
  );
  const circleWidths = await list
    .locator('.kui-step-circle')
    .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().width));
  expect(circleWidths).toEqual([10, 10, 10]);
  await expect(example).toHaveScreenshot('stepper-compact.png', { animations: 'disabled' });
});

test('allows an upcoming jump and completed-step return in non-linear mode', async ({ page }) => {
  const example = page.getByRole('group', {
    name: 'Non-linear navigation stepper',
    exact: true,
  });
  const list = example.getByRole('list', { name: 'Progress', exact: true });
  const items = list.getByRole('listitem');
  const reviewButton = example.getByRole('button', { name: 'Go to step Review', exact: true });

  await expect(items.nth(0)).toHaveAttribute('aria-current', 'step');
  await reviewButton.hover();
  await expect(example).toHaveScreenshot('stepper-nonlinear-hover.png', { animations: 'disabled' });
  await reviewButton.click();
  await expect(items.nth(2)).toHaveAttribute('aria-current', 'step');
  await expect(example).toHaveScreenshot('stepper-nonlinear-forward.png', {
    animations: 'disabled',
  });

  await example.getByRole('button', { name: 'Back to step Account', exact: true }).click();
  await expect(items.nth(0)).toHaveAttribute('aria-current', 'step');
});

test('server-renders, hydrates, and switches the Stepper translation scope', async ({ page }) => {
  const [localeResponse, shellLocaleResponse] = await Promise.all([
    page.request.get('/i18n/stepper/ru.json'),
    page.request.get('/i18n/ru.json'),
  ]);
  expect(localeResponse.ok()).toBeTruthy();
  expect(shellLocaleResponse.ok()).toBeTruthy();
  const translations = await localeResponse.json();
  const shellTranslations = await shellLocaleResponse.json();

  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  const response = await page.goto('/components/stepper');
  expect(response?.status()).toBe(200);
  const serverHtml = await response?.text();
  expect(serverHtml).toContain('role="list"');
  expect(serverHtml).toContain('data-kui-size="md"');
  expect(serverHtml).toContain('aria-current="step"');

  const heading = page.locator('#stepper-playground-title');
  await expect(heading).toHaveText('Stepper');
  await expect(page.getByRole('list', { name: 'Progress', exact: true }).first()).toBeVisible();

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(heading).toHaveText(translations.title);
  const russianDefault = page.getByRole('group', {
    name: translations.accessibility.default,
    exact: true,
  });
  await expect(russianDefault).toBeVisible();
  await expect(
    russianDefault.getByRole('list', {
      name: translations.accessibility.progress,
      exact: true,
    }),
  ).toBeVisible();
  await page.setViewportSize(mobileViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);

  await page
    .getByRole('button', { name: shellTranslations.playground.language, exact: true })
    .click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(heading).toHaveText('Stepper');

  await page.reload();
  await expect(heading).toHaveText('Stepper');
  expect(errors).toEqual([]);
});
