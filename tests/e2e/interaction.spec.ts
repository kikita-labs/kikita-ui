import type { Page } from '@playwright/test';

import { expect, test } from './support/fixtures';
import { gotoReady, settleAnimations, waitForRouteContent } from './support/page-ready';

/**
 * Real-browser interaction scenarios for behavior that jsdom cannot prove: focus movement,
 * hit-testing, geometry, touch input and the browser's computed accessibility tree. Value math and
 * signal state stay in unit tests.
 */

async function focusIsInside(page: Page, selector: string): Promise<boolean> {
  return page.evaluate(
    (containerSelector) => document.activeElement?.closest(containerSelector) !== null,
    selector,
  );
}

test.describe('Dialog focus and dismissal', () => {
  test('keeps Tab focus inside the dialog and restores focus to the trigger on Escape', async ({
    page,
  }) => {
    await gotoReady(page, '/dialog');
    const trigger = page.getByRole('button', { name: 'Open md', exact: true });
    const dialog = page.getByRole('dialog');

    await trigger.click();
    await expect(dialog).toBeVisible();
    expect(await focusIsInside(page, '[role="dialog"]')).toBe(true);

    for (let press = 0; press < 8; press++) {
      await page.keyboard.press('Tab');
      expect(await focusIsInside(page, '[role="dialog"]'), `after Tab ${press + 1}`).toBe(true);
    }

    for (let press = 0; press < 8; press++) {
      await page.keyboard.press('Shift+Tab');
      expect(await focusIsInside(page, '[role="dialog"]'), `after Shift+Tab ${press + 1}`).toBe(
        true,
      );
    }

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('closes on a backdrop click and returns focus to the trigger', async ({ page }) => {
    await gotoReady(page, '/dialog');
    const trigger = page.getByRole('button', { name: 'Open md', exact: true });
    const dialog = page.getByRole('dialog');

    await trigger.click();
    await expect(dialog).toBeVisible();

    // The corner of the viewport is always backdrop for a centered modal.
    await page.mouse.click(4, 4);
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('a non-dismissable dialog ignores Escape and backdrop clicks until an action is chosen', async ({
    page,
  }) => {
    await gotoReady(page, '/dialog');
    const trigger = page.getByRole('button', { name: 'Open locked', exact: true });
    const dialog = page.getByRole('dialog');

    await trigger.click();
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await page.mouse.click(4, 4);
    // Let any exit animation run to its end first: an ignored dismissal must still leave it open.
    await settleAnimations(page);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: /close/i })).toHaveCount(0);

    await dialog.getByRole('button', { name: 'Later', exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});

test.describe('Field validation wiring', () => {
  test('exposes the label and error text through the accessibility tree and focuses on label click', async ({
    page,
  }) => {
    await gotoReady(page, '/field');
    const field = page.locator('app-panel[num="01"] kui-field', { hasText: 'Owner email' });
    const input = field.getByRole('textbox');

    await expect(input).toHaveAccessibleName(/Owner email/);
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription('Email is required');
    await expect(field.getByRole('alert')).toHaveText('Email is required');

    await field.locator('label').click();
    await expect(input).toBeFocused();
  });

  // Owner: Plan 19B (shared field wiring). Browser inspection on 2026-09-29 shows `kui-field
  // required` renders only an `aria-hidden` asterisk; the projected input gets neither `required`
  // nor `aria-required`, so assistive technology is not told the field is required. Whether the
  // field should own that attribute is a Plan 19B decision, so this documents the gap instead of
  // asserting an unapproved contract.
  test.fixme('exposes the required state of kui-field to assistive technology', async ({
    page,
  }) => {
    await gotoReady(page, '/field');
    const input = page
      .locator('app-panel[num="01"] kui-field', { hasText: 'Owner email' })
      .getByRole('textbox');

    await expect(input).toHaveAttribute('aria-required', 'true');
  });
});

test.describe('route teardown', () => {
  // Characterization, not an endorsed contract: `docs/dialog.md` does not say what happens to a
  // dialog whose opening route is destroyed. Today it stays open and can still be dismissed. The
  // lifecycle decision belongs to Plan 12; this test only guarantees that neither the route change
  // nor closing the orphaned dialog raises an error.
  test('a dialog opened by a destroyed route stays dismissible and raises no error', async ({
    page,
  }) => {
    await gotoReady(page, '/button');
    await page.getByRole('link', { name: 'Dialog', exact: true }).click();
    await expect(page).toHaveURL(/\/dialog$/);
    await page.getByRole('button', { name: 'Open md', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // A modal blocks the navigation links, so leave through history like a real back navigation.
    await page.goBack();
    await expect(page).toHaveURL(/\/button$/);
    await waitForRouteContent(page);

    const orphan = page.getByRole('dialog');
    await expect(orphan).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(orphan).toBeHidden();
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  });

  test('leaving a route with an open Select list removes the list and raises no error', async ({
    page,
  }) => {
    await gotoReady(page, '/select');
    await page.locator('app-panel[num="02"]').getByRole('combobox', { name: 'User' }).click();
    await expect(page.getByRole('listbox')).toBeVisible();

    await page.getByRole('link', { name: 'Button', exact: true }).click();
    await expect(page).toHaveURL(/\/button$/);
    await waitForRouteContent(page);

    await expect(page.getByRole('listbox')).toHaveCount(0);
  });
});
