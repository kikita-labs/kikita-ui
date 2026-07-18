import { expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

export async function expectNoAxeViolations(
  page: Page,
  options: { readonly excludeRules?: readonly string[] } = {},
): Promise<void> {
  await page.addScriptTag({ content: axeSource });
  const result = await page.evaluate(async (excludedRules) => {
    return await window.axe.run(document, {
      resultTypes: ['violations'],
      rules: Object.fromEntries(excludedRules.map((rule) => [rule, { enabled: false }])),
    });
  }, options.excludeRules ?? []);

  expect(result.violations).toEqual([]);
}

declare global {
  interface Window {
    axe: {
      run: (context: Document, options: unknown) => Promise<{ violations: unknown[] }>;
    };
  }
}
