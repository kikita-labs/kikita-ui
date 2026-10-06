import type { Locator, Page } from '@playwright/test';

import { expect, test } from './support/fixtures';
import { settleAnimations } from './support/page-ready';

/**
 * Forced-colors regression (Plan 14, slice 14.6). The browser replaces author colours with the
 * system palette and drops `box-shadow`, so a state survives only when it is carried by a
 * system colour, a border or an outline. Each case compares the computed style of two states in a
 * property that forced colors keep; equal values mean the state is invisible.
 */
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', colorScheme: 'light' });
});

async function open(page: Page, route: string): Promise<void> {
  await page.goto(route);
  await expect(page.locator('.component-list__item[aria-current="page"]')).toHaveAttribute(
    'href',
    route,
  );
  await settleAnimations(page);
  expect(
    await page.evaluate(() => matchMedia('(forced-colors: active)').matches),
    'forced colors emulation is active',
  ).toBe(true);
}

function style(locator: Locator, property: string, pseudo?: string): Promise<string> {
  return locator.evaluate(
    (element, [name, part]) => getComputedStyle(element, part || null).getPropertyValue(name),
    [property, pseudo ?? ''] as const,
  );
}

async function expectDifferent(
  first: Locator,
  second: Locator,
  property: string,
  label: string,
  pseudo?: string,
): Promise<void> {
  await expect(first, `${label}: first state exists`).not.toHaveCount(0);
  await expect(second, `${label}: second state exists`).not.toHaveCount(0);
  // Polled: a colour transition or late hydration can still be in flight under load.
  await expect
    .poll(
      async () =>
        (await style(first.first(), property, pseudo)) !==
        (await style(second.first(), property, pseudo)),
      { message: label },
    )
    .toBe(true);
}

test('checkbox and radio show checked state with a different background', async ({ page }) => {
  await open(page, '/components/checkbox');
  await expectDifferent(
    page.locator('input.kui-checkbox:checked'),
    page.locator('input.kui-checkbox:not(:checked):not(:indeterminate)'),
    'background-color',
    'checkbox checked',
  );
  await expectDifferent(
    page.locator('input.kui-checkbox:indeterminate'),
    page.locator('input.kui-checkbox:not(:checked):not(:indeterminate)'),
    'background-color',
    'checkbox indeterminate',
  );

  await open(page, '/components/radio');
  await expectDifferent(
    page.locator('input.kui-radio:checked'),
    page.locator('input.kui-radio:not(:checked)'),
    'background-color',
    'radio checked',
  );
});

test('switch shows state in the track and the thumb', async ({ page, browserName }) => {
  test.skip(
    browserName === 'webkit',
    'Safari has no forced-colors mode, so the thumb keeps its colour.',
  );
  await open(page, '/components/switch');

  const on = page.locator('input.kui-switch:checked');
  const off = page.locator('input.kui-switch:not(:checked)');

  await expectDifferent(on, off, 'background-color', 'switch track');
  await expectDifferent(on, off, 'background-color', 'switch thumb', '::before');
  expect(await style(on.first(), 'background-color', '::before')).not.toBe(
    await style(on.first(), 'background-color'),
  );
});

test('slider and progress separate the fill from the track', async ({ page }) => {
  await open(page, '/components/slider');
  await expectDifferent(
    page.locator('.kui-slider:not([data-kui-disabled]) .kui-slider-fill'),
    page.locator('.kui-slider:not([data-kui-disabled]) .kui-slider-track'),
    'background-color',
    'slider fill',
  );
  await expectDifferent(
    page.locator('.kui-slider:not([data-kui-disabled]) .kui-slider-thumb'),
    page.locator('.kui-slider:not([data-kui-disabled]) .kui-slider-track'),
    'background-color',
    'slider thumb',
  );

  await open(page, '/components/progress');
  await expectDifferent(
    page.locator('.kui-progress-linear:not([data-kui-indeterminate]) .kui-progress-linear-fill'),
    page.locator('.kui-progress-linear:not([data-kui-indeterminate])'),
    'background-color',
    'progress linear',
  );
  await expectDifferent(
    page.locator('.kui-progress-circular-fill'),
    page.locator('.kui-progress-circular-track'),
    'stroke',
    'progress circular',
  );
});

