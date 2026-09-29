import { expect, test } from '../../../tests/e2e/support/fixtures';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/components/loader');
});

test('renders the minimal default and every supported size', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'Loader', exact: true })).toBeVisible();

  const defaultExample = page.getByRole('group', { name: 'Default Loader example', exact: true });
  const defaultLoader = defaultExample.getByRole('status', { name: 'Loading', exact: true });
  await expect(defaultLoader).toHaveAttribute('data-kui-size', 'md');
  await expect(defaultLoader).toHaveAttribute('aria-live', 'polite');
  await expect(defaultExample).toHaveScreenshot('loader-default.png');

  const sizes = page.getByRole('group', { name: 'Loader sizes', exact: true });
  const sizeExamples = [
    ['Extra small', 'Extra small Loader', 'xs'],
    ['Small', 'Small Loader', 'sm'],
    ['Medium', 'Medium Loader', 'md'],
    ['Large', 'Large Loader', 'lg'],
  ] as const;

  for (const [label, accessibleName, size] of sizeExamples) {
    const example = sizes.getByRole('group', { name: label, exact: true });
    const loader = example.getByRole('status', { name: accessibleName, exact: true });

    await expect(loader).toHaveAttribute('data-kui-size', size);
    await expect(loader).toHaveAttribute('aria-live', 'polite');
  }

  await expect(sizes).toHaveScreenshot('loader-sizes.png');
});

test('preserves Loader status semantics in button and field compositions', async ({ page }) => {
  const compositions = page.getByRole('group', { name: 'Loader compositions', exact: true });
  const savingExample = compositions.getByRole('group', {
    name: 'Disabled saving button with Loader',
    exact: true,
  });
  const savingButton = savingExample.getByRole('button');
  const savingStatus = savingExample.getByRole('status', { name: 'Saving', exact: true });

  await expect(savingButton).toBeDisabled();
  await expect(savingStatus).toHaveAttribute('aria-label', 'Saving');
  await expect(savingStatus).toHaveAttribute('data-kui-size', 'sm');
  await expect(savingStatus).toHaveAttribute('aria-live', 'polite');

  const fieldExample = compositions.getByRole('group', {
    name: 'Loader checking an API token',
    exact: true,
  });
  const apiToken = fieldExample.getByRole('textbox', { name: 'API token', exact: true });
  const fieldStatus = fieldExample.getByRole('status', {
    name: 'Checking API token',
    exact: true,
  });

  await expect(apiToken).toHaveAttribute('readonly', '');
  await expect(fieldStatus).toHaveAttribute('aria-live', 'polite');
  await expect(fieldStatus).not.toHaveAttribute('aria-hidden', 'true');
  await expect(compositions).toHaveScreenshot('loader-compositions.png');
});

test('adds and removes a consumer-owned status through native keyboard actions', async ({
  page,
}) => {
  const example = page.getByRole('group', {
    name: 'Consumer-controlled loading status',
    exact: true,
  });
  const startCheck = example.getByRole('button', { name: 'Start check', exact: true });
  const completeCheck = example.getByRole('button', { name: 'Complete check', exact: true });

  await expect(example.getByRole('status')).toHaveCount(0);
  await expect(example).toHaveScreenshot('loader-consumer-status-idle.png');
  await startCheck.press('Enter');

  const status = example.getByRole('status', { name: 'Checking for updates', exact: true });
  await expect(status).toBeVisible();
  await expect(status).toHaveAttribute('data-kui-size', 'md');
  await expect(status).toHaveAttribute('aria-live', 'polite');
  await expect(startCheck).toBeFocused();
  await expect(example).toHaveScreenshot('loader-consumer-status-active.png');

  await completeCheck.press('Enter');
  await expect(example.getByRole('status')).toHaveCount(0);
  await expect(completeCheck).toBeFocused();
  await expect(example).toHaveScreenshot('loader-consumer-status-completed.png');
});

