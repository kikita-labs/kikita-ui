import type { Locator, Page } from '@playwright/test';

import { expect, test } from '../../../tests/e2e/support/fixtures';

const desktopViewport = { width: 1440, height: 1000 };
const tabletViewport = { width: 768, height: 1024 };
const mobileViewport = { width: 320, height: 844 };

const staticMatrixName = 'Non-interactive card appearance and size examples';
const interactiveMatrixName = 'Interactive card appearance and size examples';
const expectedAppearanceSizePairs = [
  { appearance: 'surface', size: 'xs', cardName: 'Surface Extra small' },
  { appearance: 'surface', size: 'sm', cardName: 'Surface Small' },
  { appearance: 'surface', size: 'md', cardName: 'Surface Medium' },
  { appearance: 'surface', size: 'lg', cardName: 'Surface Large' },
  { appearance: 'elevated', size: 'xs', cardName: 'Elevated Extra small' },
  { appearance: 'elevated', size: 'sm', cardName: 'Elevated Small' },
  { appearance: 'elevated', size: 'md', cardName: 'Elevated Medium' },
  { appearance: 'elevated', size: 'lg', cardName: 'Elevated Large' },
  { appearance: 'sunken', size: 'xs', cardName: 'Sunken Extra small' },
  { appearance: 'sunken', size: 'sm', cardName: 'Sunken Small' },
  { appearance: 'sunken', size: 'md', cardName: 'Sunken Medium' },
  { appearance: 'sunken', size: 'lg', cardName: 'Sunken Large' },
] as const;

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/components/card');
  await expect(page.locator('html')).toHaveAttribute('data-kui-theme', 'dark');
});

test('server-renders and hydrates the default card without browser errors', async ({ page }) => {
  const response = await page.request.get('/components/card');

  expect(response.ok()).toBe(true);

  const serverMarkup = await response.text();
  expect(serverMarkup).toContain('Card');
  expect(serverMarkup).toContain('Grouped content');

  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.goto('/components/card');
  await expect(page.getByRole('heading', { level: 1, name: 'Card' })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Grouped content', exact: true })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('loads the Card scope and switches its accessible names to Russian', async ({ page }) => {
  const localeResponse = await page.request.get('/i18n/card/ru.json');
  expect(localeResponse.ok()).toBeTruthy();
  const translations = await localeResponse.json();

  await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(
    page.getByRole('heading', { level: 1, name: translations.title, exact: true }),
  ).toBeVisible();
  const defaultExample = page.getByRole('group', {
    name: translations.accessibility.default,
    exact: true,
  });
  await expect(defaultExample).toBeVisible();
  await expect(
    defaultExample.getByRole('article', {
      name: translations.content.defaultHeading,
      exact: true,
    }),
  ).toBeVisible();
});

test('captures the minimally configured default card', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default card example', exact: true });
  const defaultCard = example.getByRole('article', { name: 'Grouped content', exact: true });

  await expect(page.getByRole('heading', { level: 1, name: 'Card' })).toBeVisible();
  await expect(defaultCard).toHaveAttribute('data-kui-appearance', 'surface');
  await expect(defaultCard).toHaveAttribute('data-kui-size', 'md');
  await expect(defaultCard).not.toHaveAttribute('data-kui-interactive');
  await expect(example).toHaveScreenshot('card-default-desktop.png', { animations: 'disabled' });

  await captureMobile(page, example, 'card-default-320.png');
});

