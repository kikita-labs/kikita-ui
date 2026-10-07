import { expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

/** Compact description of one axe rule that failed on the page. */
export interface AxeViolationSummary {
  readonly id: string;
  readonly impact: string | null;
  /** Number of elements that failed the rule. */
  readonly nodes: number;
}

export interface AxeOptions {
  readonly excludeRules?: readonly string[];
}

/**
 * Runs axe-core against the current document and returns the failed rules.
 *
 * This is automated evidence only. It cannot judge focus order, reading order, announcements or
 * whether a label is meaningful; those need manual keyboard and screen-reader review.
 */
export async function collectAxeViolations(
  page: Page,
  options: AxeOptions = {},
): Promise<AxeViolationSummary[]> {
  // Colour contrast is computed from the colours on screen, so wait until the finite transitions and
  // animations of a theme switch or an opening overlay have ended; looping ones never finish.
  await page.evaluate(async () => {
    const finite = document
      .getAnimations()
      .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity);

    await Promise.race([
      Promise.allSettled(finite.map((animation) => animation.finished)),
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]);
  });
  await page.addScriptTag({ content: axeSource });
  const result = await page.evaluate(async (excludedRules) => {
    return await window.axe.run(document, {
      resultTypes: ['violations'],
      rules: Object.fromEntries(excludedRules.map((rule) => [rule, { enabled: false }])),
    });
  }, options.excludeRules ?? []);

  return result.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact ?? null,
    nodes: violation.nodes.length,
  }));
}

export async function expectNoAxeViolations(page: Page, options: AxeOptions = {}): Promise<void> {
  expect(await collectAxeViolations(page, options)).toEqual([]);
}

declare global {
  interface Window {
    axe: {
      run: (
        context: Document,
        options: unknown,
      ) => Promise<{
        violations: { id: string; impact?: string | null; nodes: unknown[] }[];
      }>;
    };
  }
}
