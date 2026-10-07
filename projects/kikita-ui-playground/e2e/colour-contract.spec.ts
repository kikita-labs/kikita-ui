import type { Page } from '@playwright/test';

import { expect, test } from './support/fixtures';
import { settleAnimations } from './support/page-ready';

/**
 * Computed-style checks for what axe cannot see (Plan 14): the rest boundary of interactive controls
 * and the focus indicator. Both must reach 3:1 against the colour behind them, in both themes.
 */
const THEMES = ['light', 'dark'] as const;

const BOUNDARY_SELECTORS: Record<string, string> = {
  '/components/input': 'input.kui-input',
  '/components/number-input': '.kui-number-input',
  '/components/select': 'input.kui-input',
  '/components/checkbox': 'input.kui-checkbox:not(:checked):not(:indeterminate)',
  '/components/radio': 'input.kui-radio:not(:checked)',
  '/components/switch': 'input.kui-switch:not(:checked)',
  '/components/segmented': '.kui-segmented',
  '/components/chip': 'button.kui-chip',
};

const FOCUS_ROUTES = [
  '/components/button',
  '/components/icon-button',
  '/components/input',
  '/components/checkbox',
  '/components/radio',
  '/components/switch',
  '/components/slider',
  '/components/segmented',
  '/components/tabs',
  '/components/calendar',
  '/components/breadcrumbs',
  '/components/stepper',
  '/components/chip',
  '/components/pagination',
  '/components/color-input',
  '/components/select',
  '/components/link',
  '/components/menu',
];

interface ProbeResult {
  readonly measured: number;
  readonly problems: readonly string[];
}

async function open(page: Page, route: string): Promise<void> {
  await page.goto(route);
  await expect(page.locator('.component-list__item[aria-current="page"]')).toHaveAttribute(
    'href',
    route,
  );
}

async function useTheme(page: Page, theme: string): Promise<void> {
  await page.locator('html').evaluate((element, mode) => {
    element.setAttribute('data-kui-theme', mode);
  }, theme);
  await settleAnimations(page);
}

/**
 * Runs inside the page, so colours are resolved by the real CSS engine. It must stay
 * self-contained: Playwright serializes the function, not its module scope.
 */
function probe({ mode, query }: { mode: string; query: string }): ProbeResult {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) {
    throw new Error('2D canvas is not available');
  }

  const rgba = (css: string): number[] => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = '#000';
    context.fillStyle = css;
    context.fillRect(0, 0, 1, 1);
    return Array.from(context.getImageData(0, 0, 1, 1).data);
  };
  const luminance = ([r, g, b]: number[]): number => {
    const channel = (value: number): number => {
      const unit = value / 255;
      return unit <= 0.04045 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };
  const ratio = (first: number[], second: number[]): number => {
    const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
    return (light + 0.05) / (dark + 0.05);
  };
  const backdrop = (element: Element): number[] => {
    for (let node = element.parentElement; node; node = node.parentElement) {
      const colour = rgba(getComputedStyle(node).backgroundColor);

      if (colour[3] === 255) {
        return colour;
      }
    }

    return rgba(getComputedStyle(document.body).backgroundColor);
  };
  const problems: string[] = [];
  let measured = 0;

  if (mode === 'boundary') {
    for (const element of Array.from(document.querySelectorAll(query))) {
      const excluded =
        ':disabled, [aria-disabled="true"], [aria-invalid="true"], [data-kui-invalid]';
      const style = getComputedStyle(element);

      if (element.matches(excluded) || style.borderTopStyle === 'none') {
        continue;
      }

      measured += 1;
      const value = ratio(rgba(style.borderTopColor), backdrop(element));

      if (value < 3) {
        problems.push(`${element.tagName.toLowerCase()} boundary ${value.toFixed(2)}`);
      }
    }

    return { measured, problems };
  }

  const element = document.activeElement;

  if (
    !element ||
    element === document.body ||
    !element.closest('main, [role="main"], router-outlet + *')
  ) {
    return { measured, problems };
  }

  const outlineOf = (node: Element): CSSStyleDeclaration | null => {
    const style = getComputedStyle(node);
    return style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0 ? style : null;
  };
  // Some components draw the outline on a visual part instead: Calendar day child, Slider thumb.
  const thumb = element.matches('.kui-slider-native')
    ? element.parentElement?.querySelector('.kui-slider-thumb')
    : null;
  const group = element.closest('.kui-input-group, .kui-number-input, .kui-color-input');
  const style =
    (thumb ? outlineOf(thumb) : null) ??
    outlineOf(element) ??
    // A control inside a field group leaves the focus frame to the group.
    (group ? outlineOf(group) : null) ??
    (element.firstElementChild ? outlineOf(element.firstElementChild) : null);
  const label = `${element.tagName.toLowerCase()}.${String(element.className)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .join('.')}`;

  measured = 1;

  if (!style) {
    problems.push(`${label}: no outline`);
  } else {
    const value = ratio(rgba(style.outlineColor), backdrop(element));

    if (value < 3) {
      problems.push(`${label}: outline contrast ${value.toFixed(2)}`);
    }
  }

  return { measured, problems };
}

test('interactive controls keep a 3:1 boundary at rest in both themes', async ({ page }) => {
  test.setTimeout(120_000);

  for (const [route, query] of Object.entries(BOUNDARY_SELECTORS)) {
    await open(page, route);

    for (const theme of THEMES) {
      await useTheme(page, theme);

      const result = await page.evaluate(probe, { mode: 'boundary', query });

      expect(result.measured, `${route} ${theme} measured controls`).toBeGreaterThan(0);
      expect(result.problems, `${route} ${theme}`).toEqual([]);
    }
  }
});

test('every focusable element shows a solid outline of at least 3:1 in both themes', async ({
  page,
}) => {
  test.setTimeout(240_000);

  for (const route of FOCUS_ROUTES) {
    await open(page, route);

    for (const theme of THEMES) {
      await useTheme(page, theme);
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

      const problems = new Set<string>();

      for (let step = 0; step < 40; step += 1) {
        await page.keyboard.press('Tab');

        const result = await page.evaluate(probe, { mode: 'focus', query: '' });
        result.problems.forEach((problem) => problems.add(problem));
      }

      expect([...problems], `${route} ${theme}`).toEqual([]);
    }
  }
});
