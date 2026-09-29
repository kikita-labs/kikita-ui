import type { Locator, Page } from '@playwright/test';

import { expect, test } from '../../../tests/e2e/support/fixtures';

const desktopViewport = { width: 1440, height: 1000 };
const tabletViewport = { width: 768, height: 1024 };
const mobileViewport = { width: 320, height: 844 };
const browserErrors = new WeakMap<Page, string[]>();

function exampleCard(page: Page, heading: string) {
  return page.getByRole('article').filter({
    has: page.getByRole('heading', { level: 2, name: heading, exact: true }),
  });
}

async function expectTabScrollToSettle(
  tab: Locator,
  initialX: number,
  direction: 'left' | 'right',
) {
  let previousX: number | undefined;
  let stableSamples = 0;

  await expect
    .poll(async () => {
      const currentX = (await tab.boundingBox())?.x;
      if (currentX === undefined) return false;

      if (previousX !== undefined && Math.abs(currentX - previousX) < 0.5) {
        stableSamples += 1;
      } else {
        stableSamples = 0;
      }
      previousX = currentX;

      const moved = direction === 'right' ? currentX < initialX - 1 : currentX > initialX + 1;
      return moved && stableSamples >= 2;
    })
    .toBe(true);
}

async function isTabInScrollViewport(tab: Locator) {
  return tab.evaluate((element) => {
    const list = element.closest<HTMLElement>('[role="tablist"]');
    const scroller = list?.parentElement;
    if (!scroller) return false;

    const tabBounds = element.getBoundingClientRect();
    const scrollerBounds = scroller.getBoundingClientRect();
    const tabLeft =
      tabBounds.left - scrollerBounds.left - scroller.clientLeft + scroller.scrollLeft;
    const tabRight =
      tabBounds.right - scrollerBounds.left - scroller.clientLeft + scroller.scrollLeft;

    return tabRight > scroller.scrollLeft && tabLeft < scroller.scrollLeft + scroller.clientWidth;
  });
}

async function scrollCardToWorkspace(page: Page, card: Locator) {
  const workspace = page.locator('.playground-shell__workspace');
  const cardHandle = await card.elementHandle();
  if (!cardHandle) throw new Error('The Tabs matrix card should exist before capturing it.');

  await page.evaluate(() => window.scrollTo(0, 0));
  await workspace.evaluate((element, target) => {
    element.scrollTop = 0;
    const workspaceTop = element.getBoundingClientRect().top;
    const cardTop = target.getBoundingClientRect().top;
    element.scrollTop += cardTop - workspaceTop;
  }, cardHandle);

  await expect
    .poll(() =>
      workspace.evaluate((element, target) => {
        const workspaceBounds = element.getBoundingClientRect();
        const cardBounds = target.getBoundingClientRect();
        return (
          cardBounds.top >= workspaceBounds.top - 1 &&
          cardBounds.top < workspaceBounds.bottom &&
          cardBounds.left >= workspaceBounds.left - 1 &&
          cardBounds.right <= workspaceBounds.right + 1
        );
      }, cardHandle),
    )
    .toBe(true);
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.setViewportSize(desktopViewport);
  await page.goto('/components/tabs');
});

