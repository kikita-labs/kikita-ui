import { expect, test } from './support/fixtures';
import { settleAnimations } from './support/page-ready';

/**
 * Touch-only input on a phone-sized viewport. Pointer clicks and taps take different paths in
 * browsers (pointer type, hover emulation, no focus ring), so overlays are checked with real taps.
 */
test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

test.describe('Select touch input', () => {
  test('opens on tap, ignores a disabled option and commits an enabled one', async ({ page }) => {
    await page.goto('/components/select');
    await expect(page.getByRole('heading', { level: 1, name: 'Select' })).toBeVisible();

    const input = page
      .getByRole('group', { name: 'Keyboard interaction example', exact: true })
      .getByRole('combobox', { name: 'Keyboard navigation', exact: true });
    const listbox = page.getByRole('listbox');

    await input.tap();
    await expect(listbox).toBeVisible();

    // `force` skips Playwright's stability check, so let the open animation and any scroll
    // adjustment finish first; otherwise the tap can land on the wrong element and close the list.
    await settleAnimations(page);
    await listbox.getByRole('option', { name: 'Manager', exact: true }).tap({ force: true });
    await settleAnimations(page);
    await expect(listbox).toBeVisible();
    await expect(input).toHaveValue('');

    await listbox.getByRole('option', { name: 'Researcher', exact: true }).tap();
    await expect(listbox).toBeHidden();
    await expect(input).toHaveValue('researcher');
  });
});

test.describe('Dialog touch input', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/dialog');
    await expect(page.getByRole('heading', { level: 1, name: 'Dialog' })).toBeVisible();
  });

  test('closes when the backdrop is tapped and focus returns to the trigger', async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === 'webkit',
      'Safari does not focus a button on tap, so there is no focus to return.',
    );
    const trigger = page
      .getByRole('group', { name: 'Dialog size examples', exact: true })
      .getByRole('button', { name: 'Open default', exact: true });
    const dialog = page.getByRole('dialog');

    await trigger.tap();
    await expect(dialog).toBeVisible();

    await page.touchscreen.tap(4, 4);
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('a locked dialog ignores a backdrop tap until an action is chosen', async ({ page }) => {
    const group = page.getByRole('group', {
      name: 'Dialog content and dismissal examples',
      exact: true,
    });
    const dialog = page.getByRole('dialog', { name: 'Required action', exact: true });

    await group.getByRole('button', { name: 'Open non-dismissable', exact: true }).tap();
    await expect(dialog).toBeVisible();

    await page.touchscreen.tap(4, 4);
    await settleAnimations(page);
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: 'Continue', exact: true }).tap();
    await expect(dialog).toBeHidden();
  });
});
