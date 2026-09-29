import { expect, test } from './support/fixtures';
import { gotoReady, settleAnimations } from './support/page-ready';

/**
 * Touch-only input on a phone-sized viewport. Pointer clicks and taps take different paths in
 * browsers (pointer type, hover emulation, no focus ring), so overlays are checked with real taps.
 */
test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

test.describe('touch input', () => {
  test('Select opens on tap, ignores a disabled option and commits an enabled one', async ({
    page,
  }) => {
    await gotoReady(page, '/select');
    const panel = page.locator('app-panel[num="02"]');
    const input = panel.getByRole('combobox', { name: 'User' });
    const readout = panel.locator('code', { hasText: /^value:/ });
    const listbox = page.getByRole('listbox');

    await input.tap();
    await expect(listbox).toBeVisible();

    await listbox.getByRole('option', { name: /Carol Okonkwo/ }).tap({ force: true });
    await settleAnimations(page);
    await expect(listbox).toBeVisible();
    await expect(readout).toHaveText('value: null');

    await listbox.getByRole('option', { name: 'Bob Chen' }).tap();
    await expect(listbox).toBeHidden();
    await expect(input).toHaveValue('Bob Chen');
  });

  test('Dialog closes when the backdrop is tapped and focus returns to the trigger', async ({
    page,
  }) => {
    await gotoReady(page, '/dialog');
    const trigger = page.getByRole('button', { name: 'Open md', exact: true });
    const dialog = page.getByRole('dialog');

    await trigger.tap();
    await expect(dialog).toBeVisible();

    await page.touchscreen.tap(4, 4);
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('a locked Dialog ignores a backdrop tap until an action is chosen', async ({ page }) => {
    await gotoReady(page, '/dialog');
    const dialog = page.getByRole('dialog');

    await page.getByRole('button', { name: 'Open locked', exact: true }).tap();
    await expect(dialog).toBeVisible();

    await page.touchscreen.tap(4, 4);
    await settleAnimations(page);
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: 'Later', exact: true }).tap();
    await expect(dialog).toBeHidden();
  });
});
