import { expect, type Page, type Response } from '@playwright/test';

/**
 * A page whose server-rendered HTML is on screen while every client script is still held back.
 */
export interface HeldServerRender {
  /** The document response the server produced, before any client JavaScript ran. */
  readonly response: Response;
  /** The raw HTML the server sent. */
  readonly serverHtml: string;
  /** Lets the client scripts run so the application can hydrate. */
  release(): void;
}

/**
 * Loads a route and holds back all JavaScript requests until `release()` is called.
 *
 * While scripts are held, whatever is visible was produced by the server alone. That separates
 * "the server rendered usable HTML" from "the client rendered the page", which a plain
 * `page.goto()` cannot do because Angular hydration can mask an empty or broken server response.
 */
export async function openWithHeldScripts(page: Page, route: string): Promise<HeldServerRender> {
  let release: () => void = () => undefined;
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });

  await page.route(/\.m?js(\?.*)?$/, async (scriptRoute) => {
    await released;
    await scriptRoute.continue();
  });

  const response = await page.goto(route, { waitUntil: 'commit' });
  if (!response) throw new Error(`No document response for ${route}.`);
  expect(response.status(), `${route} status`).toBe(200);

  return { response, serverHtml: await response.text(), release };
}

/**
 * Pairs every `label[for]` in an HTML string with the id it points to, so server and hydrated
 * markup can be compared for stable, non-duplicated form-field ids.
 */
export async function readLabelTargets(
  page: Page,
  html: string,
): Promise<{ readonly labelFor: string; readonly targetExists: boolean }[]> {
  return page.evaluate((markup) => {
    const parsed = new DOMParser().parseFromString(markup, 'text/html');

    return Array.from(parsed.querySelectorAll('label[for]'), (label) => {
      const labelFor = label.getAttribute('for') ?? '';

      return { labelFor, targetExists: parsed.getElementById(labelFor) !== null };
    });
  }, html);
}

/** Ids that occur more than once in the live document. Duplicates break label and ARIA wiring. */
export async function readDuplicateIds(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const counts = new Map<string, number>();

    for (const element of document.querySelectorAll('[id]')) {
      counts.set(element.id, (counts.get(element.id) ?? 0) + 1);
    }

    return [...counts].filter(([, count]) => count > 1).map(([id]) => id);
  });
}

/**
 * Proves the replacement Playground has hydrated, then leaves the shell theme as it found it.
 *
 * The app exposes no hydration marker and server ids now equal client ids, so neither an id nor a
 * DOM attribute can show it. Switching the theme is client-only state: it succeeds only once event
 * handlers are attached. The action is retried until then, and the theme is switched back so a
 * screenshot taken afterwards keeps the default (dark) theme.
 */
export async function waitForShellHydration(page: Page): Promise<void> {
  const banner = page.getByRole('banner');

  await expect(page.locator('html')).toHaveAttribute('data-kui-theme', 'dark');
  await expect(async () => {
    await banner
      .getByRole('button', { name: 'Switch to light theme', exact: true })
      .click({ timeout: 1_000 });
    await expect(page.locator('html')).toHaveAttribute('data-kui-theme', 'light', {
      timeout: 1_000,
    });
  }).toPass();
  await banner.getByRole('button', { name: 'Switch to dark theme', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-kui-theme', 'dark');
  // The clicks above switch the input modality to pointer; restore keyboard modality so a
  // programmatic focus afterwards matches :focus-visible as it does on a fresh keyboard visit.
  await page.keyboard.press('Shift');
}
