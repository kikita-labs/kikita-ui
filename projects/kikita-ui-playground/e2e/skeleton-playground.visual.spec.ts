import { expect, test } from '../../../tests/e2e/support/fixtures';

const SHAPES = [
  ['text', 'Text'],
  ['heading', 'Heading'],
  ['rect', 'Rectangle'],
  ['circle', 'Circle'],
  ['square', 'Square'],
  ['button', 'Button'],
  ['badge', 'Badge'],
] as const;

const ANIMATIONS = [
  ['shimmer', 'Shimmer'],
  ['pulse', 'Pulse'],
  ['none', 'None'],
] as const;

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/components/skeleton');
});

test('renders the default Skeleton and every shape-animation combination @visual', async ({
  page,
}) => {
  await expect(
    page.getByRole('heading', { level: 1, name: 'Skeleton', exact: true }),
  ).toBeVisible();

  const defaultExample = page.getByRole('group', { name: 'Default Skeleton', exact: true });
  const defaultCard = page.locator('app-playground-example-card.skeleton-playground__default-card');
  const defaultSkeleton = defaultExample.locator('[kuiSkeleton]');
  await expect(defaultSkeleton).toHaveClass(/\bkui-skeleton\b/);
  await expect(defaultSkeleton).toHaveAttribute('data-kui-shape', 'rect');
  await expect(defaultSkeleton).toHaveAttribute('data-kui-animation', 'shimmer');
  await expect(defaultSkeleton).toHaveAttribute('aria-hidden', 'true');
  await expect(defaultExample.getByRole('status')).toHaveCount(0);
  await expect(defaultCard).toHaveScreenshot('skeleton-default.png');

  const matrix = page.getByRole('group', {
    name: 'Skeleton shape and animation matrix',
    exact: true,
  });

  for (const [shape, shapeLabel] of SHAPES) {
    const row = matrix.getByRole('group', { name: shapeLabel, exact: true });
    await expect(row.getByRole('group')).toHaveCount(ANIMATIONS.length);

    for (const [animation, animationLabel] of ANIMATIONS) {
      const skeleton = row
        .getByRole('group', { name: animationLabel, exact: true })
        .locator('[kuiSkeleton]');

      await expect(skeleton).toHaveAttribute('data-kui-shape', shape);
      await expect(skeleton).toHaveAttribute('data-kui-animation', animation);
      await expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    }
  }

  await expect(matrix).toHaveScreenshot('skeleton-shape-animation-matrix.png');
});

test('keeps Skeleton decorative while the consumer owns the busy-region lifecycle @visual', async ({
  page,
}) => {
  const example = page.getByRole('group', {
    name: 'Consumer-controlled loading region',
    exact: true,
  });
  const region = example.getByRole('region', { name: 'Workspace summary', exact: true });
  const showLoading = example.getByRole('button', { name: 'Show loading', exact: true });
  const showContent = example.getByRole('button', { name: 'Show ready content', exact: true });
  const skeletons = region.locator('[kuiSkeleton]');

  await expect(region).toHaveAttribute('aria-busy', 'true');
  await expect(skeletons).toHaveCount(3);
  await expect(region.getByRole('status')).toHaveCount(0);

  const hiddenPlaceholders = await skeletons.evaluateAll((elements) =>
    elements.every(
      (element) =>
        element.getAttribute('aria-hidden') === 'true' &&
        element.getAttribute('tabindex') === null &&
        (element as HTMLElement).tabIndex === -1,
    ),
  );
  expect(hiddenPlaceholders).toBe(true);
  await expect(example).toHaveScreenshot('skeleton-consumer-busy-region.png');

  await showContent.focus();
  await page.keyboard.press('Space');
  await expect(showContent).toBeFocused();
  await expect(region).toHaveAttribute('aria-busy', 'false');
  await expect(skeletons).toHaveCount(0);
  await expect(region.getByText('Workspace details are ready.', { exact: true })).toBeVisible();
  await expect(example).toHaveScreenshot('skeleton-consumer-ready-region.png');

  await showLoading.focus();
  await page.keyboard.press('Enter');
  await expect(showLoading).toBeFocused();
  await expect(region).toHaveAttribute('aria-busy', 'true');
  await expect(skeletons).toHaveCount(3);
});

