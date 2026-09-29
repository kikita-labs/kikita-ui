import { expect, test } from '../../../tests/e2e/support/fixtures';

const desktopViewport = { width: 1440, height: 1000 };
const mobileViewport = { width: 320, height: 844 };

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/components/separator');
});

test('captures the default separator', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default separator example', exact: true });
  const separator = example.getByRole('separator');

  await expect(page.getByRole('heading', { level: 1, name: 'Separator' })).toBeVisible();
  await expect(separator).toHaveCount(1);
  await expect(separator).toHaveAttribute('data-kui-appearance', 'default');
  await expect(separator).toHaveAttribute('data-kui-orientation', 'horizontal');
  await expect(separator).toHaveAttribute('data-kui-spacing', 'sm');
  await expect(separator).not.toHaveAttribute('aria-orientation');
  await expect(example).toHaveScreenshot('separator-default-desktop.png');

  await page.setViewportSize(mobileViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await expect(example).toHaveScreenshot('separator-default-320.png');
});

test('captures every horizontal appearance', async ({ page }) => {
  const example = page.getByRole('group', {
    name: 'Separator appearance examples',
    exact: true,
  });
  const separators = example.getByRole('separator');

  await expect(separators).toHaveCount(3);
  await expect
    .poll(() =>
      separators.evaluateAll((elements) =>
        elements.map((element) => element.getAttribute('data-kui-appearance')),
      ),
    )
    .toEqual(['subtle', 'default', 'strong']);
  await expect(example).toHaveScreenshot('separator-appearance-desktop.png');

  await page.setViewportSize(mobileViewport);
  await expect(example).toHaveScreenshot('separator-appearance-320.png');
});

test('captures every horizontal spacing value', async ({ page }) => {
  const example = page.getByRole('group', {
    name: 'Separator spacing examples',
    exact: true,
  });
  const separators = example.getByRole('separator');

  await expect(separators).toHaveCount(5);
  await expect
    .poll(() =>
      separators.evaluateAll((elements) =>
        elements.map((element) => element.getAttribute('data-kui-spacing')),
      ),
    )
    .toEqual(['none', 'xs', 'sm', 'md', 'lg']);
  await expect(example).toHaveScreenshot('separator-spacing-desktop.png');

  await page.setViewportSize(mobileViewport);
  await expect(example).toHaveScreenshot('separator-spacing-320.png');
});

test('captures vertical separators and their accessible orientation', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Vertical separator examples', exact: true });
  const separators = example.getByRole('separator');

  await expect(separators).toHaveCount(5);
  await expect
    .poll(() =>
      separators.evaluateAll((elements) =>
        elements.map((element) => element.getAttribute('aria-orientation')),
      ),
    )
    .toEqual(['vertical', 'vertical', 'vertical', 'vertical', 'vertical']);
  await expect(example).toHaveScreenshot('separator-vertical-desktop.png');

  await page.setViewportSize(mobileViewport);
  await expect(example).toHaveScreenshot('separator-vertical-320.png');
});
