import type { Locator, Page } from '@playwright/test';

import { expect, test } from './support/fixtures';

interface DialogPageLocale {
  title: string;
  accessibility: {
    sizes: string;
    appearances: string;
    content: string;
    confirm: string;
  };
  actions: {
    openDefault: string;
    openAuto: string;
    openSm: string;
    openMd: string;
    openLg: string;
    openFullscreen: string;
    openDefaultAppearance: string;
    openDangerAppearance: string;
    openWarningAppearance: string;
    openNoClose: string;
    openLocked: string;
    openTitleExample: string;
    openLongBody: string;
    openUnnamed: string;
    openConfirmDefault: string;
    openConfirmDanger: string;
    openConfirmWarning: string;
    openConfirmWithoutMessage: string;
    cancel: string;
    continue: string;
    delete: string;
    reset: string;
  };
  labels: {
    defaultTitle: string;
    dangerAppearanceTitle: string;
    warningAppearanceTitle: string;
    titleExample: string;
    longBodyTitle: string;
    unnamedBody: string;
    confirmTitle: string;
    dangerConfirmTitle: string;
    warningConfirmTitle: string;
    headerOnlyTitle: string;
    fullscreenTitle: string;
  };
  status: {
    saved: string;
    cancelled: string;
    confirm: {
      yes: string;
      no: string;
    };
  };
}

type DialogShellTheme = 'dark' | 'light';

async function selectTheme(page: Page, theme: DialogShellTheme): Promise<void> {
  const root = page.locator('html');
  const currentTheme = await root.getAttribute('data-kui-theme');

  if (currentTheme !== theme) {
    await page
      .getByRole('banner')
      .getByRole('button', { name: 'Switch to ' + theme + ' theme', exact: true })
      .click();
  }

  await expect(root).toHaveAttribute('data-kui-theme', theme);
}

async function waitForDialogEntrance(dialog: Locator): Promise<void> {
  await dialog.evaluate(async (element) => {
    const entrance = element.getAnimations().find((animation) => {
      return 'animationName' in animation && animation.animationName === 'kui-dialog-in';
    });

    await entrance?.finished.catch(() => undefined);
  });
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('/components/dialog');
});

test('captures the Dialog catalogue groups @visual', async ({ page }) => {
  const groups = [
    { label: 'Dialog size examples', screenshot: 'dialog-sizes-catalogue.png' },
    { label: 'Dialog appearance examples', screenshot: 'dialog-appearances-catalogue.png' },
    { label: 'Dialog content and dismissal examples', screenshot: 'dialog-content-catalogue.png' },
    { label: 'Confirmation dialog examples', screenshot: 'dialog-confirm-catalogue.png' },
  ];

  for (const theme of ['dark', 'light'] as const) {
    await selectTheme(page, theme);

    for (const group of groups) {
      const groupLocator = page.getByRole('group', { name: group.label, exact: true });
      const groupBounds = await groupLocator.boundingBox();
      const firstButtonBounds = await groupLocator.getByRole('button').first().boundingBox();
      expect(groupBounds, group.label + ' should have bounds').not.toBeNull();
      expect(firstButtonBounds, group.label + ' first trigger should have bounds').not.toBeNull();
      expect(firstButtonBounds!.x).toBeGreaterThanOrEqual(groupBounds!.x);
      expect(firstButtonBounds!.x + firstButtonBounds!.width).toBeLessThanOrEqual(
        groupBounds!.x + groupBounds!.width,
      );
      await expect(groupLocator).toHaveScreenshot(
        group.screenshot.replace('.png', '-' + theme + '.png'),
        { animations: 'disabled' },
      );
    }
  }
});

