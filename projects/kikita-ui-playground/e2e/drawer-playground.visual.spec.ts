import { expect, type Locator, test } from '@playwright/test';

async function waitForAnimations(element: Locator): Promise<void> {
  await element.evaluate(async (node) => {
    await Promise.all(
      node.getAnimations().map((animation) => animation.finished.catch(() => undefined)),
    );
  });
}

interface DrawerPageLocale {
  title: string;
  accessibility: {
    placement: string;
    sizes: string;
    content: string;
    dismissal: string;
  };
  actions: {
    openDefault: string;
    openUntitled: string;
    cancel: string;
  };
  labels: {
    defaultTitle: string;
    defaultSubtitle: string;
  };
  status: {
    dismissed: string;
    cancelled: string;
  };
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('/components/drawer');
});

test('captures the Drawer catalogue groups', async ({ page }) => {
  for (const group of [
    { label: 'Drawer placement examples', screenshot: 'drawer-placement-catalogue.png' },
    { label: 'Drawer size examples', screenshot: 'drawer-sizes-catalogue.png' },
    { label: 'Drawer content examples', screenshot: 'drawer-content-catalogue.png' },
    { label: 'Drawer dismissal examples', screenshot: 'drawer-dismissal-catalogue.png' },
  ]) {
    await expect(page.getByRole('group', { name: group.label, exact: true })).toHaveScreenshot(
      group.screenshot,
      { animations: 'disabled' },
    );
  }
});

