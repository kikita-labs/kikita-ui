import { expect, test } from '../../../tests/e2e/support/fixtures';

const catalogueSections = [
  ['Default group example', 'group-default.png', 'group-default-320.png'],
  ['Group orientations and corners', 'group-layouts.png', 'group-layouts-320.png'],
  ['Group sizes', 'group-sizes.png', 'group-sizes-320.png'],
  ['Grouped controls and interaction', 'group-compositions.png', 'group-compositions-320.png'],
  [
    'Field label, hint, and error combinations',
    'group-field-combinations.png',
    'group-field-combinations-320.png',
  ],
  ['Multiple Field columns', 'group-multiple-fields.png', 'group-multiple-fields-320.png'],
] as const;

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('/components/group');
  await expect(page.getByRole('heading', { level: 1, name: 'Group', exact: true })).toBeVisible();
});

test('server-renders Group controls and hydrates Field column sizing', async ({
  browser,
  page,
}) => {
  const routeUrl = new URL('/components/group', page.url()).toString();
  const serverContext = await browser.newContext({ javaScriptEnabled: false });

  try {
    const serverPage = await serverContext.newPage();
    const response = await serverPage.goto(routeUrl);

    expect(response?.status()).toBe(200);
    await expect(
      serverPage.getByRole('heading', { level: 1, name: 'Group', exact: true }),
    ).toBeVisible();

    const defaultGroup = serverPage.getByRole('group', {
      name: 'Default control group',
      exact: true,
    });
    await expect(defaultGroup).toHaveAttribute('data-kui-orientation', 'horizontal');
    await expect(defaultGroup).toHaveAttribute('data-kui-size', 'md');
    await expect(defaultGroup).not.toHaveAttribute('data-kui-collapsed', /.+/);
    await expect(defaultGroup.getByRole('button')).toHaveCount(2);

    const serverMultipleFields = serverPage.getByRole('group', {
      name: 'Multiple Field columns',
      exact: true,
    });
    const serverTwoFields = serverMultipleFields.getByRole('group', {
      name: 'Two Field columns and an action',
      exact: true,
    });
    const serverInterleaved = serverMultipleFields.getByRole('group', {
      name: 'Interleaved buttons and Field columns',
      exact: true,
    });

    expect(await serverTwoFields.evaluate(normalizeGridColumns)).toBe('');
    expect(await serverInterleaved.evaluate(normalizeGridColumns)).toBe('');
  } finally {
    await serverContext.close();
  }

  const runtimeErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  await page.reload();

  const search = page
    .getByRole('group', {
      name: 'Grouped controls and interaction',
      exact: true,
    })
    .getByRole('group', { name: 'Project search controls', exact: true });
  await expect.poll(() => search.evaluate(normalizeGridColumns)).toBe('minmax(0,1fr)');

  const multipleFields = page.getByRole('group', { name: 'Multiple Field columns', exact: true });
  const twoFields = multipleFields.getByRole('group', {
    name: 'Two Field columns and an action',
    exact: true,
  });
  const interleavedFields = multipleFields.getByRole('group', {
    name: 'Interleaved buttons and Field columns',
    exact: true,
  });

  await expect
    .poll(() => twoFields.evaluate(normalizeGridColumns))
    .toBe('minmax(0,1fr)minmax(0,1fr)');
  await expect
    .poll(() => interleavedFields.evaluate(normalizeGridColumns))
    .toBe('autominmax(0,1fr)minmax(0,1fr)');
  expect(runtimeErrors).toEqual([]);
});

test('renders Group orientation, collapsed-border, and rounded-corner inputs', async ({ page }) => {
  const layouts = page.getByRole('group', {
    name: 'Group orientations and corners',
    exact: true,
  });
  const horizontal = layouts.getByRole('group', {
    name: 'Horizontal group with rounded outer corners',
    exact: true,
  });
  const horizontalSquare = layouts.getByRole('group', {
    name: 'Horizontal group with square outer corners',
    exact: true,
  });
  const vertical = layouts.getByRole('group', {
    name: 'Vertical group with rounded outer corners',
    exact: true,
  });
  const verticalSquare = layouts.getByRole('group', {
    name: 'Vertical group with square outer corners',
    exact: true,
  });

  await expect(horizontal).toHaveAttribute('data-kui-orientation', 'horizontal');
  await expect(horizontal).toHaveAttribute('data-kui-collapsed', '');
  await expect(horizontal).toHaveAttribute('data-kui-rounded', '');
  await expect(horizontalSquare).not.toHaveAttribute('data-kui-rounded', /.+/);
  await expect(vertical).toHaveAttribute('data-kui-orientation', 'vertical');
  await expect(vertical).toHaveAttribute('data-kui-rounded', '');
  await expect(verticalSquare).not.toHaveAttribute('data-kui-rounded', /.+/);
});

