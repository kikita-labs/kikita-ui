import { expect, test } from '@playwright/test';

test('renders on the server and changes language after hydration', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.goto('/');

  await expect(page.locator('h1')).toHaveText('Kikita UI');
  await expect(page.getByRole('button', { name: 'Switch language to Russian' })).toBeVisible();

  const languageButton = page.locator('.playground-header__controls > button').last();
  const productName = page.locator('.playground-header__brand p');
  const englishProductName = await productName.textContent();

  await page.getByRole('button', { name: 'Switch language to Russian' }).click();
  await expect(languageButton).toHaveText('EN');
  await expect(productName).not.toHaveText(englishProductName ?? '');
  expect(consoleErrors).toEqual([]);
});

test('keeps the header fixed while the sidebar and workspace scroll independently', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/components/button');

  const scrollState = await page.evaluate(() => {
    const header = document.querySelector('.playground-header');
    const catalog = document.querySelector('.component-sidebar__catalog');
    const workspace = document.querySelector('.playground-shell__workspace');

    if (!(header instanceof HTMLElement)) throw new Error('Playground header is missing.');
    if (!(catalog instanceof HTMLElement)) throw new Error('Sidebar catalog is missing.');
    if (!(workspace instanceof HTMLElement)) throw new Error('Workspace is missing.');

    const tallContent = document.createElement('div');
    tallContent.style.blockSize = '1200px';
    catalog.append(tallContent.cloneNode());

    const headerTop = header.getBoundingClientRect().top;
    workspace.scrollTop = 400;
    const catalogAfterWorkspaceScroll = catalog.scrollTop;
    catalog.scrollTop = 250;
    const workspaceAfterCatalogScroll = workspace.scrollTop;

    return {
      headerTop,
      catalogClientHeight: catalog.clientHeight,
      catalogScrollHeight: catalog.scrollHeight,
      catalogScrollTop: catalog.scrollTop,
      workspaceClientHeight: workspace.clientHeight,
      workspaceScrollHeight: workspace.scrollHeight,
      catalogAfterWorkspaceScroll,
      workspaceScrollTop: workspace.scrollTop,
      workspaceAfterCatalogScroll,
      documentScrollTop: document.documentElement.scrollTop,
    };
  });

  expect(scrollState.headerTop).toBe(0);
  expect(scrollState.catalogScrollTop, JSON.stringify(scrollState)).toBeGreaterThan(0);
  expect(scrollState.workspaceScrollHeight, JSON.stringify(scrollState)).toBeGreaterThan(
    scrollState.workspaceClientHeight,
  );
  expect(scrollState.workspaceScrollTop).toBeGreaterThan(0);
  expect(scrollState.catalogAfterWorkspaceScroll).toBe(0);
  expect(scrollState.workspaceAfterCatalogScroll).toBe(400);
  expect(scrollState.documentScrollTop).toBe(0);
});

test('opens component routes from the sidebar and reloads them directly', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Button', exact: true }).click();

  await expect(page).toHaveURL(/\/components\/button$/);
  await expect(page.getByRole('heading', { name: 'Button' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Button', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Button' })).toBeVisible();
});

test('matches the documentation palette width without overflowing its panel', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open theme colors' }).click();

  const panel = page.locator('.kui-popover:has(.seed-popover__grid)');
  await expect(panel).toBeVisible();
  await expect(panel.locator('.kui-color-input')).toHaveCount(6);

  const geometry = await panel.evaluate((element) => {
    const panelRect = element.getBoundingClientRect();
    const gridRect = element.querySelector('.seed-popover__grid')?.getBoundingClientRect();
    const lastFieldRect = element.querySelectorAll('kui-field')[1]?.getBoundingClientRect();

    return {
      panelWidth: panelRect.width,
      contentRight: Math.max(gridRect?.right ?? 0, lastFieldRect?.right ?? 0),
      panelRight: panelRect.right,
    };
  });

  expect(geometry.panelWidth).toBe(340);
  expect(geometry.contentRight).toBeLessThanOrEqual(geometry.panelRight);

  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open theme colors' }).click();
  await expect(panel).toBeVisible();

  const narrowGeometry = await panel.evaluate((element) => {
    const panelRect = element.getBoundingClientRect();
    const gridRect = element.querySelector('.seed-popover__grid')?.getBoundingClientRect();

    return {
      panelLeft: panelRect.left,
      panelRight: panelRect.right,
      panelWidth: panelRect.width,
      contentRight: gridRect?.right ?? 0,
      viewportWidth: window.innerWidth,
    };
  });

  expect(narrowGeometry.panelWidth).toBeLessThanOrEqual(320);
  expect(narrowGeometry.panelLeft).toBeGreaterThanOrEqual(0);
  expect(narrowGeometry.panelRight).toBeLessThanOrEqual(narrowGeometry.viewportWidth);
  expect(narrowGeometry.contentRight).toBeLessThanOrEqual(narrowGeometry.panelRight);
});

