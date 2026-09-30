import { expect, test } from './support/fixtures';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('/components/icon');
});

test('server-renders and hydrates the local named catalogue icon', async ({ page }) => {
  const response = await page.request.get('/components/icon');

  expect(response.ok()).toBe(true);

  const serverMarkup = await response.text();
  expect(serverMarkup).toContain('aria-label="Kikita UI brand mark"');
  const registeredIconStart = serverMarkup.indexOf('aria-label="Kikita UI brand mark"');
  const registeredIconEnd = serverMarkup.indexOf('</kui-icon>', registeredIconStart);
  const registeredIconMarkup = serverMarkup.slice(registeredIconStart, registeredIconEnd);

  expect(registeredIconMarkup).toContain('kui-icon__svg');
  expect(registeredIconMarkup).toContain('<svg');

  const pageIconNames = await page
    .locator('main kui-icon')
    .evaluateAll((icons) =>
      icons.map((icon) => icon.getAttribute('name')).filter((name) => name !== null),
    );
  expect(pageIconNames.length).toBeGreaterThan(0);
  expect(pageIconNames.every((name) => name === 'kikita-brand')).toBe(true);
  await expect(page.locator('main kui-icon img')).toHaveAttribute('src', '/favicon.ico');

  const runtimeErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.reload();
  await expect(
    page.getByRole('img', { name: 'Kikita UI brand mark', exact: true }).locator('svg'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(page.locator('main h1')).toHaveText(/[\u0400-\u04FF]/);
  expect(runtimeErrors).toEqual([]);
});

test('captures the minimally configured local brand icon @visual', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default icon example', exact: true });
  const icon = example.locator('kui-icon');

  await expect(page.getByRole('heading', { level: 1, name: 'Icon' })).toBeVisible();
  await expect(icon.locator('svg')).toBeVisible();
  await expect(icon).toHaveAttribute('aria-hidden', 'true');
  await expect(icon).not.toHaveAttribute('role');
  expect(await icon.evaluate((element) => element.style.getPropertyValue('--kui-icon-size'))).toBe(
    '1em',
  );
  const defaultDimensions = await icon.evaluate((element) => {
    const styles = getComputedStyle(element);

    return {
      blockSize: Number.parseFloat(styles.blockSize),
      fontSize: Number.parseFloat(styles.fontSize),
      inlineSize: Number.parseFloat(styles.inlineSize),
    };
  });
  expect(defaultDimensions.inlineSize).toBeCloseTo(defaultDimensions.fontSize, 2);
  expect(defaultDimensions.blockSize).toBeCloseTo(defaultDimensions.fontSize, 2);
  await expect(example).toHaveScreenshot('icon-default.png', { animations: 'disabled' });
});

test('shows every preset and preserves numeric and CSS string sizes @visual', async ({ page }) => {
  const catalogue = page.getByRole('group', { name: 'Icon size catalogue', exact: true });
  const presets = catalogue.getByRole('group', { name: 'Icon preset sizes', exact: true });
  const remSize = await page.evaluate(() =>
    Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
  );

  for (const size of ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl']) {
    const example = presets.getByRole('group', { name: `Icon size ${size}`, exact: true });
    const icon = example.locator('kui-icon');

    await expect(icon.locator('svg')).toBeVisible();
    expect(
      await icon.evaluate((element) => element.style.getPropertyValue('--kui-icon-size')),
    ).toBe(`var(--kui-icon-size-${size}, ${presetFallback(size)})`);
    const dimensions = await icon.evaluate((element) => {
      const styles = getComputedStyle(element);

      return {
        blockSize: Number.parseFloat(styles.blockSize),
        inlineSize: Number.parseFloat(styles.inlineSize),
      };
    });
    const expectedSize = Number.parseFloat(presetFallback(size)) * remSize;

    expect(dimensions.inlineSize).toBeCloseTo(expectedSize, 2);
    expect(dimensions.blockSize).toBeCloseTo(expectedSize, 2);
  }

  const numeric = catalogue.getByRole('group', { name: 'Numeric size 24 pixels', exact: true });
  const css = catalogue.getByRole('group', { name: 'CSS size 1.75em', exact: true });
  const numericDimensions = await numeric.locator('kui-icon').evaluate((element) => {
    const styles = getComputedStyle(element);

    return {
      blockSize: Number.parseFloat(styles.blockSize),
      inlineSize: Number.parseFloat(styles.inlineSize),
    };
  });
  expect(numericDimensions.inlineSize).toBe(24);
  expect(numericDimensions.blockSize).toBe(24);

  const cssDimensions = await css.locator('kui-icon').evaluate((element) => {
    const styles = getComputedStyle(element);

    return {
      blockSize: Number.parseFloat(styles.blockSize),
      fontSize: Number.parseFloat(styles.fontSize),
      inlineSize: Number.parseFloat(styles.inlineSize),
    };
  });
  expect(cssDimensions.inlineSize).toBeCloseTo(cssDimensions.fontSize * 1.75, 2);
  expect(cssDimensions.blockSize).toBeCloseTo(cssDimensions.fontSize * 1.75, 2);

  expect(
    await numeric
      .locator('kui-icon')
      .evaluate((element) => element.style.getPropertyValue('--kui-icon-size')),
  ).toBe('24px');
  expect(
    await css
      .locator('kui-icon')
      .evaluate((element) => element.style.getPropertyValue('--kui-icon-size')),
  ).toBe('1.75em');
  await expect(catalogue).toHaveScreenshot('icon-size-catalogue.png', {
    animations: 'disabled',
  });
});

test('captures registered, direct, image URL, and projected SVG sources @visual', async ({
  page,
}) => {
  const examples = page.getByRole('group', { name: 'Icon source examples', exact: true });
  const registered = examples.getByRole('group', { name: 'Registered name example', exact: true });
  const direct = examples.getByRole('group', { name: 'Direct SVG source example', exact: true });
  const image = examples.getByRole('group', { name: 'Image URL source example', exact: true });
  const projected = examples.getByRole('group', {
    name: 'Projected SVG source example',
    exact: true,
  });

  await expect(
    registered.getByRole('img', { name: 'Kikita UI brand mark', exact: true }).locator('svg'),
  ).toBeVisible();
  await expect(
    direct.getByRole('img', { name: 'Static SVG source', exact: true }).locator('svg'),
  ).toBeVisible();
  const imageIcon = image.getByRole('img', { name: 'Playground favicon', exact: true });
  await expect(imageIcon.locator('img')).toHaveAttribute('src', '/favicon.ico');
  await expect(imageIcon.locator('img')).toHaveAttribute('alt', '');
  await expect(
    projected.getByRole('img', { name: 'Projected SVG icon', exact: true }).locator('svg'),
  ).toBeVisible();

  await expect(examples).toHaveScreenshot('icon-source-examples.png', {
    animations: 'disabled',
  });
});

test('exposes decorative icons as hidden and labeled icons as images @visual', async ({ page }) => {
  const examples = page.getByRole('group', {
    name: 'Icon accessible name examples',
    exact: true,
  });
  const decorative = examples.getByRole('group', { name: 'Decorative icon example', exact: true });
  const labeled = examples.getByRole('group', { name: 'Labeled icon example', exact: true });

  await expect(decorative.locator('kui-icon')).toHaveAttribute('aria-hidden', 'true');
  await expect(decorative.locator('kui-icon')).not.toHaveAttribute('role');
  await expect(
    labeled.getByRole('img', { name: 'Kikita UI brand icon', exact: true }),
  ).toBeVisible();
  await expect(examples).toHaveScreenshot('icon-accessible-names.png', {
    animations: 'disabled',
  });
});

test('keeps currentColor icons visible across the shell themes @visual', async ({ page }) => {
  const examples = page.getByRole('group', { name: 'Icon source examples', exact: true });

  await expect(page.locator('html')).toHaveAttribute('data-kui-theme', 'dark');
  await expect(examples).toHaveScreenshot('icon-sources-dark.png', {
    animations: 'disabled',
  });

  await page.getByRole('button', { name: 'Switch to light theme', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-kui-theme', 'light');
  await expect(examples).toHaveScreenshot('icon-sources-light.png', {
    animations: 'disabled',
  });
});

test('keeps the catalogue within a 320px viewport @visual', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });

  const examples = page.getByRole('group', { name: 'Icon size catalogue', exact: true });
  const workspace = page.locator('.playground-shell__workspace');
  await examples.scrollIntoViewIfNeeded();

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  expect(await workspace.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollTop)).toBe(0);
  await expect(examples).toHaveScreenshot('icon-size-catalogue-320.png', {
    animations: 'disabled',
  });
});

function presetFallback(size: string): string {
  if (size === '2xs') return '0.75rem';
  if (size === 'xs') return '0.875rem';
  if (size === 'sm') return '1rem';
  if (size === 'md') return '1.25rem';
  if (size === 'lg') return '1.5rem';
  if (size === 'xl') return '2rem';

  return '2.5rem';
}
