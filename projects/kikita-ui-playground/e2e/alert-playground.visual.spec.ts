import { expect, test } from './support/fixtures';
import { openWithHeldScripts, readDuplicateIds } from './support/ssr';

const appearances = [
  ['Neutral', 'neutral'],
  ['Info', 'info'],
  ['Success', 'success'],
  ['Warning', 'warning'],
  ['Danger', 'danger'],
] as const;

const shapes = [
  ['Soft alerts', 'soft', 'soft'],
  ['Outline alerts', 'outline', 'outline'],
  ['Solid alerts', 'solid', 'solid'],
] as const;

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/components/alert');
});

test('captures the minimally configured default alert @visual', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'Alert', exact: true })).toBeVisible();

  const example = page.getByRole('group', { name: 'Default alert example', exact: true });
  const alert = example.getByRole('status');

  await expect(alert).toHaveAttribute('data-kui-appearance', 'neutral');
  await expect(alert).toHaveAttribute('data-kui-shape', 'soft');
  await expect(alert).toHaveAttribute('data-kui-size', 'md');
  await expect(alert).toContainText('Changes are saved automatically.');
  await expect(alert.locator('.kui-alert__icon')).toHaveCount(0);
  await expect(
    alert.getByRole('button', { name: 'Close notification', exact: true }),
  ).toBeVisible();
  await expect(example).toHaveScreenshot('alert-default.png');
});

test('captures every appearance in every shape with the matching live-region role @visual', async ({
  page,
}) => {
  const matrix = page.getByRole('group', {
    name: 'Alert appearance and shape variants',
    exact: true,
  });

  for (const [groupName, shape, screenshot] of shapes) {
    const group = matrix.getByRole('group', { name: groupName, exact: true });

    await expect(group.locator('kui-alert')).toHaveCount(5);
    await expect(group.getByRole('alert')).toHaveCount(1);
    await expect(group.getByRole('status')).toHaveCount(4);

    for (const [title, appearance] of appearances) {
      const alert = group.locator(`kui-alert[data-kui-appearance="${appearance}"]`);

      await expect(alert).toHaveAttribute('data-kui-shape', shape);
      await expect(alert.locator('.kui-alert__title')).toHaveText(title);
      await expect(alert.locator('.kui-alert__icon')).toHaveCount(appearance === 'neutral' ? 0 : 1);
      await expect(alert).toHaveAttribute('aria-atomic', 'true');
      await expect(alert).toHaveAttribute(
        'aria-live',
        appearance === 'danger' ? 'assertive' : 'polite',
      );
    }

    await expect(group).toHaveScreenshot(`alert-shape-${screenshot}.png`);
  }
});

test('captures small and medium alerts with title, message, and action content @visual', async ({
  page,
}) => {
  const catalogue = page.getByRole('group', {
    name: 'Alert size and content variants',
    exact: true,
  });

  for (const [groupName, size] of [
    ['Small alerts', 'sm'],
    ['Medium alerts', 'md'],
  ] as const) {
    const group = catalogue.getByRole('group', { name: groupName, exact: true });
    const alerts = group.locator('kui-alert');

    await expect(alerts).toHaveCount(3);
    for (let index = 0; index < 3; index += 1) {
      await expect(alerts.nth(index)).toHaveAttribute('data-kui-size', size);
    }

    await expect(alerts.nth(0)).toHaveAttribute('data-kui-single-line', '');
    await expect(alerts.nth(1)).not.toHaveAttribute('data-kui-single-line');
    await expect(alerts.nth(2)).not.toHaveAttribute('data-kui-single-line');
    await expect(alerts.nth(2).getByRole('button', { name: 'Apply', exact: true })).toBeVisible();
  }

  await expect(catalogue).toHaveScreenshot('alert-size-content.png');
});

test('captures the banner stack without corner radius @visual', async ({ page }) => {
  const stack = page.getByRole('group', { name: 'Banner alerts', exact: true });
  const banners = stack.locator('kui-alert');

  await expect(banners).toHaveCount(6);
  for (let index = 0; index < 6; index += 1) {
    await expect(banners.nth(index)).toHaveAttribute('data-kui-banner', '');
  }

  const radius = await banners
    .first()
    .evaluate((element) => getComputedStyle(element).borderTopLeftRadius);
  expect(radius).toBe('0px');
  await expect(stack.getByRole('alert')).toHaveCount(1);
  await expect(stack).toHaveScreenshot('alert-banner.png');
});

