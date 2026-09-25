import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

interface ToastLocale {
  title: string;
  accessibility: {
    default: string;
    appearances: string;
    contentAndOptions: string;
    messageCase: string;
    actionCase: string;
    noIconCase: string;
    noCloseCase: string;
    progressCase: string;
    positions: string;
    lifecycle: string;
    signalCase: string;
    capacityCase: string;
  };
  actions: Record<string, string>;
  appearances: Record<string, string>;
  positions: {
    topStart: string;
    topCenter: string;
    topEnd: string;
    bottomStart: string;
    bottomCenter: string;
    bottomEnd: string;
  };
  labels: Record<string, string>;
}

const desktopViewport = { width: 1440, height: 1000 };
const mobileViewport = { width: 320, height: 844 };
const fixedTime = new Date('2026-09-24T00:00:00.000Z');
const browserErrors = new WeakMap<Page, string[]>();

async function readToastLocale(page: Page, language: 'en' | 'ru'): Promise<ToastLocale> {
  const response = await page.request.get(
    new URL(`/i18n/toast/${language}.json`, page.url()).toString(),
  );
  expect(response.ok()).toBeTruthy();
  return (await response.json()) as ToastLocale;
}

function getToast(page: Page, role: 'status' | 'alert', title: string) {
  return page
    .getByRole('region', { name: 'Notifications', exact: true })
    .getByRole(role)
    .filter({ hasText: title });
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize(desktopViewport);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components/toast');
  await page.clock.install({ time: fixedTime });
});

test('renders a minimal default toast with live semantics and a narrow layout', async ({
  page,
}) => {
  const copy = await readToastLocale(page, 'en');
  await expect(
    page.getByRole('heading', { level: 1, name: copy.title, exact: true }),
  ).toBeVisible();

  const themeToggle = page.getByRole('banner').getByRole('button', {
    name: 'Switch to light theme',
    exact: true,
  });
  await themeToggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-kui-theme', 'light');
  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Switch to dark theme', exact: true })
    .click();
  await expect(page.locator('html')).toHaveAttribute('data-kui-theme', 'dark');

  const example = page.getByRole('group', { name: copy.accessibility.default, exact: true });
  const trigger = example.getByRole('button', { name: copy.actions.showDefault, exact: true });
  await trigger.click();
  expect(browserErrors.get(page)).toEqual([]);
  await expect
    .poll(() =>
      page.evaluate(() => {
        const host = document.querySelector('kui-toast-region');
        return {
          host: host !== null,
          region: host !== null && host.querySelector('.kui-toast-region') !== null,
          toastCount: host?.querySelectorAll('.kui-toast').length ?? 0,
        };
      }),
    )
    .toEqual({ host: true, region: true, toastCount: 1 });

  const toast = getToast(page, 'status', copy.labels.defaultTitle);
  await expect(toast).toBeVisible();
  await expect(page.getByRole('region', { name: 'Notifications', exact: true })).toHaveAttribute(
    'data-position',
    'bottom-center',
  );
  await expect(toast).toHaveAttribute('data-kui-appearance', 'neutral');
  await expect(toast).toHaveAttribute('aria-live', 'polite');
  await expect(toast).toHaveAttribute('aria-atomic', 'true');
  await expect(toast.locator('.kui-toast-progress')).toHaveCount(0);
  await expect(toast.getByRole('button', { name: 'Close', exact: true })).toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(toast).toHaveScreenshot('toast-default-dark-desktop.png');

  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Switch to light theme', exact: true })
    .click();
  await expect(toast).toHaveScreenshot('toast-default-light-desktop.png');

  await page.setViewportSize(mobileViewport);
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
  const box = await toast.boundingBox();
  expect(box).not.toBeNull();
  expect(box?.x ?? 0).toBeGreaterThanOrEqual(16);
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(mobileViewport.width - 16);
  await expect(toast).toHaveScreenshot('toast-default-320.png');

  await page.clock.fastForward(4_999);
  await expect(toast).toBeVisible();
  await page.clock.fastForward(1);
  await page.clock.fastForward(250);
  await expect(toast).toHaveCount(0);
});

