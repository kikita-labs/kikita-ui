import type { Page } from '@playwright/test';

import { expect, test } from '../../../tests/e2e/support/fixtures';

const desktopViewport = { width: 1440, height: 1000 };
const tabletViewport = { width: 768, height: 1024 };
const mobileViewport = { width: 320, height: 844 };

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/components/scrollbar');
});

test('captures local and application-wide native scrolling examples @visual', async ({ page }) => {
  await expect(
    page.getByRole('heading', { level: 1, name: 'Scrollbar', exact: true }),
  ).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-kui-scrollbars', 'styled');

  const localExample = page.getByRole('group', {
    name: 'Local scrollbar utility example',
    exact: true,
  });
  const localRegion = page.getByRole('region', {
    name: 'Focus to scroll the vertical content',
    exact: true,
  });
  await expect(localRegion).toHaveAttribute('tabindex', '0');
  await expect(localRegion).toHaveClass(/(?:^|\s)kui-scroll(?:\s|$)/);
  await expect(localRegion.locator('p')).toHaveCount(14);
  await expect
    .poll(() => localRegion.evaluate((element) => getComputedStyle(element).scrollbarWidth))
    .toBe('thin');
  await expect(localExample).toHaveScreenshot('scrollbar-local-utility-desktop.png');

  const globalExample = page.getByRole('group', {
    name: 'Application-wide scrollbar styling example',
    exact: true,
  });
  const tableRegion = page.getByRole('region', {
    name: 'Focus to scroll the wide data table',
    exact: true,
  });
  await expect(tableRegion).toHaveAttribute('tabindex', '0');
  await expect(tableRegion).not.toHaveClass(/(?:^|\s)kui-scroll(?:\s|$)/);
  await expect(tableRegion.getByRole('columnheader')).toHaveCount(8);
  const globalScrollbars = await tableRegion.evaluate((element) => ({
    clientHeight: element.clientHeight,
    clientWidth: element.clientWidth,
    scrollHeight: element.scrollHeight,
    scrollWidth: element.scrollWidth,
    scrollbarWidth: getComputedStyle(element).scrollbarWidth,
  }));
  expect(globalScrollbars.scrollHeight).toBeGreaterThan(globalScrollbars.clientHeight);
  expect(globalScrollbars.scrollWidth).toBeGreaterThan(globalScrollbars.clientWidth);
  expect(globalScrollbars.scrollbarWidth).toBe('thin');
  await expect(globalExample).toHaveScreenshot('scrollbar-application-wide-desktop.png');

  await page.setViewportSize(tabletViewport);
  await collapseMobileSidebar(page);
  await expectNoHorizontalOverflow(page);
  await expect(localExample).toHaveScreenshot('scrollbar-local-utility-768.png');
  await expect(globalExample).toHaveScreenshot('scrollbar-application-wide-768.png');

  await page.setViewportSize(mobileViewport);
  await collapseMobileSidebar(page);
  await expectNoHorizontalOverflow(page);
  await expect(localExample).toHaveScreenshot('scrollbar-local-utility-320.png');
  await expect(globalExample).toHaveScreenshot('scrollbar-application-wide-320.png');
});

test('scrolls focused native regions with the keyboard', async ({ page }) => {
  const verticalRegion = page.getByRole('region', {
    name: 'Focus to scroll the vertical content',
    exact: true,
  });
  const tableRegion = page.getByRole('region', {
    name: 'Focus to scroll the wide data table',
    exact: true,
  });

  await verticalRegion.focus();
  await expect(verticalRegion).toBeFocused();
  await page.keyboard.press('PageDown');
  await expect
    .poll(() => verticalRegion.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);

  await tableRegion.focus();
  await expect(tableRegion).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => tableRegion.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  await page.keyboard.press('PageDown');
  await expect.poll(() => tableRegion.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);

  await expectNoHorizontalOverflow(page);
});

test('uses distinct theme tokens and restores system scrollbar colors in forced colors @visual', async ({
  page,
}) => {
  const lightRegion = page.getByRole('region', {
    name: 'Focus to scroll the light themed content',
    exact: true,
  });
  const darkRegion = page.getByRole('region', {
    name: 'Focus to scroll the dark themed content',
    exact: true,
  });

  const [lightThumb, darkThumb] = await Promise.all([
    lightRegion.evaluate((element) =>
      getComputedStyle(element).getPropertyValue('--kui-color-scrollbar-thumb').trim(),
    ),
    darkRegion.evaluate((element) =>
      getComputedStyle(element).getPropertyValue('--kui-color-scrollbar-thumb').trim(),
    ),
  ]);
  expect(lightThumb).not.toBe(darkThumb);
  const themeExamples = page.getByRole('group', {
    name: 'Scrollbar theme examples',
    exact: true,
  });
  await expect(themeExamples).toHaveScreenshot('scrollbar-theme-contexts-desktop.png');

  await page.setViewportSize(tabletViewport);
  await collapseMobileSidebar(page);
  await expectNoHorizontalOverflow(page);
  await expect(themeExamples).toHaveScreenshot('scrollbar-theme-contexts-768.png');

  await page.setViewportSize({ width: 320, height: 2048 });
  await collapseMobileSidebar(page);
  await expectNoHorizontalOverflow(page);
  await expect(themeExamples).toHaveScreenshot('scrollbar-theme-contexts-320.png');

  await page.emulateMedia({ forcedColors: 'active' });
  await expect
    .poll(() => lightRegion.evaluate((element) => getComputedStyle(element).scrollbarColor))
    .toBe('auto');
});

test('server-renders without the browser-only scrollbar marker and applies it after hydration', async ({
  page,
}) => {
  const response = await page.request.get('/components/scrollbar');
  expect(response.status()).toBe(200);

  const serverMarkup = await response.text();
  const serverHtmlElement = serverMarkup.match(/<html\b[^>]*>/i)?.[0];
  if (!serverHtmlElement) throw new Error('SSR response is missing its html element.');
  expect(serverHtmlElement).not.toMatch(/\bdata-kui-scrollbars(?:=|\s|>)/i);

  const runtimeErrors: string[] = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-kui-scrollbars', 'styled');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Scrollbar', exact: true }),
  ).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});

test('loads the Russian scope and updates accessible region names', async ({ page }) => {
  const russianScope = await page.request.get('/i18n/scrollbar/ru.json');
  expect(russianScope.ok()).toBeTruthy();
  const translations = (await russianScope.json()) as {
    title: string;
    accessibility: { vertical: string };
  };

  await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();

  await expect(page.getByRole('heading', { level: 1, name: translations.title })).toBeVisible();
  await expect(
    page.getByRole('region', { name: translations.accessibility.vertical }),
  ).toBeVisible();
});

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