test('captures icon, closable, and close label options @visual', async ({ page }) => {
  const options = page.getByRole('group', { name: 'Alert option examples', exact: true });
  const hiddenIcon = options.locator('kui-alert', { hasText: 'Icon hidden' });
  const notClosable = options.locator('kui-alert', { hasText: 'Not closable' });
  const neutral = options.locator('kui-alert', { hasText: 'Neutral never shows' });
  const customLabel = options.locator('kui-alert', { hasText: 'Custom close label' });

  await expect(hiddenIcon).toHaveAttribute('data-kui-appearance', 'info');
  await expect(hiddenIcon.locator('.kui-alert__icon')).toHaveCount(0);
  await expect(notClosable.getByRole('button')).toHaveCount(0);
  await expect(neutral.locator('.kui-alert__icon')).toHaveCount(0);
  await expect(
    customLabel.getByRole('button', { name: 'Dismiss this notice', exact: true }),
  ).toBeVisible();
  await expect(options).toHaveScreenshot('alert-options.png');
});

test('captures projected icon, title, and message content @visual', async ({ page }) => {
  const content = page.getByRole('group', { name: 'Custom content alerts', exact: true });
  const deploy = content.locator('kui-alert', { hasText: 'Deploy started' });
  const neutral = content.locator('kui-alert', { hasText: 'Neutral with icon' });
  const plan = content.locator('kui-alert', { hasText: 'Plan expiring' });
  const upload = content.locator('kui-alert', { hasText: 'Upload failed' });

  await expect(deploy.locator('svg.kui-alert__icon')).toHaveAttribute('aria-hidden', 'true');
  await expect(neutral).toHaveAttribute('data-kui-appearance', 'neutral');
  await expect(neutral.locator('svg.kui-alert__icon')).toBeVisible();
  await expect(plan.locator('.kui-alert__title .kui-badge')).toHaveText('5 days');
  await expect(plan).not.toContainText('Ignored title input');
  await expect(plan).toContainText('Renews automatically on the 5th.');
  await expect(upload.locator('p.kui-alert__message')).toContainText('Open the');
  await expect(upload.getByRole('link', { name: 'connection log', exact: true })).toBeVisible();
  await expect(content).toHaveScreenshot('alert-custom-content.png');
});

test('counts action clicks and keeps projected actions separate from the action output', async ({
  page,
}) => {
  const example = page.getByRole('group', { name: 'Alert action examples', exact: true });
  const renew = example.getByRole('button', { name: 'Renew', exact: true });

  await expect(example.getByText('Renew clicks: 0', { exact: true })).toBeVisible();
  await renew.click();
  await expect(example.getByText('Renew clicks: 1', { exact: true })).toBeVisible();
  await renew.focus();
  await page.keyboard.press('Enter');
  await expect(example.getByText('Renew clicks: 2', { exact: true })).toBeVisible();
  await page.keyboard.press('Space');
  await expect(example.getByText('Renew clicks: 3', { exact: true })).toBeVisible();

  await expect(example.getByText('Last action: none', { exact: true })).toBeVisible();
  await example.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(example.getByText('Last action: retry', { exact: true })).toBeVisible();
  await example.getByRole('button', { name: 'Discard', exact: true }).click();
  await expect(example.getByText('Last action: discard', { exact: true })).toBeVisible();
  await expect(example.getByText('Renew clicks: 3', { exact: true })).toBeVisible();
  await expect(example.locator('.kui-alert__action')).toHaveCount(1);
});