test('renders every supported appearance with its current live role', async ({ page }) => {
  const copy = await readToastLocale(page, 'en');
  const cases = [
    {
      value: 'neutral',
      label: copy.appearances.neutral,
      title: copy.labels.defaultTitle,
      role: 'status',
      live: 'polite',
      action: copy.actions.showNeutral,
    },
    {
      value: 'success',
      label: copy.appearances.success,
      title: copy.labels.successTitle,
      role: 'status',
      live: 'polite',
      action: `${copy.actions.show} ${copy.appearances.success}`,
    },
    {
      value: 'warning',
      label: copy.appearances.warning,
      title: copy.labels.warningTitle,
      role: 'status',
      live: 'polite',
      action: `${copy.actions.show} ${copy.appearances.warning}`,
    },
    {
      value: 'danger',
      label: copy.appearances.danger,
      title: copy.labels.dangerTitle,
      role: 'alert',
      live: 'assertive',
      action: `${copy.actions.show} ${copy.appearances.danger}`,
    },
    {
      value: 'info',
      label: copy.appearances.info,
      title: copy.labels.infoTitle,
      role: 'status',
      live: 'polite',
      action: `${copy.actions.show} ${copy.appearances.info}`,
    },
  ] as const;

  for (const example of cases) {
    await page.reload();
    const catalogue = page.getByRole('group', {
      name: copy.accessibility.appearances,
      exact: true,
    });
    await catalogue.getByRole('button', { name: example.action, exact: true }).click();

    const toast = getToast(page, example.role, example.title);
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute('data-kui-appearance', example.value);
    await expect(toast).toHaveAttribute('aria-live', example.live);
    await expect(toast).toHaveScreenshot(`toast-appearance-${example.value}.png`);
  }
});

test('uses a native keyboard action and keeps the action toast open', async ({ page }) => {
  const copy = await readToastLocale(page, 'en');
  const actionCase = page.getByRole('group', { name: copy.accessibility.actionCase, exact: true });
  await actionCase.getByRole('button', { name: copy.actions.showAction, exact: true }).click();

  const toast = getToast(page, 'status', copy.labels.actionTitle);
  const action = toast.getByRole('button', { name: copy.actions.undo, exact: true });
  await action.focus();
  await action.press('Enter');

  await expect(actionCase.getByRole('status')).toHaveText(copy.labels.actionReceived);
  await expect(toast).toBeVisible();
  await expect(page).toHaveScreenshot('toast-action-activated.png');
});

test('supports a wrapping message and hides an appearance icon on request', async ({ page }) => {
  const copy = await readToastLocale(page, 'en');
  const messageCase = page.getByRole('group', {
    name: copy.accessibility.messageCase,
    exact: true,
  });
  await messageCase.getByRole('button', { name: copy.actions.showMessage, exact: true }).click();

  const messageToast = getToast(page, 'status', copy.labels.messageTitle);
  await expect(messageToast).toContainText(copy.labels.longMessage);
  await expect(messageToast).toHaveScreenshot('toast-message.png');

  await page.reload();
  const noIconCase = page.getByRole('group', { name: copy.accessibility.noIconCase, exact: true });
  await noIconCase.getByRole('button', { name: copy.actions.showNoIcon, exact: true }).click();
  const noIconToast = getToast(page, 'status', copy.labels.noIconTitle);
  await expect(noIconToast).toBeVisible();
  await expect(noIconToast).toHaveAttribute('data-kui-appearance', 'success');
  await expect(noIconToast).toHaveScreenshot('toast-icon-hidden.png');
});

test('closes a non-closable toast through its returned reference', async ({ page }) => {
  const copy = await readToastLocale(page, 'en');
  const noCloseCase = page.getByRole('group', {
    name: copy.accessibility.noCloseCase,
    exact: true,
  });
  await noCloseCase.getByRole('button', { name: copy.actions.showNoClose, exact: true }).click();

  const toast = getToast(page, 'status', copy.labels.noCloseTitle);
  await expect(toast).toBeVisible();
  await expect(toast.getByRole('button')).toHaveCount(0);
  await expect(toast).toHaveScreenshot('toast-no-close-button.png');

  await noCloseCase.getByRole('button', { name: copy.actions.closeByRef, exact: true }).click();
  await page.clock.fastForward(250);
  await expect(toast).toHaveCount(0);
  await expect(noCloseCase.getByRole('status')).toHaveText(copy.labels.closedByRef);
});

test('pauses and resumes the actual timed progress toast on hover', async ({ page }) => {
  const copy = await readToastLocale(page, 'en');
  const progressCase = page.getByRole('group', {
    name: copy.accessibility.progressCase,
    exact: true,
  });
  await progressCase.getByRole('button', { name: copy.actions.showProgress, exact: true }).click();

  const toast = getToast(page, 'status', copy.labels.progressTitle);
  const progress = toast.locator('.kui-toast-progress');
  await expect(progress).toBeVisible();
  await toast.hover();
  await expect
    .poll(() => progress.evaluate((element) => getComputedStyle(element).animationPlayState))
    .toBe('paused');
  await expect(toast).toHaveScreenshot('toast-progress-hover-paused.png');

  await page.clock.fastForward(60_000);
  await expect(toast).toBeVisible();

  await page.mouse.move(0, 0);
  await expect
    .poll(() => progress.evaluate((element) => getComputedStyle(element).animationPlayState))
    .toBe('running');
  await page.clock.fastForward(59_999);
  await expect(toast).toBeVisible();
  await page.clock.fastForward(1);
  await page.clock.fastForward(250);
  await expect(toast).toHaveCount(0);
});

