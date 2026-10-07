import type { Page } from '@playwright/test';

import { expect, test } from './support/fixtures';

/**
 * A shared token set on an ancestor reaches every component that reads it. Before this check the
 * generator also wrote a literal copy of the value into component tokens on `:root`, which shadowed
 * a change to the shared token for those components.
 *
 * The probes are the library classes written into the page, so they do not depend on what a demo
 * page happens to render, and the stylesheet is the one the Playground ships.
 */

interface Probe {
  /** Markup appended to the page body. */
  readonly markup: string;
  /** Computed property that carries the token. */
  readonly property: string;
  /** Shared token set on `<html>`. */
  readonly token: string;
  /** Value written into the token. */
  readonly value: string;
  /** Computed value expected once the token is set. */
  readonly expected: string;
  /** Focus the probe first, so `:focus-visible` rules apply. */
  readonly focus?: boolean;
}

const probes: Record<string, Probe> = {
  'disabled Button': {
    markup: '<button class="kui-button" disabled>Probe</button>',
    property: 'opacity',
    token: '--kui-opacity-disabled',
    value: '0.31',
    expected: '0.31',
  },
  'disabled Input': {
    markup: '<input class="kui-input" disabled />',
    property: 'opacity',
    token: '--kui-opacity-disabled',
    value: '0.32',
    expected: '0.32',
  },
  'disabled Checkbox': {
    markup: '<input type="checkbox" class="kui-checkbox" disabled />',
    property: 'opacity',
    token: '--kui-opacity-disabled',
    value: '0.33',
    expected: '0.33',
  },
  'Button focus ring width': {
    markup: '<button class="kui-button">Probe</button>',
    property: 'outlineWidth',
    token: '--kui-focus-ring-width',
    value: '7px',
    expected: '7px',
    focus: true,
  },
  'Button focus ring offset': {
    markup: '<button class="kui-button">Probe</button>',
    property: 'outlineOffset',
    token: '--kui-focus-ring-offset',
    value: '9px',
    expected: '9px',
    focus: true,
  },
  'Checkbox focus ring width': {
    markup: '<input type="checkbox" class="kui-checkbox" />',
    property: 'outlineWidth',
    token: '--kui-focus-ring-width',
    value: '6px',
    expected: '6px',
    focus: true,
  },
  'Tab focus ring width': {
    markup: '<button class="kui-tab" role="tab">Probe</button>',
    property: 'outlineWidth',
    token: '--kui-focus-ring-width',
    value: '5px',
    expected: '5px',
    focus: true,
  },
  'Link focus ring width (compact)': {
    markup: '<a class="kui-link" href="#probe">Probe</a>',
    property: 'outlineWidth',
    token: '--kui-focus-ring-width-sm',
    value: '4px',
    expected: '4px',
    focus: true,
  },
  'Menu item focus ring inset offset': {
    markup: '<div class="kui-menu-item" tabindex="0">Probe</div>',
    property: 'outlineOffset',
    token: '--kui-focus-ring-offset-inset',
    value: '-6px',
    expected: '-6px',
    focus: true,
  },
  'Badge weight': {
    markup: '<span class="kui-badge">Probe</span>',
    property: 'fontWeight',
    token: '--kui-font-weight-semibold',
    value: '650',
    expected: '650',
  },
  'Button weight': {
    markup: '<button class="kui-button">Probe</button>',
    property: 'fontWeight',
    token: '--kui-font-weight-medium',
    value: '450',
    expected: '450',
  },
  'Tab weight': {
    markup: '<button class="kui-tab" role="tab">Probe</button>',
    property: 'fontWeight',
    token: '--kui-font-weight-medium',
    value: '460',
    expected: '460',
  },
  'Input line height': {
    markup: '<input class="kui-input" />',
    property: 'lineHeight',
    token: '--kui-line-height-control',
    value: '3',
    // Computed line height of a unitless value is in pixels: 3 x the 13px control font size.
    expected: '39px',
  },
  'Button transition duration': {
    markup: '<button class="kui-button">Probe</button>',
    property: 'transitionDuration',
    token: '--kui-duration-base',
    value: '90ms',
    expected: '0.09s',
  },
  'Table header tracking': {
    markup:
      '<table class="kui-table"><thead><tr><th class="kui-th">Probe</th></tr></thead></table>',
    property: 'letterSpacing',
    token: '--kui-type-overline-letter-spacing',
    value: '3px',
    expected: '3px',
  },
};

/** Appends the probe and reads one computed property of its first element child. */
async function readProbe(page: Page, probe: Probe, selectorOfProbe: string): Promise<string> {
  return page.evaluate(
    ([selector, property]) => {
      const element = document.querySelector(selector);

      const value = element
        ? (getComputedStyle(element) as unknown as Record<string, string>)[property]
        : '';

      // A transition lists one duration per property; the first one carries the base duration.
      return property === 'transitionDuration' ? value.split(', ')[0] : value;
    },
    [selectorOfProbe, probe.property],
  );
}

for (const [name, probe] of Object.entries(probes)) {
  test(`${probe.token} reaches the ${name}`, async ({ page }) => {
    await page.goto('/components/button');

    await page.evaluate((markup) => {
      const host = document.createElement('div');

      host.id = 'shared-token-probe';
      host.innerHTML = markup;
      document.body.append(host);
    }, probe.markup);

    const selector =
      probe.markup.includes('<th') && !probe.markup.includes('<button')
        ? '#shared-token-probe .kui-th'
        : '#shared-token-probe > *';

    if (probe.focus) {
      await page.locator(selector).first().focus();
      await expect
        .poll(() =>
          page.evaluate(
            (target) => document.querySelector(target)?.matches(':focus-visible'),
            selector,
          ),
        )
        .toBe(true);
    }

    const before = await readProbe(page, probe, selector);

    await page
      .locator('html')
      .evaluate(
        (element, [token, value]) => element.style.setProperty(token, value),
        [probe.token, probe.value],
      );

    await expect.poll(() => readProbe(page, probe, selector)).toBe(probe.expected);
    expect(before, 'the default differs from the probe value').not.toBe(probe.expected);
  });
}

test('--kui-color-scrim reaches the Dialog backdrop', async ({ page }) => {
  await page.goto('/components/dialog');
  await page
    .getByRole('group', { name: 'Dialog size examples', exact: true })
    .getByRole('button', { name: 'Open default', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();

  const read = () =>
    page.evaluate(() => {
      const backdrop = document.querySelector('.kui-dialog-backdrop');

      return backdrop ? getComputedStyle(backdrop).backgroundColor : '';
    });
  const before = await read();

  await page
    .locator('html')
    .evaluate((element) => element.style.setProperty('--kui-color-scrim', 'rgb(255 0 0)'));

  await expect.poll(read).toBe('rgb(255, 0, 0)');
  expect(before).not.toBe('rgb(255, 0, 0)');
});