test('renders the minimal default with the source defaults in dark, light, and mobile layouts @visual', async ({
  page,
}) => {
  await expect(page.getByRole('heading', { level: 1, name: 'Tabs', exact: true })).toBeVisible();

  const example = page.getByRole('group', { name: 'Minimal horizontal default', exact: true });
  const tabs = example.locator('kui-tabs');
  const tablist = example.getByRole('tablist');
  const panels = example.getByRole('tabpanel', { includeHidden: true });
  const general = tablist.getByRole('tab', { name: 'General', exact: true });
  const security = tablist.getByRole('tab', { name: 'Security', exact: true });

  await expect(tabs).toHaveAttribute('data-kui-variant', 'line');
  await expect(tabs).toHaveAttribute('data-kui-size', 'md');
  await expect(tabs).not.toHaveAttribute('data-kui-orientation');
  await expect(tabs).not.toHaveAttribute('data-kui-inverted');
  await expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');
  await expect(general).toHaveAttribute('aria-selected', 'true');
  await expect(general).toHaveAttribute('tabindex', '0');
  await expect(security).toHaveAttribute('aria-selected', 'false');
  await expect(security).toHaveAttribute('tabindex', '-1');
  await expect(general).toHaveAttribute('aria-controls', /.+/);
  const generalId = await general.getAttribute('id');
  const generalPanelId = await general.getAttribute('aria-controls');
  await expect(panels).toHaveCount(2);
  expect(await panels.nth(0).getAttribute('id')).toBe(generalPanelId);
  expect(await panels.nth(0).getAttribute('aria-labelledby')).toBe(generalId);
  await expect(panels.nth(0)).toBeVisible();
  await expect(panels.nth(1)).toBeHidden();
  await expect(example).toHaveScreenshot('tabs-default-dark.png', { animations: 'disabled' });
  await security.hover();
  await expect(example).toHaveScreenshot('tabs-default-hover.png', { animations: 'disabled' });
  await page.mouse.move(0, 0);

  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Switch to light theme', exact: true })
    .click();
  await expect(example).toHaveScreenshot('tabs-default-light.png', { animations: 'disabled' });

  await page.setViewportSize(mobileViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await expect(example).toHaveScreenshot('tabs-default-320.png', { animations: 'disabled' });
});

test('covers every supported size, variant, orientation, and inverted-edge combination @visual', async ({
  page,
}) => {
  const sizes = ['xs', 'sm', 'md', 'lg'] as const;
  const variants = ['line', 'pill'] as const;

  for (const [orientation, heading, orientationName] of [
    ['horizontal', 'Horizontal combinations', 'Horizontal'],
    ['vertical', 'Vertical combinations', 'Vertical'],
  ] as const) {
    const card = exampleCard(page, heading);
    const examples = card.getByRole('group');
    await expect(examples).toHaveCount(16);

    for (const inverted of [false, true]) {
      for (const variant of variants) {
        for (const size of sizes) {
          const edge = inverted ? 'inverted' : 'normal';
          const label = `${orientationName} ${variant} tabs, ${size} size, ${edge} edge`;
          const namedExample = card.getByRole('group', { name: label, exact: true });
          const tabs = namedExample.locator('kui-tabs');
          const tablist = namedExample.getByRole('tablist');

          await expect(namedExample).toBeVisible();
          await expect(namedExample.getByText(label, { exact: true })).toBeVisible();
          await expect(tabs).toHaveAttribute('data-kui-variant', variant);
          await expect(tabs).toHaveAttribute('data-kui-size', size);
          if (orientation === 'vertical') {
            await expect(tabs).toHaveAttribute('data-kui-orientation', 'vertical');
          } else {
            await expect(tabs).not.toHaveAttribute('data-kui-orientation');
          }
          await expect(tablist).toHaveAttribute('aria-orientation', orientation);
          if (inverted) {
            await expect(tabs).toHaveAttribute('data-kui-inverted', '');
          } else {
            await expect(tabs).not.toHaveAttribute('data-kui-inverted');
          }
        }
      }
    }

    await scrollCardToWorkspace(page, card);
    await expect(card).toHaveScreenshot(`tabs-${orientation}-matrix-desktop.png`, {
      animations: 'disabled',
    });
  }

  const horizontal = exampleCard(page, 'Horizontal combinations');
  const vertical = exampleCard(page, 'Vertical combinations');
  const horizontalRepresentative = horizontal.getByRole('group', {
    name: 'Horizontal line tabs, xs size, normal edge',
    exact: true,
  });
  const verticalRepresentative = vertical.getByRole('group', {
    name: 'Vertical line tabs, xs size, normal edge',
    exact: true,
  });
  await page.setViewportSize(tabletViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await scrollCardToWorkspace(page, horizontal);
  await expect(horizontalRepresentative).toHaveScreenshot('tabs-horizontal-matrix-768.png', {
    animations: 'disabled',
  });
  await scrollCardToWorkspace(page, vertical);
  await expect(verticalRepresentative).toHaveScreenshot('tabs-vertical-matrix-768.png', {
    animations: 'disabled',
  });

  await page.setViewportSize(mobileViewport);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await scrollCardToWorkspace(page, horizontal);
  await expect(horizontalRepresentative).toHaveScreenshot('tabs-horizontal-matrix-320.png', {
    animations: 'disabled',
  });
  await scrollCardToWorkspace(page, vertical);
  await expect(verticalRepresentative).toHaveScreenshot('tabs-vertical-matrix-320.png', {
    animations: 'disabled',
  });

  const verticalKeyboard = page.getByRole('group', {
    name: 'Vertical line tabs, xs size, normal edge',
    exact: true,
  });
  const verticalTabs = verticalKeyboard.getByRole('tablist');
  const overview = verticalTabs.getByRole('tab', { name: 'Overview', exact: true });
  const settings = verticalTabs.getByRole('tab', { name: 'Settings', exact: true });
  await overview.focus();
  await page.keyboard.press('ArrowDown');
  await expect(settings).toBeFocused();
  await expect(settings).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowUp');
  await expect(overview).toBeFocused();
  await expect(overview).toHaveAttribute('aria-selected', 'true');
});

test('moves actual keyboard focus, selects, wraps, and honors Home and End @visual', async ({
  page,
}) => {
  const example = page.getByRole('group', { name: 'Keyboard navigation example', exact: true });
  const tablist = example.getByRole('tablist');
  const overview = tablist.getByRole('tab', { name: 'Overview', exact: true });
  const activity = tablist.getByRole('tab', { name: 'Activity', exact: true });
  const settings = tablist.getByRole('tab', { name: 'Settings', exact: true });
  const overviewPanel = example.getByRole('tabpanel', { name: 'Overview', exact: true });
  const activityPanel = example.getByRole('tabpanel', { name: 'Activity', exact: true });

  await overview.focus();
  await page.keyboard.press('Tab');
  await expect(overviewPanel).toHaveAttribute('tabindex', '0');
  await expect(overviewPanel).toBeFocused();

  await overview.focus();
  await expect(overview).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(activity).toBeFocused();
  await expect(activity).toHaveAttribute('aria-selected', 'true');
  await expect(activityPanel).toBeVisible();
  await expect(example).toHaveScreenshot('tabs-keyboard-activity-focused.png', {
    animations: 'disabled',
  });

  await page.keyboard.press('ArrowRight');
  await expect(settings).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(overview).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(settings).toBeFocused();
  await page.keyboard.press('Home');
  await expect(overview).toBeFocused();
  await page.keyboard.press('End');
  await expect(settings).toBeFocused();
  await expect(settings).toHaveAttribute('aria-selected', 'true');
});

test('toggles the accessible error label and supports router-style tabs without panels @visual', async ({
  page,
}) => {
  const errorExample = page.getByRole('group', {
    name: 'Tab with a toggled payment error',
    exact: true,
  });
  const payment = errorExample.getByRole('tab', {
    name: 'Payment payment needs attention',
    exact: true,
  });
  const toggleError = errorExample.getByRole('button', {
    name: 'Toggle payment tab error',
    exact: true,
  });

  await expect(toggleError).toHaveAttribute('aria-pressed', 'true');
  await expect(payment).toHaveAccessibleName('Payment payment needs attention');
  await expect(errorExample).toHaveScreenshot('tabs-error-enabled.png', { animations: 'disabled' });
  await toggleError.click();
  await expect(toggleError).toHaveAttribute('aria-pressed', 'false');
  await expect(errorExample.getByRole('tab', { name: 'Payment', exact: true })).toBeVisible();
  await expect(errorExample).toHaveScreenshot('tabs-error-disabled.png', {
    animations: 'disabled',
  });

  const routerExample = page.getByRole('group', {
    name: 'Router-style tabs without local panels',
    exact: true,
  });
  const routerTabs = routerExample.getByRole('tablist');
  const overview = routerTabs.getByRole('tab', { name: 'Overview', exact: true });
  const activity = routerTabs.getByRole('tab', { name: 'Activity', exact: true });
  const settings = routerTabs.getByRole('tab', { name: 'Settings', exact: true });

  await expect(routerTabs.getByRole('tab')).toHaveCount(3);
  await expect(overview).not.toHaveAttribute('aria-controls', /.+/);
  await expect(activity).not.toHaveAttribute('aria-controls', /.+/);
  await expect(settings).not.toHaveAttribute('aria-controls', /.+/);
  await activity.click();
  await expect(activity).toHaveAttribute('aria-selected', 'true');
  await expect(routerExample.getByRole('tabpanel')).toHaveCount(0);
  await expect(routerExample).toHaveScreenshot('tabs-router-style-selected.png', {
    animations: 'disabled',
  });
});

test('documents initial overflow controls and scrolls with keyboard and exposed buttons at 320px @visual', async ({
  page,
}) => {
  await page.setViewportSize(mobileViewport);
  await page.reload();
  const example = page.getByRole('group', {
    name: 'Scrollable tabs with many items',
    exact: true,
  });
  const tablist = example.getByRole('tablist');
  const scrollRight = example.getByRole('button', { name: 'Scroll tabs right', exact: true });
  const first = tablist.getByRole('tab', { name: 'Workspace overview', exact: true });
  const last = tablist.getByRole('tab', { name: 'Audit history', exact: true });

  await example.scrollIntoViewIfNeeded();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await expect(first).toBeInViewport();
  await expect(last).not.toBeInViewport();
  await expect(scrollRight).toBeVisible();
  await expect(example).toHaveScreenshot('tabs-overflow-320-start.png', {
    animations: 'disabled',
  });

  await first.focus();
  await page.keyboard.press('End');
  await expect(last).toBeFocused();
  await expect(last).toHaveAttribute('aria-selected', 'true');
  await expect(last).toBeInViewport();
  const scrollLeft = example.getByRole('button', { name: 'Scroll tabs left', exact: true });
  await expect(scrollLeft).toBeVisible();
  await expect(scrollRight).toHaveCount(0);
  await expect(example).toHaveScreenshot('tabs-overflow-320-end.png', {
    animations: 'disabled',
  });

  const lastStartX = (await last.boundingBox())?.x;
  if (lastStartX === undefined) throw new Error('The last tab should have a layout box.');
  await scrollLeft.click();
  await expectTabScrollToSettle(last, lastStartX, 'left');
  await expect(scrollRight).toBeVisible();
  await expect(last).not.toBeInViewport();

  for (let attempt = 0; attempt < 8 && !(await isTabInScrollViewport(last)); attempt += 1) {
    const firstStartX = (await first.boundingBox())?.x;
    if (firstStartX === undefined) throw new Error('The first tab should have a layout box.');
    await scrollRight.click();
    await expectTabScrollToSettle(first, firstStartX, 'right');
  }
  await expect(last).toBeInViewport();
  await expect(scrollRight).toBeHidden();

  for (let attempt = 0; attempt < 8 && !(await isTabInScrollViewport(first)); attempt += 1) {
    const lastStartX = (await last.boundingBox())?.x;
    if (lastStartX === undefined) throw new Error('The last tab should have a layout box.');
    await scrollLeft.click();
    await expectTabScrollToSettle(last, lastStartX, 'left');
  }
  await expect(first).toBeInViewport();
  await expect(example.getByRole('button', { name: 'Scroll tabs left', exact: true })).toBeHidden();
});

test('server-renders, hydrates, and switches the Tabs translation scope', async ({ page }) => {
  const [localeResponse, shellLocaleResponse] = await Promise.all([
    page.request.get('/i18n/tabs/ru.json'),
    page.request.get('/i18n/ru.json'),
  ]);
  expect(localeResponse.ok()).toBeTruthy();
  expect(shellLocaleResponse.ok()).toBeTruthy();
  const translations = await localeResponse.json();
  const shellTranslations = await shellLocaleResponse.json();

  const response = await page.goto('/components/tabs');
  expect(response?.status()).toBe(200);
  const serverHtml = await response?.text();
  expect(serverHtml).toContain('id="tabs-playground-title"');
  expect(serverHtml).toContain('role="tablist"');
  expect(serverHtml).toContain('aria-selected="true"');
  expect(serverHtml).toContain('data-kui-size="md"');

  const heading = page.locator('#tabs-playground-title');
  await expect(heading).toHaveText('Tabs');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  const defaultExample = page.getByRole('group', {
    name: 'Minimal horizontal default',
    exact: true,
  });
  await expect(defaultExample.getByRole('tablist').getByRole('tab')).toHaveCount(2);

  await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(heading).toHaveText(translations.title);
  const russianDefault = page.getByRole('group', {
    name: translations.accessibility.default,
    exact: true,
  });
  await expect(russianDefault).toBeVisible();
  const russianMatrixCaption = translations.accessibility.matrixExample
    .replace('{{orientation}}', translations.values.horizontal)
    .replace('{{variant}}', translations.values.line)
    .replace('{{size}}', 'xs')
    .replace('{{edge}}', translations.values.normal);
  await expect(page.getByText(russianMatrixCaption, { exact: true })).toBeVisible();
  await expect(
    russianDefault.getByRole('tablist').getByRole('tab', {
      name: translations.labels.general,
      exact: true,
    }),
  ).toHaveAttribute('aria-selected', 'true');
  const russianError = page.getByRole('group', {
    name: translations.accessibility.error,
    exact: true,
  });
  await expect(
    russianError.getByRole('tab', {
      name: `${translations.labels.payment} ${translations.error.accessibleLabel}`,
      exact: true,
    }),
  ).toBeVisible();

  await page
    .getByRole('button', { name: shellTranslations.playground.language, exact: true })
    .click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(heading).toHaveText('Tabs');
  await page.reload();
  await expect(heading).toHaveText('Tabs');
  expect(browserErrors.get(page)).toEqual([]);
});
