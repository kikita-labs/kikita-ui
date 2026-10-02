import type { Locator, Page } from '@playwright/test';

import { expect, test } from './support/fixtures';
import { settleAnimations } from './support/page-ready';

/**
 * Keyboard focus must never be lost: it stays on a control that is still usable, follows the
 * visible date in a calendar, enters a panel that Tab could not reach, and comes back to the
 * control when the panel closes. Each case is a regression of a defect found by hand.
 */
async function open(page: Page, route: string): Promise<void> {
  await page.goto(route);
  await expect(page.locator('.component-list__item[aria-current="page"]')).toHaveAttribute(
    'href',
    route,
  );
  await settleAnimations(page);
}

function focusedText(page: Page): Promise<string> {
  return page.evaluate(() => document.activeElement?.textContent?.trim() ?? '');
}

async function expectFocusIn(page: Page, locator: Locator, message: string): Promise<void> {
  await expect(locator, message).toBeFocused();
}

test('Calendar keeps focus on the day after a keyboard move into another month', async ({
  page,
}) => {
  await open(page, '/components/calendar');
  await page.locator('button.kui-calendar-day:not(.kui-calendar-day--muted)').first().focus();

  for (let step = 0; step < 6; step += 1) {
    await page.keyboard.press('ArrowDown');
  }

  await expect(page.locator('button.kui-calendar-day:focus')).toHaveCount(1);
});

test('Calendar Range moves focus one day per arrow key and previews the range', async ({
  page,
}) => {
  await open(page, '/components/calendar-range');

  const grid = page.locator('.kui-calendar').first();

  await grid
    .locator('button.kui-calendar-day:not(.kui-calendar-day--muted)')
    .filter({ hasText: /^10$/ })
    .focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => focusedText(page)).toBe('11');
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => focusedText(page)).toBe('12');
  await expect(grid.locator('.kui-calendar-day--preview')).not.toHaveCount(0);

  await page.keyboard.press('Space');
  await expect(grid.locator('.kui-calendar-day--range-end')).toHaveText('12');
});

test('Color Input moves focus into the panel from the keyboard and back on Escape', async ({
  page,
}) => {
  await open(page, '/components/color-input');

  const trigger = page.locator('.kui-color-input__trigger').first();

  await trigger.focus();
  await page.keyboard.press('Enter');
  await expectFocusIn(page, page.locator('.kui-color-input-picker'), 'panel takes focus');

  await page.keyboard.press('Tab');
  await expect(page.locator('.kui-color-input-hue-native')).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(page.locator('.kui-color-input-picker')).toHaveCount(0);
  await expectFocusIn(page, trigger, 'focus returns to the trigger');
});

test('Combobox keeps focus on its input after a keyboard selection', async ({ page }) => {
  await open(page, '/components/combobox');

  const input = page.locator('input[role="combobox"]').first();

  await input.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('.kui-listbox-option').first()).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await expect(page.locator('.kui-listbox-option')).toHaveCount(0);
  await expectFocusIn(page, input, 'focus returns to the input');
});

test('Number Input keeps focus on a step button that reached its limit', async ({ page }) => {
  await open(page, '/components/number-input');

  const container = page.locator('.kui-number-input').filter({
    has: page.locator('input[min]'),
  });
  const input = container.first().locator('input');
  const decrease = container.first().locator('.kui-number-input__btn--dec');
  const min = Number(await input.getAttribute('min'));

  await input.fill(String(min + 1));
  await decrease.focus();
  await page.keyboard.press('Space');

  await expect(input).toHaveValue(String(min));
  await expect(decrease).toHaveAttribute('aria-disabled', 'true');
  await expectFocusIn(page, decrease, 'focus stays on the step button');
});

test('Calendar Range has a Tab stop on a day even when the open month hides today', async ({
  page,
}) => {
  await open(page, '/components/calendar-range');

  const grid = page.locator('.kui-calendar').first();

  await expect(grid.locator('button.kui-calendar-day[tabindex="0"]')).toHaveCount(1);

  await grid.getByRole('button', { name: /next/i }).first().click();
  await expect(grid.locator('button.kui-calendar-day[tabindex="0"]')).toHaveCount(1);
});