test('tabs through the action then the close button and never focuses the alert itself', async ({
  page,
}) => {
  const example = page.getByRole('group', { name: 'Alert action examples', exact: true });
  const alert = example.locator('kui-alert').first();

  await expect(alert).not.toHaveAttribute('tabindex');
  await example.getByRole('button', { name: 'Renew', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(
    alert.getByRole('button', { name: 'Close notification', exact: true }),
  ).toBeFocused();
});

test('does not leak the title input as a native title attribute', async ({ page }) => {
  const matrix = page.getByRole('group', {
    name: 'Alert appearance and shape variants',
    exact: true,
  });

  await expect(matrix.locator('kui-alert[title]')).toHaveCount(0);
});

test('captures real hover and keyboard focus on the action and close buttons @visual', async ({
  page,
}) => {
  const example = page.getByRole('group', { name: 'Alert action examples', exact: true });
  const alert = example.locator('kui-alert').first();
  const renew = alert.getByRole('button', { name: 'Renew', exact: true });
  const close = alert.getByRole('button', { name: 'Close notification', exact: true });

  await renew.hover();
  await expect(alert).toHaveScreenshot('alert-action-hover.png');

  await page.mouse.move(0, 0);
  // Keyboard input first, so the focus ring shown next is the keyboard focus-visible one.
  await page.keyboard.press('Tab');
  await renew.focus();
  await expect(renew).toBeFocused();
  await expect(alert).toHaveScreenshot('alert-action-focus.png');

  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await expect(alert).toHaveScreenshot('alert-close-focus.png');
});

test('announces polite status and assertive alert notices, then returns focus on close', async ({
  page,
}) => {
  const example = page.getByRole('group', {
    name: 'Live region and dismissal examples',
    exact: true,
  });
  const showSaved = example.getByRole('button', { name: 'Show saved notice', exact: true });
  const showFailed = example.getByRole('button', { name: 'Show failure notice', exact: true });

  await expect(example.getByRole('status')).toHaveCount(0);
  await expect(example.getByRole('alert')).toHaveCount(0);

  await showSaved.click();
  const saved = example.getByRole('status');
  await expect(saved).toHaveAttribute('aria-live', 'polite');
  await expect(saved).toHaveAttribute('aria-atomic', 'true');
  await expect(saved).toContainText('Your changes were saved.');

  await showFailed.click();
  const failed = example.getByRole('alert');
  await expect(failed).toHaveAttribute('aria-live', 'assertive');
  await expect(failed).toHaveAttribute('aria-atomic', 'true');

  await saved.getByRole('button', { name: 'Close notification', exact: true }).click();
  await expect(saved).toHaveCount(0);
  await expect(showSaved).toBeFocused();

  const close = failed.getByRole('button', { name: 'Close notification', exact: true });
  await close.focus();
  await page.keyboard.press('Escape');
  await expect(failed).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(failed).toHaveCount(0);
  await expect(showFailed).toBeFocused();
});

test('captures the dismissal scenario before and after showing both notices @visual', async ({
  page,
}) => {
  const example = page.getByRole('group', {
    name: 'Live region and dismissal examples',
    exact: true,
  });

  await expect(example).toHaveScreenshot('alert-live-regions-idle.png');
  await example.getByRole('button', { name: 'Show saved notice', exact: true }).click();
  await example.getByRole('button', { name: 'Show failure notice', exact: true }).click();
  await expect(example.getByRole('status')).toBeVisible();
  await expect(example.getByRole('alert')).toBeVisible();
  await expect(example).toHaveScreenshot('alert-live-regions-shown.png');
});

test('captures the appearance matrix in the light theme @visual', async ({ page }) => {
  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Switch to light theme', exact: true })
    .click();
  await expect(page.locator('html')).toHaveAttribute('data-kui-theme', 'light');

  const matrix = page.getByRole('group', {
    name: 'Alert appearance and shape variants',
    exact: true,
  });

  await expect(matrix).toHaveScreenshot('alert-appearance-shape-light.png');
});

test('uses the route scope after switching the shell language to Russian', async ({ page }) => {
  const response = await page.request.get(new URL('/i18n/alert/ru.json', page.url()).toString());
  expect(response.ok()).toBeTruthy();
  const russian: {
    title: string;
    accessibility: { default: string; liveRegions: string; options: string };
    actions: { showSaved: string };
    samples: {
      default: { message: string };
      options: { closeLabel: { label: string } };
      live: { saved: { message: string } };
    };
  } = await response.json();

  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Switch language to Russian', exact: true })
    .click();

  await expect(
    page.getByRole('heading', { level: 1, name: russian.title, exact: true }),
  ).toBeVisible();
  const example = page.getByRole('group', { name: russian.accessibility.default, exact: true });
  await expect(example).toContainText(russian.samples.default.message);

  const options = page.getByRole('group', { name: russian.accessibility.options, exact: true });
  await expect(
    options.getByRole('button', {
      name: russian.samples.options.closeLabel.label,
      exact: true,
    }),
  ).toBeVisible();

  const live = page.getByRole('group', { name: russian.accessibility.liveRegions, exact: true });
  await live.getByRole('button', { name: russian.actions.showSaved, exact: true }).click();
  await expect(live.getByRole('status')).toContainText(russian.samples.live.saved.message);
});

test('renders and hydrates the direct Alert route from server markup', async ({ page }) => {
  const held = await openWithHeldScripts(page, '/components/alert');
  const heading = page.getByRole('heading', { level: 1, name: 'Alert', exact: true });

  expect(held.serverHtml).toContain('ng-server-context="ssr"');
  expect(held.serverHtml).toContain('role="alert"');
  expect(held.serverHtml).toContain('role="status"');
  await expect(heading).toBeVisible();

  const defaultAlert = page
    .getByRole('group', { name: 'Default alert example', exact: true })
    .getByRole('status');
  await expect(defaultAlert).toHaveAttribute('data-kui-appearance', 'neutral');
  await defaultAlert.evaluate((element) => element.setAttribute('data-server-node', ''));

  held.release();

  const showSaved = page.getByRole('button', { name: 'Show saved notice', exact: true });
  await expect(async () => {
    await showSaved.click({ timeout: 1_000 });
    await expect(
      page
        .getByRole('group', { name: 'Live region and dismissal examples', exact: true })
        .getByRole('status'),
    ).toBeVisible({ timeout: 1_000 });
  }).toPass();

  await expect(defaultAlert).toHaveAttribute('data-server-node', '');
  expect(await readDuplicateIds(page)).toEqual([]);
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
    await expect(page.getByRole('group', { name: 'Banner alerts', exact: true })).toBeVisible();

    const widths = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));

    expect(widths.document, `${viewport.width}px: ${JSON.stringify(widths)}`).toBeLessThanOrEqual(
      widths.viewport,
    );
  }
});

