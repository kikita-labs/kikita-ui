import type { Locator, Page } from '@playwright/test';

import { expect, test } from './support/fixtures';

const desktopViewport = { width: 1440, height: 1200 };
const mobileViewport = { width: 320, height: 844 };
type ElementBounds = NonNullable<Awaited<ReturnType<Locator['boundingBox']>>>;

async function waitForPlaygroundClientInteraction(page: Page): Promise<void> {
  const languageToggle = page.getByRole('banner').getByRole('button').last();
  await expect(languageToggle).toHaveText('RU');
  await languageToggle.click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(languageToggle).toHaveText('EN');
  await languageToggle.click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(languageToggle).toHaveText('RU');
  await expect(page.getByRole('button', { name: 'Row actions', exact: true })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/components/menu');
});

test('captures the minimally configured default menu example @visual', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default action menu example', exact: true });
  await expect(example).toBeVisible();
  await expect(example).toHaveScreenshot('menu-default.png');
});

test('captures all eight placement and alignment trigger examples @visual', async ({ page }) => {
  const examples = page.getByRole('group', { name: 'Menu placement examples', exact: true });
  await expect(examples.getByRole('button')).toHaveCount(8);
  await expect(examples).toHaveScreenshot('menu-placement.png');
});

test('captures menu alignment and spacing examples @visual', async ({ page }) => {
  const examples = page.getByRole('group', {
    name: 'Menu alignment and spacing examples',
    exact: true,
  });
  await expect(examples.getByRole('button')).toHaveCount(5);
  await expect(examples).toHaveScreenshot('menu-spacing.png');
});

test('captures menu content and item states @visual', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Menu content and states example', exact: true });
  await expect(example).toHaveScreenshot('menu-content.png');
});

test('opens the default menu and closes it after a real action @visual', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default action menu example', exact: true });
  const trigger = example.getByRole('button', { name: 'Actions', exact: true });
  await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).not.toHaveAttribute('aria-controls', /.+/);
  await trigger.click();
  await expect(trigger).toBeFocused();

  const menu = page.getByRole('menu', { name: 'Actions', exact: true });
  await expect(menu).toBeVisible();
  await waitForMenuToSettle(menu);
  const panelId = await menu.getAttribute('id');
  expect(panelId).toBeTruthy();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(trigger).toHaveAttribute('aria-controls', panelId!);
  await expect(menu).toHaveScreenshot('menu-default-open.png');

  await menu.getByRole('menuitem', { name: 'Edit', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Edit action activated');
  await expect(menu).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).not.toHaveAttribute('aria-controls', /.+/);
  await expect(example).toHaveScreenshot('menu-default-action-activated.png');
});

test('closes the default menu when its trigger is toggled again', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default action menu example', exact: true });
  const trigger = example.getByRole('button', { name: 'Actions', exact: true });
  const menu = page.getByRole('menu', { name: 'Actions', exact: true });

  await trigger.click();
  await expect(menu).toBeVisible();
  // Safari does not focus a button on mouse click, so give the trigger focus explicitly.
  await trigger.focus();
  await expect(trigger).toBeFocused();
  await trigger.click();

  await expect(menu).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).not.toHaveAttribute('aria-controls', /.+/);
});

for (const key of ['Enter', 'Space'] as const) {
  test(`opens the native button menu with ${key} and focuses its first item`, async ({ page }) => {
    await waitForPlaygroundClientInteraction(page);
    const example = page.getByRole('group', { name: 'Default action menu example', exact: true });
    const trigger = example.getByRole('button', { name: 'Actions', exact: true });
    await trigger.press(key);

    const menu = page.getByRole('menu', { name: 'Actions', exact: true });
    const firstItem = menu.getByRole('menuitem', { name: 'Edit', exact: true });
    await expect(menu).toBeVisible();
    await expect(firstItem).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
  });
}

test('dismisses the default menu after clicking outside it', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default action menu example', exact: true });
  const trigger = example.getByRole('button', { name: 'Actions', exact: true });
  const menu = page.getByRole('menu', { name: 'Actions', exact: true });

  await trigger.click();
  await expect(menu).toBeVisible();
  await page.getByRole('heading', { name: 'Menu', exact: true }).click();

  await expect(menu).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).not.toHaveAttribute('aria-controls', /.+/);
});

