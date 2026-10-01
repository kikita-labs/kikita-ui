import { expect, test } from './support/fixtures';

test('shows the full button variant matrix and native compositions', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/components/button');

  await expect(page.getByRole('heading', { level: 1, name: 'Button' })).toBeVisible();

  const defaultExample = page.getByRole('group', { name: 'Default button example', exact: true });
  await expect(defaultExample).toBeInViewport();
  await expect(defaultExample.getByRole('button', { name: 'Default', exact: true })).toBeEnabled();

  for (const size of ['Extra small', 'Small', 'Medium', 'Large']) {
    const matrix = page.getByRole('group', { name: `${size} button variants`, exact: true });

    await expect(matrix).toBeVisible();
    await expect(matrix.getByRole('button')).toHaveCount(20);
  }

  const composition = page.getByRole('group', { name: 'Button composition examples' });

  await expect(composition.getByRole('button', { name: 'Save with leading icon' })).toBeVisible();
  await expect(
    composition.getByRole('button', { name: 'Continue with trailing icon' }),
  ).toBeVisible();
  await expect(composition.getByRole('link', { name: 'Navigation link' })).toBeVisible();
  await expect(composition.getByRole('button', { name: /long label/ })).toBeVisible();
});

test('shows disabled and loading states and lets loading be toggled back', async ({ page }) => {
  await page.goto('/components/button');

  const states = page.getByRole('group', { name: 'Button states' });

  await expect(states.getByRole('button', { name: 'Disabled', exact: true })).toBeDisabled();
  await expect(states.getByRole('button', { name: /^Loading/ })).toBeDisabled();

  const disabledLink = states.getByRole('link', { name: 'Disabled link' });
  await expect(disabledLink).toHaveAttribute('aria-disabled', 'true');
  await expect(disabledLink).toHaveAttribute('tabindex', '-1');

  const currentUrl = page.url();
  await disabledLink.click({ force: true });
  await expect(page).toHaveURL(currentUrl);

  const interactiveButton = states.getByRole('button', { name: /Save/ });
  const toggle = states.getByRole('button', { name: 'Simulate loading' });

  await toggle.click();
  await expect(interactiveButton).toBeDisabled();
  await expect(interactiveButton).toHaveAttribute('aria-busy', 'true');

  await states.getByRole('button', { name: 'Reset loading' }).click();
  await expect(interactiveButton).toBeEnabled();
  await expect(interactiveButton).not.toHaveAttribute('aria-busy');
});

test('presses and releases a Button with real pointer input under production motion', async ({
  page,
}) => {
  await page.goto('/components/button');

  const states = page.getByRole('group', { name: 'Button states', exact: true });
  const button = states.getByRole('button', { name: 'Save', exact: true });

  await expect(button).toBeVisible();
  await button.hover();
  await expect(button).toHaveCSS('transform', 'none');

  await page.mouse.down();
  expect(await button.evaluate((element) => element.matches(':active'))).toBe(true);
  // The pressed scale exists only with motion allowed; the reduced-motion project removes it.
  await expect(button).not.toHaveCSS('transform', 'none');

  await page.mouse.up();
  await expect(button).toHaveCSS('transform', 'none');
});

test('honors scoped Button color hooks for every appearance that reads them', async ({ page }) => {
  await page.goto('/components/button');

  const matrix = page.getByRole('group', { name: 'Medium button variants', exact: true });
  const variant = (shape: string, appearance: string) =>
    matrix.getByRole('button', {
      name: `Medium ${shape} button, ${appearance} appearance`,
      exact: true,
    });
  const scopeHook = (name: string, value: string) =>
    matrix.evaluate(
      (element, [property, color]) => element.style.setProperty(property, color),
      [name, value],
    );

  await scopeHook('--kui-btn-danger-bg', 'rgb(1, 2, 3)');
  await scopeHook('--kui-btn-success-bg', 'rgb(4, 5, 6)');
  await scopeHook('--kui-btn-warning-bg', 'rgb(7, 8, 9)');
  await scopeHook('--kui-btn-solid-bg', 'rgb(10, 11, 12)');
  await scopeHook('--kui-btn-danger-fg', 'rgb(13, 14, 15)');

  await expect(variant('Solid', 'Danger')).toHaveCSS('background-color', 'rgb(1, 2, 3)');
  await expect(variant('Solid', 'Success')).toHaveCSS('background-color', 'rgb(4, 5, 6)');
  await expect(variant('Solid', 'Warning')).toHaveCSS('background-color', 'rgb(7, 8, 9)');
  await expect(variant('Solid', 'Primary')).toHaveCSS('background-color', 'rgb(10, 11, 12)');
  await expect(variant('Solid', 'Default')).toHaveCSS('background-color', 'rgb(10, 11, 12)');
  await expect(variant('Solid', 'Danger')).toHaveCSS('color', 'rgb(13, 14, 15)');
});

test('keeps the soft danger hover readable in the light theme', async ({ page }) => {
  await page.goto('/components/button');
  await page.locator('html').evaluate((element) => element.setAttribute('data-kui-theme', 'light'));

  const matrix = page.getByRole('group', { name: 'Medium button variants', exact: true });
  const softDanger = matrix.getByRole('button', {
    name: 'Medium Soft button, Danger appearance',
    exact: true,
  });
  const backgroundColor = () =>
    softDanger.evaluate((element) => getComputedStyle(element).backgroundColor);

  const resting = await backgroundColor();
  await softDanger.hover();
  await expect.poll(backgroundColor).not.toBe(resting);

  // Resolve the hover color to sRGB; a readable soft hover stays a light tint.
  const channels = await softDanger.evaluate((element) => {
    const context = document.createElement('canvas').getContext('2d');

    if (!context) {
      return [0, 0, 0];
    }

    context.fillStyle = getComputedStyle(element).backgroundColor;
    context.fillRect(0, 0, 1, 1);

    return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
  });

  expect(Math.min(...channels)).toBeGreaterThan(128);
});

test('lets a semantic color token set on an ancestor restyle Button in that scope', async ({
  page,
}) => {
  await page.goto('/components/button');

  const matrix = page.getByRole('group', { name: 'Medium button variants', exact: true });
  const solid = (appearance: string) =>
    matrix.getByRole('button', {
      name: `Medium Solid button, ${appearance} appearance`,
      exact: true,
    });
  const scope = (name: string, value: string) =>
    matrix.evaluate(
      (element, [property, color]) => element.style.setProperty(property, color),
      [name, value],
    );
  const outside = page.getByRole('group', { name: 'Small button variants', exact: true });
  const outsideDanger = outside.getByRole('button', {
    name: 'Small Solid button, Danger appearance',
    exact: true,
  });

  await scope('--kui-color-danger-fill', 'rgb(21, 22, 23)');
  await scope('--kui-color-primary-fill', 'rgb(31, 32, 33)');

  await expect(solid('Danger')).toHaveCSS('background-color', 'rgb(21, 22, 23)');
  await expect(solid('Primary')).toHaveCSS('background-color', 'rgb(31, 32, 33)');
  await expect(solid('Default')).toHaveCSS('background-color', 'rgb(31, 32, 33)');
  // The override stays inside its scope.
  await expect(outsideDanger).not.toHaveCSS('background-color', 'rgb(21, 22, 23)');
});
