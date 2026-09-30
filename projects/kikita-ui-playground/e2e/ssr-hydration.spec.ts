import { expect, test } from '../../../tests/e2e/support/fixtures';
import {
  openWithHeldScripts,
  readDuplicateIds,
  waitForShellHydration,
} from '../../../tests/e2e/support/ssr';

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

test('keeps the desktop document viewport-bound while the workspace owns page scrolling', async ({
  page,
}) => {
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 1920, height: 776 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/components/calendar');

    const scrollState = await page.evaluate(() => {
      window.scrollTo(0, 1000);

      return {
        documentClientHeight: document.documentElement.clientHeight,
        documentScrollHeight: document.documentElement.scrollHeight,
        documentOverflowY: getComputedStyle(document.documentElement).overflowY,
        documentScrollTop: document.documentElement.scrollTop,
        windowScrollY: window.scrollY,
        workspaceClientHeight: document.querySelector('.playground-shell__workspace')?.clientHeight,
        workspaceScrollHeight: document.querySelector('.playground-shell__workspace')?.scrollHeight,
      };
    });

    expect(scrollState.documentScrollHeight).toBeLessThanOrEqual(scrollState.documentClientHeight);
    expect(scrollState.documentOverflowY).toBe('hidden');
    expect(scrollState.documentScrollTop).toBe(0);
    expect(scrollState.windowScrollY).toBe(0);
    expect(scrollState.workspaceScrollHeight).toBeGreaterThan(
      scrollState.workspaceClientHeight ?? 0,
    );
  }
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

test('server-renders and hydrates Empty State on its routed page', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  const response = await page.goto('/components/empty-state');

  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1, name: 'Empty State' })).toBeVisible();
  await expect(
    page
      .getByRole('group', { name: 'Default empty state example', exact: true })
      .locator('kui-empty-state'),
  ).toHaveAttribute('data-kui-context', 'no-data');

  await page.reload();

  await expect(page.getByRole('heading', { level: 1, name: 'Empty State' })).toBeVisible();
  await expect(
    page
      .getByRole('group', { name: 'Default empty state example', exact: true })
      .locator('kui-empty-state'),
  ).toHaveAttribute('data-kui-size', 'md');
  expect(consoleErrors).toEqual([]);
});