test('updates every Card appearance in light theme and restores dark theme', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });

  const matrix = page.getByRole('group', { name: staticMatrixName, exact: true });
  const cards = [
    matrix.getByRole('article', { name: 'Surface Extra small', exact: true }),
    matrix.getByRole('article', { name: 'Elevated Extra small', exact: true }),
    matrix.getByRole('article', { name: 'Sunken Extra small', exact: true }),
  ];
  const readBackgrounds = () =>
    Promise.all(
      cards.map((card) => card.evaluate((element) => getComputedStyle(element).backgroundColor)),
    );

  const darkBackgrounds = await readBackgrounds();

  await page.getByRole('button', { name: 'Switch to light theme', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-kui-theme', 'light');
  await expect.poll(readBackgrounds).not.toEqual(darkBackgrounds);

  const lightBackgrounds = await readBackgrounds();
  expect(lightBackgrounds).not.toEqual(darkBackgrounds);

  await page.getByRole('button', { name: 'Switch to dark theme', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-kui-theme', 'dark');
  await expect.poll(readBackgrounds).toEqual(darkBackgrounds);
});

test('captures all non-interactive appearance and size combinations', async ({ page }) => {
  const matrix = page.getByRole('group', { name: staticMatrixName, exact: true });
  const cards = matrix.getByRole('article', {
    name: /^(?:Surface|Elevated|Sunken) (?:Extra small|Small|Medium|Large)$/,
  });

  await expect(cards).toHaveCount(expectedAppearanceSizePairs.length);
  await expect(matrix.getByRole('group')).toHaveCount(3);
  for (const { appearance, size, cardName } of expectedAppearanceSizePairs) {
    const card = matrix.getByRole('article', { name: cardName, exact: true });

    await expect(card).toHaveAttribute('data-kui-appearance', appearance);
    await expect(card).toHaveAttribute('data-kui-size', size);
    await expect(card).not.toHaveAttribute('data-kui-interactive');
  }

  await expect(matrix).toHaveScreenshot('card-static-matrix-desktop.png', {
    animations: 'disabled',
  });

  await captureMobileMatrixGroups(page, matrix, 'card-static-matrix');

  await captureTablet(
    page,
    matrix,
    [
      matrix.getByRole('article', { name: 'Surface Extra small', exact: true }),
      matrix.getByRole('article', { name: 'Surface Small', exact: true }),
      matrix.getByRole('article', { name: 'Surface Medium', exact: true }),
      matrix.getByRole('article', { name: 'Surface Large', exact: true }),
    ],
    'card-static-matrix-tablet-768.png',
  );
});

test('captures all interactive appearance and size combinations', async ({ page }) => {
  const matrix = page.getByRole('group', { name: interactiveMatrixName, exact: true });
  const buttons = matrix.getByRole('button');

  await expect(buttons).toHaveCount(expectedAppearanceSizePairs.length);
  await expect(matrix.getByRole('group')).toHaveCount(3);
  await expect
    .poll(() =>
      buttons.evaluateAll((elements) =>
        elements.map((element) => ({
          tagName: element.tagName,
          appearance: element.getAttribute('data-kui-appearance'),
          size: element.getAttribute('data-kui-size'),
          interactive: element.hasAttribute('data-kui-interactive'),
        })),
      ),
    )
    .toEqual(
      expectedAppearanceSizePairs.map(({ appearance, size }) => ({
        tagName: 'BUTTON',
        appearance,
        size,
        interactive: true,
      })),
    );
  await expect(matrix).toHaveScreenshot('card-interactive-matrix-desktop.png', {
    animations: 'disabled',
  });

  await captureMobileMatrixGroups(page, matrix, 'card-interactive-matrix');

  await captureTablet(
    page,
    matrix,
    [
      matrix.getByRole('button', { name: 'Surface Extra small Activate card', exact: true }),
      matrix.getByRole('button', { name: 'Surface Small Activate card', exact: true }),
      matrix.getByRole('button', { name: 'Surface Medium Activate card', exact: true }),
      matrix.getByRole('button', { name: 'Surface Large Activate card', exact: true }),
    ],
    'card-interactive-matrix-tablet-768.png',
  );
});

test('captures native semantic hosts and composition', async ({ page }) => {
  const examples = page.getByRole('group', {
    name: 'Card semantic host and composition examples',
    exact: true,
  });

  const article = examples.getByRole('article', { name: 'Article host', exact: true });
  await expect(article).toBeVisible();
  expect(await article.evaluate((element) => element.tagName)).toBe('ARTICLE');
  await expect(article).not.toHaveAttribute('role');
  await expect(article).not.toHaveAttribute('tabindex');
  const region = examples.getByRole('region', { name: 'Section host', exact: true });
  await expect(region).toHaveCount(1);
  const complementary = examples.getByRole('complementary', {
    name: 'Aside host',
    exact: true,
  });
  await expect(complementary).toHaveCount(1);
  const link = examples.getByRole('link', { name: /Link host/ });
  await expect(link).toHaveAttribute('href', '/components/card#card-default-target');
  expect(await link.evaluate((element) => element.tagName)).toBe('A');
  await expect(link).not.toHaveAttribute('role');
  const button = examples.getByRole('button', { name: /Button host/ });
  await expect(button).toBeVisible();
  expect(await button.evaluate((element) => element.tagName)).toBe('BUTTON');
  await expect(button).not.toHaveAttribute('role');
  await expect(examples).toHaveScreenshot('card-semantic-hosts-desktop.png', {
    animations: 'disabled',
  });

  await captureMobileElements(page, [
    { target: article, screenshotName: 'card-semantic-article-320.png' },
    { target: region, screenshotName: 'card-semantic-section-320.png' },
    { target: complementary, screenshotName: 'card-semantic-aside-320.png' },
    { target: link, screenshotName: 'card-semantic-link-320.png' },
    { target: button, screenshotName: 'card-semantic-button-320.png' },
  ]);
});

test('activates the native card link with Enter and follows its article target', async ({
  page,
}) => {
  const examples = page.getByRole('group', {
    name: 'Card semantic host and composition examples',
    exact: true,
  });
  const link = examples.getByRole('link', { name: /Link host/ });
  const defaultCard = page.getByRole('article', { name: 'Grouped content', exact: true });

  await expect(link).toHaveAttribute('href', '/components/card#card-default-target');
  await tabTo(page, link);
  await expect(link).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/#card-default-target$/);
  await expect(defaultCard).toBeInViewport();
});

test('activates the native button-host card with Enter and Space', async ({ page }) => {
  const examples = page.getByRole('group', {
    name: 'Card semantic host and composition examples',
    exact: true,
  });
  const button = examples.getByRole('button', { name: /Button host/ });
  const status = page.getByRole('status');

  expect(await button.evaluate((element) => element.tagName)).toBe('BUTTON');
  await expect(button).not.toHaveAttribute('role');
  await expect(button).not.toHaveAttribute('tabindex');
  await tabTo(page, button);
  await expect(button).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(status).toHaveText('Card action activation count: 1');

  await page.keyboard.press('Space');
  await expect(status).toHaveText('Card action activation count: 2');
});

test('captures keyboard focus-visible on an interactive card', async ({ page }) => {
  const matrix = page.getByRole('group', { name: interactiveMatrixName, exact: true });
  const button = matrix.getByRole('button', { name: /Surface Extra small Activate card/ });

  await tabTo(page, button);
  await expect(button).toBeFocused();
  expect(await button.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(matrix).toHaveScreenshot('card-interactive-focus-desktop.png', {
    animations: 'disabled',
  });

  await page.setViewportSize(mobileViewport);
  await collapseMobileSidebar(page);
  await expectNoHorizontalOverflow(page);
  await scrollWorkspaceTargetIntoView(button);
  await tabTo(page, button);
  await expect(button).toBeFocused();
  expect(await button.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(button).toHaveScreenshot('card-interactive-focus-320.png', {
    animations: 'disabled',
  });
});

test('captures pointer hover on an interactive card', async ({ page }) => {
  const matrix = page.getByRole('group', { name: interactiveMatrixName, exact: true });
  const button = matrix.getByRole('button', { name: /Surface Extra small Activate card/ });
  const borderColors = await button.evaluate((element) => {
    const resolveBorderColor = (tokenExpression: string): string => {
      const probe = document.createElement('span');
      probe.style.borderTopWidth = '1px';
      probe.style.borderTopStyle = 'solid';
      probe.style.borderTopColor = tokenExpression;
      document.body.append(probe);
      const color = getComputedStyle(probe).borderTopColor;
      probe.remove();

      return color;
    };

    return {
      base: resolveBorderColor('var(--kui-card-border, var(--kui-color-border))'),
      hover: resolveBorderColor('var(--kui-card-border-hover, var(--kui-color-border-strong))'),
      actual: getComputedStyle(element).borderTopColor,
    };
  });

  expect(borderColors.actual).toBe(borderColors.base);
  expect(borderColors.hover).not.toBe(borderColors.base);

  await button.hover();
  expect(await button.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect
    .poll(() => button.evaluate((element) => getComputedStyle(element).borderTopColor))
    .toBe(borderColors.hover);
  await expect(matrix).toHaveScreenshot('card-interactive-hover-desktop.png', {
    animations: 'disabled',
  });

  await page.setViewportSize(mobileViewport);
  await collapseMobileSidebar(page);
  await scrollWorkspaceTargetIntoView(button);
  await button.hover();
  await expectNoHorizontalOverflow(page);
  expect(await button.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect(button).toHaveScreenshot('card-interactive-hover-320.png', {
    animations: 'disabled',
  });
});

test('disables Card transitions when reduced motion is requested', async ({ page }) => {
  const matrix = page.getByRole('group', { name: interactiveMatrixName, exact: true });
  const card = matrix.getByRole('button', { name: /Surface Extra small Activate card/ });

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect
    .poll(() => card.evaluate((element) => getComputedStyle(element).transitionProperty))
    .not.toBe('none');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect
    .poll(() => card.evaluate((element) => getComputedStyle(element).transitionProperty))
    .toBe('none');
});

test('activating a button-host card announces the consumer action', async ({ page }) => {
  const examples = page.getByRole('group', {
    name: 'Card semantic host and composition examples',
    exact: true,
  });

  await examples.getByRole('button', { name: /Button host/ }).click();

  const status = page.getByRole('status');
  await expect(status).toHaveText('Card action activation count: 1');
  await expect(status).toHaveScreenshot('card-activation-status-desktop.png', {
    animations: 'disabled',
  });

  await page.setViewportSize(mobileViewport);
  await collapseMobileSidebar(page);
  await expectNoHorizontalOverflow(page);
  await scrollWorkspaceTargetIntoView(status);
  await expect(status).toHaveScreenshot('card-activation-status-320.png', {
    animations: 'disabled',
  });
});

async function captureMobile(page: Page, example: Locator, screenshotName: string): Promise<void> {
  await page.setViewportSize(mobileViewport);
  await collapseMobileSidebar(page);
  await expectNoHorizontalOverflow(page);
  await scrollWorkspaceTargetIntoView(example);
  await expect(example).toHaveScreenshot(screenshotName, { animations: 'disabled' });
}

async function captureMobileMatrixGroups(
  page: Page,
  matrix: Locator,
  screenshotPrefix: string,
): Promise<void> {
  await page.setViewportSize(mobileViewport);
  await collapseMobileSidebar(page);
  await expectNoHorizontalOverflow(page);

  for (const appearance of ['Surface', 'Elevated', 'Sunken']) {
    const group = matrix.getByRole('group', { name: appearance, exact: true });
    const articles = group.getByRole('article');
    const buttons = group.getByRole('button');

    if ((await buttons.count()) > 0) {
      await expect(buttons).toHaveCount(4);

      for (const pair of [
        { firstIndex: 0, secondIndex: 1, sizeLabel: 'xs-sm' },
        { firstIndex: 2, secondIndex: 3, sizeLabel: 'md-lg' },
      ]) {
        const first = buttons.nth(pair.firstIndex);
        const second = buttons.nth(pair.secondIndex);
        const clip = await scrollWorkspacePairIntoView(first, second);

        await expect(page).toHaveScreenshot(
          `${screenshotPrefix}-${appearance.toLowerCase()}-${pair.sizeLabel}-320.png`,
          { animations: 'disabled', clip },
        );
      }
    } else {
      await expect(articles).toHaveCount(4);
      await scrollWorkspaceTargetIntoView(group);
      await expect(group).toHaveScreenshot(
        `${screenshotPrefix}-${appearance.toLowerCase()}-320.png`,
        { animations: 'disabled' },
      );
    }
  }
}

async function captureMobileElements(
  page: Page,
  elements: readonly { target: Locator; screenshotName: string }[],
): Promise<void> {
  await page.setViewportSize(mobileViewport);
  await collapseMobileSidebar(page);
  await expectNoHorizontalOverflow(page);

  for (const { target, screenshotName } of elements) {
    await scrollWorkspaceTargetIntoView(target);
    await expect(target).toHaveScreenshot(screenshotName, { animations: 'disabled' });
  }
}

async function captureTablet(
  page: Page,
  matrix: Locator,
  orderedCards: readonly [Locator, Locator, Locator, Locator],
  screenshotName: string,
): Promise<void> {
  await page.setViewportSize(tabletViewport);
  await collapseMobileSidebar(page);
  await expectNoHorizontalOverflow(page);
  await matrix.scrollIntoViewIfNeeded();

  const boxes = await Promise.all(orderedCards.map((card) => card.boundingBox()));

  if (boxes.some((box) => box === null)) {
    throw new Error('Expected all named Card examples to be visible at the tablet viewport.');
  }

  const [first, second, third, fourth] = boxes;

  if (!first || !second || !third || !fourth) {
    throw new Error('Expected four named Card examples for the tablet column check.');
  }

  expect(second.x).toBeGreaterThan(first.x);
  expect(third.x).toBeCloseTo(first.x, 0);
  expect(fourth.x).toBeCloseTo(second.x, 0);
  await expect(matrix).toHaveScreenshot(screenshotName, { animations: 'disabled' });
}

async function collapseMobileSidebar(page: Page): Promise<void> {
  const navigation = page.getByRole('navigation', {
    name: 'Component navigation',
    exact: true,
  });

  for (const category of ['Actions', 'Surfaces']) {
    const toggle = navigation.getByRole('button', { name: category, exact: true });

    if ((await toggle.getAttribute('aria-expanded')) === 'true') await toggle.click();
  }

  await navigation.getByRole('button', { name: 'Actions', exact: true }).scrollIntoViewIfNeeded();
}

async function scrollWorkspaceTargetIntoView(target: Locator): Promise<void> {
  await target.scrollIntoViewIfNeeded();

  const targetBounds = await target.evaluate((element) => {
    const workspace = element.closest('.playground-shell__workspace');
    const elementBounds = element.getBoundingClientRect();
    const workspaceBounds = workspace?.getBoundingClientRect();

    if (!workspace || !workspaceBounds) return null;

    return {
      elementHeight: elementBounds.height,
      workspaceHeight: workspace.clientHeight,
      elementTop: elementBounds.top,
      elementBottom: elementBounds.bottom,
      workspaceTop: workspaceBounds.top,
      workspaceBottom: workspaceBounds.bottom,
    };
  });

  if (!targetBounds)
    throw new Error('Expected the Card capture target inside the shell workspace.');
  expect(targetBounds.elementHeight).toBeLessThanOrEqual(targetBounds.workspaceHeight);
  expect(targetBounds.elementTop).toBeGreaterThanOrEqual(targetBounds.workspaceTop);
  expect(targetBounds.elementBottom).toBeLessThanOrEqual(targetBounds.workspaceBottom);
}

async function scrollWorkspacePairIntoView(first: Locator, second: Locator) {
  const secondElement = await second.elementHandle();

  if (!secondElement) throw new Error('Expected the second Card in the named size pair.');

  const geometry = await first.evaluate((firstElement, secondElement) => {
    const workspace = firstElement.closest('.playground-shell__workspace');
    const workspaceBounds = workspace?.getBoundingClientRect();

    if (!workspace || !workspaceBounds) return null;

    const firstBounds = firstElement.getBoundingClientRect();
    const secondBounds = secondElement.getBoundingClientRect();
    const pairTop = Math.min(firstBounds.top, secondBounds.top);
    const pairBottom = Math.max(firstBounds.bottom, secondBounds.bottom);
    const pairHeight = pairBottom - pairTop;
    const visibleTop = workspaceBounds.top + 1;
    const visibleBottom = workspaceBounds.bottom - 1;

    if (pairHeight > workspace.clientHeight) {
      return { fits: false as const };
    }

    if (pairTop < visibleTop) workspace.scrollTop -= visibleTop - pairTop;
    else if (pairBottom > visibleBottom) workspace.scrollTop += pairBottom - visibleBottom;

    const visibleFirstBounds = firstElement.getBoundingClientRect();
    const visibleSecondBounds = secondElement.getBoundingClientRect();
    const x = Math.floor(Math.min(visibleFirstBounds.left, visibleSecondBounds.left));
    const y = Math.floor(Math.min(visibleFirstBounds.top, visibleSecondBounds.top));
    const right = Math.ceil(Math.max(visibleFirstBounds.right, visibleSecondBounds.right));
    const bottom = Math.ceil(Math.max(visibleFirstBounds.bottom, visibleSecondBounds.bottom));

    return {
      fits: true as const,
      clip: { x, y, width: right - x, height: bottom - y },
      clipLeft: x,
      clipRight: right,
      clipTop: y,
      clipBottom: bottom,
      workspaceLeft: workspaceBounds.left,
      workspaceRight: workspaceBounds.right,
      workspaceTop: workspaceBounds.top,
      workspaceBottom: workspaceBounds.bottom,
    };
  }, secondElement);

  if (!geometry?.fits) throw new Error('The Card size pair must fit inside the shell workspace.');

  expect(geometry.clipLeft).toBeGreaterThanOrEqual(geometry.workspaceLeft);
  expect(geometry.clipRight).toBeLessThanOrEqual(geometry.workspaceRight);
  expect(geometry.clipTop).toBeGreaterThanOrEqual(geometry.workspaceTop);
  expect(geometry.clipBottom).toBeLessThanOrEqual(geometry.workspaceBottom);

  return geometry.clip;
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

  throw new Error('Keyboard navigation did not reach the named interactive card.');
}
