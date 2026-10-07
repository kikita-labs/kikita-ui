import { expect, test } from './support/fixtures';
import { openWithHeldScripts, waitForShellHydration } from './support/ssr';

/**
 * Library messages (Plan 21): the Playground feeds `provideKikitaUi({ locale, messages })` from the
 * active Transloco language, so every Kikita UI label switches with the shell. The catalogue's
 * coverage of the library's message map is checked by `pnpm audit:static`.
 */
interface Catalogue {
  readonly kui: {
    readonly pagination: { readonly next: string };
  };
}

async function loadCatalogue(
  request: { get(url: string): Promise<{ ok(): boolean; json(): Promise<unknown> }> },
  language: 'en' | 'ru',
): Promise<Catalogue> {
  const response = await request.get(`/i18n/${language}.json`);
  expect(response.ok()).toBe(true);

  return (await response.json()) as Catalogue;
}

test.describe('library messages follow the shell language', () => {
  test('Pagination switches to Russian without a reload', async ({ page, request }) => {
    const russian = (await loadCatalogue(request, 'ru')).kui;
    const english = (await loadCatalogue(request, 'en')).kui;
    await page.setViewportSize({ width: 1440, height: 1200 });
    await page.goto('/components/pagination');

    await expect(
      page.getByRole('button', { name: english.pagination.next, exact: true }).first(),
    ).toBeVisible();

    await page
      .getByRole('banner')
      .getByRole('button', { name: 'Switch language to Russian', exact: true })
      .click();

    await expect(
      page.getByRole('button', { name: russian.pagination.next, exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: english.pagination.next, exact: true }),
    ).toHaveCount(0);
  });

  test('server markup carries the English messages and the page hydrates', async ({
    page,
    request,
  }) => {
    const english = (await loadCatalogue(request, 'en')).kui;
    const held = await openWithHeldScripts(page, '/components/pagination');

    await expect(
      page.getByRole('button', { name: english.pagination.next, exact: true }).first(),
    ).toBeVisible();
    held.release();
    await waitForShellHydration(page);
    await expect(
      page.getByRole('button', { name: english.pagination.next, exact: true }).first(),
    ).toBeVisible();
  });
});