test('opens the minimal default Drawer with dialog semantics and context data', async ({
  page,
}) => {
  const group = page.getByRole('group', { name: 'Drawer placement examples', exact: true });
  const trigger = group.getByRole('button', { name: 'Open default', exact: true });

  await trigger.click();
  const drawer = page.getByRole('dialog', { name: 'Profile details', exact: true });
  await expect(drawer).toHaveAttribute('role', 'dialog');
  await expect(drawer).toHaveAttribute('aria-modal', 'true');
  await expect(drawer).toHaveAttribute('data-kui-side', 'right');
  await expect(drawer).toHaveAttribute('data-kui-size', 'md');
  await expect(drawer).toHaveAttribute('aria-labelledby', /kui-drawer-title-/);
  await expect(drawer.getByRole('heading', { level: 2, name: 'Profile details' })).toBeVisible();
  await expect(drawer.locator('.kui-drawer-subtitle')).toHaveText('Record TCK-1042');
  await expect(
    drawer.getByText('Placement and size: Right / Medium', { exact: true }),
  ).toBeVisible();
  await expect(drawer.getByText('Close button: Shown', { exact: true })).toBeVisible();
  await expect(drawer.getByRole('button', { name: 'Close', exact: true })).toBeVisible();
  expect(await drawer.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await expect(drawer).toHaveScreenshot('drawer-default-open.png', { animations: 'disabled' });

  await drawer.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(drawer).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(group.getByRole('status')).toHaveText('Drawer dismissed');

  await trigger.click();
  const savedDrawer = page.getByRole('dialog', { name: 'Profile details', exact: true });
  await savedDrawer.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(savedDrawer).toHaveCount(0);
  await expect(group.getByRole('status')).toHaveText('Drawer result: saved');
  await expect(trigger).toBeFocused();
});

test('opens each Drawer side from its configured edge', async ({ page }) => {
  const group = page.getByRole('group', { name: 'Drawer placement examples', exact: true });

  for (const side of [
    { label: 'Open default', value: 'right', title: 'Profile details' },
    { label: 'Open left', value: 'left', title: 'Placement example' },
    { label: 'Open top', value: 'top', title: 'Placement example' },
    { label: 'Open bottom', value: 'bottom', title: 'Placement example' },
  ]) {
    const trigger = group.getByRole('button', { name: side.label, exact: true });
    await trigger.click();
    const drawer = page.getByRole('dialog', { name: side.title, exact: true });
    await expect(drawer).toHaveAttribute('data-kui-side', side.value);
    await expect(drawer).toHaveAttribute('data-kui-size', 'md');
    await expect(drawer).toHaveScreenshot('drawer-side-' + side.value + '.png', {
      animations: 'disabled',
    });
    await page.keyboard.press('Escape');
    await expect(drawer).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
});

test('opens every size preset on horizontal and vertical edges', async ({ page }) => {
  const group = page.getByRole('group', { name: 'Drawer size examples', exact: true });
  const cases = [
    { label: 'Open right sm', side: 'right', size: 'sm', sideName: 'Right', sizeName: 'Small' },
    { label: 'Open right md', side: 'right', size: 'md', sideName: 'Right', sizeName: 'Medium' },
    { label: 'Open right lg', side: 'right', size: 'lg', sideName: 'Right', sizeName: 'Large' },
    { label: 'Open right full', side: 'right', size: 'full', sideName: 'Right', sizeName: 'Full' },
    { label: 'Open right auto', side: 'right', size: 'auto', sideName: 'Right', sizeName: 'Auto' },
    {
      label: 'Open bottom sm',
      side: 'bottom',
      size: 'sm',
      sideName: 'Bottom',
      sizeName: 'Small',
    },
    {
      label: 'Open bottom md',
      side: 'bottom',
      size: 'md',
      sideName: 'Bottom',
      sizeName: 'Medium',
    },
    {
      label: 'Open bottom lg',
      side: 'bottom',
      size: 'lg',
      sideName: 'Bottom',
      sizeName: 'Large',
    },
    {
      label: 'Open bottom full',
      side: 'bottom',
      size: 'full',
      sideName: 'Bottom',
      sizeName: 'Full',
    },
    {
      label: 'Open bottom auto',
      side: 'bottom',
      size: 'auto',
      sideName: 'Bottom',
      sizeName: 'Auto',
    },
  ];

  for (const item of cases) {
    const trigger = group.getByRole('button', { name: item.label, exact: true });
    await trigger.click();
    const drawer = page.getByRole('dialog', { name: 'Size preset', exact: true });
    await expect(drawer).toHaveAttribute('data-kui-side', item.side);
    await expect(drawer).toHaveAttribute('data-kui-size', item.size);
    await expect(
      drawer.getByText('Placement and size: ' + item.sideName + ' / ' + item.sizeName, {
        exact: true,
      }),
    ).toBeVisible();
    if (item.size === 'auto') {
      const bounds = await drawer.boundingBox();
      expect(bounds).not.toBeNull();
      expect(item.side === 'right' ? bounds!.width : bounds!.height).toBeGreaterThanOrEqual(
        item.side === 'right' ? 320 : 200,
      );
    }
    await expect(drawer).toHaveScreenshot('drawer-size-' + item.side + '-' + item.size + '.png', {
      animations: 'disabled',
    });
    await page.keyboard.press('Escape');
    await expect(drawer).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
});

test('keeps focus within the Drawer and restores it to the opener', async ({ page }) => {
  const group = page.getByRole('group', { name: 'Drawer placement examples', exact: true });
  const trigger = group.getByRole('button', { name: 'Open default', exact: true });

  await trigger.focus();
  await page.keyboard.press('Enter');
  const drawer = page.getByRole('dialog', { name: 'Profile details', exact: true });
  expect(await drawer.evaluate((element) => element.contains(document.activeElement))).toBe(true);

  await page.keyboard.press('Shift+Tab');
  expect(await drawer.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Tab');
  expect(await drawer.evaluate((element) => element.contains(document.activeElement))).toBe(true);

  await page.keyboard.press('Escape');
  await expect(drawer).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('keeps close-button, Escape, and backdrop settings independent', async ({ page }) => {
  const group = page.getByRole('group', { name: 'Drawer dismissal examples', exact: true });
  const backdrop = page.locator('.kui-drawer-backdrop');

  const noCloseTrigger = group.getByRole('button', {
    name: 'Open without close button',
    exact: true,
  });
  await noCloseTrigger.click();
  let drawer = page.getByRole('dialog', { name: 'Close button hidden', exact: true });
  await expect(drawer.getByRole('button', { name: 'Close', exact: true })).toHaveCount(0);
  await expect(drawer.getByText('Close button: Hidden', { exact: true })).toBeVisible();
  await expect(drawer).toHaveScreenshot('drawer-closable-false.png', {
    animations: 'disabled',
  });
  await page.keyboard.press('Escape');
  await expect(drawer).toHaveCount(0);
  await expect(noCloseTrigger).toBeFocused();

  await noCloseTrigger.click();
  drawer = page.getByRole('dialog', { name: 'Close button hidden', exact: true });
  await backdrop.click({ position: { x: 4, y: 4 } });
  await expect(drawer).toHaveCount(0);
  await expect(noCloseTrigger).toBeFocused();

  const noEscapeTrigger = group.getByRole('button', {
    name: 'Open with Escape disabled',
    exact: true,
  });
  await noEscapeTrigger.click();
  drawer = page.getByRole('dialog', { name: 'Escape dismissal disabled', exact: true });
  await page.keyboard.press('Escape');
  await expect(drawer).toBeVisible();
  await backdrop.click({ position: { x: 4, y: 4 } });
  await expect(drawer).toHaveCount(0);
  await expect(noEscapeTrigger).toBeFocused();

  const noBackdropTrigger = group.getByRole('button', {
    name: 'Open with backdrop dismissal disabled',
    exact: true,
  });
  await noBackdropTrigger.click();
  drawer = page.getByRole('dialog', { name: 'Backdrop dismissal disabled', exact: true });
  await backdrop.click({ position: { x: 4, y: 4 } });
  await expect(drawer).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(drawer).toHaveCount(0);
  await expect(noBackdropTrigger).toBeFocused();
});

test('keeps the locked Drawer open until its action resolves the result', async ({ page }) => {
  const group = page.getByRole('group', { name: 'Drawer dismissal examples', exact: true });
  const trigger = group.getByRole('button', { name: 'Open locked drawer', exact: true });

  await trigger.click();
  const drawer = page.getByRole('dialog', { name: 'Required action', exact: true });
  await expect(drawer.getByRole('button', { name: 'Close', exact: true })).toHaveCount(0);
  await expect(drawer).toHaveScreenshot('drawer-locked.png', { animations: 'disabled' });
  await page.keyboard.press('Escape');
  await expect(drawer).toBeVisible();
  await page.locator('.kui-drawer-backdrop').click({ position: { x: 4, y: 4 } });
  await expect(drawer).toBeVisible();

  await drawer.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(drawer).toHaveCount(0);
  await expect(group.getByRole('status')).toHaveText('Drawer result: continued');
  await expect(trigger).toBeFocused();
});

test('does not dismiss when a pointer drag starts inside the Drawer', async ({ page }) => {
  const group = page.getByRole('group', { name: 'Drawer dismissal examples', exact: true });
  await group.getByRole('button', { name: 'Open without close button', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Close button hidden', exact: true });
  const body = drawer.locator('.kui-drawer-body');
  const bounds = await body.boundingBox();
  expect(bounds).not.toBeNull();

  await page.mouse.move(bounds!.x + 16, bounds!.y + 16);
  await page.mouse.down();
  await page.mouse.move(4, 4, { steps: 5 });
  await page.mouse.up();
  await expect(drawer).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(drawer).toHaveCount(0);
});

test('keeps long titles clear of the close button and scrolls long content internally', async ({
  page,
}) => {
  const group = page.getByRole('group', { name: 'Drawer content examples', exact: true });

  await group.getByRole('button', { name: 'Open long title', exact: true }).click();
  const longTitle = 'Review account changes before returning to the workspace';
  const longTitleDrawer = page.getByRole('dialog', { name: longTitle, exact: true });
  const titleGeometry = await longTitleDrawer.evaluate((drawer) => {
    const title = drawer.querySelector('.kui-drawer-title');
    const close = drawer.querySelector('.kui-drawer-close');
    if (!(title instanceof HTMLElement) || !(close instanceof HTMLElement)) {
      throw new Error('Expected a drawer title and close button.');
    }

    return {
      titleRight: title.getBoundingClientRect().right,
      closeLeft: close.getBoundingClientRect().left,
    };
  });
  expect(titleGeometry.titleRight).toBeLessThan(titleGeometry.closeLeft);
  await expect(longTitleDrawer).toHaveScreenshot('drawer-long-title.png', {
    animations: 'disabled',
  });
  await page.keyboard.press('Escape');
  await expect(longTitleDrawer).toHaveCount(0);

  await group.getByRole('button', { name: 'Open long body', exact: true }).click();
  const scrollDrawer = page.getByRole('dialog', { name: 'Activity history', exact: true });
  const body = scrollDrawer.locator('.kui-drawer-body');
  const metrics = await body.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
  await expect(scrollDrawer).toHaveScreenshot('drawer-long-body.png', {
    animations: 'disabled',
  });
  await body.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(scrollDrawer.getByRole('button', { name: 'Save', exact: true })).toBeVisible();
  expect(await body.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await page.keyboard.press('Escape');
  await expect(scrollDrawer).toHaveCount(0);
});

test('uses the library accessible-name fallback for untitled content', async ({ page }) => {
  const group = page.getByRole('group', { name: 'Drawer content examples', exact: true });
  await group.getByRole('button', { name: 'Open untitled', exact: true }).click();

  const drawer = page.getByRole('dialog', { name: 'Drawer', exact: true });
  await expect(drawer).toHaveAttribute('aria-label', 'Drawer');
  await expect(drawer).not.toHaveAttribute('aria-labelledby');
  await expect(
    drawer.getByText('This drawer has no visible title', { exact: false }),
  ).toBeVisible();
  await expect(drawer).toHaveScreenshot('drawer-untitled.png', { animations: 'disabled' });
  await page.keyboard.press('Escape');
  await expect(drawer).toHaveCount(0);
});

test('uses the short reduced-motion duration for Drawer and backdrop animations', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page
    .getByRole('group', { name: 'Drawer placement examples', exact: true })
    .getByRole('button', { name: 'Open default', exact: true })
    .click();

  const drawer = page.getByRole('dialog', { name: 'Profile details', exact: true });
  const durations = await Promise.all(
    [drawer, page.locator('.kui-drawer-backdrop')].map((element) =>
      element.evaluate((node) => {
        const duration = getComputedStyle(node).animationDuration;
        const numericValue = Number.parseFloat(duration);

        return duration.endsWith('ms') ? numericValue : numericValue * 1000;
      }),
    ),
  );
  expect(durations).toEqual([1, 1]);
  await page.keyboard.press('Escape');
  await expect(drawer).toHaveCount(0);
});

test('translates the page content while preserving library-owned English labels', async ({
  page,
}) => {
  const englishResponse = await page.request.get('/i18n/drawer/en.json');
  const localeResponse = await page.request.get('/i18n/drawer/ru.json');
  expect(englishResponse.ok()).toBeTruthy();
  expect(localeResponse.ok()).toBeTruthy();
  const english = (await englishResponse.json()) as DrawerPageLocale;
  const russian = (await localeResponse.json()) as DrawerPageLocale;

  const englishGroup = page.getByRole('group', {
    name: english.accessibility.placement,
    exact: true,
  });
  await englishGroup
    .getByRole('button', { name: english.actions.openDefault, exact: true })
    .click();
  const englishDrawer = page.getByRole('dialog', {
    name: english.labels.defaultTitle,
    exact: true,
  });
  await englishDrawer.getByRole('button', { name: english.actions.cancel, exact: true }).click();
  await expect(englishGroup.getByRole('status')).toHaveText(english.status.cancelled);

  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Switch language to Russian', exact: true })
    .click();

  await expect(page.getByRole('heading', { level: 1, name: russian.title })).toBeVisible();
  const group = page.getByRole('group', { name: russian.accessibility.placement, exact: true });
  await expect(group.getByRole('status')).toHaveText(russian.status.cancelled);
  const trigger = group.getByRole('button', { name: russian.actions.openDefault, exact: true });
  await trigger.click();

  const drawer = page.getByRole('dialog', { name: russian.labels.defaultTitle, exact: true });
  await expect(drawer.locator('.kui-drawer-subtitle')).toHaveText(russian.labels.defaultSubtitle);
  await expect(drawer.getByRole('button', { name: 'Close', exact: true })).toBeVisible();
  await drawer.getByRole('button', { name: russian.actions.cancel, exact: true }).click();
  await expect(group.getByRole('status')).toHaveText(russian.status.cancelled);

  await page
    .getByRole('group', { name: russian.accessibility.content, exact: true })
    .getByRole('button', { name: russian.actions.openUntitled, exact: true })
    .click();
  const untitledDrawer = page.getByRole('dialog', { name: 'Drawer', exact: true });
  await expect(untitledDrawer).toHaveAttribute('aria-label', 'Drawer');
  await page.keyboard.press('Escape');
  await expect(untitledDrawer).toHaveCount(0);
});

test('server-renders the closed Drawer route and opens only after hydration', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  const response = await page.request.get('/components/drawer');
  expect(response.status()).toBe(200);
  const serverMarkup = await response.text();
  expect(serverMarkup).toContain('<h1');
  const serverHasDrawerOverlay = await page.evaluate((markup) => {
    const serverDocument = new DOMParser().parseFromString(markup, 'text/html');

    return serverDocument.querySelector('.kui-drawer-backdrop, [role="dialog"]') !== null;
  }, serverMarkup);
  expect(serverHasDrawerOverlay).toBe(false);

  await page.goto('/components/drawer');
  await expect(page.getByRole('heading', { level: 1, name: 'Drawer' })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page
    .getByRole('group', { name: 'Drawer placement examples', exact: true })
    .getByRole('button', { name: 'Open default', exact: true })
    .click();
  const drawer = page.getByRole('dialog', { name: 'Profile details', exact: true });
  await expect(drawer).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(drawer).toHaveCount(0);
  expect(consoleErrors).toEqual([]);
});

test('keeps the Drawer catalogue and open panels within 768px and 320px layouts', async ({
  page,
}) => {
  for (const viewport of [
    { width: 768, height: 1024, name: 'tablet-768' },
    { width: 320, height: 640, name: 'mobile-320' },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/components/drawer');

    const main = page.getByRole('main');
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(
      dimensions.scrollWidth,
      viewport.name + ' document overflow: ' + JSON.stringify(dimensions),
    ).toBeLessThanOrEqual(dimensions.clientWidth);
    await expect(main).toHaveScreenshot('drawer-page-' + viewport.name + '.png', {
      animations: 'disabled',
    });

    const placement = page.getByRole('group', { name: 'Drawer placement examples', exact: true });
    const trigger = placement.getByRole('button', { name: 'Open default', exact: true });
    await trigger.click();
    const drawer = page.getByRole('dialog', { name: 'Profile details', exact: true });
    await waitForAnimations(drawer);
    const bounds = await drawer.boundingBox();
    expect(bounds, viewport.name + ': default Drawer should have bounds').not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(
      bounds!.x + bounds!.width,
      viewport.name + ': default Drawer should stay within the viewport: ' + JSON.stringify(bounds),
    ).toBeLessThanOrEqual(viewport.width);
    await page.keyboard.press('Escape');
    await expect(drawer).toHaveCount(0);

    const sizes = page.getByRole('group', { name: 'Drawer size examples', exact: true });
    await sizes.getByRole('button', { name: 'Open right full', exact: true }).click();
    const full = page.getByRole('dialog', { name: 'Size preset', exact: true });
    await waitForAnimations(full);
    const fullBounds = await full.boundingBox();
    expect(fullBounds, viewport.name + ': full Drawer should have bounds').not.toBeNull();
    expect(fullBounds!.x).toBeGreaterThanOrEqual(0);
    expect(fullBounds!.x + fullBounds!.width).toBeLessThanOrEqual(viewport.width);
    expect(fullBounds!.width).toBeGreaterThanOrEqual(viewport.width - 1);
    await expect(full).toHaveScreenshot('drawer-full-' + viewport.name + '.png', {
      animations: 'disabled',
    });
    await page.keyboard.press('Escape');
    await expect(full).toHaveCount(0);

    await sizes.getByRole('button', { name: 'Open bottom full', exact: true }).click();
    const bottomFull = page.getByRole('dialog', { name: 'Size preset', exact: true });
    await waitForAnimations(bottomFull);
    await expect(bottomFull).toHaveAttribute('data-kui-side', 'bottom');
    await expect(bottomFull).toHaveAttribute('data-kui-size', 'full');
    const bottomFullBounds = await bottomFull.boundingBox();
    expect(
      bottomFullBounds,
      viewport.name + ': bottom/full Drawer should have bounds',
    ).not.toBeNull();
    expect(bottomFullBounds!.y).toBeGreaterThanOrEqual(0);
    expect(bottomFullBounds!.y + bottomFullBounds!.height).toBeLessThanOrEqual(viewport.height);
    expect(bottomFullBounds!.height).toBeGreaterThanOrEqual(viewport.height - 1);
    await page.keyboard.press('Escape');
    await expect(bottomFull).toHaveCount(0);
  }
});