test('calendar marks the selected day', async ({ page }) => {
  await open(page, '/components/calendar');
  await expectDifferent(
    page.locator('.kui-calendar-day--selected .kui-calendar-day-inner'),
    page.locator(
      '.kui-calendar-day:not(.kui-calendar-day--selected):not(.kui-calendar-day--disabled) .kui-calendar-day-inner',
    ),
    'background-color',
    'calendar selected day',
  );
});

test('tabs and segmented show the selection', async ({ page }) => {
  await open(page, '/components/tabs');

  const indicator = page.locator('.kui-tab-indicator').first();

  expect(await style(indicator, 'background-color'), 'tab indicator').not.toBe(
    await style(page.locator('.kui-tabs').first(), 'background-color'),
  );
  await expectDifferent(
    page.locator('.kui-tabs[data-kui-variant="pill"] .kui-tab[data-kui-selected]'),
    page.locator('.kui-tabs[data-kui-variant="pill"] .kui-tab:not([data-kui-selected])'),
    'background-color',
    'pill tab selected',
  );

  await open(page, '/components/segmented');
  await expectDifferent(
    page.locator('.kui-segmented__thumb'),
    page.locator('.kui-segmented'),
    'background-color',
    'segmented thumb',
  );
});

test('stepper separates done, current and upcoming steps', async ({ page }) => {
  await open(page, '/components/stepper');
  await expectDifferent(
    page.locator('.kui-step[data-kui-state="done"] .kui-step-circle'),
    page.locator('.kui-step[data-kui-state="upcoming"] .kui-step-circle'),
    'background-color',
    'stepper done',
  );
  await expectDifferent(
    page.locator('.kui-step[data-kui-state="current"] .kui-step-circle'),
    page.locator('.kui-step[data-kui-state="upcoming"] .kui-step-circle'),
    'border-color',
    'stepper current',
  );
});

test('every focusable element keeps a visible outline', async ({ page }) => {
  test.setTimeout(240_000);

  const routes = [
    'input',
    'checkbox',
    'radio',
    'switch',
    'slider',
    'segmented',
    'tabs',
    'calendar',
    'breadcrumbs',
    'stepper',
    'chip',
    'pagination',
    'color-input',
    'select',
    'link',
    'button',
  ];

  for (const name of routes) {
    await open(page, `/components/${name}`);
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

    const missing = new Set<string>();

    for (let step = 0; step < 40; step += 1) {
      await page.keyboard.press('Tab');

      const problem = await page.evaluate(() => {
        const element = document.activeElement;

        if (!element || element === document.body || !element.closest('main, [role="main"]')) {
          return null;
        }

        const visible = (node: Element): boolean => {
          const computed = getComputedStyle(node);
          return computed.outlineStyle !== 'none' && parseFloat(computed.outlineWidth) > 0;
        };
        const thumb = element.matches('.kui-slider-native')
          ? element.parentElement?.querySelector('.kui-slider-thumb')
          : null;

        const group = element.closest('.kui-input-group, .kui-number-input, .kui-color-input');

        if (
          (thumb && visible(thumb)) ||
          visible(element) ||
          (group && visible(group)) ||
          (element.firstElementChild && visible(element.firstElementChild))
        ) {
          return null;
        }

        return `${element.tagName.toLowerCase()}.${String(element.className).split(' ').slice(0, 2).join('.')}`;
      });

      if (problem) {
        missing.add(problem);
      }
    }

    expect([...missing], `/components/${name} focus outline`).toEqual([]);
  }
});
