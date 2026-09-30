import { expect, test } from './support/fixtures';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/components/empty-state');
});

test('captures the minimally configured default empty state @visual', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'Empty State' })).toBeVisible();

  const example = page.getByRole('group', { name: 'Default empty state example', exact: true });
  const emptyState = example.locator('kui-empty-state');

  await expect(emptyState).toHaveAttribute('data-kui-context', 'no-data');
  await expect(emptyState).toHaveAttribute('data-kui-size', 'md');
  await expect(example).toHaveScreenshot('empty-state-default.png');
});

test('captures all documented contexts and their projected decorative icons @visual', async ({
  page,
}) => {
  const catalogue = page.getByRole('group', { name: 'Empty State context variants', exact: true });
  const contexts = [
    ['No data', 'no-data'],
    ['No results', 'no-results'],
    ['Error', 'error'],
    ['No access', 'no-access'],
    ['Success', 'success'],
  ] as const;

  for (const [label, context] of contexts) {
    const example = catalogue.getByRole('group', { name: label, exact: true });
    const emptyState = example.locator('kui-empty-state');

    await expect(emptyState).toHaveAttribute('data-kui-context', context);
    await expect(emptyState).toHaveAttribute('data-kui-size', 'md');
    await expect(example.locator('[kuiEmptyStateIcon]')).toHaveAttribute('aria-hidden', 'true');
  }

  await expect(catalogue).toHaveScreenshot('empty-state-contexts.png');
});

test('captures each size and activates the projected link by keyboard @visual', async ({
  page,
}) => {
  const catalogue = page.getByRole('group', {
    name: 'Empty State size and slot variants',
    exact: true,
  });
  const sizes = [
    ['Small', 'sm'],
    ['Medium', 'md'],
    ['Large', 'lg'],
  ] as const;

  for (const [label, size] of sizes) {
    const example = catalogue.getByRole('group', { name: label, exact: true });
    const emptyState = example.locator('kui-empty-state');
    const viewProjects = example.getByRole('link', { name: 'View projects', exact: true });
    const actions = example.locator('[kuiEmptyStateActions]');

    await expect(emptyState).toHaveAttribute('data-kui-size', size);
    await expect(viewProjects).toBeVisible();
    await expect(viewProjects).toHaveClass(/kui-button/);
    await expect(actions).toHaveClass(/kui-empty__actions/);
    await expect(example.locator('[kuiEmptyStateIcon]')).toHaveAttribute('aria-hidden', 'true');
  }

  await expect(catalogue).toHaveScreenshot('empty-state-sizes-and-slots.png');

  const largeExample = catalogue.getByRole('group', { name: 'Large', exact: true });
  const viewProjects = largeExample.getByRole('link', { name: 'View projects', exact: true });

  await viewProjects.focus();
  await expect(viewProjects).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/components\/empty-state#empty-state-live-filter$/);
  const liveFilterCard = page.locator('#empty-state-live-filter');
  await expect(liveFilterCard).toBeVisible();
  await expect(liveFilterCard).toBeInViewport();
});

test('captures optional text and action-only compositions @visual', async ({ page }) => {
  const catalogue = page.getByRole('group', {
    name: 'Empty State content combinations',
    exact: true,
  });
  const headingOnly = catalogue.getByRole('group', {
    name: 'Heading-only empty state',
    exact: true,
  });
  const descriptionOnly = catalogue.getByRole('group', {
    name: 'Description-only empty state',
    exact: true,
  });
  const actionOnly = catalogue.getByRole('group', {
    name: 'Action-only empty state',
    exact: true,
  });

  await expect(headingOnly).toBeVisible();
  await expect(
    headingOnly.getByRole('heading', { name: 'Heading only', exact: true }),
  ).toBeVisible();
  await expect(descriptionOnly).toBeVisible();
  await expect(
    descriptionOnly.getByRole('heading', { name: 'Description only', exact: true }),
  ).toBeVisible();
  await expect(actionOnly).toBeVisible();
  await expect(
    actionOnly.getByRole('heading', { name: 'Actions only', exact: true }),
  ).toBeVisible();
  await expect(headingOnly.getByText('Search saved', { exact: true })).toBeVisible();
  await expect(
    descriptionOnly.getByText('Choose a project to continue.', { exact: true }),
  ).toBeVisible();
  const actionState = actionOnly.locator('kui-empty-state');
  await expect(actionState.locator('.kui-empty__title')).toHaveCount(0);
  await expect(actionState.locator('.kui-empty__description')).toHaveCount(0);
  await expect(actionState.locator('[kuiEmptyStateIcon]')).toHaveCount(0);
  const actionLinks = actionOnly.getByRole('link');
  await expect(actionLinks).toHaveCount(3);
  const actionRows = await actionLinks.evaluateAll((links) =>
    links.map((link) => Math.round(link.getBoundingClientRect().top)),
  );
  expect(new Set(actionRows).size).toBeGreaterThan(1);
  await expect(actionOnly).toHaveScreenshot('empty-state-action-only.png');
  await expect(catalogue).toHaveScreenshot('empty-state-content-combinations.png');
});

