import { collectAxeViolations } from './support/axe';
import { expect, test } from './support/fixtures';
import { gotoReady } from './support/page-ready';

/**
 * Automated axe checks only. They find a subset of WCAG failures on the rendered page; they do not
 * replace manual keyboard and screen-reader review, which is tracked separately in
 * `docs/accessibility.md` and `docs/state-coverage.md`.
 */
const routes = [
  '/tokens',
  '/button',
  '/field',
  '/input',
  '/select',
  '/dropdown',
  '/dialog',
  '/table',
  '/alert',
  '/otp-input',
  '/pagination',
  '/time-picker',
  '/link',
  '/chart',
  '/date-picker',
  '/carousel',
  '/media-viewer',
  '/toast',
  '/tabs',
  '/tree',
  '/popover',
  '/tooltip',
  '/checkbox',
  '/radio',
  '/switch',
  '/slider',
  '/accordion',
  '/combobox',
  '/command-palette',
  '/drawer',
  '/textarea',
  '/number-input',
  '/segmented',
  '/stepper',
];

/**
 * Rule ids axe reports today, by route. A route that is not listed must report nothing. A new rule
 * fails its route, and fixing one fails it too until this list is updated, so the list cannot go
 * stale. Found by Plan 11 on 2026-09-30 by removing the earlier blanket rule exclusions, which had
 * been hiding these. Fixing component or demo markup is outside Plan 11 and none of these has a
 * confirmed owner yet (see `docs/browser-test-coverage.md`).
 */
const knownViolations: Record<string, readonly string[]> = {
  '/tokens': ['aria-prohibited-attr', 'empty-table-header', 'scrollable-region-focusable'],
  '/field': ['empty-table-header', 'label-title-only'],
  '/input': ['empty-table-header'],
  '/table': ['scrollable-region-focusable'],
  '/otp-input': ['empty-table-header'],
  '/pagination': ['empty-table-header'],
  '/time-picker': ['empty-table-header'],
  '/carousel': ['scrollable-region-focusable'],
  '/tabs': ['empty-table-header'],
  '/checkbox': ['empty-table-header'],
  '/radio': ['empty-table-header'],
  '/switch': ['empty-table-header'],
  '/segmented': ['empty-table-header'],
  '/calendar': ['aria-allowed-attr', 'aria-required-children', 'aria-required-parent'],
  '/calendar-range': ['aria-required-children', 'aria-required-parent'],
  '/splitter': ['aria-valid-attr-value', 'nested-interactive'],
  '/menu': ['aria-required-parent'],
  '/file-upload': ['label', 'nested-interactive'],
};

/**
 * Only color contrast is excluded, because it is measured by the color work (Plan 14 covers contrast
 * measurement; it does not yet say it will re-enable this rule). Every other rule is asserted.
 */
const excludeRules = ['color-contrast'];

const allRoutes = [...new Set([...routes, ...Object.keys(knownViolations)])];

for (const route of allRoutes) {
  const expectedRules = knownViolations[route] ?? [];
  const title =
    expectedRules.length === 0
      ? `has no automated accessibility violations on ${route}`
      : `reports exactly the known automated accessibility violations on ${route}`;

  test(title, async ({ page }) => {
    await gotoReady(page, route);

    const violations = await collectAxeViolations(page, { excludeRules });

    expect(violations.map((violation) => violation.id).sort()).toEqual(expectedRules);
  });
}