test('captures each catalogue section at 320px @visual', async ({ page }) => {
  // Tall enough that the workspace scroll area shows a whole section without clipping it.
  await page.setViewportSize({ width: 320, height: 1800 });

  for (const category of ['Actions', 'Forms', 'Feedback']) {
    const toggle = page.getByRole('button', { name: category, exact: true });
    if ((await toggle.count()) > 0 && (await toggle.getAttribute('aria-expanded')) === 'true') {
      await toggle.click();
    }
  }

  const sections = [
    ['Default alert example', 'alert-default-320.png'],
    ['Soft alerts', 'alert-shape-soft-320.png'],
    ['Outline alerts', 'alert-shape-outline-320.png'],
    ['Solid alerts', 'alert-shape-solid-320.png'],
    ['Alert size and content variants', 'alert-size-content-320.png'],
    ['Banner alerts', 'alert-banner-320.png'],
    ['Alert option examples', 'alert-options-320.png'],
    ['Custom content alerts', 'alert-custom-content-320.png'],
    ['Alert action examples', 'alert-actions-320.png'],
  ] as const;

  for (const [name, screenshot] of sections) {
    const section = page.getByRole('group', { name, exact: true });
    await section.scrollIntoViewIfNeeded();
    await expect(section).toHaveScreenshot(screenshot);
  }

  const live = page.getByRole('group', { name: 'Live region and dismissal examples', exact: true });
  await live.getByRole('button', { name: 'Show saved notice', exact: true }).click();
  await live.getByRole('button', { name: 'Show failure notice', exact: true }).click();
  await expect(live.getByRole('alert')).toBeVisible();
  await expect(live).toHaveScreenshot('alert-live-regions-320.png');
});