test('Calendar months and years move with the arrow keys', async ({ page }) => {
  await open(page, '/components/calendar');

  const calendar = page.locator('.kui-calendar').first();

  await calendar.locator('button.kui-calendar-title').click();
  await expect(calendar.locator('.kui-calendar-picker-grid')).toBeVisible();
  await expect(calendar.locator('.kui-calendar-picker-cell[tabindex="0"]')).toHaveCount(1);

  await calendar.locator('.kui-calendar-picker-cell--active').focus();
  await page.keyboard.press('ArrowRight');

  const afterRight = await focusedText(page);
  const active = (
    await calendar.locator('.kui-calendar-picker-cell--active').textContent()
  )?.trim();

  expect(afterRight).not.toBe(active);

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Home');
  await expect(calendar.locator('.kui-calendar-picker-cell').first()).toBeFocused();
  await page.keyboard.press('End');
  await expect(calendar.locator('.kui-calendar-picker-cell').last()).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(calendar.locator('.kui-calendar-grid')).toBeVisible();
  await expect(calendar.locator('button.kui-calendar-day:focus')).toHaveCount(1);
});

test('Color Input focuses the text field and opens the picker from its padding', async ({
  page,
}) => {
  await open(page, '/components/color-input');

  const field = page.locator('.kui-color-input').first();
  const box = await field.boundingBox();

  if (!box) throw new Error('Color Input is not visible');

  // The strip between the border and the text input, away from the swatch and the chevron.
  await page.mouse.click(box.x + box.width / 2, box.y + 3);

  await expect(field.locator('input')).toBeFocused();
  await expect(page.locator('.kui-color-input-picker')).toBeVisible();
});

test('Slider shows its value while it has keyboard focus', async ({ page }) => {
  await open(page, '/components/slider');

  await page.locator('input.kui-slider-native').first().focus();
  await page.keyboard.press('ArrowRight');

  await expect(page.locator('.kui-tooltip--overlay')).toBeVisible();

  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await expect(page.locator('.kui-tooltip--overlay')).toHaveCount(0);
});

test('Calendar hover is visible against the surface in both themes', async ({ page }) => {
  await open(page, '/components/calendar');

  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, mode) => {
      element.setAttribute('data-kui-theme', mode);
    }, theme);

    const day = page
      .locator('.kui-calendar')
      .first()
      .locator(
        'button.kui-calendar-day:not(.kui-calendar-day--muted):not(.kui-calendar-day--selected)',
      )
      .nth(3);
    const inner = day.locator('.kui-calendar-day-inner');

    await day.hover();
    await settleAnimations(page);

    const colours = await inner.evaluate((element) => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d', { willReadFrequently: true });

      if (!context) throw new Error('2D canvas is not available');

      const rgb = (css: string): number[] => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = '#000';
        context.fillStyle = css;
        context.fillRect(0, 0, 1, 1);
        return Array.from(context.getImageData(0, 0, 1, 1).data);
      };
      const behind = (node: Element | null): string => {
        for (let current = node; current; current = current.parentElement) {
          const colour = getComputedStyle(current).backgroundColor;
          if (rgb(colour)[3] === 255) return colour;
        }
        return 'rgb(0, 0, 0)';
      };
      const hover = getComputedStyle(element).backgroundColor;
      const surface = behind(element.parentElement);
      const over = rgb(hover);
      const base = rgb(surface);
      const alpha = over[3] / 255;
      const composite = over
        .slice(0, 3)
        .map((value, index) => Math.round(value * alpha + base[index] * (1 - alpha)));

      return { composite, base: base.slice(0, 3) };
    });

    const lightness = (rgb: number[]): number =>
      rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    const delta = lightness(colours.composite) - lightness(colours.base);

    // Dark mode lightens the surface, light mode darkens it; either way the change must be visible.
    expect(Math.abs(delta), `${theme} hover step`).toBeGreaterThan(6);
    expect(delta > 0, `${theme} hover direction`).toBe(theme === 'dark');
  }
});
