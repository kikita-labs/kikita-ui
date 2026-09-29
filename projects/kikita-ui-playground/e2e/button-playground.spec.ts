import { expect, test } from '../../../tests/e2e/support/fixtures';

test('shows the full button variant matrix and native compositions', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/components/button');

  await expect(page.getByRole('heading', { level: 1, name: 'Button' })).toBeVisible();

  const defaultExample = page.getByRole('group', { name: 'Default button example', exact: true });
  await expect(defaultExample).toBeInViewport();
  await expect(defaultExample.getByRole('button', { name: 'Default', exact: true })).toBeEnabled();

  for (const size of ['Extra small', 'Small', 'Medium', 'Large']) {
    const matrix = page.getByRole('group', { name: `${size} button variants`, exact: true });

    await expect(matrix).toBeVisible();
    await expect(matrix.getByRole('button')).toHaveCount(20);
  }

  const composition = page.getByRole('group', { name: 'Button composition examples' });

  await expect(composition.getByRole('button', { name: 'Save with leading icon' })).toBeVisible();
  await expect(
    composition.getByRole('button', { name: 'Continue with trailing icon' }),
  ).toBeVisible();
  await expect(composition.getByRole('link', { name: 'Navigation link' })).toBeVisible();
  await expect(composition.getByRole('button', { name: /long label/ })).toBeVisible();
});

test('shows disabled and loading states and lets loading be toggled back', async ({ page }) => {
  await page.goto('/components/button');

  const states = page.getByRole('group', { name: 'Button states' });

  await expect(states.getByRole('button', { name: 'Disabled', exact: true })).toBeDisabled();
  await expect(states.getByRole('button', { name: /^Loading/ })).toBeDisabled();

  const disabledLink = states.getByRole('link', { name: 'Disabled link' });
  await expect(disabledLink).toHaveAttribute('aria-disabled', 'true');
  await expect(disabledLink).toHaveAttribute('tabindex', '-1');

  const currentUrl = page.url();
  await disabledLink.click({ force: true });
  await expect(page).toHaveURL(currentUrl);

  const interactiveButton = states.getByRole('button', { name: /Save/ });
  const toggle = states.getByRole('button', { name: 'Simulate loading' });

  await toggle.click();
  await expect(interactiveButton).toBeDisabled();
  await expect(interactiveButton).toHaveAttribute('aria-busy', 'true');

  await states.getByRole('button', { name: 'Reset loading' }).click();
  await expect(interactiveButton).toBeEnabled();
  await expect(interactiveButton).not.toHaveAttribute('aria-busy');
});
