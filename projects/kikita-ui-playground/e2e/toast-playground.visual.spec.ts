import type { Locator, Page } from '@playwright/test';

import { expect, test } from './support/fixtures';
import { kuiMessage, loadKuiCatalogue } from './support/kui-catalogue';

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

/**
 * Verbatim `lucide-static@1` (v1.48.0) icons requested by the playground shell on the Toast
 * route, served locally so page-level captures never race the jsDelivr CDN.
 */
const LUCIDE_TEST_ICONS: Record<string, string> = {
  moon: '<svg class="lucide lucide-moon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" /></svg>',
  palette:
    '<svg class="lucide lucide-palette" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" /><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /></svg>',
  'rotate-ccw':
    '<svg class="lucide lucide-rotate-ccw" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>',
  search:
    '<svg class="lucide lucide-search" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></svg>',
  sun: '<svg class="lucide lucide-sun" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>',
};

async function readToastLocale(page: Page, language: 'en' | 'ru'): Promise<ToastLocale> {
  const response = await page.request.get(
    new URL(`/i18n/toast/${language}.json`, page.url()).toString(),
  );
  expect(response.ok()).toBeTruthy();
  return (await response.json()) as ToastLocale;
}

function getToast(page: Page, role: 'status' | 'alert', title: string, region = 'Notifications') {
  return page
    .getByRole('region', { name: region, exact: true })
    .getByRole(role)
    .filter({ hasText: title });
}

/**
 * Pins the shell workspace scroll before a capture. A click on a not-yet-stable element retries
 * with forced scroll alignments, so the offset a click leaves behind is not deterministic. Page
 * captures show that offset directly, and a toast's fractional box includes one row behind it.
 */
async function pinWorkspaceScroll(page: Page, target: 'top' | 'bottom' | Locator): Promise<void> {
  if (typeof target !== 'string') {
    await target.evaluate((element) => element.scrollIntoView({ block: 'center' }));
    return;
  }

  await page.locator('.playground-shell__workspace').evaluate((element, edge) => {
    element.scrollTop = edge === 'top' ? 0 : element.scrollHeight;
  }, target);
}

async function expectMobileToastScreenshot(
  page: Page,
  toast: ReturnType<typeof getToast>,
  screenshotName: string,
): Promise<void> {
  expect(page.viewportSize()?.width).toBe(mobileViewport.width);
  await pinWorkspaceScroll(page, 'top');
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    )
    .toBe(true);

  const box = await toast.boundingBox();
  if (box === null)
    throw new Error(`Toast is not visible for mobile screenshot: ${screenshotName}`);
  expect(box.x).toBeGreaterThanOrEqual(16);
  expect(box.x + box.width).toBeLessThanOrEqual(mobileViewport.width - 16);
  await expect(toast).toHaveScreenshot(screenshotName);
}

/** Waits until every decorative `kui-icon` on the page has resolved its inline SVG. */
async function expectIconsRendered(page: Page): Promise<void> {
  await expect(page.locator('kui-icon:not(:has(svg))')).toHaveCount(0);
}

async function expectPageScreenshot(
  page: Page,
  screenshotName: string,
  scroll: 'top' | 'bottom' | Locator,
): Promise<void> {
  await pinWorkspaceScroll(page, scroll);
  await expectIconsRendered(page);
  await expect(page).toHaveScreenshot(screenshotName);
}

async function expectMobilePageScreenshot(
  page: Page,
  screenshotName: string,
  scroll: 'top' | 'bottom' | Locator,
): Promise<void> {
  expect(page.viewportSize()?.width).toBe(mobileViewport.width);
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
  await expectPageScreenshot(page, screenshotName, scroll);
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('https://cdn.jsdelivr.net/npm/lucide-static@*/icons/*.svg', async (route) => {
    const iconName = new URL(route.request().url()).pathname.split('/').at(-1)?.replace('.svg', '');
    const svg = iconName ? LUCIDE_TEST_ICONS[iconName] : undefined;

    // Icons outside the Toast route (for example after navigating away) are never captured.
    if (!svg) return route.continue();

    return route.fulfill({ contentType: 'image/svg+xml', body: svg });
  });
  await page.setViewportSize(desktopViewport);
  await page.goto('/components/toast');
  await page.clock.install({ time: fixedTime });
});

