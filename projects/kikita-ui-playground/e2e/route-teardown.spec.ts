import { expect, test } from './support/fixtures';

test.describe('route teardown', () => {
  // A dialog outlives the route that opened it (see `docs/ssr-lifecycle-register.md`). This test
  // pins that decision and guarantees neither the route change nor closing the orphaned dialog
  // raises an error or leaves the page scroll-locked.
  test('a dialog opened by a destroyed route stays dismissible and raises no error', async ({
    page,
  }) => {
    await page.goto('/components/button');
    await expect(page.getByRole('heading', { level: 1, name: 'Button' })).toBeVisible();

    // The shell already owns page scrolling, so compare against the value before any dialog opens.
    const bodyOverflow = await page
      .locator('body')
      .evaluate((body) => getComputedStyle(body).overflow);

    await page.getByRole('button', { name: 'Surfaces', exact: true }).click();
    await page.getByRole('link', { name: 'Dialog', exact: true }).click();
    await expect(page).toHaveURL(/\/components\/dialog$/);
    await page
      .getByRole('group', { name: 'Dialog size examples', exact: true })
      .getByRole('button', { name: 'Open default', exact: true })
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // A modal blocks the navigation links, so leave through history like a real back navigation.
    await page.goBack();
    await expect(page).toHaveURL(/\/components\/button$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Button' })).toBeVisible();

    const orphan = page.getByRole('dialog');
    await expect(orphan).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(orphan).toBeHidden();
    await expect(page.locator('body')).toHaveCSS('overflow', bodyOverflow);
  });

  test('leaving a route with an open Select list removes the list and raises no error', async ({
    page,
  }) => {
    await page.goto('/components/select');
    await expect(page.getByRole('heading', { level: 1, name: 'Select' })).toBeVisible();

    await page
      .getByRole('group', { name: 'Default select example', exact: true })
      .getByRole('combobox', { name: 'Role', exact: true })
      .click();
    await expect(page.getByRole('listbox')).toBeVisible();

    await page.getByRole('link', { name: 'Button', exact: true }).click();
    await expect(page).toHaveURL(/\/components\/button$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Button' })).toBeVisible();

    await expect(page.getByRole('listbox')).toHaveCount(0);
  });
});