test('server-renders and hydrates Select with a closed, named default combobox', async ({
  page,
}) => {
  for (let requestIndex = 0; requestIndex < 2; requestIndex++) {
    const priorResponse = await page.request.get('/components/select');
    expect(priorResponse.status()).toBe(200);
  }

  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  const response = await page.goto('/components/select');
  expect(response?.status()).toBe(200);
  const serverMarkup = await response?.text();
  expect(serverMarkup).toBeDefined();

  const serverFieldIds = await page.evaluate((markup) => {
    const serverDocument = new DOMParser().parseFromString(markup, 'text/html');
    const field = Array.from(serverDocument.querySelectorAll('kui-field')).find((candidate) =>
      candidate.querySelector('input[role="combobox"]'),
    );
    const label = field?.querySelector('label');
    const control = field?.querySelector<HTMLInputElement>('input[role="combobox"]');

    return {
      labelFor: label?.getAttribute('for') ?? null,
      controlId: control?.id ?? null,
    };
  }, serverMarkup ?? '');

  expect(serverFieldIds.controlId).toMatch(/^kui-field-\d+$/);
  expect(serverFieldIds.labelFor).toBe(serverFieldIds.controlId);
  await expect(page.getByRole('heading', { level: 1, name: 'Select' })).toBeVisible();

  const input = page
    .getByRole('group', { name: 'Default select example', exact: true })
    .getByRole('combobox', { name: 'Role', exact: true });
  await expect(input).toHaveAttribute('role', 'combobox');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(input).toHaveAttribute('aria-haspopup', 'listbox');
  const hydratedFieldIds = await input.evaluate((element) => ({
    controlId: (element as HTMLInputElement).id,
    labelFor: (element as HTMLInputElement).labels?.[0]?.htmlFor ?? null,
  }));
  expect(hydratedFieldIds.controlId).toBe(serverFieldIds.controlId);
  expect(hydratedFieldIds.labelFor).toBe(hydratedFieldIds.controlId);
  await expect(page.getByRole('listbox')).toHaveCount(0);

  await page.reload();
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  expect(consoleErrors).toEqual([]);
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

test('shows server-rendered Dialog markup before client JavaScript, then hydrates and stays usable', async ({
  page,
}) => {
  const held = await openWithHeldScripts(page, '/components/dialog');
  const heading = page.getByRole('heading', { level: 1, name: 'Dialog', exact: true });
  const openDefault = page
    .getByRole('group', { name: 'Dialog size examples', exact: true })
    .getByRole('button', { name: 'Open default', exact: true });

  // Every script is held back, so this content came from the server response alone.
  expect(held.serverHtml).toContain('ng-server-context="ssr"');
  await expect(heading).toBeVisible();
  await expect(openDefault).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('html')).toHaveAttribute('data-kui-theme', 'dark');
  await openDefault.evaluate((element) => element.setAttribute('data-server-node', ''));

  held.release();

  // The server renders the dark theme; switching to light is client-only state, so it succeeds only
  // after hydration attached the handler. The retried action cannot double-toggle: once it works,
  // the "light" button no longer exists.
  await expect(async () => {
    await page
      .getByRole('banner')
      .getByRole('button', { name: 'Switch to light theme', exact: true })
      .click({ timeout: 1_000 });
    await expect(page.locator('html')).toHaveAttribute('data-kui-theme', 'light', {
      timeout: 1_000,
    });
  }).toPass();

  // Hydration reuses the server nodes; a client re-render would have dropped the marker.
  await expect(openDefault).toHaveAttribute('data-server-node', '');
  expect(await readDuplicateIds(page)).toEqual([]);

  await openDefault.click();
  const dialog = page.getByRole('dialog', { name: 'Profile details', exact: true });
  await expect(dialog).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(openDefault).toBeFocused();
});

test('shows Select markup from the server response and keeps the closed combobox after hydration', async ({
  page,
}) => {
  const held = await openWithHeldScripts(page, '/components/select');
  const combobox = page
    .getByRole('group', { name: 'Default select example', exact: true })
    .getByRole('combobox', { name: 'Role', exact: true });

  await expect(combobox).toBeVisible();
  await expect(combobox).toHaveAttribute('aria-expanded', 'false');
  await combobox.evaluate((element) => element.setAttribute('data-server-node', ''));

  held.release();

  await expect(async () => {
    await page
      .getByRole('banner')
      .getByRole('button', { name: 'Switch to light theme', exact: true })
      .click({ timeout: 1_000 });
    await expect(page.locator('html')).toHaveAttribute('data-kui-theme', 'light', {
      timeout: 1_000,
    });
  }).toPass();

  await expect(combobox).toHaveAttribute('data-server-node', '');
  expect(await readDuplicateIds(page)).toEqual([]);

  await combobox.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(combobox).toBeFocused();
});

const idRoutes = ['/components/carousel', '/components/chart', '/components/select'] as const;

function collectComponentIds(html: string): string[] {
  return [...html.matchAll(/\bid="(kui-[^"]+)"/g)].map(([, id]) => id).sort();
}

test.describe('server-generated ids', () => {
  for (const route of idRoutes) {
    test(`${route} renders the same ids for every request`, async ({ request }) => {
      // The first request warms the server so a leaking module-level counter would already be
      // advanced; the next two must still agree exactly.
      await request.get(route);
      const first = collectComponentIds(await (await request.get(route)).text());
      const second = collectComponentIds(await (await request.get(route)).text());

      expect(first.length).toBeGreaterThan(0);
      expect(second).toEqual(first);
    });

    test(`${route} keeps its server ids through hydration`, async ({ page }) => {
      const held = await openWithHeldScripts(page, route);
      const readIds = () =>
        page.evaluate(() =>
          Array.from(document.querySelectorAll('[id^="kui-"]'), (element) => element.id).sort(),
        );

      const serverIds = await readIds();
      expect(serverIds.length).toBeGreaterThan(0);

      held.release();
      await waitForShellHydration(page);

      expect(await readIds()).toEqual(serverIds);
    });
  }
});

test('server HTML already carries the global scrollbar mode', async ({ request }) => {
  const html = await (await request.get('/components/button')).text();

  expect(html).toMatch(/<html[^>]*\sdata-kui-scrollbars="styled"/);
});

test.describe('calendar today marker across time zones', () => {
  // UTC+14 is a different calendar day from a UTC or UTC-negative server for a large part of
  // every day, which is exactly when a server-rendered "today" disagrees with the browser's.
  test.use({ timezoneId: 'Pacific/Kiritimati' });

  test('marks exactly the browser day after hydration, never a stale server day', async ({
    page,
  }) => {
    const held = await openWithHeldScripts(page, '/components/calendar');
    const readMarked = () =>
      page.evaluate(() =>
        Array.from(
          document.querySelectorAll('kui-calendar .kui-calendar-day--today'),
          (element) => element.textContent?.trim() ?? '',
        ),
      );

    expect((await readMarked()).length).toBeLessThanOrEqual(1);

    held.release();
    await waitForShellHydration(page);

    const browserDay = await page.evaluate(() => String(new Date().getDate()));
    const marked = await readMarked();

    // The grid shows the server's month; the marker is on the browser's day, or absent when that
    // day falls outside the rendered month. It is never duplicated and never left on the server day.
    expect(marked.length).toBeLessThanOrEqual(1);
    if (marked.length === 1) expect(marked[0]).toBe(browserDay);
  });
});

test.describe('locale consistency between server and browser', () => {
  test.use({ locale: 'de-DE' });

  // Recorded limitation: the server always renders KUI_LOCALE as en-US (host-independent), while a
  // browser without kuiProvideLocale hydrates in its own language, so Calendar titles and weekday
  // names differ between the server HTML and the client. Apps serving other locales must provide
  // one with kuiProvideLocale; a lasting fix needs a reactive locale and is a separate decision.
  test.fixme('renders the same calendar title on the server and in the browser', async ({
    page,
  }) => {
    const held = await openWithHeldScripts(page, '/components/calendar');
    const readTitle = () => page.locator('kui-calendar .kui-calendar-title').first().textContent();

    const serverTitle = await readTitle();

    held.release();
    await waitForShellHydration(page);

    expect(await readTitle()).toBe(serverTitle);
  });
});