test('updates and dismisses a signal-controlled toast and enforces the three-toast cap', async ({
  page,
}) => {
  const copy = await readToastLocale(page, 'en');
  const lifecycle = page.getByRole('group', { name: copy.accessibility.lifecycle, exact: true });
  const signalCase = lifecycle.getByRole('group', {
    name: copy.accessibility.signalCase,
    exact: true,
  });

  await signalCase.getByRole('button', { name: copy.actions.openTracked, exact: true }).click();
  const syncing = getToast(page, 'status', copy.labels.syncTitle);
  await expect(syncing).toBeVisible();
  await signalCase
    .getByRole('button', { name: copy.actions.releasePersistence, exact: true })
    .click();
  await expect(syncing.locator('.kui-toast-progress')).toBeVisible();

  await signalCase.getByRole('button', { name: copy.actions.updateTracked, exact: true }).click();
  const updated = getToast(page, 'status', copy.labels.updatedTitle);
  await expect(updated).toHaveAttribute('data-kui-appearance', 'success');
  await expect(updated).toHaveAttribute('aria-live', 'polite');
  await expect(updated).toContainText(copy.labels.updatedMessage);
  await expect(page).toHaveScreenshot('toast-reference-update.png');

  await signalCase.getByRole('button', { name: copy.actions.closeTracked, exact: true }).click();
  await page.clock.fastForward(250);
  await expect(updated).toHaveCount(0);
  await expect(signalCase.getByRole('status')).toHaveText(copy.labels.closedByRef);

  await signalCase.getByRole('button', { name: copy.actions.openTracked, exact: true }).click();
  const byId = getToast(page, 'status', copy.labels.syncTitle);
  await signalCase.getByRole('button', { name: copy.actions.dismissById, exact: true }).click();
  await page.clock.fastForward(250);
  await expect(byId).toHaveCount(0);

  const capacity = lifecycle.getByRole('group', {
    name: copy.accessibility.capacityCase,
    exact: true,
  });
  await capacity.getByRole('button', { name: copy.actions.openFour, exact: true }).click();
  await page.clock.fastForward(250);

  const region = page.getByRole('region', { name: 'Notifications', exact: true });
  await expect(region.getByRole('status')).toHaveCount(3);
  await expect(getToast(page, 'status', copy.labels.stackFirst)).toHaveCount(0);
  for (const title of [copy.labels.stackSecond, copy.labels.stackThird, copy.labels.stackFourth]) {
    await expect(getToast(page, 'status', title)).toBeVisible();
  }
  await expect(page).toHaveScreenshot('toast-capacity-three.png');

  await capacity.getByRole('button', { name: copy.actions.dismissAll, exact: true }).click();
  await page.clock.fastForward(250);
  await expect(region.getByRole('status')).toHaveCount(0);
});

test('moves the live Toast region to each supported position', async ({ page }) => {
  const copy = await readToastLocale(page, 'en');
  const positions = [
    ['topStart', 'top-start'],
    ['topCenter', 'top-center'],
    ['topEnd', 'top-end'],
    ['bottomStart', 'bottom-start'],
    ['bottomCenter', 'bottom-center'],
    ['bottomEnd', 'bottom-end'],
  ] as const;

  for (const [key, value] of positions) {
    await page.reload();
    const controls = page.getByRole('group', {
      name: copy.accessibility.positions,
      exact: true,
    });
    await controls.getByRole('button', { name: copy.positions[key], exact: true }).click();

    const region = page.getByRole('region', { name: 'Notifications', exact: true });
    const toast = getToast(page, 'status', copy.labels.positionTitle);
    await expect(region).toHaveAttribute('data-position', value);
    await expect(toast).toBeVisible();
    await expect(toast).toHaveCSS('opacity', '1');
    await page.mouse.move(265, 500);
    await expect(page).toHaveScreenshot(`toast-position-${value}.png`);
  }

  const controls = page.getByRole('group', {
    name: copy.accessibility.positions,
    exact: true,
  });
  const region = page.getByRole('region', { name: 'Notifications', exact: true });
  const positionToast = getToast(page, 'status', copy.labels.positionTitle);
  await positionToast.getByRole('button', { name: 'Close', exact: true }).click();
  await page.clock.fastForward(250);
  await expect(positionToast).toHaveCount(0);

  await controls.getByRole('button', { name: copy.positions.topStart, exact: true }).click();
  await expect(region).toHaveAttribute('data-position', 'top-start');
  await expect(positionToast).toBeVisible();
});