test('renders a minimal default toast with live semantics and a narrow layout @visual', async ({
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
  const trigger = example.getByRole('button', { name: copy.actions['showDefault'], exact: true });
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

  const toast = getToast(page, 'status', copy.labels['defaultTitle']);
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

test('renders every supported appearance with its current live role @visual', async ({ page }) => {
  const copy = await readToastLocale(page, 'en');
  const cases = [
    {
      value: 'neutral',
      label: copy.appearances['neutral'],
      title: copy.labels['defaultTitle'],
      role: 'status',
      live: 'polite',
      action: copy.actions['showNeutral'],
    },
    {
      value: 'success',
      label: copy.appearances['success'],
      title: copy.labels['successTitle'],
      role: 'status',
      live: 'polite',
      action: `${copy.actions['show']} ${copy.appearances['success']}`,
    },
    {
      value: 'warning',
      label: copy.appearances['warning'],
      title: copy.labels['warningTitle'],
      role: 'status',
      live: 'polite',
      action: `${copy.actions['show']} ${copy.appearances['warning']}`,
    },
    {
      value: 'danger',
      label: copy.appearances['danger'],
      title: copy.labels['dangerTitle'],
      role: 'alert',
      live: 'assertive',
      action: `${copy.actions['show']} ${copy.appearances['danger']}`,
    },
    {
      value: 'info',
      label: copy.appearances['info'],
      title: copy.labels['infoTitle'],
      role: 'status',
      live: 'polite',
      action: `${copy.actions['show']} ${copy.appearances['info']}`,
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
    await page.setViewportSize(mobileViewport);
    await expectMobileToastScreenshot(page, toast, `toast-appearance-${example.value}-320.png`);
    await page.setViewportSize(desktopViewport);
  }
});

test('uses a native keyboard action and keeps the action toast open @visual', async ({ page }) => {
  const copy = await readToastLocale(page, 'en');
  const actionCase = page.getByRole('group', { name: copy.accessibility.actionCase, exact: true });
  await actionCase.getByRole('button', { name: copy.actions['showAction'], exact: true }).click();

  const toast = getToast(page, 'status', copy.labels['actionTitle']);
  const action = toast.getByRole('button', { name: copy.actions['undo'], exact: true });
  await action.focus();
  await action.press('Enter');

  await expect(actionCase.getByRole('status')).toHaveText(copy.labels['actionReceived']);
  await expect(toast).toBeVisible();
  await expect(toast).toHaveScreenshot('toast-action-activated.png');
  await page.setViewportSize(mobileViewport);
  await expectMobileToastScreenshot(page, toast, 'toast-action-activated-320.png');
});

test('supports a wrapping message and hides an appearance icon on request @visual', async ({
  page,
}) => {
  const copy = await readToastLocale(page, 'en');
  const messageCase = page.getByRole('group', {
    name: copy.accessibility.messageCase,
    exact: true,
  });
  await messageCase.getByRole('button', { name: copy.actions['showMessage'], exact: true }).click();

  const messageToast = getToast(page, 'status', copy.labels['messageTitle']);
  await expect(messageToast).toContainText(copy.labels['longMessage']);
  await expect(messageToast).toHaveScreenshot('toast-message.png');
  await page.setViewportSize(mobileViewport);
  await expectMobileToastScreenshot(page, messageToast, 'toast-message-320.png');

  await page.setViewportSize(desktopViewport);
  await page.reload();
  const noIconCase = page.getByRole('group', { name: copy.accessibility.noIconCase, exact: true });
  await noIconCase.getByRole('button', { name: copy.actions['showNoIcon'], exact: true }).click();
  const noIconToast = getToast(page, 'status', copy.labels['noIconTitle']);
  await expect(noIconToast).toBeVisible();
  await expect(noIconToast).toHaveAttribute('data-kui-appearance', 'success');
  await expect(noIconToast).toHaveScreenshot('toast-icon-hidden.png');
  await page.setViewportSize(mobileViewport);
  await expectMobileToastScreenshot(page, noIconToast, 'toast-icon-hidden-320.png');
});

test('closes a non-closable toast through its returned reference @visual', async ({ page }) => {
  const copy = await readToastLocale(page, 'en');
  const noCloseCase = page.getByRole('group', {
    name: copy.accessibility.noCloseCase,
    exact: true,
  });
  await noCloseCase.getByRole('button', { name: copy.actions['showNoClose'], exact: true }).click();

  const toast = getToast(page, 'status', copy.labels['noCloseTitle']);
  await expect(toast).toBeVisible();
  await expect(toast.getByRole('button')).toHaveCount(0);
  await expect(toast).toHaveScreenshot('toast-no-close-button.png');
  await page.setViewportSize(mobileViewport);
  await expectMobileToastScreenshot(page, toast, 'toast-no-close-button-320.png');

  await page.setViewportSize(desktopViewport);
  await noCloseCase.getByRole('button', { name: copy.actions['closeByRef'], exact: true }).click();
  await page.clock.fastForward(250);
  await expect(toast).toHaveCount(0);
  await expect(noCloseCase.getByRole('status')).toHaveText(copy.labels['closedByRef']);
});

test('pauses and resumes the actual timed progress toast on hover @visual', async ({ page }) => {
  const copy = await readToastLocale(page, 'en');
  const progressCase = page.getByRole('group', {
    name: copy.accessibility.progressCase,
    exact: true,
  });
  await progressCase
    .getByRole('button', { name: copy.actions['showProgress'], exact: true })
    .click();

  const toast = getToast(page, 'status', copy.labels['progressTitle']);
  const progress = toast.locator('.kui-toast-progress');
  await expect(progress).toBeVisible();
  await toast.hover();
  await expect
    .poll(() => progress.evaluate((element) => getComputedStyle(element).animationPlayState))
    .toBe('paused');
  await expect(toast).toHaveScreenshot('toast-progress-hover-paused.png');
  await page.setViewportSize(mobileViewport);
  await toast.hover();
  await expect
    .poll(() => progress.evaluate((element) => getComputedStyle(element).animationPlayState))
    .toBe('paused');
  await expectMobileToastScreenshot(page, toast, 'toast-progress-hover-paused-320.png');

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

test('updates and dismisses a signal-controlled toast and enforces the three-toast cap @visual', async ({
  page,
}) => {
  const copy = await readToastLocale(page, 'en');
  const lifecycle = page.getByRole('group', { name: copy.accessibility.lifecycle, exact: true });
  const signalCase = lifecycle.getByRole('group', {
    name: copy.accessibility.signalCase,
    exact: true,
  });

  await signalCase.getByRole('button', { name: copy.actions['openTracked'], exact: true }).click();
  const syncing = getToast(page, 'status', copy.labels['syncTitle']);
  await expect(syncing).toBeVisible();
  await expect(syncing.locator('.kui-toast-progress')).toHaveCount(0);
  await page.setViewportSize(mobileViewport);
  await expectMobileToastScreenshot(page, syncing, 'toast-persistent-signal-320.png');
  await page.setViewportSize(desktopViewport);
  await signalCase
    .getByRole('button', { name: copy.actions['releasePersistence'], exact: true })
    .click();
  await expect(syncing.locator('.kui-toast-progress')).toBeVisible();

  await signalCase
    .getByRole('button', { name: copy.actions['updateTracked'], exact: true })
    .click();
  const updated = getToast(page, 'status', copy.labels['updatedTitle']);
  await expect(updated).toHaveAttribute('data-kui-appearance', 'success');
  await expect(updated).toHaveAttribute('aria-live', 'polite');
  await expect(updated).toContainText(copy.labels['updatedMessage']);
  await expectPageScreenshot(page, 'toast-reference-update.png', 'bottom');
  await page.setViewportSize(mobileViewport);
  await expectMobileToastScreenshot(page, updated, 'toast-reference-update-320.png');
  await page.setViewportSize(desktopViewport);

  await signalCase.getByRole('button', { name: copy.actions['closeTracked'], exact: true }).click();
  await page.clock.fastForward(250);
  await expect(updated).toHaveCount(0);
  await expect(signalCase.getByRole('status')).toHaveText(copy.labels['closedByRef']);

  await signalCase.getByRole('button', { name: copy.actions['openTracked'], exact: true }).click();
  const byId = getToast(page, 'status', copy.labels['syncTitle']);
  await signalCase.getByRole('button', { name: copy.actions['dismissById'], exact: true }).click();
  await page.clock.fastForward(250);
  await expect(byId).toHaveCount(0);

  const capacity = lifecycle.getByRole('group', {
    name: copy.accessibility.capacityCase,
    exact: true,
  });
  await capacity.getByRole('button', { name: copy.actions['openFour'], exact: true }).click();
  await page.clock.fastForward(250);

  const region = page.getByRole('region', { name: 'Notifications', exact: true });
  await expect(region.getByRole('status')).toHaveCount(3);
  await expect(getToast(page, 'status', copy.labels['stackFirst'])).toHaveCount(0);
  for (const title of [
    copy.labels['stackSecond'],
    copy.labels['stackThird'],
    copy.labels['stackFourth'],
  ]) {
    await expect(getToast(page, 'status', title)).toBeVisible();
  }

  const bottomToTopYs = await Promise.all(
    [copy.labels['stackSecond'], copy.labels['stackThird'], copy.labels['stackFourth']].map(
      async (title) => {
        const box = await getToast(page, 'status', title).boundingBox();
        if (box === null) throw new Error(`Expected visible stack item: ${title}`);
        return box.y;
      },
    ),
  );
  expect(bottomToTopYs[0]).toBeGreaterThan(bottomToTopYs[1]);
  expect(bottomToTopYs[1]).toBeGreaterThan(bottomToTopYs[2]);

  await expectPageScreenshot(page, 'toast-capacity-three.png', 'bottom');
  await page.setViewportSize(mobileViewport);
  await capacity.scrollIntoViewIfNeeded();
  await expectMobilePageScreenshot(page, 'toast-capacity-three-320.png', 'bottom');
  await page.setViewportSize(desktopViewport);

  await capacity.getByRole('button', { name: copy.actions['dismissAll'], exact: true }).click();
  await page.clock.fastForward(250);
  await expect(region.getByRole('status')).toHaveCount(0);
});

test('moves the live Toast region to each supported position @visual', async ({ page }) => {
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
    const toast = getToast(page, 'status', copy.labels['positionTitle']);
    await expect(region).toHaveAttribute('data-position', value);
    await expect(toast).toBeVisible();
    await expect(toast).toHaveCSS('opacity', '1');
    await page.mouse.move(265, 500);
    await expectPageScreenshot(page, `toast-position-${value}.png`, 'top');
  }

  const controls = page.getByRole('group', {
    name: copy.accessibility.positions,
    exact: true,
  });
  const region = page.getByRole('region', { name: 'Notifications', exact: true });
  const positionToast = getToast(page, 'status', copy.labels['positionTitle']);
  await positionToast.getByRole('button', { name: 'Close', exact: true }).click();
  await page.clock.fastForward(250);
  await expect(positionToast).toHaveCount(0);

  await controls.getByRole('button', { name: copy.positions.topStart, exact: true }).click();
  await expect(region).toHaveAttribute('data-position', 'top-start');
  await expect(positionToast).toBeVisible();
});

test('preserves vertical Toast placement on mobile while collapsing horizontal alignment @visual', async ({
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
  const toast = getToast(page, 'status', copy.labels['positionTitle']);
  const topBox = await toast.boundingBox();
  expect(topBox).not.toBeNull();
  expect(topBox?.y ?? mobileViewport.height).toBeLessThan(mobileViewport.height / 2);
  expect(topBox?.x ?? 0).toBeGreaterThanOrEqual(16);
  expect((topBox?.x ?? 0) + (topBox?.width ?? 0)).toBeLessThanOrEqual(mobileViewport.width - 16);
  await expectMobilePageScreenshot(
    page,
    'toast-position-top-320.png',
    positionButton(copy.positions.topStart),
  );

  await positionButton(copy.positions.bottomEnd).click();
  await expect(region).toHaveAttribute('data-position', 'bottom-end');
  const bottomBox = await toast.boundingBox();
  expect(bottomBox).not.toBeNull();
  expect(bottomBox?.y ?? 0).toBeGreaterThan(mobileViewport.height / 2);
  expect(bottomBox?.x ?? 0).toBeGreaterThanOrEqual(16);
  expect((bottomBox?.x ?? 0) + (bottomBox?.width ?? 0)).toBeLessThanOrEqual(
    mobileViewport.width - 16,
  );
  await expectMobilePageScreenshot(
    page,
    'toast-position-bottom-320.png',
    positionButton(copy.positions.topStart),
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
  await expect(getToast(page, 'status', copy.labels['positionTitle'])).toBeVisible();

  await page.getByRole('link', { name: 'Button', exact: true }).click();
  await expect(page).toHaveURL(/\/components\/button$/);
  await page.clock.fastForward(250);

  await expect(region).toHaveAttribute('data-position', 'bottom-center');
  await expect(region.getByRole('status')).toHaveCount(0);
  await expect(region.getByRole('alert')).toHaveCount(0);
});

test('loads the Russian route scope after switching the shell language', async ({ page }) => {
  const kui = await loadKuiCatalogue(page, 'ru');
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
  await example.getByRole('button', { name: russian.actions['showDefault'], exact: true }).click();
  await expect(
    getToast(page, 'status', russian.labels['defaultTitle'], kuiMessage(kui, 'toast', 'region')),
  ).toBeVisible();
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
    .getByRole('button', { name: copy.actions['showDefault'], exact: true })
    .click();
  await expect(getToast(page, 'status', copy.labels['defaultTitle'])).toBeVisible();
  expect(browserErrors.get(page)).toEqual([]);
});
