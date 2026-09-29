import type { Locator, Page } from '@playwright/test';

import { expect, test } from '../../../tests/e2e/support/fixtures';

const desktopViewport = { width: 1440, height: 1000 };
const tabletViewport = { width: 768, height: 1024 };
const mobileViewport = { width: 320, height: 844 };

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/components/breadcrumbs');
});

test('server-renders and hydrates the Breadcrumbs page without browser errors', async ({
  page,
}) => {
  const response = await page.request.get('/components/breadcrumbs');

  expect(response.ok()).toBe(true);

  const serverMarkup = await response.text();
  expect(serverMarkup).toContain('Breadcrumbs');
  expect(serverMarkup).toContain('Default breadcrumb example');
  expect(serverMarkup).toContain('aria-label="Breadcrumb"');
  expect(serverMarkup).toContain('role="list"');
  expect(serverMarkup).toContain('data-kui-size="md"');
  expect(serverMarkup).toContain('aria-current="page"');

  const consoleErrors: string[] = [];
  const runtimeErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.goto('/components/breadcrumbs');
  await expect(page.getByRole('heading', { level: 1, name: 'Breadcrumbs' })).toBeVisible();
  await expect(
    page.getByRole('group', { name: 'Default breadcrumb example', exact: true }),
  ).toBeVisible();
  expect(consoleErrors).toEqual([]);
  expect(runtimeErrors).toEqual([]);
});

test('switches the Breadcrumbs scope to Russian at runtime', async ({ page }) => {
  const localeResponse = await page.request.get('/i18n/breadcrumbs/ru.json');
  expect(localeResponse.ok()).toBeTruthy();
  const russian = (await localeResponse.json()) as {
    title: string;
    accessibility: { default: string; navigation: string };
    items: { playground: string; current: string };
  };

  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Switch language to Russian', exact: true })
    .click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(
    page.getByRole('heading', { level: 1, name: russian.title, exact: true }),
  ).toBeVisible();

  const example = page.getByRole('group', { name: russian.accessibility.default, exact: true });
  const navigation = example.getByRole('navigation', {
    name: russian.accessibility.navigation,
    exact: true,
  });
  const trail = navigation.getByRole('list');

  await expect(
    navigation.getByRole('link', { name: russian.items.playground, exact: true }),
  ).toHaveAttribute('href', '/');
  await expect(trail.locator('span[kuiBreadcrumbItem][current]')).toHaveText(russian.items.current);
});

test('renders a minimally configured default trail and captures desktop and 320px views', async ({
  page,
}) => {
  const example = page.getByRole('group', {
    name: 'Default breadcrumb example',
    exact: true,
  });
  const navigation = example.getByRole('navigation', { name: 'Breadcrumb', exact: true });
  const trail = navigation.getByRole('list');
  const current = trail.locator('span[kuiBreadcrumbItem][current]');

  await expect(trail).toHaveAttribute('data-kui-size', 'md');
  await expect(trail).toHaveAttribute('role', 'list');
  await expect(navigation.getByRole('link', { name: 'Playground', exact: true })).toHaveAttribute(
    'href',
    '/',
  );
  await expect(trail.locator('li[kuiBreadcrumbSeparator]')).toHaveCount(2);
  await expect(trail.locator('li[kuiBreadcrumbSeparator]').first()).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  await expect(current).toHaveAttribute('aria-current', 'page');
  await expect(current).not.toHaveAttribute('href');
  await expect(example).toHaveScreenshot('breadcrumbs-default-dark-desktop.png', {
    animations: 'disabled',
  });

  await captureMobile(page, example, 'breadcrumbs-default-dark-320.png');
});

test('captures the mixed crumb and leading-icon compositions', async ({ page }) => {
  const examples = page.getByRole('group', {
    name: 'Breadcrumb composition examples',
    exact: true,
  });
  const plainExample = examples.getByRole('group', {
    name: 'Plain-text grouping crumb example',
    exact: true,
  });
  const plain = plainExample.locator('span[kuiBreadcrumbItem]').first();
  const leadingIconExample = examples.getByRole('group', {
    name: 'Leading icon example',
    exact: true,
  });
  const iconLink = leadingIconExample.getByRole('link', { name: 'Playground', exact: true });

  await expect(plain).not.toHaveAttribute('aria-current');
  await expect(plainExample.getByRole('navigation').getByRole('link')).toHaveCount(1);
  await expect(leadingIconExample.locator('.kui-breadcrumb-icon svg')).toHaveCount(1);
  await expect(iconLink).toHaveAttribute('aria-label', 'Playground');
  await expect(examples).toHaveScreenshot('breadcrumbs-composition-desktop.png', {
    animations: 'disabled',
  });

  await captureMobile(page, examples, 'breadcrumbs-composition-320.png');
});