test('announces no-results and restores matches through its action button @visual', async ({
  page,
}) => {
  const example = page.getByRole('group', { name: 'Live project filter example', exact: true });
  const filter = example.getByRole('searchbox', { name: 'Filter sample projects', exact: true });
  const projectList = example.getByRole('list', { name: 'Matching sample projects', exact: true });

  await expect(projectList.getByRole('listitem')).toHaveText(['Atlas', 'Birch', 'Cobalt']);
  await expect(example).toHaveScreenshot('empty-state-live-filter-results.png');

  await filter.fill('no matches');

  const status = example.getByRole('status');
  await expect(status).toBeVisible();
  await expect(status).toHaveAttribute('data-kui-context', 'no-results');
  await expect(status.locator('[kuiEmptyStateIcon]')).toHaveAttribute('aria-hidden', 'true');
  await expect(example).toHaveScreenshot('empty-state-live-filter-no-results.png');

  const clearFilter = status.getByRole('button', { name: 'Clear filter', exact: true });
  await clearFilter.focus();
  await expect(clearFilter).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(filter).toHaveValue('');
  await expect(status).toHaveCount(0);
  await expect(projectList.getByRole('listitem')).toHaveCount(3);
  await expect(example).toHaveScreenshot('empty-state-live-filter-restored.png');
});

test('captures compact 320px sections without document overflow @visual', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });

  for (const category of ['Actions', 'Forms', 'Feedback']) {
    const toggle = page.getByRole('button', { name: category, exact: true });
    if ((await toggle.getAttribute('aria-expanded')) === 'true') await toggle.click();
  }

  const catalogue = page.getByRole('group', { name: 'Empty State context variants', exact: true });
  await expect(catalogue).toBeVisible();

  const contextExamples = [
    ['No data', 'no-data'],
    ['No results', 'no-results'],
    ['Error', 'error'],
    ['No access', 'no-access'],
    ['Success', 'success'],
  ] as const;
  for (const [label, screenshot] of contextExamples) {
    await expect(catalogue.getByRole('group', { name: label, exact: true })).toHaveScreenshot(
      `empty-state-context-${screenshot}-320.png`,
    );
  }

  const sizes = page.getByRole('group', {
    name: 'Empty State size and slot variants',
    exact: true,
  });
  const sizeExamples = [
    ['Small', 'small'],
    ['Medium', 'medium'],
    ['Large', 'large'],
  ] as const;
  for (const [label, screenshot] of sizeExamples) {
    await expect(sizes.getByRole('group', { name: label, exact: true })).toHaveScreenshot(
      `empty-state-size-${screenshot}-320.png`,
    );
  }

  const actionOnly = page
    .getByRole('group', { name: 'Empty State content combinations', exact: true })
    .getByRole('group', { name: 'Action-only empty state', exact: true });
  await expect(actionOnly.getByRole('link')).toHaveCount(3);
  await expect(actionOnly).toHaveScreenshot('empty-state-action-only-320.png');

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    ),
  ).toBe(false);

  const example = page.getByRole('group', { name: 'Live project filter example', exact: true });
  await example
    .getByRole('searchbox', { name: 'Filter sample projects', exact: true })
    .fill('no matches');
  const status = example.getByRole('status');
  await expect(status).toBeVisible();
  await expect(status).toHaveScreenshot('empty-state-live-filter-320.png');

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    ),
  ).toBe(false);
});

test('captures the tablet size layout at 768px without document overflow @visual', async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 900 });

  const sizes = page.getByRole('group', {
    name: 'Empty State size and slot variants',
    exact: true,
  });
  const sizeExamples = ['Small', 'Medium', 'Large'] as const;
  for (const label of sizeExamples) {
    const example = sizes.getByRole('group', { name: label, exact: true });
    await expect(example).toBeVisible();
  }

  const boxes = await sizes.getByRole('group').evaluateAll((examples) =>
    examples.map((example) => {
      const { x, y, width } = example.getBoundingClientRect();

      return { x, y, width };
    }),
  );

  expect(boxes).toHaveLength(3);
  expect(boxes[0]?.x).toBe(boxes[1]?.x);
  expect(boxes[1]?.x).toBe(boxes[2]?.x);
  expect(boxes[1]?.y).toBeGreaterThan(boxes[0]?.y ?? 0);
  expect(boxes[2]?.y).toBeGreaterThan(boxes[1]?.y ?? 0);
  expect(boxes[0]?.width).toBeGreaterThan(300);
  await expect(sizes.getByRole('group', { name: 'Small', exact: true })).toHaveScreenshot(
    'empty-state-size-small-768.png',
  );

  const widths = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport);
});
