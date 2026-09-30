import { collectAxeViolations } from '../../../tests/e2e/support/axe';
import { expect, test } from '../../../tests/e2e/support/fixtures';

/**
 * Automated axe sweep over every routed component page, discovered from the sidebar so a new page
 * is covered without editing this list. It is automated evidence only; manual keyboard and
 * screen-reader review is recorded separately in `docs/state-coverage.md`.
 *
 * Violations that exist today are listed by route and rule id and are asserted exactly: a new
 * violation fails the sweep, and fixing one fails it too until the entry is removed, so the list
 * cannot go stale. Found by Plan 11 on 2026-09-29. Fixing component or page markup is outside Plan
 * 11 and none of these has an owner yet; each needs a focused accessibility slice. The library
 * Playground sweep (`tests/e2e/accessibility.spec.ts`) tracks the same calendar and file-upload
 * findings.
 */
const knownViolations: Record<string, readonly string[]> = {
  '/components/breadcrumbs': ['landmark-unique'],
  '/components/calendar-range': [
    'aria-allowed-attr',
    'aria-required-children',
    'aria-required-parent',
  ],
  '/components/carousel': ['scrollable-region-focusable'],

  '/components/calendar': ['aria-allowed-attr', 'aria-required-children', 'aria-required-parent'],
  '/components/file-upload': ['label', 'nested-interactive'],
  '/components/icon': ['scrollable-region-focusable'],
  '/components/progress': ['landmark-unique'],
  '/components/separator': ['scrollable-region-focusable'],
  '/components/splitter': ['aria-valid-attr-value', 'nested-interactive'],
  '/components/typography': ['scrollable-region-focusable'],
};

test('reports exactly the known automated accessibility violations on component pages', async ({
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

    const violations = await collectAxeViolations(page, {
      // Contrast is measured by the color plan, not by this sweep.
      excludeRules: ['color-contrast'],
    });

    if (violations.length > 0) found[route] = violations.map((violation) => violation.id).sort();
  }

  expect(found).toEqual(knownViolations);
});