test('captures open Dialog surfaces in both shell themes @visual', async ({ page }) => {
  const group = page.getByRole('group', { name: 'Dialog size examples', exact: true });
  const panelBackgrounds = new Map<DialogShellTheme, string>();

  for (const theme of ['dark', 'light'] as const) {
    await selectTheme(page, theme);

    await group.getByRole('button', { name: 'Open default', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Profile details', exact: true });
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await waitForDialogEntrance(dialog);
    panelBackgrounds.set(
      theme,
      await dialog.evaluate((element) => getComputedStyle(element).backgroundColor),
    );
    await expect(dialog).toHaveScreenshot('dialog-open-default-' + theme + '.png', {
      animations: 'disabled',
    });
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);

    await group.getByRole('button', { name: 'Open fullscreen', exact: true }).click();
    const fullscreen = page.getByRole('dialog', { name: 'Fullscreen dialog', exact: true });
    await waitForDialogEntrance(fullscreen);
    await expect(fullscreen).toHaveScreenshot('dialog-open-fullscreen-' + theme + '.png', {
      animations: 'disabled',
    });
    await page.keyboard.press('Escape');
    await expect(fullscreen).toHaveCount(0);
  }

  expect(panelBackgrounds.get('light')).not.toBe(panelBackgrounds.get('dark'));
});

test('opens the default Dialog and each supported size @visual', async ({ page }) => {
  const group = page.getByRole('group', { name: 'Dialog size examples', exact: true });
  const sizes = [
    { label: 'Open default', suffix: 'md', screenshot: 'default', title: 'Profile details' },
    { label: 'Open auto', suffix: 'auto', screenshot: 'auto', title: 'Auto size' },
    { label: 'Open sm', suffix: 'sm', screenshot: 'sm', title: 'Small dialog' },
    { label: 'Open md', suffix: 'md', screenshot: 'md', title: 'Medium dialog' },
    { label: 'Open lg', suffix: 'lg', screenshot: 'lg', title: 'Large dialog' },
    {
      label: 'Open fullscreen',
      suffix: 'fullscreen',
      screenshot: 'fullscreen',
      title: 'Fullscreen dialog',
    },
  ];

  for (const size of sizes) {
    const trigger = group.getByRole('button', { name: size.label, exact: true });
    if (size.screenshot === 'default') {
      await trigger.focus();
      await page.keyboard.press('Enter');
    } else {
      await trigger.click();
    }

    const dialog = page.getByRole('dialog', { name: size.title, exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    if (size.screenshot === 'default') {
      await expect(dialog).not.toHaveAttribute('aria-label');
      expect(await dialog.getAttribute('aria-labelledby')).toMatch(/^kui-dialog-title-\d+$/);
      const portalLocation = await dialog.evaluate((element) => {
        const overlayContainer = element.closest('.cdk-overlay-container');

        return {
          attachedToDocumentBody: document.body.contains(element),
          overlayContainerIsBodyChild: overlayContainer?.parentElement === document.body,
        };
      });

      expect(portalLocation).toEqual({
        attachedToDocumentBody: true,
        overlayContainerIsBodyChild: true,
      });
    }
    await expect(dialog).toHaveClass(new RegExp(`kui-dialog--${size.suffix}`));
    await expect(dialog).not.toHaveAttribute('data-kui-appearance');
    await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeVisible();
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await expect(dialog).toHaveScreenshot(`dialog-open-${size.screenshot}.png`, {
      animations: 'disabled',
    });

    await page.keyboard.press('Shift+Tab');
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(group.getByRole('status')).toHaveText('Dialog result: dismissed');
  }
});

test('closes through the built-in close button and restores opener focus', async ({ page }) => {
  const group = page.getByRole('group', { name: 'Dialog size examples', exact: true });
  const trigger = group.getByRole('button', { name: 'Open default', exact: true });

  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Profile details', exact: true });
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();

  await expect(dialog).toHaveCount(0);
  await expect(group.getByRole('status')).toHaveText('Dialog result: dismissed');
  await expect(trigger).toBeFocused();
});

test('captures all Dialog appearances and icon states @visual', async ({ page }) => {
  const group = page.getByRole('group', { name: 'Dialog appearance examples', exact: true });
  const appearances = [
    { label: 'Open default appearance', title: 'Default appearance', appearance: null },
    { label: 'Open danger appearance', title: 'Danger appearance', appearance: 'danger' },
    { label: 'Open warning appearance', title: 'Warning appearance', appearance: 'warning' },
  ];

  for (const theme of ['dark', 'light'] as const) {
    await selectTheme(page, theme);

    for (const item of appearances) {
      const trigger = group.getByRole('button', { name: item.label, exact: true });
      await trigger.click();

      const dialog = page.getByRole('dialog', { name: item.title, exact: true });
      await expect(dialog.locator('.kui-dialog-icon')).toBeVisible();
      if (item.appearance) {
        await expect(dialog).toHaveAttribute('data-kui-appearance', item.appearance);
      } else {
        await expect(dialog).not.toHaveAttribute('data-kui-appearance');
      }
      await expect(dialog).toHaveScreenshot(
        'dialog-appearance-' + (item.appearance ?? 'default') + '-' + theme + '.png',
        { animations: 'disabled' },
      );

      await dialog.getByRole('button', { name: 'Continue', exact: true }).click();
      await expect(dialog).toHaveCount(0);
      await expect(group.getByRole('status')).toHaveText('Dialog result: saved');
    }
  }
});

test('keeps Tab and Shift+Tab focus inside the dialog and restores the trigger on Escape', async ({
  page,
}) => {
  const trigger = page
    .getByRole('group', { name: 'Dialog size examples', exact: true })
    .getByRole('button', { name: 'Open default', exact: true });
  const dialog = page.getByRole('dialog');

  await trigger.click();
  await expect(dialog).toBeVisible();

  for (const key of ['Tab', 'Shift+Tab']) {
    for (let press = 0; press < 8; press++) {
      await page.keyboard.press(key);
      expect(
        await dialog.evaluate((element) => element.contains(document.activeElement)),
        `after ${key} ${press + 1}`,
      ).toBe(true);
    }
  }

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('keeps closability separate from Escape and backdrop dismissal @visual', async ({ page }) => {
  const group = page.getByRole('group', {
    name: 'Dialog content and dismissal examples',
    exact: true,
  });
  const trigger = group.getByRole('button', { name: 'Open without close button', exact: true });

  await trigger.click();
  let dialog = page.getByRole('dialog', { name: 'Close button hidden', exact: true });
  await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toHaveCount(0);
  await expect(dialog).toHaveScreenshot('dialog-closable-false.png', { animations: 'disabled' });

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.click();
  dialog = page.getByRole('dialog', { name: 'Close button hidden', exact: true });
  const bodyBounds = await dialog.locator('.kui-dialog-body').boundingBox();
  expect(bodyBounds).not.toBeNull();
  await page.mouse.move(bodyBounds!.x + 12, bodyBounds!.y + 12);
  await page.mouse.down();
  await page.mouse.move(4, 4);
  await page.mouse.up();
  await expect(dialog).toBeVisible();

  await page.locator('.kui-dialog-backdrop').click({ position: { x: 4, y: 4 } });
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('keeps locked dialogs open until an in-dialog action resolves them @visual', async ({
  page,
}) => {
  const group = page.getByRole('group', {
    name: 'Dialog content and dismissal examples',
    exact: true,
  });
  const trigger = group.getByRole('button', { name: 'Open non-dismissable', exact: true });

  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Required action', exact: true });
  await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toHaveCount(0);
  await expect(dialog).toHaveScreenshot('dialog-non-dismissable.png', {
    animations: 'disabled',
  });

  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await page.locator('.kui-dialog-backdrop').click({ position: { x: 4, y: 4 } });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(group.getByRole('status')).toHaveText('Dialog result: saved');
  await expect(trigger).toBeFocused();
});

test('keeps the example title clear and scrolls long bodies internally @visual', async ({
  page,
}) => {
  const group = page.getByRole('group', {
    name: 'Dialog content and dismissal examples',
    exact: true,
  });

  await group.getByRole('button', { name: 'Open title example', exact: true }).click();
  const titleDialog = page.getByRole('dialog', {
    name: 'Compact title',
    exact: true,
  });
  await waitForDialogEntrance(titleDialog);
  const titleGeometry = await titleDialog.evaluate((dialog) => {
    const title = dialog.querySelector('.kui-dialog-title');
    const close = dialog.querySelector('.kui-dialog-close');
    if (!(title instanceof HTMLElement) || !(close instanceof HTMLElement)) {
      throw new Error('Expected a title and close button in the long-title dialog.');
    }

    const titleText = document.createRange();
    titleText.selectNodeContents(title);

    return {
      titleTextRight: titleText.getBoundingClientRect().right,
      closeLeft: close.getBoundingClientRect().left,
    };
  });

  expect(titleGeometry.titleTextRight).toBeLessThan(titleGeometry.closeLeft);
  await expect(titleDialog).toHaveScreenshot('dialog-title-fit.png', {
    animations: 'disabled',
  });
  await page.keyboard.press('Escape');
  await expect(titleDialog).toHaveCount(0);

  await group.getByRole('button', { name: 'Open long body', exact: true }).click();
  const longBodyDialog = page.getByRole('dialog', { name: 'Scrollable dialog body', exact: true });
  const bodyMetrics = await longBodyDialog.locator('.kui-dialog-body').evaluate((body) => ({
    clientHeight: body.clientHeight,
    scrollHeight: body.scrollHeight,
  }));

  expect(bodyMetrics.scrollHeight).toBeGreaterThan(bodyMetrics.clientHeight);
  await expect(longBodyDialog.getByRole('button', { name: 'Continue', exact: true })).toBeVisible();
  await expect(longBodyDialog).toHaveScreenshot('dialog-long-body.png', {
    animations: 'disabled',
  });
  await page.keyboard.press('Escape');
  await expect(longBodyDialog).toHaveCount(0);
});

test('uses the accessible name fallback when custom content has no title', async ({ page }) => {
  const group = page.getByRole('group', {
    name: 'Dialog content and dismissal examples',
    exact: true,
  });
  await group.getByRole('button', { name: 'Open name fallback', exact: true }).click();

  const dialog = page.getByRole('dialog', { name: 'Dialog', exact: true });
  await expect(dialog).toHaveAttribute('aria-label', 'Dialog');
  await expect(dialog).not.toHaveAttribute('aria-labelledby');
  await expect(dialog.getByText('This dialog has no title.', { exact: false })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('uses opacity-only dialog motion when reduced motion is preferred', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page
    .getByRole('group', { name: 'Dialog size examples', exact: true })
    .getByRole('button', { name: 'Open default', exact: true })
    .click();

  const dialog = page.getByRole('dialog', { name: 'Profile details', exact: true });
  const animationData = await dialog.evaluate((element) => {
    const animation = element.getAnimations().find((candidate) => {
      return 'animationName' in candidate && candidate.animationName === 'kui-dialog-in';
    });
    const effect = animation?.effect;

    return {
      animationName: animation && 'animationName' in animation ? animation.animationName : null,
      keyframes:
        effect instanceof KeyframeEffect
          ? effect.getKeyframes().map((frame) => Object.keys(frame))
          : [],
    };
  });

  expect(animationData.animationName).toBe('kui-dialog-in');
  expect(animationData.keyframes.length).toBeGreaterThan(0);
  expect(animationData.keyframes.some((frame) => frame.includes('transform'))).toBe(false);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('returns false and true from the locked confirmation actions @visual', async ({ page }) => {
  const group = page.getByRole('group', { name: 'Confirmation dialog examples', exact: true });
  const cancelTrigger = group.getByRole('button', { name: 'Open default confirm', exact: true });

  await cancelTrigger.click();
  const defaultDialog = page.getByRole('dialog', {
    name: 'Continue with this action?',
    exact: true,
  });
  await expect(defaultDialog).toHaveClass(/kui-dialog--sm/);
  await expect(defaultDialog.getByRole('button', { name: 'Close', exact: true })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(defaultDialog).toBeVisible();
  await expect(defaultDialog).toHaveScreenshot('dialog-confirm-default.png', {
    animations: 'disabled',
  });
  await defaultDialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(defaultDialog).toHaveCount(0);
  await expect(group.getByRole('status')).toHaveText('Confirmation result: cancelled');
  await expect(cancelTrigger).toBeFocused();

  const dangerTrigger = group.getByRole('button', { name: 'Open danger confirm', exact: true });
  await dangerTrigger.click();
  const dangerDialog = page.getByRole('dialog', { name: 'Delete this record?', exact: true });
  await expect(dangerDialog).toHaveAttribute('data-kui-appearance', 'danger');
  await expect(dangerDialog).toHaveScreenshot('dialog-confirm-danger.png', {
    animations: 'disabled',
  });
  const dangerConfirmButton = dangerDialog.getByRole('button', { name: 'Delete', exact: true });
  await expect(dangerConfirmButton).toHaveAttribute('data-kui-appearance', 'danger');
  await dangerConfirmButton.click();
  await expect(dangerDialog).toHaveCount(0);
  await expect(group.getByRole('status')).toHaveText('Confirmation result: confirmed');

  await group.getByRole('button', { name: 'Open warning confirm', exact: true }).click();
  const warningDialog = page.getByRole('dialog', { name: 'Reset settings?', exact: true });
  await expect(warningDialog).toHaveAttribute('data-kui-appearance', 'warning');
  await expect(warningDialog).toHaveScreenshot('dialog-confirm-warning.png', {
    animations: 'disabled',
  });
  const warningConfirmButton = warningDialog.getByRole('button', { name: 'Reset', exact: true });
  await expect(warningConfirmButton).not.toHaveAttribute('data-kui-appearance');
  await warningConfirmButton.click();
  await expect(warningDialog).toHaveCount(0);
  await expect(group.getByRole('status')).toHaveText('Confirmation result: confirmed');

  await group.getByRole('button', { name: 'Open without message', exact: true }).click();
  const headerOnlyDialog = page.getByRole('dialog', {
    name: 'Header-only confirmation',
    exact: true,
  });
  await expect(headerOnlyDialog.locator('.kui-dialog-body')).toHaveCount(0);
  await expect(headerOnlyDialog).toHaveScreenshot('dialog-confirm-header-only.png', {
    animations: 'disabled',
  });
  await headerOnlyDialog.getByRole('button', { name: 'Cancel', exact: true }).click();
});

test('translates the page and dialog content when the shell switches language', async ({
  page,
}) => {
  const localeResponse = await page.request.get('/i18n/dialog/ru.json');
  expect(localeResponse.ok()).toBeTruthy();
  const russian = (await localeResponse.json()) as DialogPageLocale;

  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Switch language to Russian', exact: true })
    .click();

  await expect(page.getByRole('heading', { level: 1, name: russian.title })).toBeVisible();
  const group = page.getByRole('group', { name: russian.accessibility.sizes, exact: true });
  const trigger = group.getByRole('button', { name: russian.actions.openDefault, exact: true });
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: russian.labels.defaultTitle, exact: true });
  await expect(
    dialog.getByRole('button', { name: russian.actions.cancel, exact: true }),
  ).toBeVisible();
  await dialog.getByRole('button', { name: russian.actions.cancel, exact: true }).click();
  await expect(group.getByRole('status')).toHaveText(russian.status.cancelled);
});

test('server renders the Dialog route without opening an overlay', async ({ page }) => {
  const consoleErrors: string[] = [];
  const runtimeErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  const response = await page.request.get('/components/dialog');

  expect(response.status()).toBe(200);
  const serverMarkup = await response.text();
  expect(serverMarkup).toContain('<h1');
  expect(serverMarkup).toMatch(/<h1\b[^>]*>\s*Dialog\s*<\/h1>/);
  expect(serverMarkup).not.toMatch(/<div\b[^>]*\bclass="[^"]*\bkui-dialog-backdrop\b/);
  expect(serverMarkup).not.toMatch(/<div\b[^>]*\bclass="[^"]*\bkui-dialog(?:\s|")/);

  await page.goto('/components/dialog');
  await expect(page.getByRole('heading', { level: 1, name: 'Dialog' })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(consoleErrors).toEqual([]);
  expect(runtimeErrors).toEqual([]);
});

test('keeps the catalogue and modal within 768px and 320px layouts @visual', async ({ page }) => {
  for (const theme of ['dark', 'light'] as const) {
    await page.setViewportSize({ width: 1440, height: 1200 });
    await page.goto('/components/dialog');
    await selectTheme(page, theme);

    for (const viewport of [
      { width: 768, height: 1024, name: 'tablet-768' },
      { width: 320, height: 640, name: 'mobile-320' },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/components/dialog');
      await selectTheme(page, theme);

      const main = page.getByRole('main');
      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(
        dimensions.scrollWidth,
        viewport.name + ': ' + JSON.stringify(dimensions),
      ).toBeLessThanOrEqual(dimensions.clientWidth);
      await expect(main).toHaveScreenshot('dialog-page-' + theme + '-' + viewport.name + '.png', {
        animations: 'disabled',
      });

      const sizeGroup = page.getByRole('group', { name: 'Dialog size examples', exact: true });
      await sizeGroup.getByRole('button', { name: 'Open default', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: 'Profile details', exact: true });
      const bounds = await dialog.boundingBox();
      expect(bounds, viewport.name + ': dialog should have bounds').not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
      await expect(dialog).toHaveScreenshot('dialog-open-' + theme + '-' + viewport.name + '.png', {
        animations: 'disabled',
      });

      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);

      await sizeGroup.getByRole('button', { name: 'Open auto', exact: true }).click();
      const auto = page.getByRole('dialog', { name: 'Auto size', exact: true });
      await waitForDialogEntrance(auto);
      const autoBounds = await auto.boundingBox();
      expect(autoBounds, viewport.name + ': auto dialog should have bounds').not.toBeNull();
      expect(autoBounds!.x).toBeGreaterThanOrEqual(0);
      expect(autoBounds!.x + autoBounds!.width).toBeLessThanOrEqual(viewport.width);
      if (viewport.width === 320) expect(autoBounds!.width).toBe(viewport.width);
      await page.keyboard.press('Escape');
      await expect(auto).toHaveCount(0);

      await sizeGroup.getByRole('button', { name: 'Open fullscreen', exact: true }).click();
      const fullscreen = page.getByRole('dialog', { name: 'Fullscreen dialog', exact: true });
      await waitForDialogEntrance(fullscreen);
      const fullscreenBounds = await fullscreen.boundingBox();
      expect(
        fullscreenBounds,
        viewport.name + ': fullscreen dialog should have bounds',
      ).not.toBeNull();
      expect(fullscreenBounds!.x).toBeGreaterThanOrEqual(0);
      expect(fullscreenBounds!.x + fullscreenBounds!.width).toBeLessThanOrEqual(viewport.width);
      expect(fullscreenBounds!.y).toBe(0);
      expect(fullscreenBounds!.height).toBe(viewport.height);
      await expect(fullscreen).toHaveScreenshot(
        'dialog-fullscreen-' + theme + '-' + viewport.name + '.png',
        { animations: 'disabled' },
      );
      await page.keyboard.press('Escape');
      await expect(fullscreen).toHaveCount(0);
    }
  }
});
