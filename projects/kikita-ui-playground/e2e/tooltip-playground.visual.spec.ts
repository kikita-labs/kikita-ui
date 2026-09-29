import type { Locator, Page } from '@playwright/test';

import { expect, test } from '../../../tests/e2e/support/fixtures';

const desktopViewport = { width: 1440, height: 1000 };
const mobileViewport = { width: 320, height: 844 };

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/components/tooltip');
});

test('server-renders and hydrates the Tooltip page without creating an inactive overlay', async ({
  page,
}) => {
  const response = await page.request.get('/components/tooltip');

  expect(response.ok()).toBe(true);

  const serverMarkup = await response.text();
  expect(serverMarkup).toContain('Tooltip');
  expect(serverMarkup).toContain('Top (default)');
  expect(serverMarkup).not.toContain('role="tooltip"');

  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.goto('/components/tooltip');
  await expect(page.getByRole('heading', { level: 1, name: 'Tooltip' })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Tooltip placement examples' })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('loads the Tooltip scope and switches its accessible names to Russian', async ({ page }) => {
  const localeResponse = await page.request.get('/i18n/tooltip/ru.json');
  expect(localeResponse.ok()).toBeTruthy();
  const translations = await localeResponse.json();

  await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(
    page.getByRole('heading', { level: 1, name: translations.title, exact: true }),
  ).toBeVisible();
  const placements = page.getByRole('group', {
    name: translations.accessibility.placements,
    exact: true,
  });
  const trigger = placements.getByRole('button', {
    name: translations.placement.top,
    exact: true,
  });
  await expect(trigger).toBeVisible();
  await trigger.hover();

  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toHaveText(translations.messages.top);
  await expectDescriptionLink(trigger, tooltip);
});

test('captures every Tooltip catalogue group at desktop and 320px @visual', async ({ page }) => {
  const groups = [
    {
      name: 'Tooltip placement examples',
      desktop: 'tooltip-placement-catalogue-desktop.png',
      mobile: 'tooltip-placement-catalogue-320.png',
    },
    {
      name: 'Tooltip interaction mode examples',
      desktop: 'tooltip-trigger-modes-desktop.png',
      mobile: 'tooltip-trigger-modes-320.png',
    },
    {
      name: 'Tooltip content and trigger examples',
      desktop: 'tooltip-content-catalogue-desktop.png',
      mobile: 'tooltip-content-catalogue-320.png',
    },
    {
      name: 'Tooltip scoped default examples',
      desktop: 'tooltip-provider-catalogue-desktop.png',
      mobile: 'tooltip-provider-catalogue-320.png',
    },
  ] as const;

  for (const group of groups) {
    await expect(page.getByRole('group', { name: group.name, exact: true })).toHaveScreenshot(
      group.desktop,
      { animations: 'disabled' },
    );
  }

  await page.setViewportSize(mobileViewport);
  await collapseMobileSidebar(page);
  await expectNoHorizontalOverflow(page);

  for (const group of groups) {
    await expect(page.getByRole('group', { name: group.name, exact: true })).toHaveScreenshot(
      group.mobile,
      { animations: 'disabled' },
    );
  }
});

test('shows the default placement and captures each supported placement @visual', async ({
  page,
}) => {
  const placements = page.getByRole('group', { name: 'Tooltip placement examples', exact: true });
  const examples = [
    { name: 'Top (default)', placement: 'top', message: 'Shown above the trigger.' },
    { name: 'Bottom', placement: 'bottom', message: 'Shown below the trigger.' },
    { name: 'Left', placement: 'left', message: 'Shown to the left of the trigger.' },
    { name: 'Right', placement: 'right', message: 'Shown to the right of the trigger.' },
  ] as const;

  await expect(placements.getByRole('button')).toHaveCount(examples.length);
  for (const { name, placement, message } of examples) {
    const trigger = placements.getByRole('button', { name, exact: true });
    const tooltip = page.getByRole('tooltip');

    await trigger.hover();
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText(message);
    await expect(tooltip).toHaveAttribute('data-kui-placement', placement);
    await expectDescriptionLink(trigger, tooltip);
    await expectPlacementGeometry(trigger, tooltip, placement);
    await captureTriggerAndTooltip(page, trigger, tooltip, `tooltip-placement-${placement}.png`);

    await page.mouse.move(1, 1);
    await expect(tooltip).toHaveCount(0);
  }
});

test('opens adaptive and hover modes on real mouse hover and captures the icon trigger @visual', async ({
  page,
}) => {
  const modes = page.getByRole('group', {
    name: 'Tooltip interaction mode examples',
    exact: true,
  });
  const autoTrigger = modes.getByRole('button', { name: 'Auto (default)', exact: true });
  const hoverTrigger = modes.getByRole('button', { name: 'Hover', exact: true });
  const tooltip = page.getByRole('tooltip');

  await autoTrigger.hover();
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText('Hover and keyboard focus, with tap on touch.');
  await expect(tooltip).toHaveClass(/kui-tooltip--touch/);
  await expectDescriptionLink(autoTrigger, tooltip);
  await captureTriggerAndTooltip(page, autoTrigger, tooltip, 'tooltip-mode-auto-hover.png');

  await page.mouse.move(1, 1);
  await expect(tooltip).toHaveCount(0);

  await hoverTrigger.hover();
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText('Hover or keyboard focus opens this tooltip.');
  await expect(tooltip).not.toHaveClass(/kui-tooltip--touch/);
  await expectDescriptionLink(hoverTrigger, tooltip);
  await captureTriggerAndTooltip(page, hoverTrigger, tooltip, 'tooltip-mode-hover.png');

  await page.mouse.move(1, 1);
  await expect(tooltip).toHaveCount(0);

  const infoTrigger = page.getByRole('button', { name: 'Plan information', exact: true });
  await infoTrigger.hover();
  await expect(tooltip).toHaveText('Your plan renews automatically on the date shown here.');
  await expectDescriptionLink(infoTrigger, tooltip);
  await captureTriggerAndTooltip(page, infoTrigger, tooltip, 'tooltip-icon-trigger.png');
});

test('opens the default and Hover tooltips on keyboard-visible focus @visual', async ({ page }) => {
  const placements = page.getByRole('group', { name: 'Tooltip placement examples', exact: true });
  const defaultTrigger = placements.getByRole('button', { name: 'Top (default)', exact: true });
  const hoverTrigger = page
    .getByRole('group', { name: 'Tooltip interaction mode examples', exact: true })
    .getByRole('button', { name: 'Hover', exact: true });
  const tooltip = page.getByRole('tooltip');

  await tabTo(page, defaultTrigger);
  await expect(defaultTrigger).toBeFocused();
  expect(await defaultTrigger.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText('Shown above the trigger.');
  await expectDescriptionLink(defaultTrigger, tooltip);
  await captureTriggerAndTooltip(
    page,
    defaultTrigger,
    tooltip,
    'tooltip-default-focus-visible.png',
  );

  await page.keyboard.press('Shift+Tab');
  await expect(tooltip).toHaveCount(0);

  await tabTo(page, hoverTrigger);
  await expect(hoverTrigger).toBeFocused();
  expect(await hoverTrigger.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(tooltip).toHaveCount(1);
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText('Hover or keyboard focus opens this tooltip.');
  await expect(tooltip).not.toHaveClass(/kui-tooltip--touch/);
  await expectDescriptionLink(hoverTrigger, tooltip);
  await captureTriggerAndTooltip(page, hoverTrigger, tooltip, 'tooltip-hover-focus-visible.png');

  await page.keyboard.press('Tab');
  await expect(tooltip).toHaveCount(0);
});

test('click mode toggles by pointer and keyboard while None stays inactive @visual', async ({
  page,
}) => {
  const modes = page.getByRole('group', {
    name: 'Tooltip interaction mode examples',
    exact: true,
  });
  const clickTrigger = modes.getByRole('button', { name: 'Click', exact: true });
  const noneTrigger = modes.getByRole('button', { name: 'None', exact: true });
  const tooltip = page.getByRole('tooltip');

  await clickTrigger.hover();
  await expect(tooltip).toHaveCount(0);
  await clickTrigger.click();
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText(
    'Activate again, click outside, move focus, or press Escape to close.',
  );
  await expectDescriptionLink(clickTrigger, tooltip);
  await captureTriggerAndTooltip(page, clickTrigger, tooltip, 'tooltip-click-open.png');

  await clickTrigger.click();
  await expect(tooltip).toHaveCount(0);
  await expect(clickTrigger).not.toHaveAttribute('aria-describedby', /.+/);
  await expect(modes).toHaveScreenshot('tooltip-click-closed.png', { animations: 'disabled' });

  await clickTrigger.evaluate((element) => element.blur());
  await tabTo(page, clickTrigger);
  await expect(clickTrigger).toBeFocused();
  expect(await clickTrigger.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(tooltip).toHaveCount(0);
  await page.keyboard.press('Enter');
  await expect(tooltip).toBeVisible();
  await expectDescriptionLink(clickTrigger, tooltip);
  await captureTriggerAndTooltip(page, clickTrigger, tooltip, 'tooltip-click-keyboard-open.png');

  await page.keyboard.press('Escape');
  await expect(tooltip).toHaveCount(0);
  await expect(clickTrigger).not.toHaveAttribute('aria-describedby', /.+/);

  await noneTrigger.hover();
  await noneTrigger.click();
  await expect(tooltip).toHaveCount(0);
  await expect(noneTrigger).not.toHaveAttribute('aria-describedby', /.+/);
  await noneTrigger.evaluate((element) => element.blur());
  await tabTo(page, noneTrigger);
  await expect(noneTrigger).toBeFocused();
  await expect(tooltip).toHaveCount(0);
});

test('ignores blank content and wraps long supplemental text @visual', async ({ page }) => {
  const content = page.getByRole('group', {
    name: 'Tooltip content and trigger examples',
    exact: true,
  });
  const emptyTrigger = content.getByRole('button', { name: 'Empty text', exact: true });
  const whitespaceTrigger = content.getByRole('button', { name: 'Whitespace only', exact: true });
  const longTrigger = content.getByRole('button', { name: 'Long text', exact: true });
  const tooltip = page.getByRole('tooltip');

  await emptyTrigger.hover();
  await expect(tooltip).toHaveCount(0);
  await expect(emptyTrigger).not.toHaveAttribute('aria-describedby', /.+/);

  await whitespaceTrigger.hover();
  await expect(tooltip).toHaveCount(0);
  await expect(whitespaceTrigger).not.toHaveAttribute('aria-describedby', /.+/);

  await longTrigger.hover();
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveCSS('white-space', 'normal');
  const tooltipBounds = await tooltip.boundingBox();
  expect(tooltipBounds).not.toBeNull();
  expect(tooltipBounds?.width).toBeLessThanOrEqual(280);
  expect(tooltipBounds?.height).toBeGreaterThan(35);
  await expectDescriptionLink(longTrigger, tooltip);
  await captureTriggerAndTooltip(page, longTrigger, tooltip, 'tooltip-long-content.png');

  await page.mouse.move(1, 1);
  await expect(tooltip).toHaveCount(0);
});

test('closes a tap-open tooltip on outside click and focus, with reduced motion respected', async ({
  page,
}) => {
  const modes = page.getByRole('group', {
    name: 'Tooltip interaction mode examples',
    exact: true,
  });
  const clickTrigger = modes.getByRole('button', { name: 'Click', exact: true });
  const tooltip = page.getByRole('tooltip');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await clickTrigger.click();
  await expect(tooltip).toBeVisible();
  await expect
    .poll(() => tooltip.evaluate((element) => getComputedStyle(element).animationName))
    .toBe('none');

  await clickTrigger.click();
  await expect(tooltip).toHaveCount(0);

  await clickTrigger.click();
  await expect(tooltip).toBeVisible();
  await page.getByRole('heading', { level: 1, name: 'Tooltip' }).click();
  await expect(tooltip).toHaveCount(0);
  await expect(clickTrigger).not.toHaveAttribute('aria-describedby', /.+/);

  await clickTrigger.click();
  await expect(tooltip).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(tooltip).toHaveCount(0);
  await expect(clickTrigger).not.toHaveAttribute('aria-describedby', /.+/);
});

test.describe('touch-enabled viewport', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: mobileViewport });

  test('opens auto tooltips on tap, ignores inherited Hover taps, and honors local Click @visual', async ({
    page,
  }) => {
    await page.setViewportSize(mobileViewport);
    await page.goto('/components/tooltip');
    await collapseMobileSidebar(page);
    await expectNoHorizontalOverflow(page);

    const placements = page.getByRole('group', { name: 'Tooltip placement examples', exact: true });
    const autoTrigger = placements.getByRole('button', { name: 'Top (default)', exact: true });
    const providerExamples = page.getByRole('group', {
      name: 'Tooltip scoped default examples',
      exact: true,
    });
    const inheritedHoverTrigger = providerExamples.getByRole('button', {
      name: 'Inherits Hover',
      exact: true,
    });
    const localClickTrigger = providerExamples.getByRole('button', {
      name: 'Local Click override',
      exact: true,
    });
    const tooltip = page.getByRole('tooltip');

    await tapButton(page, autoTrigger);
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveClass(/kui-tooltip--touch/);
    await expect(tooltip).toHaveAttribute('data-kui-placement', 'top');
    await expectDescriptionLink(autoTrigger, tooltip);
    await captureTriggerAndTooltip(page, autoTrigger, tooltip, 'tooltip-auto-touch-open-320.png');

    await tapButton(page, autoTrigger);
    await expect(tooltip).toHaveCount(0);
    await expect(autoTrigger).not.toHaveAttribute('aria-describedby', /.+/);

    await inheritedHoverTrigger.hover();
    const hoverSurface = page.locator('[role="tooltip"]');
    await expect(hoverSurface).toHaveCount(1);
    await expect(hoverSurface).not.toHaveClass(/kui-tooltip--touch/);
    await expect(hoverSurface).toHaveCSS('display', 'none');
    await expectDescriptionLink(inheritedHoverTrigger, hoverSurface);
    await page.mouse.move(1, 1);
    await expect(hoverSurface).toHaveCount(0);

    await tapButton(page, inheritedHoverTrigger);
    await expect(tooltip).toHaveCount(0);
    await expect(inheritedHoverTrigger).not.toHaveAttribute('aria-describedby', /.+/);

    await tapButton(page, localClickTrigger);
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveClass(/kui-tooltip--touch/);
    await expectDescriptionLink(localClickTrigger, tooltip);
    await captureTriggerAndTooltip(
      page,
      localClickTrigger,
      tooltip,
      'tooltip-provider-local-click-touch-open-320.png',
    );

    await page.keyboard.press('Escape');
    await expect(tooltip).toHaveCount(0);
    await expect(localClickTrigger).not.toHaveAttribute('aria-describedby', /.+/);
    await expectNoHorizontalOverflow(page);
  });
});

async function expectDescriptionLink(trigger: Locator, tooltip: Locator): Promise<void> {
  const tooltipId = await tooltip.getAttribute('id');
  expect(tooltipId).toBeTruthy();
  await expect(trigger).toHaveAttribute('aria-describedby', tooltipId ?? '');
  await expect(tooltip).toHaveAttribute('role', 'tooltip');
}

async function expectPlacementGeometry(
  trigger: Locator,
  tooltip: Locator,
  placement: 'top' | 'bottom' | 'left' | 'right',
): Promise<void> {
  const triggerBounds = await trigger.boundingBox();
  const tooltipBounds = await tooltip.boundingBox();

  expect(triggerBounds).not.toBeNull();
  expect(tooltipBounds).not.toBeNull();
  if (!triggerBounds || !tooltipBounds)
    throw new Error('Tooltip placement bounds are unavailable.');

  if (placement === 'top')
    expect(tooltipBounds.y + tooltipBounds.height).toBeLessThan(triggerBounds.y);
  if (placement === 'bottom')
    expect(tooltipBounds.y).toBeGreaterThan(triggerBounds.y + triggerBounds.height);
  if (placement === 'left')
    expect(tooltipBounds.x + tooltipBounds.width).toBeLessThan(triggerBounds.x);
  if (placement === 'right')
    expect(tooltipBounds.x).toBeGreaterThan(triggerBounds.x + triggerBounds.width);
}

async function captureTriggerAndTooltip(
  page: Page,
  trigger: Locator,
  tooltip: Locator,
  screenshotName: string,
): Promise<void> {
  await page.evaluate(async () => document.fonts.ready.then(() => undefined));
  await tooltip.evaluate(async (element) => {
    await Promise.all(
      element.getAnimations().map((animation) => animation.finished.catch(() => undefined)),
    );
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });

  const [triggerBounds, tooltipBounds] = await Promise.all([
    trigger.boundingBox(),
    tooltip.boundingBox(),
  ]);
  const viewport = page.viewportSize();

  if (!triggerBounds || !tooltipBounds || !viewport) {
    throw new Error('The Tooltip trigger, surface, and viewport need visible bounds.');
  }

  const x = Math.max(0, Math.floor(Math.min(triggerBounds.x, tooltipBounds.x) - 8));
  const y = Math.max(0, Math.floor(Math.min(triggerBounds.y, tooltipBounds.y) - 8));
  const right = Math.min(
    viewport.width,
    Math.ceil(
      Math.max(triggerBounds.x + triggerBounds.width, tooltipBounds.x + tooltipBounds.width) + 8,
    ),
  );
  const bottom = Math.min(
    viewport.height,
    Math.ceil(
      Math.max(triggerBounds.y + triggerBounds.height, tooltipBounds.y + tooltipBounds.height) + 8,
    ),
  );

  await expect(page).toHaveScreenshot(screenshotName, {
    clip: { x, y, width: right - x, height: bottom - y },
    animations: 'disabled',
  });
}

async function tapButton(page: Page, trigger: Locator): Promise<void> {
  await trigger.scrollIntoViewIfNeeded();
  const bounds = await trigger.boundingBox();

  if (!bounds) throw new Error('Expected the named Tooltip trigger to have visible bounds.');
  await page.touchscreen.tap(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
}

async function collapseMobileSidebar(page: Page): Promise<void> {
  const navigation = page.getByRole('navigation', { name: 'Component navigation', exact: true });

  for (const category of ['Actions', 'Surfaces']) {
    const toggle = navigation.getByRole('button', { name: category, exact: true });

    if ((await toggle.getAttribute('aria-expanded')) === 'true') await toggle.click();
  }

  await navigation.getByRole('button', { name: 'Actions', exact: true }).scrollIntoViewIfNeeded();
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
}

async function tabTo(page: Page, target: Locator): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) return;

    await page.keyboard.press('Tab');
  }

  throw new Error('Keyboard navigation did not reach the named Tooltip trigger.');
}
