import type { Page } from '@playwright/test';

import { expect, test } from './support/fixtures';
import { openWithHeldScripts, readDuplicateIds, readLabelTargets } from './support/ssr';

/**
 * Each route is checked against text that only the server can have put in the first HTML response
 * (the title of its first demo panel), so an empty server shell cannot pass.
 */
const routes = [
  { route: '/tokens', serverText: 'Theme pipeline' },
  { route: '/button', serverText: 'Button variants' },
  { route: '/field', serverText: 'Label, hint, error, required marker' },
  { route: '/input', serverText: 'Input state matrix' },
  { route: '/select', serverText: 'input[kuiSelect] - strings' },
  { route: '/dropdown', serverText: 'Field auto-wiring' },
  { route: '/popover', serverText: 'Placement & Alignment' },
  { route: '/dialog', serverText: 'Sizes' },
  { route: '/number-input', serverText: 'Variants' },
  { route: '/table', serverText: 'Basic (read-only)' },
  { route: '/chart', serverText: 'Default' },
] as const;

function decodeEntities(html: string): string {
  return html.replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>');
}

/**
 * The application only exposes hydration through behavior. The server renders the dark theme, and
 * choosing "light" is client-only state, so this succeeds only once event handlers are attached.
 * The action is idempotent, which lets it be retried until hydration finishes. The header holds two
 * identically named theme toggles that share one state; the first child is targeted explicitly.
 */
async function waitForHydration(page: Page): Promise<void> {
  await expect(page.locator('html')).toHaveAttribute('data-kui-theme', 'dark');

  await expect(async () => {
    await page
      .locator('.header__theme-toggles > kui-segmented:first-child')
      .getByRole('radio', { name: 'light', exact: true })
      .click({ timeout: 1_000 });
    await expect(page.locator('html')).toHaveAttribute('data-kui-theme', 'light', {
      timeout: 1_000,
    });
  }).toPass();
}

test.describe('server response', () => {
  for (const { route, serverText } of routes) {
    test(`${route} ships its content in the first HTML response`, async ({ request }) => {
      const response = await request.get(route);
      const html = decodeEntities(await response.text());

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('text/html');
      expect(html).toContain('ng-server-context="ssr"');
      expect(html).toContain(serverText);
    });
  }
});

test.describe('without client JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('renders a readable table from the server response alone', async ({ page }) => {
    await page.goto('/table');

    const table = page.locator('app-panel[num="01"]').getByRole('table');

    await expect(table).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    expect(await table.getByRole('row').count()).toBeGreaterThan(1);
  });
});

test.describe('hydration', () => {
  for (const { route, serverText } of routes) {
    test(`${route} keeps its server DOM through hydration and stays interactive`, async ({
      page,
    }) => {
      const held = await openWithHeldScripts(page, route);
      const firstPanel = page.locator('app-panel[num="01"]');

      // Only the server has rendered anything at this point, because every script is held back.
      await expect(firstPanel).toContainText(serverText);
      await firstPanel.evaluate((element) => element.setAttribute('data-server-node', ''));

      held.release();
      await waitForHydration(page);

      // Hydration reuses server nodes. A client re-render would have replaced the marked node.
      await expect(firstPanel).toHaveAttribute('data-server-node', '');
      expect(await readDuplicateIds(page)).toEqual([]);
    });
  }

  test('/field keeps label-to-control wiring from the server through hydration', async ({
    page,
  }) => {
    const held = await openWithHeldScripts(page, '/field');
    const serverLabels = await readLabelTargets(page, held.serverHtml);

    expect(serverLabels.length).toBeGreaterThan(0);
    expect(serverLabels.filter((label) => !label.targetExists)).toEqual([]);

    held.release();
    await waitForHydration(page);

    const ownerEmail = page.getByLabel('Owner email');

    await expect(ownerEmail).toHaveCount(1);
    await expect(ownerEmail).toHaveAccessibleDescription('Email is required');
    expect(await readDuplicateIds(page)).toEqual([]);

    const hydratedLabels = await page.evaluate(() =>
      Array.from(document.querySelectorAll('label[for]'), (label) => ({
        labelFor: label.getAttribute('for') ?? '',
        targetExists: document.getElementById(label.getAttribute('for') ?? '') !== null,
      })),
    );

    expect(hydratedLabels.filter((label) => !label.targetExists)).toEqual([]);
    expect(hydratedLabels.map((label) => label.labelFor)).toEqual(
      serverLabels.map((label) => label.labelFor),
    );
  });

  test('/dialog opens from server-rendered markup, dismisses with Escape and restores focus', async ({
    page,
  }) => {
    const held = await openWithHeldScripts(page, '/dialog');
    const trigger = page.getByRole('button', { name: 'Open md', exact: true });

    await expect(trigger).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await trigger.evaluate((element) => element.setAttribute('data-server-node', ''));

    held.release();
    await waitForHydration(page);
    await expect(trigger).toHaveAttribute('data-server-node', '');

    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('/dialog replays a click made before hydration and opens once the scripts run', async ({
    page,
  }) => {
    const held = await openWithHeldScripts(page, '/dialog');
    const trigger = page.getByRole('button', { name: 'Open md', exact: true });

    // No script has run, so this click reaches only the event-replay recorder in the server HTML.
    await trigger.click();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    held.release();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(1);
  });
});
