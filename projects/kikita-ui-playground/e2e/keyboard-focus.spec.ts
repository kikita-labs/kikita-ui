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
