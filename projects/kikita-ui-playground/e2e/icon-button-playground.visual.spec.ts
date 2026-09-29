import { expect, test } from '../../../tests/e2e/support/fixtures';

const iconSvg = (contents: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${contents}</svg>`;

const LUCIDE_TEST_ICONS = {
  check: iconSvg('<path d="m5 12 4 4L19 6"/>'),
  moon: iconSvg('<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>'),
  palette: iconSvg(
    '<path d="M12 3a9 9 0 1 0 0 18h1.2a1.8 1.8 0 0 0 1.3-3c-.6-.7-.2-1.8.8-1.8H17a4 4 0 0 0 4-4c0-5.1-4.1-9.2-9-9.2Z"/><circle cx="7.5" cy="10" r=".5"/><circle cx="11" cy="7" r=".5"/><circle cx="15.5" cy="8" r=".5"/>',
  ),
  plus: iconSvg('<path d="M12 5v14"/><path d="M5 12h14"/>'),
  'rotate-ccw': iconSvg('<path d="M3 7v6h6"/><path d="M3.5 13a9 9 0 1 0 2.1-6.2L3 9"/>'),
  search: iconSvg('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>'),
  settings: iconSvg(
    '<circle cx="12" cy="12" r="3"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="m4.93 4.93 2.12 2.12"/><path d="m16.95 16.95 2.12 2.12"/><path d="M2 12h3"/><path d="M19 12h3"/><path d="m4.93 19.07 2.12-2.12"/><path d="m16.95 7.05 2.12-2.12"/>',
  ),
  sun: iconSvg(
    '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.42 1.42"/><path d="m17.65 17.65 1.42 1.42"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.93 19.07 1.42-1.42"/><path d="m17.65 6.35 1.42-1.42"/>',
  ),
  'trash-2': iconSvg(
    '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/>',
  ),
} satisfies Record<string, string>;

test.beforeEach(async ({ page }) => {
  await page.route('https://cdn.jsdelivr.net/npm/lucide-static@1/icons/*.svg', async (route) => {
    const iconName = new URL(route.request().url()).pathname.split('/').at(-1)?.replace('.svg', '');
    const svg = iconName
      ? LUCIDE_TEST_ICONS[iconName as keyof typeof LUCIDE_TEST_ICONS]
      : undefined;

    if (!svg) {
      await route.abort();
      throw new Error(`Add a deterministic Lucide SVG fixture for "${iconName ?? 'unknown'}".`);
    }

    await route.fulfill({ contentType: 'image/svg+xml', body: svg });
  });

  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('/components/icon-button');
});

for (const [size, fileName] of [
  ['Extra small', 'icon-button-size-xs.png'],
  ['Small', 'icon-button-size-sm.png'],
  ['Medium', 'icon-button-size-md.png'],
  ['Large', 'icon-button-size-lg.png'],
] as const) {
  test(`captures the ${size.toLowerCase()} icon button matrix`, async ({ page }) => {
    const matrix = page.getByRole('group', {
      name: `${size} icon button variants`,
      exact: true,
    });

    await matrix.scrollIntoViewIfNeeded();
    await expect(matrix.getByRole('button')).toHaveCount(20);
    await expect(matrix.locator('kui-icon svg')).toHaveCount(20);
    await expect(matrix).toHaveScreenshot(fileName, { animations: 'disabled' });
  });
}

test('captures the minimally configured default icon button', async ({ page }) => {
  const defaultExample = page.getByRole('group', {
    name: 'Default icon button example',
    exact: true,
  });
  const button = defaultExample.getByRole('button', { name: 'Add item', exact: true });

  await expect(button).toHaveAttribute('data-kui-shape', 'ghost');
  await expect(button).not.toHaveAttribute('data-kui-appearance');
  await expect(button).toHaveAttribute('data-kui-size', 'md');
  await expect(button).not.toHaveAttribute('data-kui-loading');
  await expect(button).not.toHaveAttribute('aria-disabled');
  await expect(button).not.toHaveAttribute('aria-busy');
  await expect(button).toBeEnabled();
  await expect(button.locator('kui-icon svg')).toBeVisible();
  await expect(button).toHaveScreenshot('icon-button-default.png', { animations: 'disabled' });
});

test('keeps the variant catalogue usable at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 1400 });

  const workspace = page.locator('.playground-shell__workspace');
  const matrix = page.getByRole('group', {
    name: 'Extra small icon button variants',
    exact: true,
  });

  await matrix.scrollIntoViewIfNeeded();

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  expect(await workspace.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollTop)).toBe(0);
  await expect(matrix).toHaveScreenshot('icon-button-mobile-xs.png', { animations: 'disabled' });
});

test('keeps the variant catalogue in two columns without page overflow at 768px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 1200 });

  const matrix = page.getByRole('group', {
    name: 'Extra small icon button variants',
    exact: true,
  });
  const groupNames = [
    'Extra small Solid variants',
    'Extra small Soft variants',
    'Extra small Outline variants',
    'Extra small Ghost variants',
  ];

  await matrix.scrollIntoViewIfNeeded();

  const groupBoxes = await Promise.all(
    groupNames.map((name) => matrix.getByRole('group', { name, exact: true }).boundingBox()),
  );

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(768);
  expect(groupBoxes.every((box) => box !== null)).toBe(true);

  const [solid, soft, outline, ghost] = groupBoxes;

  if (!solid || !soft || !outline || !ghost) {
    throw new Error('Expected all four named shape groups to be visible at the tablet viewport.');
  }

  expect(soft.x).toBeGreaterThan(solid.x);
  expect(outline.x).toBeCloseTo(solid.x, 0);
  expect(ghost.x).toBeCloseTo(soft.x, 0);
  await expect(matrix).toHaveScreenshot('icon-button-tablet-xs.png', { animations: 'disabled' });
});

test('captures disabled and loading states', async ({ page }) => {
  const states = page.getByRole('group', { name: 'Icon button states', exact: true });
  const disabledButton = states.getByRole('button', { name: 'Disabled settings', exact: true });
  const loadingButton = states.getByRole('button', { name: 'Loading save', exact: true });
  const disabledLink = states.getByRole('link', { name: 'Disabled settings link', exact: true });

  await expect(disabledButton).toBeDisabled();
  await expect(disabledButton).toHaveAttribute('aria-disabled', 'true');
  await expect(disabledButton).toHaveAttribute('tabindex', '-1');
  await expect(disabledButton.locator('kui-icon svg')).toBeVisible();
  await expect(disabledButton).toHaveScreenshot('icon-button-disabled-button.png', {
    animations: 'disabled',
  });

  await expect(loadingButton).toBeDisabled();
  await expect(loadingButton).toHaveAttribute('aria-busy', 'true');
  await expect(loadingButton).toHaveAttribute('aria-disabled', 'true');
  await expect(loadingButton.getByRole('status', { name: 'Loading' })).toBeVisible();
  await expect(loadingButton).toHaveScreenshot('icon-button-static-loading.png', {
    animations: 'disabled',
  });

  await expect(disabledLink).toHaveAttribute('aria-disabled', 'true');
  await expect(disabledLink).toHaveAttribute('tabindex', '-1');
  await expect(disabledLink.locator('kui-icon svg')).toBeVisible();
  await expect(disabledLink).toHaveScreenshot('icon-button-disabled-link.png', {
    animations: 'disabled',
  });
});

test('captures the keyboard-focused icon button state', async ({ page }) => {
  const states = page.getByRole('group', { name: 'Icon button states', exact: true });
  const saveButton = states.getByRole('button', { name: 'Save changes', exact: true });
  const focusedButton = states.getByRole('button', { name: 'Settings', exact: true });

  await expect(focusedButton.locator('kui-icon svg')).toBeVisible();
  await saveButton.focus();
  await saveButton.press('Tab');

  await expect(focusedButton).toBeFocused();
  expect(await focusedButton.evaluate((button) => button.matches(':focus-visible'))).toBe(true);
  await expect(states).toHaveScreenshot('icon-button-focused.png', {
    animations: 'disabled',
  });
});

test('captures pointer hover and pressed icon button states', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default icon button example', exact: true });
  const button = example.getByRole('button', { name: 'Add item', exact: true });

  await expect(button.locator('kui-icon svg')).toBeVisible();
  await button.hover();
  expect(await button.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect(button).toHaveScreenshot('icon-button-hover.png', { animations: 'disabled' });

  await page.mouse.down();
  expect(await button.evaluate((element) => element.matches(':active'))).toBe(true);
  await expect(button).toHaveCSS('transform', 'matrix(0.97, 0, 0, 0.97, 0, 0)');
  await expect(button).toHaveScreenshot('icon-button-pressed.png', { animations: 'disabled' });
  await page.mouse.up();
});

test('respects reduced motion for active icon buttons', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default icon button example', exact: true });
  const button = example.getByRole('button', { name: 'Add item', exact: true });

  await expect(button.locator('kui-icon svg')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await button.hover();
  await page.mouse.down();
  await expect(button).toHaveCSS('transform', 'matrix(0.97, 0, 0, 0.97, 0, 0)');
  await expect
    .poll(() => button.evaluate((element) => getComputedStyle(element).transitionProperty))
    .not.toBe('none');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect
    .poll(() => button.evaluate((element) => getComputedStyle(element).transitionProperty))
    .toBe('none');
  await expect(button).toHaveCSS('transform', 'none');
  await page.mouse.up();
});

test('captures icon source and link examples', async ({ page }) => {
  const examples = page.getByRole('group', { name: 'Icon source and link examples', exact: true });
  const deleteButton = examples.getByRole('button', { name: 'Delete item', exact: true });
  const statesLink = examples.getByRole('link', {
    name: 'Open icon button states',
    exact: true,
  });
  const projectedButton = examples.getByRole('button', {
    name: 'Add item with a custom icon source',
    exact: true,
  });
  const registeredAndProjectedButton = examples.getByRole('button', {
    name: 'Add item with registered and projected icons',
    exact: true,
  });

  await expect(deleteButton.locator('kui-icon svg')).toBeVisible();
  await expect(deleteButton).toHaveScreenshot('icon-button-source-registered-button.png', {
    animations: 'disabled',
  });
  await expect(statesLink.locator('kui-icon svg')).toBeVisible();
  await expect(statesLink).toHaveScreenshot('icon-button-source-registered-link.png', {
    animations: 'disabled',
  });
  await expect(projectedButton.locator('svg')).toBeVisible();
  await expect(projectedButton).toHaveScreenshot('icon-button-source-projected.png', {
    animations: 'disabled',
  });

  const orderedIcons = registeredAndProjectedButton.locator('kui-icon');

  await expect(orderedIcons.locator('svg')).toHaveCount(2);
  expect(
    await orderedIcons.evaluateAll((icons) =>
      icons.map((icon) => icon.getAttribute('data-icon-source')),
    ),
  ).toEqual([null, 'projected']);
  await expect(registeredAndProjectedButton).toHaveScreenshot(
    'icon-button-source-registered-and-projected.png',
    { animations: 'disabled' },
  );
});

test('toggles a live icon button into loading state', async ({ page }) => {
  const states = page.getByRole('group', { name: 'Icon button states', exact: true });
  const saveButton = states.getByRole('button', { name: 'Save changes', exact: true });

  await expect(saveButton).toBeEnabled();
  await expect(saveButton).not.toHaveAttribute('aria-busy');

  await states.getByRole('button', { name: 'Simulate loading', exact: true }).click();

  await expect(saveButton).toBeDisabled();
  await expect(saveButton).toHaveAttribute('aria-busy', 'true');
  await expect(saveButton.getByRole('status', { name: 'Loading' })).toBeVisible();
  await expect(states.locator('kui-icon svg')).toHaveCount(5);
  await expect(saveButton).toHaveScreenshot('icon-button-interactive-loading.png', {
    animations: 'disabled',
  });

  await states.getByRole('button', { name: 'Reset loading', exact: true }).click();

  await expect(saveButton).toBeEnabled();
  await expect(saveButton).not.toHaveAttribute('aria-busy');
});

test('keeps a disabled icon link out of tab order and prevents navigation', async ({ page }) => {
  const states = page.getByRole('group', { name: 'Icon button states', exact: true });
  const disabledLink = states.getByRole('link', { name: 'Disabled settings link', exact: true });
  const currentUrl = page.url();

  await expect(disabledLink).toHaveAttribute('aria-disabled', 'true');
  await expect(disabledLink).toHaveAttribute('tabindex', '-1');

  await disabledLink.click({ force: true });

  await expect(page).toHaveURL(currentUrl);
});

test('follows the enabled icon link to its named in-page states target', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'Icon Button' })).toBeVisible();
  const settingsLink = page.getByRole('link', {
    name: 'Open icon button states',
    exact: true,
  });
  const states = page.getByRole('group', { name: 'Icon button states', exact: true });

  await expect(settingsLink).toHaveAttribute('href', '/components/icon-button#icon-button-states');
  await expect(states).toHaveAttribute('id', 'icon-button-states');
  await settingsLink.click();
  await expect(page).toHaveURL(/\/components\/icon-button#icon-button-states$/);
  await expect(states).toBeInViewport();

  await expect(
    page
      .getByRole('button', { name: 'Add item with a custom icon source', exact: true })
      .locator('svg'),
  ).toBeVisible();
});

test('keeps translated icon button names available after switching to Russian', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();
  const russianAccessibleName = /[\u0400-\u04FF]/;

  await expect(page.locator('#icon-button-states')).toHaveAttribute(
    'aria-label',
    russianAccessibleName,
  );
  await expect(page.locator('main button[kuiIconButton][icon="plus"]')).toHaveAttribute(
    'aria-label',
    russianAccessibleName,
  );
  await expect(
    page.locator('main a[kuiIconButton][href="/components/icon-button#icon-button-states"]'),
  ).toHaveAttribute('aria-label', russianAccessibleName);
});
