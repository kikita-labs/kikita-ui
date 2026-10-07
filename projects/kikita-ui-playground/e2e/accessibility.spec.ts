import { collectAxeViolations } from './support/axe';
import { expect, test } from './support/fixtures';

/**
 * Automated axe sweep over every routed component page, discovered from the sidebar so a new page
 * is covered without editing this list. It is automated evidence only; manual keyboard and
 * screen-reader review is recorded separately in `docs/state-coverage.md`.
 *
 * Every component page is expected to be free of automated violations. A violation that cannot be
 * fixed yet goes in `knownViolations` by route and rule id with a reason and an owner; it is asserted
 * exactly, so a new violation fails the sweep and fixing a listed one fails it too until the entry is
 * removed, and the list cannot go stale. The list was emptied by Plan 10.3 on 2026-10-01.
 */
const knownViolations: Record<string, readonly string[]> = {};

test('reports no automated accessibility violations on component pages beyond the known list', async ({
  page,
}) => {
  test.setTimeout(240_000);

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Kikita UI' })).toBeVisible();

  const routes = await page
    .locator('.component-list__item')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));

  expect(routes.length).toBeGreaterThanOrEqual(44);

  const found: Record<string, string[]> = {};

  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator('.component-list__item[aria-current="page"]')).toHaveAttribute(
      'href',
      route,
    );

    // Both themes: colour contrast is part of the contract (Plan 14), so a theme that fails shows
    // up here with its own key.
    for (const theme of ['light', 'dark']) {
      await page.locator('html').evaluate((element, mode) => {
        element.setAttribute('data-kui-theme', mode);
      }, theme);

      const violations = await collectAxeViolations(page);

      if (violations.length > 0) {
        found[theme === 'light' ? route : `${route} (dark)`] = violations
          .map((violation) => violation.id)
          .sort();
      }
    }
  }

  expect(found).toEqual(knownViolations);
});