test('preserves vertical Toast placement on mobile while collapsing horizontal alignment', async ({
  page,
}) => {
  const copy = await readToastLocale(page, 'en');
  await page.setViewportSize(mobileViewport);

  const controls = page.getByRole('group', {
    name: copy.accessibility.positions,
    exact: true,
  });
  const region = page.getByRole('region', { name: 'Notifications', exact: true });
  const positionButton = (name: string) => controls.getByRole('button', { name, exact: true });

  await positionButton(copy.positions.topStart).click();
  await expect(region).toHaveAttribute('data-position', 'top-start');
  const toast = getToast(page, 'status', copy.labels.positionTitle);
  const topBox = await toast.boundingBox();
  expect(topBox).not.toBeNull();
  expect(topBox?.y ?? mobileViewport.height).toBeLessThan(mobileViewport.height / 2);
  expect(topBox?.x ?? 0).toBeGreaterThanOrEqual(16);
  expect((topBox?.x ?? 0) + (topBox?.width ?? 0)).toBeLessThanOrEqual(mobileViewport.width - 16);

  await positionButton(copy.positions.bottomEnd).click();
  await expect(region).toHaveAttribute('data-position', 'bottom-end');
  const bottomBox = await toast.boundingBox();
  expect(bottomBox).not.toBeNull();
  expect(bottomBox?.y ?? 0).toBeGreaterThan(mobileViewport.height / 2);
  expect(bottomBox?.x ?? 0).toBeGreaterThanOrEqual(16);
  expect((bottomBox?.x ?? 0) + (bottomBox?.width ?? 0)).toBeLessThanOrEqual(
    mobileViewport.width - 16,
  );
});

test('dismisses page-owned toasts and restores the region position on navigation', async ({
  page,
}) => {
  const copy = await readToastLocale(page, 'en');
  await page.goto('/components/toast');

  const controls = page.getByRole('group', {
    name: copy.accessibility.positions,
    exact: true,
  });
  await controls.getByRole('button', { name: copy.positions.topStart, exact: true }).click();

  const region = page.getByRole('region', { name: 'Notifications', exact: true });
  await expect(region).toHaveAttribute('data-position', 'top-start');
  await expect(getToast(page, 'status', copy.labels.positionTitle)).toBeVisible();

  await page.getByRole('link', { name: 'Button', exact: true }).click();
  await expect(page).toHaveURL(/\/components\/button$/);
  await page.clock.fastForward(250);

  await expect(region).toHaveAttribute('data-position', 'bottom-center');
  await expect(region.getByRole('status')).toHaveCount(0);
  await expect(region.getByRole('alert')).toHaveCount(0);
});

test('loads the Russian route scope after switching the shell language', async ({ page }) => {
  const response = await page.request.get(new URL('/i18n/toast/ru.json', page.url()).toString());
  expect(response.ok()).toBeTruthy();
  const russian = (await response.json()) as ToastLocale;

  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Switch language to Russian', exact: true })
    .click();

  await expect(
    page.getByRole('heading', { level: 1, name: russian.title, exact: true }),
  ).toBeVisible();
  const example = page.getByRole('group', {
    name: russian.accessibility.default,
    exact: true,
  });
  await example.getByRole('button', { name: russian.actions.showDefault, exact: true }).click();
  await expect(getToast(page, 'status', russian.labels.defaultTitle)).toBeVisible();
});

test('server renders and hydrates the Toast route without creating a toast early', async ({
  page,
}) => {
  const response = await page.request.get('/components/toast');
  expect(response.ok()).toBeTruthy();
  const markup = await response.text();

  expect(markup).toContain('id="toast-playground-title"');
  expect(markup).not.toMatch(/<kui-toast-region(?:\s|>)/i);

  await page.goto('/components/toast');

  const copy = await readToastLocale(page, 'en');
  await expect(
    page.getByRole('heading', { level: 1, name: copy.title, exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('region', { name: 'Notifications', exact: true })).toHaveCount(0);
  await page
    .getByRole('group', { name: copy.accessibility.default, exact: true })
    .getByRole('button', { name: copy.actions.showDefault, exact: true })
    .click();
  await expect(getToast(page, 'status', copy.labels.defaultTitle)).toBeVisible();
  expect(browserErrors.get(page)).toEqual([]);
});