test('shows all supported Group sizes with size-inheriting control children', async ({ page }) => {
  const sizes = page.getByRole('group', { name: 'Group sizes', exact: true });

  for (const [name, size] of [
    ['Extra small input group', 'xs'],
    ['Small input group', 'sm'],
    ['Medium input group', 'md'],
    ['Large input group', 'lg'],
  ]) {
    const group = sizes.getByRole('group', { name, exact: true });
    await expect(group).toHaveAttribute('data-kui-size', size);
    await expect(group.getByRole('searchbox', { name: 'Search projects' })).toBeVisible();
    await expect(group.getByRole('button', { name: 'Search', exact: true })).toBeVisible();
  }

  const scopedDefault = sizes.getByRole('group', {
    name: 'Group with a component-scoped size default',
    exact: true,
  });
  await expect(scopedDefault).toHaveAttribute('data-kui-size', 'lg');
  await expect(scopedDefault.getByRole('searchbox', { name: 'Search projects' })).toHaveAttribute(
    'data-kui-size',
    'lg',
  );
});

test('uses the child controls in their native keyboard order and performs a real search action', async ({
  page,
}) => {
  const group = page.getByRole('group', { name: 'Grouped controls and interaction', exact: true });
  const search = group.getByRole('searchbox', { name: 'Project name' });
  const action = group.getByRole('button', { name: 'Search', exact: true });

  await expect(group.getByRole('status')).toHaveCount(0);
  await search.focus();
  await search.press('End');
  await search.pressSequentially(' group demo');
  await search.press('Tab');
  await expect(action).toBeFocused();
  await action.press('Enter');

  await expect(group.getByRole('status')).toHaveText('Showing results for kikita group demo.');
  await expect(search).toHaveAttribute('aria-describedby', /kui-field-\d+-hint/);
});

test('keeps Field validation semantics and invalid borders inside collapsed groups', async ({
  page,
}) => {
  const fields = page.getByRole('group', {
    name: 'Field label, hint, and error combinations',
    exact: true,
  });
  const invalidGroup = fields.getByRole('group', { name: 'Field with an error', exact: true });
  const invalidInput = invalidGroup.getByRole('textbox', { name: 'Promotion code input' });
  const field = invalidGroup.locator('kui-field');

  await expect(fields.getByRole('group')).toHaveCount(8);
  await expect(invalidInput).toHaveAttribute('aria-invalid', 'true');
  await expect(invalidInput).toHaveAttribute('aria-describedby', /kui-field-\d+-error/);
  await expect(invalidGroup.getByRole('alert')).toHaveText('This promotion code has expired.');
  await expect(field).toHaveAttribute('data-kui-invalid', '');
  await expect(invalidGroup.getByRole('button', { name: 'Decrease', exact: true })).toBeVisible();
  await expect(invalidGroup.getByRole('button', { name: 'Apply', exact: true })).toBeVisible();
});

test('gives multiple Fields equal columns around interleaved controls', async ({ page }) => {
  const multipleFields = page.getByRole('group', { name: 'Multiple Field columns', exact: true });
  const twoFields = multipleFields.getByRole('group', {
    name: 'Two Field columns and an action',
    exact: true,
  });
  const interleaved = multipleFields.getByRole('group', {
    name: 'Interleaved buttons and Field columns',
    exact: true,
  });

  await expect
    .poll(() => twoFields.evaluate(normalizeGridColumns))
    .toBe('minmax(0,1fr)minmax(0,1fr)');
  await expect
    .poll(() => interleaved.evaluate(normalizeGridColumns))
    .toBe('autominmax(0,1fr)minmax(0,1fr)');
});

test('updates translated Group and Field labels when the language changes', async ({ page }) => {
  const localeResponse = await page.request.get('/i18n/group/ru.json');
  expect(localeResponse.ok()).toBeTruthy();
  const russian = await localeResponse.json();

  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Switch language to Russian', exact: true })
    .click();

  await expect(
    page.getByRole('heading', { level: 1, name: russian.title, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('group', { name: russian.accessibility.default, exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('searchbox', { name: russian.fields.projectQuery })).toBeVisible();
});

test('keeps the Group catalogue within desktop, tablet, and 320px layouts', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 1200 },
    { width: 768, height: 1024 },
    { width: 320, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true);
  }
});

test('captures each labelled Group catalogue section at desktop and 320px @visual', async ({
  page,
}) => {
  for (const [name, desktopScreenshot] of catalogueSections) {
    await expect(page.getByRole('group', { name, exact: true })).toHaveScreenshot(
      desktopScreenshot,
      {
        animations: 'disabled',
      },
    );
  }

  await page.setViewportSize({ width: 320, height: 2048 });
  for (const [name, , mobileScreenshot] of catalogueSections) {
    await expect(page.getByRole('group', { name, exact: true })).toHaveScreenshot(
      mobileScreenshot,
      {
        animations: 'disabled',
      },
    );
  }
});

function normalizeGridColumns(element: Element): string {
  return (element as HTMLElement).style.gridTemplateColumns
    .replace(/minmax\(0px,/g, 'minmax(0,')
    .replace(/\s/g, '');
}
