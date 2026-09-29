import { collectAxeViolations, expectNoAxeViolations } from './support/axe';
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
 * Routes where axe reports violations that are not fixed yet, with the exact rule ids expected. A
 * new rule fails the route, and fixing one fails it too until this list is updated, so the list
 * cannot go stale. Found by Plan 11 on 2026-09-29. Fixing component or demo markup is outside Plan
 * 11 and none of these has an owner yet; each needs a focused accessibility slice.
 */
const knownViolations: Record<string, readonly string[]> = {
  '/calendar': ['aria-allowed-attr', 'aria-required-children', 'aria-required-parent'],
  '/calendar-range': ['aria-required-children', 'aria-required-parent'],
  '/splitter': ['aria-valid-attr-value', 'nested-interactive'],
  '/menu': ['aria-required-parent'],
  '/file-upload': ['label', 'nested-interactive'],
};

const excludeRules = [
  'aria-prohibited-attr',
  'color-contrast',
  'empty-table-header',
  'label-title-only',
  'scrollable-region-focusable',
];

for (const route of routes) {
  test(`has no automated accessibility violations on ${route}`, async ({ page }) => {
    await gotoReady(page, route);
    await expectNoAxeViolations(page, { excludeRules });
  });
}

for (const [route, expectedRules] of Object.entries(knownViolations)) {
  test(`reports exactly the known automated accessibility violations on ${route}`, async ({
    page,
  }) => {
    await gotoReady(page, route);

    const violations = await collectAxeViolations(page, { excludeRules });

    expect(violations.map((violation) => violation.id).sort()).toEqual(expectedRules);
  });
}