test('switches the component scope to Russian without changing the Skeleton host contract', async ({
  page,
}) => {
  const response = await page.request.get('/i18n/skeleton/ru.json');
  expect(response.ok()).toBeTruthy();

  const russian: {
    title: string;
    accessibility: {
      default: string;
      matrix: string;
      consumerLifecycle: string;
    };
    shapes: {
      text: string;
    };
    animations: {
      none: string;
    };
    actions: {
      showContent: string;
    };
    content: {
      heading: string;
      ready: string;
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
  await expect(defaultExample.locator('[kuiSkeleton]')).toHaveAttribute('data-kui-shape', 'rect');

  const matrix = page.getByRole('group', { name: russian.accessibility.matrix, exact: true });
  const textRow = matrix.getByRole('group', { name: russian.shapes.text, exact: true });
  const staticText = textRow.getByRole('group', { name: russian.animations.none, exact: true });
  await expect(staticText.locator('[kuiSkeleton]')).toHaveAttribute('data-kui-animation', 'none');

  const lifecycle = page.getByRole('group', {
    name: russian.accessibility.consumerLifecycle,
    exact: true,
  });
  const region = lifecycle.getByRole('region', {
    name: russian.content.heading,
    exact: true,
  });
  await lifecycle.getByRole('button', { name: russian.actions.showContent, exact: true }).click();
  await expect(region.getByText(russian.content.ready, { exact: true })).toBeVisible();
  await expect(region).toHaveAttribute('aria-busy', 'false');
});

test('disables both animation layers under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  const matrix = page.getByRole('group', {
    name: 'Skeleton shape and animation matrix',
    exact: true,
  });
  const textRow = matrix.getByRole('group', { name: 'Text', exact: true });
  const shimmer = textRow
    .getByRole('group', { name: 'Shimmer', exact: true })
    .locator('[kuiSkeleton]');
  const pulse = textRow.getByRole('group', { name: 'Pulse', exact: true }).locator('[kuiSkeleton]');

  expect(
    await shimmer.evaluate((element) => getComputedStyle(element, '::after').animationName),
  ).toBe('kui-skeleton-shimmer');
  expect(await pulse.evaluate((element) => getComputedStyle(element).animationName)).toBe(
    'kui-skeleton-pulse',
  );

  await page.emulateMedia({ reducedMotion: 'reduce' });

  const animationNames = await page
    .locator('[kuiSkeleton]')
    .evaluateAll((elements) =>
      elements.flatMap((element) => [
        getComputedStyle(element).animationName,
        getComputedStyle(element, '::after').animationName,
      ]),
    );
  expect(animationNames.every((animationName) => animationName === 'none')).toBe(true);
});

test('renders and hydrates the direct Skeleton route without console errors', async ({ page }) => {
  const response = await page.request.get('/components/skeleton');
  expect(response.ok()).toBeTruthy();

  const markup = await response.text();
  expect(markup).toContain('aria-hidden="true"');
  expect(markup).toContain('data-kui-shape="rect"');
  expect(markup).toContain('data-kui-animation="shimmer"');
  expect(markup).toContain('aria-busy="true"');

  const consoleErrors: string[] = [];
  const runtimeErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  await page.goto('/components/skeleton');

  await expect(
    page.getByRole('heading', { level: 1, name: 'Skeleton', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('group', { name: 'Default Skeleton', exact: true }).locator('[kuiSkeleton]'),
  ).toHaveAttribute('aria-hidden', 'true');
  expect(consoleErrors).toEqual([]);
  expect(runtimeErrors).toEqual([]);
});

test('keeps all catalogue sections within desktop, tablet, and 320px viewports @visual', async ({
  page,
}) => {
  for (const viewport of [
    { width: 320, height: 900 },
    { width: 768, height: 900 },
    { width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport);

    const defaultCard = page.locator(
      'app-playground-example-card.skeleton-playground__default-card',
    );
    const matrix = page.getByRole('group', {
      name: 'Skeleton shape and animation matrix',
      exact: true,
    });
    const lifecycle = page.getByRole('group', {
      name: 'Consumer-controlled loading region',
      exact: true,
    });
    await expect(matrix.locator('[kuiSkeleton]')).toHaveCount(SHAPES.length * ANIMATIONS.length);
    await expect(lifecycle.getByRole('region', { name: 'Workspace summary' })).toHaveAttribute(
      'aria-busy',
      'true',
    );

    if (viewport.width <= 768) {
      const actionTargets = await lifecycle.getByRole('button').evaluateAll((buttons) =>
        buttons.map((button) => {
          const { height, width } = button.getBoundingClientRect();

          return { height, width };
        }),
      );
      expect(actionTargets.every(({ height, width }) => height >= 44 && width >= 44)).toBe(true);
    }

    const widths = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    expect(widths.document, `${viewport.width}px viewport`).toBeLessThanOrEqual(widths.viewport);

    if (viewport.width === 320) {
      await matrix.scrollIntoViewIfNeeded();

      const matrixRows = await matrix.locator('.skeleton-matrix__row').evaluateAll((rows) =>
        rows.map((row) => {
          const { bottom, top } = row.getBoundingClientRect();

          return { bottom, top };
        }),
      );
      expect(matrixRows).toHaveLength(SHAPES.length);
      expect(matrixRows.every(({ bottom, top }) => top >= 0 && bottom <= viewport.height)).toBe(
        true,
      );

      await expect(defaultCard).toHaveScreenshot('skeleton-default-320.png');
      await expect(matrix).toHaveScreenshot('skeleton-shape-animation-matrix-320.png');
      await expect(lifecycle).toHaveScreenshot('skeleton-consumer-busy-region-320.png');
    }

    if (viewport.width === 768) {
      await expect(matrix).toHaveScreenshot('skeleton-shape-animation-matrix-768.png');
    }
  }
});