test('closes on Tab without restoring trigger focus', async ({ page }) => {
  await waitForPlaygroundClientInteraction(page);
  const trigger = page.getByRole('button', { name: 'Row actions', exact: true });
  await trigger.press('ArrowDown');

  const menu = page.getByRole('menu', { name: 'Row actions', exact: true });
  const firstItem = menu.getByRole('menuitem', { name: /Rename/ });
  await expect(firstItem).toBeFocused();
  await page.keyboard.press('Tab');

  await expect(menu).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).not.toBeFocused();
  expect(
    await page.evaluate(
      () => document.activeElement instanceof HTMLElement && document.activeElement.tabIndex >= 0,
    ),
  ).toBe(true);
});

test('respects reduced motion while opening and closing the default menu', async ({ page }) => {
  await waitForPlaygroundClientInteraction(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(
    true,
  );

  const example = page.getByRole('group', { name: 'Default action menu example', exact: true });
  const trigger = example.getByRole('button', { name: 'Actions', exact: true });
  await trigger.press('ArrowDown');
  const menu = page.getByRole('menu', { name: 'Actions', exact: true });
  await expect(menu).toBeVisible();
  expect(await menu.evaluate((element) => getComputedStyle(element).animationName)).toBe('none');

  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('captures real pointer hover and pressed menu item states @visual', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default action menu example', exact: true });
  await example.getByRole('button', { name: 'Actions', exact: true }).click();

  const menu = page.getByRole('menu', { name: 'Actions', exact: true });
  const item = menu.getByRole('menuitem', { name: 'Edit', exact: true });

  await waitForMenuToSettle(menu);
  await item.hover();
  expect(await item.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect(menu).toHaveScreenshot('menu-item-hover.png', { animations: 'disabled' });

  const bounds = await item.boundingBox();
  if (!bounds) throw new Error('The Edit menu item should have a visible bounding box.');
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  expect(await item.evaluate((element) => element.matches(':active'))).toBe(true);
  await expect(menu).toHaveScreenshot('menu-item-pressed.png', { animations: 'disabled' });
  await page.mouse.up();
  await expect(example.getByRole('status')).toHaveText('Edit action activated');
});

for (const placement of [
  'Bottom start',
  'Bottom end',
  'Top start',
  'Top end',
  'Left start',
  'Left end',
  'Right start',
  'Right end',
] as const) {
  test(`shows the trigger and panel for the ${placement.toLowerCase()} placement @visual`, async ({
    page,
  }) => {
    const trigger = page.getByRole('button', { name: placement, exact: true });
    await trigger.click();

    const menu = page.getByRole('menu', { name: 'Placement actions', exact: true });
    await expect(menu).toBeVisible();
    const [triggerBounds, menuBounds] = await getBounds(trigger, menu);
    expectPlacementGeometry(triggerBounds, menuBounds, placement);
    expectWithinViewport(page, triggerBounds, menuBounds);
    await captureTriggerAndMenu(page, trigger, menu, `menu-placement-${toFileName(placement)}.png`);
  });
}

test('shows alignment, offset, and minimum-width geometry with each trigger @visual', async ({
  page,
}) => {
  const examples = page.getByRole('group', {
    name: 'Menu alignment and spacing examples',
    exact: true,
  });

  for (const [label, fileName] of [
    ['Start', 'menu-align-start.png'],
    ['End', 'menu-align-end.png'],
    ['Zero offset', 'menu-offset-zero.png'],
    ['12 px offset', 'menu-offset-12.png'],
    ['220 px minimum', 'menu-min-width.png'],
  ] as const) {
    const trigger = examples.getByRole('button', { name: label, exact: true });
    await trigger.click();
    const menu = page.getByRole('menu', { name: 'Positioned actions', exact: true });
    await expect(menu).toBeVisible();

    if (label === 'Start' || label === 'End') {
      await expectBottomAlignment(page, trigger, menu, label === 'Start' ? 'start' : 'end');
    } else if (label === 'Zero offset' || label === '12 px offset') {
      const expectedOffset = label === 'Zero offset' ? 0 : 12;
      await expect
        .poll(async () => {
          const [triggerBounds, menuBounds] = await getBounds(trigger, menu);
          const actualOffset = menuBounds.y - (triggerBounds.y + triggerBounds.height);
          return Math.abs(actualOffset - expectedOffset);
        })
        .toBeLessThanOrEqual(1);
    } else {
      await expect
        .poll(() => menu.evaluate((element) => element.getBoundingClientRect().width))
        .toBeGreaterThanOrEqual(220);
    }

    const [triggerBounds, menuBounds] = await getBounds(trigger, menu);
    expectWithinViewport(page, triggerBounds, menuBounds);
    await captureTriggerAndMenu(page, trigger, menu, fileName);
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
  }
});

test('opens the content menu and exposes supported item semantics @visual', async ({ page }) => {
  await page.getByRole('button', { name: 'Row actions', exact: true }).click();

  const menu = page.getByRole('menu', { name: 'Row actions', exact: true });
  await expect(menu).toBeVisible();
  await waitForMenuToSettle(menu);
  await expect(menu.getByText('Project', { exact: true })).toBeVisible();
  await expect(menu.getByRole('menuitem', { name: /Archive/ })).toBeDisabled();
  await expect(menu.getByRole('menuitem', { name: /Archive/ })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await expect(
    menu.getByRole('menuitem', { name: 'Project details', exact: true }),
  ).toHaveAttribute('href', '/components/menu#menu-content-example');
  await expect(
    menu.getByRole('menuitem', { name: 'Unavailable link', exact: true }),
  ).toHaveAttribute('aria-disabled', 'true');
  await expect(menu).toHaveScreenshot('menu-content-open.png');
});

test('navigates with an enabled anchor item and blocks a disabled anchor', async ({ page }) => {
  await waitForPlaygroundClientInteraction(page);
  const trigger = page.getByRole('button', { name: 'Row actions', exact: true });
  await trigger.press('ArrowDown');

  const menu = page.getByRole('menu', { name: 'Row actions', exact: true });
  const projectDetails = menu.getByRole('menuitem', { name: 'Project details', exact: true });
  await page.keyboard.press('ArrowDown');
  await expect(projectDetails).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/components\/menu#menu-content-example$/);
  await expect(page.locator('#menu-content-example')).toBeInViewport();
  await expect(menu).toBeHidden();

  await trigger.press('ArrowDown');
  const disabledLink = menu.getByRole('menuitem', { name: 'Unavailable link', exact: true });
  const locationBeforeBlockedActivation = page.url();
  await expect(disabledLink).toHaveAttribute('aria-disabled', 'true');
  await expect(disabledLink).toHaveAttribute('tabindex', '-1');
  await disabledLink.evaluate((element) => (element as HTMLAnchorElement).click());
  await expect(page).toHaveURL(locationBeforeBlockedActivation);
  await expect(menu).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('supports keyboard navigation, disabled-item skipping, and Escape focus restoration @visual', async ({
  page,
}) => {
  await waitForPlaygroundClientInteraction(page);

  const trigger = page.getByRole('button', { name: 'Row actions', exact: true });
  await trigger.press('ArrowDown');

  const menu = page.getByRole('menu', { name: 'Row actions', exact: true });
  const renameItem = menu.getByRole('menuitem', { name: /Rename/ });
  const projectDetails = menu.getByRole('menuitem', { name: 'Project details', exact: true });
  const copyItem = menu.getByRole('menuitem', { name: /Copy link/ });
  const archiveItem = menu.getByRole('menuitem', { name: /Archive/ });
  const deleteItem = menu.getByRole('menuitem', { name: 'Delete', exact: true });

  await expect(renameItem).toBeFocused();
  await waitForMenuToSettle(menu);
  await expect(menu).toHaveScreenshot('menu-keyboard-focus.png', { animations: 'disabled' });
  await page.keyboard.press('ArrowDown');
  await expect(projectDetails).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(copyItem).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(deleteItem).toBeFocused();
  await expect(archiveItem).toHaveAttribute('aria-disabled', 'true');

  await page.keyboard.press('Home');
  await expect(renameItem).toBeFocused();
  await page.keyboard.press('End');
  await expect(deleteItem).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(renameItem).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(deleteItem).toBeFocused();
  await page.keyboard.press('Escape');

  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(
    page.getByRole('group', { name: 'Menu content and states example' }),
  ).toHaveScreenshot('menu-keyboard-escape-closed.png');

  await trigger.press('ArrowUp');
  await expect(deleteItem).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('flips the preferred bottom placement above a trigger near the viewport edge', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 360 });
  const trigger = page.getByRole('button', { name: 'Bottom start', exact: true });
  await trigger.evaluate((element) =>
    element.scrollIntoView({ block: 'end', behavior: 'instant' }),
  );
  await expect(trigger).toBeInViewport();
  await trigger.click();

  const menu = page.getByRole('menu', { name: 'Placement actions', exact: true });
  await expect(menu).toBeVisible();
  const [triggerBounds, menuBounds] = await getBounds(trigger, menu);
  expect(menuBounds.y + menuBounds.height).toBeLessThanOrEqual(triggerBounds.y + 2);
  expectWithinViewport(page, triggerBounds, menuBounds);
});

for (const viewport of [
  { width: 320, height: 844, name: '320' },
  { width: 768, height: 1024, name: '768' },
]) {
  test(`captures the closed catalogue without overflow at ${viewport.name}px @visual`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    if (viewport.width === 320) await collapseMobileSidebar(page);

    const placementExamples = page.getByRole('group', {
      name: 'Menu placement examples',
      exact: true,
    });
    const spacingExamples = page.getByRole('group', {
      name: 'Menu alignment and spacing examples',
      exact: true,
    });
    const expectedColumns = viewport.width === 320 ? 1 : 2;
    expect(await countGridColumns(placementExamples)).toBe(expectedColumns);
    expect(await countGridColumns(spacingExamples)).toBe(viewport.width === 320 ? 1 : 3);
    await expectNoHorizontalOverflow(page);
    await expect(page.getByRole('main')).toHaveScreenshot(`menu-catalogue-${viewport.name}.png`, {
      animations: 'disabled',
    });
  });
}

test('keeps the open default menu in the viewport at 320px @visual', async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await collapseMobileSidebar(page);
  await expectNoHorizontalOverflow(page);

  const example = page.getByRole('group', { name: 'Default action menu example', exact: true });
  const trigger = example.getByRole('button', { name: 'Actions', exact: true });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();

  const menu = page.getByRole('menu', { name: 'Actions', exact: true });
  await expect(menu).toBeVisible();
  const [triggerBounds, menuBounds] = await getBounds(trigger, menu);
  expectWithinViewport(page, triggerBounds, menuBounds);
  await expectNoHorizontalOverflow(page);
  await captureTriggerAndMenu(page, trigger, menu, 'menu-default-open-320.png');

  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();

  const contentTrigger = page.getByRole('button', { name: 'Row actions', exact: true });
  await contentTrigger.scrollIntoViewIfNeeded();
  await contentTrigger.click();
  const contentMenu = page.getByRole('menu', { name: 'Row actions', exact: true });
  await expect(contentMenu).toBeVisible();
  const [contentTriggerBounds, contentMenuBounds] = await getBounds(contentTrigger, contentMenu);
  expectWithinViewport(page, contentTriggerBounds, contentMenuBounds);
  await expectNoHorizontalOverflow(page);
  await captureTriggerAndMenu(page, contentTrigger, contentMenu, 'menu-content-open-320.png');
});

async function getBounds(trigger: Locator, menu: Locator): Promise<[ElementBounds, ElementBounds]> {
  await waitForMenuToSettle(menu);
  const [triggerBounds, menuBounds] = await Promise.all([
    trigger.boundingBox(),
    menu.boundingBox(),
  ]);
  if (!triggerBounds || !menuBounds) {
    throw new Error('Both the native menu trigger and open menu panel need visible bounds.');
  }
  return [triggerBounds, menuBounds];
}

async function waitForMenuToSettle(menu: Locator): Promise<void> {
  await menu.evaluate(async (element) => {
    const nextFrame = (): Promise<void> =>
      new Promise((resolve) => requestAnimationFrame(() => resolve()));

    await Promise.all(
      element.getAnimations().map((animation) => animation.finished.catch(() => undefined)),
    );

    let previous = element.getBoundingClientRect();
    let stableFrames = 0;
    for (let attempts = 0; attempts < 30 && stableFrames < 2; attempts += 1) {
      await nextFrame();
      const current = element.getBoundingClientRect();
      const isStable =
        Math.abs(current.x - previous.x) < 0.01 &&
        Math.abs(current.y - previous.y) < 0.01 &&
        Math.abs(current.width - previous.width) < 0.01 &&
        Math.abs(current.height - previous.height) < 0.01;
      stableFrames = isStable ? stableFrames + 1 : 0;
      previous = current;
    }

    if (stableFrames < 2) throw new Error('The open menu panel did not settle before capture.');
  });
}

function expectPlacementGeometry(
  trigger: ElementBounds,
  menu: ElementBounds,
  placementLabel: string,
): void {
  const [side, alignment] = placementLabel.toLowerCase().split(' ');
  const tolerance = 6;

  if (side === 'bottom') {
    expect(menu.y).toBeGreaterThanOrEqual(trigger.y + trigger.height - tolerance);
  } else if (side === 'top') {
    expect(menu.y + menu.height).toBeLessThanOrEqual(trigger.y + tolerance);
  } else if (side === 'left') {
    expect(menu.x + menu.width).toBeLessThanOrEqual(trigger.x + tolerance);
  } else {
    expect(menu.x).toBeGreaterThanOrEqual(trigger.x + trigger.width - tolerance);
  }

  if (side === 'top' || side === 'bottom') {
    const panelEdge = alignment === 'end' ? menu.x + menu.width : menu.x;
    const triggerEdge = alignment === 'end' ? trigger.x + trigger.width : trigger.x;
    expect(Math.abs(panelEdge - triggerEdge)).toBeLessThanOrEqual(tolerance);
  } else {
    const panelEdge = alignment === 'end' ? menu.y + menu.height : menu.y;
    const triggerEdge = alignment === 'end' ? trigger.y + trigger.height : trigger.y;
    expect(Math.abs(panelEdge - triggerEdge)).toBeLessThanOrEqual(tolerance);
  }
}

async function expectBottomAlignment(
  page: Page,
  trigger: Locator,
  menu: Locator,
  alignment: 'start' | 'end',
): Promise<void> {
  await expect
    .poll(async () => {
      const [triggerBounds, menuBounds] = await getBounds(trigger, menu);
      const panelEdge = alignment === 'end' ? menuBounds.x + menuBounds.width : menuBounds.x;
      const triggerEdge =
        alignment === 'end' ? triggerBounds.x + triggerBounds.width : triggerBounds.x;
      return Math.abs(panelEdge - triggerEdge);
    })
    .toBeLessThanOrEqual(6);
}

function expectWithinViewport(page: Page, trigger: ElementBounds, menu: ElementBounds): void {
  const viewport = page.viewportSize();
  if (!viewport) throw new Error('The viewport size should be configured for Menu checks.');

  for (const bounds of [trigger, menu]) {
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.y).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height);
  }
}

async function captureTriggerAndMenu(
  page: Page,
  trigger: Locator,
  menu: Locator,
  fileName: string,
): Promise<void> {
  await page.mouse.move(1, 1);
  const [triggerBounds, menuBounds] = await getBounds(trigger, menu);
  const viewport = page.viewportSize();
  if (!viewport) throw new Error('The viewport size should be configured for Menu screenshots.');

  const x = Math.max(0, Math.floor(Math.min(triggerBounds.x, menuBounds.x) - 8));
  const y = Math.max(0, Math.floor(Math.min(triggerBounds.y, menuBounds.y) - 8));
  const right = Math.min(
    viewport.width,
    Math.ceil(Math.max(triggerBounds.x + triggerBounds.width, menuBounds.x + menuBounds.width) + 8),
  );
  const bottom = Math.min(
    viewport.height,
    Math.ceil(
      Math.max(triggerBounds.y + triggerBounds.height, menuBounds.y + menuBounds.height) + 8,
    ),
  );
  await expect(page).toHaveScreenshot(fileName, {
    clip: { x, y, width: right - x, height: bottom - y },
    animations: 'disabled',
  });
}

function toFileName(value: string): string {
  return value.toLowerCase().replaceAll(' ', '-');
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

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
}

async function countGridColumns(locator: Locator): Promise<number> {
  return locator.evaluate((element) => {
    const columns = getComputedStyle(element).gridTemplateColumns.trim();
    return columns ? columns.split(/\s+/).length : 0;
  });
}
