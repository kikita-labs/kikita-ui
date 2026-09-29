import { expect, test } from '../../../tests/e2e/support/fixtures';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/components/badge');
});

test('captures the minimally configured default badge', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'Badge' })).toBeVisible();

  const example = page.getByRole('group', { name: 'Default badge example', exact: true });
  const badge = example.getByText('Neutral', { exact: true });

  await expect(badge).toHaveAttribute('data-kui-appearance', 'neutral');
  await expect(badge).toHaveAttribute('data-kui-size', 'md');
  await expect(example).toHaveScreenshot('badge-default.png');
});

test('captures every supported appearance and size combination', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1600 });

  const matrix = page.getByRole('group', {
    name: 'Badge appearance and size variants',
    exact: true,
  });
  const appearances = [
    ['neutral', 'Neutral', 'Neutral badge sizes'],
    ['primary', 'Primary', 'Primary badge sizes'],
    ['success', 'Success', 'Success badge sizes'],
    ['warning', 'Warning', 'Warning badge sizes'],
    ['danger', 'Danger', 'Danger badge sizes'],
    ['info', 'Info', 'Info badge sizes'],
  ] as const;
  const sizes = [
    ['Extra small', 'xs'],
    ['Small', 'sm'],
    ['Medium', 'md'],
    ['Large', 'lg'],
  ] as const;

  for (const [appearance, label, groupName] of appearances) {
    const row = matrix.getByRole('group', { name: groupName, exact: true });

    await expect(row.getByRole('heading', { level: 3 })).toHaveText(label);

    for (const [sizeLabel, size] of sizes) {
      const badge = row.getByText(sizeLabel, { exact: true });

      await expect(badge).toHaveAttribute('data-kui-appearance', appearance);
      await expect(badge).toHaveAttribute('data-kui-size', size);
    }
  }

  await expect(matrix).toHaveScreenshot('badge-appearance-size.png');
});

test('captures documented semantic host elements and follows the link host', async ({ page }) => {
  const hosts = page.getByRole('group', { name: 'Badge host element examples', exact: true });
  const link = hosts.getByRole('link', { name: 'Open badge link', exact: true });

  await expect(hosts.getByText('Neutral text', { exact: true })).toBeVisible();
  await expect(hosts.getByText('Ready', { exact: true })).toBeVisible();
  await expect(hosts.getByText('Review', { exact: true })).toBeVisible();
  await expect(link).toHaveAttribute('data-kui-appearance', 'info');
  await expect(link).toHaveAttribute('href', '#badge-playground-title');
  await expect(hosts).toHaveScreenshot('badge-host-elements.png');

  await link.focus();
  await expect(link).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#badge-playground-title$/);
});

test('keeps the appearance and size catalogue readable at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 1800 });

  const matrix = page.getByRole('group', {
    name: 'Badge appearance and size variants',
    exact: true,
  });

  await expect(matrix).toBeVisible();
  await expect(matrix).toHaveScreenshot('badge-appearance-size-320.png');

  const widths = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));

  expect(widths.document).toBeLessThanOrEqual(widths.viewport);
});
