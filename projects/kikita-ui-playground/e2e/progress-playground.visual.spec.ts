import { expect, test } from '../../../tests/e2e/support/fixtures';

const desktopViewport = { width: 1440, height: 1000 };
const tabletViewport = { width: 768, height: 1024 };
const mobileViewport = { width: 320, height: 844 };
const matrixSizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const matrixColors = ['primary', 'success', 'warning', 'danger', 'neutral'] as const;

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components/progress');
});

test('renders the minimal default with progressbar semantics in both themes', async ({ page }) => {
  await expect(
    page.getByRole('heading', { level: 1, name: 'Progress', exact: true }),
  ).toBeVisible();

  const example = page.getByRole('group', { name: 'Default progress example', exact: true });
  const progress = example.getByRole('progressbar', { name: 'Loading progress', exact: true });

  await expect(progress).toHaveAttribute('data-kui-size', 'md');
  await expect(progress).toHaveAttribute('data-kui-color', 'primary');
  await expect(progress).toHaveAttribute('data-kui-indeterminate', 'true');
  await expect(progress).toHaveAttribute('aria-valuemin', '0');
  await expect(progress).toHaveAttribute('aria-valuemax', '100');
  await expect(progress).not.toHaveAttribute('aria-valuenow');
  await expect(example).toHaveScreenshot('progress-default-dark.png');

  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Switch to light theme', exact: true })
    .click();
  await expect(example).toHaveScreenshot('progress-default-light.png');

  await page.setViewportSize(tabletViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await expect(example).toHaveScreenshot('progress-default-768.png');

  await page.setViewportSize(mobileViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await expect(example).toHaveScreenshot('progress-default-320.png');
});

test('shows every linear color and size combination with the xl thickness fallback', async ({
  page,
}) => {
  const matrix = page.getByRole('group', { name: 'Linear progress variants', exact: true });
  const progressbars = matrix.getByRole('progressbar');

  await expect(progressbars).toHaveCount(25);

  for (const size of matrixSizes) {
    const row = matrix.getByRole('group', { name: `${size} size variants`, exact: true });

    for (const color of matrixColors) {
      const name = `${color[0].toUpperCase()}${color.slice(1)} ${size} progress`;
      const progress = row.getByRole('progressbar', { name, exact: true });

      await expect(progress).toHaveAttribute('data-kui-size', size);
      await expect(progress).toHaveAttribute('data-kui-color', color);
      await expect(progress).toHaveAttribute('aria-valuenow', '60');
    }

    await expect(row).toHaveScreenshot(`progress-linear-size-${size}.png`);
  }

  const medium = matrix.getByRole('progressbar', { name: 'Primary md progress', exact: true });
  const extraLarge = matrix.getByRole('progressbar', { name: 'Primary xl progress', exact: true });
  await expect(extraLarge).toHaveAttribute('data-kui-size', 'xl');
  expect(await extraLarge.evaluate((element) => getComputedStyle(element).height)).toBe(
    await medium.evaluate((element) => getComputedStyle(element).height),
  );
  await page.setViewportSize(tabletViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await expect(matrix).toHaveScreenshot('progress-linear-matrix-768.png');
  await page.setViewportSize(mobileViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  for (const size of matrixSizes) {
    const row = matrix.getByRole('group', { name: `${size} size variants`, exact: true });
    await row.scrollIntoViewIfNeeded();
    await expect(row).toHaveScreenshot(`progress-linear-size-${size}-320.png`);
  }
});

test('shows every circular color and size combination with the xs geometry fallback', async ({
  page,
}) => {
  const matrix = page.getByRole('group', { name: 'Circular progress variants', exact: true });
  const progressbars = matrix.getByRole('progressbar');

  await expect(progressbars).toHaveCount(25);

  for (const size of matrixSizes) {
    const row = matrix.getByRole('group', { name: `${size} size variants`, exact: true });

    for (const color of matrixColors) {
      const name = `${color[0].toUpperCase()}${color.slice(1)} ${size} progress`;
      const progress = row.getByRole('progressbar', { name, exact: true });

      await expect(progress).toHaveAttribute('data-kui-size', size);
      await expect(progress).toHaveAttribute('data-kui-color', color);
      await expect(progress).toHaveAttribute('aria-valuenow', '60');
    }

    await expect(row).toHaveScreenshot(`progress-circular-size-${size}.png`);
  }

  const extraSmall = matrix.getByRole('progressbar', { name: 'Primary xs progress', exact: true });
  const medium = matrix.getByRole('progressbar', { name: 'Primary md progress', exact: true });
  const extraSmallBox = await extraSmall.boundingBox();
  const mediumBox = await medium.boundingBox();

  expect(extraSmallBox).not.toBeNull();
  expect(mediumBox).not.toBeNull();
  expect(extraSmallBox?.width).toBe(mediumBox?.width);
  expect(extraSmallBox?.height).toBe(mediumBox?.height);
  await expect(extraSmall).toHaveAttribute('data-kui-size', 'xs');
  await page.setViewportSize(tabletViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await expect(matrix).toHaveScreenshot('progress-circular-matrix-768.png');
  await page.setViewportSize(mobileViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  for (const size of matrixSizes) {
    const row = matrix.getByRole('group', { name: `${size} size variants`, exact: true });
    await row.scrollIntoViewIfNeeded();
    await expect(row).toHaveScreenshot(`progress-circular-size-${size}-320.png`);
  }
});

test('clamps finite values and treats an invalid static value as indeterminate', async ({
  page,
}) => {
  const examples = page.getByRole('group', { name: 'Progress values', exact: true });
  const cases = [
    ['Input -20, reports 0 percent', '0 percent progress', '0', '0%'],
    ['Input 0, reports 0 percent', '0 percent progress', '0', '0%'],
    ['Input 12.5, reports 12.5 percent', '12.5 percent progress', '12.5', '12.5%'],
    ['Input 50, reports 50 percent', '50 percent progress', '50', '50%'],
    ['Input 100, reports 100 percent', '100 percent progress', '100', '100%'],
    ['Input 120, reports 100 percent', '100 percent progress', '100', '100%'],
  ] as const;

  for (const [groupName, progressName, value, fillWidth] of cases) {
    const example = examples.getByRole('group', { name: groupName, exact: true });
    const progress = example.getByRole('progressbar', { name: progressName, exact: true });

    await expect(progress).toHaveAttribute('aria-valuenow', value);
    await expect
      .poll(() =>
        progress.evaluate(
          (element) => element.querySelector<HTMLElement>('.kui-progress-linear-fill')?.style.width,
        ),
      )
      .toBe(fillWidth);
  }

  const invalid = examples.getByRole('group', { name: 'Invalid numeric value', exact: true });
  const invalidProgress = invalid.getByRole('progressbar', {
    name: 'Invalid input, indeterminate progress',
    exact: true,
  });
  await expect(invalidProgress).toHaveAttribute('data-kui-indeterminate', 'true');
  await expect(invalidProgress).not.toHaveAttribute('aria-valuenow');
  await expect(examples).toHaveScreenshot('progress-values.png');

  await page.setViewportSize(tabletViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await expect(examples).toHaveScreenshot('progress-values-768.png');

  await page.setViewportSize(mobileViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await expect(examples).toHaveScreenshot('progress-values-320.png');
});

test('records the linear reduced-motion cascade gap and disables circular motion under reduce', async ({
  page,
}) => {
  await expect
    .poll(() => page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true);

  const linearGroup = page.getByRole('group', {
    name: 'Indeterminate linear example',
    exact: true,
  });
  const linear = linearGroup.getByRole('progressbar', { name: 'Loading progress', exact: true });
  const circularGroup = page.getByRole('group', {
    name: 'Indeterminate circular example',
    exact: true,
  });
  const circular = circularGroup.getByRole('progressbar', {
    name: 'Loading progress',
    exact: true,
  });

  await expect(linear).toHaveAttribute('data-kui-indeterminate', 'true');
  await expect(circular).toHaveAttribute('data-kui-indeterminate', 'true');
  // The later, equal-specificity linear indeterminate rule overrides `animation: none`.
  await expect
    .poll(() =>
      linear.evaluate((element) => {
        const fill = element.querySelector('.kui-progress-linear-fill');
        if (!fill) return null;
        const style = getComputedStyle(fill);
        return { name: style.animationName, iterationCount: style.animationIterationCount };
      }),
    )
    .toEqual({ name: 'kui-progress-slide', iterationCount: 'infinite' });
  await expect
    .poll(() =>
      linear.evaluate((element) => {
        const fill = element.querySelector('.kui-progress-linear-fill');
        return fill
          ? fill.getBoundingClientRect().width / element.getBoundingClientRect().width
          : -1;
      }),
    )
    .toBeCloseTo(0.35, 2);
  await expect
    .poll(() =>
      circular.evaluate((element) => {
        const svg = element.querySelector('svg');
        return svg ? getComputedStyle(svg).animationName : 'missing';
      }),
    )
    .toBe('none');
  const examples = page.getByRole('group', { name: 'Indeterminate progress shapes' });
  await expect(examples).toHaveScreenshot('progress-indeterminate.png');

  await page.setViewportSize(tabletViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await expect(examples).toHaveScreenshot('progress-indeterminate-768.png');

  await page.setViewportSize(mobileViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await expect(examples).toHaveScreenshot('progress-indeterminate-320.png');
});

test('uses indeterminate animations when reduced motion is not requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  await expect
    .poll(() => page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(false);

  const linear = page
    .getByRole('group', { name: 'Indeterminate linear example', exact: true })
    .getByRole('progressbar', { name: 'Loading progress', exact: true });
  const circular = page
    .getByRole('group', { name: 'Indeterminate circular example', exact: true })
    .getByRole('progressbar', { name: 'Loading progress', exact: true });

  await expect
    .poll(() =>
      linear.evaluate((element) => {
        const fill = element.querySelector('.kui-progress-linear-fill');
        return fill ? getComputedStyle(fill).animationName : 'missing';
      }),
    )
    .toBe('kui-progress-slide');
  await expect
    .poll(() =>
      circular.evaluate((element) => {
        const svg = element.querySelector('svg');
        return svg ? getComputedStyle(svg).animationName : 'missing';
      }),
    )
    .toBe('kui-progress-spin');
});

test('composes external linear labels and projected circular center content', async ({ page }) => {
  const external = page.getByRole('group', {
    name: 'External linear label composition',
    exact: true,
  });
  await expect(external.getByText('Uploading report', { exact: true })).toBeVisible();
  await expect(external.getByText('68%', { exact: true })).toBeVisible();
  await expect(
    external.getByRole('progressbar', { name: 'Upload report, 68 percent' }),
  ).toHaveAttribute('aria-valuenow', '68');

  const centerLabel = page.getByRole('group', {
    name: 'Circular center label composition',
    exact: true,
  });
  await expect(centerLabel.getByText('72%', { exact: true })).toBeVisible();
  await expect(
    centerLabel.getByRole('progressbar', { name: 'Profile completion, 72 percent' }),
  ).toHaveAttribute('aria-valuenow', '72');

  const compositions = page.getByRole('group', { name: 'Progress compositions', exact: true });
  await expect(compositions).toHaveScreenshot('progress-compositions.png');

  await page.setViewportSize(tabletViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await expect(compositions).toHaveScreenshot('progress-compositions-768.png');

  await page.setViewportSize(mobileViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await expect(compositions).toHaveScreenshot('progress-compositions-320.png');
});

test('updates the consumer value through real range keyboard input', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Consumer-controlled progress', exact: true });
  const slider = example.getByRole('slider', { name: 'Progress value', exact: true });
  const progress = example.getByRole('progressbar', {
    name: 'Current progress, 35 percent',
    exact: true,
  });

  await expect(slider).toHaveValue('35');
  await expect(progress).toHaveAttribute('aria-valuenow', '35');
  await slider.focus();
  await expect(slider).toBeFocused();
  await slider.press('ArrowRight');
  await expect(slider).toHaveValue('40');
  await expect(
    example.getByRole('progressbar', { name: 'Current progress, 40 percent' }),
  ).toHaveAttribute('aria-valuenow', '40');
  await expect(example.getByText('40%', { exact: true })).toBeVisible();
  await expect(example.getByRole('status')).toHaveCount(0);
  await expect(example).toHaveScreenshot('progress-live-keyboard.png');

  await page.setViewportSize(tabletViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await expect(example).toHaveScreenshot('progress-live-768.png');

  await page.setViewportSize(mobileViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await expect(example).toHaveScreenshot('progress-live-320.png');
});

test('loads the Russian route scope after the shell language changes', async ({ page }) => {
  const response = await page.request.get(new URL('/i18n/progress/ru.json', page.url()).toString());
  expect(response.ok()).toBeTruthy();
  const russian = (await response.json()) as {
    title: string;
    accessibility: {
      defaultGroup: string;
      defaultProgress: string;
      liveGroup: string;
      liveProgress: string;
    };
    labels: { range: string };
  };

  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Switch language to Russian', exact: true })
    .click();

  await expect(
    page.getByRole('heading', { level: 1, name: russian.title, exact: true }),
  ).toBeVisible();
  const example = page.getByRole('group', {
    name: russian.accessibility.defaultGroup,
    exact: true,
  });
  await expect(
    example.getByRole('progressbar', { name: russian.accessibility.defaultProgress, exact: true }),
  ).toBeVisible();

  const liveExample = page.getByRole('group', {
    name: russian.accessibility.liveGroup,
    exact: true,
  });
  const slider = liveExample.getByRole('slider', { name: russian.labels.range, exact: true });

  await expect(slider).toHaveValue('35');
  await expect(
    liveExample.getByRole('progressbar', {
      name: russian.accessibility.liveProgress.replace('{{value}}', '35'),
      exact: true,
    }),
  ).toHaveAttribute('aria-valuenow', '35');

  await slider.focus();
  await slider.press('ArrowRight');
  await expect(slider).toHaveValue('40');
  await expect(
    liveExample.getByRole('progressbar', {
      name: russian.accessibility.liveProgress.replace('{{value}}', '40'),
      exact: true,
    }),
  ).toHaveAttribute('aria-valuenow', '40');
});

test('server renders and hydrates the direct Progress route without browser errors', async ({
  page,
}) => {
  const response = await page.request.get('/components/progress');
  expect(response.ok()).toBeTruthy();
  const markup = await response.text();

  expect(markup).toContain('id="progress-playground-title"');
  expect(markup).toContain('aria-label="Loading progress"');
  expect(markup).toContain('data-kui-size="md"');
  expect(markup).toContain('data-kui-indeterminate="true"');

  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  await page.goto('/components/progress');

  await expect(
    page.getByRole('heading', { level: 1, name: 'Progress', exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole('group', { name: 'Default progress example', exact: true })
      .getByRole('progressbar', { name: 'Loading progress', exact: true }),
  ).toHaveAttribute('data-kui-indeterminate', 'true');
  expect(consoleErrors).toEqual([]);
});
