import { test } from '@playwright/test';

import { expectNoAxeViolations } from './support/axe';
import { gotoReady } from './support/page-ready';

const routes = [
  '/tokens',
  '/button',
  '/field',
  '/input',
  '/select',
  '/dropdown',
  '/dialog',
  '/table',
];

for (const route of routes) {
  test(`has no automated accessibility violations on ${route}`, async ({ page }) => {
    await gotoReady(page, route);
    await expectNoAxeViolations(page, {
      excludeRules: [
        'aria-prohibited-attr',
        'color-contrast',
        'empty-table-header',
        'label-title-only',
        'scrollable-region-focusable',
      ],
    });
  });
}