test('renders all supported sizes', async ({ page }) => {
  const examples = page.getByRole('group', { name: 'Breadcrumb size examples', exact: true });

  for (const size of ['sm', 'md', 'lg']) {
    const sizeExample = examples.getByRole('group', {
      name: `Breadcrumb ${size} size example`,
      exact: true,
    });

    await expect(sizeExample.getByRole('list')).toHaveAttribute('data-kui-size', size);
  }

  await expect(examples).toHaveScreenshot('breadcrumbs-sizes-desktop.png', {
    animations: 'disabled',
  });

  await captureTablet(page, examples, 'breadcrumbs-sizes-tablet-768.png');
  await captureMobile(page, examples, 'breadcrumbs-sizes-320.png');
});

test('shows consumer-selected narrow layouts without a built-in collapse menu', async ({
  page,
}) => {
  const examples = page.getByRole('group', {
    name: 'Breadcrumb narrow layout examples',
    exact: true,
  });
  const truncateExample = examples.getByRole('group', {
    name: 'Truncated middle crumb example',
    exact: true,
  });
  const truncatedLink = truncateExample.getByRole('link', {
    name: 'Design system component library',
    exact: true,
  });
  const currentCrumb = truncateExample.locator('span[kuiBreadcrumbItem][current]');
  const ellipsisExample = examples.getByRole('group', {
    name: 'Static ellipsis slot example; menu wiring is consumer-owned',
    exact: true,
  });
  const firstAndLastExample = examples.getByRole('group', {
    name: 'First and last crumb example',
    exact: true,
  });

  await expect(truncatedLink).toHaveClass(/kui-breadcrumb-truncate/);
  expect(await truncatedLink.evaluate((element) => getComputedStyle(element).textOverflow)).toBe(
    'ellipsis',
  );
  await expect(currentCrumb).toHaveText('Breadcrumbs');
  expect(await currentCrumb.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
    true,
  );
  expect(await truncatedLink.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(
    true,
  );
  await expect(ellipsisExample.locator('.kui-breadcrumb-ellipsis')).toHaveText('…');
  await expect(ellipsisExample.getByRole('button')).toHaveCount(0);
  await expect(
    ellipsisExample.getByRole('navigation').getByRole('list').locator('li').nth(2),
  ).toHaveAttribute('aria-hidden', 'true');
  await expect(firstAndLastExample.getByRole('list').locator('li')).toHaveCount(3);
  await expect(examples).toHaveScreenshot('breadcrumbs-narrow-layouts-desktop.png', {
    animations: 'disabled',
  });

  await captureMobile(page, examples, 'breadcrumbs-narrow-layouts-320.png');
});

test('captures the shell-provided light theme for the default trail', async ({ page }) => {
  const example = page.getByRole('group', {
    name: 'Default breadcrumb example',
    exact: true,
  });

  await expect(page.locator('html')).toHaveAttribute('data-kui-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light theme', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-kui-theme', 'light');
  await expect(example).toHaveScreenshot('breadcrumbs-default-light-desktop.png', {
    animations: 'disabled',
  });
});

test('captures keyboard focus-visible and pointer hover on a breadcrumb link', async ({ page }) => {
  const example = page.getByRole('group', {
    name: 'Default breadcrumb example',
    exact: true,
  });
  const link = example.getByRole('link', { name: 'Playground', exact: true });

  await tabTo(page, link);
  await expect(link).toBeFocused();
  expect(await link.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(example).toHaveScreenshot('breadcrumbs-link-focus-visible-desktop.png', {
    animations: 'disabled',
  });

  await page.mouse.move(0, 0);
  await link.evaluate((element) => (element as HTMLElement).blur());
  await expect(link).not.toBeFocused();
  expect(await link.evaluate((element) => element.matches(':focus-visible'))).toBe(false);
  await link.hover();
  expect(await link.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect(link).toHaveScreenshot('breadcrumbs-link-hover-desktop.png', {
    animations: 'disabled',
  });

  await page.setViewportSize(mobileViewport);
  await collapseMobileSidebar(page);
  await expectNoHorizontalOverflow(page);
  await tabTo(page, link);
  await expect(link).toBeFocused();
  expect(await link.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(example).toHaveScreenshot('breadcrumbs-link-focus-visible-320.png', {
    animations: 'disabled',
  });
});

test('follows an ancestor link to the Playground home route', async ({ page }) => {
  const example = page.getByRole('group', {
    name: 'Default breadcrumb example',
    exact: true,
  });

  await example.getByRole('link', { name: 'Playground', exact: true }).click();

  await expect(page).toHaveURL(/\/$/);
});

async function captureMobile(page: Page, example: Locator, screenshotName: string): Promise<void> {
  await page.setViewportSize(mobileViewport);
  await collapseMobileSidebar(page);
  await expectNoHorizontalOverflow(page);
  await expect(example).toHaveScreenshot(screenshotName, { animations: 'disabled' });
}

async function captureTablet(page: Page, example: Locator, screenshotName: string): Promise<void> {
  await page.setViewportSize(tabletViewport);
  await collapseMobileSidebar(page);
  await expectNoHorizontalOverflow(page);
  await expect(example).toHaveScreenshot(screenshotName, { animations: 'disabled' });
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

async function tabTo(page: Page, target: Locator): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) return;

    await page.keyboard.press('Tab');
  }

  throw new Error('Keyboard navigation did not reach the named Breadcrumbs link.');
}