test('keeps the mobile shell viewport-bound with separate sidebar and workspace scrolling', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/components/button');

  const scrollState = await page.evaluate(() => {
    const header = document.querySelector('.playground-header');
    const catalog = document.querySelector('.component-sidebar__catalog');
    const workspace = document.querySelector('.playground-shell__workspace');

    if (!(header instanceof HTMLElement)) throw new Error('Playground header is missing.');
    if (!(catalog instanceof HTMLElement)) throw new Error('Sidebar catalog is missing.');
    if (!(workspace instanceof HTMLElement)) throw new Error('Workspace is missing.');

    const tallContent = document.createElement('div');
    tallContent.style.blockSize = '1200px';
    catalog.append(tallContent.cloneNode());

    const headerRect = header.getBoundingClientRect();
    workspace.scrollTop = 300;
    const catalogAfterWorkspaceScroll = catalog.scrollTop;
    catalog.scrollTop = 200;

    return {
      headerTop: headerRect.top,
      headerHeight: headerRect.height,
      catalogScrollTop: catalog.scrollTop,
      catalogAfterWorkspaceScroll,
      workspaceClientHeight: workspace.clientHeight,
      workspaceScrollHeight: workspace.scrollHeight,
      workspaceScrollTop: workspace.scrollTop,
      documentScrollTop: document.documentElement.scrollTop,
      documentScrollHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight,
    };
  });

  expect(scrollState.headerTop).toBe(0);
  expect(scrollState.headerHeight).toBe(54);
  expect(scrollState.catalogScrollTop).toBeGreaterThan(0);
  expect(scrollState.workspaceScrollHeight).toBeGreaterThan(scrollState.workspaceClientHeight);
  expect(scrollState.workspaceScrollTop).toBeGreaterThan(0);
  expect(scrollState.catalogAfterWorkspaceScroll).toBe(0);
  expect(scrollState.documentScrollTop).toBe(0);
  expect(scrollState.documentScrollHeight).toBeLessThanOrEqual(scrollState.viewportHeight);
});

test('fits tablet and 320px layouts without horizontal page overflow', async ({ page }) => {
  for (const viewport of [
    { width: 320, height: 640 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/components/button');

    const widths = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
      shell: document.querySelector('.playground-shell')?.scrollWidth ?? 0,
      header: document.querySelector('.playground-header')?.scrollWidth ?? 0,
      sidebar: document.querySelector('.component-sidebar')?.scrollWidth ?? 0,
    }));

    expect(widths.document, `${viewport.width}px: ${JSON.stringify(widths)}`).toBeLessThanOrEqual(
      widths.viewport,
    );
    expect(widths.shell).toBeLessThanOrEqual(widths.viewport);
    expect(widths.header).toBeLessThanOrEqual(widths.viewport);
    expect(widths.sidebar).toBeLessThanOrEqual(widths.viewport);
  }
});

test('renders the header border edge-to-edge while keeping content centered', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/components/button');

  const geometry = await page.evaluate(() => {
    const header = document.querySelector('.playground-header');
    const headerInner = document.querySelector('.playground-header__inner');
    const shellBody = document.querySelector('.playground-shell__body');

    if (!(header instanceof HTMLElement)) throw new Error('Playground header is missing.');
    if (!(headerInner instanceof HTMLElement)) throw new Error('Header content is missing.');
    if (!(shellBody instanceof HTMLElement)) throw new Error('Shell body is missing.');

    const headerRect = header.getBoundingClientRect();
    const headerInnerRect = headerInner.getBoundingClientRect();
    const shellBodyRect = shellBody.getBoundingClientRect();

    return {
      viewportWidth: window.innerWidth,
      headerLeft: headerRect.left,
      headerRight: headerRect.right,
      headerInnerLeft: headerInnerRect.left,
      headerInnerWidth: headerInnerRect.width,
      shellBodyLeft: shellBodyRect.left,
      shellBodyWidth: shellBodyRect.width,
      boxShadow: getComputedStyle(header).boxShadow,
    };
  });

  expect(geometry.headerLeft).toBe(0);
  expect(geometry.headerRight).toBe(geometry.viewportWidth);
  expect(geometry.headerInnerWidth).toBe(1440);
  expect(geometry.headerInnerLeft).toBe((geometry.viewportWidth - geometry.headerInnerWidth) / 2);
  expect(geometry.shellBodyLeft).toBe(geometry.headerInnerLeft);
  expect(geometry.shellBodyWidth).toBe(geometry.headerInnerWidth);
  expect(geometry.boxShadow).toContain('inset');
});