test('uses the route scope after switching the shell language to Russian', async ({ page }) => {
  const response = await page.request.get(new URL('/i18n/loader/ru.json', page.url()).toString());
  expect(response.ok()).toBeTruthy();
  const russian: {
    title: string;
    accessibility: {
      default: string;
      sizes: string;
      small: string;
      consumerStatus: string;
      checking: string;
    };
    actions: {
      startCheck: string;
    };
  } = await response.json();

  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Switch language to Russian', exact: true })
    .click();

  await expect(
    page.getByRole('heading', { level: 1, name: russian.title, exact: true }),
  ).toBeVisible();
  const defaultExample = page.getByRole('group', {
    name: russian.accessibility.default,
    exact: true,
  });
  await expect(defaultExample.getByRole('status', { name: 'Loading', exact: true })).toBeVisible();

  const sizes = page.getByRole('group', { name: russian.accessibility.sizes, exact: true });
  await expect(
    sizes.getByRole('status', { name: russian.accessibility.small, exact: true }),
  ).toBeVisible();

  const consumerStatus = page.getByRole('group', {
    name: russian.accessibility.consumerStatus,
    exact: true,
  });
  await consumerStatus
    .getByRole('button', { name: russian.actions.startCheck, exact: true })
    .click();
  await expect(
    consumerStatus.getByRole('status', { name: russian.accessibility.checking, exact: true }),
  ).toBeVisible();
});

test('renders and hydrates the direct Loader route without console errors', async ({ page }) => {
  const response = await page.request.get('/components/loader');
  expect(response.ok()).toBeTruthy();
  const markup = await response.text();
  const headings = [...markup.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map(([, heading]) =>
    heading
      .replace(/<[^>]+>/g, '')
      .trim()
      .toLocaleLowerCase(),
  );

  expect(headings).toContain('loader');
  expect(markup).toContain('aria-label="Loading"');
  expect(markup).toContain('data-kui-size="md"');

  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  await page.goto('/components/loader');

  await expect(page.getByRole('heading', { level: 1, name: 'Loader', exact: true })).toBeVisible();
  await expect(
    page.getByRole('group', { name: 'Default Loader example', exact: true }).getByRole('status'),
  ).toHaveAttribute('data-kui-size', 'md');
  expect(consoleErrors).toEqual([]);
});

test('keeps every catalogue section within desktop, tablet, and 320px viewports', async ({
  page,
}) => {
  for (const viewport of [
    { width: 320, height: 900 },
    { width: 768, height: 900 },
    { width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport);

    const sizes = page.getByRole('group', { name: 'Loader sizes', exact: true });
    const compositions = page.getByRole('group', { name: 'Loader compositions', exact: true });
    const defaultExample = page.getByRole('group', {
      name: 'Default Loader example',
      exact: true,
    });
    const consumerStatus = page.getByRole('group', {
      name: 'Consumer-controlled loading status',
      exact: true,
    });
    await expect(sizes.getByRole('status')).toHaveCount(4);
    await expect(compositions.getByRole('group')).toHaveCount(2);

    const widths = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    expect(
      widths.document,
      `${viewport.width}px viewport: ${JSON.stringify(widths)}`,
    ).toBeLessThanOrEqual(widths.viewport);

    if (viewport.width === 320) {
      await expect(defaultExample).toHaveScreenshot('loader-default-320.png');
      await expect(sizes).toHaveScreenshot('loader-sizes-320.png');
      await expect(compositions).toHaveScreenshot('loader-compositions-320.png');
      await expect(consumerStatus).toHaveScreenshot('loader-consumer-status-idle-320.png');

      await consumerStatus.getByRole('button', { name: 'Start check', exact: true }).click();
      await expect(consumerStatus.getByRole('status')).toBeVisible();
      await expect(consumerStatus).toHaveScreenshot('loader-consumer-status-active-320.png');
    }

    if (viewport.width === 768) {
      await expect(sizes).toHaveScreenshot('loader-sizes-768.png');
    }
  }
});

test('slows the spinner under the reduced-motion preference', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });

  const loader = page
    .getByRole('group', { name: 'Default Loader example', exact: true })
    .getByRole('status', { name: 'Loading', exact: true });
  const duration = await loader.evaluate((element) => getComputedStyle(element).animationDuration);

  expect(duration).toBe('1.6s');
});
