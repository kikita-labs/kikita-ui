import { expectNoAxeViolations } from './support/axe';
import { test } from './support/fixtures';
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
 * Routes where axe reports a critical violation that is not fixed yet. Each one stays visible as a
 * skipped test with its rule and owner instead of being dropped from the list. To reproduce, remove
 * the entry's `fixme` and run `pnpm.cmd test:a11y -g "<route>"`.
 *
 * Found by Plan 11 on 2026-09-29. Fixing component or demo markup is outside Plan 11; none of these
 * has an owner yet, so each needs a focused accessibility slice.
 */
const knownViolations: Record<string, string> = {
  '/calendar': 'aria-allowed-attr (critical)',
  '/calendar-range': 'aria-required-children (critical): role="grid" without rows and cells',
  '/splitter': 'aria-valid-attr-value (critical)',
  '/menu': 'aria-required-parent (critical)',
  '/file-upload': 'label (critical): a form element has no accessible label',
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

for (const [route, reason] of Object.entries(knownViolations)) {
  test.fixme(`has no automated accessibility violations on ${route} (${reason})`, async ({
    page,
  }) => {
    await gotoReady(page, route);
    await expectNoAxeViolations(page, { excludeRules });
  });
}
